---
spec_id: W1-S2
title: Five-Step New Player Wizard Modal (High-Fidelity Screens 2-6)
wave: 1
branch: codex/w1-s2-wizard-modal-ui
base_branch: codex/wave-1-integration
test_commands:
  - npm --prefix src/ui run test:ci
owned_paths:
  - specs/wave-1/W1-S2-wizard-modal-ui.md
  - src/ui/src/components/modals/CreateGameModal.jsx
  - src/ui/src/components/modals/ModalBackdrop.jsx
  - src/ui/src/components/forms/NewGameWizard.jsx
  - src/ui/src/components/forms/NewGameWizardStep1Player.jsx
  - src/ui/src/components/forms/NewGameWizardStep2City.jsx
  - src/ui/src/components/forms/NewGameWizardStep3Track.jsx
  - src/ui/src/components/forms/NewGameWizardStep4Job.jsx
  - src/ui/src/components/forms/NewGameWizardStep5Summary.jsx
  - src/ui/src/components/forms/new-game-wizard.css
  - src/ui/src/components/__tests__/modals.test.jsx
  - src/ui/src/components/__tests__/setup-flow.test.jsx
---

# Objective
Replace the current single-form create modal with a five-step wizard that visually and behaviorally matches reference Screens 2-6 (`docs/sample-images/2.Life.NewPlayer.png` through `docs/sample-images/6.Life.NewGameSummary.png`).

# Scope
In scope:

- Convert create modal into a multi-step setup wizard.
- Implement Steps 1-5 with locked UI structure, card anatomy, and copy hierarchy.
- Support adding multiple players from Step 5 and returning to Step 1.
- Preserve all completed selections while moving back/next.
- Use setup catalog data from `src/ui/src/data/setupCatalog.js`.

Out of scope:

- Main in-game status board fidelity (`docs/sample-images/8.PlayerTurn.png`).
- Replacing post-welcome play placeholder.
- Storage schema migrations (handled by Wave 2 specs).

# Reference Screens (Normative)
Treat these image files as requirements, not inspiration:

1. Step 1: `docs/sample-images/2.Life.NewPlayer.png`
2. Step 2: `docs/sample-images/3.Life.PickCity.png`
3. Step 3: `docs/sample-images/4.Life.PickTrack.png`
4. Step 4: `docs/sample-images/5.Life.PickJob.png`
5. Step 5: `docs/sample-images/6.Life.NewGameSummary.png`

# Non-Negotiable Fidelity Rules
1. Modal body is centered on blurred darkened overlay.
2. Modal width and visual density must match screenshot proportions (desktop-first).
3. Every step shows heading and subtitle in this format:
   - Heading: `New Player Setup` (Step 1) or `New Player Setup - <Step Name>` (Steps 2-4)
   - Heading for Step 5: `New Game - Summary`
   - Subtitle: `Step X of 5`
4. Back/Next controls are pill buttons at modal footer; Next uses gradient style.
5. Selected cards have visible selected-state border/glow.
6. Card contents must include section bars/labels and explanatory text blocks as shown.
7. Do not render legacy single-form fields (`Game Name`, `Player nickname`, `Add Player`) inside this modal flow.

# Step-by-Step Contract

## Step 1 - New Player Setup
Required controls:

1. `Player Name` text input with placeholder `Enter a distinct name...`.
2. Persona grid under label `Choose Your Digital Persona:`.
3. Persona options are a fixed grid of selectable icon tiles (keyboard accessible).
4. Next button disabled until:
   - non-empty trimmed player name
   - one persona selected

Behavior:

1. Selection is single-select.
2. Clicking selected persona keeps it selected (no toggle-off).
3. Back button is hidden/disabled on Step 1.

## Step 2 - Pick City
Required cards (exact count: 3):

1. San Francisco card
2. Denver card
3. Tonopah, NV card

Card anatomy:

