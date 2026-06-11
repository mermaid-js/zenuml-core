/**
 * ZenUML sequence-diagram grammar — Stage 2 of the ANTLR4 → Langium migration.
 *
 * Mirrors src/g4/sequenceParser.g4 rule-for-rule per
 * docs/langium-migration/02-parser-rules.md §3, including ALL 25 grammar-encoded
 * error-tolerance points (§8) and the deliberate NON-tolerances (§8 end).
 *
 * IMPORTANT — terminals here are PLACEHOLDERS. The authoritative token list
 * (patterns, order, channels, mode emulation, predicates) is
 * src/parser-langium/lexer/tokens.ts, injected via the TokenBuilder override in
 * src/parser-langium/token-builder.ts. The parser resolves terminals BY NAME,
 * so the names below must match that list exactly. No string keywords are used
 * anywhere in parser rules (keywords would mint token types that do not exist
 * in the Stage-1 list).
 *
 * Deliberate differences from the ANTLR parser grammar (each documented in
 * docs/langium-migration/10-ast-mapping.md):
 *  - EVENT_END?/TITLE_END? are dropped: those newline tokens are hidden in the
 *    parser token vocabulary (payload terminals already exclude \r\n).
 *  - expr alt #plusExpr is dropped (dead, shadowed by #additiveExpr — 07 §2).
 *  - assignee alts CSTRING/USTRING are dropped (unreachable: atom's stringAtom
 *    alternative always wins by ANTLR alternative order).
 *  - assignee's comma-list alternative requires >=1 COMMA (a single ID is
 *    always atom in ANTLR — removes a guaranteed ambiguity, same language).
 *  - condition's redundant leading `atom` alternative is dropped: a lone atom
 *    parses as Expr→AtomExpr(atom). ANTLR used the direct alt purely for the
 *    `.atom()` accessor; the Stage-3 facade unwraps AtomExpr instead.
 *  - textExpr requires >=2 words (a single word is always atom/Expr in ANTLR).
 *  - messageBody/funcExpr are left-factored so that a leading `name DOT` is
 *    ALWAYS fromTo / `to DOT` (ANTLR resolves the same way by alternative
 *    order): the bare-func alternatives (BareFunc/ExprFunc) cannot start with
 *    `methodName DOT`.
 *  - emoji's EMOJI_SHORTCODE alternative is dropped: the ANTLR LEXER never
 *    defines that token (parser-only reference; it can never match).
 */
grammar ZenUml

// ---------------------------------------------------------------------------
// prog / title / head — 02 §3.1–3.13
// ---------------------------------------------------------------------------

// prog: title? head? block? — ANTLR's `head` rule is FLATTENED into Prog:
// chevrotain-allstar is SLL-only (no full-context fallback): a lookahead that
// pops out of the rule holding the decision becomes a dead "stop config", so
// the head-loop's exit alternative could not see the block continuation and
// `A\nA.m()` mis-parsed as two participants. With the declarations loop and
// `block=Block?` in the SAME rule, the exit path keeps in-rule context and
// resolves exactly like ANTLR. The Stage-3 facade synthesizes HeadContext
// from headElements/starterExp (G8 wrapper plan, 10-ast-mapping.md).
entry Prog:
    {infer Prog} title=Title? (headElements+=(Group | Participant))* starterExp=StarterExp? block=Block?;

// title: TITLE TITLE_CONTENT? (TITLE_END dropped — hidden newline). [ET #2]
Title:
    {infer Title} TITLE content=TITLE_CONTENT?;

// group: GROUP name? (OBRACE participant* CBRACE?)?  [ET #3]
Group:
    {infer Group} GROUP name=Name? (OBRACE (participants+=Participant)* CBRACE?)?;

// starterExp: STARTER_LXR (OPAR starter? CPAR)? | ANNOTATION  [ET #4]
StarterExp:
    {infer StarterExp} STARTER_LXR (OPAR starter=Name? CPAR)?
  | {infer StarterExp} annotation=ANNOTATION;

