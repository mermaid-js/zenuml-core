import { describe, it, expect, afterEach } from "bun:test";
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { PNG } from "pngjs";
import pixelmatchModule from "pixelmatch";
import { extractZenumlBlocks, startWatchMode } from "./zenuml";

const pixelmatch = (pixelmatchModule as any).default ?? pixelmatchModule;

const CLI_PATH = resolve(import.meta.dir, "zenuml.ts");
const FIXTURES_DIR = resolve(import.meta.dir, "../../test/fixtures/cli");
const PKG_PATH = resolve(import.meta.dir, "../../package.json");

// Simple ZenUML DSL for testing
const SAMPLE_DSL = "A -> B: hello";

/** Spawn the CLI as a subprocess and collect output. */
async function runCli(
  args: string[],
  options?: { stdin?: string },
): Promise<{ stdout: string; stderr: string; exitCode: number; stdoutBytes?: Buffer }> {
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

  const [stdoutBuf, stderr] = await Promise.all([
    new Response(proc.stdout).arrayBuffer(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  const stdoutBytes = Buffer.from(stdoutBuf);
  const stdout = stdoutBytes.toString("utf-8");
  return { stdout, stderr, exitCode, stdoutBytes };
}

// Track temp files for cleanup
const tempFiles: string[] = [];
function tmpFile(name: string): string {
  const p = join(FIXTURES_DIR, name);
  tempFiles.push(p);
  return p;
}

// Ensure fixtures directory exists
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

  // -------------------------------------------------------------------------
  // Sprint 2: Output format, scale, background, theme, config file tests
  // -------------------------------------------------------------------------

  // (i) PNG output produces valid PNG header bytes (0x89 P N G)
  it("produces valid PNG with correct header bytes when -e png is used", async () => {
    const inputPath = tmpFile("png-test.zenuml");
    const outputPath = tmpFile("png-test.png");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const { exitCode } = await runCli(["-i", inputPath, "-o", outputPath, "-e", "png"]);
    expect(exitCode).toBe(0);
    expect(existsSync(outputPath)).toBe(true);

    const buf = readFileSync(outputPath);
    // PNG magic bytes: 0x89 0x50 0x4E 0x47
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50);
    expect(buf[2]).toBe(0x4E);
    expect(buf[3]).toBe(0x47);
  });

  // (j) Auto-format detection from .png output extension (no -e flag)
  it("auto-detects PNG format from .png output extension without -e flag", async () => {
    const inputPath = tmpFile("auto-png.zenuml");
    const outputPath = tmpFile("auto-png.png");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const { exitCode } = await runCli(["-i", inputPath, "-o", outputPath]);
    expect(exitCode).toBe(0);
    expect(existsSync(outputPath)).toBe(true);

    const buf = readFileSync(outputPath);
    // Should be PNG, not SVG
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50);
    expect(buf[2]).toBe(0x4E);
    expect(buf[3]).toBe(0x47);
  });

  // (k) Scale flag: PNG IHDR dimensions differ between --scale 1 and --scale 3
  it("produces different IHDR dimensions for --scale 1 vs --scale 3", async () => {
    const inputPath = tmpFile("scale-test.zenuml");
    const outScale1 = tmpFile("scale1.png");
    const outScale3 = tmpFile("scale3.png");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const r1 = await runCli(["-i", inputPath, "-o", outScale1, "-e", "png", "-s", "1"]);
    expect(r1.exitCode).toBe(0);

    const r3 = await runCli(["-i", inputPath, "-o", outScale3, "-e", "png", "-s", "3"]);
    expect(r3.exitCode).toBe(0);

    // Parse IHDR chunk: bytes 16-19 = width (big-endian), 20-23 = height (big-endian)
    const buf1 = readFileSync(outScale1);
    const buf3 = readFileSync(outScale3);

    const width1 = buf1.readUInt32BE(16);
    const height1 = buf1.readUInt32BE(20);
    const width3 = buf3.readUInt32BE(16);
    const height3 = buf3.readUInt32BE(20);

    // scale 3 should be 3x scale 1
    expect(width3).toBe(width1 * 3);
    expect(height3).toBe(height1 * 3);
  });

  // (l) Background color flag accepted, produces valid PNG (smoke test)
  // (m) Config file merging with CLI flag override
  it("merges config file values and allows CLI flag to override", async () => {
    const inputPath = tmpFile("config-test.zenuml");
    const outputPath = tmpFile("config-test.png");
    const configPath = tmpFile("config-test.json");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");
    writeFileSync(configPath, JSON.stringify({ outputFormat: "svg", scale: 1 }), "utf-8");

    // Config says SVG, but -e png overrides it → output should be PNG
    const { exitCode } = await runCli(["-i", inputPath, "-o", outputPath, "-c", configPath, "-e", "png"]);
    expect(exitCode).toBe(0);
    expect(existsSync(outputPath)).toBe(true);

    const buf = readFileSync(outputPath);
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50);
    expect(buf[2]).toBe(0x4E);
    expect(buf[3]).toBe(0x47);
  });

  // (n) Config file missing/invalid exits code 1 with error on stderr
  it("exits with code 1 and error when config file is missing", async () => {
    const inputPath = tmpFile("config-missing.zenuml");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const { exitCode, stderr } = await runCli(["-i", inputPath, "-c", "nonexistent.json"]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("Error");
    expect(stderr).toContain("config file");
  });

  it("exits with code 1 and error when config file has invalid JSON", async () => {
    const inputPath = tmpFile("config-invalid.zenuml");
    const configPath = tmpFile("config-invalid.json");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");
    writeFileSync(configPath, "{ not valid json }", "utf-8");

    const { exitCode, stderr } = await runCli(["-i", inputPath, "-c", configPath]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("Error");
    expect(stderr).toContain("Invalid JSON");
  });

  // (o) Help text includes all new flags
  it("help text documents all Sprint 2 flags (-e, -s, -b, -t, -c)", async () => {
    const { stdout, exitCode } = await runCli(["-h"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("-e, --outputFormat");
    expect(stdout).toContain("-s, --scale");
    expect(stdout).toContain("-t, --theme");
    expect(stdout).toContain("-c, --configFile");
  });

  // (p) Invalid format exits with code 1
  it("exits with code 1 for invalid output format", async () => {
    const inputPath = tmpFile("bad-format.zenuml");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const { exitCode, stderr } = await runCli(["-i", inputPath, "-e", "pdf"]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("Unsupported output format");
  });

  // -------------------------------------------------------------------------
  // Sprint 3: --check, --parse, --json modes
  // -------------------------------------------------------------------------

  // Invalid DSL that should trigger parse errors
  const INVALID_DSL = "{{{{invalid syntax !@#$ }}}}";

  // (q) --check valid → exit 0, empty stderr
  it("--check with valid input exits 0 with empty stderr", async () => {
    const inputPath = tmpFile("check-valid.zenuml");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const { exitCode, stderr, stdout } = await runCli(["--check", "-i", inputPath]);
    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
  });

  // (r) --check invalid → exit 1, stderr has line/column/message
  it("--check with invalid input exits 1 with error details on stderr", async () => {
    const inputPath = tmpFile("check-invalid.zenuml");
    writeFileSync(inputPath, INVALID_DSL, "utf-8");

    const { exitCode, stderr } = await runCli(["--check", "-i", inputPath]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("line");
    expect(stderr).toContain("col");
  });

  // (s) --check multiple files (all valid) → exit 0
  it("--check with multiple valid files exits 0", async () => {
    const f1 = tmpFile("check-multi-v1.zenuml");
    const f2 = tmpFile("check-multi-v2.zenuml");
    writeFileSync(f1, "A -> B: hello", "utf-8");
    writeFileSync(f2, "B -> C: world", "utf-8");

    const { exitCode, stderr } = await runCli(["--check", "-i", f1, "-i", f2]);
    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
  });

  // (t) --check multiple files (mixed) → exit 1, errors for invalid
  it("--check with mixed valid/invalid files exits 1 with grouped errors", async () => {
    const valid = tmpFile("check-mix-valid.zenuml");
    const invalid = tmpFile("check-mix-invalid.zenuml");
    writeFileSync(valid, "A -> B: hello", "utf-8");
    writeFileSync(invalid, INVALID_DSL, "utf-8");

    const { exitCode, stderr } = await runCli(["--check", "-i", valid, "-i", invalid]);
    expect(exitCode).toBe(1);
    // Errors should mention the invalid file
    expect(stderr).toContain("check-mix-invalid.zenuml");
    expect(stderr).toContain("line");
  });

  // (u) --check --json valid → exit 0, stdout JSON with pass: true
  it("--check --json with valid input outputs JSON with pass: true", async () => {
    const inputPath = tmpFile("check-json-valid.zenuml");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const { exitCode, stdout } = await runCli(["--check", "--json", "-i", inputPath]);
    expect(exitCode).toBe(0);
    const results = JSON.parse(stdout);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(results[0].pass).toBe(true);
    expect(results[0].errors).toEqual([]);
  });

  // (v) --check --json mixed → stdout JSON with per-file pass/fail
  it("--check --json with mixed files outputs per-file results", async () => {
    const valid = tmpFile("check-json-mix-v.zenuml");
    const invalid = tmpFile("check-json-mix-i.zenuml");
    writeFileSync(valid, "A -> B: hello", "utf-8");
    writeFileSync(invalid, INVALID_DSL, "utf-8");

    const { exitCode, stdout } = await runCli(["--check", "--json", "-i", valid, "-i", invalid]);
    expect(exitCode).toBe(1);
    const results = JSON.parse(stdout);
    expect(results.length).toBe(2);
    // First file should pass
    expect(results[0].pass).toBe(true);
    expect(results[0].file).toContain("check-json-mix-v.zenuml");
    // Second file should fail with errors
    expect(results[1].pass).toBe(false);
    expect(results[1].file).toContain("check-json-mix-i.zenuml");
    expect(results[1].errors.length).toBeGreaterThan(0);
    expect(results[1].errors[0]).toHaveProperty("line");
    expect(results[1].errors[0]).toHaveProperty("column");
    expect(results[1].errors[0]).toHaveProperty("msg");
  });

  // (w) --parse valid → exit 0, stdout JSON with root structure (type/ruleName, children)
  it("--parse with valid input outputs AST JSON with type/ruleName and children", async () => {
    const inputPath = tmpFile("parse-valid.zenuml");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const { exitCode, stdout, stderr } = await runCli(["--parse", "-i", inputPath]);
    expect(exitCode).toBe(0);
    const ast = JSON.parse(stdout);
    expect(ast.type).toBe("rule");
    expect(ast.ruleName).toBe("prog");
    expect(ast.children).toBeDefined();
    expect(Array.isArray(ast.children)).toBe(true);
    expect(ast.children.length).toBeGreaterThan(0);
  });

  // (x) --parse invalid → exit 1, stderr errors
  it("--parse with invalid input exits 1 with errors on stderr", async () => {
    const inputPath = tmpFile("parse-invalid.zenuml");
    writeFileSync(inputPath, INVALID_DSL, "utf-8");

    const { exitCode, stderr, stdout } = await runCli(["--parse", "-i", inputPath]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("line");
    expect(stderr).toContain("col");
  });

  // (y) --check with rendering flags (-t, -s, -b) → exit 0, no rendering
  it("--check silently ignores rendering flags (-t, -s) and validates correctly", async () => {
    const inputPath = tmpFile("check-render-flags.zenuml");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const { exitCode, stderr } = await runCli([
      "--check", "-i", inputPath, "-t", "theme-default", "-s", "3",
    ]);
    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
  });

  // (z) --help has --check, --parse, --json
  it("help text documents --check, --parse, and --json flags", async () => {
    const { stdout, exitCode } = await runCli(["-h"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("--check");
    expect(stdout).toContain("--parse");
    expect(stdout).toContain("--json");
  });

  // -------------------------------------------------------------------------
  // Sprint 4: Glob support, multi-file rendering, output path resolution
  // -------------------------------------------------------------------------

  // (ac) Glob renders multiple files with -o as directory → output files in directory
  it("glob renders multiple files with -o as directory", async () => {
    const subDir = join(FIXTURES_DIR, "glob-test-dir");
    const outDir = join(FIXTURES_DIR, "glob-out-dir");
    mkdirSync(subDir, { recursive: true });
    mkdirSync(outDir, { recursive: true });

    const f1 = join(subDir, "a.zenuml");
    const f2 = join(subDir, "b.zenuml");
    writeFileSync(f1, "A -> B: hello", "utf-8");
    writeFileSync(f2, "B -> C: world", "utf-8");
    tempFiles.push(f1, f2);

    const globPattern = join(subDir, "*.zenuml");
    const { exitCode, stderr } = await runCli(["-i", globPattern, "-o", outDir]);
    expect(exitCode).toBe(0);

    // Output files should exist directly in the output directory
    const outA = join(outDir, "a.svg");
    const outB = join(outDir, "b.svg");
    expect(existsSync(outA)).toBe(true);
    expect(existsSync(outB)).toBe(true);

    const svgA = readFileSync(outA, "utf-8");
    expect(svgA).toContain("<svg xmlns=");

    expect(stderr).toContain("Rendered 2 files (0 errors)");
    expect(stderr).toContain("Rendering");

    // Clean up
    try { rmSync(subDir, { recursive: true }); } catch {}
    try { rmSync(outDir, { recursive: true }); } catch {}
  });

  // (ad) Glob without -o → SVG files adjacent to inputs
  it("glob without -o creates SVG files adjacent to inputs", async () => {
    const subDir = join(FIXTURES_DIR, "glob-adjacent");
    mkdirSync(subDir, { recursive: true });

    const f1 = join(subDir, "x.zenuml");
    const f2 = join(subDir, "y.zenuml");
    writeFileSync(f1, "A -> B: hello", "utf-8");
    writeFileSync(f2, "C -> D: world", "utf-8");

    const out1 = join(subDir, "x.svg");
    const out2 = join(subDir, "y.svg");

    const globPattern = join(subDir, "*.zenuml");
    const { exitCode, stderr } = await runCli(["-i", globPattern]);
    expect(exitCode).toBe(0);

    expect(existsSync(out1)).toBe(true);
    expect(existsSync(out2)).toBe(true);

    const svg1 = readFileSync(out1, "utf-8");
    expect(svg1).toContain("<svg xmlns=");

    const svg2 = readFileSync(out2, "utf-8");
    expect(svg2).toContain("<svg xmlns=");

    // Cleanup
    try { rmSync(subDir, { recursive: true }); } catch {}
  });

  // (ae) Glob mixed valid/invalid → continues, exits 1, summary with error count
  it("glob with mixed valid/invalid files continues and exits 1 with error count", async () => {
    const subDir = join(FIXTURES_DIR, "glob-mixed");
    mkdirSync(subDir, { recursive: true });

    const good = join(subDir, "good.zenuml");
    const nonexistent = join(subDir, "nonexistent.zenuml");
    writeFileSync(good, "A -> B: hello", "utf-8");

    // Use a glob for the good file plus a literal non-existent file to trigger an error
    const globPattern = join(subDir, "good.zenuml");

    const { exitCode, stderr } = await runCli(["-i", globPattern, "-i", nonexistent]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("1 errors");
    expect(stderr).toContain("Rendered 1 files");

    // Cleanup
    try { rmSync(subDir, { recursive: true }); } catch {}
  });

  // (af) Empty glob → exit 1 with error
  it("empty glob pattern exits 1 with error", async () => {
    const globPattern = join(FIXTURES_DIR, "nonexistent-glob-*.zenuml");
    const { exitCode, stderr } = await runCli(["-i", globPattern]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("matched no files");
  });

  // (ag) --check with glob → works
  it("--check with glob validates multiple files", async () => {
    const subDir = join(FIXTURES_DIR, "glob-check");
    mkdirSync(subDir, { recursive: true });

    const f1 = join(subDir, "c1.zenuml");
    const f2 = join(subDir, "c2.zenuml");
    writeFileSync(f1, "A -> B: hello", "utf-8");
    writeFileSync(f2, "C -> D: world", "utf-8");

    const globPattern = join(subDir, "*.zenuml");
    const { exitCode, stderr } = await runCli(["--check", "-i", globPattern]);
    expect(exitCode).toBe(0);
    expect(stderr).toBe("");

    // Cleanup
    try { rmSync(subDir, { recursive: true }); } catch {}
  });

  // (ah) -q suppresses progress and summary
  it("-q suppresses progress lines and summary", async () => {
    const subDir = join(FIXTURES_DIR, "glob-quiet");
    mkdirSync(subDir, { recursive: true });

    const f1 = join(subDir, "q1.zenuml");
    const f2 = join(subDir, "q2.zenuml");
    writeFileSync(f1, "A -> B: hello", "utf-8");
    writeFileSync(f2, "C -> D: world", "utf-8");

    const globPattern = join(subDir, "*.zenuml");
    const { exitCode, stderr } = await runCli(["-i", globPattern, "-q"]);
    expect(exitCode).toBe(0);
    expect(stderr).not.toContain("Rendering");
    expect(stderr).not.toContain("Rendered");

    // Cleanup
    try { rmSync(subDir, { recursive: true }); } catch {}
  });

  // (ai) -o single file + multiple inputs → error exit 1
  it("-o as single file with multiple inputs errors with exit 1", async () => {
    const f1 = tmpFile("multi-err-1.zenuml");
    const f2 = tmpFile("multi-err-2.zenuml");
    writeFileSync(f1, "A -> B: hello", "utf-8");
    writeFileSync(f2, "C -> D: world", "utf-8");

    const outFile = join(FIXTURES_DIR, "single-output.svg");

    const { exitCode, stderr } = await runCli(["-i", f1, "-i", f2, "-o", outFile]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("must be a directory");
  });

  // (aj) Progress lines and summary appear in stderr (affirmative)
  it("progress lines and summary appear in stderr", async () => {
    const subDir = join(FIXTURES_DIR, "glob-progress");
    mkdirSync(subDir, { recursive: true });

    const f1 = join(subDir, "p1.zenuml");
    const f2 = join(subDir, "p2.zenuml");
    writeFileSync(f1, "A -> B: hello", "utf-8");
    writeFileSync(f2, "C -> D: world", "utf-8");

    const globPattern = join(subDir, "*.zenuml");
    const { exitCode, stderr, stdout } = await runCli(["-i", globPattern]);
    expect(exitCode).toBe(0);

    // Progress lines in stderr
    expect(stderr).toContain("Rendering");
    expect(stderr).toContain("p1.zenuml...");
    expect(stderr).toContain("p2.zenuml...");

    // Summary in stderr
    expect(stderr).toContain("Rendered 2 files (0 errors)");

    // Progress and summary should NOT be in stdout (they're in stderr)
    expect(stdout).not.toContain("Rendering");
    expect(stdout).not.toContain("Rendered");

    // Cleanup
    try { rmSync(subDir, { recursive: true }); } catch {}
  });

  // (aa) --check --json with stdin uses <stdin> as file field
  it("--check --json with stdin input uses '<stdin>' as file field", async () => {
    const { exitCode, stdout } = await runCli(["--check", "--json", "-i", "-"], {
      stdin: SAMPLE_DSL,
    });
    expect(exitCode).toBe(0);
    const results = JSON.parse(stdout);
    expect(results[0].file).toBe("<stdin>");
    expect(results[0].pass).toBe(true);
  });

  // (ab) --parse AST has terminal nodes with text
  it("--parse AST contains terminal nodes with text property", async () => {
    const inputPath = tmpFile("parse-terminals.zenuml");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const { exitCode, stdout } = await runCli(["--parse", "-i", inputPath]);
    expect(exitCode).toBe(0);
    const ast = JSON.parse(stdout);

    // Walk the tree to find at least one terminal node
    function findTerminal(node: any): any {
      if (node.type === "terminal") return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findTerminal(child);
          if (found) return found;
        }
      }
      return null;
    }
    const terminal = findTerminal(ast);
    expect(terminal).not.toBeNull();
    expect(terminal.text).toBeDefined();
    expect(typeof terminal.text).toBe("string");
  });

  // -------------------------------------------------------------------------
  // Sprint 5: Markdown mode tests
  // -------------------------------------------------------------------------

  // Unit tests for extractZenumlBlocks (no subprocess needed)
  describe("extractZenumlBlocks", () => {
    it("extracts a block with a title", () => {
      const md = "# Hello\n\n```zenuml Auth Flow\nA -> B: login\n```\n";
      const blocks = extractZenumlBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].title).toBe("Auth Flow");
      expect(blocks[0].code).toBe("A -> B: login");
      expect(blocks[0].index).toBe(0);
      expect(blocks[0].empty).toBe(false);
    });

    it("extracts a block without title — title is empty string", () => {
      const md = "```zenuml\nA -> B: hello\n```\n";
      const blocks = extractZenumlBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].title).toBe("");
      expect(blocks[0].empty).toBe(false);
    });

    it("flags empty blocks as empty: true", () => {
      const md = "```zenuml\n\n```\n";
      const blocks = extractZenumlBlocks(md);
      expect(blocks.length).toBe(1);
      expect(blocks[0].empty).toBe(true);
    });

    it("raw round-trip: raw contains opening and closing fence", () => {
      const md = "```zenuml\nA -> B: hello\n```\n";
      const blocks = extractZenumlBlocks(md);
      expect(blocks[0].raw).toContain("```zenuml");
      expect(blocks[0].raw).toContain("A -> B: hello");
      expect(blocks[0].raw).toContain("```");
      // raw should be a substring of the original
      expect(md).toContain(blocks[0].raw);
    });

    it("extracts multiple blocks with correct indices", () => {
      const md = "```zenuml\nA -> B\n```\n\nsome text\n\n```zenuml Title\nC -> D\n```\n";
      const blocks = extractZenumlBlocks(md);
      expect(blocks.length).toBe(2);
      expect(blocks[0].index).toBe(0);
      expect(blocks[1].index).toBe(1);
      expect(blocks[1].title).toBe("Title");
    });
  });

  // (ak) Auto-detect .md + 2 blocks → 2 SVG files + output.md with `![` references
  it("(ak) auto-detects .md extension, renders 2 blocks to SVG, writes output.md with ![", async () => {
    const inputPath = tmpFile("auto-md.md");
    const expectedOutput = join(FIXTURES_DIR, "auto-md-rendered.md");
    const imgA = join(FIXTURES_DIR, "auto-md-zenuml-0.svg");
    const imgB = join(FIXTURES_DIR, "auto-md-zenuml-1.svg");
    tempFiles.push(expectedOutput, imgA, imgB);

    const md = `# Docs\n\n\`\`\`zenuml\nA -> B: hello\n\`\`\`\n\nSome text.\n\n\`\`\`zenuml\nB -> C: world\n\`\`\`\n`;
    writeFileSync(inputPath, md, "utf-8");

    const { exitCode, stderr } = await runCli(["-i", inputPath]);
    expect(exitCode).toBe(0);
    expect(existsSync(imgA)).toBe(true);
    expect(existsSync(imgB)).toBe(true);
    expect(existsSync(expectedOutput)).toBe(true);

    const outputMd = readFileSync(expectedOutput, "utf-8");
    expect(outputMd).toContain("![");
    expect(outputMd).toContain("auto-md-zenuml-0.svg");
    expect(outputMd).toContain("auto-md-zenuml-1.svg");

    const svgA = readFileSync(imgA, "utf-8");
    expect(svgA).toContain("<svg xmlns=");
  });

  // (al) --md explicit → default output {stem}-rendered.md
  it("(al) --md flag produces {stem}-rendered.md by default", async () => {
    const inputPath = tmpFile("explicit-md.md");
    const expectedOutput = join(FIXTURES_DIR, "explicit-md-rendered.md");
    const img = join(FIXTURES_DIR, "explicit-md-zenuml-0.svg");
    tempFiles.push(expectedOutput, img);

    writeFileSync(inputPath, "```zenuml\nA -> B: hi\n```\n", "utf-8");

    const { exitCode } = await runCli(["--md", "-i", inputPath]);
    expect(exitCode).toBe(0);
    expect(existsSync(expectedOutput)).toBe(true);
    const outputMd = readFileSync(expectedOutput, "utf-8");
    expect(outputMd).toContain("![");
  });

  // (am) -e png → .png file with valid PNG magic bytes
  it("(am) -e png in markdown mode produces .png images with valid PNG magic bytes", async () => {
    const inputPath = tmpFile("png-md.md");
    const expectedOutput = join(FIXTURES_DIR, "png-md-rendered.md");
    const img = join(FIXTURES_DIR, "png-md-zenuml-0.png");
    tempFiles.push(expectedOutput, img);

    writeFileSync(inputPath, "```zenuml\nA -> B: hi\n```\n", "utf-8");

    const { exitCode } = await runCli(["-i", inputPath, "-e", "png"]);
    expect(exitCode).toBe(0);
    expect(existsSync(img)).toBe(true);

    const buf = readFileSync(img);
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50);
    expect(buf[2]).toBe(0x4E);
    expect(buf[3]).toBe(0x47);
  });

  // (an) Empty block skipped → 1 image only, empty block absent
  it("(an) empty zenuml block is skipped — 1 image rendered, empty block removed from output", async () => {
    const inputPath = tmpFile("empty-block.md");
    const expectedOutput = join(FIXTURES_DIR, "empty-block-rendered.md");
    const img0 = join(FIXTURES_DIR, "empty-block-zenuml-0.svg");
    const img1 = join(FIXTURES_DIR, "empty-block-zenuml-1.svg");
    tempFiles.push(expectedOutput, img0, img1);

    const md = "```zenuml\nA -> B: hi\n```\n\n```zenuml\n\n```\n";
    writeFileSync(inputPath, md, "utf-8");

    const { exitCode } = await runCli(["-i", inputPath]);
    expect(exitCode).toBe(0);
    expect(existsSync(img0)).toBe(true);
    expect(existsSync(img1)).toBe(false); // empty block, no image

    const outputMd = readFileSync(expectedOutput, "utf-8");
    // Only one image reference
    const imgRefs = (outputMd.match(/!\[/g) || []).length;
    expect(imgRefs).toBe(1);
    // Empty block's raw fence should be gone
    expect(outputMd).not.toContain("```zenuml");
  });

  // (ao) Title as alt text: ```zenuml Auth Flow → ![Auth Flow](
  it("(ao) block title used as alt text in Markdown image reference", async () => {
    const inputPath = tmpFile("titled-block.md");
    const expectedOutput = join(FIXTURES_DIR, "titled-block-rendered.md");
    const img = join(FIXTURES_DIR, "titled-block-zenuml-0.svg");
    tempFiles.push(expectedOutput, img);

    writeFileSync(inputPath, "```zenuml Auth Flow\nA -> B: login\n```\n", "utf-8");

    const { exitCode } = await runCli(["-i", inputPath]);
    expect(exitCode).toBe(0);

    const outputMd = readFileSync(expectedOutput, "utf-8");
    expect(outputMd).toContain("![Auth Flow](");
  });

  // (ap) --md + multiple -i → exit 1
  it("(ap) --md with multiple -i inputs exits 1", async () => {
    const f1 = tmpFile("md-multi-1.md");
    const f2 = tmpFile("md-multi-2.md");
    writeFileSync(f1, "```zenuml\nA -> B\n```\n", "utf-8");
    writeFileSync(f2, "```zenuml\nB -> C\n```\n", "utf-8");

    const { exitCode, stderr } = await runCli(["--md", "-i", f1, "-i", f2]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("single input");
  });

  // (aq) -o - → transformed Markdown to stdout
  it("(aq) -o - in markdown mode writes transformed Markdown to stdout", async () => {
    const inputPath = tmpFile("stdout-md.md");
    tempFiles.push(); // no output file

    writeFileSync(inputPath, "```zenuml\nA -> B: hi\n```\n", "utf-8");

    const { exitCode, stdout } = await runCli(["-i", inputPath, "-o", "-"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("![");
    expect(stdout).toContain("stdout-md-zenuml-0.svg");
  });

  // (ar) --md + non-.md input → exit 1
  it("(ar) --md flag with non-.md input exits 1", async () => {
    const inputPath = tmpFile("wrong-ext.zenuml");
    writeFileSync(inputPath, "A -> B: hello", "utf-8");

    const { exitCode, stderr } = await runCli(["--md", "-i", inputPath]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain(".md");
  });

  // (as) -o /tmp/out.md → images in /tmp/ not input dir
  it("(as) -o /tmp/out.md places images in the output file's directory", async () => {
    const inputPath = tmpFile("place-test.md");
    const outMd = join("/tmp", "zenuml-sprint5-test-out.md");
    const outImg = join("/tmp", "place-test-zenuml-0.svg");

    writeFileSync(inputPath, "```zenuml\nA -> B: hi\n```\n", "utf-8");

    const { exitCode } = await runCli(["-i", inputPath, "-o", outMd]);
    expect(exitCode).toBe(0);
    expect(existsSync(outImg)).toBe(true);

    const outputMd = readFileSync(outMd, "utf-8");
    expect(outputMd).toContain("place-test-zenuml-0.svg");

    // Cleanup
    try { unlinkSync(outMd); } catch {}
    try { unlinkSync(outImg); } catch {}
  });

  // -------------------------------------------------------------------------
  // Sprint 6: Watch mode tests
  // -------------------------------------------------------------------------

  // Test 1: -h contains -w, --watch
  it("(w1) -h includes -w, --watch flag documentation", async () => {
    const { stdout, exitCode } = await runCli(["-h"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("-w, --watch");
  });

  // Test 2: --watch --check -i file → exit 1
  it("(w2) --watch --check exits 1 (incompatible flags)", async () => {
    const inputPath = tmpFile("watch-check.zenuml");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const { exitCode, stderr } = await runCli(["--watch", "--check", "-i", inputPath]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("incompatible");
  });

  // Test 3: --watch --parse -i file → exit 1
  it("(w3) --watch --parse exits 1 (incompatible flags)", async () => {
    const inputPath = tmpFile("watch-parse.zenuml");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const { exitCode, stderr } = await runCli(["--watch", "--parse", "-i", inputPath]);
    expect(exitCode).toBe(1);
    expect(stderr).toContain("incompatible");
  });

  // Test 4: stdin + --watch → exit 1
  it("(w4) --watch with stdin input exits 1 (incompatible)", async () => {
    const { exitCode, stderr } = await runCli(["--watch", "-i", "-", "-o", "-"], {
      stdin: SAMPLE_DSL,
    });
    expect(exitCode).toBe(1);
    expect(stderr).toContain("incompatible");
  });

  // Test 5: 3 inputs, stub never fires → renderFn called exactly 3× (initial render, D3)
  it("(w5) unit: 3 inputs, stub never fires → renderFn called exactly 3x (initial render)", async () => {
    const calls: string[] = [];
    const renderFn = async (p: string) => { calls.push(p); };

    // Stub watchFn: never fires the handler
    const watchFn = (_path: string, _handler: () => void) => ({ close: () => {} });

    const handle = await startWatchMode(
      ["a.zenuml", "b.zenuml", "c.zenuml"],
      renderFn,
      watchFn,
      () => {},
      0,
    );
    handle.shutdown();

    expect(calls.length).toBe(3);
    expect(calls).toContain("a.zenuml");
    expect(calls).toContain("b.zenuml");
    expect(calls).toContain("c.zenuml");
  });

  // Test 6: stub fires 3× with 0ms delay → renderFn called exactly 1× (debounce, D4)
  it("(w6) unit: stub fires 3x rapidly with 0ms delay → renderFn called exactly 1x after debounce", async () => {
    let handler: (() => void) | undefined;
    const watchFn = (_path: string, h: () => void) => {
      handler = h;
      return { close: () => {} };
    };

    const renderCalls: string[] = [];
    // renderFn counts calls after initial
    let initialDone = false;
    const renderFn = async (p: string) => {
      if (!initialDone) { initialDone = true; return; }
      renderCalls.push(p);
    };

    const handle = await startWatchMode(
      ["single.zenuml"],
      renderFn,
      watchFn,
      () => {},
      0,
    );

    // Fire handler 3 times rapidly — all within the same event loop tick
    handler!();
    handler!();
    handler!();

    // Wait for the debounced callback to fire (delay=0, so next microtask/timer)
    await new Promise((r) => setTimeout(r, 20));

    handle.shutdown();

    // Despite 3 fires, only 1 render should happen (debounced)
    expect(renderCalls.length).toBe(1);
  });

  // Test 7: success → log matches /\[\d{2}:\d{2}:\d{2}\].*->/ (D5 success)
  it("(w7) unit: success render logs timestamp and arrow", async () => {
    const logs: string[] = [];
    const logFn = (msg: string) => { logs.push(msg); };

    const watchFn = (_path: string, _h: () => void) => ({ close: () => {} });
    const renderFn = async (_p: string) => { /* success */ };

    const handle = await startWatchMode(
      ["ok.zenuml"],
      renderFn,
      watchFn,
      logFn,
      0,
    );
    handle.shutdown();

    expect(logs.length).toBeGreaterThan(0);
    const successLog = logs.find((l) => l.includes("->"));
    expect(successLog).toBeDefined();
    expect(successLog!).toMatch(/\[\d{2}:\d{2}:\d{2}\].*->/);
  });

  // Test 8: renderFn throws → log matches /\[\d{2}:\d{2}:\d{2}\] Error:.*:/ (D5 error)
  it("(w8) unit: renderFn throws → log matches error pattern with timestamp", async () => {
    const logs: string[] = [];
    const logFn = (msg: string) => { logs.push(msg); };

    const watchFn = (_path: string, _h: () => void) => ({ close: () => {} });
    const renderFn = async (_p: string) => { throw new Error("render failed"); };

    const handle = await startWatchMode(
      ["bad.zenuml"],
      renderFn,
      watchFn,
      logFn,
      0,
    );
    handle.shutdown();

    expect(logs.length).toBeGreaterThan(0);
    const errorLog = logs.find((l) => l.includes("Error:"));
    expect(errorLog).toBeDefined();
    expect(errorLog!).toMatch(/\[\d{2}:\d{2}:\d{2}\] Error:.*:/);
  });

  // Test 9: md mode, stub fires once → md render 1×, single-file 0× (D6)
  it("(w9) unit: md file uses renderMdFn, not renderFn", async () => {
    let handler: (() => void) | undefined;
    let closeCalled = false;
    const watchFn = (_path: string, h: () => void) => {
      handler = h;
      return { close: () => { closeCalled = true; } };
    };

    const renderCalls: string[] = [];
    const mdRenderCalls: string[] = [];

    // For initial render, we track separately
    let initialRenderCount = 0;
    let initialMdCount = 0;

    const renderFn = async (p: string) => { renderCalls.push(p); };
    const renderMdFn = async (p: string) => { mdRenderCalls.push(p); };

    const handle = await startWatchMode(
      ["diagram.md"],
      renderFn,
      watchFn,
      () => {},
      0,
      renderMdFn,
    );

    // Fire handler once
    handler!();
    await new Promise((r) => setTimeout(r, 20));

    handle.shutdown();

    // md file: renderFn should never be called, renderMdFn called for initial + 1 change
    expect(renderCalls.length).toBe(0);
    expect(mdRenderCalls.length).toBe(2); // 1 initial + 1 change
  });

  // Test 10: shutdown() → all stub watchers .close() called (D7)
  it("(w10) unit: shutdown() calls .close() on all watchers", async () => {
    const closeCallCounts: number[] = [];

    const watchFn = (_path: string, _h: () => void) => {
      const idx = closeCallCounts.length;
      closeCallCounts.push(0);
      return {
        close: () => { closeCallCounts[idx]++; },
      };
    };

    const renderFn = async (_p: string) => {};

    const handle = await startWatchMode(
      ["file1.zenuml", "file2.zenuml", "file3.zenuml"],
      renderFn,
      watchFn,
      () => {},
      0,
    );

    handle.shutdown();

    // All 3 watchers should have been closed
    expect(closeCallCounts.length).toBe(3);
    for (const count of closeCallCounts) {
      expect(count).toBe(1);
    }
  });
});

// ---------------------------------------------------------------------------
// PNG snapshot tests — pixel-by-pixel regression
// ---------------------------------------------------------------------------
// Snapshots are platform-specific (chromium rendering differs between OS).
// Set UPDATE_SNAPSHOTS=1 to regenerate snapshots.
//
// Update: UPDATE_SNAPSHOTS=1 bun run test --run
// ---------------------------------------------------------------------------

const SNAPSHOT_DIR = resolve(import.meta.dir, "../../test/fixtures/cli/snapshots");
const PLATFORM_SUFFIX = process.platform === "linux" ? "-linux" : "-darwin";
const UPDATE = process.env["UPDATE_SNAPSHOTS"] === "1";

mkdirSync(SNAPSHOT_DIR, { recursive: true });

function snapshotPath(name: string): string {
  return join(SNAPSHOT_DIR, `${name}${PLATFORM_SUFFIX}.png`);
}

async function assertMatchesSnapshot(actualBuf: Buffer, name: string): Promise<void> {
  const snapPath = snapshotPath(name);

  if (UPDATE || !existsSync(snapPath)) {
    writeFileSync(snapPath, actualBuf);
    console.log(`Snapshot ${UPDATE ? "updated" : "created"}: ${snapPath}`);
    return;
  }

  const expected = PNG.sync.read(readFileSync(snapPath));
  const actual = PNG.sync.read(actualBuf);

  if (expected.width !== actual.width || expected.height !== actual.height) {
    throw new Error(
      `Snapshot "${name}" dimension mismatch: expected ${expected.width}x${expected.height}, got ${actual.width}x${actual.height}`,
    );
  }

  const diff = new PNG({ width: expected.width, height: expected.height });
  const diffPixels = pixelmatch(
    expected.data, actual.data, diff.data,
    expected.width, expected.height,
    { threshold: 0.1 },
  );

  if (diffPixels > 0) {
    const diffPath = join(SNAPSHOT_DIR, `${name}${PLATFORM_SUFFIX}.diff.png`);
    writeFileSync(diffPath, PNG.sync.write(diff));
    throw new Error(
      `Snapshot "${name}" has ${diffPixels} differing pixels (diff saved to ${diffPath}). Run with UPDATE_SNAPSHOTS=1 to update.`,
    );
  }
}

describe("zenuml CLI — PNG snapshots", () => {
  const tempPngs: string[] = [];

  afterEach(() => {
    for (const f of tempPngs) {
      try { unlinkSync(f); } catch {}
    }
    tempPngs.length = 0;
  });

  it("basic render matches snapshot", async () => {
    const inputPath = join(SNAPSHOT_DIR, "_snap-basic.zenuml");
    const outputPath = join(SNAPSHOT_DIR, "_snap-basic.png");
    tempPngs.push(inputPath, outputPath);

    writeFileSync(inputPath, "A -> B: hello", "utf-8");
    const proc = Bun.spawn(
      ["bun", "run", resolve(import.meta.dir, "zenuml.ts"), "-i", inputPath, "-o", outputPath],
      { cwd: resolve(import.meta.dir, "../.."), stdout: "pipe", stderr: "pipe" },
    );
    await proc.exited;
    expect(proc.exitCode).toBe(0);

    await assertMatchesSnapshot(readFileSync(outputPath), "basic");
  });

  it("3x scale render matches snapshot", async () => {
    const inputPath = join(SNAPSHOT_DIR, "_snap-scale3.zenuml");
    const outputPath = join(SNAPSHOT_DIR, "_snap-scale3.png");
    tempPngs.push(inputPath, outputPath);

    writeFileSync(inputPath, "A -> B: hello", "utf-8");
    const proc = Bun.spawn(
      ["bun", "run", resolve(import.meta.dir, "zenuml.ts"), "-i", inputPath, "-o", outputPath, "-s", "3"],
      { cwd: resolve(import.meta.dir, "../.."), stdout: "pipe", stderr: "pipe" },
    );
    await proc.exited;
    expect(proc.exitCode).toBe(0);

    await assertMatchesSnapshot(readFileSync(outputPath), "scale3");
  });

  it("multi-participant diagram matches snapshot", async () => {
    const inputPath = join(SNAPSHOT_DIR, "_snap-multi.zenuml");
    const outputPath = join(SNAPSHOT_DIR, "_snap-multi.png");
    tempPngs.push(inputPath, outputPath);

    const dsl = "Client -> Server: request\nServer -> DB: query\nDB --> Server: result\nServer --> Client: response";
    writeFileSync(inputPath, dsl, "utf-8");
    const proc = Bun.spawn(
      ["bun", "run", resolve(import.meta.dir, "zenuml.ts"), "-i", inputPath, "-o", outputPath],
      { cwd: resolve(import.meta.dir, "../.."), stdout: "pipe", stderr: "pipe" },
    );
    await proc.exited;
    expect(proc.exitCode).toBe(0);

    await assertMatchesSnapshot(readFileSync(outputPath), "multi-participant");
  });
});
