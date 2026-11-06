/** Input and output path helpers: glob expansion, reading code, default output path. */
import { readFileSync, statSync } from "node:fs";
import { resolve, basename, extname, dirname, join } from "node:path";

/** Check if a string contains glob metacharacters. */
export function isGlobPattern(s: string): boolean {
  return /[*?[]/.test(s);
}

/** Expand inputs: literal paths pass through; glob patterns are expanded.
 *  Returns the expanded list. Throws if a glob pattern matches zero files. */
export function expandInputs(inputs: string[]): string[] {
  const result: string[] = [];
  for (const input of inputs) {
    if (input === "-" || !isGlobPattern(input)) {
      result.push(input);
      continue;
    }
    // Glob expansion
    const glob = new Bun.Glob(input);
    const matches: string[] = [];
    for (const match of glob.scanSync({
      cwd: process.cwd(),
      onlyFiles: true,
    })) {
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
export function isDirectory(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/** Read code from a file path or stdin ("-"). */
export async function readCode(input: string): Promise<string> {
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

export function resolveOutput(
  input: string,
  output: string | undefined,
  defaultExt: string = ".svg",
): string {
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

export async function readStdin(): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of Bun.stdin.stream()) {
    chunks.push(chunk as Uint8Array);
  }
  return Buffer.concat(chunks).toString("utf-8");
}
