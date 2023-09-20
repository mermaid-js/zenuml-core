import {TitleContextFixture} from "@/parser/ContextsFixture";

describe('Title', function () {
  it('should parse the title', function () {
    const title = TitleContextFixture('title Hello World');
    expect(title.content()).toBe('Hello World');
  });
  it('should allow an empty title', function () {
    const title = TitleContextFixture('title');
    expect(title.content()).toBe('');
  });
});
