#!/usr/bin/env bash
set -euo pipefail

sudo apt-get update
sudo apt-get install -y chromium chromium-driver xvfb git-lfs

sudo mkdir -p /home/vscode/.npm
sudo chown -R vscode:vscode /home/vscode/.npm

git lfs install --skip-repo

bash "$(dirname "${BASH_SOURCE[0]}")/install-ai-clis.sh"
