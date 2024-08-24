/* eslint-disable no-undef */
import "cypress-plugin-snapshots/commands";
describe("Editable Label", function () {
  it("Special characters & extra spaces", function () {
    cy.visit("http://127.0.0.1:8080/cy/smoke-editable-label.html");
    // This line is to make sure the privacy icon is loaded
    cy.get(".privacy>span>svg", { timeout: 5000 }).should("be.visible");

    // Edit the message
    const messageLabel = cy.contains("method()");
    messageLabel.dblclick();
    messageLabel.type("  $@%^{enter}");
    cy.contains("method() $@%^").should("be.visible");
    cy.get(".header").click();
    cy.wait(1000);
    cy.document().toMatchImageSnapshot({
      imageConfig: { threshold: 0.01 },
      capture: "viewport",
    });
  });

  it("Self message", function () {
    cy.visit("http://127.0.0.1:8080/cy/smoke-editable-label.html");
    // This line is to make sure the privacy icon is loaded
    cy.get(".privacy>span>svg", { timeout: 5000 }).should("be.visible");

    // Edit the message
    const messageLabel = cy.contains("SelfMessage");
    messageLabel.dblclick();
    messageLabel.type(" n{backspace}n{enter}");
    cy.contains("SelfMessage n").should("be.visible");
    cy.get(".header").click();
    cy.wait(1000);

    cy.document().toMatchImageSnapshot({
      imageConfig: { threshold: 0.01 },
      capture: "viewport",
    });
  });

  it("Async message", function () {
    cy.visit("http://127.0.0.1:8080/cy/smoke-editable-label.html");
    // This line is to make sure the privacy icon is loaded
    cy.get(".privacy>span>svg", { timeout: 5000 }).should("be.visible");

    // Edit the message
    const messageLabel = cy.contains("Hello Bob");
    messageLabel.dblclick();
    messageLabel.type(" how are you?{enter}");
    cy.contains("Hello Bob how are you?").should("be.visible");
    cy.get(".header").click();
    cy.wait(1000);

    cy.document().toMatchImageSnapshot({
      imageConfig: { threshold: 0.01 },
      capture: "viewport",
    });
  });

  it("Creation message", function () {
    cy.visit("http://127.0.0.1:8080/cy/smoke-editable-label.html");
    // This line is to make sure the privacy icon is loaded
    cy.get(".privacy>span>svg", { timeout: 5000 }).should("be.visible");

    // Edit the message
    const messageLabel = cy.contains("label", "create");
    messageLabel.dblclick();
    messageLabel.type("1");
    cy.contains("create1").should("be.visible");
  });
});
