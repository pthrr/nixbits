# Every check: tests/<name>.nix as <name>, and tests/prelude/<global>.test.ts
# as prelude-<global>, run with node:test against the modules in the store.
# Each module in src/prelude has to have a test.
{ pkgs }:
let
  inherit (pkgs) lib;
  prelude = import ../src/prelude { inherit pkgs; };

  namesEnding =
    suffix: directory:
    map (lib.removeSuffix suffix) (
      lib.filter (lib.hasSuffix suffix) (lib.attrNames (builtins.readDir directory))
    );

  nixTests = lib.genAttrs (lib.remove "default" (namesEnding ".nix" ./.)) (
    name: import (./. + "/${name}.nix") { inherit pkgs; }
  );

  preludeTestNames = namesEnding ".test.ts" ./prelude;
  untested = lib.subtractLists preludeTestNames prelude.names;

  # The test sits where it does in the repository, beside src/prelude, so its
  # relative requires resolve. Tools come in through the environment.
  preludeTest =
    name:
    pkgs.runCommand "nixbits-prelude-${name}" { HTPASSWD = "${pkgs.apacheHttpd}/bin/htpasswd"; } ''
      mkdir -p src tests/prelude
      ln -s ${prelude.modules} src/prelude
      cp ${./prelude + "/${name}.test.ts"} tests/prelude/${name}.test.ts
      ${pkgs.nodejs}/bin/node --experimental-strip-types --disable-warning=ExperimentalWarning \
        --test tests/prelude/${name}.test.ts
      touch $out
    '';
in
assert lib.assertMsg (untested == [ ]) "prelude modules without a test: ${toString untested}";
nixTests
// lib.listToAttrs (
  map (name: lib.nameValuePair "prelude-${name}" (preludeTest name)) preludeTestNames
)
