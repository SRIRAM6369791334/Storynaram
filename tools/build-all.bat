@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"

cd /d "%PROJECT_ROOT%"

title Storynaram — Build

call :color_echo "========================================" "Cyan"
call :color_echo "  Storynaram — Building All Packages" "Cyan"
call :color_echo "========================================" "Cyan"
echo.

if not exist "node_modules" (
    call :color_echo "[WARN] node_modules not found. Run install.bat first." "Yellow"
    echo.
    pause
    exit /b 1
)

echo [RUN] pnpm build...
echo.
pnpm build
set "BUILD_EXIT=%errorlevel%"
echo.

if "%BUILD_EXIT%"=="0" (
    call :color_echo "[SUCCESS] All packages built successfully." "Green"
) else (
    call :color_echo "[FAIL] Build failed with exit code %BUILD_EXIT%." "Red"
    echo.
    echo Check the output above for specific errors.
    pause
    exit /b 1
)

pause
