const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { test } = require("node:test");
const { writeFileAtomic } = require("../../src/prelude/writeFileAtomic.ts");

const work = fs.mkdtempSync(path.join(os.tmpdir(), "writeFileAtomic-"));
const leftovers = (directory: string) => fs.readdirSync(directory).filter((name: string) => name.endsWith(".tmp"));

test("writes content, mode and owner, leaving no temporary file", () => {
  const target = path.join(work, "target");
  writeFileAtomic(target, "first\n");
  assert.strictEqual(fs.readFileSync(target, "utf8"), "first\n");
  assert.strictEqual(fs.statSync(target).mode & 0o7777, 0o600);
  writeFileAtomic(target, Buffer.from([0, 255]), { mode: 0o640, owner: process.getuid() + ":" + process.getgid() });
  assert.deepStrictEqual([...fs.readFileSync(target)], [0, 255]);
  assert.strictEqual(fs.statSync(target).mode & 0o7777, 0o640);
  assert.deepStrictEqual(leftovers(work), []);
});

test("replaces a symlink instead of writing through it", () => {
  const victim = path.join(work, "victim");
  const link = path.join(work, "link");
  fs.writeFileSync(victim, "untouched");
  fs.symlinkSync(victim, link);
  writeFileAtomic(link, "replaced");
  assert.strictEqual(fs.readFileSync(victim, "utf8"), "untouched");
  assert.strictEqual(fs.lstatSync(link).isSymbolicLink(), false);
  assert.strictEqual(fs.readFileSync(link, "utf8"), "replaced");
});

test("removes its temporary file when the rename fails", () => {
  const directory = path.join(work, "directory");
  fs.mkdirSync(path.join(directory, "occupied"), { recursive: true });
  fs.writeFileSync(path.join(directory, "occupied", "keep"), "");
  assert.throws(() => writeFileAtomic(path.join(directory, "occupied"), "x"));
  assert.deepStrictEqual(leftovers(directory), []);
});

test("fails before creating anything for an unknown owner", () => {
  const never = path.join(work, "never");
  assert.throws(() => writeFileAtomic(never, "x", { owner: "nixbits-no-such-user" }), /no such user/);
  assert.strictEqual(fs.existsSync(never), false);
  assert.deepStrictEqual(leftovers(work), []);
});
