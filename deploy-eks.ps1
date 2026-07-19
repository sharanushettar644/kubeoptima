# KubeOptima EKS Deployment Automation Script
# Sets up AWS credentials, ECR repos, builds Docker images, pushes them to ECR, and deploys Helm to EKS.

# Try to get active AWS Account ID from active AWS context
$callerId = aws sts get-caller-identity --query Account --output text 2>$null
if ($null -ne $callerId -and $callerId -ne "") {
    $AWS_ACCOUNT_ID = $callerId.Trim()
    Write-Host "Detected active AWS Account: $AWS_ACCOUNT_ID" -ForegroundColor Green
} else {
    $AWS_ACCOUNT_ID = "320343233567"
    Write-Host "Warning: Could not detect caller identity. Using default: $AWS_ACCOUNT_ID" -ForegroundColor Yellow
}

$AWS_REGION = "ap-south-1"
$CLUSTER_NAME = "kubeoptima-test"
$REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/kubeoptima"

# AWS credentials are automatically resolved from your local AWS CLI configurations.
$env:AWS_DEFAULT_REGION = $AWS_REGION

# Add common Docker Desktop locations to PATH in case PATH hasn't refreshed
$DockerPath = "C:\Program Files\Docker\Docker\resources\bin"
if (Test-Path $DockerPath) {
    $env:PATH = "$DockerPath;$env:PATH"
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "STARTING KUBEOPTIMA DEPLOYMENT TO AWS EKS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Pre-requisite checks
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Error "ERROR: Docker is not installed or not running on your machine."
    Write-Host "To containerize and push images to AWS ECR, please install and launch Docker Desktop:" -ForegroundColor Yellow
    Write-Host "https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# 2. Check and set up Helm
if (-not (Get-Command helm -ErrorAction SilentlyContinue)) {
    $HELM_EXE = "$PSScriptRoot\helm.exe"
    if (-not (Test-Path $HELM_EXE)) {
        Write-Host "Helm not found. Downloading Helm v3.15.2 for Windows..." -ForegroundColor Yellow
        $url = "https://get.helm.sh/helm-v3.15.2-windows-amd64.zip"
        $zipFile = "$env:TEMP\helm.zip"
        $extractDir = "$env:TEMP\helm_extract"
        
        # Download
        Invoke-WebRequest -Uri $url -OutFile $zipFile
        
        # Extract
        Expand-Archive -Path $zipFile -DestinationPath $extractDir -Force
        
        # Copy helm.exe
        Copy-Item -Path "$extractDir\windows-amd64\helm.exe" -Destination $HELM_EXE -Force
        
        # Clean up
        Remove-Item -Path $zipFile -Force
        Remove-Item -Path $extractDir -Recurse -Force
        Write-Host "Helm downloaded and set up locally at $HELM_EXE" -ForegroundColor Green
    }
    $HELM_CMD = $HELM_EXE
} else {
    $HELM_CMD = "helm"
}

# 3. Update kubeconfig
Write-Host "Updating Kubeconfig context..." -ForegroundColor Green
aws eks update-kubeconfig --name $CLUSTER_NAME --region $AWS_REGION

# 4. Check if ECR repositories exist, create them if not
$repositories = @("api-gateway", "dashboard", "ai-service", "k8s-operator")
foreach ($repo in $repositories) {
    $repoName = "kubeoptima/$repo"
    Write-Host "Checking ECR repository: $repoName..." -ForegroundColor Green
    $exists = aws ecr describe-repositories --repository-names $repoName 2>&1
    if ($exists -match "RepositoryNotFoundException") {
        Write-Host "Creating ECR repository: $repoName..." -ForegroundColor Yellow
        aws ecr create-repository --repository-name $repoName --region $AWS_REGION > $null
    } else {
        Write-Host "Repository already exists: $repoName" -ForegroundColor Green
    }
}

# 5. Docker ECR Login
Write-Host "Logging in to AWS ECR..." -ForegroundColor Green
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# 6. Build and Push Images
Write-Host "Building and Pushing Docker images..." -ForegroundColor Green

$services = @{
    "api-gateway" = "apps/api-gateway"
    "dashboard" = "apps/dashboard"
    "ai-service" = "apps/ai-service"
    "k8s-operator" = "apps/k8s-operator"
}

foreach ($service in $services.Keys) {
    $dir = $services[$service]
    $imageTag = $REGISTRY + "/" + $service + ":latest"
    Write-Host "Building image for $service in $dir..." -ForegroundColor Yellow
    docker build -t $imageTag $dir
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed for service: $service"
        exit 1
    }
    Write-Host "Pushing image $imageTag to ECR..." -ForegroundColor Yellow
    docker push $imageTag
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Push failed for service: $service"
        exit 1
    }
}

# 7. Deploy Helm Chart
Write-Host "Deploying Helm chart to EKS..." -ForegroundColor Green
& $HELM_CMD upgrade --install kubeoptima infrastructure/helm/kubeoptima `
  -f infrastructure/helm/kubeoptima/values-test.yaml `
  --namespace kubeoptima-system `
  --create-namespace `
  --set global.image.registry=$REGISTRY `
  --set global.image.tag="latest" `
  --set apiGateway.image.name="api-gateway" `
  --set dashboard.image.name="dashboard" `
  --set aiService.image.name="ai-service" `
  --set operator.image.name="k8s-operator"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