// participant: participantType? stereotype? emoji? name width? label? COLOR?
//            | stereotype | participantType                       [ET #7]
// Left-factored into type-led / stereotype-led / name-led alternatives so the
// alternation is token-deterministic (same language, same AST properties).
// The bare-type and bare-stereotype tolerances are the skipped optional tails.
Participant:
    {infer Participant} participantType=ANNOTATION (stereotype=Stereotype? emoji=Emoji? name=Name width=INT? label=Label? color=COLOR?)?
  | {infer Participant} stereotype=Stereotype (emoji=Emoji? name=Name width=INT? label=Label? color=COLOR?)?
  | {infer Participant} emoji=Emoji? name=Name width=INT? label=Label? color=COLOR?;

// stereotype: SOPEN name SCLOSE | SOPEN name GT? | (LT|SOPEN)(GT|SCLOSE)?  [ET #5]
// The closer is REQUIRED in the name-bearing alternative: ANTLR's full-context
// prediction binds an uncloseed `<<name` as stereotype(`<<`) + participant
// name "name" (pinned by golden tol-05c-stereotype-partial). Residual edge:
// `<<a b` (two words, no closer) binds a to the participant here, while ANTLR
// would swallow a into the stereotype — not corpus-reachable, documented in
// 10-ast-mapping.md.
Stereotype:
    {infer Stereotype} SOPEN name=Name (SCLOSE | GT)
  | {infer Stereotype} (LT | SOPEN) (GT | SCLOSE)?;

// label: AS name | AS  [ET #6]
Label:
    {infer Label} AS name=Name?;

// emoji: LBRACKET name RBRACKET   (EMOJI_SHORTCODE alt dropped — dead token)
Emoji:
    {infer Emoji} LBRACKET name=Name RBRACKET;

// name: ID | DIGIT_LEADING_NAME | CSTRING | USTRING (datatype rule, raw text)
Name returns string:
    ID | DIGIT_LEADING_NAME | CSTRING | USTRING;

// ---------------------------------------------------------------------------
// block / stat — 02 §3.14–3.18
// ---------------------------------------------------------------------------

Block:
    {infer Block} (stats+=Stat)+;

// stat: 13 alternatives, ANTLR order preserved (creation before message
// before asyncMessage — order is the ambiguity resolution).
Stat:
    Alt | Par | Opt | Critical | Section | Ref | Loop | Creation | Message
  | AsyncMessage | Ret | Divider | Tcf;

// ---------------------------------------------------------------------------
// fragments — 02 §3.19–3.22, 3.43–3.46
// ---------------------------------------------------------------------------

Par:
    {infer Par} PAR parExpr=ParExpr? braceBlock=BraceBlock
  | {infer Par} PAR;                                              // [ET #10]

Opt:
    {infer Opt} OPT parExpr=ParExpr? braceBlock=BraceBlock
  | {infer Opt} OPT;                                              // [ET #10]

Critical:
    {infer Critical} CRITICAL parExpr=ParExpr? braceBlock=BraceBlock
  | {infer Critical} CRITICAL;                                    // [ET #10]

Section:
    {infer Section} SECTION (OPAR atom=Atom? CPAR)? braceBlock=BraceBlock
  | {infer Section} braceBlock=BraceBlock                         // [ET #11] anonymous section
  | {infer Section} SECTION;                                      // [ET #10]

// ref: REF OPAR (name (COMMA name*)*) CPAR SCOL? — lenient comma list kept.
Ref:
    {infer Ref} REF OPAR names+=Name (COMMA (names+=Name)*)* CPAR SCOL?;

// loop: WHILE parExpr? braceBlock?  [ET #23]
Loop:
    {infer Loop} WHILE parExpr=ParExpr? braceBlock=BraceBlock?;

Tcf:
    {infer Tcf} tryBlock=TryBlock (catchBlocks+=CatchBlock)* finallyBlock=FinallyBlock?;

TryBlock:
    {infer TryBlock} TRY braceBlock=BraceBlock;                   // bare `try` NOT tolerated

