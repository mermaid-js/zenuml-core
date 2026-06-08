# Documentation Architecture

This project uses a **3-tier documentation system** organized by stability and scope.

## How the 3-Tier System Works

**Tier 1 (Foundation)**: Stable, system-wide docs that rarely change — architecture, technology decisions, cross-component patterns, development protocols.

**Tier 2 (Component)**: Architectural charters for major subsystems — design principles, integration patterns, and module-wide conventions without feature-specific detail.

**Tier 3 (Feature-Specific)**: Granular docs co-located with code — implementation patterns, local decisions, technical details that evolve with features.

## Documentation Principles

- **Co-location**: Docs live near the code they describe
- **Verified content**: No claims without reading the code first
- **AI-First**: Structured for efficient AI context loading

---

## Tier 1: Foundational Documentation (System-Wide)

- **[Master Context](/CLAUDE.md)** — Development commands, architecture overview, testing strategy, bug-fix process, coding standards
- **[Project Structure](/docs/ai-context/project-structure.md)** — Technology stack, file tree, build system
- **[System Integration](/docs/ai-context/system-integration.md)** — Parser→Positioning→Components data flow, embedding API
- **[Deployment Infrastructure](/docs/ai-context/deployment-infrastructure.md)** — CI/CD, npm publish, GitHub Pages, Cloudflare
- **[DSL Syntax Reference](/docs/DSL_SYNTAX.md)** — Complete language reference for ZenUML diagram text

---

## Tier 2: Component-Level Documentation

- **[Parser Module](/src/parser/CONTEXT.md)** — ANTLR grammar, two-stage pipeline, Participants/MessageCollector/FrameBuilder APIs
- **[Positioning Module](/src/positioning/CONTEXT.md)** — Horizontal + vertical coordinate systems, VM layer, anchor model
- **[Components Module](/src/components/CONTEXT.md)** — React component hierarchy, DiagramFrame→SeqDiagram→layers, render modes
- **[Store Module](/src/store/CONTEXT.md)** — Jotai atom catalogue, state flow, width provider, embedding callbacks

---

## Tier 3: Feature-Specific Documentation

Co-located with source:

- **[Vertical Coordinates](/src/positioning/VERTICAL_COORDINATES.md)** — Vertical pipeline API and entry points
- **[VM Layer README](/src/positioning/vertical/vm/README.md)** — Polymorphic VM class diagram and design
- **[Unicode Support](/docs/UNICODE_SUPPORT.md)** — Unicode identifier ranges, emoji, bilingual guide
- **[XSS Fix](/docs/xss.md)** — XSS vulnerability disclosure and the fix applied
- **[Async vs Sync Parser Rules](/docs/async-vs-sync-parser-rules.md)** — When the parser chooses async vs sync message rules
- **[Divider Parser](/docs/divider-parser-allow-spaces.md)** — Divider syntax tolerance for leading spaces
- **[Responsive Participant Margin](/docs/responsive-participant-margin.md)** — Margin responsiveness design
- **[Width Translate and Offsets](/docs/width-translate-and-offsets.md)** — Positioning math for arrows
- **[Inherited vs Provided From](/docs/inherited-vs-provided-from.md)** — Coordinate inheritance in nested contexts

### Feature Plans and Specs (`docs/superpowers/`)

- Plans: `plans/` — detailed implementation plans for upcoming features
- Specs: `specs/` — design specifications for upcoming features
- UX Research: `docs/ux-research/` — user testing notes

---

## Adding New Documentation

### New module

1. Create `src/<module>/CONTEXT.md` (Tier 2)
2. Add entry to this file under Tier 2

### New feature

1. Create a feature doc in `docs/` or co-located with the source (Tier 3)
2. Add entry to this file under Tier 3

### Deprecating

1. Delete the file
2. Remove the entry from this file
