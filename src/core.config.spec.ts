import { createStore } from "jotai";
import ZenUml from "./core";
import type { Config } from "./core";
import {
  enableDividerInsertionAtom,
  enableMessageInsertionAtom,
  enableMessageReorderAtom,
  enableMultiThemeAtom,
  enableNumberingAtom,
  enableParticipantInsertionAtom,
  enableParticipantStyleEditingAtom,
  enableScopedThemingAtom,
  modeAtom,
  onContentChangeAtom,
  onEventEmitAtom,
  onThemeChangeAtom,
  paletteAtom,
  RenderMode,
  stickyOffsetAtom,
  themeAtom,
} from "./store/Store";

// The public `render(code, config)` copies Config into the instance store.
// This spec pins, for every option, what an omitted option does on the next
// render (kept or reset) and when the write happens (inside render() itself,
// or after the debounce and font load in doRender()).

const CODE = "Alice->Bob: Hello";
const PALETTE = { canvasBg: "#123456" };
const flagAtoms = {
  enableMultiTheme: enableMultiThemeAtom,
  enableNumbering: enableNumberingAtom,
  enableParticipantInsertion: enableParticipantInsertionAtom,
  enableMessageInsertion: enableMessageInsertionAtom,
  enableDividerInsertion: enableDividerInsertionAtom,
  enableParticipantStyleEditing: enableParticipantStyleEditingAtom,
  enableMessageReorder: enableMessageReorderAtom,
} as const;
type FlagKey = keyof typeof flagAtoms;
const flagKeys = Object.keys(flagAtoms) as FlagKey[];

// Every flag set to the opposite of its default.
const flagNonDefaults: Record<FlagKey, boolean> = {
  enableMultiTheme: false,
  enableNumbering: false,
  enableParticipantInsertion: true,
  enableMessageInsertion: true,
  enableDividerInsertion: true,
  enableParticipantStyleEditing: true,
  enableMessageReorder: true,
};
const flagDefaults: Record<FlagKey, boolean> = {
  enableMultiTheme: true,
  enableNumbering: true,
  enableParticipantInsertion: false,
  enableMessageInsertion: false,
  enableDividerInsertion: false,
  enableParticipantStyleEditing: false,
  enableMessageReorder: false,
};

type Store = ReturnType<typeof createStore>;

const makeConfig = () => {
  const onContentChange = vi.fn();
  const onThemeChange = vi.fn();
  const onEventEmit = vi.fn();
  const config: Config = {
    theme: "theme-clean-light",
    palette: PALETTE,
    enableScopedTheming: true,
    stickyOffset: 7,
    mode: RenderMode.Static,
    onContentChange,
    onThemeChange,
    onEventEmit,
    ...flagNonDefaults,
  };
  return { config, onContentChange, onThemeChange, onEventEmit };
};
type Given = ReturnType<typeof makeConfig>;

const create = () => {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const zenUml = new ZenUml(el, true);
  const store = (zenUml as unknown as { store: Store }).store;
  return { el, zenUml, store };
};

