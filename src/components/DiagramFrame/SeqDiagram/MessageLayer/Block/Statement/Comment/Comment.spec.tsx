import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CommentClass from "@/components/Comment/Comment";
import { Comment } from "./Comment";

const renderComment = (text: string) =>
  render(<Comment comment={text} />).container.querySelector(
    ".comments > div",
  )!;

describe("Comment", () => {
  it("renders paragraphs and line breaks", () => {
    const el = renderComment("first\nsecond");
    expect(el.querySelector("p")!.textContent).toBe("firstsecond");
    expect(el.querySelectorAll("br")).toHaveLength(1);
  });

  it("renders inline code and emphasis without double escaping", () => {
    const el = renderComment("a & b `c<d>` **e&f** _g_");
    expect(el.querySelector("code")!.textContent).toBe("c<d>");
    expect(el.querySelector("strong")!.textContent).toBe("e&f");
    expect(el.querySelector("em")!.textContent).toBe("g");
    expect(el.textContent).toContain("a & b");
  });

  it("renders REST endpoints in code spans", () => {
    const el = renderComment("`GET /users?a=1&b=2`");
    const code = el.querySelector("code.rest-api")!;
    expect(code.querySelector(".http-method-get")!.textContent).toBe("GET");
    expect(code.querySelector(".http-path")!.textContent).toBe(
      "/users?a=1&b=2",
    );
  });

  it("renders fenced code blocks with highlighting spans", () => {
    const el = renderComment("```javascript\nif (a < b) {}\n```");
    const code = el.querySelector("pre > code.language-javascript")!;
    expect(code.textContent).toBe("if (a < b) {}");
    expect(code.querySelector(".hljs-keyword")!.textContent).toBe("if");
  });

  it("renders raw HTML as inert text", () => {
    const el = renderComment(
      '<script>alert(1)</script> <img src=x onerror="alert(1)"> <b>x</b>',
    );
    expect(el.querySelector("script, img, b")).toBeNull();
    expect(el.textContent).toContain("<script>");
    expect(el.textContent).toContain("<b>x</b>");
  });

  it("drops unsafe link protocols but keeps safe links", () => {
    const el = renderComment(
      "[bad](javascript:alert(1)) [good](https://zenuml.com)",
    );
    const links = el.querySelectorAll("a");
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe("https://zenuml.com");
    expect(el.textContent).toContain("bad");
  });

  it("applies comment class names and styles", () => {
    const commentObj = new CommentClass("[red, bold] hello\n");
    const { container } = render(<Comment commentObj={commentObj} />);
    const el = container.querySelector(".comments > div") as HTMLElement;
    expect(el.textContent).toContain("hello");
    expect(Object.keys(commentObj.commentStyle).length).toBeGreaterThan(0);
    for (const [k, v] of Object.entries(commentObj.commentStyle)) {
      expect(el.style[k as any]).toBe(v);
    }
    for (const c of commentObj.commentClassNames) {
      expect(el.classList.contains(c)).toBe(true);
    }
  });
});
