# Implementation Plan: Relaxed Condition Expressions

**Branch**: `005-relaxed-condition-expression` | **Date**: 2025-10-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-relaxed-condition-expression/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code)
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Implementing relaxed condition expressions for ZenUML control flow statements to allow natural language conditions without quotes and add expression support to `par`, `opt`, and `critical` statements. The solution involves extending the ANTLR grammar with a new `textExpr` rule for multi-word conditions and enhancing control flow statements to accept optional expressions.

## Technical Context

**Language/Version**: JavaScript/ES2020 (ANTLR4-generated parser)
**Primary Dependencies**: ANTLR4, React 19, Jotai (state management)
**Storage**: N/A (parser-level feature)
**Testing**: Vitest, Playwright (E2E)
**Target Platform**: Browser (all modern browsers)
**Project Type**: Single (library with demo site)
**Performance Goals**: Parse time <100ms for typical diagrams
**Constraints**: Maintain backward compatibility, 80-char display limit
**Scale/Scope**: ~10 grammar rule changes, ~5 visitor methods, ~3 renderer components

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Since no constitution is defined for this project, using standard best practices:
- ✅ Backward compatibility maintained
- ✅ Incremental changes only
- ✅ Test-driven development approach
- ✅ Simple, maintainable solution

## Project Structure

### Documentation (this feature)
```
specs/005-relaxed-condition-expression/
├── plan.md              # This file (/plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (COMPLETED)
├── quickstart.md        # Phase 1 output (COMPLETED)
└── tasks.md             # Phase 2 output (/tasks command - COMPLETED)
```

### Source Code (repository root)
```
src/
├── g4/
│   ├── sequenceParser.g4    # Grammar file to modify
│   └── sequenceLexer.g4     # Lexer (no changes needed)
├── generated-parser/         # Auto-generated parser (bun antlr)
├── parser/
│   └── utils/               # NEW: Condition utilities
│       ├── ConditionTextExtractor.ts
│       └── ConditionFormatter.ts
├── components/
│   └── DiagramFrame/
│       └── SeqDiagram/
│           └── Statement/
│               ├── Par.tsx        # Update rendering
│               ├── Opt.tsx        # Update rendering
│               ├── Critical.tsx   # Update rendering
│               └── ConditionDisplay.tsx # NEW component
└── utils/
    └── TextTruncation.ts    # NEW: 80-char truncation

test/
├── unit/
│   └── parser/
│       ├── condition.spec.ts # Test relaxed conditions
│       ├── par.spec.ts       # Test par expressions
│       └── opt.spec.ts       # Test opt expressions
└── e2e/
    └── relaxed-conditions.spec.ts # E2E tests
```

**Structure Decision**: Single project structure - this is a library enhancement that modifies the parser grammar and corresponding React components.

## Phase 0: Outline & Research

**Completed**: See `research.md`

Key findings:
- Use `ID+` pattern for relaxed text expressions
- Add alternatives to existing rules for backward compatibility
- ANTLR4's error recovery handles malformed expressions
- Visitor pattern extends cleanly for new node types

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

**Completed**:
- `quickstart.md` - User guide and examples
- `CLAUDE.md` - Updated via script

Key design decisions:
1. Use `ID+` grammar pattern for multi-word text conditions
2. Add `parExpr` support to par/opt/critical statements
3. Extract condition text using ANTLR context methods
4. 80-character truncation with tooltip support in renderer

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. Grammar modification tasks (sequential)
   - Modify sequenceParser.g4 to add textExpr rule
   - Enhance condition rule with textExpr alternative
   - Update par/opt/critical rules for expressions
   - Regenerate parser with `bun antlr`

2. Parser utility tasks (can be parallel [P])
   - Create ConditionTextExtractor utility [P]
   - Create ConditionFormatter utility [P]

3. Renderer component tasks (can be parallel [P])
   - Update Par component for condition display [P]
   - Update Opt component for condition display [P]
   - Update Critical component for condition display [P]
   - Update If component for text conditions [P]
   - Update Loop component for text conditions [P]
   - Create ConditionDisplay component for truncation [P]

4. Testing tasks (TDD approach)
   - Write parser tests for textExpr and new conditions
   - Write component tests for renderers
   - Write integration tests for backward compatibility
   - Write E2E tests for all scenarios

**Ordering Strategy**:
1. Grammar changes first (foundation)
2. Parser regeneration
3. Tests written and failing (TDD)
4. Parser utilities (parallel)
5. Renderer updates (parallel)
6. Tests pass, polish complete

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

No violations - solution follows best practices and maintains simplicity.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---
*Implementation ready for /tasks command*