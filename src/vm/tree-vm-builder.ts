/**
 * TreeVMBuilder Implementation
 *
 * Builds view models directly from tree IR structure without requiring
 * parser context dependencies or byStart parameter passing.
 */

import { FragmentVM, TreeVMBuilder as ITreeVMBuilder } from "./tree-builder-types";
import { IRBlock, IRProg, IRStatement, StatementKind } from "@/ir/tree-types";
import { ProgVM } from "@/vm/ProgVM";
import { calculateArrowGeometry } from "@/vm/geometry/arrow";
import { FragmentFactory } from "@/vm/fragments/FragmentFactory";
import { _STARTER_ } from "@/constants";
import type { Coordinates } from "@/positioning/Coordinates";
import { BlockVM } from "@/vm/BlockVM";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import { TitleVM } from "@/vm/title";
import { buildParticipantsVM, ParticipantVM } from "@/vm/participants";
import { buildGroupsVM, GroupVM } from "@/vm/groups";
import type { IRParticipant } from "@/ir/participants";
import type { IRGroup } from "@/ir/groups";
import { StatementVM } from "@/vm/StatementVM";
import { NodeUtils } from "@/vm/Node";

/**
 * Concrete implementation of TreeVMBuilder
 */
export class TreeVMBuilder implements ITreeVMBuilder {

