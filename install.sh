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

# Copy service file
echo "Copying photoframe.service to /etc/systemd/system/"
sudo cp photoframe.service /etc/systemd/system/

# Update start.sh with current directory
echo "Updating start.sh with current directory"
CURRENT_DIR="$(pwd)"
sed -i "s|WORKING_DIR=.*|WORKING_DIR=\"$CURRENT_DIR\"|" start.sh

# Copy start.sh to home directory and make executable
echo "Copying start.sh to home directory"
cp start.sh /usr/local/bin/start.sh
chmod +x /usr/local/bin/start.sh

# Create .env file with PHOTOFRAME_BASE_PATH
echo "Creating .env file"
echo "PHOTOFRAME_BASE_PATH=$PHOTODIR" > .env

# Run npm install
echo "Running npm install"
npm install

echo "Installation complete!" 