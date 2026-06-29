// donhang - Module Pattern (IIFE)
(function () {
function openDetailDrawer(originalIndex) {
    currentDrawerMode = 'udct';
    currentEditRowIndex = originalIndex;
    currentHangHoanEditIndex = -1;
    const item = udctData[originalIndex];
    if (!item) return;
    const isKinhDoanh = currentUser && currentUser.role === 'kinhdoanh';
    suppressUDCTAutoSave = true;
    document.getElementById('drawerRowId').textContent = `Row ID: ${item.rowIndex}`;
    document.getElementById('drawerTenSP').textContent = item.ten_sp || 'N/A';
    document.getElementById('editSoLuong').value = item.so_luong || '';
    document.getElementById('editDonGia').value = item.don_gia_1 || '';
    document.getElementById('editIdSP').value = item.id_sp || '';
    document.getElementById('editIdSPCT').value = item.id_sp_ct || '';
    document.getElementById('editTinhTrang').value = item.tinh_trang || 'Chờ xác nhận';
    document.getElementById('editTrangThai').value = item.trang_thai || '';
    renderEditTrangThaiButtons(item.trang_thai || '');
    document.getElementById('editGhiChu').value = item.ghi_chu || '';

    ['editSoLuong', 'editDonGia', 'editIdSP', 'editIdSPCT'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = isKinhDoanh;
    });
    const ghiChuEl = document.getElementById('editGhiChu');
    if (ghiChuEl) ghiChuEl.disabled = false; // KINHDOANH luôn được sửa ghi chú

    const ttButtons = document.getElementById('editTrangThaiButtons');
    if (ttButtons) ttButtons.style.pointerEvents = isKinhDoanh ? 'none' : '';

    const footer = document.querySelector('#detailDrawer .pt-4.border-t.border-slate-200.flex.gap-3');
    if (footer) footer.style.display = isKinhDoanh ? 'none' : '';

    const kdFooter = document.getElementById('kdGhiChuFooter');
    if (kdFooter) kdFooter.classList.toggle('hidden', !isKinhDoanh);

    handleIdSPChange();
    handleIdSPCTChange();
    if (!document.getElementById('editIdSPCT').value) {
        document.getElementById('drawerTenSP').textContent = item.ten_sp || 'N/A';
    }
    suppressUDCTAutoSave = false;

    document.getElementById('detailDrawerOverlay').classList.remove('hidden');
    document.getElementById('detailDrawer').classList.add('open');
}

async function saveKDGhiChu() {
    if (currentEditRowIndex === -1) return;
    const item = udctData[currentEditRowIndex];
    if (!item) return;
    const newGhiChu = document.getElementById('editGhiChu').value;
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');
    try {
        const token = await getAccessToken();
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchUpdate`;
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                valueInputOption: 'USER_ENTERED',
                data: [{ range: `${CONFIG.udctSheetName}!AA${item.rowIndex}`, values: [[newGhiChu]] }]
            })
        });
        if (resp.ok) {
            item.ghi_chu = newGhiChu;
            renderUDCTTable();
            closeDetailDrawer();
        } else {
            alert('Lỗi khi lưu ghi chú.');
        }
    } catch (err) {
        alert('Lỗi: ' + err.message);
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
}

function closeDetailDrawer() {
    document.getElementById('detailDrawerOverlay').classList.add('hidden');
    document.getElementById('detailDrawer').classList.remove('open');
    currentEditRowIndex = -1;
    currentDrawerMode = 'udct';
    clearTimeout(udctAutoSaveTimer);
}

async function saveRowDetail(showLoading = false) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (showLoading) loadingOverlay.classList.remove('hidden');

    try {
        const token = await getAccessToken();
        if (currentDrawerMode === 'hh') {
            if (currentHangHoanEditIndex === -1) return;
            const item = hangHoanData[currentHangHoanEditIndex];
            if (!item) return;

            const newData = {
                mvd: document.getElementById('editIdSP')?.value || '',
                ma_gian: document.getElementById('editIdSPCT')?.value || '',
                sku: document.getElementById('editSoLuong')?.value || '',
                sku_ct: document.getElementById('editDonGia')?.value || '',
                slg: document.getElementById('editTinhTrang')?.value || '',
                tinh_trang: document.getElementById('editTrangThai')?.value || '',
                kho: document.getElementById('editGhiChu')?.value || ''
            };

            const batchUpdates = [
                { range: `${CONFIG.hhbhSheetName}!C${item.rowIndex}`, values: [[newData.mvd]] },
                { range: `${CONFIG.hhbhSheetName}!D${item.rowIndex}`, values: [[newData.ma_gian]] },
                { range: `${CONFIG.hhbhSheetName}!H${item.rowIndex}`, values: [[newData.sku]] },
                { range: `${CONFIG.hhbhSheetName}!I${item.rowIndex}`, values: [[newData.sku_ct]] },
                { range: `${CONFIG.hhbhSheetName}!J${item.rowIndex}`, values: [[newData.slg]] },
                { range: `${CONFIG.hhbhSheetName}!N${item.rowIndex}`, values: [[newData.tinh_trang]] },
                { range: `${CONFIG.hhbhSheetName}!T${item.rowIndex}`, values: [[newData.kho]] }
            ];

            const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchUpdate`;
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data: batchUpdates })
            });

            if (resp.ok) {
                Object.assign(item, {
                    mvd: newData.mvd,
                    ma_gian: newData.ma_gian,
                    sku: newData.sku,
                    sku_ct: newData.sku_ct,
                    slg: newData.slg,
                    tinh_trang: newData.tinh_trang,
                    kho: newData.kho
                });
                filterHangHoanData();
                closeDetailDrawer();
                showToast('Cập nhật Hàng hoàn thành công!', 'success');
            } else {
                console.error('Save error:', await resp.text());
                alert('Lỗi khi lưu dữ liệu Hàng hoàn vào Google Sheet.');
            }
            return;
        }

        if (currentEditRowIndex === -1) return;
        const item = udctData[currentEditRowIndex];
        const newData = {
            so_luong: document.getElementById('editSoLuong').value,
            don_gia_1: document.getElementById('editDonGia').value,
            id_sp: document.getElementById('editIdSP').value,
            id_sp_ct: document.getElementById('editIdSPCT').value,
            tinh_trang: document.getElementById('editTinhTrang').value,
            trang_thai: document.getElementById('editTrangThai').value,
            ghi_chu: document.getElementById('editGhiChu').value
        };
        const trangThaiLower = (newData.trang_thai || '').toLowerCase();
        const isHuyOrHetHang1 = trangThaiLower.includes('hủy') || trangThaiLower.includes('hết hàng') || trangThaiLower.includes('hêt hàng');
        const nextSlgXuat = isHuyOrHetHang1 ? 0 : (newData.so_luong || 0);
        // so_luong=O, id_sp=P, id_sp_ct=Q, tinh_trang=X, trang_thai=Y, slg_xuat=S, ghi_chu=AA, don_gia=AE
        const batchUpdates = [
            { range: `${CONFIG.udctSheetName}!O${item.rowIndex}`, values: [[newData.so_luong]] },
            { range: `${CONFIG.udctSheetName}!P${item.rowIndex}`, values: [[newData.id_sp]] },
            { range: `${CONFIG.udctSheetName}!Q${item.rowIndex}`, values: [[newData.id_sp_ct]] },
            { range: `${CONFIG.udctSheetName}!S${item.rowIndex}`, values: [[nextSlgXuat]] },
            { range: `${CONFIG.udctSheetName}!X${item.rowIndex}`, values: [[newData.tinh_trang]] },
            { range: `${CONFIG.udctSheetName}!Y${item.rowIndex}`, values: [[newData.trang_thai]] },
            { range: `${CONFIG.udctSheetName}!AA${item.rowIndex}`, values: [[newData.ghi_chu]] },
            { range: `${CONFIG.udctSheetName}!AE${item.rowIndex}`, values: [[newData.don_gia_1]] }
        ];
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchUpdate`;
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data: batchUpdates })
        });
        if (resp.ok) {
            Object.assign(item, newData);
            item.slg_xuat = nextSlgXuat;
            renderUDCTTable();
        } else {
            console.error('Save error:', await resp.text());
            alert('Lỗi khi lưu dữ liệu vào Google Sheet.');
        }
    } catch (err) {
        console.error('Save error:', err);
        alert('Đã xảy ra lỗi khi lưu.');
    } finally {
        if (showLoading) loadingOverlay.classList.add('hidden');
    }
}

function handleIdSPChange() {
    const idSpVal = document.getElementById('editIdSP').value.trim();
    const idSpCtList = document.getElementById('idSpCtList');
    const buttonContainer = document.getElementById('editIdSPCTButtons');
    if (!idSpCtList) return;

    let filteredMã = sanphamData.map(sp => sp.sku_con || '');
    if (idSpVal) {
        const searchVal = idSpVal.toLowerCase();
        filteredMã = filteredMã.filter(ma => (ma || '').toString().toLowerCase().startsWith(searchVal));
    }
    const uniqueMã = [...new Set(filteredMã)].filter(Boolean);

    // Update Datalist
    idSpCtList.innerHTML = uniqueMã.map(ma => `<option value="${ma}">`).join('');

    // Update Buttons
    if (buttonContainer) {
        if (idSpVal && uniqueMã.length > 0) {
            buttonContainer.innerHTML = uniqueMã.slice(0, 15).map(ma => `
                <button onclick="selectIdSPCTSuggestion('${ma}')" 
                        class="px-2 py-1 bg-blue-50 text-[10px] font-bold text-blue-600 rounded border border-blue-100 hover:bg-blue-100 transition-all">
                    ${ma}
                </button>
            `).join('');
        } else {
            buttonContainer.innerHTML = '';
        }
    }

    // Clear current ID SP CT if it doesn't match the new prefix
    const currentCt = document.getElementById('editIdSPCT').value.trim();
    if (currentCt && idSpVal && !currentCt.startsWith(idSpVal)) {
        document.getElementById('editIdSPCT').value = '';
        document.getElementById('drawerTenSP').textContent = '';
    }
}

function selectIdSPCTSuggestion(val) {
    const input = document.getElementById('editIdSPCT');
    if (input) {
        input.value = val;
        handleIdSPCTChange();
        if (typeof scheduleUDCTAutoSave === 'function') scheduleUDCTAutoSave();
    }
}

function handleIdSPCTChange() {
    const currentCt = document.getElementById('editIdSPCT').value.trim().toLowerCase();
    if (!currentCt) return;

    const sp = sanphamData.find(item => (item.sku_con || '').toString().toLowerCase() === currentCt);
    if (sp) {
        document.getElementById('drawerTenSP').textContent = sp.ten_sp || 'N/A';
    }
}

function populateSPLists() {
    const idSpList = document.getElementById('idSpList');
    if (idSpList && sanphamData) {
        const uniqueIdSPs = [...new Set(sanphamData.map(sp => (sp.sku_con || '').substring(0, 4)))].filter(Boolean);
        idSpList.innerHTML = uniqueIdSPs.map(id => `<option value="${id}">`).join('');
    }
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

function saveFiltersToCache() {
    const filters = {
        filterUDCTFrom: document.getElementById('filterUDCTFrom')?.value || '',
        filterUDCTTo: document.getElementById('filterUDCTTo')?.value || '',
        filterUDCTSan: document.getElementById('filterUDCTSan')?.value || '',
        filterUDCTKhungH: document.getElementById('filterUDCTKhungH')?.value || '',
        filterUDCTTrangThai: document.getElementById('filterUDCTTrangThai')?.value || '',
        filterUDCTMaGian: document.getElementById('filterUDCTMaGian')?.value || '',
        fromDate: document.getElementById('fromDate')?.value || '',
        toDate: document.getElementById('toDate')?.value || '',
        filterMaGian: document.getElementById('filterMaGian')?.value || ''
    };
    localStorage.setItem('erp_filters', JSON.stringify(filters));
}

function loadFiltersFromCache() {
    const filtersStr = localStorage.getItem('erp_filters');
    if (filtersStr) {
        try {
            const filters = JSON.parse(filtersStr);
            Object.keys(filters).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = filters[id];
            });
        } catch (e) { }
    } else {
        const today = new Date();
        const d = String(today.getDate()).padStart(2, '0');
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const y = today.getFullYear();
        const strDate = `${y}-${m}-${d}`;
        if (document.getElementById('fromDate')) document.getElementById('fromDate').value = strDate;
        if (document.getElementById('toDate')) document.getElementById('toDate').value = strDate;
    }
}

async function loadUDCTData(silent = false) {
    if (!silent) document.getElementById('donhangTableBody').innerHTML = generateSkeletonRows(18, 5);
    try {
        const data = await fetchSheetData(CONFIG.udctSheetName);
        if (data.length <= 1) {
            if (!silent) document.getElementById('donhangTableBody').innerHTML = '<tr><td colspan="19" class="text-center py-8 text-slate-500">Không có dữ liệu</td></tr>';
            return;
        }

        udctData = data.slice(1).map((row, idx) => ({
            rowIndex: idx + 2,
            ngay: row[4] || '',
            san: row[8] || '',
            khung_h: row[9] || '',
            ma_gian: row[10] || '',
            mvd: row[11] || '',
            mdh: row[12] || '',
            sku_shop_up: row[13] || '',
            so_luong: row[14] || '',
            id_sp: row[15] || '',
            id_sp_ct: row[16] || '',
            ten_sp: row[17] || '',
            slg_xuat: row[18] || '',
            don_gia_1: row[30] || '',
            tinh_trang: row[23] || '',
            trang_thai: row[24] || '',
            ghi_chu: row[26] || '',
            mien: row[7] || ''
        }));

        populateUDCTFilters();

        // Helper to parse date for sorting
        const toIsoDate = (str) => {
            if (!str) return '';
            const s = str.split(' ')[0];
            if (s.includes('/')) {
                const [d, m, y] = s.split('/');
                return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
            return s;
        };

        // Sắp xếp Đơn chi tiết theo ngày giảm dần (mới nhất lên đầu)
        udctData.sort((a, b) => {
            const da = toIsoDate(a.ngay);
            const db = toIsoDate(b.ngay);
            return db.localeCompare(da);
        });

        if (silent) {
            // Cập nhật bảng nếu không đang mở drawer chi tiết
            const isDrawerOpen = !document.getElementById('detailDrawerOverlay').classList.contains('hidden');
            if (!isDrawerOpen) {
                filterUDCTTable();
            }
        } else {
            setUDCTQuickDate('today'); // Sets default date to today and calls filterUDCTTable
        }
        buildUpmisaData();
    } catch (error) {
        console.error("Load UDCT error:", error);
    }
}

function normalizeSanLabel(v) {
    return (v || '')
        .toString()
        .trim()
        .replace(/\d+$/, '')
        .trim();
}



function populateUDCTFilters() {
    const sans = [...new Set(udctData.map(i => normalizeSanLabel(i.san)))].filter(Boolean).sort();
    const khungHs = [...new Set(udctData.map(i => i.khung_h))].filter(Boolean).sort((a, b) => {
        const numA = parseInt(a) || 0;
        const numB = parseInt(b) || 0;
        return numA - numB;
    });
    const maGians = [...new Set(udctData.map(i => i.ma_gian))].filter(Boolean).sort();
    const idSps = [...new Set(udctData.map(i => i.id_sp))].filter(Boolean).sort();
    const idSpCts = [...new Set(udctData.map(i => i.id_sp_ct))].filter(Boolean).sort();

    const khSelection = document.getElementById('filterUDCTKhungH')?.value || '';
    const mgSelection = document.getElementById('filterUDCTMaGian')?.value || '';
    const sanSelection = document.getElementById('filterUDCTSan')?.value || '';
    const ttSelection = document.getElementById('filterUDCTTrangThai')?.value || '';
    const selectedStatuses = new Set((ttSelection || '').split('||').map(normalizeTrangThai).filter(Boolean));

    const commonFiltered = getUDCTBaseFilteredForStatusCounts();
    const renderCountBadge = (count) => {
        const n = Number(count) || 0;
        if (n <= 0) return '';
        return `<span class="ml-1 inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 text-[10px] font-bold leading-none text-red-600 bg-white border border-red-200 shadow-sm rounded-md">${n.toLocaleString('vi-VN')}</span>`;
    };
    const setBadgeCount = (id, count) => {
        const el = document.getElementById(id);
        if (!el) return;
        const n = Number(count) || 0;
        el.textContent = n > 0 ? n.toLocaleString('vi-VN') : '';
        el.classList.toggle('hidden', n <= 0);
    };

    const fillSelect = (id, list, placeholder) => {
        const select = document.getElementById(id);
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = `<option value="">${placeholder}</option>` +
            list.map(v => `<option value="${v}">${v}</option>`).join('');
        select.value = currentVal;
    };

    const renderBtns = (id, options, currentVal, countField) => {
        const container = document.getElementById(id + 'Buttons');
        if (!container) return;
        const counts = options.reduce((acc, opt) => {
            acc[opt] = commonFiltered.filter(item => {
                if (countField === 'san') {
                    if (normalizeSanLabel(item.san) !== opt) return false;
                    if (khSelection && item.khung_h !== khSelection) return false;
                    if (mgSelection && item.ma_gian !== mgSelection) return false;
                    if (selectedStatuses.size > 0 && !selectedStatuses.has(normalizeTrangThai(item.trang_thai))) return false;
                } else if (countField === 'khung_h') {
                    if (item.khung_h !== opt) return false;
                    if (sanSelection && normalizeSanLabel(item.san) !== sanSelection) return false;
                    if (mgSelection && item.ma_gian !== mgSelection) return false;
                    if (selectedStatuses.size > 0 && !selectedStatuses.has(normalizeTrangThai(item.trang_thai))) return false;
                }
                return true;
            }).length;
            return acc;
        }, {});

        let html = `<button onclick="setUDCTBtnFilter('${id}', '')" class="px-2 py-1.5 text-[11px] rounded-lg font-bold transition-all duration-200 ${currentVal === '' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-600'}">Tất cả</button>`;
        options.forEach(opt => {
            const badgeHtml = renderCountBadge(counts[opt]);
            html += `<button onclick="setUDCTBtnFilter('${id}', '${opt}')" data-opt="${opt}" class="px-2 py-1.5 text-[11px] rounded-lg font-bold transition-all duration-200 flex items-center ${currentVal === opt ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-600'}">${opt} ${badgeHtml}</button>`;
        });
        container.innerHTML = html;
    };

    const renderMultiStatusBtns = (id, options, currentVal) => {
        const container = document.getElementById(id + 'Buttons');
        if (!container) return;

        const counts = options.reduce((acc, opt) => {
            acc[opt] = commonFiltered.filter(item => {
                if (normalizeTrangThai(item.trang_thai) !== normalizeTrangThai(opt)) return false;
                if (sanSelection && normalizeSanLabel(item.san) !== sanSelection) return false;
                if (khSelection && item.khung_h !== khSelection) return false;
                if (mgSelection && item.ma_gian !== mgSelection) return false;
                return true;
            }).length;
            return acc;
        }, {});

        const selected = new Set((currentVal || '').split('||').map(normalizeTrangThai).filter(Boolean));
        let html = `<button onclick="setUDCTStatusMultiFilter('')" class="px-2 py-1.5 text-[11px] rounded-lg font-bold transition-all duration-200 ${selected.size === 0 ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-600'}">Tất cả</button>`;
        options.forEach(opt => {
            const c = counts[opt] || 0;
            const active = selected.has(normalizeTrangThai(opt));
            const badgeHtml = renderCountBadge(c);
            html += `<button onclick="setUDCTStatusMultiFilter('${opt}')" class="px-2 py-1.5 text-[11px] rounded-lg font-bold transition-all duration-200 flex items-center ${active ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-600'}">${opt} ${badgeHtml}</button>`;
        });
        container.innerHTML = html;
    };

    const sf = document.getElementById('filterUDCTSan');
    if (sf) renderBtns('filterUDCTSan', sans, sf.value, 'san');

    const khf = document.getElementById('filterUDCTKhungH');
    if (khf) renderBtns('filterUDCTKhungH', khungHs, khf.value, 'khung_h');

    const ttf = document.getElementById('filterUDCTTrangThai');
    if (ttf) renderMultiStatusBtns('filterUDCTTrangThai', udctTrangThaiOptions, ttf.value);

    fillSelect('filterUDCTMaGian', maGians, 'Tất cả Mã gian');

    const mgList = document.getElementById('maGianList');
    if (mgList) {
        mgList.innerHTML = maGians.map(v => `<option value="${v}">`).join('');
    }
    const idSpList = document.getElementById('udctIdSpList');
    if (idSpList) {
        idSpList.innerHTML = idSps.map(v => `<option value="${v}">`).join('');
    }
    const idSpCtList = document.getElementById('udctIdSpCtList');
    if (idSpCtList) {
        idSpCtList.innerHTML = idSpCts.map(v => `<option value="${v}">`).join('');
    }

    // Update Tab Badges
    const counts = {
        duplicate: 0,
        notes: commonFiltered.filter(i => (i.ghi_chu || '').toString().trim()).length,
        noSku: commonFiltered.filter(i => !(i.id_sp_ct || '').toString().trim()).length
    };
    const mvdCounts = {};
    commonFiltered.forEach(i => { if (i.mvd && i.mvd !== '-') mvdCounts[i.mvd] = (mvdCounts[i.mvd] || 0) + 1; });
    counts.duplicate = commonFiltered.filter(i => i.mvd && i.mvd !== '-' && mvdCounts[i.mvd] > 1).length;

    setBadgeCount('udctDuplicateCountBadge', counts.duplicate);
    setBadgeCount('udctNotesCountBadge', counts.notes);
    setBadgeCount('udctNoSkuCountBadge', counts.noSku);
}

function setUDCTBtnFilter(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
    // Gọi filterUDCTTable sẽ tự động gọi luôn populateUDCTFilters
    filterUDCTTable();
}

function setUDCTStatusMultiFilter(val) {
    const el = document.getElementById('filterUDCTTrangThai');
    if (!el) return;
    const selected = new Set((el.value || '').split('||').map(normalizeTrangThai).filter(Boolean));
    const normalizedVal = normalizeTrangThai(val);
    if (!val) {
        selected.clear();
    } else if (selected.has(normalizedVal)) {
        selected.delete(normalizedVal);
    } else {
        selected.add(normalizedVal);
    }
    el.value = Array.from(selected).join('||');
    // Gọi filterUDCTTable sẽ tự động gọi luôn populateUDCTFilters
    filterUDCTTable();
}

function renderEditTrangThaiButtons(currentVal = '') {
    const container = document.getElementById('editTrangThaiButtons');
    if (!container) return;
    const options = [
        { value: '', label: 'Để trống' },
        { value: '1 THAY THẾ', label: '1 THAY THẾ' },
        { value: '2 HỦY', label: '2 HỦY' },
        { value: '3 HÊT HÀNG', label: '3 HÊT HÀNG' },
        { value: '4 MAI GỌI', label: '4 MAI GỌI' }
    ];
    container.innerHTML = options.map(opt => {
        const active = currentVal === opt.value;
        return `<button type="button" onclick="setEditTrangThai('${opt.value}')" class="px-3 py-1.5 text-xs rounded-lg font-bold border transition-all duration-200 ${active ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}">${opt.label}</button>`;
    }).join('');
}

function setEditTrangThai(value) {
    const input = document.getElementById('editTrangThai');
    if (input) input.value = value;
    renderEditTrangThaiButtons(value);
    scheduleUDCTAutoSave();
}

function scheduleUDCTAutoSave() {
    if (suppressUDCTAutoSave) return;
    if (currentDrawerMode !== 'udct' || currentEditRowIndex === -1) return;
    clearTimeout(udctAutoSaveTimer);
    udctAutoSaveTimer = setTimeout(() => {
        saveRowDetail(false);
    }, 450);
}

// filteredUDCT, udctCurrentPage, uitItemsPerPage, udctQuickStatusTab,
// udctSelectedRows, udctTrangThaiOptions are declared in js/state.js

function normalizeTrangThai(v) {
    return (v || '').toString().trim().toUpperCase();
}

function getUDCTIdSpCtMatches(inputValue, rowIndex, limit = 25) {
    if (!sanphamData || sanphamData.length === 0) return [];

    const row = udctData.find(item => String(item.rowIndex) === String(rowIndex));
    const idSp = (row?.id_sp || '').toString().trim().toLowerCase();
    const search = (inputValue || '').toString().trim().toLowerCase();
    const seen = new Set();
    const matches = [];

    sanphamData.forEach(sp => {
        const sku = (sp.sku_con || '').toString().trim();
        if (!sku || seen.has(sku)) return;

        const skuLower = sku.toLowerCase();
        const name = (sp.ten_sp || '').toString().trim();
        const nameLower = name.toLowerCase();
        const prefixMatch = idSp && skuLower.startsWith(idSp);
        const searchMatch = search && (skuLower.includes(search) || nameLower.includes(search));

        if ((search && searchMatch) || (!search && prefixMatch)) {
            seen.add(sku);
            matches.push({ sku, name });
        }
    });

    return matches
        .sort((a, b) => a.sku.localeCompare(b.sku))
        .slice(0, limit);
}

function hideUDCTIdSpCtSuggestions(rowIndex) {
    const box = document.getElementById(`udctSpCtSuggestions-${rowIndex}`);
    if (box) box.classList.add('hidden');
}

function renderUDCTIdSpCtSuggestions(input, rowIndex, forceShow = false) {
    const box = document.getElementById(`udctSpCtSuggestions-${rowIndex}`);
    if (!box || !input) return;

    if ((!sanphamData || sanphamData.length === 0) && typeof loadSanphamData === 'function') {
        box.innerHTML = '<div class="suggestion-item"><span class="item-name">Đang tải danh mục sản phẩm...</span></div>';
        box.classList.remove('hidden');
        loadSanphamData().then(() => renderUDCTIdSpCtSuggestions(input, rowIndex, forceShow));
        return;
    }

    const matches = getUDCTIdSpCtMatches(input.value, rowIndex);
    if ((forceShow || input.value.trim()) && matches.length > 0) {
        box.innerHTML = matches.map(item => `
            <button type="button" data-sku="${escapeHtml(item.sku)}"
                    onmousedown="event.preventDefault(); selectUDCTIdSpCtSuggestion('${rowIndex}', this.dataset.sku)"
                    class="suggestion-item w-full text-left">
                <span class="item-code">${escapeHtml(item.sku)}</span>
                <span class="item-name">${escapeHtml(item.name || '-')}</span>
            </button>
        `).join('');
        box.classList.remove('hidden');
    } else {
        box.innerHTML = '';
        box.classList.add('hidden');
    }
}

function selectUDCTIdSpCtSuggestion(rowIndex, sku) {
    const input = document.getElementById(`udctIdSpCtInput-${rowIndex}`);
    if (input) input.value = sku;
    hideUDCTIdSpCtSuggestions(rowIndex);
    saveUDCTMainInline(rowIndex, 'id_sp_ct', sku);
}

async function saveUDCTMainInline(rowIndex, field, value) {
    const item = udctData.find(i => Number(i.rowIndex) === Number(rowIndex));
    if (!item) return;

    // Chuẩn hóa giá trị
    const val = value.trim();
    item[field] = val;

    try {
        const token = await getAccessToken();
        const updates = [];

        if (field === 'id_sp_ct') {
            // Cập nhật mã (Cột Q - Index 16)
            updates.push({
                range: `${CONFIG.udctSheetName}!Q${rowIndex}`,
                values: [[val]]
            });

            // Tìm thông tin sản phẩm để cập nhật nốt Tên và Giá
            if (sanphamData && sanphamData.length > 0) {
                let updated = false;

                // Lấy tên theo sku_con
                const spName = sanphamData.find(s => (s.sku_con || '').toString().toLowerCase() === val.toLowerCase());
                if (spName) {
                    item.ten_sp = spName.ten_sp;
                    item.id_sp = spName.id_sp || (spName.sku_con || '').substring(0, 4);
                    updates.push({ range: `${CONFIG.udctSheetName}!R${rowIndex}`, values: [[item.ten_sp]] });
                    updates.push({ range: `${CONFIG.udctSheetName}!P${rowIndex}`, values: [[item.id_sp]] });
                    updated = true;
                }

                // Lấy giá theo id_sp (Mã SP Cha)
                const currentIdSp = (item.id_sp || '').toString().trim();
                if (currentIdSp) {
                    const spPrice = sanphamData.find(s => (s.id_sp || '').toString().toLowerCase() === currentIdSp.toLowerCase());
                    if (spPrice) {
                        const newPrice = spPrice.gia_ban;
                        item.don_gia_1 = newPrice;
                        updates.push({ range: `${CONFIG.udctSheetName}!AE${rowIndex}`, values: [[newPrice]] });
                        updated = true;
                    }
                }

                const itemTrangThaiLower = (item.trang_thai || '').toLowerCase();
                const isHuyOrHetHang2 = itemTrangThaiLower.includes('hủy') || itemTrangThaiLower.includes('hết hàng') || itemTrangThaiLower.includes('hêt hàng');
                if (updated && !isHuyOrHetHang2) {
                    item.slg_xuat = item.so_luong;
                    updates.push({ range: `${CONFIG.udctSheetName}!S${rowIndex}`, values: [[item.slg_xuat]] });
                }
            }
        }

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchUpdate`;
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data: updates })
        });

        if (resp.ok) {
            renderUDCTTable();
        } else {
            console.error("Save Main Inline Error:", await resp.text());
            alert('Lỗi khi lưu dữ liệu trực tiếp.');
        }
    } catch (err) {
        console.error("Save Main Inline Exception:", err);
        alert('Có lỗi khi lưu: ' + err.message);
    }
}