  /**
   * Build program VM from tree IR program
   * Returns structure that considers all participants for accurate total width calculation
   */
  buildProgVM(prog: IRProg, coordinates: Coordinates): any {
    if (!prog) {
      throw new Error('Program is required');
    }

    const origin = prog.tree.firstMessageStatement?.from || _STARTER_;
    const progVM = new ProgVM(prog.tree, origin);
    const rootBlockVM = this.buildBlockVM(prog.tree.root, origin, coordinates);

    // Simple test: Print Y and height for ALL statements
    if (rootBlockVM.statements && rootBlockVM.statements.length > 0) {
      console.log(`=== Vertical Position Test ===`);
      console.log(`Total root statements: ${rootBlockVM.statements.length}`);

      // Real DOM measurements show:
      // - First SYNC message at Y=233.5px
      // - First ASYNC message at Y=230px
      // - Sync messages are 38px tall, async are 16px tall
      // - Sync spacing is 19.5px, async spacing is 16px

      // Determine starting Y based on first statement type
      const firstIRStatement = prog.tree.root.statements[0];
      let currentY = 230; // Default: async messages start here

      if (firstIRStatement && (firstIRStatement.kind === StatementKind.Message)) {
        currentY = 233.5; // Sync messages start here (3.5px offset from container)
      }

      // Recursive function to print all statements including nested ones
      const printStatement = (irStatement: IRStatement, vmStatement: any, y: number, depth: number = 0) => {
        const indent = '  '.repeat(depth);
        const statementVM = StatementVM.create(irStatement, origin);
        const height = statementVM.getHeight();

        console.log(`${indent}${vmStatement.signature || vmStatement.kind} (${vmStatement.kind})`);
        console.log(`${indent}  From: ${vmStatement.from}, To: ${vmStatement.to}`);
        console.log(`${indent}  Y: ${y}, Height: ${height}`);

        // Print nested statements if any
        if (irStatement.statements && irStatement.statements.length > 0) {
          let nestedY = y + 38; // Start nested statements after the parent's base height
          irStatement.statements.forEach((nested, nestedIndex) => {
            const nestedVM = vmStatement.blockVM?.statements[nestedIndex];
            if (nestedVM) {
              printStatement(nested, nestedVM, nestedY, depth + 1);

              // Calculate next nested Y position
              const nestedStatementVM = StatementVM.create(nested, origin);
              const nestedHeight = nestedStatementVM.getHeight();
              nestedY += nestedHeight;

              // Add spacing if there's a next nested statement
              if (nestedIndex < irStatement.statements!.length - 1) {
                const nextNested = irStatement.statements![nestedIndex + 1];
                nestedY += NodeUtils.getSpacingBetween(nested, nextNested);
              }
            }
          });
        }
      };

      // Print all root-level statements
      prog.tree.root.statements.forEach((irStatement, index) => {
        const vmStatement = rootBlockVM.statements[index];
        printStatement(irStatement, vmStatement, currentY, 0);

        // Calculate next Y position
        const statementVM = StatementVM.create(irStatement, origin);
        const height = statementVM.getHeight();
        currentY += height;

        // Add spacing if there's a next statement
        const nextIRStatement = prog.tree.root.statements[index + 1];
        if (nextIRStatement) {
          const spacing = NodeUtils.getSpacingBetween(irStatement, nextIRStatement);
          currentY += spacing;
        }
      });

      console.log(`==============================`);

      // Schedule DOM measurement after rendering
      setTimeout(() => {
        console.log(`=== Real DOM Measurements ===`);

        // Find ALL message elements in the DOM
        const messageElements = document.querySelectorAll('[data-signature]');
        console.log(`Found ${messageElements.length} message elements`);

        messageElements.forEach((element, index) => {
          const htmlElement = element as HTMLElement;
          const rect = htmlElement.getBoundingClientRect();
          const signature = htmlElement.getAttribute('data-signature');
          console.log(`Message ${index + 1}: signature="${signature}"`);
          console.log(`  Real Y: ${rect.top}`);
          console.log(`  Real height: ${rect.height}`);
          console.log(`  Real bottom: ${rect.bottom}`);
        });

        // Also find all occurrences
        const occurrenceElements = document.querySelectorAll('[data-el-type="occurrence"]');
        console.log(`Found ${occurrenceElements.length} occurrence elements`);

        occurrenceElements.forEach((element, index) => {
          const htmlElement = element as HTMLElement;
          const occRect = htmlElement.getBoundingClientRect();
          console.log(`Occurrence ${index + 1}:`);
          console.log(`  Real Y: ${occRect.top}`);
          console.log(`  Real height: ${occRect.height}`);
        });

        console.log(`==============================`);
      }, 100); // Wait for render
    }

    const totalWidth = progVM.computeWidth(coordinates, FRAGMENT_MIN_WIDTH);
    const paddingLeft = coordinates.getPosition(origin) + 1;

    const participantsVM = this.buildParticipantsVM(prog.tree.participants);
    participantsVM.forEach((participant) => {
      const center = coordinates.getPosition(participant.name);
      const half = coordinates.half(participant.name);
      participant.layout = {
        center,
        left: center - half,
        right: center + half,
        width: half * 2,
      };
    });
    
    const starterVM = participantsVM.find((p) => p.isStarter);

    // Build groupsVM from tree IR groups
    const groupsVM = prog.tree.groups && prog.tree.groups.length > 0 ? this.buildGroupsVM(prog.tree.groups) : null;
    
    // Build titleVM from tree IR title
    const titleVM = this.buildTitleVM(prog.tree.title);

    // Return structure that Block component expects with program-level participant info
    return {
      paddingLeft,
      rootBlockVM,
      totalWidth,
      starterVM, // Add starter VM for positioning calculations
      groupsVM, // Add groups VM for group rendering
      participantsVM, // Add participants VM for participant rendering
      titleVM, // Add title VM for diagram title
    };
  }

  /**
   * Build block VM from tree block
   * Returns structure that Block component expects
   */
  buildBlockVM(block: IRBlock, origin: string, coordinates: Coordinates): any {
    if (!block) {
      throw new Error('Block is required');
    }

    // Create BlockVM instance for participant analysis
    const blockVM = new BlockVM(block, origin);

    // Build DiscriminatedStatementVMs for all statements in block
    const statements = block.statements.map((statement) => {
      return this.buildStatementVM(statement, origin, coordinates);
    });

    // Get left and right participants from BlockVM
    const leftParticipant = blockVM.getLeftParticipant(coordinates);
    const rightParticipant = blockVM.getRightParticipant(coordinates);
    const border = blockVM.computeBorder(); // Add border computation with root frame
    const totalWidth = blockVM.computeWidth(coordinates, FRAGMENT_MIN_WIDTH); // Add total width computation

    // Return structure that Block component expects with participant info
    return {
      statements,
      origin,
      leftParticipant,
      rightParticipant,
      border, // Add border to the returned object
      totalWidth, // Add total width to the returned object
    };
  }

