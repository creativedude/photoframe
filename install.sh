#!/bin/bash

echo "Starting installation..."
echo "Current user: $(whoami)"
echo "SUDO_USER: $SUDO_USER"

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

# Copy service file
echo "Copying photoframe.service to /etc/systemd/system/"
sudo cp photoframe.service /etc/systemd/system/

# Update start.sh with current directory
echo "Updating start.sh with current directory"
CURRENT_DIR="$(pwd)"
echo "Current directory: $CURRENT_DIR"
sed -i "s|WORKING_DIR=.*|WORKING_DIR=\"$CURRENT_DIR\"|" start.sh

# Copy start.sh to home directory and make executable
echo "Copying start.sh to home directory"
sudo cp start.sh /usr/local/bin/start.sh
sudo chmod +x /usr/local/bin/start.sh

# Create .env file with PHOTOFRAME_BASE_PATH
echo "Creating .env file"
echo "PHOTOFRAME_BASE_PATH=$PHOTODIR" > .env

# Debug npm environment
echo "Debugging npm environment:"
echo "NPM path: $(which npm)"
echo "NODE path: $(which node)"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Run npm install as the current user
echo "Running npm install as user: $SUDO_USER"
sudo -u $SUDO_USER bash -c 'echo "Running as user: $(whoami)"; npm install'

echo "Installation complete!" 