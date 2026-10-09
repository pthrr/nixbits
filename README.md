# nixbits

Small Nix helpers that use the caller's `pkgs`.

## Node.js scripts

Import `default.nix` from a regular Nix expression:

```nix
let
  nodeLib = import ./nixbits { inherit pkgs; };
in
nodeLib.ts ''
  run("echo", "hello");
''
```

`ts` returns a shell command that runs a generated TypeScript file. Its prelude
provides `HOME` and `run(command, ...args)`. `run` executes without a shell and
inherits standard output, standard error, and the current environment. Node.js
strips erasable TypeScript syntax such as type annotations without type checking.

For a flake consumer, use `inputs.nixbits.lib.mkNodeLib pkgs`. The helper uses
the consumer's `pkgs`; the flake's pinned `nixpkgs` input is used only for its
development shell and checks.

## Development

Enter the tool environment with `nix develop`. Run `task ci` to check Nix
formatting and build the flake's smoke check. Run `task fmt` to format the Nix
files.

Run `pre-commit install` once from this repository to enable the local commit
hook. It runs `task ci` before each commit. `pre-commit run --all-files` runs
the same check on demand.
