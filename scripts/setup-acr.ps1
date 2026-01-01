# ClickUp - Setup Azure Container Registry

# Configuration
$ACR_NAME = "clickupacr"  
$RESOURCE_GROUP = "mindx-intern-01-rg"
$LOCATION = "japaneast"
$SKU = "Basic"  

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ClickUp - Azure Container Registry Setup" -ForegroundColor Cyan
Write-Host "Resource Group: $RESOURCE_GROUP" -ForegroundColor Cyan
Write-Host "Location: $LOCATION" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Azure CLI is logged in
try {
    $account = az account show 2>$null | ConvertFrom-Json
    if (-not $account) {
        throw "Not logged in"
    }
    Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
    Write-Host "   Subscription: $($account.name)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Not logged in to Azure. Please run: az login" -ForegroundColor Red
    exit 1
}

# Check if ACR already exists
Write-Host "🔍 Checking if ACR '$ACR_NAME' already exists..." -ForegroundColor Yellow
$existingAcr = az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP 2>$null
if ($existingAcr) {
    Write-Host "✅ ACR '$ACR_NAME' already exists!" -ForegroundColor Green
    $acrInfo = $existingAcr | ConvertFrom-Json
    Write-Host "   Login server: $($acrInfo.loginServer)" -ForegroundColor Gray
    Write-Host "   SKU: $($acrInfo.sku.name)" -ForegroundColor Gray
    Write-Host ""
} else {
    # Create ACR
    Write-Host "📦 Creating Azure Container Registry..." -ForegroundColor Yellow
    Write-Host "   Name: $ACR_NAME" -ForegroundColor Gray
    Write-Host "   Resource Group: $RESOURCE_GROUP" -ForegroundColor Gray
    Write-Host "   Location: $LOCATION" -ForegroundColor Gray
    Write-Host "   SKU: $SKU" -ForegroundColor Gray
    Write-Host ""
    
    az acr create `
        --resource-group $RESOURCE_GROUP `
        --name $ACR_NAME `
        --sku $SKU `
        --location $LOCATION
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ ACR created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create ACR" -ForegroundColor Red
        Write-Host "   Error: ACR name might already be taken. Try a different name." -ForegroundColor Yellow
        exit 1
    }
}

# Enable admin user (for Docker login)
Write-Host ""
Write-Host "🔐 Enabling admin user..." -ForegroundColor Yellow
az acr update --name $ACR_NAME --admin-enabled true

# Get login credentials
Write-Host ""
Write-Host "🔑 ACR Login Information:" -ForegroundColor Cyan
Write-Host "   Login server: ${ACR_NAME}.azurecr.io" -ForegroundColor White
Write-Host ""
Write-Host "   To login:" -ForegroundColor Yellow
Write-Host "   az acr login --name $ACR_NAME" -ForegroundColor White
Write-Host ""

# Display credentials
Write-Host "   Credentials:" -ForegroundColor Yellow
$credentials = az acr credential show --name $ACR_NAME | ConvertFrom-Json
Write-Host "   Username: $($credentials.username)" -ForegroundColor Gray
Write-Host "   Password: $($credentials.passwords[0].value)" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Save these credentials securely!" -ForegroundColor Yellow
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Login to ACR: az acr login --name $ACR_NAME" -ForegroundColor White
Write-Host "2. Build and push images using: .\scripts\build-and-push.ps1" -ForegroundColor White
Write-Host ""

