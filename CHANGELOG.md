# Changelog

Keep short entries that summarize user-visible or operational changes.

## Unreleased
- Expanded external-story selection from 14 days to a rolling one-year pool so NOAA's publication cadence provides substantially more variety between player turns.
- Removed the JPL feed from live rotation after persistent HTTP 403 responses so turns use the verified NOAA feed instead of predictably showing source-unavailable fallbacks.
- Fixed live player events so only external source content is selectively evaluated by the Bedrock guardrail, preventing trusted event instructions from causing false-positive fallbacks; safely accepts Nova's single JSON code fence while retaining strict schema validation; and makes fallback screens identify the external source that was checked.
- Added deterministic reviewed fallbacks for source, Bedrock, guardrail, timeout, parse, and schema failures with a 12-second total generation budget.
- Added privacy-safe CloudWatch event metrics and workspace-scoped alarms for Lambda errors, fallback rate, Bedrock throttling, guardrail blocks, and p95 latency.
- Reduced the event-generator role to guarded model invocation, its required scoped guardrail application, and scoped log writing permissions.
- Added a required, accessible event acknowledgment modal with outcome, metric change, resulting value, and source attribution.
- Kept the completing player visible until acknowledgment and disabled every turn control while an event is generated.
- Added persisted life-event details to player history and strengthened the Bedrock prompt's supportive-language requirement.
- Added atomic, idempotent turn advancement that generates and persists bounded events in AWS, applies their player effects, reloads stale clients, protects turn state from generic updates, and provides deterministic contract-compatible local events.
- Added a dedicated Node.js 24 player-event Lambda using guarded Nova 2 Lite inference, anonymous prompts, strict bounded `LifeEvent` validation, and least-privilege Bedrock access with no agents or tools.
- Added a reviewed JPL/NOAA RSS allowlist and hardened server-side content retrieval with deterministic selection, sanitization, recency filtering, strict redirect/size/timeout controls, and typed errors for future generated events.
- Added canonical career/city simulation definitions, complete persisted starting player state, legacy-save normalization, net-worth and health invariants, and game version tracking.
- Centralized the scoped filesystem MCP threat model, maintenance guidance, and upgrade checks in the dev-container documentation and beside the protocol guard.
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
