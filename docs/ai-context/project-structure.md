# Project Structure

ZenUML Core is a JavaScript diagramming library that renders sequence diagrams from a custom DSL. It ships as both an npm package (`@zenuml/core`) and a demo site.

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | [Bun](https://bun.sh/) (package manager + test runner) |
| UI Framework | React 19 |
| Parser | ANTLR4 (grammar → generated JavaScript parser) |
| State Management | Jotai |
| Styling | Tailwind CSS |
| Build tool | Vite (two configs: library + site) |
| Unit tests | Vitest (via `bun run test`) |
| E2E tests | Playwright (via `bun pw`) |
| PNG export | html-to-image |

## File Tree

```
zenuml-core/
├── src/
│   ├── core.tsx                    ← library entry point, ZenUml class
│   ├── g4/                         ← ANTLR grammar source
│   │   ├── sequenceLexer.g4
│   │   └── sequenceParser.g4
│   ├── generated-parser/           ← ANTLR output (committed, do not edit)
│   ├── parser/                     ← custom parser layer on top of ANTLR
│   │   ├── index.js                ← RootContext() entry point
│   │   ├── Participants.ts
│   │   ├── ToCollector.js
│   │   ├── MessageCollector.ts
│   │   ├── FrameBuilder.ts
│   │   ├── OrderedParticipants.ts
│   │   └── CONTEXT.md
│   ├── positioning/                ← layout computation (no React)
│   │   ├── Coordinates.ts          ← horizontal
│   │   ├── VerticalCoordinates.ts  ← vertical
│   │   ├── vertical/vm/            ← per-statement VM classes
│   │   ├── Constants.ts
│   │   └── CONTEXT.md
│   ├── components/                 ← React rendering components
│   │   ├── DiagramFrame/           ← outer container
│   │   │   └── SeqDiagram/
│   │   │       ├── LifeLineLayer/  ← participant columns
│   │   │       └── MessageLayer/   ← message arrows
│   │   │           └── Block/
│   │   │               └── Statement/   ← per-type statement components
│   │   └── CONTEXT.md
│   ├── store/
│   │   ├── Store.ts                ← all Jotai atoms
│   │   └── CONTEXT.md
│   └── utils/                      ← shared utilities
├── test/
│   └── unit/                       ← unit tests not co-located with source
├── tests/                          ← Playwright E2E tests
├── docs/
│   ├── DSL_SYNTAX.md               ← complete language reference
│   ├── UNICODE_SUPPORT.md
│   ├── ai-context/                 ← Tier 1 documentation
│   ├── parser/                     ← parser improvement notes
│   ├── superpowers/
│   │   ├── plans/                  ← feature implementation plans
│   │   └── specs/                  ← feature design specifications
│   └── ux-research/                ← user testing notes
├── scripts/
│   └── analyze-compare-case.mjs   ← E2E diff attribution tool
├── vite.config.ts                  ← demo site build
├── vite.config.lib.ts              ← library build (ESM + UMD)
├── CLAUDE.md                       ← master AI developer context
├── README.md
├── TUTORIAL.md                     ← library + iframe integration guide
└── DEPLOYMENT.md                   ← Cloudflare Pages deployment
```

## Build Outputs

| Command | Output | Format | Use |
|---|---|---|---|
| `bun build` | `dist/zenuml.esm.mjs` | ESM | Modern bundlers |
| `bun build` | `dist/zenuml.js` | UMD | Browser `<script>` tags |
| `bun build:site` | `dist/` (full site) | HTML/CSS/JS | GitHub Pages / demo |

## Entry Points

| Entry | File | Purpose |
|---|---|---|
| npm package | `src/core.tsx` | `ZenUml` class, `defineCustomElement()` |
| Dev server | `src/main.ts` | Development playground |
| Demo site | `index.html` | Vite site root |

## Test Layout

```
bun run test          → Vitest: src/**/*.spec.ts + test/unit/**/*.spec.ts
bun pw                → Playwright: tests/**/*.spec.ts
```

Unit tests are co-located with source (`.spec.ts` / `.spec.tsx` next to the file they test) or in `test/unit/` for cross-module tests. E2E tests in `tests/` use visual snapshot comparisons.
