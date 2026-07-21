@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"

cd /d "%PROJECT_ROOT%"

title Storynaram — Lint

call :color_echo "========================================" "Cyan"
call :color_echo "  Storynaram — Running Linter" "Cyan"
call :color_echo "========================================" "Cyan"
echo.

if not exist "node_modules" (
    call :color_echo "[WARN] node_modules not found. Run install.bat first." "Yellow"
    echo.
    pause
    exit /b 1
)

echo [RUN] pnpm lint...
echo.
pnpm lint
set "LINT_EXIT=%errorlevel%"
echo.

if "%LINT_EXIT%"=="0" (
    call :color_echo "[SUCCESS] No lint errors found." "Green"
) else (
    call :color_echo "[FAIL] Lint found issues. Exit code %LINT_EXIT%." "Red"
)

pause
