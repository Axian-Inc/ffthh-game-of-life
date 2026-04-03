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
   - API mode: HTTP calls to `GET /games`, `POST /games`, `PUT /games/{id}`, and `DELETE /games/{id}`.
2. New games are initialized into playable game state in the UI before persistence, including active-player turn metadata, per-player financial/health stats, and deterministic RNG state.
3. The play route opens on a welcome screen, then transitions into the in-game turn UI on the same route.
4. Completed turns are resolved in the UI simulation layer and persisted as full-document game updates through the same storage adapter.
5. In AWS, Lambda handles CRUD and writes full game documents to DynamoDB.

## Environments
- Local dev:
  - Default storage is localStorage.
  - Optional: set `VITE_API_BASE_URL` to point to a deployed API.
- AWS deploy:
  - `scripts/deploy.sh` builds the UI with `VITE_API_BASE_URL` from Terraform outputs.

## Key Files
- UI:
  - `src/ui/src/App.jsx`: app state, routing, welcome-to-play transition, and persistence calls.
  - `src/ui/src/services/gameStorage.js`: storage adapter and API client.
  - `src/ui/src/utils/gameSimulation.js`: game-state initialization and turn resolution logic.
  - `src/ui/src/components/pages/PlayGamePage.jsx`: turn-taking UI, summaries, and pass-control flow.
- API:
  - `src/api/index.js`: Lambda handler for list/create/update/delete games.
- Infra:
  - `terraform/main.tf`: S3, CloudFront, DynamoDB, Lambda, API Gateway.
  - `terraform/outputs.tf`: exposes `api_base_url` for the UI build.
- Deploy:
  - `scripts/deploy.sh`: runs checks + tests, applies Terraform, builds UI, syncs to S3.

## Testing
- UI tests use Vitest + Testing Library.
- Deploys run `npm --prefix src/ui run test:ci` before infra/app steps.

## Non-goals (current)
- Authn/authz for the API.
- Multi-tenant separation beyond Terraform workspaces.

## UI flow
- Home: hero + game list.
- Create: modal-driven setup for game name, player identity, city, education, career, and summary.
- Welcome: `/games/:id/play` opens on the welcome page for both new games and resumes.
- Play: `Let's Begin!` enters the turn screen with dashboard, action selection, turn summary, and pass-control states.
