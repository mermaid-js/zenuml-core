// Generated from ./sequenceParser.g4 by ANTLR 4.5.3
// jshint ignore: start
var antlr4 = require('antlr4/index');
var sequenceParserListener = require('./sequenceParserListener').sequenceParserListener;
var grammarFileName = "sequenceParser.g4";

var serializedATN = ["\u0003\u0430\ud6d1\u8206\uad2d\u4417\uaef1\u8d80\uaadd",
    "\u00033\u01ab\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t",
    "\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007\u0004",
    "\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004\f\t\f\u0004",
    "\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0004\u0010\t\u0010\u0004",
    "\u0011\t\u0011\u0004\u0012\t\u0012\u0004\u0013\t\u0013\u0004\u0014\t",
    "\u0014\u0004\u0015\t\u0015\u0004\u0016\t\u0016\u0004\u0017\t\u0017\u0004",
    "\u0018\t\u0018\u0004\u0019\t\u0019\u0004\u001a\t\u001a\u0004\u001b\t",
    "\u001b\u0004\u001c\t\u001c\u0004\u001d\t\u001d\u0004\u001e\t\u001e\u0004",
    "\u001f\t\u001f\u0004 \t \u0004!\t!\u0004\"\t\"\u0004#\t#\u0004$\t$\u0004",
    "%\t%\u0004&\t&\u0004\'\t\'\u0004(\t(\u0004)\t)\u0004*\t*\u0003\u0002",
    "\u0007\u0002V\n\u0002\f\u0002\u000e\u0002Y\u000b\u0002\u0003\u0002\u0003",
    "\u0002\u0003\u0002\u0003\u0002\u0005\u0002_\n\u0002\u0003\u0002\u0003",
    "\u0002\u0005\u0002c\n\u0002\u0003\u0002\u0003\u0002\u0005\u0002g\n\u0002",
    "\u0003\u0003\u0007\u0003j\n\u0003\f\u0003\u000e\u0003m\u000b\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0005\u0003s\n\u0003\u0003",
    "\u0003\u0003\u0003\u0003\u0004\u0003\u0004\u0003\u0005\u0007\u0005z",
    "\n\u0005\f\u0005\u000e\u0005}\u000b\u0005\u0003\u0005\u0003\u0005\u0005",
    "\u0005\u0081\n\u0005\u0003\u0006\u0003\u0006\u0003\u0007\u0003\u0007",
    "\u0003\b\u0007\b\u0088\n\b\f\b\u000e\b\u008b\u000b\b\u0003\b\u0003\b",
    "\u0007\b\u008f\n\b\f\b\u000e\b\u0092\u000b\b\u0007\b\u0094\n\b\f\b\u000e",
    "\b\u0097\u000b\b\u0003\b\u0005\b\u009a\n\b\u0003\t\u0003\t\u0003\t\u0005",
    "\t\u009f\n\t\u0003\n\u0003\n\u0005\n\u00a3\n\n\u0003\u000b\u0007\u000b",
    "\u00a6\n\u000b\f\u000b\u000e\u000b\u00a9\u000b\u000b\u0003\u000b\u0003",
    "\u000b\u0007\u000b\u00ad\n\u000b\f\u000b\u000e\u000b\u00b0\u000b\u000b",
    "\u0003\u000b\u0003\u000b\u0007\u000b\u00b4\n\u000b\f\u000b\u000e\u000b",
    "\u00b7\u000b\u000b\u0003\u000b\u0003\u000b\u0007\u000b\u00bb\n\u000b",
    "\f\u000b\u000e\u000b\u00be\u000b\u000b\u0003\u000b\u0003\u000b\u0007",
    "\u000b\u00c2\n\u000b\f\u000b\u000e\u000b\u00c5\u000b\u000b\u0003\u000b",
    "\u0003\u000b\u0007\u000b\u00c9\n\u000b\f\u000b\u000e\u000b\u00cc\u000b",
    "\u000b\u0003\u000b\u0003\u000b\u0006\u000b\u00d0\n\u000b\r\u000b\u000e",
    "\u000b\u00d1\u0003\u000b\u0003\u000b\u0005\u000b\u00d6\n\u000b\u0003",
    "\f\u0003\f\u0003\f\u0005\f\u00db\n\f\u0003\r\u0003\r\u0003\u000e\u0003",
    "\u000e\u0003\u000f\u0005\u000f\u00e2\n\u000f\u0003\u000f\u0003\u000f",
    "\u0003\u000f\u0003\u000f\u0005\u000f\u00e8\n\u000f\u0003\u000f\u0005",
    "\u000f\u00eb\n\u000f\u0003\u000f\u0003\u000f\u0005\u000f\u00ef\n\u000f",
    "\u0003\u0010\u0005\u0010\u00f2\n\u0010\u0003\u0010\u0003\u0010\u0003",
    "\u0010\u0005\u0010\u00f7\n\u0010\u0003\u0011\u0003\u0011\u0003\u0011",
    "\u0005\u0011\u00fc\n\u0011\u0003\u0011\u0003\u0011\u0003\u0011\u0003",
    "\u0011\u0003\u0011\u0003\u0011\u0003\u0011\u0003\u0011\u0005\u0011\u0106",
    "\n\u0011\u0003\u0011\u0003\u0011\u0007\u0011\u010a\n\u0011\f\u0011\u000e",
    "\u0011\u010d\u000b\u0011\u0003\u0012\u0003\u0012\u0003\u0013\u0003\u0013",
    "\u0005\u0013\u0113\n\u0013\u0003\u0014\u0003\u0014\u0005\u0014\u0117",
    "\n\u0014\u0003\u0014\u0003\u0014\u0003\u0015\u0005\u0015\u011c\n\u0015",
    "\u0003\u0015\u0003\u0015\u0003\u0015\u0003\u0016\u0003\u0016\u0003\u0016",
    "\u0005\u0016\u0124\n\u0016\u0003\u0016\u0003\u0016\u0003\u0016\u0003",
    "\u0016\u0003\u0017\u0003\u0017\u0005\u0017\u012c\n\u0017\u0003\u0018",
    "\u0003\u0018\u0003\u0019\u0003\u0019\u0003\u001a\u0003\u001a\u0003\u001b",
    "\u0003\u001b\u0003\u001c\u0003\u001c\u0003\u001c\u0007\u001c\u0139\n",
    "\u001c\f\u001c\u000e\u001c\u013c\u000b\u001c\u0003\u001c\u0005\u001c",
    "\u013f\n\u001c\u0003\u001d\u0003\u001d\u0003\u001e\u0003\u001e\u0003",
    "\u001f\u0003\u001f\u0003\u001f\u0007\u001f\u0148\n\u001f\f\u001f\u000e",
    "\u001f\u014b\u000b\u001f\u0003 \u0003 \u0003 \u0003 \u0003 \u0005 \u0152",
    "\n \u0003!\u0003!\u0003!\u0003\"\u0003\"\u0007\"\u0159\n\"\f\"\u000e",
    "\"\u015c\u000b\"\u0003\"\u0005\"\u015f\n\"\u0003#\u0003#\u0003#\u0003",
    "#\u0003$\u0003$\u0003$\u0003$\u0003$\u0003%\u0003%\u0003%\u0003&\u0003",
    "&\u0003&\u0006&\u0170\n&\r&\u000e&\u0171\u0005&\u0174\n&\u0003&\u0003",
    "&\u0003\'\u0003\'\u0003\'\u0003\'\u0003(\u0003(\u0003(\u0003(\u0003",
    "(\u0003(\u0003(\u0003(\u0005(\u0184\n(\u0003(\u0003(\u0003(\u0003(\u0003",
    "(\u0003(\u0003(\u0003(\u0003(\u0003(\u0003(\u0003(\u0003(\u0003(\u0003",
    "(\u0003(\u0003(\u0003(\u0003(\u0003(\u0003(\u0007(\u019b\n(\f(\u000e",
    "(\u019e\u000b(\u0003)\u0003)\u0003)\u0003)\u0003)\u0005)\u01a5\n)\u0003",
    "*\u0003*\u0003*\u0003*\u0003*\u0002\u0003N+\u0002\u0004\u0006\b\n\f",
    "\u000e\u0010\u0012\u0014\u0016\u0018\u001a\u001c\u001e \"$&(*,.0246",
    "8:<>@BDFHJLNPR\u0002\t\u0004\u0002((++\u0003\u0002\u0011\u0013\u0003",
    "\u0002\u000f\u0010\u0003\u0002\u000b\u000e\u0003\u0002\t\n\u0003\u0002",
    ")*\u0003\u0002\u001d\u001e\u01c9\u0002W\u0003\u0002\u0002\u0002\u0004",
    "k\u0003\u0002\u0002\u0002\u0006v\u0003\u0002\u0002\u0002\b{\u0003\u0002",
    "\u0002\u0002\n\u0082\u0003\u0002\u0002\u0002\f\u0084\u0003\u0002\u0002",
    "\u0002\u000e\u0095\u0003\u0002\u0002\u0002\u0010\u009b\u0003\u0002\u0002",
    "\u0002\u0012\u00a2\u0003\u0002\u0002\u0002\u0014\u00d5\u0003\u0002\u0002",
    "\u0002\u0016\u00d7\u0003\u0002\u0002\u0002\u0018\u00dc\u0003\u0002\u0002",
    "\u0002\u001a\u00de\u0003\u0002\u0002\u0002\u001c\u00e1\u0003\u0002\u0002",
    "\u0002\u001e\u00f1\u0003\u0002\u0002\u0002 \u0105\u0003\u0002\u0002",
    "\u0002\"\u010e\u0003\u0002\u0002\u0002$\u0110\u0003\u0002\u0002\u0002",
    "&\u0114\u0003\u0002\u0002\u0002(\u011b\u0003\u0002\u0002\u0002*\u0123",
    "\u0003\u0002\u0002\u0002,\u0129\u0003\u0002\u0002\u0002.\u012d\u0003",
    "\u0002\u0002\u00020\u012f\u0003\u0002\u0002\u00022\u0131\u0003\u0002",
    "\u0002\u00024\u0133\u0003\u0002\u0002\u00026\u013e\u0003\u0002\u0002",
    "\u00028\u0140\u0003\u0002\u0002\u0002:\u0142\u0003\u0002\u0002\u0002",
    "<\u0144\u0003\u0002\u0002\u0002>\u0151\u0003\u0002\u0002\u0002@\u0153",
    "\u0003\u0002\u0002\u0002B\u0156\u0003\u0002\u0002\u0002D\u0160\u0003",
    "\u0002\u0002\u0002F\u0164\u0003\u0002\u0002\u0002H\u0169\u0003\u0002",
    "\u0002\u0002J\u016c\u0003\u0002\u0002\u0002L\u0177\u0003\u0002\u0002",
    "\u0002N\u0183\u0003\u0002\u0002\u0002P\u01a4\u0003\u0002\u0002\u0002",
    "R\u01a6\u0003\u0002\u0002\u0002TV\u0005\b\u0005\u0002UT\u0003\u0002",
    "\u0002\u0002VY\u0003\u0002\u0002\u0002WU\u0003\u0002\u0002\u0002WX\u0003",
    "\u0002\u0002\u0002Xf\u0003\u0002\u0002\u0002YW\u0003\u0002\u0002\u0002",
    "Z[\u0005\b\u0005\u0002[\\\u0007\u0002\u0002\u0003\\g\u0003\u0002\u0002",
    "\u0002]_\u0005\u0004\u0003\u0002^]\u0003\u0002\u0002\u0002^_\u0003\u0002",
    "\u0002\u0002_`\u0003\u0002\u0002\u0002`b\u0005\u000e\b\u0002ac\u0005",
    "\u0016\f\u0002ba\u0003\u0002\u0002\u0002bc\u0003\u0002\u0002\u0002c",
    "d\u0003\u0002\u0002\u0002de\u0007\u0002\u0002\u0003eg\u0003\u0002\u0002",
    "\u0002fZ\u0003\u0002\u0002\u0002f^\u0003\u0002\u0002\u0002g\u0003\u0003",
    "\u0002\u0002\u0002hj\u0005\u0016\f\u0002ih\u0003\u0002\u0002\u0002j",
    "m\u0003\u0002\u0002\u0002ki\u0003\u0002\u0002\u0002kl\u0003\u0002\u0002",
    "\u0002ln\u0003\u0002\u0002\u0002mk\u0003\u0002\u0002\u0002no\u0007\u0006",
    "\u0002\u0002op\u0007%\u0002\u0002pr\u0007\u0019\u0002\u0002qs\u0005",
    "\u0006\u0004\u0002rq\u0003\u0002\u0002\u0002rs\u0003\u0002\u0002\u0002",
    "st\u0003\u0002\u0002\u0002tu\u0007\u001a\u0002\u0002u\u0005\u0003\u0002",
    "\u0002\u0002vw\u0007(\u0002\u0002w\u0007\u0003\u0002\u0002\u0002xz\u0005",
    "\u0016\f\u0002yx\u0003\u0002\u0002\u0002z}\u0003\u0002\u0002\u0002{",
    "y\u0003\u0002\u0002\u0002{|\u0003\u0002\u0002\u0002|~\u0003\u0002\u0002",
    "\u0002}{\u0003\u0002\u0002\u0002~\u0080\u0005\n\u0006\u0002\u007f\u0081",
    "\u0005\f\u0007\u0002\u0080\u007f\u0003\u0002\u0002\u0002\u0080\u0081",
    "\u0003\u0002\u0002\u0002\u0081\t\u0003\u0002\u0002\u0002\u0082\u0083",
    "\t\u0002\u0002\u0002\u0083\u000b\u0003\u0002\u0002\u0002\u0084\u0085",
    "\u0007)\u0002\u0002\u0085\r\u0003\u0002\u0002\u0002\u0086\u0088\u0007",
    ",\u0002\u0002\u0087\u0086\u0003\u0002\u0002\u0002\u0088\u008b\u0003",
    "\u0002\u0002\u0002\u0089\u0087\u0003\u0002\u0002\u0002\u0089\u008a\u0003",
    "\u0002\u0002\u0002\u008a\u008c\u0003\u0002\u0002\u0002\u008b\u0089\u0003",
    "\u0002\u0002\u0002\u008c\u0090\u0005\u0014\u000b\u0002\u008d\u008f\u0007",
    ",\u0002\u0002\u008e\u008d\u0003\u0002\u0002\u0002\u008f\u0092\u0003",
    "\u0002\u0002\u0002\u0090\u008e\u0003\u0002\u0002\u0002\u0090\u0091\u0003",
    "\u0002\u0002\u0002\u0091\u0094\u0003\u0002\u0002\u0002\u0092\u0090\u0003",
    "\u0002\u0002\u0002\u0093\u0089\u0003\u0002\u0002\u0002\u0094\u0097\u0003",
    "\u0002\u0002\u0002\u0095\u0093\u0003\u0002\u0002\u0002\u0095\u0096\u0003",
    "\u0002\u0002\u0002\u0096\u0099\u0003\u0002\u0002\u0002\u0097\u0095\u0003",
    "\u0002\u0002\u0002\u0098\u009a\u0005\u0010\t\u0002\u0099\u0098\u0003",
    "\u0002\u0002\u0002\u0099\u009a\u0003\u0002\u0002\u0002\u009a\u000f\u0003",
    "\u0002\u0002\u0002\u009b\u009c\u0007#\u0002\u0002\u009c\u009e\u0005",
    "\u0012\n\u0002\u009d\u009f\u0007\u0016\u0002\u0002\u009e\u009d\u0003",
    "\u0002\u0002\u0002\u009e\u009f\u0003\u0002\u0002\u0002\u009f\u0011\u0003",
    "\u0002\u0002\u0002\u00a0\u00a3\u0005P)\u0002\u00a1\u00a3\u0007(\u0002",
    "\u0002\u00a2\u00a0\u0003\u0002\u0002\u0002\u00a2\u00a1\u0003\u0002\u0002",
    "\u0002\u00a3\u0013\u0003\u0002\u0002\u0002\u00a4\u00a6\u0005\u0016\f",
    "\u0002\u00a5\u00a4\u0003\u0002\u0002\u0002\u00a6\u00a9\u0003\u0002\u0002",
    "\u0002\u00a7\u00a5\u0003\u0002\u0002\u0002\u00a7\u00a8\u0003\u0002\u0002",
    "\u0002\u00a8\u00aa\u0003\u0002\u0002\u0002\u00a9\u00a7\u0003\u0002\u0002",
    "\u0002\u00aa\u00d6\u0005B\"\u0002\u00ab\u00ad\u0005\u0016\f\u0002\u00ac",
    "\u00ab\u0003\u0002\u0002\u0002\u00ad\u00b0\u0003\u0002\u0002\u0002\u00ae",
    "\u00ac\u0003\u0002\u0002\u0002\u00ae\u00af\u0003\u0002\u0002\u0002\u00af",
    "\u00b1\u0003\u0002\u0002\u0002\u00b0\u00ae\u0003\u0002\u0002\u0002\u00b1",
    "\u00d6\u0005L\'\u0002\u00b2\u00b4\u0005\u0016\f\u0002\u00b3\u00b2\u0003",
    "\u0002\u0002\u0002\u00b4\u00b7\u0003\u0002\u0002\u0002\u00b5\u00b3\u0003",
    "\u0002\u0002\u0002\u00b5\u00b6\u0003\u0002\u0002\u0002\u00b6\u00b8\u0003",
    "\u0002\u0002\u0002\u00b7\u00b5\u0003\u0002\u0002\u0002\u00b8\u00d6\u0005",
    "\u001c\u000f\u0002\u00b9\u00bb\u0005\u0016\f\u0002\u00ba\u00b9\u0003",
    "\u0002\u0002\u0002\u00bb\u00be\u0003\u0002\u0002\u0002\u00bc\u00ba\u0003",
    "\u0002\u0002\u0002\u00bc\u00bd\u0003\u0002\u0002\u0002\u00bd\u00bf\u0003",
    "\u0002\u0002\u0002\u00be\u00bc\u0003\u0002\u0002\u0002\u00bf\u00d6\u0005",
    "*\u0016\u0002\u00c0\u00c2\u0005\u0016\f\u0002\u00c1\u00c0\u0003\u0002",
    "\u0002\u0002\u00c2\u00c5\u0003\u0002\u0002\u0002\u00c3\u00c1\u0003\u0002",
    "\u0002\u0002\u00c3\u00c4\u0003\u0002\u0002\u0002\u00c4\u00c6\u0003\u0002",
    "\u0002\u0002\u00c5\u00c3\u0003\u0002\u0002\u0002\u00c6\u00d6\u0005\u001e",
    "\u0010\u0002\u00c7\u00c9\u0005\u0016\f\u0002\u00c8\u00c7\u0003\u0002",
    "\u0002\u0002\u00c9\u00cc\u0003\u0002\u0002\u0002\u00ca\u00c8\u0003\u0002",
    "\u0002\u0002\u00ca\u00cb\u0003\u0002\u0002\u0002\u00cb\u00cd\u0003\u0002",
    "\u0002\u0002\u00cc\u00ca\u0003\u0002\u0002\u0002\u00cd\u00d6\u0005\u001a",
    "\u000e\u0002\u00ce\u00d0\u0005\u0016\f\u0002\u00cf\u00ce\u0003\u0002",
    "\u0002\u0002\u00d0\u00d1\u0003\u0002\u0002\u0002\u00d1\u00cf\u0003\u0002",
    "\u0002\u0002\u00d1\u00d2\u0003\u0002\u0002\u0002\u00d2\u00d6\u0003\u0002",
    "\u0002\u0002\u00d3\u00d4\u0007.\u0002\u0002\u00d4\u00d6\b\u000b\u0001",
    "\u0002\u00d5\u00a7\u0003\u0002\u0002\u0002\u00d5\u00ae\u0003\u0002\u0002",
    "\u0002\u00d5\u00b5\u0003\u0002\u0002\u0002\u00d5\u00bc\u0003\u0002\u0002",
    "\u0002\u00d5\u00c3\u0003\u0002\u0002\u0002\u00d5\u00ca\u0003\u0002\u0002",
    "\u0002\u00d5\u00cf\u0003\u0002\u0002\u0002\u00d5\u00d3\u0003\u0002\u0002",
    "\u0002\u00d6\u0015\u0003\u0002\u0002\u0002\u00d7\u00d8\u0007\u0003\u0002",
    "\u0002\u00d8\u00da\u0005\u0018\r\u0002\u00d9\u00db\u00072\u0002\u0002",
    "\u00da\u00d9\u0003\u0002\u0002\u0002\u00da\u00db\u0003\u0002\u0002\u0002",
    "\u00db\u0017\u0003\u0002\u0002\u0002\u00dc\u00dd\u00071\u0002\u0002",
    "\u00dd\u0019\u0003\u0002\u0002\u0002\u00de\u00df\u0005J&\u0002\u00df",
    "\u001b\u0003\u0002\u0002\u0002\u00e0\u00e2\u0005(\u0015\u0002\u00e1",
    "\u00e0\u0003\u0002\u0002\u0002\u00e1\u00e2\u0003\u0002\u0002\u0002\u00e2",
    "\u00e3\u0003\u0002\u0002\u0002\u00e3\u00e4\u0007$\u0002\u0002\u00e4",
    "\u00ea\u00052\u001a\u0002\u00e5\u00e7\u0007\u0019\u0002\u0002\u00e6",
    "\u00e8\u0005<\u001f\u0002\u00e7\u00e6\u0003\u0002\u0002\u0002\u00e7",
    "\u00e8\u0003\u0002\u0002\u0002\u00e8\u00e9\u0003\u0002\u0002\u0002\u00e9",
    "\u00eb\u0007\u001a\u0002\u0002\u00ea\u00e5\u0003\u0002\u0002\u0002\u00ea",
    "\u00eb\u0003\u0002\u0002\u0002\u00eb\u00ee\u0003\u0002\u0002\u0002\u00ec",
    "\u00ef\u0007\u0016\u0002\u0002\u00ed\u00ef\u0005J&\u0002\u00ee\u00ec",
    "\u0003\u0002\u0002\u0002\u00ee\u00ed\u0003\u0002\u0002\u0002\u00ee\u00ef",
    "\u0003\u0002\u0002\u0002\u00ef\u001d\u0003\u0002\u0002\u0002\u00f0\u00f2",
    "\u0005(\u0015\u0002\u00f1\u00f0\u0003\u0002\u0002\u0002\u00f1\u00f2",
    "\u0003\u0002\u0002\u0002\u00f2\u00f3\u0003\u0002\u0002\u0002\u00f3\u00f6",
    "\u0005 \u0011\u0002\u00f4\u00f7\u0007\u0016\u0002\u0002\u00f5\u00f7",
    "\u0005J&\u0002\u00f6\u00f4\u0003\u0002\u0002\u0002\u00f6\u00f5\u0003",
    "\u0002\u0002\u0002\u00f6\u00f7\u0003\u0002\u0002\u0002\u00f7\u001f\u0003",
    "\u0002\u0002\u0002\u00f8\u00f9\u0005\"\u0012\u0002\u00f9\u00fa\u0007",
    "\u0005\u0002\u0002\u00fa\u00fc\u0003\u0002\u0002\u0002\u00fb\u00f8\u0003",
    "\u0002\u0002\u0002\u00fb\u00fc\u0003\u0002\u0002\u0002\u00fc\u00fd\u0003",
    "\u0002\u0002\u0002\u00fd\u00fe\u00058\u001d\u0002\u00fe\u00ff\u0007",
    "\'\u0002\u0002\u00ff\u0100\u0005$\u0013\u0002\u0100\u0106\u0003\u0002",
    "\u0002\u0002\u0101\u0102\u00058\u001d\u0002\u0102\u0103\u0007\'\u0002",
    "\u0002\u0103\u0106\u0003\u0002\u0002\u0002\u0104\u0106\u0005$\u0013",
    "\u0002\u0105\u00fb\u0003\u0002\u0002\u0002\u0105\u0101\u0003\u0002\u0002",
    "\u0002\u0105\u0104\u0003\u0002\u0002\u0002\u0106\u010b\u0003\u0002\u0002",
    "\u0002\u0107\u0108\u0007\'\u0002\u0002\u0108\u010a\u0005$\u0013\u0002",
    "\u0109\u0107\u0003\u0002\u0002\u0002\u010a\u010d\u0003\u0002\u0002\u0002",
    "\u010b\u0109\u0003\u0002\u0002\u0002\u010b\u010c\u0003\u0002\u0002\u0002",
    "\u010c!\u0003\u0002\u0002\u0002\u010d\u010b\u0003\u0002\u0002\u0002",
    "\u010e\u010f\u0007(\u0002\u0002\u010f#\u0003\u0002\u0002\u0002\u0110",
    "\u0112\u0005:\u001e\u0002\u0111\u0113\u0005&\u0014\u0002\u0112\u0111",
    "\u0003\u0002\u0002\u0002\u0112\u0113\u0003\u0002\u0002\u0002\u0113%",
    "\u0003\u0002\u0002\u0002\u0114\u0116\u0007\u0019\u0002\u0002\u0115\u0117",
    "\u0005<\u001f\u0002\u0116\u0115\u0003\u0002\u0002\u0002\u0116\u0117",
    "\u0003\u0002\u0002\u0002\u0117\u0118\u0003\u0002\u0002\u0002\u0118\u0119",
    "\u0007\u001a\u0002\u0002\u0119\'\u0003\u0002\u0002\u0002\u011a\u011c",
    "\u00054\u001b\u0002\u011b\u011a\u0003\u0002\u0002\u0002\u011b\u011c",
    "\u0003\u0002\u0002\u0002\u011c\u011d\u0003\u0002\u0002\u0002\u011d\u011e",
    "\u00056\u001c\u0002\u011e\u011f\u0007\u0018\u0002\u0002\u011f)\u0003",
    "\u0002\u0002\u0002\u0120\u0121\u0005.\u0018\u0002\u0121\u0122\u0007",
    "\u0005\u0002\u0002\u0122\u0124\u0003\u0002\u0002\u0002\u0123\u0120\u0003",
    "\u0002\u0002\u0002\u0123\u0124\u0003\u0002\u0002\u0002\u0124\u0125\u0003",
    "\u0002\u0002\u0002\u0125\u0126\u00050\u0019\u0002\u0126\u0127\u0007",
    "\u0004\u0002\u0002\u0127\u0128\u0005,\u0017\u0002\u0128+\u0003\u0002",
    "\u0002\u0002\u0129\u012b\u0007/\u0002\u0002\u012a\u012c\u00070\u0002",
    "\u0002\u012b\u012a\u0003\u0002\u0002\u0002\u012b\u012c\u0003\u0002\u0002",
    "\u0002\u012c-\u0003\u0002\u0002\u0002\u012d\u012e\u0007(\u0002\u0002",
    "\u012e/\u0003\u0002\u0002\u0002\u012f\u0130\t\u0002\u0002\u0002\u0130",
    "1\u0003\u0002\u0002\u0002\u0131\u0132\u0007(\u0002\u0002\u01323\u0003",
    "\u0002\u0002\u0002\u0133\u0134\u0007(\u0002\u0002\u01345\u0003\u0002",
    "\u0002\u0002\u0135\u013a\u0007(\u0002\u0002\u0136\u0137\u0007\u0017",
    "\u0002\u0002\u0137\u0139\u0007(\u0002\u0002\u0138\u0136\u0003\u0002",
    "\u0002\u0002\u0139\u013c\u0003\u0002\u0002\u0002\u013a\u0138\u0003\u0002",
    "\u0002\u0002\u013a\u013b\u0003\u0002\u0002\u0002\u013b\u013f\u0003\u0002",
    "\u0002\u0002\u013c\u013a\u0003\u0002\u0002\u0002\u013d\u013f\u0007+",
    "\u0002\u0002\u013e\u0135\u0003\u0002\u0002\u0002\u013e\u013d\u0003\u0002",
    "\u0002\u0002\u013f7\u0003\u0002\u0002\u0002\u0140\u0141\t\u0002\u0002",
    "\u0002\u01419\u0003\u0002\u0002\u0002\u0142\u0143\t\u0002\u0002\u0002",
    "\u0143;\u0003\u0002\u0002\u0002\u0144\u0149\u0005> \u0002\u0145\u0146",
    "\u0007\u0017\u0002\u0002\u0146\u0148\u0005> \u0002\u0147\u0145\u0003",
    "\u0002\u0002\u0002\u0148\u014b\u0003\u0002\u0002\u0002\u0149\u0147\u0003",
    "\u0002\u0002\u0002\u0149\u014a\u0003\u0002\u0002\u0002\u014a=\u0003",
    "\u0002\u0002\u0002\u014b\u0149\u0003\u0002\u0002\u0002\u014c\u0152\u0005",
    "@!\u0002\u014d\u0152\u0007(\u0002\u0002\u014e\u0152\u0005P)\u0002\u014f",
    "\u0152\u0005N(\u0002\u0150\u0152\u0005\u001c\u000f\u0002\u0151\u014c",
    "\u0003\u0002\u0002\u0002\u0151\u014d\u0003\u0002\u0002\u0002\u0151\u014e",
    "\u0003\u0002\u0002\u0002\u0151\u014f\u0003\u0002\u0002\u0002\u0151\u0150",
    "\u0003\u0002\u0002\u0002\u0152?\u0003\u0002\u0002\u0002\u0153\u0154",
    "\u00054\u001b\u0002\u0154\u0155\u0007(\u0002\u0002\u0155A\u0003\u0002",
    "\u0002\u0002\u0156\u015a\u0005D#\u0002\u0157\u0159\u0005F$\u0002\u0158",
    "\u0157\u0003\u0002\u0002\u0002\u0159\u015c\u0003\u0002\u0002\u0002\u015a",
    "\u0158\u0003\u0002\u0002\u0002\u015a\u015b\u0003\u0002\u0002\u0002\u015b",
    "\u015e\u0003\u0002\u0002\u0002\u015c\u015a\u0003\u0002\u0002\u0002\u015d",
    "\u015f\u0005H%\u0002\u015e\u015d\u0003\u0002\u0002\u0002\u015e\u015f",
    "\u0003\u0002\u0002\u0002\u015fC\u0003\u0002\u0002\u0002\u0160\u0161",
    "\u0007 \u0002\u0002\u0161\u0162\u0005R*\u0002\u0162\u0163\u0005J&\u0002",
    "\u0163E\u0003\u0002\u0002\u0002\u0164\u0165\u0007!\u0002\u0002\u0165",
    "\u0166\u0007 \u0002\u0002\u0166\u0167\u0005R*\u0002\u0167\u0168\u0005",
    "J&\u0002\u0168G\u0003\u0002\u0002\u0002\u0169\u016a\u0007!\u0002\u0002",
    "\u016a\u016b\u0005J&\u0002\u016bI\u0003\u0002\u0002\u0002\u016c\u0173",
    "\u0007\u001b\u0002\u0002\u016d\u0174\u0005\u000e\b\u0002\u016e\u0170",
    "\u0005\u0016\f\u0002\u016f\u016e\u0003\u0002\u0002\u0002\u0170\u0171",
    "\u0003\u0002\u0002\u0002\u0171\u016f\u0003\u0002\u0002\u0002\u0171\u0172",
    "\u0003\u0002\u0002\u0002\u0172\u0174\u0003\u0002\u0002\u0002\u0173\u016d",
    "\u0003\u0002\u0002\u0002\u0173\u016f\u0003\u0002\u0002\u0002\u0174\u0175",
    "\u0003\u0002\u0002\u0002\u0175\u0176\u0007\u001c\u0002\u0002\u0176K",
    "\u0003\u0002\u0002\u0002\u0177\u0178\u0007\"\u0002\u0002\u0178\u0179",
    "\u0005R*\u0002\u0179\u017a\u0005J&\u0002\u017aM\u0003\u0002\u0002\u0002",
    "\u017b\u017c\b(\u0001\u0002\u017c\u017d\u0007\u0010\u0002\u0002\u017d",
    "\u0184\u0005N(\u000e\u017e\u017f\u0007\u0015\u0002\u0002\u017f\u0184",
    "\u0005N(\r\u0180\u0184\u0005 \u0011\u0002\u0181\u0184\u0005\u001c\u000f",
    "\u0002\u0182\u0184\u0005P)\u0002\u0183\u017b\u0003\u0002\u0002\u0002",
    "\u0183\u017e\u0003\u0002\u0002\u0002\u0183\u0180\u0003\u0002\u0002\u0002",
    "\u0183\u0181\u0003\u0002\u0002\u0002\u0183\u0182\u0003\u0002\u0002\u0002",
    "\u0184\u019c\u0003\u0002\u0002\u0002\u0185\u0186\f\f\u0002\u0002\u0186",
    "\u0187\t\u0003\u0002\u0002\u0187\u019b\u0005N(\r\u0188\u0189\f\u000b",
    "\u0002\u0002\u0189\u018a\t\u0004\u0002\u0002\u018a\u019b\u0005N(\f\u018b",
    "\u018c\f\n\u0002\u0002\u018c\u018d\t\u0005\u0002\u0002\u018d\u019b\u0005",
    "N(\u000b\u018e\u018f\f\t\u0002\u0002\u018f\u0190\t\u0006\u0002\u0002",
    "\u0190\u019b\u0005N(\n\u0191\u0192\f\b\u0002\u0002\u0192\u0193\u0007",
    "\b\u0002\u0002\u0193\u019b\u0005N(\t\u0194\u0195\f\u0007\u0002\u0002",
    "\u0195\u0196\u0007\u0007\u0002\u0002\u0196\u019b\u0005N(\b\u0197\u0198",
    "\f\u0006\u0002\u0002\u0198\u0199\u0007\u000f\u0002\u0002\u0199\u019b",
    "\u0005N(\u0007\u019a\u0185\u0003\u0002\u0002\u0002\u019a\u0188\u0003",
    "\u0002\u0002\u0002\u019a\u018b\u0003\u0002\u0002\u0002\u019a\u018e\u0003",
    "\u0002\u0002\u0002\u019a\u0191\u0003\u0002\u0002\u0002\u019a\u0194\u0003",
    "\u0002\u0002\u0002\u019a\u0197\u0003\u0002\u0002\u0002\u019b\u019e\u0003",
    "\u0002\u0002\u0002\u019c\u019a\u0003\u0002\u0002\u0002\u019c\u019d\u0003",
    "\u0002\u0002\u0002\u019dO\u0003\u0002\u0002\u0002\u019e\u019c\u0003",
    "\u0002\u0002\u0002\u019f\u01a5\t\u0007\u0002\u0002\u01a0\u01a5\t\b\u0002",
    "\u0002\u01a1\u01a5\u0007(\u0002\u0002\u01a2\u01a5\u0007+\u0002\u0002",
    "\u01a3\u01a5\u0007\u001f\u0002\u0002\u01a4\u019f\u0003\u0002\u0002\u0002",
    "\u01a4\u01a0\u0003\u0002\u0002\u0002\u01a4\u01a1\u0003\u0002\u0002\u0002",
    "\u01a4\u01a2\u0003\u0002\u0002\u0002\u01a4\u01a3\u0003\u0002\u0002\u0002",
    "\u01a5Q\u0003\u0002\u0002\u0002\u01a6\u01a7\u0007\u0019\u0002\u0002",
    "\u01a7\u01a8\u0005N(\u0002\u01a8\u01a9\u0007\u001a\u0002\u0002\u01a9",
    "S\u0003\u0002\u0002\u00023W^bfkr{\u0080\u0089\u0090\u0095\u0099\u009e",
    "\u00a2\u00a7\u00ae\u00b5\u00bc\u00c3\u00ca\u00d1\u00d5\u00da\u00e1\u00e7",
    "\u00ea\u00ee\u00f1\u00f6\u00fb\u0105\u010b\u0112\u0116\u011b\u0123\u012b",
    "\u013a\u013e\u0149\u0151\u015a\u015e\u0171\u0173\u0183\u019a\u019c\u01a4"].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [ null, "'//'", "':'", "'->'", "'@'", "'||'", "'&&'", 
                     "'=='", "'!='", "'>'", "'<'", "'>='", "'<='", "'+'", 
                     "'-'", "'*'", "'/'", "'%'", "'^'", "'!'", "';'", "','", 
                     "'='", "'('", "')'", "'{'", "'}'", "'true'", "'false'", 
                     "'nil'", "'if'", "'else'", null, "'return'", "'new'", 
                     "'Starter'", "'Theme'", "'.'" ];

