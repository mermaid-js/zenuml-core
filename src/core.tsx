import {
  codeAtom,
  enableDividerInsertionAtom,
  enableNumberingAtom,
  enableMessageInsertionAtom,
  enableMessageReorderAtom,
  enableMultiThemeAtom,
  enableParticipantInsertionAtom,
  enableParticipantStyleEditingAtom,
  enableScopedThemingAtom,
  lifelineReadyAtom,
  modeAtom,
  paletteAtom,
  onContentChangeAtom,
  onEventEmitAtom,
  onThemeChangeAtom,
  RenderMode,
  renderRevisionAtom,
  stickyOffsetAtom,
  themeAtom,
} from "./store/Store";
import { DiagramFrame } from "./components/DiagramFrame/DiagramFrame";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { VERSION } from "./version.ts";
import Parser from "./parser/index";
import colorString from "color-string";

import "./assets/tailwind.css";
import "./assets/tailwind-preflight.less";
import "./components/Cosmetic.scss";
import "./components/Cosmetic-blue.scss";
import "./components/Cosmetic-black-white.scss";
import "./components/Cosmetic-star-uml.scss";
import "./components/theme-blue-river.scss";

import { getStartTime, calculateCostTime } from "./utils/CostTime";
import { clearCache } from "./utils/RenderingCache";
import { waitForRenderingReady } from "./store/waitForRenderingReady";
import { createRoot } from "react-dom/client";
import { StrictMode, useLayoutEffect } from "react";
import type { PropsWithChildren } from "react";
import { flushSync } from "react-dom";
import { createStore, Provider, useAtomValue } from "jotai";
import { SeqDiagram } from "./components/DiagramFrame/SeqDiagram/SeqDiagram.tsx";
export { renderToSvg } from "./svg/renderToSvg";
export { ensureDiagramIconsLoaded } from "./svg/icons";
import {
  ensureDiagramFontsLoaded,
  getDiagramFontFaceCss,
  setDiagramFontUrl,
} from "./svg/fonts/ensureDiagramFontsLoaded";
export { ensureDiagramFontsLoaded, getDiagramFontFaceCss, setDiagramFontUrl };
export type { DiagramFontFamily } from "./svg/fonts/ensureDiagramFontsLoaded";
export type { RenderResult, RenderOptions } from "./svg/renderToSvg";
export type { RenderSurface } from "./surface";
export type { DiagramPalette } from "./surface";
export type { ExportOptions } from "./exportBackground";
import { exportCanvas, exportSvg } from "./exportBackground";
import type { ExportOptions } from "./exportBackground";
import type { RenderSurface } from "./surface";
import type { DiagramPalette } from "./surface";

const RenderCommit = ({
  onCommit,
}: {
  onCommit: (revision: number) => void;
}) => {
  const revision = useAtomValue(renderRevisionAtom);
  useLayoutEffect(() => onCommit(revision), [revision, onCommit]);
  return null;
};

const DiagramRoot = ({ children }: PropsWithChildren) => (
  <div className="zenuml" style={{ display: "inline-block" }}>
    {children}
  </div>
);

export interface Config {
  theme?: string;
  /** Semantic document colours. Supplied slots override the selected theme. */
  palette?: DiagramPalette;
  enableScopedTheming?: boolean;
  onThemeChange?: (data: { theme: string; scoped?: boolean }) => void;
  enableMultiTheme?: boolean;
  /** Show hierarchical message numbering. Omission preserves stored state (initially true). */
  enableNumbering?: boolean;
  stickyOffset?: number | false;
  onContentChange?: (code: string) => void;
  onEventEmit?: (name: string, data: unknown) => void;
  mode?: RenderMode;
  // Editing feature flags. Default off; opt in per surface.
  // Message insertion is currently broken for nested messages, so the flag
  // exists to ship participant insertion independently.
  enableParticipantInsertion?: boolean;
  enableMessageInsertion?: boolean;
  enableDividerInsertion?: boolean;
  enableParticipantStyleEditing?: boolean;
  // Drag-to-reorder used to run with no flag at all — the only editing
  // surface in the rendering core with no opt-out. Default off, like every
  // other editing flag above.
  enableMessageReorder?: boolean;
}

export interface ParseResult {
  pass: boolean;
  errorDetails: ErrorDetail[];
}
export interface ErrorDetail {
  line: number;
  column: number;
  msg: string;
}

interface IZenUml {
  get code(): string | undefined;
  get theme(): string | undefined;
  parse(text: string): Promise<ParseResult>;
  // Resolve after rendering is finished.
  render(
    code: string | undefined,
    config: Config | undefined,
  ): Promise<IZenUml>;
  getSurface(): RenderSurface;
}

