import { describe, it, expect, beforeEach } from "vitest";
import { ParticipantGeometryExtractor } from "./ParticipantGeometryExtractor";
import { Coordinates } from "./Coordinates";
import { stubWidthProvider } from "../../test/unit/parser/fixture/Fixture";
import { RootContext } from "@/parser";

describe("ParticipantGeometryExtractor", () => {
  let coordinates: Coordinates;
  let extractor: ParticipantGeometryExtractor;

  beforeEach(() => {
    // 创建简单的测试场景：A -> B
    const context = RootContext("A->B:message");
    coordinates = new Coordinates(context, stubWidthProvider);
    extractor = new ParticipantGeometryExtractor(coordinates);
  });

  describe("extractParticipant", () => {
    it("应该提取单个参与者的几何数据", () => {
      const geometry = extractor.extractParticipant("A");
      
      expect(geometry.name).toBe("A");
      expect(geometry.centerPosition).toBeGreaterThan(0);
      expect(geometry.halfWidth).toBeGreaterThan(0);
      expect(geometry.activationLayers).toBe(0); // 没有context时应该为0
    });

    it("应该处理不存在的参与者", () => {
      const geometry = extractor.extractParticipant("NonExistent");
      
      expect(geometry.name).toBe("NonExistent");
      expect(geometry.centerPosition).toBe(0); // Coordinates.getPosition 返回0
      expect(geometry.halfWidth).toBe(0); // Coordinates.half 返回0
    });
  });

  describe("extractParticipants", () => {
    it("应该提取多个参与者的几何数据", () => {
      const geometries = extractor.extractParticipants(["A", "B"]);
      
      expect(geometries).toHaveLength(2);
      expect(geometries[0].name).toBe("A");
      expect(geometries[1].name).toBe("B");
      expect(geometries[1].centerPosition).toBeGreaterThan(geometries[0].centerPosition);
    });
  });

  describe("extractAllParticipants", () => {
    it("应该提取所有参与者的几何数据", () => {
      const geometries = extractor.extractAllParticipants();
      
      expect(geometries.length).toBeGreaterThanOrEqual(2); // 至少包含A和B
      expect(geometries.some(g => g.name === "A")).toBe(true);
      expect(geometries.some(g => g.name === "B")).toBe(true);
    });
  });

  describe("静态工具方法", () => {
    it("findParticipant 应该根据名称查找参与者", () => {
      const geometries = extractor.extractParticipants(["A", "B"]);
      
      const foundA = ParticipantGeometryExtractor.findParticipant("A", geometries);
      const foundNonExistent = ParticipantGeometryExtractor.findParticipant("C", geometries);
      
      expect(foundA?.name).toBe("A");
      expect(foundNonExistent).toBeUndefined();
    });

    it("getLeftmostParticipant 应该返回最左边的参与者", () => {
      const geometries = extractor.extractParticipants(["A", "B"]);
      
      const leftmost = ParticipantGeometryExtractor.getLeftmostParticipant(geometries);
      
      expect(leftmost?.name).toBe("A"); // A应该在B的左边
    });

    it("getRightmostParticipant 应该返回最右边的参与者", () => {
      const geometries = extractor.extractParticipants(["A", "B"]);
      
      const rightmost = ParticipantGeometryExtractor.getRightmostParticipant(geometries);
      
      expect(rightmost?.name).toBe("B"); // B应该在A的右边
    });
  });

  describe("hasParticipant", () => {
    it("应该正确检查参与者是否存在", () => {
      expect(extractor.hasParticipant("A")).toBe(true);
      expect(extractor.hasParticipant("B")).toBe(true);
      expect(extractor.hasParticipant("NonExistent")).toBe(false);
    });
  });
});