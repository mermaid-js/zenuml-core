# ZenUML Parser Migration Plan: ANTLR to Langium

## Executive Summary

This plan outlines the strategy for migrating the ZenUML parser from ANTLR to Langium while maintaining full compatibility with existing UI components and business logic. The key approach is to create an abstraction layer that decouples the parser implementation from the UI components, enabling a seamless migration without breaking changes.

## Current State Analysis

### Coupling Issues Identified

1. **Direct Context Object Usage**: UI components directly access ANTLR context objects (e.g., `context.creation()`, `context.message()`, `context.messageBody()`)
2. **Parser-Specific Extensions**: Custom methods added to ANTLR prototypes (e.g., `getFormattedText()`, `SignatureText()`, `Owner()`, `From()`, `Origin()`)
3. **Context Tree Navigation**: Direct access to ANTLR tree structure (`ctx.parentCtx`, `ctx.children`)
4. **Token-Level Access**: Direct access to ANTLR tokens for positioning (`ctx.start.start`, `ctx.stop.stop`)
5. **Parser-Specific Listeners**: Custom ANTLR listeners for data collection (`ToCollector`, `MessageCollector`, `FrameBuilder`)

### Key Components Affected

- **UI Components**: `Creation.tsx`, `Interaction.tsx`, `InteractionAsync.tsx`, `Statement.tsx`
- **Parser Extensions**: `Owner.js`, `From.ts`, `SignatureText.ts`, `Origin.js`, `IsCurrent.js`
- **Data Collectors**: `ToCollector.js`, `MessageCollector.ts`, `FrameBuilder.ts`
- **Store Integration**: `rootContextAtom` in `Store.ts`

## Migration Strategy

### Phase 0: Validation & Feasibility Assessment

Before starting the full migration, this critical validation phase ensures the migration is feasible and identifies potential blockers early.

#### 0.1 Grammar Compatibility Analysis

**Create Minimal Langium Grammar**

```typescript
// src/validation/langium/ZenUMLSequence.langium
grammar ZenUMLSequence

entry SequenceDiagram:
    elements+=Element*;

Element:
    Message | Creation | Participant | AsyncMessage | Fragment | Return;

Message:
    from=ID activation?='+' '->' to=ID activation?='+' ':' signature=STRING;

Creation:
    from=ID '->+' to=ID ':' 'new' signature=STRING;

AsyncMessage:
    from=ID '->>' to=ID ':' content=STRING;

Participant:
    'participant' name=ID ('as' label=STRING)?;

Fragment:
    type=('alt' | 'opt' | 'loop' | 'par') condition=STRING? '{'
        statements+=Element*
    '}';

Return:
    from=ID '<-' to=ID ':' content=STRING;

terminal ID: /[a-zA-Z_][a-zA-Z0-9_]*/;
terminal STRING: /"[^"]*"/;
terminal WS: /\s+/;
```

**Grammar Validation Script**

```typescript
// src/validation/grammar-validation.ts
import { parseWithANTLR } from "../parser/antlr/parser";
import { parseWithLangium } from "../parser/langium/parser";

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  unsupportedFeatures: string[];
}

export async function validateGrammarCompatibility(): Promise<ValidationResult> {
  const testCases = [
    // Basic messages
    "A->B: hello",
    "A->B: method(param1, param2)",

    // Activations
    "A->+B: activate",
    "A->B: method\nB->-A: return",

    // Creations
    "A->+B: new Constructor()",
    "A->+B: new",

    // Async messages
    "A->>B: Hello Bob",
    "A->>A: SelfMessage",

    // Fragments
    "alt condition {\n  A->B: if true\n}\nelse {\n  A->B: if false\n}",
    "opt condition {\n  A->B: optional\n}",
    "loop condition {\n  A->B: repeat\n}",

    // Complex cases
    "A->B: method()\nB->C: forward\nC->B: response\nB->A: result",

    // Edge cases
    "A->B: method() // comment",
    "A->B: method with spaces",
    "A->B: method(param1, param2, param3)",

    // Real-world examples from your codebase
    ...loadRealWorldExamples(),
  ];

  const results: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    unsupportedFeatures: [],
  };

  for (const testCase of testCases) {
    try {
      const antlrResult = await parseWithANTLR(testCase);
      const langiumResult = await parseWithLangium(testCase);

      if (antlrResult.success && !langiumResult.success) {
        results.errors.push(`Failed to parse with Langium: ${testCase}`);
        results.success = false;
      }

      if (antlrResult.success && langiumResult.success) {
        const semanticDiff = compareSemantics(
          antlrResult.ast,
          langiumResult.ast,
        );
        if (semanticDiff.length > 0) {
          results.warnings.push(`Semantic differences in: ${testCase}`);
          results.warnings.push(...semanticDiff);
        }
      }
    } catch (error) {
      results.errors.push(
        `Validation error for "${testCase}": ${error.message}`,
      );
      results.success = false;
    }
  }

  return results;
}

function loadRealWorldExamples(): string[] {
  // Load actual ZenUML files from your test fixtures
  return [
    fs.readFileSync("cypress/fixtures/complex-sequence.zenuml", "utf8"),
    fs.readFileSync("cypress/fixtures/nested-fragments.zenuml", "utf8"),
    fs.readFileSync("cypress/fixtures/large-diagram.zenuml", "utf8"),
    // Add more real-world examples
  ];
}
```

