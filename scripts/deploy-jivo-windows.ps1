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

# Shared NSSM discovery (Get-JivoNssmPath / Get-JivoNssmError). Lives next to
# this script so both deployment scripts use identical lookup rules.
. (Join-Path $PSScriptRoot 'JivoNssm.ps1')

# Shared console formatting (Write-JivoStep / Write-JivoOk / ...). Output only;
# it makes no deployment decisions.
. (Join-Path $PSScriptRoot 'JivoDeployLog.ps1')

# ---------------------------------------------------------------------------
# Environment resolution
# ---------------------------------------------------------------------------
# The root that holds every environment. Both environments live side by side
# under it, which is what keeps their folders, logs and backups isolated.
$DeployRoot = 'C:\LiveProjects\JIVO_WEBSITE'

# SiteUrl is DISPLAY ONLY. It is printed in the summary card so an operator can
# click through to the environment that was just deployed. Nothing in this
# script ever requests it -- the health check uses HealthCheckUrl (127.0.0.1),
# exactly as before, so adding this cannot change health-check behaviour.
$EnvironmentDefaults = @{
  Production = @{
    AppPath         = Join-Path $DeployRoot 'NEXT_JS_WEB_JIVO.IN_LIVE'
    Branch          = 'main'
    ServiceName     = 'jivo-web-live'
    LogDirectory    = Join-Path $DeployRoot 'Logs\Production'
    BackupDirectory = Join-Path $DeployRoot 'Backups\Production'
    HealthCheckUrl  = 'http://127.0.0.1:3001/api/health'
    SiteUrl         = 'https://jivo.in'
  }
  Testing    = @{
    AppPath         = Join-Path $DeployRoot 'NEXT_JS_WEB_JIVO.IN_TEST'
    Branch          = 'testing'
    ServiceName     = 'jivo-web-test'
    LogDirectory    = Join-Path $DeployRoot 'Logs\Testing'
    BackupDirectory = Join-Path $DeployRoot 'Backups\Testing'
    HealthCheckUrl  = 'http://127.0.0.1:3002/api/health'
    SiteUrl         = 'https://abc.jivo.in'
  }
}

# Resolved from the table above purely for the summary card.
$SiteUrl = ''
if ($EnvironmentDefaults.ContainsKey($Environment)) {
  $SiteUrl = $EnvironmentDefaults[$Environment]['SiteUrl']
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
  Write-JivoStep $Message
}

function Invoke-Step {
  param(
    [string] $Label,
    [string] $Command,
    [string[]] $Arguments = @()
  )

  Write-Section $Label

  # Echo the exact command, then let the child process write straight to this
  # console. Native stdout/stderr are NOT captured or filtered, so the full
  # npm / Prisma / Next.js output (including warnings and errors) appears in
  # the GitHub Actions log verbatim.
  Write-JivoCommand (($Command + ' ' + ($Arguments -join ' ')).Trim())
  & $Command @Arguments

  if ($LASTEXITCODE -ne 0) {
    # Record what failed so the catch block can name the step and the command
    # instead of only reporting an exception message.
    $script:JivoFailedStep = $Label
    $script:JivoFailedCommand = ($Command + ' ' + ($Arguments -join ' ')).Trim()
    throw ($Label + ' failed with exit code ' + $LASTEXITCODE)
  }

  Write-JivoOk ($Label + ' completed')
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
  Write-JivoCommand (($Command + ' ' + ($Arguments -join ' ')).Trim())
  & $Command @Arguments

  if ($LASTEXITCODE -ne 0) {
    Write-JivoWarn (
      'WARNING: ' + $Label + ' failed with exit code ' + $LASTEXITCODE +
      ' - continuing (run it manually once the database is reachable).'
    )
    $global:LASTEXITCODE = 0
    return
  }

  Write-JivoOk ($Label + ' completed')
}

