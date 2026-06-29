// bandon - Module Pattern (IIFE)
(function () {
let banDonKhungFilter = '';
let banDonLoaded = false;
let banDonLoadPromise = null;
let banDonAppendQueue = [];
let banDonAppendTimer = null;

const BAN_DON_KHUNG_OPTIONS = ['8H', '9H', '10H', '11H', '13H', '14H', '15H', '16H'];

function normalizeBanDonDate(value) {
    return toYMD(value) || parseDmyToYmd(value) || '';
}

function getBanDonFilters() {
    return {
        date: document.getElementById('banDonFilterDate')?.value || '',
        search: (document.getElementById('banDonSearch')?.value || '').toString().trim().toLowerCase(),
        khung: banDonKhungFilter
    };
}

function shiftBanDonDate(inputId, deltaDays) {
    const input = document.getElementById(inputId);
    if (!input) return false;
    const current = input.value || getTodayYmd();
    const date = new Date(`${current}T00:00:00`);
    date.setDate(date.getDate() + deltaDays);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    input.value = `${y}-${m}-${d}`;
    filterBanDonData();
    return false;
}

function formatBanDonDateForSheet(ymd) {
    return formatYmdToDmy(ymd || getTodayYmd());
}

async function fetchBanDonData(silent = false) {
    if (banDonLoadPromise) return banDonLoadPromise;

    const tbody = document.getElementById('banDonTableBody');
    ensureBanDonDefaultDates();
    if (!silent && !banDonLoaded && tbody) {
        renderBanDon();
    }

    banDonLoadPromise = (async () => {
        try {
        const rows = await fetchSheetData(CONFIG.banDonSheetName);
        if (!rows || rows.length <= 1) {
            banDonData = [];
            banDonLoaded = true;
            ensureBanDonDefaultDates();
            filterBanDonData();
            return;
        }

        const headers = rows[0].map(h => (h || '').toString().trim().toLowerCase());
        const findIndex = (names, fallback) => {
            const idx = headers.findIndex(h => names.includes(h));
            return idx >= 0 ? idx : fallback;
        };
        const idxNgay = findIndex(['ngay', 'ngày', 'date'], 0);
        const idxKhung = findIndex(['khung_h', 'khung h', 'khung', 'gio', 'giờ'], 1);
        const idxMvd = findIndex(['mvd', 'ma_van_don', 'mã vận đơn'], 2);

        const loadedBanDonData = rows.slice(1)
            .map((row, idx) => ({
                rowIndex: idx + 2,
                ngay: (row[idxNgay] || '').toString().trim(),
                khung_h: (row[idxKhung] || '').toString().trim(),
                mvd: (row[idxMvd] || '').toString().trim()
            }))
            .filter(item => item.ngay || item.khung_h || item.mvd)
            .reverse();
        const pendingRows = banDonData.filter(item => item.pending);
        const pendingKeys = new Set(pendingRows.map(item => `${item.ngay}|${item.khung_h}|${item.mvd}`));
        banDonData = [
            ...pendingRows,
            ...loadedBanDonData.filter(item => !pendingKeys.has(`${item.ngay}|${item.khung_h}|${item.mvd}`))
        ];

        banDonLoaded = true;
        ensureBanDonDefaultDates();
        filterBanDonData();
    } catch (error) {
        console.error('Load BAN_DON error:', error);
        if (!silent && tbody) tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-rose-500">Không thể tải sheet BAN_DON.</td></tr>';
    } finally {
        banDonLoadPromise = null;
    }
    })();

    return banDonLoadPromise;
}

function ensureBanDonDefaultDates() {
    const filterDate = document.getElementById('banDonFilterDate');
    if (filterDate && !filterDate.value) filterDate.value = getTodayYmd();
    const addNgay = document.getElementById('banDonAddNgay');
    if (addNgay && !addNgay.value) addNgay.value = filterDate?.value || getTodayYmd();
}

function setBanDonKhungFilter(value) {
    banDonKhungFilter = value || '';
    filterBanDonData();
    const addKhung = document.getElementById('banDonAddKhung');
    if (addKhung) addKhung.value = banDonKhungFilter;
}

function filterBanDonData() {
    const filters = getBanDonFilters();
    filteredBanDonData = banDonData.filter(item => {
        const itemDate = normalizeBanDonDate(item.ngay);
        if (filters.date && itemDate !== filters.date) return false;
        if (filters.khung && (item.khung_h || '').toString().trim().toUpperCase() !== filters.khung) return false;
        if (filters.search && !(item.mvd || '').toLowerCase().includes(filters.search)) return false;
        return true;
    });
    renderBanDon();
}

function getBanDonBaseForKhungCounts() {
    const filters = getBanDonFilters();
    return banDonData.filter(item => {
        const itemDate = normalizeBanDonDate(item.ngay);
        if (filters.date && itemDate !== filters.date) return false;
        if (filters.search && !(item.mvd || '').toLowerCase().includes(filters.search)) return false;
        return true;
    });
}

function renderBanDonKhungTabs() {
    const root = document.getElementById('banDonKhungTabs');
    if (!root) return;
    const base = getBanDonBaseForKhungCounts();
    const countFor = (khung) => khung
        ? base.filter(item => (item.khung_h || '').toString().trim().toUpperCase() === khung).length
        : base.length;

    const tabClass = (active) => active
        ? 'bg-blue-600 text-white shadow-sm'
        : 'bg-white text-slate-700 hover:bg-slate-50';
    const badgeClass = (active) => active
        ? 'bg-white text-blue-600'
        : 'bg-rose-50 text-rose-500';

    const allActive = banDonKhungFilter === '';
    root.innerHTML = `
        <button onclick="setBanDonKhungFilter('')" class="h-8 px-3 rounded-lg text-xs font-bold transition-all ${tabClass(allActive)}">
            Tất cả <span class="ml-1 inline-flex min-w-5 h-4 items-center justify-center rounded-full px-1 text-[10px] ${badgeClass(allActive)}">${countFor('')}</span>
        </button>
        ${BAN_DON_KHUNG_OPTIONS.map(khung => {
            const active = banDonKhungFilter === khung;
            return `
                <button onclick="setBanDonKhungFilter('${khung}')" class="h-8 px-3 rounded-lg text-xs font-bold transition-all ${tabClass(active)}">
                    ${khung} <span class="ml-1 inline-flex min-w-5 h-4 items-center justify-center rounded-full px-1 text-[10px] ${badgeClass(active)}">${countFor(khung)}</span>
                </button>
            `;
        }).join('')}
    `;
}

function renderBanDonStats() {
    const rowsEl = document.getElementById('banDonRowsCount');
    const uniqueEl = document.getElementById('banDonUniqueCount');
    if (rowsEl) rowsEl.textContent = filteredBanDonData.length.toLocaleString('vi-VN');
    if (uniqueEl) {
        const unique = new Set(filteredBanDonData.map(item => (item.mvd || '').trim()).filter(Boolean));
        uniqueEl.textContent = unique.size.toLocaleString('vi-VN');
    }
}

function getBanDonMvdSet() {
    return new Set(filteredBanDonData.map(item => (item.mvd || '').toString().trim()).filter(Boolean));
}

function getUdctUniqueRowsForBanDon() {
    const filters = getBanDonFilters();
    const sourceRows = (udctData || []).filter(item => {
        const itemDate = normalizeBanDonDate(item.ngay);
        if (filters.date && itemDate !== filters.date) return false;
        if (filters.khung && (item.khung_h || '').toString().trim().toUpperCase() !== filters.khung) return false;
        if (filters.search && !(item.mvd || '').toString().toLowerCase().includes(filters.search)) return false;
        return !!(item.mvd || '').toString().trim();
    });

    const seen = new Set();
    const uniqueRows = [];
    sourceRows.forEach(item => {
        const mvd = (item.mvd || '').toString().trim();
        if (!mvd || seen.has(mvd)) return;
        seen.add(mvd);
        const info = getBanDonUdctInfoByMvd(mvd);
        uniqueRows.push({
            khung_h: info.khung_h || item.khung_h || '',
            ma_gian: info.ma_gian || item.ma_gian || '',
            mvd,
            sku_shop_up: info.sku_shop_up || item.sku_shop_up || ''
        });
    });
    return uniqueRows;
}

function renderMatchedMvd(value, isMatched) {
    return `
        <span class="${isMatched ? 'text-red-600' : 'text-slate-900'}">
            ${escapeHtml(value || '')}
        </span>
    `;
}

function renderBanDonMvd(value, isMatched, isDuplicate) {
    return `
        <span class="inline-flex items-center gap-2 ${isMatched ? 'text-red-600' : 'text-slate-900'}">
            ${isDuplicate ? '<span class="w-3 h-3 rounded-full bg-green-500 shrink-0"></span>' : ''}
            <span>${escapeHtml(value || '')}</span>
        </span>
    `;
}

function getBanDonUdctInfoByMvd(mvd) {
    const key = (mvd || '').toString().trim();
    if (!key || !udctData || !udctData.length) {
        return { khung_h: '', ma_gian: '', sku_shop_up: '' };
    }
    const rows = udctData.filter(item => (item.mvd || '').toString().trim() === key);
    const uniqueJoin = (field) => [...new Set(rows.map(item => (item[field] || '').toString().trim()).filter(Boolean))].join(', ');
    return {
        khung_h: uniqueJoin('khung_h'),
        ma_gian: uniqueJoin('ma_gian'),
        sku_shop_up: uniqueJoin('sku_shop_up')
    };
}

function renderBanDonUniqueTable() {
    const tbody = document.getElementById('banDonUniqueTableBody');
    const stats = document.getElementById('banDonUniqueTableStats');
    if (!tbody) return;

    const uniqueRows = getUdctUniqueRowsForBanDon();
    const banDonSet = getBanDonMvdSet();

    if (stats) stats.textContent = `${uniqueRows.length.toLocaleString('vi-VN')} MVD`;
    if (!uniqueRows.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-10 text-slate-400">Không có MVD duy nhất.</td></tr>';
        return;
    }

    tbody.innerHTML = uniqueRows.map(row => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 ${banDonSet.has(row.mvd) ? 'bg-red-50/70' : ''}">
            <td class="px-3 py-1.5 text-sm leading-5 text-slate-700 whitespace-nowrap">${escapeHtml(row.khung_h || '')}</td>
            <td class="px-3 py-1.5 text-sm leading-5 text-slate-700 whitespace-nowrap">${escapeHtml(row.ma_gian || '')}</td>
            <td class="px-3 py-1.5 text-sm leading-5 font-semibold whitespace-nowrap">${renderMatchedMvd(row.mvd, banDonSet.has(row.mvd))}</td>
            <td class="px-3 py-1.5 text-sm leading-5 text-slate-700 truncate max-w-0" title="${escapeHtml(row.sku_shop_up || '')}">${escapeHtml(row.sku_shop_up || '')}</td>
        </tr>
    `).join('');
}

function renderBanDon() {
    ensureBanDonDefaultDates();
    renderBanDonKhungTabs();
    renderBanDonStats();

    const tbody = document.getElementById('banDonTableBody');
    if (!tbody) return;
    const activeId = document.activeElement?.id || '';
    const draftValues = {
        ngay: document.getElementById('banDonAddNgay')?.value || '',
        khung: document.getElementById('banDonAddKhung')?.value || '',
        mvd: document.getElementById('banDonAddMvd')?.value || ''
    };
    const filterDate = document.getElementById('banDonFilterDate')?.value || getTodayYmd();
    const addNgayValue = draftValues.ngay || filterDate;
    const addKhungValue = draftValues.khung || banDonKhungFilter || '';
    const uniqueMvdSet = new Set(getUdctUniqueRowsForBanDon().map(item => item.mvd));
    const banDonMvdCounts = {};
    filteredBanDonData.forEach(item => {
        const mvd = (item.mvd || '').toString().trim();
        if (mvd) banDonMvdCounts[mvd] = (banDonMvdCounts[mvd] || 0) + 1;
    });

    const existingRows = filteredBanDonData.map(item => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 ${uniqueMvdSet.has((item.mvd || '').toString().trim()) ? 'bg-red-50/70' : ''}">
            <td class="px-4 py-1.5 text-sm leading-5 text-slate-700">${escapeHtml(item.ngay || '')}</td>
            <td class="px-4 py-1.5 text-sm leading-5 text-slate-700">${escapeHtml(item.khung_h || '')}</td>
            <td class="px-4 py-1.5 text-sm leading-5 font-semibold">
                ${renderBanDonMvd(item.mvd, uniqueMvdSet.has((item.mvd || '').toString().trim()), banDonMvdCounts[(item.mvd || '').toString().trim()] > 1)}
                ${item.pending ? '<span class="ml-2 text-[10px] font-bold text-cyan-600">Đang lưu</span>' : ''}
            </td>
            <td class="px-4 py-1.5 text-right">
                <button onclick="deleteBanDonRow('${String(item.rowIndex).replace(/'/g, "\\'")}')" class="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold">Xóa</button>
            </td>
        </tr>
    `).join('');

    tbody.innerHTML = `
        <tr class="bg-cyan-50/70 border-b border-cyan-100">
            <td class="p-1.5">
                <input type="date" id="banDonAddNgay" value="${escapeHtml(addNgayValue)}"
                    class="w-full h-8 px-3 bg-white border border-cyan-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-cyan-100">
            </td>
            <td class="p-1.5">
                <input type="text" id="banDonAddKhung" value="${escapeHtml(addKhungValue)}" placeholder="Khung H" list="banDonKhungList"
                    class="w-full h-8 px-3 bg-white border border-cyan-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-cyan-100">
            </td>
            <td class="p-1.5">
                <input type="text" id="banDonAddMvd" value="${escapeHtml(draftValues.mvd)}" placeholder="Nhập/scan MVD rồi Enter"
                    onkeydown="if(event.key==='Enter'){event.preventDefault(); saveBanDonNewRow();}"
                    class="w-full h-8 px-3 bg-white border border-cyan-300 rounded-md text-sm font-semibold outline-none focus:ring-2 focus:ring-cyan-100">
            </td>
            <td class="p-1.5 text-right">
                <button onclick="saveBanDonNewRow()" class="h-8 px-4 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 text-sm font-bold">Thêm</button>
            </td>
        </tr>
        ${existingRows || '<tr><td colspan="4" class="text-center py-10 text-slate-400">Không có dữ liệu phù hợp.</td></tr>'}
    `;
    if (activeId) {
        const activeEl = document.getElementById(activeId);
        if (activeEl) {
            activeEl.focus();
            if (activeId === 'banDonAddMvd') {
                const len = activeEl.value.length;
                activeEl.setSelectionRange?.(len, len);
            }
        }
    }
    renderBanDonUniqueTable();
}

function showBanDonModule() {
    ensureBanDonDefaultDates();
    filterBanDonData();
    fetchBanDonData(true);
    if ((!udctData || udctData.length === 0) && typeof loadUDCTData === 'function') {
        loadUDCTData(true).then(() => renderBanDonUniqueTable());
    } else {
        renderBanDonUniqueTable();
    }
}

function queueBanDonAppend(row) {
    banDonAppendQueue.push(row);
    clearTimeout(banDonAppendTimer);
    banDonAppendTimer = setTimeout(flushBanDonAppendQueue, 350);
}

async function flushBanDonAppendQueue() {
    if (!banDonAppendQueue.length) return;
    const rows = banDonAppendQueue.splice(0, banDonAppendQueue.length);
    try {
        const success = await appendSheetData(CONFIG.banDonSheetName, rows);
        if (!success) throw new Error('Không ghi được BAN_DON');
        banDonData.forEach(item => {
            if (item.pending && rows.some(row => row[2] === item.mvd && row[1] === item.khung_h && row[0] === item.ngay)) {
                item.pending = false;
            }
        });
    } catch (error) {
        console.error('Flush BAN_DON queue error:', error);
        rows.forEach(row => banDonAppendQueue.unshift(row));
        showToast('Đang chờ lưu BAN_DON, vẫn tiếp tục bắn được.', 'warning', 1500);
        clearTimeout(banDonAppendTimer);
        banDonAppendTimer = setTimeout(flushBanDonAppendQueue, 2500);
    }
}

async function saveBanDonNewRow() {
    const ngayRaw = document.getElementById('banDonAddNgay')?.value || getTodayYmd();
    const khung = ((document.getElementById('banDonAddKhung')?.value || '').toString().trim() || banDonKhungFilter || '').toUpperCase();
    const mvd = (document.getElementById('banDonAddMvd')?.value || '').toString().trim();
    if (!mvd) {
        showToast('Vui lòng nhập MVD.', 'warning');
        document.getElementById('banDonAddMvd')?.focus();
        return;
    }

    const ngaySheet = formatBanDonDateForSheet(ngayRaw);
    const searchEl = document.getElementById('banDonSearch');
    const searchValue = (searchEl?.value || '').toString().trim().toLowerCase();
    if (searchEl && searchValue && !mvd.toLowerCase().includes(searchValue)) {
        searchEl.value = '';
    }

    const tempRow = {
        rowIndex: `pending-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        ngay: ngaySheet,
        khung_h: khung,
        mvd,
        pending: true
    };

    banDonData.unshift(tempRow);
    queueBanDonAppend([ngaySheet, khung, mvd]);
    filterBanDonData();

    const addNgay = document.getElementById('banDonAddNgay');
    const addKhung = document.getElementById('banDonAddKhung');
    const addMvd = document.getElementById('banDonAddMvd');
    if (addNgay) addNgay.value = ngayRaw;
    if (addKhung) addKhung.value = khung;
    if (addMvd) {
        addMvd.value = '';
        addMvd.focus();
    }
}

async function getBanDonSheetId(token) {
    const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}?fields=sheets(properties(sheetId,title))`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await resp.json();
    const sheet = (data.sheets || []).find(s => s.properties?.title === CONFIG.banDonSheetName);
    return sheet?.properties?.sheetId ?? null;
}

async function deleteBanDonRow(rowIndex) {
    if (!rowIndex) return;
    if (String(rowIndex).startsWith('pending-')) {
        const item = banDonData.find(row => String(row.rowIndex) === String(rowIndex));
        banDonData = banDonData.filter(row => String(row.rowIndex) !== String(rowIndex));
        if (item) {
            banDonAppendQueue = banDonAppendQueue.filter(row => !(row[0] === item.ngay && row[1] === item.khung_h && row[2] === item.mvd));
        }
        filterBanDonData();
        return;
    }
    const removedItem = banDonData.find(row => String(row.rowIndex) === String(rowIndex));
    const previousData = banDonData.slice();
    banDonData = banDonData.filter(row => String(row.rowIndex) !== String(rowIndex));
    filterBanDonData();

    try {
        const token = await getAccessToken();
        const sheetId = await getBanDonSheetId(token);
        if (sheetId === null) throw new Error('Không lấy được sheetId BAN_DON');
        const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}:batchUpdate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId,
                            dimension: 'ROWS',
                            startIndex: Number(rowIndex) - 1,
                            endIndex: Number(rowIndex)
                        }
                    }
                }]
            })
        });
        if (!resp.ok) throw new Error(await resp.text());
    } catch (error) {
        if (removedItem) {
            banDonData = previousData;
            filterBanDonData();
        }
        console.error('Delete BAN_DON error:', error);
        showToast('Có lỗi khi xóa dòng.', 'error');
    }
}

    Object.assign(window.AppModules = window.AppModules || {}, { ['bandon']: true });
    window.fetchBanDonData = fetchBanDonData;
    window.showBanDonModule = showBanDonModule;
    window.filterBanDonData = filterBanDonData;
    window.renderBanDon = renderBanDon;
    window.renderBanDonUniqueTable = renderBanDonUniqueTable;
    window.shiftBanDonDate = shiftBanDonDate;
    window.setBanDonKhungFilter = setBanDonKhungFilter;
    window.saveBanDonNewRow = saveBanDonNewRow;
    window.deleteBanDonRow = deleteBanDonRow;
})();
