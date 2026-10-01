import { test, expect } from "../fixtures";

test("numbering can be disabled and restored without badges or reserved header space", async ({
  page,
}) => {
  await page.goto("/e2e/tools/stroke-examples.html");
  await page.waitForFunction(() => (window as any).__strokeExamples?.ready);
  await page.evaluate(async () => {
    const { default: ZenUml } = await import("/src/core.tsx");
    const { renderToSvg } = await import("/src/svg/renderToSvg.ts");
    const host = document.createElement("pre");
    host.id = "numbering-toggle-dom";
    host.className = "zenuml";
    document.body.append(host);
    const svgHost = document.createElement("div");
    svgHost.id = "numbering-toggle-svg";
    document.body.append(svgHost);
    const code = `title Toggle sequence numbers
A -> B.load() {
  loop (pending) {
    B.prepare()
    B -> B: validate
    B -> C: dispatch
    return result
  }
  return completed
}`;
    const renderer = new ZenUml(host);
    (window as any).__numberingToggle = { renderer, code, svgHost };
  });
  const states = [];
  for (const enableNumbering of [true, false, true]) {
    await page.evaluate(async (enabled) => {
      const { renderer, code, svgHost } = (window as any).__numberingToggle;
      const { renderToSvg } = await import("/src/svg/renderToSvg.ts");
      await renderer.render(code, {
        enableNumbering: enabled,
        theme: "theme-default",
      });
      svgHost.innerHTML = renderToSvg(code, { enableNumbering: enabled }).svg;
    }, enableNumbering);
    await page.waitForFunction((enabled) => {
      const host = document.querySelector("#numbering-toggle-dom")!;
      const count = host.querySelectorAll(
        ".message-number, .fragment-number",
      ).length;
      return enabled ? count > 0 : count === 0;
    }, enableNumbering);
    const loop = page.locator("#numbering-toggle-dom .fragment-loop");
    await loop.locator(":scope > .header").hover();
    await loop.locator(":scope > .header .collapse-button").click();
    await expect(loop.locator(":scope > .hidden")).toHaveCount(1);
    await loop.locator(":scope > .header .collapsible-header > span").click();
    await expect(loop.locator(":scope > .hidden")).toHaveCount(0);
    states.push(
      await page.evaluate((enabled) => {
        const host = document.querySelector("#numbering-toggle-dom")!;
        const { svgHost } = (window as any).__numberingToggle;
        const header = host.querySelector(".fragment > .header")!;
        const svgHeader = svgHost.querySelector(".fragment-header")!;
        return {
          enabled,
          domBadges: host.querySelectorAll(".message-number, .fragment-number")
            .length,
          svgBadges: svgHost.querySelectorAll(
            ".message-number-bg, .fragment-number-bg",
          ).length,
          svgNumbers: svgHost.querySelectorAll(".seq-number").length,
          domIconOffset:
            header.querySelector("svg")!.getBoundingClientRect().left -
            header.getBoundingClientRect().left,
          svgIconOffset:
            Number(
              svgHost.querySelector(".fragment > svg")!.getAttribute("x"),
            ) - Number(svgHeader.getAttribute("x")),
          messagePositions: [...host.querySelectorAll(".interaction")].map(
            (element) => ({
              width: (element as HTMLElement).style.width,
              transform: (element as HTMLElement).style.transform,
            }),
          ),
        };
      }, enableNumbering),
    );
  }
  expect(states[0].domBadges).toBeGreaterThan(0);
  expect(states[0].svgBadges).toBeGreaterThan(0);
  expect(states[1]).toMatchObject({
    enabled: false,
    domBadges: 0,
    svgBadges: 0,
    svgNumbers: 0,
    svgIconOffset: 4,
  });
  expect(states[1].domIconOffset).toBeLessThan(states[0].domIconOffset);
  expect(states[1].messagePositions).toEqual(states[0].messagePositions);
  expect(states[2]).toEqual(states[0]);
});

