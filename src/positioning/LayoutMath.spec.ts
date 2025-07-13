import { describe, it, expect } from "vitest";
import { LayoutMath } from "./LayoutMath";
import { ParticipantGeometry, MessageGeometry } from "./GeometryTypes";

describe("LayoutMath", () => {
  // Test participant geometry data
  const participantA: ParticipantGeometry = {
    name: "A",
    centerPosition: 100,
    halfWidth: 50,
    activationLayers: 0,
  };

  const participantB: ParticipantGeometry = {
    name: "B",
    centerPosition: 300,
    halfWidth: 50,
    activationLayers: 1,
  };

  const participantC: ParticipantGeometry = {
    name: "C",
    centerPosition: 500,
    halfWidth: 60,
    activationLayers: 2,
  };

  describe("Basic Distance Calculations", () => {
    it("participantDistance should calculate correct distance", () => {
      expect(LayoutMath.participantDistance(participantA, participantB)).toBe(200); // 300 - 100
      expect(LayoutMath.participantDistance(participantB, participantA)).toBe(-200); // 100 - 300
      expect(LayoutMath.participantDistance(participantA, participantA)).toBe(0); // Same participant
    });

    it("interactionWidth should calculate interaction width", () => {
      const width = LayoutMath.interactionWidth(participantA, participantB);
      expect(typeof width).toBe("number");
      expect(width).toBeGreaterThan(0);
    });
  });

  describe("Participant Layout Calculations", () => {
    it("participantLeft should calculate left boundary", () => {
      expect(LayoutMath.participantLeft(participantA)).toBe(50); // 100 - 50
      expect(LayoutMath.participantLeft(participantB)).toBe(250); // 300 - 50
    });

    it("participantRight should calculate right boundary", () => {
      expect(LayoutMath.participantRight(participantA)).toBe(150); // 100 + 50
      expect(LayoutMath.participantRight(participantC)).toBe(560); // 500 + 60
    });

    it("participantWidth should calculate full width", () => {
      expect(LayoutMath.participantWidth(participantA)).toBe(100); // 50 * 2
      expect(LayoutMath.participantWidth(participantC)).toBe(120); // 60 * 2
    });
  });

  describe("Fragment Layout Calculations", () => {
    it("fragmentBorderPadding should calculate border padding", () => {
      const padding1 = LayoutMath.fragmentBorderPadding(1);
      const padding2 = LayoutMath.fragmentBorderPadding(2);
      
      expect(padding1.left).toBe(10); // FRAGMENT_PADDING_X * 1
      expect(padding1.right).toBe(10);
      expect(padding2.left).toBe(20); // FRAGMENT_PADDING_X * 2
      expect(padding2.right).toBe(20);
    });

    it("fragmentBaseOffset should calculate base offset", () => {
      const offset = LayoutMath.fragmentBaseOffset(participantA, 1);
      expect(offset).toBe(60); // 10 (border) + 50 (half width)
    });

    it("fragmentTotalOffset should calculate total offset", () => {
      // Same participant case
      const sameParticipantOffset = LayoutMath.fragmentTotalOffset(participantA, participantA, 1);
      expect(sameParticipantOffset).toBe(60); // Should equal base offset

      // Different participant case
      const crossParticipantOffset = LayoutMath.fragmentTotalOffset(participantA, participantB, 1);
      expect(typeof crossParticipantOffset).toBe("number");
    });
  });

  describe("Width Calculations", () => {
    it("participantSpanWidth should calculate participant span width", () => {
      const spanWidth = LayoutMath.participantSpanWidth(participantA, participantB);
      expect(spanWidth).toBe(300); // 200 (distance) + 50 (A half) + 50 (B half)
    });

    it("fragmentTotalWidth should calculate Fragment total width", () => {
      const totalWidth = LayoutMath.fragmentTotalWidth(participantA, participantB, 1, 0);
      expect(totalWidth).toBeGreaterThan(100); // Should be greater than minimum width
      expect(totalWidth).toBe(320); // 300 (span) + 20 (border padding)
    });

    it("fragmentTotalWidth should use minimum width", () => {
      // Create a very small participant span
      const smallA: ParticipantGeometry = {
        name: "SmallA",
        centerPosition: 10,
        halfWidth: 5,
        activationLayers: 0,
      };
      const smallB: ParticipantGeometry = {
        name: "SmallB",
        centerPosition: 20,
        halfWidth: 5,
        activationLayers: 0,
      };

      const totalWidth = LayoutMath.fragmentTotalWidth(smallA, smallB, 1, 0);
      expect(totalWidth).toBe(100); // Should use FRAGMENT_MIN_WIDTH
    });
  });

  describe("Message Width Calculations", () => {
    it("messageWidth should calculate normal message width", () => {
      const messageGeometry: MessageGeometry = {
        from: participantA,
        to: participantB,
        textWidth: 50,
        messageType: "normal",
      };

      const width = LayoutMath.messageWidth(messageGeometry);
      expect(width).toBe(50); // 50 (text only, arrows/occurrence handled separately)
    });

    it("messageWidth should add extra width for creation messages", () => {
      const creationMessageGeometry: MessageGeometry = {
        from: participantA,
        to: participantB,
        textWidth: 50,
        messageType: "creation",
      };

      const width = LayoutMath.messageWidth(creationMessageGeometry);
      expect(width).toBe(100); // 50 (text) + 50 (target half width), arrows/occurrence handled separately
    });

    it("messageWidthWithVisualElements should include arrows and occurrence", () => {
      const messageGeometry: MessageGeometry = {
        from: participantA,
        to: participantB,
        textWidth: 50,
        messageType: "normal",
      };

      const width = LayoutMath.messageWidthWithVisualElements(messageGeometry);
      expect(width).toBe(75); // 50 (text) + 10 (arrow) + 15 (occurrence)
    });

    it("messageWidthWithVisualElements should work with creation messages", () => {
      const creationMessageGeometry: MessageGeometry = {
        from: participantA,
        to: participantB,
        textWidth: 50,
        messageType: "creation",
      };

      const width = LayoutMath.messageWidthWithVisualElements(creationMessageGeometry);
      expect(width).toBe(125); // 50 (text) + 50 (target half width) + 10 (arrow) + 15 (occurrence)
    });
  });

  describe("Direction Utilities", () => {
    it("isRightToLeft should correctly determine direction", () => {
      expect(LayoutMath.isRightToLeft(participantA, participantB)).toBe(false); // A->B left to right
      expect(LayoutMath.isRightToLeft(participantB, participantA)).toBe(true);  // B->A right to left
      expect(LayoutMath.isRightToLeft(participantA, participantA)).toBe(false); // Same participant
    });

    it("isSelfMessage should correctly determine self message", () => {
      expect(LayoutMath.isSelfMessage(participantA, participantA)).toBe(true);
      expect(LayoutMath.isSelfMessage(participantA, participantB)).toBe(false);
    });
  });

  describe("Helper Calculation Methods", () => {
    it("generateTransformCSS should generate correct CSS string", () => {
      expect(LayoutMath.generateTransformCSS(100)).toBe("translateX(100px)");
      expect(LayoutMath.generateTransformCSS(-50)).toBe("translateX(-50px)");
      expect(LayoutMath.generateTransformCSS(0)).toBe("translateX(0px)");
    });
  });
});