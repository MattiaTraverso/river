@echo off
REM Get the current directory where this script is located
cd /d "%~dp0"

REM Start the Python HTTP server on port 8000
start "" python -m http.server 8000

REM Wait for a short period to ensure the server is up before opening the browser
timeout /t 1 /nobreak >nul

REM Open the default browser and point it to http://localhost:8000
start "" http://localhost:8000

REM Pause to keep the command window open
pause
