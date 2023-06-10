import sequenceParserListener from '../../../../../../../generated-parser/sequenceParserListener';
import antlr4 from 'antlr4';

class CreationListener extends sequenceParserListener {
  private creation = false;

  enterCreation() {
    this.creation = true;
  }

  result() {
    return this.creation;
  }
}

export function hasCreation(context: any) {
  const listener = new CreationListener();
  const walker = antlr4.tree.ParseTreeWalker.DEFAULT;
  walker.walk(listener, context);
  return listener.result();
}