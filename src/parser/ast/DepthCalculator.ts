// Lazy depth calculator for AST nodes
// Calculates occurrence depth using parent references

import { MessageNode, ASTNode } from './types';

export interface DepthCalculator {
  getOccurrenceDepth(node: MessageNode, participant: string): number;
  getMaxDepthAtNode(node: MessageNode): number;
  clearCache(): void;
}

export class MessageDepthCalculator implements DepthCalculator {
  private depthCache = new Map<string, number>();
  
  getOccurrenceDepth(node: MessageNode, participant: string): number {
    const cacheKey = `${node.id}-${participant}`;
    
    if (this.depthCache.has(cacheKey)) {
      return this.depthCache.get(cacheKey)!;
    }
    
    const depth = this.calculateDepth(node);
    this.depthCache.set(cacheKey, depth);
    return depth;
  }
  
  private calculateDepth(node: MessageNode): number {
    // Count synchronous messages in ancestry
    // Each synchronous ancestor represents a level of nesting in the call stack
    let depth = 0;
    let current = node.parent;
    
    while (current) {
      if (this.isSynchronousMessage(current)) {
        // Each synchronous ancestor adds to the depth
        depth++;
      }
      current = current.parent;
    }
    
    return depth;
  }
  
  private isSynchronousMessage(node: ASTNode): boolean {
    return node.type === 'sync-message' || node.type === 'creation';
  }
  
  
  getMaxDepthAtNode(node: MessageNode): number {
    // Calculate max depth across all participants at this message
    const participants = this.getRelevantParticipants(node);
    return Math.max(0, ...participants.map(p => this.getOccurrenceDepth(node, p)));
  }
  
  private getRelevantParticipants(node: MessageNode): string[] {
    // Get all participants involved in this message and its children
    const participants = new Set<string>();
    this.collectParticipants(node, participants);
    return Array.from(participants);
  }
  
  private collectParticipants(node: MessageNode, participants: Set<string>): void {
    participants.add(node.from);
    participants.add(node.to);
    
    node.statements?.forEach(child => {
      if (child.type !== 'error') {
        this.collectParticipants(child as MessageNode, participants);
      }
    });
  }
  
  clearCache(): void {
    this.depthCache.clear();
  }
  
  // Helper method to get all ancestor messages for debugging
  getAncestorMessages(node: MessageNode): MessageNode[] {
    const ancestors: MessageNode[] = [];
    let current = node.parent;
    
    while (current) {
      if (this.isMessageNode(current)) {
        ancestors.push(current as MessageNode);
      }
      current = current.parent;
    }
    
    return ancestors;
  }
  
  private isMessageNode(node: ASTNode): boolean {
    return ['sync-message', 'async-message', 'creation', 'return'].includes(node.type);
  }
}

// Singleton instance for use across the application
export const depthCalculator = new MessageDepthCalculator();