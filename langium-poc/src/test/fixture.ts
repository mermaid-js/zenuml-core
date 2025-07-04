import {
  EmptyFileSystem,
  createDefaultCoreModule,
  createDefaultSharedCoreModule,
  inject,
  type DefaultSharedCoreModuleContext,
  type LangiumCoreServices,
  type LangiumSharedCoreServices,
} from "langium";
import {
  SequenceGeneratedModule,
  SequenceGeneratedSharedModule,
} from "../language/generated/module";
import { parseHelper } from "langium/test";
import { expect } from "vitest";
import { Model } from "../language/generated/ast";

export function createSequenceServices(
  context: DefaultSharedCoreModuleContext = EmptyFileSystem,
): {
  shared: LangiumSharedCoreServices;
  Sequence: LangiumCoreServices;
} {
  const shared = inject(
    createDefaultSharedCoreModule(context),
    SequenceGeneratedSharedModule,
  );
  const Sequence = inject(
    createDefaultCoreModule({ shared }),
    SequenceGeneratedModule,
  );
  shared.ServiceRegistry.register(Sequence);
  return { shared, Sequence };
}

export async function genValidateParser(
  parse: ReturnType<typeof parseHelper<Model>>,
) {
  return async (text: string) => {
    const document = await parse(text, { validation: true });
    if (
      document.parseResult.lexerErrors.length > 0 ||
      document.parseResult.parserErrors.length > 0
    ) {
      console.error(document.parseResult.lexerErrors);
      console.error(document.parseResult.parserErrors);
      console.log(document.parseResult.value);
    }
    expect(document.parseResult.lexerErrors.length).toBe(0);
    expect(document.parseResult.parserErrors.length).toBe(0);
    expect(document.parseResult.value.$type).toBeDefined();
  };
}
