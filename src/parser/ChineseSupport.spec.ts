import { describe, expect, it } from "vitest";
import antlr4 from "antlr4";
import "./index";
import sequenceLexer from "../generated-parser/sequenceLexer";
import sequenceParser from "../generated-parser/sequenceParser";

class SeqErrorListener extends antlr4.error.ErrorListener {}

function createParser(code: any) {
  const chars = new antlr4.InputStream(code);
  const lexer = new sequenceLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new sequenceParser(tokens);
  parser.addErrorListener(new SeqErrorListener());
  return parser;
}

function ProgContextFixture(code: string) {
  const parser = createParser(code);
  return parser.prog();
}

describe("Chinese Character Support", () => {
  describe("Basic Chinese Identifiers", () => {
    it("should parse Chinese participant names", () => {
      const context = ProgContextFixture("用户 数据库");
      expect(context.head().participant().length).toBe(2);
      expect(context.head().participant(0).name(0).getText()).toBe("用户");
      expect(context.head().participant(1).name(0).getText()).toBe("数据库");
    });

    it("should parse Chinese method names", () => {
      const context = ProgContextFixture("用户.登录()");
      const message = context.block().stat(0).message();
      expect(message.messageBody().to().getText()).toBe("用户");
      expect(message.messageBody().func().signature(0).methodName().getText()).toBe("登录");
    });

    it("should parse mixed Chinese-English identifiers", () => {
      const context = ProgContextFixture("UserService.获取数据()");
      const message = context.block().stat(0).message();
      expect(message.messageBody().to().getText()).toBe("UserService");
      expect(message.messageBody().func().signature(0).methodName().getText()).toBe("获取数据");
    });
  });

  describe("Chinese with Spaces (Using Strings)", () => {
    it("should parse Chinese strings with spaces as participant names", () => {
      const context = ProgContextFixture('"用户 服务" "数据 存储"');
      expect(context.head().participant().length).toBe(2);
      expect(context.head().participant(0).name(0).getText()).toBe('"用户 服务"');
      expect(context.head().participant(1).name(0).getText()).toBe('"数据 存储"');
    });

    it("should parse Chinese strings with spaces in method calls", () => {
      const context = ProgContextFixture('"用户 服务"."获取 信息"()');
      const message = context.block().stat(0).message();
      expect(message.messageBody().to().getText()).toBe('"用户 服务"');
      expect(message.messageBody().func().signature(0).methodName().getText()).toBe('"获取 信息"');
    });

    it("should parse return statements with Chinese", () => {
      const context = ProgContextFixture('return 成功');
      const ret = context.block().stat(0).ret();
      expect(ret.expr().getText()).toBe("成功");
    });

    it("should parse return statements with Chinese strings containing spaces", () => {
      const context = ProgContextFixture('return "操作 成功"');
      const ret = context.block().stat(0).ret();
      expect(ret.expr().getText()).toBe('"操作 成功"');
    });
  });

  describe("Complex Scenarios", () => {
    it("should parse Chinese in if conditions", () => {
      const code = `
        if (条件) {
          用户.执行操作()
        }
      `;
      const context = ProgContextFixture(code);
      const alt = context.block().stat(0).alt();
      expect(alt.ifBlock().parExpr().condition().getText()).toBe("条件");
    });

    it("should parse Chinese in loops", () => {
      const code = `
        while (循环条件) {
          处理器.执行()
        }
      `;
      const context = ProgContextFixture(code);
      const loop = context.block().stat(0).loop();
      expect(loop.parExpr().condition().getText()).toBe("循环条件");
    });

    it("should parse Chinese in assignments", () => {
      const context = ProgContextFixture('结果 = 服务.查询数据()');
      const message = context.block().stat(0).message();
      expect(message.messageBody().assignment().assignee().getText()).toBe("结果");
      expect(message.messageBody().to().getText()).toBe("服务");
      expect(message.messageBody().func().signature(0).methodName().getText()).toBe("查询数据");
    });

    it("should parse Chinese in creation statements", () => {
      const context = ProgContextFixture('订单 = new 订单对象()');
      const creation = context.block().stat(0).creation();
      expect(creation.creationBody().assignment().assignee().getText()).toBe("订单");
      expect(creation.creationBody().construct().getText()).toBe("订单对象");
    });

    it("should parse Chinese parameters", () => {
      const context = ProgContextFixture('服务.处理(参数一, 参数二)');
      const message = context.block().stat(0).message();
      const params = message.messageBody().func().signature(0).invocation().parameters();
      expect(params.parameter(0).getText()).toBe("参数一");
      expect(params.parameter(1).getText()).toBe("参数二");
    });

    it("should parse Chinese in async messages", () => {
      const context = ProgContextFixture('发送者->接收者: 消息内容');
      const asyncMsg = context.block().stat(0).asyncMessage();
      expect(asyncMsg.from().getText()).toBe("发送者");
      expect(asyncMsg.to().getText()).toBe("接收者");
    });
  });

  describe("Unicode Support for Other Languages", () => {
    it("should support Japanese characters", () => {
      const context = ProgContextFixture('ユーザー.ログイン()');
      const message = context.block().stat(0).message();
      expect(message.messageBody().to().getText()).toBe("ユーザー");
      expect(message.messageBody().func().signature(0).methodName().getText()).toBe("ログイン");
    });

    it("should support Korean characters", () => {
      const context = ProgContextFixture('사용자.로그인()');
      const message = context.block().stat(0).message();
      expect(message.messageBody().to().getText()).toBe("사용자");
      expect(message.messageBody().func().signature(0).methodName().getText()).toBe("로그인");
    });

    it("should support Arabic characters", () => {
      const context = ProgContextFixture('مستخدم.دخول()');
      const message = context.block().stat(0).message();
      expect(message.messageBody().to().getText()).toBe("مستخدم");
      expect(message.messageBody().func().signature(0).methodName().getText()).toBe("دخول");
    });

    it("should support Cyrillic characters", () => {
      const context = ProgContextFixture('Пользователь.Войти()');
      const message = context.block().stat(0).message();
      expect(message.messageBody().to().getText()).toBe("Пользователь");
      expect(message.messageBody().func().signature(0).methodName().getText()).toBe("Войти");
    });
  });

  describe("Backward Compatibility", () => {
    it("should still parse ASCII identifiers", () => {
      const context = ProgContextFixture('UserService.login()');
      const message = context.block().stat(0).message();
      expect(message.messageBody().to().getText()).toBe("UserService");
      expect(message.messageBody().func().signature(0).methodName().getText()).toBe("login");
    });

    it("should still parse underscores in identifiers", () => {
      const context = ProgContextFixture('user_service.get_data()');
      const message = context.block().stat(0).message();
      expect(message.messageBody().to().getText()).toBe("user_service");
      expect(message.messageBody().func().signature(0).methodName().getText()).toBe("get_data");
    });

    it("should still parse numbers in identifiers", () => {
      const context = ProgContextFixture('service123.method456()');
      const message = context.block().stat(0).message();
      expect(message.messageBody().to().getText()).toBe("service123");
      expect(message.messageBody().func().signature(0).methodName().getText()).toBe("method456");
    });
  });
});