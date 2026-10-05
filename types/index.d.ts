export type SvgTheme =
  | "theme-default"
  | "theme-mermaid"
  | "theme-clean-light"
  | "theme-clean-dark"
  | "theme-neon";

export interface RenderOptions {
  /** Theme name. Unknown names fall back to 'theme-default'. */
  theme?: SvgTheme;
  /** Show sequence references and their badges; defaults to true. */
  enableNumbering?: boolean;
}

export interface RenderResult {
  svg: string;
  /** Inner SVG content (defs + g) for embedding into an existing SVG container */
  innerSvg: string;
  width: number;
  height: number;
  viewBox: string;
}

export declare function renderToSvg(
  code: string,
  options?: RenderOptions,
): RenderResult;

/**
 * Make the diagram typefaces available to text measurement and rendering in a
 * browser. `ZenUml.render()` awaits it; call it yourself before
 * `renderToSvg()`. Never rejects: a refused font falls back to the font stack.
 */
export declare function ensureDiagramFontsLoaded(): Promise<void>;

/** Font families whose file URL can be set with {@link setDiagramFontUrl}. */
export type DiagramFontFamily = "IBM Plex Sans" | "MS Sans Serif";

/**
 * Set the URL the browser renderer loads a diagram font from, instead of its
 * default. Call before rendering. Use it when the page's Content-Security-Policy
 * refuses `data:` fonts, with the font file this package ships at
 * `@zenuml/core/fonts/IBMPlexSans-Regular-Latin1.woff2`, served from an origin
 * the policy allows.
 *
 * `family` defaults to "IBM Plex Sans", which otherwise loads from an embedded
 * `data:` URI. "MS Sans Serif" (theme-neon, `@zenuml/core/fonts/MS-Sans-Serif.ttf`)
 * is only loaded when set. `null` restores the default. Changing the URL makes
 * the next render load the font again.
 */
export declare function setDiagramFontUrl(
  url: string | null,
  family?: DiagramFontFamily,
): void;

/**
 * The IBM Plex Sans `@font-face` rule with the font embedded as a `data:` URI,
 * for rasterising the rendered DOM — e.g. html-to-image's `fontEmbedCSS`
 * option. SVG-as-image can only use embedded fonts, and html-to-image does not
 * see faces registered with the FontFace API. Works on pages whose
 * Content-Security-Policy refuses data: fonts for the document itself.
 */
export declare function getDiagramFontFaceCss(): Promise<string | undefined>;

export interface ParseResult {
  pass: boolean;
  errorDetails: ErrorDetail[];
}

export interface ErrorDetail {
  line: number;
  column: number;
  msg: string;
}

export interface Config {
  theme?: string;
  enableScopedTheming?: boolean;
  onThemeChange?: (data: { theme: string; scoped?: boolean }) => void;
  enableMultiTheme?: boolean;
  /** Show hierarchical message numbering. Omission preserves stored state (initially true). */
  enableNumbering?: boolean;
  stickyOffset?: number | false;
  onContentChange?: (code: string) => void;
  mode?: string;
}

interface IZenUml {
  get code(): string | undefined;
  get theme(): string | undefined;
  parse(text: string): Promise<ParseResult>;
  render(
    code: string | undefined,
    config: Config | undefined,
  ): Promise<IZenUml>;
}

declare class ZenUml implements IZenUml {
  static readonly version: string;
  static readonly default: typeof ZenUml;
  /** Same as the named export {@link setDiagramFontUrl}. */
  static readonly setDiagramFontUrl: typeof setDiagramFontUrl;
  constructor(el: HTMLElement | string, naked?: boolean);
  get code(): string | undefined;
  get theme(): string | undefined;
  parse(text: string): Promise<ParseResult>;
  render(
    code: string | undefined,
    config: Config | undefined,
  ): Promise<IZenUml>;
  getPng(): Promise<string>;
  getSvg(): Promise<string>;
}

export default ZenUml;
