import { Fixture } from './fixture/Fixture';

describe('Text Expressions', () => {
  it('parse multi-word text expression', () => {
    const code = `
      if(has more items) {
        A.process()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.alt().ifBlock().parExpr().condition().textExpr().getText()).toBe('hasmoreitems');
  });

  it('parse text expression in loop', () => {
    const code = `
      forEach(streaming response) {
        A.process()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.loop().parExpr().condition().textExpr().getText()).toBe('streamingresponse');
  });

  it('parse very long text expression', () => {
    const code = `
      if(this is a very long condition that will be displayed with truncation) {
        A.method()
      }
    `;

    const ast = Fixture.firstStatement(code);
    const textExpr = ast.alt().ifBlock().parExpr().condition().textExpr();
    expect(textExpr).toBeDefined();
    expect(textExpr.getText().length).toBeGreaterThan(10);
  });

  it('parse text expression with multiple words in par', () => {
    const code = `
      par(concurrent processing) {
        A.work()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.par().parExpr().condition().textExpr().getText()).toBe('concurrentprocessing');
  });
});
