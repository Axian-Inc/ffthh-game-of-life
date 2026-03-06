---
spec_id: W1-S2
title: Five-Step New Player Wizard Modal (High-Fidelity Screens 2-6)
wave: 1
branch: codex/w1-s2-wizard-modal-ui
base_branch: codex/wave-1-integration
test_commands:
  - npm --prefix src/ui run test:ci
  - PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 CHROME_BIN=/usr/bin/chromium VITE_STORAGE_MODE=local npm --prefix src/ui run build
  - npm --prefix src/ui exec playwright test e2e/wizard-visual.spec.js
owned_paths:
  - specs/wave-1/W1-S2-wizard-modal-ui.md
  - src/ui/src/data/playerAvatars.js
  - src/ui/src/data/wizardVisualCatalog.js
  - src/ui/src/assets/wizard/
  - src/ui/src/assets/wizard/art.js
  - src/ui/src/components/modals/CreateGameModal.jsx
  - src/ui/src/components/modals/ModalBackdrop.jsx
  - src/ui/src/components/forms/NewGameWizard.jsx
  - src/ui/src/components/forms/NewGameWizardStep1Player.jsx
  - src/ui/src/components/forms/NewGameWizardStep2City.jsx
  - src/ui/src/components/forms/NewGameWizardStep3Track.jsx
  - src/ui/src/components/forms/NewGameWizardStep4Job.jsx
  - src/ui/src/components/forms/NewGameWizardStep5Summary.jsx
  - src/ui/src/components/forms/new-game-wizard.css
  - src/ui/src/components/ui/PlayerAvatar.jsx
  - src/ui/src/components/__tests__/modals.test.jsx
  - src/ui/src/components/__tests__/setup-flow.test.jsx
  - src/ui/e2e/wizard-visual.spec.js
  - src/ui/e2e/wizard-visual.spec.js-snapshots/
  - src/ui/e2e/wizard-visual.spec.js-snapshots/-snapshots-wizard-visual-spec-js-snapshots-wizard-step-1-linux.png
  - src/ui/e2e/wizard-visual.spec.js-snapshots/-snapshots-wizard-visual-spec-js-snapshots-wizard-step-2-linux.png
  - src/ui/e2e/wizard-visual.spec.js-snapshots/-snapshots-wizard-visual-spec-js-snapshots-wizard-step-3-linux.png
  - src/ui/e2e/wizard-visual.spec.js-snapshots/-snapshots-wizard-visual-spec-js-snapshots-wizard-step-4-linux.png
  - src/ui/e2e/wizard-visual.spec.js-snapshots/-snapshots-wizard-visual-spec-js-snapshots-wizard-step-5-linux.png
---

# Objective
Replace the current generic create flow with a five-step wizard whose rendered Screens 2-6 visually match the reference screenshots 1:1 in anatomy, copy hierarchy, proportions, and art treatment.

# Reference Inputs (All Normative)
1. `docs/sample-images/2.Life.NewPlayer.png`
2. `docs/sample-images/3.Life.PickCity.png`
3. `docs/sample-images/4.Life.PickTrack.png`
4. `docs/sample-images/5.Life.PickJob.png`
5. `docs/sample-images/6.Life.NewGameSummary.png`
6. `docs/game-of-life-style-guide.md`

# Scope
In scope:

- Implement the full five-step modal experience for Screens 2-6.
- Match the narrow modal shell, overhanging desktop card rails, and wide summary sheet seen in the references.
- Create a wizard-owned presentation catalog for exact titles, section lines, descriptive copy, art, and Step 1 persona ordering.
- Add deterministic Playwright screenshot coverage for Screens 2-6.

Out of scope:

- Screen 1 home-screen implementation details owned by `W1-S4`.
- Screen 7 welcome-page implementation details owned by `W1-S3`.
- Main in-game board fidelity (`docs/sample-images/8.PlayerTurn.png`).
- Any change to canonical simulation values in `setupCatalog.js`.

# Parallel-Wave Constraints
1. This spec must not edit `src/ui/src/data/setupCatalog.js`, `src/ui/src/App.css`, or Screen 1/7-owned files.
2. Any wizard-specific copy, icon order, art assets, or screenshot fixtures must live in wizard-owned paths listed above.
3. Do not introduce shared visual primitives that require `W1-S3` or `W1-S4` to change the same file.

# Visual Architecture Contract
1. Baseline desktop viewport for visual tests is `1280x720`.
2. Modal overlay is full-screen, dimmed, and blurred with the reference warmth and softness; the wizard never renders on a blank white page.
3. Step 1 uses a narrow centered shell only.
4. Steps 2-4 keep the same narrow shell, but the three selection cards visibly overhang the shell left and right; the selected center card is elevated above the side cards.
5. Step 5 keeps the narrow shell for the header/footer but introduces a wide summary sheet that overhangs left/right similar to the reference.
6. Buttons are pill-shaped, centered at the footer, and sized/proportioned like the references; no small utility-button treatment is allowed.

