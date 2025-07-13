import { describe, it, expect } from 'vitest';
import { buildDomainModel } from '@/domain/builders/DomainModelBuilder';
import { RootContext } from '@/parser';
import { ParticipantType } from '@/domain/models/SequenceDiagram';

describe('DomainModelBuilder - Participant Features', () => {
  it('should extract participant with color', () => {
    const code = `
      A #ff0000
      A->B: test
    `;
    
    const rootContext = RootContext(code);
    const result = buildDomainModel(rootContext);
    const domainModel = result.diagram;
    
    const participantA = domainModel.participants.get('A');
    expect(participantA).toBeDefined();
    expect(participantA?.color).toBe('#ff0000');
    expect(participantA?.style?.backgroundColor).toBe('#ff0000');
  });
  
  it('should extract participant with label', () => {
    const code = `
      A as "Alice System"
      A->B: test
    `;
    
    const rootContext = RootContext(code);
    const result = buildDomainModel(rootContext);
    const domainModel = result.diagram;
    
    const participantA = domainModel.participants.get('A');
    expect(participantA).toBeDefined();
    expect(participantA?.label).toBe('Alice System');
  });
  
  it('should extract participant with type', () => {
    const code = `
      @actor A
      A->B: test
    `;
    
    const rootContext = RootContext(code);
    const result = buildDomainModel(rootContext);
    const domainModel = result.diagram;
    
    const participantA = domainModel.participants.get('A');
    expect(participantA).toBeDefined();
    expect(participantA?.type).toBe(ParticipantType.ACTOR);
  });
  
  it('should extract participant with all features', () => {
    const code = `
      @actor <<Repo>> A 200 as "Alice" #ff0000
      A->B: test
    `;
    
    const rootContext = RootContext(code);
    const result = buildDomainModel(rootContext);
    const domainModel = result.diagram;
    
    const participantA = domainModel.participants.get('A');
    expect(participantA).toBeDefined();
    expect(participantA?.type).toBe(ParticipantType.ACTOR);
    expect(participantA?.stereotype).toBe('Repo');
    expect(participantA?.width).toBe(200);
    expect(participantA?.label).toBe('Alice');
    expect(participantA?.color).toBe('#ff0000');
  });
});