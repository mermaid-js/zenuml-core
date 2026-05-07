---
name: zenuml-ux-research
description: Audit one ZenUML user interaction scenario at a time (e.g., inserting a message, renaming a participant) against diagramming-tool best practices. Uses claude-in-chrome to walk through the flow in a live browser and writes a gap-only markdown report to docs/ux-research/. Use when the user says "audit ux of", "zenuml ux research", "analyze interaction for zenuml", "run ux research on", or "/zenuml-ux-research". Produces a research report, not an audit pass/fail matrix.
---

# ZenUML UX Research

This skill audits a single ZenUML interaction scenario against diagramming-tool best practices and writes a gap-only markdown report. It is a research tool, not an audit or regression tool. Run it interactively, read the report, and act on it by hand. Never wire it into CI.

## When to invoke

- User asks "audit ux of X", "zenuml ux research", "analyze interaction for X".
- User runs `/zenuml-ux-research <scenario-id>` or `/zenuml-ux-research "free-text goal"`.
- User asks for a specific gap analysis in the ZenUML editor experience.

Do NOT invoke this skill for pixel-level comparison (that is `dia-scoring`), parser behavior, or build/deploy tasks.

## Invocation parameters

- **Scenario identifier (positional):** either a catalog ID like `insert-message` or a free-text goal like `"audit how users insert a message between A and B"`.
- **`--url <url>` (optional):** target URL. Default `http://localhost:4000`. Can point to a deployed staging URL.
- **`--allow-prod` (optional):** required for any URL that is not `localhost`, `127.0.0.1`, or a known staging subdomain. The skill is read-only against the target, but this flag forces the human to confirm they know they're pointing at a real-users environment.

## Dependencies

- `claude-in-chrome` MCP tools (for walkthrough). If these are not yet loaded in the session, the skill must instruct the user to load them via `ToolSearch` and stop; the walkthrough cannot run in text-only mode.
- `ZenUML dev server or a reachable URL` (default `http://localhost:4000`).
- `Read` / `Grep` tools (for static source analysis of `zenuml-core/src/`).
- `WebSearch` / `WebFetch` tools (for targeted best-practice lookups; optional).

## Files this skill uses at runtime

- `references/scenarios/<scenario-id>.md` — loaded at Phase A.
- `references/assertion-catalog.md` — loaded at Phase B.
- `references/best-practices-overview.md` — loaded at Phase B for narrative framing.
- `references/report-template.md` — loaded at Phase F.

## Report output

- Written to `zenuml-core/docs/ux-research/YYYY-MM-DD-<scenario-id>.md`.
- Create the directory if it doesn't exist (`mkdir -p`).
- On filename collision, append `-2`, `-3`, etc. Never overwrite.
- Never commit the report automatically — the human decides.

## Workflow

### Phase A — Scenario resolution

1. Determine whether the invocation is a catalog ID or free-text.
2. **Catalog ID:**
   - Check that `references/scenarios/<id>.md` exists.
   - If not, list all available scenario filenames (glob `references/scenarios/*.md`) and stop.
   - Load the file. Verify it has front matter with `id` and `title`, plus headings for `User intent`, `Starting DSL`, `Target DSL`, `Relevant assertion categories`. If any are missing, print which field is missing from which file and stop.
3. **Free-text:**
   - Synthesize a scenario record with the same fields (id, title, user intent, starting DSL, target DSL, relevant categories).
   - Present the synthesized record to the user and wait for explicit confirmation.
   - Do NOT proceed on an unconfirmed synthesized scenario.
4. Check `--url` reachability with a quick HTTP GET.
   - If unreachable and the URL is local: print the exact fix command (`cd /Users/penxia/ai-personal/zenuml-core && bun run dev`) and stop.
   - If unreachable and the URL is remote: print the HTTP status and stop.
   - If reachable and the URL is non-local but does NOT have `--allow-prod`: warn and stop. Non-local URLs that look like known staging patterns (e.g., contain `staging`, `preview`, `github.io` for the gh-pages build) may proceed with a one-line warning but no hard stop.
