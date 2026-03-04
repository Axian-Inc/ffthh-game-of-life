# Changelog

Keep short entries that summarize user-visible or operational changes.

## Unreleased
- Added post-create career selection and play placeholder pages for new games.
- Added Playwright browser automation tests and run them before deploy.
- Added deploy/check scripts, Makefile targets, and deploy runbook.
- Added persistent game storage with local dev persistence and an AWS-backed API for deployments.
- Vendor Lambda dependencies so the games API runs on Node.js 18.
- Added UI component test coverage and enforce tests during deploy.
- Updated Terraform setup/check flow to reconfigure backend before workspace operations after backend migration changes.
