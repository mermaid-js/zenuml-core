# Fragment Component Migration Template

This template provides a step-by-step guide for migrating fragment components to the new architecture with dual-mode rendering.

## Prerequisites

1. ✅ Domain model supports the fragment type (in `DomainModelBuilder.ts`)
2. ✅ Layout calculator handles the fragment type (in `LayoutCalculator.ts`) 
3. ✅ Context mapping stores fragment context (in `DomainModelBuilder.ts`)
4. ✅ Statement component passes layoutData to fragment (in `Statement.tsx`)

## Migration Steps

### Step 1: Update Imports and Props

Add these imports to the fragment component:

```typescript
import { FragmentLayout } from "@/domain/models/DiagramLayout";
import { useState } from "react";
```

Add `layoutData` prop to the component interface:

```typescript
export const FragmentXxx = (props: {
  context: any;
  origin: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
  layoutData?: FragmentLayout;  // ADD THIS
}) => {
```

### Step 2: Hook Order Management

Replace the existing hook structure with this pattern:

```typescript
}) => {
  // State for collapse functionality (always call hooks first)
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => setCollapsed(prev => !prev);

  // Always call parsing logic to maintain hook order
  const fragmentContext = props.context.xxxFragment(); // Replace with actual method
  // ... other parsing logic
  
  const {
    collapsed: oldCollapsed,
    toggleCollapse: oldToggleCollapse,
    paddingLeft,
    fragmentStyle,
    border,
    leftParticipant,
  } = useFragmentData(props.context, props.origin);

  // Determine which rendering approach to use
  const useNewArchitecture = false; // Temporarily disabled until hook issue is resolved
  console.log('[FragmentXxx] Using architecture:', useNewArchitecture ? 'NEW' : 'OLD', 'layoutData:', props.layoutData);
```

### Step 3: Dual-Mode Rendering Structure

Use this single return statement pattern:

```typescript
  // Single return statement to avoid hook order issues
  return useNewArchitecture ? (
    // NEW ARCHITECTURE RENDERING
    <div
      data-origin={props.origin}
      data-left-participant={props.origin}
      className={cn(
        "group fragment fragment-xxx xxx border-skin-fragment rounded",
        props.className,
      )}
      style={{
        transform: props.layoutData!.transform,
        width: `${props.layoutData!.bounds.width}px`,
        minWidth: `${props.layoutData!.bounds.width}px`,
      }}
    >
      {/* NEW ARCHITECTURE CONTENT */}
      {props.layoutData!.comment && (
        <Comment comment={props.layoutData!.comment} commentObj={props.commentObj} />
      )}
      
      <div className="header bg-skin-fragment-header text-skin-fragment-header leading-4 rounded-t relative">
        <Numbering number={props.number} />
        <div className="name font-semibold p-1 border-b">
          <label className="p-0 flex items-center gap-0.5">
            <Icon name="xxx-fragment" />
            <CollapseButton
              label="Xxx"
              collapsed={collapsed}
              onClick={toggleCollapse}
              style={props.commentObj?.messageStyle}
              className={cn(props.commentObj?.messageClassNames)}
            />
          </label>
        </div>
      </div>

      <div className={collapsed ? "hidden" : "block"}>
        {/* Render sections based on layout data */}
        {props.layoutData!.sections.map((section, index) => (
          <div key={index} className="segment">
            {section.condition && (
              <div className="text-skin-fragment flex">
                <label>[</label>
                <label className="bg-skin-frame opacity-65 condition px-1">
                  {section.condition}
                </label>
                <label>]</label>
              </div>
            )}
            {section.label && (
              <div className="text-skin-fragment">
                <label className="p-1">[{section.label}]</label>
              </div>
            )}
            {/* Note: In full implementation, we'd render block content here */}
            <div style={{ paddingLeft: `${props.layoutData!.paddingLeft}px` }}>
              {/* Block content would go here */}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    // OLD ARCHITECTURE RENDERING (fallback)
    // ... keep existing implementation but update hook references
```

### Step 4: Update Old Implementation References

In the old architecture section, update these references:
- `collapsed` → `oldCollapsed`
- `toggleCollapse` → `oldToggleCollapse`
- Make sure `data-origin={props.origin}` (not just `origin`)

### Step 5: Update Statement Component

Add context mapping in `Statement.tsx`:

```typescript
case Boolean(props.context.xxxFragment()):
  const xxxContext = props.context.xxxFragment();
  const xxxLayoutData = findFragmentLayout(xxxContext);
  console.log('[Statement] Xxx fragment - context:', xxxContext, 'layoutData:', xxxLayoutData);
  return <FragmentXxx {...subProps} layoutData={xxxLayoutData} />;
```

## Completed Examples

- ✅ **FragmentAlt**: Complex multi-section fragment with if/elseif/else
- ✅ **FragmentOpt**: Simple single-section fragment with condition
- ✅ **FragmentLoop**: Single-section fragment with condition

## Remaining Components to Migrate

- **FragmentPar**: Parallel sections
- **FragmentCritical**: Critical section
- **FragmentSection**: Generic section
- **FragmentTryCatchFinally**: Try-catch-finally blocks
- **FragmentRef**: Reference fragments

## Notes

1. **Hook Order**: Critical to call all hooks before any conditional logic
2. **Single Return**: Use ternary operator instead of early returns
3. **Temporarily Disabled**: New architecture is disabled until React hook issues are resolved
4. **Context Mapping**: Enables proper lookup of fragment layouts
5. **Backward Compatibility**: Old implementation always works as fallback

## Testing

After migration:
1. Build should succeed without errors
2. Component should render using old architecture (for now)
3. Console logs should show layout data being passed (even if null)
4. No React hook order errors should occur

## Activation

Once hook issues are resolved:
1. Change `useNewArchitecture = props.layoutData != null`
2. Enable atom usage in Statement component
3. Test new architecture rendering
4. Verify layout data is properly used