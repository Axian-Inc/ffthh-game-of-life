#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tf_dir="$repo_root/terraform"

if [[ -f "$repo_root/.env" ]]; then
  set -a
  . "$repo_root/.env"
  set +a
fi

for tool in aws terraform npm; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Missing required tool: $tool" >&2
    exit 1
  fi
done

region="${AWS_REGION:-${AWS_DEFAULT_REGION:-$(aws configure get region 2>/dev/null || true)}}"
if [[ -z "$region" ]]; then
  echo "AWS region is not set. Configure it or set AWS_REGION." >&2
  exit 1
fi
if [[ "$region" != "us-west-2" ]]; then
  echo "AWS region must be us-west-2. Current: $region" >&2
  exit 1
fi

if ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "AWS credentials are not valid. Run aws configure." >&2
  exit 1
fi

if ! terraform -chdir="$tf_dir" init -reconfigure -input=false >/dev/null; then
  echo "Terraform backend init failed." >&2
  echo "If backend settings recently changed, run:" >&2
  echo "  terraform -chdir=$tf_dir init -reconfigure" >&2
  exit 1
fi
workspace="$(terraform -chdir="$tf_dir" workspace show)"
if [[ "$workspace" == "default" ]]; then
  echo "Terraform workspace is default. Select or create a workspace." >&2
  exit 1
fi

echo "OK: tools, AWS config, and Terraform workspace look good ($workspace, $region)."
