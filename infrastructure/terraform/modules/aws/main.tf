# Terraform — AWS EKS Module for KubeOptima
# Creates: VPC, EKS cluster, node groups (on-demand + spot), IAM roles

terraform {
  required_version = ">= 1.8"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13"
    }
  }
}

# ─────────────────────────────────────────────
# Variables
# ─────────────────────────────────────────────
variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "kubeoptima-prod"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.30"
}

variable "node_instance_types" {
  description = "EC2 instance types for on-demand nodes"
  type        = list(string)
  default     = ["m5.2xlarge", "m5.4xlarge"]
}

variable "spot_instance_types" {
  description = "EC2 instance types for spot nodes"
  type        = list(string)
  default     = ["c5.2xlarge", "c5.4xlarge", "m5.2xlarge", "c5a.2xlarge"]
}

variable "min_nodes" {
  description = "Minimum nodes in on-demand group"
  type        = number
  default     = 3
}

variable "max_nodes" {
  description = "Maximum nodes in on-demand group"
  type        = number
  default     = 100
}

variable "max_spot_nodes" {
  description = "Maximum nodes in spot group"
  type        = number
  default     = 200
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default = {
    Platform    = "KubeOptima"
    ManagedBy   = "Terraform"
    Environment = "production"
  }
}

# ─────────────────────────────────────────────
# Data sources
# ─────────────────────────────────────────────
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# ─────────────────────────────────────────────
# VPC
# ─────────────────────────────────────────────
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.cluster_name}-vpc"
  cidr = "10.0.0.0/16"

  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway     = true
  single_nat_gateway     = true
  one_nat_gateway_per_az = false

  enable_dns_hostnames = true
  enable_dns_support   = true

  public_subnet_tags = {
    "kubernetes.io/role/elb"                      = 1
    "kubernetes.io/cluster/${var.cluster_name}"   = "shared"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb"             = 1
    "kubernetes.io/cluster/${var.cluster_name}"   = "shared"
    "karpenter.sh/discovery"                      = var.cluster_name
  }

  tags = var.tags
}

# ─────────────────────────────────────────────
# EKS Cluster
# ─────────────────────────────────────────────
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = var.kubernetes_version

  cluster_endpoint_public_access = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  bootstrap_self_managed_addons = false

  cluster_addons = {
    kube-proxy         = { most_recent = true }
    vpc-cni            = { most_recent = true }
    eks-pod-identity-agent = { most_recent = true }
  }

  # Enable in-place pod resizing (K8s 1.33+)
  cluster_enabled_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  tags = merge(var.tags, {
    "karpenter.sh/discovery" = var.cluster_name
  })
}

# ─────────────────────────────────────────────
# On-Demand Node Group (system / operators)
# ─────────────────────────────────────────────
resource "aws_eks_node_group" "system" {
  cluster_name    = module.eks.cluster_name
  node_group_name = "system"
  node_role_arn   = aws_iam_role.node.arn
  subnet_ids      = module.vpc.private_subnets

  instance_types = var.node_instance_types

  scaling_config {
    desired_size = var.min_nodes
    min_size     = var.min_nodes
    max_size     = var.max_nodes
  }

  update_config {
    max_unavailable_percentage = 25
  }

  labels = {
    "node.kubernetes.io/type"  = "on-demand"
    "kubeoptima.ai/managed"    = "true"
  }

  # Taint removed for minimal single-node testing cluster so that normal workloads can run alongside system add-ons.

  tags = var.tags

  depends_on = [aws_iam_role_policy_attachment.node_policies]
}

# ─────────────────────────────────────────────
# Spot Node Group (workloads)
# ─────────────────────────────────────────────
resource "aws_eks_node_group" "spot" {
  cluster_name    = module.eks.cluster_name
  node_group_name = "spot"
  node_role_arn   = aws_iam_role.node.arn
  subnet_ids      = module.vpc.private_subnets

  capacity_type  = "SPOT"
  instance_types = var.spot_instance_types

  scaling_config {
    desired_size = 0
    min_size     = 0
    max_size     = var.max_spot_nodes
  }

  labels = {
    "node.kubernetes.io/type"          = "spot"
    "kubeoptima.ai/spot"               = "true"
    "kubeoptima.ai/managed"            = "true"
  }

  tags = var.tags

  depends_on = [aws_iam_role_policy_attachment.node_policies]
}

# ─────────────────────────────────────────────
# IAM Roles
# ─────────────────────────────────────────────
resource "aws_iam_role" "node" {
  name = "${var.cluster_name}-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "node_policies" {
  for_each = toset([
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
  ])

  policy_arn = each.value
  role       = aws_iam_role.node.name
}

# ─────────────────────────────────────────────
# KubeOptima Operator IAM (for AWS API calls)
# ─────────────────────────────────────────────
resource "aws_iam_policy" "kubeoptima_operator" {
  name        = "${var.cluster_name}-kubeoptima-operator"
  description = "Allows KubeOptima Operator to manage EC2, Spot, ASG, and pricing"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:DescribeSpotPriceHistory",
          "ec2:DescribeSpotInstanceRequests",
          "ec2:RequestSpotInstances",
          "ec2:TerminateInstances",
          "autoscaling:*",
          "pricing:GetProducts",
          "cloudwatch:GetMetricStatistics",
          "cloudwatch:ListMetrics",
        ]
        Resource = "*"
      }
    ]
  })

  tags = var.tags
}

# ─────────────────────────────────────────────
# Outputs
# ─────────────────────────────────────────────
output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "kubeconfig_command" {
  value = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.region}"
}

output "vpc_id" {
  value = module.vpc.vpc_id
}
