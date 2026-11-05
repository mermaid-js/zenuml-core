parser grammar sequenceParser;

options {
  tokenVocab = sequenceLexer;
}

@members {
  // Predicates for messageBody. See the comment on that rule.
  const P = sequenceParser;
  const NAME_START = [P.ID, P.DIGIT_LEADING_NAME, P.CSTRING, P.USTRING, P.LBRACKET, P.EMOJI_SHORTCODE];
  // After a leading name, these show a new statement: `b->c`, `b - c`, `b <- c`, `b = d()`, `b, c = d()`, `b: e`.
  const NEW_STATEMENT = [P.ARROW, P.MINUS, P.RETURN_ARROW, P.ASSIGN, P.COMMA, P.COL];
  // The offset of the token after the `emoji? name` that starts at offset i.
  this.afterName = function(i) {
    const first = this._input.LA(i);
    return i + (first === P.LBRACKET ? 4 : first === P.EMOJI_SHORTCODE ? 2 : 1);
  };
  // `A.`: the name is the target of a message, not the first signature of a func.
  this.isTargetAhead = function() {
    return this._input.LA(this.afterName(1)) === P.DOT;
  };
  // After `A.`: `b`, `b()` or `b.c()` is the func of this message. `b: e` and `b.c: e` are new statements.
  this.isFuncAhead = function() {
    let i = 1;
    while (NAME_START.includes(this._input.LA(i))) {
      i = this.afterName(i);
      if (this._input.LA(i) !== P.DOT) {
        return !NEW_STATEMENT.includes(this._input.LA(i));
      }
      i += 1;
    }
    return false;
  };
  // After `r =`: the message that follows is the assigned value.
  this.isAssignedMessageAhead = function() {
    const afterFrom = this.afterName(1);
    const hasFrom = this._input.LA(afterFrom) === P.ARROW;
    return this.isTargetAhead() || this.isFuncAhead() || (hasFrom && this._input.LA(this.afterName(afterFrom + 1)) === P.DOT);
  };
}

prog
 : title? EOF                            // An empty string is a valid prog
// | LT EOF                       // Parser auto recover from this
 | title? head EOF                       // [Perf] Removing this line does not help
 | title? head? block EOF
 ;

title
 : TITLE TITLE_CONTENT? TITLE_END?
 ;

head
 : (group | participant)+
 | (group | participant)* starterExp
 ;

// Left-factored for readability and fewer alternatives while preserving tolerance.
// Keeps behavior that `group { A }` is parsed as a group declaration (not an anonymous block).
group
 : GROUP name? (OBRACE participant* CBRACE?)?
 ;

// [Perf] Changing starter to name does not help.
starterExp
 : STARTER_LXR (OPAR starter? CPAR)?
 | ANNOTATION
 ;

starter
 : name
 ;

participant
 : participantType? stereotype? emoji? name width? label? COLOR?
 | stereotype
 | participantType
 ;

stereotype
 : SOPEN name+ SCLOSE                 // <<Service>>, << legacy system >> (multi-word)
 | SOPEN name GT?
 | (LT | SOPEN) (GT | SCLOSE)?         // Some people may write <<>> first then put in the interface name
 ;

label
 : AS name
 | AS
 ;

participantType
 : ANNOTATION
 ;

name
 : ID | DIGIT_LEADING_NAME | CSTRING | USTRING
 ;

width
 : INT
 ;

emoji
 : LBRACKET name RBRACKET
 | EMOJI_SHORTCODE
 ;

// [Perf tuning] changed from stat* to stat+ according to
// https://tomassetti.me/improving-the-performance-of-an-antlr-parser/
// This change however does not improve the perf.
block
 : stat+
 ;

ret
 : RETURN expr? SCOL?
 | ANNOTATION_RET asyncMessage EVENT_END?
 | returnAsyncMessage EVENT_END?
 ;

returnAsyncMessage
 : from RETURN_ARROW to COL content?
 | from RETURN_ARROW to?
 ;

// Design considerations:
// 1. triggered with '=='+'='*
// 1. any charactor except for newline can be used as dividerNote
// 1. it is treated as a statement
divider
 : dividerNote
 ;

dividerNote
 : DIVIDER
 ;

// [Perf] Removing par and opt would improve if/else by about 10%; consider merging loop, par and opt.
stat
 : alt
 | par
 | opt
 | critical
 | section
 | ref
 | loop
 | creation
 | message
 // Without 'EVENT_END' the change line char cannot match anything and results error
 // This change line is lexed as EVENT_END because it was in Event_Mode
 | asyncMessage EVENT_END?
 | ret
 | divider
 | tcf
 ;

par
 : PAR parExpr? braceBlock
 | PAR
 ;

opt
 : OPT parExpr? braceBlock
 | OPT
 ;

critical
  : CRITICAL parExpr? braceBlock
  | CRITICAL
 ;

// section(name) {}
section
  : SECTION (OPAR atom? CPAR)? braceBlock
  | braceBlock    // allows anonymous section. This is mostly for error tolerance (e.g. ref(x) { m1 }).
  | SECTION       // Error tolerance for incomplete section
 ;

creation
 : creationBody (SCOL | braceBlock)?
 ;

ref
 : REF OPAR (name (COMMA name*)*) CPAR SCOL?
 ;

// [Perf tuning] By removing alternative rules
// the performence improves by 1/3 (2.1s -> 1.4s).
// This means 'a = new' will be treated as error.
// [Incomplete code] The following incomplete input
// can be 'correctly'(with correct errors) parsed:
// new
// a = new
// new A(
creationBody
 : assignment? NEW construct(OPAR parameters? CPAR)?
 | assignment? NEW  // Added this so we can parse `x = new { m1 }` correctly, even though it is invalid.
 ;

