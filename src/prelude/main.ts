/**
 * Runs an async script body. A rejection prints the error and exits 1. So
 * does an event loop that drains while the body is still pending: a promise
 * nothing can settle any more would otherwise end the script with 0.
 */
const main = (body: () => Promise<void>): void => {
  let settled = false;
  process.once("beforeExit", () => {
    if (!settled) {
      console.error("script stopped before finishing: nothing was left to settle its promise");
      process.exitCode = 1;
    }
  });
  body().then(
    () => {
      settled = true;
    },
    (error: unknown) => {
      console.error(error);
      process.exit(1);
    },
  );
};

module.exports = { main };
