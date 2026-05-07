# Changelog

Keep short entries that summarize user-visible or operational changes.

## Unreleased
- Enabled OpenCode websearch by default in the devcontainer.
- Added devcontainer setup for current Codex CLI and OpenCode installs with a persistent npm cache.
- Added a two-step play flow with a welcome screen, persisted turn advancement for `Choose Action` and `Pass`, and a player-scoped move-history modal.
- Added Playwright browser automation tests for manual and CI use.
- Added deploy/check scripts, Makefile targets, and deploy runbook.
- Added persistent game storage with local dev persistence and an AWS-backed API for deployments.
- Vendor Lambda dependencies so the games API runs on Node.js 18.
- Added UI component test coverage and enforce tests during deploy.
- Updated Terraform setup/check flow to reconfigure backend before workspace operations after backend migration changes.
- Simplified repository documentation and tooling to focus on standard development and deployment workflows.
- Removed the Playwright deploy gate so deployments only require the unit test pass.
