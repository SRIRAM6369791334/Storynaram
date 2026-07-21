@echo off
setlocal enabledelayedexpansion

title Storynaram — Stop All

call :color_echo "========================================" "Cyan"
call :color_echo "  Storynaram — Stopping Services" "Cyan"
call :color_echo "========================================" "Cyan"
echo.

echo [SCAN] Looking for Storynaram processes...
echo.

set "KILLED=0"

for /f "tokens=2 delims=," %%P in ('tasklist /fi "WINDOWTITLE eq Story API" /fo csv /nh 2^>nul') do (
    set "PID=%%~P"
    if not "!PID!"=="" (
        taskkill /pid !PID! /f >nul 2>nul
        call :color_echo "  [STOP] Backend (PID: !PID!)" "Green"
        set /a "KILLED+=1"
    )
)

for /f "tokens=2 delims=," %%P in ('tasklist /fi "WINDOWTITLE eq Story Studio" /fo csv /nh 2^>nul') do (
    set "PID=%%~P"
    if not "!PID!"=="" (
        taskkill /pid !PID! /f >nul 2>nul
        call :color_echo "  [STOP] Frontend (PID: !PID!)" "Green"
        set /a "KILLED+=1"
    )
)

for /f "tokens=2 delims=," %%P in ('tasklist /fi "WINDOWTITLE eq Storynaram*" /fo csv /nh 2^>nul') do (
    set "PID=%%~P"
    if not "!PID!"=="" (
        taskkill /pid !PID! /f >nul 2>nul
        call :color_echo "  [STOP] Storynaram process (PID: !PID!)" "Green"
        set /a "KILLED+=1"
    )
)

echo.
if !KILLED! gtr 0 (
    call :color_echo "[DONE] Stopped !KILLED! Storynaram process(es)." "Green"
) else (
    call :color_echo "[INFO] No running Storynaram processes found." "Yellow"
)

echo.
echo To verify, run:
echo   tasklist /fi "WINDOWTITLE eq Story*"
echo.

pause

:color_echo
powershell -Command "Write-Host '%~1' -ForegroundColor %~2"
exit /b 0
