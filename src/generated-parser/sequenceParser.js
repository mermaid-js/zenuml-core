// Generated from java-escape by ANTLR 4.11.1
// jshint ignore: start
import antlr4 from 'antlr4';
import sequenceParserListener from './sequenceParserListener.js';
const serializedATN = [4,1,81,669,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,
4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,10,7,10,2,11,7,11,2,12,7,12,
2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,7,17,2,18,7,18,2,19,7,19,2,
20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,24,2,25,7,25,2,26,7,26,2,27,
7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,2,32,7,32,2,33,7,33,2,34,7,
34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,2,39,7,39,2,40,7,40,2,41,7,41,
2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,45,2,46,7,46,2,47,7,47,2,48,7,48,2,
49,7,49,2,50,7,50,2,51,7,51,2,52,7,52,2,53,7,53,2,54,7,54,2,55,7,55,2,56,
7,56,2,57,7,57,2,58,7,58,2,59,7,59,2,60,7,60,1,0,3,0,124,8,0,1,0,1,0,3,0,
128,8,0,1,0,1,0,1,0,1,0,3,0,134,8,0,1,0,3,0,137,8,0,1,0,1,0,1,0,3,0,142,
8,0,1,1,1,1,3,1,146,8,1,1,1,3,1,149,8,1,1,2,1,2,4,2,153,8,2,11,2,12,2,154,
1,2,1,2,5,2,159,8,2,10,2,12,2,162,9,2,1,2,3,2,165,8,2,1,3,1,3,3,3,169,8,
3,1,3,1,3,5,3,173,8,3,10,3,12,3,176,9,3,1,3,3,3,179,8,3,3,3,181,8,3,1,4,
1,4,1,4,3,4,186,8,4,1,4,1,4,3,4,190,8,4,3,4,192,8,4,1,4,3,4,195,8,4,1,5,
1,5,1,6,3,6,200,8,6,1,6,3,6,203,8,6,1,6,3,6,206,8,6,1,6,1,6,3,6,210,8,6,
1,6,3,6,213,8,6,1,6,3,6,216,8,6,1,6,1,6,3,6,220,8,6,1,7,1,7,4,7,224,8,7,
11,7,12,7,225,1,7,1,7,1,7,1,7,1,7,3,7,233,8,7,1,7,1,7,3,7,237,8,7,3,7,239,
8,7,1,8,1,8,1,8,3,8,244,8,8,1,9,1,9,1,10,1,10,1,11,1,11,1,12,1,12,1,12,1,
12,1,12,3,12,257,8,12,1,13,4,13,260,8,13,11,13,12,13,261,1,14,1,14,3,14,
266,8,14,1,14,3,14,269,8,14,1,14,1,14,1,14,3,14,274,8,14,1,14,1,14,3,14,
278,8,14,3,14,280,8,14,1,15,1,15,1,15,1,15,1,15,3,15,287,8,15,1,15,1,15,
1,15,3,15,292,8,15,3,15,294,8,15,1,16,1,16,1,17,1,17,1,18,1,18,1,18,1,18,
1,18,1,18,1,18,1,18,1,18,1,18,1,18,3,18,311,8,18,1,18,1,18,1,18,3,18,316,
8,18,1,19,1,19,3,19,320,8,19,1,19,3,19,323,8,19,1,20,1,20,3,20,327,8,20,
1,20,3,20,330,8,20,1,21,1,21,3,21,334,8,21,1,21,3,21,337,8,21,1,22,1,22,
1,22,3,22,342,8,22,1,22,3,22,345,8,22,1,22,3,22,348,8,22,1,22,3,22,351,8,
22,1,23,1,23,1,23,3,23,356,8,23,1,24,1,24,1,24,1,24,1,24,5,24,363,8,24,10,
24,12,24,366,9,24,5,24,368,8,24,10,24,12,24,371,9,24,1,24,1,24,3,24,375,
8,24,1,25,3,25,378,8,25,1,25,1,25,1,25,1,25,3,25,384,8,25,1,25,3,25,387,
8,25,1,25,3,25,390,8,25,1,25,3,25,393,8,25,1,26,1,26,1,26,3,26,398,8,26,
1,27,1,27,1,27,1,27,3,27,404,8,27,1,27,1,27,1,27,3,27,409,8,27,1,27,1,27,
1,27,3,27,414,8,27,1,27,1,27,3,27,418,8,27,1,28,1,28,1,28,3,28,423,8,28,
1,28,1,28,1,28,1,29,1,29,1,29,5,29,431,8,29,10,29,12,29,434,9,29,1,30,3,
30,437,8,30,1,30,1,30,1,31,3,31,442,8,31,1,31,1,31,1,32,1,32,3,32,448,8,
32,1,33,1,33,3,33,452,8,33,1,33,1,33,1,34,3,34,457,8,34,1,34,1,34,1,34,1,
35,1,35,1,35,3,35,465,8,35,1,35,1,35,1,35,3,35,470,8,35,1,35,1,35,1,35,3,
35,475,8,35,3,35,477,8,35,1,36,1,36,1,37,1,37,1,38,1,38,1,39,1,39,1,39,1,
39,5,39,489,8,39,10,39,12,39,492,9,39,1,39,1,39,1,39,3,39,497,8,39,1,40,
3,40,500,8,40,1,40,1,40,1,41,1,41,1,41,5,41,507,8,41,10,41,12,41,510,9,41,
1,41,3,41,513,8,41,1,42,1,42,1,42,3,42,518,8,42,1,43,1,43,1,43,3,43,523,
8,43,1,44,1,44,1,44,1,45,1,45,5,45,530,8,45,10,45,12,45,533,9,45,1,45,3,
45,536,8,45,1,46,1,46,1,46,1,47,1,47,3,47,543,8,47,1,47,1,47,1,48,1,48,1,
48,1,49,1,49,5,49,552,8,49,10,49,12,49,555,9,49,1,49,3,49,558,8,49,1,50,
1,50,1,50,3,50,563,8,50,1,51,1,51,1,51,1,51,3,51,569,8,51,1,52,1,52,3,52,
573,8,52,1,53,1,53,3,53,577,8,53,1,53,1,53,1,54,1,54,3,54,583,8,54,1,54,
3,54,586,8,54,1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,3,55,597,8,55,
1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,3,55,608,8,55,1,55,1,55,1,55,
1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,
55,1,55,1,55,1,55,5,55,631,8,55,10,55,12,55,634,9,55,1,56,1,56,1,56,1,56,
1,56,1,56,1,56,1,56,3,56,644,8,56,1,57,1,57,3,57,648,8,57,1,57,3,57,651,
8,57,1,58,1,58,1,58,1,58,1,58,3,58,658,8,58,1,59,1,59,1,59,1,59,1,60,4,60,
665,8,60,11,60,12,60,666,1,60,0,1,110,61,0,2,4,6,8,10,12,14,16,18,20,22,
24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,68,70,
72,74,76,78,80,82,84,86,88,90,92,94,96,98,100,102,104,106,108,110,112,114,
116,118,120,0,13,2,0,8,8,20,20,2,0,9,9,19,19,2,0,62,62,67,69,2,0,11,11,24,
24,2,0,62,62,67,67,1,0,25,27,1,0,23,24,1,0,19,22,1,0,17,18,1,0,63,64,1,0,
37,38,1,0,68,69,2,0,62,64,66,67,755,0,141,1,0,0,0,2,143,1,0,0,0,4,164,1,
0,0,0,6,166,1,0,0,0,8,194,1,0,0,0,10,196,1,0,0,0,12,219,1,0,0,0,14,238,1,
0,0,0,16,243,1,0,0,0,18,245,1,0,0,0,20,247,1,0,0,0,22,249,1,0,0,0,24,256,
1,0,0,0,26,259,1,0,0,0,28,279,1,0,0,0,30,293,1,0,0,0,32,295,1,0,0,0,34,297,
1,0,0,0,36,315,1,0,0,0,38,317,1,0,0,0,40,324,1,0,0,0,42,331,1,0,0,0,44,350,
1,0,0,0,46,352,1,0,0,0,48,357,1,0,0,0,50,392,1,0,0,0,52,394,1,0,0,0,54,417,
1,0,0,0,56,422,1,0,0,0,58,427,1,0,0,0,60,436,1,0,0,0,62,441,1,0,0,0,64,445,
1,0,0,0,66,449,1,0,0,0,68,456,1,0,0,0,70,476,1,0,0,0,72,478,1,0,0,0,74,480,
1,0,0,0,76,482,1,0,0,0,78,496,1,0,0,0,80,499,1,0,0,0,82,503,1,0,0,0,84,517,
1,0,0,0,86,519,1,0,0,0,88,524,1,0,0,0,90,527,1,0,0,0,92,537,1,0,0,0,94,540,
1,0,0,0,96,546,1,0,0,0,98,549,1,0,0,0,100,559,1,0,0,0,102,564,1,0,0,0,104,
570,1,0,0,0,106,574,1,0,0,0,108,580,1,0,0,0,110,607,1,0,0,0,112,643,1,0,
0,0,114,645,1,0,0,0,116,657,1,0,0,0,118,659,1,0,0,0,120,664,1,0,0,0,122,
124,3,2,1,0,123,122,1,0,0,0,123,124,1,0,0,0,124,125,1,0,0,0,125,142,5,0,
0,1,126,128,3,2,1,0,127,126,1,0,0,0,127,128,1,0,0,0,128,129,1,0,0,0,129,
130,3,4,2,0,130,131,5,0,0,1,131,142,1,0,0,0,132,134,3,2,1,0,133,132,1,0,
0,0,133,134,1,0,0,0,134,136,1,0,0,0,135,137,3,4,2,0,136,135,1,0,0,0,136,
137,1,0,0,0,137,138,1,0,0,0,138,139,3,26,13,0,139,140,5,0,0,1,140,142,1,
0,0,0,141,123,1,0,0,0,141,127,1,0,0,0,141,133,1,0,0,0,142,1,1,0,0,0,143,
145,5,6,0,0,144,146,5,79,0,0,145,144,1,0,0,0,145,146,1,0,0,0,146,148,1,0,
0,0,147,149,5,80,0,0,148,147,1,0,0,0,148,149,1,0,0,0,149,3,1,0,0,0,150,153,
3,6,3,0,151,153,3,12,6,0,152,150,1,0,0,0,152,151,1,0,0,0,153,154,1,0,0,0,
154,152,1,0,0,0,154,155,1,0,0,0,155,165,1,0,0,0,156,159,3,6,3,0,157,159,
3,12,6,0,158,156,1,0,0,0,158,157,1,0,0,0,159,162,1,0,0,0,160,158,1,0,0,0,
160,161,1,0,0,0,161,163,1,0,0,0,162,160,1,0,0,0,163,165,3,8,4,0,164,152,
1,0,0,0,164,160,1,0,0,0,165,5,1,0,0,0,166,168,5,46,0,0,167,169,3,20,10,0,
168,167,1,0,0,0,168,169,1,0,0,0,169,180,1,0,0,0,170,174,5,35,0,0,171,173,
3,12,6,0,172,171,1,0,0,0,173,176,1,0,0,0,174,172,1,0,0,0,174,175,1,0,0,0,
175,178,1,0,0,0,176,174,1,0,0,0,177,179,5,36,0,0,178,177,1,0,0,0,178,179,
1,0,0,0,179,181,1,0,0,0,180,170,1,0,0,0,180,181,1,0,0,0,181,7,1,0,0,0,182,
191,5,57,0,0,183,185,5,33,0,0,184,186,3,10,5,0,185,184,1,0,0,0,185,186,1,
0,0,0,186,189,1,0,0,0,187,190,5,34,0,0,188,190,6,4,-1,0,189,187,1,0,0,0,
189,188,1,0,0,0,190,192,1,0,0,0,191,183,1,0,0,0,191,192,1,0,0,0,192,195,
1,0,0,0,193,195,5,59,0,0,194,182,1,0,0,0,194,193,1,0,0,0,195,9,1,0,0,0,196,
197,3,20,10,0,197,11,1,0,0,0,198,200,3,18,9,0,199,198,1,0,0,0,199,200,1,
0,0,0,200,202,1,0,0,0,201,203,3,14,7,0,202,201,1,0,0,0,202,203,1,0,0,0,203,
205,1,0,0,0,204,206,3,24,12,0,205,204,1,0,0,0,205,206,1,0,0,0,206,207,1,
0,0,0,207,209,3,20,10,0,208,210,3,22,11,0,209,208,1,0,0,0,209,210,1,0,0,
0,210,212,1,0,0,0,211,213,3,16,8,0,212,211,1,0,0,0,212,213,1,0,0,0,213,215,
1,0,0,0,214,216,5,12,0,0,215,214,1,0,0,0,215,216,1,0,0,0,216,220,1,0,0,0,
217,220,3,14,7,0,218,220,3,18,9,0,219,199,1,0,0,0,219,217,1,0,0,0,219,218,
1,0,0,0,220,13,1,0,0,0,221,223,5,8,0,0,222,224,3,20,10,0,223,222,1,0,0,0,
224,225,1,0,0,0,225,223,1,0,0,0,225,226,1,0,0,0,226,227,1,0,0,0,227,228,
5,9,0,0,228,239,1,0,0,0,229,230,5,8,0,0,230,232,3,20,10,0,231,233,5,19,0,
0,232,231,1,0,0,0,232,233,1,0,0,0,233,239,1,0,0,0,234,236,7,0,0,0,235,237,
7,1,0,0,236,235,1,0,0,0,236,237,1,0,0,0,237,239,1,0,0,0,238,221,1,0,0,0,
238,229,1,0,0,0,238,234,1,0,0,0,239,15,1,0,0,0,240,241,5,51,0,0,241,244,
3,20,10,0,242,244,5,51,0,0,243,240,1,0,0,0,243,242,1,0,0,0,244,17,1,0,0,
0,245,246,5,59,0,0,246,19,1,0,0,0,247,248,7,2,0,0,248,21,1,0,0,0,249,250,
5,63,0,0,250,23,1,0,0,0,251,252,5,13,0,0,252,253,3,20,10,0,253,254,5,14,
0,0,254,257,1,0,0,0,255,257,5,81,0,0,256,251,1,0,0,0,256,255,1,0,0,0,257,
25,1,0,0,0,258,260,3,36,18,0,259,258,1,0,0,0,260,261,1,0,0,0,261,259,1,0,
0,0,261,262,1,0,0,0,262,27,1,0,0,0,263,265,5,43,0,0,264,266,3,110,55,0,265,
264,1,0,0,0,265,266,1,0,0,0,266,268,1,0,0,0,267,269,5,30,0,0,268,267,1,0,
0,0,268,269,1,0,0,0,269,280,1,0,0,0,270,271,5,58,0,0,271,273,3,70,35,0,272,
274,5,78,0,0,273,272,1,0,0,0,273,274,1,0,0,0,274,280,1,0,0,0,275,277,3,30,
15,0,276,278,5,78,0,0,277,276,1,0,0,0,277,278,1,0,0,0,278,280,1,0,0,0,279,
263,1,0,0,0,279,270,1,0,0,0,279,275,1,0,0,0,280,29,1,0,0,0,281,282,3,60,
30,0,282,283,5,10,0,0,283,284,3,62,31,0,284,286,5,7,0,0,285,287,3,72,36,
0,286,285,1,0,0,0,286,287,1,0,0,0,287,294,1,0,0,0,288,289,3,60,30,0,289,
291,5,10,0,0,290,292,3,62,31,0,291,290,1,0,0,0,291,292,1,0,0,0,292,294,1,
0,0,0,293,281,1,0,0,0,293,288,1,0,0,0,294,31,1,0,0,0,295,296,3,34,17,0,296,
33,1,0,0,0,297,298,5,76,0,0,298,35,1,0,0,0,299,316,3,98,49,0,300,316,3,38,
19,0,301,316,3,40,20,0,302,316,3,42,21,0,303,316,3,44,22,0,304,316,3,48,
24,0,305,316,3,108,54,0,306,316,3,46,23,0,307,316,3,52,26,0,308,310,3,70,
35,0,309,311,5,78,0,0,310,309,1,0,0,0,310,311,1,0,0,0,311,316,1,0,0,0,312,
316,3,28,14,0,313,316,3,32,16,0,314,316,3,90,45,0,315,299,1,0,0,0,315,300,
1,0,0,0,315,301,1,0,0,0,315,302,1,0,0,0,315,303,1,0,0,0,315,304,1,0,0,0,
315,305,1,0,0,0,315,306,1,0,0,0,315,307,1,0,0,0,315,308,1,0,0,0,315,312,
1,0,0,0,315,313,1,0,0,0,315,314,1,0,0,0,316,37,1,0,0,0,317,322,5,45,0,0,
318,320,3,114,57,0,319,318,1,0,0,0,319,320,1,0,0,0,320,321,1,0,0,0,321,323,
3,106,53,0,322,319,1,0,0,0,322,323,1,0,0,0,323,39,1,0,0,0,324,329,5,47,0,
0,325,327,3,114,57,0,326,325,1,0,0,0,326,327,1,0,0,0,327,328,1,0,0,0,328,
330,3,106,53,0,329,326,1,0,0,0,329,330,1,0,0,0,330,41,1,0,0,0,331,336,5,
48,0,0,332,334,3,114,57,0,333,332,1,0,0,0,333,334,1,0,0,0,334,335,1,0,0,
0,335,337,3,106,53,0,336,333,1,0,0,0,336,337,1,0,0,0,337,43,1,0,0,0,338,
347,5,49,0,0,339,341,5,33,0,0,340,342,3,112,56,0,341,340,1,0,0,0,341,342,
1,0,0,0,342,343,1,0,0,0,343,345,5,34,0,0,344,339,1,0,0,0,344,345,1,0,0,0,
345,346,1,0,0,0,346,348,3,106,53,0,347,344,1,0,0,0,347,348,1,0,0,0,348,351,
1,0,0,0,349,351,3,106,53,0,350,338,1,0,0,0,350,349,1,0,0,0,351,45,1,0,0,
0,352,355,3,50,25,0,353,356,5,30,0,0,354,356,3,106,53,0,355,353,1,0,0,0,
355,354,1,0,0,0,355,356,1,0,0,0,356,47,1,0,0,0,357,358,5,50,0,0,358,359,
5,33,0,0,359,369,3,20,10,0,360,364,5,31,0,0,361,363,3,20,10,0,362,361,1,
0,0,0,363,366,1,0,0,0,364,362,1,0,0,0,364,365,1,0,0,0,365,368,1,0,0,0,366,
364,1,0,0,0,367,360,1,0,0,0,368,371,1,0,0,0,369,367,1,0,0,0,369,370,1,0,
0,0,370,372,1,0,0,0,371,369,1,0,0,0,372,374,5,34,0,0,373,375,5,30,0,0,374,
373,1,0,0,0,374,375,1,0,0,0,375,49,1,0,0,0,376,378,3,68,34,0,377,376,1,0,
0,0,377,378,1,0,0,0,378,379,1,0,0,0,379,380,5,44,0,0,380,386,3,74,37,0,381,
383,5,33,0,0,382,384,3,82,41,0,383,382,1,0,0,0,383,384,1,0,0,0,384,385,1,
0,0,0,385,387,5,34,0,0,386,381,1,0,0,0,386,387,1,0,0,0,387,393,1,0,0,0,388,
390,3,68,34,0,389,388,1,0,0,0,389,390,1,0,0,0,390,391,1,0,0,0,391,393,5,
44,0,0,392,377,1,0,0,0,392,389,1,0,0,0,393,51,1,0,0,0,394,397,3,54,27,0,
395,398,5,30,0,0,396,398,3,106,53,0,397,395,1,0,0,0,397,396,1,0,0,0,397,
398,1,0,0,0,398,53,1,0,0,0,399,408,3,68,34,0,400,403,3,56,28,0,401,404,3,
58,29,0,402,404,4,27,0,0,403,401,1,0,0,0,403,402,1,0,0,0,404,409,1,0,0,0,
405,406,4,27,1,0,406,409,3,58,29,0,407,409,4,27,2,0,408,400,1,0,0,0,408,
405,1,0,0,0,408,407,1,0,0,0,409,418,1,0,0,0,410,413,3,56,28,0,411,414,3,
58,29,0,412,414,4,27,3,0,413,411,1,0,0,0,413,412,1,0,0,0,414,418,1,0,0,0,
415,416,4,27,4,0,416,418,3,58,29,0,417,399,1,0,0,0,417,410,1,0,0,0,417,415,
1,0,0,0,418,55,1,0,0,0,419,420,3,60,30,0,420,421,5,11,0,0,421,423,1,0,0,
0,422,419,1,0,0,0,422,423,1,0,0,0,423,424,1,0,0,0,424,425,3,62,31,0,425,
426,5,61,0,0,426,57,1,0,0,0,427,432,3,64,32,0,428,429,5,61,0,0,429,431,3,
64,32,0,430,428,1,0,0,0,431,434,1,0,0,0,432,430,1,0,0,0,432,433,1,0,0,0,
433,59,1,0,0,0,434,432,1,0,0,0,435,437,3,24,12,0,436,435,1,0,0,0,436,437,
1,0,0,0,437,438,1,0,0,0,438,439,3,20,10,0,439,61,1,0,0,0,440,442,3,24,12,
0,441,440,1,0,0,0,441,442,1,0,0,0,442,443,1,0,0,0,443,444,3,20,10,0,444,
63,1,0,0,0,445,447,3,80,40,0,446,448,3,66,33,0,447,446,1,0,0,0,447,448,1,
0,0,0,448,65,1,0,0,0,449,451,5,33,0,0,450,452,3,82,41,0,451,450,1,0,0,0,
451,452,1,0,0,0,452,453,1,0,0,0,453,454,5,34,0,0,454,67,1,0,0,0,455,457,
3,76,38,0,456,455,1,0,0,0,456,457,1,0,0,0,457,458,1,0,0,0,458,459,3,78,39,
0,459,460,5,32,0,0,460,69,1,0,0,0,461,462,3,60,30,0,462,463,5,11,0,0,463,
465,1,0,0,0,464,461,1,0,0,0,464,465,1,0,0,0,465,466,1,0,0,0,466,467,3,62,
31,0,467,469,5,7,0,0,468,470,3,72,36,0,469,468,1,0,0,0,469,470,1,0,0,0,470,
477,1,0,0,0,471,472,3,60,30,0,472,474,7,3,0,0,473,475,3,62,31,0,474,473,
1,0,0,0,474,475,1,0,0,0,475,477,1,0,0,0,476,464,1,0,0,0,476,471,1,0,0,0,
477,71,1,0,0,0,478,479,5,77,0,0,479,73,1,0,0,0,480,481,3,20,10,0,481,75,
1,0,0,0,482,483,3,20,10,0,483,77,1,0,0,0,484,497,3,112,56,0,485,490,7,4,
0,0,486,487,5,31,0,0,487,489,7,4,0,0,488,486,1,0,0,0,489,492,1,0,0,0,490,
488,1,0,0,0,490,491,1,0,0,0,491,497,1,0,0,0,492,490,1,0,0,0,493,497,5,68,
0,0,494,497,5,69,0,0,495,497,5,44,0,0,496,484,1,0,0,0,496,485,1,0,0,0,496,
493,1,0,0,0,496,494,1,0,0,0,496,495,1,0,0,0,497,79,1,0,0,0,498,500,3,24,
12,0,499,498,1,0,0,0,499,500,1,0,0,0,500,501,1,0,0,0,501,502,3,20,10,0,502,
81,1,0,0,0,503,508,3,84,42,0,504,505,5,31,0,0,505,507,3,84,42,0,506,504,
1,0,0,0,507,510,1,0,0,0,508,506,1,0,0,0,508,509,1,0,0,0,509,512,1,0,0,0,
510,508,1,0,0,0,511,513,5,31,0,0,512,511,1,0,0,0,512,513,1,0,0,0,513,83,
1,0,0,0,514,518,3,86,43,0,515,518,3,88,44,0,516,518,3,110,55,0,517,514,1,
0,0,0,517,515,1,0,0,0,517,516,1,0,0,0,518,85,1,0,0,0,519,520,7,4,0,0,520,
522,5,32,0,0,521,523,3,110,55,0,522,521,1,0,0,0,522,523,1,0,0,0,523,87,1,
0,0,0,524,525,3,76,38,0,525,526,7,4,0,0,526,89,1,0,0,0,527,531,3,92,46,0,
528,530,3,94,47,0,529,528,1,0,0,0,530,533,1,0,0,0,531,529,1,0,0,0,531,532,
1,0,0,0,532,535,1,0,0,0,533,531,1,0,0,0,534,536,3,96,48,0,535,534,1,0,0,
0,535,536,1,0,0,0,536,91,1,0,0,0,537,538,5,52,0,0,538,539,3,106,53,0,539,
93,1,0,0,0,540,542,5,53,0,0,541,543,3,66,33,0,542,541,1,0,0,0,542,543,1,
0,0,0,543,544,1,0,0,0,544,545,3,106,53,0,545,95,1,0,0,0,546,547,5,54,0,0,
547,548,3,106,53,0,548,97,1,0,0,0,549,553,3,100,50,0,550,552,3,102,51,0,
551,550,1,0,0,0,552,555,1,0,0,0,553,551,1,0,0,0,553,554,1,0,0,0,554,557,
1,0,0,0,555,553,1,0,0,0,556,558,3,104,52,0,557,556,1,0,0,0,557,558,1,0,0,
0,558,99,1,0,0,0,559,560,5,40,0,0,560,562,3,114,57,0,561,563,3,106,53,0,
562,561,1,0,0,0,562,563,1,0,0,0,563,101,1,0,0,0,564,565,5,41,0,0,565,566,
5,40,0,0,566,568,3,114,57,0,567,569,3,106,53,0,568,567,1,0,0,0,568,569,1,
0,0,0,569,103,1,0,0,0,570,572,5,41,0,0,571,573,3,106,53,0,572,571,1,0,0,
0,572,573,1,0,0,0,573,105,1,0,0,0,574,576,5,35,0,0,575,577,3,26,13,0,576,
575,1,0,0,0,576,577,1,0,0,0,577,578,1,0,0,0,578,579,5,36,0,0,579,107,1,0,
0,0,580,582,5,42,0,0,581,583,3,114,57,0,582,581,1,0,0,0,582,583,1,0,0,0,
583,585,1,0,0,0,584,586,3,106,53,0,585,584,1,0,0,0,585,586,1,0,0,0,586,109,
1,0,0,0,587,588,6,55,-1,0,588,608,3,112,56,0,589,590,5,24,0,0,590,608,3,
110,55,13,591,592,5,29,0,0,592,608,3,110,55,12,593,594,3,62,31,0,594,595,
5,61,0,0,595,597,1,0,0,0,596,593,1,0,0,0,596,597,1,0,0,0,597,598,1,0,0,0,
598,608,3,58,29,0,599,608,3,46,23,0,600,601,5,33,0,0,601,602,3,110,55,0,
602,603,5,34,0,0,603,608,1,0,0,0,604,605,3,68,34,0,605,606,3,110,55,1,606,
608,1,0,0,0,607,587,1,0,0,0,607,589,1,0,0,0,607,591,1,0,0,0,607,596,1,0,
0,0,607,599,1,0,0,0,607,600,1,0,0,0,607,604,1,0,0,0,608,632,1,0,0,0,609,
610,10,11,0,0,610,611,7,5,0,0,611,631,3,110,55,12,612,613,10,10,0,0,613,
614,7,6,0,0,614,631,3,110,55,11,615,616,10,9,0,0,616,617,7,7,0,0,617,631,
3,110,55,10,618,619,10,8,0,0,619,620,7,8,0,0,620,631,3,110,55,9,621,622,
10,7,0,0,622,623,5,16,0,0,623,631,3,110,55,8,624,625,10,6,0,0,625,626,5,
15,0,0,626,631,3,110,55,7,627,628,10,5,0,0,628,629,5,23,0,0,629,631,3,110,
55,6,630,609,1,0,0,0,630,612,1,0,0,0,630,615,1,0,0,0,630,618,1,0,0,0,630,
621,1,0,0,0,630,624,1,0,0,0,630,627,1,0,0,0,631,634,1,0,0,0,632,630,1,0,
0,0,632,633,1,0,0,0,633,111,1,0,0,0,634,632,1,0,0,0,635,644,7,9,0,0,636,
644,5,66,0,0,637,644,5,65,0,0,638,644,7,10,0,0,639,644,5,62,0,0,640,644,
5,67,0,0,641,644,7,11,0,0,642,644,5,39,0,0,643,635,1,0,0,0,643,636,1,0,0,
0,643,637,1,0,0,0,643,638,1,0,0,0,643,639,1,0,0,0,643,640,1,0,0,0,643,641,
1,0,0,0,643,642,1,0,0,0,644,113,1,0,0,0,645,647,5,33,0,0,646,648,3,116,58,
0,647,646,1,0,0,0,647,648,1,0,0,0,648,650,1,0,0,0,649,651,5,34,0,0,650,649,
1,0,0,0,650,651,1,0,0,0,651,115,1,0,0,0,652,658,3,112,56,0,653,658,3,110,
55,0,654,658,3,118,59,0,655,658,3,120,60,0,656,658,3,24,12,0,657,652,1,0,
0,0,657,653,1,0,0,0,657,654,1,0,0,0,657,655,1,0,0,0,657,656,1,0,0,0,658,
117,1,0,0,0,659,660,7,4,0,0,660,661,5,55,0,0,661,662,7,4,0,0,662,119,1,0,
0,0,663,665,7,12,0,0,664,663,1,0,0,0,665,666,1,0,0,0,666,664,1,0,0,0,666,
667,1,0,0,0,667,121,1,0,0,0,106,123,127,133,136,141,145,148,152,154,158,
160,164,168,174,178,180,185,189,191,194,199,202,205,209,212,215,219,225,
232,236,238,243,256,261,265,268,273,277,279,286,291,293,310,315,319,322,
326,329,333,336,341,344,347,350,355,364,369,374,377,383,386,389,392,397,
403,408,413,417,422,432,436,441,447,451,456,464,469,474,476,490,496,499,
508,512,517,522,531,535,542,553,557,562,568,572,576,582,585,596,607,630,
632,643,647,650,657,666];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.PredictionContextCache();

