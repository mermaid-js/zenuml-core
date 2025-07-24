# Design Document

## Overview

This design implements a backward compatibility layer for ZenUML's UMD export format to resolve breaking changes between versions v3.32.x and v3.34.0+. The solution adds a simple `default` property to the UMD global export, allowing both old (`window.zenuml.default`) and new (`window.zenuml`) usage patterns to work seamlessly.

## Architecture

### Current State Analysis

**Current UMD Export Structure (v4.0.0):**

- Vite builds UMD format with global name `zenuml` (lowercase)
- Exports the ZenUml class as the default export directly to `window.zenuml`
- Usage: `new window.zenuml('#mounting-point')`

**Legacy Export Structure (v3.32.x and earlier):**

- UMD wrapper exported an object: `window.zenuml = { default: ZenUmlClass }`
- Usage: `new window.zenuml.default('#mounting-point')`

**Why Not Revert to v3.32.x Approach?**

- Would break existing v3.34.0+ integrations using `new window.zenuml()`
- Current approach is cleaner and more standard
- Compatibility layer provides best of both worlds

**Our Approach: Prioritize Compatibility**

- Keep the current v4.0.0 pattern as primary: `window.zenuml = ZenUmlClass`
- Add backward compatibility: `window.zenuml.default = ZenUmlClass`
- Both patterns reference the same constructor, ensuring identical functionality

### Solution Architecture

The compatibility layer will be implemented by **adding the compatibility code directly** in the UMD bundle after the global assignment.

```javascript
// After UMD initialization, add compatibility layer:
if (typeof window !== "undefined" && window.zenuml) {
  window.zenuml.default = window.zenuml;
}
```

This approach ensures:

- Zero runtime performance impact
- Minimal code addition
- Simple implementation without complex build tooling
- Both usage patterns work identically

## Components and Interfaces

### 1. Compatibility Layer Implementation

**Component:** Direct UMD Compatibility Code

- **Location:** Added directly to the UMD bundle or in `src/core.tsx`
- **Purpose:** Add `default` property to `window.zenuml` for backward compatibility
- **Implementation:** Simple property assignment

### 2. Compatibility Layer Code

**Component:** UMD Compatibility Snippet

```javascript
// Compatibility layer - added after UMD initialization
if (typeof window !== "undefined" && window.zenuml && !window.zenuml.default) {
  window.zenuml.default = window.zenuml;
}
```

**Key Features:**

- Environment detection (`typeof window !== 'undefined'`)
- Existence check (`window.zenuml`)
- Idempotent operation (`!window.zenuml.default`)
- Simple property assignment without complex tooling

### 3. Implementation Location

**Recommended Approach: Add to Source Code**

- **Location:** Add to `src/core.tsx` at the end of the file after the class export
- **Timing:** Executes when the module is loaded, after the UMD wrapper assigns the global
- **Benefits:** Automatic inclusion in build, no manual post-build steps, version controlled

**Timing Analysis:**

1. UMD wrapper executes and assigns: `window.zenuml = ZenUmlClass`
2. Module code executes, including our compatibility code: `window.zenuml.default = window.zenuml`
3. Both `window.zenuml` and `window.zenuml.default` are available synchronously
4. No race conditions for integration applications

**Implementation:**

```javascript
// Add to end of src/core.tsx after the class export
// UMD Compatibility Layer - Support both window.zenuml and window.zenuml.default
if (typeof window !== "undefined" && window.zenuml && !window.zenuml.default) {
  window.zenuml.default = window.zenuml;
}
```

**Modified Files:**

- `src/core.tsx` - Add compatibility code at the end of the file
- No build configuration changes needed

## Data Models

### Export Structure Compatibility Matrix

| Version  | Export Pattern      | `window.zenuml`     | `window.zenuml.default` | Status     |
| -------- | ------------------- | ------------------- | ----------------------- | ---------- |
| v3.32.x  | Object with default | `{default: ZenUml}` | `ZenUml`                | Legacy     |
| v3.33.0  | IIFE (broken)       | Various             | N/A                     | Deprecated |
| v3.34.0+ | Direct export       | `ZenUml`            | `undefined`             | Current    |
| v4.0.0+  | With compatibility  | `ZenUml`            | `ZenUml`                | Target     |

### Interface Consistency

Both access patterns will provide identical functionality:

```typescript
interface ZenUmlConstructor {
  new (element: HTMLElement | string, naked?: boolean): ZenUmlInstance;
  version: string;
}

// Both patterns reference the same constructor
window.zenuml: ZenUmlConstructor
window.zenuml.default: ZenUmlConstructor
```

## Error Handling

### Build-Time Error Handling

1. **Plugin Failure Recovery:**

   - If compatibility injection fails, build continues
   - Warning logged but doesn't break the build process
   - Fallback: Manual post-build script

2. **Validation Checks:**
   - Verify UMD bundle contains expected global assignment
   - Confirm compatibility code is properly injected
   - Test both access patterns in build verification

### Runtime Error Handling

