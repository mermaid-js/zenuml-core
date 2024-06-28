// Generated from java-escape by ANTLR 4.11.1
// jshint ignore: start
import antlr4 from 'antlr4';
import sequenceParserListener from './sequenceParserListener.js';
const serializedATN = [4,1,67,583,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,
4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,
2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,
20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,26,2,27,
7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,2,32,7,32,2,33,7,33,2,34,7,
34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,2,39,7,39,2,40,7,40,2,41,7,41,
2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,45,2,46,7,46,2,47,7,47,2,48,7,48,2,
49,7,49,2,50,7,50,2,51,7,51,2,52,7,52,2,53,7,53,2,54,7,54,1,0,3,0,112,8,
0,1,0,1,0,3,0,116,8,0,1,0,1,0,1,0,1,0,3,0,122,8,0,1,0,3,0,125,8,0,1,0,1,
0,1,0,3,0,130,8,0,1,1,1,1,3,1,134,8,1,1,1,3,1,137,8,1,1,2,1,2,4,2,141,8,
2,11,2,12,2,142,1,2,1,2,5,2,147,8,2,10,2,12,2,150,9,2,1,2,3,2,153,8,2,1,
3,1,3,3,3,157,8,3,1,3,1,3,5,3,161,8,3,10,3,12,3,164,9,3,1,3,1,3,1,3,3,3,
169,8,3,1,3,1,3,1,3,3,3,174,8,3,3,3,176,8,3,1,4,1,4,1,4,3,4,181,8,4,1,4,
3,4,184,8,4,1,4,3,4,187,8,4,1,5,1,5,1,6,3,6,192,8,6,1,6,3,6,195,8,6,1,6,
1,6,3,6,199,8,6,1,6,3,6,202,8,6,1,6,3,6,205,8,6,1,6,1,6,3,6,209,8,6,1,7,
1,7,1,7,1,7,1,7,1,7,1,7,3,7,218,8,7,1,7,1,7,3,7,222,8,7,3,7,224,8,7,1,8,
1,8,1,8,3,8,229,8,8,1,9,1,9,1,10,1,10,1,11,1,11,1,12,4,12,238,8,12,11,12,
12,12,239,1,13,1,13,3,13,244,8,13,1,13,3,13,247,8,13,1,13,1,13,1,13,3,13,
252,8,13,3,13,254,8,13,1,14,1,14,1,15,1,15,1,16,1,16,1,16,1,16,1,16,1,16,
1,16,1,16,1,16,1,16,3,16,270,8,16,1,16,1,16,1,16,1,16,1,16,3,16,277,8,16,
1,17,1,17,1,17,3,17,282,8,17,1,18,1,18,1,18,3,18,287,8,18,1,19,1,19,1,19,
3,19,292,8,19,1,19,3,19,295,8,19,1,19,1,19,3,19,299,8,19,1,20,1,20,1,20,
3,20,304,8,20,1,20,3,20,307,8,20,1,20,1,20,3,20,311,8,20,1,21,1,21,1,21,
3,21,316,8,21,1,22,3,22,319,8,22,1,22,1,22,1,22,1,22,3,22,325,8,22,1,22,
3,22,328,8,22,1,22,3,22,331,8,22,1,22,3,22,334,8,22,1,23,1,23,1,23,3,23,
339,8,23,1,24,3,24,342,8,24,1,24,1,24,1,24,3,24,347,8,24,1,24,1,24,1,24,
3,24,352,8,24,1,24,1,24,1,24,1,24,1,24,3,24,359,8,24,1,24,1,24,1,24,3,24,
364,8,24,1,25,1,25,1,25,5,25,369,8,25,10,25,12,25,372,9,25,1,26,1,26,1,27,
1,27,1,28,1,28,3,28,380,8,28,1,29,1,29,3,29,384,8,29,1,29,1,29,1,30,3,30,
389,8,30,1,30,1,30,1,30,1,31,1,31,1,31,3,31,397,8,31,1,31,1,31,1,31,3,31,
402,8,31,1,31,1,31,1,31,3,31,407,8,31,3,31,409,8,31,1,32,1,32,1,33,1,33,
1,34,1,34,1,35,1,35,1,35,1,35,5,35,421,8,35,10,35,12,35,424,9,35,1,35,3,
35,427,8,35,1,36,1,36,1,37,1,37,1,37,5,37,434,8,37,10,37,12,37,437,9,37,
1,37,3,37,440,8,37,1,38,1,38,3,38,444,8,38,1,39,1,39,1,39,1,40,1,40,5,40,
451,8,40,10,40,12,40,454,9,40,1,40,3,40,457,8,40,1,41,1,41,1,41,1,42,1,42,
3,42,464,8,42,1,42,1,42,1,43,1,43,1,43,1,44,1,44,5,44,473,8,44,10,44,12,
44,476,9,44,1,44,3,44,479,8,44,1,45,1,45,1,45,1,45,1,46,1,46,1,46,1,46,1,
46,1,47,1,47,1,47,1,48,1,48,3,48,495,8,48,1,48,1,48,1,49,1,49,1,49,1,49,
1,49,1,49,1,49,3,49,506,8,49,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,
3,50,517,8,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,3,50,528,8,50,
1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,50,1,
50,1,50,1,50,1,50,1,50,1,50,1,50,5,50,551,8,50,10,50,12,50,554,9,50,1,51,
1,51,1,51,1,51,1,51,3,51,561,8,51,1,52,1,52,1,52,1,52,1,52,1,52,1,52,1,52,
1,52,3,52,572,8,52,1,53,1,53,1,53,3,53,577,8,53,1,54,1,54,1,54,1,54,1,54,
0,1,100,55,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,
44,46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,88,90,
92,94,96,98,100,102,104,106,108,0,10,2,0,56,56,59,59,2,0,8,8,17,17,2,0,9,
9,16,16,2,0,10,10,21,21,1,0,22,24,1,0,20,21,1,0,16,19,1,0,14,15,1,0,57,58,
1,0,34,35,647,0,129,1,0,0,0,2,131,1,0,0,0,4,152,1,0,0,0,6,175,1,0,0,0,8,
186,1,0,0,0,10,188,1,0,0,0,12,208,1,0,0,0,14,223,1,0,0,0,16,228,1,0,0,0,
18,230,1,0,0,0,20,232,1,0,0,0,22,234,1,0,0,0,24,237,1,0,0,0,26,253,1,0,0,
0,28,255,1,0,0,0,30,257,1,0,0,0,32,276,1,0,0,0,34,281,1,0,0,0,36,286,1,0,
0,0,38,298,1,0,0,0,40,310,1,0,0,0,42,312,1,0,0,0,44,333,1,0,0,0,46,335,1,
0,0,0,48,363,1,0,0,0,50,365,1,0,0,0,52,373,1,0,0,0,54,375,1,0,0,0,56,377,
1,0,0,0,58,381,1,0,0,0,60,388,1,0,0,0,62,408,1,0,0,0,64,410,1,0,0,0,66,412,
1,0,0,0,68,414,1,0,0,0,70,426,1,0,0,0,72,428,1,0,0,0,74,430,1,0,0,0,76,443,
1,0,0,0,78,445,1,0,0,0,80,448,1,0,0,0,82,458,1,0,0,0,84,461,1,0,0,0,86,467,
1,0,0,0,88,470,1,0,0,0,90,480,1,0,0,0,92,484,1,0,0,0,94,489,1,0,0,0,96,492,
1,0,0,0,98,505,1,0,0,0,100,527,1,0,0,0,102,560,1,0,0,0,104,571,1,0,0,0,106,
576,1,0,0,0,108,578,1,0,0,0,110,112,3,2,1,0,111,110,1,0,0,0,111,112,1,0,
0,0,112,113,1,0,0,0,113,130,5,0,0,1,114,116,3,2,1,0,115,114,1,0,0,0,115,
116,1,0,0,0,116,117,1,0,0,0,117,118,3,4,2,0,118,119,5,0,0,1,119,130,1,0,
0,0,120,122,3,2,1,0,121,120,1,0,0,0,121,122,1,0,0,0,122,124,1,0,0,0,123,
125,3,4,2,0,124,123,1,0,0,0,124,125,1,0,0,0,125,126,1,0,0,0,126,127,3,24,
12,0,127,128,5,0,0,1,128,130,1,0,0,0,129,111,1,0,0,0,129,115,1,0,0,0,129,
121,1,0,0,0,130,1,1,0,0,0,131,133,5,6,0,0,132,134,5,66,0,0,133,132,1,0,0,
0,133,134,1,0,0,0,134,136,1,0,0,0,135,137,5,67,0,0,136,135,1,0,0,0,136,137,
1,0,0,0,137,3,1,0,0,0,138,141,3,6,3,0,139,141,3,12,6,0,140,138,1,0,0,0,140,
139,1,0,0,0,141,142,1,0,0,0,142,140,1,0,0,0,142,143,1,0,0,0,143,153,1,0,
0,0,144,147,3,6,3,0,145,147,3,12,6,0,146,144,1,0,0,0,146,145,1,0,0,0,147,
150,1,0,0,0,148,146,1,0,0,0,148,149,1,0,0,0,149,151,1,0,0,0,150,148,1,0,
0,0,151,153,3,8,4,0,152,140,1,0,0,0,152,148,1,0,0,0,153,5,1,0,0,0,154,156,
5,43,0,0,155,157,3,20,10,0,156,155,1,0,0,0,156,157,1,0,0,0,157,158,1,0,0,
0,158,162,5,32,0,0,159,161,3,12,6,0,160,159,1,0,0,0,161,164,1,0,0,0,162,
160,1,0,0,0,162,163,1,0,0,0,163,165,1,0,0,0,164,162,1,0,0,0,165,176,5,33,
0,0,166,168,5,43,0,0,167,169,3,20,10,0,168,167,1,0,0,0,168,169,1,0,0,0,169,
170,1,0,0,0,170,176,5,32,0,0,171,173,5,43,0,0,172,174,3,20,10,0,173,172,
1,0,0,0,173,174,1,0,0,0,174,176,1,0,0,0,175,154,1,0,0,0,175,166,1,0,0,0,
175,171,1,0,0,0,176,7,1,0,0,0,177,183,5,52,0,0,178,180,5,30,0,0,179,181,
3,10,5,0,180,179,1,0,0,0,180,181,1,0,0,0,181,182,1,0,0,0,182,184,5,31,0,
0,183,178,1,0,0,0,183,184,1,0,0,0,184,187,1,0,0,0,185,187,5,54,0,0,186,177,
1,0,0,0,186,185,1,0,0,0,187,9,1,0,0,0,188,189,7,0,0,0,189,11,1,0,0,0,190,
192,3,18,9,0,191,190,1,0,0,0,191,192,1,0,0,0,192,194,1,0,0,0,193,195,3,14,
7,0,194,193,1,0,0,0,194,195,1,0,0,0,195,196,1,0,0,0,196,198,3,20,10,0,197,
199,3,22,11,0,198,197,1,0,0,0,198,199,1,0,0,0,199,201,1,0,0,0,200,202,3,
16,8,0,201,200,1,0,0,0,201,202,1,0,0,0,202,204,1,0,0,0,203,205,5,11,0,0,
204,203,1,0,0,0,204,205,1,0,0,0,205,209,1,0,0,0,206,209,3,14,7,0,207,209,
3,18,9,0,208,191,1,0,0,0,208,206,1,0,0,0,208,207,1,0,0,0,209,13,1,0,0,0,
210,211,5,8,0,0,211,212,3,20,10,0,212,213,5,9,0,0,213,224,1,0,0,0,214,215,
5,8,0,0,215,217,3,20,10,0,216,218,5,16,0,0,217,216,1,0,0,0,217,218,1,0,0,
0,218,224,1,0,0,0,219,221,7,1,0,0,220,222,7,2,0,0,221,220,1,0,0,0,221,222,
1,0,0,0,222,224,1,0,0,0,223,210,1,0,0,0,223,214,1,0,0,0,223,219,1,0,0,0,
224,15,1,0,0,0,225,226,5,47,0,0,226,229,3,20,10,0,227,229,5,47,0,0,228,225,
1,0,0,0,228,227,1,0,0,0,229,17,1,0,0,0,230,231,5,54,0,0,231,19,1,0,0,0,232,
233,7,0,0,0,233,21,1,0,0,0,234,235,5,57,0,0,235,23,1,0,0,0,236,238,3,32,
16,0,237,236,1,0,0,0,238,239,1,0,0,0,239,237,1,0,0,0,239,240,1,0,0,0,240,
25,1,0,0,0,241,243,5,40,0,0,242,244,3,100,50,0,243,242,1,0,0,0,243,244,1,
0,0,0,244,246,1,0,0,0,245,247,5,27,0,0,246,245,1,0,0,0,246,247,1,0,0,0,247,
254,1,0,0,0,248,249,5,53,0,0,249,251,3,62,31,0,250,252,5,65,0,0,251,250,
1,0,0,0,251,252,1,0,0,0,252,254,1,0,0,0,253,241,1,0,0,0,253,248,1,0,0,0,
254,27,1,0,0,0,255,256,3,30,15,0,256,29,1,0,0,0,257,258,5,63,0,0,258,31,
1,0,0,0,259,277,3,88,44,0,260,277,3,34,17,0,261,277,3,36,18,0,262,277,3,
38,19,0,263,277,3,40,20,0,264,277,3,98,49,0,265,277,3,42,21,0,266,277,3,
46,23,0,267,269,3,62,31,0,268,270,5,65,0,0,269,268,1,0,0,0,269,270,1,0,0,
0,270,277,1,0,0,0,271,277,3,26,13,0,272,277,3,28,14,0,273,277,3,80,40,0,
274,275,5,62,0,0,275,277,6,16,-1,0,276,259,1,0,0,0,276,260,1,0,0,0,276,261,
1,0,0,0,276,262,1,0,0,0,276,263,1,0,0,0,276,264,1,0,0,0,276,265,1,0,0,0,
276,266,1,0,0,0,276,267,1,0,0,0,276,271,1,0,0,0,276,272,1,0,0,0,276,273,
1,0,0,0,276,274,1,0,0,0,277,33,1,0,0,0,278,279,5,42,0,0,279,282,3,96,48,
0,280,282,5,42,0,0,281,278,1,0,0,0,281,280,1,0,0,0,282,35,1,0,0,0,283,284,
5,44,0,0,284,287,3,96,48,0,285,287,5,44,0,0,286,283,1,0,0,0,286,285,1,0,
0,0,287,37,1,0,0,0,288,294,5,45,0,0,289,291,5,30,0,0,290,292,3,102,51,0,
291,290,1,0,0,0,291,292,1,0,0,0,292,293,1,0,0,0,293,295,5,31,0,0,294,289,
1,0,0,0,294,295,1,0,0,0,295,296,1,0,0,0,296,299,3,96,48,0,297,299,5,45,0,
0,298,288,1,0,0,0,298,297,1,0,0,0,299,39,1,0,0,0,300,306,5,46,0,0,301,303,
5,30,0,0,302,304,3,102,51,0,303,302,1,0,0,0,303,304,1,0,0,0,304,305,1,0,
0,0,305,307,5,31,0,0,306,301,1,0,0,0,306,307,1,0,0,0,307,308,1,0,0,0,308,
311,3,96,48,0,309,311,5,46,0,0,310,300,1,0,0,0,310,309,1,0,0,0,311,41,1,
0,0,0,312,315,3,44,22,0,313,316,5,27,0,0,314,316,3,96,48,0,315,313,1,0,0,
0,315,314,1,0,0,0,315,316,1,0,0,0,316,43,1,0,0,0,317,319,3,60,30,0,318,317,
1,0,0,0,318,319,1,0,0,0,319,320,1,0,0,0,320,321,5,41,0,0,321,327,3,66,33,
0,322,324,5,30,0,0,323,325,3,74,37,0,324,323,1,0,0,0,324,325,1,0,0,0,325,
326,1,0,0,0,326,328,5,31,0,0,327,322,1,0,0,0,327,328,1,0,0,0,328,334,1,0,
0,0,329,331,3,60,30,0,330,329,1,0,0,0,330,331,1,0,0,0,331,332,1,0,0,0,332,
334,5,41,0,0,333,318,1,0,0,0,333,330,1,0,0,0,334,45,1,0,0,0,335,338,3,48,
24,0,336,339,5,27,0,0,337,339,3,96,48,0,338,336,1,0,0,0,338,337,1,0,0,0,
338,339,1,0,0,0,339,47,1,0,0,0,340,342,3,60,30,0,341,340,1,0,0,0,341,342,
1,0,0,0,342,351,1,0,0,0,343,344,3,52,26,0,344,345,5,10,0,0,345,347,1,0,0,
0,346,343,1,0,0,0,346,347,1,0,0,0,347,348,1,0,0,0,348,349,3,54,27,0,349,
350,5,55,0,0,350,352,1,0,0,0,351,346,1,0,0,0,351,352,1,0,0,0,352,353,1,0,
0,0,353,364,3,50,25,0,354,364,3,60,30,0,355,356,3,52,26,0,356,357,5,10,0,
0,357,359,1,0,0,0,358,355,1,0,0,0,358,359,1,0,0,0,359,360,1,0,0,0,360,361,
3,54,27,0,361,362,5,55,0,0,362,364,1,0,0,0,363,341,1,0,0,0,363,354,1,0,0,
0,363,358,1,0,0,0,364,49,1,0,0,0,365,370,3,56,28,0,366,367,5,55,0,0,367,
369,3,56,28,0,368,366,1,0,0,0,369,372,1,0,0,0,370,368,1,0,0,0,370,371,1,
0,0,0,371,51,1,0,0,0,372,370,1,0,0,0,373,374,7,0,0,0,374,53,1,0,0,0,375,
376,7,0,0,0,376,55,1,0,0,0,377,379,3,72,36,0,378,380,3,58,29,0,379,378,1,
0,0,0,379,380,1,0,0,0,380,57,1,0,0,0,381,383,5,30,0,0,382,384,3,74,37,0,
383,382,1,0,0,0,383,384,1,0,0,0,384,385,1,0,0,0,385,386,5,31,0,0,386,59,
1,0,0,0,387,389,3,68,34,0,388,387,1,0,0,0,388,389,1,0,0,0,389,390,1,0,0,
0,390,391,3,70,35,0,391,392,5,29,0,0,392,61,1,0,0,0,393,394,3,52,26,0,394,
395,5,10,0,0,395,397,1,0,0,0,396,393,1,0,0,0,396,397,1,0,0,0,397,398,1,0,
0,0,398,399,3,54,27,0,399,401,5,7,0,0,400,402,3,64,32,0,401,400,1,0,0,0,
401,402,1,0,0,0,402,409,1,0,0,0,403,404,3,52,26,0,404,406,7,3,0,0,405,407,
3,54,27,0,406,405,1,0,0,0,406,407,1,0,0,0,407,409,1,0,0,0,408,396,1,0,0,
0,408,403,1,0,0,0,409,63,1,0,0,0,410,411,5,64,0,0,411,65,1,0,0,0,412,413,
7,0,0,0,413,67,1,0,0,0,414,415,7,0,0,0,415,69,1,0,0,0,416,427,3,102,51,0,
417,422,5,56,0,0,418,419,5,28,0,0,419,421,5,56,0,0,420,418,1,0,0,0,421,424,
1,0,0,0,422,420,1,0,0,0,422,423,1,0,0,0,423,427,1,0,0,0,424,422,1,0,0,0,
425,427,5,59,0,0,426,416,1,0,0,0,426,417,1,0,0,0,426,425,1,0,0,0,427,71,
1,0,0,0,428,429,7,0,0,0,429,73,1,0,0,0,430,435,3,76,38,0,431,432,5,28,0,
0,432,434,3,76,38,0,433,431,1,0,0,0,434,437,1,0,0,0,435,433,1,0,0,0,435,
436,1,0,0,0,436,439,1,0,0,0,437,435,1,0,0,0,438,440,5,28,0,0,439,438,1,0,
0,0,439,440,1,0,0,0,440,75,1,0,0,0,441,444,3,78,39,0,442,444,3,100,50,0,
443,441,1,0,0,0,443,442,1,0,0,0,444,77,1,0,0,0,445,446,3,68,34,0,446,447,
5,56,0,0,447,79,1,0,0,0,448,452,3,82,41,0,449,451,3,84,42,0,450,449,1,0,
0,0,451,454,1,0,0,0,452,450,1,0,0,0,452,453,1,0,0,0,453,456,1,0,0,0,454,
452,1,0,0,0,455,457,3,86,43,0,456,455,1,0,0,0,456,457,1,0,0,0,457,81,1,0,
0,0,458,459,5,48,0,0,459,460,3,96,48,0,460,83,1,0,0,0,461,463,5,49,0,0,462,
464,3,58,29,0,463,462,1,0,0,0,463,464,1,0,0,0,464,465,1,0,0,0,465,466,3,
96,48,0,466,85,1,0,0,0,467,468,5,50,0,0,468,469,3,96,48,0,469,87,1,0,0,0,
470,474,3,90,45,0,471,473,3,92,46,0,472,471,1,0,0,0,473,476,1,0,0,0,474,
472,1,0,0,0,474,475,1,0,0,0,475,478,1,0,0,0,476,474,1,0,0,0,477,479,3,94,
47,0,478,477,1,0,0,0,478,479,1,0,0,0,479,89,1,0,0,0,480,481,5,37,0,0,481,
482,3,104,52,0,482,483,3,96,48,0,483,91,1,0,0,0,484,485,5,38,0,0,485,486,
5,37,0,0,486,487,3,104,52,0,487,488,3,96,48,0,488,93,1,0,0,0,489,490,5,38,
0,0,490,491,3,96,48,0,491,95,1,0,0,0,492,494,5,32,0,0,493,495,3,24,12,0,
494,493,1,0,0,0,494,495,1,0,0,0,495,496,1,0,0,0,496,497,5,33,0,0,497,97,
1,0,0,0,498,499,5,39,0,0,499,500,3,104,52,0,500,501,3,96,48,0,501,506,1,
0,0,0,502,503,5,39,0,0,503,506,3,104,52,0,504,506,5,39,0,0,505,498,1,0,0,
0,505,502,1,0,0,0,505,504,1,0,0,0,506,99,1,0,0,0,507,508,6,50,-1,0,508,528,
3,102,51,0,509,510,5,21,0,0,510,528,3,100,50,13,511,512,5,26,0,0,512,528,
3,100,50,12,513,514,3,54,27,0,514,515,5,55,0,0,515,517,1,0,0,0,516,513,1,
0,0,0,516,517,1,0,0,0,517,518,1,0,0,0,518,528,3,50,25,0,519,528,3,42,21,
0,520,521,5,30,0,0,521,522,3,100,50,0,522,523,5,31,0,0,523,528,1,0,0,0,524,
525,3,60,30,0,525,526,3,100,50,1,526,528,1,0,0,0,527,507,1,0,0,0,527,509,
1,0,0,0,527,511,1,0,0,0,527,516,1,0,0,0,527,519,1,0,0,0,527,520,1,0,0,0,
527,524,1,0,0,0,528,552,1,0,0,0,529,530,10,11,0,0,530,531,7,4,0,0,531,551,
3,100,50,12,532,533,10,10,0,0,533,534,7,5,0,0,534,551,3,100,50,11,535,536,
10,9,0,0,536,537,7,6,0,0,537,551,3,100,50,10,538,539,10,8,0,0,539,540,7,
7,0,0,540,551,3,100,50,9,541,542,10,7,0,0,542,543,5,13,0,0,543,551,3,100,
50,8,544,545,10,6,0,0,545,546,5,12,0,0,546,551,3,100,50,7,547,548,10,5,0,
0,548,549,5,20,0,0,549,551,3,100,50,6,550,529,1,0,0,0,550,532,1,0,0,0,550,
535,1,0,0,0,550,538,1,0,0,0,550,541,1,0,0,0,550,544,1,0,0,0,550,547,1,0,
0,0,551,554,1,0,0,0,552,550,1,0,0,0,552,553,1,0,0,0,553,101,1,0,0,0,554,
552,1,0,0,0,555,561,7,8,0,0,556,561,7,9,0,0,557,561,5,56,0,0,558,561,5,59,
0,0,559,561,5,36,0,0,560,555,1,0,0,0,560,556,1,0,0,0,560,557,1,0,0,0,560,
558,1,0,0,0,560,559,1,0,0,0,561,103,1,0,0,0,562,563,5,30,0,0,563,564,3,106,
53,0,564,565,5,31,0,0,565,572,1,0,0,0,566,567,5,30,0,0,567,572,3,106,53,
0,568,569,5,30,0,0,569,572,5,31,0,0,570,572,5,30,0,0,571,562,1,0,0,0,571,
566,1,0,0,0,571,568,1,0,0,0,571,570,1,0,0,0,572,105,1,0,0,0,573,577,3,102,
51,0,574,577,3,100,50,0,575,577,3,108,54,0,576,573,1,0,0,0,576,574,1,0,0,
0,576,575,1,0,0,0,577,107,1,0,0,0,578,579,5,56,0,0,579,580,5,51,0,0,580,
581,5,56,0,0,581,109,1,0,0,0,84,111,115,121,124,129,133,136,140,142,146,
148,152,156,162,168,173,175,180,183,186,191,194,198,201,204,208,217,221,
223,228,239,243,246,251,253,269,276,281,286,291,294,298,303,306,310,315,
318,324,327,330,333,338,341,346,351,358,363,370,379,383,388,396,401,406,
408,422,426,435,439,443,452,456,463,474,478,494,505,516,527,550,552,560,
571,576];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.PredictionContextCache();

