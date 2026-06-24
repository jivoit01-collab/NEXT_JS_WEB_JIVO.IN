@echo off
setlocal EnableExtensions

title Jivo Manual Deployment

set "APP_DIR=C:\LiveProjects\NEXT_JS_WEB_JIVO.IN"
set "LOCAL_SCRIPT=%APP_DIR%\scripts\deploy-jivo-windows.ps1"
set "TEMP_SCRIPT=%TEMP%\jivo-deploy-windows.ps1"
set "SCRIPT_TO_RUN=%LOCAL_SCRIPT%"

echo ================================================================
echo Jivo Manual Deployment
echo ================================================================
echo.

net session >nul 2>&1
if not "%ERRORLEVEL%"=="0" (
  echo Requesting Administrator permission...
  powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b 0
)

if not exist "%APP_DIR%\" (
  echo ERROR: Live project folder was not found:
  echo %APP_DIR%
  echo.
  echo Copy this file into %APP_DIR% and run it from the server.
  pause
  exit /b 1
)

cd /d "%APP_DIR%"
if errorlevel 1 (
  echo ERROR: Could not enter %APP_DIR%
  pause
  exit /b 1
)

where git.exe >nul 2>&1
if errorlevel 1 (
  echo ERROR: git.exe was not found in PATH.
  pause
  exit /b 1
)

where powershell.exe >nul 2>&1
if errorlevel 1 (
  echo ERROR: powershell.exe was not found in PATH.
  pause
  exit /b 1
)

echo Fetching latest deployment script from origin/main...
git fetch origin main
if errorlevel 1 (
  echo WARNING: git fetch failed. Falling back to local deployment script.
) else (
  git show origin/main:scripts/deploy-jivo-windows.ps1 > "%TEMP_SCRIPT%"
  if errorlevel 1 (
    echo WARNING: Could not extract latest deployment script. Falling back to local script.
  ) else (
    set "SCRIPT_TO_RUN=%TEMP_SCRIPT%"
  )
)

if not exist "%SCRIPT_TO_RUN%" (
  echo ERROR: Deployment script was not found:
  echo %SCRIPT_TO_RUN%
  pause
  exit /b 1
)

echo.
echo Running deployment script:
echo %SCRIPT_TO_RUN%
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_TO_RUN%"
set "DEPLOY_EXIT_CODE=%ERRORLEVEL%"

echo.
if "%DEPLOY_EXIT_CODE%"=="0" (
  echo Deployment completed successfully.
) else (
  echo Deployment failed with exit code %DEPLOY_EXIT_CODE%.
)

echo.
pause
exit /b %DEPLOY_EXIT_CODE%
