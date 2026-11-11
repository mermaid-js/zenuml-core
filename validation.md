# Issue 660 review evidence

Captured 2026-11-11 on macOS using Chrome. Synthetic DSL only; no customer data.

Base: main at 520f98f7. Head: 9659ad552116f9c950202f5ed30a0b660d196e9d.

Both screenshots show the same native SVG, opened as an independent SVG document, from the existing repro-ec2-stereotype-color comparison fixture:

```text
@EC2 <<BFF>> OrderService #E3FCEF
OrderService.create(payload)
```

| Check | Before (main) | After (fix) |
| --- | --- | --- |
| Stereotype family | Times | "IBM Plex Sans", Helvetica, Verdana, serif |
| Stereotype size / weight / style | 14px / 400 / normal | 14px / 400 / normal |
| Participant name family | "IBM Plex Sans", Helvetica, Verdana, serif | "IBM Plex Sans", Helvetica, Verdana, serif |
| Focused Playwright end-to-end tests | 4 failed | 4 passed |

The end-to-end tests cover the default and neon themes in both standalone SVGs and a host page with a monospace font. They use the public renderToSvg output and read computed styles.

Final validation: 2,952 unit tests passed, 6 skipped, 0 failed; typecheck passed; ESLint passed on the changed source and tests. The patch changeset declares the release bump.
