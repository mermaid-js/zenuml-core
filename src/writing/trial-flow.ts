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

/** `q` of every change-detection entry in the header `detect`. */
export const CLICK_NEWEST = "click-newest";

/** No click within this time is a wrong answer. */
export const CLICK_LIMIT_MS = 10_000;

export interface Candidate {
  /** Identity of a drawn element within one frame, see `collectCandidates`. */
  key: string;
  label: string;
}

/**
 * Tells which drawn elements appeared most recently. Feed it every frame's
 * list of elements. An element is new when its key was not in the previous
 * frame. The newest elements are those first seen in the latest frame that
 * added any: a participant and its first message that appear together are
 * both newest, because no single one of them came last. An element that
 * disappears and returns is new again.
 */
export class NewestTracker {
  private seen = new Map<string, number>();
  private frame = 0;
  private latest = 0;

  observe(candidates: Candidate[]) {
    const present = new Map<string, number>();
    let added = false;
    this.frame++;
    for (const { key } of candidates) {
      const first = this.seen.get(key);
      if (first === undefined) {
        added = true;
        present.set(key, this.frame);
      } else present.set(key, first);
    }
    this.seen = present;
    if (added) this.latest = this.frame;
  }

  hasElements(): boolean {
    return this.seen.size > 0;
  }

  /** Keys first seen in the latest frame that added elements, still drawn. */
  newest(): string[] {
    return [...this.seen].filter(([, f]) => f === this.latest).map(([k]) => k);
  }
}

const label = (el: Element) =>
  (el.textContent ?? "").replace(/\s+/g, " ").trim();

/**
 * The elements a person can point at, in document order: a participant box,
 * a message (its arrow and label) and a fragment header. Keys carry the
 * label and the count of earlier elements with the same label.
 */
export function collectCandidates(
  root: ParentNode,
): (Candidate & { el: Element })[] {
  const out: (Candidate & { el: Element })[] = [];
  const counts = new Map<string, number>();
  const add = (prefix: string, text: string, el: Element) => {
    const base = `${prefix}:${text}`;
    const n = counts.get(base) ?? 0;
    counts.set(base, n + 1);
    out.push({
      key: prefix === "p" ? base : `${base}#${n}`,
      label: text,
      el,
    });
  };
  const nodes = root.querySelectorAll(
    "[data-participant-id], .message, .fragment",
  );
  for (const el of nodes) {
    if (el.hasAttribute("data-participant-id")) {
      add("p", el.getAttribute("data-participant-id") ?? "", el);
    } else if (el.classList.contains("message")) {
      // The sequence number is drawn after the text ("total()1.1"), or before it
      // on a return ("1.1.1return amount").
      add(
        "m",
        label(el)
          .replace(/^\d+(\.\d+)*/, "")
          .replace(/\d+(\.\d+)*$/, ""),
        el,
      );
    } else {
      const header = el.querySelector(":scope > .header");
      if (header) add("f", label(header).replace(/^\d+(\.\d+)*/, ""), header);
    }
  }
  return out;
}

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface ClickAnswer {
  q: typeof CLICK_NEWEST;
  answer: string;
  correct: boolean;
}

const inside = (x: number, y: number, b: Box) =>
  x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;

/**
 * Scores a click. Correct when it lands inside the box of a newest element
 * (edges count). The answer is the label of the element hit: the newest one
 * when correct, otherwise the smallest element under the click, or "none".
 */
export function judgeClick(
  x: number,
  y: number,
  hits: { label: string; newest: boolean; box: Box }[],
): ClickAnswer {
  const under = hits.filter((h) => inside(x, y, h.box));
  const right = under.find((h) => h.newest);
  if (right) return { q: CLICK_NEWEST, answer: right.label, correct: true };
  const area = (b: Box) => (b.right - b.left) * (b.bottom - b.top);
  under.sort((a, b) => area(a.box) - area(b.box));
  return {
    q: CLICK_NEWEST,
    answer: under[0]?.label || "none",
    correct: false,
  };
}

export const timeoutAnswer = (): ClickAnswer => ({
  q: CLICK_NEWEST,
  answer: "none",
  correct: false,
});

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
