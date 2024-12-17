/**
 * The version is managed by merge-release during npm publish:
 * - Git repository shows 3.0.0 in package.json
 * - npm package shows the actual released version (e.g. 3.27.0)
 * - Git tags track the released versions (v3.27.0)
 */
export const VERSION = process.env.VITE_VERSION || "";
