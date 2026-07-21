@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"

title Storynaram Launcher

call :color_echo "========================================" "Cyan"
call :color_echo "  Storynaram — Starting All Services" "Cyan"
call :color_echo "========================================" "Cyan"
echo.

where pnpm >nul 2>nul
if errorlevel 1 (
    call :color_echo "[ERROR] pnpm is not installed." "Red"
    pause
    exit /b 1
)

if not exist "%PROJECT_ROOT%\node_modules" (
    echo [INSTALL] node_modules not found. Installing dependencies...
    cd /d "%PROJECT_ROOT%"
    call pnpm install
    if errorlevel 1 (
        echo [FAIL] pnpm install failed.
        pause
        exit /b 1
    )
    echo [OK] Installation complete.
    echo.
)

echo [LAUNCH] Opening backend window...
start "Story API" cmd /c "%SCRIPT_DIR%run-backend.bat"

echo [LAUNCH] Opening frontend window...
start "Story Studio" cmd /c "%SCRIPT_DIR%run-frontend.bat"

echo.
call :color_echo "  Backend  -> http://localhost:3000  |  Docs: http://localhost:3000/docs" "Yellow"
call :color_echo "  Frontend -> http://localhost:3001" "Yellow"
echo.
call :color_echo "Both services are starting in separate windows." "Green"
call :color_echo "Close those windows to stop each service, or run stop-all.bat" "Green"
echo.

pause

:color_echo
powershell -Command "Write-Host '%~1' -ForegroundColor %~2"
exit /b 0
