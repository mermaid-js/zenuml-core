import parentLogger from "./logger/logger";
import ZenUml from "./core";

const logger = parentLogger.child({ name: "main" });

// find the fist element with tag `pre` and class `zenuml`
const elm = document.querySelector("pre.zenuml");
// @ts-ignore
const zenUml = new ZenUml(elm);

// Expose ZenUML version to window for easy access in developer console
// @ts-ignore
window.ZENUML_VERSION = ZenUml.version;
// @ts-ignore
window.zenUml = zenUml;
zenUml
  .render("", {
    enableMultiTheme: true,
    stickyOffset: 0,
    theme:
      localStorage.getItem(`${location.hostname}-zenuml-theme`) ||
      "theme-idle-afternoon",
  })
  .then((r) => {
    logger.debug("render resolved", r);
    console.log("ZenUML Core Version:", ZenUml.version);
  });
// @ts-ignore
window.parentLogger = parentLogger;
