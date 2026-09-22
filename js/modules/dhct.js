// dhct - Module Pattern (IIFE)
(function () {
// Logic module DH_CT
async function fetchDHCTData(silent = false) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (!silent && loadingOverlay) loadingOverlay.classList.remove('hidden');

    try {
        const token = await getAccessToken();
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${CONFIG.dhctSheetName}!A:P`;

        const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || `HTTP ${response.status}`);
        }

        const result = await response.json();
        if (result.values && result.values.length > 0) {
            dhctData = result.values.slice(1).map((row, idx) => ({
                rowIndex: idx + 2,
                id_dh_ct: (row[0] || '').toString().trim(),
                id_dh: row[1], // Cột B
                ngay: row[2],  // Cột C
                truong: row[3], // Cột D
                ncc: row[4],    // Cột E
                kho: row[5],     // Cột F
                id_sp_ct: row[6], // Cột G
                id_sp: row[7], // Cột H
                ten: row[8],     // Cột I
                so_luong: row[9], // Cột J
                gia_nhap: row[10],  // Cột K
                thanh_tien_nhap: row[11], // Cột L
                so_luong_2: row[12], // Cột M
                id_ton_kho: row[13], // Cột N
                xac_nhan: row[14] // Cột O
            }));
            if (silent) {
                // Cập nhật bảng nếu không đang mở drawer
                const isDHCTModule = pageTitle.textContent === 'Dữ liệu DH Chi Tiết' || pageTitle.textContent === 'Đơn hàng trên DH Chi Tiết' || pageTitle.textContent === 'Đơn hàng chi tiết';
                const isDHTongModule = pageTitle.textContent === 'Đơn hàng';
                if (isDHCTModule) {
                    renderDHCTTable();
                    renderUniqueDHCTTable();
                }
                if (isDHTongModule) {
                    renderDonhangTongTable();
                }
            } else {
                renderDHCTTable();
                renderUniqueDHCTTable();
                renderDonhangTongTable();
            }
        } else {
            document.getElementById('dhctTableBody').innerHTML = '<tr><td colspan="9" class="text-center py-8 text-slate-500">Không có dữ liệu.</td></tr>';
        }
    } catch (err) {
        console.error("Lỗi tải DH_CT:", err);
        alert("Không thể tải dữ liệu từ sheet DH_CT: " + err.message);
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
}

function renderDHCTTable() {
    const searchInput = document.getElementById('filterDHCTSearch');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    const fromDateInput = document.getElementById('filterDHCTFromDate');
    const toDateInput = document.getElementById('filterDHCTToDate');
    const nccInput = document.getElementById('filterDHCTNcc');
    
    const fromDate = fromDateInput && fromDateInput.value ? fromDateInput.value : '';
    const toDate = toDateInput && toDateInput.value ? toDateInput.value : '';
    const nccSearch = nccInput ? nccInput.value.toLowerCase().trim() : '';

    const tableBody = document.getElementById('dhctTableBody');
    if (!tableBody) return;

    const filtered = dhctData.filter(item => {
        const matchSearch = (item.id_dh && item.id_dh.toString().toLowerCase().includes(searchTerm)) ||
            (item.ten && item.ten.toLowerCase().includes(searchTerm)) ||
            (item.id_sp_ct && item.id_sp_ct.toString().toLowerCase().includes(searchTerm));
            
        const itemYMD = toYMD(item.ngay);
        const matchFromDate = !fromDate || itemYMD >= fromDate;
        const matchToDate = !toDate || itemYMD <= toDate;
        const matchNcc = !nccSearch || (item.ncc && item.ncc.toLowerCase().includes(nccSearch));
        
        return matchSearch && matchFromDate && matchToDate && matchNcc;
    }).sort((a, b) => {
        // 1. Ngày lớn tới bé
        const da = toYMD(a.ngay);
        const db = toYMD(b.ngay);
        if (da !== db) return db.localeCompare(da);
        
        // 2. Trường xuất trước nhập sau ("XUẤT" < "NHẬP")
        const truongA = a.truong || '';
        const truongB = b.truong || '';
        if (truongA !== truongB) {
            if (truongA === 'XUẤT') return -1;
            if (truongB === 'XUẤT') return 1;
            return truongB.localeCompare(truongA);
        }
        
        // 3. NCC a-z
        const nccA = a.ncc || '';
        const nccB = b.ncc || '';
        if (nccA !== nccB) return nccA.localeCompare(nccB);
        
        // 4. ID SP CT a-z
        const idSpCtA = a.id_sp_ct || '';
        const idSpCtB = b.id_sp_ct || '';
        return idSpCtA.localeCompare(idSpCtB);
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="11" class="text-center py-8 text-slate-500">Không tìm thấy kết quả phù hợp.</td></tr>';
        return;
    }

    // Calculate Tồn Lũy Kế globally
    const cumulativeMapAll = {}; 
    const cumulativeMapConfirmed = {}; 
    if (typeof sanphamData !== 'undefined') {
        const sortedData = [...dhctData].sort((a, b) => {
            const da = toYMD(a.ngay);
            const db = toYMD(b.ngay);
            if (da !== db) return db.localeCompare(da);
            
            const truongA = a.truong || '';
            const truongB = b.truong || '';
            if (truongA !== truongB) {
                if (truongA === 'XUẤT') return -1;
                if (truongB === 'XUẤT') return 1;
                return truongB.localeCompare(truongA);
            }
            
            const nccA = a.ncc || '';
            const nccB = b.ncc || '';
            if (nccA !== nccB) return nccA.localeCompare(nccB);
            
            const idSpCtA = a.id_sp_ct || '';
            const idSpCtB = b.id_sp_ct || '';
            return idSpCtA.localeCompare(idSpCtB);
        }).reverse();

        sanphamData.forEach(sp => {
            if (sp.sku_con) {
                const tonDau = parseFloat(sp.ton_dau) || 0;
                cumulativeMapAll[sp.sku_con.toLowerCase()] = tonDau;
                cumulativeMapConfirmed[sp.sku_con.toLowerCase()] = tonDau;
            }
        });

        sortedData.forEach(item => {
            const id = (item.id_sp_ct || '').toLowerCase();
            if (id) {
                if (cumulativeMapAll[id] === undefined) cumulativeMapAll[id] = 0;
                if (cumulativeMapConfirmed[id] === undefined) cumulativeMapConfirmed[id] = 0;
                
                const sl = parseFloat(item.so_luong) || 0;
                const isConfirmed = item.xac_nhan === 'ĐÃ XÁC NHẬN';
                
                if (item.truong === 'NHẬP') {
                    cumulativeMapAll[id] += sl;
                    if (isConfirmed) cumulativeMapConfirmed[id] += sl;
                } else if (item.truong === 'XUẤT') {
                    cumulativeMapAll[id] -= sl;
                    if (isConfirmed) cumulativeMapConfirmed[id] -= sl;
                }
                
                item._tonLuyKeAll = cumulativeMapAll[id];
                item._tonLuyKeConfirmed = cumulativeMapConfirmed[id];
            }
        });
    }

    tableBody.innerHTML = filtered.map(item => `
                <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer" ondblclick="window.openDhctModal('${item.id_dh}')" title="Nhấn đúp để sửa hoặc thêm SP">
                    <td class="px-4 py-3 text-sm text-slate-600">${item.ngay || ''}</td>
                    <td class="px-4 py-3 text-sm text-slate-600">${item.truong || ''}</td>
                    <td class="px-4 py-3 text-sm text-slate-600">${item.ncc || ''}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-slate-900">${item.id_sp_ct || ''}</td>
                    <td class="px-4 py-3 text-sm text-slate-600">${item.id_sp || ''}</td>
                    <td class="px-4 py-3 text-sm text-slate-700">${item.ten || ''}</td>
                    <td class="px-4 py-3 text-sm text-right font-bold text-slate-900">${(parseFloat(item.so_luong) || 0).toLocaleString('vi-VN')}</td>
                    <td class="px-4 py-3 text-sm text-right text-slate-600">${(parseFloat(item.gia_nhap) || 0).toLocaleString('vi-VN')} đ</td>
                    <td class="px-4 py-3 text-sm text-right font-bold text-primary">${(parseFloat(item.thanh_tien_nhap) || 0).toLocaleString('vi-VN')} đ</td>
                    <td class="px-4 py-3 text-sm font-medium">
                        ${item.id_sp_ct ? `<button onclick="event.stopPropagation(); window.toggleConfirmRow('${item.id_dh_ct}', '${item.xac_nhan}')" class="px-2 py-1 rounded text-[11px] font-bold transition-colors border ${item.xac_nhan === 'ĐÃ XÁC NHẬN' ? 'border-green-600 text-green-600 hover:bg-green-50' : 'border-amber-500 text-amber-500 hover:bg-amber-50'}">${item.xac_nhan === 'ĐÃ XÁC NHẬN' ? 'ĐÃ XÁC NHẬN' : 'CHỜ XÁC NHẬN'}</button>` : `<span class="text-slate-400 italic text-[11px]">Không có SP CT</span>`}
                    </td>
                    <td class="px-4 py-3 text-sm text-right font-bold text-indigo-700 bg-indigo-50/10 border-l border-indigo-50">
                        <span class="text-indigo-400 font-medium mr-1">( ${(item._tonLuyKeAll || 0).toLocaleString('vi-VN')} )</span>
                        ${(item._tonLuyKeConfirmed || 0).toLocaleString('vi-VN')}
                    </td>
                </tr>
            `).join('');
}

window.renderDonhangTongTable = function() {
    const searchInput = document.getElementById('filterDHTongSearch');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    const fromDateInput = document.getElementById('filterDHTongFromDate');
    const toDateInput = document.getElementById('filterDHTongToDate');
    const nccInput = document.getElementById('filterDHTongNcc');
    
    const fromDate = fromDateInput && fromDateInput.value ? fromDateInput.value : '';
    const toDate = toDateInput && toDateInput.value ? toDateInput.value : '';
    const nccSearch = nccInput ? nccInput.value.toLowerCase().trim() : '';

    const tableBody = document.getElementById('dhTongTableBody');
    if (!tableBody) return;

    if (!dhctData || dhctData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-500">Chưa tải dữ liệu...</td></tr>';
        return;
    }

    // Group by id_dh
    const grouped = {};
    dhctData.forEach(item => {
        if (!item.id_dh) return;
        
        const itemYMD = toYMD(item.ngay);
        const matchFromDate = !fromDate || itemYMD >= fromDate;
        const matchToDate = !toDate || itemYMD <= toDate;
        const matchNcc = !nccSearch || (item.ncc && item.ncc.toLowerCase().includes(nccSearch));
        const matchSearch = !searchTerm || item.id_dh.toString().toLowerCase().includes(searchTerm);
        
        if (matchFromDate && matchToDate && matchNcc && matchSearch) {
            if (!grouped[item.id_dh]) {
                grouped[item.id_dh] = {
                    id_dh: item.id_dh,
                    ngay: item.ngay,
                    truong: item.truong,
                    ncc: item.ncc,
                    tong_tien: 0,
                    xac_nhan: 'ĐÃ XÁC NHẬN'
                };
            }
            grouped[item.id_dh].tong_tien += (parseFloat(item.thanh_tien_nhap) || 0);
            if (item.xac_nhan !== 'ĐÃ XÁC NHẬN') {
                grouped[item.id_dh].xac_nhan = 'CHỜ XÁC NHẬN';
            }
        }
    });

    const result = Object.values(grouped).sort((a, b) => {
        const da = toYMD(a.ngay);
        const db = toYMD(b.ngay);
        if (da !== db) return db.localeCompare(da);
        return a.id_dh.localeCompare(b.id_dh);
    });

    if (result.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-500">Không tìm thấy kết quả phù hợp.</td></tr>';
        return;
    }

    tableBody.innerHTML = result.map(item => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer" ondblclick="window.openDhctModal('${item.id_dh}')" title="Nhấn đúp để xem chi tiết">
            <td class="px-4 py-3 text-sm font-semibold text-slate-900">${item.id_dh || ''}</td>
            <td class="px-4 py-3 text-sm text-slate-600">${item.ngay || ''}</td>
            <td class="px-4 py-3 text-sm text-slate-600">${item.truong || ''}</td>
            <td class="px-4 py-3 text-sm text-slate-600">${item.ncc || ''}</td>
            <td class="px-4 py-3 text-sm text-right font-bold text-primary">${item.tong_tien.toLocaleString('vi-VN')} đ</td>
            <td class="px-4 py-3 text-sm text-center font-medium">
                <button onclick="event.stopPropagation(); window.toggleConfirmOrder('${item.id_dh}', '${item.xac_nhan}')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${item.xac_nhan === 'ĐÃ XÁC NHẬN' ? 'bg-green-50 border-green-600 text-green-600 hover:bg-green-100' : 'bg-amber-50 border-amber-500 text-amber-600 hover:bg-amber-100'}">${item.xac_nhan === 'ĐÃ XÁC NHẬN' ? 'ĐÃ XÁC NHẬN' : 'CHỜ XÁC NHẬN'}</button>
            </td>
        </tr>
    `).join('');
};

window.toggleConfirmRow = async function(id_dh_ct, currentStatus) {
    if (!id_dh_ct) return;
    const newStatus = currentStatus === 'ĐÃ XÁC NHẬN' ? 'CHỜ XÁC NHẬN' : 'ĐÃ XÁC NHẬN';
    const row = dhctData.find(r => r.id_dh_ct === id_dh_ct);
    if (!row) return;

    // Optimistic UI update
    row.xac_nhan = newStatus;
    if (document.getElementById('moduleDhct').style.display !== 'none') {
        renderDHCTTable();
    }
    if (document.getElementById('moduleDonhangTong').style.display !== 'none') {
        renderDonhangTongTable();
    }

    // Background API call
    window.updateSheetCell(CONFIG.dhctSheetName, row.rowIndex, 15, newStatus).catch(err => {
        console.error("Lỗi khi cập nhật trạng thái:", err);
        // Revert on error
        row.xac_nhan = currentStatus;
        if (document.getElementById('moduleDhct').style.display !== 'none') renderDHCTTable();
        if (document.getElementById('moduleDonhangTong').style.display !== 'none') renderDonhangTongTable();
        alert("Lỗi khi cập nhật trạng thái: " + err.message);
    });
};

window.toggleConfirmOrder = async function(id_dh, currentStatus) {
    if (!id_dh) return;
    const newStatus = currentStatus === 'ĐÃ XÁC NHẬN' ? 'CHỜ XÁC NHẬN' : 'ĐÃ XÁC NHẬN';
    
    const rowsToUpdate = dhctData.filter(r => r.id_dh === id_dh && r.id_sp_ct);
    if (rowsToUpdate.length === 0) return;

    // Optimistic UI update
    const previousStatuses = rowsToUpdate.map(r => r.xac_nhan);
    rowsToUpdate.forEach(r => r.xac_nhan = newStatus);

    if (document.getElementById('moduleDhct').style.display !== 'none') {
        renderDHCTTable();
    }
    if (document.getElementById('moduleDonhangTong').style.display !== 'none') {
        renderDonhangTongTable();
    }

    // Background API calls in parallel
    Promise.all(rowsToUpdate.map(row => 
        window.updateSheetCell(CONFIG.dhctSheetName, row.rowIndex, 15, newStatus)
    )).catch(err => {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
        // Revert on error
        rowsToUpdate.forEach((r, idx) => r.xac_nhan = previousStatuses[idx]);
        if (document.getElementById('moduleDhct').style.display !== 'none') renderDHCTTable();
        if (document.getElementById('moduleDonhangTong').style.display !== 'none') renderDonhangTongTable();
        alert("Lỗi khi cập nhật trạng thái đơn hàng: " + err.message);
    });
};

    window.downloadDHCTTemplate = function() {
        const ws_data = [
            ['Ngày', 'Trường', 'NCC', 'ID SP CT', 'SL']
        ];
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template_DHCT");
        XLSX.writeFile(wb, "Mau_Import_DHCT.xlsx");
    };

    window.exportDHCTToExcel = function() {
        if (!dhctData || dhctData.length === 0) return alert("Không có dữ liệu để xuất");
        
        const searchInput = document.getElementById('filterDHCTSearch');
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const fromDateInput = document.getElementById('filterDHCTFromDate');
        const toDateInput = document.getElementById('filterDHCTToDate');
        const nccInput = document.getElementById('filterDHCTNcc');
        
        const fromDate = fromDateInput && fromDateInput.value ? fromDateInput.value : '';
        const toDate = toDateInput && toDateInput.value ? toDateInput.value : '';
        const nccSearch = nccInput ? nccInput.value.toLowerCase().trim() : '';

        const filtered = dhctData.filter(item => {
            const matchSearch = (item.id_dh && item.id_dh.toString().toLowerCase().includes(searchTerm)) ||
                (item.ten && item.ten.toLowerCase().includes(searchTerm)) ||
                (item.id_sp_ct && item.id_sp_ct.toString().toLowerCase().includes(searchTerm));
                
            const itemYMD = toYMD(item.ngay);
            const matchFromDate = !fromDate || itemYMD >= fromDate;
            const matchToDate = !toDate || itemYMD <= toDate;
            const matchNcc = !nccSearch || (item.ncc && item.ncc.toLowerCase().includes(nccSearch));
            
            return matchSearch && matchFromDate && matchToDate && matchNcc;
        });

        const ws_data = [
            ['ID DH CT', 'ID DH', 'Ngày', 'Trường', 'NCC', 'Kho', 'ID SP CT', 'ID SP', 'Tên Sản Phẩm', 'Số lượng', 'Giá nhập', 'Thành tiền', 'Xác Nhận', 'Tồn Lũy Kế']
        ];
        filtered.forEach(item => {
            ws_data.push([
                item.id_dh_ct, item.id_dh, item.ngay, item.truong, item.ncc, item.kho, item.id_sp_ct, item.id_sp, item.ten, item.so_luong, item.gia_nhap, item.thanh_tien_nhap, item.xac_nhan, `( ${item._tonLuyKeAll || 0} ) ${item._tonLuyKeConfirmed || 0}`
            ]);
        });
        
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DHCT_Data");
        XLSX.writeFile(wb, "DHCT_Export.xlsx");
    };

    window.uploadDHCTExcelMain = async function(files) {
        if (!files || files.length === 0) return;
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.classList.remove('hidden');

        try {
            const file = files[0];
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { cellDates: true });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const excelData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });

            if (!excelData || excelData.length < 2) {
                alert("File không có dữ liệu!");
                return;
            }

            const headers = excelData[0].map(h => (h || '').toString().toLowerCase().trim());
            const findCol = (names) => headers.findIndex(h => names.some(n => h.includes(n)));

            const colIdx = {
                ngay: findCol(['ngay', 'ngày', 'date']),
                truong: findCol(['truong', 'trường']),
                ncc: findCol(['ncc']),
                id_sp_ct: findCol(['id_sp_ct', 'id sp ct']),
                sl: findCol(['sl', 'số lượng', 'so luong'])
            };

            if (colIdx.id_sp_ct === -1 || colIdx.sl === -1) {
                alert("File Excel thiếu cột ID SP CT hoặc SL.");
                return;
            }

            const rows = excelData.slice(1);
            const appendValues = [];
            const now = Date.now();
            const orderIdMap = {};

            rows.forEach((row, idx) => {
                const id_sp_ct = (row[colIdx.id_sp_ct] || '').toString().trim().toUpperCase();
                if (!id_sp_ct) return;

                let ngay = '';
                if (colIdx.ngay !== -1 && row[colIdx.ngay]) {
                    let val = row[colIdx.ngay];
                    if (typeof val === 'number') {
                        try {
                            const d = XLSX.SSF.parse_date_code(val);
                            ngay = `${String(d.d).padStart(2, '0')}/${String(d.m).padStart(2, '0')}/${d.y}`;
                        } catch (e) {
                            const dt = new Date(Math.round((val - 25569) * 86400 * 1000));
                            ngay = `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
                        }
                    } else if (val instanceof Date) {
                        ngay = `${String(val.getDate()).padStart(2, '0')}/${String(val.getMonth() + 1).padStart(2, '0')}/${val.getFullYear()}`;
                    } else {
                        ngay = String(val).trim();
                        if (ngay.includes('-')) ngay = ngay.replace(/-/g, '/');
                    }
                }
                if (!ngay) {
                    const d = new Date();
                    ngay = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                }

                const truong = colIdx.truong !== -1 && row[colIdx.truong] ? String(row[colIdx.truong]).trim() : '';
                const ncc = colIdx.ncc !== -1 && row[colIdx.ncc] ? String(row[colIdx.ncc]).trim() : '';
                const sl = parseFloat(row[colIdx.sl]) || 1;

                let ten = '';
                let gia = 0;
                let id_sp = '';
                
                if (typeof sanphamData !== 'undefined') {
                    const sp = sanphamData.find(s => (s.id_sp_ct || '').toLowerCase() === id_sp_ct.toLowerCase());
                    if (sp) {
                        ten = sp.ten || '';
                        gia = parseFloat(sp.gia_nhap) || 0;
                        id_sp = sp.id_sp || '';
                    }
                }

                const key = `${ngay} | ${truong} | ${ncc} | MB`;
                if (!orderIdMap[key]) {
                    orderIdMap[key] = key;
                }

                const id_dh = orderIdMap[key];
                const id_dh_ct = `${ngay} | ${truong} | ${ncc} | MB | KHO | ${id_sp_ct}`;
                const id_ton_kho = `KHO | ${id_sp_ct}`;

                appendValues.push([
                    id_dh_ct, id_dh, ngay, truong, ncc, 'KHO', id_sp_ct, id_sp, ten, sl, gia, sl * gia, '', id_ton_kho, 'CHỜ XÁC NHẬN'
                ]);
            });

            if (appendValues.length === 0) return alert("Không có dữ liệu hợp lệ để tải lên.");

            appendSheetData(CONFIG.dhctSheetName, appendValues).then(success => {
                if (success) {
                    alert(`Đã tải lên thành công ${appendValues.length} dòng!`);
                    fetchDHCTData();
                } else {
                    alert("Lỗi khi kết nối với Google Sheet.");
                }
            }).finally(() => {
                if (loadingOverlay) loadingOverlay.classList.add('hidden');
                document.getElementById('dhctExcelUploadInput').value = '';
            });
        } catch (err) {
            console.error("Lỗi upload DHCT:", err);
            alert("Lỗi: " + err.message);
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
            document.getElementById('dhctExcelUploadInput').value = '';
        }
    };

    Object.assign(window.AppModules = window.AppModules || {}, { ['dhct']: true });
    window.fetchDHCTData = fetchDHCTData;
    window.renderDHCTTable = renderDHCTTable;
})();
