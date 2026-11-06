# CDS Storybook (site.html) front-end detail catalogue

Source: the 2026-10-14 storybook capture `site.html` (2533 lines, read in full; not executed; kept outside the repo in the maintainer's research run folder). Line numbers refer to that file. "Rationale" is a translation of the file's Chinese text; "(inferred)" marks my reading where the file states none. "(general knowledge)" marks facts not in the file.

## Reading notes (facts that change how to borrow)

- The file defines NO `--cds-*` CSS custom property. All `--cds-*` names (rem-scale, dur, ease, border) appear only as display text (L387, L451, L968-978). Real values are hard-coded in Tailwind classes and inline styles.
- Only 4 spring presets exist (L1457-1506), not 6.
- Defined in CSS but never referenced by any story: `timeline-block-enter` (L65), `byline-sent-bump` (L95), `cds-skeleton-sweep` (L99), `file-thumbnail-upload-pulse` (L109), `click-ring` (L117). Their durations and usage are not in the file.
- `prefers-reduced-motion`: ABSENT (grep: 0 hits). `:focus-visible`: ABSENT. `aria-*` and `role=`: ABSENT. `::selection` rule, `will-change`, `scrollbar-width`: ABSENT (selection uses Tailwind variants).

## alignment/typography

| Name | Mechanism + values (line) | Stated rationale |
|---|---|---|
| Optical vertical-align helpers | `.align-neg-125 {vertical-align:-0.125em}`, `.align-neg-075 {-0.075em}`, `.align-neg-1px`, `.align-neg-2px` (L129-132). Icon SVG gets `inline-block align-neg-125 shrink-0` (L191, L232). Demo uses -0.125em at 14px and 16px text (L606, L622) and -0.075em at 11-12px caption (L638). | Default inline SVG sits on the baseline, floats 2-3px above x-height. `vertical-align:middle` follows line-box centre and jumps when line-height changes. -1/8em puts the icon centre on cap-height / x-height. A smaller offset pairs with the smaller icon (L593-594). Caution: in the demo the icon wrapper is a child of `flex items-center` (L601-602), where `vertical-align` has no effect on flex items (general knowledge), so the demo toggle likely shows no real change. The technique works only in inline flow. |
| text-wrap: balance on headings | `.text-balance-native {text-wrap:balance}` (L133), applied to the h3 (L671). | Balances line lengths and removes a 1-2 character last line (L676). |
| text-wrap: pretty on body copy | `.text-pretty-native {text-wrap:pretty}` (L134), used on card descriptions and captions (L333, L520, L592, L684, L1272). | Pulls the second-last word down so no single word sits alone on the last line (L689). |
| overflow-wrap: anywhere for long tokens | `.overflow-wrap-anywhere {overflow-wrap:anywhere; word-break:normal}` (L135); live toggle against `normal` and `break-all` (L725-726). Test string: a 60-char model id (L729). | `break-all` splits normal words ("engineering" to "engi-neering"). `normal` lets a 60-char hash overflow the box. `anywhere` + `word-break:normal` keeps ordinary words whole and breaks only when a token overflows (L716-717). The class is defined but only the inline style version is used. |
| tabular-nums on live numbers | Tailwind `tabular-nums` (`font-variant-numeric: tabular-nums`) on the timer and token count (L764-766, L1909). Timer ticks every 40ms (`setInterval(...,40)`, L492). | Digits 0-9 keep constant width, so changing numbers cause no layout shake (L743). Weak demo: the "non-tabular" sample is also `font-mono` (L753), so only the sans token counter shows a difference. |
| Dark-mode weight compensation (variable font axis) | `fontVariationSettings: '"wght" 460'` (body-medium) and `'"wght" 560'` (semibold) in dark, vs `"wght" 500` / `600` in light (L531, L548). Segmented tab text uses arbitrary weight `font-[470]` (L1256). Inter is loaded as a range `wght@300..700` (L17). | Light text on dark looks 10-15% bolder (optical irradiation), so lower the weight axis in dark mode for equal perceived weight (L521-522). |
| Multi-line truncation ladder | Tailwind `truncate` (1 line), `line-clamp-2`, `line-clamp-3`; expand toggle removes the class (L790, L797, L804). | Sidebar titles 1 line, thinking summary 2, system-prompt card 3. Text claims a smooth grid-height expand (L805), but the code only swaps the class; no animation. |
| Antialiasing + variable fonts | `antialiased` on body (L172). Fonts: Inter 300-700, Newsreader with `opsz` axis 6..72 and italic, JetBrains Mono 400/500, `display=swap`, preconnect (L15-17). Tailwind stacks: Inter / Newsreader / JetBrains Mono with system fallbacks (L41-45). | None stated. |
| Chat text metrics | Composer textarea `text-[15px] leading-[1.4]` (L1037); assistant text `text-[15px] leading-[1.65]` (L1091); user bubble `text-sm leading-relaxed` (L1084). | None stated (inferred: tighter leading for a growing input, looser for reading prose). |
| Truncation-safe flex rows | `min-w-0 flex-1` + `truncate` on text beside fixed items; `shrink-0` on tags (L331, L347-350). | None stated (inferred: stops flex children from overflowing). |

## sizing/radius

| Name | Mechanism + values (line) | Stated rationale |
|---|---|---|
| rem-scale radius ladder | Scale text: `--cds-rem-scale: calc(16/17) ≈ 0.941` (L387). Swatches use inline px (L376-382, L398): 4.7 / 5.6 / 7.5 / 9.4 / 13.2px, which equal 5, 6, 8, 10, 14 x 16/17 (my calc: 4.706, 5.647, 7.529, 9.412, 13.176). Composer fixed 20px; pill 999px. Usage per step: XS tag/checkbox, SM small button/Kbd, MD standard button/menu item, LG collapse card/popover/attachment, XL mobile input/modal. | "Claude's radii share one scale factor" (L387). The real Claude app likely scales rem by 16/17 (inferred). The rest of the demo uses unscaled Tailwind classes (`rounded-md/lg/xl`), so the scale is shown but not applied. |
| Height ladder | Labels (L411-415): XS 20-24px `h-6`, SM 24-28px `h-7`, MD 32px `h-8` (default: send button, standard button, tab item), LG 40px `h-10` (login, primary CTA), titlebar 46-48px `h-12`. Used: header `h-12` (L2368), segmented `h-9` (36px, L1234), inputs `h-7` (L879). | "Control heights follow this ladder so they align exactly in multi-row or complex grids" (L420). Titlebar is the macOS frameless drag strip (L415). |
| Radius steps with height | Button sizes: XS `h-6 rounded-md`, SM `h-7 rounded-lg`, MD `h-8 rounded-lg`, LG `h-10 rounded-xl` (L1175-1178). | None stated (inferred: bigger control, bigger radius). |
| Square icon buttons | `size-8 rounded-lg` (L953, L1195); icon tile `size-11 rounded-lg` (L930). | None stated. |
| Composer geometry | Outer `rounded-[20px]`, `p-[0.875rem]`, `gap-y-2`, `max-w-[42rem]` (L1021-1023). Textarea `min-h-[3.25rem] max-h-[24rem]`, `rows={1}`, `resize-none`, `pl-2` (L1037). Send `size-8 rounded-lg`. | "Radius fixed at 20px" (L1064). `max-h` is set but no auto-grow script exists, so the "adaptive" claim (L266) is not implemented. |
| Message bubbles | User: `rounded-[18px] px-4 py-2.5 max-w-[85%]`, bg `#f0f4f8`, dark `white/10` (L1084). | None stated. |
| Segmented control geometry | Track `h-9 p-[2px] rounded-full`, pill `top-[2px] bottom-[2px]` (L1234, L1239). | "Full round 999px, track padding 2px, height 36px" (L1273). |
| Attachment tile | `w-32 h-24 rounded-xl p-2.5 overflow-hidden flex-shrink-0` (L1310). Width 8rem equals the keyframe `max-width: 8rem` (L106). | None stated. |
| Surface ladder instead of heavy borders | 4 surfaces: light `#f5f5f3 / #fcfcfb / #fff / #fff`, dark `#0b0b0a / #151515 / #1a1a19 / #20201e` (L292-295). Neutral grays `#dedcd6`, `#a4a19b`, `#6b6863`, `#373634` etc. (L305-314). | "Claude avoids hard 1px black borders; four soft lightness steps build depth" (L321). |

## elevation/shadow/border

| Name | Mechanism + values (line) | Stated rationale |
|---|---|---|
| Composer inset + outer ring shadow (rest) | `box-shadow: 0 0.25rem 1.25rem rgba(0,0,0,0.035), inset 0 0 0 1px rgba(0,0,0,0.08)` (L449, L1027). Doc text shows the inset as `var(--cds-border)` (L451). | At rest the box floats softly: soft drop shadow plus a 1px inset hairline instead of a CSS border. |
| Composer double-ring focus shadow | `0 0.25rem 1.25rem rgba(0,0,0,0.075), inset 0 0 0 1px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.16)` (L454, L1026). Drop shadow doubles (0.035 to 0.075); inner ring 0.08 to 0.16; adds a 1px outer ring at 0.16. | "Outer and inner rings deepen and thicken together, a warm snap-in feedback" (L456). Transition: `transition-all duration-200` (L1023). No keyframes; the "breathing" is only a 200ms shadow tween. Dark mode reuses the same black rgba values; only the bg changes to `#20201e`. |
| Inset ring on a moving pill | Segmented pill: `boxShadow: inset 0 0 0 1px rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.08)` (L1243). | None stated (inferred: hairline gives the white pill an edge on a gray track). |
| Shadow ladder (light / dark) | SM: `0 1px 2px rgba(0,0,0,.05), 0 2px 8px rgba(0,0,0,.04)` / dark `0 1px 2px rgba(0,0,0,.3)` (L464). MD: `0 2px 4px rgba(0,0,0,.06), 0 6px 16px rgba(0,0,0,.07)` / dark `0 4px 6px -1px rgba(0,0,0,.4)` (L468). Popover: `0 8px 24px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.08)` / dark `0 8px 24px rgba(0,0,0,.5)` (L472). | SM badges and tiny buttons; MD cards and thinking block; Popover dropdowns and slash-command panel. Light shadows are two-layer (tight + diffuse); dark is single-layer and stronger. |
| Border-opacity swatches | `border border-black/10 dark:border-white/10` on color chips (L362); `border-clay/40` accent border (L398); `border-neutral-200/80` hairlines. | None stated. |
| Canvas dotted grid | `radial-gradient(#cbd5e1 1.2px, transparent 1.2px)` light / `#262626 1px` dark, `backgroundSize: 18px 18px` (L2462-2465). | Storybook-style stage background. |
| Stage card elevation | `shadow-xl` light, `shadow-2xl` dark, `border-neutral-200/90`, `rounded-2xl overflow-hidden`, `transition-all duration-300` (L2469-2472). | None stated. |
| Drag card lift | `shadow-xl` + `border-2 border-clay/80` on the draggable card (L2077); press button `shadow-lg` (L1981). | None stated. |

## focus/hover/press states

| Name | Mechanism + values (line) | Stated rationale |
|---|---|---|
| Button press scale (CSS) | `active:scale-95` with `transition-all` on primary, secondary, icon tiles (L927, L945, L1185, L1189). Tailwind default transition is 150ms `cubic-bezier(.4,0,.2,1)` (general knowledge). | Not stated. Not applied to ghost, icon-only, or sized buttons (L1175-1178, L1192, L1195), so press feedback is inconsistent. |
| Button press scale (spring) | `onMouseDown` sets `scale(0.88)` (L1585); `onMouseUp` animates 0.88 to 1 via the selected spring over 1.2s (L1591-1603); `transition:"none"` in style (L1979). Touch events mirrored (L1975-1976). | "Press to collapse to 0.88, on release spring back to 1.0 with the preset's damped oscillation" (L1967). |
| Hover color shift | Primary `bg-clay` to `hover:bg-clay-hover` (`#d97757` to `#cc5a36`, L26-28). Ghost `hover:bg-neutral-100 dark:hover:bg-neutral-800`. Icon button `hover:text-clay` / `hover:text-red-500` (L953, L956). | Clay Emphasized = "hover / pressed state" (L300). |
| Hover lift on tiles | `group-hover:text-clay group-hover:scale-110 transition-all` on icon inside tile; tile `hover:border-clay/60 hover:shadow-md` (L927, L930). | None stated. |
| Composer focus via container state | Textarea has `outline-none focus:ring-0` (L1037); `onFocus/onBlur` set React state that swaps the container shadow (L1033-1034, L1025). | Ring moves from the field to the whole composer shell. Not `:focus-within` CSS despite the label (L455); mouse and keyboard focus look the same. |
| Input focus | `outline-none focus:border-clay` (L879); sidebar search `focus:border-neutral-500` (L2319). | Outline removed, 1px border colour change is the only cue. Weak for keyboard users. |
| Active row in nav | Active: `bg-neutral-200/80 font-semibold shadow-xs` (light) / `bg-[#2a2a2a] text-white` (dark); inactive hover bg lift (L2342-2346). | None stated. |
| Segmented text-colour fade | Tab buttons `transition-colors duration-150`; active `text-white/neutral-900 font-semibold`, inactive hover darkens (L1256-1260). | None stated. |
| Disabled state | Send button `disabled:opacity-20 disabled:cursor-not-allowed`, disabled while `!text.trim()` (L1054-1055). Race button `disabled:opacity-50` (L1831). | None stated. Hover bg still applies on disabled (no `disabled:hover` reset). |

## motion timing/easing

| Name | Mechanism + values (line) | Stated rationale |
|---|---|---|
| Duration tokens (all 5) | `--cds-dur-fast 60ms`: micro feedback, icon colour, button micro-scale. `--cds-dur-snap 120ms`: snap-in, segmented slider, tab switch. `--cds-dur-base 200ms`: standard transitions, menu pop, Grid collapse. `--cds-dur-sheet 300ms`: sidebar slide, Artifact panel. `--cds-dur-slow 450ms`: large colour transitions, ambient glow (L968-972). | Display-only; not defined as CSS vars. Actual durations in code are 90, 150, 200, 250, 300, 450 ms and 1.1 s, 1.9 s (not all match tokens: segmented uses 150 not 120). `fast` 60ms is never used. |
| Easing tokens (all 3) | `--cds-ease-out cubic-bezier(.165,.84,.44,1)` ("smooth decelerate, close to easeOutQuart"). `--cds-ease-snap cubic-bezier(.32,.72,0,1)` ("fast start, decisive lock-in"). `--cds-ease-overshoot cubic-bezier(.34,1.3,.64,1)` ("natural spring with slight 1.3x overshoot") (L976-978). | Where each is used: ease-out in attachment grow-in (L1311); snap in the segmented pill (L1239); overshoot in the user bubble (L1085). |
| Other curves used inline (untokenised) | Accordion `cubic-bezier(.19,1,.22,1)` (L1153). Grapheme `cubic-bezier(.215,.61,.355,1)` (L1422). Quiet dots `cubic-bezier(.4,0,.2,1)` (L1132). Message fade-up `cubic-bezier(.34,1.56,.64,1)` (L1092). Block-enter `cubic-bezier(.22,1,.36,1)` then `ease-out` (L70, L76). | Message fade-up uses 1.56 overshoot, stronger than the 1.3 token. |
| Per-keyframe timing functions | In `@keyframes timeline-block-enter` the `animation-timing-function` is set inside keyframes: `cubic-bezier(.22,1,.36,1)` for 0%-30%, `ease-out` for 30%-100% (L70, L76). | Each segment gets its own curve (general knowledge: a timing function in a keyframe applies to the interval that follows it). |
| Spring presets (4 found, none for the other 2) | `button`: stiffness 600, damping 30, mass 1, "tight micro-bounce", label overshoot +4.2%, settle 0.22s, raw `{type:"spring",stiffness:600,damping:30}`. `card`: 320 / 28 / 1, "steady smooth pop", +1.8%, 0.35s. `bouncy`: 380 / 18 / 1, "clear rebound", +19.4%, 0.58s, raw `{type:"spring",duration:0.32,bounce:0.15}` (differs from the stiffness/damping used in the simulator). `drag`: 1200 / 80 / 0.1, "instant gesture follow", 0% overshoot, 0.14s (L1457-1505). | Use cases: button = click, switch, icon press. card = popover, card expand, message rise. bouncy = like, copy-success check, new-message nudge. drag = sidebar or float gesture snap (L1465-1501). My check of the closed-form overshoot: button 8.8% (label says 4.2%, mismatch), card 1.9%, bouncy 19.5%, drag 0 (overdamped, zeta 3.65). The `settle` labels are hard-coded, not computed. |
| Analytic spring solver | `calcSpring`: w0 = sqrt(k/m), zeta = c/(2 sqrt(mk)); underdamped zeta<0.999 uses `e^(-zeta w0 t)(A cos wd t + B sin wd t)`; critical band 0.999-1.001; overdamped uses two real roots (L1509-1534). Driven by `requestAnimationFrame` with `transition:none`. Run windows: race 1.4s, press 1.2s, drag-release 1.3s, modal 1.2s (L1549, L1591, L1643, L1685). | Lets the page preview Framer-Motion-style springs without the library. |
| Reveal windows | Modal pop: scale from 0.3 to 1, `opacity = min(1, scale*1.2)` (L1690, L2016). | Opacity leads scale so the card is solid before it finishes growing (inferred). |

## enter/exit animation

| Name | Mechanism + values (line) | Stated rationale |
|---|---|---|
| message-fade-up | `@keyframes message-fade-up` 0%: `opacity:0; translateY(10px)` to 100%: `opacity:1; translateY(0)` (L85-88). Applied `1.1s cubic-bezier(.34,1.56,.64,1)` on assistant message (L1092). No fill-mode set. | "AI reply rises in" (L267). The 1.56 overshoot makes the translate slightly pass 0 before settling (inferred). |
| code-user-bubble-enter | `0%: opacity:0; scale(0.92) translateY(6px)` to `100%: opacity:1; transform:none` (L90-93). Applied `0.45s cubic-bezier(.34,1.3,.64,1)` (L1085). | "User question bubble springs in" (L267). |
| timeline-block-enter (blur + scale, split timing) | `0%: opacity 0; blur(4px); translateY(5px) scale(.9)` with `cubic-bezier(.22,1,.36,1)`; `30%: opacity 0; blur(4px); transform none` with `ease-out`; `100%: opacity 1; filter none; transform none` (L65-83). Unused in stories; duration not given. | Not stated. Inferred: for the first 30% the block moves and scales into place while still invisible, then it fades and de-blurs in place. |
| Grapheme reveal | `@keyframes _grapheme-reveal_1plog_1` `0%: opacity 0; blur(6px)` to `100%: opacity 1; blur(0)` (L53-56). Applied per char: `90ms cubic-bezier(.215,.61,.355,1) both`, `animation-delay: index * delayMs` (default 30ms, slider 10-80ms), each char `inline-block whitespace-pre` (L1420-1423, L1372, L1399-1400). Split with `Array.from(text)` (L1417). | "Each character fades in from a 6px Gaussian blur over 90ms with a 30ms cascade, like ink spreading" (L1075). `Array.from` splits by code point, not grapheme cluster (general knowledge: ZWJ emoji and combined accents would break apart); `both` keeps later chars hidden until their delay. The hashed keyframe name suggests CSS-Modules output from the real app. |
| Quiet dots | `@keyframes timeline-quiet-dot`: `0%,8%: opacity 0, translateY(2px)`; `22%: opacity 1, translateY(-2.5px)`; `36%,70%: opacity 1, translateY(0)`; `90%,100%: opacity 0, translateY(0)` (L58-63). Applied `1.9s cubic-bezier(.4,0,.2,1) infinite`, delays 0 / 0.15s / 0.3s (L1132-1134). Dots `size-[3px] gap-[3.5px]` inline (L1131); lab version `size-2` (8px) `gap-[6px]` (L1442). Colour `#d97757`. | "Dots 2 and 3 are delayed 0.15s and 0.3s, giving a clay-coloured wave that jumps and settles" (L1448). Each cycle: fade in with a small up-hop (22%), settle (36%), hold to 70%, fade out (90%). |
| Grid 0fr accordion | Wrapper `grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(.19,1,.22,1)]` with `gridTemplateRows: open ? "1fr" : "0fr"` (L1153-1154). Child `min-h-0 overflow-hidden` (L1156). Chevron `transition-transform duration-200` + `rotate-180` when open (L1147). Header click disabled while thinking (L1125). | "Grid 0fr/1fr stretch container" (L1151); tokens list "Grid collapse" at `dur-base` 200ms (L970). Caution (my reading, not tested in a browser): the child also holds `pb-3 pt-2 border-t` padding, which may not collapse to zero inside a 0fr row, so a strip of padding could stay visible when closed. Safer: put padding on an inner element. |
| Attachment grow-in | `@keyframes file-thumbnail-grow-in` `0%: opacity 0; max-width 0; scale(.8)` to `100%: opacity 1; max-width 8rem; scale(1)` (L104-107). Applied `0.25s cubic-bezier(.165,.84,.44,1)` (L1311). | "Files push in horizontally" (L271). Animating `max-width` lets neighbours slide aside instead of jumping. `key={f}` ensures only new tiles animate. |
| Upload pulse | `@keyframes file-thumbnail-upload-pulse { 50% { opacity: .45 } }` (L109-111). Unused. | "Breathing pulse" while uploading (L271). Presumably used with `infinite` (inferred). |
| Segmented sliding pill | Pill `absolute`, `left: calc(2px + idx * (100% - 4px) / n)`, `width: calc((100% - 4px) / n)`, `transition-all duration-150 ease-[cubic-bezier(.32,.72,0,1)]` (L1239-1242). Container width also tweens `width 0.15s ease` (L1232). | "Pure geometric allocation, pill hugs the track to the pixel" (L1237, L1273). Pill is positioned by arithmetic, not measured with JS. |
| Page theme/colour transitions | `transition-colors duration-200` on shell, sidebar, header and stage (L2292, L2294, L2368, L2458). Canvas width swap `transition-all duration-300` (L2469). | Matches the `base` and `sheet` tokens. |

## feedback (copy / saved / upload)

| Name | Mechanism + values (line) | Stated rationale |
|---|---|---|
| saved-check-decay (copy tick) | `@keyframes saved-check-decay { to { opacity: 0 } }` (L113-115). Applied `saved-check-decay 0.3s ease-out 2.5s forwards` on the green "Copied" span (L1351). | "Check mark fades out after 2.5s" (L272). Caution: `setTimeout(() => setCopied(false), 2500)` (L1336) unmounts the span at the same 2.5s the fade starts, so the fade is never seen; the label just snaps back. To get the fade, reset state at about 2.8s. |
| Copy icon to check swap | Button content swaps `copy` icon + "Copy code" for green `check` + "Copied" (`text-green-400`) (L1350-1360). | None stated. |
| Copy confirmation on tiles | Click tile copies JSX; label swaps to green "已复制!" for 1500ms (L853-857, L935). | None stated. |
| Copy confirmation on config | Button text swaps to "已复制配置！" for 2000ms (L1730-1735, L2258). | None stated. |
| click-ring | `@keyframes click-ring` `0%: opacity .95; scale(.22)` to `100%: opacity 0; scale(1)` (L117-120). Unused; no duration. | Not stated. Inferred: an expanding ripple used to mark a pointer click in demos. |
| byline-sent-bump | `@keyframes byline-sent-bump { 50% { transform: scale(1.05) } }` (L95-97). Unused. | Not stated. Inferred: a 5% nudge on the byline when a message is sent; only a mid keyframe, so it runs from the element's own transform out to 1.05 and back. |
| Skeleton sweep | `@keyframes cds-skeleton-sweep` `translateX(-100%)` to `translateX(100%)` (L99-102). Unused. | Not stated. Inferred: a highlight band moves across a clipped placeholder. |

## layout (container queries, grid, collapse)

| Name | Mechanism + values (line) | Stated rationale |
|---|---|---|
| Container-query grids | `.story-canvas-card {container-type:inline-size; container-name:canvas-stage}` (L138-141). Breakpoints: `max-width:520px`, `521-820px`, `min-width:821px` (L143, L152, L161). Examples: surfaces 1 / 2 / 4 columns, clay 1 / 3 / 3, grays 5 / 5 / 10, radius, heights, shadows, tokens 1 / 2 / 3. All use `!important` and `minmax(0,1fr)`. | "On phones (<520px) show 1 column, tablet 2, desktop 4; no more 1-character vertical text" (L289, L322). Queries respond to the card width, not the viewport, so they work inside the viewport-width simulator. |
| Segmented compact mode | `containerType:"inline-size"` is set on the track (L1235), but compaction is JS: `isCompact = containerWidth < 254`; inactive tabs hide their text and keep icons (L1250, L1263). Slider range 180-420px (L1223-1224). | "Claude threshold 254px" with `@container (max-width: 254px)` (L1249, L1273). The real `@container` rule is not written; the demo fakes it with state. |
| Auto-fill icon grid | `grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: .75rem` (L922). | None stated. |
| Viewport simulator widths | Stage card `w-[390px]` / `w-[768px]` / `w-[1024px]` / `w-full max-w-5xl`, `minHeight:560px` (L2473-2474). | Tests responsive stories in-place. |
| Horizontal safety scroll | `overflow-x-auto` + `min-w-[320px]` / `min-w-[120px]` on demo rows (L598-599, L429-430, L1306). | None stated. |
| Race lane headroom | Target line at 72% of lane; position `= value * 72%` (L1850, L1886); overshoot zone shaded from 72% to the right (L1894). | "74% of lane maps to 100%, leaving 26% to show overshoot" (L1849; the code uses 72). |

## icon handling

| Name | Mechanism + values (line) | Stated rationale |
|---|---|---|
| Icon size ladder | `xs 12, sm 14, md 16 (default), lg 20, xl 24` px, or a number (L180-186). Typical use: xs in buttons/captions, sm in 32px buttons, md with 16px headings. | "5-step size ladder" (L259). |
| Single-path SVG on a 256 grid | All Phosphor icons `viewBox="0 0 256 256"`, `fill="currentColor"` so colour follows text (L228-231). Spark uses `viewBox 0 0 100 100` (L190). | "Extracted from vendor-icons-DDsFzYXd.js" (L197). |
| Weight emulation by stroke | `bold`: add `stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"` over the fill; otherwise `stroke="none"` (L224, L238-244). | Text says regular weight 533.3, bold 700, "active state goes bold" (L868, L901-908). The numbers are labels only; the code thickens by stroke, not by a font axis. |
| Duotone trick | Extra copy of the same path first: `fill="currentColor" opacity="0.28" transform="scale(0.96) translate(5, 5)"`, then the main path on top (L235-237). | Gives a soft offset second layer behind the glyph (inferred). Note that SVG applies transforms right to left, so this is translate then scale. |
| Icon wrapper tile | `size-11 rounded-lg bg-neutral-100`, icon `group-hover:text-clay group-hover:scale-110` (L930); tile `active:scale-95` (L927). | None stated. |
| Inline icon defaults | `inline-block align-neg-125 shrink-0 transition-transform` on every icon (L232). | `shrink-0` stops flex squeeze; see alignment table. |

## accessibility

| Name | Mechanism + values (line) | Stated rationale |
|---|---|---|
| prefers-reduced-motion | ABSENT. No media query, no JS check. Infinite dot animation (L1132) and all rAF springs always run. | n/a |
| Focus ring | No `:focus-visible` anywhere. Inputs/textarea use `outline-none` with a border-colour change (L879, L1037, L2317-2321). | n/a (gap) |
| Semantics | No `aria-*`, no `role=`. Accordion header is a clickable `div` (L1124-1126); delete "×" is a `span` (L1318). Icon-only buttons have no label (L953-958, L1195). Only `title` attributes (L928, L2435). | n/a (gap) |
| Selection colour | `selection:bg-[#d97757]/30 selection:text-white` on body (L172, L2282). | None stated. White text on a 30% clay tint over a white page is low contrast in light mode (my reading). |
| Hit-area / touch | Drag card sets `touchAction:"none"`, `userSelect:"none"`, `cursor: grab / grabbing` (L2073-2075). Segmented container `select-none` (L1234). | None stated. |

## other

| Name | Mechanism + values (line) | Stated rationale |
|---|---|---|
| Scrollbar styling | WebKit only: `::-webkit-scrollbar {width:6px; height:6px}`, track `transparent`, thumb `rgba(150,150,150,0.25)` radius `999px`, thumb hover `0.4` (L123-126). No `scrollbar-width` / `scrollbar-color` fallback. | None stated. Neutral grey alpha works on both themes (inferred). |
| Chat-state dot indicators | Thinking uses clay dots; done state uses a `size-1.5` grey dot and "Thought for 3 seconds" (L1140-1141). | Status shown with the same footprint in both states (inferred). |
| Raw-rAF displacement scope | Curve scope: 140 steps over 1.4s, y mapped `140 - (val/1.35)*110`, so up to 135% fits (L1741-1760). Metrics: zeta, w0, regime label (L1772-1779). | Visual overshoot check for a custom stiffness / damping / mass. |
| Slider accent | `accent-[#d97757]` / `accent-clay` on range inputs (L1227, L2160). | Brand colour on native controls. |
| Stable header layout | Toolbar button groups use `p-0.5 rounded-lg border` wrappers with `rounded-md` active chips, `h-4 w-px` dividers (L2381, L2406). | None stated. |
