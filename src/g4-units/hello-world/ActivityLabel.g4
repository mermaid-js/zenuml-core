// We have issues with activity parser not able to match `label A`.
grammar ActivityLabel;
r   : LABEL IDENTIFIER EOF;

LABEL: 'label';

// IDENTIFIER should come before ACTIVITY_LABEL
IDENTIFIER: [a-zA-Z_] [a-zA-Z0-9_]*;

// Modified ACTIVITY_LABEL to match both single-word and multi-word labels
ACTIVITY_LABEL: [a-zA-Z0-9]+ ([a-zA-Z0-9 \t]+ [a-zA-Z0-9]+)* '?'?;


WS: [ \t\r\n]+ -> skip;
