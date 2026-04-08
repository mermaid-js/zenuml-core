import { describe, it, expect, afterEach } from "bun:test";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const CLI_PATH = resolve(import.meta.dir, "zenuml.ts");
const FIXTURES_DIR = resolve(import.meta.dir, "../../test/fixtures/cli");
const PKG_PATH = resolve(import.meta.dir, "../../package.json");

// Simple ZenUML DSL for testing
const SAMPLE_DSL = "A -> B: hello";

/** Spawn the CLI as a subprocess and collect output. */
async function runCli(
  args: string[],
  options?: { stdin?: string },
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(["bun", "run", CLI_PATH, ...args], {
    cwd: resolve(import.meta.dir, "../.."),
    stdout: "pipe",
    stderr: "pipe",
    stdin: options?.stdin !== undefined ? "pipe" : undefined,
  });

  // If we need to write to stdin, do it before reading output
  if (options?.stdin !== undefined && proc.stdin) {
    // Bun.spawn stdin is a FileSink, not a WritableStream
    proc.stdin.write(options.stdin);
    proc.stdin.end();
  }

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { stdout, stderr, exitCode };
}

// Track temp files for cleanup
const tempFiles: string[] = [];
function tmpFile(name: string): string {
  const p = join(FIXTURES_DIR, name);
  tempFiles.push(p);
  return p;
}

// Ensure fixtures directory exists
import { mkdirSync } from "node:fs";
mkdirSync(FIXTURES_DIR, { recursive: true });

afterEach(() => {
  for (const f of tempFiles) {
    try { unlinkSync(f); } catch {}
  }
  tempFiles.length = 0;
});

describe("zenuml CLI", () => {
  // (a) -h prints help text containing all flag names
  it("prints help text with all flags when -h is passed", async () => {
    const { stdout, exitCode } = await runCli(["-h"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("-i, --input");
    expect(stdout).toContain("-o, --output");
    expect(stdout).toContain("-q, --quiet");
    expect(stdout).toContain("-h, --help");
    expect(stdout).toContain("-V, --version");
  });

  // (b) -V prints version matching package.json
  it("prints version matching package.json when -V is passed", async () => {
    const pkg = JSON.parse(readFileSync(PKG_PATH, "utf-8"));
    const { stdout, exitCode } = await runCli(["-V"]);
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toBe(pkg.version);
  });

  // (c) file input produces SVG output containing <svg xmlns= and </svg>
  it("produces SVG output from a file input", async () => {
    const inputPath = tmpFile("test-input.zenuml");
    const outputPath = tmpFile("test-output.svg");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const { exitCode } = await runCli(["-i", inputPath, "-o", outputPath]);
    expect(exitCode).toBe(0);

    const svg = readFileSync(outputPath, "utf-8");
    expect(svg).toContain('<svg xmlns=');
    expect(svg).toContain("</svg>");
  });

  // (d) stdin (-i -) piping works via subprocess with piped stdin
  it("reads from stdin when -i - is used", async () => {
    const { stdout, exitCode } = await runCli(["-i", "-", "-o", "-"], {
      stdin: SAMPLE_DSL,
    });
    expect(exitCode).toBe(0);
    expect(stdout).toContain('<svg xmlns=');
    expect(stdout).toContain("</svg>");
  });

  // (e) stdout (-o -) writes SVG to stdout
  it("writes SVG to stdout when -o - is used", async () => {
    const inputPath = tmpFile("test-stdout.zenuml");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const { stdout, exitCode } = await runCli(["-i", inputPath, "-o", "-"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('<svg xmlns=');
    expect(stdout).toContain("</svg>");
  });

  // (f) missing -i flag exits with code 1 and error on stderr
  it("exits with code 1 and error on stderr when -i is missing", async () => {
    const { stderr, exitCode } = await runCli([]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("-i/--input is required");
  });

  // (g) -q suppresses info output but errors still appear on stderr
  it("suppresses info output with -q but still shows errors", async () => {
    const inputPath = tmpFile("test-quiet.zenuml");
    const outputPath = tmpFile("test-quiet.svg");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    // With -q, the "Wrote ..." message should not appear
    const quiet = await runCli(["-i", inputPath, "-o", outputPath, "-q"]);
    expect(quiet.exitCode).toBe(0);
    expect(quiet.stderr).not.toContain("Wrote");

    // Without -q, the "Wrote ..." message should appear on stderr
    const loud = await runCli(["-i", inputPath, "-o", outputPath]);
    expect(loud.exitCode).toBe(0);
    expect(loud.stderr).toContain("Wrote");

    // Errors still appear on stderr even with -q
    const errResult = await runCli(["-q"]);
    expect(errResult.exitCode).toBe(1);
    expect(errResult.stderr).toContain("Error");
  });

  // (h) when -o is omitted, output file is created with .svg extension
  it("creates output file with .svg extension when -o is omitted", async () => {
    const inputPath = tmpFile("auto-output.zenuml");
    const expectedOutput = join(FIXTURES_DIR, "auto-output.svg");
    tempFiles.push(expectedOutput);
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const { exitCode } = await runCli(["-i", inputPath]);
    expect(exitCode).toBe(0);
    expect(existsSync(expectedOutput)).toBe(true);

    const svg = readFileSync(expectedOutput, "utf-8");
    expect(svg).toContain('<svg xmlns=');
    expect(svg).toContain("</svg>");
  });
});
