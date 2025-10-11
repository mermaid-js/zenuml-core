import { FragmentFactory } from './FragmentFactory';
import type { IRStatement } from "@/ir/tree-types";
import { StatementKind } from "@/ir/tree-types";

describe('Fragment Abstraction', () => {
  // Mock IR statements for testing
  const mockAltFragment: IRStatement = {
    kind: StatementKind.Fragment,
    fragmentType: 'alt',
    condition: 'x > 0',
    ifBlock: {
      statements: [
        { kind: StatementKind.Message, from: 'A', to: 'B', signature: 'method1' },
        { kind: StatementKind.Message, from: 'B', to: 'B', signature: 'selfMessage' }, // self-message
      ]
    },
    elseBlock: {
      statements: [
        { kind: StatementKind.Message, from: 'A', to: 'C', signature: 'method2' },
      ]
    }
  };

  const mockLoopFragment: IRStatement = {
    kind: StatementKind.Fragment,
    fragmentType: 'loop',
    condition: 'i < 10',
    statements: [
      { kind: StatementKind.Message, from: 'A', to: 'B', signature: 'iterate' },
      { kind: StatementKind.Message, from: 'A', to: 'A', signature: 'selfLoop' }, // self-message
    ]
  };

  describe('FragmentFactory', () => {
    it('should create Alt fragments correctly', () => {
      const fragment = FragmentFactory.create(mockAltFragment, '_STARTER_');
      
      expect(fragment).not.toBeNull();
      expect(fragment?.fragmentType).toBe('alt');
      expect(fragment?.condition).toBe('x > 0');
    });

    it('should create Loop fragments correctly', () => {
      const fragment = FragmentFactory.create(mockLoopFragment, '_STARTER_');
      
      expect(fragment).not.toBeNull();
      expect(fragment?.fragmentType).toBe('loop');
      expect(fragment?.condition).toBe('i < 10');
    });

    it('should throw error for non-fragment statements', () => {
      const nonFragment = { kind: StatementKind.Message, from: 'A', to: 'B' } as any;
      
      expect(() => FragmentFactory.create(nonFragment, '_STARTER_'))
        .toThrow('Expected fragment statement, got message');
    });
  });

  describe('Fragment Methods', () => {
    it('should extract all statements from Alt fragment', () => {
      const fragment = FragmentFactory.create(mockAltFragment, '_STARTER_');
      const statements = fragment?.getStatements();
      
      expect(statements).toHaveLength(3); // 2 from ifBlock + 1 from elseBlock
      expect(statements?.[0].signature).toBe('method1');
      expect(statements?.[1].signature).toBe('selfMessage');
      expect(statements?.[2].signature).toBe('method2');
    });

    it('should extract participants correctly', () => {
      const fragment = FragmentFactory.create(mockAltFragment, '_STARTER_');
      const participants = fragment?.getParticipants();
      
      expect(participants).toContain('A');
      expect(participants).toContain('B');
      expect(participants).toContain('C');
      expect(participants).toHaveLength(3);
    });

    it('should identify self-messages correctly', () => {
      const fragment = FragmentFactory.create(mockAltFragment, '_STARTER_');
      const selfMessages = fragment?.getSelfMessages();
      
      expect(selfMessages).toHaveLength(1);
      expect(selfMessages?.[0].signature).toBe('selfMessage');
      expect(selfMessages?.[0].from).toBe('B');
      expect(selfMessages?.[0].to).toBe('B');
    });



    it('should handle fragments with nested statements', () => {
      // Create a fragment with nested message blocks
      const nestedFragment: IRStatement = {
        kind: StatementKind.Fragment,
        fragmentType: 'opt',
        statements: [
          {
            kind: StatementKind.Message,
            from: 'A',
            to: 'B',
            signature: 'parent',
            statements: [
              { kind: StatementKind.Message, from: 'B', to: 'C', signature: 'nested' },
              { kind: StatementKind.Message, from: 'C', to: 'C', signature: 'nestedSelf' }, // nested self-message
            ]
          }
        ]
      };

      const fragment = FragmentFactory.create(nestedFragment, '_STARTER_');
      const allStatements = fragment?.getStatements();
      const selfMessages = fragment?.getSelfMessages();
      const participants = fragment?.getParticipants();

      expect(allStatements).toHaveLength(3); // parent + 2 nested
      expect(selfMessages).toHaveLength(1);
      expect(selfMessages?.[0].signature).toBe('nestedSelf');
      expect(participants).toContain('A');
      expect(participants).toContain('B');
      expect(participants).toContain('C');
    });
  });

  describe('FragmentFactory Utilities', () => {
    it('should check supported fragment types', () => {
      expect(FragmentFactory.isSupported('alt')).toBe(true);
      expect(FragmentFactory.isSupported('loop')).toBe(true);
      expect(FragmentFactory.isSupported('tcf')).toBe(true);
      expect(FragmentFactory.isSupported('unknown')).toBe(false);
    });

    it('should return all supported types', () => {
      const supportedTypes = FragmentFactory.getSupportedTypes();
      
      expect(supportedTypes).toContain('alt');
      expect(supportedTypes).toContain('loop');
      expect(supportedTypes).toContain('opt');
      expect(supportedTypes).toContain('par');
      expect(supportedTypes).toContain('critical');
      expect(supportedTypes).toContain('section');
      expect(supportedTypes).toContain('ref');
      expect(supportedTypes).toContain('tcf');
      expect(supportedTypes).toHaveLength(8);
    });
  });

  describe('Fragment Self-Message Width Calculation', () => {
    const mockCoordinates = {
      getMessageWidth: (message: any) => message.signature === 'selfMessage' ? 80 : 60,
      distance: (from: string, to: string) => {
        // Distance from B to C should be 100
        if (from === 'B' && to === 'C') return 100;
        if (from === to) return 0;
        return 50;
      },
      half: (participant: string) => 50,
      orderedParticipantNames: () => ['A', 'B', 'C']
    } as any;

    it('should calculate extra width for self-messages correctly', () => {
      const fragment = FragmentFactory.create(mockAltFragment, '_STARTER_');
      const extraWidth = fragment?.computeExtraWidthDueToSelfMessages(mockCoordinates);
      
      // Self-message from B to B, rightmost participant is C
      // messageWidth (80) - distance (B to C = 100) - halfRight (50) = 80 - 100 - 50 = -70
      // Since Math.max(0, -70) = 0, the extra width should be 0
      expect(extraWidth).toBe(0);
    });

    it('should return 0 when no self-messages exist', () => {
      const fragmentWithoutSelfMessages = {
        kind: StatementKind.Fragment,
        fragmentType: 'alt',
        ifBlock: {
          condition: 'x > 0',
          statements: [
            { kind: StatementKind.Message, from: 'A', to: 'B', signature: 'normalMessage' }
          ]
        }
      };
      
      const fragment = FragmentFactory.create(fragmentWithoutSelfMessages as any, '_STARTER_');
      const extraWidth = fragment?.computeExtraWidthDueToSelfMessages(mockCoordinates);
      
      expect(extraWidth).toBe(0);
    });
  });

  describe('Fragment Padding Left Calculation', () => {
    const mockCoordinates = {
      half: (participant: string) => 50,
      orderedParticipantNames: () => ['A', 'B', 'C']
    } as any;

    it('should calculate padding left including border and half width', () => {
      const fragment = FragmentFactory.create(mockAltFragment, '_STARTER_');
      const paddingLeft = fragment?.computePaddingLeft(mockCoordinates, '_STARTER_');
      
      // Should include border left + half width of leftmost participant
      expect(paddingLeft).toBe(60);
    });

  });

  describe('Fragment Offset X Calculation', () => {
    const mockCoordinates = {
      half: (participant: string) => 50,
      orderedParticipantNames: () => ['A', 'B', 'C'],
      getPosition: (participant: string) => {
        const positions = { 'A': 50, 'B': 150, 'C': 250, '_STARTER_': 25 };
        return positions[participant as keyof typeof positions] || 0;
      }
    } as any;

    it('should calculate offset X including border and participant positioning', () => {
      const fragment = FragmentFactory.create(mockAltFragment, '_STARTER_');
      const offsetX = fragment?.computeOffsetX(mockCoordinates, '_STARTER_');
      
      // Should include border left + positioning calculations
      expect(offsetX).toBe(35);
    });

  });

  describe('Fragment Participant Span Calculation', () => {
    const mockCoordinates = {
      half: (participant: string) => 50,
      orderedParticipantNames: () => ['A', 'B', 'C'],
      getPosition: (participant: string) => {
        const positions = { 'A': 50, 'B': 150, 'C': 250 };
        return positions[participant as keyof typeof positions] || 0;
      }
    } as any;

    it('should calculate participant span between leftmost and rightmost participants', () => {
      const fragment = FragmentFactory.create(mockAltFragment, '_STARTER_');
      const span = fragment?.computeParticipantSpan(mockCoordinates);
      
      // Should calculate span from A (leftmost) to B (rightmost) including half-widths
      expect(span).toBe(300);
    });

  });

  describe('Fragment Width Calculation', () => {
    const mockCoordinates = {
      half: (participant: string) => 50,
      orderedParticipantNames: () => ['A', 'B', 'C'],
      getPosition: (participant: string) => {
        const positions = { 'A': 50, 'B': 150, 'C': 250 };
        return positions[participant as keyof typeof positions] || 0;
      },
      distance: (from: string, to: string) => {
        const positions = { 'A': 50, 'B': 150, 'C': 250 };
        const fromPos = positions[from as keyof typeof positions] || 0;
        const toPos = positions[to as keyof typeof positions] || 0;
        return Math.abs(toPos - fromPos);
      },
      getMessageWidth: (message: any) => {
        // Mock message width calculation - return a reasonable width for self-messages
        return message.signature ? message.signature.length * 10 + 50 : 100;
      }
    } as any;

    it('should calculate total width including participant span, borders, and self-message extra width', () => {
      const fragment = FragmentFactory.create(mockAltFragment, '_STARTER_');
      const width = fragment?.computeWidth(mockCoordinates);
      
      // Should include participant span + borders + any self-message extra width, minimum 200
      expect(width).toBe(330);
    });

    it('should return minimum width for fragments with no participants', () => {
      const emptyFragment = {
        kind: StatementKind.Fragment,
        fragmentType: 'opt',
        statements: []
      };
      
      const fragment = FragmentFactory.create(emptyFragment as any, '_STARTER_');
      const width = fragment?.computeWidth(mockCoordinates);
      
      // For empty fragments, should return minimum width (100) plus any border calculations
      // Since borders are calculated via FrameBuilder, the result may be >= 100
      expect(width).toBe(120);
    });
  });

});
