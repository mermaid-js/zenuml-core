# @zenuml/core

## 4.12.1

### Patch Changes

- [#657](https://github.com/mermaid-js/zenuml-core/pull/657) [`431457a`](https://github.com/mermaid-js/zenuml-core/commit/431457a9bd77a985a0edcfbd1b1abe8e84a2a893) Thanks [@MrCoder](https://github.com/MrCoder)! - Participant spacing now accounts for the «stereotype» row. A stereotype wider than the participant name (for example `<<alongstereotype_aaaaa>> a`) used to overlap the neighbouring participant box and be clipped by the diagram frame; the positioning engine now reserves the wider of the name row and the stereotype, so the boxes keep their normal gap and the frame grows to fit them.

## 4.12.0

### Minor Changes

- [#654](https://github.com/mermaid-js/zenuml-core/pull/654) [`f5f5e92`](https://github.com/mermaid-js/zenuml-core/commit/f5f5e92dbdc1a7e59a21fcec62a1f2caeadb7f6b) Thanks [@MrCoder](https://github.com/MrCoder)! - Accept multi-word stereotypes: `<<legacy system>> A` now parses (on both the ANTLR and Langium parsers) and renders the stereotype as `legacy system`, the same as `<<"legacy system">> A`. Previously the line was a syntax error that also dropped every participant of the diagram.

## 4.11.0

### Minor Changes

- [#647](https://github.com/mermaid-js/zenuml-core/pull/647) [`c00f0aa`](https://github.com/mermaid-js/zenuml-core/commit/c00f0aa1725b67d3d8156122728acbc7801ec1b5) Thanks [@MrCoder](https://github.com/MrCoder)! - `onEventEmit` fires again. Each completed in-diagram edit now calls it once with `("trackEvent", { label, action, category: "sequence" })`. The actions are `title_edited`, `participant_added`, `participant_renamed`, `message_inserted`, `message_label_edited`, `message_reordered`, `divider_inserted` and `fragment_condition_edited`. The payload carries no diagram text. The unused internal `EventBus` module is removed.

## 4.10.8

### Patch Changes

- [#590](https://github.com/mermaid-js/zenuml-core/pull/590) [`3093816`](https://github.com/mermaid-js/zenuml-core/commit/3093816f328af95beef32a18d9ab875f97ecdf6a) Thanks [@MrCoder](https://github.com/MrCoder)! - A diagram rendered without a theme now uses the default theme. Before, the first `render(code, {})` on a new instance switched the diagram to a theme named "default", which no stylesheet defines, so it lost the default theme's colours. The theme `"theme-default"` is now the only fallback.

## 4.10.7

### Patch Changes

- [#607](https://github.com/mermaid-js/zenuml-core/pull/607) [`0922d3e`](https://github.com/mermaid-js/zenuml-core/commit/0922d3e1976a1efbc72da6027ce8d6e76a730a43) Thanks [@MrCoder](https://github.com/MrCoder)! - Fix fragment widths in the HTML renderer when a diagram has several fragments. The width of a fragment no longer depends on the fragments measured before it, so a nested fragment's title or condition no longer overflows its parent fragment by one nesting level of border.

## 4.10.6

### Patch Changes

- [#601](https://github.com/mermaid-js/zenuml-core/pull/601) [`ccb6cce`](https://github.com/mermaid-js/zenuml-core/commit/ccb6cce0c521e11ca76bfab69de0a7f01bd6eb06) Thanks [@MrCoder](https://github.com/MrCoder)! - The `zenuml` CLI no longer fails now and then with "Unable to capture screenshot" when it writes PNG output on a busy machine. It now waits for the browser to paint the diagram before it takes the image.

## 4.10.5

### Patch Changes

- [#573](https://github.com/mermaid-js/zenuml-core/pull/573) [`4c5ca30`](https://github.com/mermaid-js/zenuml-core/commit/4c5ca300d584df8cca92009fcb759f0a999b311f) Thanks [@MrCoder](https://github.com/MrCoder)! - Diagrams no longer contain repeated element ids from the collapse icons, which accessibility checkers flagged as invalid HTML. The occurrence collapse icons now come from the shared icon set, and the unused collapse button stylesheets are gone. The icons look the same.

- [#577](https://github.com/mermaid-js/zenuml-core/pull/577) [`1742019`](https://github.com/mermaid-js/zenuml-core/commit/174201956b0216a7a1b823722ac170d47f9d116c) Thanks [@MrCoder](https://github.com/MrCoder)! - Lifelines no longer use the participant name as their HTML id, so a diagram no longer contains repeated ids or ids that clash with the host page. Names with spaces or leading digits no longer produce invalid ids. To select a lifeline, use the `data-lifeline-id` attribute, for example `[data-lifeline-id="Order Service"]`.

## 4.10.4

### Patch Changes

- [#566](https://github.com/mermaid-js/zenuml-core/pull/566) [`46a2ac1`](https://github.com/mermaid-js/zenuml-core/commit/46a2ac1a553b6aa62224a53251099d264ea38439) Thanks [@MrCoder](https://github.com/MrCoder)! - The label of a ref fragment is drawn with its cut bottom-right corner (the UML pentagon) and a border in the frame colour again. The styles that draw it were in a stylesheet that was never loaded since the React migration, so the label showed as a plain rectangle. The fragment styles now live in one stylesheet instead of one copy per fragment kind.

- [#569](https://github.com/mermaid-js/zenuml-core/pull/569) [`47de578`](https://github.com/mermaid-js/zenuml-core/commit/47de578d83bba04a96a753666e0538f77f809dcd) Thanks [@MrCoder](https://github.com/MrCoder)! - The ref fragment label now draws as a clean pentagon: the cut corner no longer shows a header-coloured triangle behind it, and the label's bottom edge is visible.

## 4.10.3

### Patch Changes

- [#563](https://github.com/mermaid-js/zenuml-core/pull/563) [`0786415`](https://github.com/mermaid-js/zenuml-core/commit/07864157c4f78dca5a22b49f35e5acb544c25720) Thanks [@MrCoder](https://github.com/MrCoder)! - Editing a fragment condition or the diagram title now counts as text editing, like editing a message or participant name. While you type, the participant and message insert buttons and the message reorder handles are hidden, so they can no longer be used by accident and disturb the edit.

## 4.10.2

### Patch Changes

- [#549](https://github.com/mermaid-js/zenuml-core/pull/549) [`d3da222`](https://github.com/mermaid-js/zenuml-core/commit/d3da222d7ff496b6f6636217b9cfff46b03d9a8e) Thanks [@MrCoder](https://github.com/MrCoder)! - The library no longer adds an empty portal element to the page body for each diagram it creates, and it drops an unused dependency on Headless UI. Popovers are not affected.

## 4.10.1

### Patch Changes

- [#526](https://github.com/mermaid-js/zenuml-core/pull/526) [`cc2de78`](https://github.com/mermaid-js/zenuml-core/commit/cc2de78f8547f8a4b2a234ca71d0a96a72306456) Thanks [@MrCoder](https://github.com/MrCoder)! - Changing a participant's style no longer throws an exception when the parser crashes on the original code. It now uses the same safeguard as renaming a participant: the change applies if the result parses cleanly, and otherwise reports "Could not apply the change". Ordinary syntax errors in the original code were already handled and behave as before.

## 4.10.0

### Minor Changes

- [#516](https://github.com/mermaid-js/zenuml-core/pull/516) [`d861e69`](https://github.com/mermaid-js/zenuml-core/commit/d861e69a0da7426b0ce970dcd264f2ab4b4006ea) Thanks [@MrCoder](https://github.com/MrCoder)! - Comments now render their markdown as React elements instead of injecting sanitised HTML. Raw HTML in a comment (for example a `<b>` tag) shows as plain text instead of being interpreted, links keep only `http`, `https` and `mailto` targets, and the `dompurify` dependency is gone. Paragraphs, line breaks, inline code, REST endpoint code spans, fenced code blocks with syntax highlighting, bold and italic render as before.

## 4.9.0

### Minor Changes

- [#510](https://github.com/mermaid-js/zenuml-core/pull/510) [`3a38c52`](https://github.com/mermaid-js/zenuml-core/commit/3a38c52b0b87b4b170620567a2e69c57efea2f05) Thanks [@MrCoder](https://github.com/MrCoder)! - Make the outer canvas transparent by default while keeping the diagram frame and elements painted. Hosts own the surrounding background and can request an opaque backing when exporting PNG or SVG. Also expose shared semantic palette inputs, a raw canvas-surface read, committed HTML render completion, and deterministic export bounds.

### Patch Changes

- [#504](https://github.com/mermaid-js/zenuml-core/pull/504) [`51a36bd`](https://github.com/mermaid-js/zenuml-core/commit/51a36bdac798119b7d4f2a92e61acf2a850b43d6) Thanks [@MrCoder](https://github.com/MrCoder)! - A creation message inside a fragment now starts at its creator. Before, it started at the fragment's left-most participant: when the created participant sat left of the creator the arrow collapsed and the «create» label was clipped, and when the creator was not the left-most participant the arrow started at the wrong lifeline.

- [#506](https://github.com/mermaid-js/zenuml-core/pull/506) [`99ba5aa`](https://github.com/mermaid-js/zenuml-core/commit/99ba5aa07fd0ed5f690a5f2aa7f36716a04b380d) Thanks [@MrCoder](https://github.com/MrCoder)! - An icon token alone, such as `if([check])` or `while([check])`, and an unquoted condition that contains a number, such as `if(retry 3 times)`, are now valid fragment conditions instead of breaking the diagram.

- [#500](https://github.com/mermaid-js/zenuml-core/pull/500) [`5071e8f`](https://github.com/mermaid-js/zenuml-core/commit/5071e8f87854d5a641b4eca89ad777f81eb92932) Thanks [@MrCoder](https://github.com/MrCoder)! - Every control in the editing chrome now shows one focus ring: a 1 px page-colour gap, a 1 px slate ring and a soft glow, on keyboard focus only. It replaces the mixed sky and slate rings and the browser default outline, and the inline name and title editor uses the same ring. Hosts can set `data-reduce-motion="true"` on an ancestor of the diagram (for example `<html>`, `<body>` or the host container) to zero the chrome durations, the same as `prefers-reduced-motion: reduce`. On the `.zenuml` root alone it reaches only the controls inside the diagram, because the popovers render in their own portal roots.

- [#502](https://github.com/mermaid-js/zenuml-core/pull/502) [`0d07dba`](https://github.com/mermaid-js/zenuml-core/commit/0d07dbae6eba0740fc22ac8dbeccfb3fde261f86) Thanks [@MrCoder](https://github.com/MrCoder)! - Editing controls now give press feedback and are easier to hit: buttons in the style panels, pickers and insert controls shrink slightly while pressed (off under reduced motion), the participant insert button reacts anywhere in its 36 px area, the message create handle has a 24 px pointer target, and the Rename and message type items that cannot apply now say so to screen readers, stay focusable, keep their explanatory tooltip, and no longer close the submenu when clicked.

## 4.8.1

### Patch Changes

- [#505](https://github.com/mermaid-js/zenuml-core/pull/505) [`fbe9e55`](https://github.com/mermaid-js/zenuml-core/commit/fbe9e5568d5e09dcdaf8e7941fe0e38ba056fa35) Thanks [@MrCoder](https://github.com/MrCoder)! - The 30 monochrome architecture icons (`@Client`, `@Server`, `@Browser`, `@Service`, `@Controller`, `@API`, `@UI`, `@Mobile`, `@ExternalSystem`, `@Application`, `@LoadBalancer`, `@Network`, `@Cache`, `@WebServer`, `@MessageQueue`, `@Scheduler`, `@Gateway`, `@AuthenticationService`, `@MailServer`, `@GitHub`, `@Docker`, `@GitLab`, `@Jenkins`, `@PostgreSQL`, `@MongoDB`, `@Kubernetes`, `@ApacheKafka`, `@ElasticSearch`, `@Auth0`, `@Redis`) were painted in fixed black or navy and disappeared on `theme-dark`. They now use `currentColor`, so both renderers draw them in the theme's participant text colour (white on the dark canvas; the participant text grey instead of pure black in `theme-default`). A unit test now rejects any participant icon painted only in near-black. The SVG renderer's unused rule that outlined `fill="currentColor"` icon shapes is removed so the SVG and DOM renderers keep drawing the same glyphs.

## 4.8.0

### Minor Changes

- [#494](https://github.com/mermaid-js/zenuml-core/pull/494) [`9f56672`](https://github.com/mermaid-js/zenuml-core/commit/9f566720e5d887764e3e12444c59698be14f4c28) Thanks [@MrCoder](https://github.com/MrCoder)! - Add `theme-dark`, the one dark theme, derived from the measured `theme-default` and the dark surfaces of Atlassian, GitHub and VS Code, and verified against APCA floors (text Lc 75, 12px text 90, lines 45, fills 30) by a contrast audit that now gates CI (`scripts/audit-theme-contrast.mjs`, ADR 0004).

  `theme-clean-dark` and `theme-darcula` are now aliases of `theme-dark` in both the DOM and SVG renderers; the names stay until a later major release. The unused `src/themes/theme-dark.css` (whose `:root` variables leaked into host pages) is removed. `renderToSvg` accepts `theme-dark` and `theme-darcula`; the SVG palettes for `theme-clean-light`, `theme-neon` and `theme-mermaid` now carry the values the DOM renderer actually resolves (title, lifeline, fragment border/separator, comment and arrow colours), checked by a parity test. `getPng()` fills the area beside the diagram with the theme's canvas colour instead of white.

### Patch Changes

- [#492](https://github.com/mermaid-js/zenuml-core/pull/492) [`fd4e754`](https://github.com/mermaid-js/zenuml-core/commit/fd4e75486dfeb23e9ce52f40c95443c0fb1f6972) Thanks [@MrCoder](https://github.com/MrCoder)! - Participant editor: the name row now stays inside the viewport for the first participant (its width was measured before the row had layout, so the clamp used 0 and the row hung off the left edge), and clicking another participant switches the editor in place instead of closing it on the press and reopening it on the click, which flashed the mask and the row.

- [#493](https://github.com/mermaid-js/zenuml-core/pull/493) [`258958b`](https://github.com/mermaid-js/zenuml-core/commit/258958b27a7cc33a66365ef75a39d09823959b60) Thanks [@MrCoder](https://github.com/MrCoder)! - Editor chrome motion (P2 of ADR 0003): the participant style panel, its type and colour pickers, the message style panel and the gap insert menu now open with a 200 ms fade-and-scale and close with a 120 ms reverse, driven by the `--zu-dur-*` and `--zu-ease-out` tokens. Only `transform` and `opacity` animate, so the diagram never repaints for chrome motion. Under `prefers-reduced-motion: reduce` every duration is 0 and popovers appear and disappear at once. The insert-participant button's `transition-all` is now an explicit property list.

- [#489](https://github.com/mermaid-js/zenuml-core/pull/489) [`eee6158`](https://github.com/mermaid-js/zenuml-core/commit/eee61581d5388cf5f6f58980f29e35aba0d376c1) Thanks [@MrCoder](https://github.com/MrCoder)! - Editor chrome tokens (P1 of ADR 0003): the `--zu-*` design tokens are declared once on `.zenuml`, and the participant style panel, type and colour pickers, message style panel and gap menu take their corner radii, shadows and control heights from them. Panel corners and shadows change slightly; diagram rendering is unchanged. A new `bun run check:tokens` gate keeps every token sourced and keeps one-off radius and shadow values out of the chrome files.

## 4.7.2

### Patch Changes

- [#474](https://github.com/mermaid-js/zenuml-core/pull/474) [`072d764`](https://github.com/mermaid-js/zenuml-core/commit/072d76450ae8ece50045d750b2e823b28370a226) Thanks [@MrCoder](https://github.com/MrCoder)! - While a menu or the participant editor is open, the first press elsewhere only closes it; the next press acts. For example, with a gap's insert menu open, a click on a participant or a message, or a right-click on another gap, now only closes the menu. Escape closes whichever menu, editor or drag is open from one place, and releasing the mouse right after Escape no longer completes a cancelled message reorder.

- [#473](https://github.com/mermaid-js/zenuml-core/pull/473) [`a903035`](https://github.com/mermaid-js/zenuml-core/commit/a9030352179f1fc4c911cf8fc7bd2f1f0f42b271) Thanks [@MrCoder](https://github.com/MrCoder)! - While a message's style menu is open, gap handles, the divider menu, occurrence create-drag, collapse buttons and participant insertion no longer react, and only the selected message shows a reorder handle; a press on them only closes the menu. A selected message whose menu is closed blocks nothing. While a gap's insert menu is open, other gap handles and on-canvas controls no longer react, and only one gap menu can be open at a time. Participant insert buttons also hide while a message is being created or reordered by drag.

- [#475](https://github.com/mermaid-js/zenuml-core/pull/475) [`75cbb48`](https://github.com/mermaid-js/zenuml-core/commit/75cbb485cb25ca20caadedc3c52809c6d130cc5e) Thanks [@MrCoder](https://github.com/MrCoder)! - While a message is being reordered by drag, the other messages no longer reveal their reorder handles on hover, and while a message is being created by drag, occurrences no longer show the "Drag to create a message" hint. The occurrence collapse button no longer appears on hover while another interaction (the participant editor, a menu or a drag) owns the diagram. Participant insert buttons now stay available while a participant is only highlighted (participant style editing off). In static rendering, clicking a participant no longer highlights it.

- [#472](https://github.com/mermaid-js/zenuml-core/pull/472) [`6a5fc54`](https://github.com/mermaid-js/zenuml-core/commit/6a5fc54160c6bc8497fed56ce418ebb1d2a169d0) Thanks [@MrCoder](https://github.com/MrCoder)! - While the participant editor is open, or while a message is being created or reordered by drag, other diagram controls no longer react. Gap handles, the divider menu, occurrence create-drag, message reorder handles and fragment/occurrence collapse buttons stay inactive; a press on them only closes the participant editor. While a label is in edit mode, a press on a collapse button now only ends the edit; press again to collapse. Collapse keeps working in static (mermaid) rendering.

## 4.7.1

### Patch Changes

- [#478](https://github.com/mermaid-js/zenuml-core/pull/478) [`ffaa5a1`](https://github.com/mermaid-js/zenuml-core/commit/ffaa5a1a899cd4786c09b60cf657846416827854) Thanks [@MrCoder](https://github.com/MrCoder)! - Fix created participants in the HTML renderer when message or divider insertion is enabled: the «create» arrow now meets the created participant's box at its vertical centre, and the activation bar starts at the box bottom instead of floating 12px below it. Regression since 4.6.1.

## 4.7.0

### Minor Changes

- [#469](https://github.com/mermaid-js/zenuml-core/pull/469) [`e67a151`](https://github.com/mermaid-js/zenuml-core/commit/e67a151d1b28e84ebef6d78fcdc2dc173541c805) Thanks [@MrCoder](https://github.com/MrCoder)! - Replace the participant editor dialog with a split on-canvas editor. Selecting a participant dims the rest of the diagram and puts the controls on the participant box: an icon slot on the left edge, a colour slot on the right edge, the name edited in place, and a stereotype pill above the box.
  - Type picker: six UML archetype chips (Actor, Boundary, Control, Entity, Database, Queue) plus a search across the cloud icons, with a live preview on hover.
  - Colour picker: 10 preset swatches plus a hex input, with a live preview on hover. Escape discards the preview.
  - A filled slot shows a `×` to clear it on hover or keyboard focus; Delete/Backspace also clears it.
  - Fixes: `@Queue` participants now draw their icon in both renderers; participant names are centred under a stereotype; the selection ring now shows in themes that do not define `--color-shadow-participant`.

## 4.6.1

### Patch Changes

- [#467](https://github.com/mermaid-js/zenuml-core/pull/467) [`8251e5e`](https://github.com/mermaid-js/zenuml-core/commit/8251e5e143bfcff2aaf52dc11f0e1305c94e6d0f) Thanks [@MrCoder](https://github.com/MrCoder)! - HTML renderer: the dashed group outline no longer paints half a pixel below the diagram frame. Its bottom edge now runs into the frame's bottom border as one clean line, as in `renderToSvg()`.

## 4.6.0

### Minor Changes

- [#464](https://github.com/mermaid-js/zenuml-core/pull/464) [`152e427`](https://github.com/mermaid-js/zenuml-core/commit/152e427082969e6d469b95813d0d78e17b579fce) Thanks [@MrCoder](https://github.com/MrCoder)! - Draw cloud participant icons (e.g. `@VPC`, `@RDS`, and the other icons the HTML renderer shows) in `renderToSvg()`. It used to draw only 11 built-in icons and left other participants without an icon. Add `ensureDiagramIconsLoaded(code)`: await it before `renderToSvg(code)` to load the icons the diagram uses (the CLI does this itself).

### Patch Changes

- [#463](https://github.com/mermaid-js/zenuml-core/pull/463) [`0c6c4e6`](https://github.com/mermaid-js/zenuml-core/commit/0c6c4e6693d39c554bb4604544da2d9a58827f12) Thanks [@MrCoder](https://github.com/MrCoder)! - Fix the participant group title in the HTML renderer: centre it over the rendered participant boxes (it drifted left when a group started with an `@Actor`), stop it hiding the top border of the participant boxes and of the dashed group outline, and re-measure the outline when a hidden diagram becomes visible.

- [#466](https://github.com/mermaid-js/zenuml-core/pull/466) [`61d7638`](https://github.com/mermaid-js/zenuml-core/commit/61d76386a6113810b37cf9dd46c94c4f16c55758) Thanks [@MrCoder](https://github.com/MrCoder)! - `renderToSvg()` now draws the dashed outline of an unnamed participant group (`group { A B }`), as the HTML renderer does, and draws two groups that share a name as two outlines instead of one.

## 4.5.0

### Minor Changes

- [#461](https://github.com/mermaid-js/zenuml-core/pull/461) [`9ca378c`](https://github.com/mermaid-js/zenuml-core/commit/9ca378c5be1793fd2322266ee505c73db42a12a4) Thanks [@MrCoder](https://github.com/MrCoder)! - Let consumers supply diagram font URLs, for pages whose Content-Security-Policy refuses `data:` fonts (issue [#460](https://github.com/mermaid-js/zenuml-core/issues/460)).

  - New `setDiagramFontUrl(url, family?)` (also `ZenUml.setDiagramFontUrl`): load IBM Plex Sans from a URL instead of the embedded `data:` URI. Changing the URL retries the load; `null` restores the default.
  - The package now ships `@zenuml/core/fonts/IBMPlexSans-Regular-Latin1.woff2` (byte-identical to the embedded font) and its SIL OFL licence.
  - New `getDiagramFontFaceCss()`: the embedded `@font-face` rule, for html-to-image's `fontEmbedCSS` when rasterising the DOM.
  - If the embedded font is refused and the host page registers an "IBM Plex Sans" face itself later, cached text widths are dropped so the next render re-measures with it.
  - theme-neon's MS Sans Serif no longer points at `/fonts/MS Sans Serif.ttf`, which does not exist in consumer apps. The file ships as `@zenuml/core/fonts/MS-Sans-Serif.ttf` (CC BY-SA 3.0 notice included) and loads after `setDiagramFontUrl(url, "MS Sans Serif")`.
  - `ensureDiagramFontsLoaded` is now declared in the published types.

## 4.4.1

### Patch Changes

- [#457](https://github.com/mermaid-js/zenuml-core/pull/457) [`cc1bcb7`](https://github.com/mermaid-js/zenuml-core/commit/cc1bcb7cfca84f8ed8f4541c281554e1e7515d58) Thanks [@MrCoder](https://github.com/MrCoder)! - Render diagrams when the page blocks the embedded font. On a page whose Content-Security-Policy does not allow `data:` fonts, 4.4.0 rejected `render()` and drew nothing. The font loader now carries on with the fallback fonts (Helvetica, Verdana), and `ensureDiagramFontsLoaded()` never rejects.

## 4.4.0

### Minor Changes

- [#450](https://github.com/mermaid-js/zenuml-core/pull/450) [`80f32ea`](https://github.com/mermaid-js/zenuml-core/commit/80f32ea52f66889c978c6747004c8f98289eefec) Thanks [@MrCoder](https://github.com/MrCoder)! - Render diagrams in IBM Plex Sans. The typeface is bundled with the library and embedded in exported SVGs, so `I`, `l` and `1` are distinct in code-like labels and the layout no longer depends on the fonts installed on the reader's machine. Callers of `renderToSvg` in a browser should `await ensureDiagramFontsLoaded()` first; `ZenUml.render` does this itself.

### Patch Changes

- [#453](https://github.com/mermaid-js/zenuml-core/pull/453) [`8e8114a`](https://github.com/mermaid-js/zenuml-core/commit/8e8114af63904ae2dc549e277a84a427b963b0c1) Thanks [@MrCoder](https://github.com/MrCoder)! - Centre fragment header titles (Alt, Loop, Opt, Par, Try, ...) on their kind icon and numbering badge in both the DOM and SVG renderers, and recentre the try/catch icon artwork.

- [#456](https://github.com/mermaid-js/zenuml-core/pull/456) [`b90aa00`](https://github.com/mermaid-js/zenuml-core/commit/b90aa00743ca76d8653ba34c20cc0cad1414da9e) Thanks [@MrCoder](https://github.com/MrCoder)! - Keep every fragment inside the diagram frame when a diagram has several top-level fragments. The frame padding was sized for the first top-level fragment only, so a later fragment with more nesting overflowed the frame in the DOM renderer, and the SVG renderer placed shallower fragments too far left. Both renderers now size the frame for the deepest top-level fragment and place every fragment by its own nesting border, so DOM and SVG fragment edges and frame widths agree.

- [#449](https://github.com/mermaid-js/zenuml-core/pull/449) [`57c989e`](https://github.com/mermaid-js/zenuml-core/commit/57c989e2e9267b938b003b2ae3aca19a20b35d3e) Thanks [@MrCoder](https://github.com/MrCoder)! - Draw the Actor, Boundary, Control, Entity and Database participant icons with 1px strokes at 24px. The Database icon is now a three-tier stroked cylinder sized like the other icons.

- [#455](https://github.com/mermaid-js/zenuml-core/pull/455) [`bbad9ac`](https://github.com/mermaid-js/zenuml-core/commit/bbad9acf70372dfa751b36d6b955c3aea811f4a8) Thanks [@MrCoder](https://github.com/MrCoder)! - Indent every level of nested fragments in SVG output. Fragments nested three or more levels deep, all starting at the same participant, now sit 10px inside their container on the left, as in the DOM renderer; before, only the first nesting level was indented.

- [#452](https://github.com/mermaid-js/zenuml-core/pull/452) [`40c923c`](https://github.com/mermaid-js/zenuml-core/commit/40c923ce0919db78c5218aa94b0a257ea0270b43) Thanks [@MrCoder](https://github.com/MrCoder)! - Keep the line break after the title when editing the title in the diagram. Previously confirming an edit merged the title with the next line of the DSL.

## 4.3.1

### Patch Changes

- [#442](https://github.com/mermaid-js/zenuml-core/pull/442) [`dc6d5f3`](https://github.com/mermaid-js/zenuml-core/commit/dc6d5f3fc5583048edd8b16e564b99b5407e14c5) Thanks [@MrCoder](https://github.com/MrCoder)! - Use 1px borders and arrow strokes in HTML and SVG sequence diagrams while preserving layout

- [#446](https://github.com/mermaid-js/zenuml-core/pull/446) [`34c0dd6`](https://github.com/mermaid-js/zenuml-core/commit/34c0dd6bb503abdea705fdd1d8a8c9e077cc30d9) Thanks [@MrCoder](https://github.com/MrCoder)! - Keep sequence badges inside fragment headers, align editable guard rows, and fit typography consistently in HTML and SVG.

- [#448](https://github.com/mermaid-js/zenuml-core/pull/448) [`a4721c1`](https://github.com/mermaid-js/zenuml-core/commit/a4721c1f9db003394ed7e0d7155cb69124f00fe8) Thanks [@MrCoder](https://github.com/MrCoder)! - Match HTML diagram header and message flow heights to SVG geometry, align straight-message label baselines, and match fragment headers, number badges, and rounded borders.

## 4.3.0

### Minor Changes

- [#433](https://github.com/mermaid-js/zenuml-core/pull/433) [`b57a37d`](https://github.com/mermaid-js/zenuml-core/commit/b57a37da414972992a6bdbe78ed3644bab6c275f) Thanks [@MrCoder](https://github.com/MrCoder)! - Remove the legacy vertical-layout mode and the `setVerticalMode()` method it existed for.

  The mode was reachable only through `ZenUml.setVerticalMode("legacy")` — undeclared in `types/index.d.ts` and never called in this repo — or through a `VITE_VERTICAL_MODE` build variable. It did not work: in that branch `LifeLine` returned early with an event-bus cleanup before reaching the code that populates `lifelineReadyAtom`, so `renderingReadyAtom` never became true and the promise returned by `render()` never resolved.

  Removed with it: the `verticalModeAtom` state, the DOM-measurement fallback that only the legacy branch called, the `participant_set_top` event (its only listener lived in that branch), and `scripts/snapshot-dual.js` plus its `snapshots:dual` script — the script exported `VERTICAL_MODE` while the store read `VITE_VERTICAL_MODE`, so it had always diffed the default mode against itself.

  The default `"html"` path is untouched: vertical coordinates still come from `VerticalCoordinates`. Unit tests, the visual snapshot suite and the interaction suite all pass unchanged.

- [#441](https://github.com/mermaid-js/zenuml-core/pull/441) [`6c3f924`](https://github.com/mermaid-js/zenuml-core/commit/6c3f9240020fc9259f9aaac091ee9cde1d8a9b49) Thanks [@MrCoder](https://github.com/MrCoder)! - Remove the embedded diagram footer, including Tips/help, theme selection, numbering controls, zoom controls, and the ZenUML website link. Host applications now own these controls and attribution.

  Add `enableNumbering?: boolean` to the render configuration. Explicit values override stored numbering preferences; omission preserves existing state, with numbering initially enabled. Theme rendering, `setTheme()`, and the existing `zoomIn()`/`zoomOut()` methods remain available.

- [#433](https://github.com/mermaid-js/zenuml-core/pull/433) [`b57a37d`](https://github.com/mermaid-js/zenuml-core/commit/b57a37da414972992a6bdbe78ed3644bab6c275f) Thanks [@MrCoder](https://github.com/MrCoder)! - Make `renderToSvg`'s `theme` option work. It was accepted, typed and plumbed through the CLI's `-t` flag, but discarded — every SVG rendered with one hard-coded palette.

  `renderToSvg` now builds its `<style>` block from a palette table (`src/svg/themes.ts`) transcribed from the theme classes in `src/assets/tailwind.css`, so the SVG output matches what the DOM renderer draws for the same theme. Supported names widen from `theme-default | theme-mermaid` to also include `theme-clean-light`, `theme-clean-dark` and `theme-neon` — the themes the in-app theme selector offers. An unknown or omitted name resolves to `theme-default`.

  `theme-default` output is byte-identical to the previous hard-coded block, pinned by a test, so existing SVG snapshots do not move. `theme-mermaid` intentionally shares that palette: the two CSS classes differ only in footer visibility, which the SVG output does not draw. A theme changes colours only — participant positions, diagram size and viewBox are unaffected.

### Patch Changes

- [#431](https://github.com/mermaid-js/zenuml-core/pull/431) [`ebe6cda`](https://github.com/mermaid-js/zenuml-core/commit/ebe6cda80157180cbd65af65cb3aa7ae625b6cc1) Thanks [@MrCoder](https://github.com/MrCoder)! - Move the IR contract's prose into its companion document and merge a duplicate parser type model; no runtime behavior changes.

- [#428](https://github.com/mermaid-js/zenuml-core/pull/428) [`49b6d6b`](https://github.com/mermaid-js/zenuml-core/commit/49b6d6bbe0c23ded48746025e88791c8f3e86641) Thanks [@MrCoder](https://github.com/MrCoder)! - Remove three unused state-management exports; no rendering or public-API behavior changes.

- [#424](https://github.com/mermaid-js/zenuml-core/pull/424) [`27df352`](https://github.com/mermaid-js/zenuml-core/commit/27df35207aa75d9f7e9bbee7dda67f59977d16f8) Thanks [@MrCoder](https://github.com/MrCoder)! - Remove the inert logger module; it printed nothing at any level since its threshold was fixed at warn and no warn/error call existed.

- [#438](https://github.com/mermaid-js/zenuml-core/pull/438) [`c6960a9`](https://github.com/mermaid-js/zenuml-core/commit/c6960a9e005955bb3daf463f58597ab3e4f8305d) Thanks [@MrCoder](https://github.com/MrCoder)! - Gate drag-to-reorder behind `enableMessageReorder` and `RenderMode.Dynamic`.

  Drag-to-reorder was the one editing surface in the rendering core with no
  opt-out: no `enable*` flag like every other editing feature, and no check
  against `RenderMode.Static`. A render-only host (SVG export, a static embed)
  could have its diagram silently rewritten by an accidental drag.

  Added `enableMessageReorder` (default `false`, matching every other editing
  flag) and gated the drag handlers on `mode === RenderMode.Dynamic` as well.
  The demo site and E2E fixtures now opt in explicitly, matching how they
  already opt into participant/message/divider insertion and style editing.

- [#430](https://github.com/mermaid-js/zenuml-core/pull/430) [`b7b3baf`](https://github.com/mermaid-js/zenuml-core/commit/b7b3bafc385e716f51d77e617b638a72d83ca3e1) Thanks [@MrCoder](https://github.com/MrCoder)! - Merge the sync and async self-message components into one; rendered output is unchanged.

- [#437](https://github.com/mermaid-js/zenuml-core/pull/437) [`cd4aa09`](https://github.com/mermaid-js/zenuml-core/commit/cd4aa090a94163e13b687876bb14db1bbb8da070) Thanks [@MrCoder](https://github.com/MrCoder)! - Make `import "@zenuml/core"` work outside a browser.

  Importing the package entry threw `ReferenceError: location is not defined` in Node, so the typed `renderToSvg` export it advertises was unreachable server-side. Two module-scope reads ran while the module was still being evaluated: the localStorage-backed atoms built their keys from `location.hostname` and read storage eagerly, and a participant component computed a debug flag from `localStorage` at import time.

  Both are now read on first use, and every read is guarded, so the entry also imports in a browser configured to block site data. Verified by importing the built `dist/zenuml.esm.mjs` in plain Node and rendering a diagram through `renderToSvg`.

  No API change. The bundled CLI was unaffected, since it imports internal paths rather than the entry.

- [#425](https://github.com/mermaid-js/zenuml-core/pull/425) [`65d85c3`](https://github.com/mermaid-js/zenuml-core/commit/65d85c3a413cce061ebd38b646a0774428c536b2) Thanks [@MrCoder](https://github.com/MrCoder)! - Remove unused parser prototype methods and the write-only Parser.Errors array; parsing and rendering are unchanged.

- [#429](https://github.com/mermaid-js/zenuml-core/pull/429) [`2327d2c`](https://github.com/mermaid-js/zenuml-core/commit/2327d2cd3771bd82f099856974cefdd58feca467) Thanks [@MrCoder](https://github.com/MrCoder)! - Collapse duplicated parser prototype method bodies and fix a non-advancing ancestor walk; parsing results are unchanged.

- [#435](https://github.com/mermaid-js/zenuml-core/pull/435) [`c42646d`](https://github.com/mermaid-js/zenuml-core/commit/c42646ddcdb837dcfd32e67fb1be31e2710361df) Thanks [@MrCoder](https://github.com/MrCoder)! - Fix `render()` never resolving when a diagram has no participants.

  The wait for the diagram to finish mounting resolved on a change notification from `renderingReadyAtom`, and that atom is `lifelinesReported === participantCount`. Rendering a document with no participants — a comment-only file, or DSL that parses to nothing — leaves it `true` for the whole wait, so no change is ever emitted and the returned promise stays pending forever. Reproducible by rendering two such documents in a row: an editor showing a diagram, then a comment, then another comment.

  The wait now checks readiness once after starting the render instead of relying only on notifications.

- [#434](https://github.com/mermaid-js/zenuml-core/pull/434) [`bb08577`](https://github.com/mermaid-js/zenuml-core/commit/bb08577d7685a2cb0f2c1268d4c1933dc7a07a41) Thanks [@MrCoder](https://github.com/MrCoder)! - Stop `render()` leaking a store subscription on every call.

  `doRender` waits for the diagram to mount by subscribing to `renderingReadyAtom`, but discarded the unsubscribe function `store.sub` returns. Every code-changing render therefore added a listener that stayed alive for the lifetime of the `ZenUml` instance — one per keystroke in a live editor, each re-reading the atom on subsequent renders.

  The wait now releases its subscription as soon as it resolves. It also moves to `src/store/waitForRenderingReady.ts`, so the behaviour can be tested against a real store: `ZenUml.doRender` cannot be driven to completion outside a browser, which is why the render test in `core.spec.ts` is skipped, and the leak had no coverage at all.

- [#439](https://github.com/mermaid-js/zenuml-core/pull/439) [`9ccf74a`](https://github.com/mermaid-js/zenuml-core/commit/9ccf74acbb7bc7b331683fcdac495a491d077d30) Thanks [@MrCoder](https://github.com/MrCoder)! - Fix three DSL-corruption bugs in the style-toggle panel (bold/italic/underline/strikethrough).

  The style toggle was inline string surgery in a React event handler with no
  unit or E2E coverage. Extracted to `toggleMessageStyle`/`parseStyleComment`
  in `src/utils/messageStyleToggle.ts`, and fixed three defects found while
  extracting it:

  - Toggling a style on an un-indented existing comment duplicated the `//`
    marker (`// [italic] // note` instead of `// [italic] note`) — a falsy-zero
    bug in an `index || fallback` expression treated a match at index 0 as no
    match.
  - Toggling off the last style left a dangling `// []` annotation instead of
    either removing the line (no note) or keeping the note as a plain comment.
  - A comment with an unclosed `[` (`// [todo unclosed`) was misread as a
    style list, because `indexOf`'s `-1` "not found" result is truthy.

- [#432](https://github.com/mermaid-js/zenuml-core/pull/432) [`95f3da3`](https://github.com/mermaid-js/zenuml-core/commit/95f3da37443dd4fa96b9c4e23c248e60641242d2) Thanks [@MrCoder](https://github.com/MrCoder)! - Make the SVG renderer call the shared anchor and width implementations instead of re-deriving them; rendered output is unchanged.

- [#426](https://github.com/mermaid-js/zenuml-core/pull/426) [`9980ba7`](https://github.com/mermaid-js/zenuml-core/commit/9980ba77701401a18ae317bcd269395dc6539938) Thanks [@MrCoder](https://github.com/MrCoder)! - Remove unused layout and SVG helpers, unreachable guards, and duplicate utilities; rendering output is unchanged.

- [#433](https://github.com/mermaid-js/zenuml-core/pull/433) [`b57a37d`](https://github.com/mermaid-js/zenuml-core/commit/b57a37da414972992a6bdbe78ed3644bab6c275f) Thanks [@MrCoder](https://github.com/MrCoder)! - Stop the width cache from freezing a wrong measurement for the life of the process.

  `WidthProviderOnCanvas` and `measureTextWithFont` fall back to a character-count estimate when no canvas context is available, and both wrote that estimate to the persistent cache tier — the tier that deliberately survives the `clearCache()` call made before every render. A consumer that measured anything before installing a canvas (the CLI installs one at startup, an embedder may not) kept the estimate forever, with no way to invalidate it. The estimate is now cached for the current render only.

  Two related fixes: the canvas cache key now includes the font spec, so a future change to the measured font cannot return a width measured at the old one; and `setCanvasContext()` now invalidates cached widths when the context actually changes, since widths measured with a different backend are not comparable and the backend is not part of any key.

  Adds `clearPersistentCache()` alongside `clearCache()` and documents which tier each one drops.

## 4.2.1

### Patch Changes

- [#421](https://github.com/mermaid-js/zenuml-core/pull/421) [`6436b95`](https://github.com/mermaid-js/zenuml-core/commit/6436b95d0fc1c32f8ca355ef1a15d16d5bb3adec) Thanks [@MrCoder](https://github.com/MrCoder)! - Reduce the core maintenance surface by consolidating Markdown rendering, cloud icon loading, and single-block fragment rendering while preserving parser and diagram behavior. Markdown watch mode now reuses the same rendering path as one-shot mode.

## 4.2.0

### Minor Changes

- [#419](https://github.com/mermaid-js/zenuml-core/pull/419) [`78687b2`](https://github.com/mermaid-js/zenuml-core/commit/78687b2b1bd2cd9714c6d7f1701487cec08bffb0) Thanks [@MrCoder](https://github.com/MrCoder)! - Narrow the `@zenuml/core/parser` subpath to its documented public surface: `validate()` and `parse()` only. The built bundle previously also exported `RootContext`, `ProgContext`, `GroupContext`, `ParticipantContext`, `Participants`, `Depth`, and a default object — none of which were declared in `types/parser/index.d.ts`, so no typed consumer could reference them. These ANTLR-internal helpers are now kept in-repo (`src/parser/index.js`) and no longer leak into the package contract; the subpath entry is a thin `src/parser/public.ts`.

  Also corrected the subpath's type docs, which claimed it "does not touch any shared module state" — importing it applies ZenUML's ANTLR prototype augmentation to the shared `antlr4` package as a one-time, import-time side effect. This is now documented honestly.

### Patch Changes

- [#420](https://github.com/mermaid-js/zenuml-core/pull/420) [`a5967b7`](https://github.com/mermaid-js/zenuml-core/commit/a5967b7edd1b4bdc817b3a123313a8755ec733e8) Thanks [@MrCoder](https://github.com/MrCoder)! - Enforce the v1 IR contract (`src/parser/ir/contract.ts`) instead of just documenting it. `src/parser-langium/compat.ts` now binds its module surface to `ParserModule` with `satisfies`, so the CI typecheck gate fails if the Langium facade drifts from the contract (including the ProgContext/GroupContext/ParticipantContext facade classes and the ParticipantsCollection shape, checked transitively).

  Wiring this surfaced three real contract-vs-reality drifts, now reconciled (all internal, no consumer-facing behavior change):

  - `IrNode.stop` was `TokenView` but ANTLR (and the facade) give zero-token rules `stop === null` — corrected to `TokenView | null`.
  - The `Participant` class marked renderer-facing fields (`type`, `stereotype`, `color`, …) `private` while exposing them via `ToValue()`; made them public to match `ParticipantView` (compile-time only).
  - `ParticipantsCollection.GetPositions`/`GetAssigneePositions` claimed `IrPosition[]` but return `Set | undefined` (the consumer normalizes with `Array.from(… ?? [])`) — corrected the contract.

  Also corrected the contract header, which falsely claimed the facade classes `implements` these interfaces.

- [#417](https://github.com/mermaid-js/zenuml-core/pull/417) [`c99ff91`](https://github.com/mermaid-js/zenuml-core/commit/c99ff91bac5b4dd8d72417fb51bd0cda6c955b21) Thanks [@MrCoder](https://github.com/MrCoder)! - Stop publishing sourcemaps in the npm package (`!dist/**/*.map` in `files`). Sourcemaps are still generated by the release build (available for error-tracking/CI), they're just no longer shipped to consumers — where they added ~13 MB (54% of the tarball) without affecting anyone's runtime bundle. Unpacked package size drops from ~25 MB to ~11 MB.

- [#415](https://github.com/mermaid-js/zenuml-core/pull/415) [`85a8e82`](https://github.com/mermaid-js/zenuml-core/commit/85a8e8271fd78b4225d203a4122c0bb96c77ade9) Thanks [@MrCoder](https://github.com/MrCoder)! - Stop publishing demo-site assets in the npm package. The library build was copying `public/` (vendored codemirror/highlightjs/tailwind, demo HTML, `CNAME.txt`, `favicon.ico`, and a proprietary `MS Sans Serif.ttf`) into `dist/`. Set `copyPublicDir: false` on `vite.config.lib.ts` to match the cli/parser/lsp build configs; the demo site build (`vite.config.ts`) is unaffected and still ships its public assets.

- [#416](https://github.com/mermaid-js/zenuml-core/pull/416) [`17ed0aa`](https://github.com/mermaid-js/zenuml-core/commit/17ed0aabc86c87e28aa76e8ac2f5d336d3752507) Thanks [@MrCoder](https://github.com/MrCoder)! - Fix bugs surfaced by wiring a real `tsc -b` typecheck gate into CI: the theme selector's analytics call was missing its `store` argument (a `TrackEvent(store, label, action, category)` call was passed only `label, action, category`, so opening/closing the theme modal or switching themes threw at the tracking call site instead of completing); `OrderedParticipants` and `renderingReadyAtom` were reaching into `Participants`'s private internal map instead of its public accessors; and a participant-position cast in the lifeline renderer silently discarded a `Set` bug. Also adds `@types/bun` and `@types/pngjs` so `src/cli/*` and PNG-comparison tests typecheck.

## 4.1.0

### Minor Changes

- [#410](https://github.com/mermaid-js/zenuml-core/pull/410) [`1802cbf`](https://github.com/mermaid-js/zenuml-core/commit/1802cbf615b3531d5154f09f6b743dc64de82bcf) Thanks [@MrCoder](https://github.com/MrCoder)! - Add a headless `@zenuml/core/parser` subpath exporting reentrant `validate(code)` and `parse(code)`.

  Unlike the default entry (a browser/DOM bundle that throws `location is not defined` in Node), this subpath imports cleanly server-side and is reentrant — each call uses its own error listener instead of the shared module-level `Errors`/`ErrorDetails`, so it is safe to call repeatedly or concurrently. `validate` returns `{ pass, errorDetails }`; `parse` additionally returns the error-recovered `rootContext` tree.