  /**
   * Build statement VM from tree node without parser context
   * Returns DiscriminatedStatementVM that components expect
   */
  buildStatementVM(irStatement: IRStatement, origin: string, coordinates: Coordinates): any {
    let data: any;
    switch (irStatement.kind) {
      case StatementKind.Message:
      case StatementKind.Async:
      case StatementKind.Creation:
      case StatementKind.Return:
        data = this.buildMessageVM(irStatement, origin, coordinates);
        break;

      case StatementKind.Fragment:
        data = this.buildFragmentVM(irStatement, origin, coordinates);
        break;

      case StatementKind.Divider:
        data = this.buildDividerVM(irStatement, origin, coordinates)
        break;

      default:
        throw new Error(`Invalid statement kind: ${irStatement.kind}`);
    }

    // Create DiscriminatedStatementVM structure that components expect
    // For fragments, use the specific fragment type (alt, loop, etc.) as the kind
    const effectiveKind = irStatement.kind === StatementKind.Fragment
      ? irStatement.fragmentType
      : irStatement.kind;

    console.log('1111111111effectiveKind', effectiveKind, irStatement.kind);

    return {
      kind: effectiveKind,
      comment: irStatement.comment,
      ...data,
    };
  }

  /**
   * Build message VM from tree statement with flattened properties
   * Returns standard MessageVM that components expect
   */
  buildMessageVM(irStatement: IRStatement, origin: string, coordinates: Coordinates): any {
    const arrowGeometry =  calculateArrowGeometry(origin, coordinates, irStatement);
    const isSelf = irStatement.from === irStatement.to;

    let blockVM = null;
    // For message types, add children if present
    if (irStatement.statements) {
      const childOrigin = irStatement.to || irStatement.from;
      blockVM = this.buildBlockVM({ statements: irStatement.statements }, childOrigin, coordinates);
    }
    // Create the standard MessageVM structure that components expect
    // Note: components hardcode type strings, so type field removed
    return {
      from: irStatement.from,
      to: irStatement.to,
      signature: irStatement.signature,
      labelRange: irStatement.labelRange || null,
      range: irStatement.range || null,
      codeRange: irStatement.codeRange || null,
      isSelf,
      assignee: irStatement.assignee || null,
      blockVM,
      arrow: arrowGeometry,
    };
  }

  /**
   * Build fragment VM from tree statement with flattened properties
   */
  buildFragmentVM(statement: IRStatement, origin: string, coordinates: Coordinates): FragmentVM {
    // Handle alt fragments specially to create the structure FragmentAlt expects
    if (statement.fragmentType === 'alt') {
      return this.buildAltFragmentVM(statement, origin, coordinates);
    }

    // Handle tcf fragments specially to create the structure FragmentTryCatchFinally expects
    if (statement.fragmentType === 'tcf') {
      return this.buildTcfFragmentVM(statement, origin, coordinates);
    }

    // Handle other fragment types generically
    if (['loop', 'opt', 'par', 'critical', 'section', 'ref'].includes(statement.fragmentType || '')) {
      return this.buildGenericFragmentVM(statement, origin, coordinates);
    }

    throw new Error(`Invalid fragment type: ${statement.fragmentType}`);
  }

