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
      selfInvocationWrapper.container.querySelector(".label label")
        ?.textContent,
    ).toBe("method2()");
    expect(
      selfInvocationWrapper.container.querySelector(".self-invocation>label")
        ?.textContent,
    ).toBe("ret=method2()");
  });
});
