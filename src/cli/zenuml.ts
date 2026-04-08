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
 */
import { renderToSvg } from "@/svg/renderToSvg";
import type { RenderOptions } from "@/svg/renderToSvg";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, basename, extname, dirname, join } from "node:path";

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
  -i, --input <file>           Input file (use "-" for stdin)
  -o, --output <file>          Output file (use "-" for stdout; default: <input>.svg)
  -e, --outputFormat <format>  Output format: "svg" (default) or "png"
  -s, --scale <factor>         Pixel scale factor for PNG (default: 2; ignored for SVG)
  -b, --backgroundColor <col>  Background color (default: "white" for PNG, "transparent" for SVG)
  -t, --theme <name>           Theme name passed to renderer (e.g. "theme-default")
  -c, --configFile <file>      JSON config file with { theme, scale, backgroundColor, outputFormat }
  -q, --quiet                  Suppress non-error output
  -h, --help                   Show this help message
  -V, --version                Show version number

Config file values are overridden by CLI flags.

Examples:
  zenuml -i diagram.zenuml
  zenuml -i diagram.zenuml -o output.svg
  zenuml -i diagram.zenuml -o output.png
  zenuml -i diagram.zenuml -e png -s 3
  zenuml -i diagram.zenuml -c config.json
  cat diagram.zenuml | zenuml -i - -o -
`.trimStart();
  process.stdout.write(help);
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

interface CliArgs {
  input?: string;
  output?: string;
  outputFormat?: string;
  scale?: number;
  backgroundColor?: string;
  theme?: string;
  configFile?: string;
  quiet: boolean;
  help: boolean;
  version: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { quiet: false, help: false, version: false };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    switch (arg) {
      case "-i":
      case "--input":
        i++;
        args.input = argv[i];
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
  if (!args.input) {
    process.stderr.write("Error: -i/--input is required. Use -h for help.\n");
    process.exit(1);
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

  // Resolve effective values: CLI flag > config > default
  const outputPath = resolveOutput(args.input, args.output);
  const autoFormatFromExt = outputPath !== "-" && extname(outputPath).toLowerCase() === ".png" ? "png" : undefined;
  const effectiveFormat = args.outputFormat ?? configOutputFormat ?? autoFormatFromExt ?? "svg";

  // Validate format
  if (effectiveFormat !== "svg" && effectiveFormat !== "png") {
    process.stderr.write(`Error: Unsupported output format: "${effectiveFormat}". Use "svg" or "png".\n`);
    process.exit(1);
  }

  const effectiveScale = args.scale ?? configScale ?? 2;
  const effectiveBackgroundColor =
    args.backgroundColor ??
    configBackgroundColor ??
    (effectiveFormat === "png" ? "white" : "transparent");
  const effectiveTheme = args.theme ?? configTheme;

  // Read input
  let code: string;
  if (args.input === "-") {
    // Read from stdin
    code = await readStdin();
  } else {
    const inputPath = resolve(args.input);
    try {
      code = readFileSync(inputPath, "utf-8");
    } catch (err: any) {
      process.stderr.write(`Error: Cannot read input file: ${inputPath}\n`);
      process.exit(1);
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
    process.stderr.write(`Error: Failed to render diagram: ${err.message}\n`);
    process.exit(1);
  }

  // Determine final output path (adjust extension if format is png and no explicit -o)
  let finalOutputPath = outputPath;
  if (effectiveFormat === "png" && finalOutputPath !== "-" && !args.output) {
    // Auto-generated path: swap .svg extension for .png
    const ext = extname(finalOutputPath);
    finalOutputPath = finalOutputPath.slice(0, -ext.length) + ".png";
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
      } catch (err: any) {
        process.stderr.write(`Error: Cannot write output file: ${finalOutputPath}\n`);
        process.exit(1);
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
      } catch (err: any) {
        process.stderr.write(`Error: Cannot write output file: ${finalOutputPath}\n`);
        process.exit(1);
      }
    }
  }
}

function resolveOutput(input: string, output: string | undefined, defaultExt: string = ".svg"): string {
  if (output !== undefined) return output === "-" ? "-" : resolve(output);
  if (input === "-") return "-"; // stdin without -o → stdout
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
