# Parser-Specific Listener Encapsulation Solution

## Overview

This document outlines a detailed solution to encapsulate parser-specific listeners (`ToCollector`, `MessageCollector`, and `FrameBuilder`) based on the ASTNode abstraction. The current collectors are tightly coupled to ANTLR-specific contexts. This solution creates a parser-agnostic abstraction layer that allows these collectors to work with any AST implementation through the `SequenceASTNode` interface.

## Current State Analysis

### Existing Collectors

1. **ToCollector** (`src/parser/ToCollector.js`)
   - **Pattern**: Module-level state with ANTLR listener extensions
   - **Purpose**: Collects participant information from AST
   - **Issues**: Global state, ANTLR-specific, JavaScript (no type safety)

2. **MessageCollector** (`src/parser/MessageCollector.ts`)
   - **Pattern**: Class-based listener with TypeScript
   - **Purpose**: Collects messages grouped by owner participant
   - **Issues**: ANTLR-specific contexts, limited abstraction

3. **FrameBuilder** (`src/parser/FrameBuilder.ts`)
   - **Pattern**: Stack-based tree builder
   - **Purpose**: Builds frame hierarchy for fragments
   - **Issues**: ANTLR-specific, direct context manipulation

### Common Issues

- Tight coupling to ANTLR `sequenceParserListener`
- Parser-specific context handling
- Difficult to unit test without ANTLR setup
- Hard to extend for different parsers

## Solution Architecture

### 1. Abstract Collector Base Classes

#### Core Abstraction

```typescript
// src/parser/collectors/base/AbstractCollector.ts
export abstract class AbstractCollector<TResult> {
  protected isBlind = false;

  abstract collect(rootNode: SequenceASTNode): TResult;

  protected enterBlindMode(): void {
    this.isBlind = true;
  }

  protected exitBlindMode(): void {
    this.isBlind = false;
  }
}
```

#### Participant Collection Abstraction

```typescript
// src/parser/collectors/base/AbstractParticipantCollector.ts
import { Participants } from '../../Participants';
import { SequenceASTNode, ParticipantNode, MessageNode, CreationNode, FragmentNode } from '../../types/astNode.types';
import { AbstractCollector } from './AbstractCollector';

export abstract class AbstractParticipantCollector extends AbstractCollector<Participants> {
  protected participants = new Participants();
  protected groupId?: string;

  abstract visitParticipantNode(node: ParticipantNode): void;
  abstract visitMessageNode(node: MessageNode): void;
  abstract visitCreationNode(node: CreationNode): void;
  abstract visitFragmentNode(node: FragmentNode): void;

  protected resetState(): void {
    this.participants = new Participants();
    this.groupId = undefined;
    this.isBlind = false;
  }
}
```

#### Message Collection Abstraction

```typescript
// src/parser/collectors/base/AbstractMessageCollector.ts
import { OwnableMessage, OwnableMessageType } from '../../OwnableMessage';
import { SequenceASTNode, MessageNode, AsyncMessageNode, CreationNode, ReturnNode } from '../../types/astNode.types';
import { AbstractCollector } from './AbstractCollector';

export abstract class AbstractMessageCollector extends AbstractCollector<OwnableMessage[]> {
  protected ownableMessages: OwnableMessage[] = [];

  abstract visitMessageNode(node: MessageNode): void;
  abstract visitAsyncMessageNode(node: AsyncMessageNode): void;
  abstract visitCreationNode(node: CreationNode): void;
  abstract visitReturnNode(node: ReturnNode): void;

  protected resetState(): void {
    this.ownableMessages = [];
    this.isBlind = false;
  }
}
```

#### Frame Building Abstraction

```typescript
// src/parser/collectors/base/AbstractFrameBuilder.ts
import { Frame } from '@/positioning/FrameBorder';
import { SequenceASTNode, FragmentNode } from '../../types/astNode.types';
import { AbstractCollector } from './AbstractCollector';

export abstract class AbstractFrameBuilder extends AbstractCollector<Frame | null> {
  protected frameRoot: Frame | null = null;
  protected parents: Frame[] = [];

  constructor(protected orderedParticipants: string[]) {
    super();
  }

  abstract visitFragmentNode(node: FragmentNode): void;

  protected enterFragment(node: FragmentNode): void {
    const frame: Frame = {
      type: node.getFragmentType(),
      left: this.getLeftBoundary(node),
      right: this.getRightBoundary(node),
      children: [],
    };

    if (!this.frameRoot) {
      this.frameRoot = frame;
    }

    if (this.parents.length > 0) {
      this.parents[this.parents.length - 1].children?.push(frame);
    }

    this.parents.push(frame);
  }

  protected exitFragment(): void {
    this.parents.pop();
  }

  protected abstract getLeftBoundary(node: FragmentNode): string;
  protected abstract getRightBoundary(node: FragmentNode): string;

  protected resetState(): void {
    this.frameRoot = null;
    this.parents = [];
    this.isBlind = false;
  }
}
```

