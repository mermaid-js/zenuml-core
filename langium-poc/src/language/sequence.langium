grammar Sequence

// prog: title? EOF | title? head EOF | title? head? block EOF
entry Model:
    leadingComments+=SL_COMMENT* title=Title? (head=Head)?  (block=Block)?;

// title: TITLE TITLE_CONTENT? TITLE_END?
Title:
    'title' content=Name?;

// head: (group | participant)+ | (group | participant)* starterExp
Head:
    headers+=Header+ starterExp=StarterExpression? |
    starterExp=StarterExpression;

Header:
    group=Group | participant=Participant;

// group: GROUP name? OBRACE participant* CBRACE | GROUP name? OBRACE | GROUP name?
Group:
    'group' name=Name? ('{' participants+=Participant* '}')?;

// starterExp: STARTER_LXR (OPAR starter? CPAR)? | ANNOTATION
StarterExpression:
    '@starter' ('(' starter=Starter? ')')? |
    '@Starter' ('(' starter=Starter? ')')? |
    annotation=ANNOTATION;

// starter: ID | STRING
Starter:
    value=ID | value=STRING;

// participant: participantType? stereotype? name width? label? COLOR?
//            | stereotype | participantType
Participant:
    type=ParticipantType? stereotype=Stereotype? name=Name width=Width? label=Label? color=COLOR? |
    stereotype=Stereotype |
    type=ParticipantType;

// New rule to handle modifiers (previously in MODIFIER_CHANNEL)
Modifier returns string:
    'const' | 'readonly' | 'static' | 'await' | 'async' | 'var' | 'RET' | 'ReturnType';

// stereotype: SOPEN name SCLOSE | SOPEN name GT? | (LT | SOPEN) (GT | SCLOSE)?
Stereotype:
    '<<' name=Name? '>>' |
    '<<' name=Name? '>' |
    ('<' | '<<') ('>' | '>>')?;

// label: AS name | AS
Label:
    'as' name=Name?;

// participantType: ANNOTATION
ParticipantType:
    type=ANNOTATION;

// name: ID | STRING
Name:
    value=ID | value=STRING;

// width: INT
Width:
    value=INT;

// block: stat+
Block:
    statements+=Statement+;

// stat: alt | par | opt | critical | section | ref | loop | creation | message
//     | asyncMessage EVENT_END? | ret | divider | tcf | OTHER
Statement:
    Alt | Par | Opt | Critical | Section | Ref | Loop | Creation | Ret | Divider | TCF |
    AssignmentStatement | MessageCall | FunctionCallStatement | AsyncMessage | Comment;

// New: simple assignment statement separate from message parsing
AssignmentStatement:
    assignment=Assignment (';' | block=BraceBlock)?;

// New: message call statement separate from assignment
MessageCall:
    (from=From '->')? to=To ('.' | '.' func=Func)? (';' | block=BraceBlock)?;

// New: standalone function call statement (e.g., init())
FunctionCallStatement:
    func=Func (';' | block=BraceBlock)?;

// par: PAR braceBlock | PAR
Par:
    'par' block=BraceBlock?;

// opt: OPT braceBlock | OPT
Opt:
    'opt' block=BraceBlock?;

// critical: CRITICAL (OPAR atom? CPAR)? braceBlock | CRITICAL
Critical:
    'critical' ('(' atom=Atom? ')')? block=BraceBlock?;

// section: SECTION (OPAR atom? CPAR)? braceBlock | braceBlock | SECTION
Section:
    'section' ('(' atom=Atom? ')')? block=BraceBlock?;

// creation: creationBody (SCOL | braceBlock)?
Creation:
    body=CreationBody (';' | block=BraceBlock)?;

// ref: REF OPAR (name (COMMA name*)*) CPAR SCOL?
Ref:
    'ref' '(' names+=Name (',' names+=Name)* ')' ';'?;

// creationBody: assignment? NEW construct(OPAR parameters? CPAR)? | assignment? NEW
CreationBody:
    (assignee=ID '=')? 'new' construct=Construct ('(' parameters=Parameters? ')')? |
    (assignee=ID '=')? 'new';

// Remove the complex MessageBody rule that was causing ambiguity
// // message: messageBody (SCOL | braceBlock)?
// Message:
//     body=MessageBody (';' | block=BraceBlock)?;

// // messageBody: assignment? ((from ARROW)? to DOT)? func | assignment | (from ARROW)? to DOT
// MessageBody:
//     assignment=Assignment? (from=From '->')? to=To ('.' func=Func)? |
//     assignment=Assignment |
//     (from=From '->')? to=To '.'?;

// asyncMessage: (from ARROW)? to COL content? | from (MINUS | ARROW) to?
AsyncMessage:
    (from=From '->')? to=To (':')+ content=Content? |
    from=From ('-' | '->') to=To?;

// func: signature (DOT signature)*
Func:
    signatures+=Signature ('.' signatures+=Signature)*;

// from: ID | STRING
From:
    value=ID | value=STRING;

// to: ID | STRING
To:
    value=ID | value=STRING;

// signature: methodName invocation?
Signature:
    methodName=MethodName invocation=Invocation?;

// invocation: OPAR parameters? CPAR
Invocation:
    '(' parameters=Parameters? ')';

// assignment: (type? assignee ASSIGN)
Assignment:
    modifiers+=Modifier* type=Type? assignee=ID '=' value=Expression?;

// ret: RETURN expr? SCOL? | ANNOTATION_RET asyncMessage EVENT_END?
Ret:
    'return' expr=Expression? ';'? |
    annotation=ANNOTATION_RET asyncMessage=AsyncMessage;

// divider: dividerNote
Divider:
    note=DividerNote;