5. Confirm `claude-in-chrome` tools are loaded. If not: instruct the user to load them via `ToolSearch` with query `"select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__find,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__read_console_messages,mcp__claude-in-chrome__javascript_tool"` and stop.

### Phase B — Hypothesis formation

1. Read the scenario's User intent.
2. Read `references/best-practices-overview.md` for narrative framing.
3. Scan `references/assertion-catalog.md` for rules whose category is in the scenario's Relevant assertion categories list. Treat these as **priors** — starting points for what you expect to see — not as a checklist.
4. Form a short list of expectations in working memory. Example for `rename-participant`: "I expect Enter on selected participant to enter edit mode (KBD-03). I expect caret at end (EDT-02). I expect Escape to cancel (KBD-04). I expect undo granularity to be at the label level (UND-02)."
5. **Hypotheses are NOT limited to the catalog.** Form open-ended expectations based on general best practices and common sense. If the scenario suggests territory the catalog is silent on, run **1–3** targeted `WebSearch` queries (e.g., "how does tldraw handle arrow-key navigation between shapes"). Keep the budget tight.

### Phase C — Browser walkthrough

1. `mcp__claude-in-chrome__tabs_context_mcp` → get current tab state (do not reuse existing tabs from prior sessions).
2. `mcp__claude-in-chrome__tabs_create_mcp` → open a new tab.
3. `mcp__claude-in-chrome__navigate` → navigate to the `--url`.
4. Wait for the page to load. `mcp__claude-in-chrome__read_console_messages` at each interaction to catch runtime errors.
5. **Seed the starting state** by interacting with the DSL editor pane to type the scenario's Starting DSL. This is setup, not walkthrough — failures here are infrastructure errors.
   - If Starting DSL is empty, no seeding is needed.
   - If seeding itself fails (e.g., the DSL editor is unreachable), stop, report "could not seed starting state via DSL editor" as a walkthrough-blocker, and do NOT write a report. This is worse than a gap — it's a dead environment.
6. **Attempt to reach Target DSL via the most discoverable path a new user would try first.** Record each step:
   - What was attempted (e.g., "clicked canvas area to the right of participant B")
   - What happened (e.g., "no visible change; console warning: `[zenuml] unknown click target`")
   - Whether it advanced toward Target DSL
7. If the first path fails or hits friction, try 1–2 alternative paths (toolbar, keyboard shortcut, DSL edit). Record each.
8. **Capture screenshots only at decision moments**, not every step — keeps reports readable. Use `mcp__claude-in-chrome__computer` for screenshots if the tool is available.
9. **Hard stop after 3 failed attempts on the same step.** Record "could not perform step X after 3 attempts" and move on or stop. Do NOT loop.

### Phase D — Gap detection

1. For each observation, compare against the corresponding hypothesis.
2. **If observation matches hypothesis: drop it. Do not record. Silence is correct.**
3. **If observation diverges from hypothesis: record a gap.** Each gap has:
   - Headline (short, e.g., "Enter on selected participant does nothing")
   - Observed (verbatim)
   - Expected (from hypothesis)
   - Catalog ID (scan `references/assertion-catalog.md` for a rule whose `Applies when` and `Check` match; cite that ID. If no rule matches, label the gap `novel — candidate for new rule`.)
   - Exemplars (from the catalog if cited, else from web search)
   - Rationale
   - Severity (`low`, `med`, `high`) — use the catalog rule's severity if cited, else judge based on impact
4. Novel gaps are flagged but NOT auto-written to the catalog. The human reviews them and folds them in manually later.

### Phase E — Targeted static source analysis

For each gap, use `Grep` on `/Users/penxia/ai-personal/zenuml-core/src/` to find the relevant code path:

