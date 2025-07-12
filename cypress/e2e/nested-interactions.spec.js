 
import "cypress-plugin-snapshots/commands";

describe("Nested Interactions Test", function () {
  it("should render nested interactions with fragment and self-invocation correctly", function () {
    cy.visit("http://127.0.0.1:8080/cy/nested-interaction-with-fragment.html");
    // Wait for the privacy icon to be loaded
    cy.get(".privacy>span>svg", { timeout: 5000 }).should("be.visible");

    // Verify the participants are rendered
    cy.get(".participant").should("have.length.greaterThan", 0);

    // Verify the if fragment exists
    cy.get(".fragment").should("exist");

    // Take a snapshot of the rendered diagram
    cy.document().toMatchImageSnapshot({
      imageConfig: { threshold: 0.01 },
      capture: "viewport",
    });
  });

  it("should render nested interactions with outbound message and fragment correctly", function () {
    cy.visit("http://127.0.0.1:8080/cy/nested-interaction-with-outbound.html");
    // Wait for the privacy icon to be loaded
    cy.get(".privacy>span>svg", { timeout: 5000 }).should("be.visible");

    // Verify the participants are rendered
    cy.get(".participant").should("have.length.greaterThan", 0);

    // Verify the if fragment exists
    cy.get(".fragment").should("exist");

    // Take a snapshot of the rendered diagram
    cy.document().toMatchImageSnapshot({
      imageConfig: { threshold: 0.01 },
      capture: "viewport",
    });
  });
});
