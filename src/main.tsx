import parentLogger from "./logger/logger";
import ZenUml from "./core";

const logger = parentLogger.child({ name: "main" });

const defaultConfig = {
  enableMultiTheme: true,
  stickyOffset: 0,
  theme:
    localStorage.getItem(`${location.hostname}-zenuml-theme`) ||
    "theme-idle-afternoon",
  onThemeChange: ({ theme }: { theme: string }) => {
    localStorage.setItem(`${location.hostname}-zenuml-theme`, theme);
  },
};

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
    return originalRender(content, { ...defaultConfig, ...config }).then(
      (r) => {
        logger.debug("render resolved", r);
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
window.parentLogger = parentLogger;
// @ts-expect-error global variable
window.initZenUml = initZenUml;
