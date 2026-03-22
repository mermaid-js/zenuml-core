// Single source of truth for all comparison test cases.
// Used by both compare.html (homepage) and compare-case.html (diff viewer).

export const CASES = {
  // --- Basics ---
  "empty": ``,
  "single-participant": `A`,
  "sync-call": `A.m`,
  "simple-messages": `A -> B: hello
B -> C: process
C -> B: result
B -> A: done`,
  "named-params": `A.method(userId=123, name="John")
B.create(type="User", active=true)`,

  // --- Sync calls & self-calls ---
  "nested-sync": `A.method() {
  B.method
}`,
  "self-sync": `selfSync() {
  A.method {
    B.method
  }
}`,
  "demo5-self-named": `A.methodA() { A.methodA1() }`,
  "nested-occurrence": `title Order Service
A.method1{
  B.method2 {
    A->B.method3
  }
}`,
  "interaction": `if(x) {
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
  "nested-fragment": `title Nested Interaction
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
  "nested-outbound": `title Nested Interaction with Outbound
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
  "if-then-continue": `A.m {
  if(x) {
    B.m
  }
  C.m
}`,
  "participant-width": `LongParticipantName.method`,

  // --- Async messages ---
  "async-1": `A->A: selfA
A->B: aToB
A->C: aToC
B->B: selfB
B->C: bToC
B->A: bToA
C->C: selfC
C->B: cToB
C->A: cToA`,
  "async-2a": `A.method {
  A->A: selfPing
  A->B: send
  A->C: broadcast
  B->B: selfCheck
  B->C: forward
  B->A: reply
  C->C: selfLog
  C->B: respond
  C->A: callback
}`,
  "async-2b": `A.method {
  A->B: init
  B.method {
    A->B: request
    B->C: delegate
    C->A: complete
  }
}`,
  "async-3": `A B C
C.method {
  A->C: notify
  C->A: respond
  C->B: forward
  B->C: ack
}`,
  "async-self": `A->A: selfAsync`,
  "async-self-nested": `A.method {
  A->A: async
}`,
  "demo6-async-styled": `A->A:: Hello
A->B:: Hello B
B->A: So what`,

  // --- Fragments ---
  "repro-alt-simple": `if(cond) {
  A -> B: inIf
} else {
  A -> B: inElse
}`,
  "repro-alt-nested-tcf": `if(cond) {
  A -> B: msg1
  try {
    B -> C: tryMsg
  } catch(e) {
    C -> B: catchMsg
  } finally {
    B -> A: finallyMsg
  }
} else if(cond2) {
  A -> B: elseIfMsg
} else {
  A -> B: elseMsg
}`,
  "if-fragment": `title Issue 232
Client -> Server:SendRequest
if(true){
  Server -> Server: processRequest
}`,
  "fragment-loop": `A -> B: request
loop(condition) {
  B -> C: process
}`,
  "fragment-tcf": `A.method {
  try {
    B.process
  } catch(error) {
    C.handle
  } finally {
    D.cleanup
  }
}`,
  "fragment": `A
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
  "fragments-return": `A.method {
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
  "fragment-issue": `// This sample is carefully crafted. It shows a known issues: fragment stretched to
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
  "nested-fragment-indent": `A.m {
  try {
    loop(x) {
      B.m
    }
  } catch(e) {
    B.m
  }
}`,

  // --- Creation ---
  "creation": `title Title 1
A.m {
  new B(1,2,3,4)
}`,
  "creation-return": `A.method() {
  b = new B()
}`,
  "creation-rtl": `"b:B"
a1 = A.method() {
  // abcde
  b = new B()
}`,
  "creation-long-name": `new AHasAVeryLongNameLongNameLongNameLongName()`,
  "comment-creation": `A.method() {
  // abcde
  new B()
}`,
  "defect-406": `title Title 1
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

  // --- Return ---
  "return": `A B C D
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
  // Minimal return isolation cases
  "return-single-explicit": `A B
A->B.method() {
  return ret1
}`,
  "return-two-explicit": `A B
A->B.method() {
  B.inner
  return ret1
  @return B->A: ret2
}`,
  "return-nested-then-direct": `A B C
A->B.method() {
  B->C.nested() {
    return nested_ret
  }
  return direct_ret
}`,
  "return-only-two": `A B
A->B.method() {
  return ret1
  @return B->A: ret2
}`,
  "return-assign-rtl": `A B C
A->B.method() {
  ret0 = C.inner {
    B.work
  }
}`,
  "return-assign-ltr": `A B C
A->B.method() {
  ret0 = B.inner
}`,
  "return-keyword-ltr": `A B C
A->B.method() {
  B->C.work {
    return ret1
  }
}`,
  "repro-return-after-creation": `new B() {
  return from_creation
}
return "back to caller"`,

  // --- Vertical layout (comments & creation) ---
  "vertical-1": `// red
// green
a = A.m111
new E`,
  "vertical-2": `// [red]
new B`,
  "vertical-3": `if(x) {
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
  "vertical-4": `if(x) {
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
  "vertical-5": `par {
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
  "vertical-6": `new a
if(x) {
\tnew b
} else {
\tnew c
\tnew e
}
new D`,
  "vertical-7": `A.method
section(){
    new B
}`,
  "vertical-8": `new Creation() {
  return from_creation
}
return "back to caller"
try {
  new AHasAVeryLongNameLongNameLongNameLongName() {
    new CreatWithinCreat()
  }
}`,
  "vertical-9": `A0->A0: self
new A`,
  "vertical-10": `new E
E.messageA()
new A {
  if (x) {
    new D
  }
  new B {
    new C
  }
}`,
  "vertical-11": `A.call {
  // pre creation
  A->B: prep
  a = new A()
  a->B: post
}`,

  // --- Complex demos ---
  "smoke": `title ABCD Title
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
  "demo1-smoke": `// comments at the beginning should be ignored
title This is a title
@Lambda <<stereotype>> ParticipantName
group "B C" {@EC2 B @ECS C}
"bg color" #FF0000
@Starter("OptionalStarter")
new B
ReturnType ret = ParticipantName.methodA(a, b) {
  critical("This is a critical message") {
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
    return "back to caller"
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
  "demo3-nested-fragments": `ret = A.methodA() {
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
  "demo4-fragment-span": `ret = A.methodA() {
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

  // --- Repro cases ---
  "repro-participant-y": `A -> B: hello`,
  "repro-occ-basics": `A.method()`,
  "repro-occ-height": `A.B {
  B.C {
    C.D
  }
  B.E
}`,
  "repro-creation-width": `A.m {
  b = new LongParticipantName()
}`,
  "repro-comment": `A.method {
  try {
    // String line;
    B.process
  } catch(e) {
    C.handle
  }
}`,
  "repro-msg-y": `A -> B: msg`,
  "repro-occ-depth2": `A.method() {
  selfCall() {
    B.call() {
      A.rtl()
    }
  }
}`,
  "repro-comment-async-self": `A.method() {
  // A comment
  A->A: Self Async
}`,
  "repro-debt-drift": `A.method() {
  selfCall() {
    B.call() {
      A.rtl()
      return B
    }
  }
  B.syncMethod(from,to)
}`,
  "repro-fragment-section-debt": `A.method() {
  if(x) {
    B.call() {
      return result
    }
  } else {
    B.afterSection()
  }
}`,
  "repro-creation-in-try": `A.method() {
  try {
    b = new B() {
      B.inner()
    }
    A.afterCreation()
  } catch(Exception) {
    A.inCatch()
  } finally {
    A.inFinally()
  }
}`,

  // --- Occurrence bar length ---
  "occ-bar-length": `A->B.method {
  B->C.inner {
    @return C->B: ret1
    B->C.call2 {
      return ret2
    }
  }
  return ret3
}`,

  // --- Return Y after inner block ---
  "return-after-block": `A->B.method {
  B->C.inner {
    @return C->B: ret_inside
    C->B.call2
    B->C.call3 {
      return ret_nested
    }
  }
  return ret_after
  @return B->A: ret_annot
}`,

  // --- Assignment return: block with inner return ---
  "repro-assign-return": `A->B.method {
  ret0 = B->C.inner {
    @return C->B: ret_inside
  }
}`,
  // --- Occurrence height: empty block (no children) ---
  "repro-occ-empty": `A->B.method {
  B->C.inner {
  }
}`,
  // --- Occurrence height: block with one sync message ---
  "repro-occ-sync": `A->B.method {
  B->C.inner {
    C->B.call
  }
}`,
  // --- Occurrence height: block with one non-self return ---
  "repro-occ-return": `A->B.method {
  B->C.inner {
    @return C->B: ret
  }
}`,
  // --- Occurrence height: block with sync + return ---
  "repro-occ-mixed": `A->B.method {
  B->C.inner {
    C->B.call
    @return C->B: ret
  }
}`,
  // --- Occurrence height: sync + `return` keyword ---
  "repro-occ-mixed-keyword": `A->B.method {
  B->C.inner {
    C->B.call
    return ret_kw
  }
}`,
  // --- Occurrence height: sync + two @returns ---
  "repro-occ-mixed-2ret": `A->B.method {
  B->C.inner {
    C->B.call
    @return C->B: ret1
    @return C->B: ret2
  }
}`,
  // --- Occurrence height: two syncs + one @return between them ---
  "repro-occ-mixed-mid": `A->B.method {
  B->C.inner {
    C->B.call1
    @return C->B: ret
    C->B.call2
  }
}`,
  // --- Creation with params ---
  "repro-creation-params": `new B(1)`,
  // --- Just participant B (no creation) ---
  "repro-just-B": `B`,
  // --- Starter + B with message ---
  "repro-starter-B": `B.m`,
  // --- Starter + B with long method name ---
  "repro-starter-B-long": `B.aVeryLongMethodThatShouldPushTheParticipant`,

  // --- Icons ---
  "icons": `@Actor User
@Database DB
@sqs MQ
@sns Topic

User.login() {
  DB.verify()
  MQ.enqueue()
  Topic.publish()
}`,
};
