import { FragmentVM } from './FragmentVM';
import type { IRStatement } from "@/ir/tree-types";

export class FragmentTcf extends FragmentVM {
  /**
   * TCF fragment knows exactly how to collect its own statements
   * Uses polymorphism to delegate nested fragment handling
   */
  getStatements(): IRStatement[] {
    const statements: IRStatement[] = [];
    
    // TCF fragment knows its own structure!
    if (this.ir.tryBlock?.statements) {
      this.collectFromStatements(this.ir.tryBlock.statements, statements);
    }
    
    if (this.ir.catchBlocks) {
      this.ir.catchBlocks.forEach(catchBlock => {
        if (catchBlock.statements) {
          this.collectFromStatements(catchBlock.statements, statements);
        }
      });
    }
    
    if (this.ir.finallyBlock?.statements) {
      this.collectFromStatements(this.ir.finallyBlock.statements, statements);
    }
    
    return statements;
  }

}
