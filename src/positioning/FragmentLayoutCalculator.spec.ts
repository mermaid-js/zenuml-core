import { describe, it, expect, beforeEach } from "vitest";
import { FragmentLayoutCalculator } from "./FragmentLayoutCalculator";
import { Coordinates } from "./Coordinates";
import { stubWidthProvider } from "../../test/unit/parser/fixture/Fixture";
import { RootContext } from "@/parser";

describe("FragmentLayoutCalculator", () => {
  let coordinates: Coordinates;
  let calculator: FragmentLayoutCalculator;

  beforeEach(() => {
    // 创建包含Fragment的测试场景
    const context = RootContext(`
      A->B: message1
      opt condition
        B->C: message2
      end
    `);
    coordinates = new Coordinates(context, stubWidthProvider);
    calculator = new FragmentLayoutCalculator(coordinates);
  });

  describe("extractFragmentGeometry", () => {
    it("应该正确提取Fragment几何数据", () => {
      const context = RootContext("opt condition\nA->B: message\nend");
      const optFragment = context.block().stat()[0].opt();
      
      const geometry = calculator.extractFragmentGeometry(optFragment, "A");
      
      expect(geometry.leftParticipant.name).toBeDefined();
      expect(geometry.rightParticipant.name).toBeDefined();
      expect(geometry.localParticipants.length).toBeGreaterThan(0);
      expect(geometry.borderDepth).toBeGreaterThanOrEqual(1);
      expect(geometry.origin.name).toBe("A");
    });
  });

  describe("calculateFragmentLayout", () => {
    it("应该计算Fragment的完整布局", () => {
      const context = RootContext("opt condition\nA->B: message\nend");
      const optFragment = context.block().stat()[0].opt();
      
      const layout = calculator.calculateFragmentLayout(optFragment, "A");
      
      expect(layout.offsetX).toBeDefined();
      expect(layout.paddingLeft).toBeDefined();
      expect(layout.borderPadding.left).toBeGreaterThanOrEqual(10); // 至少10px
      expect(layout.borderPadding.right).toBeGreaterThanOrEqual(10);
      expect(layout.dimensions.width).toBeGreaterThan(0);
      expect(layout.transform).toContain("translateX");
    });
  });

  describe("generateFragmentStyle", () => {
    it("应该生成正确的CSS样式对象", () => {
      const context = RootContext("opt condition\nA->B: message\nend");
      const optFragment = context.block().stat()[0].opt();
      
      const style = calculator.generateFragmentStyle(optFragment, "A");
      
      expect(style).toHaveProperty("transform");
      expect(style).toHaveProperty("width");
      expect(style).toHaveProperty("minWidth");
      expect(style.minWidth).toBe("100px"); // FRAGMENT_MIN_WIDTH
    });
  });

  describe("辅助方法", () => {
    let optFragment: any;
    
    beforeEach(() => {
      const context = RootContext("opt condition\nA->B: message\nend");
      optFragment = context.block().stat()[0].opt();
    });

    it("getFragmentPaddingLeft 应该返回正确的左边距", () => {
      const paddingLeft = calculator.getFragmentPaddingLeft(optFragment);
      expect(typeof paddingLeft).toBe("number");
      expect(paddingLeft).toBeGreaterThan(0);
    });

    it("getFragmentOffset 应该返回正确的偏移量", () => {
      const offset = calculator.getFragmentOffset(optFragment, "A");
      expect(typeof offset).toBe("number");
    });

    it("getFragmentBorder 应该返回正确的边界信息", () => {
      const border = calculator.getFragmentBorder(optFragment);
      expect(border.left).toBeGreaterThanOrEqual(10); // 至少10px
      expect(border.right).toBeGreaterThanOrEqual(10);
      expect(border.left).toBe(border.right); // 对称边界
    });

    it("getLeftParticipantName 应该返回最左参与者名称", () => {
      const leftParticipant = calculator.getLeftParticipantName(optFragment);
      expect(typeof leftParticipant).toBe("string");
      expect(leftParticipant.length).toBeGreaterThan(0);
    });
  });

  describe("错误处理", () => {
    it("应该处理没有本地参与者的Fragment", () => {
      // 创建一个只有外部参与者的Fragment（虽然这种情况在实际中很少见）
      const context = RootContext("opt condition\nend"); // 空Fragment
      const optFragment = context.block().stat()[0].opt();
      
      // 由于我们的实现会提供默认处理，这里检查是否能够正常处理
      const geometry = calculator.extractFragmentGeometry(optFragment, "_STARTER_");
      expect(geometry).toBeDefined();
      expect(geometry.borderDepth).toBeGreaterThanOrEqual(1);
    });
  });
});