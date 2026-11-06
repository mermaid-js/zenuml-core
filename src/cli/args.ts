/** Command-line argument and config file parsing. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface CliArgs {
  inputs: string[];
  output?: string;
  outputFormat?: string;
  scale?: number;
  theme?: string;
  configFile?: string;
  check: boolean;
  parse: boolean;
  json: boolean;
  quiet: boolean;
  help: boolean;
  version: boolean;
  md: boolean;
  watch: boolean;
}

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    inputs: [],
    check: false,
    parse: false,
    json: false,
    quiet: false,
    help: false,
    version: false,
    md: false,
    watch: false,
  };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    switch (arg) {
      case "-i":
      case "--input":
        i++;
        args.inputs.push(argv[i]);
        break;
      case "-o":
      case "--output":
        i++;
        args.output = argv[i];
        break;
      case "-e":
      case "--outputFormat":
        i++;
        args.outputFormat = argv[i];
        break;
      case "-s":
      case "--scale":
        i++;
        args.scale = Number(argv[i]);
        break;
      case "-t":
      case "--theme":
        i++;
        args.theme = argv[i];
        break;
      case "-c":
      case "--configFile":
        i++;
        args.configFile = argv[i];
        break;
      case "--md":
        args.md = true;
        break;
      case "--check":
        args.check = true;
        break;
      case "--parse":
        args.parse = true;
        break;
      case "--json":
        args.json = true;
        break;
      case "-q":
      case "--quiet":
        args.quiet = true;
        break;
      case "-h":
      case "--help":
        args.help = true;
        break;
      case "-V":
      case "--version":
        args.version = true;
        break;
      case "-w":
      case "--watch":
        args.watch = true;
        break;
      default:
        process.stderr.write(
          `Unknown option: ${arg}\nRun "zenuml --help" for usage.\n`,
        );
        process.exit(1);
    }
    i++;
  }
  return args;
}

/** Load and merge config file values (if any). CLI flags override config. */
export function loadConfigFile(filePath: string): Record<string, unknown> {
  const resolved = resolve(filePath);
  let raw: string;
  try {
    raw = readFileSync(resolved, "utf-8");
  } catch {
    process.stderr.write(`Error: Cannot read config file: ${resolved}\n`);
    process.exit(1);
  }
  try {
    return JSON.parse(raw);
  } catch {
    process.stderr.write(`Error: Invalid JSON in config file: ${resolved}\n`);
    process.exit(1);
  }
}
