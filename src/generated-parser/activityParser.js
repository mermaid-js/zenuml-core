// Generated from java-escape by ANTLR 4.11.1
// jshint ignore: start
import antlr4 from 'antlr4';
import activityParserListener from './activityParserListener.js';
const serializedATN = [4,1,66,348,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,
4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,
2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,
20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,26,1,0,
3,0,56,8,0,1,0,5,0,59,8,0,10,0,12,0,62,9,0,1,0,3,0,65,8,0,1,1,1,1,1,1,1,
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,85,8,1,1,2,
3,2,88,8,2,1,2,1,2,1,3,1,3,5,3,94,8,3,10,3,12,3,97,9,3,1,3,3,3,100,8,3,1,
3,1,3,1,4,1,4,1,4,3,4,107,8,4,1,4,3,4,110,8,4,1,4,1,4,5,4,114,8,4,10,4,12,
4,117,9,4,1,5,3,5,120,8,5,1,5,1,5,1,5,3,5,125,8,5,1,5,3,5,128,8,5,1,5,1,
5,5,5,132,8,5,10,5,12,5,135,9,5,1,6,3,6,138,8,6,1,6,1,6,3,6,142,8,6,1,6,
1,6,5,6,146,8,6,10,6,12,6,149,9,6,1,7,1,7,5,7,153,8,7,10,7,12,7,156,9,7,
1,7,1,7,1,8,1,8,1,8,1,9,1,9,1,9,1,9,5,9,167,8,9,10,9,12,9,170,9,9,1,10,1,
10,1,10,5,10,175,8,10,10,10,12,10,178,9,10,1,10,1,10,3,10,182,8,10,1,10,
1,10,1,10,1,10,1,10,1,10,1,10,3,10,191,8,10,1,11,1,11,1,11,1,11,5,11,197,
8,11,10,11,12,11,200,9,11,1,11,1,11,1,11,1,11,3,11,206,8,11,1,12,1,12,1,
12,5,12,211,8,12,10,12,12,12,214,9,12,1,12,1,12,1,12,5,12,219,8,12,10,12,
12,12,222,9,12,5,12,224,8,12,10,12,12,12,227,9,12,1,12,1,12,1,12,1,12,3,
12,233,8,12,1,13,1,13,1,13,5,13,238,8,13,10,13,12,13,241,9,13,1,13,1,13,
1,13,5,13,246,8,13,10,13,12,13,249,9,13,5,13,251,8,13,10,13,12,13,254,9,
13,1,13,1,13,1,14,1,14,3,14,260,8,14,1,14,3,14,263,8,14,1,14,1,14,1,14,5,
14,268,8,14,10,14,12,14,271,9,14,1,14,3,14,274,8,14,1,15,1,15,3,15,278,8,
15,1,15,1,15,1,15,5,15,283,8,15,10,15,12,15,286,9,15,1,15,1,15,1,16,1,16,
5,16,292,8,16,10,16,12,16,295,9,16,1,16,1,16,1,17,1,17,1,18,1,18,1,19,1,
19,1,19,1,20,1,20,1,20,1,20,1,20,3,20,311,8,20,1,20,3,20,314,8,20,1,20,1,
20,3,20,318,8,20,1,21,1,21,1,21,1,21,1,21,1,21,1,21,1,21,3,21,328,8,21,1,
22,1,22,1,23,4,23,333,8,23,11,23,12,23,334,1,24,1,24,1,24,1,24,1,25,1,25,
1,25,1,25,1,26,1,26,1,26,1,26,0,0,27,0,2,4,6,8,10,12,14,16,18,20,22,24,26,
28,30,32,34,36,38,40,42,44,46,48,50,52,0,4,1,0,23,24,1,0,6,7,2,0,42,42,46,
46,1,0,60,61,391,0,55,1,0,0,0,2,84,1,0,0,0,4,87,1,0,0,0,6,91,1,0,0,0,8,103,
1,0,0,0,10,119,1,0,0,0,12,137,1,0,0,0,14,150,1,0,0,0,16,159,1,0,0,0,18,162,
1,0,0,0,20,171,1,0,0,0,22,192,1,0,0,0,24,207,1,0,0,0,26,234,1,0,0,0,28,257,
1,0,0,0,30,275,1,0,0,0,32,289,1,0,0,0,34,298,1,0,0,0,36,300,1,0,0,0,38,302,
1,0,0,0,40,305,1,0,0,0,42,319,1,0,0,0,44,329,1,0,0,0,46,332,1,0,0,0,48,336,
1,0,0,0,50,340,1,0,0,0,52,344,1,0,0,0,54,56,5,1,0,0,55,54,1,0,0,0,55,56,
1,0,0,0,56,60,1,0,0,0,57,59,3,2,1,0,58,57,1,0,0,0,59,62,1,0,0,0,60,58,1,
0,0,0,60,61,1,0,0,0,61,64,1,0,0,0,62,60,1,0,0,0,63,65,5,2,0,0,64,63,1,0,
0,0,64,65,1,0,0,0,65,1,1,0,0,0,66,85,3,4,2,0,67,85,5,3,0,0,68,85,5,4,0,0,
69,85,5,5,0,0,70,85,3,6,3,0,71,85,3,14,7,0,72,85,3,20,10,0,73,85,3,22,11,
0,74,85,3,24,12,0,75,85,3,26,13,0,76,85,3,28,14,0,77,85,3,30,15,0,78,85,
3,32,16,0,79,85,3,34,17,0,80,85,3,36,18,0,81,85,3,38,19,0,82,85,3,40,20,
0,83,85,5,57,0,0,84,66,1,0,0,0,84,67,1,0,0,0,84,68,1,0,0,0,84,69,1,0,0,0,
84,70,1,0,0,0,84,71,1,0,0,0,84,72,1,0,0,0,84,73,1,0,0,0,84,74,1,0,0,0,84,
75,1,0,0,0,84,76,1,0,0,0,84,77,1,0,0,0,84,78,1,0,0,0,84,79,1,0,0,0,84,80,
1,0,0,0,84,81,1,0,0,0,84,82,1,0,0,0,84,83,1,0,0,0,85,3,1,0,0,0,86,88,5,55,
0,0,87,86,1,0,0,0,87,88,1,0,0,0,88,89,1,0,0,0,89,90,5,60,0,0,90,5,1,0,0,
0,91,95,3,8,4,0,92,94,3,10,5,0,93,92,1,0,0,0,94,97,1,0,0,0,95,93,1,0,0,0,
95,96,1,0,0,0,96,99,1,0,0,0,97,95,1,0,0,0,98,100,3,12,6,0,99,98,1,0,0,0,
99,100,1,0,0,0,100,101,1,0,0,0,101,102,5,12,0,0,102,7,1,0,0,0,103,104,5,
8,0,0,104,106,3,42,21,0,105,107,5,9,0,0,106,105,1,0,0,0,106,107,1,0,0,0,
107,109,1,0,0,0,108,110,3,50,25,0,109,108,1,0,0,0,109,110,1,0,0,0,110,115,
1,0,0,0,111,114,3,2,1,0,112,114,5,57,0,0,113,111,1,0,0,0,113,112,1,0,0,0,
114,117,1,0,0,0,115,113,1,0,0,0,115,116,1,0,0,0,116,9,1,0,0,0,117,115,1,
0,0,0,118,120,3,48,24,0,119,118,1,0,0,0,119,120,1,0,0,0,120,121,1,0,0,0,
121,122,5,11,0,0,122,124,3,42,21,0,123,125,5,9,0,0,124,123,1,0,0,0,124,125,
1,0,0,0,125,127,1,0,0,0,126,128,3,50,25,0,127,126,1,0,0,0,127,128,1,0,0,
0,128,133,1,0,0,0,129,132,3,2,1,0,130,132,5,57,0,0,131,129,1,0,0,0,131,130,
1,0,0,0,132,135,1,0,0,0,133,131,1,0,0,0,133,134,1,0,0,0,134,11,1,0,0,0,135,
133,1,0,0,0,136,138,3,48,24,0,137,136,1,0,0,0,137,138,1,0,0,0,138,139,1,
0,0,0,139,141,5,10,0,0,140,142,3,50,25,0,141,140,1,0,0,0,141,142,1,0,0,0,
142,147,1,0,0,0,143,146,3,2,1,0,144,146,5,57,0,0,145,143,1,0,0,0,145,144,
1,0,0,0,146,149,1,0,0,0,147,145,1,0,0,0,147,148,1,0,0,0,148,13,1,0,0,0,149,
147,1,0,0,0,150,154,3,16,8,0,151,153,3,18,9,0,152,151,1,0,0,0,153,156,1,
0,0,0,154,152,1,0,0,0,154,155,1,0,0,0,155,157,1,0,0,0,156,154,1,0,0,0,157,
158,5,19,0,0,158,15,1,0,0,0,159,160,5,17,0,0,160,161,3,42,21,0,161,17,1,
0,0,0,162,163,5,18,0,0,163,168,3,42,21,0,164,167,3,2,1,0,165,167,5,57,0,
0,166,164,1,0,0,0,166,165,1,0,0,0,167,170,1,0,0,0,168,166,1,0,0,0,168,169,
1,0,0,0,169,19,1,0,0,0,170,168,1,0,0,0,171,176,5,13,0,0,172,175,3,2,1,0,
173,175,5,57,0,0,174,172,1,0,0,0,174,173,1,0,0,0,175,178,1,0,0,0,176,174,
1,0,0,0,176,177,1,0,0,0,177,181,1,0,0,0,178,176,1,0,0,0,179,180,5,30,0,0,
180,182,3,4,2,0,181,179,1,0,0,0,181,182,1,0,0,0,182,183,1,0,0,0,183,184,
5,14,0,0,184,190,3,42,21,0,185,186,5,42,0,0,186,187,3,50,25,0,187,188,5,
20,0,0,188,189,3,50,25,0,189,191,1,0,0,0,190,185,1,0,0,0,190,191,1,0,0,0,
191,21,1,0,0,0,192,193,5,15,0,0,193,198,3,42,21,0,194,197,3,2,1,0,195,197,
5,57,0,0,196,194,1,0,0,0,196,195,1,0,0,0,197,200,1,0,0,0,198,196,1,0,0,0,
198,199,1,0,0,0,199,201,1,0,0,0,200,198,1,0,0,0,201,205,5,16,0,0,202,203,
5,47,0,0,203,204,5,61,0,0,204,206,5,48,0,0,205,202,1,0,0,0,205,206,1,0,0,
0,206,23,1,0,0,0,207,212,5,21,0,0,208,211,3,2,1,0,209,211,5,57,0,0,210,208,
1,0,0,0,210,209,1,0,0,0,211,214,1,0,0,0,212,210,1,0,0,0,212,213,1,0,0,0,
213,225,1,0,0,0,214,212,1,0,0,0,215,220,5,22,0,0,216,219,3,2,1,0,217,219,
5,57,0,0,218,216,1,0,0,0,218,217,1,0,0,0,219,222,1,0,0,0,220,218,1,0,0,0,
220,221,1,0,0,0,221,224,1,0,0,0,222,220,1,0,0,0,223,215,1,0,0,0,224,227,
1,0,0,0,225,223,1,0,0,0,225,226,1,0,0,0,226,228,1,0,0,0,227,225,1,0,0,0,
228,232,7,0,0,0,229,230,5,49,0,0,230,231,5,61,0,0,231,233,5,50,0,0,232,229,
1,0,0,0,232,233,1,0,0,0,233,25,1,0,0,0,234,239,5,25,0,0,235,238,3,2,1,0,
236,238,5,57,0,0,237,235,1,0,0,0,237,236,1,0,0,0,238,241,1,0,0,0,239,237,
1,0,0,0,239,240,1,0,0,0,240,252,1,0,0,0,241,239,1,0,0,0,242,247,5,26,0,0,
243,246,3,2,1,0,244,246,5,57,0,0,245,243,1,0,0,0,245,244,1,0,0,0,246,249,
1,0,0,0,247,245,1,0,0,0,247,248,1,0,0,0,248,251,1,0,0,0,249,247,1,0,0,0,
250,242,1,0,0,0,251,254,1,0,0,0,252,250,1,0,0,0,252,253,1,0,0,0,253,255,
1,0,0,0,254,252,1,0,0,0,255,256,5,27,0,0,256,27,1,0,0,0,257,259,5,32,0,0,
258,260,5,41,0,0,259,258,1,0,0,0,259,260,1,0,0,0,260,262,1,0,0,0,261,263,
7,1,0,0,262,261,1,0,0,0,262,263,1,0,0,0,263,264,1,0,0,0,264,269,5,61,0,0,
265,268,3,2,1,0,266,268,5,57,0,0,267,265,1,0,0,0,267,266,1,0,0,0,268,271,
1,0,0,0,269,267,1,0,0,0,269,270,1,0,0,0,270,273,1,0,0,0,271,269,1,0,0,0,
272,274,5,33,0,0,273,272,1,0,0,0,273,274,1,0,0,0,274,29,1,0,0,0,275,277,
5,34,0,0,276,278,5,61,0,0,277,276,1,0,0,0,277,278,1,0,0,0,278,279,1,0,0,
0,279,284,5,49,0,0,280,283,3,2,1,0,281,283,5,57,0,0,282,280,1,0,0,0,282,
281,1,0,0,0,283,286,1,0,0,0,284,282,1,0,0,0,284,285,1,0,0,0,285,287,1,0,
0,0,286,284,1,0,0,0,287,288,5,50,0,0,288,31,1,0,0,0,289,293,5,35,0,0,290,
292,3,2,1,0,291,290,1,0,0,0,292,295,1,0,0,0,293,291,1,0,0,0,293,294,1,0,
0,0,294,296,1,0,0,0,295,293,1,0,0,0,296,297,5,36,0,0,297,33,1,0,0,0,298,
299,5,28,0,0,299,35,1,0,0,0,300,301,5,29,0,0,301,37,1,0,0,0,302,303,5,31,
0,0,303,304,5,62,0,0,304,39,1,0,0,0,305,310,5,53,0,0,306,307,5,51,0,0,307,
308,5,55,0,0,308,309,5,53,0,0,309,311,5,52,0,0,310,306,1,0,0,0,310,311,1,
0,0,0,311,313,1,0,0,0,312,314,5,62,0,0,313,312,1,0,0,0,313,314,1,0,0,0,314,
315,1,0,0,0,315,317,5,53,0,0,316,318,5,61,0,0,317,316,1,0,0,0,317,318,1,
0,0,0,318,41,1,0,0,0,319,320,5,47,0,0,320,321,3,46,23,0,321,327,5,48,0,0,
322,323,3,44,22,0,323,324,5,47,0,0,324,325,3,46,23,0,325,326,5,48,0,0,326,
328,1,0,0,0,327,322,1,0,0,0,327,328,1,0,0,0,328,43,1,0,0,0,329,330,7,2,0,
0,330,45,1,0,0,0,331,333,7,3,0,0,332,331,1,0,0,0,333,334,1,0,0,0,334,332,
1,0,0,0,334,335,1,0,0,0,335,47,1,0,0,0,336,337,5,47,0,0,337,338,5,61,0,0,
338,339,5,48,0,0,339,49,1,0,0,0,340,341,5,47,0,0,341,342,5,61,0,0,342,343,
5,48,0,0,343,51,1,0,0,0,344,345,3,4,2,0,345,346,5,56,0,0,346,53,1,0,0,0,
55,55,60,64,84,87,95,99,106,109,113,115,119,124,127,131,133,137,141,145,
147,154,166,168,174,176,181,190,196,198,205,210,212,218,220,225,232,237,
239,245,247,252,259,262,267,269,273,277,282,284,293,310,313,317,327,334];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.PredictionContextCache();

