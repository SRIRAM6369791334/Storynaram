@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"

cd /d "%PROJECT_ROOT%"

title Storynaram — Production Check

call :color_echo "========================================" "Cyan"
call :color_echo "  Storynaram — Production Readiness Check" "Cyan"
call :color_echo "========================================" "Cyan"
echo.

if not exist "node_modules" (
    call :color_echo "[FAIL] node_modules not found. Run install.bat first." "Red"
    pause
    exit /b 1
)

set "ALL_PASSED=1"

echo [1/4] Running linter...
echo.
pnpm lint
if errorlevel 1 (
    set "ALL_PASSED=0"
    call :color_echo "  [FAIL] Lint check failed." "Red"
) else (
    call :color_echo "  [PASS] Lint check passed." "Green"
)
echo.

echo [2/4] Running TypeScript type check...
echo.
pnpm typecheck
if errorlevel 1 (
    set "ALL_PASSED=0"
    call :color_echo "  [FAIL] TypeScript check failed." "Red"
) else (
    call :color_echo "  [PASS] TypeScript check passed." "Green"
)
echo.

echo [3/4] Building all packages...
echo.
pnpm build
if errorlevel 1 (
    set "ALL_PASSED=0"
    call :color_echo "  [FAIL] Build failed." "Red"
) else (
    call :color_echo "  [PASS] Build succeeded." "Green"
)
echo.

echo [4/4] Running tests...
echo.
pnpm test
if errorlevel 1 (
    set "ALL_PASSED=0"
    call :color_echo "  [FAIL] Tests failed." "Red"
) else (
    call :color_echo "  [PASS] All tests passed." "Green"
)
echo.

echo ========================================
if "!ALL_PASSED!"=="1" (
    call :color_echo "  READY FOR DEPLOYMENT" "Green"
) else (
    call :color_echo "  NOT READY — Fix the failures above before deploying." "Red"
)
echo ========================================

pause

:color_echo
powershell -Command "Write-Host '%~1' -ForegroundColor %~2"
exit /b 0