# Wizard-Owned Presentation Data Contract
`src/ui/src/data/wizardVisualCatalog.js` must be introduced as the wizard display contract and keyed to canonical ids where applicable.

Required exports:

1. `wizardPersonas`
   - Ordered top-left to bottom-right exactly as shown in Screen 2.
   - Every entry includes a stable id/key, visible subject label for accessibility, and imported local SVG/PNG asset.
2. `wizardCities`
   - One entry per canonical city id with exact Screen 3 display title, section-bar lines, descriptive paragraph, and illustration asset.
3. `wizardTracks`
   - One entry per canonical education-track id with exact Screen 4 display title, section-bar lines, descriptive paragraph, and illustration asset pair.
4. `wizardJobs`
   - One entry per canonical job id with exact Screen 5 display title, hero art, income/stability/growth lines, and outlook text.
5. `wizardSummaryFixture`
   - Seed data for the Screen 6 screenshot baseline only.
   - This fixture may mirror the exact names/icons visible in the reference even if runtime setup options remain canonical.

Rules:

1. Do not build display copy from canonical numeric fields during rendering for Screens 2-6.
2. Do not render token badges such as `SF`, `DN`, `TN`, or placeholder descriptions such as `starting profile`.
3. Do not use the current animal-avatar set for Step 1; the Step 1 grid must visually match Screen 2.

# Step-by-Step Contract

## Step 1 - New Player Setup (`2.Life.NewPlayer.png`)
Required visual state:

1. Modal title is `New Player Setup`.
2. Subtitle is `Step 1 of 5`.
3. Field label is `Player Name:` including the colon.
4. Second label is `Choose Your Digital Persona:` including the colon.
5. Persona selector is a 5x5 icon-only grid with no visible text captions under tiles.
6. Top-left persona tile is selected by default on initial open, matching the reference’s selected state.
7. `Next` is centered at the modal footer as a wide gradient pill.

Behavior:

1. `Next` remains disabled until the player name is non-empty after trimming.
2. Persona selection is single-select and cannot be toggled off to an empty state.
3. Back is hidden on Step 1.
4. No validation error text is visible on pristine modal open.

Reject conditions:

1. Text labels appear under persona tiles.
2. Animal or fallback emoji avatars are shown instead of the reference-style icon set.
3. Inline error text is shown before user interaction.

## Step 2 - Pick City (`3.Life.PickCity.png`)
Required visual state:

1. Title is `New Player Setup - Pick City`.
2. Subtitle is `Step 2 of 5`.
3. Three tall city cards render in a left/center/right rail that overhangs the modal shell.
4. The selected center card has the strongest border/glow and sits slightly higher than side cards.
5. Visible card titles are exactly:
   - `San Francisco`
   - `Denver`
   - `Tonopah, NV`
6. Section bars appear in this order with the color treatment shown in the screenshot:
   - `Cost`
   - `Opportunity`
   - `Wellbeing`

Exact display copy:

1. San Francisco
   - `Cost of Living Multiplier: 2.5x`
   - `Tax Rate: 9%`
   - `Opportunity Multiplier: 3x`
   - `Mental Baseline: +5`
   - `Physical Baseline: +2`
   - `A dense urban environment with vibrant culture and tech jobs, but very high living expenses. Remember, there is no free lunch. High reward comes with high cost.`
2. Denver
   - `1.2x Col`
   - `5% Tax`
   - `1.5x Growth`
   - `Mental +8`
   - `Physical +9`
   - `A balanced city with outdoor access. Moderate CoL and good opportunity - a comfortable middle, but not an extreme. The tradeoff is less focus on any single area.`
3. Tonopah, NV
   - `0.7x Col`
   - `2% Tax`
   - `0.5x Growth`
   - `Mental +2`
   - `Physical +3`
   - `A quiet, rural town with very low expenses but limited job prospects. Perfect for a simple life, but career growth will be much slower.`

Behavior:

1. Single-select cards.
2. `Next` disabled until one city is selected.
3. `Back` returns to Step 1 with the Step 1 state intact.

## Step 3 - Education Track (`4.Life.PickTrack.png`)
Required visual state:

1. Title is `New Player Setup - Education Track`.
2. Subtitle is `Step 3 of 5`.
3. Three overhanging track cards render with the selected center card elevated.
4. Visible titles are exactly:
   - `Degree Track`
   - `Trades Track`
   - `Self-Taught Track`
5. Section bars appear in this order:
   - `Debt/Investment`
   - `Long-Term Potential`
   - `Stability`

Exact display copy:

1. Degree Track
   - `High student debt.`
   - `Delayed income.`
   - `Great. Access to specialized professional careers.`
   - `High.`
   - `Formal university education for specialized professions. Significant up-front investment but strong career path.`
2. Trades Track
   - `Lower than Degree track.`
   - `Practical training.`
   - `Good. In-demand, skilled technical skills.`
   - `High.`
   - `Vocational training for high-demand skilled trades. Lower cost and faster entry into a good income.`
