import parentLogger from "./logger/logger";
import { createApp } from "vue";
import { createStore } from "vuex";
import Store, { RenderMode } from "./store/Store";
import DiagramFrame from "./components/DiagramFrame/DiagramFrame.vue";
import SeqDiagram from "./components/DiagramFrame/SeqDiagram/SeqDiagram.vue";

import "./assets/tailwind.css";
import "./assets/tailwind-preflight.less";
import "./components/Cosmetic.scss";
import "./components/Cosmetic-blue.scss";
import "./components/Cosmetic-black-white.scss";
import "./components/Cosmetic-star-uml.scss";
import "./components/theme-blue-river.scss";
import "./themes/theme-dark.css";

import Block from "./components/DiagramFrame/SeqDiagram/MessageLayer/Block/Block.vue";
import Comment from "./components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/Comment/Comment.vue";
import { getStartTime, calculateCostTime } from "./utils/CostTime";
import { clearCache } from "./utils/RenderingCache";
const logger = parentLogger.child({ name: "core" });

interface Config {
  theme?: string;
  enableScopedTheming?: boolean;
  onThemeChange?: (data: { theme: string; scoped?: boolean }) => void;
  enableMultiTheme?: boolean;
  stickyOffset?: number;
  onContentChange?: (code: string) => void;
  mode?: RenderMode;
}
interface IZenUml {
  get code(): string | undefined;
  get theme(): string | undefined;
  // Resolve after rendering is finished.
  // eslint-disable-next-line no-unused-vars
  render(
    code: string | undefined,
    config: Config | undefined,
  ): Promise<IZenUml>;
}

export default class ZenUml implements IZenUml {
  private readonly el: Element;
  private _code: string | undefined;
  private _theme: string | undefined;
  private readonly store: any;
  private readonly app: any;
  private _currentTimeout: any;
  private _lastRenderingCostMilliseconds = 0;
  private initialRender = true;
  constructor(el: Element, naked: boolean = false) {
    this.el = el;
    this.store = createStore(Store());
    this.app = createApp(naked ? SeqDiagram : DiagramFrame);
    this.app.component("Comment", Comment);
    this.app.component("Block", Block);
    this.app.use(this.store);
    this.app.mount(this.el);
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
    this._code = code || this._code;
    this._theme = config?.theme || this._theme;
    this.store.state.stickyOffset = config?.stickyOffset || 0;
    this.store.state.theme = this._theme || "default";
    this.store.state.enableScopedTheming = config?.enableScopedTheming || false;
    this.store.state.mode = config?.mode || RenderMode.Dynamic;

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
    this.store.commit("onContentChange", config?.onContentChange || (() => {}));
    this.store.commit("onThemeChange", config?.onThemeChange || (() => {}));
    if (config?.enableMultiTheme !== undefined) {
      this.store.state.enableMultiTheme = config?.enableMultiTheme;
    }
    // await dispatch will wait until the diagram is finished rendering.
    // It includes the time adjusting the top of participants for creation message.
    // $nextTick is different from setTimeout. The latter will be executed after dispatch has returned.
    // @ts-ignore
    await this.store.dispatch("updateCode", { code: this._code });
    this._lastRenderingCostMilliseconds = calculateCostTime(
      "rendering end",
      start,
    );
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
    // @ts-ignore
    return this.el.children[0].__vue__.toPng();
  }
}

export const VueSequence = {
  createApp,
  createStore,
  Store,
  SeqDiagram,
  DiagramFrame,
};