export default class sequenceParser extends antlr4.Parser {

    static grammarFileName = "java-escape";
    static literalNames = [ null, null, "'const'", "'readonly'", "'static'", 
                            "'await'", null, "':'", "'<<'", "'>>'", "'-->'", 
                            "'->'", null, "'['", "']'", "'||'", "'&&'", 
                            "'=='", "'!='", "'>'", "'<'", "'>='", "'<='", 
                            "'+'", "'-'", "'*'", "'/'", "'%'", "'^'", "'!'", 
                            "';'", "','", "'='", "'('", "')'", "'{'", "'}'", 
                            "'true'", "'false'", null, "'if'", "'else'", 
                            null, "'return'", "'new'", "'par'", "'group'", 
                            "'opt'", "'critical'", null, "'ref'", "'as'", 
                            "'try'", "'catch'", "'finally'", "'in'", null, 
                            null, null, null, null, "'.'" ];
    static symbolicNames = [ null, "WS", "CONSTANT", "READONLY", "STATIC", 
                             "AWAIT", "TITLE", "COL", "SOPEN", "SCLOSE", 
                             "RETURN_ARROW", "ARROW", "COLOR", "LBRACKET", 
                             "RBRACKET", "OR", "AND", "EQ", "NEQ", "GT", 
                             "LT", "GTEQ", "LTEQ", "PLUS", "MINUS", "MULT", 
                             "DIV", "MOD", "POW", "NOT", "SCOL", "COMMA", 
                             "ASSIGN", "OPAR", "CPAR", "OBRACE", "CBRACE", 
                             "TRUE", "FALSE", "NIL", "IF", "ELSE", "WHILE", 
                             "RETURN", "NEW", "PAR", "GROUP", "OPT", "CRITICAL", 
                             "SECTION", "REF", "AS", "TRY", "CATCH", "FINALLY", 
                             "IN", "WRAPPER_DIRECTIVE", "STARTER_LXR", "ANNOTATION_RET", 
                             "ANNOTATION", "THEME_DIRECTIVE", "DOT", "ID", 
                             "INT", "FLOAT", "MONEY", "NUMBER_UNIT", "DIGIT_LEADING_NAME", 
                             "CSTRING", "USTRING", "CR", "COMMENT", "BLOCK_COMMENT", 
                             "HASH_COMMENT", "QUOTE_COMMENT", "OTHER", "DIVIDER", 
                             "EVENT_PAYLOAD_LXR", "EVENT_END", "TITLE_CONTENT", 
                             "TITLE_END", "EMOJI_SHORTCODE" ];
    static ruleNames = [ "prog", "title", "head", "group", "starterExp", 
                         "starter", "participant", "stereotype", "label", 
                         "participantType", "name", "width", "emoji", "block", 
                         "ret", "returnAsyncMessage", "divider", "dividerNote", 
                         "stat", "par", "opt", "critical", "section", "creation", 
                         "ref", "creationBody", "message", "messageBody", 
                         "fromTo", "func", "from", "to", "signature", "invocation", 
                         "assignment", "asyncMessage", "content", "construct", 
                         "type", "assignee", "methodName", "parameters", 
                         "parameter", "namedParameter", "declaration", "tcf", 
                         "tryBlock", "catchBlock", "finallyBlock", "alt", 
                         "ifBlock", "elseIfBlock", "elseBlock", "braceBlock", 
                         "loop", "expr", "atom", "parExpr", "condition", 
                         "inExpr", "textExpr" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = sequenceParser.ruleNames;
        this.literalNames = sequenceParser.literalNames;
        this.symbolicNames = sequenceParser.symbolicNames;

          // Predicates for messageBody. See the comment on that rule.
          const P = sequenceParser;
          const NAME_START = [P.ID, P.DIGIT_LEADING_NAME, P.CSTRING, P.USTRING, P.LBRACKET, P.EMOJI_SHORTCODE];
          // After a leading name, these show a new statement: `b->c`, `b - c`, `b <- c`, `b = d()`, `b, c = d()`, `b: e`.
          const NEW_STATEMENT = [P.ARROW, P.MINUS, P.RETURN_ARROW, P.ASSIGN, P.COMMA, P.COL];
          // The offset of the token after the `emoji? name` that starts at offset i.
          this.afterName = function(i) {
            const first = this._input.LA(i);
            return i + (first === P.LBRACKET ? 4 : first === P.EMOJI_SHORTCODE ? 2 : 1);
          };
          // `A.`: the name is the target of a message, not the first signature of a func.
          this.isTargetAhead = function() {
            return this._input.LA(this.afterName(1)) === P.DOT;
          };
          // After `A.`: `b`, `b()` or `b.c()` is the func of this message. `b: e` and `b.c: e` are new statements.
          this.isFuncAhead = function() {
            let i = 1;
            while (NAME_START.includes(this._input.LA(i))) {
              i = this.afterName(i);
              if (this._input.LA(i) !== P.DOT) {
                return !NEW_STATEMENT.includes(this._input.LA(i));
              }
              i += 1;
            }
            return false;
          };
          // After `r =`: the message that follows is the assigned value.
          this.isAssignedMessageAhead = function() {
            const afterFrom = this.afterName(1);
            const hasFrom = this._input.LA(afterFrom) === P.ARROW;
            return this.isTargetAhead() || this.isFuncAhead() || (hasFrom && this._input.LA(this.afterName(afterFrom + 1)) === P.DOT);
          };

    }

