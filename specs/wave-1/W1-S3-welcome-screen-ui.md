---
spec_id: W1-S3
title: Welcome to Life Screen (High-Fidelity Screen 7)
wave: 1
branch: codex/w1-s3-welcome-screen-ui
base_branch: codex/wave-1-integration
test_commands:
  - npm --prefix src/ui run test:ci
  - PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 CHROME_BIN=/usr/bin/chromium VITE_STORAGE_MODE=local npm --prefix src/ui run build
  - npm --prefix src/ui exec -- playwright test --config src/ui/playwright.config.js e2e/welcome-visual.spec.js
owned_paths:
  - specs/wave-1/W1-S3-welcome-screen-ui.md
  - src/ui/src/components/pages/WelcomeToLifePage.jsx
  - src/ui/src/components/pages/welcome-to-life.css
  - src/ui/src/components/pages/PlayGamePage.jsx
  - src/ui/src/components/__tests__/pages.test.jsx
  - src/ui/e2e/welcome-visual.spec.js
  - src/ui/e2e/__snapshots__/welcome-visual.spec.js-snapshots/welcome-screen-linux.png
---

# Objective
Implement the Welcome page so Screen 7 matches the reference exactly in column width, typography, section spacing, quote treatment, and CTA placement.

# Reference Inputs (All Normative)
1. `docs/sample-images/7.Life.Start.png`
2. `docs/game-of-life-style-guide.md`

# Scope
In scope:

- Render the Welcome page first for both started and resumed play entry.
- Match the exact Screen 7 copy hierarchy and spacing.
- Add deterministic Playwright screenshot coverage for the Welcome screen.

Out of scope:

- Screen 1 home-screen fidelity owned by `W1-S4`.
- Screens 2-6 wizard fidelity owned by `W1-S2`.
- Main in-game board fidelity (`docs/sample-images/8.PlayerTurn.png`).

# Non-Negotiable Fidelity Rules
1. The page uses a narrow centered reading column on a bright off-white canvas.
2. The top logo tile visually matches the reference and is centered above the heading.
3. The main heading is exactly `Welcome to Life!`.
4. Section order is fixed:
   - `A Month at a Time`
   - `Choices Matter`
   - quote block
   - `Life Happens`
5. The bottom CTA is a wide gradient pill labeled `Let's Begin!`.
6. Do not render extra mode labels, helper captions, or placeholder play text in the baseline visual state.

# Exact Copy Contract
1. `A Month at a Time`
   - `Every turn represents one in-game month. Life moves forward. Your turn summary shows income, costs, and health updates.`
2. `Choices Matter`
   - `Each turn, you get one action. Choose a path-job training, moving city, or looking for love. Your choices create modifiers with immediate, delayed, and cumulative effects.`
3. Quote block
   - `"The best way to predict your future is to create it."`
   - `-Abraham Lincoln`
4. `Life Happens`
   - `Players are affected by randomized Life Events. Check explanations to see how likely an event was and what decisions influenced it. Your choices determine how you adapt!`

# Behavior Contract
1. Entering `/games/:id/play` for a started game shows the Welcome page before the placeholder play board.
2. Resume path also lands on the Welcome page first.
3. Clicking `Let's Begin!` advances to the existing play destination.
4. CTA remains keyboard-activatable with Enter/Space.

# Technical Requirements
1. Keep all Welcome styling isolated to `welcome-to-life.css`.
2. Do not introduce shared visual primitives that require `W1-S2` or `W1-S4` to touch the same files.
3. If the logo tile needs a custom mark, keep it local to the owned paths for this spec.

# Accessibility Requirements
1. Use semantic heading structure (`h1`, then section headings).
2. Quote block is grouped and readable in screen readers.
3. CTA hit target is at least 44px high.
4. Gradient CTA text remains readable against the background.

# Automated Visual Validation Contract
`src/ui/e2e/welcome-visual.spec.js` must:

1. Set viewport to `1280x720`.
2. Seed a deterministic started game and route into `/play`.
3. Disable animations/transitions that destabilize snapshots.
4. Capture the pre-CTA Welcome page state as one screenshot baseline.

# Failure And Rollback Notes
1. If `/games/:id/play` still opens placeholder content first, block merge.
2. If the quote block moves below `Life Happens` or any section is missing, block merge.
3. If the baseline screenshot includes extra mode labels or helper copy not present in the reference, block merge.
4. If screenshot output is unstable, revert the visual-test wiring and reintroduce it with deterministic fixtures before merge.

# Acceptance Criteria
1. Screen 7 visually aligns with the reference image in scale, spacing, and copy hierarchy.
2. Started/resumed play entry renders the Welcome page first.
3. Automated visual tests cover the Welcome screen and pass locally in the dev container.

# Validation
```bash
npm --prefix src/ui run test:ci
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 CHROME_BIN=/usr/bin/chromium VITE_STORAGE_MODE=local npm --prefix src/ui run build
npm --prefix src/ui exec -- playwright test --config src/ui/playwright.config.js e2e/welcome-visual.spec.js
```
