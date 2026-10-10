const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { test } = require("node:test");

const mainModule = require.resolve("../../src/prelude/main.ts");

// Runs `body` as main's argument in a script of its own, since main decides
// how that process exits.
const runMain = (body: string): { status: number | null; stderr: string } => {
  const script = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "main-")), "script.ts");
  fs.writeFileSync(script, "const { main } = require(" + JSON.stringify(mainModule) + ");\nmain(" + body + ");\n");
  return spawnSync(process.execPath, ["--experimental-strip-types", "--disable-warning=ExperimentalWarning", script], {
    encoding: "utf8",
  });
};

test("exits 0 once the body finishes", () => {
  assert.strictEqual(runMain("async () => { await new Promise((resolve) => setTimeout(resolve, 10)); }").status, 0);
});

test("leaves an early process.exit alone", () => {
  assert.strictEqual(runMain("async () => { process.exit(0); }").status, 0);
});

test("exits 1 with the error when the body rejects", () => {
  const result = runMain('async () => { throw new Error("boom"); }');
  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /boom/);
});

test("exits 1 when nothing is left to settle the body", () => {
  const result = runMain("() => new Promise(() => {})");
  assert.strictEqual(result.status, 1);
  assert.match(result.stderr, /stopped before finishing/);
});
