import antlr4 from 'antlr4';
import { default as sequenceLexer } from '../generated-parser/sequenceLexer';
import { default as sequenceParser } from '../generated-parser/sequenceParser';
import ToCollector from './ToCollector';
import ChildFragmentDetector from './ChildFragmentDetecotr';
import './TitleContext';
import './IsCurrent';
import './Owner';
import './ProgContext';
import './RetContext';
import './Origin';
import './Divider/DividerContext';
import './SignatureText';
import './Messages/MessageContext';
import './From';
import './key/Key';
import './IsInitedFromOccurrence';
import './utils/cloest-ancestor/ClosestAncestor';
import { formatText } from '../utils/StringUtil';

const errors = [];
class SeqErrorListener extends antlr4.error.ErrorListener {
  syntaxError(recognizer, offendingSymbol, line, column, msg) {
    errors.push(`${offendingSymbol} line ${line}, col ${column}: ${msg}`);
  }
}

function getRootContextTokens(code){
  var now=new Date();
  const chars = new antlr4.InputStream(code);
  now=printCostTime("new antlr4.InputStream(code)",now);
  const lexer = new sequenceLexer(chars);
  now=printCostTime("const lexer = new sequenceLexer(chars);",now);
  const tokens = new antlr4.CommonTokenStream(lexer);
  now=printCostTime("const tokens = new antlr4.CommonTokenStream(lexer);",now);
  return tokens;
}

function printCostTime(methodName,lastTime)
{
   var now=new Date().getTime();;
   var diff = now - lastTime;
  var seconds = Math.floor(diff / 1000);  // 计算秒数
  var milliseconds = diff % 1000;  // 计算剩余的毫秒数

  var result = seconds + " s " + milliseconds + " ms";
    console.log(methodName+" cost: "+result);
    return new Date().getTime();;
}

function rootContext(code,tokens) {
  var now=new Date().getTime();;
  var tempNow=now;
  try{
    if(!tokens){
      tokens=getRootContextTokens(code);
      tempNow=printCostTime("tokens=getRootContextTokens(code);",tempNow);
    }
    const parser = new sequenceParser(tokens);
    tempNow=printCostTime("const parser = new sequenceParser(tokens);",tempNow);
    parser.addErrorListener(new SeqErrorListener());
    tempNow=printCostTime("parser.addErrorListener(new SeqErrorListener());",tempNow);
    var r= parser._syntaxErrors ? null : parser.prog();
    tempNow=printCostTime("var r= parser._syntaxErrors ? null : parser.prog();",tempNow);
    tempNow=printCostTime("rootContext parser finish",now);
    return r;

  }catch(ex){
    console.log(ex);
  }
}

antlr4.ParserRuleContext.prototype.getFormattedText = function () {
  const code = this.parser.getTokenStream().getText(this.getSourceInterval());
  // remove extra quotes, spaces and new lines
  return formatText(code);
};

// Comment is where users have the most flexibility. The parser should make minimal assumptions about
// the content and the style including change of line, indentation, etc.
antlr4.ParserRuleContext.prototype.getComment = function () {
  let tokenIndex = this.start.tokenIndex;
  let channel = sequenceLexer.channelNames.indexOf('COMMENT_CHANNEL');
  if (this.constructor.name === 'BraceBlockContext') {
    tokenIndex = this.stop.tokenIndex;
  }
  let hiddenTokensToLeft = this.parser.getTokenStream().getHiddenTokensToLeft(tokenIndex, channel);
  return (
    hiddenTokensToLeft &&
    hiddenTokensToLeft
      .map((t) => t.text.substring(2)) // skip '//'
      .join('')
  );
};

antlr4.ParserRuleContext.prototype.returnedValue = function () {
  return this.braceBlock().block().ret().value();
};

export const ProgContext = sequenceParser.ProgContext;
export const RootContext = rootContext;
export const RootContextTokens = getRootContextTokens;
export const GroupContext = sequenceParser.GroupContext;
export const ParticipantContext = sequenceParser.ParticipantContext;
export const Depth = function (ctx) {
  const childFragmentDetector = ChildFragmentDetector;
  return childFragmentDetector.depth(childFragmentDetector)(ctx);
};
export const Participants = function (ctx, withStarter) {
  const toCollector = ToCollector;
  return toCollector.getParticipants(ctx, withStarter);
};

export default {
  RootContext: rootContext,
  RootContextTokens: getRootContextTokens,
  ProgContext: sequenceParser.ProgContext,
  GroupContext: sequenceParser.GroupContext,
  ParticipantContext: sequenceParser.ParticipantContext,
  Participants: function (ctx, withStarter) {
    const toCollector = ToCollector;
    return toCollector.getParticipants(ctx, withStarter);
  },
  Errors: errors,
  /**
   * @return {number} how many levels of embedded fragments
   */
  Depth: function (ctx) {
    const childFragmentDetector = ChildFragmentDetector;
    return childFragmentDetector.depth(childFragmentDetector)(ctx);
  },
};
