import { describe, it, expect } from 'vitest';
import { LayoutCalculator } from '@/domain/layout/LayoutCalculator';
import { SequenceDiagram, DividerStatement } from '@/domain/models/SequenceDiagram';

describe('LayoutCalculator - Divider Layout', () => {
  it('should calculate layout for dividers', () => {
    // Create a simple domain model with a divider
    const diagram: SequenceDiagram = {
      participants: new Map([
        ['A', { id: 'A', name: 'A', type: 'participant' as any, order: 0 }],
        ['B', { id: 'B', name: 'B', type: 'participant' as any, order: 1 }]
      ]),
      interactions: [
        {
          id: 'i1',
          type: 'sync' as any,
          from: 'A',
          to: 'B',
          message: 'test'
        }
      ],
      fragments: [],
      rootBlock: {
        id: 'root',
        statements: [
          { type: 'interaction', interactionId: 'i1' },
          { 
            type: 'divider', 
            text: 'Test Divider',
            style: {
              textStyle: { color: 'red' },
              classNames: ['custom-class']
            }
          } as DividerStatement
        ]
      }
    };
    
    const calculator = new LayoutCalculator();
    const layout = calculator.calculate(diagram);
    
    // Verify we have divider layout
    expect(layout.dividers).toHaveLength(1);
    
    const dividerLayout = layout.dividers[0];
    expect(dividerLayout.text).toBe('Test Divider');
    expect(dividerLayout.style?.textStyle?.color).toBe('red');
    expect(dividerLayout.style?.classNames).toContain('custom-class');
    
    // Verify positioning
    expect(dividerLayout.bounds.x).toBe(10); // Left margin
    expect(dividerLayout.bounds.y).toBeGreaterThan(0); // After the interaction
    expect(dividerLayout.bounds.width).toBeGreaterThan(0);
    expect(dividerLayout.bounds.height).toBe(20);
    
    // Verify label positioning
    expect(dividerLayout.labelBounds.width).toBe(100);
    expect(dividerLayout.labelBounds.height).toBe(16);
  });
});