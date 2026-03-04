---
spec_id: W2-S1
title: App Flow and Route Integration
wave: 2
branch: codex/w2-s1-app-flow-integration
base_branch: codex/wave-2-integration
test_commands:
  - npm --prefix src/ui run test:ci
owned_paths:
  - specs/wave-2/W2-S1-app-flow-integration.md
  - src/ui/src/App.jsx
  - src/ui/src/hooks/useModalState.js
  - src/ui/src/components/modals/ModalManager.jsx
---

# Objective
Integrate wizard and welcome page into the app state machine and URL routing so Start Game and Resume follow the correct lifecycle.

# Scope
In scope:

- Replace old setup flow wiring with wizard flow wiring.
- Route to welcome entry after game start.
- Route resume to welcome for started games with saved setup.

Out of scope:

- Datastore serialization details.
- Catalog constants.
- Unit/E2E test file additions.

# Flow Rules

1. Start from home `New Game` -> open wizard modal.
2. Wizard `Start Game` transitions to app view `play` and renders Welcome page.
3. `Resume` from home for started game routes to Welcome page, not setup modal.
4. Resume for incomplete setup game routes back to wizard/setup flow.
5. URL model remains under `/games/:id/play` for welcome entry (no new endpoint required).

# State Rules

1. Add lifecycle read checks using `game.lifecycle.phase`.
2. Expected phases:
   - `setup-in-progress`
   - `started`
3. Start transition sets in-memory active game with `phase=started` and `startedAt` present.

# Failure and Rollback Notes

1. If app flow enters the legacy setup page, roll back routing integration changes and reapply with lifecycle phase guards.
2. If resume routing misclassifies lifecycle phases, block merge until phase checks are deterministic and covered by tests.
3. If `/games/:id/play` refresh loses welcome state, revert recent route-state coupling changes and restore stable state initialization first.

# Acceptance Criteria

1. App never opens legacy one-screen career setup page.
2. Start from wizard always lands on Welcome page.
3. Resume behavior depends on saved lifecycle phase.
4. Browser refresh on `/games/:id/play` retains welcome view when game started.

# Validation

```bash
npm --prefix src/ui run test:ci
```
