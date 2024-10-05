// Generated from java-escape by ANTLR 4.11.1
// jshint ignore: start
import antlr4 from 'antlr4';
import activityParserListener from './activityParserListener.js';
const serializedATN = [4,1,66,344,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,
4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,
2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,
20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,1,0,3,0,54,8,0,
1,0,5,0,57,8,0,10,0,12,0,60,9,0,1,0,3,0,63,8,0,1,1,1,1,1,1,1,1,1,1,1,1,1,
1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,83,8,1,1,2,3,2,86,8,2,
1,2,1,2,1,3,1,3,5,3,92,8,3,10,3,12,3,95,9,3,1,3,3,3,98,8,3,1,3,1,3,1,4,1,
4,1,4,3,4,105,8,4,1,4,3,4,108,8,4,1,4,1,4,5,4,112,8,4,10,4,12,4,115,9,4,
1,5,3,5,118,8,5,1,5,1,5,1,5,3,5,123,8,5,1,5,3,5,126,8,5,1,5,1,5,5,5,130,
8,5,10,5,12,5,133,9,5,1,6,3,6,136,8,6,1,6,1,6,3,6,140,8,6,1,6,1,6,5,6,144,
8,6,10,6,12,6,147,9,6,1,7,1,7,1,7,5,7,152,8,7,10,7,12,7,155,9,7,1,7,1,7,
1,8,1,8,1,8,1,8,5,8,163,8,8,10,8,12,8,166,9,8,1,9,1,9,1,9,5,9,171,8,9,10,
9,12,9,174,9,9,1,9,1,9,3,9,178,8,9,1,9,1,9,1,9,1,9,1,9,1,9,1,9,3,9,187,8,
9,1,10,1,10,1,10,1,10,5,10,193,8,10,10,10,12,10,196,9,10,1,10,1,10,1,10,
1,10,3,10,202,8,10,1,11,1,11,1,11,5,11,207,8,11,10,11,12,11,210,9,11,1,11,
1,11,1,11,5,11,215,8,11,10,11,12,11,218,9,11,5,11,220,8,11,10,11,12,11,223,
9,11,1,11,1,11,1,11,1,11,3,11,229,8,11,1,12,1,12,1,12,5,12,234,8,12,10,12,
12,12,237,9,12,1,12,1,12,1,12,5,12,242,8,12,10,12,12,12,245,9,12,5,12,247,
8,12,10,12,12,12,250,9,12,1,12,1,12,1,13,1,13,3,13,256,8,13,1,13,3,13,259,
8,13,1,13,1,13,1,13,5,13,264,8,13,10,13,12,13,267,9,13,1,13,3,13,270,8,13,
1,14,1,14,3,14,274,8,14,1,14,1,14,1,14,5,14,279,8,14,10,14,12,14,282,9,14,
1,14,1,14,1,15,1,15,5,15,288,8,15,10,15,12,15,291,9,15,1,15,1,15,1,16,1,
16,1,17,1,17,1,18,1,18,1,18,1,19,1,19,1,19,1,19,1,19,3,19,307,8,19,1,19,
3,19,310,8,19,1,19,1,19,3,19,314,8,19,1,20,1,20,1,20,1,20,1,20,1,20,1,20,
1,20,3,20,324,8,20,1,21,1,21,1,22,4,22,329,8,22,11,22,12,22,330,1,23,1,23,
1,23,1,23,1,24,1,24,1,24,1,24,1,25,1,25,1,25,1,25,0,0,26,0,2,4,6,8,10,12,
14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,0,4,1,0,23,24,1,
0,6,7,2,0,42,42,46,46,1,0,60,61,388,0,53,1,0,0,0,2,82,1,0,0,0,4,85,1,0,0,
0,6,89,1,0,0,0,8,101,1,0,0,0,10,117,1,0,0,0,12,135,1,0,0,0,14,148,1,0,0,
0,16,158,1,0,0,0,18,167,1,0,0,0,20,188,1,0,0,0,22,203,1,0,0,0,24,230,1,0,
0,0,26,253,1,0,0,0,28,271,1,0,0,0,30,285,1,0,0,0,32,294,1,0,0,0,34,296,1,
0,0,0,36,298,1,0,0,0,38,301,1,0,0,0,40,315,1,0,0,0,42,325,1,0,0,0,44,328,
1,0,0,0,46,332,1,0,0,0,48,336,1,0,0,0,50,340,1,0,0,0,52,54,5,1,0,0,53,52,
1,0,0,0,53,54,1,0,0,0,54,58,1,0,0,0,55,57,3,2,1,0,56,55,1,0,0,0,57,60,1,
0,0,0,58,56,1,0,0,0,58,59,1,0,0,0,59,62,1,0,0,0,60,58,1,0,0,0,61,63,5,2,
0,0,62,61,1,0,0,0,62,63,1,0,0,0,63,1,1,0,0,0,64,83,3,4,2,0,65,83,5,3,0,0,
66,83,5,4,0,0,67,83,5,5,0,0,68,83,3,6,3,0,69,83,3,14,7,0,70,83,3,18,9,0,
71,83,3,20,10,0,72,83,3,22,11,0,73,83,3,24,12,0,74,83,3,26,13,0,75,83,3,
28,14,0,76,83,3,30,15,0,77,83,3,32,16,0,78,83,3,34,17,0,79,83,3,36,18,0,
80,83,3,38,19,0,81,83,5,57,0,0,82,64,1,0,0,0,82,65,1,0,0,0,82,66,1,0,0,0,
82,67,1,0,0,0,82,68,1,0,0,0,82,69,1,0,0,0,82,70,1,0,0,0,82,71,1,0,0,0,82,
72,1,0,0,0,82,73,1,0,0,0,82,74,1,0,0,0,82,75,1,0,0,0,82,76,1,0,0,0,82,77,
1,0,0,0,82,78,1,0,0,0,82,79,1,0,0,0,82,80,1,0,0,0,82,81,1,0,0,0,83,3,1,0,
0,0,84,86,5,55,0,0,85,84,1,0,0,0,85,86,1,0,0,0,86,87,1,0,0,0,87,88,5,60,
0,0,88,5,1,0,0,0,89,93,3,8,4,0,90,92,3,10,5,0,91,90,1,0,0,0,92,95,1,0,0,
0,93,91,1,0,0,0,93,94,1,0,0,0,94,97,1,0,0,0,95,93,1,0,0,0,96,98,3,12,6,0,
97,96,1,0,0,0,97,98,1,0,0,0,98,99,1,0,0,0,99,100,5,12,0,0,100,7,1,0,0,0,
101,102,5,8,0,0,102,104,3,40,20,0,103,105,5,9,0,0,104,103,1,0,0,0,104,105,
1,0,0,0,105,107,1,0,0,0,106,108,3,48,24,0,107,106,1,0,0,0,107,108,1,0,0,
0,108,113,1,0,0,0,109,112,3,2,1,0,110,112,5,57,0,0,111,109,1,0,0,0,111,110,
1,0,0,0,112,115,1,0,0,0,113,111,1,0,0,0,113,114,1,0,0,0,114,9,1,0,0,0,115,
113,1,0,0,0,116,118,3,46,23,0,117,116,1,0,0,0,117,118,1,0,0,0,118,119,1,
0,0,0,119,120,5,11,0,0,120,122,3,40,20,0,121,123,5,9,0,0,122,121,1,0,0,0,
122,123,1,0,0,0,123,125,1,0,0,0,124,126,3,48,24,0,125,124,1,0,0,0,125,126,
1,0,0,0,126,131,1,0,0,0,127,130,3,2,1,0,128,130,5,57,0,0,129,127,1,0,0,0,
129,128,1,0,0,0,130,133,1,0,0,0,131,129,1,0,0,0,131,132,1,0,0,0,132,11,1,
0,0,0,133,131,1,0,0,0,134,136,3,46,23,0,135,134,1,0,0,0,135,136,1,0,0,0,
136,137,1,0,0,0,137,139,5,10,0,0,138,140,3,48,24,0,139,138,1,0,0,0,139,140,
1,0,0,0,140,145,1,0,0,0,141,144,3,2,1,0,142,144,5,57,0,0,143,141,1,0,0,0,
143,142,1,0,0,0,144,147,1,0,0,0,145,143,1,0,0,0,145,146,1,0,0,0,146,13,1,
0,0,0,147,145,1,0,0,0,148,149,5,17,0,0,149,153,3,40,20,0,150,152,3,16,8,
0,151,150,1,0,0,0,152,155,1,0,0,0,153,151,1,0,0,0,153,154,1,0,0,0,154,156,
1,0,0,0,155,153,1,0,0,0,156,157,5,19,0,0,157,15,1,0,0,0,158,159,5,18,0,0,
159,164,3,40,20,0,160,163,3,2,1,0,161,163,5,57,0,0,162,160,1,0,0,0,162,161,
1,0,0,0,163,166,1,0,0,0,164,162,1,0,0,0,164,165,1,0,0,0,165,17,1,0,0,0,166,
164,1,0,0,0,167,172,5,13,0,0,168,171,3,2,1,0,169,171,5,57,0,0,170,168,1,
0,0,0,170,169,1,0,0,0,171,174,1,0,0,0,172,170,1,0,0,0,172,173,1,0,0,0,173,
177,1,0,0,0,174,172,1,0,0,0,175,176,5,30,0,0,176,178,3,4,2,0,177,175,1,0,
0,0,177,178,1,0,0,0,178,179,1,0,0,0,179,180,5,14,0,0,180,186,3,40,20,0,181,
182,5,42,0,0,182,183,3,48,24,0,183,184,5,20,0,0,184,185,3,48,24,0,185,187,
1,0,0,0,186,181,1,0,0,0,186,187,1,0,0,0,187,19,1,0,0,0,188,189,5,15,0,0,
189,194,3,40,20,0,190,193,3,2,1,0,191,193,5,57,0,0,192,190,1,0,0,0,192,191,
1,0,0,0,193,196,1,0,0,0,194,192,1,0,0,0,194,195,1,0,0,0,195,197,1,0,0,0,
196,194,1,0,0,0,197,201,5,16,0,0,198,199,5,47,0,0,199,200,5,61,0,0,200,202,
5,48,0,0,201,198,1,0,0,0,201,202,1,0,0,0,202,21,1,0,0,0,203,208,5,21,0,0,
204,207,3,2,1,0,205,207,5,57,0,0,206,204,1,0,0,0,206,205,1,0,0,0,207,210,
1,0,0,0,208,206,1,0,0,0,208,209,1,0,0,0,209,221,1,0,0,0,210,208,1,0,0,0,
211,216,5,22,0,0,212,215,3,2,1,0,213,215,5,57,0,0,214,212,1,0,0,0,214,213,
1,0,0,0,215,218,1,0,0,0,216,214,1,0,0,0,216,217,1,0,0,0,217,220,1,0,0,0,
218,216,1,0,0,0,219,211,1,0,0,0,220,223,1,0,0,0,221,219,1,0,0,0,221,222,
1,0,0,0,222,224,1,0,0,0,223,221,1,0,0,0,224,228,7,0,0,0,225,226,5,49,0,0,
226,227,5,61,0,0,227,229,5,50,0,0,228,225,1,0,0,0,228,229,1,0,0,0,229,23,
1,0,0,0,230,235,5,25,0,0,231,234,3,2,1,0,232,234,5,57,0,0,233,231,1,0,0,
0,233,232,1,0,0,0,234,237,1,0,0,0,235,233,1,0,0,0,235,236,1,0,0,0,236,248,
1,0,0,0,237,235,1,0,0,0,238,243,5,26,0,0,239,242,3,2,1,0,240,242,5,57,0,
0,241,239,1,0,0,0,241,240,1,0,0,0,242,245,1,0,0,0,243,241,1,0,0,0,243,244,
1,0,0,0,244,247,1,0,0,0,245,243,1,0,0,0,246,238,1,0,0,0,247,250,1,0,0,0,
248,246,1,0,0,0,248,249,1,0,0,0,249,251,1,0,0,0,250,248,1,0,0,0,251,252,
5,27,0,0,252,25,1,0,0,0,253,255,5,32,0,0,254,256,5,41,0,0,255,254,1,0,0,
0,255,256,1,0,0,0,256,258,1,0,0,0,257,259,7,1,0,0,258,257,1,0,0,0,258,259,
1,0,0,0,259,260,1,0,0,0,260,265,5,61,0,0,261,264,3,2,1,0,262,264,5,57,0,
0,263,261,1,0,0,0,263,262,1,0,0,0,264,267,1,0,0,0,265,263,1,0,0,0,265,266,
1,0,0,0,266,269,1,0,0,0,267,265,1,0,0,0,268,270,5,33,0,0,269,268,1,0,0,0,
269,270,1,0,0,0,270,27,1,0,0,0,271,273,5,34,0,0,272,274,5,61,0,0,273,272,
1,0,0,0,273,274,1,0,0,0,274,275,1,0,0,0,275,280,5,49,0,0,276,279,3,2,1,0,
277,279,5,57,0,0,278,276,1,0,0,0,278,277,1,0,0,0,279,282,1,0,0,0,280,278,
1,0,0,0,280,281,1,0,0,0,281,283,1,0,0,0,282,280,1,0,0,0,283,284,5,50,0,0,
284,29,1,0,0,0,285,289,5,35,0,0,286,288,3,2,1,0,287,286,1,0,0,0,288,291,
1,0,0,0,289,287,1,0,0,0,289,290,1,0,0,0,290,292,1,0,0,0,291,289,1,0,0,0,
292,293,5,36,0,0,293,31,1,0,0,0,294,295,5,28,0,0,295,33,1,0,0,0,296,297,
5,29,0,0,297,35,1,0,0,0,298,299,5,31,0,0,299,300,5,62,0,0,300,37,1,0,0,0,
301,306,5,53,0,0,302,303,5,51,0,0,303,304,5,55,0,0,304,305,5,53,0,0,305,
307,5,52,0,0,306,302,1,0,0,0,306,307,1,0,0,0,307,309,1,0,0,0,308,310,5,62,
0,0,309,308,1,0,0,0,309,310,1,0,0,0,310,311,1,0,0,0,311,313,5,53,0,0,312,
314,5,61,0,0,313,312,1,0,0,0,313,314,1,0,0,0,314,39,1,0,0,0,315,316,5,47,
0,0,316,317,3,44,22,0,317,323,5,48,0,0,318,319,3,42,21,0,319,320,5,47,0,
0,320,321,3,44,22,0,321,322,5,48,0,0,322,324,1,0,0,0,323,318,1,0,0,0,323,
324,1,0,0,0,324,41,1,0,0,0,325,326,7,2,0,0,326,43,1,0,0,0,327,329,7,3,0,
0,328,327,1,0,0,0,329,330,1,0,0,0,330,328,1,0,0,0,330,331,1,0,0,0,331,45,
1,0,0,0,332,333,5,47,0,0,333,334,5,61,0,0,334,335,5,48,0,0,335,47,1,0,0,
0,336,337,5,47,0,0,337,338,5,61,0,0,338,339,5,48,0,0,339,49,1,0,0,0,340,
341,3,4,2,0,341,342,5,56,0,0,342,51,1,0,0,0,55,53,58,62,82,85,93,97,104,
107,111,113,117,122,125,129,131,135,139,143,145,153,162,164,170,172,177,
186,192,194,201,206,208,214,216,221,228,233,235,241,243,248,255,258,263,
265,269,273,278,280,289,306,309,313,323,330];


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
                         "caseStatement", "repeatStatement", "whileStatement", 
                         "forkStatement", "splitStatement", "noteStatement", 
                         "partitionStatement", "groupStatement", "detachStatement", 
                         "killStatement", "gotoStatement", "swimlane", "condition", 
                         "comparisonOperator", "conditionContent", "inboundBranchLabel", 
                         "branchLabel", "stereotypeActivity" ];

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
	        this.state = 53;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===1) {
	            this.state = 52;
	            this.match(activityParser.STARTUML);
	        }

	        this.state = 58;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 55;
	            this.statement();
	            this.state = 60;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 62;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===2) {
	            this.state = 61;
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
	        this.state = 82;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 55:
	        case 60:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 64;
	            this.activity();
	            break;
	        case 3:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 65;
	            this.match(activityParser.START);
	            break;
	        case 4:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 66;
	            this.match(activityParser.STOP);
	            break;
	        case 5:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 67;
	            this.match(activityParser.END);
	            break;
	        case 8:
	            this.enterOuterAlt(localctx, 5);
	            this.state = 68;
	            this.ifStatement();
	            break;
	        case 17:
	            this.enterOuterAlt(localctx, 6);
	            this.state = 69;
	            this.switchStatement();
	            break;
	        case 13:
	            this.enterOuterAlt(localctx, 7);
	            this.state = 70;
	            this.repeatStatement();
	            break;
	        case 15:
	            this.enterOuterAlt(localctx, 8);
	            this.state = 71;
	            this.whileStatement();
	            break;
	        case 21:
	            this.enterOuterAlt(localctx, 9);
	            this.state = 72;
	            this.forkStatement();
	            break;
	        case 25:
	            this.enterOuterAlt(localctx, 10);
	            this.state = 73;
	            this.splitStatement();
	            break;
	        case 32:
	            this.enterOuterAlt(localctx, 11);
	            this.state = 74;
	            this.noteStatement();
	            break;
	        case 34:
	            this.enterOuterAlt(localctx, 12);
	            this.state = 75;
	            this.partitionStatement();
	            break;
	        case 35:
	            this.enterOuterAlt(localctx, 13);
	            this.state = 76;
	            this.groupStatement();
	            break;
	        case 28:
	            this.enterOuterAlt(localctx, 14);
	            this.state = 77;
	            this.detachStatement();
	            break;
	        case 29:
	            this.enterOuterAlt(localctx, 15);
	            this.state = 78;
	            this.killStatement();
	            break;
	        case 31:
	            this.enterOuterAlt(localctx, 16);
	            this.state = 79;
	            this.gotoStatement();
	            break;
	        case 53:
	            this.enterOuterAlt(localctx, 17);
	            this.state = 80;
	            this.swimlane();
	            break;
	        case 57:
	            this.enterOuterAlt(localctx, 18);
	            this.state = 81;
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
	        this.state = 85;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===55) {
	            this.state = 84;
	            this.match(activityParser.COLOR_ANNOTATION);
	        }

	        this.state = 87;
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
	        this.state = 89;
	        this.ifBlock();
	        this.state = 93;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,5,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 90;
	                this.elseIfBlock(); 
	            }
	            this.state = 95;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,5,this._ctx);
	        }

	        this.state = 97;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===10 || _la===47) {
	            this.state = 96;
	            this.elseBlock();
	        }

	        this.state = 99;
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
	        this.state = 101;
	        this.match(activityParser.IF);
	        this.state = 102;
	        this.condition();
	        this.state = 104;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===9) {
	            this.state = 103;
	            this.match(activityParser.THEN);
	        }

	        this.state = 107;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,8,this._ctx);
	        if(la_===1) {
	            this.state = 106;
	            this.branchLabel();

	        }
	        this.state = 113;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 111;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,9,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 109;
	                this.statement();
	                break;

	            case 2:
	                this.state = 110;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 115;
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
	        this.state = 117;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===47) {
	            this.state = 116;
	            this.inboundBranchLabel();
	        }

	        this.state = 119;
	        this.match(activityParser.ELSEIF);
	        this.state = 120;
	        this.condition();
	        this.state = 122;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===9) {
	            this.state = 121;
	            this.match(activityParser.THEN);
	        }

	        this.state = 125;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,13,this._ctx);
	        if(la_===1) {
	            this.state = 124;
	            this.branchLabel();

	        }
	        this.state = 131;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 129;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,14,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 127;
	                this.statement();
	                break;

	            case 2:
	                this.state = 128;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 133;
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
	        this.state = 135;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===47) {
	            this.state = 134;
	            this.inboundBranchLabel();
	        }

	        this.state = 137;
	        this.match(activityParser.ELSE);
	        this.state = 139;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===47) {
	            this.state = 138;
	            this.branchLabel();
	        }

	        this.state = 145;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 143;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,18,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 141;
	                this.statement();
	                break;

	            case 2:
	                this.state = 142;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 147;
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
	        this.state = 148;
	        this.match(activityParser.SWITCH);
	        this.state = 149;
	        this.condition();
	        this.state = 153;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===18) {
	            this.state = 150;
	            this.caseStatement();
	            this.state = 155;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 156;
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
	    this.enterRule(localctx, 16, activityParser.RULE_caseStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 158;
	        this.match(activityParser.CASE);
	        this.state = 159;
	        this.condition();
	        this.state = 164;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 162;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,21,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 160;
	                this.statement();
	                break;

	            case 2:
	                this.state = 161;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 166;
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
	    this.enterRule(localctx, 18, activityParser.RULE_repeatStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 167;
	        this.match(activityParser.REPEAT);
	        this.state = 172;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 170;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,23,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 168;
	                this.statement();
	                break;

	            case 2:
	                this.state = 169;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 174;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 177;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===30) {
	            this.state = 175;
	            this.match(activityParser.BACKWARD);
	            this.state = 176;
	            this.activity();
	        }

	        this.state = 179;
	        this.match(activityParser.REPEAT_WHILE);
	        this.state = 180;
	        this.condition();
	        this.state = 186;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===42) {
	            this.state = 181;
	            this.match(activityParser.IS);
	            this.state = 182;
	            this.branchLabel();
	            this.state = 183;
	            this.match(activityParser.NOT);
	            this.state = 184;
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
	    this.enterRule(localctx, 20, activityParser.RULE_whileStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 188;
	        this.match(activityParser.WHILE);
	        this.state = 189;
	        this.condition();
	        this.state = 194;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 192;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,27,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 190;
	                this.statement();
	                break;

	            case 2:
	                this.state = 191;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 196;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 197;
	        this.match(activityParser.ENDWHILE);
	        this.state = 201;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,29,this._ctx);
	        if(la_===1) {
	            this.state = 198;
	            this.match(activityParser.LPAREN);
	            this.state = 199;
	            this.match(activityParser.ACTIVITY_LABEL);
	            this.state = 200;
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
	    this.enterRule(localctx, 22, activityParser.RULE_forkStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 203;
	        this.match(activityParser.FORK);
	        this.state = 208;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 206;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,30,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 204;
	                this.statement();
	                break;

	            case 2:
	                this.state = 205;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 210;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 221;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===22) {
	            this.state = 211;
	            this.match(activityParser.FORK_AGAIN);
	            this.state = 216;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	                this.state = 214;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,32,this._ctx);
	                switch(la_) {
	                case 1:
	                    this.state = 212;
	                    this.statement();
	                    break;

	                case 2:
	                    this.state = 213;
	                    this.match(activityParser.ARROW);
	                    break;

	                }
	                this.state = 218;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	            this.state = 223;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 224;
	        _la = this._input.LA(1);
	        if(!(_la===23 || _la===24)) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	        this.state = 228;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===49) {
	            this.state = 225;
	            this.match(activityParser.LBRACE);
	            this.state = 226;
	            this.match(activityParser.ACTIVITY_LABEL);
	            this.state = 227;
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
	    this.enterRule(localctx, 24, activityParser.RULE_splitStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 230;
	        this.match(activityParser.SPLIT);
	        this.state = 235;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 233;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,36,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 231;
	                this.statement();
	                break;

	            case 2:
	                this.state = 232;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 237;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 248;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===26) {
	            this.state = 238;
	            this.match(activityParser.SPLIT_AGAIN);
	            this.state = 243;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	                this.state = 241;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,38,this._ctx);
	                switch(la_) {
	                case 1:
	                    this.state = 239;
	                    this.statement();
	                    break;

	                case 2:
	                    this.state = 240;
	                    this.match(activityParser.ARROW);
	                    break;

	                }
	                this.state = 245;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	            this.state = 250;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 251;
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
	    this.enterRule(localctx, 26, activityParser.RULE_noteStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 253;
	        this.match(activityParser.NOTE);
	        this.state = 255;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===41) {
	            this.state = 254;
	            this.match(activityParser.FLOATING);
	        }

	        this.state = 258;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===6 || _la===7) {
	            this.state = 257;
	            _la = this._input.LA(1);
	            if(!(_la===6 || _la===7)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	        }

	        this.state = 260;
	        this.match(activityParser.ACTIVITY_LABEL);
	        this.state = 265;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,44,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 263;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,43,this._ctx);
	                switch(la_) {
	                case 1:
	                    this.state = 261;
	                    this.statement();
	                    break;

	                case 2:
	                    this.state = 262;
	                    this.match(activityParser.ARROW);
	                    break;

	                } 
	            }
	            this.state = 267;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,44,this._ctx);
	        }

	        this.state = 269;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,45,this._ctx);
	        if(la_===1) {
	            this.state = 268;
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
	    this.enterRule(localctx, 28, activityParser.RULE_partitionStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 271;
	        this.match(activityParser.PARTITION);
	        this.state = 273;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===61) {
	            this.state = 272;
	            this.match(activityParser.ACTIVITY_LABEL);
	        }

	        this.state = 275;
	        this.match(activityParser.LBRACE);
	        this.state = 280;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 278;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,47,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 276;
	                this.statement();
	                break;

	            case 2:
	                this.state = 277;
	                this.match(activityParser.ARROW);
	                break;

	            }
	            this.state = 282;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 283;
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
	    this.enterRule(localctx, 30, activityParser.RULE_groupStatement);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 285;
	        this.match(activityParser.GROUP);
	        this.state = 289;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & 2988613944) !== 0) || ((((_la - 32)) & ~0x1f) == 0 && ((1 << (_la - 32)) & 312475661) !== 0)) {
	            this.state = 286;
	            this.statement();
	            this.state = 291;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 292;
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
	    this.enterRule(localctx, 32, activityParser.RULE_detachStatement);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 294;
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
	    this.enterRule(localctx, 34, activityParser.RULE_killStatement);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 296;
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
	    this.enterRule(localctx, 36, activityParser.RULE_gotoStatement);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 298;
	        this.match(activityParser.GOTO);
	        this.state = 299;
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
	    this.enterRule(localctx, 38, activityParser.RULE_swimlane);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 301;
	        this.match(activityParser.PIPE);
	        this.state = 306;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===51) {
	            this.state = 302;
	            this.match(activityParser.LBRACKET);
	            this.state = 303;
	            this.match(activityParser.COLOR_ANNOTATION);
	            this.state = 304;
	            this.match(activityParser.PIPE);
	            this.state = 305;
	            this.match(activityParser.RBRACKET);
	        }

	        this.state = 309;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===62) {
	            this.state = 308;
	            this.match(activityParser.IDENTIFIER);
	        }

	        this.state = 311;
	        this.match(activityParser.PIPE);
	        this.state = 313;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===61) {
	            this.state = 312;
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
	    this.enterRule(localctx, 40, activityParser.RULE_condition);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 315;
	        this.match(activityParser.LPAREN);
	        this.state = 316;
	        this.conditionContent();
	        this.state = 317;
	        this.match(activityParser.RPAREN);
	        this.state = 323;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,53,this._ctx);
	        if(la_===1) {
	            this.state = 318;
	            this.comparisonOperator();
	            this.state = 319;
	            this.match(activityParser.LPAREN);
	            this.state = 320;
	            this.conditionContent();
	            this.state = 321;
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
	    this.enterRule(localctx, 42, activityParser.RULE_comparisonOperator);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 325;
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
	    this.enterRule(localctx, 44, activityParser.RULE_conditionContent);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 328; 
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        do {
	            this.state = 327;
	            _la = this._input.LA(1);
	            if(!(_la===60 || _la===61)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            this.state = 330; 
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
	    this.enterRule(localctx, 46, activityParser.RULE_inboundBranchLabel);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 332;
	        this.match(activityParser.LPAREN);
	        this.state = 333;
	        this.match(activityParser.ACTIVITY_LABEL);
	        this.state = 334;
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
	    this.enterRule(localctx, 48, activityParser.RULE_branchLabel);
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



	stereotypeActivity() {
	    let localctx = new StereotypeActivityContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 50, activityParser.RULE_stereotypeActivity);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 340;
	        this.activity();
	        this.state = 341;
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
activityParser.RULE_caseStatement = 8;
activityParser.RULE_repeatStatement = 9;
activityParser.RULE_whileStatement = 10;
activityParser.RULE_forkStatement = 11;
activityParser.RULE_splitStatement = 12;
activityParser.RULE_noteStatement = 13;
activityParser.RULE_partitionStatement = 14;
activityParser.RULE_groupStatement = 15;
activityParser.RULE_detachStatement = 16;
activityParser.RULE_killStatement = 17;
activityParser.RULE_gotoStatement = 18;
activityParser.RULE_swimlane = 19;
activityParser.RULE_condition = 20;
activityParser.RULE_comparisonOperator = 21;
activityParser.RULE_conditionContent = 22;
activityParser.RULE_inboundBranchLabel = 23;
activityParser.RULE_branchLabel = 24;
activityParser.RULE_stereotypeActivity = 25;

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
