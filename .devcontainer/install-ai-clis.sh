#!/usr/bin/env bash
set -euo pipefail

required_tools=(node npm)
for tool in "${required_tools[@]}"; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Missing required tool: $tool" >&2
    exit 1
  fi
done

installed_version() {
  local package_name="$1"

  if ! npm list -g "$package_name" --depth=0 --json 2>/dev/null \
    | PACKAGE_NAME="$package_name" node -e '
const fs = require("fs");
const input = fs.readFileSync(0, "utf8");
const packageName = process.env.PACKAGE_NAME;

try {
  const parsed = JSON.parse(input);
  const version = parsed.dependencies?.[packageName]?.version;
  if (version) {
    process.stdout.write(version);
  }
} catch {
  process.exit(0);
}
'; then
    true
  fi
}

install_specs=()

opencode_platform_package() {
  local platform
  local arch

  platform="$(node -p 'process.platform')"
  arch="$(node -p 'process.arch')"

  case "$platform-$arch" in
    linux-arm64)
      if ldd --version 2>&1 | grep -qi musl; then
        echo "opencode-linux-arm64-musl"
      else
        echo "opencode-linux-arm64"
      fi
      ;;
    linux-x64)
      if ldd --version 2>&1 | grep -qi musl; then
        echo "opencode-linux-x64-musl"
      else
        echo "opencode-linux-x64"
      fi
      ;;
    darwin-arm64)
      echo "opencode-darwin-arm64"
      ;;
    darwin-x64)
      echo "opencode-darwin-x64"
      ;;
    win32-x64)
      echo "opencode-windows-x64"
      ;;
    win32-arm64)
      echo "opencode-windows-arm64"
      ;;
  esac
}

latest_opencode_version() {
  local latest_version
  local platform_package
  local candidate

  latest_version="$(npm view opencode-ai version)"
  platform_package="$(opencode_platform_package)"

  if [[ -z "$platform_package" ]]; then
    echo "$latest_version"
    return
  fi

  if npm view "$platform_package@$latest_version" version >/dev/null 2>&1; then
    echo "$latest_version"
    return
  fi

  while IFS= read -r candidate; do
    if npm view "$platform_package@$candidate" version >/dev/null 2>&1; then
      echo "$candidate"
      return
    fi
  done < <(npm view opencode-ai versions --json | node -e '
const fs = require("fs");
const versions = JSON.parse(fs.readFileSync(0, "utf8"));
for (const version of versions.slice(-20).reverse()) {
  console.log(version);
}
')

  echo "No OpenCode version with $platform_package available." >&2
  return 1
}

for package_name in "@openai/codex"; do
  latest_version="$(npm view "$package_name" version)"
  current_version="$(installed_version "$package_name")"

  if [[ "$current_version" == "$latest_version" ]]; then
    echo "$package_name is current ($current_version)."
    continue
  fi

  if [[ -z "$current_version" ]]; then
    echo "$package_name is not installed. Will install $latest_version."
  else
    echo "$package_name is $current_version. Will update to $latest_version."
  fi

  install_specs+=("$package_name@$latest_version")
done

if (( ${#install_specs[@]} > 0 )); then
  npm install -g --no-audit --no-fund --prefer-offline "${install_specs[@]}"
fi

opencode_version="$(latest_opencode_version)"
opencode_current_version="$(installed_version opencode-ai)"
opencode_platform="$(opencode_platform_package)"
opencode_install_specs=("opencode-ai@$opencode_version")

if [[ -n "$opencode_platform" ]]; then
  opencode_install_specs+=("$opencode_platform@$opencode_version")
  echo "OpenCode platform package: $opencode_platform@$opencode_version."
fi

if [[ "$opencode_current_version" == "$opencode_version" ]] \
  && command -v opencode >/dev/null 2>&1 \
  && opencode --version >/dev/null 2>&1; then
  echo "opencode-ai is current ($opencode_current_version)."
else
  if [[ -z "$opencode_current_version" ]]; then
    echo "opencode-ai is not installed. Will install $opencode_version."
  elif [[ "$opencode_current_version" == "$opencode_version" ]]; then
    echo "opencode-ai is $opencode_current_version but the opencode binary is not working. Will reinstall $opencode_version."
  else
    echo "opencode-ai is $opencode_current_version. Will update to $opencode_version."
  fi

  npm install -g --no-audit --no-fund --include=optional "${opencode_install_specs[@]}"
fi

codex --version
opencode --version
