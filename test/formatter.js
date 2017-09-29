import { expect } from "chai";

import { Alignment } from "../lib/alignment";
import { Table } from "../lib/table.js";
import { readTable } from "../lib/parser.js";
import {
  _delimiterText,
  _extendArray,
  completeTable,
  _computeWidth,
  _align
} from "../lib/formatter.js";

/**
 * @test {_delimiterText}
 */
describe("_delimiterText(width, alignment)", () => {
  it("should return a delimiter text for the specified alignment", () => {
    expect(_delimiterText(5, Alignment.DEFAULT)).to.equal(" ----- ");
    expect(_delimiterText(5, Alignment.LEFT)).to.equal(":----- ");
    expect(_delimiterText(5, Alignment.RIGHT)).to.equal(" -----:");
    expect(_delimiterText(5, Alignment.CENTER)).to.equal(":-----:");
  });

  it("should throw an error if the alignment is unknown", () => {
    expect(() => { _delimiterText(5, "top"); }).to.throw(Error, /unknown/i);
  });
});

/**
 * @test {_extendArray}
 */
describe("_extendArray(arr, size, callback)", () => {
  it("should create a new array that is extended to the specified size, filling empty elements by return values of the callback", () => {
    expect(_extendArray([], 2, i => i)).to.deep.equal([0, 1]);
    expect(_extendArray([0, 1], 4, i => i)).to.deep.equal([0, 1, 2, 3]);
    expect(_extendArray([0, 1, 2, 3], 2, i => i)).to.deep.equal([0, 1, 2, 3]);
  });
});

/**
 * @test {completeTable}
 */
describe("completeTable(table, options)", () => {
  it("should complete the given table by adding missing delimiter and cells", () => {
    {
      const tableText =
          "| A | B |\n"
        + "| --- |:----- |\n"
        + "  | C | D |  ";
      const expectText =
          "| A | B |\n"
        + "| --- |:----- |\n"
        + "  | C | D |  ";
      const table = readTable(tableText.split("\n"));
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toText()).to.equal(expectText);
      expect(completed.delimiterInserted).to.be.false;
    }
    {
      const tableText =
          "| A |\n"
        + "| --- |:----- |\n"
        + "  | C | D |  ";
      const expectText =
          "| A ||\n"
        + "| --- |:----- |\n"
        + "  | C | D |  ";
      const table = readTable(tableText.split("\n"));
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toText()).to.equal(expectText);
      expect(completed.delimiterInserted).to.be.false;
    }
    {
      const tableText =
          "| A | B |\n"
        + "| --- |\n"
        + "  | C | D |  ";
      const expectText =
          "| A | B |\n"
        + "| --- | --- |\n"
        + "  | C | D |  ";
      const table = readTable(tableText.split("\n"));
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toText()).to.equal(expectText);
      expect(completed.delimiterInserted).to.be.false;
    }
    {
      const tableText =
          "| A | B |\n"
        + "  | C | D |  ";
      const expectText =
          "| A | B |\n"
        + "| --- | --- |\n"
        + "  | C | D |  ";
      const table = readTable(tableText.split("\n"));
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toText()).to.equal(expectText);
      expect(completed.delimiterInserted).to.be.true;
    }
    {
      const tableText =
          "| A | B |\n"
        + "| --- |:----- |\n"
        + "  | C |";
      const expectText =
          "| A | B |\n"
        + "| --- |:----- |\n"
        + "  | C ||";
      const table = readTable(tableText.split("\n"));
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toText()).to.equal(expectText);
      expect(completed.delimiterInserted).to.be.false;
    }
    {
      const tableText =
          "| A | B |\n"
        + "| --- |:----- |\n"
        + "  | C |  ";
      const expectText =
          "| A | B |\n"
        + "| --- |:----- |\n"
        + "  | C |  |";
      const table = readTable(tableText.split("\n"));
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toText()).to.equal(expectText);
      expect(completed.delimiterInserted).to.be.false;
    }
    {
      const tableText =
          "|\n"
        + "|\n"
        + " |  ";
      const expectText =
          "||\n"
        + "| --- |\n"
        + "||\n"
        + " |  |";
      const table = readTable(tableText.split("\n"));
      const completed = completeTable(table, { delimiterWidth: 3 });
      expect(completed).to.be.an("object");
      expect(completed.table).to.be.an.instanceOf(Table);
      expect(completed.table.toText()).to.equal(expectText);
      expect(completed.delimiterInserted).to.be.true;
    }
  });

  it("should throw an error if table has no rows", () => {
    const table = new Table([]);
    expect(() => { completeTable(table,  { delimiterWidth: 3 }); }).to.throw(Error, /empty/i);
  });
});

/**
 * @test {_computeWidth}
 */
