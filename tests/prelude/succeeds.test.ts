const assert = require("assert");
const { test } = require("node:test");
const { succeeds } = require("../../src/prelude/succeeds.ts");

test("tells whether a command exits 0", () => {
  assert.strictEqual(succeeds("true"), true);
  assert.strictEqual(succeeds("false"), false);
  assert.strictEqual(succeeds("/nonexistent/command"), false);
});
