// baocao - Module Pattern (IIFE)
(function () {
function setQuickDate(type) {
    const fromInput = document.getElementById('fromDate');
    const toInput = document.getElementById('toDate');
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
        const day = today.getDay(); // 0 is Sunday
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
        const firstDay = new Date(today.setDate(diff));
        fromDate = format(firstDay);

        // Reset today and set to Sunday
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
    autoFilterReport(); // Tự động lọc sau khi đổi ngày
}

let filterTimeout;
function autoFilterReport() {
    saveFiltersToCache();
    filterReport();
}

let currentMagianStats = [];
let currentIdspStats = [];
let magianSort = { key: 'doanh_thu', asc: false };
let idspSort = { key: 'doanh_thu', asc: false };
let currentStatusesArray = [];

window.handleSortMagian = function (key) {
    if (magianSort.key === key) {
        magianSort.asc = !magianSort.asc;
    } else {
        magianSort.key = key;
        magianSort.asc = false;
    }
    renderMagianTable();
};

window.handleSortIdsp = function (key) {
    if (idspSort.key === key) {
        idspSort.asc = !idspSort.asc;
    } else {
        idspSort.key = key;
        idspSort.asc = false;
    }
    renderIdspTable();
};

function renderMagianTable() {
    const thead = document.querySelector('#magianTableBody').previousElementSibling;
    if (!thead) return;

    currentMagianStats.sort((a, b) => {
        let valA, valB;
        if (magianSort.key === 'ma_gian') {
            valA = a.mg.toLowerCase(); valB = b.mg.toLowerCase();
        } else if (magianSort.key === 'so_don' || magianSort.key === 'doanh_thu') {
            valA = a[magianSort.key]; valB = b[magianSort.key];
        } else {
            valA = a.statuses[magianSort.key] || 0; valB = b.statuses[magianSort.key] || 0;
        }

        if (valA < valB) return magianSort.asc ? -1 : 1;
        if (valA > valB) return magianSort.asc ? 1 : -1;
        return 0;
    });

    const getSortIcon = (key) => {
        if (magianSort.key !== key) return '<span class="text-slate-300 ml-1 inline-block">⇅</span>';
        return magianSort.asc ? '<span class="text-primary ml-1 inline-block">↑</span>' : '<span class="text-primary ml-1 inline-block">↓</span>';
    };

    const headerHtml = `
        <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 cursor-pointer select-none hover:bg-slate-100" onclick="window.handleSortMagian('ma_gian')">Mã gian ${getSortIcon('ma_gian')}</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 cursor-pointer select-none hover:bg-slate-100" onclick="window.handleSortMagian('so_don')">Số đơn ${getSortIcon('so_don')}</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 cursor-pointer select-none hover:bg-slate-100" onclick="window.handleSortMagian('doanh_thu')">Doanh thu ${getSortIcon('doanh_thu')}</th>
            ${currentStatusesArray.map(st => `<th class="px-4 py-3 text-left text-xs font-semibold text-red-500 cursor-pointer select-none hover:bg-slate-100" onclick="window.handleSortMagian('${st}')">${st} ${getSortIcon(st)}</th>`).join('')}
        </tr>
    `;
    thead.innerHTML = headerHtml;

    document.getElementById('magianTableBody').innerHTML = currentMagianStats.length ? currentMagianStats.map(a => `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
            <td class="px-4 py-3 text-sm font-medium text-slate-900">${a.mg}</td>
            <td class="px-4 py-3 text-sm text-slate-700">${a.so_don.toLocaleString('vi-VN')}</td>
            <td class="px-4 py-3 text-sm text-slate-700">${a.doanh_thu.toLocaleString('vi-VN')}</td>
            ${currentStatusesArray.map(st => `<td class="px-4 py-3 text-sm text-red-500">${a.statuses[st] || 0}</td>`).join('')}
        </tr>`).join('') : `<tr><td colspan="${3 + currentStatusesArray.length}" class="text-center py-4 text-slate-400">Không có dữ liệu</td></tr>`;
}

function renderIdspTable() {
    const thead = document.querySelector('#idspTableBody').previousElementSibling;
    if (!thead) return;

    currentIdspStats.sort((a, b) => {
        let valA, valB;
                if (idspSort.key === 'id_sp_ct') {
            valA = a.idsp.toLowerCase(); valB = b.idsp.toLowerCase();
        } else if (idspSort.key === 'ten_sp') {
            valA = (a.ten_sp || '').toLowerCase(); valB = (b.ten_sp || '').toLowerCase();
        } else if (idspSort.key === 'slg' || idspSort.key === 'doanh_thu' || idspSort.key === 'ton_kho') {
            valA = a[idspSort.key]; valB = b[idspSort.key];
        } else {
            valA = a.statuses[idspSort.key] || 0; valB = b.statuses[idspSort.key] || 0;
        }

        if (valA < valB) return idspSort.asc ? -1 : 1;
        if (valA > valB) return idspSort.asc ? 1 : -1;
        return 0;
    });

    const getSortIcon = (key) => {
        if (idspSort.key !== key) return '<span class="text-slate-300 ml-1 inline-block">⇅</span>';
        return idspSort.asc ? '<span class="text-primary ml-1 inline-block">↑</span>' : '<span class="text-primary ml-1 inline-block">↓</span>';
    };

    const headerHtml = `
        <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 cursor-pointer select-none hover:bg-slate-100" onclick="window.handleSortIdsp('id_sp_ct')">id_sp_ct ${getSortIcon('id_sp_ct')}</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 cursor-pointer select-none hover:bg-slate-100" onclick="window.handleSortIdsp('ten_sp')">Tên SP ${getSortIcon('ten_sp')}</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 cursor-pointer select-none hover:bg-slate-100" onclick="window.handleSortIdsp('slg')">SL xuất ${getSortIcon('slg')}</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 cursor-pointer select-none hover:bg-slate-100" onclick="window.handleSortIdsp('doanh_thu')">Doanh thu ${getSortIcon('doanh_thu')}</th>
            ${currentStatusesArray.map(st => `<th class="px-4 py-3 text-left text-xs font-semibold text-red-500 cursor-pointer select-none hover:bg-slate-100" onclick="window.handleSortIdsp('${st}')">${st} ${getSortIcon(st)}</th>`).join('')}
            <th class="px-4 py-3 text-right text-xs font-semibold text-indigo-600 cursor-pointer hover:bg-slate-100 transition-colors" onclick="window.handleSortIdsp('ton_kho')">Tồn kho ${getSortIcon('ton_kho')}</th>
        </tr>
    `;
    thead.innerHTML = headerHtml;

    document.getElementById('idspTableBody').innerHTML = currentIdspStats.length ? currentIdspStats.map(a => `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
            <td class="px-4 py-3 text-sm font-medium text-primary">${a.idsp}</td>
            <td class="px-4 py-3 text-sm text-slate-700 max-w-[160px] truncate" title="${a.ten_sp}">${a.ten_sp || '-'}</td>
            <td class="px-4 py-3 text-sm text-slate-700">${a.slg.toLocaleString('vi-VN')}</td>
            <td class="px-4 py-3 text-sm text-slate-700">${a.doanh_thu.toLocaleString('vi-VN')}</td>
            ${currentStatusesArray.map(st => `<td class="px-4 py-3 text-sm text-red-500">${a.statuses[st] || 0}</td>`).join('')}
            <td class="px-4 py-3 text-sm font-bold text-indigo-600 text-right">${(a.ton_kho || 0).toLocaleString('vi-VN')}</td>
        </tr>`).join('') : `<tr><td colspan="${5 + currentStatusesArray.length}" class="text-center py-4 text-slate-400">Không có dữ liệu</td></tr>`;
}

window.handleSortIdsp = function(key) {
    if (idspSort.key === key) {
        idspSort.asc = !idspSort.asc;
    } else {
        idspSort.key = key;
        idspSort.asc = true;
    }
    renderIdspTable();
};

async function filterReport() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    const filterMaGian = document.getElementById('filterMaGian').value.trim().toLowerCase();
    const filterIdSp = document.getElementById('filterReportIdSp').value.trim().toLowerCase();
    const filterTrangThaiInput = document.getElementById('filterReportTrangThai');
    const filterTrangThai = filterTrangThaiInput ? filterTrangThaiInput.value.trim().toLowerCase() : '';

    if (!fromDate || !toDate) {
        alert('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc!');
        return;
    }

    if (!udctData || udctData.length === 0) {
        // Tự động thử tải dữ liệu nếu chưa có
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.classList.remove('hidden');
        try {
            await loadUDCTData();
        } catch (err) {
            console.error("Auto load UDCT failed:", err);
        } finally {
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
        }
    }

    if (!udctData || udctData.length === 0) {
        alert('Dữ liệu đang được tải hoặc chưa có. Vui lòng đợi trong giây lát hoặc kiểm tra kết nối.');
        return;
    }

    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden');

    try {
        // Setup filterReportTrangThai select if empty
        const filterTrangThaiSelect = document.getElementById('filterReportTrangThai');
        if (filterTrangThaiSelect && filterTrangThaiSelect.options.length <= 1) {
            const allTrangThai = new Set();
            udctData.forEach(item => {
                let tt = item.trang_thai ? item.trang_thai.trim().toUpperCase() : '';
                if (tt === '1 HỦY') tt = '2 HỦY';
                if (tt) allTrangThai.add(tt);
            });
            const currentSelected = filterTrangThaiSelect.value;
            let optionsHtml = '<option value="">Tất cả</option>';
            Array.from(allTrangThai).sort().forEach(tt => {
                optionsHtml += `<option value="${tt}">${tt}</option>`;
            });
            filterTrangThaiSelect.innerHTML = optionsHtml;
            filterTrangThaiSelect.value = currentSelected;
        }

        // Helper: chuyển dd/mm/yyyy hoặc yyyy-mm-dd → yyyy-mm-dd để so sánh
        const toIsoDate = (str) => {
            if (!str) return '';
            const s = str.split(' ')[0]; // bỏ phần giờ
            if (s.includes('/')) {
                // dd/mm/yyyy
                const [d, m, y] = s.split('/');
                return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
            return s; // đã là yyyy-mm-dd
        };

        // Sử dụng udctData đã load sẵn thay vì fetch lại từ Sheets
        const filtered = udctData.filter(item => {
            const ngayIso = toIsoDate(item.ngay);
            const matchDate = ngayIso >= fromDate && ngayIso <= toDate;
            const matchMaGian = !filterMaGian || (item.ma_gian || '').toLowerCase().includes(filterMaGian);
            const idSpValue = (item.id_sp_ct || item.id_sp || '').toString().toLowerCase();
            const matchIdSp = !filterIdSp || idSpValue.includes(filterIdSp);

            let itemTt = (item.trang_thai || '').trim().toUpperCase();
            if (itemTt === '1 HỦY') itemTt = '2 HỦY';
            const matchTrangThai = !filterTrangThai || itemTt.toLowerCase().includes(filterTrangThai);

            return matchDate && matchMaGian && matchIdSp && matchTrangThai;
        }).map(item => {
            let itemTt = (item.trang_thai || '').trim().toUpperCase();
            if (itemTt === '1 HỦY') itemTt = '2 HỦY';
            return {
                ngay: item.ngay,
                ngayDon: toIsoDate(item.ngay),
                san: item.san || 'Khác',
                ma_gian: item.ma_gian || 'N/A',
                id_sp: item.id_sp || '',
                id_sp_ct: item.id_sp_ct || item.id_sp || '',
                mvd: item.mvd || '',
                mdh: item.mdh || '',
                ten_sp: item.ten_sp || '',
                slg_xuat: parseFloat(item.slg_xuat) || 0,
                don_gia: parseFloat(item.don_gia_1) || 0,
                trang_thai: itemTt
            };
        });

        reportData = filtered;

        let totalRevenue = 0;
        const sanStats = {};
        const magianStats = {};
        const idspStats = {};
        const dailyStats = {};
        const uniqueStatuses = new Set();
        const statusTotalCounts = {};

        const totalMvdSet = new Set();

                // ----- Build tonKhoMap (Tồn kho = Tồn đầu + Tổng Nhập - Tổng Xuất trước fromDate) -----
        const tonKhoMap = {};
        // Lấy tồn đầu từ inventoryData (group by id_sp_ct, cộng tất cả kho)
        if (typeof inventoryData !== 'undefined' && inventoryData.length > 0) {
            inventoryData.forEach(sp => {
                const key = (sp.id_sp_ct || '').trim().toUpperCase();
                if (key) {
                    if (tonKhoMap[key] === undefined) tonKhoMap[key] = 0;
                    tonKhoMap[key] += parseFloat(sp.ton_dau) || 0;
                }
            });
        }
        // Cộng/trừ nhập xuất từ dhctData, chỉ lấy ĐÃ XÁC NHẬN, ngày < fromDate (không tính ngày fromDate)
        if (typeof dhctData !== 'undefined' && dhctData.length > 0) {
            dhctData.forEach(item => {
                if ((item.xac_nhan || '').trim() !== 'ĐÃ XÁC NHẬN') return;
                const ngayIso = toIsoDate(item.ngay);
                if (!ngayIso || ngayIso >= fromDate) return;
                const id = (item.id_sp_ct || '').trim().toUpperCase();
                if (!id) return;
                if (tonKhoMap[id] === undefined) tonKhoMap[id] = 0;
                const sl = parseFloat(item.so_luong) || 0;
                const truong = (item.truong || '').trim().toUpperCase();
                if (truong === 'NHẬP') {
                    tonKhoMap[id] += sl;
                } else if (truong === 'XUẤT') {
                    tonKhoMap[id] -= sl;
                }
            });
        }

        for (const item of filtered) {
            const rev = item.don_gia * item.slg_xuat;
            totalRevenue += rev;

            const mvdKey = item.mvd ? (item.mvd.trim() + '_' + item.ngayDon) : `empty_${Math.random()}`;
            totalMvdSet.add(mvdKey);

            const tt = item.trang_thai.trim();
            if (tt) {
                uniqueStatuses.add(tt);
                statusTotalCounts[tt] = (statusTotalCounts[tt] || 0) + 1;
            }

            if (!sanStats[item.san]) sanStats[item.san] = { so_don: 0, doanh_thu: 0, mvd_set: new Set() };
            sanStats[item.san].mvd_set.add(mvdKey);
            sanStats[item.san].so_don++;
            sanStats[item.san].doanh_thu += rev;

            if (!magianStats[item.ma_gian]) magianStats[item.ma_gian] = { so_don: 0, doanh_thu: 0, statuses: {}, mvd_set: new Set() };
            magianStats[item.ma_gian].mvd_set.add(mvdKey);
            magianStats[item.ma_gian].so_don++;
            magianStats[item.ma_gian].doanh_thu += rev;
            if (tt) {
                magianStats[item.ma_gian].statuses[tt] = (magianStats[item.ma_gian].statuses[tt] || 0) + 1;
            }

            const idKey = item.id_sp_ct || 'N/A';
            if (!idspStats[idKey]) idspStats[idKey] = { ten_sp: item.ten_sp || '', slg: 0, doanh_thu: 0, statuses: {} };
            idspStats[idKey].slg += item.slg_xuat;
            idspStats[idKey].doanh_thu += rev;
            if (tt) {
                idspStats[idKey].statuses[tt] = (idspStats[idKey].statuses[tt] || 0) + 1;
            }

            if (!dailyStats[item.ngayDon]) dailyStats[item.ngayDon] = { so_don: 0, doanh_thu: 0, mvd_set: new Set() };
            dailyStats[item.ngayDon].mvd_set.add(mvdKey);
            dailyStats[item.ngayDon].so_don++;
            dailyStats[item.ngayDon].doanh_thu += rev;
        }

        const totalOrders = totalMvdSet.size;

        document.getElementById('totalOrders').textContent = totalOrders.toLocaleString('vi-VN');
        document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString('vi-VN');
        document.getElementById('totalSan').textContent = Object.keys(sanStats).length;

        // Render bảng mã gian
        const statusesArray = Array.from(uniqueStatuses).sort();

        const topStatsContainer = document.getElementById('topStatsContainer');
        if (topStatsContainer) {
            Array.from(topStatsContainer.querySelectorAll('.dynamic-status-box')).forEach(el => el.remove());
            statusesArray.forEach((st, index) => {
                const colors = ['from-red-500 to-red-600', 'from-orange-500 to-orange-600', 'from-amber-500 to-amber-600', 'from-sky-500 to-sky-600', 'from-rose-500 to-rose-600'];
                const colorClass = colors[index % colors.length];

                const box = document.createElement('div');
                box.className = `flex-1 min-w-[150px] bg-gradient-to-r ${colorClass} rounded-xl p-3 text-white dynamic-status-box`;
                box.innerHTML = `
                    <div class="text-[11px] opacity-90 uppercase font-medium">${st}</div>
                    <div class="text-2xl font-bold">${statusTotalCounts[st].toLocaleString('vi-VN')}</div>
                `;
                topStatsContainer.appendChild(box);
            });
        }
        currentStatusesArray = statusesArray;
        currentMagianStats = Object.entries(magianStats).map(([mg, s]) => ({ mg, ...s, so_don: s.mvd_set ? s.mvd_set.size : s.so_don }));
        magianSort = { key: 'doanh_thu', asc: false }; // reset sort to default

        currentIdspStats = Object.entries(idspStats).map(([idsp, s]) => ({ idsp, ...s, ton_kho: tonKhoMap[idsp.toUpperCase()] || 0 }));
        idspSort = { key: 'doanh_thu', asc: false }; // reset sort to default

        renderMagianTable();
        renderIdspTable();

        let textSummary = `BÁO CÁO NGÀY: ${fromDate} đến ${toDate}\n`;
        textSummary += `====================================\n`;
        textSummary += `TỔNG SỐ ĐƠN: ${totalOrders.toLocaleString('vi-VN')}\n`;
        textSummary += `TỔNG DOANH THU: ${totalRevenue.toLocaleString('vi-VN')}\n\n`;
        textSummary += `\n`;
        Object.entries(sanStats).forEach(([san, stats]) => {
            textSummary += `- Sàn ${san}: ${stats.mvd_set.size.toLocaleString('vi-VN')} đơn - ${stats.doanh_thu.toLocaleString('vi-VN')}\n`;
        });
        if (filterMaGian) textSummary += `\nLỌC THEO MÃ GIAN: ${filterMaGian}\n`;
        document.getElementById('textReportArea').textContent = textSummary;

        renderCharts(dailyStats);

        window.__detailRows = filtered;
        renderDetailTable();

    } catch (error) {
        console.error('Filter error:', error);
        alert('Có lỗi xảy ra khi lọc dữ liệu!');
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

const detailSortState = {
    key: 'ngay',
    dir: 'desc'
};

function normalizeDetailValue(item, key) {
    if (key === 'ngay') return item.ngay || '';
    if (key === 'san') return item.san || '';
    if (key === 'ma_gian') return item.ma_gian || '';
    if (key === 'mvd') return item.mvd || '';
    if (key === 'mdh') return item.mdh || '';
    if (key === 'ten_sp') return item.ten_sp || '';
    if (key === 'id_sp') return item.id_sp || '';
    if (key === 'slg_xuat') return parseFloat(item.slg_xuat) || 0;
    if (key === 'don_gia') return parseFloat(item.don_gia) || 0;
    if (key === 'thanh_tien') return (parseFloat(item.don_gia) || 0) * (parseFloat(item.slg_xuat) || 0);
    if (key === 'trang_thai') return item.trang_thai || '';
    return '';
}

function updateDetailSortIndicators() {
    const keys = ['Ngay', 'San', 'MaGian', 'Mvd', 'Mdh', 'TenSp', 'IdSp', 'SlgXuat', 'DonGia', 'ThanhTien', 'TrangThai'];
    keys.forEach(k => {
        const el = document.getElementById(`detailSort${k}`);
        if (el) el.textContent = '↕';
    });
    const activeKeyMap = {
        ngay: 'Ngay', san: 'San', ma_gian: 'MaGian', mvd: 'Mvd', mdh: 'Mdh', ten_sp: 'TenSp', id_sp: 'IdSp', slg_xuat: 'SlgXuat', don_gia: 'DonGia', thanh_tien: 'ThanhTien', trang_thai: 'TrangThai'
    };
    const activeEl = document.getElementById(`detailSort${activeKeyMap[detailSortState.key]}`);
    if (activeEl) activeEl.textContent = detailSortState.dir === 'asc' ? '↑' : '↓';
}

function sortDetailTable(key) {
    if (detailSortState.key === key) {
        detailSortState.dir = detailSortState.dir === 'asc' ? 'desc' : 'asc';
    } else {
        detailSortState.key = key;
        detailSortState.dir = key === 'ngay' ? 'desc' : 'asc';
    }
    renderDetailTable();
}

function renderDetailTable() {
    const detailBody = document.getElementById('detailTableBody');
    if (!detailBody) return;
    const rows = (window.__detailRows || []).slice();
    rows.sort((a, b) => {
        const av = normalizeDetailValue(a, detailSortState.key);
        const bv = normalizeDetailValue(b, detailSortState.key);
        let cmp = 0;
        if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
        else cmp = String(av).localeCompare(String(bv), 'vi', { numeric: true, sensitivity: 'base' });
        return detailSortState.dir === 'asc' ? cmp : -cmp;
    });
    if (rows.length === 0) {
        detailBody.innerHTML = '<tr><td colspan="11" class="text-center py-8 text-slate-500">Không có dữ liệu</td></tr>';
    } else {
        detailBody.innerHTML = rows.map(item => `
                    <tr class="border-b border-slate-100 hover:bg-slate-50">
                        <td class="px-4 py-3 text-sm text-slate-900">${item.ngay || '-'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">${item.san || '-'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">${item.ma_gian || '-'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">${item.mvd || '-'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">${item.mdh || '-'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">${item.ten_sp || '-'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">${item.id_sp || '-'}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">${item.slg_xuat}</td>
                        <td class="px-4 py-3 text-sm text-slate-900">${parseFloat(item.don_gia || 0).toLocaleString('vi-VN')}</td>
                        <td class="px-4 py-3 text-sm text-slate-900 font-medium">${((parseFloat(item.don_gia) || 0) * (parseFloat(item.slg_xuat) || 0)).toLocaleString('vi-VN')}</td>
                        <td class="px-4 py-3 text-sm text-slate-700 font-semibold">${item.trang_thai || '-'}</td>
                    </tr>
                `).join('');
    }
    updateDetailSortIndicators();
}

function renderCharts(dailyStats) {
    const labels = Object.keys(dailyStats).sort();
    const revenueData = labels.map(l => dailyStats[l].doanh_thu);
    const ordersData = labels.map(l => dailyStats[l].mvd_set ? dailyStats[l].mvd_set.size : dailyStats[l].so_don);

    if (mergedChart) mergedChart.destroy();

    const ctx = document.getElementById('mergedChart').getContext('2d');
    mergedChart = new Chart(ctx, {
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Doanh thu (đ)',
                    data: revenueData,
                    backgroundColor: 'rgba(37, 99, 235, 0.7)',
                    borderColor: '#2563eb',
                    borderWidth: 1,
                    yAxisID: 'yRev',
                    order: 2
                },
                {
                    type: 'line',
                    label: 'Số đơn (đơn)',
                    data: ordersData,
                    borderColor: '#ef4444',
                    backgroundColor: '#ef4444',
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: false,
                    tension: 0.3,
                    yAxisID: 'yOrders',
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top', align: 'end' },
                tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12 }
            },
            scales: {
                x: { grid: { display: false } },
                yRev: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Doanh thu (vnđ)', color: '#2563eb' },
                    grid: { color: '#f1f5f9' },
                    beginAtZero: true
                },
                yOrders: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Số lượng đơn', color: '#ef4444' },
                    grid: { drawOnChartArea: false },
                    beginAtZero: true
                }
            }
        }
    });
}

