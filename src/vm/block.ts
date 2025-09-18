export interface BlockVM {
  /**
   * The list of statements inside this block. Currently these are parser
   * contexts; downstream components (Statement) will build their own VMs.
   */
  statements: any[];
}

/**
 * Build a BlockVM from a block-like parser context.
 * Falls back gracefully if context is missing or does not expose `stat()`.
 */
export function buildBlockVM(context: any): BlockVM {
  const statements: any[] = (typeof context?.stat === 'function' && context.stat()) ||  [];

  return { statements };
}

