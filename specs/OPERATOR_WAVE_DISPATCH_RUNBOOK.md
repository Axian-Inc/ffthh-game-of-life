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

4. Confirm tests run locally before dispatching any wave:

```bash
npm --prefix src/ui run test:ci
```

## 2. Wave Branch Strategy

For each wave `N`, create one integration branch and push it:

```bash
git switch march_start
git pull --ff-only origin march_start
git switch -c codex/wave-N-integration
git push -u origin codex/wave-N-integration
```

Replace `N` with `0`, `1`, `2`, or `3`.

## 3. Create Worktrees (One Per Spec)

Create an in-repo worktree folder for each spec in the wave:

```bash
mkdir -p ./worktrees
```

Example for wave 1:

```bash
git worktree add ./worktrees/W1-S1 -b codex/w1-s1-setup-data-contracts origin/codex/wave-1-integration
git worktree add ./worktrees/W1-S2 -b codex/w1-s2-wizard-modal-ui origin/codex/wave-1-integration
git worktree add ./worktrees/W1-S3 -b codex/w1-s3-welcome-screen-ui origin/codex/wave-1-integration
```

## 4. Launch an Agent Per Spec

In each worktree terminal, run:

```bash
cd ./worktrees/W1-S2
codex --yolo "Use $spec-dispatch with spec /workspaces/ffthh-game-of-life/specs/wave-1/W1-S2-wizard-modal-ui.md"
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
   - Head: `codex/w1-s2-wizard-modal-ui`
   - Base: `codex/wave-1-integration`
3. Do not merge wave branch to `march_start` until all spec PRs for that wave are merged.

## 7. Wave Gate Validation

After all spec PRs in a wave merge into `codex/wave-N-integration`:

```bash
git switch codex/wave-N-integration
git pull --ff-only
npm --prefix src/ui run test:ci
npm --prefix src/ui run test:e2e:ci
```

If `test:e2e:ci` requires Chromium, run this in the dev container where `CHROME_BIN=/usr/bin/chromium` is available.

## 8. Open Wave PR to `march_start`

```bash
git push
gh pr create --base march_start --head codex/wave-N-integration --title "Wave N: New Game Wizard implementation" --body "See merged spec PRs in this wave branch."
```

If `gh` is unavailable, open PR manually in Git hosting UI.

## 9. Cleanup After Merge

For each completed spec worktree:

```bash
git worktree remove ./worktrees/W1-S2
git branch -d codex/w1-s2-wizard-modal-ui
```

After wave merge to `march_start`, optionally delete remote branches:

```bash
git push origin --delete codex/w1-s2-wizard-modal-ui
git push origin --delete codex/wave-1-integration
```

## 10. Troubleshooting

### Skill says wrong branch

1. Run `git branch --show-current` in that worktree.
2. Run `git switch <spec-branch>`.
3. Re-run skill command.

### Test command fails due to missing deps

Run:

```bash
npm --prefix src/ui ci
```

Then retry.

### `gh pr create` fails

1. Run `gh auth status`.
2. If not authenticated, log in or create PR manually.

### Worktree creation fails (branch exists)

Use existing branch without `-b`:

```bash
git worktree add ./worktrees/W1-S2 codex/w1-s2-wizard-modal-ui
```
