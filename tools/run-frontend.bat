@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"

cd /d "%PROJECT_ROOT%"

title Story Studio

call :color_echo "Storynaram — Frontend Launcher" "Cyan"
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

echo [START] Launching Story Studio...
echo.
call :color_echo "  Frontend will be available at: http://localhost:3001" "Yellow"
echo.
echo.

pnpm --filter @storynaram/story-studio dev --port 3001
if errorlevel 1 (
    echo.
    call :color_echo "[FAIL] Frontend exited with code %errorlevel%" "Red"
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
call :color_echo "Frontend failed to start. Check the logs above." "Red"
echo.
pause
exit /b 1

:end
echo.
call :color_echo "Frontend stopped." "Green"
pause