function getUDCTBaseFilteredForStatusCounts() {
    const from = document.getElementById('filterUDCTFrom')?.value || '';
    const to = document.getElementById('filterUDCTTo')?.value || '';
    const san = document.getElementById('filterUDCTSan')?.value || '';
    const kh = document.getElementById('filterUDCTKhungH')?.value || '';
    const mg = document.getElementById('filterUDCTMaGian')?.value || '';
    const idSp = document.getElementById('filterUDCTIdSp')?.value || '';
    const idSpCt = document.getElementById('filterUDCTIdSpCt')?.value || '';
    const search = (document.getElementById('filterUDCTSearch')?.value || '').toLowerCase();

    return udctData.filter(item => {
        const rawDate = item.ngay ? item.ngay.split(' ')[0] : '';
        let itemDate = rawDate;
        if (rawDate.includes('/')) {
            const [d, m, y] = rawDate.split('/');
            itemDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        if (from && itemDate < from) return false;
        if (to && itemDate > to) return false;
        if (san && normalizeSanLabel(item.san) !== san) return false;
        if (kh && item.khung_h !== kh) return false;
        if (mg && item.ma_gian !== mg) return false;
        if (idSp && item.id_sp !== idSp) return false;
        if (idSpCt && item.id_sp_ct !== idSpCt) return false;
        if (udctQuickStatusTab === 'cancelled') {
            if (!(item.trang_thai || '').toLowerCase().includes('hủy') && !(item.tinh_trang || '').toLowerCase().includes('hủy')) {
                return false;
            }
        }
        if (udctQuickStatusTab === 'notes') {
            if (!(item.ghi_chu || '').toString().trim()) return false;
        }
        if (search) {
            const searchTerms = search.split(',').map(s => s.trim()).filter(Boolean);
            const rowText = `${item.mvd} ${item.mdh} ${item.ten_sp} ${item.id_sp_ct}`.toLowerCase();
            if (!searchTerms.some(term => rowText.includes(term))) return false;
        }
        return true;
    });
}

function setUDCTQuickTab(tab) {
    udctQuickStatusTab = tab;
    const tabs = {
        all: document.getElementById('udctTabAll'),
        cancelled: document.getElementById('udctTabCancelled'),
        duplicate: document.getElementById('udctTabDuplicate'),
        notes: document.getElementById('udctTabNotes'),
        noSku: document.getElementById('udctTabNoSku')
    };

    Object.keys(tabs).forEach(k => {
        if (!tabs[k]) return;
        if (k === tab) {
            tabs[k].className = "px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 border-primary text-primary transition-colors";
        } else {
            tabs[k].className = "px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-colors";
        }
    });
    filterUDCTTable();
}

function setUDCTQuickDate(type) {
    const fromInput = document.getElementById('filterUDCTFrom');
    const toInput = document.getElementById('filterUDCTTo');
    const today = new Date();
    let fromDate, toDate;

    const format = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    if (type === 'today') {
        fromDate = format(today);
        toDate = format(today);
    } else if (type === 'thisWeek') {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const firstDay = new Date(today.setDate(diff));
        fromDate = format(firstDay);

        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);
        toDate = format(lastDay);
    } else if (type === 'thisMonth') {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        fromDate = format(firstDay);
        toDate = format(lastDay);
    }

    fromInput.value = fromDate;
    toInput.value = toDate;
    filterUDCTTable();
}