- For keyboard interactions: grep for the key name (`'Enter'`, `'Escape'`) and keydown listeners.
- For selection state: grep for `select`, `Selection`, `aria-selected`, and the Jotai atoms.
- For inline editing: grep for `contenteditable`, `input`, component names like `Participant`, `Message`.
- For undo/redo: grep for `undo`, `history`, `Jotai` atoms that track history state.

Attach `file:line` pointers to each gap. If no handler is found, write `"no code path found — this is a missing implementation, not a misrouted one."` Often the most useful finding.

### Phase F — Report writing

1. Load `references/report-template.md`.
2. Fill in all `{{placeholder}}` fields.
3. Determine the output path:
   - Today's date in `YYYY-MM-DD` format.
   - Filename: `YYYY-MM-DD-<scenario-id>.md`.
   - Full path: `/Users/penxia/ai-personal/zenuml-core/docs/ux-research/YYYY-MM-DD-<scenario-id>.md`.
4. Create `docs/ux-research/` if it doesn't exist.
5. If the filename already exists for today, append `-2`, `-3`, etc.
6. Write the file.
7. If gap count is zero, render the zero-gap form (omit Gaps and Playwright snippet sections, collapse the walkthrough to a one-line "No gaps observed on <sha>").

### Phase G — Hand-off

1. Print the report path.
2. Print a one-line summary: `"Found N gaps (X high, Y med, Z low). Report at <path>."`
3. Stop. Do NOT:
   - auto-commit the report
   - auto-fix any gap
   - open a PR
   - notify anyone
   - run additional scenarios

## Error handling

**Invocation-time (fail fast, clear instructions):**

- Scenario ID not found → list `references/scenarios/*.md` filenames, stop.
- Free-text goal too ambiguous (e.g., can't infer starting or target DSL) → ask one clarifying question, re-confirm, only proceed on confirmation.
- Scenario file malformed → print file path and missing field, stop.
- `claude-in-chrome` tools not loaded → instruct user to load via ToolSearch (query shown above), stop.
- URL unreachable → print fix command, stop.
- Non-local URL without `--allow-prod` → warn and stop.

**Walkthrough-time (observe and record, do not panic):**

- Target state unreachable after 2–3 paths → this is itself a high-severity gap. Write a report with "scenario target is unreachable via discovered interaction paths" as the primary finding.
- Console error mid-walkthrough → captured, included in the walkthrough step, does not halt unless the app becomes unresponsive.
- Browser crash → stop, print observations so far, do NOT write a partial report.
- Screenshot failure → skipped, walkthrough step still recorded with `screenshot: failed`.
- Same step fails 3 times → stop retrying, record "could not perform step X", move on or stop.

**Analysis-time (degrade gracefully):**

- Static analysis finds no handler → say so explicitly.
- Web search returns nothing → fall back to catalog and common sense.
- Catalog has no matching rule → label gap `novel`, flag as growth candidate.

**Output-time:**

- `docs/ux-research/` does not exist → create it.
- Filename collision → append `-2`, `-3`, etc.
- Git SHA capture fails → write `unknown` in metadata. Do not abort.

## What this skill does NOT do

- Retry failed walkthrough paths indefinitely.
- Auto-fix any gap.
- Commit the report, open a PR, notify anyone.
- Run multiple scenarios in one invocation.
- Run Playwright — only emits a snippet for the human to use.
- Touch production deploy state.

## Extending the skill

- **New scenario:** drop a new file into `references/scenarios/`, matching the format of existing scenarios. The skill discovers it automatically.
- **New assertion rule:** append it to `references/assertion-catalog.md` with the next sequential ID in its category. Never renumber existing rules.
- **Catalog growth from novel gaps:** when a run flags a `novel` gap, the human reviews and, if appropriate, adds a new rule to the catalog by hand.
- **Calibration drift:** any substantial change to this SKILL.md should be followed by re-running both calibration scenarios (see the plan document).
