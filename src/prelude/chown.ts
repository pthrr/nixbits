const fs = require("fs");
const { execFileSync } = require("child_process");

const lookupId = (database: "passwd" | "group", name: string): number => {
  if (/^[0-9]+$/.test(name)) return Number(name);
  let entry: string;
  try {
    entry = execFileSync("@getent@", [database, name], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    throw new Error("no such " + (database === "passwd" ? "user" : "group") + ": " + name);
  }
  return Number(entry.split(":")[2]);
};

// chown(1)-style "user", "user:group" or ":group" (names or numbers) as ids,
// -1 for the half that stays unchanged. Names resolve through NSS.
const resolveOwner = (owner: string): { uid: number; gid: number } => {
  const [user, group] = owner.split(":");
  return {
    uid: user === "" ? -1 : lookupId("passwd", user),
    gid: group === undefined || group === "" ? -1 : lookupId("group", group),
  };
};

/**
 * chown(1) on one path, following a symlink as chown(1) does. `owner` is
 * "user", "user:group" or ":group", by name (resolved through NSS) or number.
 */
const chown = (target: string, owner: string): void => {
  const { uid, gid } = resolveOwner(owner);
  fs.chownSync(target, uid, gid);
};

module.exports = { chown, resolveOwner };
