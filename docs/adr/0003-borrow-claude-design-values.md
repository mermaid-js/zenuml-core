# 0003 — Borrow measured Claude design values, reimplement in zenuml tokens; never vendor

Date: 2026-10-19
Status: Proposed. Decision 2 (prefix `--zu-`, declared only on `.zenuml`) confirmed by the maintainer on 2026-10-20.

## Context

The 2026-10-14 plan ([docs/ux-research/2026-10-14-claude-frontend-details.md](../ux-research/2026-10-14-claude-frontend-details.md))
improves the editor chrome (popovers, pickers, menus, focus, press feedback) using design details
learned from Claude. Its values came from a third-party reconstruction of Claude's design system
(https://github.com/Caho1/open-claude-ui), which also ships CSS, React examples, and the runtime
libraries framer-motion and lucide-react.

The 2026-10-19 assessment
([docs/ux-research/2026-10-19-open-claude-ui-v2-assessment.md](../ux-research/2026-10-19-open-claude-ui-v2-assessment.md))
checked 118 of the reconstruction's claims against Claude's real CSS: the claude.ai web stylesheets
fetched on 2026-10-19 and the Claude.app 2.42304.2 renderer stylesheet. Artifact hashes are in
[evidence/provenance.json](../ux-research/evidence/provenance.json). The result:

- 50 values are real and undisputed (durations, easings, the button spring, radii, control heights,
  hairline, press squish, reduced-motion handling).
- Many others are wrong or differ in value (shadow alphas, border alphas, focus ring, dark surfaces), or
  are chat-only, desktop-only, or JS-only.
- The reconstruction is not one independent source: the 2026-10-14 storybook and v2 share an origin, so
  v1 and v2 agreeing proves nothing.
- On some values web and desktop disagree (for example dark-mode weights: web 560/660, desktop 540/560).

@zenuml/core is a library embedded in Mermaid, Confluence iframes and IDE webviews. Its default theme
has no colour brand (decided 2026-10-04). Every byte it ships lands in each host.

## Decision

1. **Only measured values.** A design value may be taken from Claude only when it traces to a file in
   `provenance.json` and a line in that file. The line refers to the prettified copy recorded in
   `provenance.json` under `prettified_copies` (SHA-256 and regeneration command
   `npx -y prettier@3.9.10 --no-config --parser css --print-width 200`; the repo-pinned prettier 3.5.3 gives a different hash but identical referenced lines), not to the minified original. A reviewer verifies
   by regenerating the copy and checking the hash, or by searching the artifact for the quoted text. A value from the reconstruction's docs, storybook or code,
   without a primary line, is not evidence.
2. **Reimplement as zenuml tokens.** Borrowed values become `--zu-*` custom properties declared once,
   on the `.zenuml` scope. No `:root` declarations, so a host page cannot be affected and no fallback
   can shadow a value.
3. **Record the origin of every token.** Each definition carries a trailing comment:
   `/* src: <artifact file>:<line> */` for a borrowed value (the line refers to the prettified copy in
   `provenance.json` `prettified_copies`; verify by regenerating it or by searching for the quoted text), or `/* zenuml-owned */` when zenuml chose
   the value (for example because primary CSS disagrees with D1-D12). `scripts/check-zu-tokens.mjs`
   will enforce this once it is written in P1 (assessment, gate 1).
4. **Never vendor.** Do not copy CSS, components, hooks or snippets from the reconstruction
   (`code-examples/`, docs, storybook) or from Claude's bundles. Write the zenuml code from the value
   and its line reference.
5. **No new runtime dependencies.** framer-motion is rejected: CSS `linear()` reproduces the button
   spring, and the library is 45,983 bytes gzip (bundlephobia, framer-motion@11.11.17, looked up 2026-10-19:
   https://bundlephobia.com/package/framer-motion@11.11.17), 10.2% of the current ESM bundle. lucide-react is
   rejected: zenuml already has its own icon set (`src/components/Icon`).
6. **Neutral palette only.** Colour values (clay `#d97757`, accent rings, Claude's warm grey ramp) are
   not borrowed. Geometry, timing and structure may be; colours use zenuml's neutral (slate) palette,
   per the 2026-10-04 no-colour-brand decision.
7. **When web and desktop disagree, prefer web, record both.** The token comment names the web line,
   and the assessment keeps the desktop value next to it.

## Consequences

- P1-P5 PRs carry an origin comment on every token and must pass the token gate, the arbitrary-value
  grep gate and a gzip budget of +4,500 bytes on `dist/zenuml.esm.mjs` (assessment, section f).
- Some planned values change because the real CSS disagrees with D1-D12: the exit stays 120 ms but becomes the borrowed token `--zu-dur-snap`, backed by Claude's `cds-pill-out` and
  `epitaxy-band-exit` (WEB 53701, 57942; ASAR 5079); press `scale(.975)` with a 60 ms press and a 450 ms spring release instead of
  `scale(.97)` over 120 ms.
- Values where primary CSS differs (shadows, alpha borders, focus ring) are zenuml-owned. Changing them
  later needs no new research, only a design decision.
- When Claude changes its CSS, zenuml does not follow automatically. A re-check means re-fetching the
  artifacts, updating `provenance.json` and re-running the claim checks.
- Reviewers can reject any token whose comment names no artifact line and does not say
  `zenuml-owned`.

## Alternatives considered

- **Vendor the reconstruction's `cds-theme.css` and components.** Rejected. Many of its values are
  wrong when checked against the real CSS, it carries the clay brand, it is a third-party file with no
  verified provenance, and it would add `--cds-*` names that collide with nothing zenuml owns.
- **Take values from the reconstruction's docs without checking.** Rejected. The assessment found
  wrong values even in the most specific claims (shadow alphas, focus ring width, scroll-fade size).
- **Add framer-motion for springs and enter/exit.** Rejected for size (10.2% of the bundle) and because
  CSS covers every planned motion.
- **Declare tokens on `:root`.** Rejected. zenuml runs inside other pages; `:root` tokens leak into the
  host and can be overridden by it.
- **Design every value from scratch.** Rejected. Measured values that already work in a product of
  similar density save design iterations; reimplementing them as tokens keeps them under zenuml's
  control.
