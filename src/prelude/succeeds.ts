const { execFileSync } = require("child_process");

/** Whether a command exits 0. All of its output is discarded. */
const succeeds = (cmd: string, ...args: string[]): boolean => {
  try {
    execFileSync(cmd, args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

module.exports = { succeeds };
