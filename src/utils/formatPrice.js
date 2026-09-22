export function formatPrice(amount, currency = 'đ') {
  if (amount === null || amount === undefined || isNaN(amount)) return `0 ${currency}`.trim();
  const num = Number(amount);
  return `${num.toLocaleString('vi-VN')} ${currency}`.trim();
}

export function parsePrice(str) {
  if (!str) return 0;
  const clean = String(str).replace(/[^\d.-]/g, '');
  return parseFloat(clean) || 0;
}
