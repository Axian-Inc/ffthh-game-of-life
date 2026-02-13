# WARNING!
DO NOT RUN THIS PROJECT OUTSIDE A DEV CONTAINER (or at least, the Codex portion of it)

# Pre-Requisites

1. Docker
1. VS Code w/Dev Containers extension 
1. OpenAI Codex Account Token 
1. AWS Key

# INITIAL SETUP (Outside Dev Container)

1. Open a new VS Code window and use the Dev Containers extension to "Clone Repository in Container Volume"
1. Find the `axian-inc/ffthh-game-of-life` repository, and select the `main` branch
1. Install & run Codex CLI on your local machine, and go through Web UI user authentication
    - Example: `brew install codex` or  `npm install -g @openai/codex`

    - NOTE: We’ll only be running codex to enable auth, you won’t need many of its features on the Host OS.
1. On Mac and Windows find and copy `~/.codex/auth.json` (we will be copying it to your dev container)

# INITIAL SETUP (In Dev Container)
1. Open a fresh terminal and run `aws configure` and follow the prompts to setup the AWS CLI with your access token for the L&D environment. Be sure to set the region to us-west-2
1. Copy your Codex `auth.json` from your host machine to this exact directory in your container: `~/.codex/auth.json`
1. Create a new branch with your name in it
1. Navigate to `terraform` directory and run `terraform init`
1. Run `terraform workspace new {your initials}`. Ensure that you are on this workspace when you run terraform commands. 

    - There are instructions in the AGENT.MD file for Codex to try and enforce this, as well as for codex to ensure the workspace name is in all deployed resources. This should ensure everyone can deploy their own stack without conflicts with each other

# Developing

Simply run `codex --yolo` to get started using Codex for development

NOTE: (the `--yolo` command allows Codex to run without any restrctions, hence the container)

# Architecture

- UI: React + TypeScript app built with Vite in `src/ui`.
- Hosting: Terraform-managed S3 bucket (private) with CloudFront and Origin Access Control (OAC) in `terraform/`.
- Scripts: `scripts/build-ui.sh` builds the UI; `scripts/deploy-ui.sh` builds and syncs to S3 (requires explicit confirmation).

# Local Setup

1. Enter the UI directory: `cd src/ui`
2. Install dependencies: `npm install`
3. Run the dev server: `npm run dev`
4. Open the Vite URL printed in your terminal (typically `http://localhost:5173/`).

# Deployment

## Terraform (Infrastructure)

1. `cd terraform`
2. Ensure a non-default workspace is selected:
   - `terraform workspace list`
   - `terraform workspace select <your-workspace>` (or `terraform workspace new <your-workspace>`)
3. `terraform init`
4. `terraform plan`
5. `terraform apply`

Outputs include the CloudFront distribution domain for the site.

## UI Build + Upload

1. Build only: `./scripts/build-ui.sh`
2. Deploy (safe by default; shows the command without `--confirm`):
   - Dry run: `./scripts/deploy-ui.sh --bucket <bucket-name>`
   - Deploy: `./scripts/deploy-ui.sh --bucket <bucket-name> --confirm`

## CloudFront Cache Refresh

After deploy, invalidate CloudFront to refresh cached assets:

```
aws cloudfront create-invalidation --distribution-id <distribution-id> --paths "/*"
```
