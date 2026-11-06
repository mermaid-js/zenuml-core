/** Watch mode: re-render inputs when they change. */
import { watch as fsWatch } from "node:fs";

/** Return a timestamp string in [HH:MM:SS] format using local time. */
function watchTimestamp(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `[${hh}:${mm}:${ss}]`;
}

export interface WatchHandle {
  shutdown: () => void;
}

/**
 * Start watch mode.
 *
 * @param inputs      Resolved file paths to watch and render.
 * @param renderFn    Called with a file path to re-render it. Must return a Promise.
 * @param watchFn     Factory for a watcher. Defaults to node:fs.watch. Must return { close() }.
 * @param log         Log function for render messages. Defaults to process.stderr.write.
 * @param delayMs     Debounce delay in milliseconds. Defaults to 100.
 * @param renderMdFn  Optional alternative render function for .md files. When provided,
 *                    .md inputs are rendered with this function instead of renderFn.
 */
export async function startWatchMode(
  inputs: string[],
  renderFn: (path: string) => Promise<void>,
  watchFn?: (path: string, handler: () => void) => { close(): void },
  log?: (msg: string) => void,
  delayMs?: number,
  renderMdFn?: (path: string) => Promise<void>,
): Promise<WatchHandle> {
  const logFn = log ?? ((msg: string) => process.stderr.write(msg + "\n"));
  const delay = delayMs ?? 100;

  // Default watcher using node:fs.watch
  const watchFactory =
    watchFn ??
    ((path: string, handler: () => void) => {
      const watcher = fsWatch(path, () => handler());
      return { close: () => watcher.close() };
    });

  // Pick which render function to use for a given file
  function pickRender(p: string): (path: string) => Promise<void> {
    if (renderMdFn && /\.(?:md|markdown)$/i.test(p)) {
      return renderMdFn;
    }
    return renderFn;
  }

  // Perform initial render for all inputs
  for (const input of inputs) {
    const rf = pickRender(input);
    const ts = watchTimestamp();
    try {
      await rf(input);
      logFn(`${ts} Rendered ${input} -> done`);
    } catch (err: any) {
      logFn(`${ts} Error: ${input}: ${err.message}`);
    }
  }

  // Set up per-file debounced watchers
  const handles: Array<{ close(): void }> = [];
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  for (const input of inputs) {
    const rf = pickRender(input);
    const handle = watchFactory(input, () => {
      // Debounce: clear any pending timer for this file
      const existing = timers.get(input);
      if (existing !== undefined) clearTimeout(existing);
      const t = setTimeout(async () => {
        timers.delete(input);
        const ts = watchTimestamp();
        try {
          await rf(input);
          logFn(`${ts} Rendered ${input} -> done`);
        } catch (err: any) {
          logFn(`${ts} Error: ${input}: ${err.message}`);
        }
      }, delay);
      timers.set(input, t);
    });
    handles.push(handle);
  }

  function shutdown(): void {
    // Cancel pending debounce timers
    for (const t of timers.values()) {
      clearTimeout(t);
    }
    timers.clear();
    // Close all watchers
    for (const h of handles) {
      h.close();
    }
  }

  return { shutdown };
}