#### 0.3 Error Handling Validation

```typescript
// src/validation/error-handling-validation.ts
export class ErrorHandlingValidator {
  private errorTestCases = [
    // Syntax errors
    { input: "A->", expected: "Missing target participant" },
    { input: "A->B", expected: "Missing message signature" },
    { input: "A->B: method(", expected: "Unclosed parenthesis" },
    { input: "A->B: method)", expected: "Unexpected closing parenthesis" },

    // Semantic errors
    {
      input: "A->B: method\nB->C: forward\nC->D: invalid",
      expected: "Undefined participant D",
    },
    {
      input: "alt {\n  A->B: missing condition\n}",
      expected: "Missing condition",
    },

    // Recovery scenarios
    {
      input: "A->B: valid\nINVALID LINE\nC->D: should still parse",
      expected: "Partial parsing success",
    },
    {
      input: "A->B: method(\nC->D: should continue",
      expected: "Error recovery",
    },
  ];

  async validateErrorHandling(): Promise<ValidationResult> {
    const results: ValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      unsupportedFeatures: [],
    };

    for (const testCase of this.errorTestCases) {
      try {
        const antlrResult = await parseWithANTLR(testCase.input);
        const langiumResult = await parseWithLangium(testCase.input);

        // Both should detect the error
        if (
          antlrResult.errors.length === 0 &&
          langiumResult.errors.length === 0
        ) {
          results.warnings.push(
            `Both parsers missed error in: ${testCase.input}`,
          );
        }

        // Error messages should be comparable
        if (antlrResult.errors.length > 0 && langiumResult.errors.length > 0) {
          const antlrMsg = antlrResult.errors[0].message;
          const langiumMsg = langiumResult.errors[0].message;

          // Check if error messages are reasonably similar
          if (!this.areErrorMessagesSimilar(antlrMsg, langiumMsg)) {
            results.warnings.push(
              `Different error messages for "${testCase.input}": ANTLR="${antlrMsg}", Langium="${langiumMsg}"`,
            );
          }
        }
      } catch (error) {
        results.errors.push(
          `Error validation failed for "${testCase.input}": ${error.message}`,
        );
        results.success = false;
      }
    }

    return results;
  }

  private areErrorMessagesSimilar(msg1: string, msg2: string): boolean {
    // Simple similarity check - can be enhanced
    const normalize = (msg: string) =>
      msg.toLowerCase().replace(/[^a-z0-9]/g, "");
    const norm1 = normalize(msg1);
    const norm2 = normalize(msg2);

    // Check for common error terms
    const commonTerms = [
      "missing",
      "expected",
      "unexpected",
      "invalid",
      "syntax",
    ];
    return commonTerms.some(
      (term) => norm1.includes(term) && norm2.includes(term),
    );
  }
}
```

#### 0.4 Validation Test Script