var symbolicNames = [ null, "DS", "COL", "ARROW", "AT", "OR", "AND", "EQ", 
                      "NEQ", "GT", "LT", "GTEQ", "LTEQ", "PLUS", "MINUS", 
                      "MULT", "DIV", "MOD", "POW", "NOT", "SCOL", "COMMA", 
                      "ASSIGN", "OPAR", "CPAR", "OBRACE", "CBRACE", "TRUE", 
                      "FALSE", "NIL", "IF", "ELSE", "WHILE", "RETURN", "NEW", 
                      "STARTER_LXR", "THEME_LXR", "DOT", "ID", "INT", "FLOAT", 
                      "STRING", "CR", "SPACE", "OTHER", "EVENT_PAYLOAD_LXR", 
                      "EVENT_END", "COMMENT_LXR", "COMMENT_END", "WS" ];

var ruleNames =  [ "prog", "starterExp", "starter", "participant", "name", 
                   "width", "block", "ret", "value", "stat", "comment", 
                   "commentContent", "anonymousBlock", "creation", "message", 
                   "func", "from", "signature", "invocation", "assignment", 
                   "asyncMessage", "content", "source", "target", "constructor", 
                   "type", "assignee", "to", "methodName", "parameters", 
                   "parameter", "declaration", "alt", "ifBlock", "elseIfBlock", 
                   "elseBlock", "braceBlock", "loop", "expr", "atom", "parExpr" ];

