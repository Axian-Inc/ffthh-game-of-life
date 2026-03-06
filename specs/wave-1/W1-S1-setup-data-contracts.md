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
Create the canonical simulation-only setup catalog and starting-state utility for Wave 1 while explicitly keeping visual presentation data out of this layer.

# Scope
In scope:

- Define the single source of truth for canonical city, education-track, and job simulation data.
- Define deterministic starting-state rules derived from the selected job.
- Keep the catalog stable for runtime logic, form state, and non-visual tests.

Out of scope:

- Wizard copy, card display strings, art selection, icon order, or screenshot fixtures.
- Home, wizard, summary, or welcome screen layout/styling work.
- Placeholder abbreviations such as token badges or generated description text for UI cards.

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

# Data Boundary Rules
1. `setupCatalog.js` is the simulation contract, not the presentation contract.
2. Do not add UI-only properties such as `iconToken`, `artToken`, `description`, preformatted stat-line arrays, or screenshot-only copy to canonical exports.
3. If the UI needs display strings, art assets, icon order, or seeded screenshot fixtures, those must live in a separate UI-owned module outside this spec.
4. Canonical `label` fields remain human-readable source-of-truth values even if the high-fidelity UI chooses different shortened titles for display.

# Failure and Rollback Notes
1. If canonical records are incomplete or mismatched, block merge and restore the last valid catalog snapshot before retrying.
2. If setup options remain hardcoded inside UI components, revert those component edits and rewire imports from the catalog only.
3. If presentation-only placeholders leak into canonical data, revert those additions and move them into a UI-owned visual catalog.
4. If computed starting values regress, roll back `startingState` changes and reintroduce them with explicit tests for each rule.

# Acceptance Criteria
1. Canonical catalog data is the only source of truth for simulation values used by setup/runtime logic.
2. No display-only placeholder copy, token abbreviations, or art metadata is stored in `setupCatalog.js`.
3. Starting-state utility returns deterministic values from the selected job.
4. Unit tests verify all required records and key computed values.

# Validation
```bash
npm --prefix src/ui run test:ci
```

Plus explicit assertions:

1. `vibe-coder.monthlyIncome` equals `7500`.
2. Degree-track job start debt is always `> 0`.
3. Self-taught jobs start debt is always `0`.
