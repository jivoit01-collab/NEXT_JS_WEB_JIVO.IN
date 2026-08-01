<#
.SYNOPSIS
  SOURCE OF TRUTH for the -EncodedCommand payload embedded in
  .github/workflows/deploy-production.yml and deploy-testing.yml.

.DESCRIPTION
  The GitHub workflows cannot pass this as plain text: the remote shell is
  cmd.exe (the OpenSSH-on-Windows default), and any inline command is subject to
  cmd.exe quoting rules AND PowerShell quoting rules at the same time. Nested
  quotes, spaces in folder names, '%' and '^' all become escaping hazards.

  Instead the workflows send ONE base64 (UTF-16LE) -EncodedCommand payload.
  Base64 contains only [A-Za-z0-9+/=] -- no spaces, quotes, backslashes, carets
  or percent signs -- so it is structurally immune to both escaping layers.

  This bootstrap runs ON the server and does the minimum needed to reach the
  real deploy script at the correct commit:
    1. validate the app folder exists and is a git working copy
    2. fetch the branch
    3. extract scripts/ from origin/<branch> into an isolated per-environment
       folder, byte-for-byte (preserving UTF-8)
    4. invoke deploy-jivo-windows.ps1 and propagate its exit code

.NOTES
  DO NOT hand-edit the base64 in the workflows. Regenerate it:

    ./scripts/ci/build-bootstrap-payload.ps1

  Placeholders __APPPATH__ / __SCRIPTDIR__ / __BRANCH__ / __ENVIRONMENT__ are
  substituted by the generator, once per environment.
#>

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$appPath = '__APPPATH__'
$scriptDir = '__SCRIPTDIR__'
$branch = '__BRANCH__'
$environment = '__ENVIRONMENT__'

if (-not (Test-Path -LiteralPath $appPath -PathType Container)) {
  throw ('Deployment folder does not exist: ' + $appPath)
}

Set-Location -LiteralPath $appPath

& git rev-parse --is-inside-work-tree 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw ($appPath + ' is not a git working copy. Refusing to deploy.')
}

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
# script decode as mojibake -- e.g. "—" becomes "â€”". Execution still succeeds,
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

& powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File $deployScript -Environment $environment
exit $LASTEXITCODE
