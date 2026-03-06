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
- `bash scripts/spec-launch.sh W2-S1`
- `bash scripts/spec-launch.sh W2-S2`
- `bash scripts/spec-launch.sh W1-S2 pre`
- `bash scripts/spec-launch.sh W1-S2 finalize`
- `bash scripts/spec-launch.sh W2-S1 --profile qwen3_5_35b`
- `bash scripts/spec-launch.sh W2-S1 --profile qwen3_5_35b --no-yolo`
- `scripts/spec-launch.sh` is the preferred operator entrypoint from the main repo checkout.
- The launcher targets `./worktrees/<SPEC_ID>`, infers `SPEC_BRANCH_PREFIX` from that worktree's branch, sets local Playwright env defaults, delegates pre/finalize enforcement to `skills/spec-dispatch/scripts/dispatch_spec.sh`, and can open `codex`.
- Pass `--profile <profile>` to add `-p <profile>` to the `codex` launch command, or `--no-yolo` to omit `--yolo`.
- `CODEX_PROFILE` and `CODEX_YOLO` remain available as fallbacks, but flags are clearer for repeated operator use.
- During `launch`, the prompt sent to `codex` still points at `skills/spec-dispatch/SKILL.md`, so the skill docs and dispatcher remain part of the active workflow.
