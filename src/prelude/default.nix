# The prelude every `ts` script starts with: one global per module in this
# directory, named after its file, plus `execFileSync`. Each module is
# CommonJS with erasable annotations, so its own requires stay out of the
# script's scope and a script can still declare fs, path and the like.
{ pkgs }:
let
  inherit (pkgs) lib;

  # getent resolves owner names through NSS. Linux only: elsewhere `getent`
  # is looked up on PATH, and owners have to be numeric where it is missing.
  getent = if pkgs.stdenv.hostPlatform.isLinux then "${pkgs.getent}/bin/getent" else "getent";

  src = lib.fileset.toSource {
    root = ./.;
    fileset = lib.fileset.fileFilter (file: file.hasExt "ts") ./.;
  };
in
rec {
  names = map (lib.removeSuffix ".ts") (
    lib.filter (lib.hasSuffix ".ts") (lib.attrNames (builtins.readDir ./.))
  );

  # The modules in the store, with tool paths filled in.
  modules = pkgs.runCommand "nixbits-prelude" { } ''
    cp -r --no-preserve=mode ${src} $out
    substituteInPlace $out/chown.ts --replace-fail @getent@ ${getent}
  '';

  source = ''
    const { execFileSync } = require("child_process");
  ''
  + lib.concatMapStrings (name: ''
    const { ${name} } = require("${modules}/${name}.ts");
  '') names;
}
