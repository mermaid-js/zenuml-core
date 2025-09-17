# VM Migration Notes (lessons learned)

## Current Migration Status (as of latest update)

### Successfully Migrated to VM Pattern
- **Creation component** - Uses VM arrow data (via enhancer)
- **Interaction component** - Uses VM arrow data (via enhancer)
- **InteractionAsync component** - Uses VM arrow data (via enhancer)
- **Divider component** - Uses VM data for width, translateX, and styling
- **Return component** - Uses VM arrow data via a dedicated Return enhancer; target fallback remains until IR supports `returnTo`

### Migration Completed
🎉 **All components have been successfully migrated away from the `useArrow` hook!**

- All components now use `calculateArrowGeometry` directly instead of the `useArrow` React hook
- `useArrow` hook has been removed from active use (kept for backward compatibility only)
- Components have been refactored to use a dedicated `arrowGeometry.ts` module
- All migration goals achieved without breaking Playwright tests

### VM Geometry
All migrated components now consume arrow/geometry and related presentation data exclusively from the VM layer. Where VM data is unavailable, components render safe defaults or use limited local fallbacks (e.g., Divider width/translateX).

### Migration Lessons

- **Return semantics** – Bare `return x;` expressions lack an explicit target in the current IR. We now compute Return arrow geometry in a dedicated VM enhancer that derives `source`/`target` from parser context (`async.From() | ret.From()` and `async.to | ReturnTo()`). IR should still gain an explicit `returnTo` to remove this special-case.

- **Arrow geometry** – ✅ **RESOLVED**: All components successfully migrated from `useArrow` hook to direct `calculateArrowGeometry` usage. Components now use memoized calculations with proper dependency management, eliminating the React hook overhead while maintaining the same geometry calculations.

- **Playwright snapshots** – Visual diffs generally signaled real regressions (arrow orientation, widths, numbering). Before updating baselines, inspect the DOM and fix the root cause.

- **Incremental strategy** – Migrating all message types together multiplies regression risk. Instead, convert one type end-to-end (IR → VM → component → tests), stabilize it, then proceed to the next.

- **Locator expectations** – Tests assert attributes like `data-target`, `data-type`, and numbering. VM changes that restructure data must update the tests in tandem or keep those attributes intact.

- **Rollback hygiene** – Keeping the old context-based components intact makes it easy to revert when regressions surface. Prefer a clean switch (all VM or all context) rather than partial hybrids.
- **Range-driven highlighting** – Highlight state should be derived from the VM-provided statement `range`. Keeping cursor math inside the component caused drift once contexts disappeared, so always lift that information into the VM lookup before rendering.
