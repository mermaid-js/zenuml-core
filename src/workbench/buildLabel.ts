const COMMIT_URL = "https://github.com/mermaid-js/zenuml-core/commit/";

export interface BuildLabel {
  /** `4.13.1 · a99203cf`, or whichever part is known. */
  text: string;
  /** The commit on GitHub, when the build knows it. */
  href?: string;
}

/**
 * What the workbench toolbar shows, so a tester can tell which build they are
 * on without devtools. Docker builds have no `.git`, so the hash can be empty.
 */
export function buildLabel(info: {
  version: string;
  gitHash: string;
}): BuildLabel {
  const hash = /^[0-9a-f]{7,40}$/.test(info.gitHash) ? info.gitHash : "";
  return {
    text: [info.version, info.gitHash].filter(Boolean).join(" · "),
    href: hash ? COMMIT_URL + hash : undefined,
  };
}
