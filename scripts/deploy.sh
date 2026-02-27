#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tf_dir="$repo_root/terraform"
ui_dir="$repo_root/src/ui"

if [[ -f "$repo_root/.env" ]]; then
  set -a
  . "$repo_root/.env"
  set +a
fi

"$repo_root/scripts/check.sh"

export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
export CHROME_BIN="${CHROME_BIN:-/usr/bin/chromium}"

if [[ -f "$repo_root/src/api/package.json" ]]; then
  npm --prefix "$repo_root/src/api" ci
fi

npm --prefix "$ui_dir" ci
npm --prefix "$ui_dir" run test:ci
npm --prefix "$ui_dir" run test:e2e:ci

workspace="$(terraform -chdir="$tf_dir" workspace show)"
if [[ "$workspace" == "default" ]]; then
  echo "Refusing to deploy from Terraform default workspace." >&2
  echo "Select or create a workspace, then retry." >&2
  exit 1
fi

terraform -chdir="$tf_dir" apply -auto-approve

api_base_url="$(terraform -chdir="$tf_dir" output -raw api_base_url)"
VITE_API_BASE_URL="$api_base_url" npm --prefix "$ui_dir" run build

bucket="$(terraform -chdir="$tf_dir" output -raw app_bucket_name)"
dist_id="$(terraform -chdir="$tf_dir" output -raw cloudfront_distribution_id)"
domain="$(terraform -chdir="$tf_dir" output -raw cloudfront_domain_name)"

aws s3 sync "$ui_dir/dist" "s3://$bucket" --delete
aws cloudfront create-invalidation --distribution-id "$dist_id" --paths "/*" >/dev/null

echo "Deployed to: https://$domain"
