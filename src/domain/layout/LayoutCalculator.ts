import { SequenceDiagram, Participant, Interaction, Fragment, Block, Statement, DividerStatement } from '../models/SequenceDiagram';
import { DiagramLayout, ParticipantLayout, InteractionLayout, FragmentLayout, ActivationLayout, BoundingBox, Point, LayoutConstraints, DividerLayout } from '../models/DiagramLayout';

/**
 * Calculates layout from domain model.
 * This is a pure function that takes a domain model and returns layout information.
 * No side effects, no external dependencies.
 */
export class LayoutCalculator {
  private constraints: LayoutConstraints = {
    minParticipantWidth: 100,
    participantPadding: 50,
    interactionHeight: 30,
    fragmentPadding: 10,
    activationWidth: 15,
    selfMessageWidth: 40
  };

  private participantPositions = new Map<string, number>();
  private currentY = 50;  // Start position

  calculate(diagram: SequenceDiagram): DiagramLayout {
    console.log('[LayoutCalculator] Calculating layout for diagram');
    console.log('  - Participants:', diagram.participants.size);
    console.log('  - Interactions:', diagram.interactions.length);
    console.log('  - Fragments:', diagram.fragments.length);
    
    // Step 1: Calculate participant positions
    const participants = this.calculateParticipantLayouts(diagram);
    
    // Step 2: Process root block to calculate vertical positions
    const { interactions, fragments, activations, dividers } = this.processBlock(
      diagram.rootBlock,
      diagram,
      0  // nesting level
    );
    
    // Step 3: Calculate lifeline heights
    const lifelines = this.calculateLifelineLayouts(participants, this.currentY);
    
    // Step 4: Calculate total dimensions
    const width = this.calculateTotalWidth(participants);
    const height = this.currentY + 50;  // Add bottom padding
    
    return {
      width,
      height,
      participants,
      lifelines,
      interactions,
      fragments,
      activations,
      dividers
    };
  }

  private calculateParticipantLayouts(diagram: SequenceDiagram): ParticipantLayout[] {
    const layouts: ParticipantLayout[] = [];
    let currentX = 50;  // Left margin
    
    // Sort participants by order
    const sortedParticipants = Array.from(diagram.participants.values())
      .sort((a, b) => a.order - b.order);
    
    for (const participant of sortedParticipants) {
      const width = this.calculateParticipantWidth(participant);
      const centerX = currentX + width / 2;
      
      this.participantPositions.set(participant.id, centerX);
      
      layouts.push({
        participantId: participant.id,
        bounds: {
          x: currentX,
          y: 10,
          width,
          height: 40
        },
        labelBounds: {
          x: currentX + 10,
          y: 20,
          width: width - 20,
          height: 20
        },
        lifelineX: centerX,
        // Additional properties for rendering
        label: participant.label || participant.name,
        type: participant.type,
        stereotype: participant.stereotype,
        isAssignee: participant.name.includes(':'),
        style: participant.style ? {
          backgroundColor: participant.style.backgroundColor,
          color: participant.style.color
        } : undefined,
        // These would be calculated from interactions in a real implementation
        labelPositions: [],
        assigneePositions: []
      });
      
      currentX += width + this.constraints.participantPadding;
    }
    
    return layouts;
  }

  private calculateParticipantWidth(participant: Participant): number {
    // In real implementation, would measure text
    const labelWidth = (participant.label || participant.name).length * 8;
    return Math.max(
      this.constraints.minParticipantWidth,
      participant.width || 0,
      labelWidth + 20
    );
  }

