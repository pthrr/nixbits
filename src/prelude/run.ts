const { execFileSync } = require("child_process");

/** Runs a command without a shell, inheriting output and environment; throws if it fails. */
const run = (cmd: string, ...args: string[]) => execFileSync(cmd, args, { stdio: "inherit" });

module.exports = { run };
