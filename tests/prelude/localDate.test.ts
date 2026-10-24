const assert = require("assert");
const { execFileSync } = require("child_process");
const { test } = require("node:test");
const { localDate } = require("../../src/prelude/localDate.ts");

// Run with TZDIR set (tests/default.nix), so date resolves the zones.
test("matches date +%Y%m%d across midnight and DST changes", () => {
  for (const zone of ["UTC", "Europe/Berlin", "America/St_Johns"]) {
    process.env.TZ = zone;
    for (const seconds of [0, 1719842706, 1735689599, 1743296400, 1761436800]) {
      const expected = execFileSync("date", ["-d", "@" + seconds, "+%Y%m%d"], {
        env: { ...process.env, TZ: zone },
        encoding: "utf8",
      }).trimEnd();
      assert.strictEqual(localDate(new Date(seconds * 1000)), expected, zone + " " + seconds);
    }
  }
  delete process.env.TZ;
});

test("defaults to now", () => {
  assert.match(localDate(), /^[0-9]{8}$/);
});