### 2. AST-Based Collector Implementations

#### AST Participant Collector

```typescript
// src/parser/collectors/ASTParticipantCollector.ts
import { AbstractParticipantCollector } from './base/AbstractParticipantCollector';
import { SequenceASTNode, ParticipantNode, MessageNode, CreationNode, FragmentNode } from '../types/astNode.types';
import { Participants } from '../Participants';

export class ASTParticipantCollector extends AbstractParticipantCollector {
  collect(rootNode: SequenceASTNode): Participants {
    this.resetState();
    this.traverseNode(rootNode);
    return this.participants;
  }

  private traverseNode(node: SequenceASTNode): void {
    // Handle blind mode contexts
    if (this.shouldEnterBlindMode(node)) {
      this.enterBlindMode();
    }

    // Visit specific node types
    switch (node.getType()) {
      case 'ParticipantContext':
        this.visitParticipantNode(node as ParticipantNode);
        break;
      case 'MessageContext':
        this.visitMessageNode(node as MessageNode);
        break;
      case 'CreationContext':
        this.visitCreationNode(node as CreationNode);
        break;
      case 'AltContext':
      case 'OptContext':
      case 'LoopContext':
      case 'ParContext':
      case 'CriticalContext':
      case 'SectionContext':
      case 'TcfContext':
      case 'RefContext':
        this.visitFragmentNode(node as FragmentNode);
        break;
    }

    // Traverse children
    node.getChildren().forEach(child => this.traverseNode(child));

    if (this.shouldExitBlindMode(node)) {
      this.exitBlindMode();
    }
  }

  visitParticipantNode(node: ParticipantNode): void {
    if (this.isBlind) return;

    this.participants.Add(node.getName(), {
      isStarter: node.isStarter(),
      type: node.getType(),
      stereotype: node.getStereotype(),
      width: node.getWidth(),
      groupId: this.groupId || node.getGroupId(),
      label: node.getLabel(),
      explicit: node.isExplicit(),
      color: node.getColor(),
      position: node.getRange(),
    });
  }

  visitMessageNode(node: MessageNode): void {
    if (this.isBlind) return;

    const from = node.getFrom();
    const to = node.getTo();

    if (from) {
      this.participants.Add(from, {
        isStarter: false,
        position: node.getRange(),
      });
    }

    if (to) {
      // Handle assignee logic for creation statements
      const participantInstance = this.participants.Get(to);
      if (participantInstance?.label) {
        this.participants.Add(to, { isStarter: false });
      } else {
        this.participants.Add(to, {
          isStarter: false,
          position: node.getRange(),
        });
      }
    }
  }

  visitCreationNode(node: CreationNode): void {
    if (this.isBlind) return;

    const owner = node.getOwner();
    const assignee = node.getAssignee();
    const assigneePosition = node.getAssigneePosition();

    const participantInstance = this.participants.Get(owner);

    // Skip adding participant constructor position if label is present
    if (!participantInstance?.label) {
      this.participants.Add(owner, {
        isStarter: false,
        position: node.getRange(),
        assignee,
        assigneePosition,
      });
    } else {
      this.participants.Add(owner, {
        isStarter: false,
      });
    }
  }

  visitFragmentNode(node: FragmentNode): void {
    // Handle group fragments
    if (node.getFragmentType() === 'section') {
      // Extract group information from condition
      this.groupId = node.getCondition();
    }

    // Handle ref fragments - extract participants
    if (node.getFragmentType() === 'ref') {
      // Extract participants from ref statements
      node.getStatements().forEach(statement => {
        if (statement.getType() === 'ParticipantContext') {
          const participantNode = statement as ParticipantNode;
          this.participants.Add(participantNode.getName(), {
            isStarter: false,
            position: participantNode.getRange(),
          });
        }
      });
    }
  }

  private shouldEnterBlindMode(node: SequenceASTNode): boolean {
    return node.getType() === 'ParametersContext' ||
           node.getType() === 'ConditionContext';
  }

  private shouldExitBlindMode(node: SequenceASTNode): boolean {
    return node.getType() === 'ParametersContext' ||
           node.getType() === 'ConditionContext';
  }
}
```

#### AST Message Collector

