---
spec_id: W1-S3
title: Welcome To Life Screen UI
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
---

# Objective
Implement the post-start “Welcome to Life” screen with layout and copy structure matching the provided reference image.

# Scope
In scope:

- Build dedicated `WelcomeToLifePage` component.
- Include headline, explanatory sections, quote box, and primary CTA (`Let's Begin!`).
- Keep component reusable for both first start and resume entry.

Out of scope:

- Routing/state logic for when this page is shown.
- Storage updates.

# UI Requirements

1. Main logo/icon at top.
2. Title: `Welcome to Life!`.
3. Three body sections:
   - `A Month at a Time`
   - `Choices Matter`
   - `Life Happens`
4. Quote callout block between middle and final sections.
5. Primary CTA button at bottom.

# Technical Requirements

1. Style in a dedicated stylesheet (`welcome-to-life.css`) to avoid conflict with wizard spec.
2. Keep props minimal:
   - `game`
   - `onBegin`
   - optional `mode` (`started` or `resumed`)
3. Keep old `PlayGamePage` as thin wrapper or alias if needed for route compatibility.

# Failure and Rollback Notes

1. If route compatibility regresses, keep `PlayGamePage` as a wrapper and roll back direct route binding changes.
2. If required copy or layout sections are missing, block merge and restore the previous complete page structure before polishing styles.
3. If CTA interaction is not keyboard-accessible, revert button wiring changes and reintroduce with accessibility checks.

# Acceptance Criteria

1. Welcome screen renders in isolation with realistic game data.
2. CTA is keyboard reachable and clickable.
3. No placeholder “Game board coming soon” copy remains on default play/welcome entry.

# Validation

```bash
npm --prefix src/ui run test:ci
```
