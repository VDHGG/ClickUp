# ClickUp - Build and Push Docker Images to ACR
# Personal script for huyvd@mindx.com.vn

# Configuration
$ACR_NAME = "clickupACR"  
$ACR_LOGIN_SERVER = "${ACR_NAME}.azurecr.io"
$RESOURCE_GROUP = "mindx-intern-01-rg"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ClickUp - Build and Push to ACR" -ForegroundColor Cyan
Write-Host "ACR: $ACR_LOGIN_SERVER" -ForegroundColor Cyan
Write-Host "Resource Group: $RESOURCE_GROUP" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Azure CLI is logged in
try {
    $null = az account show 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
} catch {
    Write-Host "❌ Not logged in to Azure. Please run: az login" -ForegroundColor Red
    exit 1
}

# Login to ACR
Write-Host "🔐 Logging in to ACR..." -ForegroundColor Yellow
az acr login --name $ACR_NAME

# Build and push API
Write-Host ""
Write-Host "📦 Building API image..." -ForegroundColor Yellow
Set-Location api
docker build -t "${ACR_LOGIN_SERVER}/clickup-api:latest" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ API build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ API image built successfully" -ForegroundColor Green

Write-Host "📤 Pushing API image to ACR..." -ForegroundColor Yellow
docker push "${ACR_LOGIN_SERVER}/clickup-api:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ API push failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ API image pushed successfully" -ForegroundColor Green
Set-Location ..

# Build and push Web
Write-Host ""
Write-Host "📦 Building Web image..." -ForegroundColor Yellow
Set-Location web
docker build -t "${ACR_LOGIN_SERVER}/clickup-web:latest" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Web build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Web image built successfully" -ForegroundColor Green

Write-Host "📤 Pushing Web image to ACR..." -ForegroundColor Yellow
docker push "${ACR_LOGIN_SERVER}/clickup-web:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Web push failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Web image pushed successfully" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ All images built and pushed successfully!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verify images:" -ForegroundColor Cyan
Write-Host "  az acr repository list --name $ACR_NAME --output table"
Write-Host "  az acr repository show-tags --name $ACR_NAME --repository clickup-api --output table"
Write-Host "  az acr repository show-tags --name $ACR_NAME --repository clickup-web --output table"

