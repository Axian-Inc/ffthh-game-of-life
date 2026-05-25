#!/usr/bin/env bash
set -euo pipefail

sudo apt-get update
sudo apt-get install -y chromium chromium-driver xvfb git-lfs

sudo mkdir -p /home/vscode/.npm
sudo chown -R vscode:vscode /home/vscode/.npm

git lfs install --skip-repo

exec_dir="$(dirname "${BASH_SOURCE[0]}")"

bash "$exec_dir/configure-opencode.sh"
bash "$exec_dir/install-ai-clis.sh"
