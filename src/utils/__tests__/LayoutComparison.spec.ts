import { describe, it, expect, beforeEach } from 'vitest';
import { LayoutComparison } from '../LayoutComparison';
import { Coordinates } from '@/positioning/Coordinates';
import { RootContext } from '@/parser';
import { buildDomainModel } from '@/domain/builders/DomainModelBuilder';
import { LayoutCalculator } from '@/domain/layout/LayoutCalculator';

// Mock width provider
const mockWidthProvider = (text: string) => {
  return text.length * 8;
};

describe('LayoutComparison', () => {
  beforeEach(() => {
    LayoutComparison.disable();
    // Clear any stored metrics
    (LayoutComparison as any).metrics = null;
  });

  it('should return null when disabled', () => {
    const result = LayoutComparison.compare(null, null);
    expect(result).toBeNull();
  });

  it('should return null when data is missing', () => {
    LayoutComparison.enable();
    
    // No coordinates
    expect(LayoutComparison.compare(null, {} as any)).toBeNull();
    
    // No layout
    expect(LayoutComparison.compare({} as any, null)).toBeNull();
    
    LayoutComparison.disable();
  });

  it('should compare simple two participant layout', () => {
    LayoutComparison.enable();
    
    const dsl = 'A B';
    const rootContext = RootContext(dsl);
    
    // Old architecture
    const coordinates = new Coordinates(rootContext, mockWidthProvider);
    
    // New architecture
    const { diagram } = buildDomainModel(rootContext);
    const calculator = new LayoutCalculator(mockWidthProvider);
    const layout = calculator.calculate(diagram);
    
    const result = LayoutComparison.compare(coordinates, layout);
    
    expect(result).toBeDefined();
    expect(result!.participantPositions).toHaveProperty('A');
    expect(result!.participantPositions).toHaveProperty('B');
    
    // Should have zero differences
    expect(result!.participantPositions['A'].diff).toBe(0);
    expect(result!.participantPositions['B'].diff).toBe(0);
    expect(result!.totalWidth.diff).toBe(0);
    
    LayoutComparison.disable();
  });

  it('should detect position differences', () => {
    LayoutComparison.enable();
    
    const dsl = 'A B';
    const rootContext = RootContext(dsl);
    
    // Old architecture
    const coordinates = new Coordinates(rootContext, mockWidthProvider);
    
    // New architecture with modified layout
    const { diagram } = buildDomainModel(rootContext);
    const calculator = new LayoutCalculator(mockWidthProvider);
    const layout = calculator.calculate(diagram);
    
    // Artificially modify B's position to create a difference
    layout.participants[1].lifelineX += 50;
    layout.width += 50;
    
    const result = LayoutComparison.compare(coordinates, layout);
    
    expect(result).toBeDefined();
    
    // A should still match
    expect(result!.participantPositions['A'].diff).toBe(0);
    
    // B should show difference
    expect(result!.participantPositions['B'].diff).toBe(50);
    expect(result!.participantPositions['B'].old).toBe(150);
    expect(result!.participantPositions['B'].new).toBe(200);
    
    // Total width should show difference
    expect(result!.totalWidth.diff).toBe(50);
    
    LayoutComparison.disable();
  });

  it('should handle participant name vs ID differences', () => {
    LayoutComparison.enable();
    
    const dsl = 'A B';
    const rootContext = RootContext(dsl);
    
    // Old architecture
    const coordinates = new Coordinates(rootContext, mockWidthProvider);
    
    // New architecture
    const { diagram } = buildDomainModel(rootContext);
    const calculator = new LayoutCalculator(mockWidthProvider);
    const layout = calculator.calculate(diagram);
    
    // Modify participant to have different ID but same label
    layout.participants[0].participantId = 'participant_1';
    layout.participants[0].label = 'A';
    
    const result = LayoutComparison.compare(coordinates, layout);
    
    expect(result).toBeDefined();
    // Should still find match by label
    expect(result!.participantPositions).toHaveProperty('A');
    expect(result!.participantPositions['A'].diff).toBe(0);
    
    LayoutComparison.disable();
  });

  it('should compare message positions', () => {
    LayoutComparison.enable();
    
    const dsl = 'A->B: hello';
    const rootContext = RootContext(dsl);
    
    // Old architecture
    const coordinates = new Coordinates(rootContext, mockWidthProvider);
    
    // New architecture
    const { diagram } = buildDomainModel(rootContext);
    const calculator = new LayoutCalculator(mockWidthProvider);
    const layout = calculator.calculate(diagram);
    
    const result = LayoutComparison.compare(coordinates, layout);
    
    expect(result).toBeDefined();
    expect(result!.messagePositions).toHaveLength(1);
    
    const messageComparison = result!.messagePositions[0];
    expect(messageComparison.message.trim()).toBe('hello');
    
    // Positions should match
    expect(messageComparison.fromPosition.diff).toBe(0);
    expect(messageComparison.toPosition.diff).toBe(0);
    
    LayoutComparison.disable();
  });

  it('should store latest metrics', () => {
    LayoutComparison.enable();
    
    const dsl = 'A B';
    const rootContext = RootContext(dsl);
    
    // Initially should be null
    expect(LayoutComparison.getLatestMetrics()).toBeNull();
    
    // Old architecture
    const coordinates = new Coordinates(rootContext, mockWidthProvider);
    
    // New architecture
    const { diagram } = buildDomainModel(rootContext);
    const calculator = new LayoutCalculator(mockWidthProvider);
    const layout = calculator.calculate(diagram);
    
    const result = LayoutComparison.compare(coordinates, layout);
    
    // Should store the result
    expect(LayoutComparison.getLatestMetrics()).toBe(result);
    
    LayoutComparison.disable();
  });

  it('should handle complex layouts with multiple participants', () => {
    LayoutComparison.enable();
    
    const dsl = `
      Alice Bob Charlie
      Alice->Bob: msg1
      Bob->Charlie: msg2
    `;
    const rootContext = RootContext(dsl);
    
    // Old architecture
    const coordinates = new Coordinates(rootContext, mockWidthProvider);
    
    // New architecture
    const { diagram } = buildDomainModel(rootContext);
    const calculator = new LayoutCalculator(mockWidthProvider);
    const layout = calculator.calculate(diagram);
    
    const result = LayoutComparison.compare(coordinates, layout);
    
    expect(result).toBeDefined();
    
    // Should have all participants
    expect(result!.participantPositions).toHaveProperty('Alice');
    expect(result!.participantPositions).toHaveProperty('Bob');
    expect(result!.participantPositions).toHaveProperty('Charlie');
    
    // Should have messages
    expect(result!.messagePositions.length).toBeGreaterThan(0);
    
    // All differences should be zero or very small
    Object.values(result!.participantPositions).forEach(data => {
      expect(data.diff).toBeLessThanOrEqual(5);
    });
    
    LayoutComparison.disable();
  });
});