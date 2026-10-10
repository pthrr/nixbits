{ pkgs }:

let
  nixbits = import ../. { inherit pkgs; };

  envFile = pkgs.writeText "nixbits-test.env" ''
    PLAIN=value
    QUOTED="two words"
    LITERAL='kept $AS_IS'
  '';

  script = nixbits.tsWithEnv "$NIXBITS_ENV" ''
    const assert = require("assert");
    assert.strictEqual(requireEnv("PLAIN"), "value");
    assert.strictEqual(requireEnv("QUOTED"), "two words");
    assert.strictEqual(requireEnv("LITERAL"), "kept $AS_IS");
    assert.deepStrictEqual(process.argv.slice(2), ["a b", "c"]);
    require("fs").writeFileSync(process.env.out, "ok\n");
  '';
in
pkgs.runCommand "nixbits-ts-with-env" { } ''
  NIXBITS_ENV=${envFile} ${script} "a b" c

  # A missing env file stops the script before node starts.
  if NIXBITS_ENV=/nonexistent ${script} "a b" c 2>/dev/null; then
    echo "a missing env file was not fatal" >&2
    exit 1
  fi
''
