@echo off
REM Get the current directory where this script is located
cd /d "%~dp0"

REM Start the Python HTTP server on port 8000
python -m http.server 8000

REM Pause to keep the command window open
pause