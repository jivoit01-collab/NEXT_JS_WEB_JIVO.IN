$ErrorActionPreference = "Stop"
$appDir  = "D:\LiveProject\NEXT_JS_WEB_JIVO.IN"
$nextDir = "$appDir\.next"
$prevDir = "$appDir\.next_prev"
$logDir  = "$appDir\logs"
$logFile = "$logDir\deploy_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

# Start-Transcript mirrors every Write-Host line to $logFile AND to stdout,
# so GitHub Actions sees the same output that lands in the log file.
Start-Transcript -Path $logFile -Append

$deploySuccess = $false
$previousCommit = $null

function Write-Step { param($msg) Write-Host ""; Write-Host $msg }

try {
    Set-Location $appDir

    Write-Host "========================================"
    Write-Host "  Jivo.in Production Deployment"
    Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Host "========================================"

    # ── Capture rollback point ─────────────────────────────────────────────
    $previousCommit = (git rev-parse HEAD 2>&1).Trim()
    if ($LASTEXITCODE -ne 0) { throw "Could not read current commit hash" }
    Write-Host "Rollback point : $previousCommit"

    # ── Backup current build for instant rollback (rename, not copy) ───────
    # Rename avoids disk I/O — same-drive rename is near-instant on NTFS.
    if (Test-Path $prevDir) { Remove-Item $prevDir -Recurse -Force }
    if (Test-Path $nextDir) {
        Rename-Item $nextDir $prevDir
        Write-Host "Build backup   : .next -> .next_prev"
    }

    # ── [1/5] Pull latest code ─────────────────────────────────────────────
    Write-Step "[1/5] Pulling latest code..."
    git pull origin main
    if ($LASTEXITCODE -ne 0) { throw "git pull failed" }

    # ── [2/5] Install dependencies ─────────────────────────────────────────
    Write-Step "[2/5] Installing dependencies (including dev for build)..."
    # --include=dev keeps Tailwind/PostCSS devDeps even when NODE_ENV=production
    # is set at the system level, which would otherwise strip them.
    npm ci --include=dev
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }

    # ── [3/5] Prisma generate ──────────────────────────────────────────────
    Write-Step "[3/5] Generating Prisma client..."
    npx prisma generate
    if ($LASTEXITCODE -ne 0) { throw "Prisma generate failed" }

    # ── [4/5] Next.js build ────────────────────────────────────────────────
    Write-Step "[4/5] Building Next.js production bundle..."
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Next.js build failed" }

    # ── [5/5] PM2 zero-downtime reload ────────────────────────────────────
    Write-Step "[5/5] Reloading app with PM2 (zero downtime)..."
    pm2 reload jivo-web
    if ($LASTEXITCODE -ne 0) { throw "PM2 reload failed" }
    Start-Sleep -Seconds 5

    # ── Health check ───────────────────────────────────────────────────────
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
            Write-Host "  Attempt $i/$maxRetries failed — retrying in 5 s..."
            Start-Sleep -Seconds 5
        }
    }

    if (-not $healthOk) { throw "Health check failed after $maxRetries attempts" }

    # ── Success — remove stale build backup ────────────────────────────────
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

        # Restore previous build so PM2 can serve immediately without a rebuild
        if (Test-Path $prevDir) {
            if (Test-Path $nextDir) { Remove-Item $nextDir -Recurse -Force }
            Rename-Item $prevDir $nextDir
            Write-Host "Build restored : .next_prev -> .next"
        }

        pm2 reload jivo-web
        Write-Host "Rollback complete."
    }

} finally {
    # Always dump recent PM2 logs so failures are diagnosable in GitHub Actions
    Write-Host ""
    Write-Host "--- PM2 logs: last 50 lines ---"
    pm2 logs jivo-web --lines 50 --nostream 2>&1
    Write-Host "-------------------------------"

    Stop-Transcript
}

if (-not $deploySuccess) { exit 1 }
