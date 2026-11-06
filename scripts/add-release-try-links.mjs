#!/usr/bin/env node
// Adds "try it" links to the GitHub Release of a published version. Run by the
// release job in cd.yml after changesets publishes. Needs `gh` and GH_TOKEN.
//
// Usage: node scripts/add-release-try-links.mjs <version>

import { execFileSync } from "node:child_process";
import { addTryLinks } from "./release-notes/core.mjs";

const version = process.argv[2];
const tag = `v${version}`;
const gh = (args, input) =>
  execFileSync("gh", args, { encoding: "utf8", input });

const body = gh(["release", "view", tag, "--json", "body", "--jq", ".body"]);
const next = addTryLinks(body.trimEnd(), version);
if (next === body.trimEnd()) {
  console.log(`${tag} already has try links.`);
} else {
  gh(["release", "edit", tag, "--notes-file", "-"], next);
  console.log(`Added try links to ${tag}.`);
}
