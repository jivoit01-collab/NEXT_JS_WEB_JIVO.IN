<#
.SYNOPSIS
  Shared console-logging helpers for the Jivo deployment scripts.

.DESCRIPTION
  Dot-sourced by scripts/ci/bootstrap-deploy.ps1 and
  scripts/deploy-jivo-windows.ps1 so both produce identically formatted output
  in the GitHub Actions log.

  This file only FORMATS output. It never makes a deployment decision, never
  touches git, npm, NSSM or the service, and never changes an exit code.

  Everything written here goes to the PowerShell *information/host* stream,
  which is captured by Start-Transcript AND inherited by the SSH session, so a
  single Write-Host reaches both the on-server transcript and the GitHub
  Actions log. No output is suppressed or duplicated.

.NOTES
  Encoding: Initialize-JivoConsole forces [Console]::OutputEncoding to UTF-8.
  Without it, an OpenSSH session running under code page 437/1252 renders the
  check mark as "?" and box-drawing characters as garbage (verified). Forcing
  UTF-8 makes the symbols render correctly under every code page.
#>

# Step counter state. Set once by Initialize-JivoConsole, then advanced by
# Write-JivoStep so numbering ("[3/10]") stays consistent across the run.
$script:JivoStepIndex = 0
$script:JivoStepTotal = 0

# Label of the step currently in progress. Read by the failure report so it can
# name the step even when the failure was not an external command.
$script:JivoCurrentStep = $null

function Initialize-JivoConsole {
  <#
  .SYNOPSIS
    Prepares the console for UTF-8 output and sets the total step count.
  #>
  param(
    [int] $TotalSteps = 0
  )

  $script:JivoStepIndex = 0
  $script:JivoStepTotal = $TotalSteps

  # UTF-8 so the status symbols survive a legacy-code-page SSH session.
  # Wrapped in try/catch: this is cosmetic, and a console that refuses the
  # change must never be able to fail a deployment.
  try {
    [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
  } catch {
    # Non-fatal by design.
  }
}

function Get-JivoTimestamp {
  return (Get-Date -Format 'HH:mm:ss')
}

function Get-JivoCurrentStep {
  <#
  .SYNOPSIS
    The label of the step currently in progress, or $null before the first one.
  #>
  return $script:JivoCurrentStep
}

function Write-JivoBanner {
  <#
  .SYNOPSIS
    The framed header/footer block.
  #>
  param(
    [string] $Title,
    [hashtable] $Fields = @{},
    [string[]] $FieldOrder = @(),
    [string] $Color = 'Cyan'
  )

  $rule = '=' * 52
  Write-Host ''
  Write-Host $rule -ForegroundColor $Color
  Write-Host $Title -ForegroundColor $Color

  $keys = @(if ($FieldOrder.Count) { $FieldOrder } else { $Fields.Keys })

  # Pad labels to the widest one actually present (minimum 12) so columns line
  # up whether the field is "Branch" or "Previous HEAD".
  $width = 12
  foreach ($key in $keys) {
    if ($Fields.ContainsKey($key) -and $key.Length -gt $width) { $width = $key.Length }
  }

  foreach ($key in $keys) {
    if (-not $Fields.ContainsKey($key)) { continue }
    Write-Host (('{0,-' + $width + '} : {1}') -f $key, $Fields[$key]) -ForegroundColor $Color
  }

  Write-Host $rule -ForegroundColor $Color
  Write-Host ''
}

function Write-JivoStageComplete {
  <#
  .SYNOPSIS
    The per-stage completion marker: "OK Repository Updated".

  .DESCRIPTION
    Deliberately distinct from Write-JivoOk (which confirms a single command).
    This marks a whole deployment STAGE as finished, so the GitHub Actions log
    can be skimmed for the stage sequence alone.
  #>
  param([string] $Stage)

  Write-Host ([char]0x2713 + ' ' + $Stage) -ForegroundColor Green
}

function Write-JivoStep {
  <#
  .SYNOPSIS
    Starts a numbered step: "[4/10] 12:31:07  Pulling Latest Commit..."
  #>
  param([string] $Message)

  $script:JivoCurrentStep = $Message
  $script:JivoStepIndex++

  # Never print "[12/11]". Extra steps happen legitimately: a conditional branch
  # switch, or the rollback path re-running install/build. Widening the
  # denominator keeps the counter honest instead of showing an impossible ratio.
  if ($script:JivoStepIndex -gt $script:JivoStepTotal) {
    $script:JivoStepTotal = $script:JivoStepIndex
  }

  $prefix = if ($script:JivoStepTotal -gt 0) {
    '[{0}/{1}]' -f $script:JivoStepIndex, $script:JivoStepTotal
  } else {
    '[{0}]' -f $script:JivoStepIndex
  }

  Write-Host ''
  Write-Host ('{0} {1}  {2}...' -f $prefix, (Get-JivoTimestamp), $Message) -ForegroundColor Cyan
}

function Write-JivoOk {
  param([string] $Message)
  Write-Host ([char]0x2714 + ' ' + $Message) -ForegroundColor Green
}

function Write-JivoWarn {
  param([string] $Message)
  Write-Host ('! ' + $Message) -ForegroundColor Yellow
}

function Write-JivoFail {
  param([string] $Message)
  Write-Host ([char]0x2718 + ' ' + $Message) -ForegroundColor Red
}

function Write-JivoInfo {
  param([string] $Message)
  Write-Host $Message
}

function Write-JivoCommand {
  <#
  .SYNOPSIS
    Echoes the exact command about to run, so the log shows what produced the
    output that follows.
  #>
  param([string] $CommandLine)

  Write-Host 'Running:' -ForegroundColor DarkGray
  Write-Host ('  ' + $CommandLine) -ForegroundColor DarkGray
  Write-Host ''
}

function Get-JivoToolVersion {
  <#
  .SYNOPSIS
    Version string for an external tool (node, npm), or '(not found)'.

  .DESCRIPTION
    DIAGNOSTIC ONLY -- must never be able to fail a deployment. Two hazards are
    handled explicitly:

      1. A missing executable throws CommandNotFoundException under
         $ErrorActionPreference = 'Stop'. Caught and reported as '(not found)'.
      2. Any external call sets $LASTEXITCODE. A failing probe would leave a
         non-zero value behind, and the NEXT Invoke-Step would read it and
         report a healthy step as failed. The previous value is saved and
         restored so this function is invisible to the deployment.
  #>
  param(
    [string] $Command,
    [string[]] $Arguments = @('--version')
  )

  $previousExitCode = $global:LASTEXITCODE
  try {
    $raw = & $Command @Arguments 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $raw) { return '(not found)' }
    return (($raw | Select-Object -First 1) | Out-String).Trim()
  } catch {
    return '(not found)'
  } finally {
    $global:LASTEXITCODE = $previousExitCode
  }
}

