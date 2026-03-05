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
Provide deterministic component/unit coverage for all five wizard steps and the Welcome entry screen defined in Wave 1.

# Scope
In scope:

- Add/expand Vitest suites for wizard steps 1-5.
- Validate required controls, card counts, section labels, and disabled/enabled transitions.
- Validate welcome redirect and resume entry conditions at component level.

Out of scope:

- Full browser navigation/reload assertions (Playwright).
- Main Game Status board fidelity assertions.

# Required Vitest Scenarios
1. Step 1 requires player name + persona selection before Next enables.
2. Step 2 renders exactly 3 city cards and requires one selection.
3. Step 3 renders exactly 3 education track cards and requires one selection.
4. Step 4 renders only jobs for selected track (3 cards shown at a time).
5. Step 5 summary shows avatar, name, city, education, and job for each configured player.
6. `+ New Player` from Step 5 returns to Step 1 while retaining existing players.
7. `Start Game` is disabled when configured players < 2 and enabled at 2+.
8. Start callback payload contains setup selections for all configured players.
9. Resume render path for `lifecycle.phase=started` shows Welcome screen, not setup.
10. Welcome page renders required sections in order: `A Month at a Time`, `Choices Matter`, quote block, `Life Happens`.

# Failure and Rollback Notes
1. If tests are flaky, remove timing-sensitive assertions and use deterministic setup data.
2. If tests miss mandatory scenarios, block merge.
3. If assertions are too broad (snapshot-only), replace with explicit semantic checks.

# Acceptance Criteria
1. All required scenarios pass in CI mode.
2. No test depends on network or wall-clock timing.
3. No tests require final main status board implementation.

# Validation
```bash
npm --prefix src/ui run test:ci
```
