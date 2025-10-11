/**
 * TreeVMBuilder Program Level Tests
 *
 * Tests for buildProgVM functionality - program-level view model building
 * that integrates tree IR with participant span calculations
 */

import { describe, expect, it } from "vitest";
import { createStore } from "jotai";
import { codeAtom, coordinatesAtom, treeIRAtom } from "@/store/Store";
import { createTreeVMBuilder } from "./tree-vm-builder";

describe('TreeVMBuilder Program Level Tests', () => {
  describe('buildProgVM from parsed DSL', () => {
    it.each([
      {
        description: 'should build starterVM when explicit starter is declared',
        code: '@Starter(A)',
        expectedStarterVM: { name: 'A', displayName: 'A', isDefaultStarter: false }
      },
      {
        description: 'should not build starterVM for declared participants without starter annotation',
        code: 'A',
        expectedStarterVM: undefined
      },
      {
        description: 'should not build starterVM for messages without starter annotation',
        code: 'A->B:m',
        expectedStarterVM: undefined
      }
    ])('$description', ({ code, expectedStarterVM }) => {
      const store = createStore();
      store.set(codeAtom, code);
      const treeIR = store.get(treeIRAtom);

      const builder = createTreeVMBuilder();
      const coordinates = store.get(coordinatesAtom);
      
      // Create IRProg structure
      const prog = { tree: treeIR! };
      const result = builder.buildProgVM(prog, coordinates);

      if (expectedStarterVM) {
        expect(result.starterVM.name).toBe(expectedStarterVM.name);
        expect(result.starterVM.displayName).toBe(expectedStarterVM.displayName);
        expect(result.starterVM.isDefaultStarter).toBe(expectedStarterVM.isDefaultStarter);
        expect(result.starterVM.layout.center).toBe(50);
        expect(result.starterVM.layout.left).toBe(0);
        expect(result.starterVM.layout.right).toBe(100);
        expect(result.starterVM.layout.width).toBe(100);
      } else {
        expect(result.starterVM).toBeUndefined();
      }
    });

    it('should build ProgVM with declared participants', () => {
      const store = createStore();
      const code = 'A B C D E\nA -> B: Hello';

      store.set(codeAtom, code);
      const treeIR = store.get(treeIRAtom);

      // Verify we have declared participants
      expect(treeIR?.participants).toBeDefined();
      expect(treeIR?.participants.length).toBe(5);
      expect(treeIR?.participants.map(p => p.name)).toEqual(['A', 'B', 'C', 'D', 'E']);

      const builder = createTreeVMBuilder();
      const coordinates = store.get(coordinatesAtom);

      // Create IRProg structure
      const prog = { tree: treeIR! };
      const result = builder.buildProgVM(prog, coordinates);

      expect(result).toBeDefined();
      expect(result.starterVM).toBeUndefined();
      expect(result.rootBlockVM).toBeDefined();
      expect(result.totalWidth).toBe(500);

      // Test that starterVM is properly created
      expect(result.starterVM).toBeUndefined();
    });

    it('should build ProgVM correctly for messages without declared participants', () => {
      const store = createStore();
      const code = 'A -> B: Hello';
      store.set(codeAtom, code);
      const treeIR = store.get(treeIRAtom);
      const prog = { tree: treeIR! };

      const builder = createTreeVMBuilder();
      const result = builder.buildProgVM(prog, store.get(coordinatesAtom));

      expect(result).toBeDefined();
      expect(result.totalWidth).toBe(200);
    });

    it('should build ProgVM correctly for declared participants without messages', () => {
      const store = createStore();
      const code = 'A B C D E';
      store.set(codeAtom, code);
      const treeIR = store.get(treeIRAtom);
      const prog = { tree: treeIR! };

      const builder = createTreeVMBuilder();
      const result = builder.buildProgVM(prog, store.get(coordinatesAtom));

      expect(result).toBeDefined();
      expect(result.totalWidth).toBe(500);
    });

    it('should handle complex DSL with fragments and declared participants', () => {
      const store = createStore();
      const code = `
        A B C D
        A -> B: start
        if(condition) {
          B -> C: conditional
          C -> D: nested
        }
        D -> A: end
      `;

      store.set(codeAtom, code);
      const treeIR = store.get(treeIRAtom);

      // Verify structure
      expect(treeIR?.participants.length).toBe(4);
      expect(treeIR?.root.statements.length).toBe(3); // start, if-fragment, end

      const builder = createTreeVMBuilder();
      const coordinates = store.get(coordinatesAtom);
      const prog = { tree: treeIR! };
      const result = builder.buildProgVM(prog, coordinates);

      expect(result.rootBlockVM.statements.length).toBe(3);
      expect(result.totalWidth).toBe(420);
    });


    it('should build groupsVM when groups exist in tree IR', () => {
      const store = createStore();
      const code = 'group Team { A B } A -> B: message';
      
      store.set(codeAtom, code);
      const treeIR = store.get(treeIRAtom);
      
      // Verify groups exist in tree IR
      expect(treeIR?.groups).toBeDefined();
      expect(treeIR?.groups?.length).toBe(1);
      
      const builder = createTreeVMBuilder();
      const coordinates = store.get(coordinatesAtom);
      const prog = { tree: treeIR! };
      const result = builder.buildProgVM(prog, coordinates);
      
      expect(result.groupsVM).toBeDefined();
      expect(result.groupsVM).not.toBeNull();
      expect(result.groupsVM.length).toBe(1);

      // Verify group structure
      const firstGroup = result.groupsVM[0];
      expect(firstGroup.participantNames).toStrictEqual(['A', 'B']);
      expect(firstGroup.participantNames.length).toBe(2);
      expect(firstGroup.name).toBe("Team");
    });

    it('should build multiple groupsVM for multiple groups', () => {
      const store = createStore();
      const code = `
        group "Team1" { A B }
        group "Team2" { C D }
        A -> B: first
        C -> D: second
      `;
      
      store.set(codeAtom, code);
      const treeIR = store.get(treeIRAtom);
      
      // Verify multiple groups exist
      expect(treeIR?.groups).toBeDefined();
      expect(treeIR?.groups?.length).toBe(2);
      
      const builder = createTreeVMBuilder();
      const coordinates = store.get(coordinatesAtom);
      const prog = { tree: treeIR! };
      const result = builder.buildProgVM(prog, coordinates);
      
      expect(result.groupsVM).toBeDefined();
      expect(result.groupsVM).not.toBeNull();
      expect(result.groupsVM.length).toBe(2);

      // Verify both groups have proper structure
      expect(result.groupsVM[0].name).toBe("Team1");
      expect(result.groupsVM[0].participantNames).toStrictEqual(['A', 'B']);
      expect(result.groupsVM[1].name).toBe("Team2");
      expect(result.groupsVM[1].participantNames).toStrictEqual(['C', 'D']);
    });
  });

  describe('participantsVM layout information', () => {
    it('should add layout information to all participants', () => {
      const store = createStore();
      const code = 'A B C\nA -> B: message';
      
      store.set(codeAtom, code);
      const treeIR = store.get(treeIRAtom);
      
      const builder = createTreeVMBuilder();
      const coordinates = store.get(coordinatesAtom);
      const prog = { tree: treeIR! };
      const result = builder.buildProgVM(prog, coordinates);
      
      expect(result.participantsVM).toBeDefined();
      expect(result.participantsVM.length).toBe(3);
      
      // Verify all participants have layout information
      result.participantsVM.forEach((participant: any) => {
        expect(participant.layout).toBeDefined();
        expect(participant.layout.center).toBeTypeOf('number');
        expect(participant.layout.left).toBeTypeOf('number');
        expect(participant.layout.right).toBeTypeOf('number');
        expect(participant.layout.width).toBeTypeOf('number');
        
        // Verify layout calculations are correct
        const expectedHalf = participant.layout.width / 2;
        expect(participant.layout.left).toBe(participant.layout.center - expectedHalf);
        expect(participant.layout.right).toBe(participant.layout.center + expectedHalf);
      });
    });

    it('should calculate layout correctly for specific participants', () => {
      const store = createStore();
      const code = 'A B\nA -> B: message';
      
      store.set(codeAtom, code);
      const treeIR = store.get(treeIRAtom);
      
      const builder = createTreeVMBuilder();
      const coordinates = store.get(coordinatesAtom);
      const prog = { tree: treeIR! };
      const result = builder.buildProgVM(prog, coordinates);
      
      const participantA = result.participantsVM.find((p: any) => p.name === 'A');
      const participantB = result.participantsVM.find((p: any) => p.name === 'B');
      
      expect(participantA).toBeDefined();
      expect(participantB).toBeDefined();
      
      // Verify A and B have different positions
      expect(participantA.layout.center).not.toBe(participantB.layout.center);
      expect(participantA.layout.left).not.toBe(participantB.layout.left);
      
      // Verify B is to the right of A
      expect(participantB.layout.center).toBeGreaterThan(participantA.layout.center);
    });
  });

  describe('titleVM integration', () => {
    it('should include titleVM in progVM when title exists', () => {
      const store = createStore();
      const code = 'title Test Title\nA -> B: message';
      
      store.set(codeAtom, code);
      const treeIR = store.get(treeIRAtom);
      
      const builder = createTreeVMBuilder();
      const coordinates = store.get(coordinatesAtom);
      const prog = { tree: treeIR! };
      const result = builder.buildProgVM(prog, coordinates);
      
      expect(result.titleVM).toBeDefined();
      expect(result.titleVM.text).toBe('Test Title');
    });

    it('should have undefined titleVM when no title exists', () => {
      const store = createStore();
      const code = 'A -> B: message';
      
      store.set(codeAtom, code);
      const treeIR = store.get(treeIRAtom);
      
      const builder = createTreeVMBuilder();
      const coordinates = store.get(coordinatesAtom);
      const prog = { tree: treeIR! };
      const result = builder.buildProgVM(prog, coordinates);
      
      expect(result.titleVM).toBeUndefined();
    });

    it('should handle empty title correctly', () => {
      const store = createStore();
      const code = 'title \nA -> B: message';
      
      store.set(codeAtom, code);
      const treeIR = store.get(treeIRAtom);
      
      const builder = createTreeVMBuilder();
      const coordinates = store.get(coordinatesAtom);
      const prog = { tree: treeIR! };
      const result = builder.buildProgVM(prog, coordinates);
      
      expect(result.titleVM).toBeDefined();
      expect(result.titleVM.text).toBe('');
    });
  });
});