function copyTextReport() {
    const content = document.getElementById('textReportArea').textContent;

    const textArea = document.createElement("textarea");
    textArea.value = content;

    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert('Đã sao chép báo cáo vào bộ nhớ tạm!');
        } else {
            alert('Lỗi khi sao chép!');
        }
    } catch (err) {
        console.error('Copy error:', err);
        alert('Lỗi khi sao chép!');
    }

    document.body.removeChild(textArea);
}

function exportReportToExcel() {
    if (reportData.length === 0) {
        alert('Không có dữ liệu để xuất! Vui lòng chọn ngày và lọc trước.');
        return;
    }

    const excelData = [
        ['BÁO CÁO ĐƠN HÀNG'],
        [`Từ ngày: ${document.getElementById('fromDate').value} đến ${document.getElementById('toDate').value}`],
        [`Mã gian lọc: ${document.getElementById('filterMaGian').value || 'Toàn bộ'}`],
        [],
        ['1. THỐNG KÊ TỔNG QUAN'],
        ['Tổng số đơn', document.getElementById('totalOrders').textContent],
        ['Tổng doanh thu', document.getElementById('totalRevenue').textContent],
        ['Số sàn', document.getElementById('totalSan').textContent],
        [],
        ['2. THỐNG KÊ THEO MÃ GIAN']
    ];

    const magianThead = document.querySelector('#magianTableBody').previousElementSibling;
    const magianHeaders = magianThead ? Array.from(magianThead.querySelectorAll('th')).map(th => th.textContent.trim()) : ['Mã gian', 'Số đơn', 'Doanh thu'];
    excelData.push(magianHeaders);

    const magianRows = document.querySelectorAll('#magianTableBody tr');
    magianRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
            excelData.push(Array.from(cells).map(c => c.textContent));
        }
    });

    excelData.push([], ['3. CHI TIẾT ĐƠN HÀNG']);
    excelData.push(['Ngày', 'Sàn', 'MVD', 'MDH', 'Tên SP', 'SLG xuất', 'Đơn giá', 'Thành tiền']);

    const detailRows = document.querySelectorAll('#detailTableBody tr');
    detailRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 8) {
            excelData.push(Array.from(cells).map(c => c.textContent));
        }
    });

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BaoCao');
    XLSX.writeFile(wb, `BaoCao_ERP_${document.getElementById('fromDate').value}_${document.getElementById('toDate').value}.xlsx`);
}

