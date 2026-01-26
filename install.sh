#!/bin/bash
# Arma Server Manager - Unix Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/wrycu/arma_server_manager/main/install.sh | bash

set -e

REPO="wrycu/arma_server_manager"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"
BINARY_NAME="arma_server_manager"

# Config directory follows XDG spec on Linux, Application Support on macOS
if [ "$(uname -s)" = "Darwin" ]; then
    CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/Library/Application Support}/arma_server_manager"
else
    CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/arma_server_manager"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[*]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[x]${NC} $1"
}

print_header() {
    echo -e "${CYAN}$1${NC}"
}

# Detect OS and architecture
detect_platform() {
    local os arch

    case "$(uname -s)" in
        Linux*)  os="linux" ;;
        Darwin*) os="macos" ;;
        *)       print_error "Unsupported operating system: $(uname -s)"; exit 1 ;;
    esac

    case "$(uname -m)" in
        x86_64|amd64)  arch="x64" ;;
        arm64|aarch64) arch="arm64" ;;
        *)             print_error "Unsupported architecture: $(uname -m)"; exit 1 ;;
    esac

    # macOS builds are arm64, Linux builds are x64
    if [ "$os" = "macos" ]; then
        echo "macos-arm64"
    else
        echo "linux-x64"
    fi
}

# Get the latest release tag
get_latest_release() {
    local release_url="https://api.github.com/repos/${REPO}/releases/latest"

    if command -v curl &> /dev/null; then
        curl -sL "$release_url" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/'
    elif command -v wget &> /dev/null; then
        wget -qO- "$release_url" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/'
    else
        print_error "Neither curl nor wget found. Please install one of them."
        exit 1
    fi
}

