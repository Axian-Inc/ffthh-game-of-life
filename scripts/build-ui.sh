#!/usr/bin/env bash
set -euo pipefail

cd src/ui
npm ci
npm run build
