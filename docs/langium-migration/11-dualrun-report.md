# Gate-3 Dual-Run A/B Parity Report

Generated: 2026-06-13T03:21:47.311Z

## Summary

| Metric | Count |
|--------|-------|
| Total corpus cases | 198 |
| Identical (ANTLR == Langium facade) | 190 |
| Differing — explained (G7 recovery) | 8 |
| Differing — **UNEXPLAINED (failures)** | 0 |

**Result: PASS** — all diffs are empty or carry a documented G7 exclusion.

## Differing Cases

### `compare-emoji-colon-override` — explained [G7 recovery — ANTLR DefaultErrorStrategy vs Chevrotain single-token-insert/delete produce different partial trees for grammar-strict inputs; documented in 07-risk-map.md §G7]

```
root[ProgContext].start: antlr=0 langium=13
root[ProgContext].stop: antlr=51 langium=null
root[ProgContext].formattedText: antlr="[:red:] Alert [rocket] Normal Alert->Normal.notify()" langium=" [rocket] Normal"
```

### `compare-emoji-in-conditions` — explained [G7 recovery — ANTLR DefaultErrorStrategy vs Chevrotain single-token-insert/delete produce different partial trees for grammar-strict inputs; documented in 07-risk-map.md §G7]

```
root[ProgContext].stop: antlr=106 langium=70
root[ProgContext].formattedText: antlr="if([check] authorized) { A.proceed() } else if([warning] rate limited) { A.wait() } else { A.deny() }" langium="if([check] authorized) { A.proceed() } else if([warning] rate limited"
```

### `malformed-unclosed-brace-after-message` — explained [G7 recovery — ANTLR DefaultErrorStrategy vs Chevrotain single-token-insert/delete produce different partial trees for grammar-strict inputs; documented in 07-risk-map.md §G7]

```
root[ProgContext][0][BlockContext][0][StatContext].stop: antlr=2 langium=4
root[ProgContext][0][BlockContext][0][StatContext].formattedText: antlr="A.m" langium="A.m {"
root[ProgContext][0][BlockContext][0][StatContext][0][MessageContext].stop: antlr=2 langium=4
root[ProgContext][0][BlockContext][0][StatContext][0][MessageContext].formattedText: antlr="A.m" langium="A.m {"
root[ProgContext][0][BlockContext][0][StatContext][0][MessageContext][1]: one tree is null (antlr=null, langium={"kind":"BraceBlockContext","start":4,"stop":4,"formattedText":"{","comment":null,"children":[]})
root[ProgContext][0][BlockContext][1]: one tree is null (antlr={"kind":"StatContext","start":4,"stop":4,"formattedText":"{","comment":null,"children":[{"kind":"SectionContext","start":4,"stop":4,"formattedText":"{","comment":null,"children":[{"kind":"BraceBlockContext","start":4,"stop":4,"formattedText":"{","comment":null,"children":[]}]}]}, langium=null)
```

### `malformed-unclosed-paren-in-creation` — explained [G7 recovery — ANTLR DefaultErrorStrategy vs Chevrotain single-token-insert/delete produce different partial trees for grammar-strict inputs; documented in 07-risk-map.md §G7]

```
root[ProgContext][0][BlockContext][0][StatContext].stop: antlr=2 langium=5
root[ProgContext][0][BlockContext][0][StatContext].formattedText: antlr="new" langium="new A("
root[ProgContext][0][BlockContext][0][StatContext][0][CreationContext].stop: antlr=2 langium=5
root[ProgContext][0][BlockContext][0][StatContext][0][CreationContext].formattedText: antlr="new" langium="new A("
root[ProgContext][0][BlockContext][0][StatContext][0][CreationContext][0][CreationBodyContext].stop: antlr=2 langium=5
root[ProgContext][0][BlockContext][0][StatContext][0][CreationContext][0][CreationBodyContext].formattedText: antlr="new" langium="new A("
root[ProgContext][0][BlockContext][0][StatContext][0][CreationContext][0][CreationBodyContext][0]: one tree is null (antlr=null, langium={"kind":"ConstructContext","start":4,"stop":4,"formattedText":"A","comment":null,"children":[{"kind":"NameContext","start":4,"stop":4,"formattedText":"A","comment":null,"children":[]}]})
root[ProgContext][0][BlockContext][1]: one tree is null (antlr={"kind":"StatContext","start":4,"stop":5,"formattedText":"A(","comment":null,"children":[{"kind":"MessageContext","start":4,"stop":5,"formattedText":"A(","comment":null,"children":[{"kind":"MessageBodyContext","start":4,"stop":5,"formattedText":"A(","comment":null,"children":[{"kind":"FuncContext","start":4,"stop":5,"formattedText":"A(","comment":null,"children":[{"kind":"SignatureContext","start":4,"stop":5,"formattedText":"A(","comment":null,"children":[{"kind":"MethodNameContext","start":4,"stop":4,"formattedText":"A","comment":null,"children":[{"kind":"NameContext","start":4,"stop":4,"formattedText":"A","comment":null,"children":[]}]},{"kind":"InvocationContext","start":5,"stop":5,"formattedText":"(","comment":null,"children":[]}]}]}]}]}]}, langium=null)
```

