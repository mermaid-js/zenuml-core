# ZenUML UX Research Skill

**Date:** 2026-04-15
**Status:** Design approved — ready for implementation plan
**Location of the skill:** `zenuml-core/.claude/skills/zenuml-ux-research/`
**Location of reports:** `zenuml-core/docs/ux-research/YYYY-MM-DD-<scenario-id>.md`

## Goal

Build a project-local Claude Code skill that audits the user interaction experience of a single ZenUML core feature at a time, compares what the user actually has to do against diagramming-tool best practices, and writes a gap-analysis report for the team to act on.

The skill is a **research tool**, not an audit or regression tool. It is invoked interactively on demand, produces human-readable reports, and is never wired into CI.

## Why this is not a generic UX design skill

A generic UX audit would ask "is the button discoverable? is the label clear?" This skill reasons about the **ZenUML-specific interaction model** — a DSL-first sequence diagramming tool where "insert a message" can mean typing `A->B: hi` in the DSL editor, clicking a canvas affordance that writes DSL on the user's behalf, or triggering a keyboard shortcut that mutates the DSL in place. Best-practice comparisons have to span both text-first tools (Mermaid Live, PlantUML editors, D2) and drag-first tools (Lucidchart, draw.io, Figma, tldraw) without naively suggesting ZenUML "become Lucidchart." The skill also operates at the micro-interaction level — "when a participant is selected and the user presses Enter, edit mode should begin" — which requires a domain-specific vocabulary of selection, focus, inline editing, and keyboard patterns that a generic UX skill does not carry.

## Relationship to existing work

A separate, concurrent design document — `2026-04-15-keyboard-editing-on-diagram-design.md` — specifies a keyboard-only editing model for ZenUML. The UX research skill is **independent** of that implementation: it audits whatever state zenuml-core is in at the audited git SHA, and will naturally become a way to validate the keyboard-editing work as it lands. The skill should not assume that design is implemented.

## Scope (day 1)

**In scope:**
- One-goal-per-invocation skill targeting a single user scenario per run.
- A bundled seed catalog of **5 scenarios**: insert participant, rename participant, insert message, edit message label, undo/redo an insertion.
- A bundled seed assertion catalog of **~25–35 atomic rules** across 7 categories: `SEL` (selection), `KBD` (keyboard), `EDT` (inline editing), `FOC` (focus), `INS` (insertion), `UND` (undo/redo), `FBK` (visual feedback).
- Hybrid source of truth: live browser walkthrough via `claude-in-chrome` + targeted static source analysis of `zenuml-core/src/`.
- Hybrid best-practice sourcing: bundled baseline catalog + targeted web search when the baseline is silent on a specific hypothesis.
- Hypothesis-first, gap-only reporting: the skill forms open-ended expectations, tests them, and only records divergences. Passes are not enumerated except in a short Coverage bullet list.
- Dual-audience reports: executive summary for PMs/designers, detailed walkthrough and file:line pointers for developers.
- Report written to `zenuml-core/docs/ux-research/YYYY-MM-DD-<scenario-id>.md`, committed by the human if they choose.
- A Playwright regression snippet emitted as an artifact inside each report; the skill does not run Playwright.
- A known-gap and a known-clean calibration scenario used during development to verify the skill's behavior.

**Out of scope (day 1):**
- Running Playwright (only emitting snippets).
- Auto-starting the dev server.
- Multi-scenario batch runs.
- Pixel or visual regression (`dia-scoring` covers that).
- Auto-fixing any gap, committing the report, opening a PR, or notifying anyone.
- CI integration.
- Production deployment or any write-path to prod.

## Invocation

Triggers (declared in SKILL.md frontmatter):

- Slash form: `/zenuml-ux-research <scenario-id>` or `/zenuml-ux-research "free-text goal"`
- Natural language: "audit ux of inserting a message", "zenuml ux research for rename participant", "run the ux research skill on ..."

Parameters:

- Scenario identifier (positional): either a catalog ID like `insert-message` or a free-text goal like `"audit how users insert a message between A and B"`.
- `--url` (optional): target URL. Default `http://localhost:4000`. Can point to a deployed staging URL. Production URLs require `--allow-prod`.
- `--allow-prod` (optional): explicit override for any URL that isn't `localhost`, `127.0.0.1`, or a known staging pattern. The skill is read-only against the target, but this flag forces the user to confirm they know they're pointing at a real-users environment.

## Architecture and directory layout

