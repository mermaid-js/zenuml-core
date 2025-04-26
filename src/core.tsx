import parentLogger from "./logger/logger";
import store, {
  codeAtom,
  enableMultiThemeAtom,
  enableScopedThemingAtom,
  modeAtom,
  onContentChangeAtom,
  onEventEmitAtom,
  onThemeChangeAtom,
  RenderMode,
  stickyOffsetAtom,
  themeAtom,
} from "./store/Store";
import { DiagramFrame } from "./components/DiagramFrame/DiagramFrame";
// import SeqDiagram from "./components/DiagramFrame/SeqDiagram/SeqDiagram.vue";
import { VERSION } from "./version.ts";
import * as htmlToImage from "html-to-image";

import "./assets/tailwind.css";
import "./assets/tailwind-preflight.less";
import "./components/Cosmetic.scss";
import "./components/Cosmetic-blue.scss";
import "./components/Cosmetic-black-white.scss";
import "./components/Cosmetic-star-uml.scss";
import "./components/theme-blue-river.scss";
import "./themes/theme-dark.css";

// import Block from "./components/DiagramFrame/SeqDiagram/MessageLayer/Block/Block.vue";
// import Comment from "./components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/Comment/Comment.vue";
import { getStartTime, calculateCostTime } from "./utils/CostTime";
import { clearCache } from "./utils/RenderingCache";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { Provider } from "jotai";
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
interface IZenUml {
  get code(): string | undefined;
  get theme(): string | undefined;
  // Resolve after rendering is finished.
  render(
    code: string | undefined,
    config: Config | undefined,
  ): Promise<IZenUml>;
}

export default class ZenUml implements IZenUml {
  static readonly version = VERSION;

  private readonly el: HTMLElement;
  private _code: string | undefined;
  private _theme: string | undefined;
  private readonly store: typeof store;
  private _currentTimeout: NodeJS.Timeout | undefined;
  private _lastRenderingCostMilliseconds = 0;
  private initialRender = true;
  constructor(el: HTMLElement, naked: boolean = false) {
    this.el = el;
    this.store = store;
    createRoot(el).render(
      <StrictMode>
        <Provider store={store}>
          <div> {naked ? <SeqDiagram /> : <DiagramFrame />}</div>
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
    this.store.set(codeAtom, this._code || "");
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

  async getPng(): Promise<string> {
    return htmlToImage.toPng(this.el, {
      backgroundColor: "white",
      filter: (node) => {
        return !node?.classList?.contains("hide-export");
      },
    });
  }
}

export const VueSequence = {
  store,
  // SeqDiagram,
  // DiagramFrame,
};
