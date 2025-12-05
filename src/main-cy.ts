import parentLogger from "./logger/logger";
import ZenUml from "./core";
const logger = parentLogger.child({ name: "main" });

// find the fist element with tag `pre` and class `zenuml`
const elm = document.querySelector("pre.zenuml");
// get the code from the element
const code =
  elm?.textContent?.trim() ||
  `
// comment
A
A.method`;
// @ts-ignore
const zenUml = new ZenUml(elm);
console.log("set zenUML to window");

// @ts-ignore
window.zenUml = zenUml;
zenUml.render(code, { theme: "theme-nab",
  onContentChange: code1 => {
    console.log('onContentChange', code1);
  }
}).then((r) => {
  logger.debug("render resolved", r);
});
// @ts-ignore
window.parentLogger = parentLogger;
