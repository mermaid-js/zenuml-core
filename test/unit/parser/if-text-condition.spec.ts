import { Fixture } from './fixture/Fixture';

describe('If Statement with Text Conditions', () => {
  it('parse if with multi-word text condition', () => {
    const code = `
      if(has more items) {
        A.processNext()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.alt().ifBlock().parExpr().condition().textExpr()).toBeDefined();
  });

  it('parse if-else with text conditions', () => {
    const code = `
      if(user is authenticated) {
        A.showDashboard()
      } else {
        A.showLogin()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.alt().ifBlock().parExpr().condition().textExpr().getText()).toBe('userisauthenticated');
  });

  it('parse if-elseif with text conditions', () => {
    const code = `
      if(user is admin) {
        A.adminAction()
      } else if(user is moderator) {
        A.moderatorAction()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.alt().ifBlock().parExpr().condition().textExpr().getText()).toBe('userisadmin');
    expect(ast.alt().elseIfBlock()[0].parExpr().condition().textExpr().getText()).toBe('userismoderator');
  });

  it('parse nested if with text conditions', () => {
    const code = `
      if(session is active) {
        if(permissions are valid) {
          A.proceed()
        }
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.alt().ifBlock().parExpr().condition().textExpr().getText()).toBe('sessionisactive');
  });

  it('backward compatibility: if with expression still works', () => {
    const code = `
      if(count > 0) {
        A.process()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.alt().ifBlock().parExpr().condition().expr()).toBeDefined();
  });

  it('backward compatibility: if with quoted string still works', () => {
    const code = `
      if("some condition") {
        A.process()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.alt().ifBlock().parExpr().condition().atom()).toBeDefined();
  });
});
