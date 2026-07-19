# KubeOptima Local Development Script
# Starts Dashboard, API Gateway, and AI Service concurrently.

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 STARTING KUBEOPTIMA LOCALLY" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Start AI Service (Python FastAPI)
Write-Host "Starting Python AI Service on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/ai-service; pip install -r requirements.txt; uvicorn main:app --reload --port 8000"

# 2. Start Go API Gateway
Write-Host "Starting Go API Gateway on port 9090..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/api-gateway; go run cmd/server/main.go"

# 3. Start Next.js Dashboard
Write-Host "Starting Next.js Dashboard on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/dashboard; npm install; npm run dev"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Local services launched in separate windows!" -ForegroundColor Green
Write-Host "Dashboard: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API Gateway: http://localhost:9090" -ForegroundColor Cyan
Write-Host "AI Service: http://localhost:8000" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
