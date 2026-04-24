Write-Host "🚀 Starting Zero-Downtime Deployment..." -ForegroundColor Cyan

$projectPath = "D:\LiveProject\NEXT_JS_WEB_JIVO.IN"

Set-Location $projectPath

# Pull latest code
Write-Host "📥 Pulling latest code..." -ForegroundColor Yellow
git pull

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Build in clean temp folder (safe build)
Write-Host "🏗️ Preparing clean build..." -ForegroundColor Yellow

if (Test-Path ".next") {
    Write-Host "🧹 Removing old build..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .next
}

# Build project
Write-Host "🏗️ Building Next.js project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Keeping old version running." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Copy static files for standalone
Write-Host "📂 Preparing standalone files..." -ForegroundColor Yellow
xcopy .next\static .next\standalone\.next\static /E /I /Y | Out-Null
xcopy public .next\standalone\public /E /I /Y | Out-Null

# Check if app exists in PM2
$pm2Check = pm2 list | Select-String "jivo-web"

if ($pm2Check) {
    Write-Host "🔄 Reloading app (Zero Downtime)..." -ForegroundColor Yellow
    pm2 reload jivo-web
} else {
    Write-Host "🚀 Starting app first time..." -ForegroundColor Yellow
    pm2 start ecosystem.config.js
}

# Save PM2 state
pm2 save

Write-Host "🎉 Zero-Downtime Deployment Completed!" -ForegroundColor Green