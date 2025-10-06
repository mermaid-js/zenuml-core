# Tasks: Relaxed Condition Expressions

**Input**: Design documents from `/specs/005-relaxed-condition-expression/`
**Prerequisites**: plan.md (required), research.md, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → research.md: Extract decisions → setup tasks
   → quickstart.md: Extract scenarios → parser and integration tests
3. Generate tasks by category:
   → Setup: Grammar changes, parser regeneration
   → Tests: parser tests, component tests, E2E tests
   → Core: Component updates for rendering
   → Integration: Utilities for condition text extraction
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `test/` at repository root
- Project uses single structure with ANTLR parser generation
- Paths shown below are absolute from repository root

## Phase 3.1: Setup & Grammar Changes
- [ ] T001 Add textExpr rule to src/g4/sequenceParser.g4 for ID+ pattern
- [ ] T002 Update condition rule in src/g4/sequenceParser.g4 to include textExpr alternative
- [ ] T003 Update par rule in src/g4/sequenceParser.g4 to accept optional parExpr
- [ ] T004 Update opt rule in src/g4/sequenceParser.g4 to accept optional parExpr
- [ ] T005 Update critical rule in src/g4/sequenceParser.g4 to use parExpr instead of atom
- [ ] T006 Regenerate parser with `bun antlr` command

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Parser Tests
- [ ] T007 [P] Write parser test for textExpr in test/unit/parser/textExpr.spec.ts
- [ ] T008 [P] Write parser test for if with text conditions in test/unit/parser/if-text-condition.spec.ts
- [ ] T009 [P] Write parser test for loop with text conditions in test/unit/parser/loop-text-condition.spec.ts
- [ ] T010 [P] Write parser test for par with conditions in test/unit/parser/par-condition.spec.ts
- [ ] T011 [P] Write parser test for opt with conditions in test/unit/parser/opt-condition.spec.ts
- [ ] T012 [P] Write parser test for critical with full expressions in test/unit/parser/critical-condition.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Renderer Component Updates
- [ ] T013 [P] Update Par component in src/components/DiagramFrame/SeqDiagram/Statement/Par.tsx to display conditions
- [ ] T014 [P] Update Opt component in src/components/DiagramFrame/SeqDiagram/Statement/Opt.tsx to display conditions
- [ ] T015 [P] Update Critical component in src/components/DiagramFrame/SeqDiagram/Statement/Critical.tsx for full expressions
- [ ] T016 [P] Update Alt (If) component in src/components/DiagramFrame/SeqDiagram/Statement/Alt.tsx for text conditions
- [ ] T017 [P] Update Loop component in src/components/DiagramFrame/SeqDiagram/Statement/Loop.tsx for text conditions

### Parser Utilities
- [ ] T018 [P] Add condition text extraction utility in src/parser/utils/ConditionTextExtractor.ts
- [ ] T019 [P] Add condition formatting utility in src/parser/utils/ConditionFormatter.ts

## Phase 3.4: Integration & Error Handling
- [ ] T020 Implement 80-character truncation logic in src/utils/TextTruncation.ts
- [ ] T021 Add tooltip support for truncated conditions in src/components/utils/Tooltip.tsx
- [ ] T022 Update condition rendering in existing Alt/Loop components to use new utilities

## Phase 3.5: Polish & Documentation
- [ ] T023 [P] Add unit tests for ConditionTextExtractor in test/unit/parser/utils/ConditionTextExtractor.spec.ts
- [ ] T024 [P] Add unit tests for ConditionFormatter in test/unit/parser/utils/ConditionFormatter.spec.ts
- [ ] T025 [P] Add unit tests for TextTruncation in test/unit/utils/TextTruncation.spec.ts
- [ ] T026 [P] Add component tests for Tooltip in test/unit/components/utils/Tooltip.spec.tsx
- [ ] T027 [P] Add examples to demo site
- [ ] T028 Run performance tests to verify <100ms parse time
- [ ] T029 Execute quickstart validation scenarios from quickstart.md
- [ ] T030 Update CHANGELOG.md with new feature description

