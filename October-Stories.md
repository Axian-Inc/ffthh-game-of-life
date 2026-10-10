# News-Driven Player Events Backlog

## Summary

Add one news-inspired event to every completed `Choose Action` or `Pass` turn. A dedicated Lambda will retrieve approved family-safe RSS content, send sanitized text to Amazon Bedrock, apply one bounded player effect, persist the result atomically, and return it for display in a blocking event modal.

Bedrock will never browse or receive web tools. Direct Bedrock Runtime inference supports this separation: the application supplies the source text, while tool execution only occurs when explicitly configured. See the [AWS Bedrock tool-use documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/tool-use.html).

Initial sources:

- JPL news feed: `https://www.jpl.nasa.gov/feeds/news/`
- NOAA National Ocean Service news: `https://oceanservice.noaa.gov/rss/nosnews.xml`
- The Onion is excluded from v1 because of audience-suitability and scraping-policy concerns.

## Interfaces and Data Contract

Add `POST /games/{id}/turns/advance`:

```json
{
  "actionType": "choose_action",
  "expectedVersion": 4
}
```

Return the updated game and generated event. Use `expectedVersion` plus a server-derived turn key to make retries idempotent and conflicting advances return `409`.

Persist each `LifeEvent` with:

```text
id, turnKey, playerId, turnNumber, title, narrative,
outcome: positive | negative | neutral,
effect: { metric: cash | physicalHealth | mentalHealth, amount },
source: { publisher, headline, publishedAt },
generationMode: bedrock | fallback,
createdAt
```

Rules:

- Exactly one metric is selected.
- Cash delta: integer from `-500` through `500`.
- Health delta: integer from `-5` through `5`, clamped to `0–100`.
- Positive amounts must be above zero, negative below zero, and neutral exactly zero.
- Recalculate net worth after cash changes.
- Display publisher and headline as plain text; do not show an external link.

## Stories

### MGOL-201 — Establish event-ready player state

**Status: Implemented**

**As a player, I want event outcomes to affect my saved game so that generated stories have visible consequences.**

Acceptance criteria:

- New players receive persisted cash, net worth, physical health, and mental health values from canonical career/city definitions.
- Legacy games missing those fields are normalized when first advanced.
- Health is always constrained to `0–100`; net worth remains consistent with cash, assets, and debt.
- Game records include an integer `version` for conditional turn updates.
- Existing save/resume behavior remains compatible.

### MGOL-202 — Retrieve approved source content

**Status: Implemented**

**As the game service, I want current, age-appropriate web content so that events feel connected to the world.**

Acceptance criteria:

- A source registry contains only the two exact HTTPS RSS URLs above; request data and model output can never supply a URL.
- Each new turn selects one source deterministically and retrieves its feed at turn time.
- The fetcher accepts only the configured hostname, revalidates every redirect, rejects non-HTTPS destinations, limits response size, and times out after 2.5 seconds.
- XML entities, markup, scripts, instructions, and tracking parameters are removed; only publisher, headline, publication date, and at most 4,000 characters of description are retained.
- Articles older than 14 days are excluded when newer entries exist.
- Source terms and `robots.txt` are reviewed before enabling any future feed.
- Failure produces a typed source error for the fallback path rather than blocking the turn.

### MGOL-203 — Generate and evaluate an event with Bedrock

**Status: Implemented**

**As a player, I want AI to turn current content into a positive, negative, or neutral life event with a clear impact.**

Acceptance criteria:

- A dedicated Node.js 24 Lambda invokes Bedrock Runtime using `us.amazon.nova-2-lite-v1:0`; the model ID remains environment-configurable.
- The prompt receives sanitized source content and anonymous gameplay values only—never player names or other entered personal data.
- The model must produce the `LifeEvent` schema, including its outcome classification and effect.
- Use temperature `0`, validate the result locally, and reject missing, extra, contradictory, or out-of-range fields.
- Configure a Bedrock Guardrail for prompt attacks, sexual content, violence, hate, insults, misconduct, self-harm, drugs, and gambling on both input and output. Bedrock supports applying guardrails directly during inference. See [AWS Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html).
- Treat source content as untrusted data and explicitly instruct the model not to follow instructions embedded in it.
- No Bedrock Agent, action group, server-side search, tool configuration, or Mantle endpoint is created. The Lambda alone retrieves the approved feed and supplies its text to `bedrock-runtime`.

