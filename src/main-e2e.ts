import ZenUml from "./core";
import { demoConfig } from "./config";

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
// Fixture pages render with theme-nab unless `?theme=` says otherwise; the
// snapshot baselines were taken with theme-nab. No theme switcher here.
zenUml.render(
  code,
  demoConfig({
    theme: "theme-nab",
    themeSwitcher: false,
    overrides: {
      onContentChange: (code1: string) => {
        // @ts-expect-error -- e2e inspection hook
        window.__lastContentChange = code1;
        console.log("onContentChange", code1);
      },
    },
  }),
);