CatchBlock:
    {infer CatchBlock} CATCH invocation=Invocation? braceBlock=BraceBlock;

FinallyBlock:
    {infer FinallyBlock} FINALLY braceBlock=BraceBlock;

Alt:
    {infer Alt} ifBlock=IfBlock (elseIfBlocks+=ElseIfBlock)* elseBlock=ElseBlock?;

// braceBlock OPTIONAL in if/else-if/else — the flagship tolerance [ET #22].
IfBlock:
    {infer IfBlock} IF parExpr=ParExpr braceBlock=BraceBlock?;

ElseIfBlock:
    {infer ElseIfBlock} ELSE IF parExpr=ParExpr braceBlock=BraceBlock?;

ElseBlock:
    {infer ElseBlock} ELSE braceBlock=BraceBlock?;

// braceBlock: OBRACE block? CBRACE — CBRACE REQUIRED (deliberate non-tolerance).
BraceBlock:
    {infer BraceBlock} OBRACE block=Block? CBRACE;                // [ET #24]

// ---------------------------------------------------------------------------
// statements — 02 §3.15–3.17, 3.23–3.35
// ---------------------------------------------------------------------------

// ret: RETURN expr? SCOL? | ANNOTATION_RET asyncMessage | returnAsyncMessage
Ret:
    {infer Ret} RETURN expr=Expr? SCOL?                           // [ET #8]
  | {infer Ret} ANNOTATION_RET asyncMessage=AsyncMessage
  | {infer Ret} returnAsyncMessage=ReturnAsyncMessage;

// returnAsyncMessage: from RETURN_ARROW to COL content? | from RETURN_ARROW to?
ReturnAsyncMessage:
    {infer ReturnAsyncMessage} from=From RETURN_ARROW (to=To (COL content=EVENT_PAYLOAD_LXR?)?)?;  // [ET #9]

Divider:
    {infer Divider} note=DIVIDER;

Creation:
    {infer Creation} body=CreationBody (SCOL | braceBlock=BraceBlock)?;

// creationBody: assignment? NEW construct (OPAR parameters? CPAR)? | assignment? NEW
CreationBody:
    {infer CreationBody} assignment=Assignment? NEW (construct=Name (OPAR parameters=Parameters? CPAR)?)?;  // [ET #12]

Message:
    {infer Message} body=MessageBody (SCOL | braceBlock=BraceBlock)?;

// messageBody: assignment (fromTo func? | func)? | fromTo func? | func
// Left-factored: bare funcs (BareFunc) cannot start `methodName DOT`, so a
// leading `name DOT` is always FromTo — ANTLR's alternative-order resolution
// made deterministic.
MessageBody:
    {infer MessageBody} assignment=Assignment (fromTo=FromTo func=Func? | func=BareFunc)?  // [ET #13]
  | {infer MessageBody} fromTo=FromTo func=Func?                  // [ET #14]
  | {infer MessageBody} func=BareFunc;

// fromTo: (from ARROW)? to DOT — `to DOT` required.
FromTo:
    {infer FromTo} (from=From ARROW)? to=To DOT;

From:
    {infer From} emoji=Emoji? name=Name;

To:
    {infer To} emoji=Emoji? name=Name;

// func: signature (DOT signature)* — general chain, used AFTER a FromTo.
Func:
    {infer Func} signatures+=Signature (DOT signatures+=Signature)*;

// A func in LEADING position: first signature must carry an invocation (so it
// cannot be mistaken for `to DOT`), or be a single bare signature (no chain).
BareFunc infers Func:
    {infer Func} signatures+=InvokedSignature (DOT signatures+=Signature)*
  | {infer Func} signatures+=PlainSignature;

Signature:
    {infer Signature} methodName=MethodName invocation=Invocation?;  // [ET #15]

InvokedSignature infers Signature:
    {infer Signature} methodName=MethodName invocation=Invocation;

PlainSignature infers Signature:
    {infer Signature} methodName=MethodName;