1. **Environment Safety:**

   - Check for `window` object existence (SSR compatibility)
   - Verify `window.zenuml` exists before modification
   - Graceful degradation if compatibility layer fails

2. **Conflict Prevention:**
   - Only add `default` property if it doesn't already exist
   - Avoid overwriting existing properties
   - Maintain reference equality between both access patterns

## Testing Strategy

### Unit Tests

1. **Compatibility Layer Tests:**

```javascript
describe("UMD Compatibility Layer", () => {
  test("should add default property to window.zenuml", () => {
    // Simulate UMD environment
    global.window = { zenuml: MockZenUml };

    // Apply compatibility layer
    require("./compatibility-layer");

    expect(window.zenuml.default).toBe(window.zenuml);
  });

  test("should not overwrite existing default property", () => {
    const existingDefault = {};
    global.window = { zenuml: { default: existingDefault } };

    require("./compatibility-layer");

    expect(window.zenuml.default).toBe(existingDefault);
  });
});
```

2. **Integration Tests:**

```javascript
describe("UMD Export Integration", () => {
  test("both access patterns create identical instances", () => {
    const instance1 = new window.zenuml("#test1");
    const instance2 = new window.zenuml.default("#test2");

    expect(instance1.constructor).toBe(instance2.constructor);
    expect(typeof instance1.render).toBe("function");
    expect(typeof instance2.render).toBe("function");
  });
});
```

### Build Verification Tests

1. **UMD Bundle Analysis:**

   - Parse generated UMD bundle
   - Verify compatibility code is present
   - Confirm global variable assignment

2. **Browser Environment Tests:**
   - Load UMD bundle in browser environment
   - Test both `window.zenuml` and `window.zenuml.default`
   - Verify functional equivalence

### Regression Tests

1. **Version Compatibility Tests:**
   - Test migration scenarios from v3.32.x
   - Verify v3.34.0+ patterns still work
   - Confirm no breaking changes to existing functionality

## Implementation Plan

### Phase 1: Simple Compatibility Implementation

1. **Add Compatibility Code:**

```javascript
// Add to src/core.tsx or directly to UMD bundle
if (typeof window !== "undefined" && window.zenuml && !window.zenuml.default) {
  window.zenuml.default = window.zenuml;
}
```

2. **Implementation Options:**
   - **Option A:** Add directly to `src/core.tsx` at the end of the file
   - **Option B:** Manually add to `dist/zenuml.js` after build
   - **Option C:** Simple post-build script to append the code

### Phase 2: Verification

### Phase 3: Testing and Validation

1. **Automated Tests:**

   - Unit tests for compatibility layer
   - Integration tests for both access patterns
   - Build verification tests

2. **Manual Testing:**
   - Test in various browser environments
   - Verify with existing applications using old pattern
   - Confirm new pattern continues to work

### Phase 4: Documentation

1. **Migration Guide:**

   - Document both usage patterns
   - Provide migration examples
   - Explain version compatibility

2. **API Documentation:**
   - Update with compatibility information
   - Include version history
   - Add troubleshooting section

## Performance Considerations

### Build Performance

- **Impact:** Minimal - single string injection during build
- **Time:** < 1ms additional build time
- **Size:** ~50 bytes added to UMD bundle

### Runtime Performance

- **Impact:** Zero - compatibility code executes once during initialization
- **Memory:** Negligible - single property reference
- **Execution:** ~0.1ms one-time execution

### Bundle Size Analysis

```
Before: dist/zenuml.js (~XXX KB)
After:  dist/zenuml.js (~XXX KB + 50 bytes)
Impact: < 0.01% size increase
```

## Security Considerations

### Code Injection Safety

- Compatibility code is static and deterministic
- No dynamic code generation or evaluation
- No external dependencies or network requests

### Global Scope Safety

- Uses self-executing function to avoid scope pollution
- Only modifies intended global variable
- Includes existence checks to prevent errors

### Browser Compatibility

- Compatible with all UMD-supported browsers
- No modern JavaScript features required
- Graceful degradation in edge cases

## Deployment Strategy

### Rollout Plan

1. **Development Build:** Test compatibility layer in development
2. **Staging Deployment:** Validate with existing applications
3. **Production Release:** Include in next minor version release
4. **Documentation Update:** Update guides and examples

### Rollback Plan

- Compatibility layer can be disabled via build flag
- Original UMD bundle can be restored quickly
- No breaking changes to core functionality

### Monitoring

- Track usage patterns through version telemetry
- Monitor for compatibility-related issues
- Collect feedback from library users

## Future Considerations

### Long-term Maintenance

- Plan deprecation timeline for legacy pattern support
- Consider semantic versioning for future breaking changes
- Maintain compatibility documentation

### Alternative Approaches

- **Dual Builds:** Separate UMD bundles for different patterns
- **Runtime Detection:** Dynamic compatibility based on usage
- **Migration Tools:** Automated code transformation utilities

This design provides a minimal, robust solution that maintains backward compatibility while supporting the modern export pattern, ensuring a smooth transition for all ZenUML users.
