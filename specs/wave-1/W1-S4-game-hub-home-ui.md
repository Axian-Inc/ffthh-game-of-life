---
spec_id: W1-S4
title: Game Hub Home Screen (High-Fidelity Screen 1)
wave: 1
branch: codex/w1-s4-game-hub-home-ui
base_branch: codex/wave-1-integration
test_commands:
  - npm --prefix src/ui run test:ci
  - PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 CHROME_BIN=/usr/bin/chromium VITE_STORAGE_MODE=local npm --prefix src/ui run build
  - npm --prefix src/ui exec playwright test e2e/home-visual.spec.js
owned_paths:
  - specs/wave-1/W1-S4-game-hub-home-ui.md
  - src/ui/src/App.css
  - src/ui/src/components/layout/Hero.jsx
  - src/ui/src/components/layout/GameListSection.jsx
  - src/ui/src/components/games/GameCard.jsx
  - src/ui/src/components/games/GameCardActions.jsx
  - src/ui/src/components/games/GameCountBadge.jsx
  - src/ui/src/components/games/GameGrid.jsx
  - src/ui/src/components/games/AvatarRow.jsx
  - src/ui/src/components/games/StatusPill.jsx
  - src/ui/src/utils/formatRelativeTime.js
  - src/ui/src/components/__tests__/layout.test.jsx
  - src/ui/src/components/__tests__/games.test.jsx
  - src/ui/e2e/home-visual.spec.js
  - src/ui/e2e/__snapshots__/home-visual.spec.js-snapshots/
---

# Objective
Bring the Game Hub landing page into exact visual alignment with Screen 1 so the home state behind the Wave 1 flow feels intentionally designed rather than generic.

# Reference Inputs (All Normative)
1. `docs/sample-images/1.WelcomeResume.png`
2. `docs/game-of-life-style-guide.md`

# Scope
In scope:

- Match the Game Hub hero and games-list screen shown in Screen 1.
- Match the seeded active-game card anatomy, count badge, and CTA sizing.
- Add deterministic Playwright screenshot coverage for Screen 1.

Out of scope:

- Screens 2-6 wizard modal fidelity owned by `W1-S2`.
- Screen 7 welcome-page fidelity owned by `W1-S3`.
- Resume/results modals beyond ensuring the home screen beneath them matches the reference.

# Non-Negotiable Fidelity Rules
1. Hero stack is centered and ordered exactly:
   - logo tile
   - uppercase eyebrow `GAME HUB`
   - heading `Game of LIFE`
   - subtitle copy
   - wide gradient `New Game` CTA
2. Subtitle copy is exactly:
   - `Start and career and see how your life unfolds in this easy, fun, and exciting simulation of this game we call life!`
3. `Your Games` panel is a large rounded white container beneath the hero with a count badge at the far right.
4. Baseline visual state shows one seeded active card titled `Choices Matter`.
5. Baseline game-card metadata is:
   - `4 players`
   - `just now`
   - `ACTIVE`
6. Card actions are:
   - primary `Resume`
   - trailing delete icon button

# Card Anatomy Contract
1. Card title row shows the game title left and the status pill right.
2. Metadata row shows player count and relative time in one line.
3. Avatar row shows four small player avatars in a tight horizontal cluster.
4. Action row shows the gradient Resume pill and the circular delete button.
5. The card sits left-aligned inside the larger `Your Games` panel, leaving intentional empty space to the right as seen in the reference.

# Parallel-Wave Constraints
1. This spec owns the home layout/styles in `App.css`; `W1-S2` and `W1-S3` must not depend on editing that file.
2. If the logo mark needs custom treatment, keep it local to `Hero.jsx`/`App.css` rather than introducing a shared cross-spec asset dependency.
3. Do not modify wizard-owned or welcome-owned files.

# Behavior Contract
1. Clicking `New Game` still opens the create flow.
2. Clicking `Resume` still resumes or routes into setup/play according to existing game state.
3. Delete button behavior remains unchanged.

# Automated Visual Validation Contract
`src/ui/e2e/home-visual.spec.js` must:

1. Set viewport to `1280x720`.
2. Seed local storage with exactly one active game named `Choices Matter`.
3. Mock or seed time so the card metadata reads `just now`.
4. Disable animations/transitions that destabilize snapshots.
5. Capture the initial home view as one screenshot baseline.

# Failure And Rollback Notes
1. If the hero eyebrow is not uppercase `GAME HUB`, block merge.
2. If the `Your Games` panel collapses tightly around the single card instead of leaving the large right-side breathing room from the reference, block merge.
3. If the seeded screenshot does not show `Choices Matter`, `4 players`, `just now`, and `ACTIVE`, block merge.
4. If visual-test timing is unstable, revert the screenshot harness and reintroduce it with deterministic storage/time control before merge.

# Acceptance Criteria
1. Screen 1 visually aligns with the reference in hero hierarchy, panel sizing, game-card anatomy, and spacing.
2. Home interactions continue working.
3. Automated visual tests cover the Screen 1 baseline and pass locally in the dev container.

# Validation
```bash
npm --prefix src/ui run test:ci
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 CHROME_BIN=/usr/bin/chromium VITE_STORAGE_MODE=local npm --prefix src/ui run build
npm --prefix src/ui exec playwright test e2e/home-visual.spec.js
```
