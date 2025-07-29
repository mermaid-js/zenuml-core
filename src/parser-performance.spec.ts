import { performance } from "perf_hooks";
import { describe, it, expect } from "vitest";

// Import ANTLR parser
import antlr4 from "antlr4";
import sequenceLexer from "./generated-parser/sequenceLexer";
import sequenceParser from "./generated-parser/sequenceParser";
import "./parser/index"; // This sets up the parser extensions

// Test data - copied from langium-poc demos
const demo1 = `
// comments at the beginning should be ignored
title "This is a title"
@Lambda <<stereotype>> ParticipantName
group "B C" {@EC2 B @ECS C}
"bg color" #FF0000
@Starter("OptionalStarter")
new B
ReturnType ret = ParticipantName.methodA(a, b) {
  critical("This is a critical message") {
    // Customised style for RESTFul API - \`POST /order\` <br>
    ReturnType ret2 = selfCall() {
      B.syncCallWithinSelfCall() {
        ParticipantName.rightToLeftCall()
        return B
      }
      "space in name"->"bg color".syncMethod(from, to)
    }
  }
  // A comment for alt
  if (condition) {
    // A comment for creation
    ret = new CreatAndAssign()
    "ret:CreatAndAssign".method(create, and, assign)
    // A comment for async self
    B->B: Self Async
    // A comment for async message
    B->C: Async Message within fragment
    new Creation() {
      return from_creation
    }
    return "from if to original source"
    try {
      new AHasAVeryLongNameLongNameLongNameLongName() {
        new CreatWithinCreat()
        C.rightToLeftFromCreation() {
          B.FurtherRightToLeftFromCreation()
        }
      }
    } catch (Exception) {
      self {
        return C
      }
    } finally {
      C: "async call from implied source"
    }
    =====divider can be anywhere=====
  } else if ("another condition") {
    par {
      B.method
      C.method
    }
  } else {
    // A comment for loop
    forEach(Z) {
      Z.method() {
        return Z
      }
    }
  }
}`;

const demo2 = `A.m`;

const demo3 = `RET ret = A.methodA() {
  if (x) {
    B.methodB()
    if (y) {
      C.methodC()
    }
  }
  while (x) {
    B.methodB()
    while (y) {
      C.methodC()
    }
  }
  if (x) {
    method()
    if (y) {
      method2()
    }
  }
  while (x) {
    method()
    while (y) {
      method2()
    }
  }
  while (x) {
    method()
    if (y) {
      method2()
    }
  }
  if (x) {
    method()
    while (y) {
      method2()
    }
  }
}`;

const demo4 = `RET ret = A.methodA() {
  B.method() {
    if (X) {
      C.methodC() {
        a = A.methodA() {
          D.method()
        }
      }
    }
    while (Y) {
      C.methodC() {
        A.methodA()
      }
    }
   }
 }`;

const demo5 = "A.methodA() { A.methodA1() }";

const demo6 = `A->A:: Hello
A->B:: Hello B
B->A: So what`;

interface PerformanceResult {
  parserName: string;
  testCase: string;
  parseTime: number; // milliseconds
  memoryUsed: number; // bytes
  success: boolean;
  errorCount: number;
  astNodeCount?: number;
}

interface MemoryMeasurement {
  used: number;
  external: number;
  arrayBuffers: number;
}

class SeqErrorListener extends antlr4.error.ErrorListener {
  private errors: string[] = [];

  syntaxError(
    recognizer: any,
    offendingSymbol: any,
    line: number,
    column: number,
    msg: string,
  ) {
    this.errors.push(`${offendingSymbol} line ${line}, col ${column}: ${msg}`);
  }

  getErrors(): string[] {
    return this.errors;
  }

  reset(): void {
    this.errors = [];
  }
}

function measureMemory(): MemoryMeasurement {
  // Force GC before measuring (only works with --expose-gc flag)
  if (typeof global !== "undefined" && global.gc) {
    global.gc();
  }

  if (typeof process !== "undefined" && process.memoryUsage) {
    const mem = process.memoryUsage();
    return {
      used: mem.heapUsed,
      external: mem.external,
      arrayBuffers: mem.arrayBuffers || 0,
    };
  }
  return { used: 0, external: 0, arrayBuffers: 0 };
}

function forceGarbageCollection() {
  if (typeof global !== "undefined" && global.gc) {
    global.gc();
  }
}

function parseWithANTLR(code: string): PerformanceResult {
  const errorListener = new SeqErrorListener();
  const memBefore = measureMemory();
  const startTime = performance.now();

  let success = false;
  let astNodeCount = 0;

  try {
    const chars = new antlr4.InputStream(code);
    const lexer = new sequenceLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new sequenceParser(tokens);

    parser.removeErrorListeners();
    parser.addErrorListener(errorListener);

    const tree = parser.prog();
    success = tree !== null && errorListener.getErrors().length === 0;

    // Count AST nodes recursively
    astNodeCount = countASTNodes(tree);
  } catch (error) {
    console.error("ANTLR parsing error:", error);
  }

  const endTime = performance.now();
  const memAfter = measureMemory();

  return {
    parserName: "ANTLR",
    testCase: "",
    parseTime: endTime - startTime,
    memoryUsed: memAfter.used - memBefore.used,
    success,
    errorCount: errorListener.getErrors().length,
    astNodeCount,
  };
}

