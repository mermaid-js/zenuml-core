import { test, expect } from "./fixtures";

/**
 * SVG Parity Tests
 *
 * Renders every visual test fixture through renderToSvg() and captures
 * screenshot baselines. These verify structural/layout parity with the
 * React/HTML renderer — same elements, positions, and reading order.
 *
 * DSL extracted from each cy/*.html <pre class="zenuml"> block.
 */

const SVG_PARITY_CASES: { name: string; code: string }[] = [
  {
    name: "smoke",
    code: `title ABCD Title
// Generating Sequence Diagrams from Java code is experimental.
// Please report errors to https://github.com/ZenUml/jetbrains-zenuml/discussions
 MarkdownJavaFxHtmlPanel
 MarkdownJavaFxHtmlPanel.readFromInputStream(inputStream) {
  StringBuilder resultStringBuilder = new StringBuilder();
  try {
    // String line;
    while((line = br.readLine()) != null) {
      resultStringBuilder.append(line);
    }
  }
  catch(IOException) {
    return "";
  }
  return "resultStringBuilder.toString()";
}`,
  },
  {
    name: "creation",
    code: `title Title 1
A.m {
  new B(1,2,3,4)
}`,
  },
  {
    name: "creation-rtl",
    code: `"b:B"
a1 = A.method() {
  // abcde
  b = new B()
}`,
  },
  {
    name: "defect-406",
    code: `title Title 1
A.m1 {
  new B(1,2,3,4) {
    if(x) {
      C.m2
    }
    while(y) {
      D.m3
    }
    par {
      E.m4
      F.m5
    }
    opt {
      G.m6
    }
  }
}`,
  },
  {
    name: "fragment",
    code: `A
B
C
if(x) {
  loop(y) {
    try {
      par {
        A.m();
        B.m();
      }
    } catch(e) {
      opt {
        new C
      }
    } finally {
      C.m
    }
  }
}`,
  },
  {
    name: "fragment-issue",
    code: `// This sample is carefully crafted. It shows a known issues: fragment stretched to
// svc (should not), because parser thinks the return statement returns to svc.
group Backend {@VPC svc @RDS rep}
group { Client }
Client->SGW."Get order by id" {
  svc.Get(id) {
    rep."load order" {
      if(order == null) {
        @return
        SGW->Client:401
      }
    }
  }
}`,
  },
  {
    name: "if-fragment",
    code: `title Issue 232 - wrong layout for if-fragment
Client -> Server:SendRequest

if(true){
  Server -> Server: processRequest
}`,
  },
  {
    name: "fragments-return",
    code: `A.method {
  if(x) {
    return x
  } else {
    return y
  }
  try {
    return 1
  } catch {
    return 2
  } finally {
    return 3
  }
}`,
  },
  {
    name: "interaction",
    code: `if(x) {
  A.method() {
    B.method() {
      BSelfMethod00000000000
      A.method()
    }
    ASelf {
      B->A.method
    }
  }
}`,
  },
  {
    name: "async-1",
    code: `A->A: async
A->B: async
A->C: async
B->B: async
B->C: async
B->A: async
C->C: async
C->B: async
C->A: async`,
  },
  {
    name: "async-2",
    code: `A.method {
  A->A: async
  A->B: async
  A->C: async
  B->B: async
  B->C: async
  B->A: async
  C->C: async
  C->B: async
  C->A: async
  B.method {
    A->A: async
    A->B: async
    A->C: async
    B->B: async
    B->C: async
    B->A: async
    C->C: async
    C->B: async
    C->A: async
  }
}`,
  },
  {
    name: "async-3",
    code: `A B C
C.method {
  A->C: async
  C->A: async
  C->B: async
  B->C: async
  B.method {
    A->A: async
    A->B: async
    A->C: async
    B->B: async
    B->C: async
    B->A: async
    C->C: async
    C->B: async
    C->A: async
  }
}`,
  },
  {
    name: "return",
    code: `A B C D

A->B.method() {
  ret0_assign_rtl =C.method_long_to_give_space {
    @return C->D: ret1_annotation_ltr
    ret5_assign_ltr = B.method
    B.method2 {
      return ret2_return_ltr
    }
  }

  return ret2_return_rtl
  @return B->A: ret4_annotation_rtl
}`,
  },
  {
    name: "self-sync",
    code: `selfSync() {
  A.method {
    B.method
  }
}`,
  },
  {
    name: "nested-fragment",
    code: `title Nested Interaction with Fragment and Self-Invocation
A.Read() {
  B.Submit() {
    Process() {
      if (true) {
        ProcessCallback() {
          A.method
        }
      }
    }
  }
}`,
  },
  {
    name: "nested-outbound",
    code: `title Nested Interaction with Outbound Message and Fragment
A.Read() {
  B.Submit() {
    C->B.method {
      if (true) {
        ProcessCallback() {
          A.method
        }
      }
    }
  }
}`,
  },
  {
    name: "named-params",
    code: `title Named Parameters Test
// Testing named parameter syntax (param=value)
A.method(userId=123, name="John")
B.create(type="User", active=true)
C.mixedCall(1, name="Mixed", enabled=false)
D.oldStyle(1, 2, 3)
E.complex(first="value1", second=42, third=true, fourth="final")`,
  },
  {
    name: "vertical-1",
    code: `// red
// green
a = A.m111
new E`,
  },
  {
    name: "vertical-2",
    code: `// [red]
new B`,
  },
  {
    name: "vertical-3",
    code: `if(x) {
  // comment
  new A
} else {
  new B
}

new C
try {
  new D
} catch {
  par {
    new E
    new F
  }
}`,
  },
  {
    name: "vertical-4",
    code: `if(x) {
  // comment
  new A
} else {
  new B
}

new C
try {
  new D
} catch {
  par {
    new E
    new F
    if(x) {
      new X
    } else {
      new Y
    }
  }
}`,
  },
  {
    name: "vertical-5",
    code: `par {
  new F
  if(x) {
    new X
  } else {
    try {
      new Y
    } catch {
      par {
        new G
        if(x) {
          new H
        } else {
          new I
        }
      }
    }
  }
}`,
  },
  {
    name: "vertical-6",
    code: `new a
if(x) {
	new b
} else {
	new c
	new e
}
new D`,
  },
  {
    name: "vertical-7",
    code: `A.method
section(){
    new B
}`,
  },
  {
    name: "vertical-8",
    code: `new Creation() {
  return from_creation
}
return "from if to original source"
try {
  new AHasAVeryLongNameLongNameLongNameLongName() {
    new CreatWithinCreat()
  }
}`,
  },
  {
    name: "vertical-9",
    code: `A0->A0: self
new A`,
  },
  {
    name: "vertical-10",
    code: `new E
E.messageA()
new A {
  if (x) {
    new D
  }
  new B {
    new C
  }
}`,
  },
  {
    name: "vertical-11",
    code: `A.call {
  // pre creation
  A->B: prep
  a = new A()
  a->B: post
}`,
  },
  {
    name: "demo1-smoke",
    code: `// comments at the beginning should be ignored
title This is a title
@Lambda <<stereotype>> ParticipantName
group "B C" {@EC2 B @ECS C}
"bg color" #FF0000
@Starter("OptionalStarter")
new B
ReturnType ret = ParticipantName.methodA(a, b) {
  critical("This is a critical message") {
    // Customised style for RESTFul API - \`POST /order\`
    ReturnType ret2 = selfCall() {
      B.syncCallWithinSelfCall() {
        ParticipantName.rightToLeftCall()
        return B
      }
      "space in name"->"bg color".syncMethod(from, to)
    }
  }
  // A comment for alt
  if (condition) {
    // A comment for creation
    ret = new CreatAndAssign()
    "ret:CreatAndAssign".method(create, and, assign)
    // A comment for async self
    B->B: Self Async
    // A comment for async message
    B->C: Async Message within fragment
    new Creation() {
      return from_creation
    }
    return "from if to original source"
    try {
      new AHasAVeryLongNameLongNameLongNameLongName() {
        new CreatWithinCreat()
        C.rightToLeftFromCreation() {
          B.FurtherRightToLeftFromCreation()
        }
      }
    } catch (Exception) {
      self {
        return C
      }
    } finally {
      C: async call from implied source
    }
    =====divider can be anywhere=====
  } else if ("another condition") {
    par {
      B.method
      C.method
    }
  } else {
    // A comment for loop
    forEach(Z) {
      Z.method() {
        return Z
      }
    }
  }
}`,
  },
  {
    name: "demo3-nested-fragments",
    code: `ret = A.methodA() {
  if (x) {
    B.methodB()
    if (y) {
      C.methodC()
    }
  }
  while (x) {
    B.methodB()
    while (y) {
      C.methodC()
    }
  }
  if (x) {
    method()
    if (y) {
      method2()
    }
  }
  while (x) {
    method()
    while (y) {
      method2()
    }
  }
  while (x) {
    method()
    if (y) {
      method2()
    }
  }
  if (x) {
    method()
    while (y) {
      method2()
    }
  }
}`,
  },
  {
    name: "demo4-fragment-span",
    code: `ret = A.methodA() {
  B.method() {
    if (X) {
      C.methodC() {
        a = A.methodA() {
          D.method()
        }
      }
    }
    while (Y) {
      C.methodC() {
        A.methodA()
      }
    }
   }
 }`,
  },
  {
    name: "demo5-self-named",
    code: `A.methodA() { A.methodA1() }`,
  },
  {
    name: "demo6-async-styled",
    code: `A->A:: Hello
A->B:: Hello B
B->A: So what`,
  },
];

test.describe("SVG Parity Tests", () => {
  for (const { name, code } of SVG_PARITY_CASES) {
    test(`svg-${name}`, async ({ page }) => {
      await page.goto("/cy/svg-test.html");
      await page.evaluate((c) => (window as any).__renderSvg(c), code);
      await expect(page.locator("svg")).toBeVisible({ timeout: 5000 });
      await expect(page).toHaveScreenshot(`svg-${name}.png`, {
        threshold: 0.02,
        fullPage: true,
      });
    });
  }
});
