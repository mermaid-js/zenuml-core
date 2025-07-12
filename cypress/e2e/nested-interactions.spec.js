 
import "cypress-plugin-snapshots/commands";

describe("Nested Interactions Test", function () {
  it("should render nested interactions with fragment and self-invocation correctly", function () {
    cy.visit("http://127.0.0.1:8080/cy/nested-interaction-with-fragment.html");
    // Wait for the privacy icon to be loaded
    cy.get(".privacy>span>svg", { timeout: 5000 }).should("be.visible");

    // Verify the participants are rendered
    cy.get(".participant").should("have.length", 4);
    cy.get(".participant").eq(0).should("contain", "A");
    cy.get(".participant").eq(1).should("contain", "B");
    cy.get(".participant").eq(2).should("contain", "Process");
    cy.get(".participant").eq(3).should("contain", "ProcessCallback");

    // Verify the main messages exist
    cy.get(".message").should("have.length.greaterThan", 3);

    // Verify the initial message from A.Read()
    cy.get(".message").first().should("contain", "Read");

    // Verify nested message B.Submit()
    cy.get(".message").should("contain", "Submit");

    // Verify the if fragment exists
    cy.get(".fragment").should("exist");
    cy.get(".fragment .header").should("contain", "Alt");
    cy.get(".fragment .condition").should("contain", "true");

    // Verify messages inside the fragment
    cy.get(".fragment .message").should("exist");

    // Verify self-invocation (A.method)
    cy.get(".self-invocation").should("exist");

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
    cy.get(".participant").should("have.length", 4);
    cy.get(".participant").eq(0).should("contain", "A");
    cy.get(".participant").eq(1).should("contain", "B");
    cy.get(".participant").eq(2).should("contain", "C");
    cy.get(".participant").eq(3).should("contain", "ProcessCallback");

    // Verify the main messages exist
    cy.get(".message").should("have.length.greaterThan", 3);

    // Verify the initial message from A.Read()
    cy.get(".message").first().should("contain", "Read");

    // Verify nested message B.Submit()
    cy.get(".message").should("contain", "Submit");

    // Verify outbound message C->B.method
    cy.get(".message").should("contain", "method");

    // Verify the if fragment exists
    cy.get(".fragment").should("exist");
    cy.get(".fragment .header").should("contain", "Alt");
    cy.get(".fragment .condition").should("contain", "true");

    // Verify messages inside the fragment
    cy.get(".fragment .message").should("exist");

    // Verify self-invocation (A.method)
    cy.get(".self-invocation").should("exist");

    // Take a snapshot of the rendered diagram
    cy.document().toMatchImageSnapshot({
      imageConfig: { threshold: 0.01 },
      capture: "viewport",
    });
  });
});
