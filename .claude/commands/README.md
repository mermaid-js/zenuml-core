# Command Templates

Spec-driven development commands (spec-kit). They depend on the `.specify/` directory at the repo root.

| Command | Purpose |
|---|---|
| `/constitution` | Create or update the project constitution |
| `/specify` | Create or update a feature specification from a natural-language description |
| `/clarify` | Ask targeted questions to fill gaps in the spec |
| `/plan` | Produce an implementation plan from the spec |
| `/tasks` | Generate an ordered task list from the plan |
| `/analyze` | Check spec, plan and tasks for consistency |
| `/implement` | Execute the task list |

The maintained agent workflow (ship, babysit, land, release) lives in `.claude/skills/`, `CLAUDE.md` and `AGENTS.md`. Hooks under `.claude/hooks/` are opt-in and not wired by default; see `.claude/hooks/README.md`.
