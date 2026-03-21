#!/usr/bin/env node
// Generate two sets of Playwright snapshots (html & legacy modes) and a diff overlay.
// Usage: node scripts/snapshot-dual.js -- tests/creation.spec.ts

const { spawnSync } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");
const { PNG } = require("pngjs");
const pixelmatchModule = require("pixelmatch");
const pixelmatch = pixelmatchModule.default || pixelmatchModule;

const repoRoot = path.resolve(__dirname, "..");
const testsArg = process.argv.slice(2);
const tmpRoot = path.join(repoRoot, "tmp", "snapshots-dual");
const paths = {
  original: path.join(tmpRoot, "original"),
  html: path.join(tmpRoot, "html"),
  legacy: path.join(tmpRoot, "legacy"),
  diff: path.join(tmpRoot, "diff"),
};

function snapshotsDirToSpecPath(dirName) {
  return path.join("tests", dirName.replace(/-snapshots$/, ""));
}

function fileNameToTestName(file) {
  return file.replace(/\.png$/, "").replace(/-chromium.*$/, "");
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function listSnapshotDirs() {
  const testsDir = path.join(repoRoot, "tests");
  const entries = await fs.readdir(testsDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && e.name.endsWith("-snapshots"))
    .map((e) => path.join(testsDir, e.name));
}

async function copySnapshotDirs(destRoot) {
  const dirs = await listSnapshotDirs();
  await ensureDir(destRoot);
  for (const dir of dirs) {
    const target = path.join(destRoot, path.basename(dir));
    await fs.rm(target, { recursive: true, force: true });
    await fs.cp(dir, target, { recursive: true });
  }
}

function runPlaywright(mode) {
  const env = { ...process.env, VERTICAL_MODE: mode };
  const args = ["playwright", "test", "--update-snapshots", ...testsArg];
  const result = spawnSync("npx", args, {
    cwd: repoRoot,
    env,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`Playwright failed in "${mode}" mode`);
  }
}

async function diffImages() {
  const differences = [];
  await ensureDir(paths.diff);
  const htmlDirs = await fs.readdir(paths.html, { withFileTypes: true });
  for (const dirent of htmlDirs) {
    if (!dirent.isDirectory()) continue;
    const baseName = dirent.name;
    const htmlDir = path.join(paths.html, baseName);
    const legacyDir = path.join(paths.legacy, baseName);
    const files = await fs.readdir(htmlDir);
    for (const file of files) {
      if (!file.endsWith(".png")) continue;
      const htmlPngPath = path.join(htmlDir, file);
      const legacyPngPath = path.join(legacyDir, file);
      try {
        const [htmlBuf, legacyBuf] = await Promise.all([
          fs.readFile(htmlPngPath),
          fs.readFile(legacyPngPath),
        ]);
        const htmlImg = PNG.sync.read(htmlBuf);
        const legacyImg = PNG.sync.read(legacyBuf);
        if (
          htmlImg.width !== legacyImg.width ||
          htmlImg.height !== legacyImg.height
        ) {
          console.warn(`Skipping ${file}: dimension mismatch`);
          continue;
        }
        const diff = new PNG({
          width: htmlImg.width,
          height: htmlImg.height,
        });
        const diffPixels = pixelmatch(
          htmlImg.data,
          legacyImg.data,
          diff.data,
          htmlImg.width,
          htmlImg.height,
          { threshold: 0.1 },
        );
        const outDir = path.join(paths.diff, baseName);
        await ensureDir(outDir);
        const diffFileName = file.replace(/\.png$/, ".diff.png");
        await fs.writeFile(
          path.join(outDir, diffFileName),
          PNG.sync.write(diff),
        );
        if (diffPixels > 0) {
          differences.push({
            snapshotDir: baseName,
            file,
            diffPixels,
            specPath: snapshotsDirToSpecPath(baseName),
            testName: fileNameToTestName(file),
            diffPath: path.join(paths.diff, baseName, diffFileName),
          });
        }
      } catch (err) {
        console.warn(`Diff failed for ${baseName}/${file}: ${err.message}`);
      }
    }
  }
  return differences;
}

async function main() {
  await ensureDir(tmpRoot);
  // const snapshotDirs = await listSnapshotDirs();
  // await fs.rm(paths.original, { recursive: true, force: true });
  // await ensureDir(paths.original);
  // backup existing snapshots
  // await copySnapshotDirs(paths.original);

  // legacy mode
  runPlaywright("legacy");
  await fs.rm(paths.legacy, { recursive: true, force: true });
  await copySnapshotDirs(paths.legacy);

  // html mode
  runPlaywright("html");
  await fs.rm(paths.html, { recursive: true, force: true });
  await copySnapshotDirs(paths.html);

  // generate diffs
  const differences = await diffImages();
  console.log(`Snapshots saved under ${paths.html} and ${paths.legacy}`);
  console.log(`Diff overlays saved under ${paths.diff}`);
  if (differences.length === 0) {
    console.log("All snapshots match between html and legacy modes.");
  } else {
    console.log("Snapshots with differences:");
    const sorted = differences.sort((a, b) => {
      if (a.specPath === b.specPath)
        return a.testName.localeCompare(b.testName);
      return a.specPath.localeCompare(b.specPath);
    });
    for (const diff of sorted) {
      const relDiffPath = path.relative(repoRoot, diff.diffPath);
      console.log(
        `- ${diff.specPath} (test \"${diff.testName}\"): ${diff.snapshotDir}/${diff.file} -> ${diff.diffPixels} differing pixels [${relDiffPath}]`,
      );
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
