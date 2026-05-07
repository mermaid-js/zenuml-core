import parentLogger from "./logger/logger";
import ZenUml from "./core";
const logger = parentLogger.child({ name: "main" });

// find the fist element with tag `pre` and class `zenuml`
const elm = document.querySelector("pre.zenuml");
// get the code from the element
const code =
  elm?.textContent?.trim() ??
  `
// comment
A
A.method`;
// @ts-expect-error -- dynamic import
const zenUml = new ZenUml(elm);
console.log("set zenUML to window");

// @ts-expect-error -- dynamic import
window.zenUml = zenUml;
zenUml.render(code, {
  theme: "theme-nab",
  // E2E fixtures exercise editing features; the published library defaults each off.
  enableParticipantInsertion: true,
  enableMessageInsertion: true,
  enableDividerInsertion: true,
  enableParticipantStyleEditing: true,
  onContentChange: code1 => {
    // @ts-expect-error -- e2e inspection hook
    window.__lastContentChange = code1;
    console.log('onContentChange', code1);
  }
}).then((r) => {
  logger.debug("render resolved", r);
});
// @ts-expect-error -- dynamic import
window.parentLogger = parentLogger;
