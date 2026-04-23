$ErrorActionPreference = "Stop"
$appDir  = "D:\LiveProject\NEXT_JS_WEB_JIVO.IN"
$nextDir = "$appDir\.next"
$prevDir = "$appDir\.next_prev"
$logDir  = "$appDir\logs"
$logFile = "$logDir\deploy_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

Start-Transcript -Path $logFile -Append

$deploySuccess = $false
$previousCommit = $null
$appWasStopped  = $false

function Write-Step { param($msg) Write-Host ""; Write-Host $msg }

try {
    Set-Location $appDir

    Write-Host "========================================"
    Write-Host "  Jivo.in Production Deployment"
    Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Host "========================================"

    # -- Capture rollback point --------------------------------------------
    $previousCommit = (git rev-parse HEAD 2>&1).Trim()
    if ($LASTEXITCODE -ne 0) { throw "Could not read current commit hash" }
    Write-Host "Rollback point : $previousCommit"

    # -- [1/6] Stop PM2 to release file locks on .next --------------------
    Write-Step "[1/6] Stopping PM2 to release file locks..."
    pm2 stop ecosystem.config.js
    $appWasStopped = $true
    Write-Host "PM2 stopped."

    # -- Backup current build for rollback (rename is near-instant on NTFS)
    if (Test-Path $prevDir) { Remove-Item $prevDir -Recurse -Force }
    if (Test-Path $nextDir) {
        Rename-Item $nextDir $prevDir
        Write-Host "Build backup   : .next -> .next_prev"
    }

    # -- [2/6] Pull latest code --------------------------------------------
    Write-Step "[2/6] Pulling latest code..."
    git pull origin main
    if ($LASTEXITCODE -ne 0) { throw "git pull failed" }

    # -- [3/6] Install dependencies ----------------------------------------
    Write-Step "[3/6] Installing dependencies (including dev for build)..."
    npm ci --include=dev
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }

    # -- [4/6] Prisma generate ---------------------------------------------
    Write-Step "[4/6] Generating Prisma client..."
    npx prisma generate
    if ($LASTEXITCODE -ne 0) { throw "Prisma generate failed" }

    # -- [5/6] Next.js build -----------------------------------------------
    Write-Step "[5/6] Building Next.js production bundle..."
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Next.js build failed" }

    # -- Copy static assets to standalone directory ------------------------
    # Required for output:'standalone' - Next.js does NOT auto-copy these.
    Write-Host "Copying static assets to standalone directory..."
    Copy-Item -Path "$nextDir\static" -Destination "$nextDir\standalone\.next\static" -Recurse -Force
    Copy-Item -Path "$appDir\public"  -Destination "$nextDir\standalone\public"       -Recurse -Force
    Write-Host "Static assets copied."

    # -- [6/6] Start PM2 with new build ------------------------------------
    Write-Step "[6/6] Starting app with PM2..."
    pm2 startOrReload ecosystem.config.js --update-env
    if ($LASTEXITCODE -ne 0) { throw "PM2 start failed" }
    $appWasStopped = $false
    Start-Sleep -Seconds 5

    # -- Health check -------------------------------------------------------
    Write-Step "Running health check on http://localhost:3001 ..."
    $maxRetries = 5
    $healthOk   = $false
    $response   = $null

    for ($i = 1; $i -le $maxRetries; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                $healthOk = $true
                break
            }
        } catch {
            Write-Host "  Attempt $i/$maxRetries failed - retrying in 5 s..."
            Start-Sleep -Seconds 5
        }
    }

    if (-not $healthOk) { throw "Health check failed after $maxRetries attempts" }

    # -- Remove stale backup -----------------------------------------------
    if (Test-Path $prevDir) { Remove-Item $prevDir -Recurse -Force }

    $deploySuccess = $true
    Write-Host ""
    Write-Host "========================================"
    Write-Host "  Deployment successful!"
    Write-Host "  HTTP $($response.StatusCode) - localhost:3001"
    Write-Host "========================================"

} catch {
    Write-Host ""
    Write-Host "========================================"
    Write-Host "  DEPLOYMENT FAILED"
    Write-Host "  Error: $_"
    Write-Host "========================================"

    if ($null -ne $previousCommit) {
        Write-Host ""
        Write-Host "--- Rollback: resetting to $previousCommit ---"
        git reset --hard $previousCommit

        # Restore previous build so PM2 can serve immediately
        if (Test-Path $prevDir) {
            if (Test-Path $nextDir) { Remove-Item $nextDir -Recurse -Force }
            Rename-Item $prevDir $nextDir
            Write-Host "Build restored : .next_prev -> .next"
        }
    }

    # Always try to bring PM2 back up if we stopped it
    if ($appWasStopped) {
        Write-Host "Restarting PM2 with previous build..."
        pm2 startOrReload ecosystem.config.js --update-env
        Write-Host "Rollback complete."
    }

} finally {
    Write-Host ""
    Write-Host "--- PM2 logs: last 50 lines ---"
    pm2 logs jivo-web --lines 50 --nostream 2>&1
    Write-Host "-------------------------------"

    Stop-Transcript
}

if (-not $deploySuccess) { exit 1 }
