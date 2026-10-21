# Default theme: brand identity without colour

Date: 2026-10-04
Status: decided

## Decision

The default theme stays neutral. ZenUML does not use colour, in the default
theme, to build brand recognition. Recognition comes from non-colour signals:

- corner radius and line treatment,
- icons (participant and fragment icons),
- typeface.

Coloured themes remain available as named, opt-in themes.

## Context

`@zenuml/core` is a library. Its default theme is inherited by every host
(conf-app, mermaid, the IntelliJ plugin, web-sequence, diagramly.ai). The
question was whether a coloured default would help build a visual brand, the
way some products are recognisable by their colour, or whether it would cause
dislike and noise.

## Reasoning

1. **A diagram is the user's content, not our interface.** It is embedded in
   someone else's page (Confluence, slides, PDF). The reader is the page
   reader, not the buyer. A coloured default competes with the host page and
   with neighbouring diagrams.
2. **Colour is the user's semantic channel.** Users colour participants to
   mean something (external system, error path). A coloured default uses up
   that channel before the user does.
3. **A library default is inherited by all hosts.** Each host has its own
   brand. A neutral default conflicts with none of them.
4. **Recognition from colour is a long-term bet that short-term data cannot
   settle.** An experiment measures dislike (short-term cost) but not
   recognition (long-term benefit). Recognition comes from consistency over
   years, not from saturation.
5. **The cost of a wrong bet is asymmetric.** The default theme is resolved at
   render time, so every diagram without an explicit theme changes when the
   default changes. Betting on colour and retreating later discards the
   recognition built so far and changes every existing diagram a second time.
6. **Counter-examples exist and were considered.** Mermaid (lavender) and
   PlantUML (yellow/red) are recognisable by colour. PlantUML's colours are
   also the thing its users override most. Excalidraw is recognisable by its
   hand-drawn stroke, not by hue.

## What was explored

Three low-saturation palettes were rendered against the current default on one
sample diagram: "Ink Slate" (cool grey), "Warm Paper" (warm grey with an umber
accent) and "Navy". Ink Slate was then tried with three accent colours: dark
navy, the logo blue darkened for contrast, and the docs-site indigo.

Findings that led away from a signature colour:

- Fragment condition text is drawn at 65% opacity
  (`src/svg/components/fragment.ts`), so an accent colour on it fails WCAG AA
  (logo blue 2.95:1, navy 3.57:1). The accent could only stay on the fragment
  label (`ALT`, `LOOP`).
- With the accent on the fragment label only, the three accent variants were
  almost indistinguishable at normal zoom. That dose is safe but contributes
  little recognition. A larger dose runs into reasons 1 to 3 above.
- The existing brand colours are not consistent across products (sky-blue
  logo, indigo docs site, teal workbench), so there is no single colour to
  build on.

No palette was applied. `theme-default` and `src/svg/themes.ts` are unchanged.

## Observations recorded for later (not acted on)

- The SVG palette has one `fragmentText` slot for both the fragment label and
  the condition text. The DOM theme has two variables
  (`--color-text-fragment-header`, `--color-text-fragment`).
- Fragment icons in the SVG renderer are hard-coded black and do not follow
  the theme (`src/svg/components/fragment.ts`).
- `src/svg/components/participant.ts` has a hard-coded participant text fill.
- `"theme-mermaid"` in `src/svg/themes.ts` is an alias of the default palette
  object, so a change to the default palette would also change mermaid's SVG
  output but not its DOM output.

## Consequence

Work on the default look continues on the non-colour signals. Typeface is the
first one under evaluation; see the font comparison previews in
`docs/design-previews/` (blind comparison ranked IBM Plex Sans first for
code-like labels, ahead of Recursive Sans, Helvetica and Inter).
