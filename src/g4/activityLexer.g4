lexer grammar activityLexer;

WS: [ \t] -> channel(HIDDEN);

COL
 : ':'
 ;

SCOL : ';';
OPAR : '(';
CPAR : ')';
IF:         'if';
ELSE:       'else';

CR
 : [\r\n] -> channel(HIDDEN)
 ;

LABEL
 : [a-zA-Z_][a-zA-Z_0-9 ]*
 ;
