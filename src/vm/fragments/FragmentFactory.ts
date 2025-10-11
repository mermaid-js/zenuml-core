import { FragmentVM } from './FragmentVM';
import { FragmentAlt } from './FragmentAlt';
import { FragmentLoop } from './FragmentLoop';
import { FragmentOpt } from './FragmentOpt';
import { FragmentPar } from './FragmentPar';
import { FragmentCritical } from './FragmentCritical';
import { FragmentSection } from './FragmentSection';
import { FragmentRef } from './FragmentRef';
import { FragmentTcf } from './FragmentTcf';
import type { IRStatement } from "@/ir/tree-types";
import { StatementKind } from "@/ir/tree-types";

/**
 * Factory for creating Fragment instances based on fragment type
 * Centralizes fragment instantiation logic and provides type safety
 */
export class FragmentFactory {
  private static readonly fragmentClasses = {
    'alt': FragmentAlt,
    'loop': FragmentLoop,
    'opt': FragmentOpt,
    'par': FragmentPar,
    'critical': FragmentCritical,
    'section': FragmentSection,
    'ref': FragmentRef,
    'tcf': FragmentTcf,
  } as const;

  /**
   * Create a Fragment instance from an IR statement
   * @param ir The IR statement (must be of kind 'fragment')
   * @param origin The origin participant
   * @returns Fragment instance or null if fragment type is unknown
   */
  static create(ir: IRStatement, origin: string): FragmentVM {
    if (ir.kind !== StatementKind.Fragment) {
      throw new Error(`Expected fragment statement, got ${ir.kind}`);
    }
    const fragmentType = ir.fragmentType as keyof typeof this.fragmentClasses;
    const FragmentClass = this.fragmentClasses[fragmentType];

    return new FragmentClass(ir, origin);
  }

  /**
   * Check if a fragment type is supported
   * @param fragmentType The fragment type to check
   * @returns True if the fragment type is supported
   */
  static isSupported(fragmentType: string): boolean {
    return fragmentType in this.fragmentClasses;
  }

  /**
   * Get all supported fragment types
   * @returns Array of supported fragment type names
   */
  static getSupportedTypes(): string[] {
    return Object.keys(this.fragmentClasses);
  }
}
