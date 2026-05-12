import pino from "pino";

/**
 * What do we get from 'pino'?
 * - log level. The level is used in the prettify function to determine which log is printed to the console.
 * - `child` method to create a child logger with a given name. The name is added to the log message with the prettify function.
 */
const logger = pino({
  level: "warn",
});

const LEVELS = ["log", "trace", "debug", "info", "warn", "error"] as const;
const PINO_LEVEL: Record<(typeof LEVELS)[number], "trace" | "debug" | "info" | "warn" | "error"> = {
  log: "info",
  trace: "trace",
  debug: "debug",
  info: "info",
  warn: "warn",
  error: "error",
};

type LoggerLike = Record<string, (...args: unknown[]) => void> & {
  child: (opts: { name?: string }) => LoggerLike;
};

function isEnabled(target: LoggerLike, level: (typeof LEVELS)[number]) {
  const loggerTarget = target as unknown as {
    isLevelEnabled?: (level: string) => boolean;
  };
  return loggerTarget.isLevelEnabled?.(PINO_LEVEL[level]) ?? true;
}

function bind(target: LoggerLike, level: (typeof LEVELS)[number]) {
  const consoleFn = level in console
    ? (console[level as keyof Console] as (...args: unknown[]) => void)
    : console.log;
  target[level] = (...args: unknown[]) => {
    if (isEnabled(target, level)) {
      consoleFn(...args);
    }
  };
}

function bind2(target: LoggerLike, level: (typeof LEVELS)[number], prefix: [string, string]) {
  const consoleFn = level in console
    ? (console[level as keyof Console] as (...args: unknown[]) => void)
    : console.log;
  target[level] = (...args: unknown[]) => {
    if (isEnabled(target, level)) {
      consoleFn(prefix[0], prefix[1], ...args);
    }
  };
}

function prettify(target: LoggerLike): LoggerLike {
  LEVELS.forEach((level) => bind(target, level));
  const childFn = target.child;
  target.child = function (opts: { name?: string }) {
    const child = childFn.call(target, opts);
    LEVELS.forEach((level) =>
      bind2(child, level, ["%c" + (opts.name || ""), "color: #00f"]),
    );
    return child;
  };
  return target;
}

const rootLogger = prettify(logger as unknown as LoggerLike);
export default rootLogger;
