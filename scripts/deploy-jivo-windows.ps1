$ErrorActionPreference = 'Stop'

$ProjectRoot = 'C:\LiveProjects'
$AppName = 'NEXT_JS_WEB_JIVO.IN'
$AppPath = Join-Path $ProjectRoot $AppName
$ReleasePath = Join-Path $ProjectRoot ($AppName + '.deploying')
$RollbackPath = Join-Path $ProjectRoot ($AppName + '.rollback')
$FailedPath = Join-Path $ProjectRoot ($AppName + '.failed')
$BackupRoot = Join-Path $AppPath 'backups'
$ServiceName = 'jivo-web'
$DeployBranch = 'main'
$RepositoryUrl = 'https://github.com/jivoit01-collab/NEXT_JS_WEB_JIVO.IN.git'
$HealthCheckUrl = $env:JIVO_HEALTHCHECK_URL

$ServiceRetries = 5
$ServiceRetryWaitSeconds = 5
$RobocopyRetries = 2
$RobocopyWaitSeconds = 2

$Timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$LogDir = Join-Path $ProjectRoot 'deploy-logs'
$LogFile = Join-Path $LogDir ('jivo-deploy-{0}.log' -f $Timestamp)
$BackupPath = Join-Path $BackupRoot ('{0}-{1}' -f $AppName, $Timestamp)

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

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

function Invoke-Robocopy {
  param(
    [string] $Label,
    [string] $Source,
    [string] $Destination,
    [string[]] $Arguments = @()
  )

  Write-Section $Label
  New-Item -ItemType Directory -Force -Path $Destination | Out-Null

  & robocopy.exe $Source $Destination @Arguments
  $exitCode = $LASTEXITCODE

  if ($exitCode -ge 8) {
    throw ($Label + ' failed with robocopy exit code ' + $exitCode)
  }

  Write-Host ($Label + ' completed with robocopy exit code ' + $exitCode)
}

function Test-IsAdministrator {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Assert-Command {
  param([string] $Name)

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw ($Name + ' was not found in PATH.')
  }

  Write-Host ('Command available: ' + $Name)
}

function Remove-FolderIfExists {
  param([string] $Path)

  if (Test-Path -LiteralPath $Path) {
    Write-Host ('Removing folder: ' + $Path)
    Remove-Item -LiteralPath $Path -Recurse -Force
  }
}

function Ensure-OriginRemote {
  Write-Section 'Checking git origin remote'

  & git.exe remote get-url origin | Out-Null
  if ($LASTEXITCODE -eq 0) {
    & git.exe remote set-url origin $RepositoryUrl
    if ($LASTEXITCODE -ne 0) {
      throw ('Unable to update origin remote to ' + $RepositoryUrl)
    }
  } else {
    & git.exe remote add origin $RepositoryUrl
    if ($LASTEXITCODE -ne 0) {
      throw ('Unable to add origin remote ' + $RepositoryUrl)
    }
  }

  Write-Host ('origin: ' + (& git.exe remote get-url origin).Trim())
}

function Copy-ServerFilesToRelease {
  Write-Section 'Copying server-only files into release'

  $envFiles = @('.env', '.env.local', '.env.production', '.env.production.local')
  foreach ($file in $envFiles) {
    $source = Join-Path $AppPath $file
    if (Test-Path -LiteralPath $source) {
      Copy-Item -LiteralPath $source -Destination (Join-Path $ReleasePath $file) -Force
      Write-Host ('Copied ' + $file)
    }
  }
}

function Copy-PersistentFoldersToRelease {
  $persistentFolders = @('uploads', 'backups')

  foreach ($folder in $persistentFolders) {
    $source = Join-Path $AppPath $folder
    $destination = Join-Path $ReleasePath $folder

    if (Test-Path -LiteralPath $source) {
      Invoke-Robocopy `
        -Label ('Copying persistent folder ' + $folder) `
        -Source $source `
        -Destination $destination `
        -Arguments @('/E', '/COPY:DAT', '/DCOPY:DAT', '/XJ', ('/R:{0}' -f $RobocopyRetries), ('/W:{0}' -f $RobocopyWaitSeconds), '/NP')
    } else {
      Write-Host ('Persistent folder not found, skipped: ' + $folder)
    }
  }
}

