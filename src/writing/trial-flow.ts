/**
 * Pure parts of the public typing trial (ADR 0009, G5 and G6): the arm-order
 * draw, the device class, the hidden-tab timer, the change-detection probe and
 * the Clarity loader. The page is `trial.html` (dev server only); its wiring
 * is in `trial-page.ts`.
 */
import { armOrder, type Arm } from "./trial";

export type Device = "desktop" | "touch";

const cryptoRandom = () =>
  crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;

/**
 * One row of the Latin square, drawn uniformly. The collector keeps no
 * counter, so each session draws its own order (ADR 0009, "Sample").
 */
export const drawArmOrder = (random: () => number = cryptoRandom): Arm[] =>
  armOrder(1 + Math.floor(random() * 3));

/** "BCA": the order as the collector's `order` field. */
export const orderCode = (order: Arm[]): string => order.join("");

/** A random session id of 22 URL-safe characters (128 bits). */
export function newSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * A touch-only device has no fine pointer, or showed a touch before any key
 * was pressed. Such a device does the warm-up only.
 */
export const classifyDevice = (
  finePointer: boolean,
  firstInputWasTouch: boolean,
): Device => (!finePointer || firstInputWasTouch ? "touch" : "desktop");

/** Watches the first inputs of the session. A touch after a key does not count. */
export class DeviceDetector {
  private touched = false;
  private keyed = false;

  constructor(private readonly finePointer: boolean) {}

  touch() {
    if (!this.keyed) this.touched = true;
  }

  key() {
    this.keyed = true;
  }

  device(): Device {
    return classifyDevice(this.finePointer, this.touched);
  }
}

/** Total time the tab was hidden, from `visibilitychange` events. */
export class HiddenTimer {
  private since: number | null = null;
  private sum = 0;

  change(hidden: boolean, now: number) {
    if (hidden && this.since === null) this.since = now;
    else if (!hidden && this.since !== null) {
      this.sum += now - this.since;
      this.since = null;
    }
  }

  /** Whole milliseconds, counting a span that is still open. */
  total(now: number): number {
    return Math.round(this.sum + (this.since === null ? 0 : now - this.since));
  }
}

export const PROBE_QUESTION = "What was just added to the diagram?";

export interface Probe {
  q: string;
  options: string[];
  correctIndex: number;
}

const shuffle = <T>(items: T[], random: () => number): T[] => {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/**
 * A scorable change-detection question. The right option is the last line
 * with content that the person has typed (a bare `}` does not count). The
 * three others are other lines of the copy task. Returns null while there is
 * no such line yet. ADR 0009 does not fix this rule: it is the trial's own.
 */
export function buildProbe(
  typed: string,
  taskText: string,
  random: () => number,
): Probe | null {
  const lines = typed
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length >= 4);
  const answer = lines[lines.length - 1];
  if (!answer) return null;
  const pool = [
    ...new Set(
      taskText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length >= 4 && l !== answer),
    ),
  ];
  const options = shuffle(pool, random).slice(0, 3);
  const correctIndex = Math.floor(random() * 4);
  options.splice(correctIndex, 0, answer);
  return { q: PROBE_QUESTION, options, correctIndex };
}

const CLARITY_ID = /^[a-z0-9]{6,16}$/i;

/** Clarity masks text inside any element with this attribute. */
export function maskForClarity(el: Element) {
  el.setAttribute("data-clarity-mask", "True");
}

/**
 * Loads Microsoft Clarity. Call it only after consent. It does nothing when no
 * project id is configured, when the id is not a plain token, or when the tag
 * is already loaded. Returns true when it added the tag.
 */
export function loadClarity(
  id: string | undefined,
  doc: Document = document,
  win: Record<string, unknown> = window as unknown as Record<string, unknown>,
): boolean {
  if (!id || !CLARITY_ID.test(id)) return false;
  if (typeof win.clarity === "function") return false;
  const queue: unknown[][] = [];
  const clarity = (...args: unknown[]) => {
    queue.push(args);
  };
  clarity.q = queue;
  win.clarity = clarity;
  const script = doc.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${id}`;
  const first = doc.getElementsByTagName("script")[0];
  first.parentNode!.insertBefore(script, first);
  return true;
}
