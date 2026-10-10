# Notes

## 2026-10-09 — Expand external story variety
- Task: Prevent player turns from repeatedly consuming only one or two NOAA stories.
- Why: The 14-day freshness filter was too narrow for NOAA's current publishing cadence and left only one eligible feed entry.
- What changed: Expanded the eligible article window to one year while preserving deterministic per-turn selection, and added a regression test proving ten recent stories are selected across turn keys.
- Paths: src/api/contentSources.js, src/api/contentSources.test.js, docs/content-source-policy.md, docs/ARCHITECTURE.md, CHANGELOG.md, NOTES.md
- Commands/runbooks: npm --prefix src/api test, scripts/deploy.sh

## 2026-10-09 — Remove unavailable JPL source
- Task: Remove the predictably unavailable JPL source from player-turn rotation.
- Why: JPL consistently returned HTTP 403 from AWS, causing otherwise healthy turns to display `Live source content was unavailable`.
- What changed: Restricted the active source registry to the verified NOAA National Ocean Service feed and updated source-policy and current-state documentation.
- Paths: src/api/contentSources.js, src/api/contentSources.test.js, src/api/eventGenerator.test.js, docs/content-source-policy.md, docs/ARCHITECTURE.md, docs/modern-game-of-life-prd.md, CHANGELOG.md, NOTES.md
- Commands/runbooks: npm --prefix src/api test, scripts/deploy.sh

## 2026-10-09 — Restore source-driven event generation
- Task: Restore external-source influence and make its provenance visible during player turns.
- Why: The Bedrock guardrail was evaluating the trusted event-generation instructions together with fetched content and flagging the instructions as a prompt attack, so live requests silently used generic fallback events.
- What changed: Sent trusted instructions and anonymous game state as normal Converse text while placing only the allowlisted, sanitized source payload in a `guardContent` block; strengthened the source-theme requirement; safely unwrapped Nova's single JSON code fence before strict schema validation; preserved checked-source attribution on fallback events; and labeled backup behavior in the event modal and history.
- Paths: src/api/eventGenerator.js, src/api/eventGenerator.test.js, src/ui/src/components/modals/PlayerEventModal.jsx, src/ui/src/components/modals/PlayerHistoryModal.jsx, src/ui/src/components/__tests__/app.test.jsx, src/ui/src/App.css, CHANGELOG.md, NOTES.md
- Commands/runbooks: npm --prefix src/api test, npm --prefix src/ui run test:ci, npm --prefix src/ui run build, scripts/deploy.sh

## 2026-10-09 — MGOL-206 safe fallback and operations

- Task: Keep event-backed turns running through external content and model failures while making failures observable.
- Why: A family game should not stop when an approved feed or Bedrock is unavailable, slow, blocked, or returns invalid content.
- What changed: Added a reviewed deterministic fallback catalog, strict contract revalidation, a 12-second end-to-end generation timeout with Bedrock cancellation, privacy-safe Embedded Metric Format records, and workspace-scoped alarms for errors, fallback rate, throttling, guardrail blocks, and p95 latency. Removed unused Bedrock read/control-plane IAM actions while retaining the required guardrail application permission, and scoped event-generator log writes to its managed log group.
- Paths: src/api/eventFallbacks.js, src/api/eventGenerator.js, src/api/eventGenerator.test.js, terraform/main.tf, docs/event-operations.md, October-Stories.md, docs/ARCHITECTURE.md, docs/modern-game-of-life-prd.md, CHANGELOG.md
- Commands/runbooks: npm --prefix src/api test, npm --prefix src/ui run test:ci, npm --prefix src/ui run lint, npm --prefix src/ui run build, terraform -chdir=terraform validate, terraform -chdir=terraform plan (workspace tg)
- Follow-ups: Replace the player-turn placeholder status values with the canonical persisted player state before expanding the action catalog.

## 2026-10-09 — MGOL-205 player event acknowledgment

