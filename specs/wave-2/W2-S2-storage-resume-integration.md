---
spec_id: W2-S2
title: Storage and Resume Persistence Integration
wave: 2
branch: codex/w2-s2-storage-resume-integration
base_branch: codex/wave-2-integration
test_commands:
  - npm --prefix src/ui run test:ci
  - npm --prefix src/ui run build
owned_paths:
  - specs/wave-2/W2-S2-storage-resume-integration.md
  - src/ui/src/services/gameStorage.js
  - src/ui/src/hooks/useGames.js
  - src/api/index.js
  - src/ui/src/data/seedGames.js
---

# Objective
Persist full new-game setup state at start and ensure resume loads all selected values intact using existing storage adapters and API routes.

# Scope
In scope:

- Extend `Game` and `Player` records in place (destructive schema update allowed).
- Persist setup payload on Start Game through existing `updateGame` flow.
- Keep API surface unchanged (`GET/POST/PUT/DELETE /games`).

Out of scope:

- New API endpoints.
- Backward-compatible migration layer.

# Storage Contract Changes

`Game` additions:

- `lifecycle.phase`
- `startedAt`

`Player` additions:

- `cityId`
- `educationTrackId`
- `jobId`
- `annualSalary`
- `monthlyIncome`
- `cash`
- `debt`
- `assets`
- `investments`
- `netWorth`

# Persistence Requirements

1. Start action persists all configured players in one `updateGame` call.
2. Local storage mode and API mode both preserve full payload.
3. Resume reads persisted values without recomputation drift.
4. Net worth may be negative and must be stored as numeric value.

# Destructive Update Rule

Because game has not launched, replacing older setup fields is allowed. Remove obsolete setup fields where safe to avoid dual-schema complexity.

# Acceptance Criteria

1. Persisted game payload includes avatar (gravitar), city, track, job, salary, cash, debt, assets, investments, netWorth.
2. API `PUT /games/{id}` round-trips full payload without dropping nested fields.
3. Seed games remain loadable (may be normalized at read time).

# Validation

```bash
npm --prefix src/ui run test:ci
npm --prefix src/ui run build
```
