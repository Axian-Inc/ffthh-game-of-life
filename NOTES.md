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
