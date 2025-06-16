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

# Run npm install as the current user with proper environment
echo "Running npm install as user: $SUDO_USER"
sudo -u $SUDO_USER bash -c '
    # Source the user profile to get the correct PATH
    source ~/.profile
    source ~/.bashrc
    source ~/.nvm/nvm.sh 2>/dev/null || true
    
    echo "PATH: $PATH"
    echo "NPM path: $(which npm)"
    echo "NODE path: $(which node)"
    
    # Try to find npm in common locations
    if [ -f "$HOME/.nvm/versions/node/$(ls -t $HOME/.nvm/versions/node/ 2>/dev/null | head -n1)/bin/npm" ]; then
        NPM_PATH="$HOME/.nvm/versions/node/$(ls -t $HOME/.nvm/versions/node/ 2>/dev/null | head -n1)/bin/npm"
    elif [ -f "/usr/local/bin/npm" ]; then
        NPM_PATH="/usr/local/bin/npm"
    elif [ -f "/usr/bin/npm" ]; then
        NPM_PATH="/usr/bin/npm"
    else
        echo "Error: Could not find npm installation"
        exit 1
    fi
    
    echo "Using npm from: $NPM_PATH"
    "$NPM_PATH" install
'

echo "Installation complete!" 