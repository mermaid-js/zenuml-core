import { describe, it, expect, beforeEach } from "vitest";
import { LayoutEngine } from "./LayoutEngine";
import { LayoutGeometry, ParticipantGeometry, MessageGeometry, FragmentGeometry } from "../geometry/LayoutGeometry";

describe("LayoutEngine", () => {
  let engine: LayoutEngine;
  let mockGeometry: LayoutGeometry;

  beforeEach(() => {
    engine = new LayoutEngine();
    
    // Create mock geometry data
    const participants: ParticipantGeometry[] = [
      {
        name: "A",
        centerPosition: 100,
        width: 80,
        labelWidth: 20,
        activationStack: [
          { messageIndex: 0, depth: 0, isActive: true },
          { messageIndex: 1, depth: 1, isActive: true }
        ]
      },
      {
        name: "B", 
        centerPosition: 200,
        width: 80,
        labelWidth: 20,
        activationStack: [
          { messageIndex: 0, depth: 0, isActive: false },
          { messageIndex: 1, depth: 0, isActive: true }
        ]
      }
    ];

    const messages: MessageGeometry[] = [
      {
        index: 0,
        id: "msg_0",
        type: "sync",
        source: "A",
        target: "B",
        isSelfCall: false
      },
      {
        index: 1,
        id: "msg_1", 
        type: "return",
        source: "B",
        target: "A",
        isSelfCall: false
      }
    ];

    const fragments: FragmentGeometry[] = [
      {
        id: "frag_0",
        type: "alt",
        startMessageIndex: 0,
        endMessageIndex: 1,
        participants: ["A", "B"],
        nestedFragments: [],
        condition: "x > 0"
      }
    ];

    mockGeometry = {
      participants,
      messages,
      fragments,
      metadata: {
        totalMessages: 2,
        totalParticipants: 2,
        maxActivationDepth: 1,
        hasFragments: true,
        diagramWidth: 200,
        diagramHeight: 100
      }
    };
  });

  describe("calculateAnchors", () => {
    it("should calculate anchors for all participants at all message indices", () => {
      const anchors = engine.calculateAnchors(mockGeometry);

      expect(anchors.size).toBe(2); // Two participants
      expect(anchors.get("A")?.size).toBe(2); // Two message indices
      expect(anchors.get("B")?.size).toBe(2);
      
      // Check that anchors are properly positioned
      const anchorA0 = anchors.get("A")?.get(0);
      const anchorB0 = anchors.get("B")?.get(0);
      
      expect(anchorA0).toBeDefined();
      expect(anchorB0).toBeDefined();
    });
  });

  describe("calculateFragmentBounds", () => {
    it("should calculate fragment bounds correctly", () => {
      const anchors = engine.calculateAnchors(mockGeometry);
      const fragment = mockGeometry.fragments[0];
      
      const bounds = engine.calculateFragmentBounds(fragment, anchors);

      expect(bounds.left).toBeDefined();
      expect(bounds.right).toBeDefined();
      expect(bounds.width).toBeDefined();
      expect(bounds.offsetX).toBeDefined();
      expect(bounds.paddingLeft).toBeDefined();
      expect(bounds.minWidth).toBe(100); // FRAGMENT_MIN_WIDTH
    });

    it("should throw error for fragment with no anchors", () => {
      const anchors = new Map();
      const fragment = mockGeometry.fragments[0];
      
      expect(() => {
        engine.calculateFragmentBounds(fragment, anchors);
      }).toThrow("No anchors found for fragment frag_0");
    });
  });

  describe("calculateArrowLayout", () => {
    it("should calculate arrow layout correctly", () => {
      const anchors = engine.calculateAnchors(mockGeometry);
      const message = mockGeometry.messages[0];
      
      const layout = engine.calculateArrowLayout(message, "A", anchors, mockGeometry);

      expect(layout.interactionWidth).toBeGreaterThan(0);
      expect(layout.rightToLeft).toBe(false); // A to B is left to right
      expect(layout.translateX).toBeDefined();
      expect(layout.isSelf).toBe(false);
    });

    it("should detect right-to-left direction", () => {
      const anchors = engine.calculateAnchors(mockGeometry);
      const message = mockGeometry.messages[1]; // B to A
      
      const layout = engine.calculateArrowLayout(message, "B", anchors, mockGeometry);

      expect(layout.rightToLeft).toBe(true); // B to A is right to left
    });

    it("should throw error for missing anchors", () => {
      const anchors = new Map();
      const message = mockGeometry.messages[0];
      
      expect(() => {
        engine.calculateArrowLayout(message, "A", anchors, mockGeometry);
      }).toThrow("Missing anchors for message msg_0");
    });
  });

  describe("calculateCompleteLayout", () => {
    it("should calculate complete layout for entire diagram", () => {
      const layout = engine.calculateCompleteLayout(mockGeometry);

      expect(layout.anchors.size).toBe(2);
      expect(layout.fragmentBounds).toHaveLength(1);
      expect(layout.arrowLayouts).toHaveLength(2);
      expect(layout.metadata).toBe(mockGeometry.metadata);
    });

    it("should produce consistent results on multiple calls", () => {
      const layout1 = engine.calculateCompleteLayout(mockGeometry);
      const layout2 = engine.calculateCompleteLayout(mockGeometry);

      // Should produce identical results (pure function)
      expect(layout1.fragmentBounds[0].bounds.width)
        .toBe(layout2.fragmentBounds[0].bounds.width);
      expect(layout1.arrowLayouts[0].layout.translateX)
        .toBe(layout2.arrowLayouts[0].layout.translateX);
    });
  });
});