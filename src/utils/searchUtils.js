/**
 * Chuẩn hóa chuỗi (bỏ dấu tiếng Việt, chuyển chữ thường)
 */
export function removeVietnameseTones(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Tìm kiếm nâng cao hỗ trợ đồng thời cả phép HOẶC (OR) và phép VÀ (AND):
 * - HOẶC (OR): Ngăn cách bởi dấu phẩy (,), chấm phẩy (;), gạch đứng (|), xuống dòng (\n), từ 'hoặc', 'or'.
 * - VÀ (AND): Ngăn cách bởi dấu cách (' '), dấu cộng (+), dấu và (&), từ 'và', 'and'.
 * Khớp nếu chuỗi thỏa mãn BẤT KỲ cụm HOẶC nào, và trong mỗi cụm phải chứa TẤT CẢ từ khóa VÀ.
 *
 * @param {string} targetText - Chuỗi cần tìm kiếm
 * @param {string} rawQuery - Chuỗi tìm kiếm nhập vào (ví dụ: "BCE nồi, Joy kéo" hoặc "BCE và GM-3586")
 * @returns {boolean}
 */
export function matchMultiKeyword(targetText, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return true;
  if (!targetText) return false;

  const normalizedTarget = removeVietnameseTones(targetText);
  const normQuery = removeVietnameseTones(rawQuery);

  // Tách các mệnh đề HOẶC (OR)
  let orClauses = normQuery
    .split(/[,;\n|]|\b(?:hoac|or)\b/g)
    .map(c => c.trim())
    .filter(Boolean);

  if (orClauses.length === 0) {
    return normalizedTarget.includes(normQuery);
  }

  // Khớp nếu có ít nhất 1 mệnh đề OR đúng
  return orClauses.some(clause => {
    // Tách các từ khóa VÀ (AND)
    const cleanClause = clause.replace(/\b(?:va|and)\b|[+&]/g, ' ');
    const andTokens = cleanClause.split(/\s+/).map(t => t.trim()).filter(Boolean);
    if (andTokens.length === 0) {
      return normalizedTarget.includes(clause);
    }
    // Tất cả từ khóa AND phải cùng xuất hiện trong target
    return andTokens.every(token => normalizedTarget.includes(token));
  });
}
