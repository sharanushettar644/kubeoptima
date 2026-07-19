#!/bin/bash
set -e

# Dynamically retrieve active AWS Account ID from WSL session caller identity
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "320343233567")
AWS_REGION="ap-south-1"
CLUSTER_NAME="kubeoptima-test"
REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/kubeoptima"

export AWS_DEFAULT_REGION="${AWS_REGION}"

echo "=========================================="
echo "STARTING KUBEOPTIMA DEPLOYMENT TO AWS EKS (WSL)"
echo "=========================================="

echo "Updating Kubeconfig context..."
aws eks update-kubeconfig --name "${CLUSTER_NAME}" --region "${AWS_REGION}"

# 1. Create ECR Repos if not existing
repositories=("api-gateway" "dashboard" "ai-service" "k8s-operator")
for repo in "${repositories[@]}"; do
  repoName="kubeoptima/${repo}"
  echo "Checking ECR repository: ${repoName}..."
  if ! aws ecr describe-repositories --repository-names "${repoName}" --region "${AWS_REGION}" >/dev/null 2>&1; then
    echo "Creating ECR repository: ${repoName}..."
    aws ecr create-repository --repository-name "${repoName}" --region "${AWS_REGION}" >/dev/null
  else
    echo "Repository already exists: ${repoName}"
  fi
done

# 2. Docker Login ECR
echo "Logging in to AWS ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# 3. Build and Push Images
for repo in "${repositories[@]}"; do
  dir="apps/${repo}"
  imageTag="${REGISTRY}/${repo}:latest"
  echo "----------------------------------------"
  echo "Building image for ${repo} in ${dir}..."
  echo "----------------------------------------"
  docker build -t "${imageTag}" "${dir}"
  
  echo "Pushing image ${imageTag} to ECR..."
  docker push "${imageTag}"
done

# 4. Deploy Helm Chart
echo "Deploying Helm chart to EKS..."
helm upgrade --install kubeoptima infrastructure/helm/kubeoptima \
  --namespace kubeoptima-system \
  --create-namespace \
  --set global.image.registry="${REGISTRY}" \
  --set global.image.tag="latest" \
  --set apiGateway.image.name="api-gateway" \
  --set dashboard.image.name="dashboard" \
  --set aiService.image.name="ai-service" \
  --set operator.image.name="k8s-operator"

echo "=========================================="
echo "DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "=========================================="
