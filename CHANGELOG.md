# Changelog

Keep short entries that summarize user-visible or operational changes.

## Unreleased
- Retired Wave 0 spec scaffolding by deleting `specs/wave-0/*` and updating wave documentation to active waves 1-3 only.
- Added post-create career selection and play placeholder pages for new games.
- Added Playwright browser automation tests and run them before deploy.
- Added deploy/check scripts, Makefile targets, and deploy runbook.
- Added persistent game storage with local dev persistence and an AWS-backed API for deployments.
- Vendor Lambda dependencies so the games API runs on Node.js 18.
- Added UI component test coverage and enforce tests during deploy.
- Updated Terraform setup/check flow to reconfigure backend before workspace operations after backend migration changes.
- Added GitHub CLI (`gh`) to the dev container so agents can create PRs during multi-spec waves.
