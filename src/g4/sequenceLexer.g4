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
    // Right-edge predicate: input is already past 'title', so LA(1)
    // is the first character after the keyword.
    let pos = 1, next = this._input.LA(pos);

    // Skip past any whitespace
    while (next === SPACE || next === TAB) {
      ++pos;
      next = this._input.LA(pos);
    }

    // Title directive if EOF or not followed by '.', '(', '='
    return next === EOF || (next !== DOT && next !== EQUALS && next !== OPEN_PAREN);
  };

  this.isNameStartAhead = function() {
    const next = this._input.LA(1);
    return next !== -1 && /[\p{L}_]/u.test(String.fromCodePoint(next));
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
 : 'title' {this.isTitle()}? -> pushMode(TITLE_MODE)
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

RETURN_ARROW
 : '-->'
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

LBRACKET
 : '['
 ;

RBRACKET
 : ']'
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

// PlantUML/ZenUML wrapper directives are no-ops: sent to a hidden channel so
// the parser ignores them while source offsets are preserved (issue #400).
// Must precede ANNOTATION so these specific literals win over the generic
// '@'[a-zA-Z_0-9]* rule.
WRAPPER_DIRECTIVE:  ('@startuml' | '@enduml' | '@startzenuml' | '@endzenuml') -> channel(HIDDEN);

STARTER_LXR:        '@Starter' | '@starter';
ANNOTATION_RET:     '@Return' | '@return' | '@Reply' | '@reply';
ANNOTATION:         '@'[a-zA-Z_0-9]*;

// PlantUML preprocessor theme directive (e.g. `!theme plain`). The trailing
// column-0 predicate keeps this from ever shadowing the `!` (NOT) operator,
// which only appears mid-line inside expressions (issue #400).
THEME_DIRECTIVE:    '!theme' ~[\r\n]* {this._tokenStartColumn === 0}? -> channel(HIDDEN);

DOT
 : '.'
 ;

// Support Unicode letters in identifiers
// \p{L} matches any Unicode letter (including Chinese, Japanese, Korean, etc.)
// \p{Nd} matches any Unicode decimal digit
ID
 : [\p{L}_] [\p{L}\p{Nd}_]*
 ;

fragment DIGIT
    : [0-9]
    ;

INT
 : DIGIT+
 ;

FLOAT
 : DIGIT+ '.' DIGIT*
 | '.' DIGIT+ {!this.isNameStartAhead()}?
 ;

MONEY
    : '$' (INT | FLOAT)
    ;

NUMBER_UNIT
 : (DIGIT+ '.' DIGIT* | '.' DIGIT+ | DIGIT+) KNOWN_UNIT
 ;

DIGIT_LEADING_NAME
 : DIGIT+ [\p{L}] [\p{L}\p{Nd}_]*
 ;

fragment KNOWN_UNIT
 : TIME_UNIT
 | SIZE_UNIT
 | LENGTH_UNIT
 | MASS_UNIT
 ;

fragment TIME_UNIT
 : 'milliseconds' | 'millisecond' | 'ms'
 | 'seconds' | 'second' | 'secs' | 'sec' | 's'
 | 'minutes' | 'minute' | 'mins' | 'min'
 | 'hours' | 'hour' | 'hrs' | 'hr' | 'h'
 | 'days' | 'day' | 'd'
 | 'weeks' | 'week' | 'w'
 ;

fragment SIZE_UNIT
 : 'KiB' | 'MiB' | 'GiB' | 'TiB'
 | 'KB' | 'MB' | 'GB' | 'TB'
 | 'kb' | 'mb' | 'gb' | 'tb'
 | 'B'
 ;

fragment LENGTH_UNIT
 : 'rem' | 'em' | 'px'
 | 'mm' | 'cm' | 'km' | 'm'
 ;

fragment MASS_UNIT
 : 'mg' | 'kg' | 'g'
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

// Additional comment styles pasted from PlantUML / source code (issue #402).
// Skipped (hidden) so the surrounding diagram renders unaffected.
// - Block `/* … */` may span lines.
// - `# ` requires a following space so it never shadows the `#RRGGBB` COLOR token.
// - `'` (PlantUML line comment) is column-0 guarded so it never eats inline text.
BLOCK_COMMENT
 : '/*' .*? '*/' -> channel(HIDDEN)
 ;
HASH_COMMENT
 : '#' [ \t] ~[\r\n]* -> channel(HIDDEN)
 ;
QUOTE_COMMENT
 : '\'' ~[\r\n]* {this._tokenStartColumn === 0}? -> channel(HIDDEN)
 ;

OTHER
 : .
 ;

// https://stackoverflow.com/a/74752939/529187 for semantic predicates
// Divider notes can be characters other than changeline.
// So it must not be tokenized by other Lexer rules.
// Thus this is not suitable for the parser to parse.
DIVIDER: HWS* '==' ~[\r\n]* {this._tokenStartColumn === 0}?;

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
