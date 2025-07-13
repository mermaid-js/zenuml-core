import { describe, it, expect } from "vitest";
import { UnifiedAnchor } from "./UnifiedAnchor";
import { ParticipantGeometry } from "./GeometryTypes";

describe("UnifiedAnchor", () => {
  // 创建测试用的参与者几何数据
  const geometryA: ParticipantGeometry = {
    name: "A",
    centerPosition: 100,
    halfWidth: 50,
    activationLayers: 0,
  };

  const geometryB: ParticipantGeometry = {
    name: "B",
    centerPosition: 300,
    halfWidth: 50,
    activationLayers: 2,
  };

  describe("基础功能", () => {
    it("应该正确创建锚点", () => {
      const anchor = new UnifiedAnchor(geometryA);
      
      expect(anchor.getParticipantName()).toBe("A");
      expect(anchor.getCenterPosition()).toBe(100);
      expect(anchor.getActivationLayers()).toBe(0);
    });

    it("应该返回正确的锚点几何数据", () => {
      const anchor = new UnifiedAnchor(geometryA);
      const anchorGeometry = anchor.getAnchorGeometry();
      
      expect(anchorGeometry.position).toBe(100);
      expect(anchorGeometry.layers).toBe(0);
    });
  });

  describe("距离计算", () => {
    it("应该计算中心到中心的距离", () => {
      const anchorA = new UnifiedAnchor(geometryA);
      const anchorB = new UnifiedAnchor(geometryB);
      
      const distance = anchorA.centerToCenter(anchorB);
      
      // B的中心位置（300）+ B的激活层偏移 - A的中心位置（100）
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBe(anchorB.centerOfRightWall() - anchorA.centerOfRightWall());
    });

    it("应该计算边缘偏移量", () => {
      const anchorA = new UnifiedAnchor(geometryA);
      const anchorB = new UnifiedAnchor(geometryB);
      
      const edgeOffset = anchorA.edgeOffset(anchorB);
      
      expect(typeof edgeOffset).toBe("number");
      // 应该考虑激活层的影响
    });
  });

  describe("静态工厂方法", () => {
    it("fromParticipantGeometry 应该创建锚点", () => {
      const anchor = UnifiedAnchor.fromParticipantGeometry(geometryA);
      
      expect(anchor.getParticipantName()).toBe("A");
      expect(anchor.getCenterPosition()).toBe(100);
    });

    it("fromParticipantGeometries 应该创建锚点数组", () => {
      const anchors = UnifiedAnchor.fromParticipantGeometries([geometryA, geometryB]);
      
      expect(anchors).toHaveLength(2);
      expect(anchors[0].getParticipantName()).toBe("A");
      expect(anchors[1].getParticipantName()).toBe("B");
    });
  });

  describe("静态计算方法", () => {
    it("isRightToLeft 应该正确判断方向", () => {
      const anchorA = new UnifiedAnchor(geometryA); // 位置100
      const anchorB = new UnifiedAnchor(geometryB); // 位置300
      
      expect(UnifiedAnchor.isRightToLeft(anchorA, anchorB)).toBe(false); // A->B 从左到右
      expect(UnifiedAnchor.isRightToLeft(anchorB, anchorA)).toBe(true);  // B->A 从右到左
    });

    it("distance 应该计算两个锚点之间的距离", () => {
      const anchorA = new UnifiedAnchor(geometryA);
      const anchorB = new UnifiedAnchor(geometryB);
      
      expect(UnifiedAnchor.distance(anchorA, anchorB)).toBe(200); // 300 - 100
      expect(UnifiedAnchor.distance(anchorB, anchorA)).toBe(-200); // 100 - 300
    });
  });

  describe("墙位置计算", () => {
    it("应该返回正确的墙位置", () => {
      const anchor = new UnifiedAnchor(geometryB); // 有激活层的参与者
      
      const centerOfWall = anchor.centerOfRightWall();
      const rightEdge = anchor.rightEdgeOfRightWall();
      const leftEdge = anchor.leftEdgeOfRightWall();
      
      expect(rightEdge).toBeGreaterThan(centerOfWall);
      expect(centerOfWall).toBeGreaterThan(leftEdge);
      expect(centerOfWall).toBeGreaterThan(geometryB.centerPosition); // 有激活层时应该偏移
    });
  });
});