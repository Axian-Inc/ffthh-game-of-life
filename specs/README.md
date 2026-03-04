# Spec Waves: New Game Wizard + Welcome Resume

This directory contains decision-complete specs organized by wave so multiple agents can work in parallel with low merge risk.

## Dispatch Contract
Every spec file includes YAML frontmatter keys consumed by `$spec-dispatch`:

- `spec_id`
- `wave`
- `branch`
- `base_branch`
- `test_commands`
- `owned_paths`

## Wave Order

| Wave | Purpose | Specs | Run Mode |
|---|---|---|---|
| 0 | Delivery framework | W0-S1, W0-S2, W0-S3 | Parallel |
| 1 | Setup data + wizard UI + welcome UI | W1-S1, W1-S2, W1-S3 | Parallel |
| 2 | App flow + storage/resume integration | W2-S1, W2-S2 | Parallel |
| 3 | Full UI test coverage | W3-S1, W3-S2 | Parallel |

## Branching Model

1. Create one integration branch per wave (example: `codex/wave-1-integration`).
2. Create one spec branch per spec (example: `codex/w1-s2-wizard-modal-ui`) from the wave integration branch.
3. Merge all spec PRs into wave integration branch.
4. Run wave gate tests on wave integration branch.
5. Open one PR from wave integration branch to `march_start`.

## Gittree Pattern
Use `git worktree` so each agent has isolated filesystem + branch:

```bash
git worktree add ../worktrees/W1-S2 -b codex/w1-s2-wizard-modal-ui origin/codex/wave-1-integration
```

## Skill Invocation Pattern
From each worktree:

```bash
codex --yolo "Use $spec-dispatch with spec /ABS/PATH/TO/specs/wave-1/W1-S2-wizard-modal-ui.md"
```

## Gate Criteria
A wave is complete only when:

1. All spec PRs merged into the wave integration branch.
2. All required tests in every spec frontmatter pass.
3. Operator verifies no owned path violations in merged diff.
4. Wave PR summary includes behavior changes + test evidence.
