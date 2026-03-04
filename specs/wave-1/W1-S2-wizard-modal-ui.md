---
spec_id: W1-S2
title: Five-Step New Game Wizard Modal UI
wave: 1
branch: codex/w1-s2-wizard-modal-ui
base_branch: codex/wave-1-integration
test_commands:
  - npm --prefix src/ui run test:ci
owned_paths:
  - specs/wave-1/W1-S2-wizard-modal-ui.md
  - src/ui/src/components/modals/CreateGameModal.jsx
  - src/ui/src/components/forms/NewGameWizard.jsx
  - src/ui/src/components/forms/NewGameWizardStep1Player.jsx
  - src/ui/src/components/forms/NewGameWizardStep2City.jsx
  - src/ui/src/components/forms/NewGameWizardStep3Track.jsx
  - src/ui/src/components/forms/NewGameWizardStep4Job.jsx
  - src/ui/src/components/forms/NewGameWizardStep5Summary.jsx
  - src/ui/src/components/forms/new-game-wizard.css
---

# Objective
Replace the current single-form create modal with a five-step wizard matching the provided visual flow and behavior.

# Scope
In scope:

- Build modal wizard screens:
  - Step 1: New Player
  - Step 2: Pick City
  - Step 3: Pick Education Track
  - Step 4: Pick Job (filtered by track)
  - Step 5: Summary
- Support multiple players via `New Player` action from Step 5.
- Show step count (`Step X of 5`) and proper back/next controls.

Out of scope:

- App-level routing changes after start.
- Storage persistence behavior.
- Welcome page implementation.

# UI/Behavior Requirements

1. Step transitions keep previously selected values when navigating back.
2. Next button is disabled until required choice on each step is made.
3. Step 4 only renders jobs for selected track.
4. Step 5 lists all players and all selected values: avatar, name, city, track, job.
5. Start button label is `Start Game` on Step 5.
6. Start button remains disabled when total configured players < 2.
7. Game name is auto-generated from first configured player (`<FirstName>'s Life Game`) with a local uniqueness suffix strategy.
8. Reuse existing modal backdrop/focus trap patterns.

# Technical Requirements

1. Keep setup state in a single wizard state object, not disconnected local states.
2. Use data from `src/ui/src/data/setupCatalog.js`; do not duplicate constants.
3. Keep CSS localized in `new-game-wizard.css` to reduce merge conflicts.
4. Ensure keyboard accessibility for selection cards (button semantics, focus visibility).

# Acceptance Criteria

1. Wizard can create 2+ configured players and reach summary.
2. Job options update when track changes.
3. `New Player` from summary starts next player at Step 1 without losing prior players.
4. Existing modal close/cancel behavior still works.
5. Visual hierarchy aligns with style guide tokens and screenshot structure.

# Validation

```bash
npm --prefix src/ui run test:ci
```

Plus manual verification:

1. All five steps render expected title/subtitle.
2. Summary shows complete cards for each configured player.
