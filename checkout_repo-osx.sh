#!/bin/bash

# Set the flag file name (hidden)
flag_file="$(dirname "$0")/.script_run_flag"

# Check if the script has been run before
if [ -f "$flag_file" ]; then
    echo "This script has already been run."
    exit 1
fi

# Set the terminal to the directory of the script
cd "$(dirname "$0")" || exit

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed."
    echo "Please install Git and try again."
    exit 1
fi

# Clone the repository
echo "Cloning the repository..."
if ! git clone https://github.com/MattiaTraverso/rive.git; then
    echo "Failed to clone the repository."
    exit 1
fi

# Create the hidden flag file to indicate the script has been run
touch "$flag_file"

echo "Script completed successfully."