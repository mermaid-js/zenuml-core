import { Fixture } from './fixture/Fixture';

describe('Par Statement with Conditions', () => {
  it('parse par with text condition', () => {
    const code = `
      par(concurrent processing) {
        ServiceA.process()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.par().parExpr()).toBeDefined();
    expect(ast.par().parExpr().condition().textExpr().getText()).toBe('concurrentprocessing');
  });

  it('parse par with complex text condition', () => {
    const code = `
      par(multiple workers available) {
        Worker1.execute()
        Worker2.execute()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.par().parExpr().condition().textExpr().getText()).toBe('multipleworkersavailable');
  });

  it('parse par with expression condition', () => {
    const code = `
      par(threads > 1) {
        Worker1.execute()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.par().parExpr().condition().expr()).toBeDefined();
  });

  it('parse par with empty condition (treated as no condition)', () => {
    const code = `
      par() {
        A.method()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.par().parExpr()).toBeDefined();
    expect(ast.par().parExpr().condition()).toBeNull();
  });

  it('backward compatibility: par without parens still works', () => {
    const code = `
      par {
        A.method()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.par().parExpr()).toBeNull();
  });

  it('parse nested par with conditions', () => {
    const code = `
      par(distributed processing) {
        par(parallel tasks) {
          A.work()
        }
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.par().parExpr().condition().textExpr().getText()).toBe('distributedprocessing');
  });
});