1. Title row with icon + city label.
2. `Cost` section bar with lines for multiplier and tax.
3. `Opportunity` section bar with growth/opportunity multiplier.
4. `Wellbeing` section bar with mental/physical baseline lines.
5. Bottom descriptive paragraph.

Behavior:

1. Single-select card behavior.
2. Next disabled until one city selected.
3. Back returns to Step 1 with Step 1 values intact.

## Step 3 - Education Track
Required cards (exact count: 3):

1. Degree Track
2. Trades Track
3. Self-Taught Track

Card anatomy:

1. Title row with track icon + label.
2. `Debt/Investment` section.
3. `Long-Term Potential` section.
4. `Stability` section.
5. Bottom descriptive paragraph.

Behavior:

1. Single-select card behavior.
2. Next disabled until one track selected.
3. Back returns to Step 2 with selected city retained.

## Step 4 - Pick a Career
Required cards (exact count: 3 at a time):

1. Render only jobs for selected track.
2. For Trades track, cards must include: Dental Hygienist, Electrician, Mechanic.

Card anatomy:

1. Large job illustration area at top.
2. Title row with job name.
3. `Income` section showing annual salary format (`$60,000 / yr`).
4. `Stability` section.
5. `Wage Growth` section.
6. Bottom one-line outlook text.

Behavior:

1. Single-select card behavior.
2. Next disabled until one job selected.
3. Back returns to Step 3 with track retained.

## Step 5 - New Game Summary
Required structure:

1. Heading: `New Game - Summary`.
2. Subtitle: `Step 5 of 5`.
3. Summary list with one row per configured player.
4. Per-row fields in order:
   - avatar + `Name: <name>` and `City: <city>`
   - education icon + `Education: <track>`
   - job icon + `Job: <job>`
5. Footer buttons:
   - secondary: `+ New Player`
   - primary: `Start Game`

Behavior:

1. `+ New Player` creates a new draft player and routes to Step 1.
2. Existing completed players remain intact in summary.
3. `Start Game` disabled when configured players < 2.
4. `Start Game` enabled when configured players >= 2.

# State and Data Requirements
1. Keep wizard data in one container state object:
   - `currentStep`
   - `players[]`
   - `draftPlayer` (active player being configured)
2. Required per-player setup fields:
   - `name`
   - `avatar`
   - `cityId`
   - `educationTrackId`
   - `jobId`
3. Step 4 jobs are derived by filtering `setupCatalog.jobs` by selected `educationTrackId`.
4. Do not hardcode city/track/job records in component files.
5. Step transitions must not recompute or clear already chosen values unless user explicitly changes upstream selection.

# Accessibility Requirements
1. Modal traps focus; ESC closes when not blocked by in-flight submit.
2. Card tiles are real buttons with visible focus styles.
3. Close button has `aria-label="Close modal"`.
4. Every Next/Back button remains keyboard reachable.
5. Step title/subtitle should be announced as part of dialog content.

# Failure and Rollback Notes
1. If any step violates card count or required section labels, block merge.
2. If back navigation drops selections, revert step-state refactor and reintroduce with deterministic tests.
3. If Step 4 filtering leaks jobs from other tracks, revert Step 4 rendering and restore catalog-driven filter logic.
4. If summary can start with <2 players, block merge until gating is fixed.

# Acceptance Criteria
1. Legacy one-screen create modal is fully replaced by five-step wizard.
2. Steps 1-5 match the screenshot structure and hierarchy from Screens 2-6.
3. Step gating, back/next behavior, and data retention work for 2+ players.
4. Summary rows include avatar, name, city, education, and job for each player.
5. Start button gating enforces minimum 2 players.

# Validation
```bash
npm --prefix src/ui run test:ci
```

Manual visual validation (required):

1. Compare each rendered step against corresponding file in `docs/sample-images/`.
2. Verify modal overlay blur/dim and centered container proportions.
3. Verify Step 5 row layout and footer button order (`+ New Player`, `Start Game`).
