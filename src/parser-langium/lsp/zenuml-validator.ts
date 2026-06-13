/**
 * ZenUML semantic validation. Parser/lexer syntax errors already surface as LSP
 * diagnostics via Langium's DocumentValidator; this adds ZenUML-specific checks
 * on top. Kept conservative so it never false-positives on valid DSL.
 */
import type { ValidationAcceptor, ValidationChecks } from "langium";
import { isParticipant } from "../generated/ast.js";
import type { Prog, ZenUmlAstType } from "../generated/ast.js";
import type { ZenUmlServices } from "./zenuml-lsp-module.js";

export function registerZenUmlValidationChecks(services: ZenUmlServices): void {
  const registry = services.validation.ValidationRegistry;
  const validator = services.validation.ZenUmlValidator;
  const checks: ValidationChecks<ZenUmlAstType> = {
    Prog: validator.checkDuplicateParticipants,
  };
  registry.register(checks, validator);
}

export class ZenUmlValidator {
  /**
   * Warn when the same participant is explicitly declared more than once in the
   * head — harmless but redundant, and usually a copy-paste mistake.
   */
  checkDuplicateParticipants(prog: Prog, accept: ValidationAcceptor): void {
    const seen = new Set<string>();
    for (const el of prog.headElements) {
      if (!isParticipant(el) || !el.name) continue;
      if (seen.has(el.name)) {
        accept("warning", `Duplicate participant declaration: '${el.name}'.`, {
          node: el,
          property: "name",
        });
      } else {
        seen.add(el.name);
      }
    }
  }
}