export default class sequenceParser extends antlr4.Parser {

    static grammarFileName = "java-escape";
    static literalNames = [ null, null, "'const'", "'readonly'", "'static'", 
                            "'await'", "'title'", "':'", "'<<'", "'>>'", 
                            "'->'", null, "'||'", "'&&'", "'=='", "'!='", 
                            "'>'", "'<'", "'>='", "'<='", "'+'", "'-'", 
                            "'*'", "'/'", "'%'", "'^'", "'!'", "';'", "','", 
                            "'='", "'('", "')'", "'{'", "'}'", "'true'", 
                            "'false'", null, "'if'", "'else'", null, "'return'", 
                            "'new'", "'par'", "'group'", "'opt'", "'critical'", 
                            null, "'as'", "'try'", "'catch'", "'finally'", 
                            "'in'", null, null, null, "'.'" ];
    static symbolicNames = [ null, "WS", "CONSTANT", "READONLY", "STATIC", 
                             "AWAIT", "TITLE", "COL", "SOPEN", "SCLOSE", 
                             "ARROW", "COLOR", "OR", "AND", "EQ", "NEQ", 
                             "GT", "LT", "GTEQ", "LTEQ", "PLUS", "MINUS", 
                             "MULT", "DIV", "MOD", "POW", "NOT", "SCOL", 
                             "COMMA", "ASSIGN", "OPAR", "CPAR", "OBRACE", 
                             "CBRACE", "TRUE", "FALSE", "NIL", "IF", "ELSE", 
                             "WHILE", "RETURN", "NEW", "PAR", "GROUP", "OPT", 
                             "CRITICAL", "SECTION", "AS", "TRY", "CATCH", 
                             "FINALLY", "IN", "STARTER_LXR", "ANNOTATION_RET", 
                             "ANNOTATION", "DOT", "ID", "INT", "FLOAT", 
                             "STRING", "CR", "COMMENT", "OTHER", "DIVIDER", 
                             "EVENT_PAYLOAD_LXR", "EVENT_END", "TITLE_CONTENT", 
                             "TITLE_END" ];
    static ruleNames = [ "prog", "title", "head", "group", "starterExp", 
                         "starter", "participant", "stereotype", "label", 
                         "participantType", "name", "width", "block", "ret", 
                         "divider", "dividerNote", "stat", "par", "opt", 
                         "critical", "section", "creation", "creationBody", 
                         "message", "messageBody", "func", "from", "to", 
                         "signature", "invocation", "assignment", "asyncMessage", 
                         "content", "construct", "type", "assignee", "methodName", 
                         "parameters", "parameter", "declaration", "tcf", 
                         "tryBlock", "catchBlock", "finallyBlock", "alt", 
                         "ifBlock", "elseIfBlock", "elseBlock", "braceBlock", 
                         "loop", "expr", "atom", "parExpr", "condition", 
                         "inExpr" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = sequenceParser.ruleNames;
        this.literalNames = sequenceParser.literalNames;
        this.symbolicNames = sequenceParser.symbolicNames;
    }

