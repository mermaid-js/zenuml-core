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
import * as htmlToImage from "html-to-image";
import Parser from "./parser/index.js";

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
import { StrictMode } from "react";
import { createStore, Provider } from "jotai";
import { SeqDiagram } from "./components/DiagramFrame/SeqDiagram/SeqDiagram.tsx";
import { CommitSignal } from "./components/CommitSignal";
import {
  paintSvgCanvas,
  readCanvasSurface,
  withOpaqueCanvasForExport,
  validateDiagramPalette,
  type CanvasSurface,
  type DiagramPalette,
} from "./theme/DiagramPalette";
export type { CanvasSurface, DiagramPalette } from "./theme/DiagramPalette";
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

export interface Config {
  theme?: string;
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
  getCanvasSurface(): CanvasSurface;
}

type RenderRequest = {
  code: string;
  theme: string;
  config: Config | undefined;
  revision: number;
};

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
  readonly #root: ReturnType<typeof createRoot>;
  private readonly naked: boolean;
  private _currentTimeout: NodeJS.Timeout | undefined;
  private _lastRenderingCostMilliseconds = 0;
  private initialRender = true;
  private revision = 0;
  private pending: Array<{
    resolve: (value: IZenUml) => void;
    reject: (reason: unknown) => void;
  }> = [];
  private latestRenderPromise: Promise<IZenUml> | undefined;
  constructor(el: HTMLElement | string, naked: boolean = false) {
    this.el = typeof el === "string" ? document.querySelector(el)! : el;
    this.store = createStore();
    this.#root = createRoot(this.el);
    this.naked = naked;

    this.store.sub(themeAtom, () => {
      this.store.get(onThemeChangeAtom)({
        theme: this.store.get(themeAtom),
        scoped: this.store.get(enableScopedThemingAtom),
      });
    });

    this.addPortalRootElement();
  }

  private mount(revision: number, onCommit: (revision: number) => void): void {
    this.#root.render(
      <StrictMode>
        <Provider store={this.store}>
          {/* IMPORTANT: The .zenuml class here works with Tailwind's important: ".zenuml" configuration.
              With this setup, Tailwind generates selectors like ".zenuml .bg-skin-canvas" instead of
              just ".bg-skin-canvas". This means all Tailwind utilities used in child components
              (like DiagramFrame) will only work when they are descendants of an element with the
              .zenuml class. This provides scoped styling for the ZenUML library. */}
          <div className="zenuml">
            <ErrorBoundary>
              {this.naked ? <SeqDiagram canvasSurface /> : <DiagramFrame />}
            </ErrorBoundary>
            <CommitSignal revision={revision} onCommit={onCommit} />
          </div>
        </Provider>
      </StrictMode>,
    );
  }

  // DON'T REMOVE: headlessui portal root hack
  // ref: https://github.com/tailwindlabs/headlessui/discussions/666#discussioncomment-4966117
  private addPortalRootElement(): void {
    const portalRootElement = document.createElement("div");
    portalRootElement.id = "headlessui-portal-root";
    portalRootElement.className = "zenuml";
    portalRootElement.append(document.createElement("div"));
    document.body.append(portalRootElement);
  }

  async render(
    code: string | undefined,
    config: Config | undefined,
  ): Promise<IZenUml> {
    if (config?.palette) validateDiagramPalette(config.palette);
    if (this._currentTimeout) {
      clearTimeout(this._currentTimeout);
    }
    this._code = code === undefined ? this._code : code;
    this._theme = config?.theme || this._theme;
    const request: RenderRequest = {
      code: this._code || "",
      theme: this._theme || "default",
      config,
      revision: ++this.revision,
    };
    const promise = new Promise<IZenUml>((resolve, reject) =>
      this.pending.push({ resolve, reject }),
    );
    this.latestRenderPromise = promise;
    if (this.initialRender) {
      this.initialRender = false;
      void this.doRender(request);
    } else {
      this._currentTimeout = setTimeout(
        () => void this.doRender(request),
        this.calculateDebounceMilliseconds(),
      );
    }
    return promise;
  }

  async doRender(request: RenderRequest): Promise<void> {
    try {
      // Font loading can finish after a newer render was requested. Only the
      // newest captured request may write to the store or mount React.
      await ensureDiagramFontsLoaded();
      if (request.revision !== this.revision) return;
      const { config } = request;
      const start = getStartTime();
      clearCache();
      this.store.set(stickyOffsetAtom, config?.stickyOffset ?? 0);
      this.store.set(themeAtom, request.theme);
      this.store.set(paletteAtom, config?.palette);
      this.store.set(
        enableScopedThemingAtom,
        config?.enableScopedTheming || false,
      );
      this.store.set(modeAtom, config?.mode || RenderMode.Dynamic);
      this.store.set(renderRevisionAtom, request.revision);
      this.store.set(
        onContentChangeAtom,
        config?.onContentChange || (() => {}),
      );
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
        this.store.set(
          enableMessageInsertionAtom,
          config.enableMessageInsertion,
        );
      }
      if (config?.enableDividerInsertion !== undefined) {
        this.store.set(
          enableDividerInsertionAtom,
          config.enableDividerInsertion,
        );
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
      const codeChanged = request.code !== this.store.get(codeAtom);
      if (codeChanged) this.store.set(lifelineReadyAtom, []);
      const ready = codeChanged
        ? waitForRenderingReady(this.store, () =>
            this.store.set(codeAtom, request.code),
          )
        : waitForRenderingReady(this.store, () => {});
      const committed = new Promise<void>((resolve) => {
        this.mount(request.revision, (revision) => {
          if (revision === request.revision) resolve();
        });
      });
      await Promise.all([committed, ready]);
      if (request.revision !== this.revision) return;
      this._lastRenderingCostMilliseconds = calculateCostTime(start);
      for (const item of this.pending.splice(0)) item.resolve(this);
    } catch (error) {
      if (request.revision === this.revision) {
        for (const item of this.pending.splice(0)) item.reject(error);
      }
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

  /**
   * The host element is usually wider than the diagram; the export paints the
   * rest with the theme's canvas colour so a dark theme stays dark edge to
   * edge (ADR 0004). White when the canvas is transparent or not rendered yet.
   */
  getCanvasSurface(): CanvasSurface {
    const canvas = this.el.querySelector(".bg-skin-canvas");
    // This is a read-time snapshot: call again after changing host CSS.
    const fallback = this.store.get(paletteAtom)?.canvas;
    return readCanvasSurface(canvas, fallback);
  }

  private async awaitActiveRender(): Promise<void> {
    while (this.latestRenderPromise) {
      const pending = this.latestRenderPromise;
      await pending;
      if (pending === this.latestRenderPromise) return;
    }
  }

  async getPng(): Promise<string> {
    await this.awaitActiveRender();
    const surface = this.getCanvasSurface();
    return withOpaqueCanvasForExport(this.el, surface, (node, cloned) =>
      htmlToImage.toPng(node, {
        backgroundColor: surface.backgroundColor,
        style: cloned
          ? { position: "relative", left: "0", top: "0" }
          : undefined,
        filter: (node) => !node?.classList?.contains("hide-export"),
      }),
    );
  }

  async getSvg(): Promise<string> {
    await this.awaitActiveRender();
    const surface = this.getCanvasSurface();
    const svg = await withOpaqueCanvasForExport(
      this.el,
      surface,
      (node, cloned) =>
        htmlToImage.toSvg(node, {
          backgroundColor: surface.backgroundColor,
          style: cloned
            ? { position: "relative", left: "0", top: "0" }
            : undefined,
          filter: (node) => !node?.classList?.contains("hide-export"),
        }),
    );
    return paintSvgCanvas(svg, surface);
  }
}
