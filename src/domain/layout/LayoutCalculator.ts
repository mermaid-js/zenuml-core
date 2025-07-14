import { SequenceDiagram, Participant, Interaction, Fragment, Block, DividerStatement } from '../models/SequenceDiagram';
import { DiagramLayout, ParticipantLayout, InteractionLayout, FragmentLayout, ActivationLayout, LayoutConstraints, DividerLayout } from '../models/DiagramLayout';
import { MIN_PARTICIPANT_WIDTH, MARGIN, OCCURRENCE_WIDTH, ARROW_HEAD_WIDTH, OCCURRENCE_BAR_SIDE_WIDTH } from '@/positioning/Constants';
import { TextType } from '@/positioning/Coordinate';
import { find_optimal } from '@/positioning/david/DavidEisenstat';

export type WidthProvider = (text: string, type: TextType) => number;

/**
 * Calculates layout from domain model.
 * This is a pure function that takes a domain model and returns layout information.
 * No side effects, no external dependencies.
 */
export class LayoutCalculator {
  private constraints: LayoutConstraints = {
    minParticipantWidth: MIN_PARTICIPANT_WIDTH,
    participantPadding: MARGIN,
    interactionHeight: 30,
    fragmentPadding: 10,
    activationWidth: OCCURRENCE_WIDTH,
    selfMessageWidth: 40
  };

  private participantPositions = new Map<string, number>();
  private currentY = 50;  // Start position
  private widthProvider: WidthProvider;

  constructor(widthProvider?: WidthProvider) {
    // Default width provider if none provided
    this.widthProvider = widthProvider || ((text: string) => text.length * 8);
  }

  calculate(diagram: SequenceDiagram): DiagramLayout {

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

    // Sort participants by order
    const sortedParticipants = Array.from(diagram.participants.values())
      .sort((a, b) => a.order - b.order);

    if (sortedParticipants.length === 0) {
      return layouts;
    }

    // Use the same matrix-based approach as the old architecture
    const matrix = this.buildConstraintMatrix(diagram, sortedParticipants);
    const positions = find_optimal(matrix);
    
    // Apply leftGap like the old architecture
    // In old architecture: leftGap = getParticipantGap(firstParticipant)
    // where getParticipantGap = half(p.left) + half(p.name)
    // For the first participant, p.left would be undefined/empty, so it's just half(p.name)
    const firstParticipant = sortedParticipants[0];
    const firstParticipantHalfWidth = this.calculateParticipantWidth(firstParticipant) / 2;
    // Since there's no participant to the left of the first one, we add 0 for the left half
    const leftGap = 0 + firstParticipantHalfWidth;
    
    for (let i = 0; i < sortedParticipants.length; i++) {
      const participant = sortedParticipants[i];
      const width = this.calculateParticipantWidth(participant);
      const halfWidth = width / 2;
      const position = leftGap + positions[i];

      this.participantPositions.set(participant.id, position);

      layouts.push({
        participantId: participant.id,
        bounds: {
          x: position - halfWidth,
          y: 10,
          width,
          height: 40
        },
        labelBounds: {
          x: position - halfWidth + 10,
          y: 20,
          width: width - 20,
          height: 20
        },
        lifelineX: position,
        // Additional properties for rendering
        label: participant.label || participant.name,
        type: participant.type,
        stereotype: participant.stereotype,
        isAssignee: Boolean(participant.assignee),
        style: participant.style ? {
          backgroundColor: participant.style.backgroundColor,
          color: participant.style.color
        } : undefined,
        // These would be calculated from interactions in a real implementation
        labelPositions: [],
        assigneePositions: []
      });
    }

    return layouts;
  }

  private buildConstraintMatrix(
    diagram: SequenceDiagram, 
    sortedParticipants: Participant[]
  ): number[][] {
    // Initialize matrix like old architecture
    const matrix = sortedParticipants.map((_, i) => {
      return sortedParticipants.map((v, j) => {
        // Adjacent participants have their gap constraint
        if (j - i === 1) {
          // This matches the old architecture's getParticipantGap logic:
          // gap = half(leftParticipant) + half(rightParticipant)
          const leftParticipant = sortedParticipants[i];
          const rightParticipant = v;
          const leftHalfWidth = this.calculateParticipantWidth(leftParticipant) / 2;
          const rightHalfWidth = this.calculateParticipantWidth(rightParticipant) / 2;
          return leftHalfWidth + rightHalfWidth;
        }
        return 0;
      });
    });

    // Add message constraints like old architecture
    for (const interaction of diagram.interactions) {
      const fromIndex = sortedParticipants.findIndex(p => p.id === interaction.from);
      const toIndex = sortedParticipants.findIndex(p => p.id === interaction.to);
      
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        const leftIndex = Math.min(fromIndex, toIndex);
        const rightIndex = Math.max(fromIndex, toIndex);
        
        // Calculate message width requirement
        const messageWidth = this.widthProvider(interaction.message || '', TextType.MessageContent);
        const requiredWidth = messageWidth + ARROW_HEAD_WIDTH + OCCURRENCE_WIDTH;
        
        // Set the constraint in the matrix
        matrix[leftIndex][rightIndex] = Math.max(
          requiredWidth,
          matrix[leftIndex][rightIndex]
        );
      }
    }