function sequenceParser (input) {
	antlr4.Parser.call(this, input);
    this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
    this.ruleNames = ruleNames;
    this.literalNames = literalNames;
    this.symbolicNames = symbolicNames;
    return this;
}

sequenceParser.prototype = Object.create(antlr4.Parser.prototype);
sequenceParser.prototype.constructor = sequenceParser;

Object.defineProperty(sequenceParser.prototype, "atn", {
	get : function() {
		return atn;
	}
});

sequenceParser.EOF = antlr4.Token.EOF;
sequenceParser.DS = 1;
sequenceParser.COL = 2;
sequenceParser.ARROW = 3;
sequenceParser.AT = 4;
sequenceParser.OR = 5;
sequenceParser.AND = 6;
sequenceParser.EQ = 7;
sequenceParser.NEQ = 8;
sequenceParser.GT = 9;
sequenceParser.LT = 10;
sequenceParser.GTEQ = 11;
sequenceParser.LTEQ = 12;
sequenceParser.PLUS = 13;
sequenceParser.MINUS = 14;
sequenceParser.MULT = 15;
sequenceParser.DIV = 16;
sequenceParser.MOD = 17;
sequenceParser.POW = 18;
sequenceParser.NOT = 19;
sequenceParser.SCOL = 20;
sequenceParser.COMMA = 21;
sequenceParser.ASSIGN = 22;
sequenceParser.OPAR = 23;
sequenceParser.CPAR = 24;
sequenceParser.OBRACE = 25;
sequenceParser.CBRACE = 26;
sequenceParser.TRUE = 27;
sequenceParser.FALSE = 28;
sequenceParser.NIL = 29;
sequenceParser.IF = 30;
sequenceParser.ELSE = 31;
sequenceParser.WHILE = 32;
sequenceParser.RETURN = 33;
sequenceParser.NEW = 34;
sequenceParser.STARTER_LXR = 35;
sequenceParser.THEME_LXR = 36;
sequenceParser.DOT = 37;
sequenceParser.ID = 38;
sequenceParser.INT = 39;
sequenceParser.FLOAT = 40;
sequenceParser.STRING = 41;
sequenceParser.CR = 42;
sequenceParser.SPACE = 43;
sequenceParser.OTHER = 44;
sequenceParser.EVENT_PAYLOAD_LXR = 45;
sequenceParser.EVENT_END = 46;
sequenceParser.COMMENT_LXR = 47;
sequenceParser.COMMENT_END = 48;
sequenceParser.WS = 49;

