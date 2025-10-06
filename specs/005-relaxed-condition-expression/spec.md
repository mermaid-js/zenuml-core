# Feature Specification: Relaxed Condition Expressions for Control Flow Statements

**Feature Branch**: `005-relaxed-condition-expression`
**Created**: 2025-10-06
**Status**: Complete
**Input**: User description: "@src/g4/sequenceParser.g4 . currently you cannot write `loop(streaming response)` or `if(has more item)`. I want to allow it. I also want to add support of `par (some condition)` and `opt (some condition)`."

## Current State Analysis

After reviewing the parser grammar and lexer, the actual current state is:
- **`if` statement**: ⚠️ Supports expressions BUT NOT plain multi-word text
  - ✅ Works: `if(x>0)`, `if(count(items) > 0)`, `if("has more items")`
  - ❌ Does NOT work: `if(has more items)` - multiple IDs without operators is invalid
- **`loop/while` statement**: ⚠️ Same limitations as `if`
  - ✅ Works: `loop(i<10)`, `loop("streaming response")`
  - ❌ Does NOT work: `loop(streaming response)` - multiple IDs without operators is invalid
- **`par` statement**: ❌ NO expression support (only `par {}`)
- **`opt` statement**: ❌ NO expression support (only `opt {}`)
- **`critical` statement**: ⚠️ LIMITED to atom expressions only

The user's request reveals two needs:
1. **Relaxed text expressions**: Allow plain multi-word text without quotes in conditions (e.g., `if(has more items)`) by supporting `ID*` sequences
2. **Par/Opt/Critical support**: Add expression support to `par`, `opt`, and `critical` statements

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a ZenUML diagram author, I want to write natural language conditions in control flow statements without needing quotes, and I want to add condition support to `par` and `opt` statements, so that I can create more readable and self-documenting sequence diagrams that better express business logic in plain language.

### Acceptance Scenarios
1. **Given** a ZenUML diagram definition, **When** the user writes `loop(streaming response)` without quotes, **Then** the diagram renders a loop block with "streaming response" displayed as the condition
2. **Given** a ZenUML diagram definition, **When** the user writes `if(has more items)` without quotes, **Then** the diagram renders an if block with "has more items" displayed as the condition
3. **Given** a ZenUML diagram definition, **When** the user writes `par(concurrent processing)`, **Then** the diagram renders a parallel block with "concurrent processing" displayed as the condition
4. **Given** a ZenUML diagram definition, **When** the user writes `opt(user is authenticated)`, **Then** the diagram renders an optional block with "user is authenticated" displayed as the condition
5. **Given** existing diagrams using `par {}` without expressions, **When** the new feature is deployed, **Then** all existing diagrams continue to render correctly without breaking
6. **Given** existing diagrams using `opt {}` without expressions, **When** the new feature is deployed, **Then** all existing diagrams continue to render correctly without breaking
7. **Given** existing diagrams using quoted strings like `if("condition text")`, **When** the new feature is deployed, **Then** they continue to work correctly
8. **Given** a diagram with complex expressions, **When** the user writes `par(count(threads) > 1)`, **Then** the expression is properly parsed and displayed
9. **Given** a diagram with complex expressions, **When** the user writes `opt(user.role == "admin")`, **Then** the expression is properly parsed and displayed

### Edge Cases
- Nested parentheses like `par(func(x) > 0)` continue to work as expressions with operators
- Empty expressions `par()` and `opt()` are treated as `par {}` and `opt {}`
- Expressions with quotes continue to work as string literals
- Very long expressions are displayed fully by parser but may be truncated by renderer at 80 characters
- Malformed expressions are ignored gracefully without breaking the parser

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST allow plain multi-word text conditions without quotes in all control flow statements (e.g., `if(has more items)`, `loop(streaming response)`)
- **FR-002**: System MUST preserve existing support for quoted strings (e.g., `if("has more items")`) for backward compatibility
- **FR-003**: System MUST preserve existing support for expressions with operators (e.g., `if(count > 0)`) for backward compatibility
- **FR-004**: System MUST add conditional expression support to `par` keyword (e.g., `par(concurrent processing)`)
- **FR-005**: System MUST add conditional expression support to `opt` keyword (e.g., `opt(user is authenticated)`)
- **FR-006**: Expressions for `par` and `opt` MUST support the same relaxed text syntax as `if` and `loop` (plain text, quoted strings, and expressions)
- **FR-007**: System MUST parse all condition expressions and pass them through to the rendering layer
- **FR-008**: Diagram renderer MUST display the condition expressions visually in the rendered diagram at the appropriate control flow block header
- **FR-009**: Renderer MUST position condition text consistently across all control flow blocks (`if`, `loop`, `par`, `opt`) to maintain diagram readability
- **FR-010**: System MUST maintain backward compatibility with existing diagrams that use `par {}` and `opt {}` without expressions
- **FR-011**: System MUST handle empty expressions `par()` and `opt()` by treating them as `par {}` and `opt {}` respectively
- **FR-012**: System MUST enhance `critical` statement to support full expressions for consistency across all control flow statements
- **FR-013**: Relaxed text conditions MUST allow sequences of IDs (`ID*`) - multiple words separated by spaces, but NOT support commas within the condition
- **FR-014**: Renderer MUST apply consistent styling to condition expressions across all control flow types
- **FR-015**: Renderer MUST truncate condition text display at 80 characters to maintain diagram readability (full text available in tooltip/hover)
- **FR-016**: Renderer MUST ensure condition text remains visible and legible at different zoom levels
- **FR-017**: Parser MUST gracefully ignore malformed expressions without throwing errors

### Key Entities *(include if feature involves data)*
- **Relaxed Condition Expression**: A new type of condition that allows plain multi-word text without quotes, in addition to existing expression support
- **Control Flow Expression**: A conditional expression that can be plain text, quoted string, or a formal expression with operators
- **Par Statement**: A parallel execution block that will now optionally include a condition expression
- **Opt Statement**: An optional execution block that will now optionally include a condition expression

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---