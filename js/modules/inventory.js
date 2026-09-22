// inventory - Module Pattern (IIFE)
(function () {
let inventoryCurrentPage = 1;
const INVENTORY_PER_PAGE = 100;
let filteredInventoryData = [];
let inventorySortCol = 'ton_cuoi';
let inventorySortDir = 'desc';

function computeInventoryCalculations() {
    const ledgerSums = {};
    if (typeof dhctData !== 'undefined' && dhctData && dhctData.length > 0) {
        dhctData.forEach(item => {
            let idTonKho = (item.id_ton_kho || '').trim();
            if (!idTonKho) {
                const khoVal = (item.kho || 'KHO').trim();
                const spCtVal = (item.id_sp_ct || '').trim();
                if (spCtVal) {
                    idTonKho = `${khoVal} | ${spCtVal}`;
                }
            }
            if (!idTonKho) return;

            const isConfirmed = (item.xac_nhan || '').trim() === 'ĐÃ XÁC NHẬN';
            if (!isConfirmed) return;

            const loai = (item.truong || '').trim().toUpperCase();

            if (!ledgerSums[idTonKho]) ledgerSums[idTonKho] = { nhap: 0, xuat: 0 };
            const sl = parseFloat(item.so_luong) || 0;

            if (loai === 'NHẬP') ledgerSums[idTonKho].nhap += sl;
            else if (loai === 'XUẤT') ledgerSums[idTonKho].xuat += sl;
        });
    }

    if (inventoryData) {
        inventoryData.forEach(row => {
            row.nhap = ledgerSums[row.id]?.nhap || 0;
            row.xuat = ledgerSums[row.id]?.xuat || 0;
            row.ton_cuoi = row.ton_dau + row.nhap - row.xuat;
        });
    }
}

function sortInventoryData() {
    if (!filteredInventoryData) return;
    filteredInventoryData.sort((a, b) => {
        let valA = a[inventorySortCol];
        let valB = b[inventorySortCol];
        
        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return inventorySortDir === 'asc' ? -1 : 1;
        if (valA > valB) return inventorySortDir === 'asc' ? 1 : -1;
        return 0;
    });
}

// Logic module Tồn Kho
async function fetchInventoryData() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden');

    try {
        const token = await getAccessToken();
        const urlInventory = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${CONFIG.inventorySheetName}!A:K`;
        const urlDHCT = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${CONFIG.dhctSheetName}!A:P`;

        const [respInv, respDHCT] = await Promise.all([
            fetch(urlInventory, { headers: { "Authorization": `Bearer ${token}` } }),
            fetch(urlDHCT, { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        const resultInv = await respInv.json();
        const resultDHCT = await respDHCT.json();

        // Xử lý Ledger (DH_CT) - Sử dụng đúng cấu trúc chuẩn của dhctData
        if (resultDHCT.values && resultDHCT.values.length > 0) {
            dhctData = resultDHCT.values.slice(1).map((row, idx) => ({
                rowIndex: idx + 2,
                id_dh_ct: (row[0] || '').toString().trim(),
                id_dh: row[1],
                ngay: row[2],
                truong: (row[3] || '').toString().trim(),
                ncc: row[4],
                kho: (row[5] || 'KHO').toString().trim(),
                id_sp_ct: (row[6] || '').toString().trim(),
                id_sp: row[7],
                ten: row[8],
                so_luong: parseFloat(row[9]) || 0,
                gia_nhap: parseFloat(row[10]) || 0,
                thanh_tien_nhap: row[11],
                so_luong_2: row[12],
                id_ton_kho: (row[13] || '').toString().trim(),
                xac_nhan: row[14]
            }));
        }

        if (resultInv.values && resultInv.values.length > 0) {
            inventoryData = resultInv.values.slice(1).map((row, idx) => ({
                rowIndex: idx + 2,
                id: (row[0] || '').toString().trim(),
                kho: (row[1] || '').toString().trim(),
                id_sp_ct: (row[2] || '').toString().trim(),
                id_sp: (row[3] || '').toString().trim(),
                ten_sp: (row[4] || '').toString().trim(),
                ton_dau: parseFloat(row[5]) || 0
            }));
            
            computeInventoryCalculations();
            inventoryCurrentPage = 1;
            filterInventory();
        } else {
            document.getElementById('inventoryTableBody').innerHTML = '<tr><td colspan="7" class="text-center py-8 text-slate-500">Không có dữ liệu tồn kho.</td></tr>';
        }
    } catch (err) {
        console.error("Lỗi tải tồn kho:", err);
        alert("Không thể tải dữ liệu tồn kho.");
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

function renderInventory() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    const totalRows = filteredInventoryData.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / INVENTORY_PER_PAGE));
    inventoryCurrentPage = Math.min(inventoryCurrentPage, totalPages);
    if (inventoryCurrentPage < 1) inventoryCurrentPage = 1;

    const start = (inventoryCurrentPage - 1) * INVENTORY_PER_PAGE;
    const paginated = filteredInventoryData.slice(start, start + INVENTORY_PER_PAGE);

    document.getElementById('inventoryStatsText').textContent = `Hiển thị: ${paginated.length}/${totalRows} sản phẩm (Tổng: ${inventoryData.length})`;
    document.getElementById('inventoryPageInfo').textContent = `Trang ${inventoryCurrentPage} / ${totalPages}`;
    document.getElementById('inventoryPrevBtn').disabled = inventoryCurrentPage <= 1;
    document.getElementById('inventoryNextBtn').disabled = inventoryCurrentPage >= totalPages;

    if (paginated.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center py-8 text-slate-500">Không tìm thấy dữ liệu phù hợp.</td></tr>';
        return;
    }

    tbody.innerHTML = paginated.map(row => {
        return `
            <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td class="px-3 py-2 text-sm text-slate-700">${row.id}</td>
                <td class="px-3 py-2 text-sm text-slate-700 cursor-pointer" ondblclick="window.enableInventoryEdit(this, ${row.rowIndex}, 'kho', '${(row.kho||'').replace(/'/g, "\\'")}')" title="Click đúp để sửa">${row.kho}</td>
                <td class="px-3 py-2 text-sm font-semibold text-slate-900 cursor-pointer" ondblclick="window.enableInventoryEdit(this, ${row.rowIndex}, 'id_sp_ct', '${(row.id_sp_ct||'').replace(/'/g, "\\'")}')" title="Click đúp để sửa">${row.id_sp_ct}</td>
                <td class="px-3 py-2 text-sm text-slate-700 cursor-pointer" ondblclick="window.enableInventoryEdit(this, ${row.rowIndex}, 'id_sp', '${(row.id_sp||'').replace(/'/g, "\\'")}')" title="Click đúp để sửa">${row.id_sp}</td>
                <td class="px-3 py-2 text-sm text-slate-700 cursor-pointer" ondblclick="window.enableInventoryEdit(this, ${row.rowIndex}, 'ten_sp', '${(row.ten_sp||'').replace(/'/g, "\\'")}')" title="Click đúp để sửa">${row.ten_sp}</td>
                <td class="px-3 py-2 text-sm text-right cursor-pointer" ondblclick="window.enableInventoryEdit(this, ${row.rowIndex}, 'ton_dau', ${row.ton_dau})" title="Click đúp để sửa">${row.ton_dau}</td>
                <td class="px-3 py-2 text-sm text-right text-emerald-600 font-medium">+${(row.nhap || 0).toLocaleString('vi-VN')}</td>
                <td class="px-3 py-2 text-sm text-right text-rose-500 font-medium">-${(row.xuat || 0).toLocaleString('vi-VN')}</td>
                <td class="px-3 py-2 text-sm text-right font-bold text-slate-900">${(row.ton_cuoi || 0).toLocaleString('vi-VN')}</td>
            </tr>
        `;
    }).join('');
}

function filterInventory() {
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase().trim();

    filteredInventoryData = inventoryData.filter(row => {
        const idSpCt = (row.id_sp_ct || '').toLowerCase();
        const tenSp = (row.ten_sp || '').toLowerCase();
        // Tìm theo id_sp_ct hoặc (tên + id_sp_ct)
        return idSpCt.includes(searchTerm) || (tenSp + " " + idSpCt).includes(searchTerm);
    });

    sortInventoryData();
    inventoryCurrentPage = 1;
    renderInventory();
}

window.sortInventoryBy = function(col) {
    if (inventorySortCol === col) {
        inventorySortDir = inventorySortDir === 'asc' ? 'desc' : 'asc';
    } else {
        inventorySortCol = col;
        inventorySortDir = 'asc';
    }
    
    const headers = document.querySelectorAll('#inventoryTableHead th');
    headers.forEach(th => {
        const span = th.querySelector('.sort-icon');
        if (span) {
            span.innerHTML = '⇅';
            span.classList.remove('text-primary', 'font-bold');
            span.classList.add('text-slate-400');
        }
    });

    const activeTh = document.getElementById(`inv_th_${col}`);
    if (activeTh) {
        const activeSpan = activeTh.querySelector('.sort-icon');
        if (activeSpan) {
            activeSpan.innerHTML = inventorySortDir === 'asc' ? '↑' : '↓';
            activeSpan.classList.remove('text-slate-400');
            activeSpan.classList.add('text-primary', 'font-bold');
        }
    }

    sortInventoryData();
    inventoryCurrentPage = 1;
    renderInventory();
};

window.enableInventoryEdit = function(tdElement, rowIndex, colKey, currentValue) {
    if (tdElement.querySelector('input')) return;
    
    tdElement.innerHTML = `<input type="text" value="${currentValue}" onblur="window.saveInventoryEdit(this, ${rowIndex}, '${colKey}')" onkeydown="if(event.key==='Enter') this.blur()" class="w-full min-w-[80px] px-2 py-1 border border-primary/50 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-center" />`;
    
    const input = tdElement.querySelector('input');
    input.focus();
    input.select();
};

window.saveInventoryEdit = async function(inputElement, rowIndex, colKey) {
    const newValue = inputElement.value;
    const tdElement = inputElement.parentElement;
    
    let finalValue = newValue;
    if (colKey === 'ton_dau') finalValue = parseFloat(newValue) || 0;
    
    tdElement.innerHTML = finalValue;
    
    const item = inventoryData.find(r => r.rowIndex === rowIndex);
    if (!item) return;

    if (item[colKey] === finalValue) return;
    
    item[colKey] = finalValue;
    
    if (colKey === 'ton_dau') {
        item.ton_cuoi = item.ton_dau + (item.nhap || 0) - (item.xuat || 0);
    }

    try {
        const colMap = { 'id': 1, 'kho': 2, 'id_sp_ct': 3, 'id_sp': 4, 'ten_sp': 5, 'ton_dau': 6 };
        const colIndex = colMap[colKey];
        
        await window.updateSheetCell(CONFIG.inventorySheetName, rowIndex, colIndex, finalValue);
        
        if (colKey === 'ton_dau') {
            sortInventoryData();
            renderInventory();
        }
    } catch (err) {
        console.error("Lỗi khi cập nhật ô:", err);
        alert("Có lỗi xảy ra khi lưu dữ liệu!");
    }
};

    window.enableInventoryEdit = window.enableInventoryEdit;
    window.saveInventoryEdit = window.saveInventoryEdit;
    window.sortInventoryBy = window.sortInventoryBy;

function changeInventoryPage(delta) {
    inventoryCurrentPage += delta;
    renderInventory();
}

window.downloadInventoryTemplate = function() {
    const ws_data = [
        ["Mã Tồn Kho (ID)", "Kho", "ID SP CT", "ID SP", "Tên Sản Phẩm", "Tồn đầu"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TON_KHO_Template");
    XLSX.writeFile(wb, `Template_Ton_Kho.xlsx`);
};

window.exportInventoryToExcel = function() {
    if (!inventoryData || inventoryData.length === 0) {
        alert("Không có dữ liệu để xuất!");
        return;
    }
    const ws_data = [["Mã Tồn Kho (ID)", "Kho", "ID SP CT", "ID SP", "Tên Sản Phẩm", "Tồn đầu"]];
    inventoryData.forEach(item => {
        ws_data.push([
            item.id || '',
            item.kho || '',
            item.id_sp_ct || '',
            item.id_sp || '',
            item.ten_sp || '',
            item.ton_dau || 0
        ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TON_KHO");
    
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    XLSX.writeFile(wb, `Ton_Kho_${dateStr}.xlsx`);
};

window.uploadInventoryExcel = async function(files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        try {
            loadingOverlay.classList.remove('hidden');

            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length <= 1) {
                alert("File không có dữ liệu hợp lệ!");
                loadingOverlay.classList.add('hidden');
                return;
            }

            const updateList = [];
            const appendList = [];

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || row.length === 0) continue;
                
                const maTonKho = (row[0] || '').toString().trim();
                if (!maTonKho) continue; // Bỏ qua dòng không có ID
                
                const kho = (row[1] || '').toString().trim();
                const idSpCt = (row[2] || '').toString().trim().toUpperCase();
                const idSp = (row[3] || '').toString().trim().toUpperCase();
                const tenSp = (row[4] || '').toString().trim();
                const tonDau = parseFloat(row[5]) || 0;

                const existingItem = inventoryData.find(item => item.id === maTonKho);
                
                if (existingItem) {
                    updateList.push({
                        rowIndex: existingItem.rowIndex,
                        data: [maTonKho, kho, idSpCt, idSp, tenSp, tonDau]
                    });
                } else {
                    appendList.push([maTonKho, kho, idSpCt, idSp, tenSp, tonDau]);
                }
            }

            let updatedCount = 0;
            // Cập nhật các dòng đã tồn tại
            if (updateList.length > 0) {
                for (const item of updateList) {
                    await window.updateSheetRow(CONFIG.inventorySheetName, item.rowIndex, item.data);
                    updatedCount++;
                }
            }

            // Thêm mới các dòng chưa có
            if (appendList.length > 0) {
                await window.appendSheetData(CONFIG.inventorySheetName, appendList);
            }

            alert(`Hoàn tất! Đã cập nhật ${updatedCount} dòng và thêm mới ${appendList.length} dòng.`);
            
            // Tải lại dữ liệu
            await fetchInventoryData();
        } catch (err) {
            console.error("Lỗi upload Excel tồn kho:", err);
            alert("Có lỗi xảy ra khi xử lý file: " + err.message);
        } finally {
            document.getElementById('inventoryExcelUpload').value = "";
            loadingOverlay.classList.add('hidden');
        }
    };
    reader.readAsArrayBuffer(file);
};


    Object.assign(window.AppModules = window.AppModules || {}, { ['inventory']: true });
    window.fetchInventoryData = fetchInventoryData;
    window.renderInventory = renderInventory;
    window.filterInventory = filterInventory;
    window.changeInventoryPage = changeInventoryPage;
})();
