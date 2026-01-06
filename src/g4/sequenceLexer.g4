lexer grammar sequenceLexer;
channels {
  COMMENT_CHANNEL,
  MODIFIER_CHANNEL
}

@members {
  // 1. title must be at the beginning
  // 2. title must not be followed by '.', '(', '='
  this.isTitle = function() {
    // Check if 'title' appears at the beginning (only whitespace/comments before it)
    const currentPos = this._tokenStartCharIndex;
    const preceding = this._input.getText(0, currentPos - 1)
      .replace(/\/\/[^\n]*(?:\n|$)/g, '')
      .trim();
    if (preceding.length) return false;

    // Look ahead past 'title' and any whitespace to check what follows
    const SPACE = 32, TAB = 9, EOF = -1, DOT = 46, EQUALS = 61, OPEN_PAREN = 40;
    let pos = 6, next = this._input.LA(pos);

    // Skip past any whitespace
    while (next === SPACE || next === TAB) {
      ++pos;
      next = this._input.LA(pos);
    }

    // Title directive if EOF or not followed by '.', '(', '='
    return next === EOF || (next !== DOT && next !== EQUALS && next !== OPEN_PAREN);
  };
}

fragment HWS: [ \t]; // Horizontal WhiteSpace
WS: HWS+ -> channel(HIDDEN);

// variable modifiers
CONSTANT:   'const' -> channel(MODIFIER_CHANNEL);
READONLY:   'readonly' -> channel(MODIFIER_CHANNEL);
STATIC:     'static' -> channel(MODIFIER_CHANNEL);

// method modifiers
AWAIT:      'await' -> channel(MODIFIER_CHANNEL);

TITLE
 : {this.isTitle()}? 'title' -> pushMode(TITLE_MODE)
 ;

COL
 : ':' -> pushMode(EVENT)
 ;

SOPEN
 : '<<'
 ;

SCLOSE
 : '>>'
 ;

ARROW
 : '->'
 ;

fragment HEX
    : [0-9a-fA-F]
    ;

COLOR
 : '#' HEX+
 ;

OR : '||';
AND : '&&';
EQ : '==';
NEQ : '!=';
GT : '>';
LT : '<';
GTEQ : '>=';
LTEQ : '<=';
PLUS : '+';
MINUS : '-';
MULT : '*';
DIV : '/';
MOD : '%';
POW : '^';
NOT : '!';

SCOL : ';';
COMMA : ',';
ASSIGN : '=';
OPAR : '(';
CPAR : ')';
OBRACE : '{';
CBRACE : '}';

TRUE:       'true';
FALSE:      'false';
NIL:        'nil' | 'null';
IF:         'if';
ELSE:       'else';
WHILE:      'while' | 'for' | 'foreach' | 'forEach' | 'loop';
RETURN:     'return';
NEW:        'new';
PAR :       'par';
GROUP:      'group';
OPT:        'opt';
CRITICAL:   'critical';
SECTION:    'section' | 'frame';
REF:        'ref';
AS:         'as';
TRY:        'try';
CATCH:      'catch';
FINALLY:    'finally';
IN:         'in';

STARTER_LXR:        '@Starter' | '@starter';
ANNOTATION_RET:     '@Return' | '@return' | '@Reply' | '@reply';
ANNOTATION:         '@'[a-zA-Z_0-9]*;

DOT
 : '.'
 ;

// Support Unicode letters in identifiers
// \p{L} matches any Unicode letter (including Chinese, Japanese, Korean, etc.)
// \p{Nd} matches any Unicode decimal digit
ID
 : [\p{L}_] [\p{L}\p{Nd}_]*
 ;

fragment UNIT
 : [a-zA-Z]+
 ;

fragment DIGIT
    : [0-9]
    ;

INT
 : DIGIT+
 ;

FLOAT
 : DIGIT+ '.' DIGIT*
 | '.' DIGIT+
 ;

MONEY
    : '$' (INT | FLOAT)
    ;

NUMBER_UNIT
 : (INT | FLOAT) UNIT
 ;

// Strings are split into closed vs. unclosed to improve editor tolerance
// and lexer predictability:
// - CSTRING matches a normal double-quoted string that is properly closed.
// - USTRING matches an in-progress string without a closing quote and stops
//   at EOL/EOF. This prevents the lexer from consuming the newline and keeps
//   incremental typing states parseable without introducing ambiguity.
// Note: CSTRING is defined before USTRING so that when both could match,
// the closed form (longer match including the closing quote) is preferred.
CSTRING
 : '"' ( '""' | ~["\r\n] )* '"'
 ;

USTRING
 : '"' ( '""' | ~["\r\n] )*
 ;

CR
 : [\r\n] -> channel(HIDDEN)
 ;

COMMENT
 : '//' ~[\r\n]* -> channel(COMMENT_CHANNEL)
 ;
OTHER
 : .
 ;

// https://stackoverflow.com/a/74752939/529187 for semantic predicates
// Divider notes can be characters other than changeline.
// So it must not be tokenized by other Lexer rules.
// Thus this is not suitable for the parser to parse.
DIVIDER: {this.column === 0}? HWS* '==' ~[\r\n]*;

mode EVENT;
EVENT_PAYLOAD_LXR
 : ~[\r\n]+
 ;

EVENT_END
 : [\r\n] -> popMode
 ;

mode TITLE_MODE;
TITLE_CONTENT
 : ~[\r\n]+
 ;

TITLE_END
 : [\r\n] -> popMode
 ;
