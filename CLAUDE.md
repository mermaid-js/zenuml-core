# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `pnpm dev` (runs on port 8080)
- **Build library**: `pnpm build` (builds library with vite.config.lib.ts)
- **Build site**: `pnpm build:site` (builds demo site with vite.config.ts)
- **Run tests**: `pnpm test` (runs Vitest unit tests)
- **Run E2E tests**: `pnpm pw` (runs Playwright tests)
- **Run E2E tests (CI)**: `pnpm pw:ci` (runs with GitHub reporter for CI)
- **Open Playwright UI**: `pnpm pw:ui`
- **Update Playwright snapshots**: `pnpm pw:update`
- **Install Playwright browsers**: `pnpm pw:install`
- **Run smoke tests**: `pnpm pw:smoke`
- **Lint code**: `pnpm eslint` (runs ESLint with auto-fix)
- **Format code**: `pnpm prettier` (runs Prettier)
- **Generate ANTLR parser**: `pnpm antlr` (generates JavaScript parser from grammar)

## Project Architecture

ZenUML is a JavaScript-based diagramming library for creating sequence diagrams from text definitions. The project has two main parts:

### 1. DSL Parser (ANTLR-based)

- **Grammar files**: `src/g4/` contains ANTLR grammar definitions
- **Generated parser**: `src/generated-parser/` contains generated JavaScript parser
- **Parser enhancements**: `src/parser/` contains custom functionality layered on top of ANTLR

### 2. React-based Renderer

- **Core entry point**: `src/core.tsx` - main library export and ZenUml class
- **Component structure**: `src/components/` - React components for rendering diagrams
- **Store management**: `src/store/Store.ts` - Jotai-based state management
- **Positioning engine**: `src/positioning/` - algorithms for layout and positioning

### Key Components Architecture

- **DiagramFrame**: Main container component that orchestrates the entire diagram
- **SeqDiagram**: Core sequence diagram renderer with layers:
  - **LifeLineLayer**: Renders participants and their lifelines
  - **MessageLayer**: Renders messages and interactions between participants
- **Statement components**: Individual renderers for different UML elements (interactions, fragments, etc.)

### Parser Architecture

The parser uses a two-stage approach:

1. **ANTLR-generated parser**: Converts text to parse tree
2. **Custom parser layer**: Transforms parse tree into structured data for rendering

Key parser modules:

- **Participants.ts**: Manages participant detection and ordering
- **MessageContext.ts**: Handles message parsing and context
- **FrameBuilder.ts**: Builds the overall diagram structure
- **Fragment handling**: Support for UML fragments (alt, opt, loop, par, etc.)

## Build System

The project uses Vite with two configurations:

- **vite.config.ts**: Development server and demo site build
- **vite.config.lib.ts**: Library build (ESM and UMD outputs)

Output formats:

- **ESM**: `dist/zenuml.esm.mjs` for modern bundlers
- **UMD**: `dist/zenuml.js` for browser scripts

## Testing Strategy

- **Unit tests**: Vitest for parser and utility functions
- **Component tests**: React Testing Library for component logic
- **E2E tests**: Playwright for full integration testing with visual snapshots
- **Test files**: Co-located with source files using `.spec.ts` extension

## Key Dependencies

- **React 19**: UI framework
- **ANTLR4**: Parser generation
- **Jotai**: State management
- **Tailwind CSS**: Styling framework
- **html-to-image**: PNG export functionality
- **Vite**: Build tool and development server

## Package Management

Uses pnpm with volta for Node.js version management. Always use `npx pnpm` for the first install.

## Development Notes

- The project builds both a library and a demo site
- Parser generation requires Java and ANTLR4
- E2E tests use visual snapshots for regression testing
- The library is published as `@zenuml/core` to npm
- GitHub Pages deployment is automated via GitHub Actions
