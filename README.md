# WARNING!
DO NOT RUN THIS PROJECT OUTSIDE A DEV CONTAINER (or at least, the Codex portion of it).

# Getting Started

This repository is meant to be opened in a VS Code Dev Container volume rather than run directly on your host machine.

## Prerequisites

1. Docker
1. VS Code
1. VS Code Dev Containers extension
1. OpenAI Codex account token
1. AWS credentials for the L&D environment

## First-Time Setup on Your Host Machine

1. Open a new VS Code window.
1. Open the Command Palette and run `Dev Containers: Clone Repository in Container Volume`.
   - Depending on your VS Code version, this may instead appear as `Dev Containers: Open Repository in Container Volume`.
1. Select the `axian-inc/ffthh-game-of-life` repository.
1. Select the `main` branch unless you have been told to use a different branch (many labs will have a starting branch like `march_start`).

## First-Time Setup Inside the Dev Container

1. Open a fresh terminal in the dev container.
1. Run `codex` and complete the sign-in flow from inside the dev container.
1. Run `aws configure` and enter your AWS access key details for the L&D environment.
   - Set the default region to `us-west-2`.
1. Create a new Git branch with your name in it.
1. Change to the `terraform` directory and run `terraform init -reconfigure`.
1. Run `terraform workspace new {your initials}` or, if it already exists, `terraform workspace select {your initials}`.
   - Do not run Terraform in the `default` workspace.
   - If you pulled recent backend changes and see a backend initialization error, re-run `terraform init -reconfigure` before creating or selecting a workspace.
   - The Terraform setup is intended to give each workspace uniquely named resources so developers do not collide with each other.

## Start Developing

Run `codex --yolo` inside the dev container to get started.

The `--yolo` flag allows Codex to run without restrictions, which is why development must happen inside the container.

## Headless browser testing

The dev container includes Chromium + chromedriver + Xvfb for running headless UI tests locally.
`CHROME_BIN` is set to `/usr/bin/chromium`.

Playwright E2E tests: `npm --prefix src/ui run test:e2e` (CI: `npm --prefix src/ui run test:e2e:ci`).

# Architecture

See `ARCHITECTURE.md` for system design and data flow.
