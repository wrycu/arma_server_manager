#!/bin/bash
# Arma Server Manager - Unix Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/wrycu/arma_server_manager/main/install.sh | bash

set -e

REPO="wrycu/arma_server_manager"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"
BINARY_NAME="arma_server_manager"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
    if [ -f "$temp_dir/$BINARY_NAME" ]; then
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

    print_status "Installation complete!"
    echo ""
    echo "  Run '${BINARY_NAME}' to start the server manager."
    echo ""
}

main "$@"
