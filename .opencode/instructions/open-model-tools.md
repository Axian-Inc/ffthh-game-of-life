# Open Model Tool Guidance

These instructions are for OpenCode model behavior in this repository. They intentionally live outside `AGENTS.md` so other AI CLIs can use the shared repository guidance without inheriting OpenCode-specific tool names.

## Plan Mode (Priamry Agent)

Use the `question` tool when user intent, requirements, risk tolerance, or implementation choices are ambiguous.
Do not ask questions for trivial choices that can be safely inferred from the codebase.

## Build Mode (Primary Agent)

Use `todowrite` for non-trivial implementation work, especially in build mode and when two or more steps need to be accomplished.
Keep exactly one todo in progress when actively working, and mark items complete immediately after finishing them.
