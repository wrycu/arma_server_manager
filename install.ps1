# Arma Server Manager - Windows Installation Script
# Usage: irm https://raw.githubusercontent.com/wrycu/arma_server_manager/main/install.ps1 | iex

$ErrorActionPreference = "Stop"

$Repo = "wrycu/arma_server_manager"
$BinaryName = "arma_server_manager"
$InstallDir = if ($env:INSTALL_DIR) { $env:INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA "Programs\ArmaServerManager" }
$ConfigDir = Join-Path $env:APPDATA "arma_server_manager"

function Write-Status {
    param([string]$Message)
    Write-Host "[*] " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-AppWarning {
    param([string]$Message)
    Write-Host "[!] " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

function Write-AppError {
    param([string]$Message)
    Write-Host "[x] " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Write-Header {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Get-LatestRelease {
    $releaseUrl = "https://api.github.com/repos/$Repo/releases/latest"

    try {
        $response = Invoke-RestMethod -Uri $releaseUrl -UseBasicParsing
        return $response.tag_name
    }
    catch {
        Write-AppError "Failed to fetch latest release: $_"
        exit 1
    }
}

function Install-ArmaServerManager {
    param(
        [string]$Version
    )

    $platform = "windows-x64"
    $assetName = "$BinaryName-$platform.zip"
    $downloadUrl = "https://github.com/$Repo/releases/download/$Version/$assetName"

    # Create temp directory
    $tempDir = Join-Path $env:TEMP "arma_server_manager_install"
    if (Test-Path $tempDir) {
        Remove-Item -Recurse -Force $tempDir
    }
    New-Item -ItemType Directory -Path $tempDir | Out-Null

    try {
        Write-Status "Downloading $assetName..."
        $archivePath = Join-Path $tempDir $assetName

        # Use TLS 1.2 for GitHub
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

        Invoke-WebRequest -Uri $downloadUrl -OutFile $archivePath -UseBasicParsing

        Write-Status "Extracting archive..."
        Expand-Archive -Path $archivePath -DestinationPath $tempDir -Force

        Write-Status "Installing to $InstallDir..."
        if (-not (Test-Path $InstallDir)) {
            New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
        }

        # Find and copy the executable
        $exePath = Get-ChildItem -Path $tempDir -Recurse -Filter "*.exe" | Where-Object { $_.Name -like "*arma*" -or $_.Name -eq "main.exe" } | Select-Object -First 1

        if (-not $exePath) {
            $exePath = Get-ChildItem -Path $tempDir -Recurse -Filter "*.exe" | Select-Object -First 1
        }

        if (-not $exePath) {
            Write-AppError "Could not find executable in archive"
            exit 1
        }

        # The archive contains a directory named 'arma_server_manager' with all files
        $extractedDir = Join-Path $tempDir $BinaryName
        if (-not (Test-Path $extractedDir)) {
            # Fallback to temp dir if directory structure is different
            $extractedDir = $tempDir
        }

        # Copy entire directory contents (executable + supporting files like DLLs, _internal, etc.)
        Write-Status "Copying application files..."
        Get-ChildItem -Path $extractedDir | Where-Object { $_.Extension -ne ".zip" } | ForEach-Object {
            Copy-Item -Path $_.FullName -Destination $InstallDir -Recurse -Force
        }
    }
    finally {
        # Cleanup
        if (Test-Path $tempDir) {
            Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
        }
    }
}

function Add-ToPath {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

    if ($currentPath -notlike "*$InstallDir*") {
        Write-Status "Adding $InstallDir to user PATH..."

        $newPath = "$currentPath;$InstallDir"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")

        # Update current session
        $env:Path = "$env:Path;$InstallDir"

        Write-AppWarning "PATH updated. You may need to restart your terminal for changes to take effect."
    }
    else {
        Write-Status "$InstallDir is already in PATH"
    }
}

function Read-PromptValue {
    param(
        [string]$Prompt,
        [string]$Default
    )

    if ($Default) {
        $input = Read-Host "$Prompt [$Default]"
        if ([string]::IsNullOrWhiteSpace($input)) {
            return $Default
        }
        return $input
    }
    else {
        return Read-Host $Prompt
    }
}

function Read-PromptDirectory {
    param(
        [string]$Prompt,
        [string]$Default
    )

    $path = Read-PromptValue -Prompt $Prompt -Default $Default

    if (-not (Test-Path $path)) {
        $create = Read-Host "Directory '$path' does not exist. Create it? [Y/n]"
        if ([string]::IsNullOrWhiteSpace($create) -or $create -eq "y" -or $create -eq "Y") {
            New-Item -ItemType Directory -Path $path -Force | Out-Null
            Write-Status "Created directory: $path"
        }
    }

    return $path
}

function Start-ConfigWizard {
    $envFile = Join-Path $ConfigDir ".env"

    # Check if config already exists
    if (Test-Path $envFile) {
        $reconfigure = Read-Host "Configuration already exists at $envFile. Reconfigure? [y/N]"
        if ($reconfigure -ne "y" -and $reconfigure -ne "Y") {
            Write-Status "Using existing configuration"
            return
        }
    }

    Write-Host ""
    Write-Header "================================================================================"
    Write-Header "                    Arma Server Manager - Configuration"
    Write-Header "================================================================================"
    Write-Host ""
    Write-Host "This wizard will help you configure the Arma Server Manager."
    Write-Host "Configuration will be saved to: $envFile"
    Write-Host ""
    Write-Host "Press Ctrl+C at any time to cancel."
    Write-Host ""

    # SteamCMD Configuration
    Write-Header "--------------------------------------------------------------------------------"
    Write-Header "STEAMCMD CONFIGURATION"
    Write-Header "--------------------------------------------------------------------------------"
    Write-Host ""

    Write-Host "Path to the SteamCMD executable."
    Write-Host "This is used to download mods from the Steam Workshop."
    Write-Host "Example: C:\steamcmd\steamcmd.exe"
    Write-Host ""
    $steamcmdPath = Read-PromptValue -Prompt "STEAMCMD_PATH" -Default "steamcmd"
    Write-Host ""

    Write-Host "Steam username for Workshop downloads."
    Write-Host "Use 'anonymous' for public mods, or your Steam username for private mods."
    Write-Host "Note: Using a personal account may require Steam Guard authentication."
    Write-Host ""
    $steamcmdUser = Read-PromptValue -Prompt "STEAMCMD_USER" -Default "anonymous"
    Write-Host ""

    # Directory Configuration
    Write-Header "--------------------------------------------------------------------------------"
    Write-Header "DIRECTORY CONFIGURATION"
    Write-Header "--------------------------------------------------------------------------------"
    Write-Host ""

    $defaultBase = Join-Path $env:USERPROFILE "arma_server_manager"

    Write-Host "Temporary directory for mod downloads during installation."
    Write-Host "This directory is used to stage mods before moving them to the install directory."
    Write-Host ""
    $modStagingDir = Read-PromptDirectory -Prompt "MOD_STAGING_DIR" -Default (Join-Path $defaultBase "temp\mod_staging")
    Write-Host ""

    Write-Host "Directory where mods will be installed."
    Write-Host "This is where downloaded mods are stored for use by the Arma 3 server."
    Write-Host ""
    $modInstallDir = Read-PromptDirectory -Prompt "MOD_INSTALL_DIR" -Default (Join-Path $defaultBase "mods")
    Write-Host ""

    Write-Host "Arma 3 server installation directory."
    Write-Host "This is where the Arma 3 dedicated server is or will be installed."
    Write-Host ""
    $arma3InstallDir = Read-PromptDirectory -Prompt "ARMA3_INSTALL_DIR" -Default (Join-Path $defaultBase "arma3")
    Write-Host ""

    # Create config directory and write .env file
    if (-not (Test-Path $ConfigDir)) {
        New-Item -ItemType Directory -Path $ConfigDir -Force | Out-Null
    }

    $envContent = @"
# Arma Server Manager Configuration
# Generated by install script

# SteamCMD Configuration
STEAMCMD_PATH=$steamcmdPath
STEAMCMD_USER=$steamcmdUser

# Directory Configuration
MOD_STAGING_DIR=$modStagingDir
MOD_INSTALL_DIR=$modInstallDir
ARMA3_INSTALL_DIR=$arma3InstallDir

# CORS Configuration (optional)
# By default, all origins are allowed. To restrict access to specific origins,
# uncomment and set a comma-separated list of allowed origins:
# CORS_ORIGINS=http://localhost:5173,http://your-server-ip:5173
"@

    Set-Content -Path $envFile -Value $envContent -Encoding UTF8

    Write-Header "================================================================================"
    Write-Status "Configuration saved to: $envFile"
    Write-Header "================================================================================"
    Write-Host ""
}

function Main {
    Write-Host ""
    Write-Host "  Arma Server Manager Installer" -ForegroundColor Cyan
    Write-Host "  ==============================" -ForegroundColor Cyan
    Write-Host ""

    Write-Status "Fetching latest release..."
    $version = Get-LatestRelease

    if (-not $version) {
        Write-AppError "Could not determine latest version"
        exit 1
    }

    Write-Status "Latest version: $version"

    Install-ArmaServerManager -Version $version

    Add-ToPath

    # Run configuration wizard
    Start-ConfigWizard

    Write-Status "Installation complete!"
    Write-Host ""
    Write-Host "  Run '$BinaryName' to start the server manager." -ForegroundColor Green
    Write-Host ""
}

Main
