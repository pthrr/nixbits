const { sha256File } = require("./sha256File.ts");

/**
 * The line `sha256sum FILE` prints, newline included, so lines from this make
 * a manifest `sha256sum -c` checks, interchangeable with ones sha256sum wrote.
 * As coreutils does, a backslash, newline or carriage return in the name is
 * escaped, and such a line starts with a backslash.
 */
const sha256sumLine = (file: string): string => {
  const hash = sha256File(file);
  if (hash === null) throw new Error("cannot read " + file);
  const escapes: Record<string, string> = { "\\": "\\\\", "\n": "\\n", "\r": "\\r" };
  const name = file.replace(/[\\\n\r]/g, (character: string) => escapes[character]);
  return (name === file ? "" : "\\") + hash + "  " + name + "\n";
};

module.exports = { sha256sumLine };