```typescript
// src/parser/collectors/ASTMessageCollector.ts
import { AbstractMessageCollector } from './base/AbstractMessageCollector';
import { SequenceASTNode, MessageNode, AsyncMessageNode, CreationNode, ReturnNode } from '../types/astNode.types';
import { OwnableMessage, OwnableMessageType } from '../OwnableMessage';

export class ASTMessageCollector extends AbstractMessageCollector {
  collect(rootNode: SequenceASTNode): OwnableMessage[] {
    this.resetState();
    this.traverseNode(rootNode);
    return this.ownableMessages;
  }

  private traverseNode(node: SequenceASTNode): void {
    if (this.shouldEnterBlindMode(node)) {
      this.enterBlindMode();
    }

    switch (node.getType()) {
      case 'MessageContext':
        this.visitMessageNode(node as MessageNode);
        break;
      case 'AsyncMessageContext':
        this.visitAsyncMessageNode(node as AsyncMessageNode);
        break;
      case 'CreationContext':
        this.visitCreationNode(node as CreationNode);
        break;
      case 'ReturnContext':
        this.visitReturnNode(node as ReturnNode);
        break;
    }

    node.getChildren().forEach(child => this.traverseNode(child));

    if (this.shouldExitBlindMode(node)) {
      this.exitBlindMode();
    }
  }

  visitMessageNode(node: MessageNode): void {
    if (this.isBlind) return;

    let signature = node.getSignature();
    const from = node.getFrom();
    const owner = node.getOwner();

    // Handle assignments
    if (from === owner && node.hasAssignment()) {
      const assignment = node.getAssignment();
      if (assignment) {
        signature = `${assignment} = ${signature}`;
      }
    }

    this.ownableMessages.push({
      from,
      signature,
      type: OwnableMessageType.SyncMessage,
      to: owner,
    });
  }

  visitAsyncMessageNode(node: AsyncMessageNode): void {
    if (this.isBlind) return;

    this.ownableMessages.push({
      from: node.getFrom(),
      signature: node.getSignature(),
      type: OwnableMessageType.AsyncMessage,
      to: node.getTo(),
    });
  }

  visitCreationNode(node: CreationNode): void {
    if (this.isBlind) return;

    this.ownableMessages.push({
      from: node.getFrom(),
      signature: node.getSignature(),
      type: OwnableMessageType.CreationMessage,
      to: node.getOwner(),
    });
  }

  visitReturnNode(node: ReturnNode): void {
    if (this.isBlind) return;

    this.ownableMessages.push({
      from: node.getFrom(),
      signature: node.getExpression() || '',
      type: OwnableMessageType.ReturnMessage,
      to: node.getTo(),
    });
  }

  private shouldEnterBlindMode(node: SequenceASTNode): boolean {
    return node.getType() === 'ParametersContext';
  }

  private shouldExitBlindMode(node: SequenceASTNode): boolean {
    return node.getType() === 'ParametersContext';
  }
}
```

#### AST Frame Builder

```typescript
// src/parser/collectors/ASTFrameBuilder.ts
import { AbstractFrameBuilder } from './base/AbstractFrameBuilder';
import { SequenceASTNode, FragmentNode, MessageNode } from '../types/astNode.types';
import { Frame } from '@/positioning/FrameBorder';

export class ASTFrameBuilder extends AbstractFrameBuilder {
  collect(rootNode: SequenceASTNode): Frame | null {
    this.resetState();
    this.traverseNode(rootNode);
    return this.frameRoot;
  }

  private traverseNode(node: SequenceASTNode): void {
    if (this.isFragmentNode(node)) {
      this.visitFragmentNode(node as FragmentNode);

      // Traverse children
      node.getChildren().forEach(child => this.traverseNode(child));

      this.exitFragment();
    } else {
      // Traverse children for non-fragment nodes
      node.getChildren().forEach(child => this.traverseNode(child));
    }
  }

  visitFragmentNode(node: FragmentNode): void {
    this.enterFragment(node);
  }

  protected getLeftBoundary(node: FragmentNode): string {
    const localParticipants = this.extractLocalParticipants(node);
    return this.orderedParticipants.find(p => localParticipants.includes(p)) || '';
  }

  protected getRightBoundary(node: FragmentNode): string {
    const localParticipants = this.extractLocalParticipants(node);
    return this.orderedParticipants
      .slice()
      .reverse()
      .find(p => localParticipants.includes(p)) || '';
  }

  private isFragmentNode(node: SequenceASTNode): boolean {
    const fragmentTypes = ['AltContext', 'OptContext', 'LoopContext', 'ParContext',
                          'CriticalContext', 'SectionContext', 'TcfContext', 'RefContext'];
    return fragmentTypes.includes(node.getType());
  }

  private extractLocalParticipants(node: FragmentNode): string[] {
    const participants: string[] = [];

    const extractFromNode = (n: SequenceASTNode): void => {
      switch (n.getType()) {
        case 'MessageContext':
          const msgNode = n as MessageNode;
          const from = msgNode.getFrom();
          const to = msgNode.getTo();
          if (from) participants.push(from);
          if (to) participants.push(to);
          break;
        // Handle other participant-containing nodes...
      }

      // Recursively extract from children
      n.getChildren().forEach(child => extractFromNode(child));
    };

    node.getStatements().forEach(statement => extractFromNode(statement));

    return [...new Set(participants)]; // Remove duplicates
  }
}
```

