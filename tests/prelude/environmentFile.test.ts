const assert = require("assert");
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { test } = require("node:test");
const { environmentFile } = require("../../src/prelude/environmentFile.ts");

test("assigns each value double-quoted, one per line", () => {
  assert.strictEqual(environmentFile({ A: "one", B: "" }), 'A="one"\nB=""\n');
});

test("escapes the characters double quotes give a meaning", () => {
  assert.strictEqual(environmentFile({ A: 'a\\b"c$d`e' }), 'A="a\\\\b\\"c\\$d\\`e"\n');
});

test("a sourcing shell reads every value back verbatim", () => {
  const values = { PLAIN: "x y", TRICKY: "p$HOME \"q\" \\r `s` ${t} 'u'", EMPTY: "" };
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "nixbits-env-")), "file.env");
  fs.writeFileSync(file, environmentFile(values));
  for (const [name, value] of Object.entries(values)) {
    const read = execFileSync("bash", ["-c", 'set -a; . "$1"; printf %s "${!2}"', "_", file, name], {
      encoding: "utf8",
      // Nothing from this process's environment may leak into the values.
      env: { PATH: process.env.PATH },
    });
    assert.strictEqual(read, value, name);
  }
});

test("refuses names a shell cannot assign and values with line breaks", () => {
  for (const name of ["", "1A", "A-B", "A B"]) {
    assert.throws(() => environmentFile({ [name]: "x" }), /invalid environment variable name/);
  }
  assert.throws(() => environmentFile({ A: "one\ntwo" }), /A contains a line break/);
  assert.throws(() => environmentFile({ A: "one\rtwo" }), /A contains a line break/);
});
