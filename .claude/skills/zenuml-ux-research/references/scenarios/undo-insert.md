---
id: undo-insert
title: Undo a just-inserted message
---

## User intent
The user has two participants `A` and `B`, inserts a message `A->B: hello`, then immediately presses Ctrl/Cmd+Z to undo. The expected result is that the message is removed and the state is back to just the two participants.

## Starting DSL
```
A
B
```

## Target DSL
```
A
B
```
(after: insert `A->B: hello`, then undo)

## Relevant assertion categories
UND, FOC, SEL, KBD

## Walkthrough hints (not prescriptive)
- This scenario exercises the full insertion-then-undo round trip.
- Steps:
  1. Follow the `insert-message` scenario's walkthrough to get to the post-insert state.
  2. Press Ctrl+Z (or Cmd+Z on macOS).
  3. Observe: is the message removed? Is the DSL editor reverted? Is selection/focus restored to whatever it was before the insert?
- Watch specifically for: undo granularity (one Ctrl+Z should undo the whole insert, not the individual keystrokes of the label edit) and focus restoration (FOC-03).

## Known issues to watch for (optional)
- If the undo leaves the label partially typed, UND-02 is violated.
- If focus ends up on the document body after undo, FOC-03 is violated.
