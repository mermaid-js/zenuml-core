import { describe, it, expect } from 'vitest';
import { buildDomainModel } from '@/domain/builders/DomainModelBuilder';
import { RootContext } from '@/parser';

describe('DomainModelBuilder - Divider Handling', () => {
  it('should correctly parse divider statements', () => {
    const code = `
      A->B: test
      == Basic Divider ==
      B->A: response
    `;
    
    const rootContext = RootContext(code);
    const result = buildDomainModel(rootContext);
    const domainModel = result.diagram;
    
    // Check that we have the divider in the root block
    const dividerStatements = domainModel.rootBlock.statements.filter(s => s.type === 'divider');
    expect(dividerStatements).toHaveLength(1);
    
    const divider = dividerStatements[0];
    expect(divider.type).toBe('divider');
    expect(divider.text).toBe('Basic Divider');
  });
  
  it('should correctly parse divider with style', () => {
    const code = `
      A->B: test
      == [red, bold] Styled Divider ==
      B->A: response
    `;
    
    const rootContext = RootContext(code);
    const result = buildDomainModel(rootContext);
    const domainModel = result.diagram;
    
    const dividerStatements = domainModel.rootBlock.statements.filter(s => s.type === 'divider');
    expect(dividerStatements).toHaveLength(1);
    
    const divider = dividerStatements[0];
    expect(divider.text).toBe('Styled Divider');
    expect(divider.style).toBeDefined();
    expect(divider.style?.classNames).toContain('red');
    expect(divider.style?.textStyle?.fontWeight).toBe('bold');
  });
  
  it('should correctly parse divider with color style', () => {
    const code = `
      A->B: test
      == [#FF0000] Red Divider ==
      B->A: response
    `;
    
    const rootContext = RootContext(code);
    const result = buildDomainModel(rootContext);
    const domainModel = result.diagram;
    
    const dividerStatements = domainModel.rootBlock.statements.filter(s => s.type === 'divider');
    const divider = dividerStatements[0];
    
    expect(divider.text).toBe('Red Divider');
    expect(divider.style?.textStyle?.color).toBe('#FF0000');
  });
});