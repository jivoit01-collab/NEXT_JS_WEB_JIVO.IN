<#
.SYNOPSIS
  Regenerates the -EncodedCommand payloads embedded in the deploy workflows.

.DESCRIPTION
  Reads scripts/ci/bootstrap-deploy.ps1, substitutes the per-environment
  placeholders, encodes the result as UTF-16LE base64 (what
  `powershell.exe -EncodedCommand` expects) and rewrites the `script:` line in
  both workflow files in place.

  Run this after ANY edit to bootstrap-deploy.ps1, then commit both the source
  and the regenerated workflows together.

.EXAMPLE
  ./scripts/ci/build-bootstrap-payload.ps1
  ./scripts/ci/build-bootstrap-payload.ps1 -Check   # CI-friendly: verify only
#>

[CmdletBinding()]
param(
  # Verify the committed workflows match the current source without writing.
  # Exits non-zero when they are out of date.
  [switch] $Check
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$template = Join-Path $PSScriptRoot 'bootstrap-deploy.ps1'

if (-not (Test-Path -LiteralPath $template -PathType Leaf)) {
  throw ('Bootstrap source not found: ' + $template)
}

$source = [System.IO.File]::ReadAllText($template)

# Strip the leading <# .. #> documentation block. It explains the design for
# maintainers reading the repo; shipping it would roughly double the size of
# every base64 payload for zero runtime benefit.
$source = [regex]::Replace($source, '(?s)\A\s*<#.*?#>\s*', '')

$environments = @(
  @{
    Workflow    = 'deploy-production.yml'
    AppPath     = 'C:\LiveProjects\JIVO_WEBSITE\NEXT_JS_WEB_JIVO.IN_LIVE'
    ScriptDir   = 'C:\LiveProjects\JIVO_WEBSITE\Deploy\Production'
    Branch      = 'main'
    Environment = 'Production'
  },
  @{
    Workflow    = 'deploy-testing.yml'
    AppPath     = 'C:\LiveProjects\JIVO_WEBSITE\NEXT_JS_WEB_JIVO.IN_TEST'
    ScriptDir   = 'C:\LiveProjects\JIVO_WEBSITE\Deploy\Testing'
    Branch      = 'testing'
    Environment = 'Testing'
  }
)

$stale = @()

foreach ($envConfig in $environments) {
  $rendered = $source.
    Replace('__APPPATH__', $envConfig.AppPath).
    Replace('__SCRIPTDIR__', $envConfig.ScriptDir).
    Replace('__BRANCH__', $envConfig.Branch).
    Replace('__ENVIRONMENT__', $envConfig.Environment)

  if ($rendered -match '__[A-Z]+__') {
    throw ('Unsubstituted placeholder left in payload for ' + $envConfig.Environment)
  }

  $payload = [Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes($rendered))

  # Round-trip guard: a corrupted payload must never reach a workflow.
  $decoded = [System.Text.Encoding]::Unicode.GetString([Convert]::FromBase64String($payload))
  if ($decoded -ne $rendered) {
    throw ('Base64 round-trip verification failed for ' + $envConfig.Environment)
  }

  $workflowPath = Join-Path $repoRoot (Join-Path '.github\workflows' $envConfig.Workflow)
  if (-not (Test-Path -LiteralPath $workflowPath -PathType Leaf)) {
    throw ('Workflow not found: ' + $workflowPath)
  }

  $indent = '            '
  $newLine = $indent + 'powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand ' + $payload

  $lines = [System.IO.File]::ReadAllText($workflowPath) -split "`r?`n"

  # Match ONLY the real payload line: an indented `powershell.exe ...` command.
  # A looser match on 'EncodedCommand' would also hit the explanatory comments
  # above the `script:` block and corrupt the file.
  $targets = @()
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^\s*powershell\.exe .*-EncodedCommand\s+[A-Za-z0-9+/=]+\s*$') {
      $targets += $i
    }
  }

  if ($targets.Count -ne 1) {
    throw (
      'Expected exactly one -EncodedCommand payload line in ' + $envConfig.Workflow +
      ' but found ' + $targets.Count + '. Refusing to edit.'
    )
  }

  $index = $targets[0]
  if ($lines[$index] -eq $newLine) {
    Write-Host ('Up to date: ' + $envConfig.Workflow)
    continue
  }
  $lines[$index] = $newLine

  if ($Check) {
    $stale += $envConfig.Workflow
    continue
  }

  # LF endings and no BOM: GitHub Actions YAML is parsed on Linux.
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($workflowPath, ($lines -join "`n"), $utf8NoBom)
  Write-Host ('Regenerated: ' + $envConfig.Workflow + ' (' + $payload.Length + ' base64 chars)')
}

if ($Check -and $stale.Count -gt 0) {
  throw (
    'Workflow payloads are out of date with bootstrap-deploy.ps1: ' +
    ($stale -join ', ') + '. Run ./scripts/ci/build-bootstrap-payload.ps1 and commit the result.'
  )
}
