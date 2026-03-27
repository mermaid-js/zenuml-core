import { describe, it, expect } from "bun:test";
import { getIcon, ICONS } from "./icons";

describe("Icon definitions", () => {
  it("exports 11 common icons", () => {
    const iconKeys = Object.keys(ICONS);
    expect(iconKeys.length).toBe(11);
    expect(iconKeys).toContain("actor");
    expect(iconKeys).toContain("database");
    expect(iconKeys).toContain("ec2");
    expect(iconKeys).toContain("lambda");
    expect(iconKeys).toContain("azurefunction");
    expect(iconKeys).toContain("sqs");
    expect(iconKeys).toContain("sns");
    expect(iconKeys).toContain("iam");
    expect(iconKeys).toContain("boundary");
    expect(iconKeys).toContain("control");
    expect(iconKeys).toContain("entity");
  });

  it("each icon has viewBox and content", () => {
    Object.entries(ICONS).forEach(([, icon]) => {
      expect(icon.content).toBeDefined();
      expect(icon.content.length).toBeGreaterThan(0);
      // viewBox is optional but if present should be valid
      if (icon.viewBox) {
        expect(icon.viewBox).toMatch(/^\d+\s+\d+\s+\d+\s+\d+$/);
      }
    });
  });

  it("preserves root svg presentation attributes for stroke-only icons", () => {
    expect(ICONS.actor.attributes).toContain('fill="none"');
  });

  it("getIcon returns icon for valid type", () => {
    expect(getIcon("actor")).toBe(ICONS.actor);
    expect(getIcon("database")).toBe(ICONS.database);
    expect(getIcon("ec2")).toBe(ICONS.ec2);
    expect(getIcon("lambda")).toBe(ICONS.lambda);
    expect(getIcon("azurefunction")).toBe(ICONS.azurefunction);
    expect(getIcon("sqs")).toBe(ICONS.sqs);
  });

  it("getIcon is case-insensitive", () => {
    expect(getIcon("ACTOR")).toBe(ICONS.actor);
    expect(getIcon("Database")).toBe(ICONS.database);
    expect(getIcon("EC2")).toBe(ICONS.ec2);
    expect(getIcon("Lambda")).toBe(ICONS.lambda);
    expect(getIcon("AzureFunction")).toBe(ICONS.azurefunction);
    expect(getIcon("SQS")).toBe(ICONS.sqs);
  });

  it("getIcon returns undefined for unknown type", () => {
    expect(getIcon("unknown")).toBeUndefined();
    expect(getIcon("")).toBeUndefined();
    expect(getIcon(undefined)).toBeUndefined();
  });
});
