@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"

cd /d "%PROJECT_ROOT%"

title Storynaram — Master Launcher

call :color_echo "================================================" "Cyan"
call :color_echo "  Storynaram — Starting All Services" "Cyan"
call :color_echo "================================================" "Cyan"
echo.

where pnpm >nul 2>nul
if errorlevel 1 (
    call :color_echo "[ERROR] pnpm is not installed." "Red"
    pause
    exit /b 1
)

if not exist "%PROJECT_ROOT%\node_modules" (
    echo [INSTALL] Installing dependencies first...
    call pnpm install
    if errorlevel 1 (
        echo [FAIL] pnpm install failed.
        pause
        exit /b 1
    )
    echo [OK] Installation complete.
    echo.
)

echo [LAUNCH] Starting all services in separate windows...
echo.

start "Story API" cmd /c "%SCRIPT_DIR%run-backend.bat"
timeout /t 2 /nobreak >nul

start "Story Studio" cmd /c "%SCRIPT_DIR%run-frontend.bat"
timeout /t 2 /nobreak >nul

start "Story API Platform" cmd /c "title Story API Platform && cd /d "%PROJECT_ROOT%" && echo [START] Story API Platform starting... && pnpm --filter @storynaram/story-api dev || (echo. && echo [FAIL] Story API Platform exited && pause)"
timeout /t 2 /nobreak >nul

start "Worker" cmd /c "title Worker && cd /d "%PROJECT_ROOT%" && echo [START] Worker starting... && pnpm --filter @storynaram/worker dev || (echo. && echo [FAIL] Worker exited && pause)"
timeout /t 2 /nobreak >nul

echo.
call :color_echo "  Service          Port            Window Title" "White"
call :color_echo "  ─────────────────────────────────────────────────" "White"
call :color_echo "  Story API        3000            Story API" "Yellow"
call :color_echo "  Story Studio     3001            Story Studio" "Yellow"
call :color_echo "  Story API Platf. 3002            Story API Platform" "Yellow"
call :color_echo "  Worker           -               Worker" "Yellow"
echo.
call :color_echo "  All services are starting in separate windows." "Green"
call :color_echo "  Close each window to stop that service individually." "Green"
call :color_echo "  Or run stop-all.bat to kill all at once." "Green"
echo.

pause

:color_echo
powershell -Command "Write-Host '%~1' -ForegroundColor %~2"
exit /b 0
