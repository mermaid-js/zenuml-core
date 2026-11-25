/**
 * Every bundled dynamic import in src/ must name its module with a string
 * literal: `cond ? import("@/a") : import("@/b")`, never
 * `import(cond ? "@/a" : "@/b")`.
 *
 * Why: Vite wraps a literal `import()` in its preload helper, which also
 * injects the target chunk's CSS. Under Vite 8 (Rolldown) a non-literal
 * specifier is still split into chunks, but the emitted `import("./x.js")`
 * has no preload wrapper, so the chunk's CSS never loads. Observed
 * 2026-11-22 in a sibling project (conf-app): a viewer rendered unstyled
 * after the Vite 8 upgrade. Vite 7 handled the same source correctly.
 *
 * This repo is on Vite 6 and has no such import today. The spec keeps it that
 * way so a later Vite 8 upgrade does not silently drop CSS.
 *
 * A runtime URL import that Vite must not bundle stays allowed when it is
 * marked `/* @vite-ignore *\/`.
 */
import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const SRC = resolve(__dirname, '../../src');
const EXTENSIONS = /\.(ts|tsx|js|mjs|vue)$/;
const SKIP = /\.(spec|test)\.[a-z]+$/;

function listSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      out.push(...listSourceFiles(path));
    } else if (EXTENSIONS.test(name) && !SKIP.test(name)) {
      out.push(path);
    }
  }
  return out;
}

/** Returns `line: text` for each `import(` whose first argument is not a literal. */
function findNonLiteralDynamicImports(source: string): string[] {
  const hits: string[] = [];
  const re = /(^|[^\w$.])import\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    let i = m.index + m[0].length;
    let ignored = false;
    // Skip whitespace and comments before the first argument.
    for (;;) {
      while (/\s/.test(source[i] ?? '')) i++;
      if (source.startsWith('/*', i)) {
        const end = source.indexOf('*/', i + 2);
        if (source.slice(i, end).includes('@vite-ignore')) ignored = true;
        i = end + 2;
      } else if (source.startsWith('//', i)) {
        i = source.indexOf('\n', i);
      } else {
        break;
      }
    }
    const ch = source[i];
    const literal =
      ch === '"' ||
      ch === "'" ||
      (ch === '`' && !source.slice(i + 1, source.indexOf('`', i + 1)).includes('${'));
    if (!literal && !ignored) {
      const line = source.slice(0, m.index).split('\n').length;
      hits.push(`${line}: ${source.split('\n')[line - 1].trim()}`);
    }
  }
  return hits;
}

describe('dynamic import specifiers', () => {
  it('flags a ternary inside import() and accepts a ternary of imports', () => {
    expect(findNonLiteralDynamicImports('await import(a ? "@/x" : "@/y");')).toHaveLength(1);
    expect(findNonLiteralDynamicImports('await import(\n  a\n    ? "@/x"\n    : "@/y");')).toHaveLength(1);
    expect(findNonLiteralDynamicImports('await (a ? import("@/x") : import("@/y"));')).toEqual([]);
    expect(findNonLiteralDynamicImports('import(/* @vite-ignore */ url)')).toEqual([]);
    expect(findNonLiteralDynamicImports('vi.importActual(x); import.meta.url;')).toEqual([]);
    expect(findNonLiteralDynamicImports('import(`./a/${name}.ts`)')).toHaveLength(1);
  });

  it('src/ uses only literal specifiers in bundled dynamic imports', () => {
    const offenders = listSourceFiles(SRC).flatMap((file) =>
      findNonLiteralDynamicImports(readFileSync(file, 'utf8')).map(
        (hit) => `${relative(SRC, file)}:${hit}`,
      ),
    );
    expect(offenders).toEqual([]);
  });
});
