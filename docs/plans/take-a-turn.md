# Add Turn-Taking to the Play Experience

## Summary
Implement the first real turn loop on the existing single-page play screen. Each turn represents one in-game month for the active player and resolves in PRD order: net-worth changes, health updates, event resolution, one player action, then an end-of-turn summary. Persist the full updated game after every completed turn through the existing `updateGame` flow, and insert an explicit pass-control screen before the next player begins.

## Key Changes
### Game state and persistence
- Expand the stored game shape from setup-only metadata into playable state.
- Add top-level game fields for `activePlayerIndex`, `turnNumber`, `startedAt`, `lastTurnAt`, `phase`, `turnHistory`, and a deterministic `randomSeed` or equivalent reproducible RNG state.
- Expand each player record into turn-ready state with at minimum: `cash`, `debt`, `stocks`, `bonds`, `netWorth`, `physicalHealth`, `mentalHealth`, `cityId`, `jobId`, `monthlyIncome`, `monthlyExpenses`, `statusEffects`, `actionHistory`, and `pendingCityId` for delayed relocation.
- Initialize this playable state when a game is created by deriving baseline stats from current city/career selections instead of leaving players as setup-only objects.
- Keep API compatibility by continuing to store and replace the whole game document via the existing `PUT /games/{id}` path; do not add new endpoints in this slice.

### Rules and simulation
- Add a small, explicit simulation module in the UI that owns turn resolution and is isolated from rendering.
- Resolve turns in fixed order:
  1. Income and recurring costs.
  2. Debt interest/minimum payment.
  3. Net-worth recompute.
  4. Physical and mental health baseline drift from city/career/stress.
  5. One event draw with explanation text.
  6. One optional player action.
  7. End-of-turn summary and next-player rotation.
- Use foundational deterministic rules based on existing wizard data:
  - Career drives base monthly income, starting cash/debt, and risk profile.
  - City drives cost multiplier plus baseline health modifiers.
  - Financial stress lowers mental health when debt or negative cash crosses thresholds.
- Implement a small action catalog:
  - `side-gig`
  - `debt-paydown`
  - `join-gym`
  - `spend-time-with-family-friends`
  - `invest-in-stocks`
  - `relocate-city`
- Implement a small event catalog with transparent odds/explanations and modest effects, such as work bonus, surprise expense, minor illness, and social boost.
- Apply relocation from the following turn, not immediately.

### Play UI flow
- Replace the placeholder [PlayGamePage.jsx](/workspaces/ffthh-game-of-life/src/ui/src/components/pages/PlayGamePage.jsx) with a real turn screen.
- Structure the page around:
  - Current player header and seat order.
  - Player dashboard with cash, debt, net worth, physical health, and mental health.
  - Phase summary panel showing what happened this month.
  - Action picker with preview copy for costs and likely outcomes.
  - End-turn summary card with intended vs unintended outcomes.
  - Explicit pass-control state naming the next player before their turn opens.
- Keep the play flow on one page by switching internal view state between `turn-start`, `action-select`, `turn-summary`, and `pass-control`.
- Show enough context for all players to understand rotation, but keep detailed controls scoped to the active player.

### Public interfaces and types
- Formalize lightweight UI-side types/interfaces for:
  - `GameState`
  - `PlayerState`
  - `ActionDefinition`
  - `LifeEvent`
  - `TurnResolution`
  - `TurnDelta` or equivalent phase-by-phase change record
- Ensure `TurnResolution` stores:
  - active player id
  - turn number / month number
  - pre-turn snapshot summary
  - phase deltas
  - chosen action
  - resolved event
  - explanation strings
  - post-turn snapshot summary
- Keep list/home screens backward-compatible by continuing to expose `name`, `status`, `players`, `lastUpdated`, and `resumable`.

## Test Plan
- Unit-test game initialization from wizard-created players so city/career choices produce the expected starting cash, debt, income, expenses, and health values.
- Unit-test turn resolution order so monthly finance changes happen before health/event/action effects.
- Unit-test each core action for prerequisite checks, immediate effects, and persisted action history.
- Unit-test relocation timing so new city modifiers apply starting on the next turn only.
- Unit-test deterministic replay so the same seed plus same action choices yields the same event/result sequence.
- Unit-test seat rotation and pass-control so turns advance in fixed player order and persist after each completed turn.
- Update component tests for [PlayGamePage.jsx](/workspaces/ffthh-game-of-life/src/ui/src/components/pages/PlayGamePage.jsx) to cover the action-selection, summary, and handoff states.
- Add storage-level tests around updating an existing game with richer turn-state payloads.

## Assumptions and Defaults
- This slice is UI-led and uses the current whole-game persistence path; API expansion to `POST /actions` and `POST /turns/advance` is deferred.
- The first release uses a compact action/event catalog, not the full PRD catalog.
- “Up to one action per turn” is implemented as exactly zero or one chosen action, with skipping allowed and no carryover.
- Monthly values are derived from current wizard city/career definitions using simple explicit constants where the current catalog lacks machine-readable numbers.
- Turn history is stored in the game document for summaries and future reflection features, but session-wide analytics screens remain out of scope for this slice.
