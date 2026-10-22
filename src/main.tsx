import { initZenUml } from "./demo-init";

// Workbench (index.html): always starts from theme-default; `?theme=` overrides it.
// find the first element with tag `pre` and class `zenuml`
const elm = document.querySelector("pre.zenuml") as HTMLElement;
if (elm) {
  const instance = initZenUml(elm);
  instance.render("", {}); // Initial render with empty content
}

// @ts-expect-error global variable
window.initZenUml = initZenUml;