    get atn() {
        return atn;
    }

    sempred(localctx, ruleIndex, predIndex) {
    	switch(ruleIndex) {
    	case 27:
    	    		return this.messageBody_sempred(localctx, predIndex);
    	case 55:
    	    		return this.expr_sempred(localctx, predIndex);
        default:
            throw "No predicate with index:" + ruleIndex;
       }
    }

    messageBody_sempred(localctx, predIndex) {
    	switch(predIndex) {
    		case 0:
    			return !this.isFuncAhead();
    		case 1:
    			return !this.isTargetAhead();
    		case 2:
    			return !this.isAssignedMessageAhead();
    		case 3:
    			return !this.isFuncAhead();
    		case 4:
    			return !this.isTargetAhead();
    		default:
    			throw "No predicate with index:" + predIndex;
    	}
    };

    expr_sempred(localctx, predIndex) {
    	switch(predIndex) {
    		case 5:
    			return this.precpred(this._ctx, 11);
    		case 6:
    			return this.precpred(this._ctx, 10);
    		case 7:
    			return this.precpred(this._ctx, 9);
    		case 8:
    			return this.precpred(this._ctx, 8);
    		case 9:
    			return this.precpred(this._ctx, 7);
    		case 10:
    			return this.precpred(this._ctx, 6);
    		case 11:
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
	        this.state = 141;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,4,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 123;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===6) {
	                this.state = 122;
	                this.title();
	            }

	            this.state = 125;
	            this.match(sequenceParser.EOF);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 127;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===6) {
	                this.state = 126;
	                this.title();
	            }

