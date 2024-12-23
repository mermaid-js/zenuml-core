/* eslint-disable no-undef */
import "cypress-plugin-snapshots/commands";

describe("If Fragment Test", function () {
  it("should render if fragment correctly", function () {
    cy.visit("http://127.0.0.1:8080/cy/if-fragment.html");
    // Wait for the privacy icon to be loaded
    cy.get(".privacy>span>svg", { timeout: 5000 }).should("be.visible");

    // Verify the participants are rendered
    cy.get(".participant").should("have.length", 2);
    cy.get(".participant").eq(0).should("contain", "Client");
    cy.get(".participant").eq(1).should("contain", "Server");

    // Verify the initial message
    cy.get(".message").first().should("contain", "SendRequest");

    // Verify the if fragment
    cy.get(".fragment").should("exist");
    cy.get(".fragment .header").should("contain", "Alt");
    cy.get(".fragment .condition").should("contain", "true");

    // Verify the self message inside if block
    cy.get(".fragment .message").should("contain", "processRequest");

    // Take a snapshot of the rendered diagram
    cy.document().toMatchImageSnapshot({
      imageConfig: { threshold: 0.01 },
      capture: "viewport",
    });
  });
});
