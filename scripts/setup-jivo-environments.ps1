<#
.SYNOPSIS
  One-time migration from the single-environment deployment layout to the
  Production + Testing layout under C:\LiveProjects\JIVO_WEBSITE.

.DESCRIPTION
  Run ONCE on the Windows Server, as Administrator. It is idempotent — re-running
  it skips anything that already exists, so it is safe to run again after a
  partial failure.

  What it does:
    1. Creates the new folder tree.
    2. Moves the existing C:\LiveProjects\NEXT_JS_WEB_JIVO.IN working copy to
       ..._LIVE (a move, so git history and the untracked .env.production and
       node_modules come along).
    3. Clones the testing branch into ..._TEST.
    4. Registers the jivo-web-live and jivo-web-test NSSM services with their
       own ports, and removes the old jivo-web service.

  It deliberately does NOT copy .env.production into the TEST folder: testing
  must point at its own database and its own AUTH_URL. You create that file
  yourself (the script tells you when).

  TWO SUPPORTED WORKFLOWS
  -----------------------
  Normal — the script performs everything:

      setup-jivo-environments.ps1

  Recovery — the administrator has already stopped jivo-web, moved the app
  folder to _LIVE and cloned the testing branch into _TEST by hand, and wants
  the script to pick up from there:

      setup-jivo-environments.ps1 -SkipFolderMigration

  Both are safe to run repeatedly. Every step tests for its own result first, so
  a run that stops halfway can simply be started again — nothing is done twice.
  Before registering any service the script verifies that both application
  folders actually exist, so an incomplete manual migration is reported clearly
  instead of producing services that fail to start.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File setup-jivo-environments.ps1

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File setup-jivo-environments.ps1 -WhatIfOnly

.EXAMPLE
  # After migrating the folders by hand
  powershell -NoProfile -ExecutionPolicy Bypass -File setup-jivo-environments.ps1 -SkipFolderMigration
#>

[CmdletBinding()]
param(
  [string] $OldAppPath  = 'C:\LiveProjects\NEXT_JS_WEB_JIVO.IN',
  [string] $DeployRoot  = 'C:\LiveProjects\JIVO_WEBSITE',
  [string] $OldService  = 'jivo-web',
  [string] $RepoUrl     = 'https://github.com/jivoit01-collab/NEXT_JS_WEB_JIVO.IN.git',
  [int]    $LivePort    = 3001,
  [int]    $TestPort    = 3002,

  # Print the plan without changing anything.
  [switch] $WhatIfOnly,

  # Recovery mode for a MANUAL folder migration.
  #
  # When the administrator has already stopped jivo-web, moved/copied the app
  # folder to _LIVE and cloned the testing branch into _TEST by hand, this flag
  # tells the script to skip both folder-migration steps outright (no Move-Item,
  # no git clone) and carry on with service registration and the rest.
  #
  # Not normally needed: both steps already detect existing folders and skip
  # themselves. Use this when you want that skip to be explicit and guaranteed —
  # for example when _LIVE exists but you would rather the script never even
  # consider touching $OldAppPath.
  [switch] $SkipFolderMigration
)

$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Self-relocation bootstrap
# ---------------------------------------------------------------------------
# This script normally lives INSIDE the folder it is about to move
# (C:\LiveProjects\NEXT_JS_WEB_JIVO.IN\scripts\). On Windows a running script
# keeps a handle on its own file, and the shell's working directory keeps a
# handle on the folder, so Move-Item on the app root can fail with "being used
# by another process".
#
# Fix: when we detect that we are executing from inside $OldAppPath, copy
# ourselves to %TEMP%, re-launch there with the identical parameters, wait, and
# exit with the child's exit code. The copy is outside the moved tree, so
# nothing this script owns holds the folder open.
#
# Recursion is impossible: the child runs from %TEMP%, which is never inside
# $OldAppPath, so its own check below is false and it proceeds to migrate.
if (-not [System.IO.Path]::IsPathRooted($OldAppPath)) {
  throw ("-OldAppPath must be an absolute path (got '$OldAppPath').")
}

