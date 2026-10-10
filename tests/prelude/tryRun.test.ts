const assert = require("assert");
const { test } = require("node:test");
const { tryRun } = require("../../src/prelude/tryRun.ts");

test("reports success instead of throwing", () => {
  assert.strictEqual(tryRun("true"), true);
  assert.strictEqual(tryRun("false"), false);
  assert.strictEqual(tryRun("/nonexistent/command"), false);
});
