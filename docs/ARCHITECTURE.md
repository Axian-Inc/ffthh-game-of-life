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
3. In AWS, Lambda handles CRUD and writes to DynamoDB.

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
- API:
  - `src/api/index.js`: Lambda handler for list/create/delete games.
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
+- Home: hero + game list.
+- Create: modal-driven setup for game name, player identity, city, education, career, and summary.
+- Play: welcome page entry for both new games and resumes.
