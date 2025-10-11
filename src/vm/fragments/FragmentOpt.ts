import { FragmentVM } from './FragmentVM';
import type { IRStatement } from "@/ir/tree-types";

export class FragmentOpt extends FragmentVM {
  /**
   * Opt fragment knows exactly how to collect its own statements
   * Simple fragment with just statements array
   */
  getStatements(): IRStatement[] {
    const statements: IRStatement[] = [];
    
    // Opt fragment is simple - just has statements array
    if (this.ir.statements) {
      this.collectFromStatements(this.ir.statements, statements);
    }
    
    return statements;
  }

}
