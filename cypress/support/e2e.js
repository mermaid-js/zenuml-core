// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import cypress-plugin-snapshots
import "cypress-plugin-snapshots/commands";

// Import commands.js using ES2015 syntax:
import "./commands";

// Automatically take a screenshot after each test
// This ensures screenshots are always captured regardless of test outcome
afterEach(function () {
  // Only take screenshot if the test isn't already taking one
  // Get a unique filename based on the test title
  const testTitle = this.currentTest.title.replace(/\s+/g, "-").toLowerCase();
  // eslint-disable-next-line no-undef
  cy.screenshot(testTitle, {
    capture: "viewport",
    overwrite: true,
  });
});

// Alternatively you can use CommonJS syntax:
// require('./commands')
