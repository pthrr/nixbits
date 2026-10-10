/** An environment variable's value, or an error naming the variable. */
const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (value === undefined) throw new Error("environment variable " + name + " is not set");
  return value;
};

module.exports = { requireEnv };
