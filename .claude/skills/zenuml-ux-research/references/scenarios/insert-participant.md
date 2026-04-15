---
id: insert-participant
title: Insert a participant on a blank diagram
---

## User intent
The user opens ZenUML to a blank diagram and wants to add one participant named `Alice` so they can start modelling.

## Starting DSL
```
```

## Target DSL
```
Alice
```

## Relevant assertion categories
INS, FOC, EDT, KBD

## Walkthrough hints (not prescriptive)
- Blank canvas is the highest-stakes discoverability test — the skill should record how long it takes to find the insertion affordance.
- Candidate insertion paths to try in order:
  1. Click on the canvas background.
  2. Look for a visible "+" or "Add participant" affordance.
  3. Keyboard: try pressing Enter or `p` on an empty canvas.
  4. Fall back to typing directly into the DSL editor pane.
- The moment the user successfully names the new participant `Alice` is the scenario's end state.

## Known issues to watch for (optional)
- If the only path is direct DSL editing, that itself is a finding (violates INS-01).
