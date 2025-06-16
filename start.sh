#!/bin/bash

WORKING_DIR="/mnt/photodisk/photostest/photoframe"
NPM_PATH="/snap/bin/npm"

while true; do
    if [ -d "$WORKING_DIR" ]; then
        echo "Working directory found. Starting npm..."
        cd "$WORKING_DIR"
        "$NPM_PATH" start
        break
    else
        echo "Working directory not found. Waiting 10 seconds..."
        sleep 10
    fi
done