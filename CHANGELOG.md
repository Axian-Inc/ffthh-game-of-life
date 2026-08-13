# Changelog

Keep short entries that summarize user-visible or operational changes.

## Unreleased
- Left the OpenCode baseline MCP-free, enforced the optional filesystem MCP boundary independently of client Roots, locked built-in agent permission overrides, and documented the Codex-configure/OpenCode-test student workflow.
- Reworked the OpenCode MCP lab into five concise, test-driven activities; enabled visible project-root MCP configuration; and added an optional pinned, checksum-verified GitHub MCP Server installer for read-only GitHub App authentication.
- Removed all dev-container VS Code extension recommendations to eliminate UI clutter, login prompts, and extension update noise.
- Locked the dev-container OpenCode harness to OpenAI-backed chat, denied built-in tools, plugins, sharing, and OpenCode LSPs through managed configuration, and documented deferred MCP exercises without enabling them.
- Removed the current tree's Git LFS dependency and retired the original sample screens after adding Playwright baselines for every New Game wizard step.
- Documented the current gameplay implementation status and next PRD-aligned simulation slice for future agents.
- Fixed devcontainer OpenCode install reliability on Linux ARM64 by explicitly installing the matching platform binary package.
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
