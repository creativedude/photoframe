# PhotoFrame

A digital photo frame application that displays photos from a specified directory.

## Installation

1. Make the installation script executable:

```bash
chmod +x install.sh
```

2. Run the installation script:

```bash
# Option 1: Use default photo directory (current directory + "/photolibrary")
./install.sh

# Option 2: Specify a custom photo directory
./install.sh /path/to/your/photos
```

## What the Installation Does

The installation script performs the following actions:

1. **Service File Setup**

   - Copies `photoframe.service` to `/etc/systemd/system/`
   - This enables the application to run as a system service
   - Requires sudo privileges

2. **Start Script Setup**

   - Updates `start.sh` with the current installation directory
   - Copies `start.sh` to your home directory (`~/start.sh`)
   - Makes the script executable
   - The start script checks for the working directory and runs the application when ready

3. **Environment Configuration**

   - Creates a `.env` file in the application directory
   - Sets `PHOTOFRAME_BASE_PATH` to your specified photo directory
   - This tells the application where to find your photos

4. **Dependencies**
   - Runs `npm install` to install all required Node.js dependencies

## Photo Directory

The photo directory is where your photos will be stored and displayed from. You can specify this in two ways:

1. **Default Location**: If you don't specify a directory, it will create a `photolibrary` folder in the current directory
2. **Custom Location**: Provide a full path to your preferred photo directory when running the installation script

Example:

```bash
# Use default location
./install.sh

# Use custom location
./install.sh /mnt/photodisk/myphotos
```

## Starting the Application

After installation, the application will be set up as a system service. You can start it using:

```bash
sudo systemctl start photoframe
```

To enable automatic startup on boot:

```bash
sudo systemctl enable photoframe
```
