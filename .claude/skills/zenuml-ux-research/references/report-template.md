---
scenario_id: {{scenario_id}}
scenario_title: {{scenario_title}}
run_date: {{run_date}}
zenuml_core_sha: {{zenuml_core_sha}}
audited_url: {{audited_url}}
skill_version: 0.1.0
gap_count: { high: {{gap_count_high}}, med: {{gap_count_med}}, low: {{gap_count_low}} }
---

# UX Research — {{scenario_title}}

## Executive summary

{{executive_summary}}

## Scenario recap

**User intent:** {{user_intent}}

**Starting DSL:**
```
{{starting_dsl}}
```

**Target DSL:**
```
{{target_dsl}}
```

## Observed walkthrough

{{walkthrough_numbered_steps}}

## Gaps

{{gap_blocks}}

> Each gap block uses this structure:
>
> ```
> ### Gap N — <short headline>
> **Severity:** <low|med|high>
> **Catalog ID:** <id or "novel — candidate for new rule">
> **Observed:** <verbatim>
> **Expected:** <from hypothesis>
> **Exemplars:** <tools where expected behavior is seen>
> **Rationale:** <why this matters>
> **Suggested fix:** <grep result: file:line; or "no code path found">
> ```
>
> (Blockquote is for documentation inside the template — the rendered report omits it.)

## Coverage

Tested hypotheses (no gap found):
{{coverage_tested}}

Not tested (out of scope for this scenario):
{{coverage_out_of_scope}}

Skipped (couldn't form a testable hypothesis):
{{coverage_skipped}}

## Best-practice sources

**Bundled catalog IDs referenced:**
{{bundled_sources}}

**Web sources fetched during this run:**
{{web_sources}}

## Playwright regression snippet

Paste into `zenuml-core/tests/ux/{{scenario_id}}.spec.ts` once the gap is fixed. The skill emits this snippet; it does not run it.

```typescript
{{playwright_snippet}}
```

---

## Zero-gap rendering

If the scenario produced zero gaps, render the report omitting the **Gaps** and **Playwright regression snippet** sections. The **Observed walkthrough** section becomes a single line:

> No gaps observed on zenuml-core @ {{zenuml_core_sha}}.

All other sections (metadata, executive summary, scenario recap, coverage, best-practice sources) still render.
