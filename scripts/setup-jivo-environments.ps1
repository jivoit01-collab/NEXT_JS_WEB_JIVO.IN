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

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File setup-jivo-environments.ps1

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File setup-jivo-environments.ps1 -WhatIfOnly
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
  [switch] $WhatIfOnly
)

$ErrorActionPreference = 'Stop'

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
if (Test-Path -LiteralPath $LivePath) {
  Skip ($LivePath + ' already exists')
} elseif (-not (Test-Path -LiteralPath $OldAppPath)) {
  Skip ($OldAppPath + ' not found — assuming already migrated')
} else {
  if (-not $WhatIfOnly) { Move-Item -LiteralPath $OldAppPath -Destination $LivePath }
  Did ($OldAppPath + ' -> ' + $LivePath)
}

# ---------------------------------------------------------------------------
Step 'Clone testing branch into _TEST'
if (Test-Path -LiteralPath $TestPath) {
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
