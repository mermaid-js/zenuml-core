import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "srixxa",
  e2e: {
    viewportWidth: 1200,
    viewportHeight: 800,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    excludeSpecPattern: ["**/__snapshots__/*", "**/__image_snapshots__/*"],
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
  },
  env: {
    "cypress-plugin-snapshots": {
      imageConfig: {
        keepSaved: true, // Keep actual screenshots even when they match the expected ones
        threshold: 0.01, // Threshold for pixel difference
        thresholdType: "percent", // Type of threshold
      },
    },
  },
});