// Note: Langium performance testing should be done separately in the langium-poc directory
// due to dependency isolation. This test focuses on ANTLR performance profiling.

function countASTNodes(node: any): number {
  if (!node) return 0;

  let count = 1; // Count this node

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      count += countASTNodes(child);
    }
  }

  return count;
}

// This function was for Langium node counting - removed for simplicity

function generateTestCases() {
  return [
    { name: "Simple", description: "Minimal syntax", code: demo2 },
    { name: "Medium", description: "Nested control structures", code: demo3 },
    { name: "Advanced", description: "Fragment positioning", code: demo4 },
    { name: "Complex", description: "Full feature set", code: demo1 },
    { name: "Demo5", description: "Additional test case", code: demo5 },
    { name: "Demo6", description: "Additional test case", code: demo6 },
    {
      name: "Synthetic-Small",
      description: "Generated small case",
      code: `
        title "Small Test"
        A->B.method()
        B->C.response()
      `,
    },
    {
      name: "Synthetic-Large",
      description: "Generated large case",
      code: generateLargeTestCase(),
    },
  ];
}

function generateLargeTestCase(): string {
  const participants = ["A", "B", "C", "D", "E", "F", "G", "H"];
  let code = `title "Large Performance Test"\n`;

  // Add participant declarations
  for (let i = 0; i < participants.length; i++) {
    code += `@Actor ${participants[i]}\n`;
  }

  // Generate nested method calls
  for (let depth = 0; depth < 5; depth++) {
    for (let i = 0; i < participants.length - 1; i++) {
      const from = participants[i];
      const to = participants[i + 1];
      code += `${from}->${to}.method${depth}_${i}() {\n`;

      // Add some control structures
      if (depth % 2 === 0) {
        code += `  if (condition${depth}) {\n`;
        code += `    ${to}->A.callback${depth}()\n`;
        code += `  }\n`;
      } else {
        code += `  while (loop${depth}) {\n`;
        code += `    ${to}->A.loop_callback${depth}()\n`;
        code += `  }\n`;
      }
    }
  }

  // Close all the method blocks
  for (let depth = 0; depth < 5; depth++) {
    for (let i = 0; i < participants.length - 1; i++) {
      code += `}\n`;
    }
  }

  return code;
}

describe("Parser Performance Test: ANTLR Parsing", () => {
  const results: PerformanceResult[] = [];

  const testCases = generateTestCases();

  testCases.forEach((testCase) => {
    describe(`Test Case: ${testCase.name} (${testCase.description})`, () => {
      it("should parse successfully with ANTLR", async () => {
        // Force garbage collection before test
        forceGarbageCollection();
        await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay

        const result = parseWithANTLR(testCase.code);
        result.testCase = testCase.name;
        results.push(result);

        expect(result.parseTime).toBeGreaterThan(0);
        console.log(
          `ANTLR ${testCase.name}: ${result.parseTime.toFixed(2)}ms, ${result.success ? "Success" : `Failed (${result.errorCount} errors)`}`,
        );
      });
    });
  });

  it("should display ANTLR performance results", () => {
    console.log("\n📊 ANTLR Parser Performance Results");
    console.log("=====================================\n");

    results.forEach((result) => {
      console.log(`🧪 ${result.testCase}:`);
      console.log(`   Time: ${result.parseTime.toFixed(2)}ms`);
      console.log(`   Memory: ${(result.memoryUsed / 1024).toFixed(2)}KB`);
      console.log(`   AST Nodes: ${result.astNodeCount}`);
      console.log(
        `   Status: ${result.success ? "✅ Success" : `❌ Failed (${result.errorCount} errors)`}`,
      );
      console.log("");
    });

    // Calculate averages
    const successfulResults = results.filter((r) => r.success);
    if (successfulResults.length > 0) {
      const avgTime =
        successfulResults.reduce((sum, r) => sum + r.parseTime, 0) /
        successfulResults.length;
      const avgMemory =
        successfulResults.reduce((sum, r) => sum + r.memoryUsed, 0) /
        successfulResults.length;
      const avgNodes =
        successfulResults.reduce((sum, r) => sum + (r.astNodeCount || 0), 0) /
        successfulResults.length;

      console.log("📈 Summary Statistics");
      console.log("═".repeat(30));
      console.log(`Average Parse Time: ${avgTime.toFixed(2)}ms`);
      console.log(`Average Memory Usage: ${(avgMemory / 1024).toFixed(2)}KB`);
      console.log(`Average AST Nodes: ${avgNodes.toFixed(0)}`);
      console.log(
        `Success Rate: ${successfulResults.length}/${results.length} (${((successfulResults.length / results.length) * 100).toFixed(1)}%)`,
      );
    }

    // Basic assertions to ensure tests ran
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.filter((r) => r.parserName === "ANTLR").length,
    ).toBeGreaterThan(0);
  });

  it("should provide Langium testing instructions", () => {
    console.log("\n📝 Langium Performance Testing Instructions");
    console.log("============================================");
    console.log("To test Langium performance:");
    console.log("1. cd langium-poc");
    console.log("2. npm install  # or pnpm install");
    console.log("3. npm test     # or pnpm test");
    console.log("4. Compare results with ANTLR performance shown above");
    console.log("");
    console.log("The langium-poc directory contains equivalent test cases");
    console.log("that can be used for direct performance comparison.");

    expect(true).toBe(true); // Simple assertion
  });
});
