# Changelog

Keep short entries that summarize user-visible or operational changes.

## Unreleased
- Added a repo-local Codex hook logger and `scripts/timeline.sh` to inspect recent Codex activity as a timeline.
- Added playable turn-taking with monthly simulation, action selection, turn summaries, and pass-control flow.
- Added post-create career selection and play placeholder pages for new games.
- Added Playwright browser automation tests for manual and CI use.
- Added deploy/check scripts, Makefile targets, and deploy runbook.
- Added persistent game storage with local dev persistence and an AWS-backed API for deployments.
- Vendor Lambda dependencies so the games API runs on Node.js 18.
- Added UI component test coverage and enforce tests during deploy.
- Updated Terraform setup/check flow to reconfigure backend before workspace operations after backend migration changes.
- Simplified repository documentation and tooling to focus on standard development and deployment workflows.
- Removed the Playwright deploy gate so deployments only require the unit test pass.
