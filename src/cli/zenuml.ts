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
import { readFileSync, writeFileSync, mkdirSync, statSync, watch as fsWatch } from "node:fs";
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
  --md                         Markdown mode: render zenuml code blocks and produce output Markdown
  --check                      Validate syntax without rendering (exit 0 if valid, 1 if errors)
  --parse                      Parse input and output AST as JSON (exit 0 if valid, 1 if errors)
  --json                       Machine-readable JSON output for --check mode
  -w, --watch                  Watch input files and re-render on change (incompatible with --check, --parse, stdin)
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
  zenuml -i readme.md --md
  zenuml -i readme.md --md -e png
`.trimStart();
  process.stdout.write(help);
}

// ---------------------------------------------------------------------------
// Markdown block extractor
// ---------------------------------------------------------------------------

export interface ZenumlBlock {
  /** Zero-based index of this block among all zenuml blocks in the document */
  index: number;
  /** The ZenUML DSL code inside the fence (may be empty string for empty blocks) */
  code: string;
  /** Title extracted from the info string after "zenuml" (trimmed), or empty string */
  title: string;
  /** The full raw fence text including the opening and closing ``` lines */
  raw: string;
  /** True if the code (trimmed) is empty — these blocks should be excluded from rendering */
  empty: boolean;
}

/**
 * Extract all ```zenuml ... ``` fenced code blocks from Markdown text.
 * Returns one ZenumlBlock per block, in document order.
 */
