# Code Analysis: Logic Duplication in useFragmentData.ts

## File Analyzed

`src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/Fragment/useFragmentData.ts`

## Summary

Found extensive logic duplication within the same file where the `useFragmentData` hook reimplements calculations that are already available as exported functions.

## Duplicated Logic Identified

### 1. Left Participant Detection

**Original Implementation:**

- Lines 11-15: `getLeftParticipant` function

```typescript
export const getLeftParticipant = (context: any) => {
  const allParticipants = store.get(coordinatesAtom).orderedParticipantNames();
  const localParticipants = getLocalParticipantNames(context);
  return allParticipants.find((p) => localParticipants.includes(p));
};
```

**Duplicated in useFragmentData:**

- Lines 126-129

```typescript
const leftParticipant =
  allParticipants.find((p) => localParticipants.includes(p)) || "";
```

### 2. Border Calculation

**Original Implementation:**

- Lines 17-22: `getBorder` function

```typescript
export const getBorder = (context: any) => {
  const allParticipants = store.get(coordinatesAtom).orderedParticipantNames();
  const frameBuilder = new FrameBuilder(allParticipants);
  const frame = frameBuilder.getFrame(context);
  return FrameBorder(frame);
};
```

**Duplicated in useFragmentData:**

- Lines 131-133

```typescript
const frameBuilder = new FrameBuilder(allParticipants);
const frame = frameBuilder.getFrame(context);
const border = FrameBorder(frame);
```

### 3. Offset X Calculation

**Original Implementation:**

- Lines 76-96: `getOffsetX` function

```typescript
export const getOffsetX = (context: any, origin: string) => {
  const coordinates = store.get(coordinatesAtom);
  const leftParticipant = getLeftParticipant(context) || "";
  const halfLeftParticipant = coordinates.half(leftParticipant);
  const selfInvocationAdjustment = getSelfInvocationWidthAdjustment(
    context,
    origin,
    leftParticipant,
  );

  return (
    (origin ? coordinates.distance(leftParticipant, origin) : 0) +
    getBorder(context).left +
    halfLeftParticipant +
    selfInvocationAdjustment
  );
};
```

**Duplicated in useFragmentData:**

- Lines 146-150

```typescript
const offsetX =
  (origin ? coordinates.distance(leftParticipant, origin) : 0) +
  getBorder(context).left +
  halfLeftParticipant +
  selfInvocationAdjustment;
```

### 4. Self-Invocation Width Adjustment

**Function Implementation:**

- Lines 29-74: `getSelfInvocationWidthAdjustment` function

**Duplicated Call:**

- Lines 137-141: Same function call with identical parameters in `useFragmentData`

## Constants

- `SELF_INVOCATION_VISUAL_WIDTH = 7` (line 71)
- Comment suggests this 7px value might be used elsewhere but appears unique to this file

## Impact

1. **Code Maintenance**: Changes to calculation logic need to be made in multiple places
2. **Performance**: Redundant calculations being performed
3. **Readability**: Makes the code harder to understand and maintain
4. **Bug Risk**: Logic can drift between the duplicated implementations

## Recommendations

1. **Remove duplication in useFragmentData**: Use the existing exported functions instead of reimplementing the logic
2. **Refactor useFragmentData** to call:
   - `getLeftParticipant(context)`
   - `getBorder(context)`
   - `getOffsetX(context, origin)`
3. **Extract constants**: Consider moving `SELF_INVOCATION_VISUAL_WIDTH` to a constants file if used elsewhere
4. **Add unit tests**: Ensure the refactored code maintains the same behavior

## Files to Investigate Further

Based on grep results, these files may contain related self-invocation logic:

- `src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/InteractionAsync/SelfInvocationAsync/SelfInvocationAsync.tsx`
- `src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/Interaction/SelfInvocation/SelfInvocation.tsx`
