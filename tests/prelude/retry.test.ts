const assert = require("assert");
const { test } = require("node:test");
const { retry } = require("../../src/prelude/retry.ts");

test("waits the delay between attempts, then gives up", async () => {
  const started = Date.now();
  assert.strictEqual(await retry(2, 60, () => false), false);
  assert.ok(Date.now() - started >= 55);
});

test("stops at the first pass", async () => {
  let calls = 0;
  assert.strictEqual(await retry(5, 10, () => ++calls === 3), true);
  assert.strictEqual(calls, 3);
});

test("awaits an async check and makes exactly the attempts", async () => {
  let calls = 0;
  assert.strictEqual(await retry(2, 10, async () => (++calls, false)), false);
  assert.strictEqual(calls, 2);
});
