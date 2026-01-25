# Arma Server Manager - Windows Installation Script
# Usage: irm https://raw.githubusercontent.com/wrycu/arma_server_manager/main/install.ps1 | iex

$ErrorActionPreference = "Stop"

$Repo = "wrycu/arma_server_manager"
$BinaryName = "arma_server_manager"
$InstallDir = if ($env:INSTALL_DIR) { $env:INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA "Programs\ArmaServerManager" }

function Write-Status {
    param([string]$Message)
    Write-Host "[*] " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[!] " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

function Write-Error {
    param([string]$Message)
    Write-Host "[x] " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Get-LatestRelease {
    $releaseUrl = "https://api.github.com/repos/$Repo/releases/latest"

    try {
        $response = Invoke-RestMethod -Uri $releaseUrl -UseBasicParsing
        return $response.tag_name
    }
    catch {
        Write-Error "Failed to fetch latest release: $_"
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

        if ($exePath) {
            $destPath = Join-Path $InstallDir "$BinaryName.exe"
            Copy-Item -Path $exePath.FullName -Destination $destPath -Force
        }
        else {
            Write-Error "Could not find executable in archive"
            exit 1
        }

        # Copy all other files from the archive (DLLs, etc.)
        $extractedDir = Join-Path $tempDir "main"
        if (-not (Test-Path $extractedDir)) {
            $extractedDir = $tempDir
        }

        Get-ChildItem -Path $extractedDir -File | Where-Object { $_.Extension -ne ".zip" } | ForEach-Object {
            if ($_.Name -ne $exePath.Name) {
                Copy-Item -Path $_.FullName -Destination $InstallDir -Force
            }
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

        Write-Warning "PATH updated. You may need to restart your terminal for changes to take effect."
    }
    else {
        Write-Status "$InstallDir is already in PATH"
    }
}

function Main {
    Write-Host ""
    Write-Host "  Arma Server Manager Installer" -ForegroundColor Cyan
    Write-Host "  ==============================" -ForegroundColor Cyan
    Write-Host ""

    Write-Status "Fetching latest release..."
    $version = Get-LatestRelease

    if (-not $version) {
        Write-Error "Could not determine latest version"
        exit 1
    }

    Write-Status "Latest version: $version"

    Install-ArmaServerManager -Version $version

    Add-ToPath

    Write-Status "Installation complete!"
    Write-Host ""
    Write-Host "  Run '$BinaryName' to start the server manager." -ForegroundColor Green
    Write-Host ""
}

Main
