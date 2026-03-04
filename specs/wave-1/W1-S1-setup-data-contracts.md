---
spec_id: W1-S1
title: Setup Data Contracts and Canonical Catalogs
wave: 1
branch: codex/w1-s1-setup-data-contracts
base_branch: codex/wave-1-integration
test_commands:
  - npm --prefix src/ui run test:ci
owned_paths:
  - specs/wave-1/W1-S1-setup-data-contracts.md
  - src/ui/src/data/setupCatalog.js
  - src/ui/src/utils/startingState.js
  - src/ui/src/components/__tests__/setup-catalog.test.js
---

# Objective
Create a single, shared, data-driven setup catalog and starting-state utility that powers city, track, and job choices for the wizard.

# Scope
In scope:

- Add catalog exports for cities, education tracks, and jobs.
- Add utility to compute starting player financial values.
- Replace inline setup constants in UI with imports from catalog.

Out of scope:

- Wizard layout/styling work.
- Routing/view transitions.
- API/storage adapter changes.

# Canonical Data (Must Match Exactly)

## Cities

| id | label | costOfLivingMultiplier | taxRate | opportunityMultiplier | mentalBaseline | physicalBaseline |
|---|---:|---:|---:|---:|---:|---:|
| `san-francisco-ca` | San Francisco, CA | 2.5 | 0.09 | 3.0 | 5 | 2 |
| `denver-co` | Denver, CO | 1.2 | 0.05 | 1.5 | 8 | 9 |
| `tonopah-nv` | Tonopah, NV | 0.7 | 0.02 | 0.5 | 2 | 3 |

## Education Tracks

| id | label | debtProfile | longTermPotential | stabilityLabel |
|---|---|---|---|---|
| `degree-track` | Degree Track | High debt | Great | High |
| `trades-track` | Trades Track | Low debt | Good | High |
| `self-taught-track` | Self-Taught Track | Minimal debt | Variable-high | Variable |

## Jobs

| id | trackId | label | annualSalary | stability | wageGrowth | startDebt | startingCash |
|---|---|---|---:|---|---|---:|---:|
| `anesthetist` | `degree-track` | Anesthetist | 210000 | High | High | 160000 | 500 |
| `veterinarian` | `degree-track` | Veterinarian | 115000 | High | Medium | 90000 | 500 |
| `doctor` | `degree-track` | Doctor | 180000 | High | High | 140000 | 500 |
| `dental-hygienist` | `trades-track` | Dental Hygienist | 77000 | High | Medium | 10000 | 500 |
| `electrician` | `trades-track` | Electrician | 60000 | High | High | 8000 | 500 |
| `mechanic` | `trades-track` | Mechanic | 42000 | High | Medium | 6000 | 500 |
| `polymarket-trader` | `self-taught-track` | Polymarket Trader | 68000 | Variable | Variable | 0 | 500 |
| `instagram-influencer` | `self-taught-track` | Instagram Influencer | 52000 | Variable | High | 0 | 500 |
| `vibe-coder` | `self-taught-track` | Vibe Coder | 90000 | Variable | High | 0 | 500 |

# Starting State Rules

1. `cash = 500` unless job `startingCash` overrides.
2. `assets = 0`.
3. `investments = 0`.
4. `debt = job.startDebt`.
5. `monthlyIncome = Math.round(annualSalary / 12)`.
6. `netWorth = assets + investments + cash - debt`.
7. Negative net worth is valid.

# Failure and Rollback Notes

1. If catalog records are incomplete or mismatched, block merge and restore the last valid catalog snapshot before retrying.
2. If setup options remain hardcoded in UI components, revert those component edits and rewire imports from the catalog only.
3. If computed starting values regress, roll back `startingState` utility changes and reintroduce them with explicit test coverage for each rule.

# Acceptance Criteria

1. Catalog is the only source of truth for cities/tracks/jobs.
2. No setup options remain hardcoded inside page components.
3. Utility returns deterministic starting values from city + track + job.
4. Unit test verifies all required records and key computed values.

# Validation

```bash
npm --prefix src/ui run test:ci
```

Plus explicit assertions:

1. `vibe-coder.monthlyIncome` equals `7500`.
2. Degree-track job start debt is always `> 0`.
3. Self-taught jobs start debt is always `0`.