function Show-JivoChangedFiles {
  <#
  .SYNOPSIS
    Prints the files changed between two commits.

  .DESCRIPTION
    INFORMATIONAL ONLY. Every failure path returns quietly: a diff that cannot
    be produced (unrelated histories, a missing object after a force-push, git
    itself erroring) must never abort a deployment whose git verification has
    already passed.

    $LASTEXITCODE is saved and restored because `git diff` sets it, and the next
    Invoke-Step would otherwise read this function's exit code and report a
    healthy step as failed.
  #>
  param(
    [string] $FromCommit,
    [string] $ToCommit
  )

  $rule = '-' * 52
  Write-Host ''
  Write-Host $rule -ForegroundColor DarkGray
  Write-Host 'Files Changed' -ForegroundColor Cyan

  $previousExitCode = $global:LASTEXITCODE
  try {
    if ([string]::IsNullOrWhiteSpace($FromCommit) -or [string]::IsNullOrWhiteSpace($ToCommit)) {
      Write-Host 'No file changes detected.'
      return
    }

    if ($FromCommit -eq $ToCommit) {
      Write-Host 'No file changes detected.'
      return
    }

    $changed = @(& git diff --name-only $FromCommit $ToCommit 2>$null)
    if ($LASTEXITCODE -ne 0) {
      Write-Host 'No file changes detected.'
      return
    }

    $changed = @($changed | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($changed.Count -eq 0) {
      Write-Host 'No file changes detected.'
      return
    }

    foreach ($file in $changed) {
      Write-Host ([char]0x2713 + ' ' + $file.Trim()) -ForegroundColor Green
    }
    Write-Host ''
    Write-Host ('{0} file(s) changed' -f $changed.Count) -ForegroundColor DarkGray
  } catch {
    Write-Host 'No file changes detected.'
  } finally {
    $global:LASTEXITCODE = $previousExitCode
    Write-Host $rule -ForegroundColor DarkGray
  }
}

function Test-IsAdministrator {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Restart-JivoService {
  Write-JivoStep ('Restarting NSSM Service (' + $ServiceName + ')')

  $nssm = Get-JivoNssmPath
  if ($nssm) {
    Write-JivoCommand ('"' + $nssm + '" restart ' + $ServiceName)
    & $nssm restart $ServiceName
    if ($LASTEXITCODE -ne 0) {
      $script:JivoFailedStep = 'Restarting NSSM Service'
      $script:JivoFailedCommand = ('"' + $nssm + '" restart ' + $ServiceName)
      throw ('nssm restart failed with exit code ' + $LASTEXITCODE)
    }
    Write-JivoOk ($ServiceName + ' restarted')
    return
  }

  # Not fatal here: the service may still be controllable with net.exe, so the
  # deploy keeps its existing fallback rather than aborting on discovery alone.
  Write-JivoWarn (Get-JivoNssmError)
  Write-JivoWarn 'Falling back to net stop/start.'
  Write-JivoCommand ('net.exe stop ' + $ServiceName)
  & net.exe stop $ServiceName
  if ($LASTEXITCODE -ne 0) {
    Write-JivoWarn 'Service was not running or could not be stopped. Continuing to start it.'
  }

  Write-JivoCommand ('net.exe start ' + $ServiceName)
  & net.exe start $ServiceName
  if ($LASTEXITCODE -ne 0) {
    # `net start` returns non-zero when the service is ALREADY running (e.g. the
    # stop above failed because it was mid-start). That is the desired end state,
    # so verify reality before failing the deploy on an exit code alone.
    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($svc -and $svc.Status -eq 'Running') {
      Write-JivoWarn ('net start reported exit code ' + $LASTEXITCODE + ' but the service is running. Continuing.')
      Write-JivoOk ($ServiceName + ' restarted')
      return
    }

    $script:JivoFailedStep = 'Restarting NSSM Service'
    $script:JivoFailedCommand = ('net.exe start ' + $ServiceName)
    throw (
      'net start failed with exit code ' + $LASTEXITCODE +
      ' and service ' + $ServiceName + ' is not running' +
      $(if ($svc) { ' (current status: ' + $svc.Status + ')' } else { ' (service not found)' }) + '.'
    )
  }

  Write-JivoOk ($ServiceName + ' restarted')
}

function Test-Health {
  if ([string]::IsNullOrWhiteSpace($HealthCheckUrl)) {
    Write-JivoStep 'Waiting for Health Check'
    Write-JivoWarn 'No health check URL was provided. Skipping HTTP health check.'
    return
  }

  Write-JivoStep ('Waiting for Health Check (' + $HealthCheckUrl + ')')

  # Accept only 2xx/3xx. The previous rule (< 500) also accepted 4xx, so a 404
  # from a health route that failed to build would be reported as a PASS and a
  # broken deploy would be marked successful.
  $lastFailure = 'no attempt completed'
  for ($attempt = 1; $attempt -le 12; $attempt++) {
    Write-JivoInfo ('  Attempt ' + $attempt + '/12...')
    try {
      $response = Invoke-WebRequest -Uri $HealthCheckUrl -UseBasicParsing -TimeoutSec 10
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
        Write-JivoOk ('Health Check Passed (HTTP ' + $response.StatusCode + ')')
        return
      }
      $lastFailure = 'HTTP ' + $response.StatusCode
      Write-JivoWarn ('    returned status ' + $response.StatusCode)
    } catch {
      # A 4xx/5xx makes Invoke-WebRequest throw; surface the real status code
      # rather than only the generic exception text.
      $status = $null
      if ($_.Exception.Response) {
        try { $status = [int] $_.Exception.Response.StatusCode } catch { }
      }
      $lastFailure = $(if ($status) { 'HTTP ' + $status } else { $_.Exception.Message })
      Write-JivoWarn ('    failed: ' + $lastFailure)
    }

    Start-Sleep -Seconds 5
  }

  $script:JivoFailedStep = 'Waiting for Health Check'
  $script:JivoFailedCommand = ('GET ' + $HealthCheckUrl)
  throw (
    'Health check failed after service restart: ' + $HealthCheckUrl +
    ' did not return a 2xx/3xx within 12 attempts (~60s). Last result: ' + $lastFailure + '.'
  )
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

# ---------------------------------------------------------------------------
# Deployment reporting (traceability artifacts)
# ---------------------------------------------------------------------------
# These write manifest/history files for auditing. They are STRICTLY
# side-channel: every one of them swallows its own errors and returns quietly,
# because a deployment that installed, built, restarted and passed its health
# check has SUCCEEDED -- a disk-full or permission problem while writing a
# report must never turn that into a failure, nor trigger a rollback.
#
# $LASTEXITCODE is untouched here (no external process is invoked), so these
# cannot interfere with the next Invoke-Step exit-code check.

function Confirm-JivoReportDirectory {
  <#
  .SYNOPSIS
    Ensures the report folder exists. Returns $true when it is usable.
  #>
  param([string] $Directory)

  try {
    if ([string]::IsNullOrWhiteSpace($Directory)) { return $false }
    if (Test-Path -LiteralPath $Directory -PathType Container) { return $true }
    if (Test-Path -LiteralPath $Directory) {
      Write-JivoWarn ('Report folder path exists but is a file: ' + $Directory)
      return $false
    }
    New-Item -ItemType Directory -Force -Path $Directory | Out-Null
    return $true
  } catch {
    Write-JivoWarn ('Could not create report folder ' + $Directory + ': ' + $_.Exception.Message)
    return $false
  }
}

function ConvertTo-JivoCsvField {
  <#
  .SYNOPSIS
    RFC4180-style CSV escaping so paths/reasons containing commas, quotes or
    newlines cannot corrupt the history files.
  #>
  param([string] $Value)

  if ($null -eq $Value) { $Value = '' }
  $Value = $Value -replace "`r`n", ' ' -replace "`r", ' ' -replace "`n", ' '
  return '"' + ($Value -replace '"', '""') + '"'
}

function Add-JivoCsvRow {
  <#
  .SYNOPSIS
    Appends one row to a CSV, writing the header only when creating the file.

  .DESCRIPTION
    Append-only by design: existing history is never rewritten or truncated.
  #>
  param(
    [string] $Path,
    [string[]] $Header,
    [string[]] $Values
  )

  try {
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
      Add-Content -LiteralPath $Path -Value ($Header -join ',') -Encoding utf8
    }
    $row = @($Values | ForEach-Object { ConvertTo-JivoCsvField $_ }) -join ','
    Add-Content -LiteralPath $Path -Value $row -Encoding utf8
    return $true
  } catch {
    Write-JivoWarn ('Could not append to ' + $Path + ': ' + $_.Exception.Message)
    return $false
  }
}

function Write-JivoDeploymentManifest {
  <#
  .SYNOPSIS
    Writes last-deployment.json plus the deployment-history.csv row.
  #>
  param(
    [string] $Status,
    [string] $CurrentCommit,
    [datetime] $FinishedAt,
    [bool] $RolledBack = $false,
    [string] $FailureReason = ''
  )

  try {
    if (-not (Confirm-JivoReportDirectory -Directory $BackupDirectory)) { return }

    $duration = Format-JivoDuration ($FinishedAt - $deployStartedAt)

    $manifest = [ordered] @{
      deploymentId   = $DeploymentId
      environment    = $Environment
      branch         = $Branch
      repository     = $AppPath
      previousCommit = $previousCommit
      currentCommit  = $CurrentCommit
      service        = $ServiceName
      url            = $SiteUrl
      startedAt      = $deployStartedAt.ToString('o')
      finishedAt     = $FinishedAt.ToString('o')
      duration       = $duration
      status         = $Status
      rollback       = $RolledBack
      server         = [Environment]::MachineName
    }

    # Only present on the failure path, so a successful manifest stays clean.
    if (-not [string]::IsNullOrWhiteSpace($FailureReason)) {
      $manifest['failureReason'] = $FailureReason
    }

    $manifestPath = Join-Path $BackupDirectory 'last-deployment.json'
    ($manifest | ConvertTo-Json -Depth 4) | Set-Content -LiteralPath $manifestPath -Encoding utf8
    Write-JivoInfo ('  Manifest : ' + $manifestPath)

    $historyPath = Join-Path $BackupDirectory 'deployment-history.csv'
    $wrote = Add-JivoCsvRow -Path $historyPath -Header @(
      'Timestamp', 'Environment', 'Branch', 'PreviousCommit', 'CurrentCommit',
      'Duration', 'Status', 'DeploymentID'
    ) -Values @(
      $FinishedAt.ToString('o'), $Environment, $Branch, $previousCommit,
      $CurrentCommit, $duration, $Status, $DeploymentId
    )
    if ($wrote) { Write-JivoInfo ('  History  : ' + $historyPath) }
  } catch {
    Write-JivoWarn ('Could not write deployment manifest: ' + $_.Exception.Message)
  }
}

function Write-JivoRollbackRecord {
  <#
  .SYNOPSIS
    Appends one row to rollback-history.csv. Called only when a rollback ran.
  #>
  param(
    [string] $RollbackCommit,
    [string] $Reason
  )

  try {
    if (-not (Confirm-JivoReportDirectory -Directory $BackupDirectory)) { return }

    $rollbackPath = Join-Path $BackupDirectory 'rollback-history.csv'
    $wrote = Add-JivoCsvRow -Path $rollbackPath -Header @(
      'RollbackTime', 'RollbackCommit', 'RollbackReason', 'DeploymentID', 'Environment'
    ) -Values @(
      (Get-Date).ToString('o'), $RollbackCommit, $Reason, $DeploymentId, $Environment
    )
    if ($wrote) { Write-JivoInfo ('  Rollback log : ' + $rollbackPath) }
  } catch {
    Write-JivoWarn ('Could not write rollback record: ' + $_.Exception.Message)
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
    Write-JivoWarn 'No previous commit was captured. Rollback skipped.'
    return
  }

  Write-JivoInfo ''
  Write-JivoInfo ('Rolling back to ' + $PreviousCommit)
  Write-JivoCommand ('git reset --hard ' + $PreviousCommit)
  & git reset --hard $PreviousCommit
  if ($LASTEXITCODE -ne 0) {
    Write-JivoFail ('Rollback reset failed with exit code ' + $LASTEXITCODE)
    return
  }
  Write-JivoOk ('Working copy reset to ' + $PreviousCommit)

  try {
    Invoke-Step 'Restoring dependencies for previous commit' 'npm.cmd' @('install')
    Invoke-Step 'Rebuilding previous commit' 'npm.cmd' @('run', 'build')
  } catch {
    Write-JivoFail ('Rollback rebuild failed: ' + $_.Exception.Message)
    Write-JivoWarn 'Existing running service was left untouched if it had not been restarted yet.'
    if (-not $ServiceWasTouched) {
      return
    }
  }

  if ($ServiceWasTouched) {
    try {
      Restart-JivoService
      Test-Health
      Write-JivoOk 'Rollback service restart completed.'
    } catch {
      Write-JivoFail ('Rollback service restart failed: ' + $_.Exception.Message)
    }
  }
}

# ---------------------------------------------------------------------------
# Deploy
# ---------------------------------------------------------------------------
# Per-environment mutex. GitHub's `concurrency:` group already serialises CI
# runs for ONE environment, but it cannot see a deploy started by hand over SSH
# or by a scheduled task. Two overlapping deploys of the same environment would
# race on the same working copy (git reset/checkout + npm install + build), which
# can leave a half-built tree in production.
#
# The name is environment-scoped, so Production and Testing never block each
# other -- they hold different mutexes and continue to deploy in parallel.
# "Global\" makes it machine-wide, so it works across separate SSH sessions.
$mutexName = 'Global\JivoDeploy-' + $Environment
$deployMutex = New-Object System.Threading.Mutex($false, $mutexName)
$mutexAcquired = $false
try {
  # Wait briefly rather than failing instantly: a deploy that is seconds from
  # finishing should let the next one proceed instead of erroring the pipeline.
  $mutexAcquired = $deployMutex.WaitOne([TimeSpan]::FromMinutes(20))
} catch [System.Threading.AbandonedMutexException] {
  # The previous holder died without releasing (crash / killed SSH session).
  # The mutex is ours now; the working copy is validated below regardless.
  $mutexAcquired = $true
  Write-Host 'Previous deploy did not release its lock cleanly. Continuing.'
}

if (-not $mutexAcquired) {
  throw (
    'Another ' + $Environment + ' deploy is already running on this server and did ' +
    'not finish within 20 minutes. Refusing to start a second one -- concurrent ' +
    'deploys would corrupt the working copy at ' + $AppPath + '.'
  )
}

$previousCommit = $null
$serviceWasTouched = $false

# Failure context for the catch block. Invoke-Step fills these in so a failed
# deploy can report WHICH step and WHICH command failed, not just an exception.
$script:JivoFailedStep = $null
$script:JivoFailedCommand = $null

# Wall-clock duration of the whole deploy.
$deployStartedAt = Get-Date

# Diagnostic metadata. Read-only: nothing here influences any deployment
# decision, and every lookup degrades to a placeholder instead of throwing.
#
# A unique-per-run ID that appears in BOTH the GitHub Actions log and the
# on-server transcript, so a CI run can be matched to its server-side log file.
$DeploymentId = '{0}-{1}-{2}' -f $Environment.ToLower(),
  $deployStartedAt.ToString('yyyyMMdd-HHmmss'),
  ([guid]::NewGuid().ToString('N').Substring(0, 6))

# GitHub context is NOT present on the server: the SSH session does not inherit
# the runner's environment. Reported as "(not available)" unless the values are
# explicitly forwarded some day -- never guessed.
$GitHubRunId = [Environment]::GetEnvironmentVariable('GITHUB_RUN_ID')
if ([string]::IsNullOrWhiteSpace($GitHubRunId)) { $GitHubRunId = '(not available)' }
$GitHubActor = [Environment]::GetEnvironmentVariable('GITHUB_ACTOR')
if ([string]::IsNullOrWhiteSpace($GitHubActor)) { $GitHubActor = '(not available)' }

# 11 numbered steps on the normal path: Administrator, working tree, fetch,
# pull, npm install, build, db:push, db:seed, restart, health check, cleanup.
# A branch switch adds a conditional 12th; Write-JivoStep widens the total
# rather than printing "[12/11]".
Initialize-JivoConsole -TotalSteps 11

Write-JivoBanner -Title 'JIVO WEBSITE DEPLOYMENT' -FieldOrder @(
  'Environment', 'Branch', 'Service', 'App path', 'Health check', 'Log file', 'Started'
) -Fields @{
  'Environment'  = $Environment
  'Branch'       = $Branch
  'Service'      = $ServiceName
  'App path'     = $AppPath
  'Health check' = $(if ([string]::IsNullOrWhiteSpace($HealthCheckUrl)) { '(disabled)' } else { $HealthCheckUrl })
  'Log file'     = $LogFile
  'Started'      = $deployStartedAt.ToString('yyyy-MM-dd HH:mm:ss')
}

try {
  # Inside the try so that a failure to open the log file (disk full, file
  # locked) still runs the finally block and releases the mutex. Starting it
  # outside would leave the lock held and block the next deploy for 20 minutes.
  Start-Transcript -Path $LogFile -Append | Out-Null

  # Diagnostics, printed after the transcript starts so it captures them too.
  # Tool versions are probed here (once) rather than mid-deploy, and every
  # lookup is failure-tolerant -- see Get-JivoToolVersion / Get-JivoPackageVersion.
  Write-JivoBanner -Color 'DarkGray' -Title 'Deployment Metadata' -FieldOrder @(
    'Deployment ID', 'GitHub Run ID', 'GitHub Actor', 'Server', 'Machine',
    'Started', 'Node', 'npm', 'Next.js'
  ) -Fields @{
    'Deployment ID' = $DeploymentId
    'GitHub Run ID' = $GitHubRunId
    'GitHub Actor'  = $GitHubActor
    'Server'        = [Environment]::MachineName
    'Machine'       = ('{0} ({1})' -f [Environment]::OSVersion.VersionString, $env:PROCESSOR_ARCHITECTURE)
    'Started'       = $deployStartedAt.ToString('yyyy-MM-dd HH:mm:ss')
    'Node'          = (Get-JivoToolVersion -Command 'node')
    'npm'           = (Get-JivoToolVersion -Command 'npm.cmd')
    'Next.js'       = (Get-JivoPackageVersion -PackageJsonPath (Join-Path $AppPath 'package.json') -DependencyName 'next')
  }

  Write-JivoStep 'Validating Administrator'
  if (-not (Test-IsAdministrator)) {
    throw 'This deploy must run as Administrator because service/NSSM commands require elevated permissions. Use an Administrator SSH user or run this script from an elevated scheduled task.'
  }
  Write-JivoOk 'Running elevated'

  Write-JivoStep 'Checking Git Working Tree'
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

  # `git branch --show-current` prints NOTHING in detached-HEAD state, which
  # would make .Trim() fail on $null. Coerce to a string first and report the
  # detached case explicitly rather than crashing on it.
  $currentBranchRaw = (& git branch --show-current)
  $currentBranch = if ($null -eq $currentBranchRaw) { '' } else { ([string]$currentBranchRaw).Trim() }

  $previousCommit = (& git rev-parse HEAD).Trim()
  $previousCommitShort = (& git rev-parse --short HEAD).Trim()

  Write-JivoOk 'Working tree is clean'
  Write-JivoInfo ('  Working dir     : ' + (Get-Location).Path)
  Write-JivoInfo ('  Current branch  : ' + $(if ($currentBranch) { $currentBranch } else { '(detached HEAD)' }))
  Write-JivoInfo ('  Previous commit : ' + $previousCommitShort + '  (' + $previousCommit + ')')

  Invoke-Step ('Fetching Latest Code (origin/' + $Branch + ')') 'git' @('fetch', 'origin', $Branch)

  # Isolation guard: this working copy must be on the branch this environment
  # owns. Production can therefore never be advanced by a testing deploy and
  # vice versa. Switching is only allowed when the tree is clean (checked above).
  if ($currentBranch -ne $Branch) {
    Write-JivoWarn ('Working copy is on "' + $currentBranch + '" but this environment deploys "' + $Branch + '". Switching branch.')
    Invoke-Step ('Checkout ' + $Branch) 'git' @('checkout', '-B', $Branch, ('origin/' + $Branch))
    $previousCommit = (& git rev-parse HEAD).Trim()
  }

  $targetCommit = (& git rev-parse ('origin/' + $Branch)).Trim()
  Write-JivoInfo ('  Target commit   : ' + (& git rev-parse --short ('origin/' + $Branch)).Trim() + '  (' + $targetCommit + ')')

  if ($previousCommit -eq $targetCommit) {
    Write-JivoWarn ('Server is already on origin/' + $Branch + '. Build and restart will still run to refresh the service.')
  }

  Invoke-Step 'Pulling Latest Commit' 'git' @('pull', '--ff-only', 'origin', $Branch)

  # Re-resolve the remote ref AFTER the pull. The value captured before the pull
  # can be stale (a fetch that only updated FETCH_HEAD leaves
  # refs/remotes/origin/<branch> untouched), so comparing against it would be
  # comparing against the same wrong number twice.
  $expectedCommit = (& git rev-parse ('refs/remotes/origin/' + $Branch)).Trim()
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($expectedCommit)) {
    $script:JivoFailedStep = 'Pulling Latest Commit'
    $script:JivoFailedCommand = ('git rev-parse refs/remotes/origin/' + $Branch)

    Write-JivoBanner -Color 'Red' -Title 'Git Verification FAILED' -FieldOrder @(
      'Environment', 'Branch', 'Repository', 'Previous HEAD', 'Target Commit', 'Current HEAD'
    ) -Fields @{
      'Environment'   = $Environment
      'Branch'        = $Branch
      'Repository'    = $AppPath
      'Previous HEAD' = $previousCommitShort
      'Target Commit' = '(unresolvable)'
      'Current HEAD'  = (& git rev-parse --short HEAD).Trim()
    }
    Write-JivoFail 'Reason:'
    Write-JivoInfo ('  refs/remotes/origin/' + $Branch + ' cannot be resolved.')
    Write-JivoInfo '  Deployment aborted before npm install.'

    throw (
      'Cannot resolve refs/remotes/origin/' + $Branch + ' after fetch. The remote ' +
      'tracking ref is missing, so there is no reliable way to confirm which commit ' +
      'this deploy would serve. Check `git config remote.origin.fetch` in ' + $AppPath + '.'
    )
  }

  $deployedCommit = (& git rev-parse HEAD).Trim()
  $deployedCommitShort = (& git rev-parse --short HEAD).Trim()
  $expectedCommitShort = (& git rev-parse --short ('refs/remotes/origin/' + $Branch)).Trim()

  # THE GUARANTEE: every command above can exit 0 and still leave HEAD behind
  # origin/<branch> (diverged history that --ff-only refuses, a stale tracking
  # ref, a detached HEAD, an interrupted earlier run). Exit codes alone do not
  # prove the working tree actually moved. Assert the end state instead, so a
  # deploy can never build and serve an old commit while reporting success.
  #
  # This runs BEFORE npm install / npm run build, so a wrong commit is never
  # installed, built, or served.
  if ($deployedCommit -ne $expectedCommit) {
    $script:JivoFailedStep = 'Pulling Latest Commit'
    $script:JivoFailedCommand = ('git pull --ff-only origin ' + $Branch)

    Write-JivoBanner -Color 'Red' -Title 'Git Verification FAILED' -FieldOrder @(
      'Environment', 'Branch', 'Repository', 'Previous HEAD', 'Target Commit', 'Current HEAD'
    ) -Fields @{
      'Environment'   = $Environment
      'Branch'        = $Branch
      'Repository'    = $AppPath
      'Previous HEAD' = $previousCommitShort
      'Target Commit' = $expectedCommitShort
      'Current HEAD'  = $deployedCommitShort
    }
    Write-JivoFail 'Reason:'
    Write-JivoInfo ('  HEAD does not match origin/' + $Branch + '.')
    Write-JivoInfo '  Deployment aborted before npm install.'

    throw (
      'Working tree did not advance to origin/' + $Branch + '. ' +
      'HEAD is ' + $deployedCommit + ' but origin/' + $Branch + ' is ' + $expectedCommit + '. ' +
      'The pull reported success without moving HEAD -- usually diverged history ' +
      '(a commit made directly on the server), a detached HEAD, or a stale remote ' +
      'tracking ref. Refusing to build and serve the wrong commit.'
    )
  }

  Write-JivoBanner -Color 'Green' -Title 'Git Verification' -FieldOrder @(
    'Environment', 'Branch', 'Repository', 'Previous HEAD', 'Target Commit', 'Current HEAD', 'Verification'
  ) -Fields @{
    'Environment'   = $Environment
    'Branch'        = $Branch
    'Repository'    = $AppPath
    'Previous HEAD' = $previousCommitShort
    'Target Commit' = $expectedCommitShort
    'Current HEAD'  = $deployedCommitShort
    'Verification'  = ('PASS ' + [char]0x2713)
  }
  Write-JivoStageComplete 'Repository Updated'

  # Informational only, between verification and install exactly as specified.
  # Cannot fail the deploy -- see Show-JivoChangedFiles.
  Show-JivoChangedFiles -FromCommit $previousCommit -ToCommit $deployedCommit

  Invoke-Step 'Installing Dependencies' 'npm.cmd' @('install')
  Write-JivoStageComplete 'Dependencies Installed'

  Invoke-Step 'Building Application' 'npm.cmd' @('run', 'build')
  Write-JivoStageComplete 'Build Completed'

  # Sync the database AFTER the build (schema + Prisma client are ready) and
  # BEFORE the restart, so the new service starts against an up-to-date DB. These
  # read DATABASE_URL from this folder's own .env.production (see prisma.config.ts
  # / prisma/seed.ts) — on this server the host must be `localhost`. Each
  # environment therefore syncs only its own database. They are NON-FATAL: a DB
  # blip never breaks the deploy or rolls back a good build.
  #   db:push → create/update tables    db:seed → insert missing data (insert-only)
  Invoke-StepOptional 'Syncing Database Schema (db:push)' 'npm.cmd' @('run', 'db:push')
  Invoke-StepOptional 'Seeding Database (db:seed)' 'npm.cmd' @('run', 'db:seed')

  $serviceWasTouched = $true
  Restart-JivoService
  Write-JivoStageComplete 'Service Restarted'

  Test-Health
  Write-JivoStageComplete 'Health Check Passed'

  Write-JivoStep 'Cleaning Up'
  Save-RollbackMarker -Commit (& git rev-parse HEAD).Trim()
  Write-JivoOk 'Rollback marker saved'

  # Traceability artifacts. Written AFTER the health check has already passed,
  # so the deploy is a confirmed success by this point and a reporting failure
  # can only produce a warning.
  $deployFinishedAt = Get-Date
  Write-JivoDeploymentManifest -Status 'Success' -CurrentCommit $deployedCommit -FinishedAt $deployFinishedAt

  Write-JivoStageComplete 'Deployment Completed'

  # Reuses the timestamp captured for the manifest above, so the JSON, the CSV
  # row and this card all report exactly the same finish time and duration.
  Write-JivoBanner -Color 'Green' -Title 'DEPLOYMENT SUCCESSFUL' -FieldOrder @(
    'Environment', 'Branch', 'Repository', 'Service', 'URL',
    'Previous', 'Current', 'Started', 'Finished', 'Duration', 'Deployment ID'
  ) -Fields @{
    'Environment'   = $Environment
    'Branch'        = $Branch
    'Repository'    = $AppPath
    'Service'       = $ServiceName
    'URL'           = $(if ([string]::IsNullOrWhiteSpace($SiteUrl)) { '(not configured)' } else { $SiteUrl })
    'Previous'      = $previousCommitShort
    'Current'       = $deployedCommitShort
    'Started'       = $deployStartedAt.ToString('yyyy-MM-dd HH:mm:ss')
    'Finished'      = $deployFinishedAt.ToString('yyyy-MM-dd HH:mm:ss')
    'Duration'      = (Format-JivoDuration ($deployFinishedAt - $deployStartedAt))
    'Deployment ID' = $DeploymentId
  }
} catch {
  # Full failure report: which step, which command, the real exception, and the
  # source location. Everything is printed BEFORE the rollback so the log reads
  # in causal order.
  $failedStage = $(
    if ($script:JivoFailedStep) { $script:JivoFailedStep }
    elseif (Get-JivoCurrentStep) { Get-JivoCurrentStep }
    else { '(before the first step)' }
  )
  $failedCommand = $(if ($script:JivoFailedCommand) { $script:JivoFailedCommand } else { '(no external command)' })

  Write-JivoBanner -Color 'Red' -Title 'DEPLOYMENT FAILED' -FieldOrder @(
    'Environment', 'Branch', 'Folder', 'Duration'
  ) -Fields @{
    'Environment' = $Environment
    'Branch'      = $Branch
    'Folder'      = $AppPath
    'Duration'    = (Format-JivoDuration ((Get-Date) - $deployStartedAt))
  }

  Write-JivoFail 'FAILED STAGE'
  Write-JivoInfo ('  ' + $failedStage)
  Write-Host ''
  Write-JivoFail 'Command'
  Write-JivoInfo ('  ' + $failedCommand)
  Write-Host ''
  Write-JivoFail 'Reason'
  Write-JivoInfo ('  ' + $_.Exception.Message)

  Write-Host ''
  Write-JivoFail 'Diagnostics'
  if ($_.Exception.GetType().FullName -ne 'System.Management.Automation.RuntimeException') {
    Write-JivoInfo ('  Type     : ' + $_.Exception.GetType().FullName)
  }
  if ($_.InvocationInfo -and $_.InvocationInfo.ScriptLineNumber) {
    Write-JivoInfo ('  Location : line ' + $_.InvocationInfo.ScriptLineNumber)
  }
  if ($_.ScriptStackTrace) {
    Write-JivoInfo '  Stack    :'
    foreach ($frame in ($_.ScriptStackTrace -split "`r?`n")) {
      if ($frame.Trim()) { Write-JivoInfo ('    ' + $frame.Trim()) }
    }
  }

  Write-Host ''
  Write-JivoWarn 'ROLLBACK STARTED'
  Restore-PreviousCommit -PreviousCommit $previousCommit -ServiceWasTouched $serviceWasTouched
  Write-JivoWarn 'ROLLBACK COMPLETED'

  # Traceability for the failed run. Written AFTER the rollback so the recorded
  # commit is the one actually left on disk. Wrapped defensively: a reporting
  # error here must not replace the real deployment exception below.
  try {
    $rollbackRan = -not [string]::IsNullOrWhiteSpace($previousCommit)

    # Whatever HEAD is now -- the restored commit after a rollback, or the
    # unchanged commit when there was nothing to roll back to.
    #
    # Only resolved from the DEPLOYMENT folder. An early failure (e.g. the
    # Administrator check) aborts before Set-Location, and running git in
    # whatever directory the shell happened to start in would record a commit
    # from an unrelated repository. Better to record nothing than a wrong SHA.
    $commitNow = $previousCommit
    try {
      if ((Get-Location).Path -eq $AppPath) {
        $resolved = (& git rev-parse HEAD 2>$null)
        if ($LASTEXITCODE -eq 0 -and $resolved) { $commitNow = ([string]$resolved).Trim() }
      }
    } catch { }

    Write-JivoDeploymentManifest -Status 'Failed' -CurrentCommit $commitNow `
      -FinishedAt (Get-Date) -RolledBack $rollbackRan -FailureReason $_.Exception.Message

    if ($rollbackRan) {
      Write-JivoRollbackRecord -RollbackCommit $commitNow -Reason (
        $failedStage + ': ' + $_.Exception.Message
      )
    }
  } catch {
    Write-JivoWarn ('Could not write failure reports: ' + $_.Exception.Message)
  }

  # Re-thrown so PowerShell exits non-zero and GitHub Actions fails the job.
  throw
} finally {
  # Stop-Transcript throws when no transcript is running (e.g. it failed to
  # start). That exception would replace the real deployment error with a
  # confusing one, so it is swallowed deliberately.
  try { Stop-Transcript | Out-Null } catch { }
  Remove-OldLogs
  Write-Host ('Deploy log saved to: ' + $LogFile)

  # Always release the environment mutex, including on failure, so a failed
  # deploy never blocks the next one for 20 minutes.
  if ($mutexAcquired) {
    try { $deployMutex.ReleaseMutex() } catch { }
  }
  $deployMutex.Dispose()
}
