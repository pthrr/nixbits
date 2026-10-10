const assert = require("assert");
const { test } = require("node:test");
const { requireEnv } = require("../../src/prelude/requireEnv.ts");

test("returns a set variable, even an empty one", () => {
  process.env.NIXBITS_SET = "";
  assert.strictEqual(requireEnv("NIXBITS_SET"), "");
});

test("names a variable that is not set", () => {
  delete process.env.NIXBITS_UNSET;
  assert.throws(() => requireEnv("NIXBITS_UNSET"), /NIXBITS_UNSET is not set/);
});
