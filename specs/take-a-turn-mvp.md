# Take A Turn MVP

Date: 2026-04-03

Status: Implemented

## Summary

This spec records the full implementation plan executed for the first playable turn flow in the Modern Game of Life UI.

Before this work, the application supported:

- Home page with saved games
- New game wizard
- Welcome page after create or resume
- Placeholder play screen only
- Persistence of saved game records through localStorage or the optional AWS API

After this work, the application supports:

- Initializing a deterministic playable game state when a game is created
- Entering the game through a one-time welcome screen
- Taking a real turn for the active player
- Applying deterministic baseline monthly changes
- Choosing exactly one deterministic action
- Viewing an end-of-turn summary
- Rotating to the next player
- Persisting the updated game snapshot after each state transition through the existing storage adapter

This is a UI- and storage-level MVP. It establishes the first real game loop without adding randomness, new backend endpoints, or a full simulation engine.

## Goals

- Replace the existing play placeholder with a working turn flow.
- Support the existing 2-6 player setup flow without reducing feature scope to single-player.
- Use deterministic starter rules so the first playable loop is easy to verify and debug.
- Persist all gameplay state using the current `createGame` and `updateGame` storage model.
- Allow resume to restore the exact saved play subview and active player.
- Keep compatibility with older or seeded saved games that do not yet contain gameplay fields.

## Non-Goals

- Random events
- Seeded replay
- Full PRD-complete economics or health systems
- Mid-turn checkpointing
- New API endpoints
- Authentication or multi-user state separation
- Dedicated backend simulation service
- Reflection dashboards or historical charts beyond a compact turn-history record

## User Experience

### Entry Flow

The implemented flow is:

1. User creates a game in the wizard.
2. `Start Game` persists an initialized playable game snapshot.
3. The game opens on the existing welcome screen.
4. Clicking `Let's Begin!` persists the game with play state moved from `welcome` to `turn`.
5. The active player sees the Take A Turn screen.
6. The player reviews current metrics and the monthly baseline rules.
7. The player chooses one action.
8. The game resolves the turn and persists a summary state.
9. The user sees the Turn Summary screen.
10. Clicking continue moves the game into the next player's turn and persists that state.

Resume behavior:

- If a saved game is still in `welcome`, resume opens the welcome screen.
- If a saved game is in `turn`, resume opens the active turn screen.
- If a saved game is in `summary`, resume opens the end-of-turn summary screen.

### Screens Added Or Updated

#### Welcome Screen

File:

- `/workspaces/ffthh-game-of-life/src/ui/src/components/pages/WelcomeToLifePage.jsx`

Behavior:

- Remains in the main play route.
- Shows the game name.
- Presents `Let's Begin!` as the handoff into gameplay.
- Supports a saving state and error message.

#### Take Turn Screen

File:

- `/workspaces/ffthh-game-of-life/src/ui/src/components/pages/TakeTurnPage.jsx`

Behavior:

- Displays the active player and current month.
- Shows key player metrics:
  - Cash
  - Debt
  - Net worth
  - Monthly income
  - Physical health
  - Mental health
- Shows baseline monthly rule reminders.
- Shows exactly three deterministic actions.
- Allows one action choice to complete the turn.

#### Turn Summary Screen

File:

- `/workspaces/ffthh-game-of-life/src/ui/src/components/pages/TurnSummaryPage.jsx`

Behavior:

- Displays the acting player and month.
- Shows baseline deltas for income, living costs, debt payment, and health drift.
- Shows before/after values for major metrics.
- Shows the next player name.
- Allows continue into the next player's turn.

## Persisted Game Contract

The gameplay MVP extends the saved game record rather than introducing a separate game-state entity.

### Top-Level Additions

Each saved game may now include:

- `schemaVersion`
- `startedAt`
- `turnHistory`
- `lastTurnSummary`
- `playState`

### `playState`

Implemented shape:

```js
{
  view: 'welcome' | 'turn' | 'summary',
  activePlayerIndex: number,
  monthIndex: number,
  turnNumber: number,
}
```

Semantics:

