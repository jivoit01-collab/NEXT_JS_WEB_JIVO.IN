Write-Host "🚀 Starting Deployment..." -ForegroundColor Cyan

# Stop app
Write-Host "🛑 Stopping PM2 app..." -ForegroundColor Yellow
pm2 stop jivo-web

# Pull latest code
Write-Host "📥 Pulling latest code from Git..." -ForegroundColor Yellow
git pull

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Remove old build
if (Test-Path ".next") {
    Write-Host "🧹 Removing old .next build..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .next
} else {
    Write-Host "ℹ️ No old build found" -ForegroundColor DarkGray
}

# Build project
Write-Host "🏗️ Building Next.js project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Stopping deployment." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Copy static files
Write-Host "📂 Copying static files..." -ForegroundColor Yellow
xcopy .next\static .next\standalone\.next\static /E /I /Y | Out-Null

# Copy public folder
Write-Host "📂 Copying public assets..." -ForegroundColor Yellow
xcopy public .next\standalone\public /E /I /Y | Out-Null

# Start app
Write-Host "🚀 Starting PM2 app..." -ForegroundColor Yellow
pm2 start ecosystem.config.js

# Save PM2 state
Write-Host "💾 Saving PM2 process list..." -ForegroundColor Yellow
pm2 save

Write-Host "🎉 Deployment Completed Successfully!" -ForegroundColor Green

# 