## Dependencies
- Grammar changes (T001-T005) must complete before parser regeneration (T006)
- Parser regeneration (T006) blocks all other tasks
- Tests (T007-T012) before implementation (T013-T022)
- Component updates (T013-T017) can run in parallel
- Parser utilities (T018-T019) can run in parallel
- Integration tasks (T020-T022) require components complete
- Polish tasks (T023-T030) after all implementation

## Parallel Execution Examples

### After T006 (Parser Regeneration), launch all parser tests:
```bash
# Launch T007-T012 together:
Task: "Write parser test for textExpr in test/unit/parser/textExpr.spec.ts"
Task: "Write parser test for if with text conditions in test/unit/parser/if-text-condition.spec.ts"
Task: "Write parser test for loop with text conditions in test/unit/parser/loop-text-condition.spec.ts"
Task: "Write parser test for par with conditions in test/unit/parser/par-condition.spec.ts"
Task: "Write parser test for opt with conditions in test/unit/parser/opt-condition.spec.ts"
Task: "Write parser test for critical with full expressions in test/unit/parser/critical-condition.spec.ts"

```

### After tests fail, launch component implementations:
```bash
# Launch T013-T017 together:
Task: "Update Par component in src/components/DiagramFrame/SeqDiagram/Statement/Par.tsx to display conditions"
Task: "Update Opt component in src/components/DiagramFrame/SeqDiagram/Statement/Opt.tsx to display conditions"
Task: "Update Critical component in src/components/DiagramFrame/SeqDiagram/Statement/Critical.tsx for full expressions"
Task: "Update Alt (If) component in src/components/DiagramFrame/SeqDiagram/Statement/Alt.tsx for text conditions"
Task: "Update Loop component in src/components/DiagramFrame/SeqDiagram/Statement/Loop.tsx for text conditions"

# Launch T018-T019 together:
Task: "Add condition text extraction utility in src/parser/utils/ConditionTextExtractor.ts"
Task: "Add condition formatting utility in src/parser/utils/ConditionFormatter.ts"
```

### Final polish tasks:
```bash
# Launch T023-T027 together:
Task: "Add unit tests for ConditionTextExtractor in test/unit/parser/utils/ConditionTextExtractor.spec.ts"
Task: "Add unit tests for ConditionFormatter in test/unit/parser/utils/ConditionFormatter.spec.ts"
Task: "Add unit tests for TextTruncation in test/unit/utils/TextTruncation.spec.ts"
Task: "Add component tests for Tooltip in test/unit/components/utils/Tooltip.spec.tsx"
Task: "Add examples to demo site"
```

## Notes
- [P] tasks = different files, no shared dependencies
- Grammar changes are sequential (modifying same file)
- Verify all tests fail before implementing
- Commit after each task completion
- Run `bun test` after each implementation task
- Run `bun pw` for E2E tests
- Use generated parser context objects directly (e.g., `parExpr().condition().getText()`)

## Task Generation Rules
*Applied during main() execution*

1. **From Plan & Research**:
   - Grammar changes → Sequential tasks (T001-T005)
   - Component updates → Parallel tasks (T013-T017)
   - Utility functions → Parallel tasks (T018-T019)

2. **From Quickstart Scenarios**:
   - Natural language examples → Parser tests (T008-T009)
   - Par/Opt/Critical scenarios → Parser tests (T010-T012)

3. **Ordering**:
   - Grammar → Tests → Components → Utilities → Integration → Polish
   - Sequential for same file, parallel for different files

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All scenarios from quickstart have corresponding tests (T007-T012)
- [x] All components have update tasks (T013-T017)
- [x] All tests come before implementation
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Grammar changes are sequential (T001-T005)
- [x] Performance validation included (T032)
- [x] Quickstart scenarios validated (T033)
- [x] No custom visitor pattern (follows existing codebase pattern)