function isUDCTTrung(item, mvdMap = {}, mdhMap = {}) {
    const mvdDup = item.mvd && mvdMap[item.mvd]?.size > 1;
    const mdhDup = item.mdh && mdhMap[item.mdh]?.size > 1;
    return Boolean(mvdDup || mdhDup);
}

function filterUDCTTable() {
    const from = document.getElementById('filterUDCTFrom').value;
    const to = document.getElementById('filterUDCTTo').value;
    const san = document.getElementById('filterUDCTSan').value;
    const kh = document.getElementById('filterUDCTKhungH').value;
    const mg = document.getElementById('filterUDCTMaGian').value;
    const idSp = document.getElementById('filterUDCTIdSp')?.value || '';
    const idSpCt = document.getElementById('filterUDCTIdSpCt')?.value || '';
    const tt = document.getElementById('filterUDCTTrangThai').value;
    const selectedStatuses = new Set((tt || '').split('||').map(normalizeTrangThai).filter(Boolean));
    const searchInput = document.getElementById('filterUDCTSearch');
    const search = searchInput ? searchInput.value.toLowerCase() : '';

    const base = udctData.filter(item => {
        const rawDate = item.ngay ? item.ngay.split(' ')[0] : '';
        let itemDate = rawDate;
        if (rawDate.includes('/')) {
            const [d, m, y] = rawDate.split('/');
            itemDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        if (from && itemDate < from) return false;
        if (to && itemDate > to) return false;
        if (san && normalizeSanLabel(item.san) !== san) return false;
        if (kh && item.khung_h !== kh) return false;
        if (mg && item.ma_gian !== mg) return false;
        if (idSp && item.id_sp !== idSp) return false;
        if (idSpCt && item.id_sp_ct !== idSpCt) return false;
        if (selectedStatuses.size > 0 && !selectedStatuses.has(normalizeTrangThai(item.trang_thai))) return false;

        if (search) {
            const searchTerms = search.split(',').map(s => s.trim()).filter(Boolean);
            const rowText = `${item.mvd} ${item.mdh} ${item.ten_sp} ${item.id_sp_ct}`.toLowerCase();
            const isMatch = searchTerms.some(term => rowText.includes(term));
            if (!isMatch) return false;
        }
        return true;
    });

    filteredUDCT = udctQuickStatusTab === 'cancelled'
        ? base.filter(item => (item.trang_thai || '').toLowerCase().includes('hủy') || (item.tinh_trang || '').toLowerCase().includes('hủy'))
        : udctQuickStatusTab === 'notes'
            ? base.filter(item => (item.ghi_chu || '').toString().trim())
            : udctQuickStatusTab === 'noSku'
                ? base.filter(item => !(item.id_sp_ct || '').toString().trim())
                : udctQuickStatusTab === 'duplicate'
                    ? (() => {
                        const mvdCounts = {};
                        base.forEach(i => { if (i.mvd && i.mvd !== '-') mvdCounts[i.mvd] = (mvdCounts[i.mvd] || 0) + 1; });
                        return base.filter(i => i.mvd && i.mvd !== '-' && mvdCounts[i.mvd] > 1);
                    })()
                    : base;

    // Cập nhật badge Tổng dòng và Unique MVD
    const totalRowsBadge = document.getElementById('udctTotalRowsBadge');
    const uniqueMVDBadge = document.getElementById('udctUniqueMVDBadge');
    if (totalRowsBadge) totalRowsBadge.textContent = filteredUDCT.length > 0 ? filteredUDCT.length.toLocaleString('vi-VN') : '';
    if (uniqueMVDBadge) {
        const uniqueMVDs = new Set(filteredUDCT.map(i => i.mvd).filter(v => v && v !== '-'));
        uniqueMVDBadge.textContent = uniqueMVDs.size > 0 ? uniqueMVDs.size.toLocaleString('vi-VN') : '';
    }

    saveFiltersToCache();
    udctCurrentPage = 1;

    // Cập nhật lại logic đếm số trên các thẻ button (Sàn, Khung H, ...)
    populateUDCTFilters();

    renderUDCTTable();
}

function changeUDCTDate(id, delta) {
    const input = document.getElementById(id);
    if (!input.value) return;
    const d = new Date(input.value);
    d.setDate(d.getDate() + delta);
    input.value = d.toISOString().split('T')[0];
    filterUDCTTable();
}

function changeReportDate(id, delta) {
    const input = document.getElementById(id);
    if (!input.value) return;
    const d = new Date(input.value);
    d.setDate(d.getDate() + delta);
    input.value = d.toISOString().split('T')[0];
    autoFilterReport();
}

function changeUDCTPage(step) {
    const totalPages = Math.ceil(filteredUDCT.length / uitItemsPerPage);
    udctCurrentPage += step;
    if (udctCurrentPage < 1) udctCurrentPage = 1;
    if (udctCurrentPage > totalPages) udctCurrentPage = totalPages;
    renderUDCTTable();
}

function getSelectedUDCTItems() {
    return Array.from(udctSelectedRows)
        .map(rowIndex => udctData.find(item => String(item.rowIndex) === String(rowIndex)))
        .filter(Boolean);
}

function refreshUDCTSelectionControls() {
    const hasSelection = udctSelectedRows.size > 0;
    document.querySelectorAll('[data-udct-requires-selection]').forEach(button => {
        button.disabled = !hasSelection;
        button.classList.toggle('opacity-45', !hasSelection);
        button.classList.toggle('cursor-not-allowed', !hasSelection);
        button.classList.toggle('pointer-events-none', !hasSelection);
    });
}

function ensureUDCTRowSelected(item) {
    if (!item || !udctSelectedRows.has(String(item.rowIndex))) {
        alert('Vui lòng chọn hộp kiểm của dòng này trước khi thao tác.');
        return false;
    }
    return true;
}

function resolveUDCTPriceBySku(idSpCt, idSp) {
    const searchIdSp = (idSp || "").toString().trim().toLowerCase();
    if (!searchIdSp) return '';
    const sp = sanphamData?.find(s => {
        const sIdSp = (s.id_sp || "").toString().trim().toLowerCase();
        return sIdSp === searchIdSp;
    });
    return sp ? sp.gia_ban : '';
}

function renderUDCTTable() {
    const tbody = document.getElementById('donhangTableBody');
    if (!tbody) return;

    const baseFilteredForCounts = getUDCTBaseFilteredForStatusCounts();

    const mvdMap = {};
    const mdhMap = {};
    udctData.forEach(d => {
        const datePart = (d.ngay || '').split(' ')[0];
        const timeKey = `${datePart}|${d.khung_h}`;
        if (d.mvd && d.mvd !== '-' && d.mvd !== '') {
            if (!mvdMap[d.mvd]) mvdMap[d.mvd] = new Set();
            mvdMap[d.mvd].add(timeKey);
        }
        if (d.mdh && d.mdh !== '-' && d.mdh !== '') {
            if (!mdhMap[d.mdh]) mdhMap[d.mdh] = new Set();
            mdhMap[d.mdh].add(timeKey);
        }
    });
    const duplicateList = baseFilteredForCounts.filter(item => isUDCTTrung(item, mvdMap, mdhMap));
    window.__udctDuplicateCount = duplicateList.length;
    if (udctQuickStatusTab === 'duplicate') {
        filteredUDCT = duplicateList;
    }
    const duplicateBadge = document.getElementById('udctDuplicateCountBadge');
    if (duplicateBadge) {
        duplicateBadge.textContent = duplicateList.length > 0 ? duplicateList.length.toLocaleString('vi-VN') : '';
        duplicateBadge.classList.toggle('hidden', duplicateList.length <= 0);
    }
    const notesCount = baseFilteredForCounts.filter(item => (item.ghi_chu || '').toString().trim()).length;
    const notesBadge = document.getElementById('udctNotesCountBadge');
    if (notesBadge) {
        notesBadge.textContent = notesCount > 0 ? notesCount.toLocaleString('vi-VN') : '';
        notesBadge.classList.toggle('hidden', notesCount <= 0);
    }

    if (filteredUDCT.length === 0) {
        tbody.innerHTML = '<tr><td colspan="19" class="text-center py-8 text-slate-500">Không tìm thấy dữ liệu phù hợp</td></tr>';
        document.getElementById('udctPageInfo').innerHTML = `Đang hiển thị <span class="font-medium text-slate-900">0-0</span> trong số <span class="font-medium text-slate-900">0</span> đơn hàng`;
        document.getElementById('udctPrevPage').disabled = true;
        document.getElementById('udctNextPage').disabled = true;
        const selectAll = document.getElementById('udctSelectAll');
        if (selectAll) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
        }
        refreshUDCTSelectionControls();
        return;
    }

    const totalItems = filteredUDCT.length;
    const totalPages = Math.ceil(totalItems / uitItemsPerPage);
    if (udctCurrentPage > totalPages) udctCurrentPage = totalPages;

    const startIndex = (udctCurrentPage - 1) * uitItemsPerPage;
    const endIndex = Math.min(startIndex + uitItemsPerPage, totalItems);
    const pageData = filteredUDCT.slice(startIndex, endIndex);

    document.getElementById('udctPageInfo').innerHTML = `Đang hiển thị <span class="font-medium text-slate-900">${startIndex + 1}-${endIndex}</span> trong số <span class="font-medium text-slate-900">${totalItems}</span> đơn hàng`;
    document.getElementById('udctPrevPage').disabled = udctCurrentPage === 1;
    document.getElementById('udctNextPage').disabled = udctCurrentPage === totalPages;

    tbody.innerHTML = pageData.map((item) => `
                <tr ondblclick="openDetailDrawer(${udctData.indexOf(item)})" class="border-b border-slate-100 hover:bg-slate-50 cursor-pointer group">

                    <td class="px-3 py-2 text-[13px]" onclick="event.stopPropagation()">
                        <input type="checkbox"
                               ${udctSelectedRows.has(String(item.rowIndex)) ? 'checked' : ''}
                               onchange="toggleUDCTRowSelection('${item.rowIndex}', this.checked)"
                               class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary">
                    </td>
                    <td class="px-3 py-2 text-[13px] text-slate-900">${item.ngay || '-'}</td>
                    <td class="px-3 py-2 text-[13px] text-slate-900">${item.san || '-'}</td>
                    <td class="px-3 py-2 text-[13px] text-slate-900">${item.khung_h || '-'}</td>
                    <td class="px-3 py-2 text-[13px] text-slate-900 font-medium">${item.ma_gian || '-'}</td>
                    <td class="px-3 py-2 text-[13px] text-slate-900">${item.mvd || '-'}</td>
                    <td class="px-3 py-2 text-[13px] text-slate-900 font-medium text-blue-600">${item.mdh || '-'}</td>
                    <td class="px-3 py-2 text-[13px]">
                        ${((item.mvd && mvdMap[item.mvd]?.size > 1) || (item.mdh && mdhMap[item.mdh]?.size > 1))
            ? '<span class="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">TRÙNG</span>'
            : '<span class="text-slate-400">-</span>'}
                    </td>
                    <td class="px-3 py-2 text-[13px] text-slate-500 font-mono">${item.sku_shop_up || '-'}</td>
                    <td class="px-3 py-2 text-[13px] text-slate-900">${item.so_luong || '-'}</td>
                    <td class="px-3 py-2 text-[13px] text-slate-500">${item.id_sp || '-'}</td>
                    <td class="px-3 py-2 text-[13px] text-slate-500 hover:bg-white transition-colors relative" onclick="event.stopPropagation()">
                        <input id="udctIdSpCtInput-${item.rowIndex}" type="text" value="${item.id_sp_ct || ''}" 
                               oninput="renderUDCTIdSpCtSuggestions(this, '${item.rowIndex}', false)"
                               onfocus="renderUDCTIdSpCtSuggestions(this, '${item.rowIndex}', true)"
                               onblur="setTimeout(() => hideUDCTIdSpCtSuggestions('${item.rowIndex}'), 180)"
                               onchange="saveUDCTMainInline('${item.rowIndex}', 'id_sp_ct', this.value)"
                               class="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 outline-none font-bold text-blue-600 h-8">
                        <div id="udctSpCtSuggestions-${item.rowIndex}"
                             class="hidden absolute left-0 top-full z-50 mt-1 w-80 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl"></div>
                        ${(() => {
            const idSp = item.id_sp || '';
            const isMissing = !item.id_sp_ct || item.id_sp_ct === '-' || item.id_sp_ct === '';
            if (!isMissing || !idSp || !sanphamData) return '';
            const matches = sanphamData.filter(s =>
                (s.id_sp || '').toString().trim().toLowerCase() === idSp.trim().toLowerCase() &&
                (s.sku_con || '').toString().trim().length > 5
            ).slice(0, 4);
            if (matches.length === 0) return '';
            return `
                                <div class="flex flex-wrap gap-1 mt-1">
                                    ${matches.map(m => `
                                        <button onclick="saveUDCTMainInline('${item.rowIndex}', 'id_sp_ct', '${m.sku_con}')"
                                                class="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded text-[10px] hover:bg-blue-100 transition-colors font-bold whitespace-nowrap">
                                            + ${m.sku_con}
                                        </button>
                                    `).join('')}
                                </div>
                            `;
        })()}
                    </td>
                    <td class="px-3 py-2 text-[13px] text-slate-900 max-w-[6rem] truncate">${item.ten_sp || '-'}</td>
                    <td class="px-3 py-2 text-[13px] text-slate-900 font-semibold">${item.slg_xuat === 0 ? '0' : (item.slg_xuat || '-')}</td>
                    <td class="px-3 py-2 text-[13px] text-slate-900">${parseFloat(item.don_gia_1 || 0).toLocaleString('vi-VN')}</td>
                    <td class="px-3 py-2 text-[13px]">
                        <span class="px-2 py-0.5 rounded-full text-[11px] font-medium ${item.trang_thai === '1 THAY THẾ' ? 'bg-green-100 text-green-700' : (item.trang_thai === '2 HỦY' ? 'bg-red-100 text-red-700' : (item.trang_thai === '3 HÊT HÀNG' ? 'bg-amber-100 text-amber-700' : (item.trang_thai === '4 MAI GỌI' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700')))}">
                            ${item.trang_thai || '-'}
                        </span>
                    </td>
                    <td class="px-3 py-2 text-[13px] text-slate-500 italic truncate max-w-[150px]">${item.ghi_chu || '-'}</td>
                    ${currentUser && currentUser.role === 'kinhdoanh' ? '<td class="px-3 py-2 text-[13px] text-slate-400">-</td>' : `
                    <td class="px-3 py-2 text-[13px] w-44">
                        <button onclick="event.stopPropagation(); quickSetUDCTStatus(${udctData.indexOf(item)}, '1 THAY THẾ')" class="p-1 px-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-100" title="1 THAY THẾ">
                            <span class="text-[10px]">1 THAY THẾ</span>
                        </button>
                        <button onclick="event.stopPropagation(); quickCancelUDCT(${udctData.indexOf(item)})" class="p-1 px-2 ml-1 text-red-600 hover:bg-red-50 rounded-lg border border-red-100" title="Hủy nhanh">
                            <span class="text-[10px]">Hủy nhanh</span>
                        </button>
                        <button onclick="event.stopPropagation(); quickSetUDCTStatus(${udctData.indexOf(item)}, '3 HÊT HÀNG')" class="p-1 px-2 ml-1 text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-100" title="3 HÊT HÀNG">
                            <span class="text-[10px]">3 HÊT HÀNG</span>
                        </button>
                        <button onclick="event.stopPropagation(); quickSetUDCTStatus(${udctData.indexOf(item)}, '4 MAI GỌI')" class="p-1 px-2 ml-1 text-sky-600 hover:bg-sky-50 rounded-lg border border-sky-100" title="4 MAI GỌI">
                            <span class="text-[10px]">4 MAI GỌI</span>
                        </button>
                    </td>`}
                </tr>
            `).join('');
    const selectAll = document.getElementById('udctSelectAll');
    if (selectAll) {
        selectAll.checked = pageData.length > 0 && pageData.every(item => udctSelectedRows.has(String(item.rowIndex)));
        selectAll.indeterminate = pageData.some(item => udctSelectedRows.has(String(item.rowIndex))) && !selectAll.checked;
    }
    refreshUDCTSelectionControls();

}