test("message typography takes priority and long labels fit at 15px in DOM and SVG", async ({
  page,
}) => {
  await page.goto("/e2e/tools/stroke-examples.html");
  await page.waitForFunction(() => (window as any).__strokeExamples?.ready);
  const actual = await page.evaluate(async () => {
    const { default: ZenUml } = await import("/src/core.tsx");
    const { renderToSvg } = await import("/src/svg/renderToSvg.ts");
    const { default: measureBrowser } = await import(
      "/src/positioning/WidthProviderFunc.ts"
    );
    const { TextType } = await import("/src/positioning/Coordinate.ts");
    const measurementText = "LongMessageMeasuredAtItsRenderedSize";
    const participantWidth = measureBrowser(
      measurementText,
      TextType.ParticipantName,
    );
    const messageWidth = measureBrowser(
      measurementText,
      TextType.MessageContent,
    );
    const participantWidthAgain = measureBrowser(
      measurementText + "!",
      TextType.ParticipantName,
    );
    const code = `title Typography hierarchy
A -> B.loadCustomerAccountAndValidateSubscription() {
  loop (pending) {
    B -> C: publishUpdatedCustomerSubscriptionState
    B.prepareUpdatedCustomerAccount()
    B -> B: validateUpdatedCustomerSubscription
    return updatedCustomerSubscriptionState
  }
  return completedCustomerAccountValidation
}`;
    const host = document.createElement("pre");
    host.className = "zenuml";
    document.body.append(host);
    await new ZenUml(host).render(code, { theme: "theme-default" });
    const svgHost = document.createElement("div");
    svgHost.innerHTML = renderToSvg(code).svg;
    document.body.append(svgHost);
    const styles = (root: Element, selector: string) =>
      [...root.querySelectorAll(selector)].map((element) => {
        const style = getComputedStyle(element);
        return `${style.fontSize}/${style.fontWeight}`;
      });
    const domLabelsFit = [
      ...host.querySelectorAll(".message:not(.self) .name .inline-block"),
    ].every((label) => {
      const message = label.closest(".message")!.getBoundingClientRect();
      const rect = label.getBoundingClientRect();
      return rect.left >= message.left && rect.right <= message.right;
    });
    const svgLabelsFit = [
      ...svgHost.querySelectorAll(".message-label, .return-label"),
    ].every((element) => {
      const group = element.parentElement!;
      const line = group.querySelector("line");
      if (!line) return true; // Self calls have their own arrow layout.
      const x1 = Number(line.getAttribute("x1"));
      const x2 = Number(line.getAttribute("x2"));
      const box = (element as SVGGraphicsElement).getBBox();
      return box.x >= Math.min(x1, x2) && box.x + box.width <= Math.max(x1, x2);
    });
    return {
      measurement: { participantWidth, messageWidth, participantWidthAgain },
      dom: {
        title: styles(host, ".title"),
        participant: styles(host, ".participant"),
        fragment: styles(host, ".collapsible-header > label"),
        message: styles(host, ".message .name, .return > .flex .name"),
        fragmentNumber: styles(host, ".fragment-number"),
        messageNumber: styles(host, ".message > div.absolute.text-xs"),
        fragmentNumberClasses: [
          ...host.querySelectorAll(".fragment-number"),
        ].map((element) => (element as HTMLElement).className),
        messageNumberClasses: [
          ...host.querySelectorAll(".message > div.absolute.text-xs"),
        ].map((element) => (element as HTMLElement).className),
      },
      svg: {
        title: styles(svgHost, ".frame-title"),
        participant: styles(svgHost, ".participant-label"),
        fragment: styles(svgHost, ".fragment-label"),
        message: styles(svgHost, ".message-label, .return-label"),
        fragmentNumber: styles(svgHost, ".fragment .seq-number"),
        messageNumber: styles(
          svgHost,
          ".message .seq-number, .creation .seq-number, .return .seq-number",
        ),
        fragmentNumberBackground: [
          ...svgHost.querySelectorAll(".fragment-number-bg"),
        ].map((element) => ({
          rx: element.getAttribute("rx"),
          opacity: getComputedStyle(element).fillOpacity,
        })),
      },
      domLabelsFit,
      svgLabelsFit,
      messageBadges: styles(host, ".message-number"),
      svgMessageBadgeCount:
        svgHost.querySelectorAll(".message-number-bg").length,
      svgMessageNumberCount: svgHost.querySelectorAll(
        ".message .seq-number, .return .seq-number",
      ).length,
      messageBadgeAppearance: [
        ...host.querySelectorAll(".message-number"),
      ].every((element) => {
        const style = getComputedStyle(element);
        return (
          style.backgroundColor === "rgba(107, 114, 128, 0.1)" &&
          style.borderRadius === "2px" &&
          element.getBoundingClientRect().height === 16
        );
      }),
      svgBadgeBounds: [...svgHost.querySelectorAll(".message-number-bg")].every(
        (element) =>
          element.getBoundingClientRect().left >=
          svgHost.querySelector("svg")!.getBoundingClientRect().left + 1,
      ),
    };
  });
  expect(actual.measurement.messageWidth).toBeGreaterThan(
    actual.measurement.participantWidth,
  );
  expect(actual.measurement.participantWidthAgain).toBeLessThan(
    actual.measurement.messageWidth,
  );
  for (const renderer of [actual.dom, actual.svg]) {
    for (const role of ["title", "participant", "fragment"] as const) {
      expect(renderer[role].length).toBeGreaterThan(0);
      expect([...new Set(renderer[role])]).toEqual(["14px/400"]);
    }
    expect(renderer.message.length).toBeGreaterThan(0);
    expect([...new Set(renderer.message)]).toEqual(["15px/400"]);
  }
  expect(actual.domLabelsFit).toBe(true);
  expect(actual.svgLabelsFit).toBe(true);
  expect(actual.messageBadges.length).toBeGreaterThan(2);
  expect([...new Set(actual.messageBadges)]).toEqual(["12px/400"]);
  expect(actual.messageBadgeAppearance).toBe(true);
  expect(actual.svgMessageBadgeCount).toBe(actual.svgMessageNumberCount);
  expect(actual.svgBadgeBounds).toBe(true);
  expect(actual.dom.fragmentNumber).toEqual(["12px/400"]);
  expect(actual.dom.messageNumber.length).toBeGreaterThan(0);
  expect(actual.dom.messageNumber).toEqual(
    actual.dom.messageNumber.map(() => "12px/400"),
  );
  expect(actual.dom.fragmentNumberClasses).toEqual([
    expect.stringContaining("bg-gray-500/10"),
  ]);
  expect(actual.dom.fragmentNumberClasses).toEqual([
    expect.stringContaining("rounded-sm"),
  ]);
  expect(actual.dom.fragmentNumberClasses).toEqual([
    expect.stringContaining("px-1"),
  ]);
  expect(
    actual.dom.messageNumberClasses.every((className) =>
      className.includes("bg-gray-500/10"),
    ),
  ).toBe(true);
  expect(actual.svg.fragmentNumber).toEqual(["12px/400"]);
  expect(actual.svg.messageNumber.length).toBeGreaterThan(0);
  expect(actual.svg.messageNumber).toEqual(
    actual.svg.messageNumber.map(() => "12px/400"),
  );
  expect(actual.svg.fragmentNumberBackground.length).toBeGreaterThan(0);
  expect(actual.svg.fragmentNumberBackground).toEqual(
    actual.svg.fragmentNumberBackground.map(() => ({
      rx: "2",
      opacity: "0.1",
    })),
  );
});

