@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"

cd /d "%PROJECT_ROOT%"

title Storynaram — Test

call :color_echo "========================================" "Cyan"
call :color_echo "  Storynaram — Running All Tests" "Cyan"
call :color_echo "========================================" "Cyan"
echo.

if not exist "node_modules" (
    call :color_echo "[WARN] node_modules not found. Run install.bat first." "Yellow"
    echo.
    pause
    exit /b 1
)

echo [RUN] pnpm test...
echo.
pnpm test
set "TEST_EXIT=%errorlevel%"
echo.

if "%TEST_EXIT%"=="0" (
    call :color_echo "[SUCCESS] All tests passed." "Green"
) else (
    call :color_echo "[FAIL] Some tests failed with exit code %TEST_EXIT%." "Red"
)

pause
