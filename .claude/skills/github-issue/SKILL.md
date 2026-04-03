---
name: github-issue
description: Use this skill when the user wants to create a GitHub issue for a bug, UX gap, or feature request in this project. Trigger on phrases like "create an issue", "add to GitHub", "file a bug", "report this problem", "open an issue", "add this as an issue", or when the user describes a problem and asks to document it. The skill first reproduces and verifies the issue exists, then creates a well-structured GitHub issue. Always use this skill instead of calling `gh issue create` directly.
---

# GitHub Issue Creator

Create a high-quality GitHub issue by **verifying the problem first**, then filing it with clear evidence.

## Step 1 — Understand the Issue

Parse the description into:
- **Type**: Bug / UX gap / Feature request
- **Component**: Which file or area is affected
- **Expected**: What should happen
- **Actual**: What currently happens

If the description is ambiguous (unclear component, unclear reproduction path), ask **one focused clarifying question** before proceeding.

## Step 2 — Reproduce and Gather Evidence

Before writing the issue, confirm the problem exists. Choose the right approach:

**Bugs / unexpected behavior:**
- Read the relevant source file(s) to find the defect
- Run a targeted test if one exists: `bun run test --grep "keyword"`
- Use Playwright MCP for UI bugs: navigate to the fixture, reproduce the steps, take a screenshot

**UX gaps / missing features:**
- Search the codebase to confirm the feature doesn't exist: `grep -r "keyword" src/`
- Verify the gap by inspecting the relevant component

**What to capture:**
- File path and line number of the defect (for bugs)
- Reproduction steps (numbered list)
- Screenshot or error message if applicable
- Root cause if identified from reading the code

## Step 3 — Draft the Issue

Use this structure:

```
## Problem

[1–2 sentences: what's wrong or missing]

## Steps to Reproduce   ← (omit for feature requests)

1. ...
2. ...
3. Observe: ...

## Expected Behavior

...

## Actual Behavior

...

## Root Cause   ← (include if found from code inspection)

File: `src/path/to/file.tsx`, line N
[Brief explanation]

## Fix Suggestion   ← (optional, include if obvious)

...
```

For feature requests, replace with:
```
## Background / Motivation
## Proposed Solution
## Alternatives Considered
```

Keep the **title** under 70 characters and specific (include the component name).

## Step 4 — Confirm Before Filing

Show the user the draft title and body. Ask: "Does this look right? Anything to add?"

Wait for confirmation.

## Step 5 — Check for Duplicates, Then File

```bash
# Quick duplicate check
gh issue list --repo mermaid-js/zenuml-core --state all --search "keyword" --limit 5

# Get repo if not known
gh repo view --json nameWithOwner -q .nameWithOwner

# File the issue
gh issue create \
  --title "..." \
  --body "..." \
  --repo mermaid-js/zenuml-core
```

Report the issue URL when done.
