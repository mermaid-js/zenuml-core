import parentLogger from "./logger/logger";
import ZenUml from "./core";

const logger = parentLogger.child({ name: "main" });

const defaultConfig = {
  enableMultiTheme: true,
  stickyOffset: 0,
  theme:
    localStorage.getItem(`${location.hostname}-zenuml-theme`) ||
    "theme-default",
  onThemeChange: ({ theme }) => {
    localStorage.setItem(`${location.hostname}-zenuml-theme`, theme);
  },
};

export function initZenUml(element: HTMLElement) {
  const zenUml = new ZenUml(element);

  // Expose ZenUML version to window for easy access in developer console
  // @ts-ignore
  window.ZENUML_VERSION = ZenUml.version;
  // @ts-ignore
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
const elm = document.querySelector("pre.zenuml");
if (elm) {
  initZenUml(elm);
}

// @ts-ignore
window.parentLogger = parentLogger;
// @ts-ignore
window.initZenUml = initZenUml;
