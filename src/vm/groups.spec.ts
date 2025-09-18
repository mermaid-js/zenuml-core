import { describe, it, expect } from "bun:test";
import { buildGroupVM, buildGroupsVM } from "./groups";
import { IRGroup } from "@/ir/groups";

describe("GroupVM", () => {
  describe("buildGroupVM", () => {
    it("should build VM from IR group", () => {
      const group: IRGroup = {
        id: "group:0:A,B",
        name: "Test Group",
        participantNames: ["A", "B"],
      };

      const vm = buildGroupVM(group);

      expect(vm.name).toBe("Test Group");
      expect(vm.participantNames).toEqual(["A", "B"]);
    });

    it("should handle group without name", () => {
      const group: IRGroup = {
        id: "group:1:C,D",
        participantNames: ["C", "D"],
      };

      const vm = buildGroupVM(group);

      expect(vm.name).toBeUndefined();
      expect(vm.participantNames).toEqual(["C", "D"]);
    });
  });

  describe("buildGroupsVM", () => {
    it("should build VMs for multiple groups", () => {
      const groups: IRGroup[] = [
        {
          id: "group:0:A,B",
          name: "Group 1",
          participantNames: ["A", "B"],
        },
        {
          id: "group:1:C,D",
          name: "Group 2",
          participantNames: ["C", "D"],
        },
      ];

      const vms = buildGroupsVM(groups);

      expect(vms).toHaveLength(2);
      expect(vms[0].name).toBe("Group 1");
      expect(vms[0].participantNames).toEqual(["A", "B"]);
      expect(vms[1].name).toBe("Group 2");
      expect(vms[1].participantNames).toEqual(["C", "D"]);
    });

    it("should handle empty groups array", () => {
      const vms = buildGroupsVM([]);
      expect(vms).toEqual([]);
    });
  });
});
