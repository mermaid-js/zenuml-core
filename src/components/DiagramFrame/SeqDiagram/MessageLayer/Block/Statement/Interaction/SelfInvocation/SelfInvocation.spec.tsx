import { render } from "@testing-library/react";
import { SelfInvocation } from "./SelfInvocation";
import { OwnableMessageType } from "@/parser/OwnableMessage";
import type { MessageVM } from "@/vm/messages";

describe("SelfInvocation", () => {
  const mockVM: MessageVM = {
    id: "A->A:method2():sync:0",
    type: OwnableMessageType.SyncMessage,
    from: "A",
    to: "A",
    source: "A",
    signature: "method2()",
    labelRange: [8, 17] as [number, number],
    range: [0, 18] as [number, number],
    codeRange: null,
    comment: null,
    isSelf: true,
    canEditLabel: true,
    assignee: "ret",
    providedFrom: null,
  };

    const selfInvocationWrapper = render(
      <SelfInvocation vm={mockVM} />,
    );

  test("assignment", () => {
    expect(
      selfInvocationWrapper.container.querySelector(".assignee")?.textContent,
    ).toBe("ret");
    expect(
      selfInvocationWrapper.container.querySelector(".self-invocation>label>.label")
        ?.textContent,
    ).toBe("ret=method2()");
  });
});
