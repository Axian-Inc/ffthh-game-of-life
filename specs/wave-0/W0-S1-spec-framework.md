---
spec_id: W0-S1
title: Spec Framework and Catalog
wave: 0
branch: codex/w0-s1-spec-framework
base_branch: codex/wave-0-integration
test_commands:
  - npm --prefix src/ui run test:ci
owned_paths:
  - specs/README.md
  - specs/wave-0/W0-S1-spec-framework.md
  - specs/wave-1/W1-S1-setup-data-contracts.md
  - specs/wave-1/W1-S2-wizard-modal-ui.md
  - specs/wave-1/W1-S3-welcome-screen-ui.md
  - specs/wave-2/W2-S1-app-flow-integration.md
  - specs/wave-2/W2-S2-storage-resume-integration.md
  - specs/wave-3/W3-S1-vitest-wizard-coverage.md
  - specs/wave-3/W3-S2-playwright-workflow-coverage.md
---

# Objective
Define the complete spec catalog and wave structure for parallel implementation of the New Game Wizard and Welcome Resume workflow.

# Scope
In scope:

- Create/maintain the wave spec files listed in `owned_paths`.
- Ensure each spec has dispatchable frontmatter fields required by `$spec-dispatch`.
- Ensure each spec is decision complete (no hidden product or implementation decisions).

Out of scope:

- Any application source code changes under `src/`.
- Skill implementation files under `skills/spec-dispatch`.
- Operator runbook implementation file `specs/OPERATOR_WAVE_DISPATCH_RUNBOOK.md`.

# Required Spec Contract
Every spec must include:

1. One-sentence objective.
2. Explicit in-scope/out-of-scope.
3. Required file ownership list with no overlap across parallel specs in same wave.
4. Acceptance criteria (behavioral and technical).
5. Test requirements.
6. Rollback or failure handling notes (if applicable).

# Wave Decisions To Encode

1. Wave 1: lock setup data contracts + implement wizard UI + implement welcome UI.
2. Wave 2: integrate routing/state flow and persistence/resume.
3. Wave 3: complete unit + E2E coverage for all wizard steps and resume integrity.
4. Keep storage paradigm in place (same game record + same CRUD endpoints).
5. Minimum players to start is `2`.
6. Game name default is auto-generated from first player name with uniqueness suffix.

# Failure and Rollback Notes

1. If any wave spec is missing required contract fields, block dispatch for that spec and fix the spec before implementation begins.
2. If `owned_paths` overlap is detected within a wave, pause that wave and reassign ownership paths before dispatching agents.
3. If frontmatter keys drift from the dispatch contract, revert the spec edit and restore the required key set before rerunning validation.

# Acceptance Criteria

1. All wave spec files exist and include valid frontmatter keys.
2. All branches and base branches match the approved wave branching table.
3. No unresolved work-marker language remains in any spec.
4. Canonical job/city/track data appears exactly once as source-of-truth in W1-S1.
5. All test command lists are executable from repo root.

# Validation

Run:

```bash
npm --prefix src/ui run test:ci
```

Then manually verify:

1. Every spec file listed in `owned_paths` exists.
2. Every spec in waves 1-3 has non-overlapping `owned_paths` within each wave.
