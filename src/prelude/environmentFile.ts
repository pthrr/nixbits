/**
 * The text of a systemd EnvironmentFile that assigns `values`, which a shell
 * can source as well. Every value is double-quoted with \ " $ ` escaped, so
 * both read it back verbatim, `$` included. A name must be a shell variable
 * name, and a value must not contain a line break, which neither reader would
 * take as part of one value.
 */
const environmentFile = (values: Record<string, string>): string =>
  Object.entries(values)
    .map(([name, value]) => {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
        throw new Error("invalid environment variable name: " + JSON.stringify(name));
      }
      if (/[\r\n]/.test(value)) {
        throw new Error("environment variable " + name + " contains a line break");
      }
      return name + '="' + value.replace(/[\\"$`]/g, "\\$&") + '"\n';
    })
    .join("");

module.exports = { environmentFile };
