@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"

cd /d "%PROJECT_ROOT%"

title Storynaram — Install

call :color_echo "========================================" "Cyan"
call :color_echo "  Storynaram — Installing Dependencies" "Cyan"
call :color_echo "========================================" "Cyan"
echo.

where pnpm >nul 2>nul
if errorlevel 1 (
    call :color_echo "[ERROR] pnpm is not installed." "Red"
    echo.
    echo Please install Node.js and pnpm first:
    echo   npm install -g pnpm
    pause
    exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
    call :color_echo "[ERROR] node is not installed." "Red"
    echo.
    pause
    exit /b 1
)

echo [INFO] Node version:
node --version
echo [INFO] pnpm version:
pnpm --version
echo.
echo [RUN] pnpm install...
echo.

pnpm install
set "INSTALL_EXIT=%errorlevel%"
echo.

if "%INSTALL_EXIT%"=="0" (
    call :color_echo "[SUCCESS] All dependencies installed successfully." "Green"
) else (
    call :color_echo "[FAIL] Installation failed with exit code %INSTALL_EXIT%." "Red"
    echo.
    echo Common fixes:
    echo   - Check your network connection
    echo   - Delete pnpm-lock.yaml and try again
    echo   - Run: pnpm store prune
    pause
    exit /b 1
)

echo.
echo [INFO] Installed packages:
pnpm ls --depth=0 --recursive 2>nul | findstr /v "^$" | findstr /v "Legend"
echo.

pause
