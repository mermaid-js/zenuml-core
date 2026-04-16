---
id: edit-message-label
title: Edit an existing message label
---

## User intent
The user has a message `A->B: hello` on the canvas and wants to change the label to `hi`.

## Starting DSL
```
A
B
A->B: hello
```

## Target DSL
```
A
B
A->B: hi
```

## Relevant assertion categories
EDT, KBD, SEL, FOC, UND

## Walkthrough hints (not prescriptive)
- This scenario exercises the inline-edit contract on an existing piece of DSL, not a new one.
- Candidate paths to try in order:
  1. Click the message label `hello` once to select, press Enter, retype.
  2. Double-click the message label.
  3. Keyboard: navigate to the message via arrows, press Enter.
  4. Fall back to editing the DSL editor directly.
- Watch specifically for: undo granularity when the user types `hi` then changes their mind (one undo should revert the whole label, not one character at a time).

## Known issues to watch for (optional)
- If undo is character-level during a label edit, that is a UND-02 violation.
- If clicking the message selects the wrong thing (e.g., the arrow instead of the label), that is a SEL-01 violation.
