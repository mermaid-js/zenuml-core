import { SequenceDiagram, Participant, Interaction, Fragment, Block, Statement, InteractionType, FragmentType, ParticipantType, DividerStatement, MessageStyle } from '../models/SequenceDiagram';
import sequenceParser from '@/generated-parser/sequenceParser';
import sequenceParserListener from '@/generated-parser/sequenceParserListener';
import antlr4 from 'antlr4';
import { _STARTER_ } from '@/parser/OrderedParticipants';

/**
 * Builds a domain model from the ANTLR parse tree.
 * This is the only place that knows about the parse tree structure.
 * All other parts of the system work with the domain model.
 */
export class DomainModelBuilder extends sequenceParserListener {
  private diagram: SequenceDiagram = {
    participants: new Map(),
    interactions: [],
    fragments: [],
    rootBlock: { id: 'root', statements: [] }
  };

  private participantOrder = 0;
  private idCounter = 0;
  
  // Stacks for tracking nesting
  private blockStack: Block[] = [];
  private fragmentStack: Fragment[] = [];
  private interactionStack: Interaction[] = [];
  
  // Context mapping for connecting ANTLR contexts to domain model elements
  private contextToElementMap = new Map<any, string>();

  constructor() {
    super();
    this.blockStack.push(this.diagram.rootBlock);
  }

  private generateId(type: string): string {
    return `${type}_${++this.idCounter}`;
  }

  private get currentBlock(): Block {
    return this.blockStack[this.blockStack.length - 1];
  }

  private get currentFragment(): Fragment | undefined {
    return this.fragmentStack[this.fragmentStack.length - 1];
  }

  private get currentInteraction(): Interaction | undefined {
    return this.interactionStack[this.interactionStack.length - 1];
  }

  // Title handling
  enterTitle(ctx: any) {
    this.diagram.title = ctx.TITLE_CONTENT()?.getText();
  }

