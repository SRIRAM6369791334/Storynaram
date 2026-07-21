@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_ROOT=%%~fI"

cd /d "%PROJECT_ROOT%"

title Storynaram — Clean

call :color_echo "========================================" "Cyan"
call :color_echo "  Storynaram — Cleaning Artifacts" "Cyan"
call :color_echo "========================================" "Cyan"
echo.

echo [WARN] This will delete the following:
echo   - All node_modules folders
echo   - All dist/ folders
echo   - All .next/ folders
echo   - All coverage/ folders
echo   - Turbo cache
echo.
set /p "CONFIRM=Are you sure? (y/N): "
if /i not "!CONFIRM!"=="y" (
    echo.
    echo Clean cancelled.
    pause
    exit /b 0
)

echo.
echo [1/5] Deleting node_modules...
for /d /r %%D in (node_modules) do (
    if exist "%%D" (
        echo    Removing: %%D
        attrib -R "%%D" /S /D >nul 2>nul
        rmdir /s /q "%%D" 2>nul
    )
)

echo [2/5] Deleting dist folders...
for /d /r %%D in (dist) do (
    if exist "%%D" (
        echo    Removing: %%D
        rmdir /s /q "%%D" 2>nul
    )
)

echo [3/5] Deleting .next folders...
for /d /r %%D in (.next) do (
    if exist "%%D" (
        echo    Removing: %%D
        rmdir /s /q "%%D" 2>nul
    )
)

echo [4/5] Deleting coverage folders...
for /d /r %%D in (coverage) do (
    if exist "%%D" (
        echo    Removing: %%D
        rmdir /s /q "%%D" 2>nul
    )
)

echo [5/5] Deleting turbo cache...
if exist "%LOCALAPPDATA%\Turbo" (
    rmdir /s /q "%LOCALAPPDATA%\Turbo" 2>nul
    echo    Removed global Turbo cache
)

echo.
call :color_echo "[SUCCESS] Clean complete." "Green"
echo.
echo Note: Run install.bat to reinstall dependencies.
pause

:color_echo
powershell -Command "Write-Host '%~1' -ForegroundColor %~2"
exit /b 0
