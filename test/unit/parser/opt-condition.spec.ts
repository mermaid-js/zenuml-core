import { Fixture } from './fixture/Fixture';

describe('Opt Statement with Conditions', () => {
  it('parse opt with text condition', () => {
    const code = `
      opt(user is authenticated) {
        SecureService.getData()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.opt().parExpr()).toBeDefined();
    expect(ast.opt().parExpr().condition().textExpr().getText()).toBe('userisauthenticated');
  });

  it('parse opt with complex text condition', () => {
    const code = `
      opt(feature is enabled) {
        Feature.execute()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.opt().parExpr().condition().textExpr().getText()).toBe('featureisenabled');
  });

  it('parse opt with expression condition', () => {
    const code = `
      opt(role == "admin") {
        Admin.specialAction()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.opt().parExpr().condition().expr()).toBeDefined();
  });

  it('parse opt with empty condition (treated as no condition)', () => {
    const code = `
      opt() {
        B.method()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.opt().parExpr()).toBeDefined();
    expect(ast.opt().parExpr().condition()).toBeNull();
  });

  it('backward compatibility: opt without parens still works', () => {
    const code = `
      opt {
        A.method()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.opt().parExpr()).toBeNull();
  });

  it('parse nested opt with conditions', () => {
    const code = `
      opt(cache is enabled) {
        opt(cache size exceeds limit) {
          Cache.flush()
        }
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.opt().parExpr().condition().textExpr().getText()).toBe('cacheisenabled');
  });

  it('parse opt within if with text conditions', () => {
    const code = `
      if(session is active) {
        opt(cache size > 1000) {
          Cache.flush()
        }
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.alt().ifBlock().parExpr().condition().textExpr().getText()).toBe('sessionisactive');
  });
});
