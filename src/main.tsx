import ZenUml, { setDiagramFontUrl } from "./core";

// The demo site serves the theme-neon face from public/fonts/; library
// consumers point this at @zenuml/core/fonts/MS-Sans-Serif.ttf instead.
setDiagramFontUrl(
  `${import.meta.env.BASE_URL}fonts/MS Sans Serif.ttf`,
  "MS Sans Serif",
);

const defaultConfig = {
  enableMultiTheme: true,
  stickyOffset: 0,
  theme: "theme-default",
  onThemeChange: ({ theme }: { theme: string }) => {
    localStorage.setItem(`${location.hostname}-zenuml-theme`, theme);
  },
  // Demo site sees all editing surfaces; the published library defaults each off.
  enableParticipantInsertion: true,
  enableMessageInsertion: true,
  enableDividerInsertion: true,
  enableParticipantStyleEditing: true,
  enableMessageReorder: true,
};

// `?theme=theme-dark` opens the demo in a theme without touching the stored
// one; it applies to every render unless the caller passes a theme.
const themeParam = new URLSearchParams(window.location.search).get("theme");

export function initZenUml(element: HTMLElement) {
  const zenUml = new ZenUml(element);

  // Expose ZenUML version to window for easy access in developer console
  // @ts-expect-error global variable
  window.ZENUML_VERSION = ZenUml.version;
  // @ts-expect-error global variable
  window.zenUml = zenUml;

  // Override the render method to always use our config
  const originalRender = zenUml.render.bind(zenUml);
  zenUml.render = (content: string, config = {}) => {
    return originalRender(content, {
      ...defaultConfig,
      ...(themeParam ? { theme: themeParam } : {}),
      ...config,
    }).then(
      (r) => {
        console.log("ZenUML Core Version:", ZenUml.version);
        return r;
      },
    );
  };

  return zenUml;
}

// find the first element with tag `pre` and class `zenuml`
const elm = document.querySelector("pre.zenuml") as HTMLElement;
if (elm) {
  const instance = initZenUml(elm);
  instance.render("", {}); // Initial render with empty content
}

// @ts-expect-error global variable
window.initZenUml = initZenUml;
