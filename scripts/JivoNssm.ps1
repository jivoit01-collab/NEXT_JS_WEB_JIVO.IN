<#
.SYNOPSIS
  Shared NSSM discovery helper for the Jivo deployment scripts.

.DESCRIPTION
  Dot-sourced by both scripts/setup-jivo-environments.ps1 and
  scripts/deploy-jivo-windows.ps1 so the lookup rules live in exactly one place:

    Get-JivoNssmPath   -> full path to nssm.exe, or $null when it cannot be found
    Get-JivoNssmError  -> the message to print when it cannot be found

  This file only LOCATES nssm.exe. It never registers, starts, stops or restarts
  anything — every deployment decision stays in the calling script.
#>

# Locations checked when nssm.exe is not on PATH. Ordered most-likely-first.
# NSSM ships as a plain zip, so it is commonly unzipped straight to C:\ and never
# added to PATH — that layout (C:\nssm-<version>\win64\nssm.exe) is checked
# explicitly, and also probed with a wildcard so a different NSSM version still
# resolves without editing this list.
$script:JivoNssmCandidatePaths = @(
  'C:\nssm-2.24\win64\nssm.exe',
  'C:\Program Files\nssm\win64\nssm.exe',
  'C:\Program Files (x86)\nssm\win64\nssm.exe',
  'C:\nssm-2.24\win32\nssm.exe',
  'C:\Program Files\nssm\win32\nssm.exe',
  'C:\Program Files (x86)\nssm\win32\nssm.exe',
  'C:\nssm\win64\nssm.exe',
  'C:\nssm\nssm.exe',
  'C:\Tools\nssm\win64\nssm.exe'
)

# Wildcard probes, tried after the exact list above. These catch other NSSM
# versions (nssm-2.25, nssm-2.24-101-g897c7ad, ...) without hardcoding them.
$script:JivoNssmGlobPaths = @(
  'C:\nssm-*\win64\nssm.exe',
  'C:\Program Files\nssm-*\win64\nssm.exe',
  'C:\Program Files (x86)\nssm-*\win64\nssm.exe',
  'C:\nssm-*\win32\nssm.exe'
)

function Get-JivoNssmPath {
  <#
  .SYNOPSIS
    Returns the full path to nssm.exe, or $null when NSSM cannot be located.

  .DESCRIPTION
    Detection order:
      1. Get-Command nssm.exe  (PATH — unchanged from the original behaviour)
      2. The known install locations in $script:JivoNssmCandidatePaths
      3. Wildcard probes for other NSSM versions in the same locations
      4. The NSSM_HOME / NSSM_PATH environment variables, if set

    Always returns a plain string path (never a CommandInfo), so callers can use
    the result directly with the call operator: & $nssm restart <service>.
  #>
  [CmdletBinding()]
  param(
    # Print each location as it is checked. Off by default so normal deploy logs
    # stay unchanged when NSSM is found on PATH.
    [switch] $Verbose_Probe
  )

  # 1. PATH first — this is the original behaviour and stays authoritative.
  $onPath = Get-Command nssm.exe -ErrorAction SilentlyContinue
  if ($onPath) {
    if ($Verbose_Probe) { Write-Host ('    nssm.exe found on PATH: ' + $onPath.Source) }
    return $onPath.Source
  }

  # 2. Known install locations.
  foreach ($candidate in $script:JivoNssmCandidatePaths) {
    if ($Verbose_Probe) { Write-Host ('    checking ' + $candidate) }
    if (Test-Path -LiteralPath $candidate -PathType Leaf) {
      Write-Host ('    nssm.exe not on PATH - using ' + $candidate)
      return $candidate
    }
  }

  # 3. Wildcard probes for other NSSM versions.
  foreach ($glob in $script:JivoNssmGlobPaths) {
    if ($Verbose_Probe) { Write-Host ('    checking ' + $glob) }
    $match = Get-ChildItem -Path $glob -File -ErrorAction SilentlyContinue |
      Sort-Object FullName -Descending |
      Select-Object -First 1
    if ($match) {
      Write-Host ('    nssm.exe not on PATH - using ' + $match.FullName)
      return $match.FullName
    }
  }

  # 4. Environment-variable overrides, so an unusual install can be pointed at
  #    without editing this script. Accepts either the exe itself or its folder.
  foreach ($envName in @('NSSM_HOME', 'NSSM_PATH')) {
    $envValue = [Environment]::GetEnvironmentVariable($envName)
    if ([string]::IsNullOrWhiteSpace($envValue)) { continue }

    $fromEnv = if ($envValue -like '*.exe') { $envValue } else { Join-Path $envValue 'nssm.exe' }
    if (Test-Path -LiteralPath $fromEnv -PathType Leaf) {
      Write-Host ('    nssm.exe resolved from $env:' + $envName + ': ' + $fromEnv)
      return $fromEnv
    }
  }

  return $null
}

function Get-JivoNssmError {
  <#
  .SYNOPSIS
    The message to show when Get-JivoNssmPath returned $null.
  #>
  [CmdletBinding()]
  param()

  $lines = @(
    'nssm.exe could not be found. NSSM is either not installed or not accessible to this account.',
    'Searched, in order:',
    '  1. the system PATH (Get-Command nssm.exe)'
  )

  $n = 2
  foreach ($candidate in $script:JivoNssmCandidatePaths) {
    $lines += ('  {0}. {1}' -f $n, $candidate)
    $n++
  }
  foreach ($glob in $script:JivoNssmGlobPaths) {
    $lines += ('  {0}. {1}' -f $n, $glob)
    $n++
  }
  $lines += ('  {0}. $env:NSSM_HOME / $env:NSSM_PATH' -f $n)

  $lines += ''
  $lines += 'Fix it by doing ONE of the following:'
  $lines += '  - Install NSSM to one of the locations above (e.g. unzip to C:\nssm-2.24), or'
  $lines += '  - Add the folder containing nssm.exe to the system PATH, or'
  $lines += '  - Set NSSM_HOME to the folder containing nssm.exe (setx /M NSSM_HOME "C:\nssm-2.24\win64").'

  return ($lines -join [Environment]::NewLine)
}