export function extractZenumlBlocks(md: string): ZenumlBlock[] {
  const results: ZenumlBlock[] = [];
  // Match fenced code blocks that start with ```zenuml (with optional title after)
  // Handles both ``` and ~~~ fences but we only care about backtick fences for ZenUML
  const fencePattern = /^(`{3,})zenuml([^\n]*)\n([\s\S]*?)\n?\1\s*$/gm;
  let match: RegExpExecArray | null;
  let blockIndex = 0;
  while ((match = fencePattern.exec(md)) !== null) {
    const raw = match[0];
    const infoExtra = match[2]; // everything after "zenuml" on the opening line
    const code = match[3]; // content between fences
    const title = infoExtra.trim();
    const empty = code.trim().length === 0;
    results.push({ index: blockIndex++, code, title, raw, empty });
  }
  return results;
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
  md: boolean;
  watch: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { inputs: [], check: false, parse: false, json: false, quiet: false, help: false, version: false, md: false, watch: false };
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
      case "--md":
        args.md = true;
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
      case "-w":
      case "--watch":
        args.watch = true;
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
  // --watch incompatibility checks
  // ---------------------------------------------------------------------------
  if (args.watch) {
    if (args.check) {
      process.stderr.write("Error: --watch is incompatible with --check.\n");
      process.exit(1);
    }
    if (args.parse) {
      process.stderr.write("Error: --watch is incompatible with --parse.\n");
      process.exit(1);
    }
    if (expandedInputs.includes("-")) {
      process.stderr.write("Error: --watch is incompatible with stdin input.\n");
      process.exit(1);
    }
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
  // --md mode: render Markdown with zenuml code blocks
  // ---------------------------------------------------------------------------
  // Determine if we're in Markdown mode: explicit --md flag or auto-detect from extension
  const isMdMode = args.md || expandedInputs.some(
    (f) => f !== "-" && /\.(?:md|markdown)$/i.test(f),
  );

  if (isMdMode) {
    // Validate: --md with multiple inputs is an error
    if (expandedInputs.length > 1) {
      process.stderr.write("Error: --md mode supports only a single input file.\n");
      process.exit(1);
    }
    const inputArg = expandedInputs[0];

    // Validate: --md with non-.md input is an error (only when --md was explicitly passed)
    if (args.md && inputArg !== "-") {
      const ext = extname(inputArg).toLowerCase();
      if (ext !== ".md" && ext !== ".markdown") {
        process.stderr.write(`Error: --md flag requires a .md or .markdown input file, got: ${inputArg}\n`);
        process.exit(1);
      }
    }

    // Read markdown content
    let mdContent: string;
    try {
      mdContent = await readCode(inputArg);
    } catch (err: any) {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exit(1);
    }

    // Effective format for diagram images
    const effectiveFormat = args.outputFormat ?? "svg";
    if (effectiveFormat !== "svg" && effectiveFormat !== "png") {
      process.stderr.write(`Error: Unsupported output format: "${effectiveFormat}". Use "svg" or "png".\n`);
      process.exit(1);
    }

    // Determine output dir for images:
    // If -o is given (and not stdout), use that file's directory
    // Otherwise if input is a file, use input's directory
    // For -o - (stdout), images go adjacent to the input file (or cwd for stdin)
    let imageDir: string;
    let mdOutputPath: string;

    if (args.output && args.output !== "-") {
      const resolvedOutput = resolve(args.output);
      imageDir = dirname(resolvedOutput);
      mdOutputPath = resolvedOutput;
    } else if (args.output === "-") {
      // stdout: images go adjacent to input or cwd
      if (inputArg !== "-") {
        imageDir = dirname(resolve(inputArg));
      } else {
        imageDir = process.cwd();
      }
      mdOutputPath = "-";
    } else {
      // No -o: default output is {stem}-rendered.md adjacent to input
      if (inputArg !== "-") {
        const resolvedInput = resolve(inputArg);
        const inputDir = dirname(resolvedInput);
        const ext = extname(inputArg);
        const stem = basename(inputArg, ext);
        imageDir = inputDir;
        mdOutputPath = join(inputDir, `${stem}-rendered.md`);
      } else {
        imageDir = process.cwd();
        mdOutputPath = "-";
      }
    }

    // Determine stem for image file names (from input or output path)
    let imageStem: string;
    if (inputArg !== "-") {
      const ext = extname(inputArg);
      imageStem = basename(inputArg, ext);
    } else if (mdOutputPath !== "-") {
      const ext = extname(mdOutputPath);
      imageStem = basename(mdOutputPath, ext);
    } else {
      imageStem = "diagram";
    }

    // Extract zenuml blocks
    const blocks = extractZenumlBlocks(mdContent);

    // Effective render options
    const effectiveScale = args.scale ?? 2;
    const effectiveBackgroundColor =
      args.backgroundColor ?? (effectiveFormat === "png" ? "white" : "transparent");
    const effectiveTheme = args.theme;
    const renderOptions: RenderOptions = {};
    if (effectiveTheme) {
      renderOptions.theme = effectiveTheme as RenderOptions["theme"];
    }

    // Render each non-empty block and collect image paths
    const imageFiles: Map<number, string> = new Map();
    for (const block of blocks) {
      if (block.empty) continue;
      const imageFilename = `${imageStem}-zenuml-${block.index}.${effectiveFormat}`;
      const imageFilePath = join(imageDir, imageFilename);

      let svg: string;
      let svgWidth: number;
      let svgHeight: number;
      try {
        const result = renderToSvg(block.code, renderOptions);
        svg = result.svg;
        svgWidth = result.width;
        svgHeight = result.height;
      } catch (err: any) {
        process.stderr.write(`Error: Failed to render zenuml block ${block.index}: ${err.message}\n`);
        process.exit(1);
      }

      // Ensure image directory exists
      mkdirSync(imageDir, { recursive: true });

      if (effectiveFormat === "png") {
        const pngBuffer = await rasterizeToPng(svg, svgWidth, svgHeight, effectiveScale, effectiveBackgroundColor);
        writeFileSync(imageFilePath, pngBuffer);
      } else {
        writeFileSync(imageFilePath, svg, "utf-8");
      }

      if (!args.quiet) {
        process.stderr.write(`Wrote ${imageFilePath}\n`);
      }

      imageFiles.set(block.index, imageFilename);
    }

    // Replace blocks in the Markdown
    let outputMd = mdContent;
    // Process blocks in reverse order so that string offsets remain valid
    // We need to find and replace each raw block
    // Re-scan in reverse order to replace correctly
    const sortedBlocks = [...blocks].reverse();
    for (const block of sortedBlocks) {
      const altText = block.title || `diagram ${block.index + 1}`;
      if (block.empty) {
        // Remove empty blocks entirely
        outputMd = outputMd.replace(block.raw, "");
      } else {
        const imageFilename = imageFiles.get(block.index)!;
        const replacement = `![${altText}](${imageFilename})`;
        outputMd = outputMd.replace(block.raw, replacement);
      }
    }

    // Write output Markdown
    if (mdOutputPath === "-") {
      process.stdout.write(outputMd);
    } else {
      mkdirSync(dirname(mdOutputPath), { recursive: true });
      writeFileSync(mdOutputPath, outputMd, "utf-8");
      if (!args.quiet) {
        process.stderr.write(`Wrote ${mdOutputPath}\n`);
      }
    }

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
  // --watch mode
  // ---------------------------------------------------------------------------
  if (args.watch) {
    const renderForWatch = async (inputArg: string): Promise<void> => {
      await renderOneFile(inputArg, args, {
        configScale,
        configBackgroundColor,
        configTheme,
        configOutputFormat,
        multipleInputs,
      });
    };

    const renderMdForWatch = async (inputArg: string): Promise<void> => {
      // Re-invoke main md render for this file by delegating back through renderOneFile
      // but we need md-specific rendering — so call the same md render path.
      // For simplicity, we re-read and re-run the md render inline.
      let mdContent: string;
      try {
        mdContent = readFileSync(resolve(inputArg), "utf-8");
      } catch (err: any) {
        throw new Error(`Cannot read input file: ${resolve(inputArg)}`);
      }

      const effectiveFormat = args.outputFormat ?? "svg";
      if (effectiveFormat !== "svg" && effectiveFormat !== "png") {
        throw new Error(`Unsupported output format: "${effectiveFormat}". Use "svg" or "png".`);
      }

      let mdOutputPath: string;
      let imageDir: string;

      if (args.output && args.output !== "-") {
        const resolvedOutput = resolve(args.output);
        imageDir = dirname(resolvedOutput);
        mdOutputPath = resolvedOutput;
      } else if (args.output === "-") {
        imageDir = dirname(resolve(inputArg));
        mdOutputPath = "-";
      } else {
        const resolvedInput = resolve(inputArg);
        const inputDir = dirname(resolvedInput);
        const ext = extname(inputArg);
        const stem = basename(inputArg, ext);
        imageDir = inputDir;
        mdOutputPath = join(inputDir, `${stem}-rendered.md`);
      }

      const ext = extname(inputArg);
      const imageStem = basename(inputArg, ext);
      const blocks = extractZenumlBlocks(mdContent);

      const effectiveScale = args.scale ?? configScale ?? 2;
      const effectiveBackgroundColor =
        args.backgroundColor ?? configBackgroundColor ?? (effectiveFormat === "png" ? "white" : "transparent");
      const effectiveTheme = args.theme ?? configTheme;
      const renderOptions: RenderOptions = {};
      if (effectiveTheme) {
        renderOptions.theme = effectiveTheme as RenderOptions["theme"];
      }

      const imageFiles: Map<number, string> = new Map();
      for (const block of blocks) {
        if (block.empty) continue;
        const imageFilename = `${imageStem}-zenuml-${block.index}.${effectiveFormat}`;
        const imageFilePath = join(imageDir, imageFilename);

        const result = renderToSvg(block.code, renderOptions);
        const { svg, width: svgWidth, height: svgHeight } = result;

        mkdirSync(imageDir, { recursive: true });

        if (effectiveFormat === "png") {
          const pngBuffer = await rasterizeToPng(svg, svgWidth, svgHeight, effectiveScale, effectiveBackgroundColor);
          writeFileSync(imageFilePath, pngBuffer);
        } else {
          writeFileSync(imageFilePath, svg, "utf-8");
        }

        imageFiles.set(block.index, imageFilename);
      }

      let outputMd = mdContent;
      const sortedBlocks = [...blocks].reverse();
      for (const block of sortedBlocks) {
        const altText = block.title || `diagram ${block.index + 1}`;
        if (block.empty) {
          outputMd = outputMd.replace(block.raw, "");
        } else {
          const imageFilename = imageFiles.get(block.index)!;
          const replacement = `![${altText}](${imageFilename})`;
          outputMd = outputMd.replace(block.raw, replacement);
        }
      }

      if (mdOutputPath === "-") {
        process.stdout.write(outputMd);
      } else {
        mkdirSync(dirname(mdOutputPath), { recursive: true });
        writeFileSync(mdOutputPath, outputMd, "utf-8");
      }
    };

    // Detect md inputs
    const hasMdInputs = expandedInputs.some((f) => /\.(?:md|markdown)$/i.test(f));
    const renderMdFnForWatch = hasMdInputs ? renderMdForWatch : undefined;

    const watchHandle = await startWatchMode(
      expandedInputs,
      renderForWatch,
      undefined,
      undefined,
      undefined,
      renderMdFnForWatch,
    );

    process.on("SIGINT", () => {
      watchHandle.shutdown();
      process.exit(0);
    });

    // Keep the process alive (watch mode runs indefinitely)
    await new Promise<void>(() => {});
    return;
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
      // -o is a directory: output inside it using just the input's basename
      if (input === "-") return "-"; // stdin + directory doesn't make sense, fall to stdout
      const ext = extname(input);
      const base = basename(input, ext);
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

// ---------------------------------------------------------------------------
// Watch mode
// ---------------------------------------------------------------------------

/** Return a timestamp string in [HH:MM:SS] format using local time. */
function watchTimestamp(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `[${hh}:${mm}:${ss}]`;
}

export interface WatchHandle {
  shutdown: () => void;
}

/**
 * Start watch mode.
 *
 * @param inputs      Resolved file paths to watch and render.
 * @param renderFn    Called with a file path to re-render it. Must return a Promise.
 * @param watchFn     Factory for a watcher. Defaults to node:fs.watch. Must return { close() }.
 * @param log         Log function for render messages. Defaults to process.stderr.write.
 * @param delayMs     Debounce delay in milliseconds. Defaults to 100.
 * @param renderMdFn  Optional alternative render function for .md files. When provided,
 *                    .md inputs are rendered with this function instead of renderFn.
 */
export async function startWatchMode(
  inputs: string[],
  renderFn: (path: string) => Promise<void>,
  watchFn?: (path: string, handler: () => void) => { close(): void },
  log?: (msg: string) => void,
  delayMs?: number,
  renderMdFn?: (path: string) => Promise<void>,
): Promise<WatchHandle> {
  const logFn = log ?? ((msg: string) => process.stderr.write(msg + "\n"));
  const delay = delayMs ?? 100;

  // Default watcher using node:fs.watch
  const watchFactory = watchFn ?? ((path: string, handler: () => void) => {
    const watcher = fsWatch(path, () => handler());
    return { close: () => watcher.close() };
  });

  // Pick which render function to use for a given file
  function pickRender(p: string): (path: string) => Promise<void> {
    if (renderMdFn && /\.(?:md|markdown)$/i.test(p)) {
      return renderMdFn;
    }
    return renderFn;
  }

  // Perform initial render for all inputs
  for (const input of inputs) {
    const rf = pickRender(input);
    const ts = watchTimestamp();
    try {
      await rf(input);
      logFn(`${ts} Rendered ${input} -> done`);
    } catch (err: any) {
      logFn(`${ts} Error: ${input}: ${err.message}`);
    }
  }

  // Set up per-file debounced watchers
  const handles: Array<{ close(): void }> = [];
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  for (const input of inputs) {
    const rf = pickRender(input);
    const handle = watchFactory(input, () => {
      // Debounce: clear any pending timer for this file
      const existing = timers.get(input);
      if (existing !== undefined) clearTimeout(existing);
      const t = setTimeout(async () => {
        timers.delete(input);
        const ts = watchTimestamp();
        try {
          await rf(input);
          logFn(`${ts} Rendered ${input} -> done`);
        } catch (err: any) {
          logFn(`${ts} Error: ${input}: ${err.message}`);
        }
      }, delay);
      timers.set(input, t);
    });
    handles.push(handle);
  }

  function shutdown(): void {
    // Cancel pending debounce timers
    for (const t of timers.values()) {
      clearTimeout(t);
    }
    timers.clear();
    // Close all watchers
    for (const h of handles) {
      h.close();
    }
  }

  return { shutdown };
}

if (import.meta.main) {
  main();
}
