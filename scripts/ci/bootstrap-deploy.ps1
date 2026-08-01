<#
.SYNOPSIS
  Server-side bootstrap: refreshes the deploy scripts to the exact commit being
  deployed, then hands off to deploy-jivo-windows.ps1.

.DESCRIPTION
  Invoked by .github/workflows/deploy-production.yml and deploy-testing.yml with
  -File (never -EncodedCommand), so the remote command line stays a short, fixed
  length no matter how large this script grows.

  Steps:
    1. validate the app folder exists and is a git working copy
    2. fetch the branch
    3. extract scripts/ from origin/<branch> into an isolated per-environment
       folder, byte-for-byte (preserving UTF-8)
    4. invoke deploy-jivo-windows.ps1 and propagate its exit code

  This script only STAGES the deploy. Every deployment decision -- build,
  restart, rollback, health check, mutex, logging -- lives in
  deploy-jivo-windows.ps1 and is untouched by this file.

.EXAMPLE
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File bootstrap-deploy.ps1 `
    -AppPath 'C:\LiveProjects\JIVO_WEBSITE\NEXT_JS_WEB_JIVO.IN_LIVE' `
    -ScriptDir 'C:\LiveProjects\JIVO_WEBSITE\Deploy\Production' `
    -Branch main -Environment Production
#>

[CmdletBinding()]
param(
  # Deployment folder (git working copy) for this environment.
  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string] $AppPath,

  # Per-environment folder that receives the extracted scripts/ tree. Must be
  # distinct per environment so Production and Testing never share files.
  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string] $ScriptDir,

  # Git branch this environment deploys from.
  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string] $Branch,

  # Passed straight through to deploy-jivo-windows.ps1 -Environment.
  [Parameter(Mandatory = $true)]
  [ValidateSet('Production', 'Testing')]
  [string] $Environment
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Local aliases keep the body below byte-for-byte identical to the previous
# version, which was verified end-to-end.
$appPath = $AppPath
$scriptDir = $ScriptDir
$branch = $Branch
$environment = $Environment

# UTF-8 console so status symbols survive a legacy-code-page SSH session. The
# shared logging module is not available yet (it arrives with the extraction
# below), so this mirrors Initialize-JivoConsole inline.
try {
  [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
} catch {
  # Cosmetic only - never fail a deploy over console encoding.
}

Write-Host ''
Write-Host ('=' * 52) -ForegroundColor Cyan
Write-Host 'JIVO DEPLOYMENT BOOTSTRAP' -ForegroundColor Cyan
Write-Host ('{0,-12}: {1}' -f 'Environment', $environment) -ForegroundColor Cyan
Write-Host ('{0,-12}: {1}' -f 'Branch', $branch) -ForegroundColor Cyan
Write-Host ('{0,-12}: {1}' -f 'App path', $appPath) -ForegroundColor Cyan
Write-Host ('{0,-12}: {1}' -f 'Script dir', $scriptDir) -ForegroundColor Cyan
Write-Host ('{0,-12}: {1}' -f 'Started', (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) -ForegroundColor Cyan
Write-Host ('=' * 52) -ForegroundColor Cyan
Write-Host ''

Write-Host ('[bootstrap] ' + (Get-Date -Format 'HH:mm:ss') + '  Validating deployment folder...') -ForegroundColor Cyan
if (-not (Test-Path -LiteralPath $appPath -PathType Container)) {
  throw ('Deployment folder does not exist: ' + $appPath)
}

Set-Location -LiteralPath $appPath

& git rev-parse --is-inside-work-tree 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw ($appPath + ' is not a git working copy. Refusing to deploy.')
}
Write-Host ([char]0x2714 + ' Git working copy OK') -ForegroundColor Green

Write-Host ''
Write-Host ('[bootstrap] ' + (Get-Date -Format 'HH:mm:ss') + '  Fetching deploy scripts...') -ForegroundColor Cyan
Write-Host ('  git fetch --prune origin ' + $branch) -ForegroundColor DarkGray
& git fetch --prune origin $branch
if ($LASTEXITCODE -ne 0) {
  throw ('git fetch origin ' + $branch + ' failed with exit code ' + $LASTEXITCODE)
}

if (-not (Test-Path -LiteralPath $scriptDir -PathType Container)) {
  New-Item -ItemType Directory -Force -Path $scriptDir | Out-Null
}

# Extract the deploy scripts at the exact commit being deployed, byte-for-byte.
#
# Why not `git show <rev>:file > out.ps1`? Two bugs:
#   1. cmd.exe redirection writes the UTF-8 bytes with NO BOM. PowerShell 5.1
#      reads BOM-less files as ANSI (cp1252), so every non-ASCII character in
#      the script is silently corrupted (verified: em-dash -> mojibake).
#   2. It copies ONE file. deploy-jivo-windows.ps1 dot-sources JivoNssm.ps1 via
#      $PSScriptRoot, so a one-file copy dies instantly on a missing dependency.
#
# `git checkout --work-tree` writes real files with exact bytes and brings the
# whole scripts/ folder, fixing both.
#
# GIT_INDEX_FILE redirects the index write to a scratch file so this extraction
# can NEVER dirty the deployment working copy's real index -- which would make
# the deploy script's own dirty-tree guard fail on the next run.
$env:GIT_INDEX_FILE = Join-Path $scriptDir 'deploy-extract.index'
try {
  & git --work-tree=$scriptDir checkout ('origin/' + $branch) -- scripts
  $extractCode = $LASTEXITCODE
} finally {
  Remove-Item -LiteralPath $env:GIT_INDEX_FILE -Force -ErrorAction SilentlyContinue
  Remove-Item Env:\GIT_INDEX_FILE -ErrorAction SilentlyContinue
}
if ($extractCode -ne 0) {
  throw ('Failed to extract deploy scripts from origin/' + $branch + ' (exit code ' + $extractCode + ')')
}

$deployScript = Join-Path $scriptDir 'scripts\deploy-jivo-windows.ps1'
if (-not (Test-Path -LiteralPath $deployScript -PathType Leaf)) {
  throw ('Deploy script missing after extraction: ' + $deployScript)
}

# Ensure a UTF-8 BOM on every extracted .ps1.
#
# The repo files are BOM-less UTF-8. PowerShell 5.1 assumes ANSI (cp1252) for
# BOM-less files, so non-ASCII characters (em-dashes, arrows) in the deploy
# script decode as mojibake (an em-dash renders as two junk characters).
# Execution still succeeds,
# but every affected log line and error message is corrupted, which is exactly
# what you cannot afford when diagnosing a failed production deploy.
#
# Re-writing the bytes with a BOM makes the encoding explicit and unambiguous.
# Idempotent: files that already carry a BOM are left untouched.
$utf8Bom = New-Object System.Text.UTF8Encoding($true)
foreach ($ps1 in (Get-ChildItem -LiteralPath (Join-Path $scriptDir 'scripts') -Filter '*.ps1' -File)) {
  $bytes = [System.IO.File]::ReadAllBytes($ps1.FullName)
  if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    continue
  }
  $text = [System.Text.Encoding]::UTF8.GetString($bytes)
  [System.IO.File]::WriteAllText($ps1.FullName, $text, $utf8Bom)
}

Write-Host ([char]0x2714 + ' Deploy scripts extracted') -ForegroundColor Green
foreach ($ps1 in (Get-ChildItem -LiteralPath (Join-Path $scriptDir 'scripts') -Filter '*.ps1' -File)) {
  Write-Host ('    ' + $ps1.Name)
}

Write-Host ''
Write-Host ('[bootstrap] ' + (Get-Date -Format 'HH:mm:ss') + '  Handing off to deploy-jivo-windows.ps1') -ForegroundColor Cyan
Write-Host ('  ' + $deployScript + ' -Environment ' + $environment) -ForegroundColor DarkGray

# Child process inherits this console, so ALL of its stdout and stderr -- the
# banners, npm/Prisma/Next.js output, warnings and errors -- stream straight
# into the GitHub Actions log. Nothing is captured, filtered or redirected.
& powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $deployScript -Environment $environment
$deployExit = $LASTEXITCODE

Write-Host ''
if ($deployExit -eq 0) {
  Write-Host ([char]0x2714 + ' Bootstrap finished: deploy reported success') -ForegroundColor Green
} else {
  Write-Host ([char]0x2718 + ' Bootstrap finished: deploy FAILED with exit code ' + $deployExit) -ForegroundColor Red
}

# Propagate the deploy script's exit code verbatim so GitHub Actions fails.
exit $deployExit
