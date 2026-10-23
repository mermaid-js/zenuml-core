/* eslint-env node */
// Building blocks shared by the vite.config*.ts files, so each config does not
// repeat the alias, the git/version lookup or the `define` keys.
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";

/** `resolve.alias` shared by every build: `@/…` points into `src/`. */
export const alias = {
  "@": resolve(__dirname, "./src"),
};

export interface BuildInfo {
  /** `version` from package.json (Changesets bumps it). */
  version: string;
  /** Short commit hash; empty inside Docker, where there is no `.git`. */
  gitHash: string;
  /** Current branch; empty inside Docker, and on a detached HEAD. */
  gitBranch: string;
}

export function buildInfo(): BuildInfo {
  const packageJson = JSON.parse(
    readFileSync(resolve(__dirname, "package.json"), "utf-8"),
  );
  const git = (args: string) =>
    process.env.DOCKER ? "" : execSync(`git ${args}`).toString().trim();
  return {
    version: packageJson.version,
    gitHash: git("rev-parse --short HEAD"),
    gitBranch: git("branch --show-current"),
  };
}

/**
 * The `define` entries that embed version and git info. Only the builds that
 * ship the renderer (site and library) use them; the CLI, parser and LSP
 * bundles deliberately do not, so their output stays unchanged.
 */
export function versionDefines(): Record<string, string> {
  const { version, gitHash, gitBranch } = buildInfo();
  return {
    "process.env.VITE_VERSION": JSON.stringify(version),
    "import.meta.env.VITE_APP_GIT_HASH": JSON.stringify(gitHash),
    "import.meta.env.VITE_APP_GIT_BRANCH": JSON.stringify(gitBranch),
  };
}