MethodName:
    {infer MethodName} emoji=Emoji? name=Name;

// invocation: OPAR parameters? CPAR — unclosed `(` deliberately NOT tolerated.
Invocation:
    {infer Invocation} OPAR parameters=Parameters? CPAR;

// asyncMessage: (from ARROW)? to COL content? | from (MINUS|ARROW) to?
AsyncMessage:
    {infer AsyncMessage} (from=From ARROW)? to=To COL content=EVENT_PAYLOAD_LXR?  // [ET #16]
  | {infer AsyncMessage} from=From (MINUS | ARROW) to=To?;        // [ET #17]

// assignment: type? assignee ASSIGN
Assignment:
    {infer Assignment} type=Name? assignee=Assignee ASSIGN;

// assignee: atom | id-list | NEW.
// (CSTRING|USTRING alts dropped — shadowed by atom; the list alt requires a
// COMMA — a single ID is always atom in ANTLR.)
Assignee:
    {infer Assignee} atom=Atom
  | {infer Assignee} ids+=(ID | DIGIT_LEADING_NAME) (COMMA ids+=(ID | DIGIT_LEADING_NAME))+
  | {infer Assignee} NEW;

// parameters: parameter (COMMA parameter)* COMMA?  [ET #18 trailing comma]
Parameters:
    {infer Parameters} parameters+=Parameter (COMMA parameters+=Parameter)* COMMA?;

// parameter: namedParameter | declaration | expr — ANTLR order kept
// (namedParameter wins `a=1`).
Parameter:
    NamedParameter | Declaration | Expr;

// namedParameter: (ID|DIGIT_LEADING_NAME) ASSIGN expr?  [ET #19]
NamedParameter:
    {infer NamedParameter} name=(ID | DIGIT_LEADING_NAME) ASSIGN value=Expr?;

Declaration:
    {infer Declaration} type=Name name=(ID | DIGIT_LEADING_NAME);

// ---------------------------------------------------------------------------
// expr — 02 §3.47: left-recursive ANTLR rule ported as layered precedence
// rules (left-assoc tree-rewriting actions). #plusExpr dropped (dead).
// ---------------------------------------------------------------------------

Expr:
    ExprOr;

ExprOr infers Expr:
    ExprAnd ({infer OrExpr.left=current} op=OR right=ExprAnd)*;

ExprAnd infers Expr:
    ExprEquality ({infer AndExpr.left=current} op=AND right=ExprEquality)*;

ExprEquality infers Expr:
    ExprRelational ({infer EqualityExpr.left=current} op=(EQ | NEQ) right=ExprRelational)*;

ExprRelational infers Expr:
    ExprAdditive ({infer RelationalExpr.left=current} op=(LTEQ | GTEQ | LT | GT) right=ExprAdditive)*;

ExprAdditive infers Expr:
    ExprMultiplication ({infer AdditiveExpr.left=current} op=(PLUS | MINUS) right=ExprMultiplication)*;

ExprMultiplication infers Expr:
    ExprUnary ({infer MultiplicationExpr.left=current} op=(MULT | DIV | MOD) right=ExprUnary)*;

ExprUnary infers Expr:
    {infer UnaryMinusExpr} MINUS expr=ExprUnary
  | {infer NotExpr} NOT expr=ExprUnary
  | ExprPrimary;

// ANTLR primary alternatives in original order: atom, funcExpr, creationExpr,
// parenthesizedExpr, assignmentExpr.
ExprPrimary infers Expr:
    {infer AtomExpr} atom=Atom
  | {infer FuncExpr} to=To DOT func=Func
  | {infer FuncExpr} func=ExprFunc
  | {infer CreationExpr} creation=Creation
  | {infer ParenthesizedExpr} OPAR expr=Expr CPAR
  | {infer AssignmentExpr} assignment=Assignment expr=Expr;

