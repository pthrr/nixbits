const { execFileSync } = require("child_process");

/**
 * An htpasswd line for `user` with a bcrypt hash of `password` at `cost`
 * (htpasswd accepts 4 to 17; each step doubles the work). `htpasswd` is the
 * binary's path, so only scripts that hash pay for apacheHttpd in their
 * closure. The password travels over stdin, never argv.
 */
const htpasswdEntry = (htpasswd: string, user: string, password: string, cost: number): string => {
  if (!Number.isInteger(cost) || cost < 4 || cost > 17) {
    throw new Error("bcrypt cost must be an integer from 4 to 17, got " + cost);
  }
  return execFileSync(htpasswd, ["-n", "-i", "-B", "-C", String(cost), user], {
    input: password + "\n",
    encoding: "utf8",
    stdio: ["pipe", "pipe", "inherit"],
  });
};

module.exports = { htpasswdEntry };
