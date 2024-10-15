#!/bin/bash

# Change to the directory of the script
cd "$(dirname "$0")" || exit

# Set the flag file name (hidden)
flag_file=".script_run_flag"

# Check if the script has been run before
if [ -f "$flag_file" ]; then
    echo "This script has already been run."
    echo "To force re-run, delete the hidden .script_run_flag file."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install Git and try again."
    exit 1
fi

# Initialize git repository
echo "Initializing git repository..."
git init

# Add the remote repository
echo "Adding remote repository..."
git remote add origin https://MattiaTraverso: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@github.com/MattiaTraverso/rive.git

# Fetch the remote repository
echo "Fetching from remote repository..."
git fetch origin

# Create a backup of local files
echo "Creating backup of local files..."
mkdir ../temp_backup
cp -r . ../temp_backup

# Reset the local repository to match the remote main branch
echo "Resetting local repository to match remote..."
git reset --hard origin/main

# Copy back the local files, overwriting any conflicts
echo "Restoring local files..."
cp -rf ../temp_backup/. .

# Remove the backup
rm -rf ../temp_backup

# Create the flag file to indicate the script has been run
touch "$flag_file"

echo "Repository setup completed successfully."
