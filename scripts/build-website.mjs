#!/usr/bin/env node
// Builds website/ into dist-website/ for core.zenuml.com, with the version of
// @zenuml/core written in. Deployed by the deploy-website job in cd.yml.
//
// Usage: node scripts/build-website.mjs [--version 4.13.1]
// The version defaults to the one in package.json.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildWebsite } from "./build-website/core.mjs";

const root = join(import.meta.dirname, "..");
const args = process.argv.slice(2);
const flag = args.indexOf("--version");
const version =
  flag >= 0
    ? args[flag + 1]
    : JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;

const { files, substituted } = buildWebsite({
  source: join(root, "website"),
  output: join(root, "dist-website"),
  version,
});
console.log(
  `Built dist-website/ for @zenuml/core@${version}: ${files} files, version written into ${substituted}.`,
);
