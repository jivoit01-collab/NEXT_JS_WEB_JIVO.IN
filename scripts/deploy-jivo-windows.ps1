<#
.SYNOPSIS
  Reusable zero-downtime-ish deployment script for the Jivo Next.js website on
  Windows Server. Drives BOTH the Production and the Testing environment.

.DESCRIPTION
  Every environment-specific value is a parameter, so a single copy of this
  script serves all environments:

    Production : -Environment Production
    Testing    : -Environment Testing

  The two environments are fully isolated: different app folders, different git
  branches, different Windows services, different log/backup folders and
  different health-check URLs. Nothing in this script ever touches a path or a
  service that was not passed in for the current run.

  Deployment steps (unchanged from the original single-environment script):
    administrator validation -> dirty working tree validation (with
    package-lock.json cleanup) -> fetch -> ff-only pull -> npm install ->
    production build -> non-fatal db:push / db:seed -> NSSM restart ->
    HTTP health check. On any failure the previous commit is restored, rebuilt
    and the service restarted (rollback). Everything is transcript-logged.

.EXAMPLE
  powershell -File deploy-jivo-windows.ps1 -Environment Production

.EXAMPLE
  powershell -File deploy-jivo-windows.ps1 `
    -AppPath 'C:\LiveProjects\JIVO_WEBSITE\NEXT_JS_WEB_JIVO.IN_TEST' `
    -Branch testing `
    -ServiceName jivo-web-test `
    -LogDirectory 'C:\LiveProjects\JIVO_WEBSITE\Logs\Testing' `
    -HealthCheckUrl 'http://127.0.0.1:3002/api/health'
#>

[CmdletBinding()]
param(
  # Selects a set of built-in defaults. Any individual parameter passed
  # explicitly overrides the corresponding default.
  [ValidateSet('Production', 'Testing', 'Custom')]
  [string] $Environment = 'Production',

  # Deployment folder (git working copy) for this environment.
  [string] $AppPath,

  # Git branch this environment deploys from.
  [string] $Branch,

  # NSSM / Windows service name for this environment.
  [string] $ServiceName,

  # Folder that receives the deployment transcript logs.
  [string] $LogDirectory,

  # URL polled after the restart. Empty string skips the HTTP health check.
  [string] $HealthCheckUrl,

  # Folder that receives the pre-deploy commit marker (rollback breadcrumb).
  [string] $BackupDirectory,

  # How many deployment logs to keep per environment. 0 disables pruning.
  [int] $LogRetentionCount = 30
)

$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Environment resolution
# ---------------------------------------------------------------------------
# The root that holds every environment. Both environments live side by side
# under it, which is what keeps their folders, logs and backups isolated.
$DeployRoot = 'C:\LiveProjects\JIVO_WEBSITE'

$EnvironmentDefaults = @{
  Production = @{
    AppPath         = Join-Path $DeployRoot 'NEXT_JS_WEB_JIVO.IN_LIVE'
    Branch          = 'main'
    ServiceName     = 'jivo-web-live'
    LogDirectory    = Join-Path $DeployRoot 'Logs\Production'
    BackupDirectory = Join-Path $DeployRoot 'Backups\Production'
    HealthCheckUrl  = 'http://127.0.0.1:3001/api/health'
  }
  Testing    = @{
    AppPath         = Join-Path $DeployRoot 'NEXT_JS_WEB_JIVO.IN_TEST'
    Branch          = 'testing'
    ServiceName     = 'jivo-web-test'
    LogDirectory    = Join-Path $DeployRoot 'Logs\Testing'
    BackupDirectory = Join-Path $DeployRoot 'Backups\Testing'
    HealthCheckUrl  = 'http://127.0.0.1:3002/api/health'
  }
}

if ($EnvironmentDefaults.ContainsKey($Environment)) {
  $defaults = $EnvironmentDefaults[$Environment]
  foreach ($key in @('AppPath', 'Branch', 'ServiceName', 'LogDirectory', 'BackupDirectory')) {
    if ([string]::IsNullOrWhiteSpace((Get-Variable -Name $key -ValueOnly))) {
      Set-Variable -Name $key -Value $defaults[$key]
    }
  }

  # HealthCheckUrl is handled separately: an explicitly passed empty string is a
  # deliberate "skip the health check", so only fall back to the default when the
  # caller did not mention the parameter at all.
  if (-not $PSBoundParameters.ContainsKey('HealthCheckUrl')) {
    $HealthCheckUrl = $defaults['HealthCheckUrl']
  }
}

# Backwards compatibility: the original script read the health URL from an
# environment variable. Still honoured when nothing else supplied one.
if (-not $PSBoundParameters.ContainsKey('HealthCheckUrl') -and
    [string]::IsNullOrWhiteSpace($HealthCheckUrl) -and
    -not [string]::IsNullOrWhiteSpace($env:JIVO_HEALTHCHECK_URL)) {
  $HealthCheckUrl = $env:JIVO_HEALTHCHECK_URL
}

foreach ($required in @('AppPath', 'Branch', 'ServiceName', 'LogDirectory')) {
  if ([string]::IsNullOrWhiteSpace((Get-Variable -Name $required -ValueOnly))) {
    throw ("Parameter -$required is required when -Environment is 'Custom'.")
  }
}

if ([string]::IsNullOrWhiteSpace($BackupDirectory)) {
  $BackupDirectory = Join-Path $LogDirectory 'backups'
}

# Every path MUST be absolute. The deploy does `Set-Location $AppPath` partway
# through, so a relative path would resolve against a different folder each time
# it is used — and `New-Item -Force` would then happily create
# Logs\Production\Logs\Production\... nested one level deeper on every run.
# Anchoring to absolute paths up front makes that impossible.
foreach ($pathVar in @('AppPath', 'LogDirectory', 'BackupDirectory')) {
  $value = Get-Variable -Name $pathVar -ValueOnly
  if (-not [System.IO.Path]::IsPathRooted($value)) {
    throw (
      "-$pathVar must be an absolute path (got '$value'). " +
      'Relative paths resolve differently once the script changes directory ' +
      'and would create nested folders on every run.'
    )
  }
  # Collapse any '..' / '.' segments so the same folder always has one spelling.
  Set-Variable -Name $pathVar -Value ([System.IO.Path]::GetFullPath($value))
}

# Create the log/backup folders only when they are actually missing. `-Force`
# alone is already safe on an existing directory, but testing first keeps the
# intent explicit and avoids touching a folder that is already correct.
foreach ($dir in @($LogDirectory, $BackupDirectory)) {
  if (Test-Path -LiteralPath $dir -PathType Container) { continue }

  if (Test-Path -LiteralPath $dir) {
    throw ($dir + ' exists but is a file, not a directory.')
  }

  New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

$LogFile = Join-Path $LogDirectory (
  'jivo-deploy-{0}-{1}.log' -f $Environment.ToLower(), (Get-Date -Format 'yyyyMMdd-HHmmss')
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
function Write-Section {
  param([string] $Message)
  Write-Host ''
  Write-Host ('==> [' + $Environment + '] ' + $Message)
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
    Write-Host 'No health check URL was provided. Skipping HTTP health check.'
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

function Save-RollbackMarker {
  param([string] $Commit)

  if ([string]::IsNullOrWhiteSpace($Commit)) { return }

  try {
    $marker = Join-Path $BackupDirectory 'last-known-good.txt'
    $line = '{0}  {1}  {2}' -f (Get-Date -Format 's'), $Branch, $Commit
    Set-Content -LiteralPath $marker -Value $line -Encoding utf8
    Add-Content -LiteralPath (Join-Path $BackupDirectory 'deploy-history.txt') -Value $line -Encoding utf8
  } catch {
    Write-Host ('Could not write rollback marker: ' + $_.Exception.Message)
  }
}

function Remove-OldLogs {
  if ($LogRetentionCount -le 0) { return }

  try {
    Get-ChildItem -LiteralPath $LogDirectory -Filter 'jivo-deploy-*.log' -File -ErrorAction Stop |
      Sort-Object LastWriteTime -Descending |
      Select-Object -Skip $LogRetentionCount |
      Remove-Item -Force -ErrorAction SilentlyContinue
  } catch {
    Write-Host ('Log pruning skipped: ' + $_.Exception.Message)
  }
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

# ---------------------------------------------------------------------------
# Deploy
# ---------------------------------------------------------------------------
Start-Transcript -Path $LogFile -Append | Out-Null

$previousCommit = $null
$serviceWasTouched = $false

try {
  Write-Section 'Deploy started'
  Write-Host ('Environment : ' + $Environment)
  Write-Host ('App path    : ' + $AppPath)
  Write-Host ('Branch      : ' + $Branch)
  Write-Host ('Service     : ' + $ServiceName)
  Write-Host ('Health check: ' + $(if ([string]::IsNullOrWhiteSpace($HealthCheckUrl)) { '(disabled)' } else { $HealthCheckUrl }))
  Write-Host ('Log file    : ' + $LogFile)

  if (-not (Test-IsAdministrator)) {
    throw 'This deploy must run as Administrator because service/NSSM commands require elevated permissions. Use an Administrator SSH user or run this script from an elevated scheduled task.'
  }

  if (-not (Test-Path -LiteralPath $AppPath)) {
    throw ('Deployment folder does not exist: ' + $AppPath)
  }

  Set-Location -LiteralPath $AppPath

  # Isolation guard: refuse to run if the folder is not a git working copy, so a
  # mistyped path can never be reset/rebuilt by this script.
  & git rev-parse --is-inside-work-tree | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw ($AppPath + ' is not a git working copy. Refusing to deploy.')
  }

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

  Invoke-Step ('Fetch origin/' + $Branch) 'git' @('fetch', 'origin', $Branch)

  # Isolation guard: this working copy must be on the branch this environment
  # owns. Production can therefore never be advanced by a testing deploy and
  # vice versa. Switching is only allowed when the tree is clean (checked above).
  if ($currentBranch -ne $Branch) {
    Write-Host ('Working copy is on "' + $currentBranch + '" but this environment deploys "' + $Branch + '". Switching branch.')
    Invoke-Step ('Checkout ' + $Branch) 'git' @('checkout', '-B', $Branch, ('origin/' + $Branch))
    $previousCommit = (& git rev-parse HEAD).Trim()
  }

  $targetCommit = (& git rev-parse ('origin/' + $Branch)).Trim()
  Write-Host ('Target commit: ' + $targetCommit)

  if ($previousCommit -eq $targetCommit) {
    Write-Host ('Server is already on origin/' + $Branch + '. Build and restart will still run to refresh the service.')
  }

  Invoke-Step 'Pull latest code' 'git' @('pull', '--ff-only', 'origin', $Branch)
  Write-Host ('Commit after pull: ' + (& git rev-parse --short HEAD).Trim())

  Invoke-Step 'Install dependencies' 'npm.cmd' @('install')
  Invoke-Step 'Build application before restart' 'npm.cmd' @('run', 'build')

  # Sync the database AFTER the build (schema + Prisma client are ready) and
  # BEFORE the restart, so the new service starts against an up-to-date DB. These
  # read DATABASE_URL from this folder's own .env.production (see prisma.config.ts
  # / prisma/seed.ts) — on this server the host must be `localhost`. Each
  # environment therefore syncs only its own database. They are NON-FATAL: a DB
  # blip never breaks the deploy or rolls back a good build.
  #   db:push → create/update tables    db:seed → insert missing data (insert-only)
  Invoke-StepOptional 'Sync database schema (db:push)' 'npm.cmd' @('run', 'db:push')
  Invoke-StepOptional 'Seed database (db:seed)' 'npm.cmd' @('run', 'db:seed')

  $serviceWasTouched = $true
  Restart-JivoService
  Test-Health

  Save-RollbackMarker -Commit (& git rev-parse HEAD).Trim()
  Write-Section 'Deployment completed'
} catch {
  Write-Host ''
  Write-Host ('DEPLOY FAILED: ' + $_.Exception.Message)
  Restore-PreviousCommit -PreviousCommit $previousCommit -ServiceWasTouched $serviceWasTouched
  throw
} finally {
  Stop-Transcript | Out-Null
  Remove-OldLogs
  Write-Host ('Deploy log saved to: ' + $LogFile)
}
