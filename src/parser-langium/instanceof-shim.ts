/**
 * Stage-3 generated-parser `instanceof` shim.
 *
 * The renderer and parser layer test node kinds with `ctx instanceof
 * sequenceParser.MessageContext` (and CreationContext / StatContext /
 * AtomExprContext / ContentContext / …), importing the class from
 * `@/generated-parser/sequenceParser`. Under `ZENUML_PARSER=langium` the live
 * nodes are facade Ctx instances, not ANTLR-generated instances, so those
 * checks would all be false and arrow/fragment/return rendering would break.
 *
 * This installs a `Symbol.hasInstance` on each generated context class that
 * ALSO recognises the corresponding facade class, while preserving the native
 * prototype-chain check for genuine ANTLR nodes. It is the ANTLR-context
 * compatibility the facade strategy promises (07-risk-map §3.4), not a test
 * shim — `useArrow`/`useFragmentData`/`Return` depend on it identically.
 *
 * Installed only when the Langium engine is active (guarded in
 * src/parser/index.js); the default ANTLR path is never mutated.
 */
import sequenceParser from "@/generated-parser/sequenceParser";
import { FACADE_CLASS_BY_NAME } from "./facade/nodes";

let installed = false;

export function installInstanceofShim(): void {
  if (installed) return;
  installed = true;

  for (const [name, facadeClass] of Object.entries(FACADE_CLASS_BY_NAME)) {
    const generated = (sequenceParser as unknown as Record<string, unknown>)[
      name
    ];
    if (typeof generated !== "function") continue;
    const generatedProto = (generated as { prototype: object }).prototype;

    Object.defineProperty(generated, Symbol.hasInstance, {
      configurable: true,
      value(inst: unknown): boolean {
        if (inst === null || inst === undefined) return false;
        // Facade node of the matching kind.
        if (inst instanceof facadeClass) return true;
        // Preserve native instanceof for genuine ANTLR-generated nodes.
        let proto = Object.getPrototypeOf(inst);
        while (proto) {
          if (proto === generatedProto) return true;
          proto = Object.getPrototypeOf(proto);
        }
        return false;
      },
    });
  }
}