function Backup-LiveDeployment {
  New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null

  Invoke-Robocopy `
    -Label 'Backing up current live deployment' `
    -Source $AppPath `
    -Destination $BackupPath `
    -Arguments @('/MIR', '/COPY:DAT', '/DCOPY:DAT', '/XJ', ('/R:{0}' -f $RobocopyRetries), ('/W:{0}' -f $RobocopyWaitSeconds), '/NP', '/XD', $BackupRoot)

  if (-not (Get-ChildItem -LiteralPath $BackupPath -Force | Select-Object -First 1)) {
    throw ('Backup folder is empty: ' + $BackupPath)
  }

  Write-Host ('Backup completed: ' + $BackupPath)
}

function Copy-BackupsToRelease {
  if (-not (Test-Path -LiteralPath $BackupRoot)) {
    return
  }

  Invoke-Robocopy `
    -Label 'Copying backups into release' `
    -Source $BackupRoot `
    -Destination (Join-Path $ReleasePath 'backups') `
    -Arguments @('/E', '/COPY:DAT', '/DCOPY:DAT', '/XJ', ('/R:{0}' -f $RobocopyRetries), ('/W:{0}' -f $RobocopyWaitSeconds), '/NP')
}

function Get-JivoService {
  return Get-Service -Name $ServiceName -ErrorAction Stop
}

function Stop-JivoService {
  Write-Section ('Stopping service ' + $ServiceName)

  $service = Get-JivoService
  if ($service.Status -eq 'Stopped') {
    Write-Host 'Service is already stopped.'
    return
  }

  $nssm = Get-Command nssm.exe -ErrorAction SilentlyContinue
  for ($attempt = 1; $attempt -le $ServiceRetries; $attempt++) {
    Write-Host ('Stop attempt {0} of {1}' -f $attempt, $ServiceRetries)

    if ($nssm) {
      & $nssm.Source stop $ServiceName | Out-Host
    } else {
      Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    }

    Start-Sleep -Seconds $ServiceRetryWaitSeconds
    $service = Get-JivoService

    if ($service.Status -eq 'Stopped') {
      Write-Host 'Service stopped.'
      return
    }
  }

  throw ('Service did not stop. Current state: ' + (Get-JivoService).Status)
}

function Start-JivoService {
  Write-Section ('Starting service ' + $ServiceName)

  $service = Get-JivoService
  if ($service.Status -eq 'Running') {
    Write-Host 'Service is already running.'
    return
  }

  $nssm = Get-Command nssm.exe -ErrorAction SilentlyContinue
  for ($attempt = 1; $attempt -le $ServiceRetries; $attempt++) {
    Write-Host ('Start attempt {0} of {1}' -f $attempt, $ServiceRetries)

    if ($nssm) {
      & $nssm.Source start $ServiceName | Out-Host
    } else {
      Start-Service -Name $ServiceName -ErrorAction SilentlyContinue
    }

    Start-Sleep -Seconds $ServiceRetryWaitSeconds
    $service = Get-JivoService

    if ($service.Status -eq 'Running') {
      Write-Host 'Service is running.'
      return
    }
  }

  throw ('Service did not start. Current state: ' + (Get-JivoService).Status)
}

