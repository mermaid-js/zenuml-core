import {
  AsyncMessageContextFixture,
  SyncMessageContextFixture,
} from "../ContextsFixture";

describe("Messages", () => {
  it("Async Message", () => {
    const message = AsyncMessageContextFixture("Alice -> Bob: Hello World");
    expect(message.getFormattedText()).toBe("Alice -> Bob: Hello World");
  });

  it("Async Message with Comment", () => {
    const message = AsyncMessageContextFixture(
      "// comment \nAlice -> Bob: Hello World",
    );
    expect(message.getFormattedText()).toBe("Alice -> Bob: Hello World");
    expect(message.getComment()).toBe(" comment \n");
  });

  it("Async Message with Decorator", () => {
    const message = AsyncMessageContextFixture(
      "\\red\\\nAlice -> Bob: Hello World",
    );
    expect(message.getFormattedText()).toBe("Alice -> Bob: Hello World");
    expect(message.getDecorator()).toBe("red");
  });

  it("Async Message with multiline Comment", () => {
    const message = AsyncMessageContextFixture(
      "// comment1 \n// comment2 \nAlice -> Bob: Hello World",
    );
    expect(message.getFormattedText()).toBe("Alice -> Bob: Hello World");
    expect(message.getComment()).toBe(" comment1 \n comment2 \n");
  });
});

// Tests
describe("MessageContext.prototype.Statements", () => {
  it("should return empty array if no statements", () => {
    const ctx = SyncMessageContextFixture("A.method");
    expect(ctx.Statements()).toEqual([]);
  });

  it("should return array of statements if present", () => {
    const ctx = SyncMessageContextFixture("A.method { m1 m2 }");
    expect(ctx.Statements().length).toEqual(2);
    expect(ctx.Statements()[0].getText()).toEqual("m1");
    expect(ctx.Statements()[1].getText()).toEqual("m2");
  });
});