  /**
   * Build generic Fragment VM for non-alt fragments (loop, opt, par, critical, section, tcf, ref)
   * These fragments have a simpler structure than alt fragments
   */
  private buildGenericFragmentVM(statement: IRStatement, origin: string, coordinates: Coordinates): any {

    // Use Fragment abstraction to get leftmost participant
    const fragmentInstance = FragmentFactory.create(statement, origin);
    const leftmostParticipant = fragmentInstance.getLeftParticipant(coordinates);
    const blockVM = statement.statements ? this.buildBlockVM({ statements: statement.statements }, leftmostParticipant, coordinates) : null;

    // Calculate positioning data that fragment components expect
    const positioning = this.calculateFragmentPositioning(statement, origin, coordinates);
    const { paddingLeft, width, offsetX } = positioning;

    // Build condition VM for fragments that need it (loop, opt, etc.)
    const conditionVM = statement.condition ? {
      labelText: statement.condition,
      labelRange: null,
      codeRange: null,
    } : null;

    // Build ref VM for ref fragments
    const refVM = statement.fragmentType === 'ref' ? {
      labelText: statement.labelText || '',
      labelRange: statement.labelRange || null,
      codeRange: statement.codeRange || null,
    } : null;

    // Create the structure that fragment components expect
    return {
      type: StatementKind.Fragment,
      fragmentType: statement.fragmentType,
      condition: statement.condition || null, // Keep legacy string for compatibility
      conditionVM, // Add proper condition VM object
      refVM, // Add ref VM for ref fragments
      blockVM,
      paddingLeft,
      width, // Add width as separate property
      offsetX, // Add offsetX as separate property
      comment: statement.comment || null, // Add comment support for all fragments
    };
  }

  /**
   * Build Alt Fragment VM with proper ifBlockVM/elseIfBlocks/elseBlockVM structure
   */
  private buildAltFragmentVM(statement: IRStatement, origin: string, coordinates: Coordinates): any {

    // Create child context with fragment's leftmost participant as origin for child statements
    // Use Fragment abstraction to get leftmost participant
    const fragmentInstance = FragmentFactory.create(statement, origin);
    const leftmostParticipant = fragmentInstance?.getLeftParticipant(coordinates);
    const childOrigin = leftmostParticipant || _STARTER_;
    
    // Build if condition VM from ifBlock.condition (correct location per IR structure)
    const ifConditionVM = statement.ifBlock?.condition ? {
      labelText: statement.ifBlock.condition,
      labelRange: null,
      codeRange: null,
    } : null;

    // Build ifBlockVM with child context
    const ifBlockWithoutCondition = this.buildBlockVM({ statements: statement.ifBlock?.statements  || []}, childOrigin, coordinates);
    const ifBlockVM = {...ifBlockWithoutCondition, ifConditionVM};
    
    // Build elseIf blocks with condition extraction using child context
    const elseIfBlocks = (statement.elseIfBlocks || []).map((elseIfBlock: any) => ({
      conditionVM: elseIfBlock.condition ? {
        labelText: elseIfBlock.condition,
        labelRange: null,
        codeRange: null,
      } : null,
      blockVM: this.buildBlockVM({ statements: elseIfBlock.statements }, childOrigin, coordinates)
    }));

    // Build else block with child context
    const elseBlockVM = statement.elseBlock ? this.buildBlockVM({ statements: statement.elseBlock.statements }, childOrigin, coordinates) : null;


    // Calculate positioning data that FragmentAlt component expects
    const positioning = this.calculateFragmentPositioning(statement, origin, coordinates);
    const { paddingLeft, width, offsetX } = positioning;

    // Create the structure that FragmentAlt expects
    return {
      type: StatementKind.Fragment,
      fragmentType: 'alt',
      ifBlockVM,
      elseIfBlocks,
      elseBlockVM,
      paddingLeft,
      comment: statement.comment || null, // Add comment support for FragmentAlt
      width, // Add width as separate property
      offsetX, // Add offsetX as separate property
    };
  }

