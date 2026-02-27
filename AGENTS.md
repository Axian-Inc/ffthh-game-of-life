# Repository Guidelines

## Build, Test, and Development Commands
- **Terraform workspace rules:** never run `terraform apply` in the implicit `default` workspace. Ensure you never apply terraform if the workspace is still `default`. Include the active workspace name in every resource identifier via `locals` (e.g., `local.name_suffix = terraform.workspace`) so resources remain unique per workspace.

## Quick Deploy (static UI to S3 + CloudFront)
- Preferred: run `scripts/deploy.sh` from repo root.
- Manual steps (if needed):
  - `terraform -chdir=terraform init`
  - `terraform -chdir=terraform workspace list` (verify `*` is not `default`)
  - `terraform -chdir=terraform apply -auto-approve`
  - `npm --prefix src/ui ci`
  - `npm --prefix src/ui run build`
  - `BUCKET=$(terraform -chdir=terraform output -raw app_bucket_name)`
  - `DIST_ID=$(terraform -chdir=terraform output -raw cloudfront_distribution_id)`
  - `aws s3 sync src/ui/dist s3://$BUCKET --delete`
  - `aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"`
  - `terraform -chdir=terraform output -raw cloudfront_domain_name`

## Docs for Fast Context
- `NOTES.md` for task-level “what/why/where”.
- `CHANGELOG.md` for user-visible and operational changes.
- `scripts/README.md` for deploy prerequisites and usage.
