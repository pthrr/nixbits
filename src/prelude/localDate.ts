/** A date as YYYYMMDD in local time, as `date +%Y%m%d` prints it; now by default. */
const localDate = (date: Date = new Date()): string =>
  String(date.getFullYear()) +
  String(date.getMonth() + 1).padStart(2, "0") +
  String(date.getDate()).padStart(2, "0");

module.exports = { localDate };
