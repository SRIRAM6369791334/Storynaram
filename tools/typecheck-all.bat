@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"

cd /d "%PROJECT_ROOT%"

title Storynaram — TypeCheck

call :color_echo "========================================" "Cyan"
call :color_echo "  Storynaram — TypeScript Type Checking" "Cyan"
call :color_echo "========================================" "Cyan"
echo.

if not exist "node_modules" (
    call :color_echo "[WARN] node_modules not found. Run install.bat first." "Yellow"
    echo.
    pause
    exit /b 1
)

echo [RUN] pnpm typecheck...
echo.
pnpm typecheck
set "TC_EXIT=%errorlevel%"
echo.

if "%TC_EXIT%"=="0" (
    call :color_echo "[SUCCESS] No TypeScript errors found." "Green"
) else (
    call :color_echo "[FAIL] TypeScript errors found. Exit code %TC_EXIT%." "Red"
)

pause
