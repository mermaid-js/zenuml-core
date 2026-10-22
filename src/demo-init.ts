import ZenUml, { setDiagramFontUrl } from "./core";
import { demoConfig, type DemoConfigOptions } from "./config";

// The demo site serves the theme-neon face from public/fonts/; library
// consumers point this at @zenuml/core/fonts/MS-Sans-Serif.ttf instead.
setDiagramFontUrl(
  `${import.meta.env.BASE_URL}fonts/MS Sans Serif.ttf`,
  "MS Sans Serif",
);

/** Shared by the demo entry points (main.tsx, main.ts); `options.theme` is the page's fallback theme. */
export function initZenUml(
  element: HTMLElement,
  options: Pick<DemoConfigOptions, "theme"> = {},
) {
  const zenUml = new ZenUml(element);

  // Expose ZenUML version to window for easy access in developer console
  // @ts-expect-error global variable
  window.ZENUML_VERSION = ZenUml.version;
  // @ts-expect-error global variable
  window.zenUml = zenUml;

  // Override the render method to always use our config
  const originalRender = zenUml.render.bind(zenUml);
  zenUml.render = (content: string, config = {}) => {
    return originalRender(
      content,
      demoConfig({ ...options, overrides: config }),
    ).then((r) => {
      console.log("ZenUML Core Version:", ZenUml.version);
      return r;
    });
  };

  return zenUml;
}
