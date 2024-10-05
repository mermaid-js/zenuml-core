// Generated from java-escape by ANTLR 4.11.1
// jshint ignore: start
import antlr4 from 'antlr4';
import activityParserListener from './activityParserListener.js';
const serializedATN = [4,1,66,329,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,
4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,
2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,
20,7,20,2,21,7,21,1,0,3,0,46,8,0,1,0,5,0,49,8,0,10,0,12,0,52,9,0,1,0,3,0,
55,8,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
1,1,1,3,1,75,8,1,1,2,3,2,78,8,2,1,2,1,2,1,3,1,3,1,3,3,3,85,8,3,1,3,3,3,88,
8,3,1,3,1,3,5,3,92,8,3,10,3,12,3,95,9,3,1,3,3,3,98,8,3,1,3,1,3,1,3,3,3,103,
8,3,1,3,3,3,106,8,3,1,3,1,3,5,3,110,8,3,10,3,12,3,113,9,3,5,3,115,8,3,10,
3,12,3,118,9,3,1,3,3,3,121,8,3,1,3,1,3,3,3,125,8,3,1,3,1,3,5,3,129,8,3,10,
3,12,3,132,9,3,3,3,134,8,3,1,3,1,3,1,4,1,4,1,4,5,4,141,8,4,10,4,12,4,144,
9,4,1,4,1,4,1,5,1,5,1,5,1,5,5,5,152,8,5,10,5,12,5,155,9,5,1,6,1,6,1,6,5,
6,160,8,6,10,6,12,6,163,9,6,1,6,1,6,3,6,167,8,6,1,6,1,6,1,6,1,6,1,6,1,6,
1,6,3,6,176,8,6,1,7,1,7,1,7,1,7,5,7,182,8,7,10,7,12,7,185,9,7,1,7,1,7,1,
7,1,7,3,7,191,8,7,1,8,1,8,1,8,5,8,196,8,8,10,8,12,8,199,9,8,1,8,1,8,1,8,
5,8,204,8,8,10,8,12,8,207,9,8,5,8,209,8,8,10,8,12,8,212,9,8,1,8,1,8,1,8,
1,8,3,8,218,8,8,1,9,1,9,1,9,5,9,223,8,9,10,9,12,9,226,9,9,1,9,1,9,1,9,5,
9,231,8,9,10,9,12,9,234,9,9,5,9,236,8,9,10,9,12,9,239,9,9,1,9,1,9,1,10,1,
10,3,10,245,8,10,1,10,3,10,248,8,10,1,10,1,10,1,10,5,10,253,8,10,10,10,12,
10,256,9,10,1,10,3,10,259,8,10,1,11,1,11,3,11,263,8,11,1,11,1,11,1,11,5,
11,268,8,11,10,11,12,11,271,9,11,1,11,1,11,1,12,1,12,5,12,277,8,12,10,12,
12,12,280,9,12,1,12,1,12,1,13,1,13,1,14,1,14,1,15,1,15,1,15,1,16,1,16,1,
16,1,16,1,16,3,16,296,8,16,1,16,3,16,299,8,16,1,16,1,16,3,16,303,8,16,1,
17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,3,17,313,8,17,1,18,1,18,1,19,4,19,
318,8,19,11,19,12,19,319,1,20,1,20,1,20,1,20,1,21,1,21,1,21,1,21,0,0,22,
0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,0,4,1,0,23,
24,1,0,6,7,2,0,42,42,46,46,1,0,60,61,377,0,45,1,0,0,0,2,74,1,0,0,0,4,77,
1,0,0,0,6,81,1,0,0,0,8,137,1,0,0,0,10,147,1,0,0,0,12,156,1,0,0,0,14,177,
1,0,0,0,16,192,1,0,0,0,18,219,1,0,0,0,20,242,1,0,0,0,22,260,1,0,0,0,24,274,
1,0,0,0,26,283,1,0,0,0,28,285,1,0,0,0,30,287,1,0,0,0,32,290,1,0,0,0,34,304,
1,0,0,0,36,314,1,0,0,0,38,317,1,0,0,0,40,321,1,0,0,0,42,325,1,0,0,0,44,46,
5,1,0,0,45,44,1,0,0,0,45,46,1,0,0,0,46,50,1,0,0,0,47,49,3,2,1,0,48,47,1,
0,0,0,49,52,1,0,0,0,50,48,1,0,0,0,50,51,1,0,0,0,51,54,1,0,0,0,52,50,1,0,
0,0,53,55,5,2,0,0,54,53,1,0,0,0,54,55,1,0,0,0,55,1,1,0,0,0,56,75,3,4,2,0,
57,75,5,3,0,0,58,75,5,4,0,0,59,75,5,5,0,0,60,75,3,6,3,0,61,75,3,8,4,0,62,
75,3,12,6,0,63,75,3,14,7,0,64,75,3,16,8,0,65,75,3,18,9,0,66,75,3,20,10,0,
67,75,3,22,11,0,68,75,3,24,12,0,69,75,3,26,13,0,70,75,3,28,14,0,71,75,3,
30,15,0,72,75,3,32,16,0,73,75,5,57,0,0,74,56,1,0,0,0,74,57,1,0,0,0,74,58,
1,0,0,0,74,59,1,0,0,0,74,60,1,0,0,0,74,61,1,0,0,0,74,62,1,0,0,0,74,63,1,
0,0,0,74,64,1,0,0,0,74,65,1,0,0,0,74,66,1,0,0,0,74,67,1,0,0,0,74,68,1,0,
0,0,74,69,1,0,0,0,74,70,1,0,0,0,74,71,1,0,0,0,74,72,1,0,0,0,74,73,1,0,0,
0,75,3,1,0,0,0,76,78,5,55,0,0,77,76,1,0,0,0,77,78,1,0,0,0,78,79,1,0,0,0,
79,80,5,60,0,0,80,5,1,0,0,0,81,82,5,8,0,0,82,84,3,34,17,0,83,85,5,9,0,0,
84,83,1,0,0,0,84,85,1,0,0,0,85,87,1,0,0,0,86,88,3,40,20,0,87,86,1,0,0,0,
87,88,1,0,0,0,88,93,1,0,0,0,89,92,3,2,1,0,90,92,5,57,0,0,91,89,1,0,0,0,91,
90,1,0,0,0,92,95,1,0,0,0,93,91,1,0,0,0,93,94,1,0,0,0,94,116,1,0,0,0,95,93,
1,0,0,0,96,98,3,40,20,0,97,96,1,0,0,0,97,98,1,0,0,0,98,99,1,0,0,0,99,100,
5,11,0,0,100,102,3,34,17,0,101,103,5,9,0,0,102,101,1,0,0,0,102,103,1,0,0,
0,103,105,1,0,0,0,104,106,3,40,20,0,105,104,1,0,0,0,105,106,1,0,0,0,106,
111,1,0,0,0,107,110,3,2,1,0,108,110,5,57,0,0,109,107,1,0,0,0,109,108,1,0,
0,0,110,113,1,0,0,0,111,109,1,0,0,0,111,112,1,0,0,0,112,115,1,0,0,0,113,
111,1,0,0,0,114,97,1,0,0,0,115,118,1,0,0,0,116,114,1,0,0,0,116,117,1,0,0,
0,117,133,1,0,0,0,118,116,1,0,0,0,119,121,3,40,20,0,120,119,1,0,0,0,120,
121,1,0,0,0,121,122,1,0,0,0,122,124,5,10,0,0,123,125,3,40,20,0,124,123,1,
0,0,0,124,125,1,0,0,0,125,130,1,0,0,0,126,129,3,2,1,0,127,129,5,57,0,0,128,
126,1,0,0,0,128,127,1,0,0,0,129,132,1,0,0,0,130,128,1,0,0,0,130,131,1,0,
0,0,131,134,1,0,0,0,132,130,1,0,0,0,133,120,1,0,0,0,133,134,1,0,0,0,134,
135,1,0,0,0,135,136,5,12,0,0,136,7,1,0,0,0,137,138,5,17,0,0,138,142,3,34,
17,0,139,141,3,10,5,0,140,139,1,0,0,0,141,144,1,0,0,0,142,140,1,0,0,0,142,
143,1,0,0,0,143,145,1,0,0,0,144,142,1,0,0,0,145,146,5,19,0,0,146,9,1,0,0,
0,147,148,5,18,0,0,148,153,3,34,17,0,149,152,3,2,1,0,150,152,5,57,0,0,151,
149,1,0,0,0,151,150,1,0,0,0,152,155,1,0,0,0,153,151,1,0,0,0,153,154,1,0,
0,0,154,11,1,0,0,0,155,153,1,0,0,0,156,161,5,13,0,0,157,160,3,2,1,0,158,
160,5,57,0,0,159,157,1,0,0,0,159,158,1,0,0,0,160,163,1,0,0,0,161,159,1,0,
0,0,161,162,1,0,0,0,162,166,1,0,0,0,163,161,1,0,0,0,164,165,5,30,0,0,165,
167,3,4,2,0,166,164,1,0,0,0,166,167,1,0,0,0,167,168,1,0,0,0,168,169,5,14,
0,0,169,175,3,34,17,0,170,171,5,42,0,0,171,172,3,40,20,0,172,173,5,20,0,
0,173,174,3,40,20,0,174,176,1,0,0,0,175,170,1,0,0,0,175,176,1,0,0,0,176,
13,1,0,0,0,177,178,5,15,0,0,178,183,3,34,17,0,179,182,3,2,1,0,180,182,5,
57,0,0,181,179,1,0,0,0,181,180,1,0,0,0,182,185,1,0,0,0,183,181,1,0,0,0,183,
184,1,0,0,0,184,186,1,0,0,0,185,183,1,0,0,0,186,190,5,16,0,0,187,188,5,47,
0,0,188,189,5,61,0,0,189,191,5,48,0,0,190,187,1,0,0,0,190,191,1,0,0,0,191,
15,1,0,0,0,192,197,5,21,0,0,193,196,3,2,1,0,194,196,5,57,0,0,195,193,1,0,
0,0,195,194,1,0,0,0,196,199,1,0,0,0,197,195,1,0,0,0,197,198,1,0,0,0,198,
210,1,0,0,0,199,197,1,0,0,0,200,205,5,22,0,0,201,204,3,2,1,0,202,204,5,57,
0,0,203,201,1,0,0,0,203,202,1,0,0,0,204,207,1,0,0,0,205,203,1,0,0,0,205,
206,1,0,0,0,206,209,1,0,0,0,207,205,1,0,0,0,208,200,1,0,0,0,209,212,1,0,
0,0,210,208,1,0,0,0,210,211,1,0,0,0,211,213,1,0,0,0,212,210,1,0,0,0,213,
217,7,0,0,0,214,215,5,49,0,0,215,216,5,61,0,0,216,218,5,50,0,0,217,214,1,
0,0,0,217,218,1,0,0,0,218,17,1,0,0,0,219,224,5,25,0,0,220,223,3,2,1,0,221,
223,5,57,0,0,222,220,1,0,0,0,222,221,1,0,0,0,223,226,1,0,0,0,224,222,1,0,
0,0,224,225,1,0,0,0,225,237,1,0,0,0,226,224,1,0,0,0,227,232,5,26,0,0,228,
231,3,2,1,0,229,231,5,57,0,0,230,228,1,0,0,0,230,229,1,0,0,0,231,234,1,0,
0,0,232,230,1,0,0,0,232,233,1,0,0,0,233,236,1,0,0,0,234,232,1,0,0,0,235,
227,1,0,0,0,236,239,1,0,0,0,237,235,1,0,0,0,237,238,1,0,0,0,238,240,1,0,
0,0,239,237,1,0,0,0,240,241,5,27,0,0,241,19,1,0,0,0,242,244,5,32,0,0,243,
245,5,41,0,0,244,243,1,0,0,0,244,245,1,0,0,0,245,247,1,0,0,0,246,248,7,1,
0,0,247,246,1,0,0,0,247,248,1,0,0,0,248,249,1,0,0,0,249,254,5,61,0,0,250,
253,3,2,1,0,251,253,5,57,0,0,252,250,1,0,0,0,252,251,1,0,0,0,253,256,1,0,
0,0,254,252,1,0,0,0,254,255,1,0,0,0,255,258,1,0,0,0,256,254,1,0,0,0,257,
259,5,33,0,0,258,257,1,0,0,0,258,259,1,0,0,0,259,21,1,0,0,0,260,262,5,34,
0,0,261,263,5,61,0,0,262,261,1,0,0,0,262,263,1,0,0,0,263,264,1,0,0,0,264,
269,5,49,0,0,265,268,3,2,1,0,266,268,5,57,0,0,267,265,1,0,0,0,267,266,1,
0,0,0,268,271,1,0,0,0,269,267,1,0,0,0,269,270,1,0,0,0,270,272,1,0,0,0,271,
269,1,0,0,0,272,273,5,50,0,0,273,23,1,0,0,0,274,278,5,35,0,0,275,277,3,2,
1,0,276,275,1,0,0,0,277,280,1,0,0,0,278,276,1,0,0,0,278,279,1,0,0,0,279,
281,1,0,0,0,280,278,1,0,0,0,281,282,5,36,0,0,282,25,1,0,0,0,283,284,5,28,
0,0,284,27,1,0,0,0,285,286,5,29,0,0,286,29,1,0,0,0,287,288,5,31,0,0,288,
289,5,62,0,0,289,31,1,0,0,0,290,295,5,53,0,0,291,292,5,51,0,0,292,293,5,
55,0,0,293,294,5,53,0,0,294,296,5,52,0,0,295,291,1,0,0,0,295,296,1,0,0,0,
296,298,1,0,0,0,297,299,5,62,0,0,298,297,1,0,0,0,298,299,1,0,0,0,299,300,
1,0,0,0,300,302,5,53,0,0,301,303,5,61,0,0,302,301,1,0,0,0,302,303,1,0,0,
0,303,33,1,0,0,0,304,305,5,47,0,0,305,306,3,38,19,0,306,312,5,48,0,0,307,
308,3,36,18,0,308,309,5,47,0,0,309,310,3,38,19,0,310,311,5,48,0,0,311,313,
1,0,0,0,312,307,1,0,0,0,312,313,1,0,0,0,313,35,1,0,0,0,314,315,7,2,0,0,315,
37,1,0,0,0,316,318,7,3,0,0,317,316,1,0,0,0,318,319,1,0,0,0,319,317,1,0,0,
0,319,320,1,0,0,0,320,39,1,0,0,0,321,322,5,47,0,0,322,323,5,61,0,0,323,324,
5,48,0,0,324,41,1,0,0,0,325,326,3,4,2,0,326,327,5,56,0,0,327,43,1,0,0,0,
55,45,50,54,74,77,84,87,91,93,97,102,105,109,111,116,120,124,128,130,133,
142,151,153,159,161,166,175,181,183,190,195,197,203,205,210,217,222,224,
230,232,237,244,247,252,254,258,262,267,269,278,295,298,302,312,319];


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
                         "switchStatement", "caseStatement", "repeatStatement", 
                         "whileStatement", "forkStatement", "splitStatement", 
                         "noteStatement", "partitionStatement", "groupStatement", 
                         "detachStatement", "killStatement", "gotoStatement", 
                         "swimlane", "condition", "comparisonOperator", 
                         "conditionContent", "branchLabel", "stereotypeActivity" ];

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
	        this.state = 45;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===1) {
	            this.state = 44;
	            this.match(activityParser.STARTUML);
	        }

	        this.state = 50;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 47;
	            this.statement();
	            this.state = 52;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 54;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===2) {
	            this.state = 53;
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
	        this.state = 74;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 55:
	        case 60:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 56;
	            this.activity();
	            break;
	        case 3:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 57;
	            this.match(activityParser.START);
	            break;
	        case 4:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 58;
	            this.match(activityParser.STOP);
	            break;
	        case 5:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 59;
	            this.match(activityParser.END);
	            break;
	        case 8:
	            this.enterOuterAlt(localctx, 5);
	            this.state = 60;
	            this.ifStatement();
	            break;
	        case 17:
	            this.enterOuterAlt(localctx, 6);
	            this.state = 61;
	            this.switchStatement();
	            break;
	        case 13:
	            this.enterOuterAlt(localctx, 7);
	            this.state = 62;
	            this.repeatStatement();
	            break;
	        case 15:
	            this.enterOuterAlt(localctx, 8);
	            this.state = 63;
	            this.whileStatement();
	            break;
	        case 21:
	            this.enterOuterAlt(localctx, 9);
	            this.state = 64;
	            this.forkStatement();
	            break;
	        case 25:
	            this.enterOuterAlt(localctx, 10);
	            this.state = 65;
	            this.splitStatement();
	            break;
	        case 32:
	            this.enterOuterAlt(localctx, 11);
	            this.state = 66;
	            this.noteStatement();
	            break;
	        case 34:
	            this.enterOuterAlt(localctx, 12);
	            this.state = 67;
	            this.partitionStatement();
	            break;
	        case 35:
	            this.enterOuterAlt(localctx, 13);
	            this.state = 68;
	            this.groupStatement();
	            break;
	        case 28:
	            this.enterOuterAlt(localctx, 14);
	            this.state = 69;
	            this.detachStatement();
	            break;
	        case 29:
	            this.enterOuterAlt(localctx, 15);
	            this.state = 70;
	            this.killStatement();
	            break;
	        case 31:
	            this.enterOuterAlt(localctx, 16);
	            this.state = 71;
	            this.gotoStatement();
	            break;
	        case 53:
	            this.enterOuterAlt(localctx, 17);
	            this.state = 72;
	            this.swimlane();
	            break;
	        case 57:
	            this.enterOuterAlt(localctx, 18);
	            this.state = 73;
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
	        this.state = 77;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===55) {
	            this.state = 76;
	            this.match(activityParser.COLOR_ANNOTATION);
	        }

	        this.state = 79;
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
	        this.state = 81;
	        this.match(activityParser.IF);
	        this.state = 82;
	        this.condition();

	        this.state = 84;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===9) {
	            this.state = 83;
	            this.match(activityParser.THEN);
	        }

	        this.state = 87;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,6,this._ctx);
	        if(la_===1) {
	            this.state = 86;
	            this.branchLabel();

	        }
	        this.state = 93;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 91;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,7,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 89;
	                this.statement();
	                break;

	            case 2:
	                this.state = 90;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 95;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 116;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,14,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 97;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	                if(_la===47) {
	                    this.state = 96;
	                    this.branchLabel();
	                }

	                this.state = 99;
	                this.match(activityParser.ELSEIF);
	                this.state = 100;
	                this.condition();
	                this.state = 102;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	                if(_la===9) {
	                    this.state = 101;
	                    this.match(activityParser.THEN);
	                }

	                this.state = 105;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,11,this._ctx);
	                if(la_===1) {
	                    this.state = 104;
	                    this.branchLabel();

	                }
	                this.state = 111;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	                while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	                    this.state = 109;
	                    this._errHandler.sync(this);
	                    var la_ = this._interp.adaptivePredict(this._input,12,this._ctx);
	                    switch(la_) {
	                    case 1:
	                        this.state = 107;
	                        this.statement();
	                        break;

	                    case 2:
	                        this.state = 108;
	                        this.match(activityParser.ARROW);
	                        break;

	                    }
	                    this.state = 113;
	                    this._errHandler.sync(this);
	                    _la = this._input.LA(1);
	                } 
	            }
	            this.state = 118;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,14,this._ctx);
	        }

	        this.state = 133;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===10 || _la===47) {
	            this.state = 120;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===47) {
	                this.state = 119;
	                this.branchLabel();
	            }

	            this.state = 122;
	            this.match(activityParser.ELSE);
	            this.state = 124;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===47) {
	                this.state = 123;
	                this.branchLabel();
	            }

	            this.state = 130;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	                this.state = 128;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,17,this._ctx);
	                switch(la_) {
	                case 1:
	                    this.state = 126;
	                    this.statement();
	                    break;

	                case 2:
	                    this.state = 127;
	                    this.match(activityParser.ARROW);
	                    break;

	                }
	                this.state = 132;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	        }

	        this.state = 135;
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



	switchStatement() {
	    let localctx = new SwitchStatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 8, activityParser.RULE_switchStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 137;
	        this.match(activityParser.SWITCH);
	        this.state = 138;
	        this.condition();
	        this.state = 142;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===18) {
	            this.state = 139;
	            this.caseStatement();
	            this.state = 144;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 145;
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



	caseStatement() {
	    let localctx = new CaseStatementContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 10, activityParser.RULE_caseStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 147;
	        this.match(activityParser.CASE);
	        this.state = 148;
	        this.condition();
	        this.state = 153;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 151;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,21,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 149;
	                this.statement();
	                break;

	            case 2:
	                this.state = 150;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 155;
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
	    this.enterRule(localctx, 12, activityParser.RULE_repeatStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 156;
	        this.match(activityParser.REPEAT);
	        this.state = 161;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 159;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,23,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 157;
	                this.statement();
	                break;

	            case 2:
	                this.state = 158;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 163;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 166;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===30) {
	            this.state = 164;
	            this.match(activityParser.BACKWARD);
	            this.state = 165;
	            this.activity();
	        }

	        this.state = 168;
	        this.match(activityParser.REPEAT_WHILE);
	        this.state = 169;
	        this.condition();
	        this.state = 175;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===42) {
	            this.state = 170;
	            this.match(activityParser.IS);
	            this.state = 171;
	            this.branchLabel();
	            this.state = 172;
	            this.match(activityParser.NOT);
	            this.state = 173;
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
	    this.enterRule(localctx, 14, activityParser.RULE_whileStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 177;
	        this.match(activityParser.WHILE);
	        this.state = 178;
	        this.condition();
	        this.state = 183;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 181;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,27,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 179;
	                this.statement();
	                break;

	            case 2:
	                this.state = 180;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 185;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 186;
	        this.match(activityParser.ENDWHILE);
	        this.state = 190;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,29,this._ctx);
	        if(la_===1) {
	            this.state = 187;
	            this.match(activityParser.LPAREN);
	            this.state = 188;
	            this.match(activityParser.ACTIVITY_LABEL);
	            this.state = 189;
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
	    this.enterRule(localctx, 16, activityParser.RULE_forkStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 192;
	        this.match(activityParser.FORK);
	        this.state = 197;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 195;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,30,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 193;
	                this.statement();
	                break;

	            case 2:
	                this.state = 194;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 199;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 210;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===22) {
	            this.state = 200;
	            this.match(activityParser.FORK_AGAIN);
	            this.state = 205;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	                this.state = 203;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,32,this._ctx);
	                switch(la_) {
	                case 1:
	                    this.state = 201;
	                    this.statement();
	                    break;

	                case 2:
	                    this.state = 202;
	                    this.match(activityParser.ARROW);
	                    break;

	                }
	                this.state = 207;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	            this.state = 212;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 213;
	        _la = this._input.LA(1);
	        if(!(_la===23 || _la===24)) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	        this.state = 217;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===49) {
	            this.state = 214;
	            this.match(activityParser.LBRACE);
	            this.state = 215;
	            this.match(activityParser.ACTIVITY_LABEL);
	            this.state = 216;
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
	    this.enterRule(localctx, 18, activityParser.RULE_splitStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 219;
	        this.match(activityParser.SPLIT);
	        this.state = 224;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 222;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,36,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 220;
	                this.statement();
	                break;

	            case 2:
	                this.state = 221;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 226;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 237;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===26) {
	            this.state = 227;
	            this.match(activityParser.SPLIT_AGAIN);
	            this.state = 232;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	                this.state = 230;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,38,this._ctx);
	                switch(la_) {
	                case 1:
	                    this.state = 228;
	                    this.statement();
	                    break;

	                case 2:
	                    this.state = 229;
	                    this.match(activityParser.ARROW);
	                    break;

	                }
	                this.state = 234;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	            this.state = 239;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 240;
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
	    this.enterRule(localctx, 20, activityParser.RULE_noteStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 242;
	        this.match(activityParser.NOTE);
	        this.state = 244;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===41) {
	            this.state = 243;
	            this.match(activityParser.FLOATING);
	        }

	        this.state = 247;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===6 || _la===7) {
	            this.state = 246;
	            _la = this._input.LA(1);
	            if(!(_la===6 || _la===7)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	        }

	        this.state = 249;
	        this.match(activityParser.ACTIVITY_LABEL);
	        this.state = 254;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,44,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 252;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,43,this._ctx);
	                switch(la_) {
	                case 1:
	                    this.state = 250;
	                    this.statement();
	                    break;

	                case 2:
	                    this.state = 251;
	                    this.match(activityParser.ARROW);
	                    break;

	                } 
	            }
	            this.state = 256;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,44,this._ctx);
	        }

	        this.state = 258;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,45,this._ctx);
	        if(la_===1) {
	            this.state = 257;
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
	    this.enterRule(localctx, 22, activityParser.RULE_partitionStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 260;
	        this.match(activityParser.PARTITION);
	        this.state = 262;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===61) {
	            this.state = 261;
	            this.match(activityParser.ACTIVITY_LABEL);
	        }

	        this.state = 264;
	        this.match(activityParser.LBRACE);
	        this.state = 269;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 267;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,47,this._ctx);
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
	            this.state = 271;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 272;
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
	    this.enterRule(localctx, 24, activityParser.RULE_groupStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 274;
	        this.match(activityParser.GROUP);
	        this.state = 278;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 275;
	            this.statement();
	            this.state = 280;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 281;
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
	    this.enterRule(localctx, 26, activityParser.RULE_detachStatement);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 283;
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
	    this.enterRule(localctx, 28, activityParser.RULE_killStatement);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 285;
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
	    this.enterRule(localctx, 30, activityParser.RULE_gotoStatement);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 287;
	        this.match(activityParser.GOTO);
	        this.state = 288;
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
	    this.enterRule(localctx, 32, activityParser.RULE_swimlane);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 290;
	        this.match(activityParser.PIPE);
	        this.state = 295;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===51) {
	            this.state = 291;
	            this.match(activityParser.LBRACKET);
	            this.state = 292;
	            this.match(activityParser.COLOR_ANNOTATION);
	            this.state = 293;
	            this.match(activityParser.PIPE);
	            this.state = 294;
	            this.match(activityParser.RBRACKET);
	        }

	        this.state = 298;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===62) {
	            this.state = 297;
	            this.match(activityParser.IDENTIFIER);
	        }

	        this.state = 300;
	        this.match(activityParser.PIPE);
	        this.state = 302;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===61) {
	            this.state = 301;
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
	    this.enterRule(localctx, 34, activityParser.RULE_condition);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 304;
	        this.match(activityParser.LPAREN);
	        this.state = 305;
	        this.conditionContent();
	        this.state = 306;
	        this.match(activityParser.RPAREN);
	        this.state = 312;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,53,this._ctx);
	        if(la_===1) {
	            this.state = 307;
	            this.comparisonOperator();
	            this.state = 308;
	            this.match(activityParser.LPAREN);
	            this.state = 309;
	            this.conditionContent();
	            this.state = 310;
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
	    this.enterRule(localctx, 36, activityParser.RULE_comparisonOperator);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 314;
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
	    this.enterRule(localctx, 38, activityParser.RULE_conditionContent);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 317; 
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        do {
	            this.state = 316;
	            _la = this._input.LA(1);
	            if(!(_la===60 || _la===61)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            this.state = 319; 
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



	branchLabel() {
	    let localctx = new BranchLabelContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 40, activityParser.RULE_branchLabel);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 321;
	        this.match(activityParser.LPAREN);
	        this.state = 322;
	        this.match(activityParser.ACTIVITY_LABEL);
	        this.state = 323;
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
	    this.enterRule(localctx, 42, activityParser.RULE_stereotypeActivity);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 325;
	        this.activity();
	        this.state = 326;
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
activityParser.RULE_switchStatement = 4;
activityParser.RULE_caseStatement = 5;
activityParser.RULE_repeatStatement = 6;
activityParser.RULE_whileStatement = 7;
activityParser.RULE_forkStatement = 8;
activityParser.RULE_splitStatement = 9;
activityParser.RULE_noteStatement = 10;
activityParser.RULE_partitionStatement = 11;
activityParser.RULE_groupStatement = 12;
activityParser.RULE_detachStatement = 13;
activityParser.RULE_killStatement = 14;
activityParser.RULE_gotoStatement = 15;
activityParser.RULE_swimlane = 16;
activityParser.RULE_condition = 17;
activityParser.RULE_comparisonOperator = 18;
activityParser.RULE_conditionContent = 19;
activityParser.RULE_branchLabel = 20;
activityParser.RULE_stereotypeActivity = 21;

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

	IF() {
	    return this.getToken(activityParser.IF, 0);
	};

	condition = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ConditionContext);
	    } else {
	        return this.getTypedRuleContext(ConditionContext,i);
	    }
	};

	ENDIF() {
	    return this.getToken(activityParser.ENDIF, 0);
	};

	THEN = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.THEN);
	    } else {
	        return this.getToken(activityParser.THEN, i);
	    }
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


	ELSEIF = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(activityParser.ELSEIF);
	    } else {
	        return this.getToken(activityParser.ELSEIF, i);
	    }
	};


	ELSE() {
	    return this.getToken(activityParser.ELSE, 0);
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

	SWITCH() {
	    return this.getToken(activityParser.SWITCH, 0);
	};

	condition() {
	    return this.getTypedRuleContext(ConditionContext,0);
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
activityParser.SwitchStatementContext = SwitchStatementContext; 
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
activityParser.BranchLabelContext = BranchLabelContext; 
activityParser.StereotypeActivityContext = StereotypeActivityContext; 
