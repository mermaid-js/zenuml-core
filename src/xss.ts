import ZenUml from "./core";

// find the fist element with tag `pre` and class `zenuml`
const elm = document.querySelector("#diagram");
// get the code from the element
const code = `"><img src=x onerror=alert(1)>`;
// @ts-expect-error -- dynamic import
const zenUml = new ZenUml(elm);
// @ts-expect-error -- dynamic import
window.zenUml = zenUml;
zenUml.render(code, { theme: "theme-default" });
