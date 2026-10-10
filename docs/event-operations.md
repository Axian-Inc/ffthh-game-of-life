# Player Event Operations

The event-generator Lambda emits one CloudWatch Embedded Metric Format record per generation attempt in the `ModernGameOfLife/PlayerEvents` namespace.

## Recorded fields

- `SourceId`, `GenerationLatency`, and `BedrockLatency`
- `Outcome`, `Metric`, and `GenerationMode`
- `ErrorCategory`: `none`, `source`, `bedrock`, `bedrock_throttling`, `guardrail`, `timeout`, `parse`, `schema`, or `configuration`

The record intentionally excludes feed bodies, headlines, descriptions, prompts, model responses, game and player ids, and player-entered names. Metrics use only the Lambda function name as a CloudWatch dimension to avoid high-cardinality data.

## Alarms

Terraform creates workspace-scoped alarms for:

- Event-generator Lambda errors
- Fallback rate above 25 percent in five minutes
- Any Bedrock throttling or guardrail block in five minutes
- Player-event p95 generation latency above 10 seconds

Missing data does not trigger an alarm. Alarm notification actions are left to environment-specific operations configuration.

## Fallback behavior

The reviewed catalog in `src/api/eventFallbacks.js` is selected deterministically from the anonymous game/turn/player key. Every fallback is revalidated against the same bounded event schema as model output and persists with `generationMode: fallback`.

The complete source and Bedrock operation has a 12-second deadline. A timeout aborts any in-flight Bedrock request and returns a fallback event so the turn can still be saved and acknowledged.