```typescript
// src/validation/run-validation.ts
import { validateGrammarCompatibility } from "./grammar-validation";
import { PerformanceTestRunner } from "./performance-testing";
import { ErrorHandlingValidator } from "./error-handling-validation";

async function runFullValidation(): Promise<void> {
  console.log("🔍 Starting ZenUML Migration Validation...\n");

  // Step 1: Grammar Compatibility
  console.log("1. Testing Grammar Compatibility...");
  const grammarResult = await validateGrammarCompatibility();

  if (!grammarResult.success) {
    console.error("❌ Grammar compatibility validation FAILED");
    console.error("Errors:", grammarResult.errors);
    process.exit(1);
  }

  console.log("✅ Grammar compatibility validation PASSED");
  if (grammarResult.warnings.length > 0) {
    console.warn("⚠️  Warnings:", grammarResult.warnings);
  }

  // Step 2: Performance Testing
  console.log("\n2. Running Performance Tests...");
  const perfRunner = new PerformanceTestRunner();
  const perfResults = await perfRunner.runPerformanceTests();

  const perfReport = perfRunner.generatePerformanceReport(perfResults);
  fs.writeFileSync("validation-performance-report.md", perfReport);

  console.log("✅ Performance tests completed");
  console.log("📊 Report saved to validation-performance-report.md");

  // Check performance thresholds
  const hasPerformanceIssues = perfResults.some((result) => {
    if (result.parser === "langium") {
      const antlrResult = perfResults.find(
        (r) => r.parser === "antlr" && r.inputSize === result.inputSize,
      );
      if (antlrResult) {
        const speedRatio = result.parseTime / antlrResult.parseTime;
        const memoryRatio = result.memoryUsage / antlrResult.memoryUsage;
        return speedRatio > 2.0 || memoryRatio > 2.0;
      }
    }
    return false;
  });

  if (hasPerformanceIssues) {
    console.warn(
      "⚠️  Performance concerns detected - review report before proceeding",
    );
  }

  // Step 3: Error Handling
  console.log("\n3. Testing Error Handling...");
  const errorValidator = new ErrorHandlingValidator();
  const errorResult = await errorValidator.validateErrorHandling();

  if (!errorResult.success) {
    console.error("❌ Error handling validation FAILED");
    console.error("Errors:", errorResult.errors);
    process.exit(1);
  }

  console.log("✅ Error handling validation PASSED");
  if (errorResult.warnings.length > 0) {
    console.warn("⚠️  Warnings:", errorResult.warnings);
  }

  // Final assessment
  console.log("\n🎉 Validation Complete!");
  console.log("✅ Migration is feasible");
  console.log("📋 Review warnings and performance report before proceeding");

  // Generate validation report
  const validationReport = generateValidationReport(
    grammarResult,
    perfResults,
    errorResult,
  );
  fs.writeFileSync("validation-report.md", validationReport);
  console.log("📄 Full validation report saved to validation-report.md");
}

function generateValidationReport(
  grammarResult: any,
  perfResults: any[],
  errorResult: any,
): string {
  return `# ZenUML Migration Validation Report

## Summary
- **Grammar Compatibility**: ${grammarResult.success ? "✅ PASSED" : "❌ FAILED"}
- **Performance**: ${perfResults.length > 0 ? "✅ COMPLETED" : "❌ FAILED"}
- **Error Handling**: ${errorResult.success ? "✅ PASSED" : "❌ FAILED"}

## Recommendations
${
  grammarResult.success && errorResult.success
    ? "✅ **PROCEED** with migration - all validations passed"
    : "❌ **DO NOT PROCEED** - address validation failures first"
}

## Next Steps
1. Review performance report for any concerns
2. Address any warnings in grammar compatibility
3. Ensure error handling meets user experience requirements
4. Begin Phase 1 implementation with confidence

---
*Generated on ${new Date().toISOString()}*
`;
}

// Run validation
if (require.main === module) {
  runFullValidation().catch(console.error);
}
```

#### 0.5 Validation Execution Instructions

**Prerequisites**

```bash
# Install validation dependencies
npm install --save-dev @performance-testing/toolkit
npm install --save-dev langium
npm install --save-dev @types/node
```

**Run Validation**

```bash
# Run full validation suite
npm run validate-migration

# Run individual validation components
npm run validate-grammar
npm run validate-performance
npm run validate-errors
```

**Package.json Scripts**

```json
{
  "scripts": {
    "validate-migration": "node -r ts-node/register src/validation/run-validation.ts",
    "validate-grammar": "node -r ts-node/register src/validation/grammar-validation.ts",
    "validate-performance": "node -r ts-node/register src/validation/performance-testing.ts",
    "validate-errors": "node -r ts-node/register src/validation/error-handling-validation.ts"
  }
}
```

