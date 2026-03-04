---
spec_id: W3-S1
title: Vitest Coverage for Wizard and Welcome Flow
wave: 3
branch: codex/w3-s1-vitest-wizard-coverage
base_branch: codex/wave-3-integration
test_commands:
  - npm --prefix src/ui run test:ci
owned_paths:
  - specs/wave-3/W3-S1-vitest-wizard-coverage.md
  - src/ui/src/components/__tests__/modals.test.jsx
  - src/ui/src/components/__tests__/pages.test.jsx
  - src/ui/src/components/__tests__/ui.test.jsx
  - src/ui/src/components/__tests__/setup-flow.test.jsx
---

# Objective
Provide comprehensive component/unit test coverage for every step and major branch in the new game workflow.

# Scope
In scope:

- Add/expand Vitest suites for wizard steps 1-5.
- Validate required controls and disabled/enabled transitions.
- Validate welcome redirect and resume entry conditions at component level.

Out of scope:

- Full browser navigation and reload assertions (handled by Playwright spec).

# Required Vitest Scenarios

1. Step 1 requires player name; avatar selection updates state.
2. Step 2 requires city selection.
3. Step 3 requires education track selection.
4. Step 4 job list is filtered by selected track.
5. Step 5 summary shows complete per-player selections.
6. `New Player` from summary appends next player setup flow.
7. `Start Game` disabled with 0 or 1 configured players; enabled at 2+.
8. Start action callback payload contains computed monthly income, debt, net worth, and lifecycle phase.
9. Resume render path uses welcome view when lifecycle phase is `started`.

# Failure and Rollback Notes

1. If tests become flaky, remove timing-sensitive assertions and restore deterministic state setup before adding new scenarios.
2. If coverage misses mandatory scenarios, block merge and add explicit assertions instead of broad snapshots.
3. If test changes mask regressions in wizard gating or payload shape, roll back those assertions and rework with targeted expectations.

# Acceptance Criteria

1. New and updated test suites are deterministic and pass in CI mode.
2. No test relies on network or wall-clock timing flakiness.
3. Snapshot tests are optional; prefer explicit assertions.

# Validation

```bash
npm --prefix src/ui run test:ci
```
