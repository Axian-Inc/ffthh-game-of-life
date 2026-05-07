# Notes

Lightweight, task-focused log for what changed, why, and where.

## Template
- Date:
- Task:
- Why:
- What changed:
- Paths:
- Commands/runbooks:
- Follow-ups:

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
