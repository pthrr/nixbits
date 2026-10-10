const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Up to `attempts` runs of `check`, `delayMs` apart; whether one passed.
 * `check` may be synchronous; the caller awaits either way (inside `main`).
 */
const retry = async (
  attempts: number,
  delayMs: number,
  check: () => boolean | Promise<boolean>,
): Promise<boolean> => {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (await check()) return true;
    if (attempt < attempts) await sleep(delayMs);
  }
  return false;
};

module.exports = { retry };
