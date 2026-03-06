---
spec_id: W3-S2
title: Playwright End-to-End Workflow Coverage
wave: 3
branch: codex/w3-s2-playwright-workflow-coverage
base_branch: codex/wave-3-integration
test_commands:
  - npm --prefix src/ui run test:e2e:ci
owned_paths:
  - specs/wave-3/W3-S2-playwright-workflow-coverage.md
  - src/ui/e2e/app.spec.js
  - src/ui/playwright.config.js
---

# Objective
Create end-to-end browser coverage for the complete wizard -> welcome -> resume workflow defined by high-fidelity screens 1-7.

# Scope
In scope:

- Cover full 5-step wizard flow and summary start behavior.
- Assert Welcome page structure after Start and Resume.
- Assert created game remains resumable and deletable.

Out of scope:

- Pixel-perfect screenshot diffing for Main Game Status (screen 8).
- Detailed simulation board mechanics.

# Required E2E Scenarios
1. Open home screen and verify hero + `New Game` CTA are visible.
2. Start new game and complete all five wizard steps.
3. Configure at least 2 players with different city/track/job combinations.
4. Verify Step 5 summary rows show chosen values before start.
5. Click `Start Game` and verify Welcome page appears (heading + required sections).
6. Click `Let's Begin!` and verify app moves to current play destination (placeholder allowed).
7. Return home, click Resume, and verify Welcome page appears again for started game.
8. Delete the created game and verify cleanup.

# Optional Visual Assertions
Where stable in CI, assert key UI structure using either:

- Playwright screenshot snapshots for screens 1-7 at fixed viewport, or
- strict locator assertions for section order/card labels when snapshot infra is unstable.

# Environment Requirements
1. Run in dev container with Chromium available.
2. Keep `CHROME_BIN` handling compatible with current scripts.
3. Use deterministic viewport and clear localStorage at test start.

# Failure and Rollback Notes
1. If flow is nondeterministic, revert to last stable flow and reintroduce steps with explicit waits.
2. If test data leaks, block merge until cleanup is deterministic.
3. If Chromium/runtime compatibility breaks in CI, revert config changes and restore known-good setup before expanding assertions.

# Acceptance Criteria
1. Test is deterministic and self-cleaning.
2. Test does not depend on pre-seeded games.
3. E2E command in frontmatter passes from repo root.
4. Flow validates screens 1-7 structure without requiring screen 8 fidelity.

# Validation
```bash
npm --prefix src/ui run test:e2e:ci
```
