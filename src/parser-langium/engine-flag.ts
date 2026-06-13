/**
 * Parser engine selector (07-risk-map Part 4).
 *
 * Stage-5 cutover: the **Langium** engine is now the default for `@/parser`
 * (and the modules specs import directly: ToCollector, MessageCollector,
 * FrameBuilder, ContextsFixture). The ANTLR engine remains a one-step rollback
 * lever until Stage 6 decommission:
 *
 *   - flip `DEFAULT_ENGINE` below to "antlr", OR
 *   - set `ZENUML_PARSER=antlr` (Node/Bun/dev-server process env).
 *
 * `ZENUML_PARSER=langium` still forces Langium (used by parity specs). The env
 * read is guarded so the browser bundle — where `process` is undefined and Vite
 * does not define `ZENUML_PARSER` — falls through to `DEFAULT_ENGINE`.
 */
const DEFAULT_ENGINE: "langium" | "antlr" = "langium";

const override: string | undefined =
  typeof process !== "undefined" && typeof process.env !== "undefined"
    ? process.env.ZENUML_PARSER
    : undefined;

export const USE_LANGIUM: boolean =
  override === "antlr"
    ? false
    : override === "langium"
      ? true
      : DEFAULT_ENGINE === "langium";
