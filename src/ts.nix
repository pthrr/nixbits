# A shell command that runs `code` as a TypeScript file, after the prelude.
# Node strips erasable syntax without type checking and is told to stay quiet
# about that being experimental, which would otherwise open every run's log.
{ pkgs }:
let
  prelude = import ./prelude { inherit pkgs; };
in
code:
"${pkgs.nodejs}/bin/node --experimental-strip-types --disable-warning=ExperimentalWarning ${
  pkgs.writeText "nixbits-script.ts" (prelude.source + code)
}"