function copyUniqueMVD() {
    if (!filteredUDCT || filteredUDCT.length === 0) {
        alert("Không có dữ liệu để copy!");
        return;
    }

    // Chỉ copy trong trang hiện tại (lọc theo trang)
    const startIndex = (udctCurrentPage - 1) * uitItemsPerPage;
    const endIndex = Math.min(startIndex + uitItemsPerPage, filteredUDCT.length);
    const pageData = filteredUDCT.slice(startIndex, endIndex);

    const mvds = pageData
        .map(item => (item.mvd || '').trim())
        .filter(mvd => mvd && mvd !== '-');
    const uniqueMVDs = [...new Set(mvds)];

    if (uniqueMVDs.length === 0) {
        alert("Không tìm thấy MVD hợp lệ!");
        return;
    }

    const textToCopy = uniqueMVDs.join('\n');
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert(`Đã copy ${uniqueMVDs.length} MVD duy nhất!`);
        }
    } catch (err) {
        console.error('Lỗi khi copy:', err);
        alert('Lỗi khi sao chép!');
    }
    document.body.removeChild(textArea);
}

function toggleUDCTRowSelection(rowIndex, checked) {
    const key = String(rowIndex);
    if (checked) udctSelectedRows.add(key);
    else udctSelectedRows.delete(key);
    renderUDCTTable();
}

