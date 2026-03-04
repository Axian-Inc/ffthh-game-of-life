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
Create end-to-end browser coverage for the complete wizard-start-welcome-resume flow.

# Scope
In scope:

- Extend/replace Playwright flow to cover all wizard steps and persistence behavior.
- Assert data remains intact after reload and resume.

Out of scope:

- Unit-level edge-case validation (covered in Vitest).

# Required E2E Scenarios

1. Create a new game through all 5 wizard steps.
2. Configure at least 2 players with different city/track/job combinations.
3. Verify Step 5 summary displays selected values before start.
4. Click `Start Game` and verify Welcome page is shown.
5. Reload and verify game card remains resumable.
6. Click Resume and verify welcome screen is shown again.
7. Verify player choices remain intact in visible UI summary elements.
8. Delete created game and verify cleanup.

# Environment Requirements

1. Run in dev container with Chromium available.
2. Keep `CHROME_BIN` handling compatible with current repo scripts.

# Failure and Rollback Notes

1. If E2E flow is nondeterministic, roll back to the last stable scenario and reintroduce steps with explicit waits on UI state.
2. If test data leaks across runs, block merge until cleanup assertions and teardown reliability are restored.
3. If Chromium/runtime compatibility breaks in CI, revert config deltas and restore known-good `playwright.config.js` behavior before expanding coverage.

# Acceptance Criteria

1. Test is deterministic and self-cleaning.
2. Test does not depend on pre-seeded games.
3. E2E command in frontmatter passes from repo root.

# Validation

```bash
npm --prefix src/ui run test:e2e:ci
```
