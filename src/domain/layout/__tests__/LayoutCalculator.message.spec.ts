import { describe, it, expect } from 'vitest';
import { LayoutCalculator } from '../LayoutCalculator';
import { Coordinates } from '@/positioning/Coordinates';
import { RootContext } from '@/parser';
import { buildDomainModel } from '@/domain/builders/DomainModelBuilder';
import { LayoutComparison } from '@/utils/LayoutComparison';

// Mock width provider that matches browser measurements
const mockWidthProvider = (text: string, type?: any) => {
  const measurements: Record<string, number> = {
    '_STARTER_': 71,
    'MarkdownJavaFxHtmlPanel': 184,
    'StringBuilder': 98,
    'resultStringBuilder:StringBuilder': 227,
    'resultStringBuilder': 131,
    'readFromInputStream(inputStream)': 230,
    'new': 27,
    'append(line)': 85,
    'br': 18,
    'readLine()': 68,
    'line': 29
  };
  
  return measurements[text] || text.length * 8;
};

describe('LayoutCalculator Message Positioning', () => {
  it('should match message positions exactly with old architecture', () => {
    // Simplified version of the complex DSL to test message positioning
    const dsl = `
MarkdownJavaFxHtmlPanel
MarkdownJavaFxHtmlPanel.readFromInputStream(inputStream) {
  StringBuilder resultStringBuilder = new StringBuilder();
  resultStringBuilder.append(line);
}`;
    
    const rootContext = RootContext(dsl);
    
    // Enable comparison
    LayoutComparison.enable();
    
    // Old architecture
    const coordinates = new Coordinates(rootContext, mockWidthProvider);
    
    // New architecture
    const { diagram } = buildDomainModel(rootContext);
    const calculator = new LayoutCalculator(mockWidthProvider);
    const layout = calculator.calculate(diagram);
    
    // Run comparison
    const comparison = LayoutComparison.compare(coordinates, layout);
    
    expect(comparison).toBeDefined();
    expect(comparison!.messagePositions).toHaveLength(3); // readFromInputStream, new, append
    
    // All message positions should match within 1px tolerance
    comparison!.messagePositions.forEach((msg, index) => {
      console.log(`Message ${index + 1}: "${msg.message}"`);
      console.log(`  From: ${msg.fromPosition.old} → ${msg.fromPosition.new} (Δ${msg.fromPosition.diff}px)`);
      console.log(`  To: ${msg.toPosition.old} → ${msg.toPosition.new} (Δ${msg.toPosition.diff}px)`);
      
      // Critical: Message positions should match exactly
      expect(msg.fromPosition.diff).toBeLessThanOrEqual(1);
      expect(msg.toPosition.diff).toBeLessThanOrEqual(1);
    });
    
    console.log('\n✅ All message positions match within 1px tolerance');
    
    LayoutComparison.disable();
  });

  it('should handle nested messages correctly', () => {
    const dsl = `
A.method1() {
  B.method2() {
    C.method3();
  }
}`;
    
    const rootContext = RootContext(dsl);
    
    LayoutComparison.enable();
    
    const coordinates = new Coordinates(rootContext, mockWidthProvider);
    const { diagram } = buildDomainModel(rootContext);
    const calculator = new LayoutCalculator(mockWidthProvider);
    const layout = calculator.calculate(diagram);
    
    const comparison = LayoutComparison.compare(coordinates, layout);
    
    expect(comparison).toBeDefined();
    
    // Check that nested messages don't have positioning errors
    comparison!.messagePositions.forEach((msg) => {
      expect(msg.fromPosition.diff).toBeLessThanOrEqual(1);
      expect(msg.toPosition.diff).toBeLessThanOrEqual(1);
    });
    
    LayoutComparison.disable();
  });

  it('should handle creation messages correctly', () => {
    const dsl = `
A.method() {
  new B();
}`;
    
    const rootContext = RootContext(dsl);
    
    LayoutComparison.enable();
    
    const coordinates = new Coordinates(rootContext, mockWidthProvider);
    const { diagram } = buildDomainModel(rootContext);
    const calculator = new LayoutCalculator(mockWidthProvider);
    const layout = calculator.calculate(diagram);
    
    const comparison = LayoutComparison.compare(coordinates, layout);
    
    expect(comparison).toBeDefined();
    
    const creationMessage = comparison!.messagePositions.find(msg => 
      msg.message.trim() === 'new' || msg.message.includes('new')
    );
    
    if (creationMessage) {
      expect(creationMessage.fromPosition.diff).toBeLessThanOrEqual(1);
      expect(creationMessage.toPosition.diff).toBeLessThanOrEqual(1);
    }
    
    LayoutComparison.disable();
  });
});