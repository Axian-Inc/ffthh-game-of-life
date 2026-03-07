---
spec_id: W1-S1
title: Setup Draft And Persistence Contract (Desktop Wave 1)
wave: 1
branch: codex/w1-s1-setup-draft-and-persistence
base_branch: codex/wave-1-integration
test_commands:
  - npm --prefix src/ui run test:ci
  - PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 CHROME_BIN=/usr/bin/chromium VITE_STORAGE_MODE=local npm --prefix src/ui run build
  - npm --prefix src/ui exec -- playwright test --config src/ui/playwright.config.js src/ui/e2e/app.spec.js
owned_paths:
  - specs/wave-1/W1-S1-setup-draft-and-persistence.md
  - src/ui/src/App.jsx
  - src/ui/src/App.css
  - src/ui/src/hooks/useCreateGameForm.js
  - src/ui/src/hooks/useGames.js
  - src/ui/src/services/gameStorage.js
  - src/ui/src/utils/gameValidation.js
  - src/ui/src/components/pages/StartNewGamePage.jsx
  - src/ui/src/components/pages/PlayGamePage.jsx
  - src/ui/src/test/testUtils.js
  - src/ui/src/components/__tests__/pages.test.jsx
  - src/ui/src/components/__tests__/setup-flow.test.jsx
  - src/ui/e2e/app.spec.js
---

# Objective
Define the authoritative desktop setup draft and save/resume contract so Wave 1 no longer loses players, saves partial games too early, or disconnects the game title from the final saved game.

# Scope
In scope:
- One authoritative setup draft with top-level game name, committed players, draft player, and current step.
- Final game creation only when the Step 6 `Start Game` action succeeds.
- Persistence of all committed players and the final edited game title.
- Desktop happy-path coverage for create, Welcome, return-home, reload, and resume.

Out of scope:
- Visual fidelity of home, welcome, and wizard screens beyond the data/behavior contract.
- Game-board implementation after the Welcome page.

# Authoritative Draft Contract
The setup flow must operate on one local draft shape until final submit:

```js
{
  name: string,
  players: [
    {
      id: string,
      name: string,
      avatar: string,
      cityId: string,
      educationTrackId: string,
      jobId: string,
      careerTrack: string,
    }
  ],
  draftPlayer: {
    name: string,
    avatar: string,
    cityId: string,
    educationTrackId: string,
    jobId: string,
  },
  currentStep: number,
}
```

Rules:
1. Do not mutate parent `players`, parent `draftPlayer`, or saved game records while the wizard is still in progress.
2. `Start Game` is the first persistence point for a new game.
3. The game title edited on Step 6 overwrites the earlier Step 1 title and becomes the saved `game.name`.
4. Player names must stay unique within the current draft.
5. Saving must preserve every committed player, not just the last one.

# Save/Resume Contract
1. Saved games must contain the final `name` and every committed player with all Wave 1 setup fields.
2. Reloading the home page must keep the newly created game visible with the final edited title.
3. Resuming that saved game must land on the Welcome page first.
4. Clicking `Let's Begin!` returns to home for now; no board placeholder should become the Wave 1 destination.

# Failure Conditions
Block merge if any of these occur:
1. Only one of two configured players survives save/reload.
2. The summary title edit does not change the saved game title.
3. The game is created before `Start Game` is pressed.
4. Resume skips Welcome or opens placeholder play first.

# Acceptance Criteria
1. A two-player desktop create flow persists both configured players with city, track, job, and career data.
2. Editing the title on Step 6 changes the saved game title shown on the landing page.
3. Reload and resume preserve the saved title and both players.
4. The Wave 1 happy-path Playwright test passes in the dev container.
