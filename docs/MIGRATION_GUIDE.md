# Architecture Migration Guide

## Overview

We are migrating from a parse-tree-centric architecture to a domain-model-based architecture. This guide explains how to gradually migrate components.

## Current Architecture Problems

1. **God Object**: Context objects contain entire parse tree
2. **Multiple Traversals**: Same tree walked multiple times by different visitors
3. **Tight Coupling**: Components depend on ANTLR grammar structure
4. **Mixed Concerns**: Parsing, domain logic, and rendering are intertwined

## New Architecture Benefits

1. **Clear Separation**: Parse → Domain Model → Layout → Render
2. **Single Traversal**: Parse tree walked once to build domain model
3. **Type Safety**: Strongly typed domain models instead of any contexts
4. **Testability**: Each layer can be tested independently

## Migration Strategy

### Phase 1: Use New Models Alongside Old Code ✅

Already completed:
- Domain models created (`SequenceDiagram`, `DiagramLayout`)
- Domain model builder created
- Layout calculator created
- Bridge atoms created in `DomainModelStore`

### Phase 2: Migrate Read-Only Components (Low Risk)

Start with components that only read data:

#### Example: Migrating a Participant Component

**Before:**
```typescript
const ParticipantComponent = ({ context }) => {
  const participant = context.participant();
  const name = participant.name().getText();
  const type = participant.participantType()?.getText();
  // ... parsing logic mixed with rendering
};
```

**After:**
```typescript
const ParticipantComponent = ({ participantId }) => {
  const domainModel = useAtomValue(domainModelAtom);
  const participant = domainModel?.participants.get(participantId);
  
  if (!participant) return null;
  
  // Clean rendering logic
  return <div>{participant.label || participant.name}</div>;
};
```

### Phase 3: Migrate Fragment Components

Fragments are good candidates because they're complex and would benefit most:

**Before:**
```typescript
const FragmentAlt = ({ context, origin }) => {
  const alt = context.alt();
  const ifBlock = alt?.ifBlock();
  const elseBlock = alt?.elseBlock();
  // ... lots of navigation and extraction
  
  const { fragmentStyle, paddingLeft } = useFragmentData(context, origin);
};
```

**After:**
```typescript
const FragmentAlt = ({ fragmentId }) => {
  const layout = useAtomValue(diagramLayoutAtom);
  const domainModel = useAtomValue(domainModelAtom);
  
  const fragment = domainModel?.fragments.find(f => f.id === fragmentId);
  const fragmentLayout = layout?.fragments.find(f => f.fragmentId === fragmentId);
  
  if (!fragment || !fragmentLayout) return null;
  
  // Pure rendering based on layout data
  return (
    <div style={{
      position: 'absolute',
      left: fragmentLayout.bounds.x,
      top: fragmentLayout.bounds.y,
      width: fragmentLayout.bounds.width,
      height: fragmentLayout.bounds.height
    }}>
      {/* Render sections */}
    </div>
  );
};
```

### Phase 4: Migrate Message/Interaction Components

Similar approach for messages:

**Before:**
```typescript
const useArrow = ({ context, origin, source, target }) => {
  // Complex calculation involving context navigation
};
```

**After:**
```typescript
const InteractionComponent = ({ interactionId }) => {
  const layout = useAtomValue(diagramLayoutAtom);
  const interaction = layout?.interactions.find(i => i.interactionId === interactionId);
  
  if (!interaction) return null;
  
  // Just render based on pre-calculated layout
  return <Arrow layout={interaction} />;
};
```

### Phase 5: Replace Visitor Usage

Gradually remove visitor patterns:

1. **Remove MessageCollector** → Use `domainModel.interactions`
2. **Remove ToCollector** → Use `domainModel.participants`
3. **Remove FrameBuilder** → Use `domainModel.fragments`
4. **Remove ChildFragmentDetector** → Calculate from domain model

### Phase 6: Update Root Components

Finally, update the root rendering:

**Before:**
```typescript
const SeqDiagram = () => {
  const rootContext = useAtomValue(rootContextAtom);
  // ... lots of context navigation
};
```

**After:**
```typescript
const SeqDiagram = () => {
  const layout = useAtomValue(diagramLayoutAtom);
  
  if (!layout) return null;
  
  return <DiagramRenderer layout={layout} />;
};
```

## Testing Strategy

1. **Parallel Testing**: Run old and new components side by side
2. **Visual Regression**: Ensure output remains the same
3. **Performance Testing**: Measure improvement in render times
4. **Unit Tests**: Test each layer independently

## Rollback Plan

The bridge layer allows instant rollback:
- Keep old components available
- Use feature flags to switch between old/new
- Gradually increase usage of new components

## Success Metrics

1. **Code Reduction**: ~50% less code in components
2. **Performance**: Single parse tree traversal instead of 5-6
3. **Type Safety**: 100% typed instead of `any` contexts
4. **Testability**: Pure functions instead of side effects

## Next Steps

1. Start with one simple component (e.g., Divider)
2. Measure improvement
3. Continue with more complex components
4. Remove old code once all components migrated