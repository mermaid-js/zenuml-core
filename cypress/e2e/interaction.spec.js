/* eslint-disable no-undef */
import "cypress-plugin-snapshots/commands";
describe("Smoke test", function () {
  it("interaction", function () {
    cy.visit("http://127.0.0.1:8080/cy/smoke-interaction.html");
    // This line is to make sure the privacy icon is loaded
    cy.get(".privacy>span>svg", { timeout: 5000 }).should("be.visible");

    // Edit the message
    const messageLabel = cy.contains("ASelf");
    messageLabel.dblclick();
    messageLabel.type("A{enter}");
    cy.contains("ASelfA").should("be.visible");
    cy.get("body").click();

    cy.document().toMatchImageSnapshot({
      imageConfig: { threshold: 0.01 },
      capture: "viewport",
    });
  });
});
