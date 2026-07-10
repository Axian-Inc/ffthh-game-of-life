# Modern Game of Life Repository Guidelines
- This repository is an implementation of the Modern Game of Life, a variant of the Hasbro board Game of Life adapted for the web and as an educational tool.
- Product Requirements Document is found at `./docs/modern-game-of-life-prd.md`
- Architecture document is found at `./docs/ARCHITECTURE.md`
- Game of Life UI style guide is found at `./docs/game-of-life-style-guide.md`

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
- Start with `docs/modern-game-of-life-prd.md` section 11 for the current implementation status and the recommended next product slice.
- `NOTES.md` for task-level “what/why/where”.
- `CHANGELOG.md` for user-visible and operational changes.
- `scripts/README.md` for deploy prerequisites and usage.

## Token Saver MCP
- When repository context can be gathered by the Token Saver MCP server, agents must use the MCP server instead of directly reading broad docs or file sets.
- Use `repo_context_summary` or `repo://overview` for general repo orientation and current implementation status.
- Use `docs_digest` or `repo://prd-status` for PRD status, current product slice, architecture, style, deploy, notes, or changelog summaries.
- Use `task_brief` for task-specific orientation before planning or implementing non-trivial work.
- Use `code_area_map` before exploring a broad code area such as `ui`, `simulation`, `api`, `terraform`, `deploy`, `tests`, or `docs`.
- Use `compact_files` when summarizing specific files or directories without needing exact full contents.
- If the MCP server is unavailable, fails, lacks the needed detail, or exact file contents are required for editing/debugging/line references, agents may use normal reads/searches after briefly stating the fallback reason.
