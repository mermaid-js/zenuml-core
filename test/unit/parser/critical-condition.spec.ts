import { Fixture } from './fixture/Fixture';

describe('Critical Statement with Full Expressions', () => {
  it('parse critical with text condition', () => {
    const code = `
      critical(resource is locked) {
        Resource.access()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.critical().parExpr()).toBeDefined();
    expect(ast.critical().parExpr().condition().textExpr().getText()).toBe('resourceislocked');
  });

  it('parse critical with expression condition', () => {
    const code = `
      critical(semaphore.count > 0) {
        SharedResource.modify()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.critical().parExpr().condition().expr()).toBeDefined();
  });

  it('parse critical with complex expression', () => {
    const code = `
      critical(lock.acquired && timeout < 1000) {
        CriticalSection.execute()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.critical().parExpr().condition().expr()).toBeDefined();
  });

  it('parse critical with natural language condition', () => {
    const code = `
      critical(database transaction) {
        AuditLog.recordLogin()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.critical().parExpr().condition().textExpr().getText()).toBe('databasetransaction');
  });

  it('parse critical with empty condition', () => {
    const code = `
      critical() {
        A.method()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.critical().parExpr()).toBeDefined();
    expect(ast.critical().parExpr().condition()).toBeNull();
  });

  it('backward compatibility: critical without parens still works', () => {
    const code = `
      critical {
        A.method()
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.critical().parExpr()).toBeNull();
  });

  it('parse nested critical with conditions', () => {
    const code = `
      critical(outer lock acquired) {
        critical(inner lock acquired) {
          A.work()
        }
      }
    `;

    const ast = Fixture.firstStatement(code);
    expect(ast.critical().parExpr().condition().textExpr().getText()).toBe('outerlockacquired');
  });
});
