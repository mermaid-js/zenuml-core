import { buildParticipantVM, buildParticipantsVM } from "./participants";
import { IRParticipant } from "@/ir/participants";
import { _STARTER_ } from "@/constants";

describe("ParticipantVM", () => {
  describe("buildParticipantVM", () => {
    it("should build VM for regular participant", () => {
      const participant: IRParticipant = {
        name: "User",
        label: "User Service",
        type: "actor",
        explicit: true,
        isStarter: false,
        color: "#ff0000",
        stereotype: "service",
        groupId: "group1",
        assignee: undefined,
        positions: [[10, 15], [5, 8]],
        assigneePositions: [[20, 25]],
      };

      const vm = buildParticipantVM(participant);

      expect(vm.name).toBe("User");
      expect(vm.displayName).toBe("User Service");
      expect(vm.isDefaultStarter).toBe(false);
      expect(vm.label).toBe("User Service");
      expect(vm.type).toBe("actor");
      expect(vm.stereotype).toBe("service");
      expect(vm.color).toBe("#ff0000");
      expect(vm.backgroundColor).toBeDefined();
      expect(vm.icon).toBeDefined();
      expect(vm.style).toEqual(
        expect.objectContaining({
          icon: vm.icon,
          backgroundColor: vm.backgroundColor,
        }),
      );
      expect(vm.explicit).toBe(true);
      expect(vm.isStarter).toBe(false);
      expect(vm.groupId).toBe("group1");
      // Positions should be sorted by start position descending
      expect(vm.labelPositions).toEqual([[10, 15], [5, 8]]);
      expect(vm.assigneePositions).toEqual([[20, 25]]);
    });

    it("should build VM for starter participant", () => {
      const participant: IRParticipant = {
        name: _STARTER_,
        explicit: false,
        isStarter: true,
        positions: [],
        assigneePositions: [],
      };

      const vm = buildParticipantVM(participant);

      expect(vm.name).toBe(_STARTER_);
      expect(vm.isDefaultStarter).toBe(true);
      expect(vm.displayName).toBe(_STARTER_);
      expect(vm.icon).toBeDefined(); // Should get actor icon
      expect(vm.style?.icon).toBe(vm.icon);
      expect(vm.explicit).toBe(false);
      expect(vm.isStarter).toBe(true);
    });

    it("should build VM for participant with assignee", () => {
      const participant: IRParticipant = {
        name: "user:User",
        assignee: "user",
        positions: [],
        assigneePositions: [],
      };

      const vm = buildParticipantVM(participant);

      expect(vm.name).toBe("user:User");
      expect(vm.displayName).toBe("User"); // Should extract after colon
      expect(vm.assignee).toBe("user");
    });

    it("should handle participant without label", () => {
      const participant: IRParticipant = {
        name: "Database",
        positions: [],
        assigneePositions: [],
      };

      const vm = buildParticipantVM(participant);

      expect(vm.displayName).toBe("Database"); // Should use name when no label
    });

    it("should sort positions correctly", () => {
      const participant: IRParticipant = {
        name: "Test",
        positions: [[5, 8], [15, 20], [10, 12]],
        assigneePositions: [[25, 30], [20, 22]],
      };

      const vm = buildParticipantVM(participant);

      // Should be sorted by start position descending
      expect(vm.labelPositions).toEqual([[15, 20], [10, 12], [5, 8]]);
      expect(vm.assigneePositions).toEqual([[25, 30], [20, 22]]);
    });


    it("should handle regular alphanumeric characters", () => {
      const participant: IRParticipant = {
        name: "User123_Test-Name",
        positions: [],
        assigneePositions: [],
      };

      const vm = buildParticipantVM(participant);
      expect(vm.name).toBe("User123_Test-Name");
    });

    it("should handle starter participant", () => {
      const participant: IRParticipant = {
        name: _STARTER_,
        positions: [],
        assigneePositions: [],
      };

      const vm = buildParticipantVM(participant);
      expect(vm.name).toBe(_STARTER_);
      expect(vm.isDefaultStarter).toBe(true);
    });
  });

  describe("buildParticipantsVM", () => {
    it("should build VMs for multiple participants", () => {
      const participants: IRParticipant[] = [
        {
          name: "User",
          label: "User Service",
          positions: [],
          assigneePositions: [],
        },
        {
          name: _STARTER_,
          isStarter: true,
          positions: [],
          assigneePositions: [],
        },
      ];

      const vms = buildParticipantsVM(participants);

      expect(vms).toHaveLength(2);
      expect(vms[0].name).toBe("User");
      expect(vms[0].displayName).toBe("User Service");
      expect(vms[1].name).toBe(_STARTER_);
      expect(vms[1].isDefaultStarter).toBe(true);
    });

    it("should handle empty participants array", () => {
      const vms = buildParticipantsVM([]);
      expect(vms).toEqual([]);
    });
  });
});
