grammar Hello;
r   : HELLO DOT EOF;

HELLO: 'hello';
DOT: '.';
// Antlr plugin for Intellij IDEA and VS Code cannot handle
// negative matcher properly. The following TEXT will match
// everything even if put at the end.
TEXT: ~[\r\n]+;