// dividerNote: DIVIDER
DividerNote:
    content=DIVIDER;

// content: EVENT_PAYLOAD_LXR
Content:
    value=STRING;

// construct: ID | STRING
Construct:
    value=ID | value=STRING;

// type: ID | STRING
Type:
    value=ID | value=STRING;

// methodName: ID | STRING
MethodName:
    value=ID | value=STRING;

// parameters: parameter (COMMA parameter)* COMMA?
Parameters:
    parameters+=Parameter (',' parameters+=Parameter)* ','?;

// parameter: declaration | expr
Parameter:
    Declaration | Expression;

// declaration: type ID
Declaration:
    type=Type name=ID;

// tcf: tryBlock catchBlock* finallyBlock?
TCF:
    tryBlock=TryBlock catchBlocks+=CatchBlock* finallyBlock=FinallyBlock?;

// tryBlock: TRY braceBlock
TryBlock:
    'try' block=BraceBlock;

// catchBlock: CATCH invocation? braceBlock
CatchBlock:
    'catch' invocation=Invocation? block=BraceBlock;

// finallyBlock: FINALLY braceBlock
FinallyBlock:
    'finally' block=BraceBlock;

// alt: ifBlock elseIfBlock* elseBlock?
Alt:
    ifBlock=IfBlock elseIfBlocks+=ElseIfBlock* elseBlock=ElseBlock?;

// ifBlock: IF parExpr braceBlock
IfBlock:
    'if' condition=ConditionalExpression block=BraceBlock;

// elseIfBlock: ELSE IF parExpr braceBlock
ElseIfBlock:
    'else' 'if' condition=ConditionalExpression block=BraceBlock;

// elseBlock: ELSE braceBlock
ElseBlock:
    'else' block=BraceBlock;

// braceBlock: OBRACE block? CBRACE
BraceBlock:
    '{' block=Block? '}';

// loop: WHILE parExpr braceBlock | WHILE parExpr | WHILE
Loop:
    'while' condition=ConditionalExpression block=BraceBlock? |
    'foreach' condition=ConditionalExpression block=BraceBlock? |
    'forEach' condition=ConditionalExpression block=BraceBlock? |
    'loop' condition=ConditionalExpression block=BraceBlock?;

// Comment: //' .*? '\n' -> channel(COMMENT_CHANNEL)
Comment:
    value=SL_COMMENT;

// expr: atom | MINUS expr | NOT expr | expr op=(MULT | DIV | MOD) expr
//     | expr op=(PLUS | MINUS) expr | expr op=(LTEQ | GTEQ | LT | GT) expr
//     | expr op=(EQ | NEQ) expr | expr AND expr | expr OR expr | expr PLUS expr
//     | (to DOT)? func | creation | OPAR expr CPAR | assignment expr

// Expression entry point - basic hierarchy without circular references
Expression:
    BinaryExpression | UnaryExpression | AtomicExpression;

AtomicExpression:
    '(' expr=Expression ')' |
    FuncExpression |
    SelfFuncExpression |
    CreationExpression |
    Atom;

CreationExpression:
    'new' (constructor=Type)? ('(' params=Parameters? ')')? block=BraceBlock?;

BinaryExpression:
    left=AtomicExpression op=Operator right=AtomicExpression;

UnaryExpression:
    op=('-' | '!') expr=AtomicExpression;

FuncExpression:
    (from=From '->')? to=To ('.' func=Func)?;

SelfFuncExpression:
    func=Func;

// atom: (INT | FLOAT) | NUMBER_UNIT | MONEY | (TRUE | FALSE) | ID | STRING | NIL
Atom:
    NumberAtom | NumberUnitAtom | MoneyAtom | BooleanAtom | IdAtom | StringAtom | NilAtom;

NumberAtom:
    value=INT | value=FLOAT;

NumberUnitAtom:
    value=NUMBER_UNIT;

MoneyAtom:
    value=MONEY;

BooleanAtom:
    value=BOOLEAN;

IdAtom:
    value=ID;

StringAtom:
    value=STRING;

NilAtom:
    value='nil' | value='null';

// parExpr: OPAR condition CPAR | OPAR condition | OPAR CPAR | OPAR
ConditionalExpression:
    '(' condition=Condition? ')';

// condition:  inExpr | atom
Condition:
    InExpression | Atom;

// inExpr: ID IN ID
InExpression:
    left=ID 'in' right=ID;

Operator returns string:
    '+' | '-' | '*' | '/' | '%' | '^' | '==' | '!=' | '>' | '<' | '>=' | '<=' | '&&' | '||';

// Terminal rules - order matters! More specific rules should come first
terminal STRING: /"[^"]*"/;
terminal FLOAT: /[0-9]+\.[0-9]+/;
terminal INT: /[0-9]+/;
terminal MONEY: /\$[0-9]+(\.[0-9]+)?/;
terminal NUMBER_UNIT: /([0-9]+(\.[0-9]+)?)[a-zA-Z]+/;
terminal COLOR: /#[0-9a-fA-F]+/;
terminal BOOLEAN: /true|false/;
terminal DIVIDER: /==[^\r\n]*/;
terminal ID: /[a-zA-Z_][a-zA-Z_0-9]*/;
terminal ANNOTATION: /@(?!(Return|return|Reply|reply))[a-zA-Z_][a-zA-Z_0-9]*/;
terminal ANNOTATION_RET: /@(Return|return|Reply|reply)/;

// More specific terminals for comments and dividers
terminal COMMENT_TEXT: /[^\r\n]+/;
terminal SL_COMMENT: /\/\/[^\r\n]*/;

// Hidden terminals (equivalent to ANTLR's HIDDEN channel)
hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
