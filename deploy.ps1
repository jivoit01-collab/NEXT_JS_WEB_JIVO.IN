Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Jivo Web Deployment Started" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$projectPath = "D:\LiveProject\NEXT_JS_WEB_JIVO.IN"
Set-Location $projectPath

# STEP 1: Stop everything
Write-Host "`n[1] Stopping app..." -ForegroundColor Yellow
pm2 delete jivo-web 2>$null

Write-Host "[2] Killing node processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe /T 2>$null
Start-Sleep -Seconds 2

# STEP 2: Pull + install
Write-Host "`n[3] Pulling latest code..." -ForegroundColor Yellow
git pull

Write-Host "[4] Installing dependencies..." -ForegroundColor Yellow
npm install

# STEP 3: Clean build
Write-Host "`n[5] Cleaning old build..." -ForegroundColor Yellow
if (Test-Path ".next") {
    cmd /c "rmdir /s /q .next"
}

# STEP 4: Build
Write-Host "`n[6] Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build FAILED!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# STEP 5: Start app
Write-Host "`n[7] Starting app..." -ForegroundColor Yellow
pm2 start ecosystem.config.js

Start-Sleep -Seconds 5

# STEP 6: REAL HEALTH CHECK (PM2 STATUS)
Write-Host "`n[8] Checking PM2 status..." -ForegroundColor Yellow

$pm2Status = pm2 list | Select-String "jivo-web"

if ($pm2Status -match "online") {
    Write-Host "✅ App is ONLINE in PM2" -ForegroundColor Green
} else {
    Write-Host "❌ App is NOT running!" -ForegroundColor Red

    Write-Host "`n🔍 Showing PM2 logs (last 30 lines):" -ForegroundColor Yellow
    pm2 logs jivo-web --lines 30

    Write-Host "`n🔍 Checking port usage:" -ForegroundColor Yellow
    netstat -ano | findstr :3001

    exit 1
}

# STEP 7: OPTIONAL PORT CHECK (secondary)
Write-Host "`n[9] Verifying port 3001..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr :3001

if ($portCheck) {
    Write-Host "✅ Port 3001 is active" -ForegroundColor Green
} else {
    Write-Host "⚠️ App online but port not detected (check config)" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host " Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green