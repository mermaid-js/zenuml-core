---
id: insert-message
title: Insert a synchronous message between two participants
---

## User intent
The user has two participants `A` and `B` on the canvas and wants to add a synchronous message from `A` to `B` with the label `hello`.

## Starting DSL
```
A
B
```

## Target DSL
```
A
B
A->B: hello
```

## Relevant assertion categories
INS, KBD, EDT, FOC, FBK

## Walkthrough hints (not prescriptive)
- This is the most common creation action in any sequence diagramming tool; it is the load-bearing scenario for canvas-first editing of ZenUML.
- Candidate paths to try in order:
  1. Click `A`, look for a "send message" affordance or toolbar button, draw/click toward `B`.
  2. Hover between `A` and `B` in the lifeline area for an inline "+" affordance.
  3. Keyboard: Tab into widget, select `A`, press a hotkey for "new message".
  4. Fall back to typing `A->B: hello` into the DSL editor.
- Watch specifically for: whether a canvas-first path exists at all, whether message creation automatically enters label edit mode on the new message, whether Escape during message creation cancels cleanly.

## Known issues to watch for (optional)
- If the canvas has no message-creation affordance at all, that is an INS-01 violation at high severity.
- If the new message is not in edit mode immediately on creation, that is an EDT-03 / FOC-01 violation.
