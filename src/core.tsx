import {
  codeAtom,
  DEFAULT_THEME,
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
import type { WritableAtom } from "jotai";
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

/**
 * Options for {@link ZenUml.render}. Every option is optional.
 *
 * What an omitted option does on the next `render()` is fixed per option and
 * listed on each member:
 * - **keeps**: the value from an earlier render (or the constructor) stays.
 * - **resets**: the option goes back to its default, so a host that wants it
 *   must pass it on every render.
 *
 * Most options are written inside `render()` itself. The callbacks and the
 * editing flags are written later, after the debounce and the font load, so a
 * render that is replaced before then never writes them.
 */
export interface Config {
  /**
   * Theme class name, for example `"theme-clean-light"`.
   * Written immediately. Omitted, `undefined`, `null` or `""` keeps the
   * current theme (initially `"theme-default"`).
   */
  theme?: string;
  /**
   * Semantic document colours. Supplied slots override the selected theme.
   * Written immediately. Omitting the key keeps the current palette; passing
   * the key with the value `undefined` clears it.
   */
  palette?: DiagramPalette;
  /**
   * Scope the theme to the diagram instead of the page.
   * Written immediately. Resets to `false` when omitted or falsy.
   */
  enableScopedTheming?: boolean;
  /**
   * Called when the theme changes.
   * Written after the debounce. Resets to a no-op when omitted or falsy.
   */
  onThemeChange?: (data: { theme: string; scoped?: boolean }) => void;
  /**
   * Written after the debounce. Keeps the current value when `undefined`
   * (initially `true`).
   */
  enableMultiTheme?: boolean;
  /**
   * Show hierarchical message numbering.
   * Written after the debounce. Keeps the stored value when `undefined`
   * (initially `true`).
   */
  enableNumbering?: boolean;
  /**
   * Sticky offset of the participant row.
   * Written immediately. Resets to `0` when omitted or `null`; `false`
   * turns sticky participants off.
   */
  stickyOffset?: number | false;
  /**
   * Called with the new code after an edit.
   * Written after the debounce. Resets to a no-op when omitted or falsy.
   */
  onContentChange?: (code: string) => void;
  /**
   * Called for events the diagram emits.
   * Written after the debounce. Resets to a no-op when omitted or falsy.
   */
  onEventEmit?: (name: string, data: unknown) => void;
  /**
   * Written immediately. Resets to `RenderMode.Dynamic` when omitted or falsy.
   */
  mode?: RenderMode;
  // Editing feature flags. Default off; opt in per surface. Each is written
  // after the debounce and keeps its current value when `undefined`.
  /** Insert participants from the diagram. Default off. */
  enableParticipantInsertion?: boolean;
  /**
   * Insert messages from the diagram. Default off. Message insertion is
   * currently broken for nested messages, so the flag exists to ship
   * participant insertion independently.
   */
  enableMessageInsertion?: boolean;
  /** Insert dividers from the diagram. Default off. */
  enableDividerInsertion?: boolean;
  /** Edit participant styles from the diagram. Default off. */
  enableParticipantStyleEditing?: boolean;
  /**
   * Drag-to-reorder used to run with no flag at all, the only editing surface
   * in the rendering core with no opt-out. Default off, like every other
   * editing flag above.
   */
  enableMessageReorder?: boolean;
}

type Absent = (config: Config, key: keyof Config) => boolean;
const isUndefined: Absent = (config, key) => config[key] === undefined;
const isNullish: Absent = (config, key) => config[key] == null;
const isFalsy: Absent = (config, key) => !config[key];
const isKeyMissing: Absent = (config, key) =>
  !Object.prototype.hasOwnProperty.call(config, key);

type Rule<V> = { onAbsent: "keep" } | { onAbsent: "reset"; default: V };

type Binding<K extends keyof Config> = {
  key: K;
  atom: WritableAtom<unknown, [Exclude<Config[K], undefined>], void>;
  /** `render()` itself, or `doRender()` after the debounce and font load. */
  appliedIn: "render" | "doRender";
  /** Decides whether the caller left the option out. */
  isAbsent: Absent;
} & Rule<Exclude<Config[K], undefined>>;

const bind = <K extends keyof Config>(binding: Binding<K>) =>
  binding as unknown as Binding<keyof Config>;

const noop = () => {};

/**
 * The one place where {@link Config} is copied into the store. Order matters:
 * entries are applied top to bottom, and the theme subscription reads the
 * scoped-theming atom when the theme changes.
 */
const CONFIG_BINDINGS = [
  bind({
    key: "stickyOffset",
    atom: stickyOffsetAtom,
    appliedIn: "render",
    isAbsent: isNullish,
    onAbsent: "reset",
    default: 0,
  }),
  bind({
    key: "theme",
    atom: themeAtom,
    appliedIn: "render",
    isAbsent: isFalsy,
    onAbsent: "keep",
  }),
  bind({
    key: "palette",
    atom: paletteAtom,
    appliedIn: "render",
    isAbsent: isKeyMissing,
    onAbsent: "keep",
  }),
  bind({
    key: "enableScopedTheming",
    atom: enableScopedThemingAtom,
    appliedIn: "render",
    isAbsent: isFalsy,
    onAbsent: "reset",
    default: false,
  }),
  bind({
    key: "mode",
    atom: modeAtom,
    appliedIn: "render",
    isAbsent: isFalsy,
    onAbsent: "reset",
    default: RenderMode.Dynamic,
  }),
  bind({
    key: "onContentChange",
    atom: onContentChangeAtom,
    appliedIn: "doRender",
    isAbsent: isFalsy,
    onAbsent: "reset",
    default: noop,
  }),
  bind({
    key: "onThemeChange",
    atom: onThemeChangeAtom,
    appliedIn: "doRender",
    isAbsent: isFalsy,
    onAbsent: "reset",
    default: noop,
  }),
  bind({
    key: "onEventEmit",
    atom: onEventEmitAtom,
    appliedIn: "doRender",
    isAbsent: isFalsy,
    onAbsent: "reset",
    default: noop,
  }),
  bind({
    key: "enableMultiTheme",
    atom: enableMultiThemeAtom,
    appliedIn: "doRender",
    isAbsent: isUndefined,
    onAbsent: "keep",
  }),
  bind({
    key: "enableNumbering",
    atom: enableNumberingAtom,
    appliedIn: "doRender",
    isAbsent: isUndefined,
    onAbsent: "keep",
  }),
  bind({
    key: "enableParticipantInsertion",
    atom: enableParticipantInsertionAtom,
    appliedIn: "doRender",
    isAbsent: isUndefined,
    onAbsent: "keep",
  }),
  bind({
    key: "enableMessageInsertion",
    atom: enableMessageInsertionAtom,
    appliedIn: "doRender",
    isAbsent: isUndefined,
    onAbsent: "keep",
  }),
  bind({
    key: "enableDividerInsertion",
    atom: enableDividerInsertionAtom,
    appliedIn: "doRender",
    isAbsent: isUndefined,
    onAbsent: "keep",
  }),
  bind({
    key: "enableParticipantStyleEditing",
    atom: enableParticipantStyleEditingAtom,
    appliedIn: "doRender",
    isAbsent: isUndefined,
    onAbsent: "keep",
  }),
  bind({
    key: "enableMessageReorder",
    atom: enableMessageReorderAtom,
    appliedIn: "doRender",
    isAbsent: isUndefined,
    onAbsent: "keep",
  }),
];

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
    this.store.set(themeAtom, initial?.theme || DEFAULT_THEME);
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
    this.applyConfig(config, "render");

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

  /** Copies the options of one phase into the store; see CONFIG_BINDINGS. */
  private applyConfig(
    config: Config | undefined,
    phase: Binding<keyof Config>["appliedIn"],
  ) {
    const given = config ?? {};
    for (const binding of CONFIG_BINDINGS) {
      if (binding.appliedIn !== phase) continue;
      if (!binding.isAbsent(given, binding.key)) {
        this.store.set(binding.atom, given[binding.key] as never);
      } else if (binding.onAbsent === "reset") {
        this.store.set(binding.atom, binding.default as never);
      }
    }
  }

  async doRender(config: Config | undefined, revision = this.revision) {
    // Text is measured during render; the face must be available first.
    await ensureDiagramFontsLoaded();
    if (revision !== this.revision) return;
    const start = getStartTime();
    clearCache();
    this.applyConfig(config, "doRender");
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
