@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"

cd /d "%PROJECT_ROOT%"

title Story API

call :color_echo "Storynaram — Backend Launcher" "Cyan"
echo.

call :check_dependencies
if errorlevel 1 goto :error

if not exist "node_modules" (
    echo [INSTALL] node_modules not found. Installing dependencies...
    call pnpm install
    if errorlevel 1 (
        echo [FAIL] pnpm install failed.
        goto :error
    )
    echo [OK] Installation complete.
    echo.
)

echo [START] Launching Story API...
echo.
call :color_echo "  API will be available at: http://localhost:3000" "Yellow"
call :color_echo "  Swagger docs at:           http://localhost:3000/docs" "Yellow"
echo.
echo.

pnpm --filter @storynaram/api dev
if errorlevel 1 (
    echo.
    call :color_echo "[FAIL] Backend exited with code %errorlevel%" "Red"
    goto :error
)

goto :end

:check_dependencies
where pnpm >nul 2>nul
if errorlevel 1 (
    call :color_echo "[ERROR] pnpm is not installed. Please install Node.js and pnpm first." "Red"
    exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
    call :color_echo "[ERROR] node is not installed. Please install Node.js first." "Red"
    exit /b 1
)
exit /b 0

:color_echo
powershell -Command "Write-Host '%~1' -ForegroundColor %~2"
exit /b 0

:error
echo.
call :color_echo "Backend failed to start. Check the logs above." "Red"
echo.
pause
exit /b 1

:end
echo.
call :color_echo "Backend stopped." "Green"
pause