	            this.state = 129;
	            this.head();
	            this.state = 130;
	            this.match(sequenceParser.EOF);
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 133;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,2,this._ctx);
	            if(la_===1) {
	                this.state = 132;
	                this.title();

	            }
	            this.state = 136;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,3,this._ctx);
	            if(la_===1) {
	                this.state = 135;
	                this.head();

	            }
	            this.state = 138;
	            this.block();
	            this.state = 139;
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
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 143;
	        this.match(sequenceParser.TITLE);
	        this.state = 145;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,5,this._ctx);
	        if(la_===1) {
	            this.state = 144;
	            this.match(sequenceParser.TITLE_CONTENT);

	        }
	        this.state = 148;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,6,this._ctx);
	        if(la_===1) {
	            this.state = 147;
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
	        this.state = 164;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,11,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 152; 
	            this._errHandler.sync(this);
	            var _alt = 1;
	            do {
	            	switch (_alt) {
	            	case 1:
	            		this.state = 152;
	            		this._errHandler.sync(this);
	            		switch(this._input.LA(1)) {
	            		case 46:
	            		    this.state = 150;
	            		    this.group();
	            		    break;
	            		case 8:
	            		case 13:
	            		case 20:
	            		case 59:
	            		case 62:
	            		case 67:
	            		case 68:
	            		case 69:
	            		case 81:
	            		    this.state = 151;
	            		    this.participant();
	            		    break;
	            		default:
	            		    throw new antlr4.error.NoViableAltException(this);
	            		}
	            		break;
	            	default:
	            		throw new antlr4.error.NoViableAltException(this);
	            	}
	            	this.state = 154; 
	            	this._errHandler.sync(this);
	            	_alt = this._interp.adaptivePredict(this._input,8, this._ctx);
	            } while ( _alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER );
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 160;
	            this._errHandler.sync(this);
	            var _alt = this._interp.adaptivePredict(this._input,10,this._ctx)
	            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	                if(_alt===1) {
	                    this.state = 158;
	                    this._errHandler.sync(this);
	                    switch(this._input.LA(1)) {
	                    case 46:
	                        this.state = 156;
	                        this.group();
	                        break;
	                    case 8:
	                    case 13:
	                    case 20:
	                    case 59:
	                    case 62:
	                    case 67:
	                    case 68:
	                    case 69:
	                    case 81:
	                        this.state = 157;
	                        this.participant();
	                        break;
	                    default:
	                        throw new antlr4.error.NoViableAltException(this);
	                    } 
	                }
	                this.state = 162;
	                this._errHandler.sync(this);
	                _alt = this._interp.adaptivePredict(this._input,10,this._ctx);
	            }

	            this.state = 163;
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
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 166;
	        this.match(sequenceParser.GROUP);
	        this.state = 168;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,12,this._ctx);
	        if(la_===1) {
	            this.state = 167;
	            this.name();

	        }
	        this.state = 180;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,15,this._ctx);
	        if(la_===1) {
	            this.state = 170;
	            this.match(sequenceParser.OBRACE);
	            this.state = 174;
	            this._errHandler.sync(this);
	            var _alt = this._interp.adaptivePredict(this._input,13,this._ctx)
	            while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	                if(_alt===1) {
	                    this.state = 171;
	                    this.participant(); 
	                }
	                this.state = 176;
	                this._errHandler.sync(this);
	                _alt = this._interp.adaptivePredict(this._input,13,this._ctx);
	            }

	            this.state = 178;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,14,this._ctx);
	            if(la_===1) {
	                this.state = 177;
	                this.match(sequenceParser.CBRACE);

	            }

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
	    try {
	        this.state = 194;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 57:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 182;
	            this.match(sequenceParser.STARTER_LXR);
	            this.state = 191;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,18,this._ctx);
	            if(la_===1) {
	                this.state = 183;
	                this.match(sequenceParser.OPAR);
	                this.state = 185;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,16,this._ctx);
	                if(la_===1) {
	                    this.state = 184;
	                    this.starter();

	                }
	                this.state = 189;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,17,this._ctx);
	                switch(la_) {
	                case 1:
	                    this.state = 187;
	                    this.match(sequenceParser.CPAR);
	                    break;

	                case 2:
	                    this.notifyErrorListeners("missing ')' after @Starter");
	                    break;

	                }

	            }
	            break;
	        case 59:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 193;
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
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 196;
	        this.name();
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
	        this.state = 219;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,26,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 199;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===59) {
	                this.state = 198;
	                this.participantType();
	            }

	            this.state = 202;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===8 || _la===20) {
	                this.state = 201;
	                this.stereotype();
	            }

	            this.state = 205;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===13 || _la===81) {
	                this.state = 204;
	                this.emoji();
	            }

	            this.state = 207;
	            this.name();
	            this.state = 209;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,23,this._ctx);
	            if(la_===1) {
	                this.state = 208;
	                this.width();

	            }
	            this.state = 212;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,24,this._ctx);
	            if(la_===1) {
	                this.state = 211;
	                this.label();

	            }
	            this.state = 215;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,25,this._ctx);
	            if(la_===1) {
	                this.state = 214;
	                this.match(sequenceParser.COLOR);

	            }
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 217;
	            this.stereotype();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 218;
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
	        this.state = 238;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,30,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 221;
	            this.match(sequenceParser.SOPEN);
	            this.state = 223; 
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            do {
	                this.state = 222;
	                this.name();
	                this.state = 225; 
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            } while(((((_la - 62)) & ~0x1f) == 0 && ((1 << (_la - 62)) & 225) !== 0));
	            this.state = 227;
	            this.match(sequenceParser.SCLOSE);
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 229;
	            this.match(sequenceParser.SOPEN);
	            this.state = 230;
	            this.name();
	            this.state = 232;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,28,this._ctx);
	            if(la_===1) {
	                this.state = 231;
	                this.match(sequenceParser.GT);

	            }
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 234;
	            _la = this._input.LA(1);
	            if(!(_la===8 || _la===20)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            this.state = 236;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,29,this._ctx);
	            if(la_===1) {
	                this.state = 235;
	                _la = this._input.LA(1);
	                if(!(_la===9 || _la===19)) {
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
	        this.state = 243;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,31,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 240;
	            this.match(sequenceParser.AS);
	            this.state = 241;
	            this.name();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 242;
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
	        this.state = 245;
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
	        this.state = 247;
	        _la = this._input.LA(1);
	        if(!(((((_la - 62)) & ~0x1f) == 0 && ((1 << (_la - 62)) & 225) !== 0))) {
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
	        this.state = 249;
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



	emoji() {
	    let localctx = new EmojiContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 24, sequenceParser.RULE_emoji);
	    try {
	        this.state = 256;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 13:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 251;
	            this.match(sequenceParser.LBRACKET);
	            this.state = 252;
	            this.name();
	            this.state = 253;
	            this.match(sequenceParser.RBRACKET);
	            break;
	        case 81:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 255;
	            this.match(sequenceParser.EMOJI_SHORTCODE);
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



	block() {
	    let localctx = new BlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 26, sequenceParser.RULE_block);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 259; 
	        this._errHandler.sync(this);
	        var _alt = 1;
	        do {
	        	switch (_alt) {
	        	case 1:
	        		this.state = 258;
	        		this.stat();
	        		break;
	        	default:
	        		throw new antlr4.error.NoViableAltException(this);
	        	}
	        	this.state = 261; 
	        	this._errHandler.sync(this);
	        	_alt = this._interp.adaptivePredict(this._input,33, this._ctx);
	        } while ( _alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER );
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
	    this.enterRule(localctx, 28, sequenceParser.RULE_ret);
	    try {
	        this.state = 279;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 43:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 263;
	            this.match(sequenceParser.RETURN);
	            this.state = 265;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,34,this._ctx);
	            if(la_===1) {
	                this.state = 264;
	                this.expr(0);

	            }
	            this.state = 268;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,35,this._ctx);
	            if(la_===1) {
	                this.state = 267;
	                this.match(sequenceParser.SCOL);

	            }
	            break;
	        case 58:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 270;
	            this.match(sequenceParser.ANNOTATION_RET);
	            this.state = 271;
	            this.asyncMessage();
	            this.state = 273;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,36,this._ctx);
	            if(la_===1) {
	                this.state = 272;
	                this.match(sequenceParser.EVENT_END);

	            }
	            break;
	        case 13:
	        case 62:
	        case 67:
	        case 68:
	        case 69:
	        case 81:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 275;
	            this.returnAsyncMessage();
	            this.state = 277;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,37,this._ctx);
	            if(la_===1) {
	                this.state = 276;
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



	returnAsyncMessage() {
	    let localctx = new ReturnAsyncMessageContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 30, sequenceParser.RULE_returnAsyncMessage);
	    try {
	        this.state = 293;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,41,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 281;
	            this.from();
	            this.state = 282;
	            this.match(sequenceParser.RETURN_ARROW);
	            this.state = 283;
	            this.to();
	            this.state = 284;
	            this.match(sequenceParser.COL);
	            this.state = 286;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,39,this._ctx);
	            if(la_===1) {
	                this.state = 285;
	                this.content();

	            }
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 288;
	            this.from();
	            this.state = 289;
	            this.match(sequenceParser.RETURN_ARROW);
	            this.state = 291;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,40,this._ctx);
	            if(la_===1) {
	                this.state = 290;
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



	divider() {
	    let localctx = new DividerContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 32, sequenceParser.RULE_divider);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 295;
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
	    this.enterRule(localctx, 34, sequenceParser.RULE_dividerNote);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 297;
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
	    this.enterRule(localctx, 36, sequenceParser.RULE_stat);
	    try {
	        this.state = 315;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,43,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 299;
	            this.alt();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 300;
	            this.par();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 301;
	            this.opt();
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 302;
	            this.critical();
	            break;

	        case 5:
	            this.enterOuterAlt(localctx, 5);
	            this.state = 303;
	            this.section();
	            break;

	        case 6:
	            this.enterOuterAlt(localctx, 6);
	            this.state = 304;
	            this.ref();
	            break;

	        case 7:
	            this.enterOuterAlt(localctx, 7);
	            this.state = 305;
	            this.loop();
	            break;

	        case 8:
	            this.enterOuterAlt(localctx, 8);
	            this.state = 306;
	            this.creation();
	            break;

	        case 9:
	            this.enterOuterAlt(localctx, 9);
	            this.state = 307;
	            this.message();
	            break;

	        case 10:
	            this.enterOuterAlt(localctx, 10);
	            this.state = 308;
	            this.asyncMessage();
	            this.state = 310;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,42,this._ctx);
	            if(la_===1) {
	                this.state = 309;
	                this.match(sequenceParser.EVENT_END);

	            }
	            break;

	        case 11:
	            this.enterOuterAlt(localctx, 11);
	            this.state = 312;
	            this.ret();
	            break;

	        case 12:
	            this.enterOuterAlt(localctx, 12);
	            this.state = 313;
	            this.divider();
	            break;

	        case 13:
	            this.enterOuterAlt(localctx, 13);
	            this.state = 314;
	            this.tcf();
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
	    this.enterRule(localctx, 38, sequenceParser.RULE_par);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 317;
	        this.match(sequenceParser.PAR);
	        this.state = 322;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,45,this._ctx);
	        if(la_===1) {
	            this.state = 319;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===33) {
	                this.state = 318;
	                this.parExpr();
	            }

	            this.state = 321;
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



	opt() {
	    let localctx = new OptContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 40, sequenceParser.RULE_opt);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 324;
	        this.match(sequenceParser.OPT);
	        this.state = 329;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,47,this._ctx);
	        if(la_===1) {
	            this.state = 326;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===33) {
	                this.state = 325;
	                this.parExpr();
	            }

	            this.state = 328;
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



	critical() {
	    let localctx = new CriticalContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 42, sequenceParser.RULE_critical);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 331;
	        this.match(sequenceParser.CRITICAL);
	        this.state = 336;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,49,this._ctx);
	        if(la_===1) {
	            this.state = 333;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            if(_la===33) {
	                this.state = 332;
	                this.parExpr();
	            }

	            this.state = 335;
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



	section() {
	    let localctx = new SectionContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 44, sequenceParser.RULE_section);
	    var _la = 0; // Token type
	    try {
	        this.state = 350;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 49:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 338;
	            this.match(sequenceParser.SECTION);
	            this.state = 347;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,52,this._ctx);
	            if(la_===1) {
	                this.state = 344;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	                if(_la===33) {
	                    this.state = 339;
	                    this.match(sequenceParser.OPAR);
	                    this.state = 341;
	                    this._errHandler.sync(this);
	                    _la = this._input.LA(1);
	                    if(((((_la - 37)) & ~0x1f) == 0 && ((1 << (_la - 37)) & 4261412871) !== 0) || _la===69) {
	                        this.state = 340;
	                        this.atom();
	                    }

	                    this.state = 343;
	                    this.match(sequenceParser.CPAR);
	                }

	                this.state = 346;
	                this.braceBlock();

	            }
	            break;
	        case 35:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 349;
	            this.braceBlock();
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



	creation() {
	    let localctx = new CreationContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 46, sequenceParser.RULE_creation);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 352;
	        this.creationBody();
	        this.state = 355;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,54,this._ctx);
	        if(la_===1) {
	            this.state = 353;
	            this.match(sequenceParser.SCOL);

	        } else if(la_===2) {
	            this.state = 354;
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



	ref() {
	    let localctx = new RefContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 48, sequenceParser.RULE_ref);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 357;
	        this.match(sequenceParser.REF);
	        this.state = 358;
	        this.match(sequenceParser.OPAR);

	        this.state = 359;
	        this.name();
	        this.state = 369;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===31) {
	            this.state = 360;
	            this.match(sequenceParser.COMMA);
	            this.state = 364;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while(((((_la - 62)) & ~0x1f) == 0 && ((1 << (_la - 62)) & 225) !== 0)) {
	                this.state = 361;
	                this.name();
	                this.state = 366;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	            this.state = 371;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 372;
	        this.match(sequenceParser.CPAR);
	        this.state = 374;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,57,this._ctx);
	        if(la_===1) {
	            this.state = 373;
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
	}



	creationBody() {
	    let localctx = new CreationBodyContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 50, sequenceParser.RULE_creationBody);
	    var _la = 0; // Token type
	    try {
	        this.state = 392;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,62,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 377;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,58,this._ctx);
	            if(la_===1) {
	                this.state = 376;
	                this.assignment();

	            }
	            this.state = 379;
	            this.match(sequenceParser.NEW);
	            this.state = 380;
	            this.construct();
	            this.state = 386;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,60,this._ctx);
	            if(la_===1) {
	                this.state = 381;
	                this.match(sequenceParser.OPAR);
	                this.state = 383;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	                if(((((_la - 13)) & ~0x1f) == 0 && ((1 << (_la - 13)) & 2266040321) !== 0) || ((((_la - 62)) & ~0x1f) == 0 && ((1 << (_la - 62)) & 524543) !== 0)) {
	                    this.state = 382;
	                    this.parameters();
	                }

	                this.state = 385;
	                this.match(sequenceParser.CPAR);

	            }
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 389;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,61,this._ctx);
	            if(la_===1) {
	                this.state = 388;
	                this.assignment();

	            }
	            this.state = 391;
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
	    this.enterRule(localctx, 52, sequenceParser.RULE_message);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 394;
	        this.messageBody();
	        this.state = 397;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,63,this._ctx);
	        if(la_===1) {
	            this.state = 395;
	            this.match(sequenceParser.SCOL);

	        } else if(la_===2) {
	            this.state = 396;
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



	messageBody() {
	    let localctx = new MessageBodyContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 54, sequenceParser.RULE_messageBody);
	    try {
	        this.state = 417;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,67,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 399;
	            this.assignment();
	            this.state = 408;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,65,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 400;
	                this.fromTo();
	                this.state = 403;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,64,this._ctx);
	                switch(la_) {
	                case 1:
	                    this.state = 401;
	                    this.func();
	                    break;

	                case 2:
	                    this.state = 402;
	                    if (!( !this.isFuncAhead())) {
	                        throw new antlr4.error.FailedPredicateException(this, "!this.isFuncAhead()");
	                    }
	                    break;

	                }
	                break;

	            case 2:
	                this.state = 405;
	                if (!( !this.isTargetAhead())) {
	                    throw new antlr4.error.FailedPredicateException(this, "!this.isTargetAhead()");
	                }
	                this.state = 406;
	                this.func();
	                break;

	            case 3:
	                this.state = 407;
	                if (!( !this.isAssignedMessageAhead())) {
	                    throw new antlr4.error.FailedPredicateException(this, "!this.isAssignedMessageAhead()");
	                }
	                break;

	            }
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 410;
	            this.fromTo();
	            this.state = 413;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,66,this._ctx);
	            switch(la_) {
	            case 1:
	                this.state = 411;
	                this.func();
	                break;

	            case 2:
	                this.state = 412;
	                if (!( !this.isFuncAhead())) {
	                    throw new antlr4.error.FailedPredicateException(this, "!this.isFuncAhead()");
	                }
	                break;

	            }
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 415;
	            if (!( !this.isTargetAhead())) {
	                throw new antlr4.error.FailedPredicateException(this, "!this.isTargetAhead()");
	            }
	            this.state = 416;
	            this.func();
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



	fromTo() {
	    let localctx = new FromToContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 56, sequenceParser.RULE_fromTo);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 422;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,68,this._ctx);
	        if(la_===1) {
	            this.state = 419;
	            this.from();
	            this.state = 420;
	            this.match(sequenceParser.ARROW);

	        }
	        this.state = 424;
	        this.to();
	        this.state = 425;
	        this.match(sequenceParser.DOT);
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
	    this.enterRule(localctx, 58, sequenceParser.RULE_func);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 427;
	        this.signature();
	        this.state = 432;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,69,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 428;
	                this.match(sequenceParser.DOT);
	                this.state = 429;
	                this.signature(); 
	            }
	            this.state = 434;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,69,this._ctx);
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
	    this.enterRule(localctx, 60, sequenceParser.RULE_from);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 436;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===13 || _la===81) {
	            this.state = 435;
	            this.emoji();
	        }

	        this.state = 438;
	        this.name();
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
	    this.enterRule(localctx, 62, sequenceParser.RULE_to);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 441;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===13 || _la===81) {
	            this.state = 440;
	            this.emoji();
	        }

	        this.state = 443;
	        this.name();
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
	    this.enterRule(localctx, 64, sequenceParser.RULE_signature);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 445;
	        this.methodName();
	        this.state = 447;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,72,this._ctx);
	        if(la_===1) {
	            this.state = 446;
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
	    this.enterRule(localctx, 66, sequenceParser.RULE_invocation);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 449;
	        this.match(sequenceParser.OPAR);
	        this.state = 451;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(((((_la - 13)) & ~0x1f) == 0 && ((1 << (_la - 13)) & 2266040321) !== 0) || ((((_la - 62)) & ~0x1f) == 0 && ((1 << (_la - 62)) & 524543) !== 0)) {
	            this.state = 450;
	            this.parameters();
	        }

	        this.state = 453;
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
	    this.enterRule(localctx, 68, sequenceParser.RULE_assignment);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 456;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,74,this._ctx);
	        if(la_===1) {
	            this.state = 455;
	            this.type();

	        }
	        this.state = 458;
	        this.assignee();
	        this.state = 459;
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
	    this.enterRule(localctx, 70, sequenceParser.RULE_asyncMessage);
	    var _la = 0; // Token type
	    try {
	        this.state = 476;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,78,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 464;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,75,this._ctx);
	            if(la_===1) {
	                this.state = 461;
	                this.from();
	                this.state = 462;
	                this.match(sequenceParser.ARROW);

	            }
	            this.state = 466;
	            this.to();
	            this.state = 467;
	            this.match(sequenceParser.COL);
	            this.state = 469;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,76,this._ctx);
	            if(la_===1) {
	                this.state = 468;
	                this.content();

	            }
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 471;
	            this.from();
	            this.state = 472;
	            _la = this._input.LA(1);
	            if(!(_la===11 || _la===24)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            this.state = 474;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,77,this._ctx);
	            if(la_===1) {
	                this.state = 473;
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
	    this.enterRule(localctx, 72, sequenceParser.RULE_content);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 478;
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
	    this.enterRule(localctx, 74, sequenceParser.RULE_construct);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 480;
	        this.name();
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
	    this.enterRule(localctx, 76, sequenceParser.RULE_type);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 482;
	        this.name();
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
	    this.enterRule(localctx, 78, sequenceParser.RULE_assignee);
	    var _la = 0; // Token type
	    try {
	        this.state = 496;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,80,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 484;
	            this.atom();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 485;
	            _la = this._input.LA(1);
	            if(!(_la===62 || _la===67)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            this.state = 490;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	            while(_la===31) {
	                this.state = 486;
	                this.match(sequenceParser.COMMA);
	                this.state = 487;
	                _la = this._input.LA(1);
	                if(!(_la===62 || _la===67)) {
	                this._errHandler.recoverInline(this);
	                }
	                else {
	                	this._errHandler.reportMatch(this);
	                    this.consume();
	                }
	                this.state = 492;
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	            }
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 493;
	            this.match(sequenceParser.CSTRING);
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 494;
	            this.match(sequenceParser.USTRING);
	            break;

	        case 5:
	            this.enterOuterAlt(localctx, 5);
	            this.state = 495;
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



	methodName() {
	    let localctx = new MethodNameContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 80, sequenceParser.RULE_methodName);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 499;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===13 || _la===81) {
	            this.state = 498;
	            this.emoji();
	        }

	        this.state = 501;
	        this.name();
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
	    this.enterRule(localctx, 82, sequenceParser.RULE_parameters);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 503;
	        this.parameter();
	        this.state = 508;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,82,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 504;
	                this.match(sequenceParser.COMMA);
	                this.state = 505;
	                this.parameter(); 
	            }
	            this.state = 510;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,82,this._ctx);
	        }

	        this.state = 512;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===31) {
	            this.state = 511;
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
	    this.enterRule(localctx, 84, sequenceParser.RULE_parameter);
	    try {
	        this.state = 517;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,84,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 514;
	            this.namedParameter();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 515;
	            this.declaration();
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 516;
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



	namedParameter() {
	    let localctx = new NamedParameterContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 86, sequenceParser.RULE_namedParameter);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 519;
	        _la = this._input.LA(1);
	        if(!(_la===62 || _la===67)) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	        this.state = 520;
	        this.match(sequenceParser.ASSIGN);
	        this.state = 522;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(((((_la - 13)) & ~0x1f) == 0 && ((1 << (_la - 13)) & 2266040321) !== 0) || ((((_la - 62)) & ~0x1f) == 0 && ((1 << (_la - 62)) & 524543) !== 0)) {
	            this.state = 521;
	            this.expr(0);
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
	    this.enterRule(localctx, 88, sequenceParser.RULE_declaration);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 524;
	        this.type();
	        this.state = 525;
	        _la = this._input.LA(1);
	        if(!(_la===62 || _la===67)) {
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



	tcf() {
	    let localctx = new TcfContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 90, sequenceParser.RULE_tcf);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 527;
	        this.tryBlock();
	        this.state = 531;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,86,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 528;
	                this.catchBlock(); 
	            }
	            this.state = 533;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,86,this._ctx);
	        }

	        this.state = 535;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,87,this._ctx);
	        if(la_===1) {
	            this.state = 534;
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
	    this.enterRule(localctx, 92, sequenceParser.RULE_tryBlock);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 537;
	        this.match(sequenceParser.TRY);
	        this.state = 538;
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
	    this.enterRule(localctx, 94, sequenceParser.RULE_catchBlock);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 540;
	        this.match(sequenceParser.CATCH);
	        this.state = 542;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===33) {
	            this.state = 541;
	            this.invocation();
	        }

	        this.state = 544;
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
	    this.enterRule(localctx, 96, sequenceParser.RULE_finallyBlock);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 546;
	        this.match(sequenceParser.FINALLY);
	        this.state = 547;
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
	    this.enterRule(localctx, 98, sequenceParser.RULE_alt);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 549;
	        this.ifBlock();
	        this.state = 553;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,89,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 550;
	                this.elseIfBlock(); 
	            }
	            this.state = 555;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,89,this._ctx);
	        }

	        this.state = 557;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,90,this._ctx);
	        if(la_===1) {
	            this.state = 556;
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
	    this.enterRule(localctx, 100, sequenceParser.RULE_ifBlock);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 559;
	        this.match(sequenceParser.IF);
	        this.state = 560;
	        this.parExpr();
	        this.state = 562;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,91,this._ctx);
	        if(la_===1) {
	            this.state = 561;
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



	elseIfBlock() {
	    let localctx = new ElseIfBlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 102, sequenceParser.RULE_elseIfBlock);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 564;
	        this.match(sequenceParser.ELSE);
	        this.state = 565;
	        this.match(sequenceParser.IF);
	        this.state = 566;
	        this.parExpr();
	        this.state = 568;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,92,this._ctx);
	        if(la_===1) {
	            this.state = 567;
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



	elseBlock() {
	    let localctx = new ElseBlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 104, sequenceParser.RULE_elseBlock);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 570;
	        this.match(sequenceParser.ELSE);
	        this.state = 572;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,93,this._ctx);
	        if(la_===1) {
	            this.state = 571;
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



	braceBlock() {
	    let localctx = new BraceBlockContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 106, sequenceParser.RULE_braceBlock);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 574;
	        this.match(sequenceParser.OBRACE);
	        this.state = 576;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,94,this._ctx);
	        if(la_===1) {
	            this.state = 575;
	            this.block();

	        }
	        this.state = 578;
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
	    this.enterRule(localctx, 108, sequenceParser.RULE_loop);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 580;
	        this.match(sequenceParser.WHILE);
	        this.state = 582;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,95,this._ctx);
	        if(la_===1) {
	            this.state = 581;
	            this.parExpr();

	        }
	        this.state = 585;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,96,this._ctx);
	        if(la_===1) {
	            this.state = 584;
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


	expr(_p) {
		if(_p===undefined) {
		    _p = 0;
		}
	    const _parentctx = this._ctx;
	    const _parentState = this.state;
	    let localctx = new ExprContext(this, this._ctx, _parentState);
	    let _prevctx = localctx;
	    const _startState = 110;
	    this.enterRecursionRule(localctx, 110, sequenceParser.RULE_expr, _p);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 607;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,98,this._ctx);
	        switch(la_) {
	        case 1:
	            localctx = new AtomExprContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;

	            this.state = 588;
	            this.atom();
	            break;

	        case 2:
	            localctx = new UnaryMinusExprContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 589;
	            this.match(sequenceParser.MINUS);
	            this.state = 590;
	            this.expr(13);
	            break;

	        case 3:
	            localctx = new NotExprContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 591;
	            this.match(sequenceParser.NOT);
	            this.state = 592;
	            this.expr(12);
	            break;

	        case 4:
	            localctx = new FuncExprContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 596;
	            this._errHandler.sync(this);
	            var la_ = this._interp.adaptivePredict(this._input,97,this._ctx);
	            if(la_===1) {
	                this.state = 593;
	                this.to();
	                this.state = 594;
	                this.match(sequenceParser.DOT);

	            }
	            this.state = 598;
	            this.func();
	            break;

	        case 5:
	            localctx = new CreationExprContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 599;
	            this.creation();
	            break;

	        case 6:
	            localctx = new ParenthesizedExprContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 600;
	            this.match(sequenceParser.OPAR);
	            this.state = 601;
	            this.expr(0);
	            this.state = 602;
	            this.match(sequenceParser.CPAR);
	            break;

	        case 7:
	            localctx = new AssignmentExprContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 604;
	            this.assignment();
	            this.state = 605;
	            this.expr(1);
	            break;

	        }
	        this._ctx.stop = this._input.LT(-1);
	        this.state = 632;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,100,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                if(this._parseListeners!==null) {
	                    this.triggerExitRuleEvent();
	                }
	                _prevctx = localctx;
	                this.state = 630;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,99,this._ctx);
	                switch(la_) {
	                case 1:
	                    localctx = new MultiplicationExprContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
	                    this.state = 609;
	                    if (!( this.precpred(this._ctx, 11))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 11)");
	                    }
	                    this.state = 610;
	                    localctx.op = this._input.LT(1);
	                    _la = this._input.LA(1);
	                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & 234881024) !== 0))) {
	                        localctx.op = this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 611;
	                    this.expr(12);
	                    break;

	                case 2:
	                    localctx = new AdditiveExprContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
	                    this.state = 612;
	                    if (!( this.precpred(this._ctx, 10))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 10)");
	                    }
	                    this.state = 613;
	                    localctx.op = this._input.LT(1);
	                    _la = this._input.LA(1);
	                    if(!(_la===23 || _la===24)) {
	                        localctx.op = this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 614;
	                    this.expr(11);
	                    break;

	                case 3:
	                    localctx = new RelationalExprContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
	                    this.state = 615;
	                    if (!( this.precpred(this._ctx, 9))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 9)");
	                    }
	                    this.state = 616;
	                    localctx.op = this._input.LT(1);
	                    _la = this._input.LA(1);
	                    if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & 7864320) !== 0))) {
	                        localctx.op = this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 617;
	                    this.expr(10);
	                    break;

	                case 4:
	                    localctx = new EqualityExprContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
	                    this.state = 618;
	                    if (!( this.precpred(this._ctx, 8))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 8)");
	                    }
	                    this.state = 619;
	                    localctx.op = this._input.LT(1);
	                    _la = this._input.LA(1);
	                    if(!(_la===17 || _la===18)) {
	                        localctx.op = this._errHandler.recoverInline(this);
	                    }
	                    else {
	                    	this._errHandler.reportMatch(this);
	                        this.consume();
	                    }
	                    this.state = 620;
	                    this.expr(9);
	                    break;

	                case 5:
	                    localctx = new AndExprContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
	                    this.state = 621;
	                    if (!( this.precpred(this._ctx, 7))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 7)");
	                    }
	                    this.state = 622;
	                    this.match(sequenceParser.AND);
	                    this.state = 623;
	                    this.expr(8);
	                    break;

	                case 6:
	                    localctx = new OrExprContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
	                    this.state = 624;
	                    if (!( this.precpred(this._ctx, 6))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 6)");
	                    }
	                    this.state = 625;
	                    this.match(sequenceParser.OR);
	                    this.state = 626;
	                    this.expr(7);
	                    break;

	                case 7:
	                    localctx = new PlusExprContext(this, new ExprContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, sequenceParser.RULE_expr);
	                    this.state = 627;
	                    if (!( this.precpred(this._ctx, 5))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 5)");
	                    }
	                    this.state = 628;
	                    this.match(sequenceParser.PLUS);
	                    this.state = 629;
	                    this.expr(6);
	                    break;

	                } 
	            }
	            this.state = 634;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,100,this._ctx);
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
	    this.enterRule(localctx, 112, sequenceParser.RULE_atom);
	    var _la = 0; // Token type
	    try {
	        this.state = 643;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case 63:
	        case 64:
	            localctx = new NumberAtomContext(this, localctx);
	            this.enterOuterAlt(localctx, 1);
	            this.state = 635;
	            _la = this._input.LA(1);
	            if(!(_la===63 || _la===64)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            break;
	        case 66:
	            localctx = new NumberUnitAtomContext(this, localctx);
	            this.enterOuterAlt(localctx, 2);
	            this.state = 636;
	            this.match(sequenceParser.NUMBER_UNIT);
	            break;
	        case 65:
	            localctx = new MoneyAtomContext(this, localctx);
	            this.enterOuterAlt(localctx, 3);
	            this.state = 637;
	            this.match(sequenceParser.MONEY);
	            break;
	        case 37:
	        case 38:
	            localctx = new BooleanAtomContext(this, localctx);
	            this.enterOuterAlt(localctx, 4);
	            this.state = 638;
	            _la = this._input.LA(1);
	            if(!(_la===37 || _la===38)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            break;
	        case 62:
	            localctx = new IdAtomContext(this, localctx);
	            this.enterOuterAlt(localctx, 5);
	            this.state = 639;
	            this.match(sequenceParser.ID);
	            break;
	        case 67:
	            localctx = new DigitLeadingNameAtomContext(this, localctx);
	            this.enterOuterAlt(localctx, 6);
	            this.state = 640;
	            this.match(sequenceParser.DIGIT_LEADING_NAME);
	            break;
	        case 68:
	        case 69:
	            localctx = new StringAtomContext(this, localctx);
	            this.enterOuterAlt(localctx, 7);
	            this.state = 641;
	            _la = this._input.LA(1);
	            if(!(_la===68 || _la===69)) {
	            this._errHandler.recoverInline(this);
	            }
	            else {
	            	this._errHandler.reportMatch(this);
	                this.consume();
	            }
	            break;
	        case 39:
	            localctx = new NilAtomContext(this, localctx);
	            this.enterOuterAlt(localctx, 8);
	            this.state = 642;
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
	    this.enterRule(localctx, 114, sequenceParser.RULE_parExpr);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 645;
	        this.match(sequenceParser.OPAR);
	        this.state = 647;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,102,this._ctx);
	        if(la_===1) {
	            this.state = 646;
	            this.condition();

	        }
	        this.state = 650;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,103,this._ctx);
	        if(la_===1) {
	            this.state = 649;
	            this.match(sequenceParser.CPAR);

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
	    this.enterRule(localctx, 116, sequenceParser.RULE_condition);
	    try {
	        this.state = 657;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,104,this._ctx);
	        switch(la_) {
	        case 1:
	            this.enterOuterAlt(localctx, 1);
	            this.state = 652;
	            this.atom();
	            break;

	        case 2:
	            this.enterOuterAlt(localctx, 2);
	            this.state = 653;
	            this.expr(0);
	            break;

	        case 3:
	            this.enterOuterAlt(localctx, 3);
	            this.state = 654;
	            this.inExpr();
	            break;

	        case 4:
	            this.enterOuterAlt(localctx, 4);
	            this.state = 655;
	            this.textExpr();
	            break;

	        case 5:
	            this.enterOuterAlt(localctx, 5);
	            this.state = 656;
	            this.emoji();
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
	    this.enterRule(localctx, 118, sequenceParser.RULE_inExpr);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 659;
	        _la = this._input.LA(1);
	        if(!(_la===62 || _la===67)) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	        this.state = 660;
	        this.match(sequenceParser.IN);
	        this.state = 661;
	        _la = this._input.LA(1);
	        if(!(_la===62 || _la===67)) {
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



	textExpr() {
	    let localctx = new TextExprContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 120, sequenceParser.RULE_textExpr);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 664; 
	        this._errHandler.sync(this);
	        var _alt = 1;
	        do {
	        	switch (_alt) {
	        	case 1:
	        		this.state = 663;
	        		_la = this._input.LA(1);
	        		if(!(((((_la - 62)) & ~0x1f) == 0 && ((1 << (_la - 62)) & 55) !== 0))) {
	        		this._errHandler.recoverInline(this);
	        		}
	        		else {
	        			this._errHandler.reportMatch(this);
	        		    this.consume();
	        		}
	        		break;
	        	default:
	        		throw new antlr4.error.NoViableAltException(this);
	        	}
	        	this.state = 666; 
	        	this._errHandler.sync(this);
	        	_alt = this._interp.adaptivePredict(this._input,105, this._ctx);
	        } while ( _alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER );
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
sequenceParser.RETURN_ARROW = 10;
sequenceParser.ARROW = 11;
sequenceParser.COLOR = 12;
sequenceParser.LBRACKET = 13;
sequenceParser.RBRACKET = 14;
sequenceParser.OR = 15;
sequenceParser.AND = 16;
sequenceParser.EQ = 17;
sequenceParser.NEQ = 18;
sequenceParser.GT = 19;
sequenceParser.LT = 20;
sequenceParser.GTEQ = 21;
sequenceParser.LTEQ = 22;
sequenceParser.PLUS = 23;
sequenceParser.MINUS = 24;
sequenceParser.MULT = 25;
sequenceParser.DIV = 26;
sequenceParser.MOD = 27;
sequenceParser.POW = 28;
sequenceParser.NOT = 29;
sequenceParser.SCOL = 30;
sequenceParser.COMMA = 31;
sequenceParser.ASSIGN = 32;
sequenceParser.OPAR = 33;
sequenceParser.CPAR = 34;
sequenceParser.OBRACE = 35;
sequenceParser.CBRACE = 36;
sequenceParser.TRUE = 37;
sequenceParser.FALSE = 38;
sequenceParser.NIL = 39;
sequenceParser.IF = 40;
sequenceParser.ELSE = 41;
sequenceParser.WHILE = 42;
sequenceParser.RETURN = 43;
sequenceParser.NEW = 44;
sequenceParser.PAR = 45;
sequenceParser.GROUP = 46;
sequenceParser.OPT = 47;
sequenceParser.CRITICAL = 48;
sequenceParser.SECTION = 49;
sequenceParser.REF = 50;
sequenceParser.AS = 51;
sequenceParser.TRY = 52;
sequenceParser.CATCH = 53;
sequenceParser.FINALLY = 54;
sequenceParser.IN = 55;
sequenceParser.WRAPPER_DIRECTIVE = 56;
sequenceParser.STARTER_LXR = 57;
sequenceParser.ANNOTATION_RET = 58;
sequenceParser.ANNOTATION = 59;
sequenceParser.THEME_DIRECTIVE = 60;
sequenceParser.DOT = 61;
sequenceParser.ID = 62;
sequenceParser.INT = 63;
sequenceParser.FLOAT = 64;
sequenceParser.MONEY = 65;
sequenceParser.NUMBER_UNIT = 66;
sequenceParser.DIGIT_LEADING_NAME = 67;
sequenceParser.CSTRING = 68;
sequenceParser.USTRING = 69;
sequenceParser.CR = 70;
sequenceParser.COMMENT = 71;
sequenceParser.BLOCK_COMMENT = 72;
sequenceParser.HASH_COMMENT = 73;
sequenceParser.QUOTE_COMMENT = 74;
sequenceParser.OTHER = 75;
sequenceParser.DIVIDER = 76;
sequenceParser.EVENT_PAYLOAD_LXR = 77;
sequenceParser.EVENT_END = 78;
sequenceParser.TITLE_CONTENT = 79;
sequenceParser.TITLE_END = 80;
sequenceParser.EMOJI_SHORTCODE = 81;

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
sequenceParser.RULE_emoji = 12;
sequenceParser.RULE_block = 13;
sequenceParser.RULE_ret = 14;
sequenceParser.RULE_returnAsyncMessage = 15;
sequenceParser.RULE_divider = 16;
sequenceParser.RULE_dividerNote = 17;
sequenceParser.RULE_stat = 18;
sequenceParser.RULE_par = 19;
sequenceParser.RULE_opt = 20;
sequenceParser.RULE_critical = 21;
sequenceParser.RULE_section = 22;
sequenceParser.RULE_creation = 23;
sequenceParser.RULE_ref = 24;
sequenceParser.RULE_creationBody = 25;
sequenceParser.RULE_message = 26;
sequenceParser.RULE_messageBody = 27;
sequenceParser.RULE_fromTo = 28;
sequenceParser.RULE_func = 29;
sequenceParser.RULE_from = 30;
sequenceParser.RULE_to = 31;
sequenceParser.RULE_signature = 32;
sequenceParser.RULE_invocation = 33;
sequenceParser.RULE_assignment = 34;
sequenceParser.RULE_asyncMessage = 35;
sequenceParser.RULE_content = 36;
sequenceParser.RULE_construct = 37;
sequenceParser.RULE_type = 38;
sequenceParser.RULE_assignee = 39;
sequenceParser.RULE_methodName = 40;
sequenceParser.RULE_parameters = 41;
sequenceParser.RULE_parameter = 42;
sequenceParser.RULE_namedParameter = 43;
sequenceParser.RULE_declaration = 44;
sequenceParser.RULE_tcf = 45;
sequenceParser.RULE_tryBlock = 46;
sequenceParser.RULE_catchBlock = 47;
sequenceParser.RULE_finallyBlock = 48;
sequenceParser.RULE_alt = 49;
sequenceParser.RULE_ifBlock = 50;
sequenceParser.RULE_elseIfBlock = 51;
sequenceParser.RULE_elseBlock = 52;
sequenceParser.RULE_braceBlock = 53;
sequenceParser.RULE_loop = 54;
sequenceParser.RULE_expr = 55;
sequenceParser.RULE_atom = 56;
sequenceParser.RULE_parExpr = 57;
sequenceParser.RULE_condition = 58;
sequenceParser.RULE_inExpr = 59;
sequenceParser.RULE_textExpr = 60;

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

	name() {
	    return this.getTypedRuleContext(NameContext,0);
	};

	OBRACE() {
	    return this.getToken(sequenceParser.OBRACE, 0);
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

	CBRACE() {
	    return this.getToken(sequenceParser.CBRACE, 0);
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

	name() {
	    return this.getTypedRuleContext(NameContext,0);
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

	emoji() {
	    return this.getTypedRuleContext(EmojiContext,0);
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

	SCLOSE() {
	    return this.getToken(sequenceParser.SCLOSE, 0);
	};

	name = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(NameContext);
	    } else {
	        return this.getTypedRuleContext(NameContext,i);
	    }
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

	DIGIT_LEADING_NAME() {
	    return this.getToken(sequenceParser.DIGIT_LEADING_NAME, 0);
	};

	CSTRING() {
	    return this.getToken(sequenceParser.CSTRING, 0);
	};

	USTRING() {
	    return this.getToken(sequenceParser.USTRING, 0);
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



class EmojiContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_emoji;
    }

	LBRACKET() {
	    return this.getToken(sequenceParser.LBRACKET, 0);
	};

	name() {
	    return this.getTypedRuleContext(NameContext,0);
	};

	RBRACKET() {
	    return this.getToken(sequenceParser.RBRACKET, 0);
	};

	EMOJI_SHORTCODE() {
	    return this.getToken(sequenceParser.EMOJI_SHORTCODE, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterEmoji(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitEmoji(this);
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

	returnAsyncMessage() {
	    return this.getTypedRuleContext(ReturnAsyncMessageContext,0);
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



class ReturnAsyncMessageContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_returnAsyncMessage;
    }

	from() {
	    return this.getTypedRuleContext(FromContext,0);
	};

	RETURN_ARROW() {
	    return this.getToken(sequenceParser.RETURN_ARROW, 0);
	};

	to() {
	    return this.getTypedRuleContext(ToContext,0);
	};

	COL() {
	    return this.getToken(sequenceParser.COL, 0);
	};

	content() {
	    return this.getTypedRuleContext(ContentContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterReturnAsyncMessage(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitReturnAsyncMessage(this);
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

	ref() {
	    return this.getTypedRuleContext(RefContext,0);
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

	parExpr() {
	    return this.getTypedRuleContext(ParExprContext,0);
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

	parExpr() {
	    return this.getTypedRuleContext(ParExprContext,0);
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

	parExpr() {
	    return this.getTypedRuleContext(ParExprContext,0);
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



class RefContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_ref;
    }

	REF() {
	    return this.getToken(sequenceParser.REF, 0);
	};

	OPAR() {
	    return this.getToken(sequenceParser.OPAR, 0);
	};

	CPAR() {
	    return this.getToken(sequenceParser.CPAR, 0);
	};

	name = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(NameContext);
	    } else {
	        return this.getTypedRuleContext(NameContext,i);
	    }
	};

	SCOL() {
	    return this.getToken(sequenceParser.SCOL, 0);
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
	        listener.enterRef(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitRef(this);
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

	assignment() {
	    return this.getTypedRuleContext(AssignmentContext,0);
	};

	fromTo() {
	    return this.getTypedRuleContext(FromToContext,0);
	};

	func() {
	    return this.getTypedRuleContext(FuncContext,0);
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



class FromToContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_fromTo;
    }

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
	        listener.enterFromTo(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitFromTo(this);
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

	name() {
	    return this.getTypedRuleContext(NameContext,0);
	};

	emoji() {
	    return this.getTypedRuleContext(EmojiContext,0);
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

	name() {
	    return this.getTypedRuleContext(NameContext,0);
	};

	emoji() {
	    return this.getTypedRuleContext(EmojiContext,0);
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

	name() {
	    return this.getTypedRuleContext(NameContext,0);
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

	name() {
	    return this.getTypedRuleContext(NameContext,0);
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


	DIGIT_LEADING_NAME = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(sequenceParser.DIGIT_LEADING_NAME);
	    } else {
	        return this.getToken(sequenceParser.DIGIT_LEADING_NAME, i);
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


	CSTRING() {
	    return this.getToken(sequenceParser.CSTRING, 0);
	};

	USTRING() {
	    return this.getToken(sequenceParser.USTRING, 0);
	};

	NEW() {
	    return this.getToken(sequenceParser.NEW, 0);
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

	name() {
	    return this.getTypedRuleContext(NameContext,0);
	};

	emoji() {
	    return this.getTypedRuleContext(EmojiContext,0);
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

	namedParameter() {
	    return this.getTypedRuleContext(NamedParameterContext,0);
	};

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



class NamedParameterContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_namedParameter;
    }

	ASSIGN() {
	    return this.getToken(sequenceParser.ASSIGN, 0);
	};

	ID() {
	    return this.getToken(sequenceParser.ID, 0);
	};

	DIGIT_LEADING_NAME() {
	    return this.getToken(sequenceParser.DIGIT_LEADING_NAME, 0);
	};

	expr() {
	    return this.getTypedRuleContext(ExprContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterNamedParameter(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitNamedParameter(this);
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

	DIGIT_LEADING_NAME() {
	    return this.getToken(sequenceParser.DIGIT_LEADING_NAME, 0);
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

class MoneyAtomContext extends AtomContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	MONEY() {
	    return this.getToken(sequenceParser.MONEY, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterMoneyAtom(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitMoneyAtom(this);
		}
	}


}

sequenceParser.MoneyAtomContext = MoneyAtomContext;

class StringAtomContext extends AtomContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	CSTRING() {
	    return this.getToken(sequenceParser.CSTRING, 0);
	};

	USTRING() {
	    return this.getToken(sequenceParser.USTRING, 0);
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

class NumberUnitAtomContext extends AtomContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	NUMBER_UNIT() {
	    return this.getToken(sequenceParser.NUMBER_UNIT, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterNumberUnitAtom(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitNumberUnitAtom(this);
		}
	}


}

sequenceParser.NumberUnitAtomContext = NumberUnitAtomContext;

class DigitLeadingNameAtomContext extends AtomContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	DIGIT_LEADING_NAME() {
	    return this.getToken(sequenceParser.DIGIT_LEADING_NAME, 0);
	};

	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterDigitLeadingNameAtom(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitDigitLeadingNameAtom(this);
		}
	}


}

sequenceParser.DigitLeadingNameAtomContext = DigitLeadingNameAtomContext;

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

	textExpr() {
	    return this.getTypedRuleContext(TextExprContext,0);
	};

	emoji() {
	    return this.getTypedRuleContext(EmojiContext,0);
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

	IN() {
	    return this.getToken(sequenceParser.IN, 0);
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


	DIGIT_LEADING_NAME = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(sequenceParser.DIGIT_LEADING_NAME);
	    } else {
	        return this.getToken(sequenceParser.DIGIT_LEADING_NAME, i);
	    }
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



class TextExprContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = sequenceParser.RULE_textExpr;
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


	DIGIT_LEADING_NAME = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(sequenceParser.DIGIT_LEADING_NAME);
	    } else {
	        return this.getToken(sequenceParser.DIGIT_LEADING_NAME, i);
	    }
	};


	NUMBER_UNIT = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(sequenceParser.NUMBER_UNIT);
	    } else {
	        return this.getToken(sequenceParser.NUMBER_UNIT, i);
	    }
	};


	INT = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(sequenceParser.INT);
	    } else {
	        return this.getToken(sequenceParser.INT, i);
	    }
	};


	FLOAT = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(sequenceParser.FLOAT);
	    } else {
	        return this.getToken(sequenceParser.FLOAT, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.enterTextExpr(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof sequenceParserListener ) {
	        listener.exitTextExpr(this);
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
sequenceParser.EmojiContext = EmojiContext; 
sequenceParser.BlockContext = BlockContext; 
sequenceParser.RetContext = RetContext; 
sequenceParser.ReturnAsyncMessageContext = ReturnAsyncMessageContext; 
sequenceParser.DividerContext = DividerContext; 
sequenceParser.DividerNoteContext = DividerNoteContext; 
sequenceParser.StatContext = StatContext; 
sequenceParser.ParContext = ParContext; 
sequenceParser.OptContext = OptContext; 
sequenceParser.CriticalContext = CriticalContext; 
sequenceParser.SectionContext = SectionContext; 
sequenceParser.CreationContext = CreationContext; 
sequenceParser.RefContext = RefContext; 
sequenceParser.CreationBodyContext = CreationBodyContext; 
sequenceParser.MessageContext = MessageContext; 
sequenceParser.MessageBodyContext = MessageBodyContext; 
sequenceParser.FromToContext = FromToContext; 
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
sequenceParser.NamedParameterContext = NamedParameterContext; 
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
sequenceParser.TextExprContext = TextExprContext; 
