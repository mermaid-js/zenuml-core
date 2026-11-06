# VM Layer Overview

The classes in this directory provide the polymorphic layout engine for sequence-diagram blocks. `BlockVM` walks the parsed statements, dispatching to specialised `StatementVM` subclasses that report the vertical height each construct consumes. Helpers such as comment measurements and fragment metrics live alongside the VMs to keep the rendering components lean.

```mermaid
classDiagram
    class NodeVM {
      <<abstract>>
      #context: any
      #runtime: LayoutRuntime
      +constructor(context, runtime)
      #layoutBlock(blockContext, origin, startTop) number
    }

    class BlockVM {
      -statements: any[]
      +constructor(context, runtime)
      +layout(origin, startTop) number
    }

    class StatementVM {
      <<abstract>>
      +kind: StatementKind
      +constructor(statement, runtime)
      +measure(top, origin)* StatementCoordinate
      #measureComment(context?) number
      #findLeftParticipant(ctx, fallbackOrigin) string
    }

    NodeVM <|-- BlockVM
    NodeVM <|-- StatementVM

    class CreationStatementVM {
      +kind: "creation"
    }
    class SyncMessageStatementVM {
      +kind: "syncMessage"
    }
    class AsyncMessageStatementVM {
      +kind: "asyncMessage"
    }
    class ReturnStatementVM {
      +kind: "return"
    }
    class DividerStatementVM {
      +kind: "divider"
    }
    class EmptyStatementVM {
      +kind: "empty"
    }

    StatementVM <|-- CreationStatementVM
    StatementVM <|-- SyncMessageStatementVM
    StatementVM <|-- AsyncMessageStatementVM
    StatementVM <|-- ReturnStatementVM
    StatementVM <|-- DividerStatementVM
    StatementVM <|-- EmptyStatementVM

    class FragmentSingleBlockVM {
      +kind: "loop" | "opt" | "par" | "section" | "critical"
    }
    class FragmentTryCatchVM {
      +kind: "tcf"
    }
    class FragmentAltVM {
      +kind: "alt"
    }
    class FragmentRefVM {
      +kind: "ref"
    }

    StatementVM <|-- FragmentSingleBlockVM
    StatementVM <|-- FragmentTryCatchVM
    StatementVM <|-- FragmentAltVM
    StatementVM <|-- FragmentRefVM

    class createStatementVM {
      <<function>>
      +createStatementVM(statement, runtime) StatementVM
    }

    BlockVM ..> createStatementVM : uses
    createStatementVM ..> StatementVM : creates
```
