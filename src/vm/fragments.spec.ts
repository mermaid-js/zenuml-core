import { buildRefVM, buildConditionVM, extractFragmentData, buildFragmentPositioningVM } from "./fragments";
import { Fixture } from "../../test/unit/parser/fixture/Fixture";
import { Coordinates } from "@/positioning/Coordinates";

describe("Fragment VMs", () => {
  describe("RefVM", () => {
    it("should build RefVM from ref context", () => {
      const context = Fixture.firstStatement("ref(A, B)");
      const refVM = buildRefVM(context);

      expect(refVM).toBeDefined();
      expect(refVM!.labelText).toBe("A");
      expect(refVM!.labelRange).toEqual([4, 4]); // Position of 'A'
      // id removed; stability relies on label range + code range
    });

    it("should handle empty ref context", () => {
      const refVM = buildRefVM(null);
      expect(refVM).toBeNull();
    });

    it("should handle ref with quoted content", () => {
      const context = Fixture.firstStatement('ref("test content")');
      const refVM = buildRefVM(context);

      expect(refVM).toBeDefined();
      expect(refVM!.labelText).toBe("test content");
      expect(refVM!.labelRange).toEqual([4, 17]); // Position of quoted content
    });
  });

  describe("ConditionVM", () => {
    it("should build ConditionVM from condition context", () => {
      const context = Fixture.firstStatement("if(x == y) { A.m }").alt().ifBlock().parExpr().condition();
      const conditionVM = buildConditionVM(context);

      expect(conditionVM).toBeDefined();
      expect(conditionVM!.labelText).toBe("x == y");
      expect(conditionVM!.labelRange).toEqual([3, 8]); // Position of 'x == y'
      // id removed; stability relies on label range + code range
    });

    it("should handle null condition context", () => {
      const conditionVM = buildConditionVM(null);
      expect(conditionVM).toBeNull();
    });

    it("should handle complex condition", () => {
      const context = Fixture.firstStatement('if("test" == value) { A.m }').alt().ifBlock().parExpr().condition();
      const conditionVM = buildConditionVM(context);

      expect(conditionVM).toBeDefined();
      expect(conditionVM!.labelText).toBe('"test" == value');
      expect(conditionVM!.labelRange).toEqual([3, 17]); // Position of condition
    });
  });

  describe("TotalWidthFromData", () => {
    // Mock coordinates for testing
    const createMockCoordinates = (participants: string[]): Coordinates => {
      const positions: Record<string, number> = {};
      participants.forEach((p, index) => {
        positions[p] = 50 + index * 100; // Each participant 100px apart
      });

      return {
        orderedParticipantNames: () => participants,
        distance: (from: string, to: string) => {
          const fromIndex = participants.indexOf(from);
          const toIndex = participants.indexOf(to);
          if (fromIndex === -1 || toIndex === -1) return 0;
          return Math.abs(positions[to] - positions[from]);
        },
        half: (participant: string) => 50, // Each participant is 100px wide, so half is 50px
        getMessageWidth: () => 100,
      } as Coordinates;
    };

    // Mock frame for testing
    const createMockFrame = (left: number = 10, right: number = 10) => ({
      left,
      right,
    });

    it("should calculate width for single participant fragment", () => {
      const participants = ["A", "B", "C"];
      const coordinates = createMockCoordinates(participants);
      const frame = createMockFrame();

      const fragmentData = {
        type: "alt" as const,
        localParticipantNames: ["A"],
        frameId: "test-frame",
        participantLayers: { A: 0 },
      };

      const vm = buildFragmentPositioningVM(fragmentData, "A", coordinates, { byId: { "test-frame": frame } });
      
      // Width should be: participant width (0 distance + 50 half left + 50 half right) + border (10 + 10) = 120
      expect(vm.fragmentStyle.width).toBe("120px");
    });

    it("should calculate width for two participant fragment", () => {
      const participants = ["A", "B", "C"];
      const coordinates = createMockCoordinates(participants);
      const frame = createMockFrame();

      const fragmentData = {
        type: "alt" as const,
        localParticipantNames: ["A", "B"],
        frameId: "test-frame",
        participantLayers: { A: 0, B: 0 },
      };

      const vm = buildFragmentPositioningVM(fragmentData, "A", coordinates, { byId: { "test-frame": frame } });
      
      // Width should be: participant width (100 distance + 50 half left + 50 half right) + border (10 + 10) = 220
      expect(vm.fragmentStyle.width).toBe("220px");
    });

    it("should calculate width for three participant fragment", () => {
      const participants = ["A", "B", "C"];
      const coordinates = createMockCoordinates(participants);
      const frame = createMockFrame();

      const fragmentData = {
        type: "alt" as const,
        localParticipantNames: ["A", "B", "C"],
        frameId: "test-frame",
        participantLayers: { A: 0, B: 0, C: 0 },
      };

      const vm = buildFragmentPositioningVM(fragmentData, "A", coordinates, { byId: { "test-frame": frame } });
      
      // Width should be: participant width (200 distance + 50 half left + 50 half right) + border (10 + 10) = 320
      expect(vm.fragmentStyle.width).toBe("320px");
    });

    it("should find correct rightmost participant for non-contiguous participants", () => {
      const participants = ["A", "B", "C", "D"];
      const coordinates = createMockCoordinates(participants);
      const frame = createMockFrame();

      const fragmentData = {
        type: "alt" as const,
        localParticipantNames: ["A", "C"], // Non-contiguous participants
        frameId: "test-frame",
        participantLayers: { A: 0, C: 0 },
      };

      const vm = buildFragmentPositioningVM(fragmentData, "A", coordinates, { byId: { "test-frame": frame } });
      
      // Width should be: participant width (200 distance between A and C + 50 half left + 50 half right) + border (10 + 10) = 320
      expect(vm.fragmentStyle.width).toBe("320px");
    });

    it("should handle empty participant list", () => {
      const participants = ["A", "B", "C"];
      const coordinates = createMockCoordinates(participants);
      const frame = createMockFrame();

      const fragmentData = {
        type: "alt" as const,
        localParticipantNames: [],
        frameId: "test-frame",
        participantLayers: {},
      };

      const vm = buildFragmentPositioningVM(fragmentData, "A", coordinates, { byId: { "test-frame": frame } });
      
      // Width should be: minimum width (100) + border (10 + 10) = 120
      expect(vm.fragmentStyle.width).toBe("120px");
    });

    it("should respect minimum width constraint", () => {
      const participants = ["A", "B"];
      const coordinates = createMockCoordinates(participants);
      const frame = createMockFrame(5, 5); // Small borders

      const fragmentData = {
        type: "alt" as const,
        localParticipantNames: ["A", "B"],
        frameId: "test-frame",
        participantLayers: { A: 0, B: 0 },
      };

      const vm = buildFragmentPositioningVM(fragmentData, "A", coordinates, { byId: { "test-frame": frame } });
      
      // Width should be: participant width (100 distance + 50 half left + 50 half right) + border (5 + 5) = 220
      expect(vm.fragmentStyle.width).toBe("220px");
    });

    it("should work with different fragment types", () => {
      const participants = ["A", "B"];
      const coordinates = createMockCoordinates(participants);
      const frame = createMockFrame();

      const fragmentTypes = ["alt", "loop", "par", "opt", "section", "critical", "tcf", "ref"] as const;
      
      fragmentTypes.forEach(type => {
        const fragmentData = {
          type,
          localParticipantNames: ["A", "B"],
          frameId: "test-frame",
          participantLayers: { A: 0, B: 0 },
        };

        const vm = buildFragmentPositioningVM(fragmentData, "A", coordinates, { byId: { "test-frame": frame } });
        
        // All fragment types should calculate the same width for the same participants
        expect(vm.fragmentStyle.width).toBe("220px");
      });
    });
  });
});
