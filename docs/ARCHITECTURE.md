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
3. In API mode, both turn actions call `POST /games/{id}/turns/advance` with the current game version. The games Lambda loads the active player, invokes the event-generator Lambda, validates and applies one bounded effect, records the event and move, rotates players, and conditionally writes the next version to DynamoDB.
   - A server-derived `game-id:version` turn key makes completed retries return the persisted event without another generator call. A stale different action returns `409`, after which the client reloads the latest games.
   - Generic `PUT /games/{id}` requests cannot modify version, players, turn position, move history, or events.
4. In local mode, the same storage method and persisted `LifeEvent` contract use a deterministic family-safe fallback catalog without AWS credentials.

## News Content Ingestion
- Server-side source retrieval is implemented in `src/api/contentSources.js` for later use by the turn-event Lambda.
- The source registry is code-owned and currently restricted to the verified NOAA RSS URL documented in `docs/content-source-policy.md`; neither clients nor model output can provide a URL. The previously reviewed JPL feed was removed from rotation because it consistently returned HTTP 403 from AWS.
- A stable game/turn/player key selects the source and article deterministically from articles published within the last year (or the full feed when none qualify). The one-year pool accommodates sources that publish less frequently while still varying stories between turns. Fetches require HTTPS, revalidate same-host redirects, stop after 2.5 seconds, and reject responses larger than 512 KiB.
- Feed output is reduced to publisher, headline, publication time, and a sanitized description of at most 4,000 characters. Retrieval and parsing failures use typed errors so turn resolution can fall back safely.
- A dedicated Node.js 24 Lambda (`eventGenerator.handler`) retrieves the approved content and invokes the environment-configured Bedrock inference profile, defaulting to `us.amazon.nova-2-lite-v1:0` through the Bedrock Runtime Converse API at temperature `0`.
- Only allowlisted anonymous gameplay fields are included in the prompt. The source is labeled as untrusted, no tools are configured, and the strict local validator rejects malformed, incomplete, additional, contradictory, or out-of-range `LifeEvent` fields.
- A versioned Bedrock Guardrail evaluates inference input for prompt attacks and evaluates both input and output for harmful content; denied topics cover self-harm, drugs, and gambling. IAM limits inference to the Nova profile and underlying regional foundation models and requires the configured guardrail.
- The event-generator role grants only guarded model invocation, `ApplyGuardrail` for that exact guardrail as required by Bedrock, and writes to its specific Lambda log group.
- The generator remains internal: the games Lambda invokes it synchronously from the turn-advance route, while only the games API is exposed through API Gateway.
- Source, Bedrock, guardrail, timeout, parse, schema, and configuration failures resolve to a deterministic reviewed fallback event. The generator races the entire operation against a 12-second deadline and aborts an in-flight Bedrock request when that deadline wins.
- Each attempt writes one privacy-safe CloudWatch Embedded Metric Format record containing only the selected source id, aggregate timings, classified outcome/effect, generation mode, and error category. Feed bodies, prompts, model output, player names, and game/player ids are omitted.
- CloudWatch alarms cover Lambda errors, fallback percentage, Bedrock throttling, guardrail blocks, and p95 generation latency. See `docs/event-operations.md`.

## Current Game Shape
- Created games persist game metadata, an integer `version`, `players`, `turnNumber`, `activePlayerIndex`, `moveHistory`, `events`, timestamps, and resumability.
- Created players persist setup selections plus canonical simulation state: age, career/city ids, cash, debts, assets, net worth, physical health, mental health, status effects, and action history.
- Career and city definitions provide the starting financial/health values and future simulation modifiers. Storage normalization fills missing legacy fields, bounds health to `0-100`, and recalculates net worth from cash, assets, and debts.
- `moveHistory` entries record id, player id, player name, turn number, action type, action label, event id, and timestamp. The corresponding `events` entry contains the turn key, narrative, classified effect, source attribution, generation mode, and timestamp.
- Financial, career, health, location, and modifier values shown on the player-turn card are still placeholder UI data.

## Next Architecture Target
- Replace `PLAY_TURN_PLACEHOLDER` values with persisted player state, then build the action catalog and preview flow from the PRD.

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
  - `src/ui/src/services/turnEvents.js`: deterministic local turn events and effect application.
  - `src/ui/src/components/modals/PlayerEventModal.jsx`: blocking event outcome and acknowledgment UI.
  - `src/ui/src/components/modals/PlayerHistoryModal.jsx`: player-scoped move history modal used from the turn screen.
- API:
  - `src/api/index.js`: games CRUD and conditional turn-advance orchestration.
  - `src/api/turnResolution.js`: shared server-side turn validation, effect application, and event persistence.
  - `src/api/contentSources.js`: approved feed retrieval and sanitization.
  - `src/api/eventGenerator.js`: guarded Bedrock inference and strict `LifeEvent` validation.
  - `src/api/eventFallbacks.js`: reviewed deterministic family-safe fallback catalog.
- Infra:
  - `terraform/main.tf`: S3, CloudFront, DynamoDB, Lambdas, API Gateway, Bedrock Guardrail, and least-privilege event-generation IAM.
  - `terraform/outputs.tf`: exposes `api_base_url` for the UI build.
- Deploy:
  - `scripts/deploy.sh`: runs checks, applies Terraform, builds UI, and syncs to S3.

## Testing
- UI tests use Vitest + Testing Library; API modules use Node's built-in test runner.

## Non-goals (current)
- Authn/authz for the API.
- Multi-tenant separation beyond Terraform workspaces.

## UI flow
+- Home: hero + game list.
+- Create: modal-driven setup for game name, player identity, city, education, career, and summary.
+- Play: welcome page entry for both new games and resumes, followed by the player-turn screen.

## Agent Handoff
The current PRD implementation tracker and recommended next slice live in `docs/modern-game-of-life-prd.md` section 11. Start there before changing simulation or turn-flow code.
