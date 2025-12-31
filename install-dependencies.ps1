# Install dependencies for ClickUp project
Write-Host "Installing dependencies for ClickUp project..." -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Install API dependencies
Write-Host "Installing API dependencies..." -ForegroundColor Yellow
Set-Location (Join-Path $scriptDir "api")
if (Test-Path "package.json") {
    npm install
    Write-Host "✓ API dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ package.json not found in api folder" -ForegroundColor Red
}

Write-Host ""

# Install Web dependencies
Write-Host "Installing Web dependencies..." -ForegroundColor Yellow
Set-Location (Join-Path $scriptDir "web")
if (Test-Path "package.json") {
    npm install
    Write-Host "✓ Web dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ package.json not found in web folder" -ForegroundColor Red
}

Set-Location $scriptDir
Write-Host ""
Write-Host "All dependencies installed!" -ForegroundColor Green

