$ErrorActionPreference = 'Stop'

$AppPath = 'C:\LiveProjects\NEXT_JS_WEB_JIVO.IN'
$ServiceName = 'jivo-web'
$LogDir = 'C:\LiveProjects\temp\deploy-logs'
$HealthCheckUrl = $env:JIVO_HEALTHCHECK_URL

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$LogFile = Join-Path $LogDir ('jivo-deploy-{0}.log' -f (Get-Date -Format 'yyyyMMdd-HHmmss'))

function Write-Section {
  param([string] $Message)
  Write-Host ''
  Write-Host ('==> ' + $Message)
}

function Invoke-Step {
  param(
    [string] $Label,
    [string] $Command,
    [string[]] $Arguments = @()
  )

  Write-Section $Label
  & $Command @Arguments

  if ($LASTEXITCODE -ne 0) {
    throw ($Label + ' failed with exit code ' + $LASTEXITCODE)
  }
}

# Like Invoke-Step, but NON-FATAL: on failure it warns and continues instead of
# throwing. Used for the database steps (schema sync / seed). A transient DB
# problem must NOT abort the whole deploy or trigger a rollback — the build has
# already succeeded, so we still restart the service; the DB syncs on the next
# run once it's reachable again.
function Invoke-StepOptional {
  param(
    [string] $Label,
    [string] $Command,
    [string[]] $Arguments = @()
  )

  Write-Section $Label
  & $Command @Arguments

  if ($LASTEXITCODE -ne 0) {
    Write-Host (
      'WARNING: ' + $Label + ' failed with exit code ' + $LASTEXITCODE +
      ' — continuing (run it manually once the database is reachable).'
    )
    $global:LASTEXITCODE = 0
  }
}

function Test-IsAdministrator {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Restart-JivoService {
  Write-Section ('Restarting service ' + $ServiceName)

  $nssm = Get-Command nssm.exe -ErrorAction SilentlyContinue
  if ($nssm) {
    & $nssm.Source restart $ServiceName
    if ($LASTEXITCODE -ne 0) {
      throw ('nssm restart failed with exit code ' + $LASTEXITCODE)
    }
    return
  }

  Write-Host 'nssm.exe was not found in PATH. Falling back to net stop/start.'
  & net.exe stop $ServiceName
  if ($LASTEXITCODE -ne 0) {
    Write-Host 'Service was not running or could not be stopped. Continuing to start it.'
  }

  & net.exe start $ServiceName
  if ($LASTEXITCODE -ne 0) {
    throw ('net start failed with exit code ' + $LASTEXITCODE)
  }
}

function Test-Health {
  if ([string]::IsNullOrWhiteSpace($HealthCheckUrl)) {
    Write-Host 'No JIVO_HEALTHCHECK_URL was provided. Skipping HTTP health check.'
    return
  }

  Write-Section ('Health check ' + $HealthCheckUrl)
  for ($attempt = 1; $attempt -le 12; $attempt++) {
    try {
      $response = Invoke-WebRequest -Uri $HealthCheckUrl -UseBasicParsing -TimeoutSec 10
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        Write-Host ('Health check passed with status ' + $response.StatusCode)
        return
      }
      Write-Host ('Attempt ' + $attempt + ' returned status ' + $response.StatusCode)
    } catch {
      Write-Host ('Attempt ' + $attempt + ' failed: ' + $_.Exception.Message)
    }

    Start-Sleep -Seconds 5
  }

  throw 'Health check failed after service restart.'
}

function Restore-PreviousCommit {
  param(
    [string] $PreviousCommit,
    [bool] $ServiceWasTouched
  )

  if ([string]::IsNullOrWhiteSpace($PreviousCommit)) {
    Write-Host 'No previous commit was captured. Rollback skipped.'
    return
  }

  Write-Section ('Rolling back to ' + $PreviousCommit)
  & git reset --hard $PreviousCommit
  if ($LASTEXITCODE -ne 0) {
    Write-Host ('Rollback reset failed with exit code ' + $LASTEXITCODE)
    return
  }

  try {
    Invoke-Step 'Restoring dependencies for previous commit' 'npm.cmd' @('install')
    Invoke-Step 'Rebuilding previous commit' 'npm.cmd' @('run', 'build')
  } catch {
    Write-Host ('Rollback rebuild failed: ' + $_.Exception.Message)
    Write-Host 'Existing running service was left untouched if it had not been restarted yet.'
    if (-not $ServiceWasTouched) {
      return
    }
  }

  if ($ServiceWasTouched) {
    try {
      Restart-JivoService
      Test-Health
      Write-Host 'Rollback service restart completed.'
    } catch {
      Write-Host ('Rollback service restart failed: ' + $_.Exception.Message)
    }
  }
}

