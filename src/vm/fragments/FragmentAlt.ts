import { FragmentVM } from './FragmentVM';
import type { IRStatement } from "@/ir/tree-types";

export class FragmentAlt extends FragmentVM {
  /**
   * Alt fragment knows exactly how to collect its own statements
   * Uses polymorphism to delegate nested fragment handling
   */
  getStatements(): IRStatement[] {
    const statements: IRStatement[] = [];
    
    // Alt fragment knows its own structure - no type checking needed!
    if (this.ir.ifBlock?.statements) {
      this.collectFromStatements(this.ir.ifBlock.statements, statements);
    }
    
    if (this.ir.elseIfBlocks) {
      this.ir.elseIfBlocks.forEach(elseIfBlock => {
        if (elseIfBlock.statements) {
          this.collectFromStatements(elseIfBlock.statements, statements);
        }
      });
    }
    
    if (this.ir.elseBlock?.statements) {
      this.collectFromStatements(this.ir.elseBlock.statements, statements);
    }
    
    return statements;
  }

}