test("fragment numbers stay inside the title before its icon and type", async ({
  page,
}) => {
  await page.goto("/e2e/tools/stroke-examples.html");
  await page.waitForFunction(() => (window as any).__strokeExamples?.ready);
  expect(
    await page.evaluate(() => (window as any).__strokeExamples.errors),
  ).toEqual([]);

  const headers = page.locator(".fragment > .header");
  await expect(headers).toHaveCount(4);
  const actual = await headers.evaluateAll((elements) =>
    elements.map((header) => {
      const number = header.querySelector(".fragment-number")!;
      const icon = header.querySelector("svg")!;
      const label = header.querySelector(".collapsible-header > label")!;
      const h = header.getBoundingClientRect();
      const n = number.getBoundingClientRect();
      const i = icon.getBoundingClientRect();
      const l = label.getBoundingClientRect();
      return {
        number: number.textContent,
        inside: n.left >= h.left && n.right < h.right,
        beforeIcon: n.right < i.left,
        beforeType: i.right <= l.left,
        divider: getComputedStyle(number).borderRightWidth,
        staysVisible: getComputedStyle(number).display !== "none",
      };
    }),
  );
  expect(actual.map((header) => header.number)).toEqual([
    "1.2.2",
    "1.3",
    "2.1",
    "2.1.3",
  ]);
  for (const header of actual) {
    expect(header).toMatchObject({
      inside: true,
      beforeIcon: true,
      beforeType: true,
      divider: "0px",
      staysVisible: true,
    });
  }

  // Hover keeps the fragment reference visible while exposing its collapse control.
  await page.locator("#job .fragment-loop > .header").hover();
  await expect(
    page.locator("#job .fragment-loop > .header .fragment-number"),
  ).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(page.locator("#job .sequence-diagram")).toHaveScreenshot(
    "fragment-number-before-type.png",
  );

  const loop = page.locator("#job .fragment-loop");
  await loop.locator(":scope > .header").hover();
  await loop.locator(":scope > .header .collapse-button").click();
  await expect(loop.locator(":scope > .hidden")).toHaveCount(1);
  await expect(loop.locator(":scope > .header .fragment-number")).toHaveText(
    "2.1",
  );
});