  // Participant handling
  enterParticipant(ctx: any) {
    const name = ctx.name()?.getText() || '';
    const color = ctx.COLOR()?.getText();
    const participant: Participant = {
      id: name,
      name: name,
      label: ctx.label()?.name()?.getText()?.replace(/['"]/g, ''),
      type: this.mapParticipantType(ctx.participantType()?.getText()),
      stereotype: ctx.stereotype()?.getText()?.replace(/^<<|>>$/g, ''),
      width: ctx.width() ? parseInt(ctx.width().getText()) : undefined,
      color: color,
      style: color ? {
        backgroundColor: color,
        color: undefined  // Will be calculated based on background brightness
      } : undefined,
      order: this.participantOrder++
    };
    
    this.diagram.participants.set(name, participant);
  }

  private mapParticipantType(type?: string): ParticipantType {
    const typeMap: Record<string, ParticipantType> = {
      'actor': ParticipantType.ACTOR,
      '@actor': ParticipantType.ACTOR,
      'boundary': ParticipantType.BOUNDARY,
      '@boundary': ParticipantType.BOUNDARY,
      'control': ParticipantType.CONTROL,
      '@control': ParticipantType.CONTROL,
      'entity': ParticipantType.ENTITY,
      '@entity': ParticipantType.ENTITY,
      'database': ParticipantType.DATABASE,
      '@database': ParticipantType.DATABASE,
      'collections': ParticipantType.COLLECTIONS,
      '@collections': ParticipantType.COLLECTIONS,
      'queue': ParticipantType.QUEUE,
      '@queue': ParticipantType.QUEUE
    };
    
    // Check for known types first
    if (typeMap[type || '']) {
      return typeMap[type || ''];
    }
    
    // For AWS services and other custom types starting with @, preserve the type name
    // This allows @EC2, @Lambda, @S3, etc. to be passed through for icon resolution
    if (type && type.startsWith('@')) {
      return type.substring(1) as ParticipantType; // Remove @ prefix and use as type
    }
    
    return ParticipantType.PARTICIPANT;
  }

  // Message/Interaction handling
  enterMessage(ctx: any) {
    const from = ctx.From() || _STARTER_;
    const to = ctx.Owner() || '';
    const signature = ctx.SignatureText();
    
    // Ensure participants exist
    this.ensureParticipant(from);
    this.ensureParticipant(to);
    
    const interaction: Interaction = {
      id: this.generateId('interaction'),
      type: InteractionType.SYNC,
      from,
      to,
      message: signature || '',
      parent: this.currentInteraction?.id,
      children: []
    };
    
    this.diagram.interactions.push(interaction);
    this.addStatementToCurrentBlock({
      type: 'interaction',
      interactionId: interaction.id
    });
    
    // If this is a nested call, add to parent's children
    if (this.currentInteraction) {
      this.currentInteraction.children?.push(interaction);
    }
    
    this.interactionStack.push(interaction);
  }

  exitMessage(ctx: any) {
    this.interactionStack.pop();
  }

  enterAsyncMessage(ctx: any) {
    const from = ctx.From() || _STARTER_;
    const to = ctx.Owner() || '';
    
    this.ensureParticipant(from);
    this.ensureParticipant(to);
    
    const interaction: Interaction = {
      id: this.generateId('interaction'),
      type: InteractionType.ASYNC,
      from,
      to,
      message: ctx.SignatureText() || ''
    };
    
    this.diagram.interactions.push(interaction);
    this.addStatementToCurrentBlock({
      type: 'interaction',
      interactionId: interaction.id
    });
  }

  enterCreation(ctx: any) {
    const to = ctx.Owner() || '';
    const from = this.currentInteraction?.to || _STARTER_;
    
    this.ensureParticipant(from);
    this.ensureParticipant(to);
    
    const interaction: Interaction = {
      id: this.generateId('interaction'),
      type: InteractionType.CREATE,
      from,
      to,
      message: 'new'
    };
    
    this.diagram.interactions.push(interaction);
    this.addStatementToCurrentBlock({
      type: 'interaction',
      interactionId: interaction.id
    });
  }

  // Fragment handling
  enterAlt(ctx: any) {
    const fragment: Fragment = {
      id: this.generateId('fragment'),
      type: FragmentType.ALT,
      sections: [],
      parent: this.currentFragment?.id,
      comment: ctx.getComment ? ctx.getComment() : undefined
    };
    
    this.diagram.fragments.push(fragment);
    this.addStatementToCurrentBlock({
      type: 'fragment',
      fragmentId: fragment.id
    });
    
    // Store the mapping from context to fragment ID
    this.contextToElementMap.set(ctx, fragment.id);
    
    this.fragmentStack.push(fragment);
  }

  enterIfBlock(ctx: any) {
    const fragment = this.currentFragment;
    if (fragment && fragment.type === FragmentType.ALT) {
      const block: Block = {
        id: this.generateId('block'),
        statements: []
      };
      
      fragment.sections.push({
        condition: ctx.parExpr()?.condition()?.getText(),
        block
      });
      
      this.blockStack.push(block);
    }
  }

  exitIfBlock(ctx: any) {
    this.blockStack.pop();
  }

  enterElseIfBlock(ctx: any) {
    const fragment = this.currentFragment;
    if (fragment && fragment.type === FragmentType.ALT) {
      const block: Block = {
        id: this.generateId('block'),
        statements: []
      };
      
      fragment.sections.push({
        label: 'else if',
        condition: ctx.parExpr()?.condition()?.getText(),
        block
      });
      
      this.blockStack.push(block);
    }
  }

  exitElseIfBlock(ctx: any) {
    this.blockStack.pop();
  }

  enterElseBlock(ctx: any) {
    const fragment = this.currentFragment;
    if (fragment && fragment.type === FragmentType.ALT) {
      const block: Block = {
        id: this.generateId('block'),
        statements: []
      };
      
      fragment.sections.push({
        label: 'else',
        block
      });
      
      this.blockStack.push(block);
    }
  }

  exitElseBlock(ctx: any) {
    this.blockStack.pop();
  }

  exitAlt(ctx: any) {
    this.fragmentStack.pop();
  }

  // Similar implementations for opt, loop, par, etc...
  enterOpt(ctx: any) {
    const fragment: Fragment = {
      id: this.generateId('fragment'),
      type: FragmentType.OPT,
      condition: ctx.parExpr()?.condition()?.getText(),
      sections: [{
        block: {
          id: this.generateId('block'),
          statements: []
        }
      }],
      parent: this.currentFragment?.id,
      comment: ctx.getComment ? ctx.getComment() : undefined
    };
    
    this.diagram.fragments.push(fragment);
    this.addStatementToCurrentBlock({
      type: 'fragment',
      fragmentId: fragment.id
    });
    
    // Store the mapping from context to fragment ID
    this.contextToElementMap.set(ctx, fragment.id);
    
    this.fragmentStack.push(fragment);
    this.blockStack.push(fragment.sections[0].block);
  }

  exitOpt(ctx: any) {
    this.blockStack.pop();
    this.fragmentStack.pop();
  }
  
  // Loop fragment
  enterLoop(ctx: any) {
    const fragment: Fragment = {
      id: this.generateId('fragment'),
      type: FragmentType.LOOP,
      condition: ctx.parExpr()?.condition()?.getText(),
      sections: [{
        block: {
          id: this.generateId('block'),
          statements: []
        }
      }],
      parent: this.currentFragment?.id,
      comment: ctx.getComment ? ctx.getComment() : undefined
    };
    
    this.diagram.fragments.push(fragment);
    this.addStatementToCurrentBlock({
      type: 'fragment',
      fragmentId: fragment.id
    });
    
    // Store the mapping from context to fragment ID
    this.contextToElementMap.set(ctx, fragment.id);
    
    this.fragmentStack.push(fragment);
    this.blockStack.push(fragment.sections[0].block);
  }

  exitLoop(ctx: any) {
    this.blockStack.pop();
    this.fragmentStack.pop();
  }

  // Divider handling
  enterDivider(ctx: any) {
    const note = ctx.Note();
    console.log('[DomainModelBuilder] Building divider with note:', note);
    
    let text = note;
    let style: MessageStyle | undefined;
    
    // Parse style from note text
    if (note.trim().indexOf('[') === 0 && note.indexOf(']') !== -1) {
      const startIndex = note.indexOf('[');
      const endIndex = note.indexOf(']');
      const styleStr = note.slice(startIndex + 1, endIndex);
      text = note.slice(endIndex + 1);
      
      // Convert style string to MessageStyle
      const styles = styleStr.split(',').map((s: string) => s.trim());
      style = this.parseMessageStyle(styles);
    }
    
    const divider: DividerStatement = {
      type: 'divider',
      text: text.trim(),
      style
    };
    
    this.addStatementToCurrentBlock(divider);
  }
  
  private parseMessageStyle(styles: string[]): MessageStyle {
    const classNames: string[] = [];
    const textStyle: any = {};
    
    styles.forEach(style => {
      if (style.startsWith('#')) {
        // Color
        textStyle.color = style;
      } else if (style === 'bold') {
        textStyle.fontWeight = 'bold';
      } else if (style === 'italic') {
        textStyle.fontStyle = 'italic';
      } else {
        // Add as class name
        classNames.push(style);
      }
    });
    
    return {
      textStyle,
      classNames
    };
  }

  // Helper methods
  private ensureParticipant(name: string) {
    if (!this.diagram.participants.has(name)) {
      // Special handling for _STARTER_ participant
      if (name === _STARTER_) {
        // _STARTER_ should be the first participant (order 0)
        // Shift all existing participants' order by 1
        this.diagram.participants.forEach(p => {
          p.order++;
        });
        
        this.diagram.participants.set(name, {
          id: name,
          name: name,
          type: ParticipantType.PARTICIPANT,
          order: 0
        });
      } else {
        this.diagram.participants.set(name, {
          id: name,
          name: name,
          type: ParticipantType.PARTICIPANT,
          order: this.participantOrder++
        });
      }
    }
  }

  private addStatementToCurrentBlock(statement: Statement) {
    this.currentBlock.statements.push(statement);
  }

  getDiagram(): SequenceDiagram {
    return this.diagram;
  }
  
  getContextMapping(): Map<any, string> {
    return this.contextToElementMap;
  }
}

/**
 * Main entry point for converting parse tree to domain model
 */
export function buildDomainModel(parseTree: any): { diagram: SequenceDiagram; contextMapping: Map<any, string> } {
  const builder = new DomainModelBuilder();
  const walker = antlr4.tree.ParseTreeWalker.DEFAULT;
  walker.walk(builder, parseTree);
  return {
    diagram: builder.getDiagram(),
    contextMapping: builder.getContextMapping()
  };
}