function toggleSelectAllUDCT(source) {
    const startIndex = (udctCurrentPage - 1) * uitItemsPerPage;
    const endIndex = Math.min(startIndex + uitItemsPerPage, filteredUDCT.length);
    const pageData = filteredUDCT.slice(startIndex, endIndex);
    pageData.forEach(item => {
        const key = String(item.rowIndex);
        if (source.checked) udctSelectedRows.add(key);
        else udctSelectedRows.delete(key);
    });
    renderUDCTTable();
}

async function quickCancelUDCT(originalIndex) {
    const item = udctData[originalIndex];
    if (!item) return;
    const success = await updateSheetValue(CONFIG.udctSheetName, `Y${item.rowIndex}`, '2 HỦY');
    if (!success) return alert(`Lỗi khi cập nhật trạng thái hủy cho dòng ${item.rowIndex}`);
    item.trang_thai = '2 HỦY';
    item.slg_xuat = 0;
    await updateSheetValue(CONFIG.udctSheetName, `S${item.rowIndex}`, 0);
    renderUDCTTable();
}

async function quickSetUDCTStatus(originalIndex, statusValue) {
    const item = udctData[originalIndex];
    if (!item) return;
    const success = await updateSheetValue(CONFIG.udctSheetName, `Y${item.rowIndex}`, statusValue);
    if (!success) return alert(`Lỗi khi cập nhật trạng thái cho dòng ${item.rowIndex}`);
    item.trang_thai = statusValue;
    const stLowerCase = (statusValue || '').toString().toLowerCase();
    if (stLowerCase.includes('hủy') || stLowerCase.includes('hết hàng') || stLowerCase.includes('hêt hàng')) {
        item.slg_xuat = 0;
        await updateSheetValue(CONFIG.udctSheetName, `S${item.rowIndex}`, 0);
    } else {
        item.slg_xuat = item.so_luong;
        await updateSheetValue(CONFIG.udctSheetName, `S${item.rowIndex}`, item.slg_xuat);
    }
    renderUDCTTable();
}

