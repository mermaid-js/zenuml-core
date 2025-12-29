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
      #resolveFragmentOrigin(fallbackOrigin) string
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

    class FragmentVM {
      <<abstract>>
      #beginFragment(context, top) object
      #finalizeFragment(top, cursor, meta) object
    }

    StatementVM <|-- FragmentVM

    class FragmentLoopVM {
      +kind: "loop"
    }
    class FragmentSingleBlockVM {
      <<abstract>>
    }
    class FragmentOptVM {
      +kind: "opt"
    }
    class FragmentParVM {
      +kind: "par"
    }
    class FragmentSectionVM {
      +kind: "section"
    }
    class FragmentCriticalVM {
      +kind: "critical"
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

    FragmentVM <|-- FragmentLoopVM
    FragmentVM <|-- FragmentSingleBlockVM
    FragmentSingleBlockVM <|-- FragmentOptVM
    FragmentSingleBlockVM <|-- FragmentParVM
    FragmentSingleBlockVM <|-- FragmentSectionVM
    FragmentSingleBlockVM <|-- FragmentCriticalVM
    FragmentVM <|-- FragmentTryCatchVM
    FragmentVM <|-- FragmentAltVM
    FragmentVM <|-- FragmentRefVM

    class createStatementVM {
      <<function>>
      +createStatementVM(statement, runtime) StatementVM
    }

    BlockVM ..> createStatementVM : uses
    createStatementVM ..> StatementVM : creates
```