- Task: Implement the blocking player-event experience after turn advancement.
- Why: Players need to understand the news-inspired outcome and its saved effect before the next turn is revealed.
- Where: `src/ui/src/App.jsx`, `src/ui/src/components/modals/PlayerEventModal.jsx`, `src/ui/src/components/modals/PlayerHistoryModal.jsx`, `src/ui/src/components/pages/PlayGamePage.jsx`, and related styles/tests.
- Details: Turn controls enter an announced disabled state, the completed player's turn remains visible behind a focus-trapped modal, and Continue is the only path to reveal the next player. Saved history now joins moves to their persisted events.
- Follow-up: MGOL-206 should add deterministic AWS failure fallback, bounded latency, metrics, and alarms.

Lightweight, task-focused log for what changed, why, and where.

## Template
- Date:
- Task:
- Why:
- What changed:
- Paths:
- Commands/runbooks:
- Follow-ups:

## 2026-10-09
- Task: Implement MGOL-204 event-backed turn advancement.
- Why: Generated events and bounded effects must be saved atomically with the acting player's move and survive retries, refresh, and resume.
- What changed: Added `POST /games/{id}/turns/advance`, synchronous invocation of the dedicated event generator, server-side effect validation/application, health clamping and net-worth recalculation, version-conditional DynamoDB persistence, server-derived turn keys, idempotent retry, stale conflict handling, and protected generic updates. Both UI actions now use the storage adapter's advance operation; local mode uses deterministic fallback events with the same persisted contract, and API conflicts reload current games.
- Paths: src/api/index.js, src/api/turnResolution.js, src/api/index.test.js, src/api/turnResolution.test.js, src/ui/src/App.jsx, src/ui/src/hooks/useGames.js, src/ui/src/hooks/useGames.test.jsx, src/ui/src/services/gameStorage.js, src/ui/src/services/turnEvents.js, terraform/main.tf, October-Stories.md, docs/ARCHITECTURE.md, docs/modern-game-of-life-prd.md, CHANGELOG.md
- Commands/runbooks: npm --prefix src/api test, npm --prefix src/ui run test:ci, npm --prefix src/ui run lint, npm --prefix src/ui run build, terraform -chdir=terraform validate, terraform -chdir=terraform plan (workspace tg)
- Follow-ups: MGOL-205 should block on an event acknowledgement modal before revealing the persisted next player; MGOL-206 should add AWS failure fallback, bounded total latency, metrics, and alarms.

## 2026-10-09
- Task: Implement MGOL-203 guarded Bedrock event generation.
- Why: Sanitized current content needs to become a bounded, classified player event without exposing entered identity data or granting the model browsing/tool capabilities.
- What changed: Added a dedicated Node.js 24 Lambda handler that retrieves approved content, allowlists anonymous gameplay values, invokes the configurable Nova 2 Lite profile at temperature zero, rejects invalid `LifeEvent` output, and recognizes guardrail intervention. Added a versioned Bedrock Guardrail for input prompt attacks, bidirectional harmful content, self-harm, drugs, and gambling plus IAM that requires that guardrail and limits model access. Upgraded the Terraform AWS provider to a release supporting Node.js 24.
- Paths: src/api/eventGenerator.js, src/api/eventGenerator.test.js, src/api/package.json, src/api/package-lock.json, terraform/main.tf, terraform/variables.tf, terraform/outputs.tf, terraform/.terraform.lock.hcl, October-Stories.md, docs/ARCHITECTURE.md, docs/modern-game-of-life-prd.md, CHANGELOG.md
- Commands/runbooks: npm --prefix src/api test, terraform -chdir=terraform validate, terraform -chdir=terraform plan (workspace tg)
- Follow-ups: MGOL-204 should invoke this Lambda from atomic turn advancement and persist the validated event/effect; MGOL-206 should add deterministic fallback and operational metrics.

