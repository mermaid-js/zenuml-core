import { EmptyFileSystem } from "langium";
import { parseHelper } from "langium/test";
import { describe, it, expect, beforeAll } from "vitest";
import { Model } from "../language/generated/ast";
import { createSequenceServices, genValidateParser } from "./fixture";

describe("Langium Sequence Parser - Complete ANTLR Translation", () => {
  let parse: ReturnType<typeof parseHelper<Model>>;
  let validateParser: (text: string) => Promise<void>;

  beforeAll(async () => {
    const services = createSequenceServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.Sequence);
    validateParser = await genValidateParser(parse);
  });

  describe("prog (entry point)", () => {
    it("should parse empty string", async () => {
      await validateParser("");
    });

    it("should parse title only", async () => {
      await validateParser('title "Test Title"');
    });

    it("should parse title and head", async () => {
      await validateParser('title "Test"\n@Actor A');
    });

    it("should parse title, head and block", async () => {
      await validateParser('title "Test"\nA->B.method()');
    });

    it("should parse title, head and block", async () => {
      await validateParser(
        'title "Test"\n@Actor A\n@Actor B\n@Starter(m)\nA->B.method()',
      );
    });
  });

  describe("title", () => {
    it("should parse title with id", async () => {
      await validateParser('title "My Sequence Diagram"');
    });

    it("should parse title with double quotes", async () => {
      await validateParser('title "My Sequence Diagram"');
    });

    it("should parse title without content", async () => {
      await validateParser("title");
    });
  });

  describe("head", () => {
    it("should parse multiple participants", async () => {
      await validateParser("@Actor A\n@Service B");
    });

    it("should parse participants and starterExp", async () => {
      await validateParser("@Actor A\n@starter(A)");
    });
  });

  describe("group", () => {
    it("should parse group with name and participants", async () => {
      await validateParser("group Backend {\n  @Service A\n  @Database B\n}");
    });

    it("should parse group with name only", async () => {
      await validateParser("group Backend");
    });
  });

  describe("starterExp", () => {
    it("should parse @starter with parameters", async () => {
      await validateParser("@starter(UserService)");
    });

    it("should parse @starter without parameters", async () => {
      await validateParser("@starter");
    });

    it("should parse @Starter with parameters", async () => {
      await validateParser("@Starter(UserService)");
    });

    it("should parse @Starter without parameters", async () => {
      await validateParser("@Starter");
    });

    it("should parse annotation", async () => {
      await validateParser("@Component");
    });
  });

  describe("starter", () => {
    it("should parse ID starter", async () => {
      await validateParser("@starter(ServiceA)");
    });

    it("should parse STRING starter", async () => {
      await validateParser('@starter("Service A")');
    });
  });

  describe("participant", () => {
    it("should parse full participant with all options", async () => {
      await validateParser(
        '@Actor <<Service>> UserService 200 as "User Service" #ff0000',
      );
    });

    it("should parse participant with type only", async () => {
      await validateParser("@Actor");
    });

    it("should parse participant with stereotype only", async () => {
      await validateParser("<<Interface>>");
    });
  });

  describe("stereotype", () => {
    it("should parse complete stereotype", async () => {
      await validateParser("<<Repository>>");
    });

    it("should parse incomplete stereotype with >", async () => {
      await validateParser("<<Service>");
    });

    it("should parse empty stereotype brackets", async () => {
      await validateParser("<<>>");
    });
  });

  describe("label", () => {
    it("should parse label with name", async () => {
      await validateParser('@Actor A as "User Actor"');
    });

    it("should parse label without name", async () => {
      await validateParser("@Actor A as");
    });
  });

  describe("participantType", () => {
    it("should parse annotation as participant type", async () => {
      await validateParser("@Service UserService");
    });
  });

  describe("name", () => {
    it("should parse ID as name", async () => {
      await validateParser("@Actor UserService");
    });

    it("should parse STRING as name", async () => {
      await validateParser('@Actor "User Service"');
    });
  });

  describe("width", () => {
    it("should parse integer width", async () => {
      await validateParser("@Actor UserService 150");
    });
  });

  describe("block", () => {
    it("should parse block with multiple statements", async () => {
      await validateParser(
        "A->B.method1()\nB->C.method2()\nif (condition) {\n  C->A.callback()\n}",
      );
    });
  });

  describe("ret (return statement)", () => {
    it("should parse return with expression", async () => {
      await validateParser("return result;");
    });

    it("should parse return without expression", async () => {
      await validateParser("return;");
    });

    it("should parse annotation return", async () => {
      await validateParser("@return A->B: result");
    });
  });

  describe("divider", () => {
    it("should parse divider note", async () => {
      await validateParser("== This is a divider note ==");
    });
  });

  describe("stat (statements)", () => {
    describe("alt statement", () => {
      it("should parse if block", async () => {
        await validateParser("if (condition) {\n  A->B.method()\n}");
      });

      it("should parse else-if block", async () => {
        await validateParser(
          "if (condition) {\n  A->B.method()\n} else if (condition) {\n  A->B.method()\n}",
        );
      });

      it("should parse multiple else-if blocks", async () => {
        await validateParser(
          "if (condition) {\n  A->B.method()\n} else if (condition) {\n  A->B.method()\n} else if (condition) {\n  A->B.method()\n}",
        );
      });

      it("should parse else block", async () => {
        await validateParser(
          "if (condition) {\n  A->B.method()\n} else {\n  A->B.method()\n}",
        );
      });

      it("should parse if-else-if-else block", async () => {
        await validateParser(
          "if (condition) {\n  A->B.method()\n} else if (condition) {\n  A->B.method()\n} else {\n  A->B.method()\n}",
        );
      });
    });

    describe("par statement", () => {
      it("should parse par statement", async () => {
        await validateParser("par {\n  A->B.method()\n  C->D.method()\n}");
      });

      it("should parse par without block", async () => {
        await validateParser("par");
      });
    });

    describe("opt statement", () => {
      it("should parse opt statement", async () => {
        await validateParser("opt {\n  A->B.method()\n}");
      });
    });

    describe("critical statement", () => {
      it("should parse critical statement", async () => {
        await validateParser("critical (lock) {\n  A->B.method()\n}");
      });

      it("should parse critical without parameter", async () => {
        await validateParser("critical {\n  A->B.critical()\n}");
      });

      it("should parse critical without block", async () => {
        await validateParser("critical");
      });
    });

    describe("ref statement", () => {
      it("should parse ref statement", async () => {
        await validateParser("ref (diagram1, diagram2);");
      });
    });

    describe("loop statement", () => {
      it("should parse loop statement", async () => {
        await validateParser("while (condition) {\n  A->B.method()\n}");
      });

      it("should parse loop without block", async () => {
        await validateParser("while (condition)");
      });
    });

    describe("creation statement", () => {
      it("should parse creation statement with assignment", async () => {
        await validateParser("const obj = new Object(param)");
      });
      it("should parse creation statement without assignment", async () => {
        await validateParser("new Object(param)");
      });
      it("should parse creation statement with block", async () => {
        await validateParser("new Object() {\n  init()\n}");
      });
      it("should parse creation statement with block and assignment", async () => {
        await validateParser("const obj = new Object() {\n  init()\n}");
      });
    });

    describe("message statement", () => {
      it("should parse message statement", async () => {
        await validateParser("A->B.method(param);");
      });

      it("should parse message with assignment", async () => {
        await validateParser("result = A->B.process(data);");
      });

      it("should parse message with block", async () => {
        await validateParser("A->B.method() {\n  callback()\n}");
      });
    });

    describe("asyncMessage statement", () => {
      it("should parse async message", async () => {
        await validateParser("A->B: asyncEvent");
      });

      it("should parse complete async message", async () => {
        await validateParser("A->B: eventData");
      });

      it("should parse incomplete async message", async () => {
        await validateParser("A->B:");
      });

      it("should parse intermediate async message", async () => {
        await validateParser("A-B");
      });
    });

    describe("try-catch-finally statement", () => {
      it("should parse try block", async () => {
        await validateParser(
          "try {\n  A->B.method()\n} catch (e) {\n  B->A.error()\n} finally {\n  A->B.cleanup()\n}",
        );
      });

      it("should parse try block with catch block", async () => {
        await validateParser(
          "try {\n  A->B.method()\n} catch (e) {\n  B->A.error()\n}",
        );
      });

      it("should parse try block with finally block", async () => {
        await validateParser(
          "try {\n  A->B.method()\n} finally {\n  A->B.cleanup()\n}",
        );
      });

      it("should parse try block with catch and finally blocks", async () => {
        await validateParser(
          "try {\n  A->B.method()\n} catch (e) {\n  B->A.error()\n} finally {\n  A->B.cleanup()\n}",
        );
      });
    });

    describe("section statement", () => {
      it("should parse section with parameter", async () => {
        await validateParser(
          "section (authorization) {\n  A->B.authorize()\n}",
        );
      });

      it("should parse anonymous section", async () => {
        await validateParser("section {\n  A->B.method()\n}");
      });

      it("should parse section without block", async () => {
        await validateParser("section");
      });
    });

    describe("creation statement", () => {
      it("should parse creation with assignment and parameters", async () => {
        await validateParser("obj = new MyClass(param1, param2);");
      });

      it("should parse creation with assignment only", async () => {
        await validateParser("obj = new");
      });

      it("should parse creation with block", async () => {
        await validateParser("obj = new MyClass() {\n  init()\n}");
      });
    });

    describe("ref statement", () => {
      it("should parse ref with multiple names", async () => {
        await validateParser("ref (diagram1, diagram2, diagram3);");
      });

      it("should parse ref without semicolon", async () => {
        await validateParser("ref (sequence1)");
      });
    });

    describe("creationBody", () => {
      it("should parse creation with assignment and construct", async () => {
        await validateParser('const str = new String("hello")');
      });

      it("should parse creation without assignment", async () => {
        await validateParser("new Object()");
      });
    });

    describe("messageBody", () => {
      it("should parse complete message body", async () => {
        await validateParser("result = A->B.process()");
      });

      it("should parse assignment only", async () => {
        await validateParser("result = ");
      });

      it("should parse arrow and dot only", async () => {
        await validateParser("A->B.");
      });
    });

    describe("func", () => {
      it("should parse chained function calls", async () => {
        await validateParser("A->B.service.method().chain()");
      });
    });

    describe("signature", () => {
      it("should parse method with invocation", async () => {
        await validateParser("A->B.method(param1, param2)");
      });

      it("should parse method without invocation", async () => {
        await validateParser("A->B.method");
      });

      it("should parse empty invocation", async () => {
        await validateParser("A->B.method()");
      });
    });

    describe("assignment", () => {
      it("should parse typed assignment", async () => {
        await validateParser("var result = A->B.getString()");
      });

      it("should parse untyped assignment", async () => {
        await validateParser("result = A->B.getValue()");
      });
    });

    describe("expressions", () => {
      it("should parse atom expressions", async () => {
        await validateParser("A.method() {result = 42}");
      });

      it("should parse unary minus", async () => {
        await validateParser("A.method() {result = -value}");
      });

      it("should parse binary operations", async () => {
        await validateParser("result = a + b");
      });
    });

    describe("atoms", () => {
      it("should parse number atoms", async () => {
        await validateParser("result = 42");
      });

      it("should parse float atoms", async () => {
        await validateParser("result = 3.14");
      });

      it("should parse money atoms", async () => {
        await validateParser("result = $100.50");
      });

      it("should parse boolean atoms", async () => {
        await validateParser("result = true");
      });

      it("should parse ID atoms", async () => {
        await validateParser("result = variable");
      });

      it("should parse string atoms", async () => {
        await validateParser('result = "hello world"');
      });

      it("should parse nil atoms", async () => {
        await validateParser("result = nil");
      });
    });

    describe("line comment", () => {
      it("should parse comment as a statement", async () => {
        await validateParser("// This is a comment");
      });
    });

    describe("error cases and edge cases", () => {
      it("should handle incomplete constructs gracefully", async () => {
        const document = await parse("if (", { validation: true });
        // Should parse but may have errors
        expect(document.parseResult.value.$type).toBeDefined();
      });

      it("should handle missing brackets", async () => {
        const document = await parse("A->B.method(", { validation: true });
        // Should parse but may have errors
        expect(document.parseResult.value.$type).toBeDefined();
      });
    });
  });
});
