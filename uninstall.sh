#!/bin/bash

echo "Starting uninstallation of photoframe..."

# Stop and disable the service if it's running
echo "Stopping and disabling photoframe service..."
sudo systemctl stop photoframe.service
sudo systemctl disable photoframe.service

# Remove the service file
echo "Removing systemd service file..."
sudo rm -f /etc/systemd/system/photoframe.service

# Remove the start script
echo "Removing start script..."
sudo rm -f /usr/local/bin/start.sh

# Reload systemd to recognize the changes
echo "Reloading systemd..."
sudo systemctl daemon-reload

# Remove node_modules and package-lock.json
echo "Removing npm dependencies..."
rm -rf node_modules
rm -f package-lock.json

# Remove .env file
echo "Removing .env file..."
rm -f .env

echo "Uninstallation complete!"
echo "Note: The photolibrary directory was not removed to preserve your photos."
echo "If you want to remove it, please do so manually." 