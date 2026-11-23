/**
 * Pairs the elements of two parses so that an element keeps its identity
 * while the text around it changes (ADR 0009, gate G7). Ported from the
 * writing-animation spike (`docs/spikes/writing-animation/engine.js`,
 * `diffList` and `diffParticipants`).
 *
 * Pure: works on plain `{ kind, label }` records, knows nothing of ANTLR or
 * React.
 */

export interface Signed {
  /** What the element is: `message`, `alt`, `section:else`, `participant`... */
  kind: string;
  /** Its header text, without nested blocks. */
  label: string;
}

export interface Reconciled<T> {
  /** `[old, new]` pairs: the new element takes over the old one's identity. */
  pairs: Array<[T, T]>;
  /** New elements with no old counterpart. */
  born: T[];
  /** Old elements with no new counterpart. */
  gone: T[];
}

const signature = (x: Signed) => `${x.kind}\u0001${x.label}`;

/**
 * Ordered lists (statements of one block, sections of one fragment).
 *
 * 1. Equal kind and label, matched from the start.
 * 2. Equal kind and label, matched from the end.
 * 3. In the middle, each new element pairs with the first unpaired old
 *    element of the same kind (as in the spike).
 *
 * Consequences:
 * - An insert or a delete in the middle keeps every other element.
 * - A label edited in place keeps its identity when the kind stays (step 3).
 * - A kind change (`A.m()` to `if(x) {}`) is a new element.
 */
export function reconcileList<T extends Signed>(
  olds: readonly T[],
  news: readonly T[],
): Reconciled<T> {
  const pairs: Array<[T, T]> = [];
  let head = 0;
  while (
    head < olds.length &&
    head < news.length &&
    signature(olds[head]) === signature(news[head])
  ) {
    pairs.push([olds[head], news[head]]);
    head++;
  }
  let tail = 0;
  while (
    tail < olds.length - head &&
    tail < news.length - head &&
    signature(olds[olds.length - 1 - tail]) ===
      signature(news[news.length - 1 - tail])
  ) {
    pairs.push([olds[olds.length - 1 - tail], news[news.length - 1 - tail]]);
    tail++;
  }
  const oldMiddle = olds.slice(head, olds.length - tail);
  const newMiddle = news.slice(head, news.length - tail);
  const born: T[] = [];
  for (const n of newMiddle) {
    let j = 0;
    while (j < oldMiddle.length && oldMiddle[j].kind !== n.kind) j++;
    if (j < oldMiddle.length) {
      pairs.push([oldMiddle[j], n]);
      oldMiddle.splice(j, 1);
    } else {
      born.push(n);
    }
  }
  return { pairs, born, gone: oldMiddle };
}

/**
 * Participants pair by name, in any order. A name with no exact match pairs
 * with an unmatched old name when one is a prefix of the other: that is a
 * rename while typing (`Ali` to `Alice`, or back).
 */
export function reconcileByName<T extends Signed>(
  olds: readonly T[],
  news: readonly T[],
): Reconciled<T> {
  const pairs: Array<[T, T]> = [];
  const unmatchedOld = [...olds];
  const unmatchedNew: T[] = [];
  for (const n of news) {
    const k = unmatchedOld.findIndex((o) => o.label === n.label);
    if (k >= 0) {
      pairs.push([unmatchedOld[k], n]);
      unmatchedOld.splice(k, 1);
    } else {
      unmatchedNew.push(n);
    }
  }
  const born: T[] = [];
  for (const n of unmatchedNew) {
    const k = unmatchedOld.findIndex(
      (o) =>
        o.label !== "" &&
        n.label !== "" &&
        (o.label.startsWith(n.label) || n.label.startsWith(o.label)),
    );
    if (k >= 0) {
      pairs.push([unmatchedOld[k], n]);
      unmatchedOld.splice(k, 1);
    } else {
      born.push(n);
    }
  }
  return { pairs, born, gone: unmatchedOld };
}