export default class ZenUml implements IZenUml {
  static readonly version = VERSION;
  // UMD Compatibility Layer - Support both window.zenuml and window.zenuml.default
  // The problem was introduced at commit 4c46879f when we remove the named export VueSequence
  static readonly default = ZenUml; // Self-reference for UMD compatibility
  /** See {@link setDiagramFontUrl}; also reachable from the UMD global. */
  static readonly setDiagramFontUrl = setDiagramFontUrl;

  private readonly el: HTMLElement;
  private _code: string | undefined;
  private _theme: string | undefined;
  private readonly store: ReturnType<typeof createStore>;
  private _currentTimeout: NodeJS.Timeout | undefined;
  private _lastRenderingCostMilliseconds = 0;
  private initialRender = true;
  private revision = 0;
  private committedRevision = 0;
  private commitWaiters = new Map<number, () => void>();
  private pendingRenders: {
    resolve: (value: IZenUml) => void;
    reject: (reason: unknown) => void;
  }[] = [];
  constructor(
    el: HTMLElement | string,
    naked: boolean = false,
    initial?: Pick<Config, "theme" | "palette">,
  ) {
    this.el = typeof el === "string" ? document.querySelector(el)! : el;
    this.store = createStore();
    this._theme = initial?.theme;
    this.store.set(themeAtom, initial?.theme || "theme-default");
    this.store.set(paletteAtom, initial?.palette);

    this.store.sub(themeAtom, () => {
      this.store.get(onThemeChangeAtom)({
        theme: this.store.get(themeAtom),
        scoped: this.store.get(enableScopedThemingAtom),
      });
    });

    createRoot(this.el).render(
      <StrictMode>
        <Provider store={this.store}>
          {/* IMPORTANT: The .zenuml class here works with Tailwind's important: ".zenuml" configuration.
              With this setup, Tailwind generates selectors like ".zenuml .bg-skin-canvas" instead of
              just ".bg-skin-canvas". This means all Tailwind utilities used in child components
              (like DiagramFrame) will only work when they are descendants of an element with the
              .zenuml class. This provides scoped styling for the ZenUML library. */}
          <DiagramRoot>
            <RenderCommit onCommit={this.onCommit} />
            <ErrorBoundary>
              {naked ? <SeqDiagram /> : <DiagramFrame />}
            </ErrorBoundary>
          </DiagramRoot>
        </Provider>
      </StrictMode>,
    );
  }

  private onCommit = (revision: number): void => {
    this.committedRevision = Math.max(this.committedRevision, revision);
    for (const [id, resolve] of this.commitWaiters) {
      if (id <= this.committedRevision) {
        this.commitWaiters.delete(id);
        resolve();
      }
    }
  };

  private waitForCommit(revision: number): Promise<void> {
    if (this.committedRevision >= revision) return Promise.resolve();
    return new Promise((resolve) => this.commitWaiters.set(revision, resolve));
  }

  render(
    code: string | undefined,
    config: Config | undefined,
  ): Promise<IZenUml> {
    if (this._currentTimeout) {
      clearTimeout(this._currentTimeout);
    }
    const revision = ++this.revision;
    this._code = code === undefined ? this._code : code;
    this._theme = config?.theme || this._theme;
    this.store.set(stickyOffsetAtom, config?.stickyOffset ?? 0);
    this.store.set(themeAtom, this._theme || "default");
    if (config && Object.prototype.hasOwnProperty.call(config, "palette")) {
      this.store.set(paletteAtom, config.palette);
    }
    this.store.set(
      enableScopedThemingAtom,
      config?.enableScopedTheming || false,
    );
    this.store.set(modeAtom, config?.mode || RenderMode.Dynamic);

    // this.initialRender is used to avoid the first rendering is debounced by setTimeout.
    // The first rendering should be executed immediately. It fixes the issue that causes the blank screen on mermaid live editor.
    const result = new Promise<IZenUml>((resolve, reject) => {
      this.pendingRenders.push({ resolve, reject });
    });
    const run = () => {
      void this.doRender(config, revision).then(
        () => {
          if (revision !== this.revision) return;
          for (const pending of this.pendingRenders.splice(0))
            pending.resolve(this);
        },
        (error) => {
          if (revision !== this.revision) return;
          for (const pending of this.pendingRenders.splice(0))
            pending.reject(error);
        },
      );
    };
    if (this.initialRender) {
      this.initialRender = false;
      run();
    } else {
      this._currentTimeout = setTimeout(
        run,
        this.calculateDebounceMilliseconds(),
      );
    }
    return result;
  }

