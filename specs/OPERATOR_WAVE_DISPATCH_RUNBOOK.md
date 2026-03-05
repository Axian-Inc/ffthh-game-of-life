# Operator Runbook: Dispatching Spec Waves with `$spec-dispatch`

This runbook is written for a rookie operator and assumes all work starts from the repo root:

`/workspaces/ffthh-game-of-life`

## 1. One-Time Preconditions

1. Open the dev container for this repo.
2. Confirm Git remotes are up to date:

```bash
git fetch origin --prune
```

3. Install UI dependencies once:

```bash
npm --prefix src/ui ci
```

## 2. Wave Branch Strategy

Use a participant prefix for all branches:

- `<your-initials>/wave-N-integration`
- `<your-initials>/wN-sX-...`

Example prefix: `th`

Export your prefix once per terminal session:

```bash
export SPEC_BRANCH_PREFIX=<your-initials>
```

For each wave `N`, create one integration branch and push it:

```bash
git switch march_start
git pull --ff-only origin march_start
git switch -c <your-initials>/wave-N-integration
git push -u origin <your-initials>/wave-N-integration
```

Replace `N` with `0`, `1`, `2`, or `3`.

## 3. Create Worktrees (One Per Spec)

Create an in-repo worktree folder for each spec in the wave:

```bash
mkdir -p ./worktrees
```

Example for wave 1:

```bash
git worktree add ./worktrees/W1-S1 -b <your-initials>/w1-s1-setup-data-contracts origin/<your-initials>/wave-1-integration
git worktree add ./worktrees/W1-S2 -b <your-initials>/w1-s2-wizard-modal-ui origin/<your-initials>/wave-1-integration
git worktree add ./worktrees/W1-S3 -b <your-initials>/w1-s3-welcome-screen-ui origin/<your-initials>/wave-1-integration
```

## 4. Launch an Agent Per Spec

In each worktree terminal, run:

```bash
cd ./worktrees/W1-S2
SPEC_BRANCH_PREFIX=<your-initials> codex --yolo "Use $spec-dispatch with spec /workspaces/ffthh-game-of-life/specs/wave-1/W1-S2-wizard-modal-ui.md"
```

Repeat for each spec path.

## 5. What the Skill Should Do

The agent using `$spec-dispatch` must:

1. Parse frontmatter from the spec file.
2. Ensure current branch matches spec `branch`.
3. Implement only files in `owned_paths`.
4. Run all `test_commands` from spec.
5. Fix until tests are green.
6. Create PR summary and PR targeting wave integration branch.

## 6. PR Rules

1. Spec PR base must be wave integration branch, not `march_start`.
2. Example:
   - Head: `<your-initials>/w1-s2-wizard-modal-ui`
   - Base: `<your-initials>/wave-1-integration`
3. Do not merge wave branch to `march_start` until all spec PRs for that wave are merged.

## 7. Reintegration Flow (Specs -> Wave -> Central)

Branch flow diagram:

```mermaid
flowchart LR
  A[march_start] --> B[<your-initials>/wave-N-integration]
  B --> C[<your-initials>/wN-s1-*]
  B --> D[<your-initials>/wN-s2-*]
  B --> E[<your-initials>/wN-s3-*]
  C --> B
  D --> B
  E --> B
  B --> A
```

Required reintegration order:

1. Each spec branch PR merges into `<your-initials>/wave-N-integration`.
2. Operator validates wave branch (commands below).
3. Open wave PR from `<your-initials>/wave-N-integration` to `march_start`.
4. Merge wave PR to `march_start`.
5. Delete wave/spec branches and remove local worktrees.

## 8. Wave Gate Validation

After all spec PRs in a wave merge into `<your-initials>/wave-N-integration`:

```bash
git switch <your-initials>/wave-N-integration
git pull --ff-only
npm --prefix src/ui run test:ci
npm --prefix src/ui run test:e2e:ci
```

If `test:e2e:ci` requires Chromium, run this in the dev container where `CHROME_BIN=/usr/bin/chromium` is available.

## 9. Open Wave PR to `march_start`

```bash
git push
gh pr create --base march_start --head <your-initials>/wave-N-integration --title "Wave N: New Game Wizard implementation" --body "See merged spec PRs in this wave branch."
```

If `gh` is unavailable, open PR manually in Git hosting UI.

## 10. Cleanup Worktrees and Branches After Merge

After each spec PR is merged, remove the local worktree and local branch:

```bash
git worktree remove ./worktrees/W1-S2
git branch -d <your-initials>/w1-s2-wizard-modal-ui
```

If a worktree has uncommitted changes and must be removed anyway:

```bash
git worktree remove --force ./worktrees/W1-S2
```

After wave PR merge to `march_start`, remove remote branches and prune worktree metadata:

```bash
git push origin --delete <your-initials>/w1-s2-wizard-modal-ui
git push origin --delete <your-initials>/wave-1-integration
git worktree prune
```

Optional: remove the empty `worktrees` folder when all waves are complete:

```bash
rmdir ./worktrees
```

## 11. Troubleshooting

### Skill says wrong branch

1. Run `git branch --show-current` in that worktree.
2. Run `git switch <spec-branch>`.
3. Re-run skill command.

### `gh pr create` fails

1. Run `gh auth status`.
2. If not authenticated, log in or create PR manually.

### Worktree creation fails (branch exists)

Use existing branch without `-b`:

```bash
git worktree add ./worktrees/W1-S2 <your-initials>/w1-s2-wizard-modal-ui
```