  private processBlock(
    block: Block,
    diagram: SequenceDiagram,
    nestingLevel: number
  ): {
    interactions: InteractionLayout[];
    fragments: FragmentLayout[];
    activations: ActivationLayout[];
    dividers: DividerLayout[];
  } {
    const interactions: InteractionLayout[] = [];
    const fragments: FragmentLayout[] = [];
    const activations: ActivationLayout[] = [];
    const dividers: DividerLayout[] = [];
    
    for (const statement of block.statements) {
      switch (statement.type) {
        case 'interaction':
          const interaction = diagram.interactions.find(
            i => i.id === statement.interactionId
          );
          if (interaction) {
            const layout = this.calculateInteractionLayout(interaction, nestingLevel);
            interactions.push(layout);
            
            // Add activation if sync
            if (interaction.type === 'sync' || interaction.type === 'create') {
              activations.push(this.createActivation(interaction, layout));
            }
            
            this.currentY += this.constraints.interactionHeight;
          }
          break;
          
        case 'fragment':
          const fragment = diagram.fragments.find(
            f => f.id === statement.fragmentId
          );
          if (fragment) {
            const fragmentLayout = this.calculateFragmentLayout(
              fragment,
              diagram,
              nestingLevel
            );
            fragments.push(fragmentLayout);
            
            // Process fragment sections
            for (const section of fragment.sections) {
              const sectionResult = this.processBlock(
                section.block,
                diagram,
                nestingLevel + 1
              );
              interactions.push(...sectionResult.interactions);
              fragments.push(...sectionResult.fragments);
              activations.push(...sectionResult.activations);
              dividers.push(...sectionResult.dividers);
            }
          }
          break;
          
        case 'divider':
          console.log('[LayoutCalculator] Processing divider statement:', statement);
          const dividerLayout = this.calculateDividerLayout(
            statement as DividerStatement,
            diagram
          );
          dividers.push(dividerLayout);
          this.currentY += 20;
          break;
          
        case 'comment':
          this.currentY += 15;
          break;
      }
    }
    
    return { interactions, fragments, activations, dividers };
  }

  private calculateInteractionLayout(
    interaction: Interaction,
    nestingLevel: number
  ): InteractionLayout {
    const fromX = this.participantPositions.get(interaction.from) || 0;
    const toX = this.participantPositions.get(interaction.to) || 0;
    
    const isSelfMessage = interaction.from === interaction.to;
    
    if (isSelfMessage) {
      return {
        interactionId: interaction.id,
        type: interaction.type,
        startPoint: { x: fromX, y: this.currentY },
        endPoint: { x: fromX + this.constraints.selfMessageWidth, y: this.currentY + 20 },
        labelBounds: {
          x: fromX + 10,
          y: this.currentY - 10,
          width: this.constraints.selfMessageWidth,
          height: 15
        },
        arrowStyle: {
          lineType: interaction.type === 'return' ? 'dashed' : 'solid',
          arrowHead: interaction.type === 'async' ? 'open' : 'filled',
          selfMessage: {
            width: this.constraints.selfMessageWidth,
            height: 20
          }
        }
      };
    }
    
    return {
      interactionId: interaction.id,
      type: interaction.type,
      startPoint: {
        x: fromX + (nestingLevel * this.constraints.activationWidth),
        y: this.currentY
      },
      endPoint: {
        x: toX - (nestingLevel * this.constraints.activationWidth),
        y: this.currentY
      },
      labelBounds: {
        x: Math.min(fromX, toX) + 10,
        y: this.currentY - 15,
        width: Math.abs(toX - fromX) - 20,
        height: 15
      },
      arrowStyle: {
        lineType: interaction.type === 'return' ? 'dashed' : 'solid',
        arrowHead: interaction.type === 'async' ? 'open' : 'filled'
      }
    };
  }