    get atn() {
        return atn;
    }

    sempred(localctx, ruleIndex, predIndex) {
    	switch(ruleIndex) {
    	case 50:
    	    		return this.expr_sempred(localctx, predIndex);
        default:
            throw "No predicate with index:" + ruleIndex;
       }
    }

    expr_sempred(localctx, predIndex) {
    	switch(predIndex) {
    		case 0:
    			return this.precpred(this._ctx, 11);
    		case 1:
    			return this.precpred(this._ctx, 10);
    		case 2:
    			return this.precpred(this._ctx, 9);
    		case 3:
    			return this.precpred(this._ctx, 8);
    		case 4:
    			return this.precpred(this._ctx, 7);
    		case 5:
    			return this.precpred(this._ctx, 6);
    		case 6:
    			return this.precpred(this._ctx, 5);
    		default:
    			throw "No predicate with index:" + predIndex;
    	}
    };




	prog() {
	    let localctx = new ProgContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, sequenceParser.RULE_prog);
	    var _la = 0; // Token type
	    try {
	        this.state = 129;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,4,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 111;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===6) {
	                this.state = 110;
	                this.title();
	            }

	            this.state = 113;
	            this.match(sequenceParser.EOF);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 115;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===6) {
	                this.state = 114;
	                this.title();
	            }

	            this.state = 117;
	            this.head();
	            this.state = 118;
	            this.match(sequenceParser.EOF);
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 121;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===6) {
	                this.state = 120;
	                this.title();
	            }

	            this.state = 124;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,3,this._ctx);
	            if(la_===1) {
	                this.state = 123;
	                this.head();

	            }
	            this.state = 126;
	            this.block();
	            this.state = 127;
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
	}



	title() {
	    let localctx = new TitleContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 2, sequenceParser.RULE_title);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 131;
	        this.match(sequenceParser.TITLE);
	        this.state = 133;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===66) {
	            this.state = 132;
	            this.match(sequenceParser.TITLE_CONTENT);
	        }

	        this.state = 136;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===67) {
	            this.state = 135;
	            this.match(sequenceParser.TITLE_END);
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



	head() {
	    let localctx = new HeadContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 4, sequenceParser.RULE_head);
	    try {
	        this.state = 152;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,11,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 140; 
	            this._errHandler.sync(this);
	            var _alt = 1;
	            do {
	            	switch (_alt) {
	            	case 1:
	            		this.state = 140;
	            		this._errHandler.sync(this);
	            		switch(this._input.LA(1)) {
	            		case 43:
	            		    this.state = 138;
	            		    this.group();
	            		    break;
	            		case 8:
	            		case 17:
	            		case 54:
	            		case 56:
	            		case 59:
	            		    this.state = 139;
	            		    this.participant();
	            		    break;
	            		default:
	            		    throw new antlr4.error.NoViableAltException(this);
	            		}
	            		break;
	            	default:
	            		throw new antlr4.error.NoViableAltException(this);
	            	}
	            	this.state = 142; 
	            	this._errHandler.sync(this);
	            	_alt = this._interp.adaptivePredict(this._input,8, this._ctx);
	            } while ( _alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER );
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 148;
	            this._errHandler.sync(this);
	            var _alt = this._interp.adaptivePredict(this._input,10,this._ctx)
	            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	                if(_alt===1) {
	                    this.state = 146;
	                    this._errHandler.sync(this);
	                    switch(this._input.LA(1)) {
	                    case 43:
	                        this.state = 144;
	                        this.group();
	                        break;
	                    case 8:
	                    case 17:
	                    case 54:
	                    case 56:
	                    case 59:
	                        this.state = 145;
	                        this.participant();
	                        break;
	                    default:
	                        throw new antlr4.error.NoViableAltException(this);
	                    } 
	                }
	                this.state = 150;
	                this._errHandler.sync(this);
	                _alt = this._interp.adaptivePredict(this._input,10,this._ctx);
	            }

	            this.state = 151;
	            this.starterExp();
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
	}



	group() {
	    let localctx = new GroupContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, sequenceParser.RULE_group);
	    var _la = 0; // Token type
	    try {
	        this.state = 175;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,16,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 154;
	            this.match(sequenceParser.GROUP);
	            this.state = 156;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===56 || _la===59) {
	                this.state = 155;
	                this.name();
	            }

	            this.state = 158;
	            this.match(sequenceParser.OBRACE);
	            this.state = 162;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while(_la===8 || _la===17 || ((((_la - 54)) & ~0x1f) == 0 && ((1 << (_la - 54)) & 37) !== 0)) {
	                this.state = 159;
	                this.participant();
	                this.state = 164;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	            this.state = 165;
	            this.match(sequenceParser.CBRACE);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 166;
	            this.match(sequenceParser.GROUP);
	            this.state = 168;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===56 || _la===59) {
	                this.state = 167;
	                this.name();
	            }

	            this.state = 170;
	            this.match(sequenceParser.OBRACE);
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 171;
	            this.match(sequenceParser.GROUP);
	            this.state = 173;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,15,this._ctx);
	            if(la_===1) {
	                this.state = 172;
	                this.name();

	            }
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
	}



	starterExp() {
	    let localctx = new StarterExpContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 8, sequenceParser.RULE_starterExp);
	    var _la = 0; // Token type
	    try {
	        this.state = 186;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 52:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 177;
	            this.match(sequenceParser.STARTER_LXR);
	            this.state = 183;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===30) {
	                this.state = 178;
	                this.match(sequenceParser.OPAR);
	                this.state = 180;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	                if(_la===56 || _la===59) {
	                    this.state = 179;
	                    this.starter();
	                }

	                this.state = 182;
	                this.match(sequenceParser.CPAR);
	            }

	            break;
	        case 54:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 185;
	            this.match(sequenceParser.ANNOTATION);
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



	starter() {
	    let localctx = new StarterContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 10, sequenceParser.RULE_starter);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 188;
	        _la = this._input.LA(1);
	        if(!(_la===56 || _la===59)) {
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



	participant() {
	    let localctx = new ParticipantContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 12, sequenceParser.RULE_participant);
	    var _la = 0; // Token type
	    try {
	        this.state = 208;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,25,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 191;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===54) {
	                this.state = 190;
	                this.participantType();
	            }

	            this.state = 194;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===8 || _la===17) {
	                this.state = 193;
	                this.stereotype();
	            }

	            this.state = 196;
	            this.name();
	            this.state = 198;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,22,this._ctx);
	            if(la_===1) {
	                this.state = 197;
	                this.width();

	            }
	            this.state = 201;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===47) {
	                this.state = 200;
	                this.label();
	            }

	            this.state = 204;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===11) {
	                this.state = 203;
	                this.match(sequenceParser.COLOR);
	            }

	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 206;
	            this.stereotype();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 207;
	            this.participantType();
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
	}



	stereotype() {
	    let localctx = new StereotypeContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 14, sequenceParser.RULE_stereotype);
	    var _la = 0; // Token type
	    try {
	        this.state = 223;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,28,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 210;
	            this.match(sequenceParser.SOPEN);
	            this.state = 211;
	            this.name();
	            this.state = 212;
	            this.match(sequenceParser.SCLOSE);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 214;
	            this.match(sequenceParser.SOPEN);
	            this.state = 215;
	            this.name();
	            this.state = 217;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===16) {
	                this.state = 216;
	                this.match(sequenceParser.GT);
	            }

	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 219;
	            _la = this._input.LA(1);
	            if(!(_la===8 || _la===17)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            this.state = 221;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===9 || _la===16) {
	                this.state = 220;
	                _la = this._input.LA(1);
	                if(!(_la===9 || _la===16)) {
	                this._errHandler.recoverInline(this);
	                }
	                else {
	                	this._errHandler.reportMatch(this);
	                    this.consume();
	                }
	            }

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
	}



	label() {
	    let localctx = new LabelContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 16, sequenceParser.RULE_label);
	    try {
	        this.state = 228;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,29,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 225;
	            this.match(sequenceParser.AS);
	            this.state = 226;
	            this.name();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 227;
	            this.match(sequenceParser.AS);
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
	}



	participantType() {
	    let localctx = new ParticipantTypeContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 18, sequenceParser.RULE_participantType);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 230;
	        this.match(sequenceParser.ANNOTATION);
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



	name() {
	    let localctx = new NameContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 20, sequenceParser.RULE_name);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 232;
	        _la = this._input.LA(1);
	        if(!(_la===56 || _la===59)) {
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



	width() {
	    let localctx = new WidthContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 22, sequenceParser.RULE_width);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 234;
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
	}



	block() {
	    let localctx = new BlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 24, sequenceParser.RULE_block);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 237; 
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        do {
	            this.state = 236;
	            this.stat();
	            this.state = 239; 
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        } while(((((_la - 34)) & ~0x1f) == 0 && ((1 << (_la - 34)) & 868769263) !== 0));
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



	ret() {
	    let localctx = new RetContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 26, sequenceParser.RULE_ret);
	    var _la = 0; // Token type
	    try {
	        this.state = 253;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 40:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 241;
	            this.match(sequenceParser.RETURN);
	            this.state = 243;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,31,this._ctx);
	            if(la_===1) {
	                this.state = 242;
	                this.expr(0);

	            }
	            this.state = 246;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===27) {
	                this.state = 245;
	                this.match(sequenceParser.SCOL);
	            }

	            break;
	        case 53:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 248;
	            this.match(sequenceParser.ANNOTATION_RET);
	            this.state = 249;
	            this.asyncMessage();
	            this.state = 251;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===65) {
	                this.state = 250;
	                this.match(sequenceParser.EVENT_END);
	            }

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



	divider() {
	    let localctx = new DividerContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 28, sequenceParser.RULE_divider);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 255;
	        this.dividerNote();
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



	dividerNote() {
	    let localctx = new DividerNoteContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 30, sequenceParser.RULE_dividerNote);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 257;
	        this.match(sequenceParser.DIVIDER);
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



	stat() {
	    let localctx = new StatContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 32, sequenceParser.RULE_stat);
	    var _la = 0; // Token type
	    try {
	        this.state = 276;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,36,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 259;
	            this.alt();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 260;
	            this.par();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 261;
	            this.opt();
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 262;
	            this.critical();
	            break;

	        case 5:
	            this.enterOuterAlt(localctx, 5);
	            this.state = 263;
	            this.section();
	            break;

	        case 6:
	            this.enterOuterAlt(localctx, 6);
	            this.state = 264;
	            this.loop();
	            break;

	        case 7:
	            this.enterOuterAlt(localctx, 7);
	            this.state = 265;
	            this.creation();
	            break;

	        case 8:
	            this.enterOuterAlt(localctx, 8);
	            this.state = 266;
	            this.message();
	            break;

	        case 9:
	            this.enterOuterAlt(localctx, 9);
	            this.state = 267;
	            this.asyncMessage();
	            this.state = 269;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===65) {
	                this.state = 268;
	                this.match(sequenceParser.EVENT_END);
	            }

	            break;

	        case 10:
	            this.enterOuterAlt(localctx, 10);
	            this.state = 271;
	            this.ret();
	            break;

	        case 11:
	            this.enterOuterAlt(localctx, 11);
	            this.state = 272;
	            this.divider();
	            break;

	        case 12:
	            this.enterOuterAlt(localctx, 12);
	            this.state = 273;
	            this.tcf();
	            break;

	        case 13:
	            this.enterOuterAlt(localctx, 13);
	            this.state = 274;
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
	}



	par() {
	    let localctx = new ParContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 34, sequenceParser.RULE_par);
	    try {
	        this.state = 281;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,37,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 278;
	            this.match(sequenceParser.PAR);
	            this.state = 279;
	            this.braceBlock();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 280;
	            this.match(sequenceParser.PAR);
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
	}



	opt() {
	    let localctx = new OptContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 36, sequenceParser.RULE_opt);
	    try {
	        this.state = 286;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,38,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 283;
	            this.match(sequenceParser.OPT);
	            this.state = 284;
	            this.braceBlock();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 285;
	            this.match(sequenceParser.OPT);
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
	}



	critical() {
	    let localctx = new CriticalContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 38, sequenceParser.RULE_critical);
	    var _la = 0; // Token type
	    try {
	        this.state = 298;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,41,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 288;
	            this.match(sequenceParser.CRITICAL);
	            this.state = 294;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===30) {
	                this.state = 289;
	                this.match(sequenceParser.OPAR);
	                this.state = 291;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	                if(((((_la - 34)) & ~0x1f) == 0 && ((1 << (_la - 34)) & 62914567) !== 0)) {
	                    this.state = 290;
	                    this.atom();
	                }

	                this.state = 293;
	                this.match(sequenceParser.CPAR);
	            }

	            this.state = 296;
	            this.braceBlock();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 297;
	            this.match(sequenceParser.CRITICAL);
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
	}



	section() {
	    let localctx = new SectionContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 40, sequenceParser.RULE_section);
	    var _la = 0; // Token type
	    try {
	        this.state = 310;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,44,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 300;
	            this.match(sequenceParser.SECTION);
	            this.state = 306;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===30) {
	                this.state = 301;
	                this.match(sequenceParser.OPAR);
	                this.state = 303;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	                if(((((_la - 34)) & ~0x1f) == 0 && ((1 << (_la - 34)) & 62914567) !== 0)) {
	                    this.state = 302;
	                    this.atom();
	                }

	                this.state = 305;
	                this.match(sequenceParser.CPAR);
	            }

	            this.state = 308;
	            this.braceBlock();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 309;
	            this.match(sequenceParser.SECTION);
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
	}



	creation() {
	    let localctx = new CreationContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 42, sequenceParser.RULE_creation);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 312;
	        this.creationBody();
	        this.state = 315;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,45,this._ctx);
	        if(la_===1) {
	            this.state = 313;
	            this.match(sequenceParser.SCOL);

	        } else if(la_===2) {
	            this.state = 314;
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
	}



	creationBody() {
	    let localctx = new CreationBodyContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 44, sequenceParser.RULE_creationBody);
	    var _la = 0; // Token type
	    try {
	        this.state = 333;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,50,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 318;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(((((_la - 34)) & ~0x1f) == 0 && ((1 << (_la - 34)) & 62914567) !== 0)) {
	                this.state = 317;
	                this.assignment();
	            }

	            this.state = 320;
	            this.match(sequenceParser.NEW);
	            this.state = 321;
	            this.construct();
	            this.state = 327;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,48,this._ctx);
	            if(la_===1) {
	                this.state = 322;
	                this.match(sequenceParser.OPAR);
	                this.state = 324;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	                if((((_la) & ~0x1f) == 0 && ((1 << _la) & 1142947840) !== 0) || ((((_la - 34)) & ~0x1f) == 0 && ((1 << (_la - 34)) & 62914695) !== 0)) {
	                    this.state = 323;
	                    this.parameters();
	                }

	                this.state = 326;
	                this.match(sequenceParser.CPAR);

	            }
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 330;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(((((_la - 34)) & ~0x1f) == 0 && ((1 << (_la - 34)) & 62914567) !== 0)) {
	                this.state = 329;
	                this.assignment();
	            }

	            this.state = 332;
	            this.match(sequenceParser.NEW);
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
	}



	message() {
	    let localctx = new MessageContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 46, sequenceParser.RULE_message);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 335;
	        this.messageBody();
	        this.state = 338;
	        this._errHandler.sync(this);
	        switch (this._input.LA(1)) {
	        case 27:
	        	this.state = 336;
	        	this.match(sequenceParser.SCOL);
	        	break;
	        case 32:
	        	this.state = 337;
	        	this.braceBlock();
	        	break;
	        case -1:
	        case 33:
	        case 34:
	        case 35:
	        case 36:
	        case 37:
	        case 39:
	        case 40:
	        case 41:
	        case 42:
	        case 44:
	        case 45:
	        case 46:
	        case 48:
	        case 53:
	        case 56:
	        case 57:
	        case 58:
	        case 59:
	        case 62:
	        case 63:
	        	break;
	        default:
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
	}



	messageBody() {
	    let localctx = new MessageBodyContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 48, sequenceParser.RULE_messageBody);
	    try {
	        this.state = 363;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,56,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 341;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,52,this._ctx);
	            if(la_===1) {
	                this.state = 340;
	                this.assignment();

	            }
	            this.state = 351;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,54,this._ctx);
	            if(la_===1) {
	                this.state = 346;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,53,this._ctx);
	                if(la_===1) {
	                    this.state = 343;
	                    this.from();
	                    this.state = 344;
	                    this.match(sequenceParser.ARROW);

	                }
	                this.state = 348;
	                this.to();
	                this.state = 349;
	                this.match(sequenceParser.DOT);

	            }
	            this.state = 353;
	            this.func();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 354;
	            this.assignment();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 358;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,55,this._ctx);
	            if(la_===1) {
	                this.state = 355;
	                this.from();
	                this.state = 356;
	                this.match(sequenceParser.ARROW);

	            }
	            this.state = 360;
	            this.to();
	            this.state = 361;
	            this.match(sequenceParser.DOT);
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
	}



	func() {
	    let localctx = new FuncContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 50, sequenceParser.RULE_func);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 365;
	        this.signature();
	        this.state = 370;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,57,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 366;
	                this.match(sequenceParser.DOT);
	                this.state = 367;
	                this.signature(); 
	            }
	            this.state = 372;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,57,this._ctx);
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



	from() {
	    let localctx = new FromContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 52, sequenceParser.RULE_from);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 373;
	        _la = this._input.LA(1);
	        if(!(_la===56 || _la===59)) {
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



	to() {
	    let localctx = new ToContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 54, sequenceParser.RULE_to);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 375;
	        _la = this._input.LA(1);
	        if(!(_la===56 || _la===59)) {
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



	signature() {
	    let localctx = new SignatureContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 56, sequenceParser.RULE_signature);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 377;
	        this.methodName();
	        this.state = 379;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,58,this._ctx);
	        if(la_===1) {
	            this.state = 378;
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
	}



	invocation() {
	    let localctx = new InvocationContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 58, sequenceParser.RULE_invocation);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 381;
	        this.match(sequenceParser.OPAR);
	        this.state = 383;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if((((_la) & ~0x1f) == 0 && ((1 << _la) & 1142947840) !== 0) || ((((_la - 34)) & ~0x1f) == 0 && ((1 << (_la - 34)) & 62914695) !== 0)) {
	            this.state = 382;
	            this.parameters();
	        }

	        this.state = 385;
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
	}



	assignment() {
	    let localctx = new AssignmentContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 60, sequenceParser.RULE_assignment);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 388;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,60,this._ctx);
	        if(la_===1) {
	            this.state = 387;
	            this.type();

	        }
	        this.state = 390;
	        this.assignee();
	        this.state = 391;
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
	}



	asyncMessage() {
	    let localctx = new AsyncMessageContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 62, sequenceParser.RULE_asyncMessage);
	    var _la = 0; // Token type
	    try {
	        this.state = 408;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,64,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 396;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,61,this._ctx);
	            if(la_===1) {
	                this.state = 393;
	                this.from();
	                this.state = 394;
	                this.match(sequenceParser.ARROW);

	            }
	            this.state = 398;
	            this.to();
	            this.state = 399;
	            this.match(sequenceParser.COL);
	            this.state = 401;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===64) {
	                this.state = 400;
	                this.content();
	            }

	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 403;
	            this.from();
	            this.state = 404;
	            _la = this._input.LA(1);
	            if(!(_la===10 || _la===21)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            this.state = 406;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,63,this._ctx);
	            if(la_===1) {
	                this.state = 405;
	                this.to();

	            }
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
	}



	content() {
	    let localctx = new ContentContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 64, sequenceParser.RULE_content);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 410;
	        this.match(sequenceParser.EVENT_PAYLOAD_LXR);
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



	construct() {
	    let localctx = new ConstructContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 66, sequenceParser.RULE_construct);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 412;
	        _la = this._input.LA(1);
	        if(!(_la===56 || _la===59)) {
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



	type() {
	    let localctx = new TypeContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 68, sequenceParser.RULE_type);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 414;
	        _la = this._input.LA(1);
	        if(!(_la===56 || _la===59)) {
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



	assignee() {
	    let localctx = new AssigneeContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 70, sequenceParser.RULE_assignee);
	    var _la = 0; // Token type
	    try {
	        this.state = 426;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,66,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 416;
	            this.atom();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 417;
	            this.match(sequenceParser.ID);
	            this.state = 422;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while(_la===28) {
	                this.state = 418;
	                this.match(sequenceParser.COMMA);
	                this.state = 419;
	                this.match(sequenceParser.ID);
	                this.state = 424;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 425;
	            this.match(sequenceParser.STRING);
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
	}



	methodName() {
	    let localctx = new MethodNameContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 72, sequenceParser.RULE_methodName);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 428;
	        _la = this._input.LA(1);
	        if(!(_la===56 || _la===59)) {
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



	parameters() {
	    let localctx = new ParametersContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 74, sequenceParser.RULE_parameters);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 430;
	        this.parameter();
	        this.state = 435;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,67,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 431;
	                this.match(sequenceParser.COMMA);
	                this.state = 432;
	                this.parameter(); 
	            }
	            this.state = 437;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,67,this._ctx);
	        }

	        this.state = 439;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===28) {
	            this.state = 438;
	            this.match(sequenceParser.COMMA);
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



	parameter() {
	    let localctx = new ParameterContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 76, sequenceParser.RULE_parameter);
	    try {
	        this.state = 443;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,69,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 441;
	            this.declaration();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 442;
	            this.expr(0);
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
	}



	declaration() {
	    let localctx = new DeclarationContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 78, sequenceParser.RULE_declaration);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 445;
	        this.type();
	        this.state = 446;
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
	}



	tcf() {
	    let localctx = new TcfContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 80, sequenceParser.RULE_tcf);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 448;
	        this.tryBlock();
	        this.state = 452;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===49) {
	            this.state = 449;
	            this.catchBlock();
	            this.state = 454;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 456;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===50) {
	            this.state = 455;
	            this.finallyBlock();
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



	tryBlock() {
	    let localctx = new TryBlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 82, sequenceParser.RULE_tryBlock);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 458;
	        this.match(sequenceParser.TRY);
	        this.state = 459;
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
	}



	catchBlock() {
	    let localctx = new CatchBlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 84, sequenceParser.RULE_catchBlock);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 461;
	        this.match(sequenceParser.CATCH);
	        this.state = 463;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===30) {
	            this.state = 462;
	            this.invocation();
	        }

	        this.state = 465;
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
	}



	finallyBlock() {
	    let localctx = new FinallyBlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 86, sequenceParser.RULE_finallyBlock);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 467;
	        this.match(sequenceParser.FINALLY);
	        this.state = 468;
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
	}



	alt() {
	    let localctx = new AltContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 88, sequenceParser.RULE_alt);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 470;
	        this.ifBlock();
	        this.state = 474;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,73,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 471;
	                this.elseIfBlock(); 
	            }
	            this.state = 476;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,73,this._ctx);
	        }

	        this.state = 478;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===38) {
	            this.state = 477;
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
	}



	ifBlock() {
	    let localctx = new IfBlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 90, sequenceParser.RULE_ifBlock);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 480;
	        this.match(sequenceParser.IF);
	        this.state = 481;
	        this.parExpr();
	        this.state = 482;
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
	}



	elseIfBlock() {
	    let localctx = new ElseIfBlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 92, sequenceParser.RULE_elseIfBlock);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 484;
	        this.match(sequenceParser.ELSE);
	        this.state = 485;
	        this.match(sequenceParser.IF);
	        this.state = 486;
	        this.parExpr();
	        this.state = 487;
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
	}



	elseBlock() {
	    let localctx = new ElseBlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 94, sequenceParser.RULE_elseBlock);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 489;
	        this.match(sequenceParser.ELSE);
	        this.state = 490;
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
	}



	braceBlock() {
	    let localctx = new BraceBlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 96, sequenceParser.RULE_braceBlock);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 492;
	        this.match(sequenceParser.OBRACE);
	        this.state = 494;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(((((_la - 34)) & ~0x1f) == 0 && ((1 << (_la - 34)) & 868769263) !== 0)) {
	            this.state = 493;
	            this.block();
	        }

	        this.state = 496;
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
	}



	loop() {
	    let localctx = new LoopContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 98, sequenceParser.RULE_loop);
	    try {
	        this.state = 505;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,76,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 498;
	            this.match(sequenceParser.WHILE);
	            this.state = 499;
	            this.parExpr();
	            this.state = 500;
	            this.braceBlock();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 502;
	            this.match(sequenceParser.WHILE);
	            this.state = 503;
	            this.parExpr();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 504;
	            this.match(sequenceParser.WHILE);
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
	}


	expr(_p) {
		if(_p===undefined) {
		    _p = 0;
		}
	    const _parentctx = this._ctx;
	    const _parentState = this.state;
	    let localctx = new ExprContext(this, this._ctx, _parentState);
	    let _prevctx = localctx;
	    const _startState = 100;
	    this.enterRecursionRule(localctx, 100, sequenceParser.RULE_expr, _p);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 527;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,78,this._ctx);
	        switch(la_) {
	        case 1:
	            localctx = new AtomExprContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;

	            this.state = 508;
	            this.atom();
	            break;

	        case 2:
	            localctx = new UnaryMinusExprContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 509;
	            this.match(sequenceParser.MINUS);
	            this.state = 510;
	            this.expr(13);
	            break;

	        case 3:
	            localctx = new NotExprContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 511;
	            this.match(sequenceParser.NOT);
	            this.state = 512;
	            this.expr(12);
	            break;

	        case 4:
	            localctx = new FuncExprContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 516;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,77,this._ctx);
	            if(la_===1) {
	                this.state = 513;
	                this.to();
	                this.state = 514;
	                this.match(sequenceParser.DOT);

	            }
	            this.state = 518;
	            this.func();
	            break;

	        case 5:
	            localctx = new CreationExprContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 519;
	            this.creation();
	            break;

	        case 6:
	            localctx = new ParenthesizedExprContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 520;
	            this.match(sequenceParser.OPAR);
	            this.state = 521;
	            this.expr(0);
	            this.state = 522;
	            this.match(sequenceParser.CPAR);
	            break;

	        case 7:
	            localctx = new AssignmentExprContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 524;
	            this.assignment();
	            this.state = 525;
	            this.expr(1);
	            break;

	        }
	        this._ctx.stop = this._input.LT(-1);
	        this.state = 552;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,80,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                if(this._parseListeners!==null) {
	                    this.triggerExitRuleEvent();
	                }
	                _prevctx = localctx;
	                this.state = 550;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,79,this._ctx);
	                switch(la_) {
	                case 1:
	                    localctx = new MultiplicationExprContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
	                    this.state = 529;
	                    if (!( this.precpred(this._ctx, 11))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 11)");
	                    }
	                    this.state = 530;
	                    localctx.op = this._input.LT(1);
	                    _la = this._input.LA(1);
	                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & 29360128) !== 0))) {
	                        localctx.op = this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 531;
	                    this.expr(12);
	                    break;

	                case 2:
	                    localctx = new AdditiveExprContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
	                    this.state = 532;
	                    if (!( this.precpred(this._ctx, 10))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 10)");
	                    }
	                    this.state = 533;
	                    localctx.op = this._input.LT(1);
	                    _la = this._input.LA(1);
	                    if(!(_la===20 || _la===21)) {
	                        localctx.op = this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 534;
	                    this.expr(11);
	                    break;

	                case 3:
	                    localctx = new RelationalExprContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
	                    this.state = 535;
	                    if (!( this.precpred(this._ctx, 9))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 9)");
	                    }
	                    this.state = 536;
	                    localctx.op = this._input.LT(1);
	                    _la = this._input.LA(1);
	                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & 983040) !== 0))) {
	                        localctx.op = this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 537;
	                    this.expr(10);
	                    break;

	                case 4:
	                    localctx = new EqualityExprContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
	                    this.state = 538;
	                    if (!( this.precpred(this._ctx, 8))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 8)");
	                    }
	                    this.state = 539;
	                    localctx.op = this._input.LT(1);
	                    _la = this._input.LA(1);
	                    if(!(_la===14 || _la===15)) {
	                        localctx.op = this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 540;
	                    this.expr(9);
	                    break;

	                case 5:
	                    localctx = new AndExprContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
	                    this.state = 541;
	                    if (!( this.precpred(this._ctx, 7))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 7)");
	                    }
	                    this.state = 542;
	                    this.match(sequenceParser.AND);
	                    this.state = 543;
	                    this.expr(8);
	                    break;

	                case 6:
	                    localctx = new OrExprContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
	                    this.state = 544;
	                    if (!( this.precpred(this._ctx, 6))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 6)");
	                    }
	                    this.state = 545;
	                    this.match(sequenceParser.OR);
	                    this.state = 546;
	                    this.expr(7);
	                    break;

	                case 7:
	                    localctx = new PlusExprContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
	                    this.state = 547;
	                    if (!( this.precpred(this._ctx, 5))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 5)");
	                    }
	                    this.state = 548;
	                    this.match(sequenceParser.PLUS);
	                    this.state = 549;
	                    this.expr(6);
	                    break;

	                } 
	            }
	            this.state = 554;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,80,this._ctx);
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
	}



	atom() {
	    let localctx = new AtomContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 102, sequenceParser.RULE_atom);
	    var _la = 0; // Token type
	    try {
	        this.state = 560;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 57:
	        case 58:
	            localctx = new NumberAtomContext(this, localctx);
	            this.enterOuterAlt(localctx, 1);
	            this.state = 555;
	            _la = this._input.LA(1);
	            if(!(_la===57 || _la===58)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            break;
	        case 34:
	        case 35:
	            localctx = new BooleanAtomContext(this, localctx);
	            this.enterOuterAlt(localctx, 2);
	            this.state = 556;
	            _la = this._input.LA(1);
	            if(!(_la===34 || _la===35)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            break;
	        case 56:
	            localctx = new IdAtomContext(this, localctx);
	            this.enterOuterAlt(localctx, 3);
	            this.state = 557;
	            this.match(sequenceParser.ID);
	            break;
	        case 59:
	            localctx = new StringAtomContext(this, localctx);
	            this.enterOuterAlt(localctx, 4);
	            this.state = 558;
	            this.match(sequenceParser.STRING);
	            break;
	        case 36:
	            localctx = new NilAtomContext(this, localctx);
	            this.enterOuterAlt(localctx, 5);
	            this.state = 559;
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
	}



	parExpr() {
	    let localctx = new ParExprContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 104, sequenceParser.RULE_parExpr);
	    try {
	        this.state = 571;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,82,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 562;
	            this.match(sequenceParser.OPAR);
	            this.state = 563;
	            this.condition();
	            this.state = 564;
	            this.match(sequenceParser.CPAR);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 566;
	            this.match(sequenceParser.OPAR);
	            this.state = 567;
	            this.condition();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 568;
	            this.match(sequenceParser.OPAR);
	            this.state = 569;
	            this.match(sequenceParser.CPAR);
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 570;
	            this.match(sequenceParser.OPAR);
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
	}



	condition() {
	    let localctx = new ConditionContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 106, sequenceParser.RULE_condition);
	    try {
	        this.state = 576;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,83,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 573;
	            this.atom();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 574;
	            this.expr(0);
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 575;
	            this.inExpr();
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
	}



	inExpr() {
	    let localctx = new InExprContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 108, sequenceParser.RULE_inExpr);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 578;
	        this.match(sequenceParser.ID);
	        this.state = 579;
	        this.match(sequenceParser.IN);
	        this.state = 580;
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
	}


}

