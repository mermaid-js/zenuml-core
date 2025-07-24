# Implementation Plan

- [ ] 1. Implement UMD compatibility layer in core module
  - Add compatibility code to `src/core.tsx` at the end of the file after the class export
  - Ensure the code checks for window object existence and adds default property
  - Verify the compatibility code is idempotent (doesn't overwrite existing default)
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 2. Create unit tests for compatibility layer
  - Write tests to verify `window.zenuml.default` is added when `window.zenuml` exists
  - Test that existing `default` property is not overwritten
  - Test environment safety (SSR compatibility with no window object)
  - Verify both access patterns reference the same constructor
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [ ] 3. Create integration tests for both usage patterns
  - Test that `new window.zenuml('#test')` works correctly
  - Test that `new window.zenuml.default('#test')` works correctly
  - Verify both patterns create functionally identical instances
  - Test that both instances have the same methods and properties
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [ ] 4. Build and verify UMD bundle compatibility
  - Build the library with the compatibility layer included
  - Load the UMD bundle in a browser environment
  - Manually test both `window.zenuml` and `window.zenuml.default` patterns
  - Verify no timing issues or race conditions exist
  - _Requirements: 3.1, 3.2, 3.3, 5.1, 5.2_

- [ ] 5. Update documentation with migration examples
  - Document both usage patterns in README or API docs
  - Provide clear migration examples from v3.32.x to v4.0.0+
  - Include version compatibility matrix
  - Add troubleshooting section for common issues
  - _Requirements: 4.1, 4.2_

- [ ] 6. Create regression tests for version compatibility
  - Test migration scenarios from v3.32.x usage patterns
  - Verify v3.34.0+ patterns continue to work unchanged
  - Confirm no breaking changes to existing functionality
  - Test edge cases and error conditions
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 5.1, 5.2_