describe("_computeWidth(text, options)", () => {
  it("should compute the width of a text based on EAW properties", () => {
    {
      const options = {
        normalize      : false,
        wideChars      : new Set(),
        narrowChars    : new Set(),
        ambiguousAsWide: false
      };
      expect(_computeWidth("ℵAあＡｱ∀", options)).to.equal(8);
      expect(_computeWidth("\u0065\u0301", options)).to.equal(2);
    }
    {
      const options = {
        normalize      : false,
        wideChars      : new Set(),
        narrowChars    : new Set(),
        ambiguousAsWide: true
      };
      expect(_computeWidth("ℵAあＡｱ∀", options)).to.equal(9);
    }
    {
      const options = {
        normalize      : false,
        wideChars      : new Set(["∀"]),
        narrowChars    : new Set(),
        ambiguousAsWide: false
      };
      expect(_computeWidth("ℵAあＡｱ∀", options)).to.equal(9);
    }
    {
      const options = {
        normalize      : false,
        wideChars      : new Set(),
        narrowChars    : new Set(["∀"]),
        ambiguousAsWide: true
      };
      expect(_computeWidth("ℵAあＡｱ∀", options)).to.equal(8);
    }
    {
      const options = {
        normalize      : true,
        wideChars      : new Set(),
        narrowChars    : new Set(),
        ambiguousAsWide: false
      };
      expect(_computeWidth("\u0065\u0301", options)).to.equal(1);
    }
  });
});

/**
 * @test {_align}
 */
describe("_align(text, alignment, options)", () => {
  it("should align the text", () => {
    {
      const options = {
        width           : 5,
        defaultAlignment: Alignment.LEFT,
        normalize       : false,
        wideChars       : new Set(),
        narrowChars     : new Set(),
        ambiguousAsWide : false
      };
      expect(_align("foo", Alignment.DEFAULT, options)).to.equal("foo  ");
      expect(_align("foo", Alignment.LEFT, options)).to.equal("foo  ");
      expect(_align("foo", Alignment.RIGHT, options)).to.equal("  foo");
      expect(_align("foo", Alignment.CENTER, options)).to.equal(" foo ");

      expect(_align("foobar", Alignment.DEFAULT, options)).to.equal("foobar");
      expect(_align("foobar", Alignment.LEFT, options)).to.equal("foobar");
      expect(_align("foobar", Alignment.RIGHT, options)).to.equal("foobar");
      expect(_align("foobar", Alignment.CENTER, options)).to.equal("foobar");

      expect(_align("∀", Alignment.LEFT, options)).to.equal("∀    ");
      expect(_align("\u0065\u0301", Alignment.LEFT, options)).to.equal("\u0065\u0301   ");
    }
    {
      const options = {
        width           : 7,
        defaultAlignment: Alignment.LEFT,
        normalize       : false,
        wideChars       : new Set(),
        narrowChars     : new Set(),
        ambiguousAsWide : false
      };
      expect(_align("foo", Alignment.DEFAULT, options)).to.equal("foo    ");
      expect(_align("foo", Alignment.LEFT, options)).to.equal("foo    ");
      expect(_align("foo", Alignment.RIGHT, options)).to.equal("    foo");
      expect(_align("foo", Alignment.CENTER, options)).to.equal("  foo  ");
    }
    {
      const options = {
        width           : 5,
        defaultAlignment: Alignment.RIGHT,
        normalize       : false,
        wideChars       : new Set(),
        narrowChars     : new Set(),
        ambiguousAsWide : false
      };
      expect(_align("foo", Alignment.DEFAULT, options)).to.equal("  foo");
    }
    {
      const options = {
        width           : 5,
        defaultAlignment: Alignment.LEFT,
        normalize       : false,
        wideChars       : new Set(),
        narrowChars     : new Set(),
        ambiguousAsWide : true
      };
      expect(_align("∀", Alignment.LEFT, options)).to.equal("∀   ");
    }
    {
      const options = {
        width           : 5,
        defaultAlignment: Alignment.LEFT,
        normalize       : false,
        wideChars       : new Set("∀"),
        narrowChars     : new Set(),
        ambiguousAsWide : false
      };
      expect(_align("∀", Alignment.LEFT, options)).to.equal("∀   ");
    }
    {
      const options = {
        width           : 5,
        defaultAlignment: Alignment.LEFT,
        normalize       : false,
        wideChars       : new Set(),
        narrowChars     : new Set("∀"),
        ambiguousAsWide : true
      };
      expect(_align("∀", Alignment.LEFT, options)).to.equal("∀    ");
    }
    {
      const options = {
        width           : 5,
        defaultAlignment: Alignment.LEFT,
        normalize       : true,
        wideChars       : new Set(),
        narrowChars     : new Set(),
        ambiguousAsWide : false
      };
      expect(_align("\u0065\u0301", Alignment.LEFT, options)).to.equal("\u0065\u0301    ");
    }
  });

  it("should throw an error if the alignment is unknown", () => {
    const options = {
      width           : 5,
      defaultAlignment: Alignment.LEFT,
      normalize       : false,
      wideChars       : new Set(),
      narrowChars     : new Set(),
      ambiguousAsWide : false
    };
    expect(() => { _align("foo", "top", options); }).to.throw(Error, /unknown/i);
  });

  it("should throw an error if the default alignment is wrongly specified", () => {
    const options = {
      width           : 5,
      defaultAlignment: Alignment.DEFAULT,
      normalize       : false,
      wideChars       : new Set(),
      narrowChars     : new Set(),
      ambiguousAsWide : false
    };
    expect(() => { _align("foo", Alignment.DEFAULT, options); }).to.throw(Error, /default/i);
  });
});