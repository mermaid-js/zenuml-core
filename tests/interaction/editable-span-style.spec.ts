import { test, expect } from "../fixtures";

type StyleState = {
  backgroundColor: string;
  cursor: string;
  outlineColor: string;
  outlineOffset: string;
  outlineStyle: string;
  outlineWidth: string;
  boxShadow: string;
};

const readStyle = (element: Element): StyleState => {
  const style = getComputedStyle(element);
  return {
    backgroundColor: style.backgroundColor,
    cursor: style.cursor,
    outlineColor: style.outlineStyle === "none" ? "none" : style.outlineColor,
    outlineOffset: style.outlineOffset,
    outlineStyle: style.outlineStyle,
    outlineWidth: style.outlineWidth,
    boxShadow: style.boxShadow,
  };
};

const readBox = (element: Element) => {
  const { x, y, width, height } = element.getBoundingClientRect();
  return { x, y, width, height };
};

test("message and participant EditableSpan share hover and editing styles without geometry changes", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/insert-participant.html");
  const participantName = page
    .locator(".participant")
    .first()
    .locator(".editable-span-base");
  const participantInitial = await participantName.evaluate(readBox);

  await participantName.hover();
  const participantHover = await participantName.evaluate(readStyle);
  const participantHoverBox = await participantName.evaluate(readBox);
  expect(participantHoverBox).toEqual(participantInitial);

  await participantName.click();
  await expect(participantName).toHaveAttribute("contenteditable", "true");
  const participantEditing = await participantName.evaluate(readStyle);
  expect(await participantName.evaluate(readBox)).toEqual(participantInitial);

  await page.goto("/e2e/fixtures/editable-label.html");
  const message = page.locator(".interaction.sync .message").first();
  const messageName = message.locator(".editable-span-base");
  const messageInitial = await messageName.evaluate(readBox);

  await messageName.hover();
  const messageHover = await messageName.evaluate(readStyle);
  expect(await messageName.evaluate(readBox)).toEqual(messageInitial);

  await messageName.click();
  await expect(messageName).toHaveAttribute("contenteditable", "true");
  const messageEditing = await messageName.evaluate(readStyle);
  expect(await messageName.evaluate(readBox)).toEqual(messageInitial);

  expect(messageHover).toEqual(participantHover);
  expect(messageEditing).toEqual(participantEditing);
  expect(messageHover).toMatchObject({
    backgroundColor: "rgb(243, 244, 246)",
    cursor: "text",
    outlineStyle: "none",
  });
  expect(messageEditing).toMatchObject({
    backgroundColor: "rgb(239, 246, 255)",
    cursor: "text",
    outlineColor: "rgb(59, 130, 246)",
    outlineStyle: "solid",
    outlineWidth: "1px",
    boxShadow: "none",
  });
});
