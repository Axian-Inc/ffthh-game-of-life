---
spec_id: W0-S3
title: Operator Wave Dispatch Runbook
wave: 0
branch: codex/w0-s3-operator-runbook
base_branch: codex/wave-0-integration
test_commands:
  - npm --prefix src/ui run test:ci
owned_paths:
  - specs/wave-0/W0-S3-operator-runbook.md
  - specs/OPERATOR_WAVE_DISPATCH_RUNBOOK.md
---

# Objective
Provide a rookie-friendly operator runbook for dispatching one or more waves concurrently using git worktrees and the `$spec-dispatch` skill.

# Scope
In scope:

- Author `specs/OPERATOR_WAVE_DISPATCH_RUNBOOK.md`.
- Include explicit preflight, branch, worktree, dispatch, merge, and cleanup commands.
- Include troubleshooting guidance for common rookie issues.

Out of scope:

- Any application code changes.
- Any skill implementation changes outside documentation usage instructions.

# Required Runbook Sections

1. Environment preflight commands.
2. Per-wave integration branch creation.
3. Per-spec worktree creation pattern.
4. Agent launch command using `$spec-dispatch`.
5. PR target rules (spec -> wave integration; wave -> `march_start`).
6. Wave gate test commands.
7. Cleanup commands.
8. Troubleshooting matrix.

# Mandatory Command Examples

1. `git fetch origin`
2. `git switch -c codex/wave-<n>-integration`
3. `git worktree add ../worktrees/<spec-id> -b <spec-branch> origin/<wave-branch>`
4. `codex --yolo "Use $spec-dispatch with spec <ABS_SPEC_PATH>"`
5. `npm --prefix src/ui run test:ci`
6. `npm --prefix src/ui run test:e2e:ci`

# Acceptance Criteria

1. Runbook can be followed by an operator with no prior worktree experience.
2. Every step references concrete commands (no ambiguous prose-only instructions).
3. Runbook includes where to execute each command (repo root vs worktree).
4. Runbook includes branch naming examples exactly matching wave table.

# Validation

1. Proofread for command correctness and branch names.
2. Confirm file paths in examples are absolute or clearly resolved.
