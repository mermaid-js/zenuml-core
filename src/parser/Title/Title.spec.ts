import { TitleContextFixture, ProgContextFixture, SyncMessageContextFixture } from "@/parser/ContextsFixture";

describe("Title", function () {
  it("should parse the title", function () {
    const title = TitleContextFixture("title Hello World");
    expect(title.content()).toBe("Hello World");
  });
  it("should allow an empty title", function () {
    const title = TitleContextFixture("title");
    expect(title.content()).toBe("");
  });
  it("should parse title with leading spaces", function () {
    const title = TitleContextFixture("  title My Title");
    expect(title.content()).toBe("My Title");
  });
});

describe("Title as identifier", function () {
  it("should allow 'title' as method name", function () {
    const code = "A.title()";
    const message = SyncMessageContextFixture(code);
    expect(message.messageBody().func().signature()[0].methodName().getText()).toBe("title");
  });

  it("should allow 'title' as parameter name", function () {
    const code = "A.method(title, value)";
    const message = SyncMessageContextFixture(code);
    const params = message.messageBody().func().signature()[0].invocation().parameters().parameter();
    expect(params[0].getText()).toBe("title");
  });

  it("should allow 'title' in named parameters", function () {
    const code = 'A.method(title="My Title")';
    const message = SyncMessageContextFixture(code);
    const params = message.messageBody().func().signature()[0].invocation().parameters().parameter();
    expect(params[0].namedParameter().ID().getText()).toBe("title");
  });

  it("should allow 'title' as variable in assignment", function () {
    const code = "title = A.getValue()";
    const message = SyncMessageContextFixture(code);
    expect(message.messageBody().assignment().assignee().atom().getText()).toBe("title");
  });

  it("should distinguish title directive from title method", function () {
    const code = `title My Diagram
A.title()`;
    const prog = ProgContextFixture(code);
    expect(prog.title().content()).toBe("My Diagram");
    expect(prog.block().stat()[0].message().messageBody().func().signature()[0].methodName().getText()).toBe("title");
  });

  it("should parse title after comments", function () {
    const code = `// This is a comment
title My Title`;
    const prog = ProgContextFixture(code);
    expect(prog.title().content()).toBe("My Title");
  });

  it("should allow title as participant in messages", function () {
    const code = "A->title.method()";
    const message = SyncMessageContextFixture(code);
    expect(message.messageBody().fromTo().to().getText()).toBe("title");
  });
});
