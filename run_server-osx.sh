#!/bin/bash
# Get the current directory where this script is located
cd "$(dirname "$0")"

# Start the Python HTTP server in the background on port 8000
python3 -m http.server 8000 &

# Get the PID of the last background command (the HTTP server)
SERVER_PID=$!

# Sleep for a short period to ensure the server starts before opening the browser
sleep 1

# Open the default browser and point it to http://localhost:8000
open http://localhost:8000

# Wait for the server process to finish before exiting the script
wait $SERVER_PID
