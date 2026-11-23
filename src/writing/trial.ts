/**
 * The typing trial of ADR 0009 (gates G5 and G6): arms, their order, the copy
 * tasks, and the keystroke recorder. The page is `writing-trial.html` (dev
 * server only). Recordings use the JSONL format that
 * `scripts/writing-animation/g4.mjs --recordings` reads.
 */
import type { WritingMotion } from "@/store/Store";

export type Arm = "A" | "B" | "C";

const SQUARE: Arm[][] = [
  ["A", "B", "C"],
  ["B", "C", "A"],
  ["C", "A", "B"],
];

/** Arm order for participant `n` (1-based): a 3 x 3 Latin square. */
export const armOrder = (n: number): Arm[] => SQUARE[(n - 1) % 3];

/** A: today. B: motion on every raw frame. C: gate plus motion. */
export const armSettings = (
  arm: Arm,
): { gate: boolean; motion: WritingMotion } =>
  arm === "A"
    ? { gate: false, motion: false }
    : arm === "B"
      ? { gate: false, motion: "raw" }
      : { gate: true, motion: "gated" };

/** Three copy tasks of similar size and mix. Generic DSL only. */
export const TASKS: { id: string; text: string }[] = [
  {
    id: "t1",
    text: `title Order checkout
@Actor Customer
Shop.checkout(cart) {
  Cart.total() {
    return amount
  }
  if (amount > 0) {
    Payment.charge(card, amount) {
      Bank.debit(card)
      return receipt
    }
  } else {
    Shop.reject()
  }
  Mail->Customer: Order confirmed
}
`,
  },
  {
    id: "t2",
    text: `title Ticket booking
@Actor Traveller
Booking.search(route) {
  Schedule.trains(route) {
    return trains
  }
  loop (each train) {
    Seats.free(train)
  }
  opt (seat found) {
    Booking.hold(seat) {
      Ledger.lock(seat)
      return hold
    }
  }
  Sms->Traveller: Seat held
}
`,
  },
  {
    id: "t3",
    text: `title Report export
@Actor Analyst
Report.export(range) {
  Store.query(range) {
    return rows
  }
  Charts.draw(rows)
  try {
    Pdf.render(page) {
      Fonts.load()
      return file
    }
  } catch (Timeout) {
    Report.retry()
  }
}
`,
  },
];

export interface RecordingMeta {
  task: string;
  arm: Arm;
  participant: number;
}

/**
 * Records one copy task: a header line, then `{ t, pos, del, ins }` per
 * `input` event. The editor is a plain `textarea` without auto-closing
 * brackets or quotes (fixed before any recording is measured).
 */
export class Recorder {
  private readonly lines: string[];
  private code: string;

  constructor(
    start: string,
    meta: RecordingMeta,
    private readonly t0: number,
  ) {
    this.code = start;
    this.lines = [JSON.stringify({ start, ...meta, editor: "textarea" })];
  }

  input(code: string, now: number) {
    const prev = this.code;
    let p = 0;
    while (p < prev.length && p < code.length && prev[p] === code[p]) p++;
    let s = 0;
    while (
      s < prev.length - p &&
      s < code.length - p &&
      prev[prev.length - 1 - s] === code[code.length - 1 - s]
    )
      s++;
    this.lines.push(
      JSON.stringify({
        t: Math.round(now - this.t0),
        pos: p,
        del: prev.length - p - s,
        ins: code.slice(p, code.length - s),
      }),
    );
    this.code = code;
  }

  toJsonl(): string {
    return this.lines.join("\n") + "\n";
  }
}

/** Typing speed and the share of events that only delete, from a recording. */
export function typingMetrics(jsonl: string) {
  const rows = jsonl
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
  const head = rows[0] as { start: string };
  const events = rows.slice(1) as {
    t: number;
    pos: number;
    del: number;
    ins: string;
  }[];
  let code = head.start;
  for (const e of events) {
    code = code.slice(0, e.pos) + e.ins + code.slice(e.pos + e.del);
  }
  const seconds = events.length ? events[events.length - 1].t / 1000 : 0;
  const typed = code.length - head.start.length;
  return {
    wpm: seconds > 0 ? Math.round(typed / 5 / (seconds / 60)) : 0,
    deletionShare: events.length
      ? events.filter((e) => e.del > 0 && !e.ins).length / events.length
      : 0,
    events: events.length,
    seconds,
  };
}
