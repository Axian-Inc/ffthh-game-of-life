# Scripts

## Requirements
- Terraform `~> 1.10`
- AWS CLI configured for the target AWS account in `us-west-2`
- Node.js and npm

## Optional environment
- Copy `.env.example` to `.env` and set any values you want to override.

## Available scripts
- `scripts/check.sh`
  - Verifies required tools, AWS configuration, Terraform backend access, and that the active Terraform workspace is not `default`.
- `scripts/deploy.sh`
  - Runs preflight checks, installs dependencies, executes UI unit tests, applies Terraform, builds the UI, syncs the build to S3, and invalidates CloudFront.

## Typical usage
- Run preflight checks:
  - `scripts/check.sh`
- Deploy the application:
  - `scripts/deploy.sh`
