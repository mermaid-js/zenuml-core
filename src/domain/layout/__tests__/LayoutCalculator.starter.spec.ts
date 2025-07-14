import { describe, it, expect } from 'vitest';
import { LayoutCalculator } from '../LayoutCalculator';
import { Coordinates } from '@/positioning/Coordinates';
import { RootContext } from '@/parser';
import { buildDomainModel } from '@/domain/builders/DomainModelBuilder';

// Mock width provider that returns realistic widths
const mockWidthProvider = (text: string, type?: any) => {
  // Simulate actual measurements
  if (text === '_STARTER_') return 71; // 9 chars * ~8px
  if (text === 'MarkdownJavaFxHtmlPanel') return 184; // 23 chars * ~8px
  if (text === 'method1234567890000000') return 168; // message content
  return text.length * 8;
};

describe('LayoutCalculator with _STARTER_', () => {
  it('should match positioning for _STARTER_ participant', () => {
    // Test DSL with method call from _STARTER_
    const dsl = 'MarkdownJavaFxHtmlPanel.method1234567890000000';
    const rootContext = RootContext(dsl);
    
    // Old architecture
    const coordinates = new Coordinates(rootContext, mockWidthProvider);
    
    // New architecture
    const { diagram } = buildDomainModel(rootContext);
    const calculator = new LayoutCalculator(mockWidthProvider);
    const layout = calculator.calculate(diagram);
    
    // Should have both _STARTER_ and MarkdownJavaFxHtmlPanel
    expect(layout.participants).toHaveLength(2);
    
    // Find participants
    const starter = layout.participants.find(p => p.participantId === '_STARTER_');
    const panel = layout.participants.find(p => 
      p.participantId === 'MarkdownJavaFxHtmlPanel' || 
      p.label === 'MarkdownJavaFxHtmlPanel'
    );
    
    expect(starter).toBeDefined();
    expect(panel).toBeDefined();
    
    // Get positions from old architecture
    const oldStarterPos = coordinates.getPosition('_STARTER_');
    const oldPanelPos = coordinates.getPosition('MarkdownJavaFxHtmlPanel');
    
    // Debug widths
    const oldStarterWidth = coordinates.half('_STARTER_') * 2;
    const oldPanelWidth = coordinates.half('MarkdownJavaFxHtmlPanel') * 2;
    
    console.log('Old widths:', {
      starter: oldStarterWidth,
      panel: oldPanelWidth
    });
    
    console.log('New widths:', {
      starter: starter!.bounds.width,
      panel: panel!.bounds.width
    });
    
    console.log('Old positions:', {
      starter: oldStarterPos,
      panel: oldPanelPos
    });
    
    console.log('New positions:', {
      starter: starter!.lifelineX,
      panel: panel!.lifelineX
    });
    
    // Debug the gap calculation logic
    const starterHalf = coordinates.half('_STARTER_');
    const panelHalf = coordinates.half('MarkdownJavaFxHtmlPanel');
    
    console.log('Half widths:', { starterHalf, panelHalf });
    
    // Calculate expected position manually
    const expectedPanelPos = oldStarterPos + starterHalf + panelHalf;
    console.log('Expected panel position (center to center):', expectedPanelPos);
    console.log('Actual old panel position:', oldPanelPos);
    console.log('Difference:', oldPanelPos - expectedPanelPos);
    
    // Check the message that creates the gap
    console.log('Total width old:', coordinates.getWidth());
    console.log('Total width new:', layout.width);
    
    // Positions should match
    expect(starter!.lifelineX).toBeCloseTo(oldStarterPos, 1);
    
    // With message width constraints implemented, positions should now match
    expect(panel!.lifelineX).toBeCloseTo(oldPanelPos, 5); // Allow small tolerance for rounding
  });

  it('should place _STARTER_ as first participant', () => {
    const dsl = 'A.method()';
    const rootContext = RootContext(dsl);
    
    const { diagram } = buildDomainModel(rootContext);
    const calculator = new LayoutCalculator(mockWidthProvider);
    const layout = calculator.calculate(diagram);
    
    // Should have _STARTER_ and A
    expect(layout.participants).toHaveLength(2);
    
    // _STARTER_ should be first (leftmost)
    const starter = layout.participants.find(p => p.participantId === '_STARTER_');
    const a = layout.participants.find(p => p.participantId === 'A');
    
    expect(starter).toBeDefined();
    expect(a).toBeDefined();
    expect(starter!.lifelineX).toBeLessThan(a!.lifelineX);
  });

  it('should handle explicit _STARTER_ in messages', () => {
    const dsl = '_STARTER_->A: hello';
    const rootContext = RootContext(dsl);
    
    const coordinates = new Coordinates(rootContext, mockWidthProvider);
    const { diagram } = buildDomainModel(rootContext);
    const calculator = new LayoutCalculator(mockWidthProvider);
    const layout = calculator.calculate(diagram);
    
    const starter = layout.participants.find(p => p.participantId === '_STARTER_');
    const a = layout.participants.find(p => p.participantId === 'A');
    
    expect(starter!.lifelineX).toBeCloseTo(coordinates.getPosition('_STARTER_'), 1);
    expect(a!.lifelineX).toBeCloseTo(coordinates.getPosition('A'), 1);
  });
});