### MGOL-204 — Resolve and persist the event as part of turn advancement

**Status: Implemented**

**As a player, I want the event and its effect saved with my turn so that the outcome survives refresh and resume.**

Acceptance criteria:

- `POST /games/{id}/turns/advance` loads the active player, retrieves content, invokes Bedrock, validates/applies the effect, records the move and event, rotates the active player, and conditionally persists the updated game.
- Both `Choose Action` and `Pass` use this endpoint in AWS mode.
- Repeating the same turn request returns the previously stored event without another source or Bedrock call.
- A stale, genuinely different request receives `409` and the client reloads the latest game.
- The existing generic game-update endpoint cannot be used to bypass event generation when completing a turn.
- Local-storage mode uses the same event contract with deterministic fallback events and requires no AWS credentials.

### MGOL-205 — Display and acknowledge the player event

**Status: Implemented**

**As a player, I want to see what happened and how it changed my status before the next player begins.**

Acceptance criteria:

- Clicking either turn action disables all turn controls and shows an accessible loading state.
- Once resolved, a blocking modal shows the event title, short narrative, positive/negative/neutral label, metric delta, resulting metric value, publisher, and original headline.
- Tone uses supportive, age-appropriate language and never frames a setback as personal failure.
- The active player remains visible until the player acknowledges the modal.
- A single `Continue` button closes the modal and reveals the next player’s turn.
- The saved event appears in that player’s history after refresh or resume.
- Focus is trapped in the modal, Escape does not skip acknowledgment, and screen readers announce the outcome and delta.

### MGOL-206 — Provide safe fallback and operational visibility

**Status: Implemented**

**As a player, I want turns to continue when external services fail so that family play is not interrupted.**

Acceptance criteria:

- Source, Bedrock, guardrail, timeout, parse, and schema failures select a deterministic event from a reviewed family-safe fallback catalog.
- Fallback events obey the same schema and effect bounds and are marked `generationMode: fallback`.
- Total event-generation time is capped at 12 seconds; failure after that point returns the fallback event.
- CloudWatch records source ID, latency, Bedrock latency, outcome, metric, generation mode, and error category without logging feed bodies, prompts, model responses, or player-entered names.
- Metrics and alarms cover Lambda errors, fallback rate, Bedrock throttling, guardrail blocks, and p95 latency.
- IAM grants only DynamoDB read/conditional-write access, logging, and `bedrock:InvokeModel` for the configured inference profile.
- Every Terraform resource identifier includes the active workspace suffix, and deployment continues to refuse the `default` workspace.

## Test Plan

- Unit-test RSS parsing, redirect/hostname rejection, payload limits, sanitization, article selection, event-schema validation, effect bounds, health clamping, and deterministic fallbacks.
- Test positive, negative, and neutral Bedrock responses for all three metrics, plus malformed and guardrail-blocked responses.
- Mock source HTTP, Bedrock, and DynamoDB in Lambda integration tests; verify idempotent retry and stale-version conflict behavior.
- UI-test loading, modal content, accessibility, acknowledgment, history persistence, API failure, and both turn actions.
- End-to-end test one complete multiplayer round, including refresh/resume and a forced fallback.
- Verify Terraform plan in a non-default workspace and assert that no Bedrock Agent, action group, web-search tool, or unrestricted model permission exists.

## Assumptions

- Player-state initialization is a prerequisite because the current repository still displays placeholder financial and health values.
- NASA/JPL and NOAA feeds are the only enabled v1 sources; adding a source requires code/configuration review and tests.
- Direct Bedrock Runtime is used rather than Bedrock-managed web access. AWS recommends `bedrock-runtime` for normal inference and reserves server-side tools for separately configured endpoints. See [Bedrock endpoints](https://docs.aws.amazon.com/bedrock/latest/userguide/endpoints.html).
- Nova 2 Lite is selected for low-cost on-demand inference and supports Converse plus Guardrails. See [Amazon Nova 2 inference](https://docs.aws.amazon.com/nova/latest/nova2-userguide/core-inference.html).
- No source article body or generated prose is displayed verbatim beyond the original headline and publisher attribution.