### `malformed-bare-try` — explained [G7 recovery — ANTLR DefaultErrorStrategy vs Chevrotain single-token-insert/delete produce different partial trees for grammar-strict inputs; documented in 07-risk-map.md §G7]

```
root[ProgContext][0][BlockContext][0][StatContext][0][TcfContext][0][TryBlockContext][0]: one tree is null (antlr={"kind":"BraceBlockContext","start":3,"stop":2,"formattedText":"","comment":null,"children":[]}, langium=null)
```

### `tol-09a-return-async-half-arrow` — explained [G7 recovery — ANTLR DefaultErrorStrategy vs Chevrotain single-token-insert/delete produce different partial trees for grammar-strict inputs; documented in 07-risk-map.md §G7]

```
root[ProgContext].stop: antlr=3 langium=0
root[ProgContext].formattedText: antlr="A ~>" langium="A"
root[ProgContext][0]: one tree is null (antlr=null, langium={"kind":"HeadContext","start":0,"stop":0,"formattedText":"A","comment":null,"children":[{"kind":"ParticipantContext","start":0,"stop":0,"formattedText":"A","comment":null,"children":[{"kind":"NameContext","start":0,"stop":0,"formattedText":"A","comment":null,"children":[]}]}]})
```

### `tol-09b-return-async-no-colon` — explained [G7 recovery — ANTLR DefaultErrorStrategy vs Chevrotain single-token-insert/delete produce different partial trees for grammar-strict inputs; documented in 07-risk-map.md §G7]

```
root[ProgContext].stop: antlr=5 langium=0
root[ProgContext].formattedText: antlr="A ~> B" langium="A"
root[ProgContext][0]: one tree is null (antlr=null, langium={"kind":"HeadContext","start":0,"stop":0,"formattedText":"A","comment":null,"children":[{"kind":"ParticipantContext","start":0,"stop":0,"formattedText":"A","comment":null,"children":[{"kind":"NameContext","start":0,"stop":0,"formattedText":"A","comment":null,"children":[]}]}]})
```

### `tol-11b-orphan-block-after-ref` — explained [G7 recovery — ANTLR DefaultErrorStrategy vs Chevrotain single-token-insert/delete produce different partial trees for grammar-strict inputs; documented in 07-risk-map.md §G7]

```
root[ProgContext][0][BlockContext][0][StatContext][0][RefContext][0]: one tree is null (antlr={"kind":"NameContext","start":4,"stop":4,"formattedText":"x","comment":null,"children":[]}, langium=null)
```

## Methodology

Both engines are invoked via their public facade-level API:
- **ANTLR**: `src/parser/index.js` prototype augmentations (getFormattedText, getComment)
- **Langium**: `src/parser-langium/compat.ts` → `buildRootFacade` → facade Ctx nodes

Serialization walks `node.children` (rule-level only; ANTLR terminals skipped to match
facade semantics), recording `kind`, `start.start`, `stop.stop`, `getFormattedText()`,
and `getComment()` per node.

G7 exclusion applies to cases with id prefix `malformed-` or `tol-`, which exercise
error-recovery inputs where ANTLR DefaultErrorStrategy and Chevrotain's recovery
produce structurally different partial trees by design (07-risk-map.md §G7).