async function updateUDCTPrice(originalIndex, silent = false) {
    const item = udctData[originalIndex];
    if (!item) return;

    const newPrice = resolveUDCTPriceBySku(item.id_sp_ct, item.id_sp);

    if (newPrice === '') {
        const sku = item.id_sp_ct || item.id_sp || "N/A";
        console.warn(`[PriceUpdate] Không tìm thấy SKU match cho: "${(item.id_sp_ct || item.id_sp || "").toString().trim().toLowerCase()}" (Row ${item.rowIndex})`);
        if (!silent) alert(`LỖI: Không tìm thấy SKU "${sku}" trong cột "Mã" của sheet Sản phẩm PM.`);
        return false;
    }

    item.don_gia_1 = newPrice;

    const trLowerCase1 = (item.trang_thai || '').toLowerCase();
    if (!(trLowerCase1.includes('hủy') || trLowerCase1.includes('hết hàng') || trLowerCase1.includes('hêt hàng'))) {
        item.slg_xuat = item.so_luong;
        await updateSheetValue(CONFIG.udctSheetName, `S${item.rowIndex}`, item.slg_xuat);
    }

    // Sheet index is rowIndex, column AE is index 31 (1-based for range)
    const success = await updateSheetValue(CONFIG.udctSheetName, `AE${item.rowIndex}`, newPrice);

    if (success) {
        if (!silent) {
            const row = udctData.find(d => d.rowIndex === item.rowIndex);
            if (row) {
                const rowTrLowerCase = (row.trang_thai || '').toLowerCase();
                if (!(rowTrLowerCase.includes('hủy') || rowTrLowerCase.includes('hết hàng') || rowTrLowerCase.includes('hêt hàng'))) {
                    row.slg_xuat = row.so_luong;
                }
            }
            renderUDCTTable();
            console.log(`Updated row ${item.rowIndex} price to ${newPrice}`);
        } else if (suggestionType === 'row_add') {
            const idInput = document.getElementById('row_add_id_sp_ct');
            const tenInput = document.getElementById('row_add_ten');
            const giaInput = document.getElementById('row_add_gia_nhap');
            if (idInput) idInput.value = id;
            if (tenInput) tenInput.value = ten;
            if (giaInput) giaInput.value = gia || 0;
            // Optional: auto focus sl
            const slInput = document.getElementById('row_add_sl');
            if (slInput) slInput.focus();
        } else {
            if (!silent) alert(`Lỗi khi cập nhật Google Sheet cho dòng ${item.rowIndex}`);
        }
        return success;
    }
}

async function updateAllPricesBatch() {
    if (!filteredUDCT.length) return alert("Không có dữ liệu đang hiển thị để cập nhật.");
    const selectedRows = getSelectedUDCTItems();
    if (selectedRows.length === 0) return alert("Vui lòng chọn ít nhất 1 đơn hàng để cập nhật.");
    if (!confirm(`Bạn có chắc muốn cập nhật đơn giá cho ${selectedRows.length} dòng đã chọn?`)) return;

    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden');

    try {
        const token = await getAccessToken();
        const updates = [];

        for (const item of selectedRows) {
            const newPrice = resolveUDCTPriceBySku(item.id_sp_ct, item.id_sp);

            if (newPrice !== '') {
                item.don_gia_1 = newPrice;
                updates.push({
                    range: `${CONFIG.udctSheetName}!AE${item.rowIndex}`,
                    values: [[newPrice]]
                });

                const itemTrLowerCase = (item.trang_thai || '').toLowerCase();
                if (!(itemTrLowerCase.includes('hủy') || itemTrLowerCase.includes('hết hàng') || itemTrLowerCase.includes('hêt hàng'))) {
                    item.slg_xuat = item.so_luong;
                    updates.push({
                        range: `${CONFIG.udctSheetName}!S${item.rowIndex}`,
                        values: [[item.slg_xuat]]
                    });
                }
            }
        }

        if (updates.length === 0) {
            alert("Không tìm thấy SKU phù hợp để cập nhật.");
            loadingOverlay.classList.add('hidden');
            return;
        }

        // Chunking để đảm bảo ổn định (500 dòng mỗi batch)
        const chunkSize = 500;
        let successCount = 0;
        for (let i = 0; i < updates.length; i += chunkSize) {
            const chunk = updates.slice(i, i + chunkSize);
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchUpdate`;
            const body = {
                valueInputOption: 'USER_ENTERED',
                data: chunk
            };
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (resp.ok) successCount += chunk.filter(c => c.range.includes('AE')).length;
        }

        renderUDCTTable();
        showToast(`Đã cập nhật đơn giá cho ${successCount} đơn hàng thành công!`, 'success');
    } catch (err) {
        console.error("Batch price update error:", err);
        showToast("Có lỗi xảy ra khi cập nhật giá hàng loạt.", 'error');
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

async function batchUpdateUDCTStatus(statusValue) {
    if (!filteredUDCT.length) return alert("Không có dữ liệu đang hiển thị để cập nhật.");
    const selectedRows = getSelectedUDCTItems();
    if (selectedRows.length === 0) return alert("Vui lòng chọn ít nhất 1 đơn hàng để cập nhật.");

    const actionName = statusValue === '1 THAY THẾ'
        ? 'THAY THẾ'
        : (statusValue === '2 HỦY' ? 'HỦY NHANH' : (statusValue === '4 MAI GỌI' ? 'MAI GỌI' : (statusValue === '3 HÊT HÀNG' ? 'HẾT HÀNG' : 'BỎ TRẠNG THÁI')));
    if (!confirm(`Bạn có chắc muốn ${actionName} ${selectedRows.length} đơn hàng đã chọn?`)) return;

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    try {
        const token = await getAccessToken();
        const updates = [];

        selectedRows.forEach(item => {
            const stLowerCase = (statusValue || '').toString().toLowerCase();
            const isHuyOrHetHang = stLowerCase.includes('hủy') || stLowerCase.includes('hết hàng') || stLowerCase.includes('hêt hàng');
            item.trang_thai = statusValue;
            if (isHuyOrHetHang) {
                item.slg_xuat = 0;
            } else {
                item.slg_xuat = item.so_luong;
            }

            updates.push({
                range: `${CONFIG.udctSheetName}!Y${item.rowIndex}`,
                values: [[statusValue]]
            });
            updates.push({
                range: `${CONFIG.udctSheetName}!S${item.rowIndex}`,
                values: [[item.slg_xuat]]
            });
        });

        // Chunking để đảm bảo ổn định
        const chunkSize = 400;
        for (let i = 0; i < updates.length; i += chunkSize) {
            const chunk = updates.slice(i, i + chunkSize);
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchUpdate`;
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    valueInputOption: 'USER_ENTERED',
                    data: chunk
                })
            });
            if (!resp.ok) console.error("Batch status update error:", await resp.text());
        }

        renderUDCTTable();
        alert(`Đã ${actionName} ${selectedRows.length} đơn hàng thành công!`);
    } catch (err) {
        console.error("Batch status update error:", err);
        alert("Có lỗi xảy ra: " + err.message);
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
}

function parseFileName(fileName) {
    const parts = fileName.replace('.xlsx', '').replace('.xls', '').split('_');
    let mienRaw = parts[2] || '';
    let sanRaw = parts[3] || '';
    const ngay = parts[4] || '';
    let khung_h = parts[6] || '';

    // Cắt ngắn Khung H chỉ lấy tới chữ "H"
    if (khung_h.toUpperCase().includes('H')) {
        khung_h = khung_h.toUpperCase().split('H')[0] + 'H';
    }

    // Mapping Miền (Region)
    let mien = mienRaw;
    const mienUpper = mienRaw.toUpperCase();
    if (mienUpper === 'HCM') mien = 'MN';
    else if (mienUpper === 'HN') mien = 'MB';

    // Mapping Sàn (Platform)
    let san = sanRaw;
    const sanUpper = sanRaw.toUpperCase();
    if (sanUpper === 'SHP') san = 'shopee';
    else if (sanUpper === 'DN') san = 'đơn ngoài';
    else if (sanUpper === 'BEST') san = 'best';
    else if (sanUpper === 'TT') san = 'tiktok';

    return { mien, san, ngay, khung_h };
}