// funcExpr's bare-func form: first signature must have an invocation (else it
// would be `to DOT` or a plain atom). The single emoji-bare signature is kept
// because atom cannot match an emoji-prefixed method name.
ExprFunc infers Func:
    {infer Func} signatures+=InvokedSignature (DOT signatures+=Signature)*
  | {infer Func} signatures+=EmojiSignature;

EmojiSignature infers Signature:
    {infer Signature} methodName=EmojiMethodName;

EmojiMethodName infers MethodName:
    {infer MethodName} emoji=Emoji name=Name;

// ---------------------------------------------------------------------------
// atom / parExpr / condition — 02 §3.48–3.52
// ---------------------------------------------------------------------------

Atom:
    {infer NumberAtom} value=(INT | FLOAT)
  | {infer NumberUnitAtom} value=NUMBER_UNIT
  | {infer MoneyAtom} value=MONEY
  | {infer BooleanAtom} value=(TRUE | FALSE)
  | {infer IdAtom} value=ID
  | {infer DigitLeadingNameAtom} value=DIGIT_LEADING_NAME
  | {infer StringAtom} value=(CSTRING | USTRING)
  | {infer NilAtom} value=NIL;

// parExpr: OPAR condition? CPAR?  [ET #20, #21]
ParExpr:
    {infer ParExpr} OPAR condition=Condition? CPAR?;

// condition: expr | inExpr | textExpr (leading `atom` alt folded into Expr —
// see header note; a lone atom condition is Expr→AtomExpr).
Condition:
    Expr | InExpr | TextExpr;

InExpr:
    {infer InExpr} left=(ID | DIGIT_LEADING_NAME) IN right=(ID | DIGIT_LEADING_NAME);

// textExpr: word word+ — single words are atoms; multi-word free text only.
// [ET #25]
TextExpr:
    {infer TextExpr} words+=(ID | DIGIT_LEADING_NAME | NUMBER_UNIT) (words+=(ID | DIGIT_LEADING_NAME | NUMBER_UNIT))+;

// ---------------------------------------------------------------------------
// Terminals — PLACEHOLDERS ONLY (names must match lexer/tokens.ts; the
// TokenBuilder override supplies the real patterns/order/channels at runtime).
//
// langium-cli builds a throwaway Chevrotain lexer from these regexes for
// validation, so they must be mutually non-shadowing within THIS file. The
// rest-of-line payload terminals and the mode-pop newline terminals use
// never-matching control-character placeholders — only the NAMES matter.
// ---------------------------------------------------------------------------

// Mode-emulated payload terminals (real impl: custom patterns keyed on the
// previous main-channel token; payload excludes \r\n).
terminal TITLE: /title(?![a-zA-Z0-9_])/;
terminal TITLE_CONTENT: /\x01[^\n\r]*/;
terminal EVENT_PAYLOAD_LXR: /\x02[^\n\r]*/;

// Column-0 predicated divider (real impl: custom pattern with begin-of-line
// back-scan and the bare-== carve-out).
terminal DIVIDER: /\x03==[^\n\r]*/;

// Annotations.
terminal STARTER_LXR: /@[Ss]tarter(?![a-zA-Z0-9_])/;
terminal ANNOTATION_RET: /@(?:[Rr]eturn|[Rr]eply)(?![a-zA-Z0-9_])/;
terminal ANNOTATION: /@[a-zA-Z0-9_]*/;

// Keywords (real impls carry unicode boundary lookaheads).
terminal TRUE: /true(?![a-zA-Z0-9_])/;
terminal FALSE: /false(?![a-zA-Z0-9_])/;
terminal NIL: /(?:nil|null)(?![a-zA-Z0-9_])/;
terminal IF: /if(?![a-zA-Z0-9_])/;
terminal ELSE: /else(?![a-zA-Z0-9_])/;
terminal WHILE: /(?:while|forEach|foreach|for|loop)(?![a-zA-Z0-9_])/;
terminal RETURN: /return(?![a-zA-Z0-9_])/;
terminal NEW: /new(?![a-zA-Z0-9_])/;
terminal PAR: /par(?![a-zA-Z0-9_])/;
terminal GROUP: /group(?![a-zA-Z0-9_])/;
terminal OPT: /opt(?![a-zA-Z0-9_])/;
terminal CRITICAL: /critical(?![a-zA-Z0-9_])/;
terminal SECTION: /(?:section|frame)(?![a-zA-Z0-9_])/;
terminal REF: /ref(?![a-zA-Z0-9_])/;
terminal AS: /as(?![a-zA-Z0-9_])/;
terminal TRY: /try(?![a-zA-Z0-9_])/;
terminal CATCH: /catch(?![a-zA-Z0-9_])/;
terminal FINALLY: /finally(?![a-zA-Z0-9_])/;
terminal IN: /in(?![a-zA-Z0-9_])/;