Start-Transcript -Path $LogFile -Append | Out-Null

$previousCommit = $null
$serviceWasTouched = $false

try {
  Write-Section 'Deploy started'
  Write-Host ('Log file: ' + $LogFile)

  if (-not (Test-IsAdministrator)) {
    throw 'This deploy must run as Administrator because service/NSSM commands require elevated permissions. Use an Administrator SSH user or run this script from an elevated scheduled task.'
  }

  Set-Location -LiteralPath $AppPath

  $dirtyStatusBeforeLockCleanup = @(& git status --porcelain)
  $packageLockDirty = @(
    $dirtyStatusBeforeLockCleanup | Where-Object {
      if ([string]::IsNullOrWhiteSpace($_) -or $_.Length -lt 4) {
        $false
      } else {
        $statusPath = $_.Substring(3).Trim()
        $statusPath -eq 'package-lock.json' -or $statusPath -eq '"package-lock.json"'
      }
    }
  )

  if ($packageLockDirty.Count -gt 0) {
    $otherDirtyStatus = @(
      $dirtyStatusBeforeLockCleanup | Where-Object {
        if ([string]::IsNullOrWhiteSpace($_) -or $_.Length -lt 4) {
          $true
        } else {
          $statusPath = $_.Substring(3).Trim()
          -not ($statusPath -eq 'package-lock.json' -or $statusPath -eq '"package-lock.json"')
        }
      }
    )

    if ($otherDirtyStatus.Count -gt 0) {
      Write-Host ('package-lock.json is dirty, but other local changes also exist: ' + ($otherDirtyStatus -join '; '))
      Write-Host 'Auto-discarding package-lock.json only; dirty-tree guard will still verify remaining changes.'
    }

    & git checkout -- package-lock.json
    if ($LASTEXITCODE -eq 0) {
      Write-Host 'Auto-discarded package-lock.json changes (generated file, safe to reset).'
    } else {
      Write-Host ('Auto-discard package-lock.json failed with exit code ' + $LASTEXITCODE + '. Existing dirty-tree guard will decide whether to stop deploy.')
    }
  }

  $dirtyStatus = (& git status --porcelain)
  if ($dirtyStatus) {
    throw ('Server working tree has uncommitted changes. Refusing deploy to avoid overwriting: ' + ($dirtyStatus -join '; '))
  }

  $currentBranch = (& git branch --show-current).Trim()
  $previousCommit = (& git rev-parse HEAD).Trim()

  Write-Host ('Current branch: ' + $currentBranch)
  Write-Host ('Commit before deploy: ' + $previousCommit)

  Invoke-Step 'Fetch origin/main' 'git' @('fetch', 'origin', 'main')
  $targetCommit = (& git rev-parse origin/main).Trim()
  Write-Host ('Target commit: ' + $targetCommit)

  if ($previousCommit -eq $targetCommit) {
    Write-Host 'Server is already on origin/main. Build and restart will still run to refresh the service.'
  }

  Invoke-Step 'Pull latest code' 'git' @('pull', '--ff-only', 'origin', 'main')
  Write-Host ('Commit after pull: ' + (& git rev-parse --short HEAD).Trim())

  Invoke-Step 'Install dependencies' 'npm.cmd' @('install')
  Invoke-Step 'Build application before restart' 'npm.cmd' @('run', 'build')

  # Sync the live database AFTER the build (schema + Prisma client are ready) and
  # BEFORE the restart, so the new service starts against an up-to-date DB. These
  # read DATABASE_URL from .env.production (see prisma.config.ts / prisma/seed.ts)
  # — on this server the host must be `localhost`. They are NON-FATAL: a DB blip
  # never breaks the deploy or rolls back a good build.
  #   db:push → create/update tables    db:seed → insert missing data (insert-only)
  Invoke-StepOptional 'Sync database schema (db:push)' 'npm.cmd' @('run', 'db:push')
  Invoke-StepOptional 'Seed database (db:seed)' 'npm.cmd' @('run', 'db:seed')

  $serviceWasTouched = $true
  Restart-JivoService
  Test-Health

  Write-Section 'Deployment completed'
} catch {
  Write-Host ''
  Write-Host ('DEPLOY FAILED: ' + $_.Exception.Message)
  Restore-PreviousCommit -PreviousCommit $previousCommit -ServiceWasTouched $serviceWasTouched
  throw
} finally {
  Stop-Transcript | Out-Null
  Write-Host ('Deploy log saved to: ' + $LogFile)
}
