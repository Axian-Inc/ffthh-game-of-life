# Repository Guidelines

## Build, Test, and Development Commands
- **Terraform workspace rules:** never run `terraform apply` in the implicit `default` workspace. Create/select an explicit workspace (e.g., `terraform workspace new chadr`, `terraform workspace select chadr`) before planning. Include the active workspace name in every resource identifier via `locals` (e.g., `local.name_suffix = terraform.workspace`) so resources remain unique per workspace.

## Project State (Game Hub)
- React UI lives in `src/ui` and is fully built through STORY-021 with tests.
- Run UI commands from `src/ui`: `npm run dev`, `npm test`, `npm run build`.
- Deployment docs and script live in `docs/deployment.md` and `scripts/deploy.sh` (S3-only, CloudFront planned).

## Terraform (S3 Static Hosting)
- Terraform config is in `terraform/` and provisions a static website S3 bucket.
- Use an explicit workspace (never `default`). Current workspace used for deploy: `chadr`.
- Outputs: `bucket_name` and `website_endpoint`.

## Deployment Notes
- Current deployed bucket: `game-hub-ui-590316689173-chadr`.
- Current site endpoint: `http://game-hub-ui-590316689173-chadr.s3-website-us-west-2.amazonaws.com`.
- Deploy via `S3_BUCKET=... ./scripts/deploy.sh` from repo root. CloudFront invalidation runs only if `CLOUDFRONT_DISTRIBUTION_ID` is set.
