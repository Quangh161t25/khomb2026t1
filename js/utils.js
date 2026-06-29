// utils - Module Pattern (IIFE)
(function () {
function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">${escapeHtml(message)}</div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function clearHhInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = '';
    el.focus();
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
}

function toYMD(input) {
    if (!input) return '';
    const v = String(input).trim().split(' ')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
        const [d, m, y] = v.split('/');
        return `${y}-${m}-${d}`;
    }
    return '';
}

function getTodayYmd() {
    return new Date().toISOString().split('T')[0];
}

function formatYmdToDmy(ymd) {
    if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return '';
    const [y, m, d] = ymd.split('-');
    return `${d}/${m}/${y}`;
}

function parseDmyToYmd(dmy) {
    if (!dmy) return '';
    const v = String(dmy).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
        const [d, m, y] = v.split('/');
        return `${y}-${m}-${d}`;
    }
    return '';
}

function getCurrentWeekRangeYmd() {
    const now = new Date();
    const day = now.getDay() || 7; // Monday = 1, Sunday = 7
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() - day + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const toYmd = (date) => date.toISOString().split('T')[0];
    return { from: toYmd(start), to: toYmd(end) };
}

function getUdctSummaryByMdh(mdh) {
    const key = (mdh || '').toString().trim();
    if (!key) return { mvd: '', ma_gian: '', sku: '' };
    const rows = udctData.filter(i => (i.mdh || '').toString().trim() === key);
    const mvd = [...new Set(rows.map(i => (i.mvd || '').toString().trim()).filter(Boolean))].join(', ');
    const maGian = [...new Set(rows.map(i => (i.ma_gian || '').toString().trim()).filter(Boolean))].join(', ');
    const sku = [...new Set(rows.map(i => (i.id_sp || '').toString().trim()).filter(Boolean))].join(', ');
    return { mvd, ma_gian: maGian, sku };
}

function getUdctSummaryByMvd(mvd) {
    const key = (mvd || '').toString().trim();
    if (!key) return { mdh: '', ma_gian: '', sku: '' };
    const rows = udctData.filter(i => (i.mvd || '').toString().trim() === key);
    const mdh = [...new Set(rows.map(i => (i.mdh || '').toString().trim()).filter(Boolean))].join(', ');
    const maGian = [...new Set(rows.map(i => (i.ma_gian || '').toString().trim()).filter(Boolean))].join(', ');
    const sku = [...new Set(rows.map(i => (i.id_sp || '').toString().trim()).filter(Boolean))].join(', ');
    return { mdh, ma_gian: maGian, sku };
}

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateId(parts) {
    return parts.join(' | ');
}

function generateSkeletonRows(columnsCount, rowsCount = 10) {
    let html = '';
    for (let i = 0; i < rowsCount; i++) {
        let cols = '';
        for (let j = 0; j < columnsCount; j++) {
            cols += `<td class="px-4 py-4"><div class="h-4 bg-slate-200 animate-pulse rounded w-3/4"></div></td>`;
        }
        html += `<tr class="border-b border-slate-100 bg-white">${cols}</tr>`;
    }
    return html;
}

    Object.assign(window.AppModules = window.AppModules || {}, { ['utils']: true });
    window.showToast = showToast;
    window.escapeHtml = escapeHtml;
    window.clearHhInput = clearHhInput;
    window.toYMD = toYMD;
    window.getTodayYmd = getTodayYmd;
    window.formatYmdToDmy = formatYmdToDmy;
    window.parseDmyToYmd = parseDmyToYmd;
    window.getCurrentWeekRangeYmd = getCurrentWeekRangeYmd;
    window.getUdctSummaryByMdh = getUdctSummaryByMdh;
    window.getUdctSummaryByMvd = getUdctSummaryByMvd;
    window.generateRandomString = generateRandomString;
    window.generateId = generateId;
    window.generateSkeletonRows = generateSkeletonRows;
})();