3. Self-Taught Track
   - `Minimal financial debt.`
   - `Self-driven learning.`
   - `Great. Highly variable outcomes.`
   - `Variable.`
   - `Rely on self-driven learning and practical experience. Minimal up-front cost, success depends heavily on individual drive and market demand.`

Behavior:

1. Single-select cards.
2. `Next` disabled until one track is selected.
3. `Back` returns to Step 2 with the selected city retained.

## Step 4 - Pick a Career (`5.Life.PickJob.png`)
Required visual state:

1. Title is `New Player Setup - Pick a Career`.
2. Subtitle is `Step 4 of 5`.
3. Three overhanging job cards render for the selected track only.
4. Each card has a large illustrated hero panel at the top.
5. Section bars appear in this order:
   - `Income`
   - `Stability`
   - `Wage Growth`

Trades-track required cards and copy:

1. Dental Hygienist
   - Hero art depicts a dental-treatment scene.
   - `\$77,000 / yr`
   - `High`
   - `Good (further specialization options)`
2. Electrician
   - Hero art depicts an electrician working on a breaker/panel.
   - `\$60,000 / yr`
   - `High`
   - `High (master electrician license track)`
3. Mechanic
   - Hero art depicts a mechanic working under an open hood.
   - `\$42,000 / yr`
   - `High`
   - `Good (ASE certification track)`

Behavior:

1. Render only jobs for the currently selected track.
2. `Next` disabled until one job is selected.
3. `Back` returns to Step 3 with the selected track retained.

## Step 5 - New Game Summary (`6.Life.NewGameSummary.png`)
Required visual state:

1. Title is `New Game - Summary`.
2. Subtitle is `Step 5 of 5`.
3. A wide white summary sheet overhangs the modal shell horizontally.
4. The sheet shows three horizontal rows separated by subtle dividers, not three standalone boxed cards.
5. Each row follows this cluster order:
   - avatar tile, then `Name:` and `City:` stacked text
   - city illustration tile
   - `Education:` label and education illustration
   - `Job:` label and job illustration
6. Footer buttons are centered below the summary sheet in this order:
   - `+ New Player`
   - `Start Game`

Behavior:

1. Runtime rows render dynamic configured players.
2. Screenshot baseline may seed the exact sample rows from the reference in `wizardSummaryFixture`.
3. `+ New Player` starts a fresh draft without removing completed rows.
4. `Start Game` is disabled when configured players `< 2`.
5. `Start Game` is enabled when configured players `>= 2`.

# State And Data Requirements
1. Keep wizard state in one container object with:
   - `currentStep`
   - `players[]`
   - `draftPlayer`
2. Required runtime player fields remain:
   - `name`
   - `avatar`
   - `cityId`
   - `educationTrackId`
   - `jobId`
3. Use canonical ids from `setupCatalog.js` for runtime logic and filtering.
4. Use `wizardVisualCatalog.js` for all display copy, art, tile order, and seeded screenshot fixtures.
5. Upstream changes retain downstream state unless a selection becomes invalid and must be cleared deterministically.

# Accessibility Requirements
1. Modal traps focus and closes on `Escape`.
2. Close button has `aria-label="Close modal"`.
3. Persona tiles and cards are real buttons with visible focus treatment.
4. Step title/subtitle are part of the dialog content.
5. Decorative art remains ignored by screen readers; meaningful labels come from surrounding text or accessible labels.

# Automated Visual Validation Contract
`src/ui/e2e/wizard-visual.spec.js` must:

1. Use deterministic screenshot states for Screens 2-6.
2. Set viewport to `1280x720`.
3. Disable animations/transitions that would destabilize snapshots.
4. Use a wizard-owned fixture/backdrop state that visually matches the blurred Game Hub scene in the references without depending on `W1-S4` files.
5. Produce one snapshot per screen:
   - Step 1 open state
   - Step 2 with Denver selected
   - Step 3 with Trades Track selected
   - Step 4 with Electrician selected
   - Step 5 summary state

# Failure And Rollback Notes
1. If any step renders generic in-modal 3-column cards instead of the overhanging composition in Screens 3-5, block merge.
2. If synthetic token badges, placeholder descriptions, or generated stat-line text appear, block merge.
3. If Step 1 shows text captions under persona tiles, block merge.
4. If Step 5 renders boxed cards instead of one wide summary sheet with dividers, block merge.
5. If screenshot baselines are missing or unstable, revert the affected visual-test wiring and reintroduce it with deterministic fixtures before merge.

# Acceptance Criteria
1. Screens 2-6 visually match the reference images in layout, scale, hierarchy, and art treatment.
2. Wizard display copy and art come from a UI-owned visual catalog, not canonical simulation data.
3. Navigation/back/next gating and data retention remain correct for 2+ players.
4. Automated visual tests cover Screens 2-6 and pass locally in the dev container.

# Validation
```bash
npm --prefix src/ui run test:ci
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 CHROME_BIN=/usr/bin/chromium VITE_STORAGE_MODE=local npm --prefix src/ui run build
npm --prefix src/ui exec playwright test e2e/wizard-visual.spec.js
```
