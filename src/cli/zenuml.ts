#!/usr/bin/env bun
/**
 * ZenUML CLI — renders ZenUML DSL text to SVG or PNG.
 *
 * Usage:
 *   zenuml -i diagram.zenuml              # writes diagram.svg
 *   zenuml -i diagram.zenuml -o out.svg   # writes out.svg
 *   zenuml -i diagram.zenuml -o out.png   # writes out.png (auto-detects format)
 *   zenuml -i diagram.zenuml -e png       # writes diagram.png
 *   zenuml -i - -o -                      # stdin → stdout
 *   cat diagram.zenuml | zenuml -i - -o - # pipe mode
 *   zenuml --check -i diagram.zenuml      # validate syntax (exit 0 = valid)
 *   zenuml --parse -i diagram.zenuml      # output AST as JSON
 */
import { renderToSvg } from "@/svg/renderToSvg";
import type { RenderOptions } from "@/svg/renderToSvg";
import Parser from "@/parser/index.js";
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { resolve, basename, extname, dirname, join, relative } from "node:path";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readVersion(): string {
  // Walk up from this file to find package.json at the project root.
  // In development the file lives at src/cli/zenuml.ts, so ../../package.json.
  // We use import.meta.dir which Bun resolves at runtime.
  const pkgPath = resolve(import.meta.dir, "../../package.json");
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    return pkg.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

function printHelp(): void {
  const help = `
Usage: zenuml [options]

Render ZenUML DSL text to SVG or PNG.

Options:
  -i, --input <file>           Input file (use "-" for stdin; repeatable)
  -o, --output <file>          Output file (use "-" for stdout; default: <input>.svg)
  -e, --outputFormat <format>  Output format: "svg" (default) or "png"
  -s, --scale <factor>         Pixel scale factor for PNG (default: 2; ignored for SVG)
  -b, --backgroundColor <col>  Background color (default: "white" for PNG, "transparent" for SVG)
  -t, --theme <name>           Theme name passed to renderer (e.g. "theme-default")
  -c, --configFile <file>      JSON config file with { theme, scale, backgroundColor, outputFormat }
  --check                      Validate syntax without rendering (exit 0 if valid, 1 if errors)
  --parse                      Parse input and output AST as JSON (exit 0 if valid, 1 if errors)
  --json                       Machine-readable JSON output for --check mode
  -q, --quiet                  Suppress non-error output
  -h, --help                   Show this help message
  -V, --version                Show version number

Config file values are overridden by CLI flags.
Rendering flags (-o, -e, -t, -s, -b) are silently ignored in --check and --parse modes.

Examples:
  zenuml -i diagram.zenuml
  zenuml -i diagram.zenuml -o output.svg
  zenuml -i diagram.zenuml -o output.png
  zenuml -i diagram.zenuml -e png -s 3
  zenuml -i diagram.zenuml -c config.json
  cat diagram.zenuml | zenuml -i - -o -
  zenuml --check -i file1.zenuml -i file2.zenuml
  zenuml --check --json -i file1.zenuml -i file2.zenuml
  zenuml --parse -i diagram.zenuml
`.trimStart();
  process.stdout.write(help);
}

// ---------------------------------------------------------------------------
// Glob expansion
// ---------------------------------------------------------------------------

/** Check if a string contains glob metacharacters. */
function isGlobPattern(s: string): boolean {
  return /[*?\[]/.test(s);
}

/** Expand inputs: literal paths pass through; glob patterns are expanded.
 *  Returns the expanded list. Throws if a glob pattern matches zero files. */
function expandInputs(inputs: string[]): string[] {
  const result: string[] = [];
  for (const input of inputs) {
    if (input === "-" || !isGlobPattern(input)) {
      result.push(input);
      continue;
    }
    // Glob expansion
    const glob = new Bun.Glob(input);
    const matches: string[] = [];
    for (const match of glob.scanSync({ cwd: process.cwd(), onlyFiles: true })) {
      matches.push(match);
    }
    if (matches.length === 0) {
      throw new Error(`Glob pattern "${input}" matched no files`);
    }
    // Sort for deterministic order
    matches.sort();
    result.push(...matches);
  }
  return result;
}

/** Check if a path is an existing directory. */
function isDirectory(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

interface CliArgs {
  inputs: string[];
  output?: string;
  outputFormat?: string;
  scale?: number;
  backgroundColor?: string;
  theme?: string;
  configFile?: string;
  check: boolean;
  parse: boolean;
  json: boolean;
  quiet: boolean;
  help: boolean;
  version: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { inputs: [], check: false, parse: false, json: false, quiet: false, help: false, version: false };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    switch (arg) {
      case "-i":
      case "--input":
        i++;
        args.inputs.push(argv[i]);
        break;
      case "-o":
      case "--output":
        i++;
        args.output = argv[i];
        break;
      case "-e":
      case "--outputFormat":
        i++;
        args.outputFormat = argv[i];
        break;
      case "-s":
      case "--scale":
        i++;
        args.scale = Number(argv[i]);
        break;
      case "-b":
      case "--backgroundColor":
        i++;
        args.backgroundColor = argv[i];
        break;
      case "-t":
      case "--theme":
        i++;
        args.theme = argv[i];
        break;
      case "-c":
      case "--configFile":
        i++;
        args.configFile = argv[i];
        break;
      case "--check":
        args.check = true;
        break;
      case "--parse":
        args.parse = true;
        break;
      case "--json":
        args.json = true;
        break;
      case "-q":
      case "--quiet":
        args.quiet = true;
        break;
      case "-h":
      case "--help":
        args.help = true;
        break;
      case "-V":
      case "--version":
        args.version = true;
        break;
      default:
        process.stderr.write(`Unknown option: ${arg}\n`);
        process.exit(1);
    }
    i++;
  }
  return args;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/** Load and merge config file values (if any). CLI flags override config. */
function loadConfigFile(filePath: string): Record<string, unknown> {
  const resolved = resolve(filePath);
  let raw: string;
  try {
    raw = readFileSync(resolved, "utf-8");
  } catch {
    process.stderr.write(`Error: Cannot read config file: ${resolved}\n`);
    process.exit(1);
  }
  try {
    return JSON.parse(raw);
  } catch {
    process.stderr.write(`Error: Invalid JSON in config file: ${resolved}\n`);
    process.exit(1);
  }
}

/** Rasterize an SVG string to PNG bytes using @napi-rs/canvas. */
async function rasterizeToPng(
  svgString: string,
  svgWidth: number,
  svgHeight: number,
  scale: number,
  backgroundColor: string,
): Promise<Buffer> {
  // Dynamic import so SVG-only runs don't need the native module loaded
  const { createCanvas, Image } = await import("@napi-rs/canvas");
  const canvasWidth = Math.round(svgWidth * scale);
  const canvasHeight = Math.round(svgHeight * scale);
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // Fill background
  if (backgroundColor && backgroundColor !== "transparent") {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Draw SVG onto canvas
  const img = new Image();
  img.src = Buffer.from(svgString, "utf-8");
  ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

  return canvas.toBuffer("image/png") as Buffer;
}

// ---------------------------------------------------------------------------
// AST Serializer — converts ANTLR parse tree to JSON-safe plain object
// ---------------------------------------------------------------------------

interface AstNode {
  type: string;
  ruleName?: string;
  text?: string;
  children?: AstNode[];
}

/** Get rule names from the parser embedded in a context node. */
function getRuleNames(ctx: any): string[] | undefined {
  return ctx?.parser?.ruleNames;
}

/** Serialize an ANTLR parse tree node to a JSON-safe object. */
function serializeParseTree(node: any): AstNode {
  if (!node) return { type: "null" };

  // Terminal node (leaf token)
  if (node.symbol !== undefined) {
    return {
      type: "terminal",
      text: node.getText(),
    };
  }

  // Parser rule context node
  const ruleNames = getRuleNames(node);
  const ruleName = ruleNames && node.ruleIndex !== undefined
    ? ruleNames[node.ruleIndex]
    : undefined;

  const result: AstNode = {
    type: "rule",
  };
  if (ruleName) {
    result.ruleName = ruleName;
  }

  const children = node.children;
  if (children && children.length > 0) {
    result.children = children.map((child: any) => serializeParseTree(child));
  }

  return result;
}

// ---------------------------------------------------------------------------
// Check mode — validate syntax without rendering
// ---------------------------------------------------------------------------

interface FileCheckResult {
  file: string;
  pass: boolean;
  errors: Array<{ line: number; column: number; msg: string }>;
}

/** Read code from a file path or stdin ("-"). */
async function readCode(input: string): Promise<string> {
  if (input === "-") {
    return readStdin();
  }
  const inputPath = resolve(input);
  try {
    return readFileSync(inputPath, "utf-8");
  } catch {
    throw new Error(`Cannot read input file: ${inputPath}`);
  }
}

/** Parse one file/input and return check result. Clears Parser.ErrorDetails before each parse. */
async function checkOne(input: string): Promise<FileCheckResult> {
  const fileName = input === "-" ? "<stdin>" : input;
  let code: string;
  try {
    code = await readCode(input);
  } catch (err: any) {
    return {
      file: fileName,
      pass: false,
      errors: [{ line: 0, column: 0, msg: err.message }],
    };
  }

  // Clear accumulated errors before parsing
  Parser.Errors.length = 0;
  Parser.ErrorDetails.length = 0;

  Parser.RootContext(code);

  const errors = Parser.ErrorDetails.map((e: any) => ({
    line: e.line,
    column: e.column,
    msg: e.msg,
  }));

  return {
    file: fileName,
    pass: errors.length === 0,
    errors,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // Skip the first two entries (bun executable + script path).
  const rawArgs = process.argv.slice(2);
  const args = parseArgs(rawArgs);

  // --help
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  // --version
  if (args.version) {
    process.stdout.write(readVersion() + "\n");
    process.exit(0);
  }

  // Require input
  if (args.inputs.length === 0) {
    process.stderr.write("Error: -i/--input is required. Use -h for help.\n");
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // Glob expansion
  // ---------------------------------------------------------------------------
  let expandedInputs: string[];
  try {
    expandedInputs = expandInputs(args.inputs);
  } catch (err: any) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // --check mode: validate syntax without rendering
  // ---------------------------------------------------------------------------
  if (args.check) {
    const results: FileCheckResult[] = [];
    for (const input of expandedInputs) {
      results.push(await checkOne(input));
    }

    if (args.json) {
      // Machine-readable JSON output to stdout
      process.stdout.write(JSON.stringify(results, null, 2) + "\n");
    } else {
      // Human-readable output to stderr
      for (const r of results) {
        if (!r.pass) {
          if (expandedInputs.length > 1) {
            process.stderr.write(`${r.file}:\n`);
          }
          for (const e of r.errors) {
            const prefix = expandedInputs.length > 1 ? "  " : "";
            process.stderr.write(`${prefix}line ${e.line}, col ${e.column}: ${e.msg}\n`);
          }
        }
      }
    }

    const anyFailed = results.some((r) => !r.pass);
    process.exit(anyFailed ? 1 : 0);
  }

  // ---------------------------------------------------------------------------
  // --parse mode: output AST as JSON (single input only)
  // ---------------------------------------------------------------------------
  if (args.parse) {
    if (expandedInputs.length > 1) {
      process.stderr.write("Error: --parse supports only a single input file.\n");
      process.exit(1);
    }
    const input = expandedInputs[0];
    let code: string;
    try {
      code = await readCode(input);
    } catch (err: any) {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exit(1);
    }

    // Clear accumulated errors before parsing
    Parser.Errors.length = 0;
    Parser.ErrorDetails.length = 0;

    const tree = Parser.RootContext(code);

    if (Parser.ErrorDetails.length > 0) {
      for (const e of Parser.ErrorDetails) {
        process.stderr.write(`line ${e.line}, col ${e.column}: ${e.msg}\n`);
      }
      process.exit(1);
    }

    const ast = serializeParseTree(tree);
    process.stdout.write(JSON.stringify(ast, null, 2) + "\n");
    process.exit(0);
  }

  // ---------------------------------------------------------------------------
  // Config file merging: config file < CLI flags
  // ---------------------------------------------------------------------------
  let configScale: number | undefined;
  let configBackgroundColor: string | undefined;
  let configTheme: string | undefined;
  let configOutputFormat: string | undefined;

  if (args.configFile) {
    const cfg = loadConfigFile(args.configFile);
    if (typeof cfg.scale === "number") configScale = cfg.scale;
    if (typeof cfg.backgroundColor === "string") configBackgroundColor = cfg.backgroundColor;
    if (typeof cfg.theme === "string") configTheme = cfg.theme;
    if (typeof cfg.outputFormat === "string") configOutputFormat = cfg.outputFormat;
  }

  // ---------------------------------------------------------------------------
  // Validate: -o as single file + multiple inputs → error
  // ---------------------------------------------------------------------------
  const multipleInputs = expandedInputs.length > 1;
  if (multipleInputs && args.output && args.output !== "-" && !isDirectory(resolve(args.output))) {
    // -o is a file path (not a directory) with multiple inputs
    process.stderr.write("Error: -o must be a directory when multiple input files are provided.\n");
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // Render mode — iterate all expanded inputs
  // ---------------------------------------------------------------------------
  let rendered = 0;
  let errors = 0;

  for (const inputArg of expandedInputs) {
    // Progress reporting
    if (!args.quiet) {
      const displayName = inputArg === "-" ? "<stdin>" : inputArg;
      process.stderr.write(`Rendering ${displayName}...\n`);
    }

    try {
      await renderOneFile(inputArg, args, {
        configScale,
        configBackgroundColor,
        configTheme,
        configOutputFormat,
        multipleInputs,
      });
      rendered++;
    } catch (err: any) {
      errors++;
      process.stderr.write(`Error: ${inputArg}: ${err.message}\n`);
    }
  }

  // Summary line
  if (!args.quiet && expandedInputs.length > 1) {
    process.stderr.write(`Rendered ${rendered} files (${errors} errors)\n`);
  }

  if (errors > 0) {
    process.exit(1);
  }
}

/** Render a single input file to its output. Throws on failure. */
async function renderOneFile(
  inputArg: string,
  args: CliArgs,
  config: {
    configScale?: number;
    configBackgroundColor?: string;
    configTheme?: string;
    configOutputFormat?: string;
    multipleInputs: boolean;
  },
): Promise<void> {
  // Resolve effective values: CLI flag > config > default
  const outputPath = resolveOutput(inputArg, args.output, ".svg", config.multipleInputs);
  const autoFormatFromExt = outputPath !== "-" && extname(outputPath).toLowerCase() === ".png" ? "png" : undefined;
  const effectiveFormat = args.outputFormat ?? config.configOutputFormat ?? autoFormatFromExt ?? "svg";

  // Validate format
  if (effectiveFormat !== "svg" && effectiveFormat !== "png") {
    throw new Error(`Unsupported output format: "${effectiveFormat}". Use "svg" or "png".`);
  }

  const effectiveScale = args.scale ?? config.configScale ?? 2;
  const effectiveBackgroundColor =
    args.backgroundColor ??
    config.configBackgroundColor ??
    (effectiveFormat === "png" ? "white" : "transparent");
  const effectiveTheme = args.theme ?? config.configTheme;

  // Read input
  let code: string;
  if (inputArg === "-") {
    code = await readStdin();
  } else {
    const inputPath = resolve(inputArg);
    try {
      code = readFileSync(inputPath, "utf-8");
    } catch {
      throw new Error(`Cannot read input file: ${inputPath}`);
    }
  }

  // Build render options
  const renderOptions: RenderOptions = {};
  if (effectiveTheme) {
    renderOptions.theme = effectiveTheme as RenderOptions["theme"];
  }

  // Render SVG
  let svg: string;
  let svgWidth: number;
  let svgHeight: number;
  try {
    const result = renderToSvg(code, renderOptions);
    svg = result.svg;
    svgWidth = result.width;
    svgHeight = result.height;
  } catch (err: any) {
    throw new Error(`Failed to render diagram: ${err.message}`);
  }

  // Determine final output path (adjust extension if format is png and no explicit -o)
  let finalOutputPath = outputPath;
  if (effectiveFormat === "png" && finalOutputPath !== "-") {
    if (!args.output || isDirectory(resolve(args.output!))) {
      // Auto-generated or directory-based path: swap extension for .png
      const ext = extname(finalOutputPath);
      finalOutputPath = finalOutputPath.slice(0, -ext.length) + ".png";
    }
  }

  // Ensure output directory exists
  if (finalOutputPath !== "-") {
    const dir = dirname(finalOutputPath);
    mkdirSync(dir, { recursive: true });
  }

  // Write output
  if (effectiveFormat === "png") {
    const pngBuffer = await rasterizeToPng(svg, svgWidth, svgHeight, effectiveScale, effectiveBackgroundColor);
    if (finalOutputPath === "-") {
      process.stdout.write(pngBuffer);
    } else {
      try {
        writeFileSync(finalOutputPath, pngBuffer);
        if (!args.quiet) {
          process.stderr.write(`Wrote ${finalOutputPath}\n`);
        }
      } catch {
        throw new Error(`Cannot write output file: ${finalOutputPath}`);
      }
    }
  } else {
    // SVG output
    if (finalOutputPath === "-") {
      process.stdout.write(svg);
    } else {
      try {
        writeFileSync(finalOutputPath, svg, "utf-8");
        if (!args.quiet) {
          process.stderr.write(`Wrote ${finalOutputPath}\n`);
        }
      } catch {
        throw new Error(`Cannot write output file: ${finalOutputPath}`);
      }
    }
  }
}

function resolveOutput(input: string, output: string | undefined, defaultExt: string = ".svg", multipleInputs: boolean = false): string {
  if (output !== undefined) {
    if (output === "-") return "-";
    const resolvedOutput = resolve(output);
    if (isDirectory(resolvedOutput)) {
      // -o is a directory: output inside it with path relative to cwd, swapped extension
      if (input === "-") return "-"; // stdin + directory doesn't make sense, fall to stdout
      const relPath = relative(process.cwd(), resolve(input));
      const ext = extname(relPath);
      const base = relPath.slice(0, relPath.length - ext.length);
      return join(resolvedOutput, `${base}${defaultExt}`);
    }
    return resolvedOutput;
  }
  if (input === "-") return "-"; // stdin without -o → stdout
  // No -o: output adjacent to input with swapped extension
  const ext = extname(input);
  const base = basename(input, ext);
  const dir = dirname(resolve(input));
  return join(dir, `${base}${defaultExt}`);
}

async function readStdin(): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of Bun.stdin.stream()) {
    chunks.push(chunk as Uint8Array);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

main();
