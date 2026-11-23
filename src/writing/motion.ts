/**
 * Writing-time motion (ADR 0009, Decision 4; design note, section 4). Pure:
 * given where each keyed element was in the previous frame and where it is
 * now, decide which elements move (FLIP) and which are revealed, and when.
 * `useWritingMotion` measures the DOM and plays the plan.
 */

/** One keyed element in a frame, relative to the diagram. */
export interface Box {
  kind: "participant" | "statement";
  x: number;
  y: number;
  /** The nearest keyed ancestor, or `null`. */
  parent: string | null;
}

export interface Move {
  key: string;
  /** Old place minus new place: the element starts translated by this. */
  dx: number;
  dy: number;
}

export interface Reveal {
  key: string;
  delay: number;
  duration: number;
}

export interface Removal {
  key: string;
  duration: number;
}

export interface MotionPlan {
  moves: Move[];
  reveals: Reveal[];
  /** Elements of the previous frame that fade out over the new one. */
  removals: Removal[];
}

const STROKE_K = 1.6;
const STROKE_MIN = 110;
const STROKE_MAX = 240;
/** A message in the same frame as a new participant starts this much of D later. */
const FOLLOW = 0.3;
const BATCH_MIN = 5;
const BATCH_EACH = 120;
const BATCH_TOTAL = 240;
const BATCH_MAX = 120;
/** A removed element fades out in this many ms. */
const EXIT_MS = 90;
/** Moves under half a pixel are not played. */
const EPSILON = 0.5;

/** Stroke time D from the key-interval EMA, in ms. */
export const strokeMs = (ema: number) =>
  Math.round(Math.min(STROKE_MAX, Math.max(STROKE_MIN, STROKE_K * ema)));

const NONE: MotionPlan = { moves: [], reveals: [], removals: [] };

export function planMotion(
  prev: ReadonlyMap<string, Box>,
  next: ReadonlyMap<string, Box>,
  stroke: number,
): MotionPlan {
  if (prev.size === 0) return NONE;

  const born = [...next.keys()].filter((key) => !prev.has(key));
  if (born.length > BATCH_MAX) return NONE;

  const delta = new Map<string, { dx: number; dy: number }>();
  for (const [key, box] of next) {
    const old = prev.get(key);
    if (old) delta.set(key, { dx: old.x - box.x, dy: old.y - box.y });
  }
  const moves: Move[] = [];
  for (const [key, { dx, dy }] of delta) {
    // A child already travels with its parent's transform.
    const parent = next.get(key)!.parent;
    const carried = (parent && delta.get(parent)) || { dx: 0, dy: 0 };
    const own = { dx: dx - carried.dx, dy: dy - carried.dy };
    if (Math.abs(own.dx) >= EPSILON || Math.abs(own.dy) >= EPSILON) {
      moves.push({ key, ...own });
    }
  }

  // A new element inside a new element is revealed with it.
  const bornSet = new Set(born);
  const roots = born.filter((key) => {
    const parent = next.get(key)!.parent;
    return !(parent && bornSet.has(parent));
  });
  let reveals: Reveal[];
  if (roots.length >= BATCH_MIN) {
    const step = (BATCH_TOTAL - BATCH_EACH) / (roots.length - 1);
    reveals = roots.map((key, i) => ({
      key,
      delay: Math.round(i * step),
      duration: BATCH_EACH,
    }));
  } else {
    const newParticipant = roots.some(
      (key) => next.get(key)!.kind === "participant",
    );
    reveals = roots.map((key) => ({
      key,
      delay:
        newParticipant && next.get(key)!.kind === "statement"
          ? Math.round(FOLLOW * stroke)
          : 0,
      duration: stroke,
    }));
  }
  // A removed child fades with its removed parent.
  const gone = new Set([...prev.keys()].filter((key) => !next.has(key)));
  const removals = [...gone]
    .filter((key) => {
      const parent = prev.get(key)!.parent;
      return !(parent && gone.has(parent));
    })
    .map((key) => ({ key, duration: EXIT_MS }));
  return { moves, reveals, removals };
}