## 2026-10-09
- Task: Implement MGOL-202 approved source retrieval.
- Why: News-driven events need a constrained, testable content boundary before any article text is sent to Bedrock.
- What changed: Added the exact JPL/NOAA source registry, deterministic per-turn selection, HTTPS and same-host redirect enforcement, a 2.5-second timeout, a 512 KiB response limit, RSS/Atom parsing, sanitization, 14-day preference, typed failures, source-policy documentation, and fixture/live-feed verification.
- Paths: src/api/contentSources.js, src/api/contentSources.test.js, src/api/package.json, docs/content-source-policy.md, October-Stories.md, docs/ARCHITECTURE.md, docs/modern-game-of-life-prd.md
- Commands/runbooks: npm --prefix src/api test, node --check src/api/contentSources.js, npm --prefix src/ui run test:ci, npm --prefix src/ui run lint, npm --prefix src/ui run build
- Follow-ups: JPL returned HTTP 403 from the development environment on 2026-10-09 and correctly maps to a typed source error; MGOL-203 should consume the sanitized result and MGOL-206 should supply the player-facing fallback.

## 2026-10-09
- Task: Implement MGOL-201 event-ready player state.
- Why: News-driven events need canonical, persisted financial and health values that can safely receive bounded effects.
- What changed: Added canonical career/city mechanics, initialized complete player state for new games, normalized legacy saves without discarding valid state, recalculated net worth, bounded health, and added game versions that increment with completed turns.
- Paths: src/ui/src/data/simulationDefinitions.js, src/ui/src/utils/playerState.js, src/ui/src/services/gameStorage.js, src/ui/src/App.jsx, src/api/index.js, October-Stories.md, docs/modern-game-of-life-prd.md, docs/ARCHITECTURE.md
- Commands/runbooks: npm --prefix src/ui run test:ci, npm --prefix src/ui run lint, npm --prefix src/ui run build, node --check src/api/index.js
- Follow-ups: Implement the no-action turn resolver and replace player-turn placeholder values with the persisted state before adding generated events.

## 2026-09-10
- Task: Make the scoped filesystem MCP security rationale easy for future maintainers to find.
- Why: The wrapper's purpose and removal criteria were distributed across historical notes, the student lab, an installer comment, and a regression test; the wrapper itself did not explain the boundary it protects.
- What changed: Added a canonical dev-container maintainer guide covering the threat model, control relationships, verification, and upgrade/removal checklist; added rationale beside the wrapper code; and linked existing documentation to the guide.
- Paths: .devcontainer/README.md, .devcontainer/run-scoped-filesystem-mcp.js, .devcontainer/install-ai-clis.sh, README.md, docs/opencode-mcp-lab.md, CHANGELOG.md, NOTES.md
- Commands/runbooks: node .devcontainer/check-scoped-filesystem-mcp.js
- Follow-ups: Use the maintainer guide and rerun the adversarial boundary check before changing the OpenCode or filesystem-server version.

## 2026-08-13
- Task: Close the OpenCode filesystem boundary bypass and test it end to end.
- Why: The filesystem server can replace command-line roots with client-advertised MCP Roots, and built-in agent permissions could override the managed global deny policy.
- What changed: Kept the checked-in OpenCode configuration MCP-free; stopped installing the GitHub MCP server during container creation; added an MCP protocol guard that makes the optional `src` and `docs` roots authoritative; locked `build` and `plan` agent permissions; corrected the override fixture; and added an adversarial protocol test that verifies `terraform/main.tf` remains denied after students configure filesystem access.
- Paths: .devcontainer/post-create.sh, .devcontainer/run-scoped-filesystem-mcp.js, .devcontainer/check-scoped-filesystem-mcp.js, .devcontainer/opencode-managed/opencode.json, .devcontainer/check-opencode-lockdown.sh, .devcontainer/check-opencode-resolved.js, README.md, opencode.json, docs/opencode-mcp-lab.md, CHANGELOG.md, NOTES.md
- Commands/runbooks: bash .devcontainer/configure-opencode.sh, bash .devcontainer/check-opencode-lockdown.sh; after the student configuration, node .devcontainer/check-scoped-filesystem-mcp.js and OpenCode before/after/boundary prompts
- Follow-ups: Restart any already-running OpenCode process after pulling the updated configuration.

