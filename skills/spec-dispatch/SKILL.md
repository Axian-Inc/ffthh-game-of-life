---
name: spec-dispatch
description: Execute one implementation spec from ./specs end-to-end. Use when a user asks to dispatch or run a spec-driven task in a dedicated branch/worktree with strict owned-path boundaries, required test commands, and PR creation.
---

# Spec Dispatch

Run this skill when implementing one spec file under `./specs`.

## Inputs

1. Absolute path to the spec file.
2. Optional phase:
   - `pre` (default): branch setup + dependency bootstrap + constraints summary.
   - `finalize`: tests + owned-path check + PR summary + PR creation attempt.

## Command

```bash
bash skills/spec-dispatch/scripts/dispatch_spec.sh <ABS_SPEC_PATH> --phase pre
```

After implementation is complete:

```bash
bash skills/spec-dispatch/scripts/dispatch_spec.sh <ABS_SPEC_PATH> --phase finalize
```

## Required Workflow

1. Run `pre` phase.
2. Implement only files listed in `owned_paths`.
3. Run `finalize` phase.
4. If tests fail, fix and rerun `finalize` until green.
5. If auto PR creation fails, run the manual PR command shown by the script.

## Guardrails

1. Refuse non-absolute spec paths.
2. Refuse spec paths outside repo `./specs`.
3. Refuse non-`codex/` branches.
4. Refuse changed files outside `owned_paths` unless operator explicitly passes `--allow-outside-owned-paths`.

## Outputs

1. Branch and constraint summary.
2. Test execution results.
3. Generated PR summary markdown path.
4. PR URL (if created) or manual PR instructions.

## References

Use the template at `references/pr_summary_template.md` when generating PR text.
