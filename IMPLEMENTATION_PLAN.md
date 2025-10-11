# Calculate LifeLine Creation Message Position

## Goal
Replace browser DOM-based position calculation with programmatic height calculation for determining where lifelines should start when a participant is created via a creation message.

## Current State
- `LifeLine` component uses `getBoundingClientRect()` to find the position of creation messages
- Relies on browser layout engine, causing potential performance and timing issues

## Proposed Solution
Calculate creation message positions by accumulating heights as we traverse the component tree, similar to sequence numbering.

## Data Structure

### Jotai Store Atom
```typescript
// participantMessagesAtom structure
{
  'participantA': [
    { type: 'creation', top: 120 },
    { type: 'sync', top: 180 },
    { type: 'return', top: 220 }
  ],
  'participantB': [
    { type: 'async', top: 100 }
  ]
}
```

### Message Types
- `creation` - creation message
- `sync` - synchronous call
- `async` - asynchronous call
- `return` - return message

## Height Constants

| Element Type | Height | Notes |
|-------------|--------|-------|
| statement-container margin-top | 16px | `my-4` class on container |
| statement-container margin-bottom | 16px | `my-4` class on container |
| Comment line | 20px | Per line, inside interaction |
| Message (sync/async/return) | 16px | `min-h-[1em]` with leading-none |
| Message (creation) | 62px | Total height including container and occurrence |
| Self Invocation (sync) | 40px | 16px message + 24px SVG |
| Self Invocation (async) | 50px | 16px message + 34px SVG |
| Occurrence border | 0px | Border offset by margin |
| Fragment header | 25px | Measured from DOM |
| Fragment body | Dynamic | Based on content |
| Divider | TBD | Measure from code |

**Note**: Exact constants can be tuned later. The algorithm is what matters.

## Algorithm Flow

### 1. Height Accumulation (Top-Down)
```
1. Start with top = 0 at root
2. For each statement-container:
   a. statement-container top margin: top += 16px

   b. If has Comment (inside interaction):
      - height = lineCount * 20px
      - top += height

   c. If element is a Message (sync/async/creation/return):
      - Record { participantId, type, top: currentTop, sequence } in store
      - Message height contribution:
        * sync/async/return: top += 16px
        * creation: top += 62px
        * self-invocation sync: top += 40px
        * self-invocation async: top += 50px

      - If message has Occurrence (nested statements):
        * Occurrence border adds 0px (offset by margin)
        * Recursively process nested Block:
          - Each nested statement-container adds 16px top margin
          - Process comments, messages, etc. with updated top
        * top updated by all nested content

   d. If element is a Fragment (opt/alt/loop/par/etc):
      - Fragment header adds height (measure from CSS)
      - top += header height
      - Fragment body:
        * Recursively process nested statements
        * Each nested statement-container adds 16px top margin
        * top updated by all nested content
      - top += fragment border/margin

   e. If element is a Divider:
      - height = measure from CSS
      - top += height

   f. statement-container bottom margin: top += 16px (at end of container)
```

### 2. LifeLine Logic (Bottom-Up)
```
In LifeLine component:
1. Get all messages for this participant from store
2. Find first message (index 0)
3. If first message type === 'creation':
   - Set lifeline top = firstMessage.top + 40
4. Else:
   - Set lifeline top = PARTICIPANT_TOP_SPACE_FOR_GROUP (20px)
```

## Example Calculation

### DSL:
```
// comment line 1
// comment line 2
A.m1 { B.m2 }
```

### Height Accumulation:
1. top = 0
2. statement-container top margin: top += 16px → top = 16px
3. Comment (2 lines × 20px): top += 40px → top = 56px
4. A.m1 message: Record `{ participantId: 'A', type: 'sync', top: 56 }`, top += 16px → top = 72px
5. A.m1 occurrence border: top += 0px → remains top = 72px
6. Nested statement-container top margin: top += 16px → top = 88px
7. B.m2 message: Record `{ participantId: 'B', type: 'sync', top: 88 }`, top += 16px → top = 104px

