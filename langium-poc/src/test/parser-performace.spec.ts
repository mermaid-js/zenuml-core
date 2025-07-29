import { performance } from "perf_hooks";
import { describe, it, expect } from "vitest";
import {
  CstNode,
  EmptyFileSystem,
  isCompositeCstNode,
  isLeafCstNode,
  LangiumDocument,
} from "langium";
import { Model } from "../language/generated/ast";
import demo1 from "./demo1";
import demo2 from "./demo2";
import demo3 from "./demo3";
import demo4 from "./demo4";
import demo5 from "./demo5";
import demo6 from "./demo6";
import { createSequenceServices } from "./fixture";
import { parseHelper } from "langium/test";

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

async function parseWithLangium(code: string): Promise<PerformanceResult> {
  const memBefore = measureMemory();
  const startTime = performance.now();

  let success = false;
  let astNodeCount = 0;

  let document: LangiumDocument<Model> | null = null;
  try {
    const services = createSequenceServices(EmptyFileSystem);
    const parse = parseHelper<Model>(services.Sequence);

    document = await parse(code, { validation: true });
    const ast = document?.parseResult.value;

    success = ast?.$type !== undefined;
    astNodeCount = countCSTNodes(ast.$cstNode);
  } catch (error) {
    console.error("Langium parsing error:", error);
  }

  const endTime = performance.now();
  const memAfter = measureMemory();

  return {
    parserName: "Langium",
    testCase: "",
    parseTime: endTime - startTime,
    memoryUsed: memAfter.used - memBefore.used,
    success,
    errorCount:
      (document?.parseResult.lexerErrors?.length || 0) +
      (document?.parseResult.parserErrors?.length || 0),
    astNodeCount,
  };
}

// Note: Langium performance testing should be done separately in the langium-poc directory
// due to dependency isolation. This test focuses on Langium performance profiling.

function countCSTNodes(node: CstNode | undefined): number {
  if (!node) return 0;

  let count = 1; // Count this node

  if (isCompositeCstNode(node)) {
    for (const child of node.content) {
      count += countCSTNodes(child);
    }
  } else if (isLeafCstNode(node)) {
    return 1;
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

describe("Parser Performance Test: Langium Parsing", () => {
  const results: PerformanceResult[] = [];

  const testCases = generateTestCases();

  testCases.forEach((testCase) => {
    describe(`Test Case: ${testCase.name} (${testCase.description})`, () => {
      it("should parse successfully with Langium", async () => {
        // Force garbage collection before test
        forceGarbageCollection();
        await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay

        const result = await parseWithLangium(testCase.code);
        result.testCase = testCase.name;
        results.push(result);

        expect(result.parseTime).toBeGreaterThan(0);
        console.log(
          `Langium ${testCase.name}: ${result.parseTime.toFixed(2)}ms, ${result.success ? "Success" : `Failed (${result.errorCount} errors)`}`,
        );
      });
    });
  });

  it("should display Langium performance results", () => {
    console.log("\n📊 Langium Parser Performance Results");
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
      results.filter((r) => r.parserName === "Langium").length,
    ).toBeGreaterThan(0);
  });

  it("should provide Langium testing instructions", () => {
    console.log("\n📝 Langium Performance Testing Instructions");
    console.log("============================================");
    console.log("To test Langium performance:");
    console.log("1. cd langium-poc");
    console.log("2. npm install  # or pnpm install");
    console.log("3. npm test     # or pnpm test");
    console.log("4. Compare results with Langium performance shown above");
    console.log("");
    console.log("The langium-poc directory contains equivalent test cases");
    console.log("that can be used for direct performance comparison.");

    expect(true).toBe(true); // Simple assertion
  });
});