function exportIdSPExcel() {
    const tbody = document.getElementById('idspTableBody');
    if (!tbody || tbody.innerHTML.includes('Không lấy được dữ liệu') || tbody.innerHTML.includes('Chọn ngày')) {
        alert('Không có dữ liệu để xuất! Vui lòng chọn ngày và lọc báo cáo trước.');
        return;
    }

    const theadIdsp = document.querySelector('#idspTableBody').previousElementSibling;
    const idspHeaders = theadIdsp ? Array.from(theadIdsp.querySelectorAll('th')).map(th => th.textContent.trim()) : ['id_sp_ct', 'Tên SP', 'SL xuất', 'Doanh thu'];

    const excelData = [idspHeaders];
    const rows = tbody.querySelectorAll('tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
            const rowData = Array.from(cells).map((c, i) => {
                let text = c.textContent.trim();
                // Loại bỏ dấu phẩy/chấm ở cột số lượng, doanh thu và các cột trạng thái
                if (i >= 2) {
                    text = text.replace(/,/g, '').replace(/\./g, '');
                }
                return text;
            });
            excelData.push(rowData);
        }
    });

    if (excelData.length <= 1) {
        alert('Không có dữ liệu hợp lệ để xuất!');
        return;
    }

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ThongKe_ID_SP');
    XLSX.writeFile(wb, `ThongKe_ID_SP_${document.getElementById('fromDate').value}_${document.getElementById('toDate').value}.xlsx`);
}

