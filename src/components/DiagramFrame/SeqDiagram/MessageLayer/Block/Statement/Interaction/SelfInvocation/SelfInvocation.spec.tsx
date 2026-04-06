import { vi } from "vitest";

// EditableLabelField.spec.tsx (loaded earlier) registers a vi.mock for
// EditableSpan that strips the `editable-span-base` class. Override it here
// with a minimal implementation that preserves the class so our test can find
// the element.
vi.mock("@/components/common/EditableSpan", () => ({
  EditableSpan: ({
    text,
    className,
  }: {
    text: string;
    className?: string;
    isEditable?: boolean;
    onSave: (t: string) => void;
    title?: string;
  }) => (
    <span className={`${className ?? ""} editable-span-base`.trim()}>
      {text}
    </span>
  ),
}));

import { Fixture } from "@/../test/unit/parser/fixture/Fixture";
import { render } from "@testing-library/react";
import { SelfInvocation } from "./SelfInvocation";

describe("SelfInvocation", () => {
  const selfInvocationWrapper = render(
    <SelfInvocation
      context={Fixture.firstStatement("ret = A->A.method2()").message()}
    />,
  );

  test("assignment", () => {
    expect(
      selfInvocationWrapper.container.querySelector(".assignee")?.textContent,
    ).toBe("ret");
    expect(
      selfInvocationWrapper.container.querySelector(".label .editable-span-base")
        ?.textContent,
    ).toBe("method2()");
    expect(
      selfInvocationWrapper.container.querySelector(".self-invocation>label")
        ?.textContent,
    ).toBe("ret=method2()");
  });
});
