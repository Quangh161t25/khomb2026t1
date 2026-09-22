/**
 * Splits query by comma and tests if target text matches any of the keyword tokens
 * @param {string} targetText - The text to search within
 * @param {string} rawQuery - Comma-separated search input (e.g. "SPX123, SPX456, Hoàn")
 * @returns {boolean}
 */
export function matchMultiKeyword(targetText, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return true;
  if (!targetText) return false;

  const text = targetText.toLowerCase();
  const tokens = rawQuery
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);

  if (tokens.length === 0) return true;

  // Matches if the target text contains ANY of the comma-separated tokens
  return tokens.some(token => text.includes(token));
}
