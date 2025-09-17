# VM Migration Notes (lessons learned)

## Current Migration Status (as of latest update)

### Successfully Migrated to VM Pattern
- **Creation component** - Uses VM arrow data with fallback values and comprehensive parity checking
- **Interaction component** - Uses VM arrow data with fallback values and comprehensive parity checking
- **InteractionAsync component** - Already uses VM arrow data
- **Divider component** - Uses VM data for width, translateX, and styling with comprehensive parity checking

### Partially Migrated
- **Return component** - Still uses `useArrow` directly due to Playwright test failures
  - VM is passed and used for metadata (signature, source, target)
  - Arrow geometry still computed with `useArrow`
  - Has parity check to compare VM arrow data with `useArrow` results

### Parity Checking Implementation
All migrated components now include comprehensive parity checking that:
- Compares VM-provided values against fallback calculations
- Logs warnings when mismatches exceed tolerance (0.1px for numeric values)
- Logs success messages with ✓ when values match within tolerance
- Includes detailed diagnostic information for debugging mismatches
- Covers all geometric properties (translateX, interactionWidth, rightToLeft, layer counts)
- Includes styling validation for Divider component

### Migration Lessons

- **Return semantics** – Bare `return x;` expressions lack an explicit target in the current IR. When the VM assumes `data-to`/`target`, the renderer creates a self-message loop. Any VM rework must either extend the IR with a `returnTo` concept or retain a parser-context fallback to distinguish plain returns.

- **Arrow geometry** – Components such as Interaction, Creation, and Return depend heavily on `useArrow` for both visuals and data attributes. Moving that logic into the VM means tracking statement context, layer counts, and fallback geometry precisely. Until that support exists, either compute arrow metrics in a selector or leave the component context-driven.

- **Playwright snapshots** – Visual diffs generally signaled real regressions (arrow orientation, widths, numbering). Before updating baselines, inspect the DOM and fix the root cause.

- **Incremental strategy** – Migrating all message types together multiplies regression risk. Instead, convert one type end-to-end (IR → VM → component → tests), stabilize it, then proceed to the next.

- **Locator expectations** – Tests assert attributes like `data-target`, `data-type`, and numbering. VM changes that restructure data must update the tests in tandem or keep those attributes intact.

- **Rollback hygiene** – Keeping the old context-based components intact makes it easy to revert when regressions surface. Prefer a clean switch (all VM or all context) rather than partial hybrids.
- **Range-driven highlighting** – Highlight state should be derived from the VM-provided statement `range`. Keeping cursor math inside the component caused drift once contexts disappeared, so always lift that information into the VM lookup before rendering.
