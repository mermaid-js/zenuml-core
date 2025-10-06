import { Fixture } from './fixture/Fixture';

describe('Loop Statement with Text Conditions', () => {
  it('parse loop with multi-word text condition', () => {
    const code = `
      forEach(streaming response) {
        Server.sendChunk()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.loop().parExpr().condition().textExpr()).toBeDefined();
    expect(ast.loop().parExpr().condition().textExpr().getText()).toBe('streamingresponse');
  });

  it('parse loop with natural language condition', () => {
    const code = `
      loop(more data available) {
        DataService.fetchBatch()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.loop().parExpr().condition().textExpr().getText()).toBe('moredataavailable');
  });

  it('parse nested loop with text conditions', () => {
    const code = `
      loop(processing items) {
        loop(streaming chunks) {
          A.process()
        }
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.loop().parExpr().condition().textExpr().getText()).toBe('processingitems');
  });

  it('backward compatibility: loop with expression still works', () => {
    const code = `
      forEach(count < 10) {
        A.doWork()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.loop().parExpr().condition().expr()).toBeDefined();
  });

  it('backward compatibility: loop with in-expression still works', () => {
    const code = `
      forEach(x in xes) {
        A.method()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.loop().parExpr().condition().inExpr()).toBeDefined();
  });

  it('parse loop with empty condition', () => {
    const code = `
      loop() {
        A.process()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.loop().parExpr().condition()).toBeNull();
  });
});