export default class activityParser extends antlr4.Parser {

    static grammarFileName = "java-escape";
    static literalNames = [ null, "'@startuml'", "'@enduml'", "'start'", 
                            "'stop'", "'end'", "'left'", "'right'", "'if'", 
                            "'then'", "'else'", "'elseif'", "'endif'", "'repeat'", 
                            "'repeat while'", "'while'", "'endwhile'", "'switch'", 
                            "'case'", "'endswitch'", "'not'", "'fork'", 
                            "'fork again'", "'end fork'", "'end merge'", 
                            "'split'", "'split again'", "'end split'", "'detach'", 
                            "'kill'", "'backward'", "'goto'", "'note'", 
                            "'end note'", "'partition'", "'group'", "'end group'", 
                            "'package'", "'rectangle'", "'card'", "'label'", 
                            "'floating'", "'is'", "'as'", "'of'", "'on'", 
                            "'equals'", "'('", "')'", "'{'", "'}'", "'['", 
                            "']'", "'|'", null, null, null, null, "'<-'", 
                            "'<->'" ];
    static symbolicNames = [ null, "STARTUML", "ENDUML", "START", "STOP", 
                             "END", "LEFT", "RIGHT", "IF", "THEN", "ELSE", 
                             "ELSEIF", "ENDIF", "REPEAT", "REPEAT_WHILE", 
                             "WHILE", "ENDWHILE", "SWITCH", "CASE", "ENDSWITCH", 
                             "NOT", "FORK", "FORK_AGAIN", "END_FORK", "END_MERGE", 
                             "SPLIT", "SPLIT_AGAIN", "END_SPLIT", "DETACH", 
                             "KILL", "BACKWARD", "GOTO", "NOTE", "END_NOTE", 
                             "PARTITION", "GROUP", "END_GROUP", "PACKAGE", 
                             "RECTANGLE", "CARD", "LABEL", "FLOATING", "IS", 
                             "AS", "OF", "ON", "EQUALS", "LPAREN", "RPAREN", 
                             "LBRACE", "RBRACE", "LBRACKET", "RBRACKET", 
                             "PIPE", "COLOR", "COLOR_ANNOTATION", "STEREOTYPE", 
                             "ARROW", "REVERSE_ARROW", "DOUBLE_ARROW", "ACTIVITY_CONTENT", 
                             "ACTIVITY_LABEL", "IDENTIFIER", "NEWLINE", 
                             "WS", "COMMENT", "OTHER" ];
    static ruleNames = [ "activityDiagram", "statement", "activity", "ifStatement", 
                         "ifBlock", "elseIfBlock", "elseBlock", "switchStatement", 
                         "switchBlock", "caseStatement", "repeatStatement", 
                         "whileStatement", "forkStatement", "splitStatement", 
                         "noteStatement", "partitionStatement", "groupStatement", 
                         "detachStatement", "killStatement", "gotoStatement", 
                         "swimlane", "condition", "comparisonOperator", 
                         "conditionContent", "inboundBranchLabel", "branchLabel", 
                         "stereotypeActivity" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = activityParser.ruleNames;
        this.literalNames = activityParser.literalNames;
        this.symbolicNames = activityParser.symbolicNames;
    }

