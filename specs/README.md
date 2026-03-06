# Spec Waves: Desktop Wave 1 Restart

This directory contains decision-complete specs organized by wave so multiple agents can work in parallel with low merge risk.

## Dispatch Contract
Every spec file includes YAML frontmatter keys consumed by `spec-dispatch`:

- `spec_id`
- `wave`
- `branch`
- `base_branch`
- `test_commands`
- `owned_paths`

## Wave Order

| Wave | Purpose | Specs | Run Mode |
|---|---|---|---|
| 1 | Desktop setup-flow restart: persistence, wizard, home + welcome | W1-S1, W1-S2, W1-S3 | Parallel |
| 2 | App flow + storage/resume integration | W2-S1, W2-S2 | Parallel |
| 3 | Full UI test coverage | W3-S1, W3-S2 | Parallel |

## Branching Model
1. Create one integration branch per wave from the branch that contains the spec pack.
2. Create one spec branch per spec from the wave integration branch.
3. Merge all spec PRs into the wave integration branch.
4. Run wave gate tests on the wave integration branch.
5. Open one PR from the wave integration branch back to the source branch for that rerun.

For the current Wave 1 restart, the source branch is `march_test`.

## Parallel-Wave Rule For Wave 1
Wave 1 remains parallel only because the three specs now split ownership cleanly:

1. `W1-S1` owns the setup draft, saved payload, and end-to-end persistence contract.
2. `W1-S2` owns the six-step wizard UI and desktop wizard visual baselines.
3. `W1-S3` owns the home screen, Welcome screen, and desktop routing/navigation behavior.
4. Do not introduce new shared cross-spec primitives outside an owning spec.

## Worktree Pattern
Use `git worktree` so each agent has isolated filesystem and branch:

```bash
git worktree add ../worktrees/W1-S2 -b codex/w1-s2-six-step-wizard-ui origin/codex/wave-1-integration
```

## Gate Criteria
A wave is complete only when:

1. All spec PRs merged into the wave integration branch.
2. All `test_commands` pass.
3. No owned-path violations appear in the merged diff.
4. The wave summary records behavior changes and test evidence.
