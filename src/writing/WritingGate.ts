import { gate, locateEdit, type Edit } from "./gate";
import { strokeMs } from "./motion";
import { lostElements, type Shown } from "./shown";

/** The loss guard keeps the last frame at most this long (ADR 0009). */
export const LOSS_HOLD_MS = 1200;
/** With no new `render()` for this long, the raw text is rendered as is. */
export const IDLE_FLUSH_MS = 1200;

const EMA_ALPHA = 0.3;
const EMA_START = 180;
const EMA_MAX_GAP = 1200;
const DWELL_K = 2.5;
const DWELL_MIN = 250;
const DWELL_MAX = 500;

/** Typing tempo: an exponential moving average of the key interval. */
export class Tempo {
  private ema = EMA_START;
  private last: number | null = null;

  key(t: number) {
    if (this.last !== null) {
      const gap = t - this.last;
      if (gap > 0 && gap < EMA_MAX_GAP)
        this.ema += EMA_ALPHA * (gap - this.ema);
    }
    this.last = t;
  }

  /** Stroke time D of writing-time motion (ADR 0009, Decision 4). */
  get stroke(): number {
    return strokeMs(this.ema);
  }

  /** How long a held line waits before the gate looks at it again. */
  get dwell(): number {
    return Math.round(
      Math.min(DWELL_MAX, Math.max(DWELL_MIN, DWELL_K * this.ema)),
    );
  }
}

const isEmpty = (shown: Shown) =>
  shown.names.size === 0 &&
  shown.statements.length === 0 &&
  !shown.title?.trim();

export interface Frame {
  /** The text to render, or `null` to keep the frame on screen. */
  text: string | null;
  /** Look again after this many ms; `null` when nothing is pending. */
  wait: number | null;
}

/**
 * The gate's state for one diagram (ADR 0009, Decisions 1 and 2). Pure: the
 * caller passes the time and owns the one timer. `shownFor` maps a text to
 * what its frame draws; it parses, so the caller passes a cached parser.
 */
export class WritingGate {
  private raw = "";
  private edit: Edit = { line: 0, inserted: "", removed: "", bulk: true };
  /** Parsed lazily: with the option off, nothing reads it. */
  private shownCache: Shown | null = null;
  private shownText: string | null = null;
  private lossSince: number | null = null;
  private removedSinceCommit = false;
  private lastInput = 0;
  private readonly tempo = new Tempo();

  constructor(private readonly shownFor: (text: string) => Shown) {}

  /** The next edit is measured from `raw`; nothing is held. */
  reset(raw: string) {
    this.raw = raw;
    this.edit = { line: 0, inserted: "", removed: "", bulk: true };
    this.lossSince = null;
    this.removedSinceCommit = false;
  }

  /** One `render()` call with new raw text, at time `now`. */
  input(raw: string, now: number) {
    this.tempo.key(now);
    this.edit = locateEdit(this.raw, raw);
    this.raw = raw;
    this.lastInput = now;
    if (this.edit.removed || this.edit.bulk) this.removedSinceCommit = true;
  }

  /** Stroke time D for the current typing tempo. */
  get stroke(): number {
    return this.tempo.stroke;
  }

  /** The last edit was a paste of two or more lines: it is not gated. */
  get bulk(): boolean {
    return this.edit.bulk;
  }

  /** After this time the raw text is rendered unconditionally. */
  get idleAt(): number {
    return this.lastInput + IDLE_FLUSH_MS;
  }

  /** Whether the frame on screen is the raw text. */
  get settled(): boolean {
    return this.shownText === this.raw;
  }

  /** The first frame after the debounce. */
  frame(now: number): Frame {
    return this.offer(now, false, false);
  }

  /** The dwell timer fired: release what a pause makes safe. */
  settle(now: number): Frame {
    return this.offer(now, true, false);
  }

  /** The loss hold ran out: show the frame even if it removes something. */
  force(now: number): Frame {
    return this.offer(now, true, true);
  }

  /** Whether the loss hold for the pending frame has run out at `now`. */
  lossExpired(now: number): boolean {
    return this.lossSince !== null && now - this.lossSince >= LOSS_HOLD_MS;
  }

  /** The frame for `text` committed. */
  committed(text: string) {
    if (text !== this.shownText) this.shownCache = null;
    this.shownText = text;
    this.lossSince = null;
    this.removedSinceCommit = false;
  }

  private get shown(): Shown {
    this.shownCache ??= this.shownFor(this.shownText ?? "");
    return this.shownCache;
  }

  /** Whether `code` draws anything with the edited line left out. */
  private drawsOffEditLine(code: string): boolean {
    const lines = code.split("\n");
    if (this.edit.line < lines.length) lines[this.edit.line] = "";
    return !isEmpty(this.shownFor(lines.join("\n")));
  }

  private offer(now: number, dwell: boolean, force: boolean): Frame {
    if (now >= this.idleAt || this.edit.bulk) {
      return { text: this.raw, wait: null };
    }
    const g = gate(this.raw, this.edit, { names: this.shown.names, dwell });
    // An empty diagram is wider than a small one: keep it until a line
    // other than the one being typed draws, or until the idle flush.
    if (isEmpty(this.shown) && !this.drawsOffEditLine(g.code)) {
      return { text: null, wait: null };
    }
    if (!force && !this.removedSinceCommit) {
      const lost = lostElements(this.shown, this.shownFor(g.code));
      if (lost > 0) {
        if (this.lossSince === null) this.lossSince = now;
        if (now - this.lossSince < LOSS_HOLD_MS) {
          return {
            text: null,
            wait: dwell
              ? this.lossSince + LOSS_HOLD_MS - now
              : this.tempo.dwell,
          };
        }
      }
    }
    this.lossSince = null;
    return {
      text: g.code,
      wait: g.reason && !dwell ? this.tempo.dwell : null,
    };
  }
}
