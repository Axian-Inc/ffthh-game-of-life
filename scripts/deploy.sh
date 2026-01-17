#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
UI_DIR="$ROOT_DIR/src/ui"

: "${S3_BUCKET:?S3_BUCKET is required}"
: "${CLOUDFRONT_DISTRIBUTION_ID:?CLOUDFRONT_DISTRIBUTION_ID is required}"

cd "$UI_DIR"

npm install
npm run build

aws s3 sync dist/ "s3://$S3_BUCKET" --delete
aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths "/*"

echo "Deployment complete."
