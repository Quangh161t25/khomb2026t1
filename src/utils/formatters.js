export function formatNumber(num) {
  const val = parseFloat(num) || 0;
  return val.toLocaleString('vi-VN');
}

export function formatCurrency(amount) {
  const val = parseFloat(amount) || 0;
  return val.toLocaleString('vi-VN') + ' ₫';
}

export function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function cleanString(val) {
  return (val || '').toString().trim();
}
