import { initZenUml as initDemoZenUml } from "./demo-init";
import { getStoredTheme } from "./config";

// renderer.html and embed.html: start from the theme last picked in the
// switcher (stored in localStorage); `?theme=` overrides it.
export function initZenUml(element: HTMLElement) {
  return initDemoZenUml(element, {
    theme: getStoredTheme() || "theme-default",
  });
}

// find the first element with tag `pre` and class `zenuml`
const elm = document.querySelector("pre.zenuml") as HTMLElement;
if (elm) {
  initZenUml(elm);
}

// @ts-expect-error global variable
window.initZenUml = initZenUml;
