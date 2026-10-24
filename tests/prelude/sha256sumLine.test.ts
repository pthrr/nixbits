const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { test } = require("node:test");
const { sha256sumLine } = require("../../src/prelude/sha256sumLine.ts");

const work = fs.mkdtempSync(path.join(os.tmpdir(), "sha256sumLine-"));

test("prints the line sha256sum prints, escapes included", () => {
  for (const name of ["plain", "back\\slash", "new\nline", "car\rriage", "two  spaces"]) {
    const file = path.join(work, name);
    fs.writeFileSync(file, name);
    assert.strictEqual(sha256sumLine(file), execFileSync("sha256sum", [file], { encoding: "utf8" }));
  }
});

test("throws for a file it cannot read", () => {
  assert.throws(() => sha256sumLine(path.join(work, "missing")), /cannot read/);
});
