// End-to-end test for AST message transformation and depth calculation
import { describe, test, expect } from 'vitest';
import { RootContext } from '../index.js';
import { messageTransformer } from './MessageTransformer';
import { depthCalculator } from './DepthCalculator';
import type { MessageNode } from './types';

describe('AST Message Transformation and Depth Calculation', () => {
  test('should transform simple message to AST', () => {
    const code = 'A.method()';
    const rootContext = RootContext(code);
    const result = messageTransformer.transform(rootContext);
    
    expect(result.success).toBe(true);
    expect(result.ast.statements).toHaveLength(1);
    
    const message = result.ast.statements[0] as MessageNode;
    expect(message.type).toBe('sync-message');
    expect(message.to).toBe('A');
    expect(message.signature).toContain('method');
    expect(message.isSelfMessage).toBe(false);  // Implicit message from _STARTER_ to A
  });

  test('should calculate depth for nested messages', () => {
    const code = `
      A.outer() {
        B.inner() {
          C.deepest()
        }
      }
    `;
    
    const rootContext = RootContext(code);
    const result = messageTransformer.transform(rootContext);
    
    expect(result.success).toBe(true);
    
    // Collect all messages
    const messages: MessageNode[] = [];
    function collectMessages(statements: any[]): void {
      for (const stmt of statements) {
        if (stmt.type !== 'error') {
          const messageNode = stmt as MessageNode;
          messages.push(messageNode);
          if (messageNode.statements) {
            collectMessages(messageNode.statements);
          }
        }
      }
    }
    collectMessages(result.ast.statements);
    
    expect(messages).toHaveLength(3);
    
    const outerMessage = messages.find(m => m.signature.includes('outer'));
    const innerMessage = messages.find(m => m.signature.includes('inner'));
    const deepestMessage = messages.find(m => m.signature.includes('deepest'));
    
    expect(outerMessage).toBeDefined();
    expect(innerMessage).toBeDefined();
    expect(deepestMessage).toBeDefined();
    
    // Test depth calculation
    expect(depthCalculator.getOccurrenceDepth(outerMessage!, 'A')).toBe(0);
    expect(depthCalculator.getOccurrenceDepth(innerMessage!, 'B')).toBe(1); // B is called from A.outer()
    expect(depthCalculator.getOccurrenceDepth(deepestMessage!, 'C')).toBe(2); // C is called from B.inner() which is called from A.outer()
  });

  test('should handle self messages correctly', () => {
    const code = 'A->A.selfCall()';  // Explicit self message
    const rootContext = RootContext(code);
    const result = messageTransformer.transform(rootContext);
    
    expect(result.success).toBe(true);
    const message = result.ast.statements[0] as MessageNode;
    expect(message.isSelfMessage).toBe(true);
    expect(message.from).toBe('A');
    expect(message.to).toBe('A');
  });

  test('should handle creation messages', () => {
    const code = 'new Service(param)';
    const rootContext = RootContext(code);
    const result = messageTransformer.transform(rootContext);
    
    expect(result.success).toBe(true);
    const message = result.ast.statements[0] as MessageNode;
    expect(message.type).toBe('creation');
    expect(message.signature).toContain('create');
  });

  test('should handle assignment correctly', () => {
    const code = 'result = A.getValue()';
    const rootContext = RootContext(code);
    const result = messageTransformer.transform(rootContext);
    
    expect(result.success).toBe(true);
    const message = result.ast.statements[0] as MessageNode;
    expect(message.assignment).toBeDefined();
    expect(message.assignment?.assignee).toBe('result');
  });

  test('should maintain parent-child relationships', () => {
    const code = `
      A.outer() {
        B.inner()
      }
    `;
    
    const rootContext = RootContext(code);
    const result = messageTransformer.transform(rootContext);
    
    expect(result.success).toBe(true);
    
    const outerMessage = result.ast.statements[0] as MessageNode;
    expect(outerMessage.statements).toHaveLength(1);
    
    const innerMessage = outerMessage.statements![0] as MessageNode;
    expect(innerMessage.parent).toBe(outerMessage);
    expect(innerMessage.parent?.signature).toContain('outer');
  });

  test('should handle complex nested depth calculation', () => {
    const code = `
      A.start() {
        B.process() {
          C.validate() {
            D.check()
          }
          E.store()
        }
        F.finish()
      }
    `;
    
    const rootContext = RootContext(code);
    const result = messageTransformer.transform(rootContext);
    
    expect(result.success).toBe(true);
    
    // Collect all messages
    const messages: MessageNode[] = [];
    function collectMessages(statements: any[]): void {
      for (const stmt of statements) {
        if (stmt.type !== 'error') {
          const messageNode = stmt as MessageNode;
          messages.push(messageNode);
          if (messageNode.statements) {
            collectMessages(messageNode.statements);
          }
        }
      }
    }
    collectMessages(result.ast.statements);
    
    const startMessage = messages.find(m => m.signature.includes('start'));
    const processMessage = messages.find(m => m.signature.includes('process'));
    const validateMessage = messages.find(m => m.signature.includes('validate'));
    const checkMessage = messages.find(m => m.signature.includes('check'));
    const storeMessage = messages.find(m => m.signature.includes('store'));
    const finishMessage = messages.find(m => m.signature.includes('finish'));
    
    // Verify depth calculations
    expect(depthCalculator.getOccurrenceDepth(startMessage!, 'A')).toBe(0);
    expect(depthCalculator.getOccurrenceDepth(processMessage!, 'B')).toBe(1);
    expect(depthCalculator.getOccurrenceDepth(validateMessage!, 'C')).toBe(2);
    expect(depthCalculator.getOccurrenceDepth(checkMessage!, 'D')).toBe(3);
    expect(depthCalculator.getOccurrenceDepth(storeMessage!, 'E')).toBe(2); // E is called from B.process(), not from C.validate()
    expect(depthCalculator.getOccurrenceDepth(finishMessage!, 'F')).toBe(1); // F is called from A.start()
  });

  test('should handle error recovery gracefully', () => {
    const code = 'malformed syntax @#$%';
    const rootContext = RootContext(code);
    const result = messageTransformer.transform(rootContext);
    
    // Should not throw, should handle gracefully
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should cache depth calculations', () => {
    const code = `
      A.method() {
        B.nested()
      }
    `;
    
    const rootContext = RootContext(code);
    const result = messageTransformer.transform(rootContext);
    
    const messages: MessageNode[] = [];
    function collectMessages(statements: any[]): void {
      for (const stmt of statements) {
        if (stmt.type !== 'error') {
          const messageNode = stmt as MessageNode;
          messages.push(messageNode);
          if (messageNode.statements) {
            collectMessages(messageNode.statements);
          }
        }
      }
    }
    collectMessages(result.ast.statements);
    
    const nestedMessage = messages.find(m => m.signature.includes('nested'));
    
    // Calculate depth multiple times - should use cache
    const depth1 = depthCalculator.getOccurrenceDepth(nestedMessage!, 'B');
    const depth2 = depthCalculator.getOccurrenceDepth(nestedMessage!, 'B');
    const depth3 = depthCalculator.getOccurrenceDepth(nestedMessage!, 'B');
    
    expect(depth1).toBe(1);
    expect(depth2).toBe(1);
    expect(depth3).toBe(1);
    expect(depth1).toBe(depth2);
    expect(depth2).toBe(depth3);
  });
});