function Get-JivoPackageVersion {
  <#
  .SYNOPSIS
    A dependency's version from package.json, or '(unknown)'.

  .DESCRIPTION
    Reads the file directly instead of shelling out to npm: no external process,
    no $LASTEXITCODE to protect, and it works even when node_modules is absent.
    Never throws -- diagnostics must not affect a deployment.
  #>
  param(
    [string] $PackageJsonPath,
    [string] $DependencyName
  )

  try {
    if (-not (Test-Path -LiteralPath $PackageJsonPath -PathType Leaf)) { return '(unknown)' }
    $json = Get-Content -LiteralPath $PackageJsonPath -Raw | ConvertFrom-Json
    foreach ($section in @('dependencies', 'devDependencies')) {
      $bag = $json.$section
      if ($bag -and $bag.PSObject.Properties.Name -contains $DependencyName) {
        return [string] $bag.$DependencyName
      }
    }
    return '(unknown)'
  } catch {
    return '(unknown)'
  }
}

function Format-JivoDuration {
  <#
  .SYNOPSIS
    Formats a TimeSpan as "1m 42s" (or "2h 3m 4s" for long runs).
  #>
  param([TimeSpan] $Duration)

  # Zero-padded so successive deploy summaries line up when compared.
  if ($Duration.TotalHours -ge 1) {
    return ('{0:00}h {1:00}m {2:00}s' -f [int]$Duration.TotalHours, $Duration.Minutes, $Duration.Seconds)
  }
  if ($Duration.TotalMinutes -ge 1) {
    return ('{0:00}m {1:00}s' -f [int]$Duration.TotalMinutes, $Duration.Seconds)
  }
  return ('{0:00}s' -f [int]$Duration.TotalSeconds)
}
