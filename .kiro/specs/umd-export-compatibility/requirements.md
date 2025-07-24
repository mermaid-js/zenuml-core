# Requirements Document

## Introduction

Fix the breaking changes in ZenUML library's UMD export format that occurred between versions v3.32.x and v3.34.0+. The library changed from exporting `window.zenuml` as an object containing exports to exporting it as the default export itself, breaking existing integrations. This feature will implement a compatibility layer to support both usage patterns and provide clear migration paths.

## Requirements

### Requirement 1

**User Story:** As a developer using ZenUML v3.32.x or earlier, I want my existing code to continue working after upgrading to v3.34.0+, so that I don't have to immediately refactor my integration.

#### Acceptance Criteria

1. WHEN existing code uses `new window.zenuml.default('#mounting-point')` THEN the system SHALL execute successfully
2. WHEN the compatibility layer is present THEN the system SHALL not break the new v3.34+ usage pattern

### Requirement 2

**User Story:** As a developer upgrading to ZenUML v3.34.0+, I want to use the new simplified export format, so that I can write cleaner code with the updated API.

#### Acceptance Criteria

1. WHEN using the new export format THEN the system SHALL support `new window.zenuml('#mounting-point')` syntax
2. WHEN migrating from old to new syntax THEN the system SHALL provide identical functionality

### Requirement 3

**User Story:** As a library maintainer, I want to implement a compatibility layer that supports both export patterns, so that users can migrate at their own pace without breaking changes.

#### Acceptance Criteria

1. WHEN the UMD wrapper is initialized THEN the system SHALL add a `default` property to `window.zenuml` pointing to itself
2. WHEN the compatibility layer is present THEN the system SHALL ensure both `window.zenuml` and `window.zenuml.default` reference the same constructor
3. WHEN the library is loaded THEN the system SHALL maintain all existing functionality regardless of access pattern

### Requirement 4

**User Story:** As a developer integrating ZenUML, I want clear documentation about the export changes, so that I can understand which version supports which usage pattern.

#### Acceptance Criteria

1. WHEN reviewing documentation THEN the system SHALL provide clear examples for both usage patterns
2. WHEN upgrading between versions THEN the system SHALL include migration examples in documentation

### Requirement 5

**User Story:** As a library user, I want the compatibility fix to be lightweight and non-intrusive, so that it doesn't impact performance or add unnecessary complexity.

#### Acceptance Criteria

1. WHEN the compatibility layer is loaded THEN the system SHALL add minimal overhead using simple property assignment
2. WHEN the library initializes THEN the system SHALL not modify core functionality or performance characteristics