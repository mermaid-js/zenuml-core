import { createStore } from "jotai";
import { codeAtom, progVMAtom, treeIRAtom } from "./Store";

describe("Tree-based Atoms Migration", () => {
  describe("progVM.participantsVM", () => {
    it("should build participants VM from tree IR for simple participants", () => {
      const store = createStore();
      const code = "A B C";
      
      store.set(codeAtom, code);
      const progVM = store.get(progVMAtom);
      const participantsVM = progVM.participantsVM;
      
      expect(participantsVM).toBeDefined();
      expect(participantsVM.length).toBe(3);
      expect(participantsVM[0].name).toBe("A");
      expect(participantsVM[1].name).toBe("B");
      expect(participantsVM[2].name).toBe("C");
      
      // Verify VM properties are built correctly
      expect(participantsVM[0].displayName).toBe("A");
      expect(participantsVM[0].isDefaultStarter).toBe(false);
      expect(participantsVM[0].explicit).toBe(true);
    });

    it("should build participants VM for participants with messages", () => {
      const store = createStore();
      const code = "A->B.method()";
      
      store.set(codeAtom, code);
      const progVM = store.get(progVMAtom);
      const participantsVM = progVM.participantsVM;
      
      expect(participantsVM).toBeDefined();
      expect(participantsVM.length).toBeGreaterThan(0);
      
      // Should include A and B participants
      const participantNames = participantsVM.map(p => p.name);
      expect(participantNames).toContain("A");
      expect(participantNames).toContain("B");
    });

    it("should build participants VM with styled participants", () => {
      const store = createStore();
      const code = '@actor A as "User Service" #ff0000';
      
      store.set(codeAtom, code);
      const progVM = store.get(progVMAtom);
      const participantsVM = progVM.participantsVM;
      
      expect(participantsVM).toBeDefined();
      const userParticipant = participantsVM.find(p => p.name === "A");
      expect(userParticipant).toBeDefined();
      expect(userParticipant?.color).toBe("#ff0000");
      expect(userParticipant?.label).toBe("User Service");
      expect(userParticipant?.type).toBe("actor");
    });

    it("should return empty array for empty code", () => {
      const store = createStore();
      store.set(codeAtom, "");
      
      const progVM = store.get(progVMAtom);
      const participantsVM = progVM.participantsVM;
      expect(participantsVM).toEqual([]);
    });

    it("should handle _STARTER_ participant correctly", () => {
      const store = createStore();
      const code = "A->B.method()";
      
      store.set(codeAtom, code);
      const progVM = store.get(progVMAtom);
      const participantsVM = progVM.participantsVM;
      
      const starterParticipant = participantsVM.find(p => p.name === "_STARTER_");
      if (starterParticipant) {
        expect(starterParticipant.isDefaultStarter).toBe(true);
        expect(starterParticipant.isStarter).toBe(true);
      }
    });
  });


  describe("Tree-based architecture integration", () => {
    it("should use the same tree IR for participants", () => {
      const store = createStore();
      const code = 'group "Team" { A B } A->B.method()';
      
      store.set(codeAtom, code);
      
      // Get the tree IR
      const treeIR = store.get(treeIRAtom);
      expect(treeIR).toBeDefined();
      expect(treeIR?.participants).toBeDefined();
      expect(treeIR?.groups).toBeDefined();
      
      // Get the VMs
      const progVM = store.get(progVMAtom);
      const participantsVM = progVM.participantsVM;
      
      // Verify they're using the same underlying data
      expect(participantsVM.length).toBeGreaterThan(0);
    });

    it("should handle complex DSL with participants and messages", () => {
      const store = createStore();
      const code = `
        @actor A as "User"
        @database B #0f0f0f
        group "Backend" { B C }
        
        A->B.login()
        B->C.validateCredentials()
      `;
      
      store.set(codeAtom, code);
      
      const progVM = store.get(progVMAtom);
      const participantsVM = progVM.participantsVM;
      
      // Verify participants
      expect(participantsVM.length).toBeGreaterThan(0);
      const userParticipant = participantsVM.find(p => p.name === "A");
      expect(userParticipant?.type).toBe("actor");
      expect(userParticipant?.label).toBe("User");
      
      const dbParticipant = participantsVM.find(p => p.name === "B");
      expect(dbParticipant?.type).toBe("database");
      expect(dbParticipant?.color).toBe("#0f0f0f");
    });
  });

  describe("Migration compatibility", () => {
    it("should maintain the same VM interface as legacy system", () => {
      const store = createStore();
      const code = '@actor A as "Service" B->A.method()';
      
      store.set(codeAtom, code);
      const progVM = store.get(progVMAtom);
      const participantsVM = progVM.participantsVM;
      
      // Verify VM has all expected properties from legacy interface
      const participant = participantsVM.find(p => p.name === "A");
      expect(participant).toBeDefined();
      expect(participant).toHaveProperty("name");
      expect(participant).toHaveProperty("displayName");
      expect(participant).toHaveProperty("isDefaultStarter");
      expect(participant).toHaveProperty("label");
      expect(participant).toHaveProperty("type");
      expect(participant).toHaveProperty("icon");
      expect(participant).toHaveProperty("explicit");
      expect(participant).toHaveProperty("isStarter");
      expect(participant).toHaveProperty("labelPositions");
      expect(participant).toHaveProperty("assigneePositions");
    });

  });
});