  /**
   * Build TCF Fragment VM with proper tryBlockVM/catchBlocks/finallyBlockVM structure
   */
  private buildTcfFragmentVM(statement: IRStatement, origin: string, coordinates: Coordinates): any {
    const fragmentInstance = FragmentFactory.create(statement, origin);
    const fragmentLeftParticipant = fragmentInstance?.getLeftParticipant(coordinates);
    const childOrigin = fragmentLeftParticipant || _STARTER_;

    // Build try block VM from properly parsed tryBlock
    const tryBlockVM = statement.tryBlock 
      ? this.buildBlockVM({ statements: statement.tryBlock.statements }, childOrigin, coordinates) 
      : null;
    
    // Build catch blocks VMs from properly parsed catchBlocks
    const catchBlocks = (statement.catchBlocks || []).map((catchBlock: any) => ({
      exceptionText: catchBlock.exceptionText || "",
      blockVM: this.buildBlockVM({ statements: catchBlock.statements }, childOrigin, coordinates)
    }));
    
    // Build finally block VM from properly parsed finallyBlock
    const finallyBlockVM = statement.finallyBlock 
      ? this.buildBlockVM({ statements: statement.finallyBlock.statements }, childOrigin, coordinates)
      : null;
    

    // Calculate positioning data that FragmentTryCatchFinally component expects
    const positioning = this.calculateFragmentPositioning(statement, origin, coordinates);
    const { paddingLeft, width, offsetX } = positioning;

    // Create the structure that FragmentTryCatchFinally expects
    return {
      type: StatementKind.Fragment,
      fragmentType: 'tcf',
      tryBlockVM,
      catchBlocks,
      finallyBlockVM,
      paddingLeft,
      width, // Add width as separate property
      offsetX, // Add offsetX as separate property
      comment: statement.comment || null, // Add comment support for TCF fragments
    };
  }

  // Private helper methods

  private buildDividerVM(statement: IRStatement, origin: string, coordinates: Coordinates): any {
    // Get divider note/label from the statement (should be cleaned by IR layer)
    const dividerNote = statement.label || 'Divider';
    
    // Calculate width based on rightmost participant (same as legacy implementation)
    const names = coordinates.orderedParticipantNames();
    const rearParticipant = names[names.length - 1];
    const dividerWidth = coordinates.getPosition(rearParticipant) + 10;
    const centerOfOrigin = coordinates.getPosition(origin);

    // Parse note for styling (same logic as legacy implementation)
    let parsedNote = dividerNote;
    let styleInfo: { styles?: string[] } = {};
    const trimmed = dividerNote.trim();
    const open = trimmed.indexOf("[");
    const close = trimmed.indexOf("]");
    if (open === 0 && close !== -1) {
      const startIndex = dividerNote.indexOf("[");
      const endIndex = dividerNote.indexOf("]");
      const styleStr = dividerNote.slice(startIndex + 1, endIndex);
      parsedNote = dividerNote.slice(endIndex + 1);
      styleInfo = { styles: styleStr.split(",").map((s: string) => s.trim()) };
    }

    return {
      note: parsedNote,
      rawNote: dividerNote,
      width: dividerWidth,
      translateX: -1 * centerOfOrigin + 10,
      styling: styleInfo,
    };
  }

  /**
   * Calculate fragment positioning using Fragment classes directly
   */
  private calculateFragmentPositioning(statement: IRStatement, origin: string, coordinates: Coordinates): any {
    // Use Fragment abstraction for all calculations
    const fragmentInstance = FragmentFactory.create(statement, origin);

    const offsetX = fragmentInstance.computeOffsetX(coordinates);
    const width = fragmentInstance.computeWidth(coordinates);
    const paddingLeft = fragmentInstance.computePaddingLeft(coordinates);

    return {
      paddingLeft,
      width, // Add width as separate property
      offsetX, // Add offsetX as separate property
    };
  }

  /**
   * Build title VM from tree title data
   * @param title Title string from tree IR
   * @returns Title view model or null if no title
   */
  buildTitleVM(title: string | undefined): TitleVM | undefined {
    if (title === undefined) {
      return undefined;
    }

    return {
      text: title,
    };
  }

  /**
   * Build participants VM from tree IR participants
   * @param participants Participants array from tree IR
   * @returns Participants view models array
   */
  buildParticipantsVM(participants: IRParticipant[]): ParticipantVM[] {
    return buildParticipantsVM(participants);
  }

  /**
   * Build groups VM from tree IR groups
   * @param groups Groups array from tree IR
   * @returns Groups view models array
   */
  buildGroupsVM(groups: IRGroup[]): GroupVM[] {
    return buildGroupsVM(groups);
  }

}

/**
 * Factory function to create TreeVMBuilder instance
 */
export function createTreeVMBuilder(): ITreeVMBuilder {
  return new TreeVMBuilder();
}