// MODIFIER_CHANNEL keywords (hidden; verified consumed by nothing downstream).
hidden terminal CONSTANT: /const(?![a-zA-Z0-9_])/;
hidden terminal READONLY: /readonly(?![a-zA-Z0-9_])/;
hidden terminal STATIC: /static(?![a-zA-Z0-9_])/;
hidden terminal AWAIT: /await(?![a-zA-Z0-9_])/;

// Numbers / units / money / color.
terminal NUMBER_UNIT: /[0-9]+(?:ms|s|h|d|w|kg|g|px)(?![a-zA-Z0-9_])/;
terminal FLOAT: /[0-9]+\.[0-9]*|\.[0-9]+/;
terminal MONEY: /\$[0-9.]+/;
terminal DIGIT_LEADING_NAME: /[0-9]+[a-zA-Z][a-zA-Z0-9_]*/;
terminal INT: /[0-9]+/;
terminal COLOR: /#[0-9a-fA-F]+/;

// Strings (real impl: combined longest-match custom scanner).
terminal CSTRING: /"(?:[^"\n\r]|"")*"/;
terminal USTRING: /"[^"\n\r]*/;

// Comments (COMMENT_CHANNEL → hidden; CST-retrievable for Stage 3).
hidden terminal COMMENT: /\/\/[^\n\r]*/;

// Operators / punctuation.
terminal RETURN_ARROW: /-->/;
terminal ARROW: /->/;
terminal SOPEN: /<</;
terminal SCLOSE: />>/;
terminal GTEQ: />=/;
terminal LTEQ: /<=/;
terminal EQ: /==/;
terminal NEQ: /!=/;
terminal OR: /\|\|/;
terminal AND: /&&/;
terminal GT: />/;
terminal LT: /</;
terminal PLUS: /\+/;
terminal MINUS: /-/;
terminal MULT: /\*/;
terminal DIV: /\//;
terminal MOD: /%/;
terminal NOT: /!/;
terminal SCOL: /;/;
terminal COMMA: /,/;
terminal ASSIGN: /=/;
terminal OPAR: /\(/;
terminal CPAR: /\)/;
terminal OBRACE: /\{/;
terminal CBRACE: /\}/;
terminal LBRACKET: /\[/;
terminal RBRACKET: /\]/;
terminal DOT: /\./;
terminal COL: /:/;

// Identifiers (real impl: unicode \p{L} custom pattern).
terminal ID: /[_a-zA-Z][a-zA-Z0-9_]*/;

// Hidden whitespace/newlines. EVENT_END/TITLE_END are the EVENT/TITLE_MODE
// mode-pop newline tokens from the Stage-1 list — the parser grammar drops
// them (ANTLR had them optional), so they are hidden here. Control-char
// placeholders; the real patterns are previous-token-keyed custom matchers.
hidden terminal WS: /[ \t]+/;
hidden terminal CR: /\r|\n/;
hidden terminal EVENT_END: /\x04/;
hidden terminal TITLE_END: /\x05/;

// Note: the Stage-1 vocabulary also contains POW (`^`, referenced by no parser
// rule) and OTHER (the never-fail 1-char catch-all, gap G5). They are NOT
// declared here — the TokenBuilder injects them into the vocabulary, and OTHER
// tokens surface as parser errors exactly like ANTLR's OTHER.
