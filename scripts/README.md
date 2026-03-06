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
- `bash scripts/spec-launch.sh W1-S1`
- `bash scripts/spec-launch.sh W1-S2`
- `bash scripts/spec-launch.sh W1-S3`
- `bash scripts/spec-launch.sh W1-S2 pre`
- `bash scripts/spec-launch.sh W1-S2 finalize`
- `scripts/spec-launch.sh` is the preferred operator entrypoint from the main repo checkout.
- The launcher targets `./worktrees/<SPEC_ID>`, infers `SPEC_BRANCH_PREFIX` from that worktree's branch, sets local Playwright env defaults, delegates pre/finalize enforcement to `skills/spec-dispatch/scripts/dispatch_spec.sh`, and can open `codex`.
- During `launch`, the prompt sent to `codex` still points at `skills/spec-dispatch/SKILL.md`, so the skill docs and dispatcher remain part of the active workflow.
