// bchh - Module Pattern (IIFE)
(function () {
// BÁO CÁO HÀNG HOÀN LOGIC
let bchhFilteredData = [];

function setBCHHQuickDate(type) {
    const today = new Date();
    const toDate = document.getElementById('bcHHToDate');
    const fromDate = document.getElementById('bcHHFromDate');

    if (type === 'today') {
        const d = String(today.getDate()).padStart(2, '0');
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const y = today.getFullYear();
        const dateStr = `${y}-${m}-${d}`;
        fromDate.value = dateStr;
        toDate.value = dateStr;
    } else if (type === 'thisWeek') {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(today.setDate(diff));

        fromDate.value = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;

        const now = new Date();
        toDate.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    } else if (type === 'thisMonth') {
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        fromDate.value = `${y}-${m}-01`;

        const now = new Date();
        toDate.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    filterBCHHData();
}

function changeBCHHDate(id, direction) {
    const input = document.getElementById(id);
    if (!input || !input.value) return;
    const d = new Date(input.value);
    d.setDate(d.getDate() + direction);
    input.value = d.toISOString().split('T')[0];
    filterBCHHData();
}

function filterBCHHParams() {
    filterBCHHData();
}

function filterBCHHData() {
    if (!hangHoanData || hangHoanData.length === 0) return;

    const fFrom = document.getElementById('bcHHFromDate').value;
    const fTo = document.getElementById('bcHHToDate').value;
    const fGian = (document.getElementById('filterBCHHMaGian').value || '').trim().toLowerCase();
    const fSkuCt = (document.getElementById('filterBCHHSkuCt').value || '').trim().toLowerCase();

    // Populate Mã gian and SKU CT datalists
    const maGianSet = new Set();
    const skuCtSet = new Set();
    hangHoanData.forEach(item => {
        if (item.ma_gian) maGianSet.add(item.ma_gian.trim());
        if (item.sku_ct) skuCtSet.add(item.sku_ct.trim());
    });
    
    const maGianList = document.getElementById('bcHHMaGianList');
    if (maGianList) {
        maGianList.innerHTML = Array.from(maGianSet).sort().map(mg => `<option value="${mg.replace(/"/g, '&quot;')}">`).join('');
    }
    const skuCtList = document.getElementById('bcHHSkuCtList');
    if (skuCtList) {
        skuCtList.innerHTML = Array.from(skuCtSet).sort().map(s => `<option value="${s.replace(/"/g, '&quot;')}">`).join('');
    }

    bchhFilteredData = hangHoanData.filter(item => {
        const ngay = toYMD(item.ngay_nhan);
        if (fFrom && ngay < fFrom) return false;
        if (fTo && ngay > fTo) return false;
        if (fGian && !(item.ma_gian || '').toLowerCase().includes(fGian)) return false;
        if (fSkuCt && !(item.sku_ct || '').toLowerCase().includes(fSkuCt)) return false;
        return true;
    });

    renderBCHHStats();
}

function renderBCHHStats() {
    document.getElementById('bchhTotalOrders').textContent = bchhFilteredData.length.toLocaleString('vi-VN');
    const totalQty = bchhFilteredData.reduce((sum, item) => sum + (parseFloat(item.slg) || 0), 0);
    document.getElementById('bchhTotalQuantity').textContent = totalQty.toLocaleString('vi-VN');

    const byMaGian = {};
    const byTinhTrang = {};
    const bySku = {};
    const bySkuCt = {};
    const byKho = {};
    const byNgay = {};

    bchhFilteredData.forEach(item => {
        const mg = item.ma_gian || 'Trống';
        const tt = item.tinh_trang || 'Trống';
        const sku = item.sku || 'Trống';
        const skuCt = item.sku_ct || 'Trống';
        const kho = item.kho || 'Trống';
        const q = parseFloat(item.slg) || 0;

        if (!byMaGian[mg]) byMaGian[mg] = { don: 0, sp: 0 };
        byMaGian[mg].don += 1;
        byMaGian[mg].sp += q;

        if (!byTinhTrang[tt]) byTinhTrang[tt] = { don: 0, sp: 0 };
        byTinhTrang[tt].don += 1;
        byTinhTrang[tt].sp += q;

        if (!bySku[sku]) bySku[sku] = { don: 0, sp: 0 };
        bySku[sku].don += 1;
        bySku[sku].sp += q;

        if (!bySkuCt[skuCt]) bySkuCt[skuCt] = { don: 0, sp: 0 };
        bySkuCt[skuCt].don += 1;
        bySkuCt[skuCt].sp += q;

        if (!byKho[kho]) byKho[kho] = { don: 0, sp: 0 };
        byKho[kho].don += 1;
        byKho[kho].sp += q;

        const ngay = formatYmdToDmy(item.ngay_nhan) || item.ngay_nhan || 'Trống';
        if (!byNgay[ngay]) byNgay[ngay] = { don: 0, sp: 0, sortKey: item.ngay_nhan || '' };
        byNgay[ngay].don += 1;
        byNgay[ngay].sp += q;
    });

    const tbMaGian = document.getElementById('bchhMaGianTableBody');
    if (!Object.keys(byMaGian).length) {
        tbMaGian.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-slate-500">Không có dữ liệu</td></tr>';
    } else {
        tbMaGian.innerHTML = Object.entries(byMaGian).sort((a, b) => b[1].don - a[1].don).map(([k, v]) => `
            <tr class="border-b border-slate-100 hover:bg-slate-50">
                <td class="px-4 py-2 text-sm font-medium text-slate-900">${escapeHtml(k)}</td>
                <td class="px-4 py-2 text-sm text-slate-700">${v.don.toLocaleString('vi-VN')}</td>
                <td class="px-4 py-2 text-sm text-slate-700">${v.sp.toLocaleString('vi-VN')}</td>
            </tr>
        `).join('');
    }

    const tbTinhTrang = document.getElementById('bchhTinhTrangTableBody');
    if (!Object.keys(byTinhTrang).length) {
        tbTinhTrang.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-slate-500">Không có dữ liệu</td></tr>';
    } else {
        tbTinhTrang.innerHTML = Object.entries(byTinhTrang).sort((a, b) => b[1].don - a[1].don).map(([k, v]) => `
            <tr class="border-b border-slate-100 hover:bg-slate-50">
                <td class="px-4 py-2 text-sm font-medium text-slate-900">${escapeHtml(k)}</td>
                <td class="px-4 py-2 text-sm text-slate-700">${v.don.toLocaleString('vi-VN')}</td>
                <td class="px-4 py-2 text-sm text-slate-700">${v.sp.toLocaleString('vi-VN')}</td>
            </tr>
        `).join('');
    }

    const tbSku = document.getElementById('bchhSkuTableBody');
    if (tbSku) {
        if (!Object.keys(bySku).length) {
            tbSku.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-slate-500">Không có dữ liệu</td></tr>';
        } else {
            tbSku.innerHTML = Object.entries(bySku).sort((a, b) => b[1].don - a[1].don).map(([k, v]) => `
                <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="px-4 py-2 text-sm font-medium text-slate-900">${escapeHtml(k)}</td>
                    <td class="px-4 py-2 text-sm text-slate-700">${v.don.toLocaleString('vi-VN')}</td>
                    <td class="px-4 py-2 text-sm text-slate-700">${v.sp.toLocaleString('vi-VN')}</td>
                </tr>
            `).join('');
        }
    }

    const tbSkuCt = document.getElementById('bchhSkuCtTableBody');
    if (tbSkuCt) {
        if (!Object.keys(bySkuCt).length) {
            tbSkuCt.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-slate-500">Không có dữ liệu</td></tr>';
        } else {
            tbSkuCt.innerHTML = Object.entries(bySkuCt).sort((a, b) => b[1].don - a[1].don).map(([k, v]) => `
                <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="px-4 py-2 text-sm font-medium text-slate-900">${escapeHtml(k)}</td>
                    <td class="px-4 py-2 text-sm text-slate-700">${v.don.toLocaleString('vi-VN')}</td>
                    <td class="px-4 py-2 text-sm text-slate-700">${v.sp.toLocaleString('vi-VN')}</td>
                </tr>
            `).join('');
        }
    }

    const tbKho = document.getElementById('bchhKhoTableBody');
    if (tbKho) {
        if (!Object.keys(byKho).length) {
            tbKho.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-slate-500">Không có dữ liệu</td></tr>';
        } else {
            tbKho.innerHTML = Object.entries(byKho).sort((a, b) => b[1].don - a[1].don).map(([k, v]) => `
                <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="px-4 py-2 text-sm font-medium text-slate-900">${escapeHtml(k)}</td>
                    <td class="px-4 py-2 text-sm text-slate-700">${v.don.toLocaleString('vi-VN')}</td>
                    <td class="px-4 py-2 text-sm text-slate-700">${v.sp.toLocaleString('vi-VN')}</td>
                </tr>
            `).join('');
        }
    }

    const tbNgay = document.getElementById('bchhNgayTableBody');
    if (tbNgay) {
        if (!Object.keys(byNgay).length) {
            tbNgay.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-slate-500">Không có dữ liệu</td></tr>';
        } else {
            tbNgay.innerHTML = Object.entries(byNgay).sort((a, b) => b[1].sortKey.localeCompare(a[1].sortKey)).map(([k, v]) => `
                <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="px-4 py-2 text-sm font-medium text-slate-900">${escapeHtml(k)}</td>
                    <td class="px-4 py-2 text-sm text-slate-700">${v.don.toLocaleString('vi-VN')}</td>
                    <td class="px-4 py-2 text-sm text-slate-700">${v.sp.toLocaleString('vi-VN')}</td>
                </tr>
            `).join('');
        }
    }

    const tbDetails = document.getElementById('bchhDetailsTableBody');
    if (tbDetails) {
        if (!bchhFilteredData.length) {
            tbDetails.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-slate-500">Không có dữ liệu</td></tr>';
        } else {
            tbDetails.innerHTML = bchhFilteredData.map(item => `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-4 py-2 text-sm text-slate-700 whitespace-nowrap">${escapeHtml(formatYmdToDmy(item.ngay_nhan) || item.ngay_nhan)}</td>
                    <td class="px-4 py-2 text-sm font-medium text-slate-900">${escapeHtml(item.mvd || '')}</td>
                    <td class="px-4 py-2 text-sm text-slate-700">${escapeHtml(item.ma_gian || '')}</td>
                    <td class="px-4 py-2 text-sm text-slate-700">${escapeHtml(item.sku || '')}</td>
                    <td class="px-4 py-2 text-sm text-right font-semibold text-slate-900">${(parseFloat(item.slg) || 0).toLocaleString('vi-VN')}</td>
                    <td class="px-4 py-2 text-sm text-slate-700 truncate max-w-[200px]" title="${escapeHtml(item.ten_sp || '')}">${escapeHtml(item.ten_sp || '')}</td>
                    <td class="px-4 py-2 text-sm text-slate-700">${escapeHtml(item.tinh_trang || '')}</td>
                    <td class="px-4 py-2 text-sm text-slate-700">${escapeHtml(item.kho || '')}</td>
                </tr>
            `).join('');
        }
    }
}

function exportBCHHToExcel() {
    if (!bchhFilteredData || bchhFilteredData.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }

    const headers = ['Ngày nhận', 'MVD', 'Mã gian', 'SKU', 'SLG', 'Tên SP', 'Tình trạng', 'Kho', 'Trạng thái'];
    const excelData = [headers, ...bchhFilteredData.map(item => [
        formatYmdToDmy(item.ngay_nhan) || item.ngay_nhan,
        item.mvd || '',
        item.ma_gian || '',
        item.sku || '',
        item.slg || '',
        item.ten_sp || '',
        item.tinh_trang || '',
        item.kho || '',
        item.trạng_thái || ''
    ])];

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BC_Hang_Hoan');

    const fFrom = document.getElementById('bcHHFromDate').value || 'ToanBo';
    const fTo = document.getElementById('bcHHToDate').value || '';
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + 'h' + now.getMinutes().toString().padStart(2, '0');

    let fName = `BCHH_${fFrom}`;
    if (fTo) fName += `_den_${fTo}`;
    fName += `_${timeStr}.xlsx`;

    XLSX.writeFile(wb, fName);
}

async function transferBCHHToDonHangCT() {
    const tbody = document.getElementById('bchhSkuCtTableBody');
    if (!tbody || tbody.innerHTML.includes('Không có dữ liệu') || tbody.innerHTML.includes('Chọn ngày')) {
        alert('Không có dữ liệu để chuyển!');
        return;
    }

    const fFrom = document.getElementById('bcHHFromDate').value;
    if (!fFrom) {
        alert('Vui lòng chọn Ngày lọc (Từ ngày)!');
        return;
    }
    
    const parts = fFrom.split('-');
    let ngay_format = '';
    if (parts.length === 3) {
        ngay_format = `${parts[2]}/${parts[1]}/${parts[0]}`;
    } else {
        alert('Ngày lọc không hợp lệ!');
        return;
    }

    const truong = 'NHẬP';
    const ncc = 'HÀNG HOÀN';
    const appendValues = [];

    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
            const sku_ct = cells[0].textContent.trim();
            let sl_nhap = cells[2].textContent.trim();
            sl_nhap = parseFloat(sl_nhap.replace(/,/g, '').replace(/\./g, '')) || 0;

            if (sl_nhap > 0) {
                let id_sp = '';
                let gia = 0;
                let ten_sp = '';
                
                if (typeof sanphamData !== 'undefined') {
                    const sp = sanphamData.find(s => (s.sku_con || '').toLowerCase() === sku_ct.toLowerCase());
                    if (sp) {
                        id_sp = sp.id_sp || '';
                        gia = parseFloat(sp.gia_nhap) || 0;
                        ten_sp = sp.ten_sp || '';
                    } else {
                        id_sp = sku_ct.substring(0, 4);
                    }
                } else {
                    id_sp = sku_ct.substring(0, 4);
                }

                const key = `${ngay_format} | ${truong} | ${ncc} | MB`;
                const id_dh = key;
                const id_dh_ct = `${ngay_format} | ${truong} | ${ncc} | MB | KHO | ${sku_ct}`;
                const id_ton_kho = `KHO | ${sku_ct}`;

                appendValues.push([
                    id_dh_ct, id_dh, ngay_format, truong, ncc, 'KHO', sku_ct, id_sp, ten_sp, sl_nhap, gia, sl_nhap * gia, '', id_ton_kho, 'CHỜ XÁC NHẬN'
                ]);
            }
        }
    });

    if (appendValues.length === 0) {
        alert('Không có dữ liệu hợp lệ (SL sản phẩm > 0) để chuyển!');
        return;
    }

    if (!confirm(`Bạn có chắc muốn chuyển ${appendValues.length} dòng sang Đơn hàng CT?`)) {
        return;
    }

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    try {
        const success = await window.appendSheetData(CONFIG.dhctSheetName, appendValues);
        if (success) {
            alert(`Đã chuyển thành công ${appendValues.length} dòng sang Đơn hàng CT!`);
            if (typeof window.fetchDHCTData === 'function') {
                window.fetchDHCTData(true);
            }
        } else {
            alert('Lỗi khi chuyển dữ liệu sang Google Sheet.');
        }
    } catch (err) {
        console.error('Lỗi khi chuyển sang Đơn hàng CT:', err);
        alert('Lỗi: ' + err.message);
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
}


    Object.assign(window.AppModules = window.AppModules || {}, { ['bchh']: true });
    window.setBCHHQuickDate = setBCHHQuickDate;
    window.changeBCHHDate = changeBCHHDate;
    window.filterBCHHParams = filterBCHHParams;
    window.filterBCHHData = filterBCHHData;
    window.renderBCHHStats = renderBCHHStats;
    window.exportBCHHToExcel = exportBCHHToExcel;
    window.transferBCHHToDonHangCT = transferBCHHToDonHangCT;
})();
