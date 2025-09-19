import { render } from "@testing-library/react";
import { FragmentRef } from "./FragmentRef";
import { RefVM } from "@/vm/fragments";

// Mock the dependencies
jest.mock("./useFragmentData", () => ({
  useFragmentData: jest.fn(() => ({
    paddingLeft: 0,
    fragmentStyle: {},
    border: { left: 0, right: 0 },
    leftParticipant: "A"
  }))
}));

jest.mock("../../../Numbering", () => ({
  Numbering: () => <div>Numbering</div>
}));

jest.mock("../Comment/Comment", () => ({
  Comment: () => <div>Comment</div>
}));

jest.mock("../../../MessageLabel", () => ({
  MessageLabel: ({ labelText }: { labelText: string }) => <div>{labelText}</div>
}));

// Mock buildRefVM
jest.mock("@/vm/fragments", () => ({
  buildRefVM: jest.fn((context) => {
    if (!context) return null;
    return {
      id: "ref:test",
      labelText: "fallback-label",
      labelRange: [0, 5],
      codeRange: [0, 10]
    };
  })
}));

describe("FragmentRef", () => {
  const mockContext = { ref: () => ({ Content: () => ({ getText: () => "test" }) }) };
  const mockFragmentData = {
    type: 'ref' as const,
    localParticipantNames: ['A'],
    frameId: 'test-frame-id',
    participantLayers: { A: 0 },
  };
  
  it("should use provided VM when available", () => {
    const mockVM: RefVM = {
      labelText: "vm-label",
      labelRange: [0, 8],
      codeRange: null
    };

    const { container } = render(
      <FragmentRef
        fragmentData={mockFragmentData}
        context={mockContext}
        origin="A"
        vm={mockVM}
      />
    );

    expect(container.textContent).toContain("vm-label");
  });

  it("should handle missing VM gracefully", () => {
    const { container } = render(
      <FragmentRef
        fragmentData={mockFragmentData}
        context={mockContext}
        origin="A"
      />
    );

    // Should still render but with empty content
    expect(container.querySelector('.fragment-ref')).toBeInTheDocument();
  });

  it("should handle null context gracefully", () => {
    const { container } = render(
      <FragmentRef
        fragmentData={mockFragmentData}
        context={null}
        origin="A"
      />
    );

    // Should still render but with empty content
    expect(container.querySelector('.fragment-ref')).toBeInTheDocument();
  });
});
