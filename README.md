# nixbits

Small Nix helpers that use the caller's `pkgs`.

## Node.js scripts

Import `default.nix` from a regular Nix expression:

```nix
let
  nixbitsLib = import ./nixbits { inherit pkgs; };
in
nixbitsLib.ts ''
  run("echo", "hello");
''
```

`ts` returns a shell command that runs a generated TypeScript file. Node.js
strips erasable TypeScript syntax such as type annotations without type
checking. The file is CommonJS, so wrap `await` in an async function.

`tsWithEnv envFile code` returns the path of a script that sources a shell env
file with every assignment exported (`set -a`) and then runs `ts code`, passing
its arguments on. `envFile` is placed in double quotes, so it can be a path or
a variable such as `"$SECRETS_ENV"`. A missing file stops the script before
Node.js starts. Use it as a systemd `ExecStart`, or call it from another script
whose own shell then never holds the values.

Every script starts with a prelude that defines these globals, one module each
in [src/prelude](src/prelude), named after the global and documented there.

| global               | does                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| `execFileSync`       | from `child_process`                                                     |
| `run`                | runs a command without a shell; inherits output and environment          |
| `main`               | runs an async body; exits 1 on rejection or if it can never finish       |
| `tryRun`             | `run`, returning whether it succeeded instead of throwing                |
| `succeeds`           | whether a command exits 0, output discarded                              |
| `requireEnv`         | an environment variable, or an error naming it                           |
| `chown`              | chown(1)-style `user:group`, names resolved through NSS (getent)         |
| `writeFileAtomic`    | temp file, mode and owner set on the descriptor, rename; never follows   |
| `htpasswdEntry`      | bcrypt htpasswd line at a given cost; takes the `htpasswd` binary's path |
| `sha256File`         | hex SHA-256 of a file of any size                                        |
| `retry`              | up to N attempts of a sync or async check, a fixed delay apart           |
| `httpOk`             | whether a URL answers below 400, as `curl -sf` judges it                 |

Everything here is used by more than one script, and none is a one-liner a
caller could write as easily itself (`run` excepted: it predates that rule). The
prelude declares nothing else at top level, so a script is free to
`const fs = require("fs")` and the like. Only getent enters a script's closure
through it; tools such as `htpasswd` are passed in by the caller.

For a flake consumer, use `inputs.nixbits.lib.mkNodeLib pkgs`. The helper uses
the consumer's `pkgs`; the flake's pinned `nixpkgs` input is used only for its
development shell and checks.

## Env files at evaluation time

`parseEnvFile path` reads a dotenv file into an attrset during evaluation:
`KEY=value` lines, an optional `export `, comments, and single or double
quotes. It needs only `lib`, so it is also available before any `pkgs` exists:

```nix
(import ./nixbits { inherit (nixpkgs) lib; }).parseEnvFile ./app.env
```

The flake's `lib.parseEnvFile` is the same function.

## Layout

`flake.nix` and `default.nix` are the entry points and only wire things up.
Each primitive has one source file and one test file at the matching path:

| primitive        | source                         | test                                  |
| ---------------- | ------------------------------ | ------------------------------------- |
| `parseEnvFile`   | `src/parse-env-file.nix`       | `tests/parse-env-file.nix`            |
| `ts`             | `src/ts.nix`                   | `tests/ts.nix`                        |
| `tsWithEnv`      | `src/ts-with-env.nix`          | `tests/ts-with-env.nix`               |
| prelude `<name>` | `src/prelude/<name>.ts`        | `tests/prelude/<name>.test.ts`        |

[tests/default.nix](tests/default.nix) turns every test file into a flake
check (`<name>` or `prelude-<name>`), so a new primitive needs no
registration beyond `git add`, which the flake needs to see a file. A
prelude module without a test fails evaluation. Prelude
tests use `node:test` and require their module directly.

## Development

Enter the tool environment with `nix develop`. Run `task ci` to check Nix
formatting and build the flake's checks. Run `task fmt` to format the Nix
files.

Run `pre-commit install` once from this repository to enable the local commit
hook. It runs `task ci` before each commit. `pre-commit run --all-files` runs
the same check on demand.