describe("ZenUml.render(code, config): keep or reset of omitted options", () => {
  const resetNumbering = () => createStore().set(enableNumberingAtom, true);
  beforeEach(() => {
    resetNumbering();
    document.body.innerHTML = "";
  });
  afterEach(() => {
    resetNumbering();
    document.body.innerHTML = "";
  });

  const expectAllSet = (store: Store) => {
    expect(store.get(themeAtom)).toBe("theme-clean-light");
    expect(store.get(paletteAtom)).toEqual(PALETTE);
    expect(store.get(enableScopedThemingAtom)).toBe(true);
    expect(store.get(stickyOffsetAtom)).toBe(7);
    expect(store.get(modeAtom)).toBe(RenderMode.Static);
    for (const key of flagKeys) {
      expect(store.get(flagAtoms[key]), key).toBe(flagNonDefaults[key]);
    }
  };

  const expectAfterOmitted = (store: Store) => {
    // Reset when omitted.
    expect(store.get(stickyOffsetAtom)).toBe(0);
    expect(store.get(enableScopedThemingAtom)).toBe(false);
    expect(store.get(modeAtom)).toBe(RenderMode.Dynamic);
    // Kept when omitted.
    expect(store.get(themeAtom)).toBe("theme-clean-light");
    expect(store.get(paletteAtom)).toEqual(PALETTE);
    for (const key of flagKeys) {
      expect(store.get(flagAtoms[key]), key).toBe(flagNonDefaults[key]);
    }
  };

  const expectCallbacksReset = (store: Store, given: Given) => {
    expect(store.get(onContentChangeAtom)).not.toBe(given.onContentChange);
    expect(store.get(onThemeChangeAtom)).not.toBe(given.onThemeChange);
    expect(store.get(onEventEmitAtom)).not.toBe(given.onEventEmit);
    // The replacements are no-ops.
    expect(store.get(onContentChangeAtom)("x")).toBeUndefined();
    expect(store.get(onThemeChangeAtom)({ theme: "t", scoped: false })).toBe(
      undefined,
    );
    expect(store.get(onEventEmitAtom)("e", {})).toBeUndefined();
    expect(given.onContentChange).not.toHaveBeenCalled();
    expect(given.onThemeChange).not.toHaveBeenCalled();
    expect(given.onEventEmit).not.toHaveBeenCalled();
  };

  it("starts from the documented defaults", () => {
    const { store } = create();
    expect(store.get(themeAtom)).toBe("theme-default");
    expect(store.get(paletteAtom)).toBeUndefined();
    expect(store.get(enableScopedThemingAtom)).toBe(false);
    expect(store.get(stickyOffsetAtom)).toBe(0);
    expect(store.get(modeAtom)).toBe(RenderMode.Dynamic);
    for (const key of flagKeys) {
      expect(store.get(flagAtoms[key]), key).toBe(flagDefaults[key]);
    }
  });

  it.each([
    ["an empty config", {} as Config | undefined],
    ["an undefined config", undefined],
    [
      "every option explicitly undefined",
      {
        theme: undefined,
        enableScopedTheming: undefined,
        stickyOffset: undefined,
        mode: undefined,
        onContentChange: undefined,
        onThemeChange: undefined,
        onEventEmit: undefined,
        enableMultiTheme: undefined,
        enableNumbering: undefined,
        enableParticipantInsertion: undefined,
        enableMessageInsertion: undefined,
        enableDividerInsertion: undefined,
        enableParticipantStyleEditing: undefined,
        enableMessageReorder: undefined,
      } as Config,
    ],
  ])("second render with %s", async (_name, second) => {
    const { zenUml, store } = create();
    const given = makeConfig();
    await zenUml.render(CODE, given.config);
    expectAllSet(store);

    await zenUml.render(CODE, second);

    expectAfterOmitted(store);
    expectCallbacksReset(store, given);
  });

  it("keeps the theme when it is empty or null", async () => {
    const { zenUml, store } = create();
    await zenUml.render(CODE, { theme: "theme-clean-light" });
    await zenUml.render(CODE, { theme: "" });
    expect(store.get(themeAtom)).toBe("theme-clean-light");
    await zenUml.render(CODE, { theme: null as unknown as string });
    expect(store.get(themeAtom)).toBe("theme-clean-light");
    expect(zenUml.theme).toBe("theme-clean-light");
  });

  it("applies falsy values that are not undefined", async () => {
    const { zenUml, store } = create();
    await zenUml.render(CODE, {
      stickyOffset: false,
      enableMultiTheme: false,
      enableNumbering: false,
    });
    expect(store.get(stickyOffsetAtom)).toBe(false);
    expect(store.get(enableMultiThemeAtom)).toBe(false);
    expect(store.get(enableNumberingAtom)).toBe(false);
    await zenUml.render(CODE, {
      enableMultiTheme: true,
      enableNumbering: true,
    });
    expect(store.get(enableMultiThemeAtom)).toBe(true);
    expect(store.get(enableNumberingAtom)).toBe(true);
  });

  it("keeps the palette when the key is absent, clears it when present as undefined", async () => {
    const { zenUml, store } = create();
    await zenUml.render(CODE, { palette: PALETTE });
    await zenUml.render(CODE, {});
    expect(store.get(paletteAtom)).toEqual(PALETTE);
    await zenUml.render(CODE, undefined);
    expect(store.get(paletteAtom)).toEqual(PALETTE);
    await zenUml.render(CODE, { palette: undefined });
    expect(store.get(paletteAtom)).toBeUndefined();
  });

  it("keeps the constructor's initial theme and palette on a render that omits them", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const zenUml = new ZenUml(el, true, {
      theme: "theme-clean-light",
      palette: PALETTE,
    });
    const store = (zenUml as unknown as { store: Store }).store;
    await zenUml.render(CODE, {});
    expect(store.get(themeAtom)).toBe("theme-clean-light");
    expect(store.get(paletteAtom)).toEqual(PALETTE);
  });

  describe("when each option is written", () => {
    const immediate = (store: Store) => {
      expect(store.get(themeAtom)).toBe("theme-clean-light");
      expect(store.get(paletteAtom)).toEqual(PALETTE);
      expect(store.get(enableScopedThemingAtom)).toBe(true);
      expect(store.get(stickyOffsetAtom)).toBe(7);
      expect(store.get(modeAtom)).toBe(RenderMode.Static);
    };
    const notYet = (store: Store, given: Given) => {
      expect(store.get(onContentChangeAtom)).not.toBe(given.onContentChange);
      expect(store.get(onThemeChangeAtom)).not.toBe(given.onThemeChange);
      expect(store.get(onEventEmitAtom)).not.toBe(given.onEventEmit);
      for (const key of flagKeys) {
        expect(store.get(flagAtoms[key]), key).toBe(flagDefaults[key]);
      }
    };
    const deferred = (store: Store, given: Given) => {
      expect(store.get(onContentChangeAtom)).toBe(given.onContentChange);
      expect(store.get(onThemeChangeAtom)).toBe(given.onThemeChange);
      expect(store.get(onEventEmitAtom)).toBe(given.onEventEmit);
      for (const key of flagKeys) {
        expect(store.get(flagAtoms[key]), key).toBe(flagNonDefaults[key]);
      }
    };

    it("first render: theme, palette, scoped theming, sticky offset and mode inside render(); callbacks and flags after the font load", async () => {
      const { zenUml, store } = create();
      const given = makeConfig();
      const done = zenUml.render(CODE, given.config);
      immediate(store);
      notYet(store, given);
      await done;
      immediate(store);
      deferred(store, given);
    });

    it("later render: same split, the deferred writes also wait for the debounce", async () => {
      const { zenUml, store } = create();
      await zenUml.render(CODE, {});
      const given = makeConfig();
      const done = zenUml.render(CODE, given.config);
      immediate(store);
      notYet(store, given);
      await done;
      immediate(store);
      deferred(store, given);
    });

    it("a superseded render writes its immediate options but never its deferred ones", async () => {
      const { zenUml, store } = create();
      await zenUml.render(CODE, {});
      const first = makeConfig();
      void zenUml.render(CODE, first.config);
      const second = zenUml.render(CODE, { stickyOffset: 3 });
      // The second call has already overwritten the first call's immediate
      // writes that reset when omitted.
      expect(store.get(stickyOffsetAtom)).toBe(3);
      await second;
      expect(store.get(stickyOffsetAtom)).toBe(3);
      expect(store.get(enableScopedThemingAtom)).toBe(false);
      expect(store.get(modeAtom)).toBe(RenderMode.Dynamic);
      // Theme and palette from the superseded call are kept (immediate, keep).
      expect(store.get(themeAtom)).toBe("theme-clean-light");
      expect(store.get(paletteAtom)).toEqual(PALETTE);
      // Its deferred options never ran.
      expect(store.get(onContentChangeAtom)).not.toBe(first.onContentChange);
      for (const key of flagKeys) {
        expect(store.get(flagAtoms[key]), key).toBe(flagDefaults[key]);
      }
    });
  });
});
