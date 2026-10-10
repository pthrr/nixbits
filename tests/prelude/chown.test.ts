const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { test } = require("node:test");
const { chown } = require("../../src/prelude/chown.ts");

const uid = process.getuid();
const gid = process.getgid();
const owned = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "chown-")), "owned");
fs.writeFileSync(owned, "");

// The name an id has in a passwd-style file, looked up the way getent would.
const nameOf = (file: string, id: number): string =>
  fs
    .readFileSync(file, "utf8")
    .split("\n")
    .map((line: string) => line.split(":"))
    .find((fields: string[]) => Number(fields[2]) === id)?.[0];

test("takes owners by number, by name, or only one half", () => {
  chown(owned, uid + ":" + gid);
  chown(owned, nameOf("/etc/passwd", uid) + ":" + nameOf("/etc/group", gid));
  chown(owned, ":" + gid);
  chown(owned, String(uid));
  assert.strictEqual(fs.statSync(owned).uid, uid);
});

test("names an unknown user or group", () => {
  assert.throws(() => chown(owned, "nixbits-no-such-user"), /no such user: nixbits-no-such-user/);
  assert.throws(() => chown(owned, uid + ":nixbits-no-such-group"), /no such group: nixbits-no-such-group/);
});