  private calculateFragmentLayout(
    fragment: Fragment,
    diagram: SequenceDiagram,
    nestingLevel: number
  ): FragmentLayout {
    // Find participants involved in this fragment
    const involvedParticipants = this.findInvolvedParticipants(fragment, diagram);
    const leftmostX = Math.min(...involvedParticipants.map(p => 
      this.participantPositions.get(p) || 0
    )) - 50;
    const rightmostX = Math.max(...involvedParticipants.map(p => 
      this.participantPositions.get(p) || 0
    )) + 50;
    
    const startY = this.currentY;
    const padding = this.constraints.fragmentPadding * nestingLevel;
    
    return {
      fragmentId: fragment.id,
      type: fragment.type,
      bounds: {
        x: leftmostX - padding,
        y: startY,
        width: rightmostX - leftmostX + 2 * padding,
        height: 100  // Will be adjusted after processing content
      },
      headerBounds: {
        x: leftmostX - padding,
        y: startY,
        width: 80,
        height: 25
      },
      sections: fragment.sections.map((section, index) => ({
        bounds: {
          x: leftmostX - padding,
          y: startY + 25 + (index * 50),  // Will be adjusted
          width: rightmostX - leftmostX + 2 * padding,
          height: 50  // Will be adjusted
        },
        contentOffset: {
          x: padding,
          y: 5
        }
      })),
      nestingLevel
    };
  }

  private createActivation(
    interaction: Interaction,
    layout: InteractionLayout
  ): ActivationLayout {
    return {
      participantId: interaction.to,
      bounds: {
        x: layout.endPoint.x - this.constraints.activationWidth / 2,
        y: layout.endPoint.y,
        width: this.constraints.activationWidth,
        height: 40  // Will be adjusted based on nested calls
      },
      level: 0  // Will be calculated based on active activations
    };
  }

  private calculateLifelineLayouts(
    participants: ParticipantLayout[],
    maxY: number
  ) {
    return participants.map(p => ({
      participantId: p.participantId,
      x: p.lifelineX,
      startY: p.bounds.y + p.bounds.height,
      endY: maxY
    }));
  }

  private calculateTotalWidth(participants: ParticipantLayout[]): number {
    if (participants.length === 0) return 0;
    const lastParticipant = participants[participants.length - 1];
    return lastParticipant.bounds.x + lastParticipant.bounds.width + 50;
  }

  private findInvolvedParticipants(
    fragment: Fragment,
    diagram: SequenceDiagram
  ): string[] {
    const participants = new Set<string>();
    
    // Find all interactions in this fragment's blocks
    for (const section of fragment.sections) {
      this.collectParticipantsFromBlock(section.block, diagram, participants);
    }
    
    return Array.from(participants);
  }

  private collectParticipantsFromBlock(
    block: Block,
    diagram: SequenceDiagram,
    participants: Set<string>
  ) {
    for (const statement of block.statements) {
      if (statement.type === 'interaction') {
        const interaction = diagram.interactions.find(
          i => i.id === statement.interactionId
        );
        if (interaction) {
          participants.add(interaction.from);
          participants.add(interaction.to);
        }
      } else if (statement.type === 'fragment') {
        const fragment = diagram.fragments.find(
          f => f.id === statement.fragmentId
        );
        if (fragment) {
          for (const section of fragment.sections) {
            this.collectParticipantsFromBlock(section.block, diagram, participants);
          }
        }
      }
    }
  }
  
  private calculateDividerLayout(
    divider: DividerStatement,
    diagram: SequenceDiagram
  ): DividerLayout {
    // Get the rightmost participant to determine diagram width
    const sortedParticipants = Array.from(diagram.participants.values())
      .sort((a, b) => a.order - b.order);
    
    const rightmostParticipant = sortedParticipants[sortedParticipants.length - 1];
    const rightmostPosition = this.participantPositions.get(rightmostParticipant?.id || '') || 0;
    
    // Divider spans from left edge to beyond rightmost participant
    const dividerWidth = rightmostPosition + 50; // Add some padding
    
    return {
      bounds: {
        x: 10, // Start from left margin
        y: this.currentY,
        width: dividerWidth,
        height: 20
      },
      labelBounds: {
        x: dividerWidth / 2 - 50, // Center the label
        y: this.currentY + 2,
        width: 100,
        height: 16
      },
      text: divider.text,
      style: divider.style
    };
  }
}