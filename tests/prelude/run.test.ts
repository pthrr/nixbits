const assert = require("assert");
const { test } = require("node:test");
const { run } = require("../../src/prelude/run.ts");

test("runs a command and throws when it fails", () => {
  run("true");
  assert.throws(() => run("false"));
  assert.throws(() => run("/nonexistent/command"));
});
