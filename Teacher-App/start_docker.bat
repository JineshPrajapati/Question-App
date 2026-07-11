@echo off
:: Start PowerShell script directly from double-click

set SCRIPT_PATH=%~dp0CheckDocker.ps1

:: Run PowerShell with execution policy bypass so it works without enabling scripts globally
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_PATH%"
pause
