# Diagramming Tool UX — Best-Practice Overview

This document frames the interaction-design context the ZenUML UX research skill reasons about. It is **not** a checklist. Atomic, testable rules live in `assertion-catalog.md`. This file provides the *why* behind the rules.

## Two tool families

Diagramming tools split along a single axis: **what is the primary input method for the user who is actively creating diagram content?**

### Text-first (DSL-driven)

The user types structured text; the rendered diagram is a side-effect.

Examples: **Mermaid Live**, **PlantUML editors**, **D2 Playground**, **ZenUML**.

Typical strengths:
- Keyboard-first by construction.
- Versionable, diffable, pasteable content.
- Fast iteration for users who know the DSL.

Typical weaknesses:
- Discoverability for new users is poor ("what's the syntax for a loop?").
- Visual affordances (clicking a participant to rename it, dragging to reorder) are bolted on, not native.
- Round-trip between "I see a shape on the canvas" and "I edit the text that produced it" is often clunky.

### Drag-first (graphical, canvas-driven)

The user drags shapes; a model is built behind the scenes.

Examples: **Lucidchart**, **draw.io (diagrams.net)**, **Figma**, **Miro**, **tldraw**, **Excalidraw**.

Typical strengths:
- New-user discoverability is very high.
- Inline editing on the canvas is the default path.
- Rich direct-manipulation gestures (drag, marquee, snap).

Typical weaknesses:
- Power-user keyboard flows are often worse than text-first tools.
- Hard to version or diff the output.
- Harder to reuse content across diagrams.

### Hybrids

Some tools occupy the middle and are the most instructive comparisons for ZenUML, which is fundamentally text-first but is growing canvas affordances:

- **Mermaid Live** — text-first with live preview and basic canvas interactions (click-to-select in generated SVG, no canvas editing).
- **tldraw** / **Excalidraw** — drag-first, but with aggressive keyboard shortcuts and inline editing patterns that text-first tools can borrow.
- **Notion databases / Airtable** — not diagramming, but their inline edit + Tab-to-sibling patterns are the gold standard for keyboard-first editing in any grid/canvas context.
- **Miro sticky note flows** — the current "speed of thought" standard for inserting, renaming, and connecting items without touching a mouse.

## Why this matters for ZenUML

ZenUML is text-first but is moving toward canvas-embedded editing. That means every scenario this skill audits has at least two valid interaction paths — DSL and canvas — and the user experience should be coherent across both. The assertion catalog is structured so that each rule is testable in either path; the walkthrough tries the most discoverable new-user path first and notes alternative paths second.

## How this overview is used by the skill

During Phase B (hypothesis formation), the skill reads this overview to calibrate expectations: for a text-first tool, "you can always fall back to the DSL editor" is a valid mitigation; "this requires a mouse" is a valid finding worth recording, because ZenUML's history of DSL-first users means keyboard-only paths matter disproportionately.