test("long nested fragment numbers fit their header and enclosing frame", async ({
  page,
}) => {
  await page.goto("/e2e/tools/stroke-examples.html");
  await page.waitForFunction(() => (window as any).__strokeExamples?.ready);
  const fit = await page.evaluate(async () => {
    const { default: ZenUml } = await import("/src/core.tsx");
    const host = document.createElement("pre");
    host.className = "zenuml";
    document.body.append(host);
    const code = "loop(check) {\n".repeat(14) + "A->A:m\n" + "}\n".repeat(14);
    await new ZenUml(host).render(code, { theme: "theme-default" });
    const fragments = [...host.querySelectorAll(".fragment")];
    return fragments.map((fragment, index) => {
      const number = fragment.querySelector(
        ":scope > .header .fragment-number",
      )!;
      const label = fragment.querySelector(
        ":scope > .header .collapsible-header > label",
      )!;
      const frame = fragment.getBoundingClientRect();
      const parentFrame = fragments[index - 1]?.getBoundingClientRect();
      return {
        inside:
          number.getBoundingClientRect().left > frame.left &&
          label.getBoundingClientRect().right < frame.right,
        enclosed: !parentFrame || frame.right <= parentFrame.right,
        frameFits:
          frame.right <=
          host.querySelector(".frame")!.getBoundingClientRect().right,
      };
    });
  });
  expect(fit).toHaveLength(14);
  for (const fragment of fit)
    expect(fragment).toEqual({ inside: true, enclosed: true, frameFits: true });
});

test("nested custom section titles fit their fragment and enclosing frames", async ({
  page,
}) => {
  await page.goto("/e2e/tools/stroke-examples.html");
  await page.waitForFunction(() => (window as any).__strokeExamples?.ready);
  const fit = await page.evaluate(async () => {
    const { default: ZenUml } = await import("/src/core.tsx");
    const host = document.createElement("pre");
    host.className = "zenuml";
    document.body.append(host);
    await new ZenUml(host).render(`loop (pending) {
      section (VeryLongCustomSectionTitleThatMustFitInsideTheParentFragmentAndDiagram) {
        A->A:m
      }
    }`);
    const frames = [...host.querySelectorAll(".fragment")].map((element) =>
      element.getBoundingClientRect(),
    );
    const sectionTitle = host
      .querySelector(".fragment-section .collapsible-header > label")!
      .getBoundingClientRect();
    return {
      count: frames.length,
      titleFits: sectionTitle.right < frames[1].right,
      parentFits: frames[1].right <= frames[0].right,
      frameFits:
        frames[0].right <=
        host.querySelector(".frame")!.getBoundingClientRect().right,
    };
  });
  expect(fit).toEqual({
    count: 2,
    titleFits: true,
    parentFits: true,
    frameFits: true,
  });
});

test("wide inner guards starting at later participants fit their enclosing fragment", async ({
  page,
}) => {
  await page.goto("/e2e/tools/stroke-examples.html");
  await page.waitForFunction(() => (window as any).__strokeExamples?.ready);
  const fit = await page.evaluate(async () => {
    const { default: ZenUml } = await import("/src/core.tsx");
    const host = document.createElement("pre");
    host.className = "zenuml";
    document.body.append(host);
    await new ZenUml(host).render(`loop(pending) {
A->B:m
loop(customerAccountIsActiveAndSubscriptionIsCurrentAndPaymentAuthorizationHasCompletedSuccessfully) {
B->B:m
}
}`);
    const frames = [...host.querySelectorAll(".fragment")].map((element) =>
      element.getBoundingClientRect(),
    );
    return {
      shifted: frames[1].left > frames[0].left + 20,
      parentFits: frames[1].right <= frames[0].right,
      frameFits:
        frames[0].right <=
        host.querySelector(".frame")!.getBoundingClientRect().right,
    };
  });
  expect(fit).toEqual({ shifted: true, parentFits: true, frameFits: true });
});
