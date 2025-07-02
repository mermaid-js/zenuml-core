grammar Sequence

entry Model:
    (title=Title)?
    (head=Head)?
    (blocks+=Block)*;

Title:
    'title' content=STRING;

Head:
  ( headers+=Header)+ | (headers+=Header)* StarterExpression;

Header:
   group=Group | participant=Participant;

Participant:
    type=ParticipantType? stereotype=Stereotype? name=Name label=Label?;

Group:
  'group' name=Name? ('{' (participants+=Participant)* '}')?;

ParticipantType:
  type=ANNOTATION;

Stereotype:
    '<<' name=Name '>>';

StarterExpression:
    '@' ('starter' | 'Starter') ('(' starter=Name? ')')? |
    annotation=ANNOTATION;

Label:
  'as' name=Name?;

Width:
  value=INT;

// Message:
//     assignment=Assignment? from=ID? arrow='->' to=ID '.' invocation=MethodCall ';'?;

// AsyncMessage:
//     assignment=Assignment? from=ID? arrow='->' to=ID ':' content=STRING?;

// MethodCall:
//     name=ID invocation=Invocation?;

// Creation:
//     assignee=Assignment? 'new'  construct=ID invocation=Invocation?;

// Invocation:
//     '(' (parameters+=Parameter (',' parameters+=Parameter)*)? ')';

// Parameter:
//     Declaration | Expression;

// Declaration:
//     type=ID name=ID;

Block:
  (statements+=Statement)+;

Statement:
  Alt | Par | Loop | TCF | Opt | Critical | Section | Ref | Creation | Message | AsyncMessage;

Alt:
  IfBlock | ElseIfBlock | ElseBlock;


IfBlock:
  'if' condition=ConditionalExpression? block=BraceBlock;

ElseIfBlock:
  'else' 'if' condition=ConditionalExpression? block=BraceBlock;

ElseBlock:
  'else' block=BraceBlock;

ConditionalExpression:
  '(' condition=Expression? ')';

BraceBlock:
  '{' block=Block? '}';

Par:
  'par' block=BraceBlock;

Loop:
  'while' condition=ConditionalExpression block=BraceBlock |
  'while' condition=ConditionalExpression?;

TCF:
  try=TryBlock catch=CatchBlock? finally=FinallyBlock?;

TryBlock:
  'try' block=BraceBlock;

CatchBlock:
  'catch' '(' exception=ID ')' block=BraceBlock;

FinallyBlock:
  'finally' block=BraceBlock;

Opt:
  'opt' block=BraceBlock;

Critical:
  'critical' block=BraceBlock;

Section:
  'section' block=BraceBlock;

Ref:
  'ref' block=BraceBlock;

Creation:
  body=CreationBody;

CreationBody:
  assignment=Assignment? 'new' construct=ID invocation=Invocation;

Message:
  body=MessageBody (';' | block=BraceBlock)?;

MessageBody:
  assignment=Assignment? ((from=Name arrow='->')? to=Name '.')? func=Func |
  assignment=Assignment |
  (from=Name arrow='->')? to=Name '.';

AsyncMessage:
  (from=ID arrow='->')? to=ID ':' content=STRING? |
  from=ID (arrow='-' | arrow='->') to=ID?;

Assignment:
  type=ID? assignee=ID '=';

Func:
  signature+=Signature ('.' signature+=Signature)*;

Signature:
  methodName=Name invocation=Invocation?;

Invocation:
  '(' (parameters=Parameters)? ')';

Parameters:
  parameter+=Parameter (',' parameter+=Parameter)* ','?;

Parameter:
  Declaration | Expression;

Declaration:
  type=ID name=ID;

// BinaryExpr:

// MethodBlock:
    // owner=ID '.' method=MethodCall '{' (statements+=Element)* '}';

// LoopBlock:
//     'while' '(' condition=Expression? ')' '{' (statements+=Element)* '}';

// TryCatchBlock:
//     'try' '{' (tryClause+=Element)* '}' 'catch' '(' exception=ID ')' '{' (catchClause+=Element)* '}';

// OptBlock:
//     'opt' '{' (statements+=Element)* '}';

// ParBlock:
//     'par' '{' (statements+=Element)* '}';

Expression:
    BinaryExpr | Primary;

BinaryExpr:
    left=Primary op=Operator right=Expression;

Primary:
    Literal | Reference | '(' expr=Expression ')';

Literal:
    value=INT | value=FLOAT | value=MONEY | value=STRING | value=BOOLEAN;

Reference:
    ref=ID;

Name:
   value=ID | value=STRING;

Operator returns string:
    '+' | '-' | '*' | '/' | '%' | '^' | '==' | '!=' | '>' | '<' | '>=' | '<=' | '&&' | '||';

Comment:
    '//' content=COMMENT_TEXT?;

Divider:
    '==' content=COMMENT_TEXT?;

// Terminal rules - order matters! More specific rules should come first
terminal STRING: /"[^"]*"/;
terminal FLOAT: /[0-9]+\.[0-9]+/;
terminal INT: /[0-9]+/;
terminal MONEY: /\$[0-9]+(\.[0-9]+)?/;
terminal COLOR: /#[0-9a-fA-F]+/;
terminal BOOLEAN: /true|false/;
terminal ID: /[a-zA-Z_][a-zA-Z_0-9]*/;
terminal ANNOTATION: /@[a-zA-Z_][a-zA-Z_0-9]*/;

// More specific terminals for comments and dividers
terminal COMMENT_TEXT: /[^\r\n]+/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\r\n]*/;
