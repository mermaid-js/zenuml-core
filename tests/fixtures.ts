import { expect, test as base, type Page } from "@playwright/test";

type DiagramWindow = typeof window & {
  __lastContentChange?: string;
  zenUml: {
    render: (code: string, options: Record<string, unknown>) => unknown;
  };
};

export const waitForDiagram = async (page: Page) => {
  await expect(
    page.locator(".sequence-diagram .participant").first(),
  ).toBeVisible({
    timeout: 5000,
  });
};

export const openDiagram = async (page: Page, fixturePath: string) => {
  await page.goto(fixturePath);
  await waitForDiagram(page);
};

export const lastContentChange =
  (page: Page, fallback: string | null = null) =>
  () =>
    page.evaluate(
      (fallback) => (window as DiagramWindow).__lastContentChange ?? fallback,
      fallback,
    );

// Custom fixture renders use the same content-change bridge as its readers.
export const renderWithContentChange = async (
  page: Page,
  code: string,
  options: Record<string, unknown>,
) =>
  page.evaluate(
    ({ code, options }) => {
      const diagramWindow = window as DiagramWindow;
      return diagramWindow.zenUml.render(code, {
        ...options,
        onContentChange: (updatedCode: string) => {
          diagramWindow.__lastContentChange = updatedCode;
        },
      });
    },
    { code, options },
  );

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

export { expect };
