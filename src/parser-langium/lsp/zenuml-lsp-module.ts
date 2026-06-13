/**
 * Langium **LSP** service wiring for ZenUML (side-car — never imported by the
 * library/browser bundle, only by the LSP server entry and its tests).
 *
 * Reuses the core parser overrides from `../services.ts` (the Stage-1 token
 * list / safeMode lexer / identity value-converter) and layers the LSP services
 * (completion, hover, validation) on top via `langium/lsp`. This is the
 * counterpart to `createZenUmlServices` (core, browser-safe) in services.ts —
 * same parser, plus everything `vscode-languageserver` needs.
 */
import { inject, type Module } from "langium";
import {
  createDefaultModule,
  createDefaultSharedModule,
  type DefaultSharedModuleContext,
  type LangiumServices,
  type LangiumSharedServices,
  type PartialLangiumServices,
} from "langium/lsp";
import {
  ZenUmlGeneratedModule,
  ZenUmlGeneratedSharedModule,
} from "../generated/module.js";
import { ZenUmlModule as ZenUmlCoreOverrides } from "../services.js";
import { ZenUmlCompletionProvider } from "./zenuml-completion.js";
import { ZenUmlHoverProvider } from "./zenuml-hover.js";
import {
  registerZenUmlValidationChecks,
  ZenUmlValidator,
} from "./zenuml-validator.js";

export type ZenUmlAddedServices = {
  validation: {
    ZenUmlValidator: ZenUmlValidator;
  };
};

export type ZenUmlServices = LangiumServices & ZenUmlAddedServices;

export const ZenUmlLspModule: Module<
  ZenUmlServices,
  PartialLangiumServices & ZenUmlAddedServices
> = {
  validation: {
    ZenUmlValidator: () => new ZenUmlValidator(),
  },
  lsp: {
    CompletionProvider: (services) => new ZenUmlCompletionProvider(services),
    HoverProvider: (services) => new ZenUmlHoverProvider(services),
  },
};

export function createZenUmlLspServices(context: DefaultSharedModuleContext): {
  shared: LangiumSharedServices;
  ZenUml: ZenUmlServices;
} {
  const shared = inject(
    createDefaultSharedModule(context),
    ZenUmlGeneratedSharedModule,
  );
  const ZenUml = inject(
    createDefaultModule({ shared }),
    ZenUmlGeneratedModule,
    // Core parser overrides are typed for LangiumCoreServices; LangiumServices
    // is a superset, and the overrides only touch core parser fields.
    ZenUmlCoreOverrides as unknown as Module<
      ZenUmlServices,
      PartialLangiumServices
    >,
    ZenUmlLspModule,
  );
  shared.ServiceRegistry.register(ZenUml);
  registerZenUmlValidationChecks(ZenUml);
  return { shared, ZenUml };
}