async function handleExcelUploadDonhang(files) {
    if (currentUser && ['demo', 'kinhdoanh'].includes(currentUser.role)) {
        alert('Tài khoản này không được phép tải Excel cho Đơn chi tiết.');
        return;
    }
    if (!files || files.length === 0) return;
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden');

    try {
        if ((!sanphamData || sanphamData.length === 0) && typeof loadSanphamData === 'function') {
            await loadSanphamData();
        }

        const appendValues = [];
        let filesProcessed = 0;

        for (const file of files) {
            const fileNameInfo = parseFileName(file.name);
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames.find(name => name.includes('Tổng đơn') || name === 'Tổng đơn 1');
            const firstSheet = sheetName ? workbook.Sheets[sheetName] : workbook.Sheets[workbook.SheetNames[0]];
            const excelData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });

            if (!excelData || excelData.length < 2) {
                console.warn(`File ${file.name} không có dữ liệu!`);
                continue;
            }

            const rows = excelData.slice(1);
            for (const row of rows) {
                const san = fileNameInfo.san;
                const kh = (fileNameInfo.khung_h || "").toUpperCase();

                const c_b = (row[1] || '').toString();
                const c_c = (row[2] || '').toString();
                let c_f = fileNameInfo.ngay;
                // Chuyển định dạng ngày từ yyyy-mm-dd sang dd/mm/yyyy
                if (c_f && c_f.includes('-')) {
                    const dParts = c_f.split('-');
                    if (dParts.length === 3 && dParts[0].length === 4) {
                        c_f = `${dParts[2]}/${dParts[1]}/${dParts[0]}`;
                    }
                }
                const c_i = (row[8] || '').toString(); // Tên SP
                const c_j = (row[9] || '').toString(); // Mã SKU phân loại (sku_shop_up)

                let c_d = ''; // MDH
                let c_g = ''; // MVD
                let c_p = ''; // Số lượng

                if (san === 'shopee') {
                    if (kh === '10H') {
                        c_d = (row[3] || '').toString();
                        c_g = (row[3] || '').toString();
                        c_p = (row[15] || '').toString();
                    } else {
                        c_d = (row[3] || '').toString();
                        c_g = (row[6] || '').toString();
                        c_p = (row[15] || '').toString();
                    }
                } else if (san === 'tiktok' || san === 'best' || san === 'đơn ngoài') {
                    c_d = (row[6] || '').toString();
                    c_g = (row[6] || '').toString();
                    c_p = (row[10] || '').toString();
                } else {
                    c_d = (row[3] || '').toString();
                    c_g = (row[6] || '').toString();
                    c_p = (row[15] || '').toString();
                }

                if (!c_d && !c_g) continue;

                const sku_shop_up = (c_j || '').toString().trim().toUpperCase(); // Lấy nguyên cột J
                const id_sp = (c_c || '').toString().trim().toUpperCase();
                let id_sp_ct = '';

                const shopUp4Upper = sku_shop_up.substring(0, 4).toUpperCase();
                const idSpUpper = id_sp.toUpperCase();

                if (shopUp4Upper === idSpUpper) {
                    id_sp_ct = sku_shop_up.substring(0, 10);
                } else {
                    if (typeof sanphamData !== 'undefined' && sanphamData) {
                        const matchingSps = sanphamData.filter(s => (s.id_sp || '').toString().trim().toUpperCase() === idSpUpper && (s.sku_con || '').toString().trim().length > 5);
                        if (matchingSps.length === 1) {
                            id_sp_ct = matchingSps[0].sku_con || '';
                        } else {
                            id_sp_ct = '';
                        }
                    }
                }
                const newPrice = resolveUDCTPriceBySku(id_sp_ct, id_sp);

                const random8 = generateRandomString(8);
                const id_parts = [c_f, 'xuất', 'hằng ngày', fileNameInfo.mien, fileNameInfo.san, fileNameInfo.khung_h, c_b, c_d, c_g, sku_shop_up, c_p, random8];
                const id_up_don_parts = [c_f, 'xuất', 'hằng ngày', fileNameInfo.mien, fileNameInfo.san, fileNameInfo.khung_h, c_b, c_d, c_g];
                const id_dh_parts = [c_f, 'xuất', 'hằng ngày', fileNameInfo.mien];
                const id_dh_ct_parts = [c_f, 'xuất', 'hằng ngày', fileNameInfo.mien, id_sp];

                const newId = generateId(id_parts).toUpperCase();
                const id_up_don = generateId(id_up_don_parts).toUpperCase();
                const id_dh = generateId(id_dh_parts).toUpperCase();
                const id_dh_ct = generateId(id_dh_ct_parts).toUpperCase();

                const appendedRow = [
                    newId, id_up_don, id_dh, id_dh_ct,
                    c_f.toUpperCase(), 'XUẤT', 'HẰNG NGÀY', fileNameInfo.mien.toUpperCase(),
                    fileNameInfo.san, fileNameInfo.khung_h, c_b, c_g, c_d,
                    sku_shop_up, c_p, id_sp, id_sp_ct,
                    c_i
                ];
                while (appendedRow.length <= 30) appendedRow.push('');
                appendedRow[18] = c_p;
                if (newPrice !== '') appendedRow[30] = newPrice;
                appendValues.push(appendedRow);
            }
            filesProcessed++;
        }

        if (appendValues.length === 0) {
            alert("Không có dữ liệu hợp lệ để import!");
            return;
        }

        console.log(`Đang nạp ${appendValues.length} dòng từ ${filesProcessed} file vào ${CONFIG.udctSheetName}...`);
        const success = await appendSheetData(CONFIG.udctSheetName, appendValues);

        if (success) {
            alert(`Import thành công ${appendValues.length} dòng dữ liệu từ ${filesProcessed} file!`);
            await loadUDCTData();
        } else {
            alert("Import thất bại! Vui lòng kiểm tra console hoặc quyền truy cập Sheet.");
        }
    } catch (error) {
        console.error("Excel upload error:", error);
        alert("Có lỗi xảy ra khi xử lý file Excel!");
    } finally {
        loadingOverlay.classList.add('hidden');
        document.getElementById('excelUploadDonhang').value = '';
    }
}

async function handleExcelUpload(files) {
    if (currentUser && ['demo', 'kinhdoanh'].includes(currentUser.role)) {
        alert('Tài khoản này không được phép tải Excel lên.');
        return;
    }
    if (!files || files.length === 0) return;
    const file = files[0];
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden');

    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });

        if (!excelData || excelData.length < 2) {
            alert("File Excel không có dữ liệu!");
            return;
        }

        const rows = excelData.slice(1);
        const sheetData = [];

        for (const row of rows) {
            const newRow = [];
            for (let i = 0; i < 32; i++) {
                let value = '';
                if (i < row.length && row[i] !== undefined && row[i] !== null) {
                    value = row[i].toString().trim();
                    if (i === 0 || i === 1) {
                        value = value.toUpperCase();
                    }
                }
                newRow.push(value);
            }
            sheetData.push(newRow);
        }

        if (sheetData.length === 0) {
            alert("Không có dữ liệu để import!");
            return;
        }

        console.log(`Đang xử lý ${CONFIG.sanphamSheetName}: Xóa cũ và nạp mới...`);
        const cleared = await clearSheetData(CONFIG.sanphamSheetName);
        if (!cleared) {
            if (!confirm("Không thể xóa dữ liệu cũ, bạn có muốn tiếp tục ghi đè không?")) {
                return;
            }
        }

        const success = await appendSheetData(CONFIG.sanphamSheetName, sheetData);

        if (success) {
            alert(`Import thành công ${sheetData.length} dòng dữ liệu vào ${CONFIG.sanphamSheetName}!`);
            await loadSanphamData();
        } else {
            alert("Import thất bại! Vui lòng kiểm tra console để biết thêm chi tiết.");
        }
    } catch (error) {
        console.error("Excel upload error:", error);
        alert("Có lỗi xảy ra khi xử lý file Excel: " + error.message);
    } finally {
        loadingOverlay.classList.add('hidden');
        document.getElementById('excelUpload').value = '';
    }
}

// LOGIC THÊM ĐƠN HÀNG MỚI (MODAL)
function openAddDHCTModal() {
    const modal = document.getElementById('addDHCTModal');
    if (modal) {
        modal.classList.remove('hidden');
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('addDHCTNgay').value = today;
        document.getElementById('addDHCTTruong').value = '';
        document.getElementById('addDHCTNcc').value = '';

        // Set default Type to NHẬP
        const nhapBtn = Array.from(document.querySelectorAll('#addDHCTTruongBtns button')).find(b => b.textContent.trim() === 'NHẬP');
        if (nhapBtn) {
            selectAddDHCTTruong(nhapBtn, 'NHẬP');
        } else {
            document.getElementById('addDHCTTruong').value = 'NHẬP';
        }

        // Suggesst NCC buttons from existing data
        const nccSet = new Set();
        dhctData.forEach(item => { if (item.ncc) nccSet.add(item.ncc.trim()); });
        const distinctNccs = Array.from(nccSet).sort().slice(0, 20); // Top 20 alphabetic
        const nccBox = document.getElementById('addDHCTNccSuggestions');
        if (nccBox) {
            nccBox.innerHTML = distinctNccs.map(ncc => `
                <button onclick="document.getElementById('addDHCTNcc').value='${ncc.replace(/'/g, "\\'")}'"
                    class="px-2 py-1 bg-slate-50 border border-slate-200 hover:border-primary hover:text-primary rounded-lg text-[10px] font-medium text-slate-500 transition-all">
                    ${ncc}
                </button>
            `).join('');
        }
    }
}

function selectAddDHCTTruong(btn, value) {
    document.getElementById('addDHCTTruong').value = value;
    // UI Feedback
    document.querySelectorAll('#addDHCTTruongBtns button').forEach(b => {
        b.classList.remove('bg-emerald-500', 'bg-rose-500', 'text-white', 'border-transparent');
        b.classList.add('text-slate-600', 'border-slate-200');
    });

    if (value === 'NHẬP') {
        btn.classList.add('bg-emerald-500', 'text-white', 'border-transparent');
        btn.classList.remove('text-slate-600', 'border-slate-200');
    } else {
        btn.classList.add('bg-rose-500', 'text-white', 'border-transparent');
        btn.classList.remove('text-slate-600', 'border-slate-200');
    }
}

function closeAddDHCTModal() {
    const modal = document.getElementById('addDHCTModal');
    if (modal) modal.classList.add('hidden');
}