    get atn() {
        return atn;
    }



	activityDiagram() {
	    let localctx = new ActivityDiagramContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, activityParser.RULE_activityDiagram);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 55;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===1) {
	            this.state = 54;
	            this.match(activityParser.STARTUML);
	        }

	        this.state = 60;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 57;
	            this.statement();
	            this.state = 62;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 64;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===2) {
	            this.state = 63;
	            this.match(activityParser.ENDUML);
	        }

	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	statement() {
	    let localctx = new StatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 2, activityParser.RULE_statement);
	    try {
	        this.state = 84;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 55:
	        case 60:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 66;
	            this.activity();
	            break;
	        case 3:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 67;
	            this.match(activityParser.START);
	            break;
	        case 4:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 68;
	            this.match(activityParser.STOP);
	            break;
	        case 5:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 69;
	            this.match(activityParser.END);
	            break;
	        case 8:
	            this.enterOuterAlt(localctx, 5);
	            this.state = 70;
	            this.ifStatement();
	            break;
	        case 17:
	            this.enterOuterAlt(localctx, 6);
	            this.state = 71;
	            this.switchStatement();
	            break;
	        case 13:
	            this.enterOuterAlt(localctx, 7);
	            this.state = 72;
	            this.repeatStatement();
	            break;
	        case 15:
	            this.enterOuterAlt(localctx, 8);
	            this.state = 73;
	            this.whileStatement();
	            break;
	        case 21:
	            this.enterOuterAlt(localctx, 9);
	            this.state = 74;
	            this.forkStatement();
	            break;
	        case 25:
	            this.enterOuterAlt(localctx, 10);
	            this.state = 75;
	            this.splitStatement();
	            break;
	        case 32:
	            this.enterOuterAlt(localctx, 11);
	            this.state = 76;
	            this.noteStatement();
	            break;
	        case 34:
	            this.enterOuterAlt(localctx, 12);
	            this.state = 77;
	            this.partitionStatement();
	            break;
	        case 35:
	            this.enterOuterAlt(localctx, 13);
	            this.state = 78;
	            this.groupStatement();
	            break;
	        case 28:
	            this.enterOuterAlt(localctx, 14);
	            this.state = 79;
	            this.detachStatement();
	            break;
	        case 29:
	            this.enterOuterAlt(localctx, 15);
	            this.state = 80;
	            this.killStatement();
	            break;
	        case 31:
	            this.enterOuterAlt(localctx, 16);
	            this.state = 81;
	            this.gotoStatement();
	            break;
	        case 53:
	            this.enterOuterAlt(localctx, 17);
	            this.state = 82;
	            this.swimlane();
	            break;
	        case 57:
	            this.enterOuterAlt(localctx, 18);
	            this.state = 83;
	            this.match(activityParser.ARROW);
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	activity() {
	    let localctx = new ActivityContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 4, activityParser.RULE_activity);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 87;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===55) {
	            this.state = 86;
	            this.match(activityParser.COLOR_ANNOTATION);
	        }

	        this.state = 89;
	        this.match(activityParser.ACTIVITY_CONTENT);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	ifStatement() {
	    let localctx = new IfStatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, activityParser.RULE_ifStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 91;
	        this.ifBlock();
	        this.state = 95;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,5,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 92;
	                this.elseIfBlock(); 
	            }
	            this.state = 97;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,5,this._ctx);
	        }

	        this.state = 99;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===10 || _la===47) {
	            this.state = 98;
	            this.elseBlock();
	        }

	        this.state = 101;
	        this.match(activityParser.ENDIF);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	ifBlock() {
	    let localctx = new IfBlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 8, activityParser.RULE_ifBlock);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 103;
	        this.match(activityParser.IF);
	        this.state = 104;
	        this.condition();
	        this.state = 106;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===9) {
	            this.state = 105;
	            this.match(activityParser.THEN);
	        }

	        this.state = 109;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,8,this._ctx);
	        if(la_===1) {
	            this.state = 108;
	            this.branchLabel();

	        }
	        this.state = 115;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 113;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,9,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 111;
	                this.statement();
	                break;

	            case 2:
	                this.state = 112;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 117;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	elseIfBlock() {
	    let localctx = new ElseIfBlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 10, activityParser.RULE_elseIfBlock);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 119;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===47) {
	            this.state = 118;
	            this.inboundBranchLabel();
	        }

	        this.state = 121;
	        this.match(activityParser.ELSEIF);
	        this.state = 122;
	        this.condition();
	        this.state = 124;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===9) {
	            this.state = 123;
	            this.match(activityParser.THEN);
	        }

	        this.state = 127;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,13,this._ctx);
	        if(la_===1) {
	            this.state = 126;
	            this.branchLabel();

	        }
	        this.state = 133;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 131;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,14,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 129;
	                this.statement();
	                break;

	            case 2:
	                this.state = 130;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 135;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	elseBlock() {
	    let localctx = new ElseBlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 12, activityParser.RULE_elseBlock);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 137;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===47) {
	            this.state = 136;
	            this.inboundBranchLabel();
	        }

	        this.state = 139;
	        this.match(activityParser.ELSE);
	        this.state = 141;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===47) {
	            this.state = 140;
	            this.branchLabel();
	        }

	        this.state = 147;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 145;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,18,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 143;
	                this.statement();
	                break;

	            case 2:
	                this.state = 144;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 149;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	switchStatement() {
	    let localctx = new SwitchStatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 14, activityParser.RULE_switchStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 150;
	        this.switchBlock();
	        this.state = 154;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===18) {
	            this.state = 151;
	            this.caseStatement();
	            this.state = 156;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 157;
	        this.match(activityParser.ENDSWITCH);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	switchBlock() {
	    let localctx = new SwitchBlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 16, activityParser.RULE_switchBlock);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 159;
	        this.match(activityParser.SWITCH);
	        this.state = 160;
	        this.condition();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	caseStatement() {
	    let localctx = new CaseStatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 18, activityParser.RULE_caseStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 162;
	        this.match(activityParser.CASE);
	        this.state = 163;
	        this.condition();
	        this.state = 168;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 166;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,21,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 164;
	                this.statement();
	                break;

	            case 2:
	                this.state = 165;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 170;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	repeatStatement() {
	    let localctx = new RepeatStatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 20, activityParser.RULE_repeatStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 171;
	        this.match(activityParser.REPEAT);
	        this.state = 176;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 174;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,23,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 172;
	                this.statement();
	                break;

	            case 2:
	                this.state = 173;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 178;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 181;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===30) {
	            this.state = 179;
	            this.match(activityParser.BACKWARD);
	            this.state = 180;
	            this.activity();
	        }

	        this.state = 183;
	        this.match(activityParser.REPEAT_WHILE);
	        this.state = 184;
	        this.condition();
	        this.state = 190;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===42) {
	            this.state = 185;
	            this.match(activityParser.IS);
	            this.state = 186;
	            this.branchLabel();
	            this.state = 187;
	            this.match(activityParser.NOT);
	            this.state = 188;
	            this.branchLabel();
	        }

	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	whileStatement() {
	    let localctx = new WhileStatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 22, activityParser.RULE_whileStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 192;
	        this.match(activityParser.WHILE);
	        this.state = 193;
	        this.condition();
	        this.state = 198;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 196;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,27,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 194;
	                this.statement();
	                break;

	            case 2:
	                this.state = 195;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 200;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 201;
	        this.match(activityParser.ENDWHILE);
	        this.state = 205;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,29,this._ctx);
	        if(la_===1) {
	            this.state = 202;
	            this.match(activityParser.LPAREN);
	            this.state = 203;
	            this.match(activityParser.ACTIVITY_LABEL);
	            this.state = 204;
	            this.match(activityParser.RPAREN);

	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	forkStatement() {
	    let localctx = new ForkStatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 24, activityParser.RULE_forkStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 207;
	        this.match(activityParser.FORK);
	        this.state = 212;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 210;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,30,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 208;
	                this.statement();
	                break;

	            case 2:
	                this.state = 209;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 214;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 225;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===22) {
	            this.state = 215;
	            this.match(activityParser.FORK_AGAIN);
	            this.state = 220;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	                this.state = 218;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,32,this._ctx);
	                switch(la_) {
	                case 1:
	                    this.state = 216;
	                    this.statement();
	                    break;

	                case 2:
	                    this.state = 217;
	                    this.match(activityParser.ARROW);
	                    break;

	                }
	                this.state = 222;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	            this.state = 227;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 228;
	        _la = this._input.LA(1);
	        if(!(_la===23 || _la===24)) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	        this.state = 232;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===49) {
	            this.state = 229;
	            this.match(activityParser.LBRACE);
	            this.state = 230;
	            this.match(activityParser.ACTIVITY_LABEL);
	            this.state = 231;
	            this.match(activityParser.RBRACE);
	        }

	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	splitStatement() {
	    let localctx = new SplitStatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 26, activityParser.RULE_splitStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 234;
	        this.match(activityParser.SPLIT);
	        this.state = 239;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 237;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,36,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 235;
	                this.statement();
	                break;

	            case 2:
	                this.state = 236;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 241;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 252;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===26) {
	            this.state = 242;
	            this.match(activityParser.SPLIT_AGAIN);
	            this.state = 247;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	                this.state = 245;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,38,this._ctx);
	                switch(la_) {
	                case 1:
	                    this.state = 243;
	                    this.statement();
	                    break;

	                case 2:
	                    this.state = 244;
	                    this.match(activityParser.ARROW);
	                    break;

	                }
	                this.state = 249;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	            this.state = 254;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 255;
	        this.match(activityParser.END_SPLIT);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	noteStatement() {
	    let localctx = new NoteStatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 28, activityParser.RULE_noteStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 257;
	        this.match(activityParser.NOTE);
	        this.state = 259;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===41) {
	            this.state = 258;
	            this.match(activityParser.FLOATING);
	        }

	        this.state = 262;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===6 || _la===7) {
	            this.state = 261;
	            _la = this._input.LA(1);
	            if(!(_la===6 || _la===7)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	        }

	        this.state = 264;
	        this.match(activityParser.ACTIVITY_LABEL);
	        this.state = 269;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,44,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 267;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,43,this._ctx);
	                switch(la_) {
	                case 1:
	                    this.state = 265;
	                    this.statement();
	                    break;

	                case 2:
	                    this.state = 266;
	                    this.match(activityParser.ARROW);
	                    break;

	                } 
	            }
	            this.state = 271;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,44,this._ctx);
	        }

	        this.state = 273;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,45,this._ctx);
	        if(la_===1) {
	            this.state = 272;
	            this.match(activityParser.END_NOTE);

	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	partitionStatement() {
	    let localctx = new PartitionStatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 30, activityParser.RULE_partitionStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 275;
	        this.match(activityParser.PARTITION);
	        this.state = 277;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===61) {
	            this.state = 276;
	            this.match(activityParser.ACTIVITY_LABEL);
	        }

	        this.state = 279;
	        this.match(activityParser.LBRACE);
	        this.state = 284;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 282;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,47,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 280;
	                this.statement();
	                break;

	            case 2:
	                this.state = 281;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 286;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 287;
	        this.match(activityParser.RBRACE);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	groupStatement() {
	    let localctx = new GroupStatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 32, activityParser.RULE_groupStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 289;
	        this.match(activityParser.GROUP);
	        this.state = 293;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 290;
	            this.statement();
	            this.state = 295;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 296;
	        this.match(activityParser.END_GROUP);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	detachStatement() {
	    let localctx = new DetachStatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 34, activityParser.RULE_detachStatement);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 298;
	        this.match(activityParser.DETACH);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	killStatement() {
	    let localctx = new KillStatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 36, activityParser.RULE_killStatement);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 300;
	        this.match(activityParser.KILL);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	gotoStatement() {
	    let localctx = new GotoStatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 38, activityParser.RULE_gotoStatement);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 302;
	        this.match(activityParser.GOTO);
	        this.state = 303;
	        this.match(activityParser.IDENTIFIER);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	swimlane() {
	    let localctx = new SwimlaneContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 40, activityParser.RULE_swimlane);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 305;
	        this.match(activityParser.PIPE);
	        this.state = 310;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===51) {
	            this.state = 306;
	            this.match(activityParser.LBRACKET);
	            this.state = 307;
	            this.match(activityParser.COLOR_ANNOTATION);
	            this.state = 308;
	            this.match(activityParser.PIPE);
	            this.state = 309;
	            this.match(activityParser.RBRACKET);
	        }

	        this.state = 313;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===62) {
	            this.state = 312;
	            this.match(activityParser.IDENTIFIER);
	        }

	        this.state = 315;
	        this.match(activityParser.PIPE);
	        this.state = 317;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===61) {
	            this.state = 316;
	            this.match(activityParser.ACTIVITY_LABEL);
	        }

	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	condition() {
	    let localctx = new ConditionContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 42, activityParser.RULE_condition);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 319;
	        this.match(activityParser.LPAREN);
	        this.state = 320;
	        this.conditionContent();
	        this.state = 321;
	        this.match(activityParser.RPAREN);
	        this.state = 327;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,53,this._ctx);
	        if(la_===1) {
	            this.state = 322;
	            this.comparisonOperator();
	            this.state = 323;
	            this.match(activityParser.LPAREN);
	            this.state = 324;
	            this.conditionContent();
	            this.state = 325;
	            this.match(activityParser.RPAREN);

	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	comparisonOperator() {
	    let localctx = new ComparisonOperatorContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 44, activityParser.RULE_comparisonOperator);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 329;
	        _la = this._input.LA(1);
	        if(!(_la===42 || _la===46)) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	conditionContent() {
	    let localctx = new ConditionContentContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 46, activityParser.RULE_conditionContent);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 332; 
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        do {
	            this.state = 331;
	            _la = this._input.LA(1);
	            if(!(_la===60 || _la===61)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            this.state = 334; 
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        } while(_la===60 || _la===61);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	inboundBranchLabel() {
	    let localctx = new InboundBranchLabelContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 48, activityParser.RULE_inboundBranchLabel);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 336;
	        this.match(activityParser.LPAREN);
	        this.state = 337;
	        this.match(activityParser.ACTIVITY_LABEL);
	        this.state = 338;
	        this.match(activityParser.RPAREN);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	branchLabel() {
	    let localctx = new BranchLabelContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 50, activityParser.RULE_branchLabel);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 340;
	        this.match(activityParser.LPAREN);
	        this.state = 341;
	        this.match(activityParser.ACTIVITY_LABEL);
	        this.state = 342;
	        this.match(activityParser.RPAREN);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	stereotypeActivity() {
	    let localctx = new StereotypeActivityContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 52, activityParser.RULE_stereotypeActivity);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 344;
	        this.activity();
	        this.state = 345;
	        this.match(activityParser.STEREOTYPE);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}


}

