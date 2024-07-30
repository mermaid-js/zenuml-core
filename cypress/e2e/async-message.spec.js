/* eslint-disable no-undef */
import "cypress-plugin-snapshots/commands";
describe("Rendering", function () {
  it("Async message - 1", function () {
    cy.visit("http://127.0.0.1:8080/cy/async-message-1.html");
    // This line is to make sure the privacy icon is loaded
    cy.get(".privacy>span>svg", { timeout: 9000 }).should("be.visible");
    cy.document().toMatchImageSnapshot({
      imageConfig: { threshold: 0.01 },
      capture: "viewport",
    });
  });
  it("Async message - 2", function () {
    cy.visit("http://127.0.0.1:8080/cy/async-message-2.html");
    // This line is to make sure the privacy icon is loaded
    cy.get(".privacy>span>svg", { timeout: 5000 }).should("be.visible");
    cy.document().toMatchImageSnapshot({
      imageConfig: { threshold: 0.01 },
      capture: "viewport",
    });
  });
  it("Async message - 3", function () {
    cy.visit("http://127.0.0.1:8080/cy/async-message-3.html");
    // This line is to make sure the privacy icon is loaded
    cy.get(".privacy>span>svg", { timeout: 5000 }).should("be.visible");
    cy.document().toMatchImageSnapshot({
      imageConfig: { threshold: 0.01 },
      capture: "viewport",
    });
  });
});
