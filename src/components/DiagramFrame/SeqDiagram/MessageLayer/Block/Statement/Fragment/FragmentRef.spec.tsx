import { render } from "@testing-library/react";
import { FragmentRef } from "./FragmentRef";
import Comment from "../../../../../../Comment/Comment";


describe("FragmentRef", () => {
  it("should use provided VM when available", () => {
    const mockVM = {
      paddingLeft: 10,
      offsetX: -5,
      width: 200,
      leftParticipant: "A",
      refVM: {
        labelText: "vm-label",
        labelRange: [0, 8],
        codeRange: null
      }
    };

    const { container } = render(
      <FragmentRef
        vm={mockVM}
      />
    );

    expect(container.textContent).toContain("vm-label");
  });

  it("should render with comment when provided", () => {
    const mockVM = {
      paddingLeft: 10,
      offsetX: -5,
      width: 200,
      leftParticipant: "A",
      refVM: {
        labelText: "test-ref",
        labelRange: [0, 8],
        codeRange: null
      }
    };
    const commentObj = new Comment("Test comment")
    const { container } = render(
      <FragmentRef
        vm={mockVM}
        commentObj={commentObj}
      />
    );

    expect(container.textContent).toContain("test-ref");
    // Comment component should be rendered
    expect(container.textContent).toContain("Test comment");
  });

});
