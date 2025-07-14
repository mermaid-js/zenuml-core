# Layout Comparison Feature

This document explains how to use the real-time layout comparison feature that helps compare data calculated by the new Layout Calculator architecture with the old Coordinates-based architecture.

## Overview

During the migration from the old visitor-based architecture to the new domain model architecture, we've implemented a comparison tool that allows real-time comparison of layout calculations between:

- **Old Architecture**: `Coordinates` class using visitor pattern with multiple parse tree traversals
- **New Architecture**: `LayoutCalculator` class using domain model with single traversal

## How to Use

### Automatic Comparison (Default in Development)

In development mode, layout comparison is **enabled by default**. Every time a diagram renders, the comparison results are automatically logged to the browser console with:

- 🔍 Clear summary of differences
- ✅ Green checkmark if differences are acceptable (≤5px)
- ⚠️ Warning if significant differences are detected (>5px)
- 💡 Tip to use `LayoutComparison.visualize()` for visual overlay

### Manual Control

1. The debug panel appears automatically in development mode (bottom-right corner)
2. You can toggle comparison on/off using the checkbox
3. The comparison runs automatically whenever the diagram updates

### 3. View Comparison Results

The comparison shows:

- **Total Width**: Comparison of overall diagram width
- **Participant Positions**: X-coordinate positions of each participant
- **Participant Widths**: Width of each participant box
- **Message Positions**: Start and end points of messages

Differences are color-coded:
- 🟢 Green: Small differences (≤5px) - expected due to rounding
- 🔴 Red: Large differences (>5px) - may indicate issues

### 4. Visualize Differences

Click the "Visualize Differences" button to overlay visual markers on the diagram showing position differences.

## Console Access

You can also access the comparison tool from the browser console:

```javascript
// Quick way to run comparison (recommended)
compareLayouts()

// Manual methods:
// Enable comparison
LayoutComparison.enable()

// Disable comparison
LayoutComparison.disable()

// Force a comparison (if metrics are null)
LayoutComparison.forceCompare()

// Get latest metrics
LayoutComparison.getLatestMetrics()

// Show visual overlay
LayoutComparison.visualize()
```

### Troubleshooting

If `LayoutComparison.getLatestMetrics()` returns null after enabling:

1. **Use the helper function**: Run `compareLayouts()` in the console
2. **Force comparison**: Run `LayoutComparison.forceCompare()`
3. **Check if data exists**:
   ```javascript
   // Check if store has data
   __ZENUML_STORE__.get(__ZENUML_COORDINATES_ATOM__)
   __ZENUML_STORE__.get(__ZENUML_LAYOUT_ATOM__)
   ```

## What to Look For

1. **Position Differences**: Small differences (1-5px) are normal due to:
   - Different calculation methods
   - Rounding differences
   - Font metric variations

2. **Width Differences**: The new architecture may calculate widths slightly differently, especially for:
   - Participants with icons
   - Self-messages
   - Nested fragments

3. **Consistent Patterns**: Look for consistent differences across similar elements - this indicates systematic differences rather than bugs.

## Debugging Tips

1. If you see large differences (>10px), check:
   - Are participant names matching correctly between architectures?
   - Are message widths being calculated with the same constraints?
   - Are padding/margin values consistent?

2. Use the browser developer tools to inspect:
   - Console logs showing detailed comparison data
   - Element positions in the DOM
   - Computed styles

## Architecture Details

### Old Architecture (Coordinates.ts)
- Uses visitor pattern with `ParseTreeWalker`
- Multiple passes: `OrderedParticipants`, `AllMessages`
- Matrix-based positioning algorithm
- Caching for performance

### New Architecture (LayoutCalculator.ts)
- Single pass to build domain model
- Pure function layout calculation
- Direct iteration over structured data
- No external dependencies

## Future Work

Once the migration is complete and we've verified the new architecture produces equivalent results, the comparison feature and old architecture can be removed.