activityParser.EOF = antlr4.Token.EOF;
activityParser.STARTUML = 1;
activityParser.ENDUML = 2;
activityParser.START = 3;
activityParser.STOP = 4;
activityParser.END = 5;
activityParser.LEFT = 6;
activityParser.RIGHT = 7;
activityParser.IF = 8;
activityParser.THEN = 9;
activityParser.ELSE = 10;
activityParser.ELSEIF = 11;
activityParser.ENDIF = 12;
activityParser.REPEAT = 13;
activityParser.REPEAT_WHILE = 14;
activityParser.WHILE = 15;
activityParser.ENDWHILE = 16;
activityParser.SWITCH = 17;
activityParser.CASE = 18;
activityParser.ENDSWITCH = 19;
activityParser.NOT = 20;
activityParser.FORK = 21;
activityParser.FORK_AGAIN = 22;
activityParser.END_FORK = 23;
activityParser.END_MERGE = 24;
activityParser.SPLIT = 25;
activityParser.SPLIT_AGAIN = 26;
activityParser.END_SPLIT = 27;
activityParser.DETACH = 28;
activityParser.KILL = 29;
activityParser.BACKWARD = 30;
activityParser.GOTO = 31;
activityParser.NOTE = 32;
activityParser.END_NOTE = 33;
activityParser.PARTITION = 34;
activityParser.GROUP = 35;
activityParser.END_GROUP = 36;
activityParser.PACKAGE = 37;
activityParser.RECTANGLE = 38;
activityParser.CARD = 39;
activityParser.LABEL = 40;
activityParser.FLOATING = 41;
activityParser.IS = 42;
activityParser.AS = 43;
activityParser.OF = 44;
activityParser.ON = 45;
activityParser.EQUALS = 46;
activityParser.LPAREN = 47;
activityParser.RPAREN = 48;
activityParser.LBRACE = 49;
activityParser.RBRACE = 50;
activityParser.LBRACKET = 51;
activityParser.RBRACKET = 52;
activityParser.PIPE = 53;
activityParser.COLOR = 54;
activityParser.COLOR_ANNOTATION = 55;
activityParser.STEREOTYPE = 56;
activityParser.ARROW = 57;
activityParser.REVERSE_ARROW = 58;
activityParser.DOUBLE_ARROW = 59;
activityParser.ACTIVITY_CONTENT = 60;
activityParser.ACTIVITY_LABEL = 61;
activityParser.IDENTIFIER = 62;
activityParser.NEWLINE = 63;
activityParser.WS = 64;
activityParser.COMMENT = 65;
activityParser.OTHER = 66;