sequenceParser.RULE_prog = 0;
sequenceParser.RULE_starterExp = 1;
sequenceParser.RULE_starter = 2;
sequenceParser.RULE_participant = 3;
sequenceParser.RULE_name = 4;
sequenceParser.RULE_width = 5;
sequenceParser.RULE_block = 6;
sequenceParser.RULE_ret = 7;
sequenceParser.RULE_value = 8;
sequenceParser.RULE_stat = 9;
sequenceParser.RULE_comment = 10;
sequenceParser.RULE_commentContent = 11;
sequenceParser.RULE_anonymousBlock = 12;
sequenceParser.RULE_creation = 13;
sequenceParser.RULE_message = 14;
sequenceParser.RULE_func = 15;
sequenceParser.RULE_from = 16;
sequenceParser.RULE_signature = 17;
sequenceParser.RULE_invocation = 18;
sequenceParser.RULE_assignment = 19;
sequenceParser.RULE_asyncMessage = 20;
sequenceParser.RULE_content = 21;
sequenceParser.RULE_source = 22;
sequenceParser.RULE_target = 23;
sequenceParser.RULE_constructor = 24;
sequenceParser.RULE_type = 25;
sequenceParser.RULE_assignee = 26;
sequenceParser.RULE_to = 27;
sequenceParser.RULE_methodName = 28;
sequenceParser.RULE_parameters = 29;
sequenceParser.RULE_parameter = 30;
sequenceParser.RULE_declaration = 31;
sequenceParser.RULE_alt = 32;
sequenceParser.RULE_ifBlock = 33;
sequenceParser.RULE_elseIfBlock = 34;
sequenceParser.RULE_elseBlock = 35;
sequenceParser.RULE_braceBlock = 36;
sequenceParser.RULE_loop = 37;
sequenceParser.RULE_expr = 38;
sequenceParser.RULE_atom = 39;
sequenceParser.RULE_parExpr = 40;

function ProgContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_prog;
    return this;
}

ProgContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ProgContext.prototype.constructor = ProgContext;

ProgContext.prototype.participant = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ParticipantContext);
    } else {
        return this.getTypedRuleContext(ParticipantContext,i);
    }
};

ProgContext.prototype.EOF = function() {
    return this.getToken(sequenceParser.EOF, 0);
};

ProgContext.prototype.block = function() {
    return this.getTypedRuleContext(BlockContext,0);
};

ProgContext.prototype.starterExp = function() {
    return this.getTypedRuleContext(StarterExpContext,0);
};

ProgContext.prototype.comment = function() {
    return this.getTypedRuleContext(CommentContext,0);
};

ProgContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterProg(this);
	}
};

ProgContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitProg(this);
	}
};




sequenceParser.ProgContext = ProgContext;

sequenceParser.prototype.prog = function() {

    var localctx = new ProgContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, sequenceParser.RULE_prog);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 85;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,0,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                this.state = 82;
                this.participant(); 
            }
            this.state = 87;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,0,this._ctx);
        }

        this.state = 100;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,3,this._ctx);
        switch(la_) {
        case 1:
            this.state = 88;
            this.participant();
            this.state = 89;
            this.match(sequenceParser.EOF);
            break;

        case 2:
            this.state = 92;
            this._errHandler.sync(this);
            var la_ = this._interp.adaptivePredict(this._input,1,this._ctx);
            if(la_===1) {
                this.state = 91;
                this.starterExp();

            }
            this.state = 94;
            this.block();
            this.state = 96;
            _la = this._input.LA(1);
            if(_la===sequenceParser.DS) {
                this.state = 95;
                this.comment();
            }

            this.state = 98;
            this.match(sequenceParser.EOF);
            break;

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
};

function StarterExpContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_starterExp;
    return this;
}

StarterExpContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
StarterExpContext.prototype.constructor = StarterExpContext;

StarterExpContext.prototype.AT = function() {
    return this.getToken(sequenceParser.AT, 0);
};

StarterExpContext.prototype.STARTER_LXR = function() {
    return this.getToken(sequenceParser.STARTER_LXR, 0);
};

StarterExpContext.prototype.OPAR = function() {
    return this.getToken(sequenceParser.OPAR, 0);
};

StarterExpContext.prototype.CPAR = function() {
    return this.getToken(sequenceParser.CPAR, 0);
};

StarterExpContext.prototype.comment = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(CommentContext);
    } else {
        return this.getTypedRuleContext(CommentContext,i);
    }
};

StarterExpContext.prototype.starter = function() {
    return this.getTypedRuleContext(StarterContext,0);
};

StarterExpContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterStarterExp(this);
	}
};

StarterExpContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitStarterExp(this);
	}
};




sequenceParser.StarterExpContext = StarterExpContext;

sequenceParser.prototype.starterExp = function() {

    var localctx = new StarterExpContext(this, this._ctx, this.state);
    this.enterRule(localctx, 2, sequenceParser.RULE_starterExp);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 105;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===sequenceParser.DS) {
            this.state = 102;
            this.comment();
            this.state = 107;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 108;
        this.match(sequenceParser.AT);
        this.state = 109;
        this.match(sequenceParser.STARTER_LXR);
        this.state = 110;
        this.match(sequenceParser.OPAR);
        this.state = 112;
        _la = this._input.LA(1);
        if(_la===sequenceParser.ID) {
            this.state = 111;
            this.starter();
        }

        this.state = 114;
        this.match(sequenceParser.CPAR);
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
};

function StarterContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_starter;
    return this;
}

StarterContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
StarterContext.prototype.constructor = StarterContext;

StarterContext.prototype.ID = function() {
    return this.getToken(sequenceParser.ID, 0);
};

StarterContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterStarter(this);
	}
};

StarterContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitStarter(this);
	}
};




sequenceParser.StarterContext = StarterContext;

sequenceParser.prototype.starter = function() {

    var localctx = new StarterContext(this, this._ctx, this.state);
    this.enterRule(localctx, 4, sequenceParser.RULE_starter);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 116;
        this.match(sequenceParser.ID);
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
};

function ParticipantContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_participant;
    return this;
}

ParticipantContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ParticipantContext.prototype.constructor = ParticipantContext;

ParticipantContext.prototype.name = function() {
    return this.getTypedRuleContext(NameContext,0);
};

ParticipantContext.prototype.comment = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(CommentContext);
    } else {
        return this.getTypedRuleContext(CommentContext,i);
    }
};

ParticipantContext.prototype.width = function() {
    return this.getTypedRuleContext(WidthContext,0);
};

ParticipantContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterParticipant(this);
	}
};

ParticipantContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitParticipant(this);
	}
};




sequenceParser.ParticipantContext = ParticipantContext;

sequenceParser.prototype.participant = function() {

    var localctx = new ParticipantContext(this, this._ctx, this.state);
    this.enterRule(localctx, 6, sequenceParser.RULE_participant);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 121;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===sequenceParser.DS) {
            this.state = 118;
            this.comment();
            this.state = 123;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
        }
        this.state = 124;
        this.name();
        this.state = 126;
        _la = this._input.LA(1);
        if(_la===sequenceParser.INT) {
            this.state = 125;
            this.width();
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
};

function NameContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_name;
    return this;
}

NameContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
NameContext.prototype.constructor = NameContext;

NameContext.prototype.ID = function() {
    return this.getToken(sequenceParser.ID, 0);
};

NameContext.prototype.STRING = function() {
    return this.getToken(sequenceParser.STRING, 0);
};

NameContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterName(this);
	}
};

NameContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitName(this);
	}
};




sequenceParser.NameContext = NameContext;

sequenceParser.prototype.name = function() {

    var localctx = new NameContext(this, this._ctx, this.state);
    this.enterRule(localctx, 8, sequenceParser.RULE_name);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 128;
        _la = this._input.LA(1);
        if(!(_la===sequenceParser.ID || _la===sequenceParser.STRING)) {
        this._errHandler.recoverInline(this);
        }
        else {
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
};

function WidthContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_width;
    return this;
}

WidthContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
WidthContext.prototype.constructor = WidthContext;

WidthContext.prototype.INT = function() {
    return this.getToken(sequenceParser.INT, 0);
};

WidthContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterWidth(this);
	}
};

WidthContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitWidth(this);
	}
};




sequenceParser.WidthContext = WidthContext;

sequenceParser.prototype.width = function() {

    var localctx = new WidthContext(this, this._ctx, this.state);
    this.enterRule(localctx, 10, sequenceParser.RULE_width);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 130;
        this.match(sequenceParser.INT);
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
};

function BlockContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_block;
    return this;
}

BlockContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
BlockContext.prototype.constructor = BlockContext;

BlockContext.prototype.stat = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(StatContext);
    } else {
        return this.getTypedRuleContext(StatContext,i);
    }
};

BlockContext.prototype.ret = function() {
    return this.getTypedRuleContext(RetContext,0);
};

BlockContext.prototype.CR = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(sequenceParser.CR);
    } else {
        return this.getToken(sequenceParser.CR, i);
    }
};


BlockContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterBlock(this);
	}
};

BlockContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitBlock(this);
	}
};




sequenceParser.BlockContext = BlockContext;

sequenceParser.prototype.block = function() {

    var localctx = new BlockContext(this, this._ctx, this.state);
    this.enterRule(localctx, 12, sequenceParser.RULE_block);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 147;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,10,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                this.state = 135;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
                while(_la===sequenceParser.CR) {
                    this.state = 132;
                    this.match(sequenceParser.CR);
                    this.state = 137;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                }
                this.state = 138;
                this.stat();
                this.state = 142;
                this._errHandler.sync(this);
                var _alt = this._interp.adaptivePredict(this._input,9,this._ctx)
                while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
                    if(_alt===1) {
                        this.state = 139;
                        this.match(sequenceParser.CR); 
                    }
                    this.state = 144;
                    this._errHandler.sync(this);
                    _alt = this._interp.adaptivePredict(this._input,9,this._ctx);
                }
         
            }
            this.state = 149;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,10,this._ctx);
        }

        this.state = 151;
        _la = this._input.LA(1);
        if(_la===sequenceParser.RETURN) {
            this.state = 150;
            this.ret();
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
};

function RetContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_ret;
    return this;
}

RetContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
RetContext.prototype.constructor = RetContext;

RetContext.prototype.RETURN = function() {
    return this.getToken(sequenceParser.RETURN, 0);
};

RetContext.prototype.value = function() {
    return this.getTypedRuleContext(ValueContext,0);
};

RetContext.prototype.SCOL = function() {
    return this.getToken(sequenceParser.SCOL, 0);
};

RetContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterRet(this);
	}
};

RetContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitRet(this);
	}
};




sequenceParser.RetContext = RetContext;

sequenceParser.prototype.ret = function() {

    var localctx = new RetContext(this, this._ctx, this.state);
    this.enterRule(localctx, 14, sequenceParser.RULE_ret);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 153;
        this.match(sequenceParser.RETURN);
        this.state = 154;
        this.value();
        this.state = 156;
        _la = this._input.LA(1);
        if(_la===sequenceParser.SCOL) {
            this.state = 155;
            this.match(sequenceParser.SCOL);
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
};

function ValueContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_value;
    return this;
}

ValueContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ValueContext.prototype.constructor = ValueContext;

ValueContext.prototype.atom = function() {
    return this.getTypedRuleContext(AtomContext,0);
};

ValueContext.prototype.ID = function() {
    return this.getToken(sequenceParser.ID, 0);
};

ValueContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterValue(this);
	}
};

ValueContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitValue(this);
	}
};




sequenceParser.ValueContext = ValueContext;

sequenceParser.prototype.value = function() {

    var localctx = new ValueContext(this, this._ctx, this.state);
    this.enterRule(localctx, 16, sequenceParser.RULE_value);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 160;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,13,this._ctx);
        switch(la_) {
        case 1:
            this.state = 158;
            this.atom();
            break;

        case 2:
            this.state = 159;
            this.match(sequenceParser.ID);
            break;

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
};

function StatContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_stat;
    this._OTHER = null; // Token
    return this;
}

StatContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
StatContext.prototype.constructor = StatContext;

StatContext.prototype.alt = function() {
    return this.getTypedRuleContext(AltContext,0);
};

StatContext.prototype.comment = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(CommentContext);
    } else {
        return this.getTypedRuleContext(CommentContext,i);
    }
};

StatContext.prototype.loop = function() {
    return this.getTypedRuleContext(LoopContext,0);
};

StatContext.prototype.creation = function() {
    return this.getTypedRuleContext(CreationContext,0);
};

StatContext.prototype.asyncMessage = function() {
    return this.getTypedRuleContext(AsyncMessageContext,0);
};

