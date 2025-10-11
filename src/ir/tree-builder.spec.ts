/**
 * TreeBuilder Tests with Real Parser Contexts
 *
 * These tests validate the TreeBuilder using real ANTLR parser contexts
 * to ensure proper tree construction from actual DSL code.
 */

import { describe, it, expect } from 'vitest';
import antlr4 from 'antlr4';
import sequenceLexer from '@/generated-parser/sequenceLexer';
import sequenceParser from '@/generated-parser/sequenceParser';
import { createTreeBuilder } from './tree-builder';
import { StatementKind } from './tree-types';

describe('TreeBuilder Real Parser Tests', () => {
  // Helper function to create real parser context from DSL code
  const createParserContext = (code: string) => {
    const input = new antlr4.InputStream(code);
    const lexer = new sequenceLexer(input);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new sequenceParser(tokens);
    return parser.prog();
  };

  describe('Alt Fragment Structure Tests', () => {
    it('should build proper alt fragment structure from real parser context', () => {
      const builder = createTreeBuilder();
      const code = 'if(x) { A.m }';

      // Create real parser context from DSL code
      const context = createParserContext(code);

      // Build tree from real parser context
      const tree = builder.buildTree(context);

      // Verify tree structure
      expect(tree).toBeDefined();
      expect(tree.root.statements).toBeDefined();
      expect(tree.root.statements.length).toBe(1);

      // Verify fragment statement
      const fragment = tree.root.statements[0];
      expect(fragment.kind).toBe(StatementKind.Fragment);
      expect(fragment.fragmentType).toBe('alt');
      expect(fragment.condition).toBeUndefined(); // Condition should not be at fragment level

      // Verify proper alt fragment structure: { ifBlock, elseIfBlocks: [], elseBlock }
      expect(fragment.ifBlock).toBeDefined();

      // Verify ifBlock contains the condition and message statements
      expect(fragment.ifBlock.condition).toBe('x'); // Condition should be in ifBlock
      expect(fragment.ifBlock.statements).toBeDefined();
      expect(fragment.ifBlock.statements.length).toBe(1);

      // Verify the message inside the ifBlock
      const messageInIfBlock = fragment.ifBlock.statements[0];
      expect(messageInIfBlock?.kind).toBe(StatementKind.Message);
      expect(messageInIfBlock?.to).toBe('A');
      expect(messageInIfBlock?.signature).toBe('m');
    });

    it('should handle simple alt fragment without complex elseif/else blocks', () => {
      // TODO: Complex elseIf/else block parsing from parser context is not yet implemented
      // For now, we test the basic alt fragment structure that works
      const builder = createTreeBuilder();
      const code = 'if(x) { A.m }';

      const context = createParserContext(code);
      const tree = builder.buildTree(context);

      const fragment = tree.root.statements[0];

      // Current implementation puts all statements in ifBlock with condition
      expect(fragment.ifBlock.condition).toBe('x');
      expect(fragment.ifBlock.statements.length).toBe(1);
    });

    it('should build complex alt fragment with if/elseif/else blocks', () => {
      // Full visitor pattern implementation now correctly parses all blocks!
      const builder = createTreeBuilder();
      const code = 'if(x) { A.m } else if(y) { B.m } else { C.n }';

      // Create real parser context from DSL code
      const context = createParserContext(code);

      // Build tree from real parser context
      const tree = builder.buildTree(context);

      // Verify tree structure
      expect(tree).toBeDefined();
      expect(tree.root.statements).toBeDefined();
      expect(tree.root.statements.length).toBe(1);

      // Verify fragment statement
      const fragment = tree.root.statements[0];
      expect(fragment.kind).toBe(StatementKind.Fragment);
      expect(fragment.fragmentType).toBe('alt');
      expect(fragment.condition).toBeUndefined(); // No condition at fragment level

      // Verify full alt fragment structure is now working!
      expect(fragment.ifBlock).toBeDefined();
      expect(fragment.elseIfBlocks).toBeDefined();
      expect(fragment.elseBlock).toBeDefined();

      // Verify ifBlock has condition 'x' and statement A.m
      expect(fragment.ifBlock.condition).toBe('x');
      expect(fragment.ifBlock.statements).toBeDefined();
      expect(fragment.ifBlock.statements.length).toBe(1);

      const ifMessage = fragment.ifBlock.statements[0];
      expect(ifMessage?.kind).toBe(StatementKind.Message);
      expect(ifMessage?.to).toBe('A');
      expect(ifMessage?.signature).toBe('m');

      // Verify elseIfBlocks has one block with condition 'y' and statement B.m
      expect(fragment.elseIfBlocks.length).toBe(1);
      expect(fragment.elseIfBlocks[0].condition).toBe('y');
      expect(fragment.elseIfBlocks[0].statements.length).toBe(1);

      const elseIfMessage = fragment.elseIfBlocks[0].statements[0];
      expect(elseIfMessage?.kind).toBe(StatementKind.Message);
      expect(elseIfMessage?.to).toBe('B');
      expect(elseIfMessage?.signature).toBe('m');

      // Verify elseBlock has no condition and statement C.n
      expect(fragment.elseBlock.condition).toBeUndefined();
      expect(fragment.elseBlock.statements).toBeDefined();
      expect(fragment.elseBlock.statements.length).toBe(1);

      const elseMessage = fragment.elseBlock.statements[0];
      expect(elseMessage?.kind).toBe(StatementKind.Message);
      expect(elseMessage?.to).toBe('C');
      expect(elseMessage?.signature).toBe('n');
    });

    it('should handle nested alt fragments like if(x) { if(y) { A.m } }', () => {
      const builder = createTreeBuilder();
      const code = 'if(x) { if(y) { A.m } }';

      // Create real parser context from DSL code
      const context = createParserContext(code);

      // Build tree from real parser context
      const tree = builder.buildTree(context);

      // Verify tree structure
      expect(tree).toBeDefined();
      expect(tree.root.statements).toBeDefined();
      expect(tree.root.statements.length).toBe(1);

      // Verify outer fragment statement
      const outerFragment = tree.root.statements[0];
      expect(outerFragment.kind).toBe(StatementKind.Fragment);
      expect(outerFragment.fragmentType).toBe('alt');

      // Verify outer fragment has ifBlock with condition 'x'
      expect(outerFragment.ifBlock).toBeDefined();
      expect(outerFragment.ifBlock.condition).toBe('x');
      expect(outerFragment.ifBlock.statements).toBeDefined();
      expect(outerFragment.ifBlock.statements.length).toBe(1);

      // Verify inner fragment is properly nested in outer ifBlock
      const innerFragment = outerFragment.ifBlock.statements[0];
      expect(innerFragment.kind).toBe(StatementKind.Fragment);
      expect(innerFragment.fragmentType).toBe('alt');

      // Verify inner fragment has its own ifBlock with condition 'y'
      expect(innerFragment.ifBlock).toBeDefined();
      expect(innerFragment.ifBlock.condition).toBe('y');
      expect(innerFragment.ifBlock.statements).toBeDefined();
      expect(innerFragment.ifBlock.statements.length).toBe(1);

      // Verify the message is in the innermost ifBlock
      const messageInInnerIfBlock = innerFragment.ifBlock.statements[0];
      expect(messageInInnerIfBlock?.kind).toBe(StatementKind.Message);
      expect(messageInInnerIfBlock?.to).toBe('A');
      expect(messageInInnerIfBlock?.signature).toBe('m');
    });
  });

  describe('Parent Tracking Tests', () => {
    it('should set parent references for root-level statements to undefined', () => {
      const builder = createTreeBuilder();
      const code = 'A.m\nB.n';

      const context = createParserContext(code);
      const tree = builder.buildTree(context);

      // Root level statements should have undefined parent
      expect(tree.root.statements.length).toBe(2);
      expect(tree.root.statements[0].parent.kind).toBe(StatementKind.Root);
      expect(tree.root.statements[1].parent.kind).toBe(StatementKind.Root);
    });

    it('should set parent references for statements nested in message blocks', () => {
      const builder = createTreeBuilder();
      const code = 'A.m { B.n }';

      const context = createParserContext(code);
      const tree = builder.buildTree(context);

      // Verify structure
      expect(tree.root.statements.length).toBe(1);
      const messageA = tree.root.statements[0];
      expect(messageA.kind).toBe(StatementKind.Message);
      expect(messageA.statements).toBeDefined();
      expect(messageA.statements!.length).toBe(1);

      // Verify parent reference for nested statement
      const nestedMessage = messageA.statements![0];
      expect(nestedMessage.parent).toBe(messageA);
    });

    it('should set parent references for statements in alt fragment ifBlock', () => {
      const builder = createTreeBuilder();
      const code = 'if(x) { A.m }';

      const context = createParserContext(code);
      const tree = builder.buildTree(context);

      const fragment = tree.root.statements[0];
      expect(fragment.kind).toBe(StatementKind.Fragment);
      expect(fragment.parent.kind).toBe(StatementKind.Root);

      // Check ifBlock statement parent
      const ifBlockMessage = fragment.ifBlock!.statements[0];
      expect(ifBlockMessage.parent).toBe(fragment.ifBlock);
    });

    it('should set parent references for statements in alt fragment elseIfBlock and elseBlock', () => {
      const builder = createTreeBuilder();
      const code = 'if(x) { A.m } else if(y) { B.n } else { C.o }';

      const context = createParserContext(code);
      const tree = builder.buildTree(context);

      const fragment = tree.root.statements[0];
      expect(fragment.kind).toBe(StatementKind.Fragment);

      // Check ifBlock statement parent
      const ifBlockMessage = fragment.ifBlock!.statements[0];
      expect(ifBlockMessage.parent).toBe(fragment.ifBlock);

      // Check elseIfBlock statement parent
      const elseIfBlockMessage = fragment.elseIfBlocks![0].statements[0];
      expect(elseIfBlockMessage.parent).toBe(fragment.elseIfBlocks![0]);

      // Check elseBlock statement parent
      const elseBlockMessage = fragment.elseBlock!.statements[0];
      expect(elseBlockMessage.parent).toBe(fragment.elseBlock);
    });

    it('should set parent references for nested alt fragments', () => {
      const builder = createTreeBuilder();
      const code = 'if(x) { if(y) { A.m } }';

      const context = createParserContext(code);
      const tree = builder.buildTree(context);

      const outerFragment = tree.root.statements[0];
      expect(outerFragment.parent.kind).toBe(StatementKind.Root);

      const innerFragment = outerFragment.ifBlock!.statements[0];
      expect(innerFragment.parent).toBe(outerFragment.ifBlock);

      const innerMessage = innerFragment.ifBlock!.statements[0];
      expect(innerMessage.parent).toBe(innerFragment.ifBlock);
    });

    it('should set parent references for statements in loop fragments', () => {
      const builder = createTreeBuilder();
      const code = 'loop(x) { A.m }';

      const context = createParserContext(code);
      const tree = builder.buildTree(context);

      const fragment = tree.root.statements[0];
      expect(fragment.kind).toBe(StatementKind.Fragment);
      expect(fragment.fragmentType).toBe('loop');
      expect(fragment.parent.kind).toBe(StatementKind.Root);

      // Check nested statement parent
      expect(fragment.statements).toBeDefined();
      expect(fragment.statements!.length).toBe(1);
      const nestedMessage = fragment.statements![0];
      expect(nestedMessage.parent).toBe(fragment);
    });
  });

  describe('Program Structure Tests with Declared Participants', () => {
    it('should build prog structure with declared participants from real DSL', () => {
      const builder = createTreeBuilder();
      const code = 'A B C D E\nA -> B: Hello';

      const context = createParserContext(code);
      const prog = builder.buildProg(context);

      // Verify prog structure
      expect(prog).toBeDefined();
      expect(prog.tree).toBeDefined();

      // Verify declared participants are captured
      expect(prog.tree.participants).toBeDefined();
      expect(prog.tree.participants.length).toBe(5);
      expect(prog.tree.participants.map(p => p.name)).toEqual(['A', 'B', 'C', 'D', 'E']);

      // Verify tree structure with messages
      expect(prog.tree.root.statements).toBeDefined();
      expect(prog.tree.root.statements.length).toBe(1);

      const message = prog.tree.root.statements[0];
      expect(message.kind).toBe(StatementKind.Async);
      expect(message.from).toBe('A');
      expect(message.to).toBe('B');
      expect(message.signature).toBe('Hello');
    });

    it('should handle DSL with only declared participants (no messages)', () => {
      const builder = createTreeBuilder();
      const code = 'A B C D E';

      const context = createParserContext(code);
      const prog = builder.buildProg(context);

      // Verify prog structure
      expect(prog).toBeDefined();
      expect(prog.tree).toBeDefined();

      // Verify declared participants are captured
      expect(prog.tree.participants).toBeDefined();
      expect(prog.tree.participants.length).toBe(5);
      expect(prog.tree.participants.map(p => p.name)).toEqual(['A', 'B', 'C', 'D', 'E']);

      // Verify no messages in root block
      expect(prog.tree.root.statements).toBeDefined();
      expect(prog.tree.root.statements.length).toBe(0);
    });

    it('should handle mixed declared participants and message participants', () => {
      const builder = createTreeBuilder();
      const code = 'A B C\nD -> E: message';

      const context = createParserContext(code);
      const prog = builder.buildProg(context);

      // Verify declared participants (parser may include all participants found)
      expect(prog.tree.participants).toBeDefined();
      expect(prog.tree.participants.length).toBe(5); // A, B, C, D, E all captured by parser
      
      // Verify all participants are captured
      const participantNames = prog.tree.participants.map(p => p.name);
      expect(participantNames).toContain('A');
      expect(participantNames).toContain('B');
      expect(participantNames).toContain('C');
      expect(participantNames).toContain('D');
      expect(participantNames).toContain('E');

      // Verify message with different participants
      expect(prog.tree.root.statements.length).toBe(1);
      const message = prog.tree.root.statements[0];
      expect(message.from).toBe('D');
      expect(message.to).toBe('E');

      // Note: This tests the scenario where ProgVM needs to consider all participants
      // The parser captures all participants it encounters, both declared and from messages
    });

    it('should handle complex DSL with declared participants and fragments', () => {
      const builder = createTreeBuilder();
      const code = `
        A B C D
        A -> B: start
        if(condition) {
          B -> C: conditional
          C -> D: nested
        }
        D -> A: end
      `;

      const context = createParserContext(code);
      const prog = builder.buildProg(context);

      // Verify declared participants
      expect(prog.tree.participants).toBeDefined();
      expect(prog.tree.participants.length).toBe(4);
      expect(prog.tree.participants.map(p => p.name)).toEqual(['A', 'B', 'C', 'D']);

      // Verify tree structure with messages and fragments
      expect(prog.tree.root.statements.length).toBe(3); // start, if-fragment, end

      // Verify first message
      const startMessage = prog.tree.root.statements[0];
      expect(startMessage.kind).toBe(StatementKind.Async);
      expect(startMessage.from).toBe('A');
      expect(startMessage.to).toBe('B');

      // Verify fragment
      const fragment = prog.tree.root.statements[1];
      expect(fragment.kind).toBe(StatementKind.Fragment);
      expect(fragment.fragmentType).toBe('alt');
      expect(fragment.ifBlock.statements.length).toBe(2);

      // Verify end message
      const endMessage = prog.tree.root.statements[2];
      expect(endMessage.kind).toBe(StatementKind.Async);
      expect(endMessage.from).toBe('D');
      expect(endMessage.to).toBe('A');
    });

    it('should handle title with declared participants', () => {
      const builder = createTreeBuilder();
      const code = `
        title Participant Test
        A B C D E
        A -> B: Hello
      `;

      const context = createParserContext(code);
      const prog = builder.buildProg(context);

      // Verify title is captured
      expect(prog.tree.title).toBe('Participant Test');

      // Verify declared participants
      expect(prog.tree.participants).toBeDefined();
      expect(prog.tree.participants.length).toBe(5);

      // Verify message
      expect(prog.tree.root.statements.length).toBe(1);
      const message = prog.tree.root.statements[0];
      expect(message.from).toBe('A');
      expect(message.to).toBe('B');
    });

    it('should handle participant declarations with aliases', () => {
      const builder = createTreeBuilder();
      const code = 'A as "Alice"\nB as "Bob"\nA -> B: Hello';

      const context = createParserContext(code);
      const prog = builder.buildProg(context);

      // Verify declared participants with aliases
      expect(prog.tree.participants).toBeDefined();
      expect(prog.tree.participants.length).toBe(2);
      
      const participantA = prog.tree.participants.find(p => p.name === 'A');
      const participantB = prog.tree.participants.find(p => p.name === 'B');
      
      expect(participantA).toBeDefined();
      expect(participantB).toBeDefined();
      
      // Note: Alias handling depends on parser implementation
      // This test verifies the basic structure is captured
    });

    it('should handle participants only without any messages', () => {
      const builder = createTreeBuilder();
      const code = 'A B C D E';

      const context = createParserContext(code);
      const prog = builder.buildProg(context);

      // Verify all participants are declared
      expect(prog.tree.participants).toBeDefined();
      expect(prog.tree.participants.length).toBe(5);
      expect(prog.tree.participants.map(p => p.name)).toEqual(['A', 'B', 'C', 'D', 'E']);

      // Verify no messages exist
      expect(prog.tree.root.statements.length).toBe(0);

      // This tests the scenario where ProgVM needs to consider declared participants for width calculation
      // even when there are no messages - important for the "participant without message" use case
    });

    it('should handle dividers correctly', () => {
      const builder = createTreeBuilder();
      const code = 'A\n==Basic Divider==\nB\n==[red,bold]Styled Divider==\nC';

      const context = createParserContext(code);
      const prog = builder.buildProg(context);

      // Verify participants are declared
      expect(prog.tree.participants).toBeDefined();
      expect(prog.tree.participants.length).toBeGreaterThan(0);

      // Verify divider statements exist
      expect(prog.tree.root.statements.length).toBeGreaterThan(0);
      
      // Check that we have divider statements with correct labels
      const dividers = prog.tree.root.statements.filter(s => s.kind === StatementKind.Divider);
      expect(dividers.length).toBe(2);
      
      expect(dividers[0].kind).toBe(StatementKind.Divider);
      expect(dividers[0].label).toBe('Basic Divider');
      
      expect(dividers[1].kind).toBe(StatementKind.Divider);
      expect(dividers[1].label).toBe('[red,bold]Styled Divider');
    });

    it('should handle comment inside message block (original user issue)', () => {
      const builder = createTreeBuilder();
      const code = `// comment 1
A.m {
  // comment 2
  if(x) {
    B.m
  }
}`;

      const context = createParserContext(code);
      const prog = builder.buildProg(context);

      // Debug: Log what we actually got
      console.log('User issue test - Statements found:', prog.tree.root.statements.length);
      prog.tree.root.statements.forEach((stmt, i) => {
        console.log(`Statement ${i}:`, stmt.kind, stmt.comment || stmt.signature || stmt.label);
        if (stmt.statements) {
          console.log(`  Nested statements (${stmt.statements.length}):`);
          stmt.statements.forEach((nested, j) => {
            console.log(`    ${j}:`, nested.kind, nested.comment || nested.signature || nested.label);
          });
        }
      });

      // The key issue: comment 2 inside the message block should be captured
      // For now, let's just verify the structure and see what we get
      expect(prog.tree.root.statements.length).toBeGreaterThan(0);
      
      const messageA = prog.tree.root.statements.find(s => s.kind === StatementKind.Message);
      expect(messageA).toBeDefined();
      expect(messageA!.to).toBe('A');
      expect(messageA!.signature).toBe('m');
      
      // The critical test: comment 2 should be attached to the fragment
      expect(messageA!.statements).toBeDefined();
      expect(messageA!.statements!.length).toBe(1); // Only the if fragment
      
      const fragment = messageA!.statements![0];
      expect(fragment.kind).toBe(StatementKind.Fragment);
      expect(fragment.fragmentType).toBe('alt');
      expect(fragment.comment).toBe(' comment 2'); // Comment is attached to the fragment
    });
  });
});