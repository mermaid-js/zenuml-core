/* eslint-disable no-undef */
import "cypress-plugin-snapshots/commands";
describe("Smoke test", function () {
  it("style-panel", function () {
    cy.visit("http://127.0.0.1:8080/cy/smoke-creation.html");
    // get element by text content
    cy.get(".privacy>span>svg", { timeout: 5000 }).should("be.visible");

    // get element whose class is message and it has text content 'm'
    const messageLabel = cy.get(".message").contains("m");
    messageLabel.click();
    cy.get("#style-panel").should("be.visible");
  });
});
