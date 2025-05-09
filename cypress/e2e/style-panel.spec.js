/* eslint-disable no-undef */
import "cypress-plugin-snapshots/commands";
describe("Smoke test", function () {
  it("style-panel", function () {
    cy.visit("http://127.0.0.1:8080/cy/smoke-creation.html");
    // Wait for the app to be fully loaded
    cy.get(".privacy>span>svg", { timeout: 5000 }).should("be.visible");

    // get element whose class is message and it has text content 'm'
    const messageLabel = cy.get(".message").contains("m");

    // Take a screenshot before click - this ensures the page is in a stable state
    cy.document().toMatchImageSnapshot({
      imageConfig: { threshold: 0.01 },
      capture: "viewport",
      name: "before-click",
    });

    // Click the message element (no force needed when page is stable)
    messageLabel.click();

    // Add a wait to ensure the component has time to initialize
    cy.wait(500);

    // Take a screenshot after click to document the style panel appearance
    cy.document().toMatchImageSnapshot({
      imageConfig: { threshold: 0.01 },
      capture: "viewport",
      name: "after-click",
    });

    // Verify the style panel is visible
    cy.get("#style-panel", { timeout: 5000 }).should("be.visible");
  });
});
