// Pure logic for scripts/add-release-try-links.mjs. No network, so the unit
// tests can cover it.

import { assertVersion } from "../build-website/core.mjs";

// Marks a body that already has the links, so a rerun does not add them twice.
export const TRY_LINKS_MARKER = "<!-- try-links -->";

/** The release body with "try it" links for `version` above the changelog. */
export function addTryLinks(body, version) {
  assertVersion(version);
  if (body.includes(TRY_LINKS_MARKER)) return body;
  const links = [
    TRY_LINKS_MARKER,
    "**Try it:** [core.zenuml.com](https://core.zenuml.com) runs the latest release, deployed after each publish.",
    `**Load this version:** \`https://cdn.jsdelivr.net/npm/@zenuml/core@${version}/dist/zenuml.js\``,
  ].join("\n\n");
  return body ? `${links}\n\n${body}` : links;
}
