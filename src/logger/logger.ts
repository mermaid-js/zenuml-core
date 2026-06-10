/**
 * Console-backed logger with level filtering and named child loggers.
 * Replaces pino: in the browser all output went to the console anyway,
 * and the only pino features used were level filtering and `child({ name })`.
 */
const LEVELS = ["log", "trace", "debug", "info", "warn", "error"] as const;
type Level = (typeof LEVELS)[number];

// Numeric weights; messages below the threshold are dropped.
const LEVEL_WEIGHT: Record<Level, number> = {
  trace: 10,
  debug: 20,
  log: 30,
  info: 30,
  warn: 40,
  error: 50,
};

const THRESHOLD = LEVEL_WEIGHT.warn;

export type Logger = Record<Level, (...args: unknown[]) => void> & {
  child: (opts: { name?: string }) => Logger;
};

function consoleFn(level: Level): (...args: unknown[]) => void {
  const fn = console[level as keyof Console];
  return typeof fn === "function"
    ? (fn as (...args: unknown[]) => void).bind(console)
    : console.log.bind(console);
}

function createLogger(prefix?: [string, string]): Logger {
  const logger = {} as Logger;
  for (const level of LEVELS) {
    const fn = consoleFn(level);
    logger[level] = (...args: unknown[]) => {
      if (LEVEL_WEIGHT[level] >= THRESHOLD) {
        if (prefix) {
          fn(prefix[0], prefix[1], ...args);
        } else {
          fn(...args);
        }
      }
    };
  }
  logger.child = (opts: { name?: string }) =>
    createLogger(["%c" + (opts.name || ""), "color: #00f"]);
  return logger;
}

const rootLogger = createLogger();
export default rootLogger;
