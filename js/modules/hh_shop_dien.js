// hh_shop_dien - Module Pattern (IIFE)
(function () {
function refreshHHShopAutoFields(triggerSource) {
    const mvdInput = document.getElementById('hhShopEditMVD');
    const mdhInput = document.getElementById('hhShopEditMDH');
    const maGianInput = document.getElementById('hhShopEditMaGian');
    const skuInput = document.getElementById('hhShopEditSKU');
    const mvdTraEl = document.getElementById('hhShopEditMVDTra');
    const skuTraEl = document.getElementById('hhShopEditSKUTra');
    const drawerRowId = document.getElementById('hhShopDrawerRowId');

    const mvd = (mvdInput?.value || '').toString().trim();
    const mdh = (mdhInput?.value || '').toString().trim();
    const hoanTra = (document.getElementById('hhShopEditHoanTra')?.value || '').toString().trim();

    let hasMatch = false;

    if (triggerSource === 'mvd' && mvd) {
        const info = getUdctSummaryByMvd(mvd);
        if (info.mdh || info.ma_gian || info.sku) {
            mdhInput.value = info.mdh || '';
            maGianInput.value = info.ma_gian || '';
            skuInput.value = info.sku || '';
            if (drawerRowId) drawerRowId.textContent = `✅ ${mvd}`;
            hasMatch = true;
        }
    } else if (triggerSource === 'mdh' && mdh) {
        const info = getUdctSummaryByMdh(mdh);
        if (info.mvd || info.ma_gian || info.sku) {
            mvdInput.value = info.mvd || '';
            maGianInput.value = info.ma_gian || '';
            skuInput.value = info.sku || '';
            if (drawerRowId) drawerRowId.textContent = `✅ ${mdh}`;
            hasMatch = true;
        }
    }

    if (!hasMatch && (mvd || mdh)) {
        // Nếu không có trigger cụ thể hoặc không tìm thấy, thử cả 2 nếu chưa có match
        const mvdInfo = getUdctSummaryByMvd(mvd);
        if (mvdInfo.mdh || mvdInfo.ma_gian || mvdInfo.sku) {
            if (!mdh) mdhInput.value = mvdInfo.mdh || '';
            if (!maGianInput.value) maGianInput.value = mvdInfo.ma_gian || '';
            if (!skuInput.value) skuInput.value = mvdInfo.sku || '';
            if (drawerRowId) drawerRowId.textContent = `✅ ${mvd}`;
            hasMatch = true;
        } else if (mdh) {
            const mdhInfo = getUdctSummaryByMdh(mdh);
            if (mdhInfo.mvd || mdhInfo.ma_gian || mdhInfo.sku) {
                if (!mvd) mvdInput.value = mdhInfo.mvd || '';
                if (!maGianInput.value) maGianInput.value = mdhInfo.ma_gian || '';
                if (!skuInput.value) skuInput.value = mdhInfo.sku || '';
                if (drawerRowId) drawerRowId.textContent = `✅ ${mdh}`;
                hasMatch = true;
            }
        }
    }

    if (!hasMatch) {
        if (drawerRowId) drawerRowId.textContent = mvd ? `⚠️ ${mvd}` : (mdh ? `⚠️ ${mdh}` : 'NEW');
    }

    if (mvdTraEl && !mvdTraEl.dataset.manual) {
        mvdTraEl.value = hoanTra === 'hoàn' ? mvdInput.value : '';
    }
    if (skuTraEl && !skuTraEl.dataset.manual) {
        skuTraEl.value = skuInput.value;
    }

    const rawDate = document.getElementById('hhShopEditNgayTraRaw').value || getTodayYmd();
    document.getElementById('hhShopEditNgayTraRaw').value = rawDate;
    document.getElementById('hhShopEditNgayTra').value = formatYmdToDmy(rawDate);
    setHHShopButtonGroup('hhShopHoanTraButtons', hoanTra || 'hoàn');
}

function saveHHShopFilterState() {
    const from = document.getElementById('hhShopNgayTraFrom')?.value || '';
    const to = document.getElementById('hhShopNgayTraTo')?.value || '';
    const maGian = document.getElementById('hhShopFilterMaGian')?.value || '';
    const search = document.getElementById('hhShopSearchMvd')?.value || '';
    const xacNhan = document.getElementById('hhShopXacNhanFilterButtons')?.dataset.value || '';
    const daNhan = document.getElementById('hhShopDaNhanFilterButtons')?.dataset.value || '';
    localStorage.setItem('hhShopDienFilterState', JSON.stringify({ from, to, maGian, search, xacNhan, daNhan }));
}

function loadHHShopFilterState() {
    try {
        return JSON.parse(localStorage.getItem('hhShopDienFilterState') || '{}') || {};
    } catch {
        return {};
    }
}

function applyHHShopFilterState() {
    const state = loadHHShopFilterState();
    const fromEl = document.getElementById('hhShopNgayTraFrom');
    const toEl = document.getElementById('hhShopNgayTraTo');
    const maGianEl = document.getElementById('hhShopFilterMaGian');
    const searchEl = document.getElementById('hhShopSearchMvd');
    const xacNhanButtons = document.getElementById('hhShopXacNhanFilterButtons');
    const daNhanButtons = document.getElementById('hhShopDaNhanFilterButtons');
    if (fromEl && state.from !== undefined) fromEl.value = state.from || '';
    if (toEl && state.to !== undefined) toEl.value = state.to || '';
    if (maGianEl && state.maGian !== undefined) maGianEl.value = state.maGian || '';
    if (searchEl && state.search !== undefined) searchEl.value = state.search || '';
    if (xacNhanButtons && state.xacNhan !== undefined) xacNhanButtons.dataset.value = state.xacNhan || '';
    if (daNhanButtons && state.daNhan !== undefined) daNhanButtons.dataset.value = state.daNhan || '';
}

function setHHShopDateFilter(from, to) {
    const fromEl = document.getElementById('hhShopNgayTraFrom');
    const toEl = document.getElementById('hhShopNgayTraTo');
    if (fromEl) fromEl.value = from || '';
    if (toEl) toEl.value = to || '';
    saveHHShopFilterState();
    renderHHShopDienTable();
}

function setHHShopNgayTraFilterToday() {
    const today = getTodayYmd();
    setHHShopDateFilter(today, today);
}

function setHHShopNgayTraFilterThisWeek() {
    const { from, to } = getCurrentWeekRangeYmd();
    setHHShopDateFilter(from, to);
}

function clearHHShopNgayTraFilter() {
    setHHShopDateFilter('', '');
}

function syncHHShopButtonFilter(root, value) {
    if (!root) return;
    const nextValue = value || '';
    root.dataset.value = nextValue;
    root.querySelectorAll('button').forEach(btn => {
        const active = (btn.dataset.value || '') === nextValue;
        btn.classList.toggle('bg-slate-100', active);
        btn.classList.toggle('bg-white', !active);
        btn.classList.toggle('text-primary', active && nextValue === '');
    });
}

function setHHShopButtonFilter(containerId, value) {
    const root = document.getElementById(containerId);
    syncHHShopButtonFilter(root, value);
    saveHHShopFilterState();
    renderHHShopDienTable();
}

function setHHShopXacNhanFilter(value) {
    setHHShopButtonFilter('hhShopXacNhanFilterButtons', value);
}

function setHHShopDaNhanFilter(value) {
    setHHShopButtonFilter('hhShopDaNhanFilterButtons', value);
}

function markHHShopMvdTraManual(isManual) {
    const el = document.getElementById('hhShopEditMVDTra');
    if (el) el.dataset.manual = isManual ? '1' : '';
}

function markHHShopSkuTraManual(isManual) {
    const el = document.getElementById('hhShopEditSKUTra');
    if (el) el.dataset.manual = isManual ? '1' : '';
}

function scheduleHHShopAutoSave() {
    if (currentHHShopRowIndex < 0) return; // Không tự động lưu khi đang thêm mới
    clearTimeout(window.hhShopAutoSaveTimer);
    window.hhShopAutoSaveTimer = setTimeout(() => {
        saveHHShopDien();
    }, 300);
}

function syncHHShopButtonGroup(root, activeValue) {
    if (!root) return;
    const current = (activeValue || '').toString().trim().toLowerCase();
    root.querySelectorAll('button').forEach(btn => {
        const val = (btn.dataset.value || btn.textContent || '').toString().trim().toLowerCase();
        const active = current === val;
        btn.classList.toggle('bg-slate-100', active);
        btn.classList.toggle('bg-white', !active);
        btn.classList.toggle('ring-2', active);
        btn.classList.toggle('ring-primary/20', active);
    });
}

function setHHShopButtonGroup(containerId, activeValue) {
    syncHHShopButtonGroup(document.getElementById(containerId), activeValue);
}

async function setHHShopXacNhan(value) {
    const nextValue = value || '';
    document.getElementById('hhShopEditXacNhan').value = nextValue;
    setHHShopButtonGroup('hhShopXacNhanButtons', nextValue || 'trống');
    if (currentHHShopRowIndex < 0) return;
    const item = hhShopDienData[currentHHShopRowIndex];
    if (!item) return;
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden');
    try {
        const token = await getAccessToken();
        if (!token) return;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchUpdate`;
        const body = {
            valueInputOption: 'USER_ENTERED',
            data: [
                { range: `${CONFIG.hhNvDienSheetName}!K${item.rowIndex}`, values: [[nextValue]] }
            ]
        };
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!resp.ok) throw new Error(await resp.text());
        item.xac_nhan = nextValue;
        renderHHShopDienTable();
    } catch (error) {
        console.error(error);
        alert('Lỗi khi cập nhật xác nhận.');
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

async function deleteHHShopDien() {
    if (currentHHShopRowIndex < 0) return showToast('Không xác định được dòng cần xóa.', 'error');
    const item = hhShopDienData[currentHHShopRowIndex];
    if (!item) return showToast('Không xác định được dòng cần xóa.', 'error');
    if (!confirm(`Xóa dòng HH SHOP ĐIỀN này? (Row ${item.rowIndex})`)) return;
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden');
    try {
        const token = await getAccessToken();
        if (!token) return;
        const sheetId = await fetchSheetMeta(CONFIG.hhNvDienSheetName, token);
        if (sheetId === null || sheetId === undefined) throw new Error('Không lấy được sheetId');
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}:batchUpdate`;
        const body = {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId,
                        dimension: 'ROWS',
                        startIndex: item.rowIndex - 1,
                        endIndex: item.rowIndex
                    }
                }
            }]
        };
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!resp.ok) {
            console.error('Delete HH SHOP error:', await resp.text());
            showToast('Lỗi khi xóa dòng HH SHOP ĐIỀN.', 'error');
            return;
        }
        closeHHShopDrawer();
        await fetchHHShopDienData();
        showToast('Đã xóa dòng HH SHOP ĐIỀN thành công!', 'success');
    } catch (error) {
        console.error(error);
        showToast('Có lỗi khi xóa HH SHOP ĐIỀN.', 'error');
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

async function fetchSheetMeta(sheetName, token) {
    const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}?fields=sheets(properties(sheetId,title))`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await resp.json();
    const sheet = (data.sheets || []).find(s => s.properties?.title === sheetName);
    return sheet?.properties?.sheetId ?? null;
}

function setHHShopHoanTra(value) {
    document.getElementById('hhShopEditHoanTra').value = value;
    const mvdTraEl = document.getElementById('hhShopEditMVDTra');
    if (mvdTraEl) mvdTraEl.dataset.manual = '';
    setHHShopButtonGroup('hhShopHoanTraButtons', value);
    refreshHHShopAutoFields();
}



function handleHHShopMvdChange() {
    const val = document.getElementById('hhShopEditMVD').value.trim();
    refreshHHShopAutoFields('mvd');
    renderHHShopSuggestions('hhShopMvdSuggestions', 'mvd', val);
}

function handleHHShopMdhChange() {
    const val = document.getElementById('hhShopEditMDH').value.trim();
    refreshHHShopAutoFields('mdh');
    renderHHShopSuggestions('hhShopMdhSuggestions', 'mdh', val);
}

function renderHHShopSuggestions(containerId, type, query) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!query || query.length < 2) {
        container.classList.add('hidden');
        return;
    }

    // Tìm trong udctData
    const results = udctData.filter(i => {
        const val = (type === 'mvd' ? i.mvd : i.mdh) || '';
        return val.toString().toLowerCase().includes(query.toLowerCase());
    }).slice(0, 20);

    if (results.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.innerHTML = results.map(i => `
        <div class="suggestion-item" onclick="selectHHShopItem('${escapeHtml(i.mvd)}', '${escapeHtml(i.mdh)}', '${escapeHtml(i.ma_gian)}', '${escapeHtml(i.id_sp)}')">
            <span class="item-code">${type === 'mvd' ? escapeHtml(i.mvd || '-') : escapeHtml(i.mdh || '-')}</span>
            <span class="item-name">${escapeHtml(i.ten_sp || '')} (Gian: ${escapeHtml(i.ma_gian || '')})</span>
        </div>
    `).join('');
    container.classList.remove('hidden');
}

function selectHHShopItem(mvd, mdh, maGian, sku) {
    const mvdInp = document.getElementById('hhShopEditMVD');
    const mdhInp = document.getElementById('hhShopEditMDH');
    const gianInp = document.getElementById('hhShopEditMaGian');
    const skuInp = document.getElementById('hhShopEditSKU');

    if (mvdInp) mvdInp.value = mvd;
    if (mdhInp) mdhInp.value = mdh;
    if (gianInp) gianInp.value = maGian;
    if (skuInp) skuInp.value = sku;

    document.getElementById('hhShopMvdSuggestions').classList.add('hidden');
    document.getElementById('hhShopMdhSuggestions').classList.add('hidden');

    refreshHHShopAutoFields();
    scheduleHHShopAutoSave();
    showToast('Đã chọn đơn hàng: ' + (mdh || mvd), 'success');
}

function setHHShopNgayTraRaw(ymdValue) {
    const ymd = ymdValue || getTodayYmd();
    const rawEl = document.getElementById('hhShopEditNgayTraRaw');
    const dmyEl = document.getElementById('hhShopEditNgayTra');
    const picker = document.getElementById('hhShopNgayTraPicker');
    if (rawEl) rawEl.value = ymd;
    if (dmyEl) dmyEl.value = formatYmdToDmy(ymd);
    if (picker) picker.value = ymd;
}

function openHHShopNgayTraPicker() {
    const picker = document.getElementById('hhShopNgayTraPicker');
    if (!picker) return;
    picker.value = document.getElementById('hhShopEditNgayTraRaw').value || getTodayYmd();
    picker.style.position = 'fixed';
    picker.style.left = '0';
    picker.style.top = '0';
    picker.style.zIndex = '99999';
    picker.showPicker?.();
    if (!picker.showPicker) picker.click();
}

function getTodayYmd() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function parseDmyToYmd(dmy) {
    if (!dmy) return '';
    const parts = String(dmy).trim().split('/');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}

// Duplicate formatYmdToDmy logic removed here to use the consolidated version at top

function shiftDateValueByDays(currentValue, deltaDays) {
    const current = currentValue || getTodayYmd();
    const dt = new Date(`${current}T00:00:00`);
    dt.setDate(dt.getDate() + deltaDays);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function changeHHShopNgayTra(step) {
    const currentRaw = document.getElementById('hhShopEditNgayTraRaw')?.value || getTodayYmd();
    setHHShopNgayTraRaw(shiftDateValueByDays(currentRaw, step));
    return false;
}

function shiftHHFilterDate(id, delta) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = shiftDateValueByDays(el.value, delta);
    filterHangHoanData();
}

function shiftHHShopNgayTra(which, step) {
    const inputId = which === 'from' ? 'hhShopNgayTraFrom' : 'hhShopNgayTraTo';
    const input = document.getElementById(inputId);
    if (!input) return false;
    input.value = shiftDateValueByDays(input.value || getTodayYmd(), step);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return false;
}

function openHHShopNewDrawer() {
    currentHHShopRowIndex = -1;
    document.getElementById('hhShopEditMVD').value = '';
    document.getElementById('hhShopEditMDH').value = '';
    document.getElementById('hhShopEditMaGian').value = '';
    document.getElementById('hhShopEditSKU').value = '';
    document.getElementById('hhShopEditHoanTra').value = 'hoàn';
    setHHShopNgayTraRaw(getTodayYmd());
    const mvdTraEl = document.getElementById('hhShopEditMVDTra');
    if (mvdTraEl) {
        mvdTraEl.value = '';
        mvdTraEl.dataset.manual = '';
    }
    const skuTraEl = document.getElementById('hhShopEditSKUTra');
    if (skuTraEl) {
        skuTraEl.value = '';
        skuTraEl.dataset.manual = '';
    }
    document.getElementById('hhShopEditGhiChu').value = '';
    document.getElementById('hhShopEditXacNhan').value = '';
    setHHShopButtonGroup('hhShopHoanTraButtons', 'hoàn');
    setHHShopButtonGroup('hhShopXacNhanButtons', 'trống');
    refreshHHShopAutoFields();
    document.getElementById('hhShopDrawerOverlay').classList.remove('hidden');
    document.getElementById('hhShopDrawer').classList.add('open');
    setTimeout(() => document.getElementById('hhShopEditMVD')?.focus(), 30);
}

function closeHHShopDrawer() {
    document.getElementById('hhShopDrawerOverlay').classList.add('hidden');
    document.getElementById('hhShopDrawer').classList.remove('open');
    const delBtn = document.getElementById('hhShopDeleteButton');
    if (delBtn) delBtn.classList.add('hidden');
}

async function saveHHShopDien() {
    const mvd = (document.getElementById('hhShopEditMVD').value || '').toString().trim();
    if (!mvd) return showToast('Vui lòng nhập MVD.', 'warning');
    const mdh = document.getElementById('hhShopEditMDH').value || '';
    const maGian = document.getElementById('hhShopEditMaGian').value || '';
    const sku = document.getElementById('hhShopEditSKU').value || '';
    const hoanTra = document.getElementById('hhShopEditHoanTra').value || 'hoàn';
    const ngayTraRaw = document.getElementById('hhShopEditNgayTraRaw').value || parseDmyToYmd(document.getElementById('hhShopEditNgayTra').value) || getTodayYmd();
    const ngayTra = formatYmdToDmy(ngayTraRaw);
    const mvdTraEl = document.getElementById('hhShopEditMVDTra');
    const mvdTraManual = (mvdTraEl?.dataset.manual || '') === '1';
    const mvdTra = mvdTraManual ? (mvdTraEl?.value || '').trim() : (hoanTra === 'hoàn' ? mvd : '');
    const skuTra = document.getElementById('hhShopEditSKUTra').value || sku;
    const rawGhiChu = (document.getElementById('hhShopEditGhiChu').value || '').trim();
    const ghiChu = rawGhiChu || `[${hoanTra.toUpperCase()}] MVD ${mvd}${mdh ? ` | MDH: ${mdh}` : ''}`;
    const xacNhan = (document.getElementById('hhShopEditXacNhan').value || '').toString().trim();

    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden');
    try {
        const token = await getAccessToken();
        if (!token) return;
        const values = [[`${Date.now()}`, mvd, mdh, maGian, sku, hoanTra, ngayTra, mvdTra, skuTra, ghiChu, xacNhan, ""]];
        const isUpdate = currentHHShopRowIndex >= 0 && hhShopDienData[currentHHShopRowIndex];
        const url = isUpdate
            ? `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${CONFIG.hhNvDienSheetName}!A${hhShopDienData[currentHHShopRowIndex].rowIndex}:L${hhShopDienData[currentHHShopRowIndex].rowIndex}?valueInputOption=USER_ENTERED`
            : `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${CONFIG.hhNvDienSheetName}!A:A:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
        const method = isUpdate ? 'PUT' : 'POST';
        const body = isUpdate ? { values } : { values };
        const resp = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!resp.ok) {
            const errText = await resp.text();
            console.error('Save HH SHOP ĐIỀN error:', errText);
            showToast('Lỗi khi lưu HH SHOP ĐIỀN.', 'error');
            return;
        }
        closeHHShopDrawer();
        await fetchHHShopDienData();
        showToast('Đã lưu HH SHOP ĐIỀN thành công!', 'success');
    } catch (error) {
        console.error(error);
        showToast('Có lỗi khi lưu HH SHOP ĐIỀN.', 'error');
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

function openHHShopDetail(rowIndex) {
    const idx = hhShopDienData.findIndex(i => Number(i.rowIndex) === Number(rowIndex));
    const item = idx >= 0 ? hhShopDienData[idx] : null;
    if (!item) return;
    currentHHShopRowIndex = idx;
    document.getElementById('hhShopEditMVD').value = item.mvd || '';
    document.getElementById('hhShopEditMDH').value = item.mdh || '';
    document.getElementById('hhShopEditMaGian').value = item.ma_gian || '';
    document.getElementById('hhShopEditSKU').value = item.sku || '';
    document.getElementById('hhShopEditHoanTra').value = item.hoan_tra || 'hoàn';
    document.getElementById('hhShopEditNgayTraRaw').value = parseDmyToYmd(item.ngay_tra) || getTodayYmd();
    document.getElementById('hhShopEditNgayTra').value = item.ngay_tra || formatYmdToDmy(getTodayYmd());
    const mvdTraEl = document.getElementById('hhShopEditMVDTra');
    if (mvdTraEl) {
        mvdTraEl.value = item.mvd_tra || '';
        mvdTraEl.dataset.manual = item.mvd_tra ? '1' : '';
    }
    const skuTraEl = document.getElementById('hhShopEditSKUTra');
    if (skuTraEl) {
        skuTraEl.value = item.sku_tra || '';
        skuTraEl.dataset.manual = item.sku_tra && item.sku_tra !== item.sku ? '1' : '';
    }
    document.getElementById('hhShopEditGhiChu').value = item.ghi_chu || '';
    document.getElementById('hhShopDrawerRowId').textContent = `Row ID: ${item.rowIndex}`;
    document.getElementById('hhShopDrawerOverlay').classList.remove('hidden');
    document.getElementById('hhShopDrawer').classList.add('open');
    const delBtn = document.getElementById('hhShopDeleteButton');
    if (delBtn) delBtn.classList.remove('hidden');
    refreshHHShopAutoFields();
}

function closeHHShopDrawer() {
    document.getElementById('hhShopDrawerOverlay').classList.add('hidden');
    document.getElementById('hhShopDrawer').classList.remove('open');
}

async function fetchHHShopDienData() {
    const tbody = document.getElementById('hhShopTableBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="11" class="text-center py-8 text-slate-500">Đang tải dữ liệu...</td></tr>';
    try {
        const token = await getAccessToken();
        if (!token) return;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${CONFIG.hhNvDienSheetName}!A:L`;
        const response = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
        const result = await response.json();
        const hhbhData = await fetchSheetData(CONFIG.hhbhSheetName);
        hhBhMvdSet = new Set((hhbhData || [])
            .slice(1)
            .flatMap(row => [row[2], row[3]]
                .map(v => (v || '').toString().trim())
                .filter(Boolean)));
        if (result.values && result.values.length > 1) {
            hhShopDienData = result.values.slice(1).map((row, idx) => ({
                rowIndex: idx + 2,
                id: row[0] || '',
                mvd: row[1] || '',
                mdh: row[2] || '',
                ma_gian: row[3] || '',
                sku: row[4] || '',
                hoan_tra: row[5] || '',
                ngay_tra: row[6] || '',
                mvd_tra: row[7] || '',
                sku_tra: row[8] || '',
                ghi_chu: row[9] || '',
                xac_nhan: row[10] || '',
                udt: row[11] || ''
            }));
        } else {
            hhShopDienData = [];
        }
        applyHHShopFilterState();
        renderHHShopDienTable();
    } catch (error) {
        console.error('Load HH SHOP ĐIỀN error:', error);
        if (tbody) tbody.innerHTML = '<tr><td colspan="11" class="text-center py-8 text-slate-500">Không thể tải dữ liệu HH_NV_DIEN.</td></tr>';
    }
}

function renderHHShopDienTable() {
    const tbody = document.getElementById('hhShopTableBody');
    const stats = document.getElementById('hhShopStats');
    if (!tbody) return;
    const search = (document.getElementById('hhShopSearchMvd')?.value || '').toLowerCase().trim();
    const maGianFilter = (document.getElementById('hhShopFilterMaGian')?.value || '').toLowerCase().trim();
    const fromYmd = document.getElementById('hhShopNgayTraFrom')?.value || '';
    const toYmd = document.getElementById('hhShopNgayTraTo')?.value || '';
    const xacNhanFilter = (document.getElementById('hhShopXacNhanFilterButtons')?.dataset.value || '').toLowerCase().trim();
    const daNhanFilter = (document.getElementById('hhShopDaNhanFilterButtons')?.dataset.value || '').toLowerCase().trim();
    saveHHShopFilterState();
    filteredHHShopDienData = hhShopDienData
        .slice()
        .sort((a, b) => {
            const ay = parseDmyToYmd(a.ngay_tra) || '';
            const by = parseDmyToYmd(b.ngay_tra) || '';
            if (ay !== by) return by.localeCompare(ay);
            return Number(b.rowIndex || 0) - Number(a.rowIndex || 0);
        })
        .filter(item => {
            if (search) {
                const matchSearch = [
                    item.mvd,
                    item.mdh,
                    item.ma_gian,
                    item.sku,
                    item.hoan_tra,
                    item.ngay_tra,
                    item.mvd_tra,
                    item.sku_tra,
                    item.ghi_chu,
                    item.xac_nhan
                ].some(value => (value || '').toString().toLowerCase().includes(search));
                if (!matchSearch) return false;
            }
            if (maGianFilter && !(item.ma_gian || '').toString().toLowerCase().includes(maGianFilter)) return false;
            const ngayTraYmd = parseDmyToYmd(item.ngay_tra);
            if (fromYmd && (!ngayTraYmd || ngayTraYmd < fromYmd)) return false;
            if (toYmd && (!ngayTraYmd || ngayTraYmd > toYmd)) return false;
            if (xacNhanFilter) {
                const itemXacNhan = (item.xac_nhan || '').toString().toLowerCase().trim();
                const normalized = xacNhanFilter === 'trống' ? '' : xacNhanFilter;
                if (xacNhanFilter === 'trống') {
                    if (itemXacNhan) return false;
                } else if (itemXacNhan !== normalized) {
                    return false;
                }
            }
            if (daNhanFilter) {
                const isCoDon = hhBhMvdSet.has((item.mvd || '').toString().trim()) || hhBhMvdSet.has((item.mvd_tra || '').toString().trim());
                if (daNhanFilter === 'có đơn' && !isCoDon) return false;
                if (daNhanFilter === 'trống' && isCoDon) return false;
            }
            return true;
        });
    if (stats) stats.textContent = `Số dòng: ${filteredHHShopDienData.length.toLocaleString('vi-VN')}`;
    if (!filteredHHShopDienData.length) {
        tbody.innerHTML = '<tr><td colspan="11" class="text-center py-8 text-slate-500">Không có dữ liệu.</td></tr>';
        return;
    }
    tbody.innerHTML = filteredHHShopDienData.map(item => {
        const isCoDon = hhBhMvdSet.has((item.mvd || '').toString().trim()) || hhBhMvdSet.has((item.mvd_tra || '').toString().trim());
        return `
                <tr ondblclick="openHHShopDetail(${item.rowIndex})" class="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <td class="px-3 py-2 text-sm text-slate-900 font-medium">${item.mvd ? `✅ ${escapeHtml(item.mvd)}` : '-'}</td>
                    <td class="px-3 py-2 text-sm text-slate-700">${escapeHtml(item.mdh || '-')}</td>
                    <td class="px-3 py-2 text-sm text-slate-700">${escapeHtml(item.ma_gian || '-')}</td>
                    <td class="px-3 py-2 text-sm text-slate-700">${escapeHtml(item.sku || '-')}</td>
                    <td class="px-3 py-2 text-sm text-slate-700">${escapeHtml(item.hoan_tra || '-')}</td>
                    <td class="px-3 py-2 text-sm text-slate-700">${escapeHtml(item.ngay_tra || '-')}</td>
                    <td class="px-3 py-2 text-sm text-slate-700">${escapeHtml(item.mvd_tra || '-')}</td>
                    <td class="px-3 py-2 text-sm text-slate-700">${escapeHtml(item.sku_tra || '-')}</td>
                    <td class="px-3 py-2 text-sm text-slate-700 max-w-[220px] truncate" title="${escapeHtml(item.ghi_chu || '')}">${escapeHtml(item.ghi_chu || '-')}</td>
                    <td class="px-3 py-2 text-sm text-slate-700">
                        <button type="button" onclick="event.stopPropagation(); setHHShopXacNhan('${(item.xac_nhan || '').replace(/'/g, "\\'")}')" class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold ${item.xac_nhan ? 'bg-slate-100' : 'bg-white'}">${escapeHtml(item.xac_nhan || 'Trống')}</button>
                    </td>
                    <td class="px-3 py-2 text-sm text-slate-700">${isCoDon ? 'có đơn' : ''}</td>
                </tr>`;
    }).join('');
}


    Object.assign(window.AppModules = window.AppModules || {}, { ['hh_shop_dien']: true });
    window.refreshHHShopAutoFields = refreshHHShopAutoFields;
    window.saveHHShopFilterState = saveHHShopFilterState;
    window.loadHHShopFilterState = loadHHShopFilterState;
    window.applyHHShopFilterState = applyHHShopFilterState;
    window.setHHShopDateFilter = setHHShopDateFilter;
    window.setHHShopNgayTraFilterToday = setHHShopNgayTraFilterToday;
    window.setHHShopNgayTraFilterThisWeek = setHHShopNgayTraFilterThisWeek;
    window.clearHHShopNgayTraFilter = clearHHShopNgayTraFilter;
    window.syncHHShopButtonFilter = syncHHShopButtonFilter;
    window.setHHShopButtonFilter = setHHShopButtonFilter;
    window.setHHShopXacNhanFilter = setHHShopXacNhanFilter;
    window.setHHShopDaNhanFilter = setHHShopDaNhanFilter;
    window.markHHShopMvdTraManual = markHHShopMvdTraManual;
    window.markHHShopSkuTraManual = markHHShopSkuTraManual;
    window.scheduleHHShopAutoSave = scheduleHHShopAutoSave;
    window.syncHHShopButtonGroup = syncHHShopButtonGroup;
    window.setHHShopButtonGroup = setHHShopButtonGroup;
    window.setHHShopXacNhan = setHHShopXacNhan;
    window.deleteHHShopDien = deleteHHShopDien;
    window.fetchSheetMeta = fetchSheetMeta;
    window.setHHShopHoanTra = setHHShopHoanTra;
    window.handleHHShopMvdChange = handleHHShopMvdChange;
    window.handleHHShopMdhChange = handleHHShopMdhChange;
    window.renderHHShopSuggestions = renderHHShopSuggestions;
    window.selectHHShopItem = selectHHShopItem;
    window.setHHShopNgayTraRaw = setHHShopNgayTraRaw;
    window.openHHShopNgayTraPicker = openHHShopNgayTraPicker;
    window.getTodayYmd = getTodayYmd;
    window.parseDmyToYmd = parseDmyToYmd;
    window.shiftDateValueByDays = shiftDateValueByDays;
    window.changeHHShopNgayTra = changeHHShopNgayTra;
    window.shiftHHFilterDate = shiftHHFilterDate;
    window.shiftHHShopNgayTra = shiftHHShopNgayTra;
    window.openHHShopNewDrawer = openHHShopNewDrawer;
    window.closeHHShopDrawer = closeHHShopDrawer;
    window.saveHHShopDien = saveHHShopDien;
    window.openHHShopDetail = openHHShopDetail;
    window.fetchHHShopDienData = fetchHHShopDienData;
    window.renderHHShopDienTable = renderHHShopDienTable;
})();
