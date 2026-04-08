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
  it("accepts -b backgroundColor and produces valid PNG", async () => {
    const inputPath = tmpFile("bgcolor-test.zenuml");
    const outputPath = tmpFile("bgcolor-test.png");
    writeFileSync(inputPath, SAMPLE_DSL, "utf-8");

    const { exitCode } = await runCli(["-i", inputPath, "-o", outputPath, "-e", "png", "-b", "red"]);
    expect(exitCode).toBe(0);
    expect(existsSync(outputPath)).toBe(true);

    const buf = readFileSync(outputPath);
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50);
    expect(buf[2]).toBe(0x4E);
    expect(buf[3]).toBe(0x47);
  });

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
    expect(stdout).toContain("-b, --backgroundColor");
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
});
