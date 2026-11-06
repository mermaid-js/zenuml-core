import type { Locator } from "@playwright/test";

/** Click the nontext arrow area with a browser pointer. */
export async function clickMessageArrow(message: Locator) {
  const box = await message.boundingBox();
  if (!box) throw new Error("Message is not visible");
  await message.click({ position: { x: box.width - 3, y: box.height - 2 } });
}