activityParser.RULE_activityDiagram = 0;
activityParser.RULE_statement = 1;
activityParser.RULE_activity = 2;
activityParser.RULE_ifStatement = 3;
activityParser.RULE_ifBlock = 4;
activityParser.RULE_elseIfBlock = 5;
activityParser.RULE_elseBlock = 6;
activityParser.RULE_switchStatement = 7;
activityParser.RULE_switchBlock = 8;
activityParser.RULE_caseStatement = 9;
activityParser.RULE_repeatStatement = 10;
activityParser.RULE_whileStatement = 11;
activityParser.RULE_forkStatement = 12;
activityParser.RULE_splitStatement = 13;
activityParser.RULE_noteStatement = 14;
activityParser.RULE_partitionStatement = 15;
activityParser.RULE_groupStatement = 16;
activityParser.RULE_detachStatement = 17;
activityParser.RULE_killStatement = 18;
activityParser.RULE_gotoStatement = 19;
activityParser.RULE_swimlane = 20;
activityParser.RULE_condition = 21;
activityParser.RULE_comparisonOperator = 22;
activityParser.RULE_conditionContent = 23;
activityParser.RULE_inboundBranchLabel = 24;
activityParser.RULE_branchLabel = 25;
activityParser.RULE_stereotypeActivity = 26;

class ActivityDiagramContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_activityDiagram;
    }

	STARTUML() {
	    return this.getToken(activityParser.STARTUML, 0);
	};

	statement = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(StatementContext);
	    } else {
	        return this.getTypedRuleContext(StatementContext,i);
	    }
	};

	ENDUML() {
	    return this.getToken(activityParser.ENDUML, 0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterActivityDiagram(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitActivityDiagram(this);
		}
	}


}



class StatementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_statement;
    }

	activity() {
	    return this.getTypedRuleContext(ActivityContext,0);
	};

	START() {
	    return this.getToken(activityParser.START, 0);
	};

	STOP() {
	    return this.getToken(activityParser.STOP, 0);
	};

	END() {
	    return this.getToken(activityParser.END, 0);
	};

	ifStatement() {
	    return this.getTypedRuleContext(IfStatementContext,0);
	};

	switchStatement() {
	    return this.getTypedRuleContext(SwitchStatementContext,0);
	};

	repeatStatement() {
	    return this.getTypedRuleContext(RepeatStatementContext,0);
	};

	whileStatement() {
	    return this.getTypedRuleContext(WhileStatementContext,0);
	};

	forkStatement() {
	    return this.getTypedRuleContext(ForkStatementContext,0);
	};

	splitStatement() {
	    return this.getTypedRuleContext(SplitStatementContext,0);
	};

	noteStatement() {
	    return this.getTypedRuleContext(NoteStatementContext,0);
	};

	partitionStatement() {
	    return this.getTypedRuleContext(PartitionStatementContext,0);
	};

	groupStatement() {
	    return this.getTypedRuleContext(GroupStatementContext,0);
	};

	detachStatement() {
	    return this.getTypedRuleContext(DetachStatementContext,0);
	};

	killStatement() {
	    return this.getTypedRuleContext(KillStatementContext,0);
	};

	gotoStatement() {
	    return this.getTypedRuleContext(GotoStatementContext,0);
	};

	swimlane() {
	    return this.getTypedRuleContext(SwimlaneContext,0);
	};

	ARROW() {
	    return this.getToken(activityParser.ARROW, 0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterStatement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitStatement(this);
		}
	}


}



class ActivityContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_activity;
    }

	ACTIVITY_CONTENT() {
	    return this.getToken(activityParser.ACTIVITY_CONTENT, 0);
	};

	COLOR_ANNOTATION() {
	    return this.getToken(activityParser.COLOR_ANNOTATION, 0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterActivity(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitActivity(this);
		}
	}


}



class IfStatementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_ifStatement;
    }

	ifBlock() {
	    return this.getTypedRuleContext(IfBlockContext,0);
	};

	ENDIF() {
	    return this.getToken(activityParser.ENDIF, 0);
	};

	elseIfBlock = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ElseIfBlockContext);
	    } else {
	        return this.getTypedRuleContext(ElseIfBlockContext,i);
	    }
	};

	elseBlock() {
	    return this.getTypedRuleContext(ElseBlockContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterIfStatement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitIfStatement(this);
		}
	}


}



class IfBlockContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_ifBlock;
    }

	IF() {
	    return this.getToken(activityParser.IF, 0);
	};

	condition() {
	    return this.getTypedRuleContext(ConditionContext,0);
	};

	THEN() {
	    return this.getToken(activityParser.THEN, 0);
	};

	branchLabel() {
	    return this.getTypedRuleContext(BranchLabelContext,0);
	};

	statement = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(StatementContext);
	    } else {
	        return this.getTypedRuleContext(StatementContext,i);
	    }
	};

	ARROW = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.ARROW);
	    } else {
	        return this.getToken(activityParser.ARROW, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterIfBlock(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitIfBlock(this);
		}
	}


}



class ElseIfBlockContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_elseIfBlock;
    }

	ELSEIF() {
	    return this.getToken(activityParser.ELSEIF, 0);
	};

	condition() {
	    return this.getTypedRuleContext(ConditionContext,0);
	};

	inboundBranchLabel() {
	    return this.getTypedRuleContext(InboundBranchLabelContext,0);
	};

	THEN() {
	    return this.getToken(activityParser.THEN, 0);
	};

	branchLabel() {
	    return this.getTypedRuleContext(BranchLabelContext,0);
	};

	statement = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(StatementContext);
	    } else {
	        return this.getTypedRuleContext(StatementContext,i);
	    }
	};

	ARROW = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.ARROW);
	    } else {
	        return this.getToken(activityParser.ARROW, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterElseIfBlock(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitElseIfBlock(this);
		}
	}


}



class ElseBlockContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_elseBlock;
    }

	ELSE() {
	    return this.getToken(activityParser.ELSE, 0);
	};

	inboundBranchLabel() {
	    return this.getTypedRuleContext(InboundBranchLabelContext,0);
	};

	branchLabel() {
	    return this.getTypedRuleContext(BranchLabelContext,0);
	};

	statement = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(StatementContext);
	    } else {
	        return this.getTypedRuleContext(StatementContext,i);
	    }
	};

	ARROW = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.ARROW);
	    } else {
	        return this.getToken(activityParser.ARROW, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterElseBlock(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitElseBlock(this);
		}
	}


}



class SwitchStatementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_switchStatement;
    }

	switchBlock() {
	    return this.getTypedRuleContext(SwitchBlockContext,0);
	};

	ENDSWITCH() {
	    return this.getToken(activityParser.ENDSWITCH, 0);
	};

	caseStatement = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(CaseStatementContext);
	    } else {
	        return this.getTypedRuleContext(CaseStatementContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterSwitchStatement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitSwitchStatement(this);
		}
	}


}



class SwitchBlockContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_switchBlock;
    }

	SWITCH() {
	    return this.getToken(activityParser.SWITCH, 0);
	};

	condition() {
	    return this.getTypedRuleContext(ConditionContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterSwitchBlock(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitSwitchBlock(this);
		}
	}


}



class CaseStatementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_caseStatement;
    }

	CASE() {
	    return this.getToken(activityParser.CASE, 0);
	};

	condition() {
	    return this.getTypedRuleContext(ConditionContext,0);
	};

	statement = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(StatementContext);
	    } else {
	        return this.getTypedRuleContext(StatementContext,i);
	    }
	};

	ARROW = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.ARROW);
	    } else {
	        return this.getToken(activityParser.ARROW, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterCaseStatement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitCaseStatement(this);
		}
	}


}



class RepeatStatementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_repeatStatement;
    }

	REPEAT() {
	    return this.getToken(activityParser.REPEAT, 0);
	};

	REPEAT_WHILE() {
	    return this.getToken(activityParser.REPEAT_WHILE, 0);
	};

	condition() {
	    return this.getTypedRuleContext(ConditionContext,0);
	};

	statement = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(StatementContext);
	    } else {
	        return this.getTypedRuleContext(StatementContext,i);
	    }
	};

	ARROW = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.ARROW);
	    } else {
	        return this.getToken(activityParser.ARROW, i);
	    }
	};


	BACKWARD() {
	    return this.getToken(activityParser.BACKWARD, 0);
	};

	activity() {
	    return this.getTypedRuleContext(ActivityContext,0);
	};

	IS() {
	    return this.getToken(activityParser.IS, 0);
	};

	branchLabel = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(BranchLabelContext);
	    } else {
	        return this.getTypedRuleContext(BranchLabelContext,i);
	    }
	};

	NOT() {
	    return this.getToken(activityParser.NOT, 0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterRepeatStatement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitRepeatStatement(this);
		}
	}


}



class WhileStatementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_whileStatement;
    }

	WHILE() {
	    return this.getToken(activityParser.WHILE, 0);
	};

	condition() {
	    return this.getTypedRuleContext(ConditionContext,0);
	};

	ENDWHILE() {
	    return this.getToken(activityParser.ENDWHILE, 0);
	};

	statement = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(StatementContext);
	    } else {
	        return this.getTypedRuleContext(StatementContext,i);
	    }
	};

	ARROW = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.ARROW);
	    } else {
	        return this.getToken(activityParser.ARROW, i);
	    }
	};


	LPAREN() {
	    return this.getToken(activityParser.LPAREN, 0);
	};

	ACTIVITY_LABEL() {
	    return this.getToken(activityParser.ACTIVITY_LABEL, 0);
	};

	RPAREN() {
	    return this.getToken(activityParser.RPAREN, 0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterWhileStatement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitWhileStatement(this);
		}
	}


}



class ForkStatementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_forkStatement;
    }

	FORK() {
	    return this.getToken(activityParser.FORK, 0);
	};

	END_FORK() {
	    return this.getToken(activityParser.END_FORK, 0);
	};

	END_MERGE() {
	    return this.getToken(activityParser.END_MERGE, 0);
	};

	statement = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(StatementContext);
	    } else {
	        return this.getTypedRuleContext(StatementContext,i);
	    }
	};

	ARROW = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.ARROW);
	    } else {
	        return this.getToken(activityParser.ARROW, i);
	    }
	};


	FORK_AGAIN = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.FORK_AGAIN);
	    } else {
	        return this.getToken(activityParser.FORK_AGAIN, i);
	    }
	};


	LBRACE() {
	    return this.getToken(activityParser.LBRACE, 0);
	};

	ACTIVITY_LABEL() {
	    return this.getToken(activityParser.ACTIVITY_LABEL, 0);
	};

	RBRACE() {
	    return this.getToken(activityParser.RBRACE, 0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterForkStatement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitForkStatement(this);
		}
	}


}



class SplitStatementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_splitStatement;
    }

	SPLIT() {
	    return this.getToken(activityParser.SPLIT, 0);
	};

	END_SPLIT() {
	    return this.getToken(activityParser.END_SPLIT, 0);
	};

	statement = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(StatementContext);
	    } else {
	        return this.getTypedRuleContext(StatementContext,i);
	    }
	};

	ARROW = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.ARROW);
	    } else {
	        return this.getToken(activityParser.ARROW, i);
	    }
	};


	SPLIT_AGAIN = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.SPLIT_AGAIN);
	    } else {
	        return this.getToken(activityParser.SPLIT_AGAIN, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterSplitStatement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitSplitStatement(this);
		}
	}


}



class NoteStatementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_noteStatement;
    }

	NOTE() {
	    return this.getToken(activityParser.NOTE, 0);
	};

	ACTIVITY_LABEL() {
	    return this.getToken(activityParser.ACTIVITY_LABEL, 0);
	};

	FLOATING() {
	    return this.getToken(activityParser.FLOATING, 0);
	};

	statement = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(StatementContext);
	    } else {
	        return this.getTypedRuleContext(StatementContext,i);
	    }
	};

	ARROW = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.ARROW);
	    } else {
	        return this.getToken(activityParser.ARROW, i);
	    }
	};


	END_NOTE() {
	    return this.getToken(activityParser.END_NOTE, 0);
	};

	LEFT() {
	    return this.getToken(activityParser.LEFT, 0);
	};

	RIGHT() {
	    return this.getToken(activityParser.RIGHT, 0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterNoteStatement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitNoteStatement(this);
		}
	}


}



class PartitionStatementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_partitionStatement;
    }

	PARTITION() {
	    return this.getToken(activityParser.PARTITION, 0);
	};

	LBRACE() {
	    return this.getToken(activityParser.LBRACE, 0);
	};

	RBRACE() {
	    return this.getToken(activityParser.RBRACE, 0);
	};

	ACTIVITY_LABEL() {
	    return this.getToken(activityParser.ACTIVITY_LABEL, 0);
	};

	statement = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(StatementContext);
	    } else {
	        return this.getTypedRuleContext(StatementContext,i);
	    }
	};

	ARROW = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.ARROW);
	    } else {
	        return this.getToken(activityParser.ARROW, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterPartitionStatement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitPartitionStatement(this);
		}
	}


}



class GroupStatementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_groupStatement;
    }

	GROUP() {
	    return this.getToken(activityParser.GROUP, 0);
	};

	END_GROUP() {
	    return this.getToken(activityParser.END_GROUP, 0);
	};

	statement = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(StatementContext);
	    } else {
	        return this.getTypedRuleContext(StatementContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterGroupStatement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitGroupStatement(this);
		}
	}


}



class DetachStatementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_detachStatement;
    }

	DETACH() {
	    return this.getToken(activityParser.DETACH, 0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterDetachStatement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitDetachStatement(this);
		}
	}


}



class KillStatementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_killStatement;
    }

	KILL() {
	    return this.getToken(activityParser.KILL, 0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterKillStatement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitKillStatement(this);
		}
	}


}



class GotoStatementContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_gotoStatement;
    }

	GOTO() {
	    return this.getToken(activityParser.GOTO, 0);
	};

	IDENTIFIER() {
	    return this.getToken(activityParser.IDENTIFIER, 0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterGotoStatement(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitGotoStatement(this);
		}
	}


}



class SwimlaneContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_swimlane;
    }

	PIPE = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.PIPE);
	    } else {
	        return this.getToken(activityParser.PIPE, i);
	    }
	};


	LBRACKET() {
	    return this.getToken(activityParser.LBRACKET, 0);
	};

	COLOR_ANNOTATION() {
	    return this.getToken(activityParser.COLOR_ANNOTATION, 0);
	};

	RBRACKET() {
	    return this.getToken(activityParser.RBRACKET, 0);
	};

	IDENTIFIER() {
	    return this.getToken(activityParser.IDENTIFIER, 0);
	};

	ACTIVITY_LABEL() {
	    return this.getToken(activityParser.ACTIVITY_LABEL, 0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterSwimlane(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitSwimlane(this);
		}
	}


}



class ConditionContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_condition;
    }

	LPAREN = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.LPAREN);
	    } else {
	        return this.getToken(activityParser.LPAREN, i);
	    }
	};


	conditionContent = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ConditionContentContext);
	    } else {
	        return this.getTypedRuleContext(ConditionContentContext,i);
	    }
	};

	RPAREN = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.RPAREN);
	    } else {
	        return this.getToken(activityParser.RPAREN, i);
	    }
	};


	comparisonOperator() {
	    return this.getTypedRuleContext(ComparisonOperatorContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterCondition(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitCondition(this);
		}
	}


}



class ComparisonOperatorContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_comparisonOperator;
    }

	IS() {
	    return this.getToken(activityParser.IS, 0);
	};

	EQUALS() {
	    return this.getToken(activityParser.EQUALS, 0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterComparisonOperator(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitComparisonOperator(this);
		}
	}


}



class ConditionContentContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_conditionContent;
    }

	ACTIVITY_LABEL = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.ACTIVITY_LABEL);
	    } else {
	        return this.getToken(activityParser.ACTIVITY_LABEL, i);
	    }
	};


	ACTIVITY_CONTENT = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.ACTIVITY_CONTENT);
	    } else {
	        return this.getToken(activityParser.ACTIVITY_CONTENT, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterConditionContent(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitConditionContent(this);
		}
	}


}



class InboundBranchLabelContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_inboundBranchLabel;
    }

	LPAREN() {
	    return this.getToken(activityParser.LPAREN, 0);
	};

	ACTIVITY_LABEL() {
	    return this.getToken(activityParser.ACTIVITY_LABEL, 0);
	};

	RPAREN() {
	    return this.getToken(activityParser.RPAREN, 0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterInboundBranchLabel(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitInboundBranchLabel(this);
		}
	}


}



class BranchLabelContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_branchLabel;
    }

	LPAREN() {
	    return this.getToken(activityParser.LPAREN, 0);
	};

	ACTIVITY_LABEL() {
	    return this.getToken(activityParser.ACTIVITY_LABEL, 0);
	};

	RPAREN() {
	    return this.getToken(activityParser.RPAREN, 0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterBranchLabel(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitBranchLabel(this);
		}
	}


}



class StereotypeActivityContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = activityParser.RULE_stereotypeActivity;
    }

	activity() {
	    return this.getTypedRuleContext(ActivityContext,0);
	};

	STEREOTYPE() {
	    return this.getToken(activityParser.STEREOTYPE, 0);
	};

	enterRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.enterStereotypeActivity(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof activityParserListener ) {
	        listener.exitStereotypeActivity(this);
		}
	}


}




activityParser.ActivityDiagramContext = ActivityDiagramContext; 
activityParser.StatementContext = StatementContext; 
activityParser.ActivityContext = ActivityContext; 
activityParser.IfStatementContext = IfStatementContext; 
activityParser.IfBlockContext = IfBlockContext; 
activityParser.ElseIfBlockContext = ElseIfBlockContext; 
activityParser.ElseBlockContext = ElseBlockContext; 
activityParser.SwitchStatementContext = SwitchStatementContext; 
activityParser.SwitchBlockContext = SwitchBlockContext; 
activityParser.CaseStatementContext = CaseStatementContext; 
activityParser.RepeatStatementContext = RepeatStatementContext; 
activityParser.WhileStatementContext = WhileStatementContext; 
activityParser.ForkStatementContext = ForkStatementContext; 
activityParser.SplitStatementContext = SplitStatementContext; 
activityParser.NoteStatementContext = NoteStatementContext; 
activityParser.PartitionStatementContext = PartitionStatementContext; 
activityParser.GroupStatementContext = GroupStatementContext; 
activityParser.DetachStatementContext = DetachStatementContext; 
activityParser.KillStatementContext = KillStatementContext; 
activityParser.GotoStatementContext = GotoStatementContext; 
activityParser.SwimlaneContext = SwimlaneContext; 
activityParser.ConditionContext = ConditionContext; 
activityParser.ComparisonOperatorContext = ComparisonOperatorContext; 
activityParser.ConditionContentContext = ConditionContentContext; 
activityParser.InboundBranchLabelContext = InboundBranchLabelContext; 
activityParser.BranchLabelContext = BranchLabelContext; 
activityParser.StereotypeActivityContext = StereotypeActivityContext; 
