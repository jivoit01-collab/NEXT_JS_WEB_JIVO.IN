$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Jivo Web Deployment Started" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$projectPath = "D:\LiveProject\NEXT_JS_WEB_JIVO.IN"
Set-Location $projectPath

# STEP 1: Stop app
Write-Host "`n[1] Stopping app..." -ForegroundColor Yellow
pm2 delete jivo-web 2>$null

Write-Host "[2] Killing node processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe /T 2>$null
Start-Sleep -Seconds 2

# STEP 2: Pull latest code and install dependencies
Write-Host "`n[3] Pulling latest code..." -ForegroundColor Yellow
git pull

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: git pull failed." -ForegroundColor Red
    exit 1
}

Write-Host "[4] Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed." -ForegroundColor Red
    exit 1
}

# STEP 3: Generate Prisma client before build
# Important: this fixes Prisma type errors after schema/model changes.
# Do not run db:seed here because live databases may already have real CMS data.
Write-Host "`n[5] Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Prisma generate failed." -ForegroundColor Red
    exit 1
}

Write-Host "Prisma client generated successfully." -ForegroundColor Green

# STEP 4: Clean old build
Write-Host "`n[6] Cleaning old build..." -ForegroundColor Yellow
if (Test-Path ".next") {
    cmd /c "rmdir /s /q .next"
}

# STEP 5: Build
Write-Host "`n[7] Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed." -ForegroundColor Red
    exit 1
}

Write-Host "Build successful." -ForegroundColor Green

# STEP 6: Start app
Write-Host "`n[8] Starting app..." -ForegroundColor Yellow
pm2 start ecosystem.config.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: PM2 start failed." -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 5

# STEP 7: PM2 health check
Write-Host "`n[9] Checking PM2 status..." -ForegroundColor Yellow
$pm2Status = pm2 list | Select-String "jivo-web"

if ($pm2Status -match "online") {
    Write-Host "App is ONLINE in PM2." -ForegroundColor Green
} else {
    Write-Host "ERROR: App is not running." -ForegroundColor Red

    Write-Host "`nShowing PM2 logs (last 30 lines):" -ForegroundColor Yellow
    pm2 logs jivo-web --lines 30

    Write-Host "`nChecking port usage:" -ForegroundColor Yellow
    netstat -ano | findstr :3001

    exit 1
}

# STEP 8: Optional port check
Write-Host "`n[10] Verifying port 3001..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr :3001

if ($portCheck) {
    Write-Host "Port 3001 is active." -ForegroundColor Green
} else {
    Write-Host "Warning: app is online but port 3001 was not detected. Check config." -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host " Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
