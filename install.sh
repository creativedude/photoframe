#!/bin/bash

# Check if photodir is provided, otherwise use default
if [ -z "$1" ]; then
    PHOTODIR="$(pwd)/photolibrary"
    echo "No photodir provided, using default: $PHOTODIR"
else
    PHOTODIR="$1"
    echo "Using provided photodir: $PHOTODIR"
fi

# Create photodir if it doesn't exist
mkdir -p "$PHOTODIR"

# Store the user's npm path before sudo operations
NPM_PATH=$(which npm)

# Copy service file
echo "Copying photoframe.service to /etc/systemd/system/"
sudo cp photoframe.service /etc/systemd/system/

# Update start.sh with current directory
echo "Updating start.sh with current directory"
CURRENT_DIR="$(pwd)"
sed -i "s|WORKING_DIR=.*|WORKING_DIR=\"$CURRENT_DIR\"|" start.sh

# Copy start.sh to home directory and make executable
echo "Copying start.sh to home directory"
sudo cp start.sh /usr/local/bin/start.sh
sudo chmod +x /usr/local/bin/start.sh

# Create .env file with PHOTOFRAME_BASE_PATH
echo "Creating .env file"
echo "PHOTOFRAME_BASE_PATH=$PHOTODIR" > .env

# Run npm install using the stored npm path
echo "Running npm install"
"$NPM_PATH" install

echo "Installation complete!" 