StatContext.prototype.message = function() {
    return this.getTypedRuleContext(MessageContext,0);
};

StatContext.prototype.anonymousBlock = function() {
    return this.getTypedRuleContext(AnonymousBlockContext,0);
};

StatContext.prototype.OTHER = function() {
    return this.getToken(sequenceParser.OTHER, 0);
};

StatContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterStat(this);
	}
};

StatContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitStat(this);
	}
};




sequenceParser.StatContext = StatContext;

sequenceParser.prototype.stat = function() {

    var localctx = new StatContext(this, this._ctx, this.state);
    this.enterRule(localctx, 18, sequenceParser.RULE_stat);
    var _la = 0; // Token type
    try {
        this.state = 211;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,21,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 165;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===sequenceParser.DS) {
                this.state = 162;
                this.comment();
                this.state = 167;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            this.state = 168;
            this.alt();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 172;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===sequenceParser.DS) {
                this.state = 169;
                this.comment();
                this.state = 174;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            this.state = 175;
            this.loop();
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 179;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===sequenceParser.DS) {
                this.state = 176;
                this.comment();
                this.state = 181;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            this.state = 182;
            this.creation();
            break;

        case 4:
            this.enterOuterAlt(localctx, 4);
            this.state = 186;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===sequenceParser.DS) {
                this.state = 183;
                this.comment();
                this.state = 188;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            this.state = 189;
            this.asyncMessage();
            break;

        case 5:
            this.enterOuterAlt(localctx, 5);
            this.state = 193;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===sequenceParser.DS) {
                this.state = 190;
                this.comment();
                this.state = 195;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            this.state = 196;
            this.message();
            break;

        case 6:
            this.enterOuterAlt(localctx, 6);
            this.state = 200;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===sequenceParser.DS) {
                this.state = 197;
                this.comment();
                this.state = 202;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            this.state = 203;
            this.anonymousBlock();
            break;

        case 7:
            this.enterOuterAlt(localctx, 7);
            this.state = 205; 
            this._errHandler.sync(this);
            var _alt = 1;
            do {
            	switch (_alt) {
            	case 1:
            		this.state = 204;
            		this.comment();
            		break;
            	default:
            		throw new antlr4.error.NoViableAltException(this);
            	}
            	this.state = 207; 
            	this._errHandler.sync(this);
            	_alt = this._interp.adaptivePredict(this._input,20, this._ctx);
            } while ( _alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER );
            break;

        case 8:
            this.enterOuterAlt(localctx, 8);
            this.state = 209;
            localctx._OTHER = this.match(sequenceParser.OTHER);
            console.log("unknown char: " + (localctx._OTHER===null ? null : localctx._OTHER.text));
            break;

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
};

function CommentContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_comment;
    return this;
}

CommentContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
CommentContext.prototype.constructor = CommentContext;

CommentContext.prototype.DS = function() {
    return this.getToken(sequenceParser.DS, 0);
};

CommentContext.prototype.commentContent = function() {
    return this.getTypedRuleContext(CommentContentContext,0);
};

CommentContext.prototype.COMMENT_END = function() {
    return this.getToken(sequenceParser.COMMENT_END, 0);
};

CommentContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterComment(this);
	}
};

CommentContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitComment(this);
	}
};




sequenceParser.CommentContext = CommentContext;

sequenceParser.prototype.comment = function() {

    var localctx = new CommentContext(this, this._ctx, this.state);
    this.enterRule(localctx, 20, sequenceParser.RULE_comment);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 213;
        this.match(sequenceParser.DS);
        this.state = 214;
        this.commentContent();
        this.state = 216;
        _la = this._input.LA(1);
        if(_la===sequenceParser.COMMENT_END) {
            this.state = 215;
            this.match(sequenceParser.COMMENT_END);
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
};

function CommentContentContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_commentContent;
    return this;
}

CommentContentContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
CommentContentContext.prototype.constructor = CommentContentContext;

CommentContentContext.prototype.COMMENT_LXR = function() {
    return this.getToken(sequenceParser.COMMENT_LXR, 0);
};

CommentContentContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterCommentContent(this);
	}
};

CommentContentContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitCommentContent(this);
	}
};




sequenceParser.CommentContentContext = CommentContentContext;

sequenceParser.prototype.commentContent = function() {

    var localctx = new CommentContentContext(this, this._ctx, this.state);
    this.enterRule(localctx, 22, sequenceParser.RULE_commentContent);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 218;
        this.match(sequenceParser.COMMENT_LXR);
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
};

function AnonymousBlockContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_anonymousBlock;
    return this;
}

AnonymousBlockContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AnonymousBlockContext.prototype.constructor = AnonymousBlockContext;

AnonymousBlockContext.prototype.braceBlock = function() {
    return this.getTypedRuleContext(BraceBlockContext,0);
};

AnonymousBlockContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterAnonymousBlock(this);
	}
};

AnonymousBlockContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitAnonymousBlock(this);
	}
};




sequenceParser.AnonymousBlockContext = AnonymousBlockContext;

sequenceParser.prototype.anonymousBlock = function() {

    var localctx = new AnonymousBlockContext(this, this._ctx, this.state);
    this.enterRule(localctx, 24, sequenceParser.RULE_anonymousBlock);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 220;
        this.braceBlock();
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
};

function CreationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_creation;
    return this;
}

CreationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
CreationContext.prototype.constructor = CreationContext;

CreationContext.prototype.NEW = function() {
    return this.getToken(sequenceParser.NEW, 0);
};

CreationContext.prototype.constructor = function() {
    return this.getTypedRuleContext(ConstructorContext,0);
};

CreationContext.prototype.assignment = function() {
    return this.getTypedRuleContext(AssignmentContext,0);
};

CreationContext.prototype.OPAR = function() {
    return this.getToken(sequenceParser.OPAR, 0);
};

CreationContext.prototype.CPAR = function() {
    return this.getToken(sequenceParser.CPAR, 0);
};

CreationContext.prototype.SCOL = function() {
    return this.getToken(sequenceParser.SCOL, 0);
};

CreationContext.prototype.braceBlock = function() {
    return this.getTypedRuleContext(BraceBlockContext,0);
};

CreationContext.prototype.parameters = function() {
    return this.getTypedRuleContext(ParametersContext,0);
};

CreationContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterCreation(this);
	}
};

CreationContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitCreation(this);
	}
};




sequenceParser.CreationContext = CreationContext;

sequenceParser.prototype.creation = function() {

    var localctx = new CreationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 26, sequenceParser.RULE_creation);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 223;
        _la = this._input.LA(1);
        if(_la===sequenceParser.ID || _la===sequenceParser.STRING) {
            this.state = 222;
            this.assignment();
        }

        this.state = 225;
        this.match(sequenceParser.NEW);
        this.state = 226;
        this.constructor();
        this.state = 232;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,25,this._ctx);
        if(la_===1) {
            this.state = 227;
            this.match(sequenceParser.OPAR);
            this.state = 229;
            _la = this._input.LA(1);
            if(((((_la - 14)) & ~0x1f) == 0 && ((1 << (_la - 14)) & ((1 << (sequenceParser.MINUS - 14)) | (1 << (sequenceParser.NOT - 14)) | (1 << (sequenceParser.TRUE - 14)) | (1 << (sequenceParser.FALSE - 14)) | (1 << (sequenceParser.NIL - 14)) | (1 << (sequenceParser.NEW - 14)) | (1 << (sequenceParser.ID - 14)) | (1 << (sequenceParser.INT - 14)) | (1 << (sequenceParser.FLOAT - 14)) | (1 << (sequenceParser.STRING - 14)))) !== 0)) {
                this.state = 228;
                this.parameters();
            }

            this.state = 231;
            this.match(sequenceParser.CPAR);

        }
        this.state = 236;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,26,this._ctx);
        if(la_===1) {
            this.state = 234;
            this.match(sequenceParser.SCOL);

        } else if(la_===2) {
            this.state = 235;
            this.braceBlock();

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
};

function MessageContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_message;
    return this;
}

MessageContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
MessageContext.prototype.constructor = MessageContext;

MessageContext.prototype.func = function() {
    return this.getTypedRuleContext(FuncContext,0);
};

MessageContext.prototype.assignment = function() {
    return this.getTypedRuleContext(AssignmentContext,0);
};

MessageContext.prototype.SCOL = function() {
    return this.getToken(sequenceParser.SCOL, 0);
};

MessageContext.prototype.braceBlock = function() {
    return this.getTypedRuleContext(BraceBlockContext,0);
};

MessageContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterMessage(this);
	}
};

MessageContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitMessage(this);
	}
};




sequenceParser.MessageContext = MessageContext;

sequenceParser.prototype.message = function() {

    var localctx = new MessageContext(this, this._ctx, this.state);
    this.enterRule(localctx, 28, sequenceParser.RULE_message);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 239;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,27,this._ctx);
        if(la_===1) {
            this.state = 238;
            this.assignment();

        }
        this.state = 241;
        this.func();
        this.state = 244;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,28,this._ctx);
        if(la_===1) {
            this.state = 242;
            this.match(sequenceParser.SCOL);

        } else if(la_===2) {
            this.state = 243;
            this.braceBlock();

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
};

function FuncContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_func;
    return this;
}

FuncContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FuncContext.prototype.constructor = FuncContext;

FuncContext.prototype.DOT = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(sequenceParser.DOT);
    } else {
        return this.getToken(sequenceParser.DOT, i);
    }
};


FuncContext.prototype.signature = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(SignatureContext);
    } else {
        return this.getTypedRuleContext(SignatureContext,i);
    }
};

FuncContext.prototype.to = function() {
    return this.getTypedRuleContext(ToContext,0);
};

FuncContext.prototype.from = function() {
    return this.getTypedRuleContext(FromContext,0);
};

FuncContext.prototype.ARROW = function() {
    return this.getToken(sequenceParser.ARROW, 0);
};

FuncContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterFunc(this);
	}
};

FuncContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitFunc(this);
	}
};




sequenceParser.FuncContext = FuncContext;

sequenceParser.prototype.func = function() {

    var localctx = new FuncContext(this, this._ctx, this.state);
    this.enterRule(localctx, 30, sequenceParser.RULE_func);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 259;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,30,this._ctx);
        switch(la_) {
        case 1:
            this.state = 249;
            this._errHandler.sync(this);
            var la_ = this._interp.adaptivePredict(this._input,29,this._ctx);
            if(la_===1) {
                this.state = 246;
                this.from();
                this.state = 247;
                this.match(sequenceParser.ARROW);

            }
            this.state = 251;
            this.to();
            this.state = 252;
            this.match(sequenceParser.DOT);
            this.state = 253;
            this.signature();
            break;

        case 2:
            this.state = 255;
            this.to();
            this.state = 256;
            this.match(sequenceParser.DOT);
            break;

        case 3:
            this.state = 258;
            this.signature();
            break;

        }
        this.state = 265;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,31,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                this.state = 261;
                this.match(sequenceParser.DOT);
                this.state = 262;
                this.signature(); 
            }
            this.state = 267;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,31,this._ctx);
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
};

function FromContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_from;
    return this;
}

FromContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
FromContext.prototype.constructor = FromContext;

FromContext.prototype.ID = function() {
    return this.getToken(sequenceParser.ID, 0);
};

FromContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterFrom(this);
	}
};

FromContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitFrom(this);
	}
};




sequenceParser.FromContext = FromContext;

sequenceParser.prototype.from = function() {

    var localctx = new FromContext(this, this._ctx, this.state);
    this.enterRule(localctx, 32, sequenceParser.RULE_from);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 268;
        this.match(sequenceParser.ID);
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
};

function SignatureContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_signature;
    return this;
}

SignatureContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
SignatureContext.prototype.constructor = SignatureContext;

SignatureContext.prototype.methodName = function() {
    return this.getTypedRuleContext(MethodNameContext,0);
};

SignatureContext.prototype.invocation = function() {
    return this.getTypedRuleContext(InvocationContext,0);
};

SignatureContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterSignature(this);
	}
};

SignatureContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitSignature(this);
	}
};




sequenceParser.SignatureContext = SignatureContext;

sequenceParser.prototype.signature = function() {

    var localctx = new SignatureContext(this, this._ctx, this.state);
    this.enterRule(localctx, 34, sequenceParser.RULE_signature);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 270;
        this.methodName();
        this.state = 272;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,32,this._ctx);
        if(la_===1) {
            this.state = 271;
            this.invocation();

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
};

function InvocationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_invocation;
    return this;
}

InvocationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
InvocationContext.prototype.constructor = InvocationContext;

InvocationContext.prototype.OPAR = function() {
    return this.getToken(sequenceParser.OPAR, 0);
};

InvocationContext.prototype.CPAR = function() {
    return this.getToken(sequenceParser.CPAR, 0);
};

InvocationContext.prototype.parameters = function() {
    return this.getTypedRuleContext(ParametersContext,0);
};

InvocationContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterInvocation(this);
	}
};

InvocationContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitInvocation(this);
	}
};




sequenceParser.InvocationContext = InvocationContext;

