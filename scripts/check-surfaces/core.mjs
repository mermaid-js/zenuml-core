// Pure logic for scripts/check-surfaces.mjs. No browser and no network, so the
// unit tests can cover every result without a live page.

export const SURFACES = [
  { name: "core.zenuml.com", url: "https://core.zenuml.com/" },
  {
    name: "Production workbench",
    url: "https://zenuml-web-renderer.zenuml.workers.dev/",
  },
  {
    name: "GitHub Pages demo",
    url: "https://mermaid-js.github.io/zenuml-core/",
  },
  {
    name: "jsDelivr latest",
    script: "https://cdn.jsdelivr.net/npm/@zenuml/core@latest/dist/zenuml.js",
  },
  {
    name: "unpkg latest",
    script: "https://unpkg.com/@zenuml/core@latest/dist/zenuml.js",
  },
];

function compareVersions(a, b) {
  const left = a.split(/[.-]/).map(Number);
  const right = b.split(/[.-]/).map(Number);
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] < right[i] ? -1 : 1;
  }
  return 0;
}

function noteFor({ runs, error }, latest) {
  if (error) return error;
  if (!runs) return "version not found";
  return compareVersions(runs, latest) < 0
    ? "behind npm latest"
    : "differs from npm latest";
}

export function evaluateSurfaces(readings, latest) {
  return readings.map((reading) => {
    const pass = !reading.error && reading.runs === latest;
    return {
      name: reading.name,
      runs: reading.runs,
      latest,
      result: pass ? "PASS" : "FAIL",
      note: pass ? undefined : noteFor(reading, latest),
    };
  });
}

export function exitCodeFor(rows) {
  return rows.some((row) => row.result === "FAIL") ? 1 : 0;
}

const cell = (value) => String(value ?? "").replaceAll("|", "\\|");

export function renderReport(rows, latest) {
  const failed = rows.filter((row) => row.result === "FAIL").length;
  return [
    `npm latest is ${latest}. ${failed} of ${rows.length} public entries failed the check.`,
    "",
    "| Entry | Runs | npm latest | Result | Note |",
    "|---|---|---|---|---|",
    ...rows.map(
      (row) =>
        `| ${cell(row.name)} | ${cell(row.runs ?? "-")} | ${cell(row.latest)} | ${row.result} | ${cell(row.note)} |`,
    ),
    "",
  ].join("\n");
}

function readNumber(flag, value, minimum) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum) {
    throw new Error(`${flag} must be an integer of at least ${minimum}`);
  }
  return number;
}

export function parseArgs(argv) {
  const options = {
    attempts: 1,
    waitSeconds: 0,
    report: null,
    extraScripts: [],
  };
  for (let i = 0; i < argv.length; i += 2) {
    const [flag, value] = [argv[i], argv[i + 1]];
    if (flag === "--attempts") {
      options.attempts = readNumber(flag, value, 1);
    } else if (flag === "--wait-seconds") {
      options.waitSeconds = readNumber(flag, value, 0);
    } else if (flag === "--report") {
      options.report = value;
    } else if (flag === "--add-script") {
      const split = value?.indexOf("=") ?? -1;
      if (split < 1) throw new Error("--add-script needs name=url");
      options.extraScripts.push({
        name: value.slice(0, split),
        script: value.slice(split + 1),
      });
    } else {
      throw new Error(`Unknown flag: ${flag}`);
    }
  }
  return options;
}
