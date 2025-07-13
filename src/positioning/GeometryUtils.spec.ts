import { describe, it, expect, beforeEach } from "vitest";
import { getParticipantCenter, calculateParticipantDistance, calculateParticipantDistance2 } from "./GeometryUtils";
import { Coordinates } from "./Coordinates";
import { stubWidthProvider } from "../../test/unit/parser/fixture/Fixture";
import { RootContext } from "@/parser";

describe("GeometryUtils", () => {
  let coordinates: Coordinates;
  
  beforeEach(() => {
    // 创建测试场景：A -> B
    const context = RootContext("A->B:message");
    coordinates = new Coordinates(context, stubWidthProvider);
  });

  describe("getParticipantCenter", () => {
    it("应该返回正确的参与者中心位置", () => {
      const participantA_center = getParticipantCenter("A", coordinates);
      const participantB_center = getParticipantCenter("B", coordinates);
      
      // 验证返回值是数字且大于0
      expect(typeof participantA_center).toBe("number");
      expect(typeof participantB_center).toBe("number");
      expect(participantA_center).toBeGreaterThan(0);
      expect(participantB_center).toBeGreaterThan(0);
      
      // B应该在A的右边
      expect(participantB_center).toBeGreaterThan(participantA_center);
    });

    it("应该处理不存在的参与者", () => {
      const nonExistent = getParticipantCenter("NonExistent", coordinates);
      expect(nonExistent).toBe(0);
    });

    it("应该处理undefined输入", () => {
      const undefined_result = getParticipantCenter("", coordinates);
      expect(undefined_result).toBe(0);
    });
  });

  describe("calculateParticipantDistance", () => {
    it("应该计算正确的距离", () => {
      // A到B的距离应该是负数（因为计算的是 A_center - B_center）
      const distanceAB = calculateParticipantDistance("A", "B", coordinates);
      expect(distanceAB).toBeLessThan(0);
      
      // B到A的距离应该是正数
      const distanceBA = calculateParticipantDistance("B", "A", coordinates);
      expect(distanceBA).toBeGreaterThan(0);
      
      // 两个距离应该是相反数
      expect(distanceAB).toBe(-distanceBA);
    });
  });

  describe("calculateParticipantDistance2", () => {
    it("应该计算正确的距离（相反方向）", () => {
      // A到B的distance2应该是正数（因为计算的是 B_center - A_center）
      const distance2AB = calculateParticipantDistance2("A", "B", coordinates);
      expect(distance2AB).toBeGreaterThan(0);
      
      // B到A的distance2应该是负数
      const distance2BA = calculateParticipantDistance2("B", "A", coordinates);
      expect(distance2BA).toBeLessThan(0);
      
      // 两个距离应该是相反数
      expect(distance2AB).toBe(-distance2BA);
    });

    it("应该处理空参数", () => {
      const empty = calculateParticipantDistance2("", "", coordinates);
      expect(empty).toBe(0);
    });
  });
});