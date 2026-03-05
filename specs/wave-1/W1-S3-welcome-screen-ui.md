---
spec_id: W1-S3
title: Welcome to Life Screen (High-Fidelity Screen 7)
wave: 1
branch: codex/w1-s3-welcome-screen-ui
base_branch: codex/wave-1-integration
test_commands:
  - npm --prefix src/ui run test:ci
owned_paths:
  - specs/wave-1/W1-S3-welcome-screen-ui.md
  - src/ui/src/components/pages/WelcomeToLifePage.jsx
  - src/ui/src/components/pages/welcome-to-life.css
  - src/ui/src/components/pages/PlayGamePage.jsx
  - src/ui/src/components/__tests__/pages.test.jsx
---

# Objective
Implement a high-fidelity Welcome page that matches `docs/sample-images/7.Life.Start.png` and replaces the current placeholder-first play entry for newly started or resumed games.

# Scope
In scope:

- Add a dedicated `WelcomeToLifePage` component matching reference Screen 7.
- Render this page when entering `/games/:id/play` for started games.
- Keep CTA wiring (`Let's Begin!`) to proceed to existing play destination.

Out of scope:

- Implementing the high-fidelity Main Game Status board (`docs/sample-images/8.PlayerTurn.png`).
- Replacing final game board placeholder UI in this wave.

# Reference Screen (Normative)
Use this as required layout/copy hierarchy:

- `docs/sample-images/7.Life.Start.png`

# Non-Negotiable Fidelity Rules
1. Centered vertical stack with generous whitespace on warm light background.
2. Top app icon, then primary heading `Welcome to Life!`.
3. Three explanatory sections in this exact order:
   - `A Month at a Time`
   - `Choices Matter`
   - `Life Happens`
4. Quote callout block appears between `Choices Matter` and `Life Happens`.
5. Bottom full-width gradient CTA labeled `Let's Begin!`.
6. Remove placeholder body copy such as `Game board coming soon.` from initial `/play` entry.

# Content Contract
Required headings and structure:

1. Page heading: `Welcome to Life!`
2. Section 1 heading: `A Month at a Time`
3. Section 2 heading: `Choices Matter`
4. Section 3 heading: `Life Happens`
5. Quote block includes:
   - quote text line
   - attribution line

Copy may be lightly edited for grammar, but section headings and overall paragraph meaning must remain consistent with reference.

# Behavior Contract
1. Entering play view for a `started` game shows Welcome page first.
2. Clicking `Let's Begin!` advances to the existing play destination (placeholder board is acceptable in Wave 1).
3. Resume path for a started game also lands on Welcome page.
4. Welcome CTA is keyboard focusable and triggers with Enter/Space.

# Technical Requirements
1. Keep styles isolated in `welcome-to-life.css`.
2. Component props:
   - `game`
   - `onBegin`
   - optional `mode` (`started` or `resumed`)
3. `PlayGamePage` may wrap `WelcomeToLifePage` to preserve route compatibility.

# Accessibility Requirements
1. Heading structure uses semantic levels (`h1`/`h2` as appropriate).
2. Quote block is readable in screen readers and visually grouped.
3. CTA meets 44px minimum hit target.
4. Color contrast must remain legible on gradient CTA and light background.

# Failure and Rollback Notes
1. If `/games/:id/play` still opens placeholder content first, block merge.
2. If welcome sections are missing or out of order, block merge.
3. If CTA is not keyboard-activatable, revert wiring and reintroduce with focused tests.

# Acceptance Criteria
1. Welcome screen visually aligns with Screen 7 structure and hierarchy.
2. Started/resumed play entry renders Welcome page first.
3. CTA navigates onward successfully.
4. Main Game Status fidelity (Screen 8/9) remains deferred and is not required in Wave 1.

# Validation
```bash
npm --prefix src/ui run test:ci
```

Manual visual validation (required):

1. Side-by-side check against `docs/sample-images/7.Life.Start.png`.
2. Verify section order, quote placement, and CTA visual treatment.
3. Confirm `Let's Begin!` routes to current post-welcome play destination.