**Success Criteria**

- ✅ All grammar features parse correctly in Langium
- ✅ Performance degradation < 2x slower than ANTLR
- ✅ Memory usage increase < 2x ANTLR
- ✅ Error messages remain helpful and actionable
- ✅ No semantic information lost in AST transformation

**Failure Conditions - ABORT Migration**

- ❌ Core grammar features cannot be expressed in Langium
- ❌ Performance degradation > 3x slower than ANTLR
- ❌ Memory usage > 3x ANTLR
- ❌ Critical semantic information lost
- ❌ Error handling significantly regressed

### Phase 1: Abstract Syntax Tree (AST) Abstraction Layer

#### 1.1 Create Parser-Agnostic AST Interfaces

```typescript
// src/parser/ast/ASTNode.ts
export interface ASTNode {
  type: string;
  range: [number, number];
  parent?: ASTNode;
  children: ASTNode[];
  getFormattedText(): string;
  getComment(): string;
}

// src/parser/ast/SequenceASTNode.**ts**
export interface SequenceASTNode extends ASTNode {
  // Core sequence diagram node types
  isProgram(): boolean;
  isParticipant(): boolean;
  isMessage(): boolean;
  isCreation(): boolean;
  isAsyncMessage(): boolean;
  isReturn(): boolean;
  isFragment(): boolean;

  // Navigation methods
  getParent(): SequenceASTNode | null;
  getChildren(): SequenceASTNode[];
  findAncestor(predicate: (node: SequenceASTNode) => boolean): SequenceASTNode | null;

  // Content access
  getRange(): [number, number];
  getText(): string;
}

// Specific node types
export interface MessageNode extends SequenceASTNode {
  getFrom(): string | null;
  getTo(): string | null;
  getSignature(): string;
  getOwner(): string | null;
  getOrigin(): string | null;
  hasAssignment(): boolean;
  getAssignment(): string | null;
  isCurrent(cursor: number): boolean;
  getStatements(): SequenceASTNode[];
}

export interface CreationNode extends SequenceASTNode {
  getConstructor(): string;
  getAssignee(): string | null;
  getAssigneePosition(): [number, number] | null;
  getOwner(): string;
  getFrom(): string | null;
  getSignature(): string;
  isCurrent(cursor: number): boolean;
  getStatements(): SequenceASTNode[]****;
}

export interface ParticipantNode extends SequenceASTNode {
  getName(): string;
  getType(): string | null;
  getStereotype(): string | null;
  getLabel(): string | null;
  getWidth(): number | null;
  getColor(): string | null;
  getGroupId(): string | null;
  isExplicit(): boolean;
  isStarter(): boolean;
}

export interface AsyncMessageNode extends SequenceASTNode {
  getFrom(): string | null;
  getTo(): string | null;
  getContent(): string;
  getSignature(): string;
  getProvidedFrom(): string | null;
  isCurrent(cursor: number): boolean;
}

export interface FragmentNode extends SequenceASTNode {
  getFragmentType(): 'alt' | 'opt' | 'loop' | 'par' | 'critical' | 'section' | 'tcf' | 'ref';
  getCondition(): string | null;
  getStatements(): SequenceASTNode[];
}
```

#### 1.2 Create Parser Interface

```typescript
// src/parser/interface/IParser.ts
export interface IParser {
  parse(code: string): ParserResult;
  getErrors(): ParserError[];
}

export interface ParserResult {
  ast: SequenceASTNode;
  errors: ParserError[];
  success: boolean;
}

export interface ParserError {
  message: string;
  line: number;
  column: number;
  range: [number, number];
}
```

#### 1.3 Create Data Collector Interfaces

```typescript
// src/parser/interface/IDataCollector.ts
export interface IParticipantCollector {
  collect(ast: SequenceASTNode): ParticipantData;
}

export interface IMessageCollector {
  collect(ast: SequenceASTNode): MessageData[];
}

export interface IFrameBuilder {
  build(ast: SequenceASTNode, participants: string[]): FrameData;
}

export interface ParticipantData {
  participants: Map<string, ParticipantInfo>;
  orderedNames: string[];
  starter: string | null;
}

export interface MessageData {
  from: string | null;
  to: string | null;
  signature: string;
  type: "sync" | "async" | "creation" | "return";
}

export interface FrameData {
  type: string;
  left: number;
  right: number;
  children: FrameData[];
}
```

