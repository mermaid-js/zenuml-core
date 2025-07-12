// Debug test to understand ANTLR parser output
import { describe, test, expect } from 'vitest';
import { RootContext } from '../index.js';
import { messageTransformer } from './MessageTransformer';

describe('Debug AST Transformation', () => {
  test('should debug simple message parsing', () => {
    const code = 'A.method()';
    const rootContext = RootContext(code);
    
    console.log('RootContext:', rootContext);
    console.log('RootContext constructor:', rootContext?.constructor.name);
    console.log('RootContext methods:', Object.getOwnPropertyNames(rootContext || {}));
    console.log('RootContext proto methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(rootContext || {})));
    
    // Try to access block first
    if (rootContext?.block) {
      console.log('Has block method');
      const block = rootContext.block();
      console.log('Block:', block);
      if (block?.stat) {
        const statements = block.stat();
        console.log('Block statements:', statements);
        console.log('Statements length:', statements?.length);
      }
    }
    
    if (rootContext?.stat) {
      const statements = rootContext.stat();
      console.log('Direct statements:', statements);
      console.log('Statements length:', statements?.length);
      
      if (statements?.length > 0) {
        const firstStat = statements[0];
        console.log('First statement:', firstStat);
        console.log('First statement constructor:', firstStat?.constructor.name);
        console.log('First statement methods:', Object.getOwnPropertyNames(firstStat || {}));
        
        if (firstStat?.message) {
          const message = firstStat.message();
          console.log('Message context:', message);
          console.log('Message constructor:', message?.constructor.name);
          console.log('Message methods:', Object.getOwnPropertyNames(message || {}));
          
          // Test extraction methods
          console.log('Message From:', message?.From?.());
          console.log('Message To:', message?.To?.());
          console.log('Message Owner:', message?.Owner?.());
          console.log('Message SignatureText:', message?.SignatureText?.());
        }
      }
    }
    
    const result = messageTransformer.transform(rootContext);
    console.log('Transformation result:', result);
    console.log('Result errors:', result.errors);
    
    // This is just for debugging, so we don't need assertions
    expect(result).toBeDefined();
  });

  test('should debug self message detection', () => {
    const code = 'A->A.selfCall()';  // Explicit self message
    const rootContext = RootContext(code);
    
    const block = rootContext.block();
    const statements = block.stat();
    const firstStat = statements[0];
    const message = firstStat.message();
    
    console.log('Self message debug:');
    console.log('From:', message?.From?.());
    console.log('To:', message?.To?.());
    console.log('Owner:', message?.Owner?.());
    console.log('Are they equal?', message?.From?.() === message?.To?.());
    
    const result = messageTransformer.transform(rootContext);
    console.log('AST result:', result.ast.statements[0]);
    
    expect(result).toBeDefined();
  });
});