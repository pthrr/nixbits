const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { resolveOwner } = require("./chown.ts");

/**
 * Replace `file` so readers see either the old or the complete new content.
 * The content goes to a new temporary file beside it, which gets its mode
 * and then its owner (as for `chown`) through the open descriptor before it
 * is renamed over the target. Nothing at either path is followed, so this
 * is also safe in a directory another user can write to. The temporary file
 * is removed on failure.
 *
 * Mode before owner means root needs only CAP_CHOWN, not CAP_FOWNER; the
 * price is that chown clears set-id bits, so `mode` cannot carry them.
 */
const writeFileAtomic = (
  file: string,
  content: string | Uint8Array,
  options: { mode?: number; owner?: string } = {},
): void => {
  const ids = options.owner === undefined ? undefined : resolveOwner(options.owner);
  const temporary = path.join(
    path.dirname(file),
    "." + path.basename(file) + "." + crypto.randomBytes(6).toString("hex") + ".tmp",
  );
  const fd = fs.openSync(temporary, "wx", 0o600);
  try {
    try {
      fs.writeFileSync(fd, content);
      fs.fsyncSync(fd);
      fs.fchmodSync(fd, options.mode ?? 0o600);
      if (ids !== undefined) fs.fchownSync(fd, ids.uid, ids.gid);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(temporary, file);
  } catch (error) {
    fs.rmSync(temporary, { force: true });
    throw error;
  }
};

module.exports = { writeFileAtomic };
