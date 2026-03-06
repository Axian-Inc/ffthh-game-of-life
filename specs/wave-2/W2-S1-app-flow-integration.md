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
Integrate wizard and welcome pages into the app state machine and URL routing so start/resume behavior always lands in the correct lifecycle entry.

# Scope
In scope:

- Replace old setup flow wiring with wizard flow wiring.
- Route to Welcome entry after Start Game.
- Route Resume for started games to Welcome, not directly to setup.

Out of scope:

- Datastore serialization details.
- Catalog constants.
- Main Game Status screen fidelity (`docs/sample-images/8.PlayerTurn.png`).

# Flow Rules
1. Home `New Game` opens wizard modal.
2. Wizard `Start Game` transitions to app view `play` and renders Welcome page first.
3. Resume from home for started game routes to Welcome page first.
4. Resume for incomplete setup game routes back to wizard/setup flow.
5. URL model remains `/games/:id/play` for Welcome entry.
6. After Welcome CTA, app may render existing play placeholder (acceptable until later wave).

# State Rules
1. Add lifecycle checks using `game.lifecycle.phase`.
2. Expected phases:
   - `setup-in-progress`
   - `started`
3. Start transition sets active game with `phase=started` and `startedAt` present.

# Failure and Rollback Notes
1. If app flow enters legacy setup page, roll back routing integration and reapply with lifecycle guards.
2. If resume routing misclassifies lifecycle phases, block merge until deterministic.
3. If `/games/:id/play` refresh loses Welcome entry for started games, revert and restore stable route hydration.

# Acceptance Criteria
1. App never opens legacy one-screen career setup page.
2. Start from wizard always lands on Welcome page.
3. Resume behavior depends on saved lifecycle phase.
4. Browser refresh on `/games/:id/play` retains Welcome entry when game is started.
5. Main status board fidelity remains deferred and is not a gate for this wave.

# Validation
```bash
npm --prefix src/ui run test:ci
```
