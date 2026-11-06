import { test, expect } from "../fixtures";

const cases = [
  { title: "name shorter than stereotype", code: "<<Service>> Alice\nBob\nAlice->Bob: hi" },
  {
    title: "name longer than stereotype",
    code: "<<S>> VeryLongParticipantName\nBob\nVeryLongParticipantName->Bob: hi",
  },
];

test.describe("Participant stereotype alignment", () => {
  for (const { title, code } of cases) {
    test(`stereotype, name and box share a centre: ${title}`, async ({ page }) => {
      await page.goto("/e2e/fixtures/insert-participant.html");
      await page.evaluate(async (c) => {
        await (window as any).zenUml.render(c, { theme: "theme-default" });
      }, code);
      const participant = page.locator(".participant").first();
      const stereotype = participant.locator("label.interface");
      const name = participant.locator(".participant-name");
      await expect(stereotype).toBeVisible();
      const centre = async (l: typeof name) => {
        const b = await l.boundingBox();
        expect(b).not.toBeNull();
        return b!.x + b!.width / 2;
      };
      const boxC = await centre(participant);
      // The label is a stretched block, so measure the rendered text, not the element box.
      const stC = await stereotype.evaluate((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        const b = r.getBoundingClientRect();
        return b.x + b.width / 2;
      });
      const nameC = await centre(name);
      expect(Math.abs(stC - boxC), `stereotype ${stC} vs box ${boxC}`).toBeLessThanOrEqual(1);
      expect(Math.abs(nameC - boxC), `name ${nameC} vs box ${boxC}`).toBeLessThanOrEqual(1);
      expect(Math.abs(nameC - stC), `name ${nameC} vs stereotype ${stC}`).toBeLessThanOrEqual(1);
    });
  }
});
