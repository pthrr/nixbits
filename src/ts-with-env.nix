# `ts`, run after sourcing a shell env file with every assignment exported.
# envFile lands inside double quotes, so it may name a variable such as
# "$SECRETS_ENV" as well as a path. Returns a script path: an ExecStart, or
# a command from another script whose shell then never sees the values.
{ pkgs, ts }:
envFile: code:
"${pkgs.writeShellScript "nixbits-env-script" ''
  set -e
  set -a
  . "${envFile}"
  set +a
  exec ${ts code} "$@"
''}"
