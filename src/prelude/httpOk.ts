/**
 * Whether `url` answers below 400 within the timeout, as `curl -sf` judges
 * it: a redirect counts as an answer and is not followed.
 */
const httpOk = async (url: string, timeoutMs = 5000): Promise<boolean> => {
  try {
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(timeoutMs) });
    await response.body?.cancel();
    return response.status > 0 && response.status < 400;
  } catch {
    return false;
  }
};

module.exports = { httpOk };