```
zenuml-core/.claude/skills/zenuml-ux-research/
├── SKILL.md                              # Procedure, ~250 lines
├── references/
│   ├── assertion-catalog.md              # 7 categories, 25–35 atomic rules
│   ├── scenarios/
│   │   ├── insert-participant.md
│   │   ├── rename-participant.md
│   │   ├── insert-message.md
│   │   ├── edit-message-label.md
│   │   └── undo-insert.md
│   ├── best-practices-overview.md        # Short narrative framing tool categories
│   └── report-template.md                # Template the report is generated from
└── examples/
    └── sample-report.md                  # Hand-verified worked example
```

This matches the existing project convention (see `dia-scoring`, `emoji-eval`): `SKILL.md` holds procedure; `references/` holds data; `examples/` holds calibration material.

## Data model

### Assertion catalog format

`references/assertion-catalog.md` is a single markdown file. Assertions are grouped by category. Each assertion has a stable ID.

Fields per assertion:

- **ID** — stable, citable (e.g., `KBD-03`). Category prefix + sequential number.
- **Rule** — one sentence describing the expected behavior.
- **Exemplars** — 2–3 tools where this rule is observed.
- **Rationale** — why this rule matters.
- **Applies when** — precondition. Describes when a gap check would be meaningful.
- **Check** — a concrete, observable outcome the skill can verify. Optional; some rules are subjective.
- **Severity** — `low`, `med`, `high`.

Example:

```
### KBD-03
**Rule:** When a canvas item is selected and the user presses Enter, the item enters edit mode with the cursor at the end of its label.
**Exemplars:** Figma (text layers), Notion (table cells), tldraw (shapes), VS Code (F2 rename).
**Rationale:** Keyboard-first editing; no mouse round-trip after selection.
**Applies when:** A single selectable item is focused/selected.
**Check:** After selection, send Enter; within 300ms the item's label should be an editable input, focused, cursor visible at end of text.
**Severity:** high
```

Categories (day 1):

- **SEL** — selection model
- **KBD** — keyboard interaction
- **EDT** — inline editing
- **FOC** — focus management
- **INS** — insertion affordances and discoverability
- **UND** — undo/redo granularity and focus restoration
- **FBK** — visual feedback

Seed size: 3–5 rules per category, ~25–35 total.

### Scenario file format

Each `references/scenarios/<scenario-id>.md`:

```
---
id: insert-message
title: Insert a message between two participants
---

## User intent
User has two participants A and B on the canvas and wants to add a synchronous message from A to B with the label "hello".

## Starting DSL
A
B

## Target DSL
A
B
A->B: hello

## Relevant assertion categories
INS, KBD, EDT, FOC, FBK

## Walkthrough hints (not prescriptive)
- Entry point to insertion may be: canvas click, toolbar button, keyboard shortcut, or direct DSL editor.
- The skill should try the most discoverable path a new user would attempt first, then note any alternative paths.

## Known issues to watch for (optional)
- <free-form list the human can prune over time>
```

**Important:** `Relevant assertion categories` is a **hypothesis-priming hint**, not a gate. The skill is free to form hypotheses outside these categories and to flag gaps it observes in unlisted areas.

### How assertions and scenarios interact at runtime

The catalog is a **reference library and hypothesis primer**, not a checklist. The skill does not grind through all assertions. It:

1. Reads the scenario's user intent and relevant categories.
2. Scans the catalog for rules in those categories, using them as priors for what to expect.
3. Forms hypotheses freely — including hypotheses that have no matching catalog rule.
4. Tests in the browser.
5. Records only divergences. Matches are silently dropped.
6. Gaps that match a catalog rule cite the rule ID. Gaps without a matching rule are labeled `novel` and flagged as catalog-growth candidates.

## Workflow

### Phase A — Scenario resolution

1. Determine whether the invocation specifies a catalog ID or free-text.
2. **Catalog ID:** load `references/scenarios/<id>.md`, validate required fields, proceed.
3. **Free-text:** synthesize a scenario record (id, title, user intent, starting DSL, target DSL, relevant categories), present it to the user, and wait for explicit confirmation before proceeding. Do not run on an unconfirmed synthesized scenario.
4. Verify `--url` reachability. If unreachable, print the exact command to start the dev server (`cd zenuml-core && bun run dev`) and stop. If the URL is non-local and `--allow-prod` was not passed, stop with a warning.

### Phase B — Hypothesis formation

1. Read the scenario's user intent.
2. Scan the catalog for rules in the scenario's relevant categories. Use them as priors.
3. Form a short list of expectations in working memory: "Enter enters edit mode on selected participant; Escape cancels; arrow keys move selection; ..." This list is open-ended — do not limit it to what the catalog contains.
4. For areas where the catalog is silent and the scenario suggests novel territory, run **1–3** targeted web searches for "how does <tool> handle <interaction>". Budget is tight to avoid token bloat.

### Phase C — Browser walkthrough via `claude-in-chrome`

