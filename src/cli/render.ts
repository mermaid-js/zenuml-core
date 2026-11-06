/** Render pipeline shared by single-file and Markdown (`--md`) modes. */
import { renderToSvg } from "@/svg/renderToSvg";
import { ensureDiagramIconsLoaded } from "@/svg/icons";
import type { RenderOptions } from "@/svg/renderToSvg";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, basename, extname, dirname, join } from "node:path";
import type { CliArgs } from "./args";
import { extractZenumlBlocks } from "./markdown";
import { rasterizeToPng } from "./png";
import { isDirectory, readCode, resolveOutput } from "./inputs";

export interface RenderConfig {
  configScale?: number;
  configTheme?: string;
  configOutputFormat?: string;
  multipleInputs: boolean;
}

type OutputFormat = "svg" | "png";

interface RenderSettings {
  format: OutputFormat;
  scale: number;
  renderOptions: RenderOptions;
}

/**
 * Resolve format, theme and scale: CLI flag > config file > default.
 * When `outputPath` is given and no format is set explicitly, a ".png"
 * extension selects PNG output (single-file mode only; Markdown mode passes none).
 */
function resolveRenderSettings(
  args: CliArgs,
  config: RenderConfig,
  outputPath?: string,
): RenderSettings {
  const autoFormatFromExt =
    outputPath !== undefined &&
    outputPath !== "-" &&
    extname(outputPath).toLowerCase() === ".png"
      ? "png"
      : undefined;
  const format =
    args.outputFormat ??
    config.configOutputFormat ??
    autoFormatFromExt ??
    "svg";
  if (format !== "svg" && format !== "png") {
    throw new Error(
      `Unsupported output format: "${format}". Use "svg" or "png".`,
    );
  }

  const renderOptions: RenderOptions = {};
  const theme = args.theme ?? config.configTheme;
  if (theme) {
    renderOptions.theme = theme as RenderOptions["theme"];
  }

  return {
    format,
    scale: args.scale ?? config.configScale ?? 2,
    renderOptions,
  };
}

interface RenderedDiagram {
  /** SVG markup (svg format) or PNG bytes (png format). */
  bytes: string | Buffer;
  width: number;
  height: number;
}

/**
 * Shared render pipeline: load icons, render SVG, optionally rasterize to PNG.
 * Only the SVG step is wrapped in `Failed to render ${label}: ...`; PNG errors
 * propagate unchanged. `beforeEncode` runs between the two (the callers create
 * the output directory there, so it exists even when PNG rasterization fails).
 */
async function renderDiagram(
  code: string,
  settings: RenderSettings,
  label: string,
  beforeEncode?: () => void,
): Promise<RenderedDiagram> {
  let result: ReturnType<typeof renderToSvg>;
  try {
    await ensureDiagramIconsLoaded(code);
    result = renderToSvg(code, settings.renderOptions);
  } catch (err: any) {
    throw new Error(`Failed to render ${label}: ${err.message}`);
  }
  beforeEncode?.();
  const bytes =
    settings.format === "png"
      ? await rasterizeToPng(
          result.svg,
          result.width,
          result.height,
          settings.scale,
        )
      : result.svg;
  return { bytes, width: result.width, height: result.height };
}

/** Render every ZenUML fence in one Markdown input and write the transformed document. */
export async function renderMarkdownFile(
  inputArg: string,
  args: CliArgs,
  config: RenderConfig,
): Promise<void> {
  const mdContent = await readCode(inputArg);
  const settings = resolveRenderSettings(args, config);

  const inputPath = inputArg === "-" ? undefined : resolve(inputArg);
  const outputPath =
    args.output === "-"
      ? "-"
      : args.output
        ? resolve(args.output)
        : inputPath
          ? join(
              dirname(inputPath),
              `${basename(inputArg, extname(inputArg))}-rendered.md`,
            )
          : "-";
  const imageDir =
    outputPath !== "-"
      ? dirname(outputPath)
      : inputPath
        ? dirname(inputPath)
        : process.cwd();
  const imageStem = inputPath
    ? basename(inputArg, extname(inputArg))
    : outputPath !== "-"
      ? basename(outputPath, extname(outputPath))
      : "diagram";

  const blocks = extractZenumlBlocks(mdContent);
  const imageFiles = new Map<number, string>();
  for (const block of blocks) {
    if (block.empty) continue;

    const imageFilename = `${imageStem}-zenuml-${block.index}.${settings.format}`;
    const imageFilePath = join(imageDir, imageFilename);
    const { bytes: image } = await renderDiagram(
      block.code,
      settings,
      `zenuml block ${block.index}`,
      () => mkdirSync(imageDir, { recursive: true }),
    );
    writeFileSync(imageFilePath, image);
    imageFiles.set(block.index, imageFilename);

    if (!args.quiet && !args.watch) {
      process.stderr.write(`Wrote ${imageFilePath}\n`);
    }
  }

  const outputMd = [...blocks].reverse().reduce((markdown, block) => {
    const replacement = block.empty
      ? ""
      : `![${block.title || `diagram ${block.index + 1}`}](${imageFiles.get(block.index)})`;
    return markdown.replace(block.raw, replacement);
  }, mdContent);

  if (outputPath === "-") {
    process.stdout.write(outputMd);
    return;
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, outputMd, "utf-8");
  if (!args.quiet && !args.watch) {
    process.stderr.write(`Wrote ${outputPath}\n`);
  }
}

/** Render a single input file to its output. Throws on failure. */
export async function renderOneFile(
  inputArg: string,
  args: CliArgs,
  config: RenderConfig,
): Promise<void> {
  const outputPath = resolveOutput(inputArg, args.output, ".svg");
  const settings = resolveRenderSettings(args, config, outputPath);
  const code = await readCode(inputArg);

  // Determine final output path (adjust extension if format is png and no explicit -o)
  let finalOutputPath = outputPath;
  if (settings.format === "png" && finalOutputPath !== "-") {
    if (!args.output || isDirectory(resolve(args.output!))) {
      // Auto-generated or directory-based path: swap extension for .png
      const ext = extname(finalOutputPath);
      finalOutputPath = finalOutputPath.slice(0, -ext.length) + ".png";
    }
  }

  // The output directory is created after the SVG render, before PNG encoding
  const { bytes } = await renderDiagram(code, settings, "diagram", () => {
    if (finalOutputPath !== "-") {
      mkdirSync(dirname(finalOutputPath), { recursive: true });
    }
  });

  // Write output
  if (finalOutputPath === "-") {
    process.stdout.write(bytes);
  } else {
    try {
      writeFileSync(finalOutputPath, bytes);
      if (!args.quiet) {
        process.stderr.write(`Wrote ${finalOutputPath}\n`);
      }
    } catch {
      throw new Error(`Cannot write output file: ${finalOutputPath}`);
    }
  }
}
