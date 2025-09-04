# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` (React 19 renderer, TypeScript). Parser grammars in `src/g4`, generated code in `src/generated-parser`, enhancements in `src/parser`.
- Tests: `tests/*.spec.ts` (+ `*-snapshots/`) and `test/unit/**` (Vitest setup in `test/setup.ts`). Playwright config in `playwright.config.ts`.
- Site/demo: Vite app (entry via `index.html`, assets in `public/`). Build output in `dist/`.
- Docs & misc: `docs/`, `.storybook/`, `scripts/`, `antlr/`.

## Build, Test, and Development Commands
- `npx pnpm install`: Install dependencies (first run via `npx`).
- `pnpm dev`: Start Vite dev server at `http://localhost:8080`.
- `pnpm build`: Build library bundle (Vite, `vite.config.lib.ts`).
- `pnpm build:site`: Build demo/site; `pnpm preview` serves it.
- `pnpm test`: Run unit tests (Vitest).
- `pnpm pw`, `pnpm pw:ui`, `pnpm pw:smoke`: Playwright e2e tests (CLI, UI, smoke).
- `pnpm eslint`, `pnpm prettier`: Lint and format code.
- Cloudflare Worker: `pnpm worker:dev`, `pnpm worker:deploy` (builds site first).

## Coding Style & Naming Conventions
- Language: TypeScript (`strict: true`), React JSX (`react-jsx`). Node >= 20.
- Indentation: 2 spaces, LF line endings (`.editorconfig`).
- Linting: ESLint + `@typescript-eslint` + Prettier. Prefer `pnpm eslint` and fix before commit.
- Files: use `.ts/.tsx`. Tests end with `.spec.ts`. Path alias `@/*` maps to `src/*`.

## Testing Guidelines
- Unit: Vitest + Testing Library; setup in `test/setup.ts` (e.g., IntersectionObserver mock).
- E2E: Playwright; run `pnpm pw` or debug with `pnpm pw:ui`.
- Snapshots: present in `*-snapshots/`. Update intentionally: `vitest -u` or `pnpm pw:update`.
- Place new unit tests near subject in `test/unit/**` or add `.spec.ts` under `tests/` with clear names.

## Commit & Pull Request Guidelines
- Commit style: Conventional Commits (e.g., `feat:`, `fix:`, `refactor:`). Scope optional.
- PRs: clear description, link issues, include screenshots for UI changes, update docs if behavior changes.
- Quality gate: run `pnpm eslint`, `pnpm prettier`, `pnpm test`, and relevant Playwright suites; ensure CI passes.

## Security & Configuration Tips
- Avoid injecting raw HTML; use safe utilities (e.g., DOMPurify) where needed.
- ANTLR: grammars in `src/g4`; regenerate via `pnpm antlr` when grammar changes.
