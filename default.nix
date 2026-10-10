# Entry point for a plain import: `import ./nixbits { inherit pkgs; }`. Pass
# only `lib` instead for the evaluation-time helpers before any pkgs exists.
{
  pkgs ? throw "nixbits: pass pkgs to use ts and tsWithEnv",
  lib ? pkgs.lib,
}:
rec {
  parseEnvFile = import ./src/parse-env-file.nix { inherit lib; };
  ts = import ./src/ts.nix { inherit pkgs; };
  tsWithEnv = import ./src/ts-with-env.nix { inherit pkgs ts; };
}
