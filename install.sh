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

# Determine the correct user to use
if [ -n "$SUDO_USER" ]; then
    SERVICE_USER="$SUDO_USER"
else
    SERVICE_USER="$(whoami)"
fi
echo "Using service user: $SERVICE_USER"

# Update service file with correct user
echo "Updating service file with correct user"
sed -i "s|User=.*|User=$SERVICE_USER|" photoframe.service

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

# Run npm install
echo "Running npm install"
npm install

# Run npm install
echo "Running npm run build"
npm run build

# Enable and start the service
echo "Enabling and starting photoframe service..."
sudo systemctl daemon-reload
sudo systemctl enable photoframe.service
sudo systemctl start photoframe.service

echo "Installation complete!" 