async function saveNewDHCT() {
    const ngay = document.getElementById('addDHCTNgay').value;
    const truong = document.getElementById('addDHCTTruong').value.trim();
    const ncc = document.getElementById('addDHCTNcc').value.trim();

    if (!ngay || !truong || !ncc) {
        alert('Vui lòng nhập đầy đủ Ngày, Trường và NCC!');
        return;
    }

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    try {
        const id_dh_ct = 'CT-' + Date.now().toString().slice(-6);
        const id_dh = 'DH-' + Date.now().toString().slice(-4);

        const [y, m, d] = ngay.split('-');
        const dateFormatted = `${d}/${m}/${y}`;

        // Header (12 cột): id_dh_ct(0), id_dh(1), ngay(2), truong(3), ncc(4)
        const newRow = [
            id_dh_ct,
            id_dh,
            dateFormatted,
            truong,
            ncc,
            '', '', '', '', '', '', '', '', '', '', ''
        ];

        const success = await appendSheetData(CONFIG.dhctSheetName, [newRow]);
        if (success) {
            closeAddDHCTModal();
            // Load lại dữ liệu để Master List cập nhật
            await fetchDHCTData();
        } else {
            throw new Error('Không thể ghi dữ liệu vào Google Sheets.');
        }
    } catch (err) {
        console.error('Save New DHCT Error:', err);
        alert('Có lỗi xảy ra khi lưu: ' + err.message);
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
}

// --- LOGIC GỢI Ý ID_SP_CT ---
let suggestionTarget = null;
let suggestionType = 'row';

function handleIdSpCtInput(input, type) {
    suggestionTarget = input;
    suggestionType = type;
    const val = input.value.trim().toLowerCase();
    const sugBox = document.getElementById('spctSuggestions');

    if (!val || !sanphamData || sanphamData.length === 0) {
        if (sugBox) sugBox.classList.add('hidden');
        return;
    }

    const matches = sanphamData.filter(item =>
        (item.id_sp_ct || '').toLowerCase().includes(val) ||
        (item.ten || '').toLowerCase().includes(val)
    ).slice(0, 30);

    if (matches.length === 0) {
        if (sugBox) sugBox.classList.add('hidden');
        return;
    }

    const rect = input.getBoundingClientRect();
    sugBox.style.left = `${rect.left}px`;
    sugBox.style.top = `${rect.bottom + window.scrollY}px`;
    sugBox.style.width = `${Math.max(rect.width, 320)}px`;
    sugBox.classList.remove('hidden');

    sugBox.innerHTML = matches.map(m => `
        <div onclick="selectSpCtSuggestion('${m.id_sp_ct}', '${(m.ten || '').replace(/'/g, "\\'")}', '${m.gia_nhap || 0}')" 
             class="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 group transition-colors">
            <div class="font-bold text-primary group-hover:text-blue-700">${m.id_sp_ct}</div>
            <div class="text-[10px] text-slate-500 truncate">${m.ten}</div>
            <div class="text-[9px] text-slate-400 italic">Giá: ${(parseFloat(m.gia_nhap) || 0).toLocaleString()}</div>
        </div>
    `).join('');
}

function selectSpCtSuggestion(id, ten, gia) {
    if (!suggestionTarget) return;

    suggestionTarget.value = id;
    const sugBox = document.getElementById('spctSuggestions');
    if (sugBox) sugBox.classList.add('hidden');

    if (suggestionType === 'detail') {
        const tenInput = document.getElementById('detail_ten');
        const giaInput = document.getElementById('detail_gia_nhap');
        if (tenInput) tenInput.value = ten;
        if (giaInput) giaInput.value = gia || 0;
        // Trigger auto-save
        saveUDCTDetail();
    } else if (suggestionType === 'row_add') {
        const tenInput = document.getElementById('row_add_ten');
        const giaInput = document.getElementById('row_add_gia_nhap');
        if (tenInput) tenInput.value = ten;
        if (giaInput) giaInput.value = gia || 0;
        // Auto-save immediately for rapid entry
        saveUDCTRowNew();
    } else {
        // Row mode (existing item)
        const tr = suggestionTarget.closest('tr');
        if (tr) {
            const idRow = tr.getAttribute('data-id');
            const tenInput = tr.querySelector('input[onchange*="\'ten\'"]');
            const giaInput = tr.querySelector('input[onchange*="\'gia_nhap\'"]');
            if (tenInput) tenInput.value = ten;
            if (giaInput) giaInput.value = gia || 0;

            // Trigger inline save for ALL fields
            saveUDCTRowInline(idRow, 'id_sp_ct', id);
            saveUDCTRowInline(idRow, 'ten', ten);
            saveUDCTRowInline(idRow, 'gia_nhap', gia || 0);
        }
    }
}

document.addEventListener('mousedown', (e) => {
    const sugBox = document.getElementById('spctSuggestions');
    if (sugBox && !sugBox.contains(e.target) && e.target !== suggestionTarget) {
        sugBox.classList.add('hidden');
    }
});


    Object.assign(window.AppModules = window.AppModules || {}, { ['donhang']: true });
    window.openDetailDrawer = openDetailDrawer;
    window.saveKDGhiChu = saveKDGhiChu;
    window.closeDetailDrawer = closeDetailDrawer;
    window.saveRowDetail = saveRowDetail;
    window.handleIdSPChange = handleIdSPChange;
    window.selectIdSPCTSuggestion = selectIdSPCTSuggestion;
    window.handleIdSPCTChange = handleIdSPCTChange;
    window.populateSPLists = populateSPLists;
    window.generateRandomString = generateRandomString;
    window.generateId = generateId;
    window.generateSkeletonRows = generateSkeletonRows;
    window.saveFiltersToCache = saveFiltersToCache;
    window.loadFiltersFromCache = loadFiltersFromCache;
    window.loadUDCTData = loadUDCTData;
    window.normalizeSanLabel = normalizeSanLabel;
    window.populateUDCTFilters = populateUDCTFilters;
    window.setUDCTBtnFilter = setUDCTBtnFilter;
    window.setUDCTStatusMultiFilter = setUDCTStatusMultiFilter;
    window.renderEditTrangThaiButtons = renderEditTrangThaiButtons;
    window.setEditTrangThai = setEditTrangThai;
    window.scheduleUDCTAutoSave = scheduleUDCTAutoSave;
    window.normalizeTrangThai = normalizeTrangThai;
    window.getUDCTIdSpCtMatches = getUDCTIdSpCtMatches;
    window.hideUDCTIdSpCtSuggestions = hideUDCTIdSpCtSuggestions;
    window.renderUDCTIdSpCtSuggestions = renderUDCTIdSpCtSuggestions;
    window.selectUDCTIdSpCtSuggestion = selectUDCTIdSpCtSuggestion;
    window.saveUDCTMainInline = saveUDCTMainInline;
    window.getUDCTBaseFilteredForStatusCounts = getUDCTBaseFilteredForStatusCounts;
    window.setUDCTQuickTab = setUDCTQuickTab;
    window.setUDCTQuickDate = setUDCTQuickDate;
    window.isUDCTTrung = isUDCTTrung;
    window.filterUDCTTable = filterUDCTTable;
    window.changeUDCTDate = changeUDCTDate;
    window.changeReportDate = changeReportDate;
    window.changeUDCTPage = changeUDCTPage;
    window.renderUDCTTable = renderUDCTTable;
    window.copyUniqueMVD = copyUniqueMVD;
    window.toggleUDCTRowSelection = toggleUDCTRowSelection;
    window.toggleSelectAllUDCT = toggleSelectAllUDCT;
    window.quickCancelUDCT = quickCancelUDCT;
    window.quickSetUDCTStatus = quickSetUDCTStatus;
    window.updateUDCTPrice = updateUDCTPrice;
    window.updateAllPricesBatch = updateAllPricesBatch;
    window.batchUpdateUDCTStatus = batchUpdateUDCTStatus;
    window.parseFileName = parseFileName;
    window.handleExcelUploadDonhang = handleExcelUploadDonhang;
    window.handleExcelUpload = handleExcelUpload;
    window.openAddDHCTModal = openAddDHCTModal;
    window.selectAddDHCTTruong = selectAddDHCTTruong;
    window.closeAddDHCTModal = closeAddDHCTModal;
    window.saveNewDHCT = saveNewDHCT;
    window.handleIdSpCtInput = handleIdSpCtInput;
    window.selectSpCtSuggestion = selectSpCtSuggestion;
    window.batchRefreshSelectedRows = batchRefreshSelectedRows;

    async function batchRefreshSelectedRows() {
        if (!filteredUDCT.length) return alert("Không có dữ liệu đang hiển thị.");
        const selectedRows = getSelectedUDCTItems();
        if (selectedRows.length === 0) return alert("Vui lòng chọn ít nhất 1 đơn hàng để cập nhật lại dòng.");

        if (!confirm(`Bạn có chắc muốn tính toán lại thông tin (tên, giá, số lượng xuất) cho ${selectedRows.length} dòng đã chọn dựa trên mã SKU?`)) return;

        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.classList.remove('hidden');

        try {
            const token = await getAccessToken();
            const updates = [];
            let successCount = 0;

            for (const item of selectedRows) {
                let rowProcessed = false;
                let valSpCt = (item.id_sp_ct || '').toString().trim();
                const valSp = (item.id_sp || '').toString().trim();

                if (sanphamData && sanphamData.length > 0) {
                    if (!valSpCt && valSp) {
                        const possibleSpCts = sanphamData.filter(s => (s.id_sp || '').toString().trim().toLowerCase() === valSp.toLowerCase() && (s.sku_con || '').toString().trim().length > 5);
                        if (possibleSpCts.length === 1) {
                            valSpCt = possibleSpCts[0].sku_con;
                            item.id_sp_ct = valSpCt;
                            updates.push({ range: `${CONFIG.udctSheetName}!Q${item.rowIndex}`, values: [[valSpCt]] });
                            rowProcessed = true;
                        }
                    }

                    if (valSpCt) {
                        const spName = sanphamData.find(s => (s.sku_con || '').toString().toLowerCase() === valSpCt.toLowerCase());
                        if (spName) {
                            item.ten_sp = spName.ten_sp;
                            item.id_sp = valSp || spName.id_sp || (spName.sku_con || '').substring(0, 4);
                            updates.push({ range: `${CONFIG.udctSheetName}!R${item.rowIndex}`, values: [[item.ten_sp]] });
                            updates.push({ range: `${CONFIG.udctSheetName}!P${item.rowIndex}`, values: [[item.id_sp]] });
                            rowProcessed = true;
                        }
                    }

                    const currentIdSp = (item.id_sp || '').toString().trim();
                    if (currentIdSp) {
                        const spPrice = sanphamData.find(s => (s.id_sp || '').toString().toLowerCase() === currentIdSp.toLowerCase());
                        if (spPrice) {
                            const newPrice = spPrice.gia_ban;
                            item.don_gia_1 = newPrice;
                            updates.push({ range: `${CONFIG.udctSheetName}!AE${item.rowIndex}`, values: [[newPrice]] });
                            rowProcessed = true;
                        }
                    }
                }

                const itemStatus = (item.trang_thai || '').toLowerCase();
                if (!(itemStatus.includes('hủy') || itemStatus.includes('hêt hàng') || itemStatus.includes('hết hàng'))) {
                    item.slg_xuat = item.so_luong;
                    updates.push({ range: `${CONFIG.udctSheetName}!S${item.rowIndex}`, values: [[item.slg_xuat]] });
                } else {
                    item.slg_xuat = 0;
                    updates.push({ range: `${CONFIG.udctSheetName}!S${item.rowIndex}`, values: [[0]] });
                }
                rowProcessed = true;

                if (rowProcessed) successCount++;
            }

            if (updates.length === 0) {
                alert("Không có dòng nào được cập nhật.");
                if (loadingOverlay) loadingOverlay.classList.add('hidden');
                return;
            }

            const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchUpdate`;
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data: updates })
            });

            if (resp.ok) {
                renderUDCTTable();
                alert(`Đã cập nhật thành công ${successCount} dòng!`);
                refreshUDCTSelectionControls();
            } else {
                console.error("Batch Update Inline Error:", await resp.text());
                alert('Lỗi khi lưu dữ liệu lên hệ thống.');
            }
        } catch (err) {
            console.error("Batch Update Inline Exception:", err);
            alert('Có lỗi khi lưu: ' + err.message);
        } finally {
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
        }
    }
})();


