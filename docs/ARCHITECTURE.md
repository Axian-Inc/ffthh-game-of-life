# Architecture

This project is a static React UI backed by an optional AWS persistence API. It is designed to run
fully locally (localStorage) or in AWS (DynamoDB + Lambda + API Gateway) with the same UI.

## System Overview
- UI: React + Vite static site (`src/ui`), deployed to S3 + CloudFront.
- Storage abstraction: UI reads/writes games via a storage adapter that can target localStorage
  or the AWS API (`src/ui/src/services/gameStorage.js`).
- API (AWS): Lambda function behind HTTP API Gateway, persisting games in DynamoDB (`src/api`).
- Infra: Terraform provisions S3, CloudFront, DynamoDB, Lambda, API Gateway (`terraform`).

## Data Flow
1. UI loads games via `createGameStorage()`:
   - Local mode: `window.localStorage` with seeded defaults.
   - API mode: HTTP calls to `/games` and `/games/{id}`.
2. UI creates/deletes games through the same adapter.
3. In play mode, completed turn actions (`Choose Action`, `Pass`) resolve one basic monthly money update for the active player, append a saved move-history entry, and then persist updated turn progression (`turnNumber`, `activePlayerIndex`) on the game.
   - The current UI persists move history as a game-level `moveHistory` array and filters it per player when `See History` opens.
4. In AWS, Lambda handles CRUD and writes to DynamoDB.

## Current Game Shape
- Created games persist game metadata, `players`, `turnNumber`, `activePlayerIndex`, `moveHistory`, timestamps, and resumability.
- Created players currently persist setup selections plus basic money state: cash, education debt, assets, net worth, monthly income, monthly expenses, health defaults, status effects, and action history.
- `moveHistory` entries currently record id, player id, player name, turn number, action type, action label, money delta, summary, and timestamp.
- Financial, job, and location values shown on the player-turn card are read from persisted state/catalog data. Health and modifier values are still shallow defaults until richer simulation rules land.

## Next Architecture Target
- Introduce canonical city and career definition data that can drive both setup display and simulation rules.
- Expand created players into the PRD `PlayerState` contract with cash, debts, assets, net worth, physical health, mental health, status effects, and action history.
- Add a turn-resolution module for a no-action monthly turn, starting with `Pass`: financial updates, debt updates, basic health drift/stress effects, empty event/action phases, and an end-of-turn summary.
- Persist reviewable turn-resolution logs with pre-turn snapshots, phase deltas, explanation strings, post-turn snapshots, and player/action metadata.
- Replace `PLAY_TURN_PLACEHOLDER` reads in the player-turn page with values derived from persisted player state.

## Environments
- Local dev:
  - Default storage is localStorage.
  - Optional: set `VITE_API_BASE_URL` to point to a deployed API.
- AWS deploy:
  - `scripts/deploy.sh` builds the UI with `VITE_API_BASE_URL` from Terraform outputs.

## Key Files
- UI:
  - `src/ui/src/App.jsx`: app state + modal flow + persistence calls.
  - `src/ui/src/services/gameStorage.js`: storage adapter and API client.
  - `src/ui/src/components/modals/PlayerHistoryModal.jsx`: player-scoped move history modal used from the turn screen.
- API:
  - `src/api/index.js`: Lambda handler for list/create/delete games.
- Infra:
  - `terraform/main.tf`: S3, CloudFront, DynamoDB, Lambda, API Gateway.
  - `terraform/outputs.tf`: exposes `api_base_url` for the UI build.
- Deploy:
  - `scripts/deploy.sh`: runs checks, applies Terraform, builds UI, and syncs to S3.

## Testing
- UI tests use Vitest + Testing Library.

## Non-goals (current)
- Authn/authz for the API.
- Multi-tenant separation beyond Terraform workspaces.

## UI flow
+- Home: hero + game list.
+- Create: modal-driven setup for game name, player identity, city, education, career, and summary.
+- Play: welcome page entry for both new games and resumes, followed by the player-turn screen.

## Agent Handoff
The current PRD implementation tracker and recommended next slice live in `docs/modern-game-of-life-prd.md` section 11. Start there before changing simulation or turn-flow code.
