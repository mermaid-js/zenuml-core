# Research Report: Relaxed Condition Expressions

**Feature**: Relaxed Condition Expressions for Control Flow Statements
**Date**: 2025-10-06
**Branch**: `005-relaxed-condition-expression`

## Executive Summary

This research addresses the implementation of relaxed text expressions in ZenUML's parser grammar, allowing natural language conditions without quotes and adding expression support to `par`, `opt`, and `critical` statements.

## Key Decisions

### 1. Grammar Pattern for Relaxed Text

**Decision**: Use `ID+` pattern with a new `textExpr` rule

**Rationale**:
- Simple and maintainable
- Preserves backward compatibility
- Clear precedence hierarchy
- Minimal parser complexity

**Alternatives Considered**:
- Lexer modes: Too complex for this use case, would complicate grammar maintenance
- Island grammar: Overkill for structured conditions
- Catch-all tokens: Would break existing expression parsing

### 2. Rule Extension Strategy

**Decision**: Add new alternatives to existing `condition` rule

**Rationale**:
- Maintains complete backward compatibility
- Clear precedence (existing rules tried first)
- No changes to existing parse trees
- Simple to test and verify

**Alternatives Considered**:
- Grammar imports: Not needed for simple extension
- Rule replacement: Would break backward compatibility
- Separate condition rules: Would complicate visitor pattern

### 3. Par/Opt/Critical Enhancement

**Decision**: Extend all three statements to use `parExpr` pattern

**Rationale**:
- Consistency across all control flow statements
- Reuses existing, well-tested pattern
- Natural error recovery built-in
- Uniform rendering approach

**Alternatives Considered**:
- Different patterns per statement: Inconsistent user experience
- Simple atom-only support: Too limiting
- Complex custom patterns: Unnecessary complexity

### 4. Error Handling Strategy

**Decision**: Graceful degradation with existing DefaultErrorStrategy

**Rationale**:
- ANTLR4's built-in recovery is robust
- Grammar already has good sync points
- Optional elements provide natural recovery
- No custom error handler needed

**Alternatives Considered**:
- Custom error strategy: Unnecessary complexity
- Strict validation: Poor user experience during typing
- Semantic validation only: Would miss syntax errors

## Implementation Approach

### Grammar Changes

1. **Enhance condition rule**:
```antlr
condition
  : atom       // Existing
  | expr       // Existing
  | inExpr     // Existing
  | textExpr   // NEW: relaxed text
  ;

textExpr
  : ID+        // Multiple IDs without operators
  ;
```

2. **Update par/opt/critical rules**:
```antlr
par
  : PAR parExpr? braceBlock  // Add optional expression
  | PAR
  ;

opt
  : OPT parExpr? braceBlock  // Add optional expression
  | OPT
  ;

critical
  : CRITICAL parExpr? braceBlock  // Change from atom? to parExpr?
  | CRITICAL
  ;
```

### Parser Integration

- Visitor pattern will handle new `textExpr` nodes
- Existing expression visitors remain unchanged
- New visitor methods for enhanced par/opt/critical

### Renderer Updates

- Extract condition text from parse tree
- Display in control flow block headers
- Truncate at 80 characters for display
- Full text in tooltips

## Technical Considerations

### Performance Impact
- Minimal: One additional alternative in condition rule
- No lexer changes required
- No additional lookahead needed
- Linear parsing complexity maintained

### Testing Strategy
- Unit tests for new grammar rules
- Integration tests for each control flow type
- Backward compatibility test suite
- Error recovery test cases

### Migration Path
- No migration needed for existing diagrams
- Graceful upgrade: old syntax continues working
- Optional adoption of new features

## Dependencies and Constraints

### ANTLR Version
- Current: ANTLR 4.x
- No version upgrade required
- Compatible with existing toolchain

### Build Process
- Run `bun antlr` to regenerate parser
- No changes to build configuration
- Existing CI/CD pipeline compatible

### Browser Compatibility
- No browser-specific concerns
- Pure JavaScript parser generation
- Works in all modern browsers

## Risk Assessment

### Low Risk
- Grammar changes are additive only
- Well-understood ANTLR patterns
- Extensive test coverage possible
- Rollback is simple

### Mitigation Strategies
- Feature flag for new functionality if needed
- Comprehensive test suite before release
- Beta testing with sample diagrams
- Clear documentation of new syntax

## Recommendations

1. **Implement incrementally**: Start with `textExpr` for if/loop, then extend to par/opt/critical
2. **Test thoroughly**: Focus on backward compatibility and edge cases
3. **Document clearly**: Provide examples of new syntax options
4. **Monitor performance**: Verify no regression in parse times
5. **Gather feedback**: Beta test with actual users before full release

## Conclusion

The proposed implementation is straightforward, low-risk, and maintains complete backward compatibility while adding valuable new functionality. The use of established ANTLR patterns ensures maintainability and predictable behavior.