1. `tabs_context_mcp` → create a new tab → navigate to the URL.
2. Seed the diagram with the scenario's Starting DSL by interacting with the DSL editor directly. Setup, not the walkthrough.
3. Attempt to reach the Target DSL via **the most discoverable path a new user would try first**. Record each step: what was attempted, what happened, whether it advanced toward the target.
4. If the first path fails or encounters friction, try 1–2 alternative paths (toolbar, shortcut, canvas gesture, direct DSL edit). Record each.
5. At every step, observe: focus state, selection, cursor position, visible feedback, console errors (`read_console_messages`). Capture screenshots only at decision moments — not every step.
6. Hard stop at **3** failed attempts on the same step. The report records "could not perform step X" and the walkthrough continues with the next sub-path or stops.

### Phase D — Gap detection

1. For each observation, compare against the hypothesis for that step.
2. **If observation == hypothesis: drop it. Do not record.**
3. **If observation != hypothesis: record a gap.** Each gap has:
   - Short headline
   - Observed behavior (verbatim, with console/error evidence)
   - Expected behavior (from the hypothesis)
   - Catalog ID if a rule matches; `novel` otherwise
   - Suggested severity (informed by the catalog rule's severity or the skill's judgment for novel gaps)
4. Novel gaps are flagged as candidate new catalog rules. The skill does not auto-add them; the human reviews and folds them in later.

### Phase E — Targeted static source analysis

1. For each gap, grep `zenuml-core/src/` for the relevant handler, shortcut binding, event listener, or component responsible for the interaction in question.
2. Attach `file:line` pointers to each gap.
3. **If no handler exists**, note that explicitly: "no code path found — this is a missing implementation, not a misrouted one." Often the most valuable finding.

### Phase F — Report writing

1. Render from `references/report-template.md`.
2. Fill in metadata, executive summary, scenario recap, observed walkthrough, gaps, coverage, best-practice sources, and the Playwright snippet.
3. Save to `docs/ux-research/YYYY-MM-DD-<scenario-id>.md`. Create the directory if needed. On filename collision, append `-2`, `-3`, etc.
4. If zero gaps were found, write the short zero-gap form of the report: metadata + executive summary + recap + coverage + sources. Still a useful record.

### Phase G — Hand-off

1. Print the report path.
2. Print a one-line summary: "Found N gaps (X high, Y med, Z low). Report at <path>."
3. Stop. No auto-fix, no auto-commit, no notifications.

## Report structure

Each report is one markdown file with the following sections in order:

1. **Front matter / metadata**

   ```yaml
   ---
   scenario_id: insert-message
   scenario_title: Insert a message between two participants
   run_date: 2026-04-15
   zenuml_core_sha: <git sha>
   audited_url: http://localhost:4000
   skill_version: 0.1.0
   gap_count: { high: 2, med: 1, low: 0 }
   ---
   ```

2. **Executive summary** — 3–5 sentences. What the scenario was, how the user tried to accomplish it, what went wrong if anything, and the one most important thing to fix. Readable by a PM or designer in isolation.

3. **Scenario recap** — user intent, starting DSL, target DSL. So the report is self-contained.

4. **Observed walkthrough** — numbered steps. For each: action attempted, resulting state, optional screenshot, optional note on what the user likely expected. Multiple attempted paths become numbered sub-sections.

5. **Gaps** — gap-only, not pass/fail. One subsection per gap, ordered by severity then category:

   ```
   ### Gap N — <short headline>
   **Severity:** <low|med|high>
   **Catalog ID:** <id or "novel — candidate for new rule">
   **Observed:** <verbatim>
   **Expected:** <from hypothesis>
   **Exemplars:** <tools where expected behavior is seen>
   **Rationale:** <why this matters>
   **Suggested fix:** <grep result: file:line; or "no code path found">
   ```

6. **Coverage** — short bullet list, 5–15 bullets. Tested hypotheses with no gap, out-of-scope areas, and areas where a testable hypothesis could not be formed. No tables, no pass/fail ceremony.

7. **Best-practice sources** — two lists:
   - **Bundled:** catalog IDs referenced in the report.
   - **Web:** URLs fetched during hypothesis formation, each with a one-line note.

8. **Playwright regression snippet** — one `test(...)` block per gap, ready to paste into `tests/ux/<scenario-id>.spec.ts`. The skill emits; it does not run. Omitted when zero gaps.

9. **Zero-gap case** — sections 1–3 and 6–7 still render; section 4 is a one-line "No gaps observed on <sha>"; sections 5 and 8 are omitted.

## Error handling

**Invocation-time (fail fast, clear instructions):**

- Scenario ID not in catalog → print available IDs, stop.
- Free-text goal too ambiguous → ask one clarifying question, re-confirm, only then proceed.
- Scenario file malformed (missing required field) → print the file and the field, stop.
- `claude-in-chrome` tools not loaded → instruct user to load them via ToolSearch, stop.
- URL unreachable → print the exact dev-server start command, stop.
- Non-local URL without `--allow-prod` → warn and stop.