### 3. Factory Pattern for Collector Creation

#### Collector Factory Interface

```typescript
// src/parser/collectors/CollectorFactory.ts
import { AbstractParticipantCollector } from './base/AbstractParticipantCollector';
import { AbstractMessageCollector } from './base/AbstractMessageCollector';
import { AbstractFrameBuilder } from './base/AbstractFrameBuilder';

export interface CollectorFactory {
  createParticipantCollector(): AbstractParticipantCollector;
  createMessageCollector(): AbstractMessageCollector;
  createFrameBuilder(orderedParticipants: string[]): AbstractFrameBuilder;
}

export class ASTCollectorFactory implements CollectorFactory {
  createParticipantCollector(): AbstractParticipantCollector {
    return new ASTParticipantCollector();
  }

  createMessageCollector(): AbstractMessageCollector {
    return new ASTMessageCollector();
  }

  createFrameBuilder(orderedParticipants: string[]): AbstractFrameBuilder {
    return new ASTFrameBuilder(orderedParticipants);
  }
}
```

#### Collector Registry

```typescript
// src/parser/collectors/CollectorRegistry.ts
import { CollectorFactory, ASTCollectorFactory } from './CollectorFactory';
import { AbstractParticipantCollector } from './base/AbstractParticipantCollector';
import { AbstractMessageCollector } from './base/AbstractMessageCollector';
import { AbstractFrameBuilder } from './base/AbstractFrameBuilder';

export class CollectorRegistry {
  private static factory: CollectorFactory = new ASTCollectorFactory();

  static setFactory(factory: CollectorFactory): void {
    this.factory = factory;
  }

  static getParticipantCollector(): AbstractParticipantCollector {
    return this.factory.createParticipantCollector();
  }

  static getMessageCollector(): AbstractMessageCollector {
    return this.factory.createMessageCollector();
  }

  static getFrameBuilder(orderedParticipants: string[]): AbstractFrameBuilder {
    return this.factory.createFrameBuilder(orderedParticipants);
  }
}
```

### 4. Public API Functions

#### Unified Collection API

```typescript
// src/parser/collectors/index.ts
import { CollectorRegistry } from './CollectorRegistry';
import { SequenceASTNode } from '../types/astNode.types';
import { Participants } from '../Participants';
import { OwnableMessage } from '../OwnableMessage';
import { Frame } from '@/positioning/FrameBorder';

/**
 * Extract participants from an AST node
 */
export function getParticipants(rootNode: SequenceASTNode): Participants {
  const collector = CollectorRegistry.getParticipantCollector();
  return collector.collect(rootNode);
}

/**
 * Extract all messages from an AST node
 */
export function getAllMessages(rootNode: SequenceASTNode): OwnableMessage[] {
  const collector = CollectorRegistry.getMessageCollector();
  return collector.collect(rootNode);
}

/**
 * Build frame hierarchy from an AST node
 */
export function buildFrames(rootNode: SequenceASTNode, orderedParticipants: string[]): Frame | null {
  const builder = CollectorRegistry.getFrameBuilder(orderedParticipants);
  return builder.collect(rootNode);
}

// Re-export types and classes for external use
export { CollectorRegistry } from './CollectorRegistry';
export { CollectorFactory, ASTCollectorFactory } from './CollectorFactory';
export { AbstractParticipantCollector } from './base/AbstractParticipantCollector';
export { AbstractMessageCollector } from './base/AbstractMessageCollector';
export { AbstractFrameBuilder } from './base/AbstractFrameBuilder';
```

### 5. Legacy Compatibility Layer

#### ANTLR Adapter Wrappers

