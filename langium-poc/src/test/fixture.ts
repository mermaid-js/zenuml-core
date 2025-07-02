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
