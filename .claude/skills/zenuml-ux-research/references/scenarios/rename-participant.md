---
id: rename-participant
title: Rename a participant via keyboard
---

## User intent
The user has a participant `A` on the canvas and wants to rename it to `Alice` without leaving the keyboard.

## Starting DSL
```
A
```

## Target DSL
```
Alice
```

## Relevant assertion categories
KBD, EDT, SEL, FOC

## Walkthrough hints (not prescriptive)
- This scenario is the canonical test of KBD-03 (Enter enters edit mode) and EDT-02 (caret at end of text).
- Candidate paths to try in order:
  1. Tab into the diagram widget, arrow-key to select `A`, press Enter, type `lice`, press Enter.
  2. Click `A` to select, press Enter, retype.
  3. Double-click `A` to enter edit mode.
  4. Fall back to editing the DSL editor directly.
- Watch specifically for: whether Enter does anything on the selected participant; whether the caret is placed at the end or the whole label is pre-selected; whether Escape cancels cleanly.

## Known issues to watch for (optional)
- If Enter does nothing on a selected participant, that is a KBD-03 violation at high severity.
- If only mouse double-click works, that is a KBD-only violation (no mouse-free path).
