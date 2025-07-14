import { describe, it, expect } from 'vitest';
import { LayoutCalculator } from '../LayoutCalculator';
import { Coordinates } from '@/positioning/Coordinates';
import { RootContext } from '@/parser';
import { MIN_PARTICIPANT_WIDTH, MARGIN } from '@/positioning/Constants';
import { buildDomainModel } from '@/domain/builders/DomainModelBuilder';

// Mock width provider that returns minimal widths
const mockWidthProvider = (text: string) => {
  // For single letter participants, return minimal width
  return text.length * 8;
};

describe('LayoutCalculator', () => {
  describe('participant positioning', () => {
    it('should match old Coordinates positioning for simple participants', () => {
      // Test DSL: "A B"
      const dsl = 'A B';
      const rootContext = RootContext(dsl);
      
      // Old architecture
      const coordinates = new Coordinates(rootContext, mockWidthProvider);
      
      // New architecture
      const { diagram } = buildDomainModel(rootContext);
      const calculator = new LayoutCalculator(mockWidthProvider);
      const layout = calculator.calculate(diagram);
      
      // Verify participant count
      expect(layout.participants).toHaveLength(2);
      
      // Verify positions match
      const participantA = layout.participants.find(p => p.participantId === 'A' || p.label === 'A');
      const participantB = layout.participants.find(p => p.participantId === 'B' || p.label === 'B');
      
      expect(participantA).toBeDefined();
      expect(participantB).toBeDefined();
      
      // Old architecture positions
      const oldPosA = coordinates.getPosition('A');
      const oldPosB = coordinates.getPosition('B');
      
      // New architecture positions (lifelineX is the center position)
      const newPosA = participantA!.lifelineX;
      const newPosB = participantB!.lifelineX;
      
      // Positions should match exactly
      expect(newPosA).toBe(oldPosA);
      expect(newPosB).toBe(oldPosB);
      
      // Expected values for verification
      expect(oldPosA).toBe(50); // First participant at half width (100/2)
      expect(oldPosB).toBe(150); // 50 + 50 + 50
      
      // Verify widths
      const oldWidthA = coordinates.half('A') * 2;
      const oldWidthB = coordinates.half('B') * 2;
      
      expect(participantA!.bounds.width).toBe(oldWidthA);
      expect(participantB!.bounds.width).toBe(oldWidthB);
      
      // Both should have width 100 (MIN_PARTICIPANT_WIDTH + MARGIN)
      expect(oldWidthA).toBe(MIN_PARTICIPANT_WIDTH + MARGIN);
      expect(oldWidthB).toBe(MIN_PARTICIPANT_WIDTH + MARGIN);
      
      // Verify total width
      const oldTotalWidth = coordinates.getWidth();
      const newTotalWidth = layout.width;
      
      expect(newTotalWidth).toBe(oldTotalWidth);
      expect(oldTotalWidth).toBe(200); // B position (150) + B half (50)
    });

    it('should handle three participants correctly', () => {
      const dsl = 'A B C';
      const rootContext = RootContext(dsl);
      
      // Old architecture
      const coordinates = new Coordinates(rootContext, mockWidthProvider);
      
      // New architecture
      const { diagram } = buildDomainModel(rootContext);
      const calculator = new LayoutCalculator(mockWidthProvider);
      const layout = calculator.calculate(diagram);
      
      // Get all participants
      const participantA = layout.participants.find(p => p.participantId === 'A' || p.label === 'A');
      const participantB = layout.participants.find(p => p.participantId === 'B' || p.label === 'B');
      const participantC = layout.participants.find(p => p.participantId === 'C' || p.label === 'C');
      
      // Verify positions match
      expect(participantA!.lifelineX).toBe(coordinates.getPosition('A'));
      expect(participantB!.lifelineX).toBe(coordinates.getPosition('B'));
      expect(participantC!.lifelineX).toBe(coordinates.getPosition('C'));
      
      // Verify specific positions
      expect(participantA!.lifelineX).toBe(50);  // A at 50
      expect(participantB!.lifelineX).toBe(150); // B at 150
      expect(participantC!.lifelineX).toBe(250); // C at 250
    });

    it('should handle participants with different widths', () => {
      const dsl = 'Alice Bob';
      const rootContext = RootContext(dsl);
      
      // Mock width provider that returns different widths
      const customWidthProvider = (text: string) => {
        if (text === 'Alice') return 50; // Longer name
        if (text === 'Bob') return 30;
        return text.length * 8;
      };
      
      // Old architecture
      const coordinates = new Coordinates(rootContext, customWidthProvider);
      
      // New architecture
      const { diagram } = buildDomainModel(rootContext);
      const calculator = new LayoutCalculator(mockWidthProvider);
      const layout = calculator.calculate(diagram);
      
      const alice = layout.participants.find(p => p.participantId === 'Alice' || p.label === 'Alice');
      const bob = layout.participants.find(p => p.participantId === 'Bob' || p.label === 'Bob');
      
      // Positions should still match
      expect(alice!.lifelineX).toBeCloseTo(coordinates.getPosition('Alice'), 1);
      expect(bob!.lifelineX).toBeCloseTo(coordinates.getPosition('Bob'), 1);
      
      // Widths should match
      expect(alice!.bounds.width).toBeCloseTo(coordinates.half('Alice') * 2, 1);
      expect(bob!.bounds.width).toBeCloseTo(coordinates.half('Bob') * 2, 1);
    });
  });

  describe('edge cases', () => {
    it('should handle single participant', () => {
      const dsl = 'A';
      const rootContext = RootContext(dsl);
      
      const coordinates = new Coordinates(rootContext, mockWidthProvider);
      
      const { diagram } = buildDomainModel(rootContext);
      const calculator = new LayoutCalculator(mockWidthProvider);
      const layout = calculator.calculate(diagram);
      
      expect(layout.participants).toHaveLength(1);
      
      const participantA = layout.participants[0];
      expect(participantA.lifelineX).toBe(coordinates.getPosition('A'));
      expect(participantA.lifelineX).toBe(50); // Half of width (100/2)
    });

    it('should handle empty diagram', () => {
      const dsl = '';
      const rootContext = RootContext(dsl);
      
      const { diagram } = buildDomainModel(rootContext);
      const calculator = new LayoutCalculator(mockWidthProvider);
      const layout = calculator.calculate(diagram);
      
      expect(layout.participants).toHaveLength(0);
      expect(layout.width).toBe(0);
    });
  });

  describe('layout bounds', () => {
    it('should calculate correct bounds for participants', () => {
      const dsl = 'A B';
      const rootContext = RootContext(dsl);
      
      const { diagram } = buildDomainModel(rootContext);
      const calculator = new LayoutCalculator(mockWidthProvider);
      const layout = calculator.calculate(diagram);
      
      const participantA = layout.participants[0];
      const participantB = layout.participants[1];
      
      // A should be centered at 50 with width 100
      expect(participantA.bounds.x).toBe(0);   // 50 - 50
      expect(participantA.bounds.width).toBe(100);
      expect(participantA.lifelineX).toBe(50);
      
      // B should be centered at 150 with width 100
      expect(participantB.bounds.x).toBe(100); // 150 - 50
      expect(participantB.bounds.width).toBe(100);
      expect(participantB.lifelineX).toBe(150);
    });
  });

  describe('comparison metrics', () => {
    it('should produce zero differences for matching implementations', () => {
      const dsl = 'A B';
      const rootContext = RootContext(dsl);
      
      // Old architecture
      const coordinates = new Coordinates(rootContext, mockWidthProvider);
      
      // New architecture
      const { diagram } = buildDomainModel(rootContext);
      const calculator = new LayoutCalculator(mockWidthProvider);
      const layout = calculator.calculate(diagram);
      
      // Build comparison metrics manually
      const metrics = {
        participantPositions: {} as any,
        participantWidths: {} as any,
        totalWidth: {
          old: coordinates.getWidth(),
          new: layout.width,
          diff: 0
        }
      };
      
      // Compare each participant
      for (const p of layout.participants) {
        const name = p.participantId;
        const oldPos = coordinates.getPosition(name);
        const newPos = p.lifelineX;
        
        metrics.participantPositions[name] = {
          old: oldPos,
          new: newPos,
          diff: Math.abs(newPos - oldPos)
        };
        
        const oldWidth = coordinates.half(name) * 2;
        const newWidth = p.bounds.width;
        
        metrics.participantWidths[name] = {
          old: oldWidth,
          new: newWidth,
          diff: Math.abs(newWidth - oldWidth)
        };
      }
      
      metrics.totalWidth.diff = Math.abs(metrics.totalWidth.new - metrics.totalWidth.old);
      
      // All differences should be zero
      expect(metrics.participantPositions['A'].diff).toBe(0);
      expect(metrics.participantPositions['B'].diff).toBe(0);
      expect(metrics.participantWidths['A'].diff).toBe(0);
      expect(metrics.participantWidths['B'].diff).toBe(0);
      expect(metrics.totalWidth.diff).toBe(0);
    });
  });
});