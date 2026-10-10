const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { test } = require("node:test");
const { htpasswdEntry } = require("../../src/prelude/htpasswdEntry.ts");

const htpasswd = process.env.HTPASSWD ?? "htpasswd";
const passwords = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "htpasswdEntry-")), "passwords");

const verifies = (password: string): boolean => {
  try {
    execFileSync(htpasswd, ["-v", "-i", passwords, "alice"], { input: password + "\n", stdio: ["pipe", "ignore", "ignore"] });
    return true;
  } catch {
    return false;
  }
};

test("writes a bcrypt line at the given cost that htpasswd verifies", () => {
  for (const cost of [5, 12]) {
    const entry = htpasswdEntry(htpasswd, "alice", "pass word", cost);
    assert.match(entry, new RegExp("^alice:\\$2y\\$" + String(cost).padStart(2, "0") + "\\$"));
    fs.writeFileSync(passwords, entry);
    assert.strictEqual(verifies("pass word"), true);
    assert.strictEqual(verifies("wrong"), false);
  }
});

test("rejects a cost htpasswd does not accept", () => {
  for (const cost of [3, 18, 12.5]) {
    assert.throws(() => htpasswdEntry(htpasswd, "alice", "x", cost), /cost must be an integer from 4 to 17/);
  }
});
