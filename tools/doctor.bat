@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"

cd /d "%PROJECT_ROOT%"

title Storynaram — Doctor

call :color_echo "========================================" "Cyan"
call :color_echo "  Storynaram — System Diagnostics" "Cyan"
call :color_echo "========================================" "Cyan"
echo.

set "PASS=0"
set "FAIL=0"

echo --- Node.js ---
where node >nul 2>nul
if errorlevel 1 (
    call :report "[FAIL] Node.js is not installed" "Red"
    set /a "FAIL+=1"
) else (
    for /f "tokens=*" %%V in ('node --version') do set "NODE_VER=%%V"
    call :report "[PASS] Node.js !NODE_VER!" "Green"
    set /a "PASS+=1"
)

echo --- pnpm ---
where pnpm >nul 2>nul
if errorlevel 1 (
    call :report "[FAIL] pnpm is not installed" "Red"
    set /a "FAIL+=1"
) else (
    for /f "tokens=*" %%V in ('pnpm --version') do set "PNPM_VER=%%V"
    call :report "[PASS] pnpm v!PNPM_VER!" "Green"
    set /a "PASS+=1"
)

echo --- Git ---
where git >nul 2>nul
if errorlevel 1 (
    call :report "[FAIL] Git is not installed" "Red"
    set /a "FAIL+=1"
) else (
    for /f "tokens=*" %%V in ('git --version 2^>nul') do set "GIT_VER=%%V"
    call :report "[PASS] !GIT_VER!" "Green"
    set /a "PASS+=1"
)
echo.

echo --- Project Root ---
if exist "%PROJECT_ROOT%\package.json" (
    call :report "[PASS] Project root: %PROJECT_ROOT%" "Green"
    set /a "PASS+=1"
) else (
    call :report "[FAIL] Cannot locate project root" "Red"
    set /a "FAIL+=1"
)

if exist "%PROJECT_ROOT%\node_modules" (
    call :report "[PASS] node_modules exists" "Green"
    set /a "PASS+=1"
) else (
    call :report "[WARN] node_modules missing — run install.bat" "Yellow"
    set /a "FAIL+=1"
)
echo.

echo --- Workspace Packages ---
if exist "%PROJECT_ROOT%\pnpm-workspace.yaml" (
    call :report "[INFO] pnpm workspace detected" "Cyan"
    echo.
    for /f "tokens=*" %%P in ('dir /b "%PROJECT_ROOT%\apps" 2^>nul') do (
        if exist "%PROJECT_ROOT%\apps\%%P\package.json" (
            call :report "       apps/%%P" "White"
        )
    )
    for /f "tokens=*" %%P in ('dir /b "%PROJECT_ROOT%\packages" 2^>nul') do (
        if exist "%PROJECT_ROOT%\packages\%%P\package.json" (
            call :report "       packages/%%P" "White"
        )
    )
) else (
    call :report "[WARN] No pnpm-workspace.yaml found" "Yellow"
)
echo.

echo --- Environment Variables ---
set "FOUND_ENV=0"
if not "!NODE_ENV!"=="" (
    call :report "[INFO] NODE_ENV = !NODE_ENV!" "Cyan"
    set /a "FOUND_ENV+=1"
)
if not "!DATABASE_URL!"=="" (
    call :report "[INFO] DATABASE_URL is set" "Cyan"
    set /a "FOUND_ENV+=1"
)
if !FOUND_ENV! equ 0 (
    call :report "[INFO] No Storynaram-specific env vars detected (this is normal for dev)" "Cyan"
)
echo.

echo --- Ports ---
call :check_port 3000 "Backend (Story API)"
call :check_port 3001 "Frontend (Story Studio)"
echo.

echo --- Summary ---
echo.
call :color_echo "  %PASS% checks passed" "Green"
if %FAIL% gtr 0 (
    call :color_echo "  %FAIL% checks failed" "Red"
)
echo.

if %FAIL% gtr 0 (
    call :color_echo "Some checks failed. Review the report above." "Yellow"
    echo.
    echo Suggested fixes:
    if %FAIL% leq 2 echo   - Run install.bat to install dependencies
    echo   - Ensure Node.js 18+ and pnpm 8+ are installed
    echo   - Check PATH environment variable
) else (
    call :color_echo "All systems ready!" "Green"
)

pause
exit /b 0

:check_port
netstat -ano | findstr ":%1 " >nul 2>nul
if errorlevel 1 (
    call :report "[PASS] Port %1 (%2) is free" "Green"
    set /a "PASS+=1"
) else (
    call :report "[WARN] Port %1 (%2) is in use" "Yellow"
    set /a "PASS+=1"
)
exit /b 0

:report
powershell -Command "Write-Host '%~1' -ForegroundColor %~2"
exit /b 0

:color_echo
powershell -Command "Write-Host '%~1' -ForegroundColor %~2"
exit /b 0