**Walkthrough-time (observe and record, do not panic):**

- Target state unreachable after 2–3 attempted paths → this is itself a high-severity gap. Write a report with "scenario target is unreachable via discovered interaction paths" as the primary finding. Static analysis section greps for handlers that should exist. Often the most valuable kind of report.
- Console error mid-walkthrough → captured in the walkthrough step. Does not halt unless the app is unresponsive.
- Browser crash → stop, print observations so far, do NOT write a partial report. Partial reports are worse than no reports — they create false evidence.
- Screenshot failure → skipped, step still recorded with `screenshot: failed`.
- Same step fails 3 times → stop retrying, record "could not perform step X", move on or stop.

**Analysis-time (degrade gracefully):**

- Static analysis finds no handler → say so explicitly; "no code path found — missing implementation, not misrouted" is useful.
- Web search returns nothing useful → hypothesis formation falls back to catalog and common sense.
- Catalog has no matching rule for a gap → label it `novel`, flag as catalog growth candidate.

**Output-time:**

- `docs/ux-research/` does not exist → create it (`mkdir -p`). No user prompt.
- Filename collision (same scenario run twice in one day) → append `-2`, `-3`, etc. Never overwrite.
- Git SHA capture fails → write `unknown` in metadata. Do not abort.

**Explicit non-goals:**

- Retry failed walkthrough paths indefinitely.
- Auto-fix any gap.
- Commit the report, open a PR, post to Slack, notify anyone.
- Run multiple scenarios in one invocation.
- Modify DSL on a deployed site persistently.
- Touch production deploy state in any form.

## Validation / test plan

Three layers, cheapest first.

**Layer 1 — Static file validation (runs every invocation):**

- Each scenario file has `id`, `title`, `User intent`, `Starting DSL`, `Target DSL`, `Relevant assertion categories`.
- Every category referenced in a scenario resolves to a real category in the catalog.
- Each catalog assertion has `ID`, `Rule`, `Exemplars`, `Rationale`, `Severity`.
- On failure: print file path and missing field, stop.

**Layer 2 — Calibration scenarios (run manually during skill development):**

- **Known-gap calibration.** Pick a seed scenario targeting an interaction with a gap we know exists today (example candidate: "Enter on selected participant does nothing" — maps to `KBD-03`). Acceptance: when run against the current `main` build, the skill MUST report at least this gap, `high` severity, citing `KBD-03`. If it doesn't, hypothesis formation or walkthrough is broken.
- **Known-clean calibration.** Pick a seed scenario targeting a flow that works correctly. Acceptance: the skill produces a short zero-gap report with a populated Coverage section. If it invents gaps, hypothesis formation is too aggressive.

Both calibration scenarios are re-run any time SKILL.md's procedure prompt changes significantly.

**Layer 3 — Sample report (committed alongside the skill):**

`examples/sample-report.md` is a hand-verified report for the known-gap calibration scenario. Serves as:

- Documentation — a reference for what "good output" looks like.
- Regression anchor — if a future run on the same SHA produces something wildly different, something changed in the skill's reasoning.

The sample report is NOT used for automated diff comparison — the skill is agentic and will produce variable phrasing run-to-run. It is a human-review reference, not a fixture.

**What we explicitly do not test:**

- No unit tests for skill prompts. Prompts are prose; regression is verified by calibration runs.
- No CI integration. The skill runs interactively against a live browser and is not wired into zenuml-core's test pipeline.
- No snapshot diffing of report output.

## Development loop

1. Write `SKILL.md` (procedure) and seed references (scenarios, catalog, overview, template).
2. Write a hand-verified `examples/sample-report.md` for the known-gap calibration scenario.
3. Run the known-gap calibration scenario in a live browser. Read the report.
4. If the skill misses the known gap, or tone is off, or Coverage is wrong — refine `SKILL.md` procedure.
5. Run the known-clean calibration. Check for false positives.
6. Iterate until both calibration scenarios pass.

## Open questions (deliberately parked)

- **Catalog growth policy.** Should novel-gap candidates be written back automatically? Day 1 answer: no — human decides. Revisit after ~5 real runs.
- **Multi-scenario audits.** Do we eventually want `/zenuml-ux-research --all`? Day 1 answer: no. Revisit once single-scenario runs are mature.
- **Relating to in-flight design work.** How should reports reference active design docs like `2026-04-15-keyboard-editing-on-diagram-design.md`? Day 1 answer: freeform — if a gap relates to a known in-flight design, the skill may link it in the "Suggested fix" field. Formalize only if this becomes common.