function Stop-AppProcessesUsingPath {
  param([string] $Path)

  Write-Section ('Checking for processes using ' + $Path)

  $escapedPath = [regex]::Escape($Path)
  for ($attempt = 1; $attempt -le 6; $attempt++) {
    $processes = @(Get-CimInstance Win32_Process | Where-Object {
      $_.ProcessId -ne $PID -and (
        ($_.ExecutablePath -and $_.ExecutablePath -match ('^' + $escapedPath)) -or
        ($_.CommandLine -and $_.CommandLine -match $escapedPath)
      )
    })

    if ($processes.Count -eq 0) {
      Write-Host 'No leftover app processes found.'
      return
    }

    Write-Host ('Found {0} process(es) still using the app folder.' -f $processes.Count)
    foreach ($process in $processes) {
      Write-Host ('PID {0}: {1}' -f $process.ProcessId, $process.Name)
    }

    if ($attempt -lt 4) {
      Start-Sleep -Seconds 3
      continue
    }

    Write-Host 'Terminating leftover app processes after service stop.'
    foreach ($process in $processes) {
      try {
        Invoke-CimMethod -InputObject $process -MethodName Terminate | Out-Null
      } catch {
        Write-Host ('Could not terminate PID {0}: {1}' -f $process.ProcessId, $_.Exception.Message)
      }
    }

    Start-Sleep -Seconds 2
  }

  $remaining = @(Get-CimInstance Win32_Process | Where-Object {
    $_.ProcessId -ne $PID -and (
      ($_.ExecutablePath -and $_.ExecutablePath -match ('^' + $escapedPath)) -or
      ($_.CommandLine -and $_.CommandLine -match $escapedPath)
    )
  })

  if ($remaining.Count -gt 0) {
    throw ('Processes are still using the live app folder after service stop: ' + (($remaining | ForEach-Object { $_.ProcessId }) -join ', '))
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

  throw 'Health check failed after service start.'
}

function Restore-OldRelease {
  param(
    [bool] $LiveMoved,
    [bool] $NewMoved
  )

  Write-Section 'Restoring old release'

  try {
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($service -and $service.Status -ne 'Stopped') {
      Stop-JivoService
    }
  } catch {
    Write-Host ('Service stop during rollback warning: ' + $_.Exception.Message)
  }

  Set-Location -LiteralPath $ProjectRoot

  if (-not $LiveMoved -and -not $NewMoved -and (Test-Path -LiteralPath $AppPath)) {
    Write-Host 'Live folder was never moved. Starting the existing release again.'
    Start-JivoService
    Test-Health
    Write-Host 'Existing release is running again.'
    return
  }

  if ($NewMoved -and (Test-Path -LiteralPath $AppPath)) {
    Remove-FolderIfExists -Path $FailedPath
    Rename-Item -LiteralPath $AppPath -NewName ($AppName + '.failed')
    Write-Host ('Failed new release moved to: ' + $FailedPath)
  }

  if ($LiveMoved -and (Test-Path -LiteralPath $RollbackPath)) {
    if (Test-Path -LiteralPath $AppPath) {
      Remove-FolderIfExists -Path $AppPath
    }

    Rename-Item -LiteralPath $RollbackPath -NewName $AppName
    Write-Host 'Previous live folder restored from rollback folder.'
  } elseif (Test-Path -LiteralPath $BackupPath) {
    Write-Host 'Rollback folder is missing. Restoring from timestamped backup.'
    Remove-FolderIfExists -Path $AppPath
    New-Item -ItemType Directory -Force -Path $AppPath | Out-Null

    Invoke-Robocopy `
      -Label 'Restoring timestamped backup' `
      -Source $BackupPath `
      -Destination $AppPath `
      -Arguments @('/MIR', '/COPY:DAT', '/DCOPY:DAT', '/XJ', ('/R:{0}' -f $RobocopyRetries), ('/W:{0}' -f $RobocopyWaitSeconds), '/NP')
  } else {
    Write-Host 'No rollback folder or timestamped backup was available.'
  }

  Start-JivoService
  Test-Health
  Write-Host 'Old release is running again.'
}

Start-Transcript -Path $LogFile -Append | Out-Null

$liveMoved = $false
$newMoved = $false
$serviceWasTouched = $false

try {
  Write-Section 'Deploy started'
  Write-Host ('Log file: ' + $LogFile)
  Write-Host ('Backup path: ' + $BackupPath)

  if (-not (Test-IsAdministrator)) {
    throw 'This deploy must run as Administrator because service commands require elevated permissions.'
  }

  Assert-Command 'git.exe'
  Assert-Command 'npm.cmd'
  Assert-Command 'robocopy.exe'
  Get-JivoService | Out-Null

  if (-not (Test-Path -LiteralPath $AppPath)) {
    throw ('Live app folder does not exist: ' + $AppPath)
  }

  Set-Location -LiteralPath $AppPath

  $trackedChanges = (& git status --porcelain --untracked-files=no)
  if ($trackedChanges) {
    throw ('Server working tree has tracked changes. Refusing deploy to avoid overwriting: ' + ($trackedChanges -join '; '))
  }

  Ensure-OriginRemote

  $originUrl = (& git config --get remote.origin.url).Trim()
  if ([string]::IsNullOrWhiteSpace($originUrl)) {
    throw 'Unable to read git remote origin URL.'
  }

  Invoke-Step 'Fetch origin/main' 'git.exe' @('fetch', 'origin', $DeployBranch)
  $targetCommit = (& git rev-parse ('origin/' + $DeployBranch)).Trim()
  if ([string]::IsNullOrWhiteSpace($targetCommit)) {
    throw ('Unable to resolve origin/' + $DeployBranch)
  }

  Write-Host ('Target commit: ' + $targetCommit)

  Remove-FolderIfExists -Path $ReleasePath

  Invoke-Step 'Clone origin/main to isolated release folder' 'git.exe' @('clone', '--no-checkout', $originUrl, $ReleasePath)

  Set-Location -LiteralPath $ReleasePath
  Invoke-Step 'Fetch target branch in release folder' 'git.exe' @('fetch', 'origin', $DeployBranch)
  Invoke-Step 'Checkout target commit in release folder' 'git.exe' @('checkout', '--detach', $targetCommit)

  Copy-ServerFilesToRelease

  $packageLockPath = Join-Path $ReleasePath 'package-lock.json'
  if (-not (Test-Path -LiteralPath $packageLockPath)) {
    throw 'package-lock.json is required for npm ci. Lock-file creation is intentionally skipped.'
  }

  $packageLockRaw = Get-Content -LiteralPath $packageLockPath -Raw
  $lockfileVersionMatch = [regex]::Match($packageLockRaw, '"lockfileVersion"\s*:\s*(\d+)')
  if (-not $lockfileVersionMatch.Success) {
    throw 'package-lock.json exists but lockfileVersion is missing.'
  }

  Write-Host ('package-lock.json lockfileVersion: ' + $lockfileVersionMatch.Groups[1].Value)

  Invoke-Step 'Install dependencies from package-lock.json' 'npm.cmd' @('ci')
  Invoke-Step 'Build new release' 'npm.cmd' @('run', 'build')

  Copy-PersistentFoldersToRelease
  Backup-LiveDeployment
  Copy-BackupsToRelease

  Write-Section 'Swapping release'
  Set-Location -LiteralPath $ProjectRoot
  Remove-FolderIfExists -Path $RollbackPath
  Remove-FolderIfExists -Path $FailedPath

  $serviceWasTouched = $true
  Stop-JivoService
  Stop-AppProcessesUsingPath -Path $AppPath

  Rename-Item -LiteralPath $AppPath -NewName ($AppName + '.rollback')
  $liveMoved = $true

  Rename-Item -LiteralPath $ReleasePath -NewName $AppName
  $newMoved = $true

  Start-JivoService
  Test-Health

  Write-Section 'Deployment completed'
  Write-Host ('New release is live: ' + $targetCommit)
  Write-Host ('Timestamped backup kept at: ' + $BackupPath)

  Remove-FolderIfExists -Path $RollbackPath
} catch {
  Write-Host ''
  Write-Host ('DEPLOY FAILED: ' + $_.Exception.Message)

  if ($serviceWasTouched -or $liveMoved -or $newMoved) {
    Restore-OldRelease -LiveMoved $liveMoved -NewMoved $newMoved
  } else {
    Write-Host 'Live service was not touched. Current site should still be running.'
  }

  throw
} finally {
  try {
    Stop-Transcript | Out-Null
  } catch {
    Write-Host ('Transcript stop warning: ' + $_.Exception.Message)
  }

  Write-Host ('Deploy log saved to: ' + $LogFile)
}
