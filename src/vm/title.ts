export interface TitleVM {
  /** The display text of the title */
  text: string;
}

/**
 * Build TitleVM from title context
 */
export function buildTitleVM(titleContext: any): TitleVM | undefined {
  if (!titleContext) {
    return undefined;
  }

  const text = titleContext.content?.() || "";
  
  return {
    text,
  };
}
