@echo off
setlocal enabledelayedexpansion

:: Change to the directory of the script
cd /d "%~dp0"

:: Set the flag file name (hidden)
set "flag_file=.script_run_flag"

:: Check if the script has been run before
if exist "%flag_file%" (
    echo This script has already been run.
    echo To force re-run, delete the hidden .script_run_flag file.
    exit /b 1
)

:: Check if git is installed
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo Git is not installed or not in the system PATH.
    echo Please install Git and try again.
    exit /b 1
)

:: Check if the current directory is a git repository
if not exist ".git" (
    echo Initializing git repository...
    git init
)

:: Add the remote repository
echo Adding remote repository...
git remote add origin https://MattiaTraverso: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@github.com/MattiaTraverso/rive.git

:: Pull and merge with the remote repository
echo Pulling from remote repository...
git pull origin main

:: Create the flag file to indicate the script has been run
echo. > "%flag_file%"
attrib +h "%flag_file%"

echo Script completed successfully.