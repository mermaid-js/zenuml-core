/**
 * Stage-5 rollback lever (07-risk-map Part 4): the parser engine is selected
 * ONCE at process start from ZENUML_PARSER. Default is the ANTLR engine;
 * `ZENUML_PARSER=langium` flips `@/parser` (and the modules specs import
 * directly: ToCollector, MessageCollector, FrameBuilder, ContextsFixture)
 * to the Langium-backed facade. Kept deliberately trivial — one env read,
 * no runtime switching.
 */
export const USE_LANGIUM: boolean =
  typeof process !== "undefined" &&
  typeof process.env !== "undefined" &&
  process.env.ZENUML_PARSER === "langium";