sequenceParser.EOF = antlr4.Token.EOF;
sequenceParser.WS = 1;
sequenceParser.CONSTANT = 2;
sequenceParser.READONLY = 3;
sequenceParser.STATIC = 4;
sequenceParser.AWAIT = 5;
sequenceParser.TITLE = 6;
sequenceParser.COL = 7;
sequenceParser.SOPEN = 8;
sequenceParser.SCLOSE = 9;
sequenceParser.ARROW = 10;
sequenceParser.COLOR = 11;
sequenceParser.OR = 12;
sequenceParser.AND = 13;
sequenceParser.EQ = 14;
sequenceParser.NEQ = 15;
sequenceParser.GT = 16;
sequenceParser.LT = 17;
sequenceParser.GTEQ = 18;
sequenceParser.LTEQ = 19;
sequenceParser.PLUS = 20;
sequenceParser.MINUS = 21;
sequenceParser.MULT = 22;
sequenceParser.DIV = 23;
sequenceParser.MOD = 24;
sequenceParser.POW = 25;
sequenceParser.NOT = 26;
sequenceParser.SCOL = 27;
sequenceParser.COMMA = 28;
sequenceParser.ASSIGN = 29;
sequenceParser.OPAR = 30;
sequenceParser.CPAR = 31;
sequenceParser.OBRACE = 32;
sequenceParser.CBRACE = 33;
sequenceParser.TRUE = 34;
sequenceParser.FALSE = 35;
sequenceParser.NIL = 36;
sequenceParser.IF = 37;
sequenceParser.ELSE = 38;
sequenceParser.WHILE = 39;
sequenceParser.RETURN = 40;
sequenceParser.NEW = 41;
sequenceParser.PAR = 42;
sequenceParser.GROUP = 43;
sequenceParser.OPT = 44;
sequenceParser.CRITICAL = 45;
sequenceParser.SECTION = 46;
sequenceParser.AS = 47;
sequenceParser.TRY = 48;
sequenceParser.CATCH = 49;
sequenceParser.FINALLY = 50;
sequenceParser.IN = 51;
sequenceParser.STARTER_LXR = 52;
sequenceParser.ANNOTATION_RET = 53;
sequenceParser.ANNOTATION = 54;
sequenceParser.DOT = 55;
sequenceParser.ID = 56;
sequenceParser.INT = 57;
sequenceParser.FLOAT = 58;
sequenceParser.STRING = 59;
sequenceParser.CR = 60;
sequenceParser.COMMENT = 61;
sequenceParser.OTHER = 62;
sequenceParser.DIVIDER = 63;
sequenceParser.EVENT_PAYLOAD_LXR = 64;
sequenceParser.EVENT_END = 65;
sequenceParser.TITLE_CONTENT = 66;
sequenceParser.TITLE_END = 67;

