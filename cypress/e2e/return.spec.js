/* eslint-disable no-undef */
import "cypress-plugin-snapshots/commands";
describe("Smoke test", function () {
  it("return", function () {
    cy.visit("http://127.0.0.1:8080/cy/smoke-return.html");
    // This line is to make sure the privacy icon is loaded
    cy.get(".privacy>span>svg", { timeout: 5000 }).should("be.visible");
    cy.document().toMatchImageSnapshot({
      imageConfig: { threshold: 0.01 },
      capture: "viewport",
    });
  });
});
