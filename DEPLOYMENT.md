# Deployment Guide

This guide covers deploying Arma Server Manager from a wheel package.

## Quick Start

### 1. Install the Wheel

```bash
# Install using uv (recommended)
uv pip install arma_server_manager-*.whl

# Or using pip
pip install arma_server_manager-*.whl
```

### 2. Create Configuration File

Create a `.env` file in the directory where you'll run the application:

```bash
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=your-secret-key-change-this

# Database
DATABASE_URI=sqlite:///app.db

# Celery (SQLite backend - no Redis needed)
CELERY_BROKER_URL=sqlalchemy+sqlite:///celery.db
CELERY_RESULT_BACKEND=db+sqlite:///celery_results.db

# SteamCMD Configuration
STEAMCMD_PATH=C:\SteamCMD\steamcmd.exe  # Windows
# STEAMCMD_PATH=/usr/bin/steamcmd        # Linux
STEAMCMD_USER=your_steam_username
STEAMCMD_PASSWORD=your_steam_password

# Directories (relative to where you run the command)
MOD_STAGING_DIR=temp/mod_staging
MOD_INSTALL_DIR=temp/mods
ARMA3_INSTALL_DIR=arma3

# Server Port
PORT=5000
```

### 3. Run the Application

```bash
# Single command runs both web server and Celery worker
arma-server-manager
```

The application will be available at `http://localhost:5000`

## Requirements

- **Python 3.11+** (or install `uv` which includes Python)
- **SteamCMD** - Download from [SteamCMD](https://developer.valvesoftware.com/wiki/SteamCMD)
- **Arma 3 Dedicated Server** (optional, for server management)

## Configuration Details

### SteamCMD

- `STEAMCMD_PATH`: Full path to `steamcmd.exe` (Windows) or `steamcmd` (Linux)
- `STEAMCMD_USER`: Your Steam username
- `STEAMCMD_PASSWORD`: Your Steam password (used for first login, then cached)

**Note**: After the first successful login, SteamCMD caches your credentials. You can remove `STEAMCMD_PASSWORD` from your `.env` file after the first run if desired.

### Directories

All directory paths are relative to where you run the `arma-server-manager` command. The application will create these directories if they don't exist.

### Database

By default, SQLite databases are created in the current working directory:
- `app.db` - Main application database
- `celery.db` - Celery message broker
- `celery_results.db` - Celery task results

## Production Deployment

### Linux (systemd)

Create `/etc/systemd/system/arma-server-manager.service`:

```ini
[Unit]
Description=Arma Server Manager
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/your/app
Environment="PATH=/usr/local/bin"
ExecStart=/usr/local/bin/arma-server-manager
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable arma-server-manager
sudo systemctl start arma-server-manager
```

### Windows (Service)

Use [NSSM](https://nssm.cc/) to install as a Windows service:

```bash
nssm install ArmaServerManager "C:\path\to\arma-server-manager.exe"
nssm set ArmaServerManager AppDirectory "C:\path\to\your\app"
nssm start ArmaServerManager
```

## Troubleshooting

### Application won't start

- Check that Python 3.11+ is installed
- Verify `.env` file exists in the current directory
- Check that `STEAMCMD_PATH` points to a valid SteamCMD executable

### SteamCMD authentication fails

- Verify `STEAMCMD_USER` and `STEAMCMD_PASSWORD` are correct
- Check SteamCMD can connect to Steam (firewall/network issues)
- After first successful login, credentials are cached automatically

### Port already in use

- Change `PORT` in your `.env` file
- Or stop the process using the port:
  ```bash
  # Linux
  lsof -ti:5000 | xargs kill -9
  
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### Celery tasks not running

- Ensure the application is running (it includes both server and worker)
- Check logs for error messages
- Verify database files are writable

## Backup

Important files to backup:

- `.env` - Your configuration
- `app.db` - Main database
- `celery.db` and `celery_results.db` - Celery data
- `temp/mods/` - Downloaded mod files (if you want to preserve them)

## Updates

To update to a new version:

1. Stop the application
2. Install the new wheel: `uv pip install --upgrade arma_server_manager-*.whl`
3. Restart the application

Your existing `.env` and database files will continue to work.
