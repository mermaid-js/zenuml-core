#!/usr/bin/env bun
/**
 * ZenUML CLI — renders ZenUML DSL text to SVG.
 *
 * Usage:
 *   zenuml -i diagram.zenuml              # writes diagram.svg
 *   zenuml -i diagram.zenuml -o out.svg   # writes out.svg
 *   zenuml -i - -o -                      # stdin → stdout
 *   cat diagram.zenuml | zenuml -i - -o - # pipe mode
 */
import { renderToSvg } from "@/svg/renderToSvg";
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

Render ZenUML DSL text to SVG.

Options:
  -i, --input <file>   Input file (use "-" for stdin)
  -o, --output <file>  Output file (use "-" for stdout; default: <input>.svg)
  -q, --quiet          Suppress non-error output
  -h, --help           Show this help message
  -V, --version        Show version number

Examples:
  zenuml -i diagram.zenuml
  zenuml -i diagram.zenuml -o output.svg
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

  // Render
  let svg: string;
  try {
    const result = renderToSvg(code);
    svg = result.svg;
  } catch (err: any) {
    process.stderr.write(`Error: Failed to render diagram: ${err.message}\n`);
    process.exit(1);
  }

  // Determine output destination
  const outputPath = resolveOutput(args.input, args.output);

  // Write output
  if (outputPath === "-") {
    process.stdout.write(svg);
  } else {
    try {
      writeFileSync(outputPath, svg, "utf-8");
      if (!args.quiet) {
        process.stderr.write(`Wrote ${outputPath}\n`);
      }
    } catch (err: any) {
      process.stderr.write(`Error: Cannot write output file: ${outputPath}\n`);
      process.exit(1);
    }
  }
}

function resolveOutput(input: string, output: string | undefined): string {
  if (output !== undefined) return output === "-" ? "-" : resolve(output);
  if (input === "-") return "-"; // stdin without -o → stdout
  const ext = extname(input);
  const base = basename(input, ext);
  const dir = dirname(resolve(input));
  return join(dir, `${base}.svg`);
}

async function readStdin(): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of Bun.stdin.stream()) {
    chunks.push(chunk as Uint8Array);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

main();
