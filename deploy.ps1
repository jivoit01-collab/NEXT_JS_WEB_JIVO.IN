$ErrorActionPreference = "Stop"
$appDir = "D:\LiveProject\NEXT_JS_WEB_JIVO.IN"

Set-Location $appDir
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Jivo.in Production Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Pull latest code
Write-Host "[1/5] Pulling latest code..." -ForegroundColor Yellow
git pull origin main
if ($LASTEXITCODE -ne 0) { throw "Git pull failed!" }

# Step 2: Stop service before touching node_modules
Write-Host "[2/5] Stopping JivoWeb service..." -ForegroundColor Yellow
nssm stop JivoWeb
Start-Sleep -Seconds 3

# Step 3: Install dependencies
Write-Host "[3/5] Installing dependencies..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) { throw "npm ci failed!" }

# Step 4: Generate Prisma client + Build Next.js
Write-Host "[4/5] Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) { throw "Prisma generate failed!" }

Write-Host "      Building Next.js production bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed!" }

# Step 5: Start service
Write-Host "[5/5] Starting JivoWeb service..." -ForegroundColor Yellow
nssm start JivoWeb
Start-Sleep -Seconds 5

# Health check
Write-Host ""
Write-Host "Running health check..." -ForegroundColor Yellow
$maxRetries = 5
$success = $false

for ($i = 1; $i -le $maxRetries; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "  Deployment successful!" -ForegroundColor Green
            Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            $success = $true
            break
        }
    } catch {
        Write-Host "  Attempt $i/$maxRetries failed. Retrying in 5s..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
}

if (-not $success) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Health check failed!" -ForegroundColor Red
    Write-Host "  Check logs: type D:\LiveProject\NEXT_JS_WEB_JIVO.IN\logs\stderr.log" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}



# run command
# powershell -ExecutionPolicy Bypass -File D:\LiveProject\NEXT_JS_WEB_JIVO.IN\deploy.ps1
