import { configureCompat } from "vue";
import { mount } from "@vue/test-utils";
import SelfInvocation from "./SelfInvocation.vue";
import Store from "@/store/Store";
import { Fixture } from "@/../test/unit/parser/fixture/Fixture";

beforeEach(() => {
  configureCompat({
    RENDER_FUNCTION: false,
  });
});

describe("SelfInvocation", () => {
  test("If selfCallIndent is %s and distance is %s, interactionWidth should be %s", () => {
    let selfInvocationWrapper = mount(SelfInvocation, {
      global: {
        provide: {
          store: Store(),
        },
      },
      props: {
        context: Fixture.firstStatement("ret = A->A.method2()").message(),
      },
    });

    expect(selfInvocationWrapper.vm.assignee).toBe("ret");
    expect(selfInvocationWrapper.vm.signature).toBe("method2()");
    expect(selfInvocationWrapper.find(".self-invocation>label").text()).toBe(
      "ret=method2()",
    );
  });
});
