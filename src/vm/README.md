# VM Layer Overview

The classes in this directory provide the polymorphic layout engine for sequence-diagram blocks. `BlockVM` walks the parsed statements, dispatching to specialised `StatementVM` subclasses that report the vertical height each construct consumes. Helpers such as comment measurements and fragment metrics live alongside the VMs to keep the rendering components lean.

```mermaid
classDiagram
    class NodeVM {
      <<abstract>>
      +context:any
      #blockHeight(block, origin) number
    }

    class BlockVM {
      +layout(origin, startTop) BlockLayout
      +advance(origin, startTop) number
      +height(origin) number
    }

    class StatementVM {
      <<abstract>>
      +height(origin) number
      #heightAfterComment(origin) number
      #resolveFragmentOrigin(fallback) string
    }

    NodeVM <|-- BlockVM
    NodeVM <|-- StatementVM

    class CreationStatementVM
    class SyncMessageStatementVM
    class AsyncMessageStatementVM
    class ReturnStatementVM
    class DividerStatementVM
    class EmptyStatementVM

    StatementVM <|-- CreationStatementVM
    StatementVM <|-- SyncMessageStatementVM
    StatementVM <|-- AsyncMessageStatementVM
    StatementVM <|-- ReturnStatementVM
    StatementVM <|-- DividerStatementVM
    StatementVM <|-- EmptyStatementVM

    class FragmentVM {
      <<abstract>>
      #fragmentBodyHeight(origin) number
    }

    StatementVM <|-- FragmentVM

    class FragmentLoopVM
    class FragmentSingleBlockVM
    class FragmentOptVM
    class FragmentParVM
    class FragmentSectionVM
    class FragmentCriticalVM
    class FragmentTryCatchVM
    class FragmentAltVM
    class FragmentRefVM

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
      +createStatementVM(statement) StatementVM
    }

    BlockVM --> StatementVM : uses createStatementVM
    NodeVM <.. createBlockVM : factory helper
    FragmentTryCatchVM ..> toArray
    FragmentLoopVM ..> CONDITION_LABEL_HEIGHT
```
