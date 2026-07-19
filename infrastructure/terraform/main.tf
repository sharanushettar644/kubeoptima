# Root Terraform Configuration for KubeOptima Testing
# Deploys a minimal 1-node t3.medium EKS cluster to minimize cost

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type        = string
  default     = "ap-south-1" # Defaulting to Asia Pacific (Mumbai) as per your config
  description = "AWS Region to deploy resources"
}

variable "cluster_name" {
  type        = string
  default     = "kubeoptima-test"
  description = "Name of the EKS cluster"
}

module "kubeoptima_eks" {
  source = "./modules/aws"

  cluster_name        = var.cluster_name
  region              = var.aws_region
  kubernetes_version  = "1.36"
  
  # Minimal instance size for testing (t3.small is Free Tier eligible in ap-south-1)
  node_instance_types = ["t3.small"]
  spot_instance_types = ["t3.small"]

  # Scaling configurations for testing
  min_nodes      = 1
  max_nodes      = 2  # Allows upgrading or adding a node if required
  max_spot_nodes = 1  # Standard spot scaling limit for testing spot transitions

  tags = {
    Environment = "testing"
    Platform    = "KubeOptima"
    ManagedBy   = "Terraform"
  }
}

output "cluster_name" {
  value = module.kubeoptima_eks.cluster_name
}

output "cluster_endpoint" {
  value = module.kubeoptima_eks.cluster_endpoint
}

output "kubeconfig_command" {
  value = module.kubeoptima_eks.kubeconfig_command
}