sequenceParser.prototype.invocation = function() {

    var localctx = new InvocationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 36, sequenceParser.RULE_invocation);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 274;
        this.match(sequenceParser.OPAR);
        this.state = 276;
        _la = this._input.LA(1);
        if(((((_la - 14)) & ~0x1f) == 0 && ((1 << (_la - 14)) & ((1 << (sequenceParser.MINUS - 14)) | (1 << (sequenceParser.NOT - 14)) | (1 << (sequenceParser.TRUE - 14)) | (1 << (sequenceParser.FALSE - 14)) | (1 << (sequenceParser.NIL - 14)) | (1 << (sequenceParser.NEW - 14)) | (1 << (sequenceParser.ID - 14)) | (1 << (sequenceParser.INT - 14)) | (1 << (sequenceParser.FLOAT - 14)) | (1 << (sequenceParser.STRING - 14)))) !== 0)) {
            this.state = 275;
            this.parameters();
        }

        this.state = 278;
        this.match(sequenceParser.CPAR);
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
};

function AssignmentContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_assignment;
    return this;
}

AssignmentContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AssignmentContext.prototype.constructor = AssignmentContext;

AssignmentContext.prototype.assignee = function() {
    return this.getTypedRuleContext(AssigneeContext,0);
};

AssignmentContext.prototype.ASSIGN = function() {
    return this.getToken(sequenceParser.ASSIGN, 0);
};

AssignmentContext.prototype.type = function() {
    return this.getTypedRuleContext(TypeContext,0);
};

AssignmentContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterAssignment(this);
	}
};

AssignmentContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitAssignment(this);
	}
};




sequenceParser.AssignmentContext = AssignmentContext;

sequenceParser.prototype.assignment = function() {

    var localctx = new AssignmentContext(this, this._ctx, this.state);
    this.enterRule(localctx, 38, sequenceParser.RULE_assignment);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 281;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,34,this._ctx);
        if(la_===1) {
            this.state = 280;
            this.type();

        }
        this.state = 283;
        this.assignee();
        this.state = 284;
        this.match(sequenceParser.ASSIGN);
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
};

function AsyncMessageContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_asyncMessage;
    return this;
}

AsyncMessageContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AsyncMessageContext.prototype.constructor = AsyncMessageContext;

AsyncMessageContext.prototype.target = function() {
    return this.getTypedRuleContext(TargetContext,0);
};

AsyncMessageContext.prototype.COL = function() {
    return this.getToken(sequenceParser.COL, 0);
};

AsyncMessageContext.prototype.content = function() {
    return this.getTypedRuleContext(ContentContext,0);
};

AsyncMessageContext.prototype.source = function() {
    return this.getTypedRuleContext(SourceContext,0);
};

AsyncMessageContext.prototype.ARROW = function() {
    return this.getToken(sequenceParser.ARROW, 0);
};

AsyncMessageContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterAsyncMessage(this);
	}
};

AsyncMessageContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitAsyncMessage(this);
	}
};




sequenceParser.AsyncMessageContext = AsyncMessageContext;

sequenceParser.prototype.asyncMessage = function() {

    var localctx = new AsyncMessageContext(this, this._ctx, this.state);
    this.enterRule(localctx, 40, sequenceParser.RULE_asyncMessage);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 289;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,35,this._ctx);
        if(la_===1) {
            this.state = 286;
            this.source();
            this.state = 287;
            this.match(sequenceParser.ARROW);

        }
        this.state = 291;
        this.target();
        this.state = 292;
        this.match(sequenceParser.COL);
        this.state = 293;
        this.content();
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
};

function ContentContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_content;
    return this;
}

ContentContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ContentContext.prototype.constructor = ContentContext;

ContentContext.prototype.EVENT_PAYLOAD_LXR = function() {
    return this.getToken(sequenceParser.EVENT_PAYLOAD_LXR, 0);
};

ContentContext.prototype.EVENT_END = function() {
    return this.getToken(sequenceParser.EVENT_END, 0);
};

ContentContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterContent(this);
	}
};

ContentContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitContent(this);
	}
};




sequenceParser.ContentContext = ContentContext;

sequenceParser.prototype.content = function() {

    var localctx = new ContentContext(this, this._ctx, this.state);
    this.enterRule(localctx, 42, sequenceParser.RULE_content);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 295;
        this.match(sequenceParser.EVENT_PAYLOAD_LXR);
        this.state = 297;
        _la = this._input.LA(1);
        if(_la===sequenceParser.EVENT_END) {
            this.state = 296;
            this.match(sequenceParser.EVENT_END);
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
};

function SourceContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_source;
    return this;
}

SourceContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
SourceContext.prototype.constructor = SourceContext;

SourceContext.prototype.ID = function() {
    return this.getToken(sequenceParser.ID, 0);
};

SourceContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterSource(this);
	}
};

SourceContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitSource(this);
	}
};




sequenceParser.SourceContext = SourceContext;

sequenceParser.prototype.source = function() {

    var localctx = new SourceContext(this, this._ctx, this.state);
    this.enterRule(localctx, 44, sequenceParser.RULE_source);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 299;
        this.match(sequenceParser.ID);
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
};

function TargetContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_target;
    return this;
}

TargetContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
TargetContext.prototype.constructor = TargetContext;

TargetContext.prototype.ID = function() {
    return this.getToken(sequenceParser.ID, 0);
};

TargetContext.prototype.STRING = function() {
    return this.getToken(sequenceParser.STRING, 0);
};

TargetContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterTarget(this);
	}
};

TargetContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitTarget(this);
	}
};




sequenceParser.TargetContext = TargetContext;

sequenceParser.prototype.target = function() {

    var localctx = new TargetContext(this, this._ctx, this.state);
    this.enterRule(localctx, 46, sequenceParser.RULE_target);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 301;
        _la = this._input.LA(1);
        if(!(_la===sequenceParser.ID || _la===sequenceParser.STRING)) {
        this._errHandler.recoverInline(this);
        }
        else {
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
};

function ConstructorContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_constructor;
    return this;
}

ConstructorContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ConstructorContext.prototype.constructor = ConstructorContext;

ConstructorContext.prototype.ID = function() {
    return this.getToken(sequenceParser.ID, 0);
};

ConstructorContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterConstructor(this);
	}
};

ConstructorContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitConstructor(this);
	}
};




sequenceParser.ConstructorContext = ConstructorContext;

sequenceParser.prototype.constructor = function() {

    var localctx = new ConstructorContext(this, this._ctx, this.state);
    this.enterRule(localctx, 48, sequenceParser.RULE_constructor);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 303;
        this.match(sequenceParser.ID);
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
};

function TypeContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_type;
    return this;
}

TypeContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
TypeContext.prototype.constructor = TypeContext;

TypeContext.prototype.ID = function() {
    return this.getToken(sequenceParser.ID, 0);
};

TypeContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterType(this);
	}
};

TypeContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitType(this);
	}
};




sequenceParser.TypeContext = TypeContext;

sequenceParser.prototype.type = function() {

    var localctx = new TypeContext(this, this._ctx, this.state);
    this.enterRule(localctx, 50, sequenceParser.RULE_type);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 305;
        this.match(sequenceParser.ID);
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
};

function AssigneeContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_assignee;
    return this;
}

AssigneeContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AssigneeContext.prototype.constructor = AssigneeContext;

AssigneeContext.prototype.ID = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(sequenceParser.ID);
    } else {
        return this.getToken(sequenceParser.ID, i);
    }
};


AssigneeContext.prototype.COMMA = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(sequenceParser.COMMA);
    } else {
        return this.getToken(sequenceParser.COMMA, i);
    }
};


AssigneeContext.prototype.STRING = function() {
    return this.getToken(sequenceParser.STRING, 0);
};

AssigneeContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterAssignee(this);
	}
};

AssigneeContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitAssignee(this);
	}
};




sequenceParser.AssigneeContext = AssigneeContext;

sequenceParser.prototype.assignee = function() {

    var localctx = new AssigneeContext(this, this._ctx, this.state);
    this.enterRule(localctx, 52, sequenceParser.RULE_assignee);
    var _la = 0; // Token type
    try {
        this.state = 316;
        switch(this._input.LA(1)) {
        case sequenceParser.ID:
            this.enterOuterAlt(localctx, 1);
            this.state = 307;
            this.match(sequenceParser.ID);
            this.state = 312;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while(_la===sequenceParser.COMMA) {
                this.state = 308;
                this.match(sequenceParser.COMMA);
                this.state = 309;
                this.match(sequenceParser.ID);
                this.state = 314;
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            }
            break;
        case sequenceParser.STRING:
            this.enterOuterAlt(localctx, 2);
            this.state = 315;
            this.match(sequenceParser.STRING);
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
};

function ToContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_to;
    return this;
}

ToContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ToContext.prototype.constructor = ToContext;

ToContext.prototype.ID = function() {
    return this.getToken(sequenceParser.ID, 0);
};

ToContext.prototype.STRING = function() {
    return this.getToken(sequenceParser.STRING, 0);
};

ToContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterTo(this);
	}
};

ToContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitTo(this);
	}
};




sequenceParser.ToContext = ToContext;

sequenceParser.prototype.to = function() {

    var localctx = new ToContext(this, this._ctx, this.state);
    this.enterRule(localctx, 54, sequenceParser.RULE_to);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 318;
        _la = this._input.LA(1);
        if(!(_la===sequenceParser.ID || _la===sequenceParser.STRING)) {
        this._errHandler.recoverInline(this);
        }
        else {
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
};

function MethodNameContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_methodName;
    return this;
}

MethodNameContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
MethodNameContext.prototype.constructor = MethodNameContext;

MethodNameContext.prototype.ID = function() {
    return this.getToken(sequenceParser.ID, 0);
};

MethodNameContext.prototype.STRING = function() {
    return this.getToken(sequenceParser.STRING, 0);
};

MethodNameContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterMethodName(this);
	}
};

MethodNameContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitMethodName(this);
	}
};




sequenceParser.MethodNameContext = MethodNameContext;

sequenceParser.prototype.methodName = function() {

    var localctx = new MethodNameContext(this, this._ctx, this.state);
    this.enterRule(localctx, 56, sequenceParser.RULE_methodName);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 320;
        _la = this._input.LA(1);
        if(!(_la===sequenceParser.ID || _la===sequenceParser.STRING)) {
        this._errHandler.recoverInline(this);
        }
        else {
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
};

function ParametersContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_parameters;
    return this;
}

ParametersContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ParametersContext.prototype.constructor = ParametersContext;

ParametersContext.prototype.parameter = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ParameterContext);
    } else {
        return this.getTypedRuleContext(ParameterContext,i);
    }
};

ParametersContext.prototype.COMMA = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(sequenceParser.COMMA);
    } else {
        return this.getToken(sequenceParser.COMMA, i);
    }
};


ParametersContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterParameters(this);
	}
};

ParametersContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitParameters(this);
	}
};




sequenceParser.ParametersContext = ParametersContext;

sequenceParser.prototype.parameters = function() {

    var localctx = new ParametersContext(this, this._ctx, this.state);
    this.enterRule(localctx, 58, sequenceParser.RULE_parameters);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 322;
        this.parameter();
        this.state = 327;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while(_la===sequenceParser.COMMA) {
            this.state = 323;
            this.match(sequenceParser.COMMA);
            this.state = 324;
            this.parameter();
            this.state = 329;
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
};

function ParameterContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_parameter;
    return this;
}

ParameterContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ParameterContext.prototype.constructor = ParameterContext;

ParameterContext.prototype.declaration = function() {
    return this.getTypedRuleContext(DeclarationContext,0);
};

ParameterContext.prototype.ID = function() {
    return this.getToken(sequenceParser.ID, 0);
};

ParameterContext.prototype.atom = function() {
    return this.getTypedRuleContext(AtomContext,0);
};

ParameterContext.prototype.expr = function() {
    return this.getTypedRuleContext(ExprContext,0);
};

ParameterContext.prototype.creation = function() {
    return this.getTypedRuleContext(CreationContext,0);
};

ParameterContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterParameter(this);
	}
};

ParameterContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitParameter(this);
	}
};




sequenceParser.ParameterContext = ParameterContext;

sequenceParser.prototype.parameter = function() {

    var localctx = new ParameterContext(this, this._ctx, this.state);
    this.enterRule(localctx, 60, sequenceParser.RULE_parameter);
    try {
        this.state = 335;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,40,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 330;
            this.declaration();
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 331;
            this.match(sequenceParser.ID);
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 332;
            this.atom();
            break;

        case 4:
            this.enterOuterAlt(localctx, 4);
            this.state = 333;
            this.expr(0);
            break;

        case 5:
            this.enterOuterAlt(localctx, 5);
            this.state = 334;
            this.creation();
            break;

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
};

function DeclarationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_declaration;
    return this;
}

DeclarationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
DeclarationContext.prototype.constructor = DeclarationContext;

DeclarationContext.prototype.type = function() {
    return this.getTypedRuleContext(TypeContext,0);
};

DeclarationContext.prototype.ID = function() {
    return this.getToken(sequenceParser.ID, 0);
};

DeclarationContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterDeclaration(this);
	}
};

DeclarationContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitDeclaration(this);
	}
};




sequenceParser.DeclarationContext = DeclarationContext;

sequenceParser.prototype.declaration = function() {

    var localctx = new DeclarationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 62, sequenceParser.RULE_declaration);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 337;
        this.type();
        this.state = 338;
        this.match(sequenceParser.ID);
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
};

function AltContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_alt;
    return this;
}

AltContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AltContext.prototype.constructor = AltContext;

AltContext.prototype.ifBlock = function() {
    return this.getTypedRuleContext(IfBlockContext,0);
};

AltContext.prototype.elseIfBlock = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ElseIfBlockContext);
    } else {
        return this.getTypedRuleContext(ElseIfBlockContext,i);
    }
};

AltContext.prototype.elseBlock = function() {
    return this.getTypedRuleContext(ElseBlockContext,0);
};

AltContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterAlt(this);
	}
};

AltContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitAlt(this);
	}
};




sequenceParser.AltContext = AltContext;

sequenceParser.prototype.alt = function() {

    var localctx = new AltContext(this, this._ctx, this.state);
    this.enterRule(localctx, 64, sequenceParser.RULE_alt);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 340;
        this.ifBlock();
        this.state = 344;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,41,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                this.state = 341;
                this.elseIfBlock(); 
            }
            this.state = 346;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,41,this._ctx);
        }

        this.state = 348;
        _la = this._input.LA(1);
        if(_la===sequenceParser.ELSE) {
            this.state = 347;
            this.elseBlock();
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
};

function IfBlockContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_ifBlock;
    return this;
}

IfBlockContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
IfBlockContext.prototype.constructor = IfBlockContext;

IfBlockContext.prototype.IF = function() {
    return this.getToken(sequenceParser.IF, 0);
};

IfBlockContext.prototype.parExpr = function() {
    return this.getTypedRuleContext(ParExprContext,0);
};

IfBlockContext.prototype.braceBlock = function() {
    return this.getTypedRuleContext(BraceBlockContext,0);
};

IfBlockContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterIfBlock(this);
	}
};

IfBlockContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitIfBlock(this);
	}
};




sequenceParser.IfBlockContext = IfBlockContext;

sequenceParser.prototype.ifBlock = function() {

    var localctx = new IfBlockContext(this, this._ctx, this.state);
    this.enterRule(localctx, 66, sequenceParser.RULE_ifBlock);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 350;
        this.match(sequenceParser.IF);
        this.state = 351;
        this.parExpr();
        this.state = 352;
        this.braceBlock();
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
};

function ElseIfBlockContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_elseIfBlock;
    return this;
}

ElseIfBlockContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ElseIfBlockContext.prototype.constructor = ElseIfBlockContext;

ElseIfBlockContext.prototype.ELSE = function() {
    return this.getToken(sequenceParser.ELSE, 0);
};

ElseIfBlockContext.prototype.IF = function() {
    return this.getToken(sequenceParser.IF, 0);
};

ElseIfBlockContext.prototype.parExpr = function() {
    return this.getTypedRuleContext(ParExprContext,0);
};

ElseIfBlockContext.prototype.braceBlock = function() {
    return this.getTypedRuleContext(BraceBlockContext,0);
};

ElseIfBlockContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterElseIfBlock(this);
	}
};

ElseIfBlockContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitElseIfBlock(this);
	}
};




sequenceParser.ElseIfBlockContext = ElseIfBlockContext;

sequenceParser.prototype.elseIfBlock = function() {

    var localctx = new ElseIfBlockContext(this, this._ctx, this.state);
    this.enterRule(localctx, 68, sequenceParser.RULE_elseIfBlock);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 354;
        this.match(sequenceParser.ELSE);
        this.state = 355;
        this.match(sequenceParser.IF);
        this.state = 356;
        this.parExpr();
        this.state = 357;
        this.braceBlock();
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
};

function ElseBlockContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_elseBlock;
    return this;
}

ElseBlockContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ElseBlockContext.prototype.constructor = ElseBlockContext;

ElseBlockContext.prototype.ELSE = function() {
    return this.getToken(sequenceParser.ELSE, 0);
};

ElseBlockContext.prototype.braceBlock = function() {
    return this.getTypedRuleContext(BraceBlockContext,0);
};

ElseBlockContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterElseBlock(this);
	}
};

ElseBlockContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitElseBlock(this);
	}
};




sequenceParser.ElseBlockContext = ElseBlockContext;

sequenceParser.prototype.elseBlock = function() {

    var localctx = new ElseBlockContext(this, this._ctx, this.state);
    this.enterRule(localctx, 70, sequenceParser.RULE_elseBlock);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 359;
        this.match(sequenceParser.ELSE);
        this.state = 360;
        this.braceBlock();
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
};

function BraceBlockContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_braceBlock;
    return this;
}

BraceBlockContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
BraceBlockContext.prototype.constructor = BraceBlockContext;

BraceBlockContext.prototype.OBRACE = function() {
    return this.getToken(sequenceParser.OBRACE, 0);
};

BraceBlockContext.prototype.CBRACE = function() {
    return this.getToken(sequenceParser.CBRACE, 0);
};

BraceBlockContext.prototype.block = function() {
    return this.getTypedRuleContext(BlockContext,0);
};

BraceBlockContext.prototype.comment = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(CommentContext);
    } else {
        return this.getTypedRuleContext(CommentContext,i);
    }
};

BraceBlockContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterBraceBlock(this);
	}
};

BraceBlockContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitBraceBlock(this);
	}
};




sequenceParser.BraceBlockContext = BraceBlockContext;

sequenceParser.prototype.braceBlock = function() {

    var localctx = new BraceBlockContext(this, this._ctx, this.state);
    this.enterRule(localctx, 72, sequenceParser.RULE_braceBlock);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 362;
        this.match(sequenceParser.OBRACE);
        this.state = 369;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,44,this._ctx);
        switch(la_) {
        case 1:
            this.state = 363;
            this.block();
            break;

        case 2:
            this.state = 365; 
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            do {
                this.state = 364;
                this.comment();
                this.state = 367; 
                this._errHandler.sync(this);
                _la = this._input.LA(1);
            } while(_la===sequenceParser.DS);
            break;

        }
        this.state = 371;
        this.match(sequenceParser.CBRACE);
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
};

function LoopContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_loop;
    return this;
}

LoopContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
LoopContext.prototype.constructor = LoopContext;

LoopContext.prototype.WHILE = function() {
    return this.getToken(sequenceParser.WHILE, 0);
};

LoopContext.prototype.parExpr = function() {
    return this.getTypedRuleContext(ParExprContext,0);
};

LoopContext.prototype.braceBlock = function() {
    return this.getTypedRuleContext(BraceBlockContext,0);
};

LoopContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterLoop(this);
	}
};

LoopContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitLoop(this);
	}
};




sequenceParser.LoopContext = LoopContext;

sequenceParser.prototype.loop = function() {

    var localctx = new LoopContext(this, this._ctx, this.state);
    this.enterRule(localctx, 74, sequenceParser.RULE_loop);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 373;
        this.match(sequenceParser.WHILE);
        this.state = 374;
        this.parExpr();
        this.state = 375;
        this.braceBlock();
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
};

function ExprContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_expr;
    return this;
}

ExprContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ExprContext.prototype.constructor = ExprContext;


 
ExprContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
};

function NotExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

NotExprContext.prototype = Object.create(ExprContext.prototype);
NotExprContext.prototype.constructor = NotExprContext;

sequenceParser.NotExprContext = NotExprContext;

NotExprContext.prototype.NOT = function() {
    return this.getToken(sequenceParser.NOT, 0);
};

NotExprContext.prototype.expr = function() {
    return this.getTypedRuleContext(ExprContext,0);
};
NotExprContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterNotExpr(this);
	}
};

NotExprContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitNotExpr(this);
	}
};


function FuncExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

FuncExprContext.prototype = Object.create(ExprContext.prototype);
FuncExprContext.prototype.constructor = FuncExprContext;

sequenceParser.FuncExprContext = FuncExprContext;

FuncExprContext.prototype.func = function() {
    return this.getTypedRuleContext(FuncContext,0);
};
FuncExprContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterFuncExpr(this);
	}
};

FuncExprContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitFuncExpr(this);
	}
};


function UnaryMinusExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

UnaryMinusExprContext.prototype = Object.create(ExprContext.prototype);
UnaryMinusExprContext.prototype.constructor = UnaryMinusExprContext;

sequenceParser.UnaryMinusExprContext = UnaryMinusExprContext;

UnaryMinusExprContext.prototype.MINUS = function() {
    return this.getToken(sequenceParser.MINUS, 0);
};

UnaryMinusExprContext.prototype.expr = function() {
    return this.getTypedRuleContext(ExprContext,0);
};
UnaryMinusExprContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterUnaryMinusExpr(this);
	}
};

UnaryMinusExprContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitUnaryMinusExpr(this);
	}
};


function CreationExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

CreationExprContext.prototype = Object.create(ExprContext.prototype);
CreationExprContext.prototype.constructor = CreationExprContext;

sequenceParser.CreationExprContext = CreationExprContext;

CreationExprContext.prototype.creation = function() {
    return this.getTypedRuleContext(CreationContext,0);
};
CreationExprContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterCreationExpr(this);
	}
};

CreationExprContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitCreationExpr(this);
	}
};


function MultiplicationExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    this.op = null; // Token;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

MultiplicationExprContext.prototype = Object.create(ExprContext.prototype);
MultiplicationExprContext.prototype.constructor = MultiplicationExprContext;

sequenceParser.MultiplicationExprContext = MultiplicationExprContext;

MultiplicationExprContext.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};

MultiplicationExprContext.prototype.MULT = function() {
    return this.getToken(sequenceParser.MULT, 0);
};

MultiplicationExprContext.prototype.DIV = function() {
    return this.getToken(sequenceParser.DIV, 0);
};

MultiplicationExprContext.prototype.MOD = function() {
    return this.getToken(sequenceParser.MOD, 0);
};
MultiplicationExprContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterMultiplicationExpr(this);
	}
};

MultiplicationExprContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitMultiplicationExpr(this);
	}
};


function AtomExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

AtomExprContext.prototype = Object.create(ExprContext.prototype);
AtomExprContext.prototype.constructor = AtomExprContext;

sequenceParser.AtomExprContext = AtomExprContext;

AtomExprContext.prototype.atom = function() {
    return this.getTypedRuleContext(AtomContext,0);
};
AtomExprContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterAtomExpr(this);
	}
};

AtomExprContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitAtomExpr(this);
	}
};


function OrExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

OrExprContext.prototype = Object.create(ExprContext.prototype);
OrExprContext.prototype.constructor = OrExprContext;

sequenceParser.OrExprContext = OrExprContext;

OrExprContext.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};

OrExprContext.prototype.OR = function() {
    return this.getToken(sequenceParser.OR, 0);
};
OrExprContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterOrExpr(this);
	}
};

OrExprContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitOrExpr(this);
	}
};


function AdditiveExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    this.op = null; // Token;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

AdditiveExprContext.prototype = Object.create(ExprContext.prototype);
AdditiveExprContext.prototype.constructor = AdditiveExprContext;

sequenceParser.AdditiveExprContext = AdditiveExprContext;

AdditiveExprContext.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};

AdditiveExprContext.prototype.PLUS = function() {
    return this.getToken(sequenceParser.PLUS, 0);
};

AdditiveExprContext.prototype.MINUS = function() {
    return this.getToken(sequenceParser.MINUS, 0);
};
AdditiveExprContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterAdditiveExpr(this);
	}
};

AdditiveExprContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitAdditiveExpr(this);
	}
};


function RelationalExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    this.op = null; // Token;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

RelationalExprContext.prototype = Object.create(ExprContext.prototype);
RelationalExprContext.prototype.constructor = RelationalExprContext;

sequenceParser.RelationalExprContext = RelationalExprContext;

RelationalExprContext.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};

RelationalExprContext.prototype.LTEQ = function() {
    return this.getToken(sequenceParser.LTEQ, 0);
};

RelationalExprContext.prototype.GTEQ = function() {
    return this.getToken(sequenceParser.GTEQ, 0);
};

RelationalExprContext.prototype.LT = function() {
    return this.getToken(sequenceParser.LT, 0);
};

RelationalExprContext.prototype.GT = function() {
    return this.getToken(sequenceParser.GT, 0);
};
RelationalExprContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterRelationalExpr(this);
	}
};

RelationalExprContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitRelationalExpr(this);
	}
};


function EqualityExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    this.op = null; // Token;
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

EqualityExprContext.prototype = Object.create(ExprContext.prototype);
EqualityExprContext.prototype.constructor = EqualityExprContext;

sequenceParser.EqualityExprContext = EqualityExprContext;

EqualityExprContext.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};

EqualityExprContext.prototype.EQ = function() {
    return this.getToken(sequenceParser.EQ, 0);
};

EqualityExprContext.prototype.NEQ = function() {
    return this.getToken(sequenceParser.NEQ, 0);
};
EqualityExprContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterEqualityExpr(this);
	}
};

EqualityExprContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitEqualityExpr(this);
	}
};


function PlusExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

PlusExprContext.prototype = Object.create(ExprContext.prototype);
PlusExprContext.prototype.constructor = PlusExprContext;

sequenceParser.PlusExprContext = PlusExprContext;

PlusExprContext.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};

