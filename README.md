# Modern Game of Life

Modern Game of Life is a web implementation of a Game of Life-inspired educational experience. The repository contains a React/Vite UI, an AWS-backed game storage API, and Terraform infrastructure for deployment.

## Prerequisites

1. Node.js and npm
2. Terraform `~> 1.10`
3. AWS CLI configured for the target AWS account in `us-west-2`

## Optional dev container

The repository includes a VS Code dev container with Terraform, AWS CLI, Node.js, Chromium, and Git LFS preinstalled for a consistent local environment.

## First-time setup

1. Configure AWS credentials with `aws configure`.
2. Initialize Terraform:
   `terraform -chdir=terraform init -reconfigure`
3. Select or create a non-default Terraform workspace:
   `terraform -chdir=terraform workspace new <name>`
   or
   `terraform -chdir=terraform workspace select <name>`

Do not run Terraform in the `default` workspace.

## Common commands

1. Install UI dependencies:
   `npm --prefix src/ui ci`
2. Run UI unit tests:
   `npm --prefix src/ui run test:ci`
3. Run UI end-to-end tests:
   `npm --prefix src/ui run test:e2e:ci`
4. Run deployment preflight checks:
   `scripts/check.sh`
5. Deploy the application:
   `scripts/deploy.sh`

## Documentation

- Product requirements: `docs/modern-game-of-life-prd.md`
- Architecture: `docs/ARCHITECTURE.md`
- UI style guide: `docs/game-of-life-style-guide.md`
- Script usage: `scripts/README.md`
