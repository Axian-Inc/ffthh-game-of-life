---
spec_id: W0-S2
title: Spec Dispatch Skill
wave: 0
branch: codex/w0-s2-spec-dispatch-skill
base_branch: codex/wave-0-integration
test_commands:
  - bash -n skills/spec-dispatch/scripts/dispatch_spec.sh
  - python3 /Users/tyler/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/spec-dispatch
owned_paths:
  - specs/wave-0/W0-S2-spec-dispatch-skill.md
  - skills/spec-dispatch/SKILL.md
  - skills/spec-dispatch/scripts/dispatch_spec.sh
  - skills/spec-dispatch/references/pr_summary_template.md
  - skills/spec-dispatch/agents/openai.yaml
---

# Objective
Create a reusable `$spec-dispatch` skill that operators can run per spec branch to enforce branch correctness, test execution, and PR preparation.

# Scope
In scope:

- Implement `skills/spec-dispatch/*`.
- Parse spec frontmatter keys: `spec_id`, `wave`, `branch`, `base_branch`, `test_commands`, `owned_paths`.
- Enforce branch setup and owned-path boundary checks.
- Generate PR summary markdown and attempt PR creation.

Out of scope:

- Editing application source code under `src/`.
- Creating or editing wave specs outside this spec file.

# Behavior Requirements

1. Accept one required argument: absolute spec path under `./specs`.
2. Ensure branch starts with `codex/`; hard fail otherwise.
3. Ensure active branch equals spec `branch`; create from `origin/base_branch` when missing.
4. Ensure `npm --prefix src/ui ci` runs when `src/ui/node_modules/.bin/vitest` is missing.
5. Execute all `test_commands` in order.
6. Fail fast if any test command fails.
7. Compare changed files against `owned_paths`; fail on violations.
8. Write PR summary markdown from template with:
   - Spec ID
   - Branch and base branch
   - Changed files
   - Tests executed
9. Create PR with `gh pr create` if `gh` is installed and authenticated.
10. If PR cannot be created automatically, print exact manual command block.

# CLI Shape

Implement `dispatch_spec.sh` with phases:

1. `pre`: parse spec + ensure branch + print constraints.
2. `finalize`: run tests + owned path checks + write PR summary + create PR/manual fallback.

# Acceptance Criteria

1. Shell script passes `bash -n`.
2. Skill passes `quick_validate.py`.
3. `SKILL.md` contains only `name` and `description` in frontmatter.
4. `agents/openai.yaml` includes quoted strings and `$spec-dispatch` in default prompt.
5. Script prints actionable errors for each hard-fail condition.

# Validation

```bash
bash -n skills/spec-dispatch/scripts/dispatch_spec.sh
python3 /Users/tyler/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/spec-dispatch
```