PlusExprContext.prototype.PLUS = function() {
    return this.getToken(sequenceParser.PLUS, 0);
};
PlusExprContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterPlusExpr(this);
	}
};

PlusExprContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitPlusExpr(this);
	}
};


function AndExprContext(parser, ctx) {
	ExprContext.call(this, parser);
    ExprContext.prototype.copyFrom.call(this, ctx);
    return this;
}

AndExprContext.prototype = Object.create(ExprContext.prototype);
AndExprContext.prototype.constructor = AndExprContext;

sequenceParser.AndExprContext = AndExprContext;

AndExprContext.prototype.expr = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(ExprContext);
    } else {
        return this.getTypedRuleContext(ExprContext,i);
    }
};

AndExprContext.prototype.AND = function() {
    return this.getToken(sequenceParser.AND, 0);
};
AndExprContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterAndExpr(this);
	}
};

AndExprContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitAndExpr(this);
	}
};



sequenceParser.prototype.expr = function(_p) {
	if(_p===undefined) {
	    _p = 0;
	}
    var _parentctx = this._ctx;
    var _parentState = this.state;
    var localctx = new ExprContext(this, this._ctx, _parentState);
    var _prevctx = localctx;
    var _startState = 76;
    this.enterRecursionRule(localctx, 76, sequenceParser.RULE_expr, _p);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 385;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,45,this._ctx);
        switch(la_) {
        case 1:
            localctx = new UnaryMinusExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;

            this.state = 378;
            this.match(sequenceParser.MINUS);
            this.state = 379;
            this.expr(12);
            break;

        case 2:
            localctx = new NotExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 380;
            this.match(sequenceParser.NOT);
            this.state = 381;
            this.expr(11);
            break;

        case 3:
            localctx = new FuncExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 382;
            this.func();
            break;

        case 4:
            localctx = new CreationExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 383;
            this.creation();
            break;

        case 5:
            localctx = new AtomExprContext(this, localctx);
            this._ctx = localctx;
            _prevctx = localctx;
            this.state = 384;
            this.atom();
            break;

        }
        this._ctx.stop = this._input.LT(-1);
        this.state = 410;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,47,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                if(this._parseListeners!==null) {
                    this.triggerExitRuleEvent();
                }
                _prevctx = localctx;
                this.state = 408;
                this._errHandler.sync(this);
                var la_ = this._interp.adaptivePredict(this._input,46,this._ctx);
                switch(la_) {
                case 1:
                    localctx = new MultiplicationExprContext(this, new ExprContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
                    this.state = 387;
                    if (!( this.precpred(this._ctx, 10))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 10)");
                    }
                    this.state = 388;
                    localctx.op = this._input.LT(1);
                    _la = this._input.LA(1);
                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << sequenceParser.MULT) | (1 << sequenceParser.DIV) | (1 << sequenceParser.MOD))) !== 0))) {
                        localctx.op = this._errHandler.recoverInline(this);
                    }
                    else {
                        this.consume();
                    }
                    this.state = 389;
                    this.expr(11);
                    break;

                case 2:
                    localctx = new AdditiveExprContext(this, new ExprContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
                    this.state = 390;
                    if (!( this.precpred(this._ctx, 9))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 9)");
                    }
                    this.state = 391;
                    localctx.op = this._input.LT(1);
                    _la = this._input.LA(1);
                    if(!(_la===sequenceParser.PLUS || _la===sequenceParser.MINUS)) {
                        localctx.op = this._errHandler.recoverInline(this);
                    }
                    else {
                        this.consume();
                    }
                    this.state = 392;
                    this.expr(10);
                    break;

                case 3:
                    localctx = new RelationalExprContext(this, new ExprContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
                    this.state = 393;
                    if (!( this.precpred(this._ctx, 8))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 8)");
                    }
                    this.state = 394;
                    localctx.op = this._input.LT(1);
                    _la = this._input.LA(1);
                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << sequenceParser.GT) | (1 << sequenceParser.LT) | (1 << sequenceParser.GTEQ) | (1 << sequenceParser.LTEQ))) !== 0))) {
                        localctx.op = this._errHandler.recoverInline(this);
                    }
                    else {
                        this.consume();
                    }
                    this.state = 395;
                    this.expr(9);
                    break;

                case 4:
                    localctx = new EqualityExprContext(this, new ExprContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
                    this.state = 396;
                    if (!( this.precpred(this._ctx, 7))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 7)");
                    }
                    this.state = 397;
                    localctx.op = this._input.LT(1);
                    _la = this._input.LA(1);
                    if(!(_la===sequenceParser.EQ || _la===sequenceParser.NEQ)) {
                        localctx.op = this._errHandler.recoverInline(this);
                    }
                    else {
                        this.consume();
                    }
                    this.state = 398;
                    this.expr(8);
                    break;

                case 5:
                    localctx = new AndExprContext(this, new ExprContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
                    this.state = 399;
                    if (!( this.precpred(this._ctx, 6))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 6)");
                    }
                    this.state = 400;
                    this.match(sequenceParser.AND);
                    this.state = 401;
                    this.expr(7);
                    break;

                case 6:
                    localctx = new OrExprContext(this, new ExprContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
                    this.state = 402;
                    if (!( this.precpred(this._ctx, 5))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 5)");
                    }
                    this.state = 403;
                    this.match(sequenceParser.OR);
                    this.state = 404;
                    this.expr(6);
                    break;

                case 7:
                    localctx = new PlusExprContext(this, new ExprContext(this, _parentctx, _parentState));
                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
                    this.state = 405;
                    if (!( this.precpred(this._ctx, 4))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 4)");
                    }
                    this.state = 406;
                    this.match(sequenceParser.PLUS);
                    this.state = 407;
                    this.expr(5);
                    break;

                } 
            }
            this.state = 412;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,47,this._ctx);
        }

    } catch( error) {
        if(error instanceof antlr4.error.RecognitionException) {
	        localctx.exception = error;
	        this._errHandler.reportError(this, error);
	        this._errHandler.recover(this, error);
	    } else {
	    	throw error;
	    }
    } finally {
        this.unrollRecursionContexts(_parentctx)
    }
    return localctx;
};

function AtomContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_atom;
    return this;
}

AtomContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
AtomContext.prototype.constructor = AtomContext;


 
AtomContext.prototype.copyFrom = function(ctx) {
    antlr4.ParserRuleContext.prototype.copyFrom.call(this, ctx);
};


function BooleanAtomContext(parser, ctx) {
	AtomContext.call(this, parser);
    AtomContext.prototype.copyFrom.call(this, ctx);
    return this;
}

BooleanAtomContext.prototype = Object.create(AtomContext.prototype);
BooleanAtomContext.prototype.constructor = BooleanAtomContext;

sequenceParser.BooleanAtomContext = BooleanAtomContext;

BooleanAtomContext.prototype.TRUE = function() {
    return this.getToken(sequenceParser.TRUE, 0);
};

BooleanAtomContext.prototype.FALSE = function() {
    return this.getToken(sequenceParser.FALSE, 0);
};
BooleanAtomContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterBooleanAtom(this);
	}
};

BooleanAtomContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitBooleanAtom(this);
	}
};


function IdAtomContext(parser, ctx) {
	AtomContext.call(this, parser);
    AtomContext.prototype.copyFrom.call(this, ctx);
    return this;
}

IdAtomContext.prototype = Object.create(AtomContext.prototype);
IdAtomContext.prototype.constructor = IdAtomContext;

sequenceParser.IdAtomContext = IdAtomContext;

IdAtomContext.prototype.ID = function() {
    return this.getToken(sequenceParser.ID, 0);
};
IdAtomContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterIdAtom(this);
	}
};

IdAtomContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitIdAtom(this);
	}
};


function StringAtomContext(parser, ctx) {
	AtomContext.call(this, parser);
    AtomContext.prototype.copyFrom.call(this, ctx);
    return this;
}

StringAtomContext.prototype = Object.create(AtomContext.prototype);
StringAtomContext.prototype.constructor = StringAtomContext;

sequenceParser.StringAtomContext = StringAtomContext;

StringAtomContext.prototype.STRING = function() {
    return this.getToken(sequenceParser.STRING, 0);
};
StringAtomContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterStringAtom(this);
	}
};

StringAtomContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitStringAtom(this);
	}
};


function NilAtomContext(parser, ctx) {
	AtomContext.call(this, parser);
    AtomContext.prototype.copyFrom.call(this, ctx);
    return this;
}

NilAtomContext.prototype = Object.create(AtomContext.prototype);
NilAtomContext.prototype.constructor = NilAtomContext;

sequenceParser.NilAtomContext = NilAtomContext;

NilAtomContext.prototype.NIL = function() {
    return this.getToken(sequenceParser.NIL, 0);
};
NilAtomContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterNilAtom(this);
	}
};

NilAtomContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitNilAtom(this);
	}
};


function NumberAtomContext(parser, ctx) {
	AtomContext.call(this, parser);
    AtomContext.prototype.copyFrom.call(this, ctx);
    return this;
}

NumberAtomContext.prototype = Object.create(AtomContext.prototype);
NumberAtomContext.prototype.constructor = NumberAtomContext;

sequenceParser.NumberAtomContext = NumberAtomContext;

NumberAtomContext.prototype.INT = function() {
    return this.getToken(sequenceParser.INT, 0);
};

NumberAtomContext.prototype.FLOAT = function() {
    return this.getToken(sequenceParser.FLOAT, 0);
};
NumberAtomContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterNumberAtom(this);
	}
};

NumberAtomContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitNumberAtom(this);
	}
};



sequenceParser.AtomContext = AtomContext;

sequenceParser.prototype.atom = function() {

    var localctx = new AtomContext(this, this._ctx, this.state);
    this.enterRule(localctx, 78, sequenceParser.RULE_atom);
    var _la = 0; // Token type
    try {
        this.state = 418;
        switch(this._input.LA(1)) {
        case sequenceParser.INT:
        case sequenceParser.FLOAT:
            localctx = new NumberAtomContext(this, localctx);
            this.enterOuterAlt(localctx, 1);
            this.state = 413;
            _la = this._input.LA(1);
            if(!(_la===sequenceParser.INT || _la===sequenceParser.FLOAT)) {
            this._errHandler.recoverInline(this);
            }
            else {
                this.consume();
            }
            break;
        case sequenceParser.TRUE:
        case sequenceParser.FALSE:
            localctx = new BooleanAtomContext(this, localctx);
            this.enterOuterAlt(localctx, 2);
            this.state = 414;
            _la = this._input.LA(1);
            if(!(_la===sequenceParser.TRUE || _la===sequenceParser.FALSE)) {
            this._errHandler.recoverInline(this);
            }
            else {
                this.consume();
            }
            break;
        case sequenceParser.ID:
            localctx = new IdAtomContext(this, localctx);
            this.enterOuterAlt(localctx, 3);
            this.state = 415;
            this.match(sequenceParser.ID);
            break;
        case sequenceParser.STRING:
            localctx = new StringAtomContext(this, localctx);
            this.enterOuterAlt(localctx, 4);
            this.state = 416;
            this.match(sequenceParser.STRING);
            break;
        case sequenceParser.NIL:
            localctx = new NilAtomContext(this, localctx);
            this.enterOuterAlt(localctx, 5);
            this.state = 417;
            this.match(sequenceParser.NIL);
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
};

function ParExprContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = sequenceParser.RULE_parExpr;
    return this;
}

ParExprContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ParExprContext.prototype.constructor = ParExprContext;

ParExprContext.prototype.OPAR = function() {
    return this.getToken(sequenceParser.OPAR, 0);
};

ParExprContext.prototype.expr = function() {
    return this.getTypedRuleContext(ExprContext,0);
};

ParExprContext.prototype.CPAR = function() {
    return this.getToken(sequenceParser.CPAR, 0);
};

ParExprContext.prototype.enterRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.enterParExpr(this);
	}
};

ParExprContext.prototype.exitRule = function(listener) {
    if(listener instanceof sequenceParserListener ) {
        listener.exitParExpr(this);
	}
};




sequenceParser.ParExprContext = ParExprContext;

sequenceParser.prototype.parExpr = function() {

    var localctx = new ParExprContext(this, this._ctx, this.state);
    this.enterRule(localctx, 80, sequenceParser.RULE_parExpr);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 420;
        this.match(sequenceParser.OPAR);
        this.state = 421;
        this.expr(0);
        this.state = 422;
        this.match(sequenceParser.CPAR);
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
};


sequenceParser.prototype.sempred = function(localctx, ruleIndex, predIndex) {
	switch(ruleIndex) {
	case 38:
			return this.expr_sempred(localctx, predIndex);
    default:
        throw "No predicate with index:" + ruleIndex;
   }
};

sequenceParser.prototype.expr_sempred = function(localctx, predIndex) {
	switch(predIndex) {
		case 0:
			return this.precpred(this._ctx, 10);
		case 1:
			return this.precpred(this._ctx, 9);
		case 2:
			return this.precpred(this._ctx, 8);
		case 3:
			return this.precpred(this._ctx, 7);
		case 4:
			return this.precpred(this._ctx, 6);
		case 5:
			return this.precpred(this._ctx, 5);
		case 6:
			return this.precpred(this._ctx, 4);
		default:
			throw "No predicate with index:" + predIndex;
	}
};


exports.sequenceParser = sequenceParser;