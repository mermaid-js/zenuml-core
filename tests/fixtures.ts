import { test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, uses) => {
    page.on("console", (msg) => {
      const type = msg.type();
      if (type === "info" || type === "error") {
        console.log(`[Browser:${type}]  ${msg.text()}`);
      }
    });

    await uses(page);
  },
});

export { expect } from "@playwright/test";