# Download and extract the binary
download_and_install() {
    local platform="$1"
    local version="$2"
    local asset_name="${BINARY_NAME}-${platform}.tar.gz"
    local download_url="https://github.com/${REPO}/releases/download/${version}/${asset_name}"
    local temp_dir

    temp_dir=$(mktemp -d)
    trap "rm -rf $temp_dir" EXIT

    print_status "Downloading ${asset_name}..."

    if command -v curl &> /dev/null; then
        curl -fsSL "$download_url" -o "$temp_dir/$asset_name"
    elif command -v wget &> /dev/null; then
        wget -q "$download_url" -O "$temp_dir/$asset_name"
    fi

    print_status "Extracting archive..."
    tar -xzf "$temp_dir/$asset_name" -C "$temp_dir"

    print_status "Installing to ${INSTALL_DIR}..."
    mkdir -p "$INSTALL_DIR"

    # Find the executable in the extracted files
    # The archive contains a directory with the same name as the binary
    local extracted_dir="$temp_dir/$BINARY_NAME"
    if [ -d "$extracted_dir" ] && [ -f "$extracted_dir/$BINARY_NAME" ]; then
        # Copy the entire directory contents (executable + supporting files)
        cp -r "$extracted_dir"/* "$INSTALL_DIR/"
    elif [ -f "$temp_dir/$BINARY_NAME" ]; then
        mv "$temp_dir/$BINARY_NAME" "$INSTALL_DIR/"
    elif [ -f "$temp_dir/main" ]; then
        mv "$temp_dir/main" "$INSTALL_DIR/$BINARY_NAME"
    else
        print_error "Could not find executable in archive"
        exit 1
    fi

    chmod +x "$INSTALL_DIR/$BINARY_NAME"
}

# Check if install directory is in PATH
check_path() {
    if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
        print_warning "${INSTALL_DIR} is not in your PATH"
        echo ""
        echo "Add it to your shell profile:"
        echo ""

        if [ -n "$ZSH_VERSION" ] || [ -f "$HOME/.zshrc" ]; then
            echo "  echo 'export PATH=\"\$PATH:${INSTALL_DIR}\"' >> ~/.zshrc"
            echo "  source ~/.zshrc"
        fi

        if [ -n "$BASH_VERSION" ] || [ -f "$HOME/.bashrc" ]; then
            echo "  echo 'export PATH=\"\$PATH:${INSTALL_DIR}\"' >> ~/.bashrc"
            echo "  source ~/.bashrc"
        fi
        echo ""
    fi
}

# Prompt for a value with a default
prompt_value() {
    local prompt="$1"
    local default="$2"
    local result

    if [ -n "$default" ]; then
        read -r -p "$prompt [$default]: " result
        echo "${result:-$default}"
    else
        read -r -p "$prompt: " result
        echo "$result"
    fi
}

# Prompt for a directory path, offering to create it if it doesn't exist
prompt_directory() {
    local prompt="$1"
    local default="$2"
    local path

    path=$(prompt_value "$prompt" "$default")

    # Expand ~ to home directory
    path="${path/#\~/$HOME}"

    if [ ! -d "$path" ]; then
        read -r -p "Directory '$path' does not exist. Create it? [Y/n]: " create
        if [ -z "$create" ] || [ "$create" = "y" ] || [ "$create" = "Y" ]; then
            mkdir -p "$path"
            print_status "Created directory: $path"
        fi
    fi

    echo "$path"
}

# Run the configuration wizard
run_config_wizard() {
    local env_file="$CONFIG_DIR/.env"

    # Check if config already exists
    if [ -f "$env_file" ]; then
        read -r -p "Configuration already exists at $env_file. Reconfigure? [y/N]: " reconfigure
        if [ "$reconfigure" != "y" ] && [ "$reconfigure" != "Y" ]; then
            print_status "Using existing configuration"
            return
        fi
    fi

    echo ""
    print_header "================================================================================"
    print_header "                    Arma Server Manager - Configuration"
    print_header "================================================================================"
    echo ""
    echo "This wizard will help you configure the Arma Server Manager."
    echo "Configuration will be saved to: $env_file"
    echo ""
    echo "Press Ctrl+C at any time to cancel."
    echo ""

    # SteamCMD Configuration
    print_header "--------------------------------------------------------------------------------"
    print_header "STEAMCMD CONFIGURATION"
    print_header "--------------------------------------------------------------------------------"
    echo ""

    echo "Path to the SteamCMD executable."
    echo "This is used to download mods from the Steam Workshop."
    echo "Example: /usr/games/steamcmd or ~/steamcmd/steamcmd.sh"
    echo ""
    local steamcmd_path
    steamcmd_path=$(prompt_value "STEAMCMD_PATH" "steamcmd")
    steamcmd_path="${steamcmd_path/#\~/$HOME}"
    echo ""

    echo "Steam username for Workshop downloads."
    echo "Use 'anonymous' for public mods, or your Steam username for private mods."
    echo "Note: Using a personal account may require Steam Guard authentication."
    echo ""
    local steamcmd_user
    steamcmd_user=$(prompt_value "STEAMCMD_USER" "anonymous")
    echo ""

    # Directory Configuration
    print_header "--------------------------------------------------------------------------------"
    print_header "DIRECTORY CONFIGURATION"
    print_header "--------------------------------------------------------------------------------"
    echo ""

    echo "Temporary directory for mod downloads during installation."
    echo "This directory is used to stage mods before moving them to the install directory."
    echo ""
    local mod_staging_dir
    mod_staging_dir=$(prompt_directory "MOD_STAGING_DIR" "$HOME/arma_server_manager/temp/mod_staging")
    echo ""

    echo "Directory where mods will be installed."
    echo "This is where downloaded mods are stored for use by the Arma 3 server."
    echo ""
    local mod_install_dir
    mod_install_dir=$(prompt_directory "MOD_INSTALL_DIR" "$HOME/arma_server_manager/mods")
    echo ""

    echo "Arma 3 server installation directory."
    echo "This is where the Arma 3 dedicated server is or will be installed."
    echo ""
    local arma3_install_dir
    arma3_install_dir=$(prompt_directory "ARMA3_INSTALL_DIR" "$HOME/arma_server_manager/arma3")
    echo ""

    # Create config directory and write .env file
    mkdir -p "$CONFIG_DIR"

    cat > "$env_file" << EOF
# Arma Server Manager Configuration
# Generated by install script

# SteamCMD Configuration
STEAMCMD_PATH=$steamcmd_path
STEAMCMD_USER=$steamcmd_user

# Directory Configuration
MOD_STAGING_DIR=$mod_staging_dir
MOD_INSTALL_DIR=$mod_install_dir
ARMA3_INSTALL_DIR=$arma3_install_dir

# CORS Configuration (optional)
# By default, all origins are allowed. To restrict access to specific origins,
# uncomment and set a comma-separated list of allowed origins:
# CORS_ORIGINS=http://localhost:5173,http://your-server-ip:5173
EOF

    print_header "================================================================================"
    print_status "Configuration saved to: $env_file"
    print_header "================================================================================"
    echo ""
}

main() {
    echo ""
    echo "  Arma Server Manager Installer"
    echo "  =============================="
    echo ""

    print_status "Detecting platform..."
    local platform
    platform=$(detect_platform)
    print_status "Platform: ${platform}"

    print_status "Fetching latest release..."
    local version
    version=$(get_latest_release)

    if [ -z "$version" ]; then
        print_error "Could not determine latest version"
        exit 1
    fi

    print_status "Latest version: ${version}"

    download_and_install "$platform" "$version"

    check_path

    # Run configuration wizard
    run_config_wizard

    print_status "Installation complete!"
    echo ""
    echo "  Run '${BINARY_NAME}' to start the server manager."
    echo ""
}

main "$@"