async function transferToDonHangCT() {
    const tbody = document.getElementById('idspTableBody');
    if (!tbody || tbody.innerHTML.includes('Không lấy được dữ liệu') || tbody.innerHTML.includes('Chọn ngày')) {
        alert('Không có dữ liệu để chuyển! Vui lòng chọn ngày và lọc báo cáo trước.');
        return;
    }

    const ngay_loc = document.getElementById('fromDate').value;
    let ngay_format = '';
    if (ngay_loc) {
        const parts = ngay_loc.split('-');
        if (parts.length === 3) {
            ngay_format = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
    }
    if (!ngay_format) {
        alert('Vui lòng chọn ngày lọc hợp lệ.');
        return;
    }

    const truong = 'XUẤT';
    const ncc = 'HẰNG NGÀY';
    const appendValues = [];

    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
            const id_sp_ct = cells[0].textContent.trim();
            const ten_sp = cells[1].textContent.trim();
            let sl_xuat = cells[2].textContent.trim();
            sl_xuat = parseFloat(sl_xuat.replace(/,/g, '').replace(/\./g, '')) || 0;
            
            if (sl_xuat > 0) {
                let id_sp = '';
                let gia = 0;
                if (typeof sanphamData !== 'undefined') {
                    const sp = sanphamData.find(s => (s.sku_con || '').toLowerCase() === id_sp_ct.toLowerCase());
                    if (sp) {
                        id_sp = sp.id_sp || '';
                        gia = parseFloat(sp.gia_nhap) || 0;
                    } else {
                        id_sp = id_sp_ct.substring(0, 4);
                    }
                } else {
                    id_sp = id_sp_ct.substring(0, 4);
                }

                const key = `${ngay_format} | ${truong} | ${ncc} | MB`;
                const id_dh = key;
                const id_dh_ct = `${ngay_format} | ${truong} | ${ncc} | MB | KHO | ${id_sp_ct}`;
                const id_ton_kho = `KHO | ${id_sp_ct}`;

                appendValues.push([
                    id_dh_ct, id_dh, ngay_format, truong, ncc, 'KHO', id_sp_ct, id_sp, ten_sp, sl_xuat, gia, sl_xuat * gia, '', id_ton_kho, 'CHỜ XÁC NHẬN'
                ]);
            }
        }
    });

    if (appendValues.length === 0) {
        alert('Không có dữ liệu hợp lệ (SL xuất > 0) để chuyển!');
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

window.transferToDonHangCT = transferToDonHangCT;

// ===================== BÁO CÁO TỔNG LOGIC =====================
let reportTongData = [];
let reportTongMagianStats = [];
let reportTongIdspStats = [];

function setQuickDateTong(type) {
    const today = new Date();
    const fromDate = document.getElementById('fromDateTong');
    const toDate = document.getElementById('toDateTong');
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    if (type === 'today') {
        fromDate.value = fmt(today);
        toDate.value = fmt(today);
    } else if (type === 'thisWeek') {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(diff);
        fromDate.value = fmt(startOfWeek);
        toDate.value = fmt(new Date());
    } else if (type === 'thisMonth') {
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        fromDate.value = `${y}-${m}-01`;
        toDate.value = fmt(new Date());
    }
    filterReportTong();
}

function changeReportDateTong(id, direction) {
    const input = document.getElementById(id);
    if (!input || !input.value) return;
    const d = new Date(input.value);
    d.setDate(d.getDate() + direction);
    input.value = d.toISOString().split('T')[0];
    filterReportTong();
}

async function filterReportTong() {
    const fromDate = document.getElementById('fromDateTong').value;
    const toDate = document.getElementById('toDateTong').value;

    if (!fromDate || !toDate) return;

    if (!udctData || udctData.length === 0) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.classList.remove('hidden');
        try { await loadUDCTData(); } catch (e) { console.error(e); }
        finally { if (loadingOverlay) loadingOverlay.classList.add('hidden'); }
    }
    if (!udctData || udctData.length === 0) return;

    // Ensure hangHoanData loaded
    if (!dhctData || dhctData.length === 0) {
        try { if (window.fetchDHCTData) await fetchDHCTData(true); } catch (e) { console.error(e); }
    }
    if (!hangHoanData || hangHoanData.length === 0) {
        try { await fetchHangHoanData(); } catch (e) { console.error(e); }
    }

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    try {
        const toIsoDate = (str) => {
            if (!str) return '';
            const s = str.split(' ')[0];
            if (s.includes('/')) {
                const [d, m, y] = s.split('/');
                return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
            return s;
        };

        const filtered = udctData.filter(item => {
            const ngayIso = toIsoDate(item.ngay);
            return ngayIso >= fromDate && ngayIso <= toDate;
        }).map(item => {
            let itemTt = (item.trang_thai || '').trim().toUpperCase();
            if (itemTt === '1 HỦY') itemTt = '2 HỦY';
            return {
                ngay: item.ngay,
                san: item.san || 'Khác',
                ma_gian: item.ma_gian || 'N/A',
                id_sp: item.id_sp || '',
                id_sp_ct: item.id_sp_ct || item.id_sp || '',
                ten_sp: item.ten_sp || '',
                slg_xuat: parseFloat(item.slg_xuat) || 0,
                don_gia: parseFloat(item.don_gia_1) || 0,
                trang_thai: itemTt
            };
        });

        reportTongData = filtered;

        // ----- Build return counts from HH_BH (filtered by same date range) -----
        const hhByMaGian = {};
        const hhBySkuCt = {};
        if (hangHoanData && hangHoanData.length > 0) {
            hangHoanData.forEach(hh => {
                // Filter by date range
                const hhNgay = hh.ngay_nhan || '';
                if (fromDate && hhNgay < fromDate) return;
                if (toDate && hhNgay > toDate) return;

                const mg = (hh.ma_gian || '').trim();
                if (mg) hhByMaGian[mg] = (hhByMaGian[mg] || 0) + 1;
                const skuCt = (hh.sku_ct || '').trim();
                if (skuCt) hhBySkuCt[skuCt] = (hhBySkuCt[skuCt] || 0) + 1;
            });
        }

        // ----- Build tonKhoMap (Tồn kho = Tồn đầu + Tổng Nhập - Tổng Xuất trước fromDate) -----
        const tonKhoMap = {};
        // Lấy tồn đầu từ inventoryData (group by id_sp_ct, cộng tất cả kho)
        if (typeof inventoryData !== 'undefined' && inventoryData.length > 0) {
            inventoryData.forEach(sp => {
                const key = (sp.id_sp_ct || '').trim().toUpperCase();
                if (key) {
                    if (tonKhoMap[key] === undefined) tonKhoMap[key] = 0;
                    tonKhoMap[key] += parseFloat(sp.ton_dau) || 0;
                }
            });
        }
        // Cộng/trừ nhập xuất từ dhctData, chỉ lấy ĐÃ XÁC NHẬN, ngày < fromDate (không tính ngày fromDate)
        if (typeof dhctData !== 'undefined' && dhctData.length > 0) {
            dhctData.forEach(item => {
                if ((item.xac_nhan || '').trim() !== 'ĐÃ XÁC NHẬN') return;
                const ngayIso = toIsoDate(item.ngay);
                if (!ngayIso || ngayIso >= fromDate) return;
                const id = (item.id_sp_ct || '').trim().toUpperCase();
                if (!id) return;
                if (tonKhoMap[id] === undefined) tonKhoMap[id] = 0;
                const sl = parseFloat(item.so_luong) || 0;
                const truong = (item.truong || '').trim().toUpperCase();
                if (truong === 'NHẬP') {
                    tonKhoMap[id] += sl;
                } else if (truong === 'XUẤT') {
                    tonKhoMap[id] -= sl;
                }
            });
        }

        // ----- Stats by Ma Gian -----
        const magianStats = {};
        const idspStats = {};

        for (const item of filtered) {
            const rev = item.don_gia * item.slg_xuat;
            const mg = item.ma_gian;
            if (!magianStats[mg]) magianStats[mg] = { so_don: 0, doanh_thu: 0, trang_thai: {} };
            magianStats[mg].so_don++;
            magianStats[mg].doanh_thu += rev;
            const tt = item.trang_thai.trim();
            if (tt) magianStats[mg].trang_thai[tt] = (magianStats[mg].trang_thai[tt] || 0) + 1;

            const idKey = item.id_sp_ct || 'N/A';
            if (!idspStats[idKey]) idspStats[idKey] = { ten_sp: item.ten_sp || '', slg: 0, doanh_thu: 0, trang_thai: {} };
            idspStats[idKey].slg += item.slg_xuat;
            idspStats[idKey].doanh_thu += rev;
            if (tt) idspStats[idKey].trang_thai[tt] = (idspStats[idKey].trang_thai[tt] || 0) + 1;
        }

        // Collect unique statuses
        const uniqueStatuses = new Set();
        filtered.forEach(item => { if (item.trang_thai.trim()) uniqueStatuses.add(item.trang_thai.trim()); });
        const statusesArray = Array.from(uniqueStatuses).sort();

        // ----- Render Ma Gian Table -----
        // Dynamic thead
        const magianThead = document.getElementById('magianTongThead');
        if (magianThead) {
            let thHtml = '<th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 sticky left-0 z-20 bg-slate-50">Mã gian</th>';
            thHtml += '<th class="px-4 py-3 text-right text-xs font-semibold text-slate-600">Số đơn đi</th>';
            thHtml += '<th class="px-4 py-3 text-right text-xs font-semibold text-slate-600">Doanh thu</th>';
            statusesArray.forEach(st => {
                thHtml += `<th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">${escapeHtml(st)}</th>`;
            });
            thHtml += '<th class="px-4 py-3 text-right text-xs font-semibold text-rose-600 whitespace-nowrap">Số đơn hoàn</th>';
            thHtml += '<th class="px-4 py-3 text-right text-xs font-semibold text-indigo-600 whitespace-nowrap">Tồn kho</th>';
            magianThead.innerHTML = thHtml;
        }

        const magianEntries = Object.entries(magianStats).sort((a, b) => b[1].doanh_thu - a[1].doanh_thu);
        reportTongMagianStats = magianEntries;
        const tbMG = document.getElementById('magianTongTableBody');
        if (tbMG) {
            if (magianEntries.length === 0) {
                const colSpan = 4 + statusesArray.length;
                tbMG.innerHTML = `<tr><td colspan="${colSpan}" class="text-center py-8 text-slate-500 text-sm">Không có dữ liệu</td></tr>`;
            } else {
                tbMG.innerHTML = magianEntries.map(([mg, s]) => {
                    const hoanCount = hhByMaGian[mg] || 0;
                    let row = `<tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">`;
                    row += `<td class="px-4 py-2 text-sm font-medium text-slate-900 sticky left-0 bg-white z-10">${escapeHtml(mg)}</td>`;
                    row += `<td class="px-4 py-2 text-sm text-right text-slate-700 font-semibold">${s.so_don.toLocaleString('vi-VN')}</td>`;
                    row += `<td class="px-4 py-2 text-sm text-right text-slate-700">${s.doanh_thu.toLocaleString('vi-VN')}</td>`;
                    statusesArray.forEach(st => {
                        const cnt = s.trang_thai[st] || 0;
                        row += `<td class="px-4 py-2 text-sm text-right text-slate-500">${cnt ? cnt.toLocaleString('vi-VN') : '-'}</td>`;
                    });
                    row += `<td class="px-4 py-2 text-sm text-right font-bold ${hoanCount > 0 ? 'text-rose-600' : 'text-slate-400'}">${hoanCount > 0 ? hoanCount.toLocaleString('vi-VN') : '0'}</td>`;
            row += `<td class="px-4 py-2 text-sm text-right font-bold text-indigo-600">${(s.ton_kho || 0).toLocaleString('vi-VN')}</td>`;
                    row += `</tr>`;
                    return row;
                }).join('');
            }
        }

        // ----- Render ID SP CT Table -----
        const idspThead = document.getElementById('idspTongThead');
        if (idspThead) {
            let thHtml = '<th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 sticky left-0 z-20 bg-slate-50">id_sp_ct</th>';
            thHtml += '<th class="px-4 py-3 text-left text-xs font-semibold text-slate-600">Tên SP</th>';
            thHtml += '<th class="px-4 py-3 text-right text-xs font-semibold text-slate-600">SL xuất</th>';
            thHtml += '<th class="px-4 py-3 text-right text-xs font-semibold text-slate-600">Doanh thu</th>';
            statusesArray.forEach(st => {
                thHtml += `<th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">${escapeHtml(st)}</th>`;
            });
            thHtml += '<th class="px-4 py-3 text-right text-xs font-semibold text-rose-600 whitespace-nowrap">Số đơn hoàn</th>';
            thHtml += '<th class="px-4 py-3 text-right text-xs font-semibold text-indigo-600 whitespace-nowrap">Tồn kho</th>';
            idspThead.innerHTML = thHtml;
        }

        const idspEntries = Object.entries(idspStats).sort((a, b) => b[1].doanh_thu - a[1].doanh_thu);
        reportTongIdspStats = idspEntries.map(([idsp, s]) => {
            s.ton_kho = tonKhoMap[idsp.toUpperCase()] || 0;
            return [idsp, s];
        });
        renderIdspTongTable(reportTongIdspStats, statusesArray, hhBySkuCt);

    } catch (error) {
        console.error('FilterReportTong error:', error);
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
}

function renderIdspTongTable(idspEntries, statusesArray, hhBySkuCt) {
    const tbIdsp = document.getElementById('idspTongTableBody');
    if (!tbIdsp) return;

    // Apply search filter
    const searchVal = (document.getElementById('filterReportTongIdSp')?.value || '').trim().toLowerCase();
    let entries = idspEntries;
    if (searchVal) {
        entries = entries.filter(([idsp, s]) => idsp.toLowerCase().includes(searchVal) || (s.ten_sp || '').toLowerCase().includes(searchVal));
    }

    if (!statusesArray) statusesArray = [];
    if (!hhBySkuCt) hhBySkuCt = {};

    if (entries.length === 0) {
        const colSpan = 7 + statusesArray.length;
        tbIdsp.innerHTML = `<tr><td colspan="${colSpan}" class="text-center py-8 text-slate-500 text-sm">Không có dữ liệu</td></tr>`;
    } else {
        tbIdsp.innerHTML = entries.map(([idsp, s]) => {
            const hoanCount = hhBySkuCt[idsp] || 0;
            let row = `<tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">`;
            row += `<td class="px-4 py-2 text-sm font-medium text-slate-900 sticky left-0 bg-white z-10">${escapeHtml(idsp)}</td>`;
            row += `<td class="px-4 py-2 text-sm text-slate-700 truncate max-w-[200px]" title="${escapeHtml(s.ten_sp)}">${escapeHtml(s.ten_sp)}</td>`;
            row += `<td class="px-4 py-2 text-sm text-right text-slate-700 font-semibold">${s.slg.toLocaleString('vi-VN')}</td>`;
            row += `<td class="px-4 py-2 text-sm text-right text-slate-700">${s.doanh_thu.toLocaleString('vi-VN')}</td>`;
            statusesArray.forEach(st => {
                const cnt = s.trang_thai[st] || 0;
                row += `<td class="px-4 py-2 text-sm text-right text-slate-500">${cnt ? cnt.toLocaleString('vi-VN') : '-'}</td>`;
            });
            row += `<td class="px-4 py-2 text-sm text-right font-bold ${hoanCount > 0 ? 'text-rose-600' : 'text-slate-400'}">${hoanCount > 0 ? hoanCount.toLocaleString('vi-VN') : '0'}</td>`;
            row += `<td class="px-4 py-2 text-sm text-right font-bold text-indigo-600">${(s.ton_kho || 0).toLocaleString('vi-VN')}</td>`;
            row += `</tr>`;
            return row;
        }).join('');
    }
}

// Store last computed hhBySkuCt for search
let _lastHhBySkuCt = {};
let _lastStatusesArrayTong = [];

// Override filterReportTong to save context for search
const _origFilterReportTong = filterReportTong;
filterReportTong = async function () {
    await _origFilterReportTong();
    // After filter, stash hhBySkuCt for reuse
};

function filterReportTong_SearchIdsp() {
    // Re-render idsp table with current data and search filter
    if (!reportTongIdspStats || reportTongIdspStats.length === 0) return;
    // Rebuild hhBySkuCt from hangHoanData filtered by date
    const fromDate = document.getElementById('fromDateTong').value;
    const toDate = document.getElementById('toDateTong').value;
    const hhBySkuCt = {};
    if (hangHoanData && hangHoanData.length > 0) {
        hangHoanData.forEach(hh => {
            const hhNgay = hh.ngay_nhan || '';
            if (fromDate && hhNgay < fromDate) return;
            if (toDate && hhNgay > toDate) return;
            const skuCt = (hh.sku_ct || '').trim();
            if (skuCt) hhBySkuCt[skuCt] = (hhBySkuCt[skuCt] || 0) + 1;
        });
    }
    // Rebuild statuses from reportTongData
    const statusSet = new Set();
    (reportTongData || []).forEach(item => { if (item.trang_thai && item.trang_thai.trim()) statusSet.add(item.trang_thai.trim()); });
    const statusesArray = Array.from(statusSet).sort();

    renderIdspTongTable(reportTongIdspStats, statusesArray, hhBySkuCt);
}

function exportReportTongToExcel() {
    if (!reportTongData || reportTongData.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }

    const fromDate = document.getElementById('fromDateTong').value;
    const toDate = document.getElementById('toDateTong').value;

    // Rebuild statuses
    const statusSet = new Set();
    reportTongData.forEach(item => { if (item.trang_thai && item.trang_thai.trim()) statusSet.add(item.trang_thai.trim()); });
    const statusesArray = Array.from(statusSet).sort();

    // Rebuild hhByMaGian and hhBySkuCt (filtered by date)
    const hhByMaGian = {};
    const hhBySkuCt = {};
    if (hangHoanData && hangHoanData.length > 0) {
        hangHoanData.forEach(hh => {
            const hhNgay = hh.ngay_nhan || '';
            if (fromDate && hhNgay < fromDate) return;
            if (toDate && hhNgay > toDate) return;
            const mg = (hh.ma_gian || '').trim();
            if (mg) hhByMaGian[mg] = (hhByMaGian[mg] || 0) + 1;
            const skuCt = (hh.sku_ct || '').trim();
            if (skuCt) hhBySkuCt[skuCt] = (hhBySkuCt[skuCt] || 0) + 1;
        });
    }

    const excelData = [
        ['BÁO CÁO TỔNG'],
        [`Từ ngày: ${fromDate} đến ${toDate}`],
        [],
        ['1. THỐNG KÊ THEO MÃ GIAN']
    ];

    // Ma gian header
    const mgHeader = ['Mã gian', 'Số đơn đi', 'Doanh thu', ...statusesArray, 'Số đơn hoàn'];
    excelData.push(mgHeader);

    if (reportTongMagianStats) {
        reportTongMagianStats.forEach(([mg, s]) => {
            const row = [mg, s.so_don, s.doanh_thu];
            statusesArray.forEach(st => row.push(s.trang_thai[st] || 0));
            row.push(hhByMaGian[mg] || 0);
            excelData.push(row);
        });
    }

    excelData.push([], ['2. THỐNG KÊ THEO ID_SP_CT']);
    const idspHeader = ['id_sp_ct', 'Tên SP', 'SL xuất', 'Doanh thu', ...statusesArray, 'Số đơn hoàn', 'Tồn kho'];
    excelData.push(idspHeader);

    if (reportTongIdspStats) {
        reportTongIdspStats.forEach(([idsp, s]) => {
            const row = [idsp, s.ten_sp, s.slg, s.doanh_thu];
            statusesArray.forEach(st => row.push(s.trang_thai[st] || 0));
            row.push(hhBySkuCt[idsp] || 0);
            row.push(s.ton_kho || 0);
            excelData.push(row);
        });
    }

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BaoCaoTong');
    XLSX.writeFile(wb, `BaoCaoTong_${fromDate}_${toDate}.xlsx`);
}

    Object.assign(window.AppModules = window.AppModules || {}, { ['baocao']: true });
    window.setQuickDate = setQuickDate;
    window.autoFilterReport = autoFilterReport;
    window.renderMagianTable = renderMagianTable;
    window.renderIdspTable = renderIdspTable;
    window.filterReport = filterReport;
    window.normalizeDetailValue = normalizeDetailValue;
    window.updateDetailSortIndicators = updateDetailSortIndicators;
    window.sortDetailTable = sortDetailTable;
    window.renderDetailTable = renderDetailTable;
    window.renderCharts = renderCharts;
    window.copyTextReport = copyTextReport;
    window.exportReportToExcel = exportReportToExcel;
    window.exportIdSPExcel = exportIdSPExcel;
    window.setQuickDateTong = setQuickDateTong;
    window.changeReportDateTong = changeReportDateTong;
    window.filterReportTong = filterReportTong;
    window.renderIdspTongTable = renderIdspTongTable;
    window.filterReportTong_SearchIdsp = filterReportTong_SearchIdsp;
    window.exportReportTongToExcel = exportReportTongToExcel;
})();
