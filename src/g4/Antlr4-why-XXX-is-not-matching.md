# Understanding Lexer and Parser Rules in Coconut

Lexing is always happening before parsing. While these rules are generally straightforward, some nuances can lead to unexpected behavior if not properly understood.

## TL;DR

`ACTIVITY_LABEL: [a-zA-Z0-9]+ ([a-zA-Z0-9 \t]+ [a-zA-Z0-9]+)* '?'?;` matches `label A`.

## When should you read this?

The parser cannot parse the input and produce almost nothing, including the ANTLR Preview plugin.

It seems that the lexer is not matching the input as expected.

## Lexer Rule Precedence

In the lexer, rules that match the longest possible text take precedence, even if they appear later in the definition.

Consider this example:

```
LABEL: 'label';
IDENTIFIER: [a-zA-Z_] [a-zA-Z0-9_]*;
ACTIVITY_LABEL: [a-zA-Z0-9]+ ([a-zA-Z0-9 \t]+ [a-zA-Z0-9]+)* '?'?;
```

When trying to match `label A`, `ACTIVITY_LABEL` will match the entire string, even though `LABEL` appears first.

## Using Fragments for Precise Matching

To achieve more precise matching, you can use fragments and create specific lexer rules. Here's an improved version:

```
fragment LABEL: 'label';

LABEL_STATEMENT: LABEL [ \t]+ IDENTIFIER;
IDENTIFIER: [a-zA-Z_] [a-zA-Z0-9_]*;
ACTIVITY_LABEL: [a-zA-Z0-9]+ ([a-zA-Z0-9 \t]+ [a-zA-Z0-9]+)* '?'?;
```

In this case, `LABEL_STATEMENT` will correctly match `label A` as intended.

## Parser Rules and Forward References

In parser rules, you can reference lexer rules that appear later in the definition. For example:

```
labelStatement: LABEL_STATEMENT;
```

This parser rule can use `LABEL_STATEMENT` even if it's defined after `IDENTIFIER` in the lexer rules.

Understanding these intricacies of lexer and parser rules in Coconut can help you write more precise and predictable code analysis tools.
