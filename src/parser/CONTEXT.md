# Parser Module — Context

**Location**: `src/parser/`, `src/g4/`, `src/generated-parser/`

## Purpose

Converts ZenUML DSL text into a structured parse tree and semantic data model used by the rendering pipeline. Two-stage design: ANTLR lexer + parser generates a raw parse tree, then custom listeners enrich it with semantic information.

## Two-Stage Pipeline

```
DSL text
  │
  ▼
RootContext(code)          ← src/parser/index.js
  │  ├─ sequenceLexer      ← src/generated-parser/sequenceLexer.js
  │  └─ sequenceParser     ← src/generated-parser/sequenceParser.js
  │
  ▼
ProgContext (ANTLR parse tree)
  │
  ├─▶ ToCollector           → Participants map (who exists, in what order)
  ├─▶ MessageCollector      → OwnableMessage list (for horizontal layout)
  ├─▶ FrameBuilder          → Frame tree (fragment nesting for borders)
  └─▶ OrderedParticipants   → IParticipantModel[] (display order)
```

## Key Files

| File | Role |
|---|---|
| `src/g4/sequenceLexer.g4` | ANTLR lexer grammar. Channels: `HIDDEN` (whitespace), `COMMENT_CHANNEL`, `MODIFIER_CHANNEL`. |
| `src/g4/sequenceParser.g4` | ANTLR parser grammar. Top rule: `prog → title? head? block`. |
| `src/generated-parser/` | ANTLR output — do not edit by hand. Regenerate with `bun antlr`. |
| `src/parser/index.js` | Entry point. `RootContext(code)` → `ProgContext`. Adds prototype methods: `getFormattedText()`, `getComment()`, `returnedValue()`. Collects errors via `SeqErrorListener`. |
| `src/parser/Participants.ts` | `Participant` model + `Participants` collection (Map). Tracks name, type, stereotype, label, color, emoji, width, groupId, positions. |
| `src/parser/ToCollector.js` | ANTLR listener. Walks parse tree → populates `Participants` from declarations, from/to mentions, `new` constructors, `ref` targets. |
| `src/parser/MessageCollector.ts` | ANTLR listener → `OwnableMessage[]` (from, to, signature, type enum). Used by horizontal coordinate solver. |
| `src/parser/FrameBuilder.ts` | ANTLR listener → nested `Frame` tree for fragments. Each frame: `{ type, left, right, children }`. Used to draw fragment borders. |
| `src/parser/OrderedParticipants.ts` | `OrderedParticipants(rootContext)` → `IParticipantModel[]` in insertion order. Injects `_STARTER_` when needed. |
| `src/parser/Messages/MessageContext.ts` | Extends ANTLR `MessageContext` with `Statements()` helper for nested statement access. |
| `src/parser/AntlrTypes.ts` | TypeScript types wrapping ANTLR context nodes. |
| `src/parser/Parser.types.ts` | Domain types: `Parameter`, `NamedParameter`, `Declaration`, `Signature`, `MessageContext`, `AsyncMessageContext`, `CreationContext`. |

## Public API

```typescript
// Parse code → root context
import { RootContext } from '@/parser'
const root = RootContext(code)   // returns ProgContext | null

// Get ordered participants
import { OrderedParticipants } from '@/parser/OrderedParticipants'
const participants = OrderedParticipants(root)  // IParticipantModel[]

// Collect all messages
import MessageCollector from '@/parser/MessageCollector'
const messages = new MessageCollector(root).AllMessages()  // OwnableMessage[]

// Build frame tree
import FrameBuilder from '@/parser/FrameBuilder'
const frame = new FrameBuilder(participantNames).getFrame(context)
```

## Key Types

```typescript
interface IParticipantModel {
  name: string
  left: number          // x position from coordinates
  label?: string        // display label
  type?: string         // @Actor, @Database, etc.
  stereotype?: string   // <<ServiceName>>
  color?: string        // #RRGGBB
  emoji?: string
  groupId?: string
  getDisplayName(): string
  hasIcon(): boolean
}

interface OwnableMessage {
  from: string
  to: string
  signature: string
  type: MessageType     // SyncMessage | AsyncMessage | CreationMessage | ReturnMessage
}

interface Frame {
  type: string          // "alt" | "loop" | "opt" | "par" | "section" | "critical" | "tcf" | "ref"
  left: string          // leftmost participant name
  right: string         // rightmost participant name
  children: Frame[]
}
```

## Grammar Overview

The lexer handles:
- Context-aware `title` keyword (only at start of file)
- `EVENT` mode for async message content (after `:`)
- `TITLE_MODE` for title content
- `DIVIDER` must start at column 0 (`==...`)
- Variable modifiers on `MODIFIER_CHANNEL` (const, readonly, static, await)
- Unicode identifiers via `\p{L}` pattern

The parser grammar `prog → title? head? block` where:
- `head` = participant/group declarations + optional `@Starter`
- `block` = one or more statements
- `stat` = message | asyncMessage | creation | return | divider | alt | loop | opt | par | section | critical | ref | tcf

## Regenerating the Parser

```bash
bun antlr
```

Requires Java and ANTLR4 jar. The generated files in `src/generated-parser/` are committed to the repo.
