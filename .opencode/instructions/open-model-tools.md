# Open Model Tool Guidance

These instructions are for OpenCode model behavior in this repository. They intentionally live outside `AGENTS.md` so other AI CLIs can use the shared repository guidance without inheriting OpenCode-specific tool names.

## User Questions

Use the `question` tool when user intent, requirements, risk tolerance, or implementation choices are ambiguous.

Prefer `question`, especially in plan mode, when:

- There are multiple reasonable approaches and user preference matters.
- A change affects user workflow, data, permissions, deployment, or defaults.
- Requirements are incomplete or conflict with existing project conventions.
- You need the user to choose between meaningful tradeoffs.

Do not ask questions for trivial choices that can be safely inferred from the codebase.

## Task Tracking

Use `todowrite` for non-trivial implementation work, especially in build mode.

Use `todowrite` when:

- The task has three or more meaningful steps.
- The task spans multiple files or systems.
- The user gives multiple requirements.
- You discover additional necessary follow-up work.
- Verification, tests, or build steps are part of the request.

Keep exactly one todo in progress when actively working, and mark items complete immediately after finishing them.