### Phase 2: ANTLR Adapter Implementation

#### 2.1 Create ANTLR AST Adapter

```typescript
// src/parser/adapters/ANTLRAdapter.ts
export class ANTLRASTAdapter implements SequenceASTNode {
  constructor(private antlrContext: any) {}

  // Implement all interface methods by delegating to ANTLR context
  getType(): string {
    if (this.antlrContext.message()) return "message";
    if (this.antlrContext.creation()) return "creation";
    if (this.antlrContext.asyncMessage()) return "asyncMessage";
    // ... etc
  }

  getRange(): [number, number] {
    return [this.antlrContext.start.start, this.antlrContext.stop.stop + 1];
  }

  getFormattedText(): string {
    return this.antlrContext.getFormattedText();
  }

  // ... implement all other methods
}

export class ANTLRMessageAdapter
  extends ANTLRASTAdapter
  implements MessageNode
{
  getFrom(): string | null {
    return this.antlrContext.message()?.From() || null;
  }

  getTo(): string | null {
    return this.antlrContext.message()?.Owner() || null;
  }

  getSignature(): string {
    return this.antlrContext.message()?.SignatureText() || "";
  }

  // ... implement all MessageNode methods
}
```

#### 2.2 Create ANTLR Parser Adapter

```typescript
// src/parser/adapters/ANTLRParserAdapter.ts
export class ANTLRParserAdapter implements IParser {
  parse(code: string): ParserResult {
    try {
      const antlrContext = rootContext(code);
      const ast = this.createASTNode(antlrContext);

      return {
        ast,
        errors: [],
        success: true,
      };
    } catch (error) {
      return {
        ast: null,
        errors: [
          /* convert ANTLR errors */
        ],
        success: false,
      };
    }
  }

  private createASTNode(antlrContext: any): SequenceASTNode {
    // Factory method to create appropriate AST node adapters
    if (antlrContext.message()) {
      return new ANTLRMessageAdapter(antlrContext);
    }
    if (antlrContext.creation()) {
      return new ANTLRCreationAdapter(antlrContext);
    }
    // ... etc
    return new ANTLRASTAdapter(antlrContext);
  }
}
```

### Phase 3: Refactor UI Components

#### 3.1 Update Component Interfaces

```typescript
// src/components/types/ComponentProps.ts
export interface StatementProps {
  node: SequenceASTNode;
  origin: string;
  number?: string;
  collapsed?: boolean;
}

export interface MessageProps {
  node: MessageNode;
  origin: string;
  comment?: string;
  commentObj?: CommentClass;
  number?: string;
  className?: string;
}
```

#### 3.2 Refactor Components

```typescript
// src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/Statement.tsx
export const Statement = (props: StatementProps) => {
  const { node, origin, number, collapsed } = props;
  const comment = node.getComment() || "";
  const commentObj = new Comment(comment);

  const subProps = {
    className: cn("text-left text-sm text-skin-message", {
      hidden: collapsed && !node.isReturn(),
    }),
    node,
    origin,
    comment,
    commentObj,
    number,
  };

  // Use AST node type checking instead of context methods
  if (node.isFragment()) {
    const fragmentNode = node as FragmentNode;
    switch (fragmentNode.getFragmentType()) {
      case 'loop': return <FragmentLoop {...subProps} />;
      case 'alt': return <FragmentAlt {...subProps} />;
      case 'par': return <FragmentPar {...subProps} />;
      // ... etc
    }
  }

  if (node.isCreation()) {
    return <Creation {...subProps} />;
  }

  if (node.isMessage()) {
    return <Interaction {...subProps} />;
  }

  if (node.isAsyncMessage()) {
    return <InteractionAsync {...subProps} />;
  }

  // ... etc
};
```

### Phase 4: Data Collection Refactoring

#### 4.1 Create Generic Data Collectors

