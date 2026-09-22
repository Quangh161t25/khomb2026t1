// upmisa - Module Pattern (IIFE)
(function () {
// Hàm xây dựng dữ liệu UPMISA từ udctData
function buildUpmisaData() {
    if (!udctData.length) return;

    upmisaData = [];

    const extraColumns = [
        { name: "Hiển thị trên sổ", default: "0" }, { name: "Hình thức bán hàng", default: "0" }, { name: "Phương thức thanh toán", default: "0" },
        { name: "Kiêm phiếu xuất kho", default: "1" }, { name: "Lập kèm hóa đơn", default: "0" }, { name: "Đã lập hóa đơn", default: "0" },
        { name: "Ngày hạch toán (*)", default: "" }, { name: "Ngày chứng từ (*)", default: "" }, { name: "Số chứng từ (*)", default: "" },
        { name: "Số phiếu xuất", default: "" }, { name: "Lý do xuất", default: "" }, { name: "Số hóa đơn", default: "" },
        { name: "Ngày hóa đơn", default: "" }, { name: "Mã đơn hàng", default: "" }, { name: "Mã thống kê", default: "" },
        { name: "Mã khách hàng", default: "" }, { name: "Tên khách hàng", default: "" }, { name: "Địa chỉ", default: "" },
        { name: "Mã số thuế", default: "" }, { name: "Diễn giải", default: "" }, { name: "Nộp vào TK", default: "" },
        { name: "NV bán hàng", default: "" }, { name: "Mã hàng (*)", default: "" }, { name: "Tên hàng", default: "" },
        { name: "Hàng khuyến mại", default: "" }, { name: "TK Tiền/Chi phí/Nợ (*)", default: "131" }, { name: "TK Doanh thu/Có (*)", default: "5111" },
        { name: "ĐVT", default: "" }, { name: "Số lượng", default: "" }, { name: "Đơn giá sau thuế", default: "" },
        { name: "Đơn giá", default: "" }, { name: "Thành tiền", default: "" }, { name: "Tỷ lệ CK (%)", default: "" },
        { name: "Tiền chiết khấu", default: "" }, { name: "TK chiết khấu", default: "" }, { name: "Giá tính thuế XK", default: "" },
        { name: "% thuế XK", default: "" }, { name: "Tiền thuế XK", default: "" }, { name: "TK thuế XK", default: "" },
        { name: "% thuế GTGT", default: "" }, { name: "Tiền thuế GTGT", default: "" }, { name: "TK thuế GTGT", default: "" },
        { name: "HH không TH trên tờ khai thuế GTGT", default: "" }, { name: "Kho", default: "KMN" }, { name: "TK giá vốn", default: "632" },
        { name: "TK Kho", default: "1561" }, { name: "Đơn giá vốn", default: "" }, { name: "Tiền vốn", default: "" }, { name: "Hàng hóa giữ hộ/bán hộ", default: "" }
    ];

    const formatDateShortFromStr = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "";
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear().toString().slice(-2);
        return `${d}${m}${y}`;
    };

    const getCellValue = (item, colName) => {
        const ngayStr = item.ngay ? item.ngay.split(' ')[0] : '';
        const formatNgayVN = (s) => {
            if (!s) return '';
            const parts = s.split('-');
            if (parts.length !== 3) return s;
            const y = parts[0];
            const m = parts[1].padStart(2, '0');
            const d = parts[2].padStart(2, '0');
            return `${d}/${m}/${y}`;
        };
        const ngayVN = formatNgayVN(ngayStr);

        if (colName === "Ngày hạch toán (*)" || colName === "Ngày chứng từ (*)") return ngayVN;

        if (colName === "Số chứng từ (*)" || colName === "Số phiếu xuất") {
            let prefix = "";
            const san = (item.san || "").toLowerCase().trim();
            const kh = (item.khung_h || "").toUpperCase().trim();

            if (san === "shopee") prefix = (kh === "10H" ? "N " : "") + "SPE";
            else if (san === "lazada") prefix = "LDZ";
            else if (san === "best") prefix = "BEST";
            else if (san === "tiktok") prefix = "TT";
            else if (san === "đơn ngoài") prefix = "XDN";

            const mg = (item.ma_gian || "").trim();
            const nf = formatDateShortFromStr(ngayStr);
            const suffix = (item.mien || "MN").toUpperCase();
            return prefix && mg && nf ? `${prefix}-${mg}-${nf}.${suffix}` : "";
        }

        if (colName === "Mã đơn hàng") return (item.mdh && item.mvd) ? `${item.mdh}/${item.mvd}` : (item.mdh || item.mvd || "");
        if (colName === "Mã khách hàng") return item.ma_gian || "";
        if (colName === "Diễn giải") {
            const san = (item.san || "").trim();
            const kh = (item.khung_h || "").toUpperCase().trim();
            const mien = (item.mien || "").trim();
            const p = (san === "ĐƠN NGOÀI") ? " " : (kh === "10H" ? " NOW " : " ");
            return `${mien}${p}${san} NGÀY ${ngayVN}`;
        }

        if (colName === "Mã hàng (*)") return item.id_sp || "";
        if (colName === "Số lượng") return item.slg_xuat || "";
        if (colName === "Đơn giá") return (parseFloat(item.don_gia_1) || 0).toString();
        if (colName === "Thành tiền") return ((parseFloat(item.don_gia_1) || 0) * (parseFloat(item.slg_xuat) || 0)).toString();
        if (colName === "Kho") return "K" + (item.mien || "").toUpperCase();

        const ex = extraColumns.find(c => c.name === colName);
        return ex ? ex.default : "";
    };

    upmisaData = [];

    // Sắp xếp udctData theo ngày giảm dần (mới nhất lên đầu) trước khi build
    const sortedUdct = [...udctData].sort((a, b) => {
        const da = a.ngay ? new Date(a.ngay) : new Date(0);
        const db = b.ngay ? new Date(b.ngay) : new Date(0);
        return db - da;
    });

    sortedUdct.forEach(item => {
        if (item.trang_thai && item.trang_thai.toUpperCase().includes("HỦY")) return;

        const upmisaRow = extraColumns.map(col => getCellValue(item, col.name));
        upmisaData.push(upmisaRow);
    });

    renderUpmisaTable();
}

let upmisaCurrentPage = 1;
let filteredUpmisa = [];

function renderUpmisaTable(page = 1) {
    const tbody = document.getElementById('upmisaTableBody');
    const searchVal = document.getElementById('upmisaSearchInput').value.toLowerCase();
    const dateVal = document.getElementById('upmisaDateFilter').value;
    const rowsPerPage = parseInt(document.getElementById('upmisaRowsPerPage').value);

    // 1. Filtering
    let filtered = upmisaData;
    if (dateVal) {
        const [y, m, d] = dateVal.split('-');
        const dateVN = `${d}/${m}/${y}`;
        filtered = filtered.filter(row => row[6] === dateVN);
    }
    if (searchVal) {
        filtered = filtered.filter(row =>
            row.some(cell => cell.toString().toLowerCase().includes(searchVal))
        );
    }

    // 2. Sorting (Date DESC -> Thành tiền ASC)
    filtered.sort((a, b) => {
        const parseDate = (dstr) => {
            if (!dstr) return '';
            const parts = dstr.split('/');
            if (parts.length === 3) return `${parts[2]}${parts[1].padStart(2, '0')}${parts[0].padStart(2, '0')}`;
            return dstr;
        };
        const dateA = parseDate(a[6] || '');
        const dateB = parseDate(b[6] || '');
        if (dateA !== dateB) return dateB.localeCompare(dateA);

        const ttA = parseFloat((a[31] || '').toString().replace(/,/g, '')) || 0;
        const ttB = parseFloat((b[31] || '').toString().replace(/,/g, '')) || 0;
        return ttA - ttB;
    });
    filteredUpmisa = filtered;

    // 3. Pagination
    const totalRows = filteredUpmisa.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
    upmisaCurrentPage = Math.min(page, totalPages);

    const start = (upmisaCurrentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginated = filteredUpmisa.slice(start, end);

    // Update Stats
    document.getElementById('upmisaStatsText').textContent = `Hiển thị: ${paginated.length}/${totalRows} dòng (Tổng: ${upmisaData.length})`;
    document.getElementById('upmisaPageInfo').textContent = `Trang ${upmisaCurrentPage} / ${totalPages}`;
    document.getElementById('upmisaPrevBtn').disabled = upmisaCurrentPage <= 1;
    document.getElementById('upmisaNextBtn').disabled = upmisaCurrentPage >= totalPages;

    if (!paginated.length) {
        tbody.innerHTML = '<tr><td colspan="50" class="text-center py-8 text-slate-500">Không có dữ liệu phù hợp</td></tr>';
        return;
    }

    tbody.innerHTML = paginated.map(row => `
                <tr class="border-b border-slate-100 hover:bg-slate-50">
                    ${row.map(cell => `<td class="px-3 py-2 text-[13px] text-slate-900">${cell || '-'}</td>`).join('')}
                </tr>
            `).join('');
}

function changeUpmisaPage(delta) {
    renderUpmisaTable(upmisaCurrentPage + delta);
}

function refreshUpmisaData() {
    buildUpmisaData();
    showToast('Đã làm mới dữ liệu UPMISA!', 'success');
}

function exportUpmisaToExcel() {
    if (!filteredUpmisa || !filteredUpmisa.length) {
        alert('Không có dữ liệu hợp lệ để xuất!');
        return;
    }

    const headers = [
        'Hiển thị trên sổ', 'Hình thức bán hàng', 'Phương thức thanh toán', 'Kiêm phiếu xuất kho',
        'Lập kèm hóa đơn', 'Đã lập hóa đơn', 'Ngày hạch toán (*)', 'Ngày chứng từ (*)', 'Số chứng từ (*)',
        'Số phiếu xuất', 'Lý do xuất', 'Số hóa đơn', 'Ngày hóa đơn', 'Mã đơn hàng', 'Mã thống kê',
        'Mã khách hàng', 'Tên khách hàng', 'Địa chỉ', 'Mã số thuế', 'Diễn giải', 'Nộp vào TK',
        'NV bán hàng', 'Mã hàng (*)', 'Tên hàng', 'Hàng khuyến mại', 'TK Tiền/Chi phí/Nợ (*)',
        'TK Doanh thu/Có (*)', 'ĐVT', 'Số lượng', 'Đơn giá sau thuế', 'Đơn giá', 'Thành tiền',
        'Tỷ lệ CK (%)', 'Tiền chiết khấu', 'TK chiết khấu', 'Giá tính thuế XK', '% thuế XK',
        'Tiền thuế XK', 'TK thuế XK', '% thuế GTGT', 'Tiền thuế GTGT', 'TK thuế GTGT',
        'HH không TH trên tờ khai thuế GTGT', 'Kho', 'TK giá vốn', 'TK Kho', 'Đơn giá vốn',
        'Tiền vốn', 'Hàng hóa giữ hộ/bán hộ'
    ];

    const excelData = [headers, ...filteredUpmisa];
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'UPMISA');
    const filterDate = document.getElementById('upmisaDateFilter')?.value || 'TatCa';
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + 'h' + now.getMinutes().toString().padStart(2, '0');
    XLSX.writeFile(wb, `UPMISA_${filterDate}_${timeStr}.xlsx`);
}

function changeUpmisaDate(step) {
    const dateInput = document.getElementById('upmisaDateFilter');
    if (!dateInput.value) {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${y}-${m}-${d}`;
    } else {
        const parts = dateInput.value.split('-');
        if (parts.length === 3) {
            const currentDate = new Date(parts[0], parts[1] - 1, parts[2]);
            currentDate.setDate(currentDate.getDate() + step);
            const y = currentDate.getFullYear();
            const m = String(currentDate.getMonth() + 1).padStart(2, '0');
            const d = String(currentDate.getDate()).padStart(2, '0');
            dateInput.value = `${y}-${m}-${d}`;
        }
    }
    renderUpmisaTable(1);
}


    Object.assign(window.AppModules = window.AppModules || {}, { ['upmisa']: true });
    window.buildUpmisaData = buildUpmisaData;
    window.renderUpmisaTable = renderUpmisaTable;
    window.changeUpmisaPage = changeUpmisaPage;
    window.refreshUpmisaData = refreshUpmisaData;
    window.exportUpmisaToExcel = exportUpmisaToExcel;
    window.changeUpmisaDate = changeUpmisaDate;
})();