message
 : messageBody (SCOL | braceBlock)?
 ;

// Message body is structured to reduce backtracking and keep runtime API stable:
// - assignment + func: supports forms like `ret = do()`
// - assignment + fromTo (+ optional func): `ret = A->B.m()` or `ret = A->B.`
// - fromTo (+ optional func): `A->B.m()` or `A->B.` and `B.m()` or `B.`
// We flatten `func` at this rule level (not inside fromTo) so
// messageBody().func() remains available for callers that rely on it.
// `A.b()` also fits `func` with `A` as its first signature, and `A.` followed by a
// new statement `b()`. `r = A.b()` also fits `r =` followed by a new statement.
// ANTLR settles such an ambiguity by reading past the end of the statement, so an
// error in the next token invalidates a complete statement, and recovery splits it
// into three messages. It always settled on the first alternative, and the
// predicates choose that alternative at once, so valid input parses the same.
messageBody
 : assignment (fromTo (func | {!this.isFuncAhead()}?) | {!this.isTargetAhead()}? func | {!this.isAssignedMessageAhead()}?)
 | fromTo (func | {!this.isFuncAhead()}?)
 | {!this.isTargetAhead()}? func
 ;

// Only the target (from/to) and dot; func is flattened at messageBody level
fromTo
 : (from ARROW)? to DOT
 ;

// func is also used in exp as parameter with expr: (to DOT)? func;
func
 : signature (DOT signature)*
 ;

from
 : emoji? name
 ;

to
 : emoji? name
 ;

signature
 : methodName invocation?
 ;

// We have removed the alternative rule with single OPAR as we are improving the editor to always close the brackets.
invocation
 : OPAR parameters? CPAR
 ;

assignment
 : (type? assignee ASSIGN)
 ;

asyncMessage
 : (from ARROW)? to COL content? // A -> B:. Incomplete async message.
 | from (MINUS | ARROW) to? // A - B. This is an intermediate state when user add 'from'.
 ;

content
 : EVENT_PAYLOAD_LXR
 ;

construct
 : name
 ;

type
 : name
 ;

assignee
 : atom | ((ID | DIGIT_LEADING_NAME) (COMMA (ID | DIGIT_LEADING_NAME))*) | CSTRING | USTRING
 | NEW // allowing `new = method()`
 ;

methodName
 : emoji? name
 ;

parameters
 : parameter (COMMA parameter)* COMMA?
 ;

// both namedParameter and expr could match 'a=1'.
// namedParameter provides more semantic context and better error recovery.
parameter
 : namedParameter | declaration | expr
 ;

namedParameter
 : (ID | DIGIT_LEADING_NAME) ASSIGN expr?
 ;

declaration
 : type (ID | DIGIT_LEADING_NAME)
 ;

// try catch finaly
tcf
 : tryBlock catchBlock* finallyBlock?
 ;

tryBlock
 : TRY braceBlock
 ;

catchBlock
 : CATCH invocation? braceBlock
 ;

finallyBlock
 : FINALLY braceBlock
 ;

alt
 : ifBlock elseIfBlock* elseBlock?
 ;

// braceBlock is optional to tolerate a missing block during typing (e.g. `if()`),
// matching the `loop` rule below. Without this, ANTLR error recovery consumes the
// following statement and the enclosing block's closing brace into the if/else body.
ifBlock
 : IF parExpr braceBlock?
 ;

elseIfBlock
 : ELSE IF parExpr braceBlock?
 ;

elseBlock
 : ELSE braceBlock?
 ;

// [Perf] After removed 'OBRACE' rule, 'A.m {' is parsed as three messages.
// We have improved our editors to always add the closing bracket (except for JetBrains IDE plugin).
// Note this different from what the ANTLR plugin gives.
braceBlock
 : OBRACE block? CBRACE
 ;

// Simplified: tolerate missing parens and/or block during typing.
loop
 : WHILE parExpr? braceBlock?
 ;

// [Perf tuning] Merging expr op expr does not help.
// Removing `func` and `creation` could improve by 5 ~ 10%, but we cannot do that.
expr
 : atom                                 #atomExpr
 | MINUS expr                           #unaryMinusExpr
 | NOT expr                             #notExpr
 | expr op=(MULT | DIV | MOD) expr      #multiplicationExpr
 | expr op=(PLUS | MINUS) expr          #additiveExpr
 | expr op=(LTEQ | GTEQ | LT | GT) expr #relationalExpr
 | expr op=(EQ | NEQ) expr              #equalityExpr
 | expr AND expr                        #andExpr
 | expr OR expr                         #orExpr
 | expr PLUS expr                       #plusExpr
 | (to DOT)? func                       #funcExpr
 | creation                             #creationExpr
 | OPAR expr CPAR                       #parenthesizedExpr
 | assignment expr                      #assignmentExpr
 ;

atom
 : (INT | FLOAT)  #numberAtom
 | NUMBER_UNIT    #numberUnitAtom
 | MONEY          #moneyAtom
 | (TRUE | FALSE) #booleanAtom
 | ID             #idAtom
 | DIGIT_LEADING_NAME #digitLeadingNameAtom
 | (CSTRING | USTRING) #stringAtom
 | NIL            #nilAtom
 ;

// [Perf tuning] Removing alternative rules does not help.
parExpr
 : OPAR condition? CPAR?
 ;

condition
 : atom
 | expr
 | inExpr
 | textExpr
 | emoji
 ;

inExpr
 : (ID | DIGIT_LEADING_NAME) IN (ID | DIGIT_LEADING_NAME)
 ;

textExpr
 : (ID | DIGIT_LEADING_NAME | NUMBER_UNIT | INT | FLOAT)+
 ;