$selfPath    = $PSCommandPath
$oldAppFull  = [System.IO.Path]::GetFullPath($OldAppPath).TrimEnd('\') + '\'
$runningFrom = if ([string]::IsNullOrWhiteSpace($selfPath)) { '' } else { [System.IO.Path]::GetFullPath($selfPath) }

# Belt and braces: only relocate when we are inside the doomed folder AND we are
# not already the relocated copy. The second test matches THIS run's temp copy by
# full path rather than "anywhere under %TEMP%", so the guard still works if the
# app folder itself ever sits under %TEMP% (as it does in the test sandbox).
$tempScript  = Join-Path $env:TEMP 'setup-jivo-environments-temp.ps1'
$tempHelper  = Join-Path $env:TEMP 'JivoNssm.ps1'
$tempFull    = [System.IO.Path]::GetFullPath($tempScript)
$isInsideOld = $runningFrom -and $runningFrom.StartsWith($oldAppFull, [StringComparison]::OrdinalIgnoreCase)
$isTempCopy  = $runningFrom -and $runningFrom.Equals($tempFull, [StringComparison]::OrdinalIgnoreCase)

if ($isInsideOld -and -not $isTempCopy) {
  Write-Host ''
  Write-Host '==> Relocating this script out of the folder it is about to move'
  Write-Host ('    running from : ' + $runningFrom)
  Write-Host ('    inside       : ' + $OldAppPath)
  Write-Host ('    relocating to: ' + $tempScript)

  Copy-Item -LiteralPath $runningFrom -Destination $tempScript -Force

  # The relocated copy dot-sources JivoNssm.ps1 via $PSScriptRoot, which now
  # resolves to %TEMP% — so the helper has to travel with it.
  $helperSource = Join-Path (Split-Path -Parent $runningFrom) 'JivoNssm.ps1'
  if (Test-Path -LiteralPath $helperSource) {
    Copy-Item -LiteralPath $helperSource -Destination $tempHelper -Force
  }

  # Forward every parameter exactly as received. $PSBoundParameters holds only
  # what the caller actually passed, so unspecified parameters keep their
  # defaults in the child instead of being frozen here.
  $childArgs = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $tempScript)
  foreach ($entry in $PSBoundParameters.GetEnumerator()) {
    if ($entry.Value -is [switch]) {
      # powershell.exe -File passes every argument as a literal STRING, so the
      # '-Name:value' form ('-WhatIfOnly:$true' or even ':1') arrives as text and
      # fails to bind to a [switch]. Pass the bare flag instead, and omit it
      # entirely when the switch is off — which is exactly how a switch defaults.
      if ($entry.Value.IsPresent) { $childArgs += ('-' + $entry.Key) }
    } else {
      $childArgs += ('-' + $entry.Key)
      $childArgs += [string] $entry.Value
    }
  }

  try {
    # Run the child from a neutral directory. If the child inherited this
    # shell's working directory it would hold the very folder being moved.
    $child = Start-Process -FilePath 'powershell.exe' `
                           -ArgumentList $childArgs `
                           -WorkingDirectory ([System.IO.Path]::GetTempPath()) `
                           -NoNewWindow -Wait -PassThru
    $childExit = $child.ExitCode
  } finally {
    # Clean up the temporary copies once the child has exited.
    Remove-Item -LiteralPath $tempScript -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $tempHelper -Force -ErrorAction SilentlyContinue
  }

  Write-Host ''
  Write-Host ('==> Relocated run finished with exit code ' + $childExit)
  exit $childExit
}

# Shared NSSM discovery (Get-JivoNssmPath / Get-JivoNssmError). Lives next to
# this script so both deployment scripts use identical lookup rules.
. (Join-Path $PSScriptRoot 'JivoNssm.ps1')

# Anchor to absolute paths before anything is created, so folders can never be
# built relative to whatever the current directory happens to be.
foreach ($pathVar in @('OldAppPath', 'DeployRoot')) {
  $value = Get-Variable -Name $pathVar -ValueOnly
  if (-not [System.IO.Path]::IsPathRooted($value)) {
    throw ("-$pathVar must be an absolute path (got '$value').")
  }
  Set-Variable -Name $pathVar -Value ([System.IO.Path]::GetFullPath($value))
}

$LivePath = Join-Path $DeployRoot 'NEXT_JS_WEB_JIVO.IN_LIVE'
$TestPath = Join-Path $DeployRoot 'NEXT_JS_WEB_JIVO.IN_TEST'

# Guard against the classic migration mistake: pointing the new root INSIDE the
# old app folder (or vice versa). Moving a folder into its own subtree is what
# actually produces runaway nesting.
$oldNorm  = $OldAppPath.TrimEnd('\') + '\'
$rootNorm = $DeployRoot.TrimEnd('\') + '\'
if ($rootNorm.StartsWith($oldNorm, [StringComparison]::OrdinalIgnoreCase)) {
  throw ('DeployRoot (' + $DeployRoot + ') is inside OldAppPath (' + $OldAppPath + '). Moving a folder into itself would nest infinitely.')
}
if ($oldNorm.StartsWith($rootNorm, [StringComparison]::OrdinalIgnoreCase)) {
  throw ('OldAppPath (' + $OldAppPath + ') is inside DeployRoot (' + $DeployRoot + '). Use a DeployRoot outside the old app folder.')
}

function Step { param([string] $m) Write-Host ''; Write-Host ('==> ' + $m) }
function Skip { param([string] $m) Write-Host ('    [skip] ' + $m) }
function Did  { param([string] $m) Write-Host ('    [ok]   ' + $m) }

$identity  = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw 'Run this script from an elevated (Administrator) PowerShell.'
}

if ($WhatIfOnly) {
  Write-Host 'DRY RUN — nothing will be changed.'
}

# ---------------------------------------------------------------------------
Step 'Create folder tree'
$folders = @(
  $DeployRoot,
  (Join-Path $DeployRoot 'Logs\Production'),
  (Join-Path $DeployRoot 'Logs\Testing'),
  (Join-Path $DeployRoot 'Backups\Production'),
  (Join-Path $DeployRoot 'Backups\Testing'),
  (Join-Path $DeployRoot 'Deploy')
)
foreach ($f in $folders) {
  if (Test-Path -LiteralPath $f) { Skip $f; continue }
  if (-not $WhatIfOnly) { New-Item -ItemType Directory -Force -Path $f | Out-Null }
  Did $f
}

# ---------------------------------------------------------------------------
Step 'Stop the old service before moving files'
$old = Get-Service -Name $OldService -ErrorAction SilentlyContinue
if ($old -and $old.Status -ne 'Stopped') {
  if (-not $WhatIfOnly) { Stop-Service -Name $OldService -Force }
  Did ('stopped ' + $OldService)
} else {
  Skip ('service ' + $OldService + ' not present or already stopped')
}

# ---------------------------------------------------------------------------
Step 'Move existing working copy to _LIVE'
if ($SkipFolderMigration) {
  if (Test-Path -LiteralPath $LivePath) {
    Skip 'Live application already migrated.'
  } else {
    # Do not claim it is migrated when it plainly is not — the folder
    # verification step below turns this into a clear, actionable failure.
    Skip 'Move-Item skipped by -SkipFolderMigration (folder not found yet).'
  }
  Skip '-SkipFolderMigration was specified; Move-Item will not run.'
} elseif (Test-Path -LiteralPath $LivePath) {
  Skip 'Live application already migrated.'
  Skip ($LivePath + ' already exists')
} elseif (-not (Test-Path -LiteralPath $OldAppPath)) {
  Skip ($OldAppPath + ' not found — assuming already migrated')
} else {
  if (-not $WhatIfOnly) {
    try {
      Move-Item -LiteralPath $OldAppPath -Destination $LivePath
    } catch {
      throw (
        'Unable to move the application directory because it is currently in use by another process.' + [Environment]::NewLine +
        ('  from: ' + $OldAppPath) + [Environment]::NewLine +
        ('  to  : ' + $LivePath) + [Environment]::NewLine +
        ('  underlying error: ' + $_.Exception.Message) + [Environment]::NewLine +
        [Environment]::NewLine +
        'Release the folder, then run this script again:' + [Environment]::NewLine +
        '  - Close any VS Code / VS Code Remote session open on that folder.' + [Environment]::NewLine +
        '  - Close any Explorer window pointing at it.' + [Environment]::NewLine +
        '  - Close any terminal whose current directory is inside it.' + [Environment]::NewLine +
        '  - Stop any other process using the folder (node.exe from a stray "npm run dev",' + [Environment]::NewLine +
        '    a running jivo-web service, an antivirus or backup scan).' + [Environment]::NewLine +
        '  - Then retry the migration. This script is idempotent, so re-running is safe.'
      )
    }
  }
  Did ($OldAppPath + ' -> ' + $LivePath)
}

# ---------------------------------------------------------------------------
Step 'Clone testing branch into _TEST'
if ($SkipFolderMigration) {
  if (Test-Path -LiteralPath $TestPath) {
    Skip 'Testing clone already exists.'
  } else {
    Skip 'git clone skipped by -SkipFolderMigration (folder not found yet).'
  }
  Skip '-SkipFolderMigration was specified; git clone will not run.'
} elseif (Test-Path -LiteralPath $TestPath) {
  Skip 'Testing clone already exists.'
  Skip ($TestPath + ' already exists')
} else {
  if (-not $WhatIfOnly) {
    & git clone --branch testing $RepoUrl $TestPath
    if ($LASTEXITCODE -ne 0) {
      throw 'git clone of the testing branch failed. Create the "testing" branch on GitHub first (git push origin main:testing).'
    }
  }
  Did ($TestPath + ' cloned from ' + $RepoUrl + ' (branch: testing)')
}

# ---------------------------------------------------------------------------
# Verify the manual migration actually happened before anything is registered
# against these paths. A service whose AppDirectory does not exist installs
# without complaint and then fails at start time with an unhelpful error, so
# catching it here — while the operator is still watching — is far cheaper.
Step 'Verify application folders are present'
$missingFolders = @()
foreach ($check in @(
  @{ Label = 'Production (_LIVE)'; Path = $LivePath },
  @{ Label = 'Testing (_TEST)';    Path = $TestPath }
)) {
  if (Test-Path -LiteralPath $check.Path -PathType Container) {
    Did ($check.Label + ' -> ' + $check.Path)
  } else {
    $missingFolders += $check
    Write-Host ('    [MISSING] ' + $check.Label + ' -> ' + $check.Path)
  }
}

if ($missingFolders.Count -gt 0 -and -not $WhatIfOnly) {
  throw (
    'Cannot register services: ' + $missingFolders.Count + ' application folder(s) missing.' + [Environment]::NewLine +
    ($missingFolders | ForEach-Object { '  - ' + $_.Label + ': ' + $_.Path }) -join [Environment]::NewLine + [Environment]::NewLine +
    [Environment]::NewLine +
    'If you are migrating manually, complete these steps first:' + [Environment]::NewLine +
    ('  1. Stop the old service:  nssm stop ' + $OldService) + [Environment]::NewLine +
    ('  2. Move  ' + $OldAppPath + '  ->  ' + $LivePath) + [Environment]::NewLine +
    ('  3. Clone the testing branch into  ' + $TestPath + ':') + [Environment]::NewLine +
    ('       git clone --branch testing ' + $RepoUrl + ' "' + $TestPath + '"') + [Environment]::NewLine +
    [Environment]::NewLine +
    'Then re-run this script with -SkipFolderMigration.' + [Environment]::NewLine +
    'Alternatively, drop -SkipFolderMigration and let the script perform the migration itself.'
  )
}

# ---------------------------------------------------------------------------
Step 'Register NSSM services'
$nssm = Get-JivoNssmPath
if (-not $nssm) {
  Write-Host (Get-JivoNssmError)
  Write-Host ''
  Write-Host '    Skipping service registration. Install/expose NSSM, then re-run this'
  Write-Host '    script or register the services manually (see DEPLOYMENT.md).'
} else {
  $npm = (Get-Command npm.cmd -ErrorAction SilentlyContinue)
  if (-not $npm) { throw 'npm.cmd not found in PATH.' }

  $services = @(
    @{ Name = 'jivo-web-live'; Path = $LivePath; Port = $LivePort },
    @{ Name = 'jivo-web-test'; Path = $TestPath; Port = $TestPort }
  )

  foreach ($svc in $services) {
    $existing = Get-Service -Name $svc.Name -ErrorAction SilentlyContinue
    if ($existing) { Skip ('service ' + $svc.Name + ' already registered'); continue }
    if ($WhatIfOnly) { Did ('would register ' + $svc.Name + ' on port ' + $svc.Port); continue }

    & $nssm install $svc.Name $npm.Source 'run' 'start'
    & $nssm set $svc.Name AppDirectory $svc.Path
    & $nssm set $svc.Name AppEnvironmentExtra ('NODE_ENV=production') ('PORT=' + $svc.Port)
    & $nssm set $svc.Name AppStdout (Join-Path $svc.Path 'service-stdout.log')
    & $nssm set $svc.Name AppStderr (Join-Path $svc.Path 'service-stderr.log')
    & $nssm set $svc.Name AppRotateFiles 1
    & $nssm set $svc.Name Start SERVICE_AUTO_START
    Did ('registered ' + $svc.Name + ' -> ' + $svc.Path + ' on port ' + $svc.Port)
  }
}

# ---------------------------------------------------------------------------
Step 'Remove the old jivo-web service'
if ($old) {
  if ($WhatIfOnly) {
    Did ('would remove ' + $OldService)
  } elseif ($nssm) {
    & $nssm remove $OldService confirm
    Did ('removed ' + $OldService)
  } else {
    & sc.exe delete $OldService | Out-Null
    Did ('removed ' + $OldService + ' via sc.exe')
  }
} else {
  Skip ('service ' + $OldService + ' not present')
}

# ---------------------------------------------------------------------------
Step 'Remaining manual steps'
$testEnv = Join-Path $TestPath '.env.production'
if (-not (Test-Path -LiteralPath $testEnv)) {
  Write-Host ''
  Write-Host '  1. Create the TESTING env file (it is intentionally NOT copied from live):'
  Write-Host ('       ' + $testEnv)
  Write-Host '     It must use its OWN database, and:'
  Write-Host '       AUTH_URL=https://abc.jivo.in'
  Write-Host '       NEXT_PUBLIC_APP_URL=https://abc.jivo.in'
  Write-Host '       DATABASE_URL=postgresql://user:pass@localhost:5432/jivo_test'
}
Write-Host ''
Write-Host '  2. Build both apps once, then start the services:'
Write-Host ('       cd ' + $LivePath + ' ; npm install ; npm run build ; nssm start jivo-web-live')
Write-Host ('       cd ' + $TestPath + ' ; npm install ; npm run build ; nssm start jivo-web-test')
Write-Host ''
Write-Host '  3. Point the reverse proxy: jivo.in -> 127.0.0.1:3001, abc.jivo.in -> 127.0.0.1:3002'
Write-Host ''
Write-Host '  4. Verify:'
Write-Host ('       curl http://127.0.0.1:' + $LivePort + '/api/health')
Write-Host ('       curl http://127.0.0.1:' + $TestPort + '/api/health')
Write-Host ''
Write-Host 'Migration script finished.'
