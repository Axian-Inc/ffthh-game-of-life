#!/usr/bin/env bash
set -euo pipefail

UI_BUCKET="${UI_BUCKET:-}"
CONFIRM="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --bucket)
      if [[ $# -lt 2 ]]; then
        echo "error: --bucket requires a value" >&2
        exit 1
      fi
      UI_BUCKET="$2"
      shift 2
      ;;
    --confirm)
      CONFIRM="true"
      shift
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$UI_BUCKET" ]]; then
  echo "error: UI bucket must be set via UI_BUCKET or --bucket" >&2
  exit 1
fi

SYNC_CMD="aws s3 sync src/ui/dist s3://$UI_BUCKET --delete"

if [[ "$CONFIRM" != "true" ]]; then
  echo "Dry run: no changes made. To deploy, re-run with --confirm."
  echo "Would run: $SYNC_CMD"
  exit 0
fi

"$(dirname "$0")/build-ui.sh"
$SYNC_CMD
