import { render } from "@testing-library/react";
import { Provider } from "jotai";
import { createStore } from "jotai";
import { ConditionLabel } from "./ConditionLabel";
import { ConditionVM } from "@/vm/fragment-types";
import { vi } from "vitest";

// Mock the dependencies
vi.mock("@/functions/useEditLabel", () => ({
  useEditLabelImproved: jest.fn(() => ({
    editing: false,
    getEditableClasses: jest.fn(() => "editable-class"),
    handleClick: jest.fn()
  })),
  specialCharRegex: /[^\w\s]/
}));

// Mock buildConditionVM
vi.mock("@/vm/fragments", () => ({
  buildConditionVM: jest.fn((context) => {
    if (!context) return null;
    return {
      id: "condition:test",
      labelText: "fallback-condition",
      labelRange: [0, 18],
      codeRange: [0, 25]
    };
  })
}));

describe("ConditionLabel", () => {
  const store = createStore();

  const renderWithProvider = (component: JSX.Element) => {
    return render(<Provider store={store}>{component}</Provider>);
  };

  it("should use provided VM when available", () => {
    const mockVM: ConditionVM = {
      id: "condition:1",
      labelText: "vm-condition",
      labelRange: [0, 12],
      codeRange: [0, 20]
    };

    const { container } = renderWithProvider(
      <ConditionLabel vm={mockVM} />
    );

    expect(container.textContent).toContain("vm-condition");
  });

  it("should render with empty VM gracefully", () => {
    const { container } = renderWithProvider(<ConditionLabel vm={null as any} />);
    expect(container.textContent).toContain("[");
    expect(container.textContent).toContain("]");
  });
});