- `view` controls which play subview is shown.
- `activePlayerIndex` identifies the current player in turn order.
- `monthIndex` increments when the rotation wraps back to player 1.
- `turnNumber` increments after every completed player turn.

### Player Gameplay State

Each player is normalized into a playable state that includes:

```js
{
  id: string,
  name: string,
  avatar: string,
  cityId: string,
  cityName: string,
  educationTrackId: string,
  educationTrackName: string,
  jobId: string,
  careerTrack: string | null,
  careerName: string,
  monthlyIncome: number,
  cash: number,
  debt: number,
  assets: number,
  investments: number,
  netWorth: number,
  physicalHealth: number,
  mentalHealth: number,
  actionHistory: Array<{
    turnNumber: number,
    monthIndex: number,
    actionId: string,
    actionLabel: string,
  }>,
  statusEffects: Array<any>,
}
```

### Turn Summary

Each completed turn stores a compact summary:

```js
{
  actingPlayerId: string,
  actingPlayerName: string,
  actionId: string,
  actionLabel: string,
  monthIndex: number,
  turnNumber: number,
  baseline: {
    player: PlayerState,
    deltas: {
      income: number,
      costOfLiving: number,
      debtPayment: number,
      mentalHealth: number,
      physicalHealth: number,
    },
  },
  before: {
    cash: number,
    debt: number,
    netWorth: number,
    physicalHealth: number,
    mentalHealth: number,
    monthlyIncome: number,
  },
  after: {
    cash: number,
    debt: number,
    netWorth: number,
    physicalHealth: number,
    mentalHealth: number,
    monthlyIncome: number,
  },
  nextPlayerName: string,
  nextPlayerIndex: number,
}
```

This contract is sufficient for the MVP summary screen and for future expansion into richer turn history displays.

## Deterministic Rule System

File:

- `/workspaces/ffthh-game-of-life/src/ui/src/services/gameplay.js`

### Initialization Rules

The initial playable state is derived from existing wizard choices:

- `cityId`
- `educationTrackId`
- `jobId`

The implementation uses deterministic lookups from:

- `/workspaces/ffthh-game-of-life/src/ui/src/data/wizardVisualCatalog.js`

Initialization decisions:

- Monthly income is derived from the selected career's weekly income times 4.
- Starting debt is derived from the selected career's listed debt.
- Starting cash is derived from the education track:
  - Degree: 7000
  - Trades: 9000
  - Self-Taught: 8000
- Starting health is derived from a common baseline with city and track adjustments.
- Assets and investments default to `0`.
- Net worth is always computed as:
  - `cash + assets + investments - debt`

### Monthly Baseline Rules

Turn resolution applies baseline monthly changes before the chosen action.

Implemented baseline rules:

- Add monthly income
- Subtract city cost of living
- Subtract debt payment
- Reduce debt by the same payment amount
- Apply city mental/physical drift
- Apply education-track mental/physical drift

Implemented city living costs:

- Metro: 2400
- Suburbia: 1800
- Small Town: 1450

Implemented city health effects:

- Metro: mental `-2`, physical `-1`
- Suburbia: mental `0`, physical `0`
- Small Town: mental `+1`, physical `+2`

Implemented education-track health effects:

- Degree: mental `-1`, physical `0`
- Trades: mental `0`, physical `+1`
- Self-Taught: mental `+1`, physical `0`

Implemented debt payment rule:

- `max(100, round(debt * 0.03))`
- Clamped so payment never exceeds remaining debt

### Actions

The MVP includes exactly three deterministic actions:

#### `debt-paydown`

- Cash `-500`
- Debt `-500`
- Mental health `+1`

#### `family-time`

- Cash `-150`
- Mental health `+8`
- Physical health `+2`

#### `job-training`

- Cash `-300`
- Monthly income `+100`
- Mental health `-1`

### Turn Resolution Order

The executed order is:

1. Read active player from `playState.activePlayerIndex`
2. Capture `before` snapshot
3. Apply deterministic monthly baseline
4. Apply chosen action
5. Recompute net worth
6. Append action history
7. Build `lastTurnSummary`
8. Append to `turnHistory`
9. Advance `activePlayerIndex`
10. Increment `monthIndex` when the player rotation wraps
11. Increment `turnNumber`
12. Set `playState.view = 'summary'`
13. Persist the full updated game snapshot

