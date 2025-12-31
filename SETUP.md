# Setup Instructions

## Quick Setup

Để fix lỗi TypeScript "Cannot find module 'express'", bạn cần cài đặt dependencies:

### Option 1: Sử dụng batch files (Windows)
1. Double-click `api/install.bat` để cài đặt API dependencies
2. Double-click `web/install.bat` để cài đặt Web dependencies

### Option 2: Sử dụng terminal
```bash
# Cài đặt API dependencies
cd api
npm install
cd ..

# Cài đặt Web dependencies
cd web
npm install
cd ..
```

### Option 3: Sử dụng PowerShell script
```powershell
.\install-dependencies.ps1
```

Sau khi cài đặt xong, lỗi TypeScript sẽ tự động biến mất.

