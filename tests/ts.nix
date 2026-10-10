# A script runs with every prelude global bound and its type annotations
# stripped, and can still declare the modules the prelude itself uses.
{ pkgs }:
let
  inherit (pkgs) lib;
  nixbits = import ../. { inherit pkgs; };
  inherit (import ../src/prelude { inherit pkgs; }) names;
in
pkgs.runCommand "nixbits-ts" { } (
  nixbits.ts (
    ''
      const assert = require("assert");
      const fs = require("fs");
      const path = require("path");
      const crypto = require("crypto");
      const { spawnSync } = require("child_process");

      assert.strictEqual(typeof execFileSync, "function");
    ''
    + lib.concatMapStrings (name: ''
      assert.strictEqual(typeof ${name}, "function");
    '') names
    + ''
      run("true");
      const message: string = "ok\n";
      fs.writeFileSync(process.env.out, message);
    ''
  )
)
