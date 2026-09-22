// js/modules/dhct_form.js - Module Pattern
(function () {
    let dhctFormLines = [];

    // Cần gọi một lần khi app load để bind sự kiện nếu cần
    async function initDhctModal() {
        if (!sanphamData || sanphamData.length === 0) {
            if (window.loadSanphamData) await window.loadSanphamData();
        }
        if (!dhctData || dhctData.length === 0) {
            if (window.fetchDHCTData) await window.fetchDHCTData(true);
        }
        populateModalDatalists();
    }

    function populateModalDatalists() {
        const nccList = document.getElementById('dhctModalNccList');
        let nccSet = new Set(['HẰNG NGÀY']);
        if (dhctData && dhctData.length > 0) {
            dhctData.forEach(row => {
                if (row.ncc) nccSet.add(row.ncc.trim());
            });
        }
        if (nccList) {
            nccList.innerHTML = Array.from(nccSet).map(val => `<option value="${val}">`).join('');
        }

        const spList = document.getElementById('dhctModalIdSpCtList');
        if (sanphamData && sanphamData.length > 0 && spList) {
            spList.innerHTML = sanphamData.map(sp => `<option value="${sp.sku_con}">${sp.ten_sp}</option>`).join('');
        }
    }

    let deletedSheetRows = [];

    window.openDhctModal = async function(editIdDh = null) {
        await initDhctModal();
        
        // Reset form
        document.getElementById('dhctMultiForm').reset();
        dhctFormLines = [];
        deletedSheetRows = [];
        
        if (editIdDh && dhctData) {
            // Edit Mode
            const existingRows = dhctData.filter(r => r.id_dh === editIdDh);
            if (existingRows.length > 0) {
                const firstRow = existingRows[0];
                
                let formattedDate = "";
                if (firstRow.ngay) {
                    const parts = firstRow.ngay.split('/');
                    if (parts.length === 3) formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
                
                document.getElementById('dhctModalNgay').value = formattedDate || "";
                window.setDhctModalTruong(firstRow.truong || 'XUẤT');
                document.getElementById('dhctModalNcc').value = firstRow.ncc || '';
                document.getElementById('dhctModalKho').value = firstRow.kho || 'KHO';
                
                dhctFormLines = existingRows.map(row => ({
                    id: generateLineId(),
                    sheetRowIndex: row.rowIndex,
                    sku_con: row.id_sp_ct || '',
                    id_sp: row.id_sp || '',
                    ten_sp: row.ten || '',
                    so_luong: parseFloat(row.so_luong) || 0,
                    gia_nhap: parseFloat(row.gia_nhap) || 0,
                    thanh_tien: parseFloat(row.thanh_tien_nhap) || 0,
                    xac_nhan: row.xac_nhan || 'CHỜ XÁC NHẬN',
                    ton_lk: window.calculateTonLuyKe(row.id_sp_ct || '')
                }));
            }
        } else {
            // Default Mode
            const today = new Date();
            const d = String(today.getDate()).padStart(2, '0');
            const m = String(today.getMonth() + 1).padStart(2, '0');
            const y = today.getFullYear();
            document.getElementById('dhctModalNgay').value = `${y}-${m}-${d}`;
            window.setDhctModalTruong('XUẤT');
        }
        
        // Ensure at least 5 lines
        while (dhctFormLines.length < 5) {
            dhctFormLines.push({
                id: generateLineId(),
                sheetRowIndex: null,
                sku_con: '', id_sp: '', ten_sp: '', so_luong: 1, gia_nhap: 0, thanh_tien: 0, xac_nhan: 'CHỜ XÁC NHẬN', ton_lk: { all: 0, conf: 0 }
            });
        }
        
        renderDhctModalLines();
        
        // Show modal
        const overlay = document.getElementById('dhctPopupOverlay');
        const modal = document.getElementById('dhctPopupModal');
        overlay.classList.remove('hidden');
        modal.classList.remove('hidden');
        
        // Animate slide in
        setTimeout(() => {
            modal.classList.remove('translate-x-full');
            modal.classList.add('translate-x-0');
        }, 10);
    };

    window.closeDhctModal = function() {
        const overlay = document.getElementById('dhctPopupOverlay');
        const modal = document.getElementById('dhctPopupModal');
        
        modal.classList.remove('translate-x-0');
        modal.classList.add('translate-x-full');
        
        setTimeout(() => {
            overlay.classList.add('hidden');
            modal.classList.add('hidden');
        }, 300);
    };

    window.setDhctModalTruong = function(truong) {
        document.getElementById('dhctModalTruong').value = truong;
        const btnXuat = document.getElementById('btnModalTruongXuat');
        const btnNhap = document.getElementById('btnModalTruongNhap');
        
        if (btnXuat && btnNhap) {
            if (truong === 'XUẤT') {
                btnXuat.className = 'flex-1 text-sm font-bold rounded-md bg-white text-primary shadow-sm transition-all';
                btnNhap.className = 'flex-1 text-sm font-bold rounded-md text-slate-500 hover:text-slate-700 transition-all bg-transparent';
            } else {
                btnNhap.className = 'flex-1 text-sm font-bold rounded-md bg-white text-primary shadow-sm transition-all';
                btnXuat.className = 'flex-1 text-sm font-bold rounded-md text-slate-500 hover:text-slate-700 transition-all bg-transparent';
            }
        }
        
        // Re-calculate all lines in case giaNhap needs to be auto-filled
        dhctFormLines.forEach((_, i) => window.handleModalSpCtChange(i));
    };

    function generateLineId() {
        return Math.random().toString(36).substring(2, 9);
    }

    window.calculateTonLuyKe = function(skuCon) {
        if (!skuCon) return { all: 0, conf: 0 };
        let tonAll = 0;
        let tonConf = 0;
        const skuTrimmed = skuCon.toString().trim().toLowerCase();
        
        if (typeof sanphamData !== 'undefined') {
            const spCt = sanphamData.find(sp => (sp.sku_con || '').toString().trim().toLowerCase() === skuTrimmed);
            if (spCt) {
                const tonDau = parseFloat(spCt.ton_dau) || 0;
                tonAll = tonDau;
                tonConf = tonDau;
            }
        }
        
        if (typeof dhctData !== 'undefined') {
            dhctData.forEach(item => {
                if ((item.id_sp_ct || '').toString().trim().toLowerCase() === skuTrimmed) {
                    const sl = parseFloat(item.so_luong) || 0;
                    const isConfirmed = item.xac_nhan === 'ĐÃ XÁC NHẬN';
                    if (item.truong === 'NHẬP') {
                        tonAll += sl;
                        if (isConfirmed) tonConf += sl;
                    } else if (item.truong === 'XUẤT') {
                        tonAll -= sl;
                        if (isConfirmed) tonConf -= sl;
                    }
                }
            });
        }
        return { all: tonAll, conf: tonConf };
    };

    window.addDhctModalLine = function() {
        dhctFormLines.push({
            id: generateLineId(),
            sheetRowIndex: null,
            sku_con: '',
            id_sp: '',
            ten_sp: '',
            so_luong: 1,
            gia_nhap: 0,
            thanh_tien: 0,
            xac_nhan: 'CHỜ XÁC NHẬN',
            ton_lk: 0
        });
        renderDhctModalLines();
    };

    window.removeDhctModalLine = function(index) {
        if (dhctFormLines.length > 1) {
            const removed = dhctFormLines[index];
            if (removed.sheetRowIndex) {
                deletedSheetRows.push(removed.sheetRowIndex);
            }
            dhctFormLines.splice(index, 1);
            renderDhctModalLines();
        }
    };

    window.confirmAllDhctModal = function() {
        dhctFormLines.forEach(line => {
            if (line.sku_con.trim() !== '') {
                line.xac_nhan = 'ĐÃ XÁC NHẬN';
            }
        });
        renderDhctModalLines();
    };

    window.unconfirmAllDhctModal = function() {
        dhctFormLines.forEach(line => {
            if (line.sku_con.trim() !== '') {
                line.xac_nhan = 'CHỜ XÁC NHẬN';
            }
        });
        renderDhctModalLines();
    };

    function renderDhctModalLines() {
        const container = document.getElementById('dhctModalLinesContainer');
        container.innerHTML = dhctFormLines.map((line, index) => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-2 py-2">
                    <input type="text" list="dhctModalIdSpCtList" 
                           id="modal_sku_${index}"
                           value="${line.sku_con}" 
                           oninput="window.updateModalLineVal(${index}, 'sku_con', this.value); window.handleModalSpCtChange(${index})" 
                           class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Chọn SP CT">
                </td>
                <td class="px-2 py-2">
                    <input type="text" readonly id="modal_id_sp_${index}" value="${line.id_sp}" class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600 cursor-not-allowed">
                </td>
                <td class="px-2 py-2">
                    <input type="text" readonly id="modal_ten_${index}" value="${line.ten_sp}" class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600 cursor-not-allowed">
                </td>
                <td class="px-2 py-2">
                    <input type="number" min="1" id="modal_sl_${index}" value="${line.so_luong}" 
                           oninput="window.updateModalLineVal(${index}, 'so_luong', this.value); window.calculateModalLineTotal(${index})" 
                           class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                </td>
                <td class="px-2 py-2">
                    <input type="number" min="0" id="modal_gia_${index}" value="${line.gia_nhap}" 
                           oninput="window.updateModalLineVal(${index}, 'gia_nhap', this.value); window.calculateModalLineTotal(${index})" 
                           class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                </td>
                <td class="px-2 py-2">
                    <input type="text" readonly id="modal_thanh_tien_${index}" value="${line.thanh_tien.toLocaleString('vi-VN')}" class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-900 font-bold cursor-not-allowed text-right">
                </td>
                <td class="px-2 py-2">
                    <select id="modal_xac_nhan_${index}" onchange="window.updateModalLineVal(${index}, 'xac_nhan', this.value)" class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm focus:ring-2 focus:ring-primary/20 outline-none ${line.xac_nhan === 'ĐÃ XÁC NHẬN' ? 'text-green-600 font-bold' : 'text-amber-600 font-bold'} ${!line.sku_con.trim() ? 'hidden' : ''}">
                        <option value="CHỜ XÁC NHẬN" ${line.xac_nhan === 'CHỜ XÁC NHẬN' ? 'selected' : ''}>CHỜ XÁC</option>
                        <option value="ĐÃ XÁC NHẬN" ${line.xac_nhan === 'ĐÃ XÁC NHẬN' ? 'selected' : ''}>ĐÃ XÁC</option>
                    </select>
                </td>
                <td class="px-2 py-2">
                    <input type="text" readonly id="modal_ton_lk_${index}" value="( ${(line.ton_lk?.all || 0).toLocaleString('vi-VN')} ) ${(line.ton_lk?.conf || 0).toLocaleString('vi-VN')}" class="w-full px-2 py-1.5 bg-indigo-50/50 border border-indigo-100 rounded text-sm text-indigo-700 font-bold cursor-not-allowed text-right">
                </td>
                <td class="px-2 py-2 text-center">
                    <button type="button" onclick="window.removeDhctModalLine(${index})" class="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Xóa dòng" ${dhctFormLines.length <= 1 ? 'disabled class="opacity-50"' : ''}>
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </td>
            </tr>
        `).join('');
        updateModalTotal();
    }

    window.updateModalLineVal = function(index, field, value) {
        if (field === 'so_luong' || field === 'gia_nhap') {
            dhctFormLines[index][field] = parseFloat(value) || 0;
        } else {
            dhctFormLines[index][field] = value;
        }
    };

    window.handleModalSpCtChange = function(index) {
        const line = dhctFormLines[index];
        const truong = document.getElementById('dhctModalTruong').value;
        const skuCon = line.sku_con.trim();

        const idSpEl = document.getElementById(`modal_id_sp_${index}`);
        const tenSpEl = document.getElementById(`modal_ten_${index}`);
        const giaNhapEl = document.getElementById(`modal_gia_${index}`);

        if (skuCon) {
            line.id_sp = skuCon.substring(0, 4);
            const foundSp = sanphamData.find(sp => sp.sku_con === skuCon);
            if (foundSp) {
                line.ten_sp = foundSp.ten_sp || '';
                if (truong === 'NHẬP') {
                    line.gia_nhap = parseFloat(foundSp.gia_nhap) || 0;
                    if (giaNhapEl) giaNhapEl.value = line.gia_nhap;
                } else {
                    line.gia_nhap = 0;
                    if (giaNhapEl) giaNhapEl.value = line.gia_nhap;
                }
            } else {
                line.ten_sp = '';
            }

            line.ton_lk = window.calculateTonLuyKe(skuCon);
        } else {
            line.id_sp = '';
            line.ten_sp = '';
            line.ton_lk = { all: 0, conf: 0 };
        }
        
        if (idSpEl) idSpEl.value = line.id_sp;
        if (tenSpEl) tenSpEl.value = line.ten_sp;
        
        const tonLkEl = document.getElementById(`modal_ton_lk_${index}`);
        if (tonLkEl) tonLkEl.value = `( ${(line.ton_lk?.all || 0).toLocaleString('vi-VN')} ) ${(line.ton_lk?.conf || 0).toLocaleString('vi-VN')}`;
        
        const xacNhanEl = document.getElementById(`modal_xac_nhan_${index}`);
        if (xacNhanEl) {
            if (skuCon) {
                xacNhanEl.classList.remove('hidden');
            } else {
                xacNhanEl.classList.add('hidden');
            }
        }

        window.calculateModalLineTotal(index);
    };

    window.calculateModalLineTotal = function(index) {
        const line = dhctFormLines[index];
        line.thanh_tien = (parseFloat(line.so_luong) || 0) * (parseFloat(line.gia_nhap) || 0);
        
        const thanhTienEl = document.getElementById(`modal_thanh_tien_${index}`);
        if (thanhTienEl) thanhTienEl.value = line.thanh_tien.toLocaleString('vi-VN');
        
        updateModalTotal();
    };

    function updateModalTotal() {
        const total = dhctFormLines.reduce((sum, line) => sum + line.thanh_tien, 0);
        const el = document.getElementById('dhctModalTotalAmount');
        if (el) el.textContent = total.toLocaleString('vi-VN') + ' đ';
    }

    function formatDateForId(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    }

    window.submitDhctModal = async function() {
        const ngayRaw = document.getElementById('dhctModalNgay').value;
        if (!ngayRaw) { alert("Vui lòng nhập Ngày"); return; }
        
        const ngayFormat = formatDateForId(ngayRaw);
        const truong = document.getElementById('dhctModalTruong').value;
        const ncc = document.getElementById('dhctModalNcc').value.trim();
        const kho = document.getElementById('dhctModalKho').value.trim();

        // Validate lines
        const validLines = dhctFormLines.filter(line => line.sku_con.trim() !== '');
        if (validLines.length === 0) {
            alert("Vui lòng nhập ít nhất 1 sản phẩm có ID SP CT hợp lệ.");
            return;
        }

        const idDh = `${ngayFormat} | ${truong} | ${ncc} | MB`;
        const finalRowsToAppend = [];
        const finalRowsToUpdate = [];

        for (const line of validLines) {
            const idSpCt = line.sku_con.trim();
            const id = `${idDh} | ${kho} | ${idSpCt}`;
            const idTonKho = `${kho} | ${idSpCt}`;
            
            const rowData = [
                id,             // 0 A: id
                idDh,           // 1 B: id_dh
                ngayFormat,     // 2 C: ngay
                truong,         // 3 D: truong
                ncc,            // 4 E: ncc
                kho,            // 5 F: kho
                idSpCt,         // 6 G: id_sp_ct
                line.id_sp,     // 7 H: id_sp
                line.ten_sp,    // 8 I: ten
                line.so_luong,  // 9 J: so_luong
                line.gia_nhap,  // 10 K: gia_nhap
                line.thanh_tien,// 11 L: thanh_tien_nhap
                line.so_luong,  // 12 M: so_luong_2
                idTonKho,       // 13 N: id_ton_kho
                line.xac_nhan   // 14 O: xac_nhan
            ];

            if (line.sheetRowIndex) {
                finalRowsToUpdate.push({ rowIndex: line.sheetRowIndex, data: rowData });
            } else {
                finalRowsToAppend.push(rowData);
            }
        }

        const btn = document.getElementById('btnSubmitDhctModal');
        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="animate-spin mr-2">⏳</span> Đang lưu...';
        
        try {
            let appendSuccess = true;
            let updateSuccess = true;
            
            // Build batch update for deleted and updated rows
            const batchData = [];
            const emptyRowData = Array(15).fill("");
            
            for (const rIndex of deletedSheetRows) {
                batchData.push({
                    range: `${CONFIG.dhctSheetName}!A${rIndex}`,
                    values: [emptyRowData]
                });
            }
            
            for (const updateObj of finalRowsToUpdate) {
                batchData.push({
                    range: `${CONFIG.dhctSheetName}!A${updateObj.rowIndex}`,
                    values: [updateObj.data]
                });
            }
            
            if (batchData.length > 0) {
                const ok = await window.batchUpdateSheetValues(batchData);
                if (!ok) updateSuccess = false;
            }

            // Append new rows
            if (finalRowsToAppend.length > 0) {
                const ok = await window.appendSheetData(CONFIG.dhctSheetName, finalRowsToAppend);
                if (!ok) appendSuccess = false;
            }

            if (appendSuccess && updateSuccess) {
                // Tắt trạng thái đang lưu trên nút trước khi alert (nếu muốn)
                btn.disabled = false;
                btn.innerHTML = originalText;
                
                alert(`Đã lưu thành công dữ liệu!`);
                window.closeDhctModal();

                // Chạy ngầm các tác vụ phụ để tránh nút Lưu bị đơ (tồn kho, fetch data)
                (async () => {
                    try {
                        // Tự động thêm vào Tồn Kho nếu chưa có
                        if (!inventoryData || inventoryData.length === 0) {
                            const token = await window.getAccessToken();
                            const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${CONFIG.inventorySheetName}!A:A`;
                            const resp = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
                            const resJson = await resp.json();
                            if (resJson.values && resJson.values.length > 0) {
                                inventoryData = resJson.values.slice(1).map(row => ({
                                    id: (row[0] || '').toString().trim()
                                }));
                            } else {
                                inventoryData = [];
                            }
                        }

                        const newInventoryRows = [];
                        for (const line of validLines) {
                            const idSpCt = line.sku_con.trim();
                            const idTonKho = `${kho} | ${idSpCt}`;
                            
                            const exists = inventoryData.some(r => r.id === idTonKho);
                            const alreadyAdding = newInventoryRows.some(r => r[0] === idTonKho);

                            if (!exists && !alreadyAdding) {
                                const idSp = idSpCt.substring(0, 4);
                                newInventoryRows.push([
                                    idTonKho,
                                    kho,
                                    idSpCt,
                                    idSp,
                                    line.ten_sp,
                                    0
                                ]);
                            }
                        }

                        if (newInventoryRows.length > 0) {
                            await window.appendSheetData(CONFIG.inventorySheetName, newInventoryRows);
                            inventoryData = []; // Reset để fetch lại đầy đủ khi mở tab
                        }
                    } catch (invErr) {
                        console.error("Lỗi khi đồng bộ tồn kho:", invErr);
                    }

                    if (window.fetchDHCTData) {
                        window.fetchDHCTData(true);
                    }
                })();
            } else {
                alert("Có lỗi xảy ra trong quá trình lưu dữ liệu. Vui lòng kiểm tra lại.");
            }
        } catch(err) {
            alert("Đã xảy ra lỗi: " + err.message);
        } finally {
            // Đảm bảo nút khôi phục lại trạng thái ban đầu nếu chưa được khôi phục
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    };

})();
