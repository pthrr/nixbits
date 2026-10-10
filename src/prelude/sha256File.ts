const fs = require("fs");
const crypto = require("crypto");

/** Hex SHA-256 of a file, read in 1 MiB pieces; null if it cannot be opened. */
const sha256File = (file: string): string | null => {
  let fd: number;
  try {
    fd = fs.openSync(file, "r");
  } catch {
    return null;
  }
  const hash = crypto.createHash("sha256");
  const buffer = Buffer.alloc(1 << 20);
  try {
    for (let read = fs.readSync(fd, buffer); read > 0; read = fs.readSync(fd, buffer)) {
      hash.update(buffer.subarray(0, read));
    }
  } finally {
    fs.closeSync(fd);
  }
  return hash.digest("hex");
};

module.exports = { sha256File };
