{ pkgs }:

let
  prelude = ''
    const { execFileSync } = require("child_process");

    const HOME = process.env.HOME;
    const run = (cmd, ...args) => execFileSync(cmd, args, { stdio: "inherit" });
  '';
in
{
  ts =
    code:
    "${pkgs.nodejs}/bin/node --experimental-strip-types ${
      pkgs.writeText "nixbits-script.ts" (prelude + code)
    }";
}
