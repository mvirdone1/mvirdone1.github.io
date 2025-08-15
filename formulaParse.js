const testString = "=IF(A1>100, SUM(B1:B10), AVERAGE (C1:C10))";

/*
=VLOOKUP(D2, Table1, 3, FALSE)
=INDEX(A1:D10, MATCH(50, B1:B10, 0), 2)
=IF(AND   
(A1>50, B1<20), MAX(C1:C5), MIN(D1:D5))
=LET(x, A1*B1, y, x+C1, SQRT(y))
=CHOOSE(MATCH(D1, {"Low","Medium","High"},0), 10, 20, 30)
=INDIRECT("Sheet2!A"&ROW(A1))
=TEXTJOIN(", ", TRUE, A1:A5)
=SUMIFS(A1:A10, B1:B10, ">100", C1:C10, "<50")
=IFNA(VLOOKUP(E1, F1:G10, 2, FALSE), "Not Found")
=TRANSPOSE(A1:A5)
=XLOOKUP(100, A1:A10, B1:B10, "Not Found", 0, 1)
=COUNTIFS(A1:A10, ">50", B1:B10, "<100")
=SEQUENCE(5, 1, 100, 10)
=RANDARRAY(3,3,1,100,TRUE)
=FILTER(A1:C10, B1:B10>50)
=UNIQUE(A1:A20)
=SORT(A1:A20, 1, -1)
=SUM(A1:A10) + SUM(B1:B10) / COUNT(C1:C10)
=IFERROR(1/0, "Error")
*/

const anyFunctionRegex = /^\s*[a-zA-Z_]+[\s^$]*\(/gm;

functionStructure = {};

const formulaString = testString;
parseWholeFormula(formulaString, functionStructure);

function parseWholeFormula(formulaString, functionStructure) {
  // First see if it starts with an equal sign, and then throw it away
  if (formulaString.charAt(0) === "=") {
    console.log("Found starting equals sign");
  } else {
    return false;
  }

  // See if there's a function at the start of the remaining string
  if (anyFunctionRegex.test(formulaString)) {
  }
}
