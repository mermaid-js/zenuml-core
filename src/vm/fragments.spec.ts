import { buildRefVM, buildConditionVM } from "./fragments";
import { Fixture } from "../../test/unit/parser/fixture/Fixture";

describe("Fragment VMs", () => {
  describe("RefVM", () => {
    it("should build RefVM from ref context", () => {
      const context = Fixture.firstStatement("ref(A, B)");
      const refVM = buildRefVM(context);

      expect(refVM).toBeDefined();
      expect(refVM!.labelText).toBe("A");
      expect(refVM!.labelRange).toEqual([4, 4]); // Position of 'A'
      expect(refVM!.id).toMatch(/^ref:/);
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
      expect(conditionVM!.id).toMatch(/^condition:/);
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
});
