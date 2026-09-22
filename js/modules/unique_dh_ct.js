// unique_dh_ct - Module Pattern (IIFE)
(function () {
let currentUDCTMasterKey = null;
let currentUDCTSelectedItem = null;

function renderUniqueDHCTTable() {
    const tbody = document.getElementById('udctMasterList');
    if (!tbody) return;

    if (!dhctData || dhctData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="text-center py-10 text-slate-400 italic">Chưa có dữ liệu DH_CT</td></tr>';
        return;
    }

    const grouped = {};
    dhctData.forEach(item => {
        const ngay = (item.ngay || '').toString().trim().split(' ')[0];
        const truong = (item.truong || '').toString().trim();
        const ncc = (item.ncc || '').toString().trim();
        const key = `${ngay}|${truong}|${ncc}`;
        if (!grouped[key]) {
            grouped[key] = { ngay, truong, ncc, count: 0 };
        }
        grouped[key].count++;
    });

    const sortedList = Object.values(grouped).sort((a, b) => {
        const da = toYMD(a.ngay);
        const db = toYMD(b.ngay);
        return db.localeCompare(da) || a.truong.localeCompare(b.truong);
    });

    // Lấy ngày hôm nay định dạng DD/MM/YYYY để check ẩn hiện nút copy
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const todayStr = `${d}/${m}/${y}`;

    let html = '';
    let currentDate = null;

    sortedList.forEach(item => {
        const key = `${item.ngay}|${item.truong}|${item.ncc}`;
        const isKinhDoanh = currentUser && currentUser.role === 'kinhdoanh';
        if (item.ngay !== currentDate) {
            const countForDate = sortedList.filter(x => x.ngay === item.ngay).length;
            html += `
                <tr class="bg-slate-50 border-y border-slate-200">
                    <td colspan="2" class="px-2 py-1.5 text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                        <span class="text-slate-700">${item.ngay}</span> 
                        <span class="bg-slate-200 px-1 rounded text-[9px] min-w-[14px] text-center text-slate-600">${countForDate}</span>
                    </td>
                </tr>
            `;
            currentDate = item.ngay;
        }

        const isActive = currentUDCTMasterKey === key;

        // Kiểm tra xem đơn hàng này (truong & ncc) đã có trong ngày hôm nay chưa
        const existsToday = sortedList.some(x => x.ngay.includes(todayStr) && x.truong === item.truong && x.ncc === item.ncc);
        const isNotToday = !item.ngay.includes(todayStr);

        html += `
            <tr onclick="selectUDCTMasterRow('${key.replace(/'/g, "\\'")}')" 
                class="border-b border-slate-100 cursor-pointer transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'} group">
                <td class="px-3 py-2.5 font-bold uppercase leading-tight text-[10px] w-20">${item.truong}</td>
                <td class="px-3 py-2.5 uppercase leading-tight text-[10px] font-medium flex items-center justify-between">
                    <span>${item.ncc}</span>
                    ${(isNotToday && !existsToday && !isKinhDoanh) ? `
                    <button onclick="event.stopPropagation(); copyDHCTGroup('${key.replace(/'/g, "\\'")}')" 
                            class="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100" 
                            title="Copy sang hôm nay">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                    </button>` : ''}
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;

    // Auto select first row if none selected
    if (!currentUDCTMasterKey && sortedList.length > 0) {
        selectUDCTMasterRow(`${sortedList[0].ngay}|${sortedList[0].truong}|${sortedList[0].ncc}`);
    }
}

async function copyDHCTGroup(key) {
    if (!confirm('Bạn muốn copy đơn hàng này sang ngày hôm nay?')) return;

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    try {
        const parts = key.split('|');
        const oldNgay = parts[0];
        const truong = parts[1];
        const ncc = parts[2];

        // Tìm các dòng thuộc nhóm này
        const itemsToCopy = dhctData.filter(item =>
            (item.ngay || '').toString().trim().split(' ')[0] === oldNgay &&
            (item.truong || '').toString().trim() === truong &&
            (item.ncc || '').toString().trim() === ncc
        );

        if (itemsToCopy.length === 0) {
            alert('Không tìm thấy dữ liệu để copy.');
            return;
        }

        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        const todayStr = `${d}/${m}/${y}`;

        const orderIdMap = {};

        const newRows = itemsToCopy.map((item, idx) => {
            const key = `${todayStr}|${truong}|${ncc}`;
            if (!orderIdMap[key]) {
                orderIdMap[key] = 'DH-' + (Date.now() + idx).toString().slice(-4);
            }
            const id_dh_ct = 'CT-' + (Date.now() + idx).toString().slice(-6);
            const id_dh = orderIdMap[key];
            const sl = parseFloat(item.so_luong) || 0;
            const gia = parseFloat(item.gia_nhap) || 0;

            // Cấu trúc (16 cột): [id_dh_ct, id_dh, ngay, truong, ncc, ghi_chu, kho, id_sp_ct, _, _, ten, sl, gia, thanh_tien, _, _]
            return [
                id_dh_ct, id_dh, todayStr, truong, ncc, item.ghi_chu || '', item.kho || 'KHO', item.sku_con || '',
                '', '', item.ten || '', sl, gia, sl * gia, '', ''
            ];
        });

        const success = await appendSheetData(CONFIG.dhctSheetName, newRows);
        if (success) {
            await fetchDHCTData(); // Reload từ Sheet
            const newKey = `${todayStr}|${truong}|${ncc}`;
            currentUDCTMasterKey = newKey;
            renderUniqueDHCTTable();
            selectUDCTMasterRow(newKey);
            alert(`Đã copy ${itemsToCopy.length} dòng sang ngày ${todayStr}`);
        }
    } catch (err) {
        console.error('Copy DHCT Group Error:', err);
        alert('Lỗi khi copy: ' + err.message);
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
}

function getTopUDCTIdSpCts() {
    if (!dhctData) return [];
    const counts = {};
    dhctData.forEach(item => {
        const id = (item.sku_con || '').toString().trim();
        if (id) counts[id] = (counts[id] || 0) + 1;
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(e => e[0]);
}

function quickFillIdSpCt(id) {
    const input = document.getElementById('row_add_id_sp_ct');
    if (input) {
        input.value = id;
        // Tự động tìm thông tin sản phẩm và điền nốt các cột khác
        if (sanphamData && sanphamData.length > 0) {
            const searchId = id.toString().trim().toLowerCase();
            const match = sanphamData.find(m => (m.sku_con || '').toString().trim().toLowerCase() === searchId);
            if (match) {
                selectSpCtSuggestion(match.id_sp_ct, (match.ten || '').replace(/'/g, "\\'"), match.gia_nhap || 0);
            } else {
                handleIdSpCtInput(input, 'row_add');
            }
        } else {
            handleIdSpCtInput(input, 'row_add');
        }
    }
}

function selectUDCTMasterRow(key) {
    currentUDCTMasterKey = key;

    // Update active UI state for master list
    document.querySelectorAll('#udctMasterList tr').forEach(tr => {
        if (tr.getAttribute('onclick')?.includes(`'${key}'`)) {
            tr.classList.add('bg-blue-50', 'text-blue-700');
            tr.classList.remove('text-slate-600');
        } else if (!tr.classList.contains('bg-slate-50')) {
            tr.classList.remove('bg-blue-50', 'text-blue-700');
            tr.classList.add('text-slate-600');
        }
    });

    const parts = key.split('|');
    renderUDCTSubDetails(parts[0], parts[1], parts[2]);
}

function renderUDCTSubDetails(ngay, truong, ncc) {
    const tbody = document.getElementById('udctSubDetailList');
    if (!tbody) return;

    const filtered = dhctData.filter(item =>
        (item.ngay || '').toString().trim().split(' ')[0] === ngay &&
        (item.truong || '').toString().trim() === truong &&
        (item.ncc || '').toString().trim() === ncc
    );
    const isKinhDoanh = currentUser && currentUser.role === 'kinhdoanh';

    let html = '';

    // Render existing items
    filtered.forEach(item => {
        const isSelected = currentUDCTSelectedItem && currentUDCTSelectedItem.rowIndex === item.rowIndex;
        const sl = parseFloat(item.so_luong) || 0;
        const gia = parseFloat(item.gia_nhap) || 0;
        const thanhTien = sl * gia;

        html += `
            <tr data-id="${item.id_dh_ct}" 
                class="border-b border-slate-100 hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}">
                <td class="p-0 text-center">
                    <button onclick="${isKinhDoanh ? '' : `toggleUDCTRowKho('${item.id_dh_ct}', '${item.kho || 'KHO'}')`}"
                            ${isKinhDoanh ? 'style="pointer-events:none"' : ''}
                            class="w-11 h-7 text-[9px] font-bold rounded border-none transition-all ${(item.kho || 'KHO') === 'BH' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}">
                        ${item.kho || 'KHO'}
                    </button>
                </td>
                <td class="p-0 w-24">
                    <input type="text" value="${item.sku_con || ''}" 
                           ${isKinhDoanh ? 'disabled' : ''}
                           oninput="handleIdSpCtInput(this, 'row')"
                           onchange="saveUDCTRowInline('${item.id_dh_ct}', 'id_sp_ct', this.value)"
                           autocomplete="off"
                           class="w-full h-10 px-2 bg-transparent text-[11px] font-bold text-slate-900 border-none outline-none focus:ring-1 focus:ring-blue-400 rounded uppercase disabled:opacity-80">
                </td>
                <td class="p-0">
                    <input type="text" value="${item.ten || ''}" 
                           ${isKinhDoanh ? 'disabled' : ''}
                           onchange="saveUDCTRowInline('${item.id_dh_ct}', 'ten', this.value)"
                           class="w-full h-10 px-2 bg-transparent text-[11px] text-slate-600 border-none outline-none focus:ring-1 focus:ring-blue-400 rounded disabled:opacity-80">
                </td>
                <td class="p-0 w-20">
                    <input type="number" value="${sl}" 
                           ${isKinhDoanh ? 'disabled' : ''}
                           onchange="saveUDCTRowInline('${item.id_dh_ct}', 'so_luong', this.value)"
                           class="w-full h-10 px-2 bg-transparent text-[11px] font-bold text-slate-900 border-none outline-none focus:ring-1 focus:ring-blue-400 rounded text-right disabled:opacity-80">
                </td>
                <td class="p-0 w-24">
                    <input type="number" value="${gia}" 
                           ${isKinhDoanh ? 'disabled' : ''}
                           onchange="saveUDCTRowInline('${item.id_dh_ct}', 'gia_nhap', this.value)"
                           class="w-full h-10 px-2 bg-transparent text-[11px] text-slate-600 border-none outline-none focus:ring-1 focus:ring-blue-400 rounded text-right disabled:opacity-80">
                </td>
                <td class="px-2 py-2.5 text-right font-bold text-rose-600 text-[11px] w-32 relative">
                    <div class="flex items-center justify-end gap-2">
                        <span>${thanhTien.toLocaleString()}</span>
                        ${isKinhDoanh ? '' : `
                        <button onclick="event.stopPropagation(); currentUDCTSelectedItem = dhctData.find(x => x.id_dh_ct === '${item.id_dh_ct}'); deleteUDCTDetail()" 
                                class="text-rose-400 hover:text-rose-600 p-1 transition-all" title="Xóa dòng này">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>`}
                    </div>
                </td>
            </tr>
        `;
    });

    // Persistent "Add New" row
    if (!isKinhDoanh) {
        html += `
            <tr class="bg-blue-50/20 hover:bg-blue-50 transition-colors border-t border-dashed border-blue-300">
                <td class="p-0 text-center">
                    <button id="row_add_kho_btn" onclick="this.textContent = (this.textContent.trim() === 'KHO' ? 'BH' : 'KHO'); this.classList.toggle('bg-amber-100'); this.classList.toggle('text-amber-700'); this.classList.toggle('bg-blue-100'); this.classList.toggle('text-blue-700');" 
                            class="w-11 h-8 text-[9px] font-bold rounded bg-blue-100 text-blue-700 transition-all">
                        KHO
                    </button>
                </td>
                <td class="p-0 w-24 align-top">
                    <input type="text" id="row_add_id_sp_ct" placeholder="Nhập mã sp..." 
                        oninput="handleIdSpCtInput(this, 'row_add')"
                        onkeydown="if(event.key==='Enter') saveUDCTRowNew()"
                        autocomplete="off"
                        class="w-full h-11 px-2 bg-transparent text-[11px] font-bold text-blue-600 border-none outline-none focus:ring-1 focus:ring-blue-400 rounded uppercase placeholder:text-blue-300">
                    <div class="flex flex-wrap gap-1 px-1 pb-1 overflow-x-auto max-h-20 no-scrollbar">
                    </div>
                </td>
                <td class="p-0">
                    <input type="text" id="row_add_ten" placeholder="Tên sản phẩm..."
                        onkeydown="if(event.key==='Enter') saveUDCTRowNew()"
                        class="w-full h-11 px-2 bg-transparent text-[11px] text-slate-500 border-none outline-none focus:ring-1 focus:ring-blue-400 rounded">
                </td>
                <td class="p-0">
                    <input type="number" id="row_add_sl" value="1"
                        onkeydown="if(event.key==='Enter') saveUDCTRowNew()"
                        class="w-full h-11 px-2 bg-transparent text-[11px] font-bold text-slate-900 border-none outline-none focus:ring-1 focus:ring-blue-400 rounded text-right">
                </td>
                <td class="p-0">
                    <input type="number" id="row_add_gia_nhap" value="0"
                        onkeydown="if(event.key==='Enter') saveUDCTRowNew()"
                        class="w-full h-11 px-2 bg-transparent text-[11px] text-slate-600 border-none outline-none focus:ring-1 focus:ring-blue-400 rounded text-right">
                </td>
                <td class="p-0 text-center">
                </td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}

async function saveUDCTRowNew() {
    if (!currentUDCTMasterKey) {
        alert('Vui lòng chọn đơn hàng bên trái trước!');
        return;
    }

    const id_sp_ct = document.getElementById('row_add_id_sp_ct').value.trim();
    const ten = document.getElementById('row_add_ten').value.trim();
    const sl = parseFloat(document.getElementById('row_add_sl').value) || 0;
    const gia = parseFloat(document.getElementById('row_add_gia_nhap').value) || 0;
    const kho = document.getElementById('row_add_kho_btn')?.textContent?.trim() || 'KHO';

    if (!id_sp_ct) {
        alert('Vui lòng nhập ID Sản phẩm!');
        document.getElementById('row_add_id_sp_ct').focus();
        return;
    }

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    try {
        const parts = currentUDCTMasterKey.split('|');
        const ngay = parts[0];
        const truong = parts[1];
        const ncc = parts[2];

        const id_dh_ct = 'CT-' + Date.now().toString().slice(-6);
        const id_dh = 'DH-' + Date.now().toString().slice(-4);

        const newRow = [
            id_dh_ct, id_dh, ngay, truong, ncc, '', kho, id_sp_ct,
            '', '', ten, sl, gia, sl * gia, '', ''
        ];

        const success = await appendSheetData(CONFIG.dhctSheetName, [newRow]);
        if (success) {
            await fetchDHCTData(); // Reload from Sheet
            selectUDCTMasterRow(currentUDCTMasterKey);
            // Autofocus back to SKU input for next item
            setTimeout(() => {
                const skuInput = document.getElementById('row_add_id_sp_ct');
                if (skuInput) skuInput.focus();
            }, 100);
        }
    } catch (err) {
        console.error('Save New Inline Row Error:', err);
        alert('Lỗi: ' + err.message);
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
}

async function handleExcelUploadUniqueDHCT(files) {
    if (currentUser && currentUser.role === 'kinhdoanh') {
        alert('Tài khoản KINHDOANH không được phép tải Excel.');
        return;
    }
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
            truong: findCol(['truong', 'trường', 'platform']),
            ncc: findCol(['ncc', 'nha cung cap', 'nhà cung cấp']),
            kho: findCol(['kho', 'warehouse']),
            id_sp_ct: findCol(['id_sp_ct', 'sku', 'mã sp', 'ma sp', 'id sp ct']),
            ten: findCol(['ten', 'tên', 'product', 'tên sản phẩm']),
            sl: findCol(['so_luong', 'sl', 'số lượng', 'quantity']),
            gia: findCol(['gia_nhap', 'gia', 'giá', 'giá nhập']),
            ghi_chu: findCol(['ghi_chu', 'ghi chú', 'note'])
        };

        const rows = excelData.slice(1);
        const appendValues = [];
        const now = Date.now();

        let defNgay = '', defTruong = '', defNcc = '';
        if (currentUDCTMasterKey) {
            const parts = currentUDCTMasterKey.split('|');
            defNgay = parts[0];
            defTruong = parts[1];
            defNcc = parts[2];
        } else {
            const d = new Date();
            defNgay = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }

        const orderIdMap = {};
        rows.forEach((row, idx) => {
            const id_sp_ct = colIdx.id_sp_ct !== -1 ? (row[colIdx.id_sp_ct] || '').toString().trim().toUpperCase() : '';
            if (!id_sp_ct) return;

            let rawNgay = colIdx.ngay !== -1 ? row[colIdx.ngay] : null;
            let ngay = defNgay;
            if (rawNgay) {
                let val = rawNgay;
                // Nếu là chuỗi số thì chuyển sang số
                if (typeof val === 'string' && val.trim() !== "" && !isNaN(val) && !val.includes('/') && !val.includes('-')) {
                    val = parseFloat(val);
                }

                if (typeof val === 'number') {
                    // Xử lý số serial date từ Excel
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
                    if (ngay.includes('-')) {
                        const ps = ngay.split('-');
                        if (ps.length === 3 && ps[0].length === 4) {
                            ngay = `${ps[2]}/${ps[1]}/${ps[0]}`;
                        } else {
                            ngay = ngay.replace(/-/g, '/');
                        }
                    }
                }
            }

            const truong = colIdx.truong !== -1 && row[colIdx.truong] ? (row[colIdx.truong] || '').toString().trim() : defTruong;
            const ncc = colIdx.ncc !== -1 && row[colIdx.ncc] ? (row[colIdx.ncc] || '').toString().trim() : defNcc;

            if (!truong || !ncc) return;

            const kho = colIdx.kho !== -1 && row[colIdx.kho] ? (row[colIdx.kho] || '').toString().trim() : 'KHO';
            let ten = colIdx.ten !== -1 ? (row[colIdx.ten] || '').toString().trim() : '';
            const sl = colIdx.sl !== -1 ? parseFloat(row[colIdx.sl]) || 0 : 1;
            let gia = colIdx.gia !== -1 ? parseFloat(row[colIdx.gia]) || 0 : 0;
            const ghi_chu = colIdx.ghi_chu !== -1 ? (row[colIdx.ghi_chu] || '').toString().trim() : '';

            // Auto-fill Product Info if missing
            if (sanphamData && (!ten || !gia)) {
                const sp = sanphamData.find(s => (s.sku_con || '').toLowerCase() === id_sp_ct.toLowerCase());
                if (sp) {
                    if (!ten) ten = sp.ten || '';
                    if (!gia) gia = parseFloat(sp.gia_nhap) || 0;
                }
            }

            const key = `${ngay} | ${truong} | ${ncc} | MB`;
            if (!orderIdMap[key]) {
                orderIdMap[key] = key;
            }

            const id_dh = orderIdMap[key];
            const id_dh_ct = `${ngay} | ${truong} | ${ncc} | MB | ${kho} | ${id_sp_ct}`;
            const id_ton_kho = `${kho} | ${id_sp_ct}`;

            // Cấu trúc 16 cột DH_CT (giống fetchDHCTData):
            // 0: id_dh_ct, 1: id_dh, 2: ngay, 3: truong, 4: ncc, 5: kho, 6: id_sp_ct, 7: id_sp, 8: ten, 9: so_luong, 10: gia_nhap, 11: thanh_tien_nhap, 12: so_luong_2, 13: id_ton_kho, 14: xac_nhan, 15: ghi_chu
            appendValues.push([
                id_dh_ct, id_dh, ngay, truong, ncc, kho, id_sp_ct,
                '', ten, sl, gia, sl * gia, '', id_ton_kho, 'CHỜ XÁC NHẬN', ghi_chu
            ]);
        });

        if (appendValues.length === 0) {
            alert("Không tìm thấy dữ liệu hợp lệ (Yêu cầu ít nhất có cột SKU/ID SP CT)");
            return;
        }

        const success = await appendSheetData(CONFIG.dhctSheetName, appendValues);
        if (success) {
            alert(`Đã tải lên thành công ${appendValues.length} sản phẩm!`);
            await fetchDHCTData();
            if (currentUDCTMasterKey) selectUDCTMasterRow(currentUDCTMasterKey);
            else renderUniqueDHCTTable();
        } else {
            alert("Lỗi khi kết nối với Google Sheet.");
        }
    } catch (err) {
        console.error("Excel Upload Sub-Detail Error:", err);
        alert("Lỗi xử lý file Excel: " + err.message);
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        document.getElementById('excelUploadUniqueDHCT').value = '';
    }
}

function downloadUniqueDHCTTemplate() {
    const headers = [['Ngày (DD/MM/YYYY)', 'Trường', 'NCC', 'Kho', 'ID SP CT', 'Số lượng', 'Giá nhập', 'Tên sản phẩm', 'Ghi chú']];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_DHCT');
    XLSX.writeFile(wb, 'Mau_Import_DHCT.xlsx');
}

function exportUniqueDHCTToExcel() {
    if (!dhctData || dhctData.length === 0) return alert('Không có dữ liệu để xuất!');

    // Nếu đang chọn một nhóm đơn hàng, chỉ xuất nhóm đó
    let dataToExport = dhctData;
    if (currentUDCTMasterKey) {
        const parts = currentUDCTMasterKey.split('|');
        dataToExport = dhctData.filter(item =>
            (item.ngay || '').toString().trim().split(' ')[0] === parts[0] &&
            (item.truong || '').toString().trim() === parts[1] &&
            (item.ncc || '').toString().trim() === parts[2]
        );
    }

    const headers = ['ID DH CT', 'ID DH', 'Ngày', 'Trường', 'NCC', 'Ghi chú', 'Kho', 'ID SP CT', 'Tên sản phẩm', 'Số lượng', 'Giá nhập', 'Thành tiền'];
    const rows = dataToExport.map(item => [
        item.id_dh_ct, item.id_dh, item.ngay, item.truong, item.ncc, item.ghi_chu,
        item.kho, item.sku_con, item.ten, item.so_luong, item.gia_nhap, (item.so_luong * item.gia_nhap)
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DS_DHCT');
    const fileName = currentUDCTMasterKey ? `DHCT_${currentUDCTMasterKey.replace(/\|/g, '_')}.xlsx` : `Tat_Ca_DHCT.xlsx`;
    XLSX.writeFile(wb, fileName);
}

async function toggleUDCTRowKho(id_dh_ct, currentKho) {
    const nextKho = currentKho === 'KHO' ? 'BH' : 'KHO';
    await saveUDCTRowInline(id_dh_ct, 'kho', nextKho);
    // UI update will happen automatically if saveUDCTRowInline re-renders, 
    // but we can also manually flip its class if needed for immediate feel.
    selectUDCTMasterRow(currentUDCTMasterKey);
}

async function saveUDCTRowInline(id_dh_ct, field, value) {
    const item = dhctData.find(x => x.id_dh_ct === String(id_dh_ct));
    if (!item) return;

    // Update local data
    item[field] = value;

    // Auto-update Details panel if this row is currently selected
    // Auto-update Details panel if it exists (for backward compatibility or other modules)
    if (currentUDCTSelectedItem?.id_dh_ct === id_dh_ct) {
        const inputId = `detail_${field}`;
        const inputEl = document.getElementById(inputId);
        if (inputEl) inputEl.value = value;

        // Re-calculate thanh_tien in details if present
        const ttEl = document.getElementById('detail_thanh_tien');
        if (ttEl) {
            const sl = parseFloat(item.so_luong) || 0;
            const gia = parseFloat(item.gia_nhap) || 0;
            ttEl.textContent = (sl * gia).toLocaleString();
        }
    }

    // Save to server
    try {
        const rowIndex = item.rowIndex;
        // Mapping fields to columns (1-based): kho->G(7), id_sp_ct->H(8), ten->K(11), so_luong->L(12), gia_nhap->M(13)
        const colMap = {
            'kho': 7,
            'id_sp_ct': 8,
            'ten': 11,
            'so_luong': 12,
            'gia_nhap': 13
        };
        const col = colMap[field];
        if (col) {
            await updateSheetCell(CONFIG.dhctSheetName, rowIndex, col, value);
            // Re-render only if needed, but since it's an input, the value is already there.
            // Just update the row's Thanh Tien label
            const sl = parseFloat(item.so_luong) || 0;
            const gia = parseFloat(item.gia_nhap) || 0;
            const tr = document.querySelector(`#udctSubDetailList tr[data-id="${id_dh_ct}"]`);
            if (tr) {
                const ttCell = tr.querySelector('td:last-child');
                if (ttCell) ttCell.textContent = (sl * gia).toLocaleString();
            }
        }
    } catch (err) {
        console.error('Inline save failed:', err);
    }
}

function prepareAddUDCTSubDetail() {
    if (!currentUDCTMasterKey) {
        alert('Vui lòng chọn đơn hàng bên trái trước!');
        return;
    }

    currentUDCTSelectedItem = null; // Clear selection for add mode
    const parts = currentUDCTMasterKey.split('|');

    const content = document.getElementById('udctDetailContent');
    const empty = document.getElementById('udctDetailEmpty');
    const addBtn = document.getElementById('btnSaveNewUDCTItem');

    if (content) content.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');
    if (addBtn) addBtn.classList.remove('hidden'); // Show "Add New" button

    const idDhEl = document.getElementById('detail_id_dh');
    if (idDhEl) idDhEl.textContent = 'Mới...';
    const khoEl = document.getElementById('detail_kho');
    if (khoEl) khoEl.textContent = 'Tự động';

    const idSpEl = document.getElementById('detail_id_sp_ct');
    if (idSpEl) idSpEl.value = '';
    const tenEl = document.getElementById('detail_ten');
    if (tenEl) tenEl.value = '';
    const slEl = document.getElementById('detail_sl');
    if (slEl) slEl.value = 1;
    const giaEl = document.getElementById('detail_gia_nhap');
    if (giaEl) giaEl.value = 0;
    const ttEl = document.getElementById('detail_thanh_tien');
    if (ttEl) ttEl.textContent = '0';

    // Highlight the add row in table (optional redraw)
    renderUDCTSubDetails(parts[0], parts[1], parts[2]);
}

async function saveUDCTDetail() {
    if (!currentUDCTSelectedItem) return; // Không lưu nếu đang ở chế độ thêm mới

    const id_sp_ct = document.getElementById('detail_id_sp_ct')?.value?.trim();
    const ten = document.getElementById('detail_ten')?.value?.trim();
    const sl = parseFloat(document.getElementById('detail_sl')?.value) || 0;
    const gia = parseFloat(document.getElementById('detail_gia_nhap')?.value) || 0;

    // Update local data
    currentUDCTSelectedItem.sku_con = id_sp_ct;
    currentUDCTSelectedItem.ten = ten;
    currentUDCTSelectedItem.so_luong = sl;
    currentUDCTSelectedItem.gia_nhap = gia;

    // Update UI
    const ttEl = document.getElementById('detail_thanh_tien');
    if (ttEl) ttEl.textContent = (sl * gia).toLocaleString();

    if (currentUDCTMasterKey) {
        const p = currentUDCTMasterKey.split('|');
        renderUDCTSubDetails(p[0], p[1], p[2]);
    }

    // Save to server
    try {
        const rowIndex = currentUDCTSelectedItem.rowIndex;
        // Map: H(8), K(11), L(12), M(13) -> index-wise they are: H(7), K(10), L(11), M(12)
        const updates = [
            { row: rowIndex, col: 8, value: id_sp_ct }, // Cột H
            { row: rowIndex, col: 11, value: ten },    // Cột K
            { row: rowIndex, col: 12, value: sl },     // Cột L
            { row: rowIndex, col: 13, value: gia }      // Cột M
        ];

        for (const up of updates) {
            await updateSheetCell(CONFIG.dhctSheetName, up.row, up.col, up.value);
        }
    } catch (err) {
        console.error('Save detail failed:', err);
    }
}

async function addNewUDCTSubDetail() {
    if (!currentUDCTMasterKey) return;

    const parts = currentUDCTMasterKey.split('|');
    const ngay = parts[0];
    const truong = parts[1];
    const ncc = parts[2];

    const id_sp_ct = document.getElementById('detail_id_sp_ct').value.trim();
    const ten = document.getElementById('detail_ten').value.trim();
    const sl = parseFloat(document.getElementById('detail_sl').value) || 0;
    const gia = parseFloat(document.getElementById('detail_gia_nhap').value) || 0;

    if (!id_sp_ct) {
        alert('Vui lòng nhập ID Sản phẩm!');
        return;
    }

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    try {
        const id_dh_ct = 'CT-' + Date.now().toString().slice(-6);
        const id_dh = 'DH-' + Date.now().toString().slice(-4);

        const newRow = [
            id_dh_ct, id_dh, ngay, truong, ncc, '', '', id_sp_ct,
            '', '', ten, sl, gia, sl * gia, '', ''
        ];

        const success = await appendSheetData(CONFIG.dhctSheetName, [newRow]);
        if (success) {
            await fetchDHCTData(); // Reload all
            // Re-select master row to refresh UI
            selectUDCTMasterRow(currentUDCTMasterKey);
        }
    } catch (err) {
        alert('Lỗi thêm sản phẩm: ' + err.message);
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
}

async function deleteUDCTDetail() {
    if (!currentUDCTSelectedItem) return;
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi đơn hàng?')) return;

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    try {
        const token = await getAccessToken();
        const sheetId = await fetchSheetMeta(CONFIG.dhctSheetName, token);
        if (sheetId === null) throw new Error('Không lấy được sheetId');

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}:batchUpdate`;
        const body = {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId,
                        dimension: 'ROWS',
                        startIndex: currentUDCTSelectedItem.rowIndex - 1,
                        endIndex: currentUDCTSelectedItem.rowIndex
                    }
                }
            }]
        };

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (resp.ok) {
            dhctData = dhctData.filter(x => x.id_dh_ct !== currentUDCTSelectedItem.id_dh_ct);
            // Re-render
            const masterKey = currentUDCTMasterKey;
            renderUniqueDHCTTable();
            if (masterKey) selectUDCTMasterRow(masterKey);
        } else {
            alert('Lỗi khi xóa dòng trên Google Sheets.');
        }
    } catch (err) {
        console.error('Delete UDCT Detail Error:', err);
        alert('Có lỗi xảy ra khi xóa.');
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
}

function adjustUDCTDetailSL(delta) {
    const input = document.getElementById('detail_sl');
    if (!input) return;
    let val = parseFloat(input.value) || 0;
    val += delta;
    if (val < 0) val = 0;
    input.value = val;

    const price = currentUDCTSelectedItem ? (parseFloat(currentUDCTSelectedItem.don_gia) || 0) : 0;
    document.getElementById('detail_thanh_tien').textContent = (price * val).toLocaleString();
}

// Giữ lại các hàm cũ đề phòng link ngoài gọi
function openUniqueDHCTModal(ngay, truong, ncc) {
    const key = `${ngay}|${truong}|${ncc}`;
    switchModule('unique_dh_ct');
    selectUDCTMasterRow(key);
}

function closeUniqueDHCTModal() {
    if (!overlay) return;

    document.getElementById('uniqueDHCTModalTitle').textContent = `${ngay} | ${truong} | ${ncc}`;

    const tbody = document.getElementById('uniqueDHCTDetailTableBody');

    const filtered = dhctData.filter(item =>
        (item.ngay ? item.ngay.toString().trim() : '') === ngay &&
        (item.truong ? item.truong.toString().trim() : '') === truong &&
        (item.ncc ? item.ncc.toString().trim() : '') === ncc
    ).sort((a, b) => (b.id_dh_ct || '').localeCompare(a.id_dh_ct || ''));

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-slate-500">Không có dữ liệu chi tiết</td></tr>';
    } else {
        tbody.innerHTML = filtered.map(item => `
                    <tr class="border-b border-slate-100 hover:bg-slate-50">
                        <td class="px-3 py-2 text-sm text-blue-600 font-medium">${item.id_dh || ''}</td>
                        <td class="px-3 py-2 text-sm font-semibold text-slate-900">${item.sku_con || ''}</td>
                        <td class="px-3 py-2 text-sm text-slate-700 max-w-[200px] truncate" title="${item.ten || ''}">${item.ten || ''}</td>
                        <td class="px-3 py-2 text-sm text-right font-bold">${(parseFloat(item.so_luong) || 0).toLocaleString('vi-VN')}</td>
                        <td class="px-3 py-2 text-sm text-slate-500">${item.kho || ''}</td>
                        <td class="px-3 py-2 text-sm text-slate-500 max-w-[150px] truncate" title="${item.ghi_chu || ''}">${item.ghi_chu || ''}</td>
                    </tr>
                `).join('');
    }

    const modal = document.getElementById('uniqueDHCTDetailModal');

    overlay.classList.remove('hidden');
    // Allow slight delay for animation if needed
    setTimeout(() => {
        if (modal) modal.classList.remove('translate-x-full');
    }, 10);
}

function closeUniqueDHCTModal() {
    const overlay = document.getElementById('uniqueDHCTDetailOverlay');
    const modal = document.getElementById('uniqueDHCTDetailModal');

    if (modal) {
        modal.classList.add('translate-x-full');
    }

    if (overlay) {
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 300);
    }
}


    Object.assign(window.AppModules = window.AppModules || {}, { ['unique_dh_ct']: true });
    window.renderUniqueDHCTTable = renderUniqueDHCTTable;
    window.copyDHCTGroup = copyDHCTGroup;
    window.getTopUDCTIdSpCts = getTopUDCTIdSpCts;
    window.quickFillIdSpCt = quickFillIdSpCt;
    window.selectUDCTMasterRow = selectUDCTMasterRow;
    window.renderUDCTSubDetails = renderUDCTSubDetails;
    window.saveUDCTRowNew = saveUDCTRowNew;
    window.handleExcelUploadUniqueDHCT = handleExcelUploadUniqueDHCT;
    window.downloadUniqueDHCTTemplate = downloadUniqueDHCTTemplate;
    window.exportUniqueDHCTToExcel = exportUniqueDHCTToExcel;
    window.toggleUDCTRowKho = toggleUDCTRowKho;
    window.saveUDCTRowInline = saveUDCTRowInline;
    window.prepareAddUDCTSubDetail = prepareAddUDCTSubDetail;
    window.saveUDCTDetail = saveUDCTDetail;
    window.addNewUDCTSubDetail = addNewUDCTSubDetail;
    window.deleteUDCTDetail = deleteUDCTDetail;
    window.adjustUDCTDetailSL = adjustUDCTDetailSL;
    window.openUniqueDHCTModal = openUniqueDHCTModal;
    window.closeUniqueDHCTModal = closeUniqueDHCTModal;
})();
