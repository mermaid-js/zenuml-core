/**
 * Two-tier memo store for layout measurements.
 *
 * `dic` holds per-render values and is dropped by {@link clearCache}, which
 * ZenUml.doRender calls before every render. `persistDic` holds values that
 * stay valid across renders — text widths, which depend only on the string and
 * the font — so a re-render does not re-measure the whole diagram. That means
 * anything written with `persist: true` MUST be a pure function of its cache
 * key: if a value depends on state not in the key, it can never be corrected.
 *
 * When such state does change (the canvas measurement backend being installed
 * after startup, say), the owner must call {@link clearPersistentCache}.
 */
let dic: Record<string, any> = {};
let persistDic: Record<string, any> = {};

export const getCache = (key: string | undefined): any => {
  if (key != null) {
    const cacheValue = dic[key] ?? persistDic[key];
    return cacheValue !== undefined ? cacheValue : null;
  }
  return null;
};

export const setCache = (key: string, value: any, persist: boolean = false) => {
  dic[key] = value;
  if (persist) {
    persistDic[key] = value;
  }
};

/** Drop per-render values. Called before every render; keeps persisted ones. */
export const clearCache = () => {
  dic = {};
};

/**
 * Drop persisted values, and the per-render tier with them. Call when
 * something outside the cache key changes the result of a measurement —
 * currently only swapping the canvas context. Both tiers go, because
 * `setCache(key, value, true)` writes to both, so keeping `dic` would keep
 * serving the value this call exists to retire.
 */
export const clearPersistentCache = () => {
  persistDic = {};
  dic = {};
};
