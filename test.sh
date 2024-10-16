#!/bin/bash
# Set working directory to the folder containing this script
cd "$(dirname "$0")"

# Add all changes in the current directory to git
git add .

# Exclude this file
git reset "push_to_git-win.bat"
git reset "push_to_git-osx.sh"

# Set Git user details
git config user.email "github@mattia.ninja"
git config user.name "PegasoProj"

# Prompt user for a commit message
read -p "Enter the commit message: " commitMessage

# Commit changes with the user-provided message
git commit -m "$commitMessage"

# Push changes to the remote repository
git push https://MattiaTraverso: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@github.com/MattiaTraverso/rive.git
