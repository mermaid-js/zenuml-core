// Minimal replacement for lodash/memoize: caches on the joined argument list
// (nested arrays stringify into the key, so matrix contents are part of it).
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>) => {
    const key = args.join("-");
    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }
    return cache.get(key)!;
  }) as T;
}

const range = memoize((to: number, from = 0) => {
  return Array(to - from)
    .fill(0)
    .map((_, idx) => idx + from);
});

function neighbourGap(right: number, minDistanceMatrix: Array<Array<number>>) {
  return Math.max(
    ...range(right, 0).map((l) => {
      return (
        minDistanceMatrix[l][right] - distance(l, right - 1, minDistanceMatrix)
      );
    }),
  );
}

function totalGap(
  right: number,
  left: number,
  minDistanceMatrix: Array<Array<number>>,
) {
  return range(right, left).reduce((acc, l) => {
    return acc + distance(l, l + 1, minDistanceMatrix);
  }, 0);
}

const final_distance = (
  left: number,
  right: number,
  minDistanceMatrix: Array<Array<number>>,
): number => {
  if (right - left === 1) {
    return neighbourGap(right, minDistanceMatrix);
  } else {
    return totalGap(right, left, minDistanceMatrix);
  }
};

export const distance = memoize(final_distance);

export const final_pos = (
  i: number,
  minDistanceMatrix: Array<number>[],
): number => {
  return distance(0, i, minDistanceMatrix);
};