```typescript
// src/parser/collectors/ParticipantCollector.ts
export class ParticipantCollector implements IParticipantCollector {
  collect(ast: SequenceASTNode): ParticipantData {
    const participants = new Map<string, ParticipantInfo>();
    const visitor = new ParticipantVisitor(participants);
    this.visitNode(ast, visitor);

    return {
      participants,
      orderedNames: Array.from(participants.keys()),
      starter: this.findStarter(participants),
    };
  }

  private visitNode(node: SequenceASTNode, visitor: ParticipantVisitor): void {
    visitor.visit(node);
    for (const child of node.getChildren()) {
      this.visitNode(child, visitor);
    }
  }
}

class ParticipantVisitor {
  constructor(private participants: Map<string, ParticipantInfo>) {}

  visit(node: SequenceASTNode): void {
    if (node.isParticipant()) {
      this.handleParticipant(node as ParticipantNode);
    } else if (node.isMessage()) {
      this.handleMessage(node as MessageNode);
    } else if (node.isCreation()) {
      this.handleCreation(node as CreationNode);
    }
  }

  private handleParticipant(node: ParticipantNode): void {
    const name = node.getName();
    const info: ParticipantInfo = {
      name,
      type: node.getType(),
      stereotype: node.getStereotype(),
      label: node.getLabel(),
      width: node.getWidth(),
      color: node.getColor(),
      groupId: node.getGroupId(),
      explicit: node.isExplicit(),
      isStarter: node.isStarter(),
      positions: new Set([node.getRange()]),
      assigneePositions: new Set(),
    };
    this.participants.set(name, info);
  }

  // ... other handler methods
}
```

### Phase 5: Store Integration

#### 5.1 Update Store to Use Parser Interface

```typescript
// src/store/Store.ts
import { IParser } from "@/parser/interface/IParser";
import { ANTLRParserAdapter } from "@/parser/adapters/ANTLRParserAdapter";

// Create parser instance (later can be swapped for Langium)
const parser: IParser = new ANTLRParserAdapter();

export const rootContextAtom = atom((get) => {
  const code = get(codeAtom);
  const result = parser.parse(code);
  return result.success ? result.ast : null;
});

export const participantsAtom = atom((get) => {
  const ast = get(rootContextAtom);
  if (!ast) return new Map();

  const collector = new ParticipantCollector();
  return collector.collect(ast);
});

export const messagesAtom = atom((get) => {
  const ast = get(rootContextAtom);
  if (!ast) return [];

  const collector = new MessageCollector();
  return collector.collect(ast);
});
```

### Phase 6: Langium Implementation

#### 6.1 Create Langium Grammar

```typescript
// src/parser/langium/sequence.langium
grammar Sequence

entry Program:
    title=Title?
    (head=Head)?
    (block=Block)?
;

Title:
    'title' content=TitleContent? 'end'?
;

Head:
    (groups+=Group | participants+=Participant)*
    (starterExp=StarterExp)?
;

Participant:
    (participantType=ParticipantType)?
    (stereotype=Stereotype)?
    name=Name
    (width=Width)?
    (label=Label)?
    (color=Color)?
;

Block:
    statements+=Statement+
;

Statement:
    Alt | Par | Opt | Critical | Section | Creation | Message | AsyncMessage | Return | Divider | Loop | Ref
;

Message:
    (assignment=Assignment)?
    ((from=Name '->')? to=Name '.')?
    func=Function
    (';' | block=BraceBlock)?
;

Creation:
    (assignment=Assignment)?
    'new' constructor=Name ('(' parameters=Parameters? ')')?
    (';' | block=BraceBlock)?
;

AsyncMessage:
    (from=Name '->')? to=Name ':' content=Content?
;

// ... continue with other rules
```

#### 6.2 Create Langium AST Adapter

```typescript
// src/parser/adapters/LangiumAdapter.ts
export class LangiumASTAdapter implements SequenceASTNode {
  constructor(private langiumNode: any) {}

  getType(): string {
    return this.langiumNode.$type;
  }

  getRange(): [number, number] {
    const cstNode = this.langiumNode.$cstNode;
    return [cstNode.offset, cstNode.end];
  }

  // ... implement all interface methods
}

export class LangiumMessageAdapter
  extends LangiumASTAdapter
  implements MessageNode
{
  getFrom(): string | null {
    return this.langiumNode.from?.name || null;
  }

  getTo(): string | null {
    return this.langiumNode.to?.name || null;
  }

  // ... implement all MessageNode methods
}
```

#### 6.3 Create Langium Parser Adapter

