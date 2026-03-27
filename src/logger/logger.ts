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

type LoggerLike = Record<string, (...args: unknown[]) => void> & {
  child: (opts: { name?: string }) => LoggerLike;
};

function bind(target: LoggerLike, level: string) {
  const consoleFn = level in console
    ? (console[level as keyof Console] as (...args: unknown[]) => void)
    : console.log;
  target[level] = consoleFn.bind(console);
}

function bind2(target: LoggerLike, level: string, prefix: [string, string]) {
  const consoleFn = level in console
    ? (console[level as keyof Console] as (...args: unknown[]) => void)
    : console.log;
  target[level] = consoleFn.bind(console, prefix[0], prefix[1]);
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
