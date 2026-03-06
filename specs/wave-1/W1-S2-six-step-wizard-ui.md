---
spec_id: W1-S2
title: Six-Step Setup Wizard UI (Desktop Screens 2-6 Plus New Step 1)
wave: 1
branch: codex/w1-s2-six-step-wizard-ui
base_branch: codex/wave-1-integration
test_commands:
  - npm --prefix src/ui run test:ci
  - PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 CHROME_BIN=/usr/bin/chromium VITE_STORAGE_MODE=local npm --prefix src/ui run build
  - npm --prefix src/ui exec -- playwright test --config src/ui/playwright.config.js src/ui/e2e/wizard-visual.spec.js
owned_paths:
  - specs/wave-1/W1-S2-six-step-wizard-ui.md
  - src/ui/src/data/playerAvatars.js
  - src/ui/src/data/wizardVisualCatalog.js
  - src/ui/src/assets/wizard/
  - src/ui/src/assets/wizard/art.js
  - src/ui/src/components/modals/CreateGameModal.jsx
  - src/ui/src/components/modals/ModalBackdrop.jsx
  - src/ui/src/components/forms/NewGameWizard.jsx
  - src/ui/src/components/forms/NewGameWizardStep1GameName.jsx
  - src/ui/src/components/forms/NewGameWizardStep1Player.jsx
  - src/ui/src/components/forms/NewGameWizardStep2City.jsx
  - src/ui/src/components/forms/NewGameWizardStep3Track.jsx
  - src/ui/src/components/forms/NewGameWizardStep4Job.jsx
  - src/ui/src/components/forms/NewGameWizardStep6Summary.jsx
  - src/ui/src/components/forms/new-game-wizard.css
  - src/ui/src/components/__tests__/modals.test.jsx
  - src/ui/src/components/__tests__/setup-flow.test.jsx
  - src/ui/e2e/wizard-visual.spec.js
  - src/ui/e2e/wizard-visual.spec.js-snapshots/
---

# Objective
Implement the desktop six-step setup wizard so the existing reference screenshots remain visually authoritative for the old Steps 2-6 while the new Step 1 and updated Step 6 title-edit flow are locked down explicitly.

# Reference Inputs
1. `docs/sample-images/2.Life.NewPlayer.png`
2. `docs/sample-images/3.Life.PickCity.png`
3. `docs/sample-images/4.Life.PickTrack.png`
4. `docs/sample-images/5.Life.PickJob.png`
5. `docs/sample-images/6.Life.NewGameSummary.png`
6. `docs/game-of-life-style-guide.md`

# Scope
In scope:
- Desktop-only wizard visuals at `1280x720`
- New Step 1 game-name entry screen
- Existing Steps 2-6 fidelity, renumbered to `Step 2 of 6` through `Step 6 of 6`
- Summary-title editing
- Deterministic Playwright screenshots for all 6 desktop steps

Out of scope:
- Home-screen fidelity and multi-game list behavior
- Welcome-page routing and copy
- Backend/storage behavior beyond the submit interface this wizard emits

# Step Contract
## Step 1
1. Title: `New Game Setup`
2. Subtitle: `Step 1 of 6`
3. Label: `Game Name:`
4. One centered text field and one centered `Next` pill
5. `Next` disabled until the trimmed name is non-empty

## Step 2 (`2.Life.NewPlayer.png`)
1. Title: `New Player Setup`
2. Subtitle: `Step 2 of 6`
3. `Player Name:` and `Choose Your Digital Persona:` labels are mandatory
4. Persona grid stays 5x5 and icon-only

## Step 3 (`3.Life.PickCity.png`)
1. Subtitle: `Step 3 of 6`
2. Same three-card city rail and exact copy from the screenshot contract

## Step 4 (`4.Life.PickTrack.png`)
1. Subtitle: `Step 4 of 6`
2. Same three-card education rail and exact copy from the screenshot contract

## Step 5 (`5.Life.PickJob.png`)
1. Subtitle: `Step 5 of 6`
2. Same three-card career rail and hero art treatment
3. Wizard title text must be dark, not white
4. Footer `Back` and `Next` buttons must be on the same desktop row
5. Add at least `16px` between the job title block and the `Income` section

## Step 6 (`6.Life.NewGameSummary.png`)
1. Subtitle: `Step 6 of 6`
2. Keep the wide summary sheet anatomy from the reference
3. Add an inline editable `Game Name:` field in the summary header
4. Footer actions remain `+ New Player` and `Start Game`

# Reject Conditions
Block merge if:
1. Wizard titles render white or inherit generic modal-header colors.
2. Desktop footer buttons stack vertically.
3. Step 5 job cards collapse the title directly into the `Income` section.
4. Step 6 cannot edit the title inline.
5. Any of the desktop baselines are missing or unstable.

# Submit Interface Contract
The wizard must submit one final payload shaped like:

```js
{
  name: string,
  players: Array<{
    id: string,
    name: string,
    avatar: string,
    cityId: string,
    educationTrackId: string,
    jobId: string,
    careerTrack: string,
  }>
}
```

The wizard must not mutate parent arrays or saved game objects before final submit.

# Acceptance Criteria
1. All 6 desktop wizard steps render correctly and match their contracts.
2. Step 5 title color and footer layout are explicitly verified.
3. Step 6 shows the editable title field and uses it as the final submit name.
4. Desktop visual tests for all 6 steps pass locally.
