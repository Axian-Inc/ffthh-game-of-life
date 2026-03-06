---
spec_id: W1-S3
title: Home, Welcome, And Navigation Contract (Desktop Wave 1)
wave: 1
branch: codex/w1-s3-home-welcome-navigation
base_branch: codex/wave-1-integration
test_commands:
  - npm --prefix src/ui run test:ci
  - PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 CHROME_BIN=/usr/bin/chromium VITE_STORAGE_MODE=local npm --prefix src/ui run build
  - npm --prefix src/ui exec -- playwright test --config src/ui/playwright.config.js src/ui/e2e/home-visual.spec.js src/ui/e2e/welcome-visual.spec.js
owned_paths:
  - specs/wave-1/W1-S3-home-welcome-navigation.md
  - src/ui/src/App.jsx
  - src/ui/src/App.css
  - src/ui/src/components/layout/Hero.jsx
  - src/ui/src/components/layout/GameListSection.jsx
  - src/ui/src/components/games/GameCard.jsx
  - src/ui/src/components/games/GameCardActions.jsx
  - src/ui/src/components/games/GameCountBadge.jsx
  - src/ui/src/components/games/GameGrid.jsx
  - src/ui/src/components/games/AvatarRow.jsx
  - src/ui/src/components/games/StatusPill.jsx
  - src/ui/src/components/pages/PlayGamePage.jsx
  - src/ui/src/components/pages/WelcomeToLifePage.jsx
  - src/ui/src/components/pages/welcome-to-life.css
  - src/ui/src/components/__tests__/games.test.jsx
  - src/ui/src/components/__tests__/layout.test.jsx
  - src/ui/src/components/__tests__/pages.test.jsx
  - src/ui/e2e/home-visual.spec.js
  - src/ui/e2e/welcome-visual.spec.js
  - src/ui/e2e/__snapshots__/
---

# Objective
Own the desktop home screen, Welcome screen, and Wave 1 routing so the app lands on the right surface at the right time and the landing page handles multiple resumable games cleanly.

# Reference Inputs
1. `docs/sample-images/1.WelcomeResume.png`
2. `docs/sample-images/7.Life.Start.png`
3. `docs/game-of-life-style-guide.md`

# Scope
In scope:
- Desktop home fidelity for Screen 1
- Desktop Welcome fidelity for Screen 7
- Navigation into Welcome after create and resume
- Temporary `Let's Begin! -> /` behavior
- Multi-game landing spacing and desktop stack behavior

Out of scope:
- Wizard interior desktop fidelity
- Data-model and persistence logic beyond consuming the wizard submit contract

# Home Contract
1. Desktop viewport is `1280x720`.
2. The Screen 1 single-card baseline remains unchanged:
   - `Choices Matter`
   - `4 players`
   - `just now`
   - `ACTIVE`
3. Multi-game state is a single desktop column with `24px` vertical gap.
4. Cards must not render flush against each other.
5. `New Game` still opens the wizard.

# Welcome Contract
1. `/games/:id/play` always opens the Welcome page first.
2. Resume from the landing page also opens Welcome first.
3. `Let's Begin!` routes back to `/` for now.
4. The placeholder board is not part of the Wave 1 destination path.

# Reject Conditions
Block merge if:
1. Multiple home cards sit directly next to each other with no vertical separation.
2. Start or Resume skips the Welcome page.
3. `Let's Begin!` lands on placeholder play instead of the landing page.
4. Extra helper captions or placeholder board text appear in the Welcome visual baseline.

# Acceptance Criteria
1. Home visual baseline matches Screen 1.
2. Home multi-game desktop coverage proves the list keeps explicit vertical separation.
3. Welcome visual baseline matches Screen 7.
4. Welcome CTA returns to `/`.
