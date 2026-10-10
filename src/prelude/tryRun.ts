const { run } = require("./run.ts");

/** `run` that reports failure as false instead of throwing, like `if cmd`. */
const tryRun = (cmd: string, ...args: string[]): boolean => {
  try {
    run(cmd, ...args);
    return true;
  } catch {
    return false;
  }
};

module.exports = { tryRun };
