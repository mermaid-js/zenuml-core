import { atom } from 'jotai';
import { rootContextAtom } from '@/store/Store';
import { buildDomainModel } from '@/domain/builders/DomainModelBuilder';
import { LayoutCalculator } from '@/domain/layout/LayoutCalculator';
import { SequenceDiagram } from '@/domain/models/SequenceDiagram';
import { DiagramLayout } from '@/domain/models/DiagramLayout';

/**
 * Bridge between old and new architecture.
 * These atoms provide the new domain model and layout while keeping the old system working.
 */

// Domain model derived from parse tree
export const domainModelAtom = atom<SequenceDiagram | null>((get) => {
  const rootContext = get(rootContextAtom);
  if (!rootContext) {
    console.log('[DomainModelStore] No root context available');
    return null;
  }
  
  try {
    // Convert parse tree to domain model (single traversal)
    console.log('[DomainModelStore] Building domain model from root context');
    return buildDomainModel(rootContext);
  } catch (error) {
    console.error('Failed to build domain model:', error);
    return null;
  }
});

// Layout calculated from domain model
export const diagramLayoutAtom = atom<DiagramLayout | null>((get) => {
  const domainModel = get(domainModelAtom);
  if (!domainModel) {
    console.log('[DomainModelStore] No domain model available for layout');
    return null;
  }
  
  try {
    // Calculate layout from domain model (pure calculation)
    console.log('[DomainModelStore] Calculating layout from domain model');
    const calculator = new LayoutCalculator();
    const layout = calculator.calculate(domainModel);
    console.log('[DomainModelStore] Layout calculated:', {
      participants: layout.participants.length,
      dividers: layout.dividers.length,
      interactions: layout.interactions.length
    });
    return layout;
  } catch (error) {
    console.error('Failed to calculate layout:', error);
    return null;
  }
});

// Convenience selectors for specific data
export const participantsFromDomainAtom = atom((get) => {
  const model = get(domainModelAtom);
  return model?.participants || new Map();
});

export const interactionsFromDomainAtom = atom((get) => {
  const model = get(domainModelAtom);
  return model?.interactions || [];
});

export const fragmentsFromDomainAtom = atom((get) => {
  const model = get(domainModelAtom);
  return model?.fragments || [];
});

/**
 * Adapter functions to help migrate components gradually
 */

// Get participant info without parse tree navigation
export function getParticipantFromDomain(
  domainModel: SequenceDiagram,
  participantId: string
) {
  return domainModel.participants.get(participantId);
}

// Get interactions for a specific block without visitor pattern
export function getInteractionsInBlock(
  domainModel: SequenceDiagram,
  blockId: string
) {
  // Find all interaction statements in the block
  const block = findBlockById(domainModel, blockId);
  if (!block) return [];
  
  return block.statements
    .filter(s => s.type === 'interaction')
    .map(s => domainModel.interactions.find(i => i.id === s.interactionId))
    .filter(Boolean);
}

// Get local participants for a fragment without parse tree walking
export function getLocalParticipantsForFragment(
  domainModel: SequenceDiagram,
  fragmentId: string
): string[] {
  const fragment = domainModel.fragments.find(f => f.id === fragmentId);
  if (!fragment) return [];
  
  const participants = new Set<string>();
  
  // Collect from all sections
  for (const section of fragment.sections) {
    collectParticipantsFromBlock(domainModel, section.block, participants);
  }
  
  return Array.from(participants);
}

function findBlockById(model: SequenceDiagram, blockId: string): any {
  // Search in root block
  if (model.rootBlock.id === blockId) return model.rootBlock;
  
  // Search in fragments
  for (const fragment of model.fragments) {
    for (const section of fragment.sections) {
      if (section.block.id === blockId) return section.block;
    }
  }
  
  return null;
}

function collectParticipantsFromBlock(
  model: SequenceDiagram,
  block: any,
  participants: Set<string>
) {
  for (const statement of block.statements) {
    if (statement.type === 'interaction') {
      const interaction = model.interactions.find(i => i.id === statement.interactionId);
      if (interaction) {
        participants.add(interaction.from);
        participants.add(interaction.to);
      }
    } else if (statement.type === 'fragment') {
      const fragment = model.fragments.find(f => f.id === statement.fragmentId);
      if (fragment) {
        for (const section of fragment.sections) {
          collectParticipantsFromBlock(model, section.block, participants);
        }
      }
    }
  }
}