# Scripts

## Requirements
- Terraform >= 1.4
- AWS CLI configured for the L&D account in `us-west-2`
- Node.js + npm

## Optional environment
- Copy `.env.example` to `.env` and set any values you want to override.

## Quick deploy
- `scripts/deploy.sh`

## Preflight checks
- `scripts/check.sh`

## Spec dispatch
- `bash scripts/spec-launch.sh W1-S2`
- `bash scripts/spec-launch.sh W1-S2 pre`
- `bash scripts/spec-launch.sh W1-S2 finalize`
- The launcher targets `./worktrees/<SPEC_ID>`, infers `SPEC_BRANCH_PREFIX` from that worktree's branch, sets local Playwright env defaults, runs `spec-dispatch`, and can open `codex` with the repo-local skill instructions.
