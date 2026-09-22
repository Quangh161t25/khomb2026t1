// sanpham - Module Pattern (IIFE)
(function () {
let sanphamCurrentPage = 1;
const SP_PER_PAGE = 100;

async function loadSanphamData() {
    const tbody = document.getElementById('sanphamTableBody');
    if (tbody) tbody.innerHTML = generateSkeletonRows(7, 10);

    const data = await fetchSheetData(CONFIG.sanphamSheetName);
    if (data && data.length > 0) {
        const headers = data[0].map(h => (h || "").toString().toLowerCase().trim());

        const findIdx = (names) => {
            for (const name of names) {
                const idx = headers.indexOf(name.toLowerCase());
                if (idx !== -1) return idx;
            }
            return -1;
        };

        const idxSkuCon = findIdx(['mã', 'sku_con', 'sku con', 'id_sp_con']);
        const idxIdSp = findIdx(['mã sp cha', 'id_sp']);
        const idxTen = findIdx(['tên', 'ten_sp', 'tên sản phẩm']);
        const idxGiaNhap = findIdx(['giá nhập', 'gia_nhap']);
        const idxGiaBan = findIdx(['giá bán lẻ', 'gia_ban', 'giá bán']);
        const idxGiaDongGoi = findIdx(['giá đón gói', 'gia_dong_goi', 'giá đóng gói']);
        const idxGiaThapNhat = findIdx(['giá bán thấp nhất', 'giá thấp nhất', 'gia_thap_nhat']);

        sanphamData = data.slice(1).map((row, idx) => ({
            rowIndex: idx + 2,
            sku_con: idxSkuCon !== -1 ? row[idxSkuCon] : (row[0] || ""),
            id_sp: idxIdSp !== -1 ? row[idxIdSp] : (row[1] || ""),
            ten_sp: idxTen !== -1 ? row[idxTen] : (row[2] || ""),
            gia_nhap: parseFloat(idxGiaNhap !== -1 ? row[idxGiaNhap] : row[3]) || 0,
            gia_ban: parseFloat(idxGiaBan !== -1 ? row[idxGiaBan] : row[4]) || 0,
            gia_dong_goi: parseFloat(idxGiaDongGoi !== -1 ? row[idxGiaDongGoi] : row[5]) || 0,
            gia_thap_nhat: parseFloat(idxGiaThapNhat !== -1 ? row[idxGiaThapNhat] : row[6]) || 0,
            mapping: row
        })).filter(item => item.sku_con !== '');

        renderSanphamTable(1);
        populateSPLists();
    } else {
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-slate-500">Không có dữ liệu</td></tr>';
    }
}

function renderSanphamTable(page = 1) {
    saveFiltersToCache();
    const tbody = document.getElementById('sanphamTableBody');
    if (!tbody) return;

    const search = (document.getElementById('spFilterSearch')?.value || '').toLowerCase().trim();

    let filtered = sanphamData;
    if (search) filtered = filtered.filter(item =>
        item.mapping.some(c => (c || '').toString().toLowerCase().includes(search))
    );

    const totalRows = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / SP_PER_PAGE));
    sanphamCurrentPage = Math.min(page, totalPages);

    const start = (sanphamCurrentPage - 1) * SP_PER_PAGE;
    const paginated = filtered.slice(start, start + SP_PER_PAGE);

    document.getElementById('spStatsText').textContent = `Hiển thị: ${paginated.length}/${totalRows} sản phẩm (Tổng: ${sanphamData.length})`;
    document.getElementById('spPageInfo').textContent = `Trang ${sanphamCurrentPage} / ${totalPages}`;
    document.getElementById('spPrevBtn').disabled = sanphamCurrentPage <= 1;
    document.getElementById('spNextBtn').disabled = sanphamCurrentPage >= totalPages;

    if (!paginated.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-slate-500">Không tìm thấy sản phẩm phù hợp</td></tr>';
        return;
    }

    tbody.innerHTML = paginated.map(item => `
                <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="px-2 py-1.5 text-xs text-slate-900 whitespace-nowrap">${item.sku_con || '-'}</td>
                    <td class="px-2 py-1.5 text-xs text-slate-900 whitespace-nowrap">${item.id_sp || '-'}</td>
                    <td class="px-2 py-1.5 text-xs text-slate-900 max-w-[240px] truncate">${item.ten_sp || '-'}</td>
                    <td class="px-2 py-1.5 text-xs text-slate-900 whitespace-nowrap">${item.gia_nhap ? item.gia_nhap.toLocaleString('vi-VN') : '-'}</td>
                    <td class="px-2 py-1.5 text-xs text-slate-900 whitespace-nowrap">${item.gia_ban ? item.gia_ban.toLocaleString('vi-VN') : '-'}</td>
                    <td class="px-2 py-1.5 text-xs text-slate-900 whitespace-nowrap">${item.gia_dong_goi ? item.gia_dong_goi.toLocaleString('vi-VN') : '-'}</td>
                    <td class="px-2 py-1.5 text-xs text-slate-900 whitespace-nowrap">${item.gia_thap_nhat ? item.gia_thap_nhat.toLocaleString('vi-VN') : '-'}</td>
                </tr>
            `).join('');
}

