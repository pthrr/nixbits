const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { test } = require("node:test");
const { sha256File } = require("../../src/prelude/sha256File.ts");

const work = fs.mkdtempSync(path.join(os.tmpdir(), "sha256File-"));

test("hashes a small file", () => {
  const small = path.join(work, "small");
  fs.writeFileSync(small, "abc");
  assert.strictEqual(sha256File(small), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("hashes a file larger than one read", () => {
  const large = path.join(work, "large");
  const content = crypto.randomBytes(3 * (1 << 20) + 17);
  fs.writeFileSync(large, content);
  assert.strictEqual(sha256File(large), crypto.createHash("sha256").update(content).digest("hex"));
});

test("returns null for a file it cannot open", () => {
  assert.strictEqual(sha256File(path.join(work, "missing")), null);
});