### LifeLine for B:
- First message for B: `{ type: 'sync', top: 88 }`
- Since type !== 'creation': lifeline top = 20px (PARTICIPANT_TOP_SPACE_FOR_GROUP)

### DSL with Creation:
```
A.m1 { b = new B() }
```

1. top = 0
2. statement-container top margin: top += 16px → top = 16px
3. A.m1 message: Record `{ participantId: 'A', type: 'sync', top: 16 }`, top += 16px → top = 32px
4. A.m1 occurrence border: top += 0px → remains top = 32px
5. Nested statement-container top margin: top += 16px → top = 48px
6. b = new B() creation: Record `{ participantId: 'B', type: 'creation', top: 48 }`, top += 62px → top = 110px

### LifeLine for B:
- First message for B: `{ type: 'creation', top: 48 }`
- Since type === 'creation': lifeline top = 48 + 40 = 88px

### DSL with Fragment:
```
opt {
  A.m1 {
    b = new B()
  }
}
```

1. top = 0
2. Outer statement-container top margin: top += 16px → top = 16px
3. Fragment header: top += 25px → top = 41px
4. Inner statement-container top margin (in fragment body): top += 16px → top = 57px
5. A.m1 message: Record `{ participantId: 'A', type: 'sync', top: 57 }`, top += 16px → top = 73px
6. A.m1 occurrence border: top += 0px → remains top = 73px
7. Nested statement-container top margin (in occurrence): top += 16px → top = 89px
8. b = new B() creation: Record `{ participantId: 'B', type: 'creation', top: 89 }`, top += 62px → top = 151px

### LifeLine for B:
- First message for B: `{ type: 'creation', top: 89 }`
- Since type === 'creation': lifeline top = 89 + 40 = 129px

## Implementation Stages

### Stage 1: Store Setup
**Goal**: Create Jotai atom for storing participant messages
**Success Criteria**:
- Atom defined in Store.ts
- Type definitions for message records
**Tests**: Unit test for atom initialization
**Status**: Complete ✅

### Stage 2: Height Tracking Infrastructure
**Goal**: Add `top` prop threading through component tree
**Success Criteria**:
- All Statement components accept and pass `top` prop
- Height constants defined
**Tests**: Verify prop passing in component tests
**Status**: Complete ✅

### Stage 3: Message Recording
**Goal**: Record messages in store during rendering
**Success Criteria**:
- Each message type records its data
- Sequence numbers tracked correctly
**Tests**: E2E test verifying store contents for sample DSL
**Status**: Complete ✅

### Stage 4: LifeLine Integration
**Goal**: Update LifeLine to use calculated positions
**Success Criteria**:
- LifeLine reads from store instead of DOM
- Creation messages position lifelines correctly
- Non-creation messages use default top
**Tests**: Visual regression tests with Playwright
**Status**: Complete ✅

### Stage 5: Cleanup
**Goal**: Remove old DOM-based calculation code
**Success Criteria**:
- Remove getBoundingClientRect() calls
- Remove EventBus "participant_set_top" events
**Tests**: All existing tests pass
**Status**: Not Started

## Key Design Decisions

1. **Use Jotai Store**: Centralized state management, already in use
2. **Record All Messages**: Not just creation - allows future features and debugging
3. **Constants are Tunable**: Focus on algorithm correctness, not exact pixel values
4. **Top-Down Calculation**: Natural traversal order, simpler to reason about
5. **Component Responsibility**: Each component knows its own height contribution

## Benefits

1. **No DOM Measurement**: Eliminates getBoundingClientRect() calls
2. **Predictable**: Calculated positions, no layout timing issues
3. **Performance**: No forced reflows
4. **Debuggable**: All message positions in store
5. **Extensible**: Foundation for other position-based features

## Risks & Mitigation

**Risk**: Height constants don't match actual rendered heights
- *Mitigation*: Start with measured values, add visual regression tests

**Risk**: Complex nesting scenarios (fragments, etc.)
- *Mitigation*: Incremental implementation, test each nesting level

**Risk**: Dynamic content (comments with varying line heights)
- *Mitigation*: Use conservative fixed heights, adjust if needed