### Summary Advance

Continuing from the summary does not mutate player economics or health again.

It only:

- switches `playState.view` from `summary` to `turn`
- keeps the already-advanced `activePlayerIndex`
- preserves `monthIndex` and `turnNumber`
- updates `lastUpdated`
- persists the result

## Compatibility Rules

The MVP had to coexist with older or seeded game records that were created before gameplay fields existed.

Implemented compatibility behavior:

- If a game record has no `playState`, it is normalized into a playable snapshot on read.
- Missing player fields are filled from existing setup selections or defaults.
- Missing player IDs are generated deterministically from game ID and player index.
- Older game records do not crash the play route.

This logic lives in:

- `/workspaces/ffthh-game-of-life/src/ui/src/services/gameplay.js`

## App Integration

File:

- `/workspaces/ffthh-game-of-life/src/ui/src/App.jsx`

### Changes Made

- Imported gameplay helpers:
  - `initializeGameForPlay`
  - `ensurePlayableGame`
  - `beginGameFromWelcome`
  - `resolveTurn`
  - `advanceFromSummary`
- On game creation:
  - initialize playable game state before persisting
- On resume:
  - normalize the saved game into playable shape before opening the play route
- Added turn saving state and turn error state
- Added a shared `persistActiveGame` helper that uses `updateGame`
- Replaced the single `WelcomeToLifePage` rendering branch with a three-way branch:
  - `summary` -> `TurnSummaryPage`
  - `turn` -> `TakeTurnPage`
  - default -> `WelcomeToLifePage`

### Persistence Model

No transport-layer API changes were required.

The application continues to use:

- `createGame(game)`
- `updateGame(gameId, game)`
- `listGames()`
- `deleteGame(gameId)`

Storage continues to work in:

- localStorage mode
- API mode backed by the existing Lambda/DynamoDB contract

## Styling

File:

- `/workspaces/ffthh-game-of-life/src/ui/src/App.css`

Implemented additions:

- turn hero panel
- player header
- metrics grid
- baseline list
- action card grid
- summary grid
- responsive adjustments for mobile widths

The styling preserves the existing warm, card-based UI language instead of introducing a separate board-game visual system.

## Files Added

- `/workspaces/ffthh-game-of-life/src/ui/src/services/gameplay.js`
- `/workspaces/ffthh-game-of-life/src/ui/src/components/pages/TakeTurnPage.jsx`
- `/workspaces/ffthh-game-of-life/src/ui/src/components/pages/TurnSummaryPage.jsx`
- `/workspaces/ffthh-game-of-life/src/ui/src/services/__tests__/gameplay.test.js`
- `/workspaces/ffthh-game-of-life/specs/take-a-turn-mvp.md`

## Files Updated

- `/workspaces/ffthh-game-of-life/src/ui/src/App.jsx`
- `/workspaces/ffthh-game-of-life/src/ui/src/App.css`
- `/workspaces/ffthh-game-of-life/src/ui/src/components/pages/WelcomeToLifePage.jsx`
- `/workspaces/ffthh-game-of-life/src/ui/src/components/__tests__/pages.test.jsx`
- `/workspaces/ffthh-game-of-life/src/ui/src/components/__tests__/app.test.jsx`

## Verification Performed

The following verification was executed successfully:

```bash
npm --prefix src/ui run test:ci -- --run src/services/__tests__/gameplay.test.js src/components/__tests__/pages.test.jsx src/components/__tests__/app.test.jsx
npm --prefix src/ui run build
```

Observed results:

- Focused gameplay, page, and app-flow tests passed.
- Production build completed successfully.

## Follow-Up Opportunities

The MVP intentionally leaves room for future expansion. Likely next steps include:

- richer turn-history display in the play screen
- additional deterministic actions
- random events with a seed-based RNG
- expanded player economy with assets and investments
- clearer player-order visualization for multiplayer sessions
- home-screen summaries derived from `lastTurnSummary`
- API-side validation for the expanded game snapshot shape

