#!/bin/bash

# ClickUp - Build and Push Docker Images to ACR
# Personal script for huyvd@mindx.com.vn

set -e  # Exit on error

# Configuration
ACR_NAME="clickupACR"  # Replace with your actual ACR name
ACR_LOGIN_SERVER="${ACR_NAME}.azurecr.io"
RESOURCE_GROUP="mindx-intern-01-rg"

echo "=========================================="
echo "ClickUp - Build and Push to ACR"
echo "ACR: ${ACR_LOGIN_SERVER}"
echo "Resource Group: ${RESOURCE_GROUP}"
echo "=========================================="
echo ""

# Check if Azure CLI is logged in
if ! az account show &>/dev/null; then
    echo "❌ Not logged in to Azure. Please run: az login"
    exit 1
fi

# Login to ACR
echo "🔐 Logging in to ACR..."
az acr login --name ${ACR_NAME}

# Build and push API
echo ""
echo "📦 Building API image..."
cd api
docker build -t ${ACR_LOGIN_SERVER}/clickup-api:latest .
echo "✅ API image built successfully"

echo "📤 Pushing API image to ACR..."
docker push ${ACR_LOGIN_SERVER}/clickup-api:latest
echo "✅ API image pushed successfully"
cd ..

# Build and push Web
echo ""
echo "📦 Building Web image..."
cd web
docker build -t ${ACR_LOGIN_SERVER}/clickup-web:latest .
echo "✅ Web image built successfully"

echo "📤 Pushing Web image to ACR..."
docker push ${ACR_LOGIN_SERVER}/clickup-web:latest
echo "✅ Web image pushed successfully"
cd ..

echo ""
echo "=========================================="
echo "✅ All images built and pushed successfully!"
echo "=========================================="
echo ""
echo "Verify images:"
echo "  az acr repository list --name ${ACR_NAME} --output table"
echo "  az acr repository show-tags --name ${ACR_NAME} --repository clickup-api --output table"
echo "  az acr repository show-tags --name ${ACR_NAME} --repository clickup-web --output table"