```typescript
// src/parser/adapters/LangiumParserAdapter.ts
export class LangiumParserAdapter implements IParser {
  constructor(private langiumParser: any) {}

  parse(code: string): ParserResult {
    try {
      const parseResult = this.langiumParser.parse(code);
      const ast = this.createASTNode(parseResult.parseTree);

      return {
        ast,
        errors: parseResult.lexerErrors.concat(parseResult.parserErrors),
        success:
          parseResult.lexerErrors.length === 0 &&
          parseResult.parserErrors.length === 0,
      };
    } catch (error) {
      return {
        ast: null,
        errors: [
          /* convert Langium errors */
        ],
        success: false,
      };
    }
  }

  private createASTNode(langiumNode: any): SequenceASTNode {
    // Factory method to create appropriate AST node adapters
    switch (langiumNode.$type) {
      case "Message":
        return new LangiumMessageAdapter(langiumNode);
      case "Creation":
        return new LangiumCreationAdapter(langiumNode);
      // ... etc
      default:
        return new LangiumASTAdapter(langiumNode);
    }
  }
}
```

### Phase 7: Migration Execution

#### 7.1 Step-by-Step Migration

1. **Implement abstraction layer** alongside existing ANTLR code
2. **Create ANTLR adapters** to maintain backward compatibility
3. **Refactor UI components** to use AST interfaces instead of direct context access
4. **Update data collectors** to work with AST interfaces
5. **Implement Langium parser** and adapters
6. **Add parser switching mechanism** for testing
7. **Run comprehensive tests** to ensure feature parity
8. **Switch default parser** to Langium
9. **Remove ANTLR dependencies** once migration is complete

#### 7.2 Parser Switching Configuration

```typescript
// src/parser/ParserFactory.ts
export class ParserFactory {
  static create(type: "antlr" | "langium" = "antlr"): IParser {
    switch (type) {
      case "antlr":
        return new ANTLRParserAdapter();
      case "langium":
        return new LangiumParserAdapter(/* langium services */);
      default:
        throw new Error(`Unsupported parser type: ${type}`);
    }
  }
}

// src/config/ParserConfig.ts
export const PARSER_TYPE =
  (process.env.PARSER_TYPE as "antlr" | "langium") || "antlr";
```

## Testing Strategy

### Unit Tests

1. **AST Interface Tests**: Verify all AST node types work correctly
2. **Adapter Tests**: Test both ANTLR and Langium adapters
3. **Data Collector Tests**: Ensure collectors work with both parsers
4. **Component Tests**: Test UI components with both parser outputs

### Integration Tests

1. **End-to-End Tests**: Verify complete parsing and rendering pipeline
2. **Feature Parity Tests**: Compare outputs between ANTLR and Langium
3. **Performance Tests**: Measure parsing performance differences

### Migration Tests

1. **A/B Testing**: Run both parsers on same input and compare results
2. **Regression Tests**: Ensure no existing features break
3. **Edge Case Tests**: Test complex scenarios and error handling

## Benefits of This Approach

1. **Zero Breaking Changes**: Existing code continues to work during migration
2. **Gradual Migration**: Can migrate components one at a time
3. **Rollback Capability**: Can quickly revert if issues arise
4. **Future-Proof**: Abstraction layer makes future parser changes easier
5. **Testability**: Can easily test both parsers side-by-side
6. **Maintainability**: Clear separation of concerns between parsing and rendering

## Timeline Estimate

- **Phase 1-2** (Abstraction + ANTLR Adapter): 2-3 weeks
- **Phase 3-4** (UI Refactoring + Data Collectors): 2-3 weeks
- **Phase 5** (Store Integration): 1 week
- **Phase 6** (Langium Implementation): 3-4 weeks
- **Phase 7** (Migration Execution): 2-3 weeks
- **Testing & Validation**: 1-2 weeks

**Total Estimated Timeline: 11-16 weeks**

## Risk Mitigation

1. **Incremental Development**: Implement in small, testable chunks
2. **Comprehensive Testing**: Extensive test coverage for both parsers
3. **Performance Monitoring**: Track parsing performance throughout migration
4. **Rollback Plan**: Maintain ability to quickly revert to ANTLR if needed
5. **Documentation**: Comprehensive documentation of new architecture

This plan provides a robust, low-risk approach to migrating from ANTLR to Langium while maintaining full compatibility and providing a foundation for future parser improvements.
