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

## Headless browser testing

The dev container includes Chromium + chromedriver + Xvfb for running headless UI tests locally.
`CHROME_BIN` is set to `/usr/bin/chromium`.

Playwright E2E tests: `npm --prefix src/ui run test:e2e` (CI: `npm --prefix src/ui run test:e2e:ci`).

# Architecture

See `ARCHITECTURE.md` for system design and data flow.
