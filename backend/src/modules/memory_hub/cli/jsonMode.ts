/**
 * Detects if --json flag is present in CLI arguments.
 * Removes the flag from argv so it doesn't interfere with other parsing.
 */
export function isJsonMode(): boolean {
  const idx = process.argv.indexOf("--json");
  if (idx !== -1) {
    process.argv.splice(idx, 1);
    return true;
  }
  return false;
}

/**
 * Prints data as JSON or using a human-readable formatter.
 */
export function printOutput<T>(
  data: T,
  humanFormatter: (d: T) => string,
  jsonMode: boolean,
): void {
  if (jsonMode) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(humanFormatter(data));
  }
}
