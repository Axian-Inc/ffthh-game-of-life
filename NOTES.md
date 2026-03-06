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

## 2026-03-06
- Task: Refresh Wave 1 specs for exact high-fidelity Screen 1-7 reruns.
- Why: The existing Wave 1 contracts enforced behavior but not the actual visual anatomy shown in the reference screenshots.
- What changed: Rewrote the Wave 1 specs to separate canonical data from UI presentation, added a new `W1-S4` home-screen spec, added per-surface screenshot-test requirements, and updated the style guide plus dispatch docs to encode exact Screen 1-7 expectations.
- Paths: docs/game-of-life-style-guide.md, specs/README.md, specs/OPERATOR_WAVE_DISPATCH_RUNBOOK.md, specs/wave-1/W1-S1-setup-data-contracts.md, specs/wave-1/W1-S2-wizard-modal-ui.md, specs/wave-1/W1-S3-welcome-screen-ui.md, specs/wave-1/W1-S4-game-hub-home-ui.md, CHANGELOG.md
- Commands/runbooks: specs/OPERATOR_WAVE_DISPATCH_RUNBOOK.md
- Follow-ups: Re-run Wave 1 on fresh branches/worktrees and use the new visual-test requirements as the merge gate.

## 2026-03-06
- Task: Simplify Wave 1 spec dispatch for operators.
- Why: The raw `codex --yolo` invocation and manual env setup were too verbose and error-prone for repeated Wave 1 launches.
- What changed: Added `scripts/spec-launch.sh` to target a spec worktree by id, infer the branch prefix, set local Playwright defaults, run `spec-dispatch` pre/finalize, and open `codex` with a short built-in prompt. Updated the operator runbook and scripts README to use the wrapper and corrected the current Wave 1 rerun base branch to `march_test`.
- Paths: scripts/spec-launch.sh, scripts/README.md, specs/OPERATOR_WAVE_DISPATCH_RUNBOOK.md, NOTES.md
- Commands/runbooks: scripts/spec-launch.sh, specs/OPERATOR_WAVE_DISPATCH_RUNBOOK.md

## 2026-03-06
- Task: Implement the desktop Wave 1 restart flow and align the spec pack.
- Why: The deployed app had Wave 1 regressions around multi-game spacing, wizard title/footer layout, Welcome routing, and multi-player save behavior, and the old four-spec Wave 1 package no longer matched the intended restart strategy.
- What changed: Reworked the app into a desktop-only six-step wizard that saves only on final submit, added summary title editing, routed Welcome back to home, fixed multi-game landing spacing, updated desktop Playwright coverage and baselines, and replaced the Wave 1 docs with a three-spec restart pack plus updated dispatch guidance.
- Paths: src/ui/src/App.jsx, src/ui/src/App.css, src/ui/src/components/forms/, src/ui/src/components/pages/PlayGamePage.jsx, src/ui/e2e/, docs/game-of-life-style-guide.md, specs/wave-1/, specs/README.md, specs/OPERATOR_WAVE_DISPATCH_RUNBOOK.md, scripts/spec-launch.sh
- Commands/runbooks: npm --prefix src/ui run test:ci, npm --prefix src/ui run build, npm --prefix src/ui exec -- playwright test --config src/ui/playwright.config.js src/ui/e2e/app.spec.js src/ui/e2e/home-visual.spec.js src/ui/e2e/welcome-visual.spec.js src/ui/e2e/wizard-visual.spec.js
