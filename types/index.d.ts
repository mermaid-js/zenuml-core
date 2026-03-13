export interface RenderOptions {
  theme?: 'theme-default' | 'theme-mermaid';
}

export interface RenderResult {
  svg: string;
  /** Inner SVG content (defs + g) for embedding into an existing SVG container */
  innerSvg: string;
  width: number;
  height: number;
  viewBox: string;
}

export declare function renderToSvg(code: string, options?: RenderOptions): RenderResult;

export interface ParseResult {
  pass: boolean;
  errorDetails: ErrorDetail[];
}

export interface ErrorDetail {
  line: number;
  column: number;
  msg: string;
}

interface Config {
  theme?: string;
  enableScopedTheming?: boolean;
  onThemeChange?: (data: { theme: string; scoped?: boolean }) => void;
  enableMultiTheme?: boolean;
  stickyOffset?: number | false;
  onContentChange?: (code: string) => void;
  mode?: string;
}

interface IZenUml {
  get code(): string | undefined;
  get theme(): string | undefined;
  parse(text: string): Promise<ParseResult>;
  render(code: string | undefined, config: Config | undefined): Promise<IZenUml>;
}

declare class ZenUml implements IZenUml {
  static readonly version: string;
  static readonly default: typeof ZenUml;
  constructor(el: HTMLElement | string, naked?: boolean);
  get code(): string | undefined;
  get theme(): string | undefined;
  parse(text: string): Promise<ParseResult>;
  render(code: string | undefined, config: Config | undefined): Promise<IZenUml>;
  getPng(): Promise<string>;
  getSvg(): Promise<string>;
}

export default ZenUml;
