@echo off
rem Double-click this to build the Windows installer for Premiere Toolbox.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-installer.ps1" %*
echo.
pause
