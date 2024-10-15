@echo off
setlocal enabledelayedexpansion

:: Set the flag file name (hidden)
set "flag_file=%~dp0.script_run_flag"

:: Check if the script has been run before
if exist "%flag_file%" (
    echo This script has already been run.
    exit /b 1
)

:: Set the terminal to the directory of the script
cd /d "%~dp0"

:: Check if git is installed
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo Git is not installed or not in the system PATH.
    echo Please install Git and try again.
    exit /b 1
)

:: Clone the repository
echo Cloning the repository...
git clone https://github.com/MattiaTraverso/rive.git
if %errorlevel% neq 0 (
    echo Failed to clone the repository.
    exit /b 1
)

:: Create the hidden flag file to indicate the script has been run
echo. > "%flag_file%"
attrib +h "%flag_file%"

echo Script completed successfully.