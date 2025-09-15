parser grammar sequenceParser;

options {
  tokenVocab = sequenceLexer;
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
 : participantType? stereotype? name width? label? COLOR?
 | stereotype
 | participantType
 ;

stereotype
 : SOPEN name SCLOSE
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
 : ID | CSTRING | USTRING
 ;

width
 : INT
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
 : PAR braceBlock
 | PAR
 ;

opt
 : OPT braceBlock
 | OPT
 ;

critical
  : CRITICAL (OPAR atom? CPAR)? braceBlock
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
messageBody
 : assignment (fromTo (func)? | func)?
 | fromTo (func)?
 | func
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
 : name
 ;

to
 : name
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
 : atom | (ID (COMMA ID)*) | CSTRING | USTRING
 | NEW // allowing `new = method()`
 ;

methodName
 : name
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
 : ID ASSIGN expr?
 ;

declaration
 : type ID
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

ifBlock
 : IF parExpr braceBlock
 ;

elseIfBlock
 : ELSE IF parExpr braceBlock
 ;

elseBlock
 : ELSE braceBlock
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
 ;

inExpr
 : ID IN ID
 ;
