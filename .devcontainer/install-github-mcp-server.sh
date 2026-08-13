#!/usr/bin/env bash
set -euo pipefail

version="1.9.0"
destination="${1:-/usr/local/bin/github-mcp-server}"
base_url="https://github.com/github/github-mcp-server/releases/download/v${version}"

case "$(uname -m)" in
  aarch64|arm64)
    archive="github-mcp-server_Linux_arm64.tar.gz"
    checksum="11e14ce34492b6a07ae4bc567d8773fc4cd3dd77e91daf3f9cacc88b15d840ea"
    ;;
  x86_64|amd64)
    archive="github-mcp-server_Linux_x86_64.tar.gz"
    checksum="cbf38bd3364518ccf80b6a25587d5ef11655b15d63cbb48bc066384d0b5b5964"
    ;;
  *)
    echo "Unsupported architecture for GitHub MCP Server: $(uname -m)" >&2
    exit 1
    ;;
esac

if [[ -x "$destination" ]] && "$destination" --version 2>/dev/null | grep -q "Version: $version"; then
  echo "GitHub MCP Server is current ($version)."
  exit 0
fi

download_dir="$(mktemp -d)"
trap 'rm -rf "$download_dir"' EXIT
archive_path="$download_dir/$archive"
curl -fsSL "$base_url/$archive" -o "$archive_path"
printf '%s  %s\n' "$checksum" "$archive_path" | sha256sum -c -
tar -xzf "$archive_path" -C "$download_dir" github-mcp-server

if [[ "$destination" == /usr/local/bin/* ]]; then
  sudo install -m 0755 "$download_dir/github-mcp-server" "$destination"
else
  install -D -m 0755 "$download_dir/github-mcp-server" "$destination"
fi

"$destination" --version
