# 0001 — Participant editor slots overlap the participant's content

Date: 2026-10-14
Status: Accepted

## Context

The split on-canvas participant editor places two slots on the selected
participant box: the icon slot on the left edge and the colour slot on the
right edge. On a participant with an icon or a long name, the icon slot
covers the participant's own icon and the colour slot covers the end of
the name.

## Decision

This overlap is intended and is not a defect.

- While the editor is open, a mask dims the rest of the canvas. The mask
  makes the editing state explicit, so the slots may sit on top of the
  participant's content.
- Do not add padding (or any extra space) to the participant box to make
  room for the slots. Participant geometry drives diagram layout:
  extra padding would move lifelines and messages while editing, and the
  box size must stay the same with the editor open or closed.

## Consequences

- Reviews and screenshots that show a slot covering the icon or the name
  are expected; do not report them as layout bugs.
- Fixes that "make room" for the slots by changing participant width,
  padding or position are out of scope. A change to this needs a new ADR.
