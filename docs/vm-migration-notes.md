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

### Outstanding

- Message primitive (`Message/index.tsx`) still references parser context for editability and label range fallback. Plan:
  - Add `canEditLabel` to `MessageVM` (encodes creation validity and type-based editability) and consume it in `Message`.
  - Pass `labelRangeOverride={vm.labelRange ?? null}` and `onMessageClickOverride` from parents using `vm.codeRange`.
  - Remove `labelRangeOfMessage` and `context.isParamValid()` from `Message`; remove parser-based click wiring.
  - Acceptance: `Message` has no parser imports or context reads; editing and clicks rely solely on VM props.

- SelfInvocation components
  - `Interaction/SelfInvocation` still uses parser helpers (`signatureOf`, `labelRangeOfMessage`) and passes parser `context` into click handlers.
  - Plan: treat self-invocations as a view of `MessageVM` when `isSelf === true`.
    - Pass `labelRangeOverride={vm.labelRange}` and `labelText={vm.signature}`; click uses `vm.codeRange`.
    - Remove parser imports and the `context` prop from SelfInvocation.
  - `InteractionAsync/SelfInvocationAsync` already accepts `labelText` and `labelRange` props; just thread VM props consistently.

- Fragment labels
  - `FragmentRef` and `ConditionLabel` still use parser helpers (`formattedTextOf`, `labelRangeOfRef/Condition`).
  - Plan: introduce minimal VMs for fragment labels (RefVM, ConditionVM) and pass them down; remove parser accesses from UI.

- Lifeline group metadata
  - `LifeLineLayer`/`LifeLineGroup` use parser helpers to enumerate groups and read group names.
  - Plan: extend Participants IR or provide a small Group VM that maps group contexts to participant name arrays and label text; render purely from VM and coordinates.

- Style panel click wiring
  - `StylePanel` sets `onMessageClickAtom` with `(context, element)` and uses `offsetRangeOf(context)`.
  - Plan: change the click contract to pass `CodeRange` (from VM) and the element; update Interaction/Creation/Return to pass `vm.codeRange`.

- Fallbacks in message components
  - `Interaction` still falls back to `signatureOf(context)`; `Creation` and `Return` fall back to parser for `codeRange` or assignee text.
  - Plan: rely solely on VM fields (`signature`, `codeRange`, creation assignment pieces) and remove parser fallbacks once VM is guaranteed present at all call sites.