sequenceParser.RULE_prog = 0;
sequenceParser.RULE_title = 1;
sequenceParser.RULE_head = 2;
sequenceParser.RULE_group = 3;
sequenceParser.RULE_starterExp = 4;
sequenceParser.RULE_starter = 5;
sequenceParser.RULE_participant = 6;
sequenceParser.RULE_stereotype = 7;
sequenceParser.RULE_label = 8;
sequenceParser.RULE_participantType = 9;
sequenceParser.RULE_name = 10;
sequenceParser.RULE_width = 11;
sequenceParser.RULE_block = 12;
sequenceParser.RULE_ret = 13;
sequenceParser.RULE_divider = 14;
sequenceParser.RULE_dividerNote = 15;
sequenceParser.RULE_stat = 16;
sequenceParser.RULE_par = 17;
sequenceParser.RULE_opt = 18;
sequenceParser.RULE_critical = 19;
sequenceParser.RULE_section = 20;
sequenceParser.RULE_creation = 21;
sequenceParser.RULE_creationBody = 22;
sequenceParser.RULE_message = 23;
sequenceParser.RULE_messageBody = 24;
sequenceParser.RULE_func = 25;
sequenceParser.RULE_from = 26;
sequenceParser.RULE_to = 27;
sequenceParser.RULE_signature = 28;
sequenceParser.RULE_invocation = 29;
sequenceParser.RULE_assignment = 30;
sequenceParser.RULE_asyncMessage = 31;
sequenceParser.RULE_content = 32;
sequenceParser.RULE_construct = 33;
sequenceParser.RULE_type = 34;
sequenceParser.RULE_assignee = 35;
sequenceParser.RULE_methodName = 36;
sequenceParser.RULE_parameters = 37;
sequenceParser.RULE_parameter = 38;
sequenceParser.RULE_declaration = 39;
sequenceParser.RULE_tcf = 40;
sequenceParser.RULE_tryBlock = 41;
sequenceParser.RULE_catchBlock = 42;
sequenceParser.RULE_finallyBlock = 43;
sequenceParser.RULE_alt = 44;
sequenceParser.RULE_ifBlock = 45;
sequenceParser.RULE_elseIfBlock = 46;
sequenceParser.RULE_elseBlock = 47;
sequenceParser.RULE_braceBlock = 48;
sequenceParser.RULE_loop = 49;
sequenceParser.RULE_expr = 50;
sequenceParser.RULE_atom = 51;
sequenceParser.RULE_parExpr = 52;
sequenceParser.RULE_condition = 53;
sequenceParser.RULE_inExpr = 54;

class ProgContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_prog;
    }

	EOF() {
	    return this.getToken(sequenceParser.EOF, 0);
	};

	title() {
	    return this.getTypedRuleContext(TitleContext,0);
	};

	head() {
	    return this.getTypedRuleContext(HeadContext,0);
	};

	block() {
	    return this.getTypedRuleContext(BlockContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterProg(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitProg(this);
		}
	}


}



class TitleContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_title;
    }

	TITLE() {
	    return this.getToken(sequenceParser.TITLE, 0);
	};

	TITLE_CONTENT() {
	    return this.getToken(sequenceParser.TITLE_CONTENT, 0);
	};

	TITLE_END() {
	    return this.getToken(sequenceParser.TITLE_END, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterTitle(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitTitle(this);
		}
	}


}



class HeadContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_head;
    }

	group = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(GroupContext);
	    } else {
	        return this.getTypedRuleContext(GroupContext,i);
	    }
	};

	participant = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ParticipantContext);
	    } else {
	        return this.getTypedRuleContext(ParticipantContext,i);
	    }
	};

	starterExp() {
	    return this.getTypedRuleContext(StarterExpContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterHead(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitHead(this);
		}
	}


}



class GroupContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_group;
    }

	GROUP() {
	    return this.getToken(sequenceParser.GROUP, 0);
	};

	OBRACE() {
	    return this.getToken(sequenceParser.OBRACE, 0);
	};

	CBRACE() {
	    return this.getToken(sequenceParser.CBRACE, 0);
	};

	name() {
	    return this.getTypedRuleContext(NameContext,0);
	};

	participant = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ParticipantContext);
	    } else {
	        return this.getTypedRuleContext(ParticipantContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterGroup(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitGroup(this);
		}
	}


}



class StarterExpContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_starterExp;
    }

	STARTER_LXR() {
	    return this.getToken(sequenceParser.STARTER_LXR, 0);
	};

	OPAR() {
	    return this.getToken(sequenceParser.OPAR, 0);
	};

	CPAR() {
	    return this.getToken(sequenceParser.CPAR, 0);
	};

	starter() {
	    return this.getTypedRuleContext(StarterContext,0);
	};

	ANNOTATION() {
	    return this.getToken(sequenceParser.ANNOTATION, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterStarterExp(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitStarterExp(this);
		}
	}


}



class StarterContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_starter;
    }

	ID() {
	    return this.getToken(sequenceParser.ID, 0);
	};

	STRING() {
	    return this.getToken(sequenceParser.STRING, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterStarter(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitStarter(this);
		}
	}


}



class ParticipantContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_participant;
    }

	name() {
	    return this.getTypedRuleContext(NameContext,0);
	};

	participantType() {
	    return this.getTypedRuleContext(ParticipantTypeContext,0);
	};

	stereotype() {
	    return this.getTypedRuleContext(StereotypeContext,0);
	};

	width() {
	    return this.getTypedRuleContext(WidthContext,0);
	};

	label() {
	    return this.getTypedRuleContext(LabelContext,0);
	};

	COLOR() {
	    return this.getToken(sequenceParser.COLOR, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterParticipant(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitParticipant(this);
		}
	}


}



class StereotypeContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_stereotype;
    }

	SOPEN() {
	    return this.getToken(sequenceParser.SOPEN, 0);
	};

	name() {
	    return this.getTypedRuleContext(NameContext,0);
	};

	SCLOSE() {
	    return this.getToken(sequenceParser.SCLOSE, 0);
	};

	GT() {
	    return this.getToken(sequenceParser.GT, 0);
	};

	LT() {
	    return this.getToken(sequenceParser.LT, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterStereotype(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitStereotype(this);
		}
	}


}



class LabelContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_label;
    }

	AS() {
	    return this.getToken(sequenceParser.AS, 0);
	};

	name() {
	    return this.getTypedRuleContext(NameContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterLabel(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitLabel(this);
		}
	}


}



class ParticipantTypeContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_participantType;
    }

	ANNOTATION() {
	    return this.getToken(sequenceParser.ANNOTATION, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterParticipantType(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitParticipantType(this);
		}
	}


}



class NameContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_name;
    }

	ID() {
	    return this.getToken(sequenceParser.ID, 0);
	};

	STRING() {
	    return this.getToken(sequenceParser.STRING, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterName(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitName(this);
		}
	}


}



class WidthContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_width;
    }

	INT() {
	    return this.getToken(sequenceParser.INT, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterWidth(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitWidth(this);
		}
	}


}



class BlockContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_block;
    }

	stat = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(StatContext);
	    } else {
	        return this.getTypedRuleContext(StatContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterBlock(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitBlock(this);
		}
	}


}



class RetContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_ret;
    }

	RETURN() {
	    return this.getToken(sequenceParser.RETURN, 0);
	};

	expr() {
	    return this.getTypedRuleContext(ExprContext,0);
	};

	SCOL() {
	    return this.getToken(sequenceParser.SCOL, 0);
	};

	ANNOTATION_RET() {
	    return this.getToken(sequenceParser.ANNOTATION_RET, 0);
	};

	asyncMessage() {
	    return this.getTypedRuleContext(AsyncMessageContext,0);
	};

	EVENT_END() {
	    return this.getToken(sequenceParser.EVENT_END, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterRet(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitRet(this);
		}
	}


}



class DividerContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_divider;
    }

	dividerNote() {
	    return this.getTypedRuleContext(DividerNoteContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterDivider(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitDivider(this);
		}
	}


}



class DividerNoteContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_dividerNote;
    }

	DIVIDER() {
	    return this.getToken(sequenceParser.DIVIDER, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterDividerNote(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitDividerNote(this);
		}
	}


}



class StatContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_stat;
        this._OTHER = null; // Token
    }

	alt() {
	    return this.getTypedRuleContext(AltContext,0);
	};

	par() {
	    return this.getTypedRuleContext(ParContext,0);
	};

	opt() {
	    return this.getTypedRuleContext(OptContext,0);
	};

	critical() {
	    return this.getTypedRuleContext(CriticalContext,0);
	};

	section() {
	    return this.getTypedRuleContext(SectionContext,0);
	};

	loop() {
	    return this.getTypedRuleContext(LoopContext,0);
	};

	creation() {
	    return this.getTypedRuleContext(CreationContext,0);
	};

	message() {
	    return this.getTypedRuleContext(MessageContext,0);
	};

	asyncMessage() {
	    return this.getTypedRuleContext(AsyncMessageContext,0);
	};

	EVENT_END() {
	    return this.getToken(sequenceParser.EVENT_END, 0);
	};

	ret() {
	    return this.getTypedRuleContext(RetContext,0);
	};

	divider() {
	    return this.getTypedRuleContext(DividerContext,0);
	};

	tcf() {
	    return this.getTypedRuleContext(TcfContext,0);
	};

	OTHER() {
	    return this.getToken(sequenceParser.OTHER, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterStat(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitStat(this);
		}
	}


}



class ParContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_par;
    }

	PAR() {
	    return this.getToken(sequenceParser.PAR, 0);
	};

	braceBlock() {
	    return this.getTypedRuleContext(BraceBlockContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterPar(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitPar(this);
		}
	}


}



class OptContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_opt;
    }

	OPT() {
	    return this.getToken(sequenceParser.OPT, 0);
	};

	braceBlock() {
	    return this.getTypedRuleContext(BraceBlockContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterOpt(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitOpt(this);
		}
	}


}



class CriticalContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_critical;
    }

	CRITICAL() {
	    return this.getToken(sequenceParser.CRITICAL, 0);
	};

	braceBlock() {
	    return this.getTypedRuleContext(BraceBlockContext,0);
	};

	OPAR() {
	    return this.getToken(sequenceParser.OPAR, 0);
	};

	CPAR() {
	    return this.getToken(sequenceParser.CPAR, 0);
	};

	atom() {
	    return this.getTypedRuleContext(AtomContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterCritical(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitCritical(this);
		}
	}


}



class SectionContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_section;
    }

	SECTION() {
	    return this.getToken(sequenceParser.SECTION, 0);
	};

	braceBlock() {
	    return this.getTypedRuleContext(BraceBlockContext,0);
	};

	OPAR() {
	    return this.getToken(sequenceParser.OPAR, 0);
	};

	CPAR() {
	    return this.getToken(sequenceParser.CPAR, 0);
	};

	atom() {
	    return this.getTypedRuleContext(AtomContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterSection(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitSection(this);
		}
	}


}



class CreationContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_creation;
    }

	creationBody() {
	    return this.getTypedRuleContext(CreationBodyContext,0);
	};

	SCOL() {
	    return this.getToken(sequenceParser.SCOL, 0);
	};

	braceBlock() {
	    return this.getTypedRuleContext(BraceBlockContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterCreation(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitCreation(this);
		}
	}


}



class CreationBodyContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_creationBody;
    }

	NEW() {
	    return this.getToken(sequenceParser.NEW, 0);
	};

	construct() {
	    return this.getTypedRuleContext(ConstructContext,0);
	};

	assignment() {
	    return this.getTypedRuleContext(AssignmentContext,0);
	};

	OPAR() {
	    return this.getToken(sequenceParser.OPAR, 0);
	};

	CPAR() {
	    return this.getToken(sequenceParser.CPAR, 0);
	};

	parameters() {
	    return this.getTypedRuleContext(ParametersContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterCreationBody(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitCreationBody(this);
		}
	}


}



class MessageContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_message;
    }

	messageBody() {
	    return this.getTypedRuleContext(MessageBodyContext,0);
	};

	SCOL() {
	    return this.getToken(sequenceParser.SCOL, 0);
	};

	braceBlock() {
	    return this.getTypedRuleContext(BraceBlockContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterMessage(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitMessage(this);
		}
	}


}



class MessageBodyContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_messageBody;
    }

	func() {
	    return this.getTypedRuleContext(FuncContext,0);
	};

	assignment() {
	    return this.getTypedRuleContext(AssignmentContext,0);
	};

	to() {
	    return this.getTypedRuleContext(ToContext,0);
	};

	DOT() {
	    return this.getToken(sequenceParser.DOT, 0);
	};

	from() {
	    return this.getTypedRuleContext(FromContext,0);
	};

	ARROW() {
	    return this.getToken(sequenceParser.ARROW, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterMessageBody(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitMessageBody(this);
		}
	}


}



class FuncContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_func;
    }

	signature = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(SignatureContext);
	    } else {
	        return this.getTypedRuleContext(SignatureContext,i);
	    }
	};

	DOT = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(sequenceParser.DOT);
	    } else {
	        return this.getToken(sequenceParser.DOT, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterFunc(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitFunc(this);
		}
	}


}



class FromContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_from;
    }

	ID() {
	    return this.getToken(sequenceParser.ID, 0);
	};

	STRING() {
	    return this.getToken(sequenceParser.STRING, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterFrom(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitFrom(this);
		}
	}


}



class ToContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_to;
    }

	ID() {
	    return this.getToken(sequenceParser.ID, 0);
	};

	STRING() {
	    return this.getToken(sequenceParser.STRING, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterTo(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitTo(this);
		}
	}


}



class SignatureContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_signature;
    }

	methodName() {
	    return this.getTypedRuleContext(MethodNameContext,0);
	};

	invocation() {
	    return this.getTypedRuleContext(InvocationContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterSignature(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitSignature(this);
		}
	}


}



class InvocationContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_invocation;
    }

	OPAR() {
	    return this.getToken(sequenceParser.OPAR, 0);
	};

	CPAR() {
	    return this.getToken(sequenceParser.CPAR, 0);
	};

	parameters() {
	    return this.getTypedRuleContext(ParametersContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterInvocation(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitInvocation(this);
		}
	}


}



class AssignmentContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_assignment;
    }

	assignee() {
	    return this.getTypedRuleContext(AssigneeContext,0);
	};

	ASSIGN() {
	    return this.getToken(sequenceParser.ASSIGN, 0);
	};

	type() {
	    return this.getTypedRuleContext(TypeContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterAssignment(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitAssignment(this);
		}
	}


}



class AsyncMessageContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_asyncMessage;
    }

	to() {
	    return this.getTypedRuleContext(ToContext,0);
	};

	COL() {
	    return this.getToken(sequenceParser.COL, 0);
	};

	from() {
	    return this.getTypedRuleContext(FromContext,0);
	};

	ARROW() {
	    return this.getToken(sequenceParser.ARROW, 0);
	};

	content() {
	    return this.getTypedRuleContext(ContentContext,0);
	};

	MINUS() {
	    return this.getToken(sequenceParser.MINUS, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterAsyncMessage(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitAsyncMessage(this);
		}
	}


}



class ContentContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_content;
    }

	EVENT_PAYLOAD_LXR() {
	    return this.getToken(sequenceParser.EVENT_PAYLOAD_LXR, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterContent(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitContent(this);
		}
	}


}



class ConstructContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_construct;
    }

	ID() {
	    return this.getToken(sequenceParser.ID, 0);
	};

	STRING() {
	    return this.getToken(sequenceParser.STRING, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterConstruct(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitConstruct(this);
		}
	}


}



class TypeContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_type;
    }

	ID() {
	    return this.getToken(sequenceParser.ID, 0);
	};

	STRING() {
	    return this.getToken(sequenceParser.STRING, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterType(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitType(this);
		}
	}


}



class AssigneeContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_assignee;
    }

	atom() {
	    return this.getTypedRuleContext(AtomContext,0);
	};

	ID = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(sequenceParser.ID);
	    } else {
	        return this.getToken(sequenceParser.ID, i);
	    }
	};


	COMMA = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(sequenceParser.COMMA);
	    } else {
	        return this.getToken(sequenceParser.COMMA, i);
	    }
	};


	STRING() {
	    return this.getToken(sequenceParser.STRING, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterAssignee(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitAssignee(this);
		}
	}


}



class MethodNameContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_methodName;
    }

	ID() {
	    return this.getToken(sequenceParser.ID, 0);
	};

	STRING() {
	    return this.getToken(sequenceParser.STRING, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterMethodName(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitMethodName(this);
		}
	}


}



class ParametersContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_parameters;
    }

	parameter = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ParameterContext);
	    } else {
	        return this.getTypedRuleContext(ParameterContext,i);
	    }
	};

	COMMA = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(sequenceParser.COMMA);
	    } else {
	        return this.getToken(sequenceParser.COMMA, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterParameters(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitParameters(this);
		}
	}


}



class ParameterContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_parameter;
    }

	declaration() {
	    return this.getTypedRuleContext(DeclarationContext,0);
	};

	expr() {
	    return this.getTypedRuleContext(ExprContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterParameter(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitParameter(this);
		}
	}


}



class DeclarationContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_declaration;
    }

	type() {
	    return this.getTypedRuleContext(TypeContext,0);
	};

	ID() {
	    return this.getToken(sequenceParser.ID, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterDeclaration(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitDeclaration(this);
		}
	}


}



class TcfContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_tcf;
    }

	tryBlock() {
	    return this.getTypedRuleContext(TryBlockContext,0);
	};

	catchBlock = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(CatchBlockContext);
	    } else {
	        return this.getTypedRuleContext(CatchBlockContext,i);
	    }
	};

	finallyBlock() {
	    return this.getTypedRuleContext(FinallyBlockContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterTcf(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitTcf(this);
		}
	}


}



class TryBlockContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_tryBlock;
    }

	TRY() {
	    return this.getToken(sequenceParser.TRY, 0);
	};

	braceBlock() {
	    return this.getTypedRuleContext(BraceBlockContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterTryBlock(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitTryBlock(this);
		}
	}


}



class CatchBlockContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_catchBlock;
    }

	CATCH() {
	    return this.getToken(sequenceParser.CATCH, 0);
	};

	braceBlock() {
	    return this.getTypedRuleContext(BraceBlockContext,0);
	};

	invocation() {
	    return this.getTypedRuleContext(InvocationContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterCatchBlock(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitCatchBlock(this);
		}
	}


}



class FinallyBlockContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_finallyBlock;
    }

	FINALLY() {
	    return this.getToken(sequenceParser.FINALLY, 0);
	};

	braceBlock() {
	    return this.getTypedRuleContext(BraceBlockContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterFinallyBlock(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitFinallyBlock(this);
		}
	}


}



class AltContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_alt;
    }

	ifBlock() {
	    return this.getTypedRuleContext(IfBlockContext,0);
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
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterAlt(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitAlt(this);
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
        this.ruleIndex = sequenceParser.RULE_ifBlock;
    }

	IF() {
	    return this.getToken(sequenceParser.IF, 0);
	};

	parExpr() {
	    return this.getTypedRuleContext(ParExprContext,0);
	};

	braceBlock() {
	    return this.getTypedRuleContext(BraceBlockContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterIfBlock(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
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
        this.ruleIndex = sequenceParser.RULE_elseIfBlock;
    }

	ELSE() {
	    return this.getToken(sequenceParser.ELSE, 0);
	};

	IF() {
	    return this.getToken(sequenceParser.IF, 0);
	};

	parExpr() {
	    return this.getTypedRuleContext(ParExprContext,0);
	};

	braceBlock() {
	    return this.getTypedRuleContext(BraceBlockContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterElseIfBlock(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
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
        this.ruleIndex = sequenceParser.RULE_elseBlock;
    }

	ELSE() {
	    return this.getToken(sequenceParser.ELSE, 0);
	};

	braceBlock() {
	    return this.getTypedRuleContext(BraceBlockContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterElseBlock(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitElseBlock(this);
		}
	}


}



class BraceBlockContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_braceBlock;
    }

	OBRACE() {
	    return this.getToken(sequenceParser.OBRACE, 0);
	};

	CBRACE() {
	    return this.getToken(sequenceParser.CBRACE, 0);
	};

	block() {
	    return this.getTypedRuleContext(BlockContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterBraceBlock(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitBraceBlock(this);
		}
	}


}



class LoopContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_loop;
    }

	WHILE() {
	    return this.getToken(sequenceParser.WHILE, 0);
	};

	parExpr() {
	    return this.getTypedRuleContext(ParExprContext,0);
	};

	braceBlock() {
	    return this.getTypedRuleContext(BraceBlockContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterLoop(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitLoop(this);
		}
	}


}



class ExprContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_expr;
    }


	 
		copyFrom(ctx) {
			super.copyFrom(ctx);
		}

}


class AssignmentExprContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	assignment() {
	    return this.getTypedRuleContext(AssignmentContext,0);
	};

	expr() {
	    return this.getTypedRuleContext(ExprContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterAssignmentExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitAssignmentExpr(this);
		}
	}


}

sequenceParser.AssignmentExprContext = AssignmentExprContext;

class FuncExprContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	func() {
	    return this.getTypedRuleContext(FuncContext,0);
	};

	to() {
	    return this.getTypedRuleContext(ToContext,0);
	};

	DOT() {
	    return this.getToken(sequenceParser.DOT, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterFuncExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitFuncExpr(this);
		}
	}


}

sequenceParser.FuncExprContext = FuncExprContext;

class AtomExprContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	atom() {
	    return this.getTypedRuleContext(AtomContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterAtomExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitAtomExpr(this);
		}
	}


}

sequenceParser.AtomExprContext = AtomExprContext;

class OrExprContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	OR() {
	    return this.getToken(sequenceParser.OR, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterOrExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitOrExpr(this);
		}
	}


}

sequenceParser.OrExprContext = OrExprContext;

class AdditiveExprContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        this.op = null; // Token;
        super.copyFrom(ctx);
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	PLUS() {
	    return this.getToken(sequenceParser.PLUS, 0);
	};

	MINUS() {
	    return this.getToken(sequenceParser.MINUS, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterAdditiveExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitAdditiveExpr(this);
		}
	}


}

sequenceParser.AdditiveExprContext = AdditiveExprContext;

class RelationalExprContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        this.op = null; // Token;
        super.copyFrom(ctx);
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	LTEQ() {
	    return this.getToken(sequenceParser.LTEQ, 0);
	};

	GTEQ() {
	    return this.getToken(sequenceParser.GTEQ, 0);
	};

	LT() {
	    return this.getToken(sequenceParser.LT, 0);
	};

	GT() {
	    return this.getToken(sequenceParser.GT, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterRelationalExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitRelationalExpr(this);
		}
	}


}

sequenceParser.RelationalExprContext = RelationalExprContext;

class PlusExprContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	PLUS() {
	    return this.getToken(sequenceParser.PLUS, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterPlusExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitPlusExpr(this);
		}
	}


}

sequenceParser.PlusExprContext = PlusExprContext;

class NotExprContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	NOT() {
	    return this.getToken(sequenceParser.NOT, 0);
	};

	expr() {
	    return this.getTypedRuleContext(ExprContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterNotExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitNotExpr(this);
		}
	}


}

sequenceParser.NotExprContext = NotExprContext;

class UnaryMinusExprContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	MINUS() {
	    return this.getToken(sequenceParser.MINUS, 0);
	};

	expr() {
	    return this.getTypedRuleContext(ExprContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterUnaryMinusExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitUnaryMinusExpr(this);
		}
	}


}

sequenceParser.UnaryMinusExprContext = UnaryMinusExprContext;

class CreationExprContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	creation() {
	    return this.getTypedRuleContext(CreationContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterCreationExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitCreationExpr(this);
		}
	}


}

sequenceParser.CreationExprContext = CreationExprContext;

class ParenthesizedExprContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	OPAR() {
	    return this.getToken(sequenceParser.OPAR, 0);
	};

	expr() {
	    return this.getTypedRuleContext(ExprContext,0);
	};

	CPAR() {
	    return this.getToken(sequenceParser.CPAR, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterParenthesizedExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitParenthesizedExpr(this);
		}
	}


}

sequenceParser.ParenthesizedExprContext = ParenthesizedExprContext;

class MultiplicationExprContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        this.op = null; // Token;
        super.copyFrom(ctx);
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	MULT() {
	    return this.getToken(sequenceParser.MULT, 0);
	};

	DIV() {
	    return this.getToken(sequenceParser.DIV, 0);
	};

	MOD() {
	    return this.getToken(sequenceParser.MOD, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterMultiplicationExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitMultiplicationExpr(this);
		}
	}


}

sequenceParser.MultiplicationExprContext = MultiplicationExprContext;

class EqualityExprContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        this.op = null; // Token;
        super.copyFrom(ctx);
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	EQ() {
	    return this.getToken(sequenceParser.EQ, 0);
	};

	NEQ() {
	    return this.getToken(sequenceParser.NEQ, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterEqualityExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitEqualityExpr(this);
		}
	}


}

sequenceParser.EqualityExprContext = EqualityExprContext;

class AndExprContext extends ExprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	AND() {
	    return this.getToken(sequenceParser.AND, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterAndExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitAndExpr(this);
		}
	}


}

sequenceParser.AndExprContext = AndExprContext;

class AtomContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_atom;
    }


	 
		copyFrom(ctx) {
			super.copyFrom(ctx);
		}

}


class BooleanAtomContext extends AtomContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	TRUE() {
	    return this.getToken(sequenceParser.TRUE, 0);
	};

	FALSE() {
	    return this.getToken(sequenceParser.FALSE, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterBooleanAtom(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitBooleanAtom(this);
		}
	}


}

sequenceParser.BooleanAtomContext = BooleanAtomContext;

class IdAtomContext extends AtomContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	ID() {
	    return this.getToken(sequenceParser.ID, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterIdAtom(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitIdAtom(this);
		}
	}


}

sequenceParser.IdAtomContext = IdAtomContext;

class StringAtomContext extends AtomContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	STRING() {
	    return this.getToken(sequenceParser.STRING, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterStringAtom(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitStringAtom(this);
		}
	}


}

sequenceParser.StringAtomContext = StringAtomContext;

class NilAtomContext extends AtomContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	NIL() {
	    return this.getToken(sequenceParser.NIL, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterNilAtom(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitNilAtom(this);
		}
	}


}

sequenceParser.NilAtomContext = NilAtomContext;

class NumberAtomContext extends AtomContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	INT() {
	    return this.getToken(sequenceParser.INT, 0);
	};

	FLOAT() {
	    return this.getToken(sequenceParser.FLOAT, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterNumberAtom(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitNumberAtom(this);
		}
	}


}

sequenceParser.NumberAtomContext = NumberAtomContext;

class ParExprContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_parExpr;
    }

	OPAR() {
	    return this.getToken(sequenceParser.OPAR, 0);
	};

	condition() {
	    return this.getTypedRuleContext(ConditionContext,0);
	};

	CPAR() {
	    return this.getToken(sequenceParser.CPAR, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterParExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitParExpr(this);
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
        this.ruleIndex = sequenceParser.RULE_condition;
    }

	atom() {
	    return this.getTypedRuleContext(AtomContext,0);
	};

	expr() {
	    return this.getTypedRuleContext(ExprContext,0);
	};

	inExpr() {
	    return this.getTypedRuleContext(InExprContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterCondition(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitCondition(this);
		}
	}


}



class InExprContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_inExpr;
    }

	ID = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(sequenceParser.ID);
	    } else {
	        return this.getToken(sequenceParser.ID, i);
	    }
	};


	IN() {
	    return this.getToken(sequenceParser.IN, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterInExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitInExpr(this);
		}
	}


}




sequenceParser.ProgContext = ProgContext; 
sequenceParser.TitleContext = TitleContext; 
sequenceParser.HeadContext = HeadContext; 
sequenceParser.GroupContext = GroupContext; 
sequenceParser.StarterExpContext = StarterExpContext; 
sequenceParser.StarterContext = StarterContext; 
sequenceParser.ParticipantContext = ParticipantContext; 
sequenceParser.StereotypeContext = StereotypeContext; 
sequenceParser.LabelContext = LabelContext; 
sequenceParser.ParticipantTypeContext = ParticipantTypeContext; 
sequenceParser.NameContext = NameContext; 
sequenceParser.WidthContext = WidthContext; 
sequenceParser.BlockContext = BlockContext; 
sequenceParser.RetContext = RetContext; 
sequenceParser.DividerContext = DividerContext; 
sequenceParser.DividerNoteContext = DividerNoteContext; 
sequenceParser.StatContext = StatContext; 
sequenceParser.ParContext = ParContext; 
sequenceParser.OptContext = OptContext; 
sequenceParser.CriticalContext = CriticalContext; 
sequenceParser.SectionContext = SectionContext; 
sequenceParser.CreationContext = CreationContext; 
sequenceParser.CreationBodyContext = CreationBodyContext; 
sequenceParser.MessageContext = MessageContext; 
sequenceParser.MessageBodyContext = MessageBodyContext; 
sequenceParser.FuncContext = FuncContext; 
sequenceParser.FromContext = FromContext; 
sequenceParser.ToContext = ToContext; 
sequenceParser.SignatureContext = SignatureContext; 
sequenceParser.InvocationContext = InvocationContext; 
sequenceParser.AssignmentContext = AssignmentContext; 
sequenceParser.AsyncMessageContext = AsyncMessageContext; 
sequenceParser.ContentContext = ContentContext; 
sequenceParser.ConstructContext = ConstructContext; 
sequenceParser.TypeContext = TypeContext; 
sequenceParser.AssigneeContext = AssigneeContext; 
sequenceParser.MethodNameContext = MethodNameContext; 
sequenceParser.ParametersContext = ParametersContext; 
sequenceParser.ParameterContext = ParameterContext; 
sequenceParser.DeclarationContext = DeclarationContext; 
sequenceParser.TcfContext = TcfContext; 
sequenceParser.TryBlockContext = TryBlockContext; 
sequenceParser.CatchBlockContext = CatchBlockContext; 
sequenceParser.FinallyBlockContext = FinallyBlockContext; 
sequenceParser.AltContext = AltContext; 
sequenceParser.IfBlockContext = IfBlockContext; 
sequenceParser.ElseIfBlockContext = ElseIfBlockContext; 
sequenceParser.ElseBlockContext = ElseBlockContext; 
sequenceParser.BraceBlockContext = BraceBlockContext; 
sequenceParser.LoopContext = LoopContext; 
sequenceParser.ExprContext = ExprContext; 
sequenceParser.AtomContext = AtomContext; 
sequenceParser.ParExprContext = ParExprContext; 
sequenceParser.ConditionContext = ConditionContext; 
sequenceParser.InExprContext = InExprContext; 