```typescript
// src/parser/collectors/adapters/LegacyCollectorAdapters.ts
import { ANTLRASTAdapter } from '../adapters/ANTLRAdapter';
import { getParticipants, getAllMessages, buildFrames } from '../collectors';
import { Participants } from '../Participants';
import { OwnableMessage } from '../OwnableMessage';
import { Frame } from '@/positioning/FrameBorder';

/**
 * Legacy adapter for ToCollector
 */
export class LegacyToCollectorAdapter {
  static getParticipants(context: any): Participants {
    const rootNode = new ANTLRASTAdapter(context);
    return getParticipants(rootNode);
  }
}

/**
 * Legacy adapter for MessageCollector
 */
export class LegacyMessageCollectorAdapter {
  static getAllMessages(context: any): OwnableMessage[] {
    const rootNode = new ANTLRASTAdapter(context);
    return getAllMessages(rootNode);
  }
}

/**
 * Legacy adapter for FrameBuilder
 */
export class LegacyFrameBuilderAdapter {
  static buildFrames(context: any, orderedParticipants: string[]): Frame | null {
    const rootNode = new ANTLRASTAdapter(context);
    return buildFrames(rootNode, orderedParticipants);
  }
}
```

### 6. Migration Strategy

#### Phase 1: Parallel Implementation

1. Implement abstract collectors alongside existing ones
2. Add comprehensive tests for new collectors
3. Ensure feature parity with legacy collectors

#### Phase 2: Gradual Migration

1. Update calling code to use new API where possible
2. Keep legacy adapters for backward compatibility
3. Monitor for regressions

#### Phase 3: Legacy Deprecation

1. Mark legacy collectors as deprecated
2. Update all internal usage to new API
3. Remove legacy collectors in future major version

## Benefits of This Solution

### 1. Parser Independence

- Collectors work with any AST implementation through `SequenceASTNode` interface
- Easy to support multiple parsers (ANTLR, Tree-sitter, custom parsers)
- Clean separation between parsing and collection logic

### 2. Type Safety

- Strong TypeScript typing throughout the abstraction layer
- Compile-time validation of collector interfaces
- Better IDE support and refactoring capabilities

### 3. Extensibility

- Easy to add new collector types
- Simple to modify existing collection logic
- Plugin-style architecture with factory pattern

### 4. Testability

- Abstract collectors can be unit tested with mock AST nodes
- No need for full parser setup in unit tests
- Better test isolation and faster test execution

### 5. Maintainability

- Clear separation of concerns
- Consistent patterns across all collectors
- Easier to understand and modify

### 6. Backward Compatibility

- Legacy ANTLR-based code continues to work
- Gradual migration path
- No breaking changes for existing consumers

## Usage Examples

### New AST-Based Usage

```typescript
// Using parser-agnostic API
const rootNode = parser.parse(sourceCode); // Returns SequenceASTNode
const participants = getParticipants(rootNode);
const messages = getAllMessages(rootNode);
const frames = buildFrames(rootNode, orderedParticipants);

// Using specific collector implementations
const participantCollector = new ASTParticipantCollector();
const participants = participantCollector.collect(rootNode);
```

### Legacy ANTLR Usage (Through Adapters)

```typescript
// Existing code continues to work
const participants = LegacyToCollectorAdapter.getParticipants(antlrContext);
const messages = LegacyMessageCollectorAdapter.getAllMessages(antlrContext);
const frames = LegacyFrameBuilderAdapter.buildFrames(antlrContext, orderedParticipants);
```

### Custom Parser Implementation

```typescript
// Example: Tree-sitter parser factory
class TreeSitterCollectorFactory implements CollectorFactory {
  createParticipantCollector(): AbstractParticipantCollector {
    return new TreeSitterParticipantCollector();
  }

  createMessageCollector(): AbstractMessageCollector {
    return new TreeSitterMessageCollector();
  }

  createFrameBuilder(orderedParticipants: string[]): AbstractFrameBuilder {
    return new TreeSitterFrameBuilder(orderedParticipants);
  }
}

// Switch to Tree-sitter collectors
CollectorRegistry.setFactory(new TreeSitterCollectorFactory());
```

## Implementation Timeline

### Week 1-2: Foundation

- [ ] Create abstract base classes
- [ ] Implement factory pattern
- [ ] Set up collector registry

### Week 3-4: Core Implementation

- [ ] Implement ASTParticipantCollector
- [ ] Implement ASTMessageCollector
- [ ] Implement ASTFrameBuilder

### Week 5-6: Integration & Testing

- [ ] Create legacy adapters
- [ ] Write comprehensive tests
- [ ] Performance benchmarking

### Week 7-8: Migration

- [ ] Update calling code
- [ ] Documentation updates
- [ ] Deprecation notices

This solution provides a robust, extensible foundation for parser-agnostic sequence diagram element collection while maintaining full backward compatibility with the existing ANTLR-based system.
