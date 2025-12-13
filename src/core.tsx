import parentLogger from "./logger/logger";
import {
  codeAtom,
  enableMultiThemeAtom,
  enableScopedThemingAtom,
  lifelineReadyAtom,
  modeAtom,
  onContentChangeAtom,
  onEventEmitAtom,
  onThemeChangeAtom,
  renderingReadyAtom,
  RenderMode,
  stickyOffsetAtom,
  themeAtom,
} from "./store/Store";
import { DiagramFrame } from "./components/DiagramFrame/DiagramFrame";
import { VERSION } from "./version.ts";
import * as htmlToImage from "html-to-image";
import RootContext from "./parser/index.js";
import Errors from "./parser/index.js";

import "./assets/tailwind.css";
import "./assets/tailwind-preflight.less";
import "./components/Cosmetic.scss";
import "./components/Cosmetic-blue.scss";
import "./components/Cosmetic-black-white.scss";
import "./components/Cosmetic-star-uml.scss";
import "./components/theme-blue-river.scss";
import "./themes/theme-dark.css";

import { getStartTime, calculateCostTime } from "./utils/CostTime";
import { clearCache } from "./utils/RenderingCache";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { createStore, Provider } from "jotai";
import { SeqDiagram } from "./components/DiagramFrame/SeqDiagram/SeqDiagram.tsx";
const logger = parentLogger.child({ name: "core" });

interface Config {
  theme?: string;
  enableScopedTheming?: boolean;
  onThemeChange?: (data: { theme: string; scoped?: boolean }) => void;
  enableMultiTheme?: boolean;
  stickyOffset?: number;
  onContentChange?: (code: string) => void;
  onEventEmit?: (name: string, data: unknown) => void;
  mode?: RenderMode;
}

export interface ParseResult {
  pass: boolean;
  offendingSymbol?: string;
  line?: number;
  col?: number;
  msg?: string;
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
}

export default class ZenUml implements IZenUml {
  static readonly version = VERSION;
  // UMD Compatibility Layer - Support both window.zenuml and window.zenuml.default
  // The problem was introduced at commit 4c46879f when we remove the named export VueSequence
  static readonly default = ZenUml; // Self-reference for UMD compatibility

  private readonly el: HTMLElement;
  private _code: string | undefined;
  private _theme: string | undefined;
  private readonly store: ReturnType<typeof createStore>;
  private _currentTimeout: NodeJS.Timeout | undefined;
  private _lastRenderingCostMilliseconds = 0;
  private initialRender = true;
  constructor(el: HTMLElement | string, naked: boolean = false) {
    this.el = typeof el === "string" ? document.querySelector(el)! : el;
    this.store = createStore();

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
          <div className="zenuml">
            {" "}
            {naked ? <SeqDiagram /> : <DiagramFrame />}
          </div>
        </Provider>
      </StrictMode>,
    );
    this.addPortalRootElement();
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
    if (this._currentTimeout) {
      console.debug("rendering clearTimeout");
      clearTimeout(this._currentTimeout);
    }
    logger.debug("rendering", code, config);
    this._code = code === undefined ? this._code : code;
    this._theme = config?.theme || this._theme;
    this.store.set(stickyOffsetAtom, config?.stickyOffset || 0);
    this.store.set(themeAtom, this._theme || "default");
    this.store.set(
      enableScopedThemingAtom,
      config?.enableScopedTheming || false,
    );
    this.store.set(modeAtom, config?.mode || RenderMode.Dynamic);

    // this.initialRender is used to avoid the first rendering is debounced by setTimeout.
    // The first rendering should be executed immediately. It fixes the issue that causes the blank screen on mermaid live editor.
    if (this.initialRender) {
      this.initialRender = false;
      await this.doRender(config);
    } else {
      this._currentTimeout = setTimeout(
        async () => await this.doRender(config),
        this.calculateDebounceMilliseconds(),
      );
    }

    return this;
  }

  async doRender(config: Config | undefined) {
    console.debug("rendering start");
    const start = getStartTime();
    clearCache();
    this.store.set(onContentChangeAtom, config?.onContentChange || (() => {}));
    this.store.set(onThemeChangeAtom, config?.onThemeChange || (() => {}));
    this.store.set(onEventEmitAtom, config?.onEventEmit || (() => {}));
    if (config?.enableMultiTheme !== undefined) {
      this.store.set(enableMultiThemeAtom, config?.enableMultiTheme);
    }
    if (this._code === this.store.get(codeAtom)) {
      return true;
    } else {
      await new Promise((resolve) => {
        this.store.set(lifelineReadyAtom, []);
        this.store.sub(renderingReadyAtom, () => {
          if (this.store.get(renderingReadyAtom)) {
            resolve(true);
          }
        });
        this.store.set(codeAtom, this._code || "");
      });
    }
    setTimeout(() => {
      this._lastRenderingCostMilliseconds = calculateCostTime(
        "rendering end",
        start,
      );
    }, 0);
  }

  calculateDebounceMilliseconds(): number {
    let debounce = this._lastRenderingCostMilliseconds;
    if (debounce > 2000) debounce = 2000;
    console.debug("rendering debounce: " + debounce + "ms");
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
        Errors.Errors.length = 0;

        const result = RootContext.RootContext(codeOrText);

        // Get all parsing errors that were captured
        const errors = [...Errors.Errors];

        // Clear errors after reading
        Errors.Errors.length = 0;

        if (errors.length > 0 || result === null) {
          // Parse the first error to extract structured information
          // Expected format: "${offendingSymbol} line ${line}, col ${column}: ${msg}"
          let offendingSymbol: string | undefined;
          let line: number | undefined;
          let col: number | undefined;
          let msg: string | undefined;

          if (errors.length > 0) {
            const errorStr = errors[0];
            const match = errorStr.match(/^(.*?) line (\d+), col (\d+): (.*)$/);

            if (match) {
              offendingSymbol = match[1]?.trim();
              line = parseInt(match[2], 10);
              col = parseInt(match[3], 10);
              msg = match[4];
            } else {
              // Fallback if the error doesn't match expected format
              offendingSymbol = 'unknown';
              line = 0;
              col = 0;
              msg = errorStr;
            }
          }

          // Return ParseResult indicating failure with structured error info
          const parseResult: ParseResult = {
            pass: false,
            offendingSymbol,
            line,
            col,
            msg
          };

          resolve(parseResult);
          return;
        }

        // If successful, return the ParseResult object indicating success
        const parseResult: ParseResult = {
          pass: true,
        };

        resolve(parseResult);
      } catch (error) {
        // Clear errors in case of exception too
        Errors.Errors.length = 0;

        const parseResult: ParseResult = {
          pass: false,
          offendingSymbol: 'exception',
          line: 0,
          col: 0,
          msg: `Parse error: ${error instanceof Error ? error.message : String(error)}`
        };
        resolve(parseResult);
      }
    });
  }

  async getPng(): Promise<string> {
    return htmlToImage.toPng(this.el, {
      backgroundColor: "white",
      filter: (node) => {
        return !node?.classList?.contains("hide-export");
      },
    });
  }

  async getSvg(): Promise<string> {
    return htmlToImage.toSvg(this.el, {
      filter: (node) => {
        return !node?.classList?.contains("hide-export");
      },
    });
  }
}
