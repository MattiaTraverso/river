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
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git is not installed or not in the system PATH.
    echo Please install Git and try again.
    exit /b 1
)

:: Initialize git repository
echo Initializing git repository...
git init

:: Add the remote repository
echo Adding remote repository...
git remote add origin https://MattiaTraverso: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@github.com/MattiaTraverso/rive.git

:: Fetch the remote repository
echo Fetching from remote repository...
git fetch origin

:: Create a backup of local files
echo Creating backup of local files...
mkdir ..\temp_backup
xcopy /s /e /i . ..\temp_backup

:: Reset the local repository to match the remote main branch
echo Resetting local repository to match remote...
git reset --hard origin/main

:: Copy back the local files, overwriting any conflicts
echo Restoring local files...
xcopy /s /e /y ..\temp_backup\* .

:: Remove the backup
rmdir /s /q ..\temp_backup

:: Create the flag file to indicate the script has been run
type nul > "%flag_file%"
attrib +h "%flag_file%"

echo Repository setup completed successfully.