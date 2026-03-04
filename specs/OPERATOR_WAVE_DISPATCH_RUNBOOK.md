# Operator Runbook: Dispatching Spec Waves with `$spec-dispatch`

This runbook is for operators running one or more waves in parallel with `git worktree`.

Canonical repo root in this environment:
`/workspaces/ffthh-game-of-life`

## 1. Environment Preflight Commands

Run all commands in this section from **repo root** (`/workspaces/ffthh-game-of-life`).

```bash
git fetch origin
git fetch origin --prune
git switch march_start
git pull --ff-only origin march_start
npm --prefix src/ui ci
npm --prefix src/ui run test:ci
```

## 2. Per-Wave Integration Branch Creation

Run from **repo root**.

Use this required pattern:

```bash
git switch -c codex/wave-<n>-integration
```

Wave branch names (exact):

| Wave | Integration Branch |
|---|---|
| 0 | `codex/wave-0-integration` |
| 1 | `codex/wave-1-integration` |
| 2 | `codex/wave-2-integration` |
| 3 | `codex/wave-3-integration` |

Recommended sequence per wave:

```bash
git switch march_start
git pull --ff-only origin march_start
git switch -c codex/wave-0-integration
git push -u origin codex/wave-0-integration
```

Repeat for waves `1`, `2`, and `3` as needed.

## 3. Per-Spec Worktree Creation Pattern

Run from **repo root**.

Create a sibling folder once:

```bash
mkdir -p ../worktrees
```

Use this required pattern:

```bash
git worktree add ../worktrees/<spec-id> -b <spec-branch> origin/<wave-branch>
```

Examples:

```bash
git worktree add ../worktrees/W0-S1 -b codex/w0-s1-spec-framework origin/codex/wave-0-integration
git worktree add ../worktrees/W0-S2 -b codex/w0-s2-spec-dispatch-skill origin/codex/wave-0-integration
git worktree add ../worktrees/W0-S3 -b codex/w0-s3-operator-runbook origin/codex/wave-0-integration
```

```bash
git worktree add ../worktrees/W1-S1 -b codex/w1-s1-setup-data-contracts origin/codex/wave-1-integration
git worktree add ../worktrees/W1-S2 -b codex/w1-s2-wizard-modal-ui origin/codex/wave-1-integration
git worktree add ../worktrees/W1-S3 -b codex/w1-s3-welcome-screen-ui origin/codex/wave-1-integration
```

```bash
git worktree add ../worktrees/W2-S1 -b codex/w2-s1-app-flow-integration origin/codex/wave-2-integration
git worktree add ../worktrees/W2-S2 -b codex/w2-s2-storage-resume-integration origin/codex/wave-2-integration
```

```bash
git worktree add ../worktrees/W3-S1 -b codex/w3-s1-vitest-wizard-coverage origin/codex/wave-3-integration
git worktree add ../worktrees/W3-S2 -b codex/w3-s2-playwright-workflow-coverage origin/codex/wave-3-integration
```

## 4. Agent Launch Command Using `$spec-dispatch`

Run from **the target spec worktree** (not repo root).

Use this required command shape:

```bash
codex --yolo "Use $spec-dispatch with spec <ABS_SPEC_PATH>"
```

Example:

```bash
cd ../worktrees/W0-S3
codex --yolo "Use $spec-dispatch with spec /workspaces/ffthh-game-of-life/specs/wave-0/W0-S3-operator-runbook.md"
```

More examples:

```bash
cd ../worktrees/W1-S2
codex --yolo "Use $spec-dispatch with spec /workspaces/ffthh-game-of-life/specs/wave-1/W1-S2-wizard-modal-ui.md"

cd ../worktrees/W3-S2
codex --yolo "Use $spec-dispatch with spec /workspaces/ffthh-game-of-life/specs/wave-3/W3-S2-playwright-workflow-coverage.md"
```

## 5. PR Target Rules

1. Spec PRs: `spec branch` -> `wave integration branch`.
2. Wave PRs: `codex/wave-<n>-integration` -> `march_start`.
3. Never open spec PRs directly to `march_start`.
4. Do not open wave PR until all spec PRs for that wave are merged.

Examples:

- `codex/w1-s2-wizard-modal-ui` -> `codex/wave-1-integration`
- `codex/wave-1-integration` -> `march_start`

## 6. Wave Gate Test Commands

Run from **repo root** after all spec PRs in the wave are merged.

Required commands:

```bash
npm --prefix src/ui run test:ci
npm --prefix src/ui run test:e2e:ci
```

Recommended full gate flow:

```bash
git switch codex/wave-1-integration
git pull --ff-only origin codex/wave-1-integration
npm --prefix src/ui ci
npm --prefix src/ui run test:ci
npm --prefix src/ui run test:e2e:ci
```

## 7. Cleanup Commands

Run from **repo root** after PRs are merged.

Per spec worktree cleanup:

```bash
git worktree remove ../worktrees/W1-S2
git branch -d codex/w1-s2-wizard-modal-ui
```

Optional remote cleanup (after merge is confirmed):

```bash
git push origin --delete codex/w1-s2-wizard-modal-ui
git push origin --delete codex/wave-1-integration
```

Prune stale worktree metadata:

```bash
git worktree prune
```

## 8. Troubleshooting Matrix

| Problem | Likely Cause | Fix Commands | Where to Run |
|---|---|---|---|
| `spec-dispatch` reports wrong branch | Worktree is on the wrong branch | `git branch --show-current` then `git switch <spec-branch>` | Spec worktree |
| `git worktree add` fails: branch already exists | Branch was created earlier | `git worktree add ../worktrees/<spec-id> <spec-branch>` | Repo root |
| `git worktree add` fails: path already exists | Old folder exists | `git worktree remove ../worktrees/<spec-id>` then retry add command | Repo root |
| `test:ci` fails with missing binaries | Dependencies not installed | `npm --prefix src/ui ci` then `npm --prefix src/ui run test:ci` | Repo root or spec worktree |
| `test:e2e:ci` fails in non-container shell | Chromium not available | Run in dev container, then `npm --prefix src/ui run test:e2e:ci` | Repo root |
| `gh pr create` fails | GitHub CLI missing or not authenticated | `gh auth status`; if unavailable, open PR in web UI with same base/head branches | Any shell |
| Accidental PR target is `march_start` for a spec | Wrong base branch selected | Recreate PR with base `codex/wave-<n>-integration` | GitHub UI or `gh` |

## 9. Operator Checklist (Quick)

1. Preflight from repo root.
2. Create wave integration branch from `march_start`.
3. Add one worktree per spec branch from that wave branch.
4. Launch `codex --yolo "Use $spec-dispatch with spec <ABS_SPEC_PATH>"` in each worktree.
5. Merge all spec PRs into wave integration branch.
6. Run `npm --prefix src/ui run test:ci` and `npm --prefix src/ui run test:e2e:ci` on wave branch.
7. Open wave PR to `march_start`.
8. Remove worktrees and delete merged branches.
