{ pkgs }:

let
  nodeLib = import ../default.nix { inherit pkgs; };
in
pkgs.runCommand "nixbits-smoke" { } ''
  ${nodeLib.ts ''
    run("true");
    const message: string = "ok\n";
    require("fs").writeFileSync(process.env.out, message);
  ''}
''