  async doRender(config: Config | undefined, revision = this.revision) {
    // Text is measured during render; the face must be available first.
    await ensureDiagramFontsLoaded();
    if (revision !== this.revision) return;
    const start = getStartTime();
    clearCache();
    this.store.set(onContentChangeAtom, config?.onContentChange || (() => {}));
    this.store.set(onThemeChangeAtom, config?.onThemeChange || (() => {}));
    this.store.set(onEventEmitAtom, config?.onEventEmit || (() => {}));
    if (config?.enableMultiTheme !== undefined) {
      this.store.set(enableMultiThemeAtom, config?.enableMultiTheme);
    }
    if (config?.enableNumbering !== undefined) {
      this.store.set(enableNumberingAtom, config.enableNumbering);
    }
    if (config?.enableParticipantInsertion !== undefined) {
      this.store.set(
        enableParticipantInsertionAtom,
        config.enableParticipantInsertion,
      );
    }
    if (config?.enableMessageInsertion !== undefined) {
      this.store.set(enableMessageInsertionAtom, config.enableMessageInsertion);
    }
    if (config?.enableDividerInsertion !== undefined) {
      this.store.set(enableDividerInsertionAtom, config.enableDividerInsertion);
    }
    if (config?.enableParticipantStyleEditing !== undefined) {
      this.store.set(
        enableParticipantStyleEditingAtom,
        config.enableParticipantStyleEditing,
      );
    }
    if (config?.enableMessageReorder !== undefined) {
      this.store.set(enableMessageReorderAtom, config.enableMessageReorder);
    }
    const changed = this._code !== this.store.get(codeAtom);
    const beginRender = () =>
      flushSync(() => {
        if (changed) this.store.set(lifelineReadyAtom, []);
        if (changed) this.store.set(codeAtom, this._code || "");
        this.store.set(renderRevisionAtom, revision);
      });
    const ready = changed
      ? waitForRenderingReady(this.store, beginRender)
      : (beginRender(), Promise.resolve());
    await Promise.all([this.waitForCommit(revision), ready]);
    if (revision === this.revision) {
      this._lastRenderingCostMilliseconds = calculateCostTime(start);
    }
  }

  calculateDebounceMilliseconds(): number {
    let debounce = this._lastRenderingCostMilliseconds;
    if (debounce > 2000) debounce = 2000;
    return debounce;
  }

  get code(): string | undefined {
    return this._code;
  }

  get theme(): string | undefined {
    return this._theme;
  }

  parse(codeOrText: string): Promise<ParseResult> {
    return new Promise((resolve) => {
      try {
        // Clear any previous errors
        Parser.ErrorDetails.length = 0;
        const result = Parser.RootContext(codeOrText);
        const errors = [...Parser.ErrorDetails];
        // Clear errors after reading
        Parser.ErrorDetails.length = 0;
        if (errors.length > 0 || result === null) {
          // Return ParseResult indicating failure with structured error info
          const parseResult: ParseResult = {
            pass: false,
            errorDetails: errors,
          };
          resolve(parseResult);
          return;
        }
        const parseResult: ParseResult = {
          pass: true,
          errorDetails: [],
        };
        resolve(parseResult);
      } catch {
        const parseResult: ParseResult = {
          pass: false,
          errorDetails: [],
        };
        resolve(parseResult);
      }
    });
  }

  /** The document's raw outer-canvas colour, refreshed on every call. */
  getSurface(): RenderSurface {
    const canvas = this.el.querySelector<HTMLElement>(".bg-skin-canvas");
    const computed = canvas && getComputedStyle(canvas).backgroundColor;
    if (computed) return { backgroundColor: computed };
    // CSS variables are not resolved by test DOM implementations; read the
    // authored inline palette while preserving the browser's computed path.
    const authored = canvas?.style.getPropertyValue("--color-bg-canvas");
    const parsed = authored && colorString.get.rgb(authored);
    return {
      backgroundColor: parsed
        ? parsed[3] === 1
          ? `rgb(${parsed[0]}, ${parsed[1]}, ${parsed[2]})`
          : `rgba(${parsed[0]}, ${parsed[1]}, ${parsed[2]}, ${parsed[3]})`
        : "rgba(0, 0, 0, 0)",
    };
  }

  async getPng(options?: ExportOptions): Promise<string> {
    const documentElement =
      this.el.querySelector<HTMLElement>(
        ".bg-skin-canvas, .sequence-diagram",
      ) ?? this.el;
    return (await exportCanvas(documentElement, options)).toDataURL(
      "image/png",
    );
  }

  async getSvg(options?: ExportOptions): Promise<string> {
    const documentElement =
      this.el.querySelector<HTMLElement>(
        ".bg-skin-canvas, .sequence-diagram",
      ) ?? this.el;
    return exportSvg(documentElement, options);
  }
}