## 2026-08-12
- Task: Remove VS Code extension recommendations from the dev container.
- Why: Terraform, AWS Toolkit, GitLens, Docker, Python, and Pylance UI integrations add clutter, login prompts, or update noise when their command-line tools are sufficient.
- What changed: Removed all repository-configured extension recommendations and their extension-specific settings. GitHub Copilot was not configured by this repository, so no repository entry existed to remove.
- Paths: .devcontainer/devcontainer.json, CHANGELOG.md, NOTES.md
- Commands/runbooks: Rebuild the dev container to apply the reduced extension set.
- Follow-ups: If GitHub Copilot still appears, remove or disable it in the Dev Container window and check VS Code Settings Sync or `dev.containers.defaultExtensions`.

## 2026-08-13
- Task: Turn the deferred OpenCode MCP notes into a hands-on student lab.
- Why: Students need short capability-focused activities, visible root-level configuration changes, GitHub App authentication, and an end-to-end MCP exercise.
- What changed: Enabled project config discovery under the managed namespace policy; added an optional pinned, checksum-verified GitHub MCP Server installer; ignored the instructor PEM filename; and rewrote the lab as filesystem, native planning tools, GitHub, Playwright, and a combined delivery activity with before/after tests and Codex configuration prompts. The installer is not run by the baseline container setup.
- Paths: docs/opencode-mcp-lab.md, .gitignore, .devcontainer/devcontainer.json, .devcontainer/install-github-mcp-server.sh, .devcontainer/post-create.sh, .devcontainer/check-opencode-lockdown.sh, .devcontainer/check-opencode-resolved.js, README.md, CHANGELOG.md
- Commands/runbooks: bash -n .devcontainer/*.sh, .devcontainer/install-github-mcp-server.sh <temporary-path>, .devcontainer/check-opencode-lockdown.sh, opencode debug config, opencode mcp list
- Follow-ups: Before class, supply the GitHub App IDs and PEM plus a self-contained UI issue for Activity 5; run every live MCP prompt with those credentials.

## 2026-08-13
- Task: Lock down the dev-container OpenCode harness before the MCP capability lab.
- Why: The lab needs a demonstrably chat-only baseline so later MCP additions visibly introduce bounded capabilities.
- What changed: Pinned OpenCode 1.18.18; installed a root-owned Linux managed config that allows only OpenAI, denies built-in tools, disables plugins/sharing/LSP/autoupdate, and reserves only reviewed future MCP namespaces; enabled OpenCode pure mode, disabled project config discovery and LSP downloads; removed the repository Ollama provider and default websearch; added static/resolved config checks and deferred MCP exercise guidance without installing or configuring an MCP.
- Paths: .devcontainer/opencode-managed/opencode.json, .devcontainer/configure-opencode.sh, .devcontainer/install-ai-clis.sh, .devcontainer/check-opencode-lockdown.sh, .devcontainer/devcontainer.json, opencode.json, docs/opencode-mcp-lab.md, README.md, CHANGELOG.md
- Commands/runbooks: bash -n .devcontainer/*.sh, .devcontainer/check-opencode-lockdown.sh, opencode debug config, opencode mcp list
- Follow-ups: Revalidate and implement each exercise in docs/opencode-mcp-lab.md before teaching it; no MCP is part of the current baseline.

## 2026-08-12
- Task: Remove sample screens and Git LFS from the current repository tree.
- Why: All nine reference screens are implemented, and ordinary Git Playwright baselines now provide direct visual coverage for the remaining wizard steps.
- What changed: Added deterministic baselines for Player Identity, City, Education, and Career; removed the nine LFS-backed sample pointers and their tracking rule; removed Git LFS from dev-container setup; and made the written guide, implemented UI, and Playwright snapshots the normative visual sources.
- Paths: src/ui/e2e/wizard-visual.spec.js, src/ui/e2e/__snapshots__/, docs/game-of-life-style-guide.md, docs/sample-images/, .gitattributes, .devcontainer/post-create.sh, README.md, CHANGELOG.md, NOTES.md
- Commands/runbooks: npm --prefix src/ui run test:ci, npm --prefix src/ui run test:e2e:ci, npm --prefix src/ui run build, bash -n .devcontainer/post-create.sh
- Follow-ups: Historical sample pointers and remote LFS objects remain in older commits; no history rewrite is planned.

## 2026-05-07
- Task: Document current gameplay status and next PRD implementation slice.
- Why: Future agents need a clear handoff for what is done and what to build next from the PRD.
- What changed: Added a PRD implementation tracker, documented current persisted game shape, clarified placeholder player-turn values, and pointed agents to the next simulation-foundation task.
- Paths: docs/modern-game-of-life-prd.md, docs/ARCHITECTURE.md, docs/game-of-life-style-guide.md, AGENTS.md, CHANGELOG.md, NOTES.md
- Commands/runbooks: Documentation-only change; no test command required.
- Follow-ups: Implement canonical player state initialization and no-action monthly turn resolution before building the full action picker.

## 2026-05-07
- Task: Fix OpenCode devcontainer install on Linux ARM64.
- Why: `opencode-ai` can fail during postinstall when the matching platform binary optional dependency is not present.
- What changed: Updated the AI CLI installer to select an OpenCode version with a published platform binary, install that binary explicitly with optional dependencies enabled, and repair broken installs even when the package version appears current.
- Paths: .devcontainer/install-ai-clis.sh, CHANGELOG.md, NOTES.md
- Commands/runbooks: bash -n .devcontainer/post-create.sh .devcontainer/install-ai-clis.sh .devcontainer/configure-opencode.sh

## 2026-05-07
- Task: Enable OpenCode websearch in the devcontainer.
- Why: OpenCode needs `OPENCODE_ENABLE_EXA=1` plus `permission.websearch = "allow"` for websearch to be available by default.
- What changed: Added the OpenCode Exa environment flag to the devcontainer and a post-create helper that creates or updates the container user's OpenCode config without replacing unrelated settings.
- Paths: .devcontainer/devcontainer.json, .devcontainer/post-create.sh, .devcontainer/configure-opencode.sh, README.md, CHANGELOG.md, NOTES.md
- Commands/runbooks: bash -n .devcontainer/post-create.sh .devcontainer/install-ai-clis.sh .devcontainer/configure-opencode.sh, .devcontainer/configure-opencode.sh /tmp/opencode.json

## 2026-05-07
- Task: Provision AI CLIs in the devcontainer.
- Why: Fresh devcontainer clones should have current Codex CLI and OpenCode available without host setup.
- What changed: Added post-create scripts that install apt tools, configure Git LFS, install or update `@openai/codex` and `opencode-ai` from npm only when needed, and persist npm cache downloads across rebuilds.
- Paths: .devcontainer/devcontainer.json, .devcontainer/post-create.sh, .devcontainer/install-ai-clis.sh, README.md, CHANGELOG.md, NOTES.md
- Commands/runbooks: bash -n .devcontainer/post-create.sh .devcontainer/install-ai-clis.sh, .devcontainer/install-ai-clis.sh

## 2025-02-14
- Task: Add persistent storage for games (local + AWS).
- Why: Keep game lists across sessions in dev and production.
- What changed: Added localStorage persistence with a storage abstraction, wired UI to async create/delete, and added DynamoDB + Lambda + HTTP API in Terraform for cloud persistence. Deployment now injects the API base URL into the UI build.
- Paths: src/ui/src/services/gameStorage.js, src/ui/src/hooks/useGames.js, src/ui/src/App.jsx, src/api/index.js, terraform/main.tf, terraform/outputs.tf, scripts/deploy.sh, .gitignore
- Commands/runbooks: scripts/deploy.sh
- Follow-ups: Consider auth for the games API if needed.

## 2025-02-14
- Task: Fix games API 500s in AWS.
- Why: Lambda runtime no longer bundles aws-sdk in Node.js 18.
- What changed: Added aws-sdk dependency for the Lambda bundle and ensured deploy installs API deps before Terraform packages the zip.
- Paths: src/api/package.json, src/api/package-lock.json, scripts/deploy.sh
- Commands/runbooks: scripts/deploy.sh

## 2025-02-14
- Task: Add UI component tests and gate deploys on test success.
- Why: Ensure UI changes are covered and deploys stay safe.
- What changed: Added Vitest + Testing Library, component test suites, and updated deploy script to run tests before applying infra and building the UI.
- Paths: src/ui/src/components/__tests__/, src/ui/src/setupTests.js, src/ui/vite.config.js, src/ui/package.json, src/ui/package-lock.json, scripts/deploy.sh
- Commands/runbooks: npm --prefix src/ui run test:ci, scripts/deploy.sh

## 2025-02-14
- Task: Add headless browser E2E suite.
- Why: Verify core UI flows before deploy.
- What changed: Added Playwright config + tests and wired deploy to run e2e tests after unit tests.
- Paths: src/ui/playwright.config.js, src/ui/e2e/app.spec.js, src/ui/package.json, src/ui/package-lock.json, scripts/deploy.sh
- Commands/runbooks: npm --prefix src/ui run test:e2e:ci, scripts/deploy.sh

## 2025-02-14
- Task: Add Start New Game and Play Game pages.
- Why: Show career path options after game creation and transition into play.
- What changed: Added new pages, updated view flow to move from create modal to career selection and play placeholder, updated styles and tests.
- Paths: src/ui/src/App.jsx, src/ui/src/components/pages/StartNewGamePage.jsx, src/ui/src/components/pages/PlayGamePage.jsx, src/ui/src/App.css, src/ui/src/hooks/useModalState.js, src/ui/e2e/app.spec.js, src/ui/src/components/__tests__/pages.test.jsx
- Commands/runbooks: npm --prefix src/ui run test:ci, npm --prefix src/ui run test:e2e:ci

## 2026-03-20
- Task: Simplify repository operations and documentation.
- Why: Keep the repo focused on product code, standard development, and deployment workflows.
- What changed: Removed obsolete workflow scaffolding, trimmed the scripts README to the supported commands, and refreshed the top-level docs/devcontainer guidance to describe the project as a standard application repository.
- Paths: README.md, .devcontainer/devcontainer.json, scripts/README.md, CHANGELOG.md, NOTES.md, docs/game-of-life-style-guide.md, docs/modern-game-of-life-prd.md
- Commands/runbooks: scripts/check.sh, scripts/deploy.sh

## 2026-03-20
- Task: Shorten deployment runtime.
- Why: Playwright browser coverage was making routine deploys slower than needed.
- What changed: Removed the deploy-time Playwright gate so `scripts/deploy.sh` now runs preflight checks, installs dependencies, runs UI unit tests, and proceeds with Terraform/build/publish steps without forcing the E2E suite.
- Paths: scripts/deploy.sh, scripts/README.md, CHANGELOG.md, NOTES.md
- Commands/runbooks: scripts/deploy.sh, npm --prefix src/ui run test:e2e:ci

## 2026-04-04
- Task: Add persisted turn actions and player-scoped history in play mode.
- Why: The player-turn screen now needs real save-state mutation and a way to review each active player's recorded moves.
- What changed: Wired both `Choose Action` and `Pass` to record a saved move and advance seat order, normalized legacy saves that do not yet include move history, and added a `See History` modal scoped to the current active player. Updated the architecture/style-guide docs to describe the live behavior instead of the earlier placeholder-only turn screen.
- Paths: src/ui/src/App.jsx, src/ui/src/services/gameStorage.js, src/ui/src/components/modals/PlayerHistoryModal.jsx, src/ui/src/components/modals/ModalManager.jsx, src/ui/src/hooks/useModalState.js, docs/ARCHITECTURE.md, docs/game-of-life-style-guide.md, CHANGELOG.md, NOTES.md
- Commands/runbooks: npm --prefix src/ui test -- --run, npm --prefix src/ui run build
