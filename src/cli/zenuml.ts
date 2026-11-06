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
import { setCanvasContext } from "@/positioning/WidthProviderFunc";
import {
  IBM_PLEX_SANS_400_WOFF2_BASE64,
  IBM_PLEX_SANS_FAMILY,
} from "@/svg/fonts/ibmPlexSans";
import Parser from "@/parser/index";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs, loadConfigFile } from "./args";
import { serializeParseTree } from "./astSerializer";
import { checkOne } from "./check";
import type { FileCheckResult } from "./check";
import { expandInputs, isDirectory, readCode } from "./inputs";
import { extractZenumlBlocks } from "./markdown";
import { closeBrowser } from "./png";
import { renderMarkdownFile, renderOneFile } from "./render";
import type { RenderConfig } from "./render";
import { startWatchMode } from "./watch";

export { extractZenumlBlocks, startWatchMode };
export type { ZenumlBlock } from "./markdown";
export type { WatchHandle } from "./watch";

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

Rendering:
  -i, --input <file>           Input file (use "-" for stdin; repeatable)
  -o, --output <file>          Output file (use "-" for stdout; default: <input>.svg)
  -e, --outputFormat <format>  Output format: "svg" (default) or "png"
  -s, --scale <factor>         Pixel scale factor for PNG (default: 2; ignored for SVG)
  -t, --theme <name>           Theme: default, mermaid, clean-light, dark, neon
                               (clean-dark and darcula are aliases of dark;
                               prefix "theme-"; unknown names use default)
  -c, --configFile <file>      JSON config file with { theme, scale, outputFormat }
  --md                         Markdown mode: render zenuml code blocks and produce output Markdown

Validation:
  --check                      Validate syntax without rendering (exit 0 if valid, 1 if errors)
  --parse                      Parse input and output AST as JSON (exit 0 if valid, 1 if errors)
  --json                       Machine-readable JSON output for --check mode

Batch & Watch:
  -w, --watch                  Watch input files and re-render on change (incompatible with --check, --parse, stdin)

General:
  -q, --quiet                  Suppress non-error output
  -h, --help                   Show this help message
  -V, --version                Show version number

Config file values are overridden by CLI flags.
Rendering flags (-o, -e, -t, -s) are silently ignored in --check and --parse modes.

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

PNG output requires the optional Playwright runtime and a Chromium browser:
  npm install playwright-core
  npx playwright-core install chromium

To use an existing Chrome/Chromium binary:
  ZENUML_CHROMIUM_PATH=/path/to/chrome zenuml -i diagram.zenuml -o output.png
`.trimStart();
  process.stdout.write(help);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // Inject @napi-rs/canvas context for accurate text measurement in renderToSvg.
  // Without this, WidthProviderOnCanvas falls back to character estimates which
  // produces incorrect layout (wrong participant spacing and message positioning).
  if (!globalThis.OffscreenCanvas && typeof document === "undefined") {
    try {
      const { createCanvas, GlobalFonts } = await import("@napi-rs/canvas");
      // Register before creating the context: a context resolves its fonts
      // when it is created, so a later registration is not picked up.
      GlobalFonts.register(
        Buffer.from(IBM_PLEX_SANS_400_WOFF2_BASE64, "base64"),
        IBM_PLEX_SANS_FAMILY,
      );
      setCanvasContext(createCanvas(1, 1).getContext("2d") as any);
    } catch {
      // If @napi-rs/canvas is unavailable, fall back to character estimates
    }
  }

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
      process.stderr.write(
        "Error: --watch is incompatible with stdin input.\n",
      );
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
            process.stderr.write(
              `${prefix}line ${e.line}, col ${e.column}: ${e.msg}\n`,
            );
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
      process.stderr.write(
        "Error: --parse supports only a single input file.\n",
      );
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
  let configTheme: string | undefined;
  let configOutputFormat: string | undefined;

  if (args.configFile) {
    const cfg = loadConfigFile(args.configFile);
    if (typeof cfg.scale === "number") configScale = cfg.scale;
    if (typeof cfg.theme === "string") configTheme = cfg.theme;
    if (typeof cfg.outputFormat === "string")
      configOutputFormat = cfg.outputFormat;
  }

  // ---------------------------------------------------------------------------
  // Validate: -o as single file + multiple inputs → error
  // ---------------------------------------------------------------------------
  const multipleInputs = expandedInputs.length > 1;
  if (
    multipleInputs &&
    args.output &&
    args.output !== "-" &&
    !isDirectory(resolve(args.output))
  ) {
    // -o is a file path (not a directory) with multiple inputs
    process.stderr.write(
      "Error: -o must be a directory when multiple input files are provided.\n",
    );
    process.exit(1);
  }

  const config: RenderConfig = {
    configScale,
    configTheme,
    configOutputFormat,
    multipleInputs,
  };

  // Markdown mode is explicit with --md or inferred from the input extension.
  const isMdMode =
    args.md ||
    expandedInputs.some((f) => f !== "-" && /\.(?:md|markdown)$/i.test(f));
  if (isMdMode && multipleInputs) {
    process.stderr.write(
      "Error: --md mode supports only a single input file.\n",
    );
    process.exit(1);
  }

  const inputArg = expandedInputs[0];
  if (args.md && inputArg !== "-" && !/\.(?:md|markdown)$/i.test(inputArg)) {
    process.stderr.write(
      `Error: --md flag requires a .md or .markdown input file, got: ${inputArg}\n`,
    );
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // --watch mode
  // ---------------------------------------------------------------------------
  if (args.watch) {
    const renderForWatch = (input: string) =>
      isMdMode
        ? renderMarkdownFile(input, args, config)
        : renderOneFile(input, args, config);
    const watchHandle = await startWatchMode(expandedInputs, renderForWatch);

    process.on("SIGINT", () => {
      watchHandle.shutdown();
      process.exit(0);
    });

    // Keep the process alive (watch mode runs indefinitely)
    await new Promise<void>(() => {});
    return;
  }

  if (isMdMode) {
    try {
      await renderMarkdownFile(inputArg, args, config);
      process.exit(0);
    } catch (err: any) {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exit(1);
    }
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

if (import.meta.main) {
  main().finally(() => closeBrowser());
}
