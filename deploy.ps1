Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Jivo Web Deployment Started" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$projectPath = "D:\LiveProject\NEXT_JS_WEB_JIVO.IN"
Set-Location $projectPath

# 1. Stop app
Write-Host "`n[1] Stopping app..." -ForegroundColor Yellow
pm2 delete jivo-web 2>$null

# 2. Pull latest code
Write-Host "`n[2] Pulling latest code..." -ForegroundColor Yellow
git pull

# 3. Install dependencies
Write-Host "`n[3] Installing dependencies..." -ForegroundColor Yellow
npm install

# 4. Clean old build
Write-Host "`n[4] Cleaning old build..." -ForegroundColor Yellow
if (Test-Path ".next") {
    cmd /c "rmdir /s /q .next"
}

# 5. Build
Write-Host "`n[5] Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build FAILED!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# 6. Start app
Write-Host "`n[6] Starting app..." -ForegroundColor Yellow
pm2 start ecosystem.config.js

Start-Sleep -Seconds 5

# 7. Check port 3001
Write-Host "`n[7] Checking app on port 3001..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr :3001

if ($portCheck) {
    Write-Host "✅ App running on port 3001" -ForegroundColor Green
} else {
    Write-Host "❌ App NOT running!" -ForegroundColor Red
    pm2 logs jivo-web --lines 20
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host " Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green