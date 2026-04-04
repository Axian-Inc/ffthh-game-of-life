# High-Fidelity Player Turn Placeholder

Historical note: this document describes the initial placeholder-only turn-screen rollout. It is not the current source of truth for play-mode behavior now that turn actions persist state and `See History` opens a player-scoped modal. Use `docs/ARCHITECTURE.md` and `docs/game-of-life-style-guide.md` for current behavior.

## Summary
- Add the missing turn-screen spec for [9.PlayerTurn.png](/workspaces/ffthh-game-of-life/docs/sample-images/9.PlayerTurn.png) and implement it as a desktop-only, high-fidelity UI shell that matches the mockup closely.
- Keep the current play entry flow: `/games/:id/play` still opens the Welcome screen first, and `Let's Begin!` advances into the new player-turn screen for both created and resumed games.
- Limit the change to static UI and test coverage. No gameplay logic, storage writes, API work, or active action handling is included.

## Interface Changes
- Keep the existing `/games/:id/play` route unchanged, but add an app-level play substate such as `playScreen: 'welcome' | 'turn'` so the play experience has an explicit two-step flow.
- Extend `window.life.status()` to expose `playScreen` so unit and E2E tests can assert the welcome-to-turn transition without depending on DOM-only checks.
- Introduce a dedicated static turn-screen view model for this placeholder screen, shaped around future PRD concepts: turn header, active player rail, financial stats, player status, modifier groups, and action buttons.

## Implementation Changes
- Update the style guide to add [9.PlayerTurn.png](/workspaces/ffthh-game-of-life/docs/sample-images/9.PlayerTurn.png) as a normative reference and insert a new `Player Turn` screen section before the interaction rules.
- In that new style-guide section, lock the anatomy: centered title and subtitle; a four-player horizontal turn rail with left/right chevrons; a large three-column white status card with soft shadow and vertical dividers; and a three-button action row centered beneath the card.
- In the style guide, lock the visual choices the prompt called out: 64px portrait tiles, teal-to-purple active-player outline and glow, pale-lilac inactive portrait cards, dark navy headings, muted gray subtitle text, red debt value, green health fills on pale tracks, dark slate side-button gradient, vivid teal-blue-purple center-button gradient, 24px card radius, and even horizontal spacing between the three bottom buttons.
- Extend the shared design tokens with the turn-screen-specific values needed to keep the CSS and the guide aligned: divider color, negative/debt color, health track/fill colors, dark action-button gradient, turn-avatar size, status-card max width, and action-row gap.
- Implement the new turn screen inside `PlayGamePage` as a view-only composition of semantic sections that mirror the future product model: turn header, player rail, financial column, career/health/location column, modifier groups, and action bar.
- Drive the screen from static placeholder content that matches the mockup exactly: `Modern Game of Life - Turn 10`, `Jack's Turn`, the Jack/Maya/Jordan/Sam rail, the displayed money figures, `Software Engineer`, `Denver, CO`, the two health bars, and the six modifier labels.
- Keep the existing Welcome page component, but change its continue behavior so `Let's Begin!` advances to the turn placeholder screen instead of routing back home.
- Use deterministic local assets for fidelity and stable screenshots: reuse `openmoji` where it closely matches the stat/modifier icons, and add repo-local portrait SVGs for the four rail portraits instead of reusing the current animal-avatar system.
- Keep `See History`, `Choose Action`, `Pass`, and the player-rail chevrons visually active to match the mockup, but wire them as no-op handlers for now. `Let's Begin!` is the only new control that changes UI state.
- Make the small architecture-doc update needed to keep the UI flow accurate: play becomes `Welcome` followed by the player-turn placeholder screen. No PRD update is required.

## Test Plan
- Update page/component tests so play mode starts on Welcome, `Let's Begin!` moves to the turn screen, and the turn screen renders the exact mockup labels and controls.
- Extend app/debug tests to assert `window.life.status().playScreen` changes from `welcome` to `turn`, while clicks on the placeholder turn-screen controls do not mutate persisted game data.
- Add a new Playwright visual test for the turn screen that seeds a resumable game, opens `/games/:id/play`, clicks `Let's Begin!`, disables animations, and captures a new desktop baseline screenshot for the full turn layout.
- Keep the current welcome-screen visual test as the first-step acceptance check, and treat the new turn-screen screenshot as the acceptance artifact for [9.PlayerTurn.png](/workspaces/ffthh-game-of-life/docs/sample-images/9.PlayerTurn.png).

## Assumptions And Defaults
- High fidelity to the mockup takes priority over temporary reuse, so the placeholder turn screen may use dedicated CSS and portrait assets.
- The placeholder turn screen always renders the mockup's four personas and values, even if the saved game has a different player count or different player names.
- No gameplay resolution, history drawer, action picker, turn advancement, or save-state mutation is part of this change.
