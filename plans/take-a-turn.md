# MVP Player Turn System With API-Owned Resolution

## Summary
This plan has been executed in the repo as an MVP playable turn loop for the Modern Game of Life. It supports one player taking one monthly turn at a time, resolving that turn through the API, persisting the resulting game state, and handing control to the next player through an interstitial handoff screen.

The implementation is intentionally scoped to an MVP turn loop rather than the full PRD simulation. It preserves the required shape for later expansion into fuller PRD phase ordering.

## Product Decisions
- Scope: MVP turn loop
- Simulation ownership: API-owned engine
- Multiplayer handoff: interstitial handoff
- Save point: persist after every completed player turn and at every between-turn handoff state
- Turn representation: one turn equals one in-game month for one player
- Action limit: one player action per turn
- Resume behavior: resume returns to the current between-turn or turn-ready state, never to a partial turn

## Implemented User Flow
1. User creates a game and lands on the existing welcome page.
2. `Let's Begin!` enters a new turn hub for the active player.
3. The turn hub shows the active player, current month, core stats, and available actions.
4. Player selects one action and confirms `Take Turn`.
5. UI sends a turn-advance request to the API or local storage adapter.
6. The turn resolves in deterministic phase order and returns updated game state plus structured turn resolution details.
7. UI shows an end-of-turn summary for the player who just finished.
8. User proceeds to an interstitial handoff screen naming the next player.
9. `Start Next Turn` enters the next player's turn hub.
10. The game can be exited and resumed from the saved turn-ready or handoff state.

## Implemented Scope
### Included
- Fixed seat order turn rotation
- One action per turn
- Turn hub UI for the current player
- Action preview values shown before committing
- API-owned turn resolution
- End-of-turn summary
- Between-turn interstitial handoff
- Save and resume through persisted game state
- Deterministic seeded randomness
- Basic monthly simulation slices:
  - income
  - recurring costs
  - debt update
  - health drift
  - one event roll
  - one chosen action
- Persisted history sufficient for later reporting

### Deferred
- Full catalog of all PRD actions
- Rich city and career economies
- Bankruptcy system
- Reflection summary across a whole campaign
- Multiple event chains in a single turn
- Advisors
- Deep charts and trend reporting
- Mid-turn save

## Implemented Architecture
### High-level split
- UI:
  - collects action choice
  - presents previews and summaries
  - navigates between turn hub, end summary, and handoff
  - persists by calling the storage abstraction
- API:
  - validates chosen action against current game state
  - resolves the full turn
  - advances active player and month if rotation wraps
  - returns both the new `GameState` and `TurnResolution`
- Storage:
  - stores full `GameState` snapshots as the source of truth
  - stores turn history sufficient for resume and future reporting

## Persisted Interfaces
### `GameState`
- `id: string`
- `name: string`
- `status: 'turn_ready' | 'handoff' | 'completed'`
- `createdAt: number`
- `lastUpdated: number`
- `randomSeed: string`
- `version: number`
- `currentMonth: number`
- `activePlayerIndex: number`
- `players: PlayerState[]`
- `availableActions: ActionDefinition[]`
- `lastTurnResolution: TurnResolution | null`
- `pendingHandoff: HandoffState | null`

### `PlayerState`
- `id`
- `name`
- `avatar`
- `age`
- `careerId`
- `cityId`
- `cash`
- `debts`
- `assets`
- `netWorth`
- `physicalHealth`
- `mentalHealth`
- `statusEffects`
- `actionHistory`

### `ActionDefinition`
- `id`
- `label`
- `description`
- `upfrontCost`
- `recurringCost`
- `durationMonths`
- `cooldownMonths`
- `preview`

### `TurnResolution`
- `turnId`
- `gameId`
- `playerId`
- `month`
- `preTurnSnapshot`
- `phases`
- `actionChoice`
- `summary`
- `postTurnSnapshot`
- `nextActivePlayerIndex`
- `wrappedToNextMonth`
- `completedAt`

### `HandoffState`
- `fromPlayerId`
- `toPlayerId`
- `toPlayerName`
- `month`
- `readyAt`

## API Surface
Implemented endpoints:
- `GET /games`
- `POST /games`
- `GET /games/{id}`
- `PUT /games/{id}`
- `DELETE /games/{id}`
- `POST /games/{id}/turns/advance`

### Turn advance request
```json
{
  "playerId": "player-1",
  "actionId": "job-training",
  "version": 1
}
```

### Turn advance response
```json
{
  "game": {},
  "turnResolution": {}
}
```

## Turn Engine Behavior
Turns resolve in this order:
1. Net Worth Changes
2. Physical and Mental Health Updates
3. Event Resolution
4. Player Action
5. End-of-Turn Summary

## Implemented MVP Content
### Careers
- `degree-track`
- `trades-track`
- `street-smart`

### Cities
- `metro`
- `suburbia`
- `small-town`

### Actions
- `study-school`
- `job-training`
- `invest-stocks`
- `invest-bonds`
- `join-gym`
- `spend-time-with-family-friends`
- `debt-paydown`
- `side-gig`

### Events
- `minor-illness`
- `surprise-expense`
- `bonus-opportunity`
- `burnout-warning`
- `calm-month`

## Implemented UI Changes
The placeholder play flow was replaced with:
1. `WelcomeToLifePage`
2. `TurnHubPage`
3. `TurnSummaryPage`
4. `TurnHandoffPage`

### `TurnHubPage`
Shows:
- current month
- active player name
- financial summary
- health summary
- one card per available action
- preview ranges for expected impact
- `Take Turn`
- `Save and Exit`

### `TurnSummaryPage`
Shows:
- turn headline
- intended outcomes
- unintended outcomes
- delta rows for key metrics
- event explanation cues
- `Continue`

### `TurnHandoffPage`
Shows:
- next player name
- current month
- pass-device prompt
- `Start Next Turn`
- `Exit to Home`

## Implemented File Changes
### API
- `src/api/index.js`
- `src/api/turnEngine.js`

### UI
- `src/ui/src/App.jsx`
- `src/ui/src/App.css`
- `src/ui/src/services/gameStorage.js`
- `src/ui/src/hooks/useGames.js`
- `src/ui/src/utils/turnEngine.js`
- `src/ui/src/components/pages/TurnHubPage.jsx`
- `src/ui/src/components/pages/TurnSummaryPage.jsx`
- `src/ui/src/components/pages/TurnHandoffPage.jsx`
- `src/ui/src/components/games/GameCardActions.jsx`
- `src/ui/src/components/games/StatusPill.jsx`
- `src/ui/src/data/seedGames.js`
- `src/ui/src/test/testUtils.js`

### Infrastructure
- `terraform/main.tf`

## Verification Completed
- `npm --prefix src/ui run test:ci`
- `npm --prefix src/ui run build`
- `node -e "require('./src/api/index.js')"`
- `terraform -chdir=terraform validate`

## Assumptions and Defaults
- This is an MVP turn-taking implementation, not the full v1 game.
- One action per turn is mandatory in the implemented MVP.
- The API is the source of truth for turn resolution in cloud mode.
- Resume is supported from persisted turn-ready and handoff states, not mid-turn.
- The current repo still contains some setup content that is broader than strict PRD naming, but the turn engine itself uses the implemented career and city ids above.
