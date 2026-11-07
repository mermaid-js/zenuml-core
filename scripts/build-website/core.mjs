// Builds the core.zenuml.com site from website/ for one released version.
// Plain node:fs only, so the deploy job needs no `bun install`.

import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join } from "node:path";

// The source names the version only through this, so a release never leaves a
// stale version on the page.
export const PLACEHOLDER = "{{ZENUML_VERSION}}";

const TEXT_EXTENSIONS = new Set([".html", ".txt", ".xml", ".css"]);
const VERSION = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const PINNED = /@zenuml\/core@\d[0-9A-Za-z.-]*/g;

export function assertVersion(version) {
  if (!VERSION.test(version ?? "")) {
    throw new Error(`Not a release version: ${JSON.stringify(version)}`);
  }
}

export function substituteVersion(text, version) {
  return text.replaceAll(PLACEHOLDER, version);
}

/** `@zenuml/core@<version>` written into the source instead of the placeholder. */
export function findPinnedVersions(text) {
  return text.match(PINNED) ?? [];
}

/**
 * Copies `source` to a fresh `output` and writes `version` into every text file.
 * Throws, before writing anything, if the source pins a version or has no
 * placeholder at all.
 *
 * @returns the number of files that held the placeholder.
 */
export function buildWebsite({ source, output, version }) {
  assertVersion(version);
  const files = readdirSync(source, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      join(entry.parentPath, entry.name).slice(source.length + 1),
    );
  const texts = new Map(
    files
      .filter((file) => TEXT_EXTENSIONS.has(extname(file)))
      .map((file) => [file, readFileSync(join(source, file), "utf8")]),
  );

  const pinned = [...texts].flatMap(([file, text]) =>
    findPinnedVersions(text).map((match) => `${file}: ${match}`),
  );
  if (pinned.length > 0) {
    throw new Error(
      `Use ${PLACEHOLDER} instead of a fixed version:\n${pinned.join("\n")}`,
    );
  }
  const substituted = [...texts.values()].filter((text) =>
    text.includes(PLACEHOLDER),
  ).length;
  if (substituted === 0) {
    throw new Error(`No file in ${source} contains ${PLACEHOLDER}`);
  }

  rmSync(output, { recursive: true, force: true });
  for (const file of files) {
    mkdirSync(dirname(join(output, file)), { recursive: true });
    if (texts.has(file)) {
      writeFileSync(
        join(output, file),
        substituteVersion(texts.get(file), version),
      );
    } else {
      copyFileSync(join(source, file), join(output, file));
    }
  }
  return { files: files.length, substituted };
}