function changeSanphamPage(delta) {
    renderSanphamTable(sanphamCurrentPage + delta);
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

        const headers = excelData[0].map(h => (h || "").toString().trim().toLowerCase());
        const findIdx = (names) => {
            for (const name of names) {
                const idx = headers.indexOf(name.toLowerCase());
                if (idx !== -1) return idx;
            }
            return -1;
        };

        const idxMa = findIdx(['mã', 'sku_con', 'sku con', 'id_sp_con']);
        const idxTen = findIdx(['tên', 'ten_sp', 'tên sản phẩm']);
        const idxGiaNhap = findIdx(['giá nhập', 'gia_nhap']);
        const idxGiaBan = findIdx(['giá bán lẻ', 'gia_ban', 'giá bán']);
        const idxGiaDongGoi = findIdx(['giá đón gói', 'giá đóng gói', 'gia_dong_goi']);
        const idxGiaThapNhat = findIdx(['giá bán thấp nhất', 'giá thấp nhất', 'gia_thap_nhat']);

        if (idxMa === -1) {
            alert("Không tìm thấy cột 'Mã' trong file Excel!");
            return;
        }

        const rows = excelData.slice(1);
        const sheetData = [];
        
        sheetData.push(["Mã", "Mã SP Cha", "Tên", "Giá nhập", "Giá bán lẻ", "Giá đón gói", "Giá bán thấp nhất"]);

        for (const row of rows) {
            const ma = row[idxMa] ? row[idxMa].toString().trim().toUpperCase() : '';
            if (!ma) continue;

            const maCha = ma.substring(0, 4);
            const ten = idxTen !== -1 ? (row[idxTen] || "").toString().trim() : '';
            const giaNhap = idxGiaNhap !== -1 ? row[idxGiaNhap] : '';
            const giaBan = idxGiaBan !== -1 ? row[idxGiaBan] : '';
            const giaDongGoi = idxGiaDongGoi !== -1 ? row[idxGiaDongGoi] : '';
            const giaThapNhat = idxGiaThapNhat !== -1 ? row[idxGiaThapNhat] : '';

            sheetData.push([ma, maCha, ten, giaNhap, giaBan, giaDongGoi, giaThapNhat]);
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
            alert(`Import thành công ${sheetData.length - 1} sản phẩm vào ${CONFIG.sanphamSheetName}!`);
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


    Object.assign(window.AppModules = window.AppModules || {}, { ['sanpham']: true });
    window.loadSanphamData = loadSanphamData;
    window.renderSanphamTable = renderSanphamTable;
    window.changeSanphamPage = changeSanphamPage;
    window.handleExcelUpload = handleExcelUpload;
})();