    return matrix;
  }

  private calculateParticipantWidth(participant: Participant): number {
    // Match old architecture width calculation
    const hasIcon = false; // TODO: check participant.icon or participant.type for icon
    const iconWidth = hasIcon ? 40 : 0;
    
    // Use width provider to measure text, matching old architecture
    const displayName = participant.label || participant.name;
    const labelWidth = this.widthProvider(displayName, TextType.ParticipantName);
    
    const baseWidth = Math.max(
      labelWidth + iconWidth,
      this.constraints.minParticipantWidth
    ) + MARGIN;
    
    return baseWidth;
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
    _nestingLevel: number
  ): InteractionLayout {
    const fromX = this.participantPositions.get(interaction.from) || 0;
    const toX = this.participantPositions.get(interaction.to) || 0;

    const isSelfMessage = interaction.from === interaction.to;

    if (isSelfMessage) {
      return {
        interactionId: interaction.id,
        type: interaction.type,
        from: interaction.from,
        to: interaction.to,
        message: interaction.message,
        isSelfMessage: true,
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
        },
        translateX: fromX,
        width: this.constraints.selfMessageWidth
      };
    }

    // Calculate proper occurrence bar positioning
    // For now, use participant center positions without incorrect nesting adjustments
    // TODO: Implement proper Anchor2-style activation layer tracking
    
    return {
      interactionId: interaction.id,
      type: interaction.type,
      from: interaction.from,
      to: interaction.to,
      message: interaction.message,
      rightToLeft: fromX > toX,
      isSelfMessage: false,
      startPoint: {
        x: fromX, // Use participant center, not adjusted by nesting
        y: this.currentY
      },
      endPoint: {
        x: toX, // Use participant center, not adjusted by nesting
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
      },
      translateX: Math.min(fromX, toX),
      width: Math.abs(toX - fromX)
    };
  }

  private calculateFragmentLayout(
    fragment: Fragment,
    diagram: SequenceDiagram,
    nestingLevel: number
  ): FragmentLayout {
    // Find participants involved in this fragment
    const involvedParticipants = this.findInvolvedParticipants(fragment, diagram);
    if (involvedParticipants.length === 0) {
      // If no participants found, use all participants
      involvedParticipants.push(...Array.from(diagram.participants.keys()));
    }

    const leftmostX = Math.min(...involvedParticipants.map(p =>
      this.participantPositions.get(p) || 0
    )) - 50;
    const rightmostX = Math.max(...involvedParticipants.map(p =>
      this.participantPositions.get(p) || 0
    )) + 50;

    const startY = this.currentY;
    const padding = this.constraints.fragmentPadding + (nestingLevel * 10);
    const paddingLeft = padding + 20; // Internal padding for content

    // Calculate transform based on leftmost participant
    const leftmostParticipant = involvedParticipants.reduce((left, p) => {
      const pos = this.participantPositions.get(p) || 0;
      const leftPos = this.participantPositions.get(left) || 0;
      return pos < leftPos ? p : left;
    });

    const leftParticipantX = this.participantPositions.get(leftmostParticipant) || 0;
    const transform = `translateX(${leftParticipantX - padding}px)`;

    const fragmentLayout: FragmentLayout = {
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
          x: paddingLeft,
          y: 5
        },
        label: section.label,
        condition: section.condition
      })),
      nestingLevel,
      comment: fragment.comment,
      style: fragment.style,
      paddingLeft,
      transform
    };

    return fragmentLayout;
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
    // Old architecture calculates width as position + half width
    const calculatedWidth = lastParticipant.lifelineX + lastParticipant.bounds.width / 2;
    // Old architecture has a minimum width of 200
    return Math.max(calculatedWidth, 200);
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