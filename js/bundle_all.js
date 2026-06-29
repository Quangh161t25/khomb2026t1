// js/config.js - Global configuration constants
const CONFIG = {
    spreadsheetId: "1cnA33cHHMhcOSaXa9l4Jeu6qw8QnXlUnEU4Bqtkj9wo",
    authSheetName: "DSNV",
    udctSheetName: "UD_CT",
    sanphamSheetName: "DS_SP",
    inventorySheetName: "TON_KHO",
    dhctSheetName: "DH_CT",
    hhbhSheetName: "HH_BH",
    hhNvDienSheetName: "HH_NV_DIEN",
    banDonSheetName: "BAN_DON",
    imgbbApiKey: "1bad1429a242d7040fda3f2cfddb3a25",
    serviceAccountEmail: "test-gia-ason@api-test-sheet-161.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3NN84hLTkQPZd\nLj7niXZTICq7nHsuTn3J6r2Paq12m70/lYSmrwh1i0EStr9bO19QM8cevGlslwGr\nWSVOLJlc6+w1HGPKvRXtA41kYV9MYIvpzIPQtkFE7Hxq71QyBARcv39Lfzze6Ioj\n3G8VBvAKFLAnCUr97GHRv+KbCTFxPZupd3PEB+xS5ZUlzdBCEZvDid3iXaaEJJ+l\nTd1apAGQHjtnDTLOkiTa8zf7X5ebALwnI9MziOdN8VyprHXGhkachPbKyrG0QwEs\n2jtiI6Y5ULsBPjNefoavH8MKU5DEAT9h0fZ7KfsKYVMDuXqmEKBs0D3B4Z6aDZQW\nwT2dDRZDAgMBAAECggEAEIuVoSzZVuFhaz1GI9ji0IacjvO50cIq7M8Zrj4/F756\nEw6PIhKENafAb7U4INm2AnzUMO8CqL9Jpxs85qUM3W4JysSByqLUiRW2184amIyb\nj7jCXfLBTQn8AbHgrUepl5d/vBmFYMgon/mqjbNiGDb4FZgEQSkie5o6fi/dWp5d\nNahbZl+WTOB/znhAfKh/zferHNxldR/ERmwOubZUerkqysWiBigc3ovpLSUof9ur\nz3hNPPp0CKQjF40xuQc6FYTHUHMLuMvp78PXuc/mYqQmZ8VOGhU+faGtZ4m+QJly\ndF5dS8U5cwKEF+ptuAUiWSahn6INb9yKn3+FcsW0UQKBgQDb8N4eWFvbgpRo/vxo\nwBN2u2TWubj6clcrq/1a+VR0njC28Can0ogJHhrFhPxVs5D/rugs3HlbyAXJFptY\nV0DZPCwBxGU5P5RbGjXWWEUXjp4ISKQD8WKfVlXNr79TqLdOg2NZBYQAi06Cpo/T\nPV9l7LSG2Tj/9WdvD7W2wvrpaQKBgQDVPjpJN6xh7+sHtSU0mjKvrqigpHbuSQ/o\nXpUaWSIpJffm5QpFPAOcTT5mHZCyllicJQIrfPSY+sH8n+sF03CUqVkV4Q2UqfOf\npFaLDB4P6SQ8iesZyF4VKFrj/cAvRJmp0e5W/DRnFkoEp+8c+nrru2+Dzm9kb7Uq\n0CiltqYAywKBgBtcfrV1to+7Ue0x84KwintV2rifyDRX7yI+tjkQFYKgf1zyyUxN\nc6D2vsvdvGqI+TvlrXqPPwW8/4NBrbeyux2LT8o0fYc+sp0WyKXOu2Gv21caelUH\nPYam/eultn6Y2Z0J2V0kw4Qx0GWOhQv5cZnDdb3k3iNxixmU8b03ynEpAoGBAKEA\n7O0fNe50QRZ+tOq0ihSPYQ55XrqnO3WNBDLynZJH8pbI1CpWF7vJrpVXOUs9rQWo\nA61mGR/wJMtiywaJEHWOL48PbzuR3jno0NcHfSMyOoPi9jlvSWncIFQH4TVPLF5F\n/Rh8L+ytrZE6YpWUoX6e9KGmGgDRPw5mQGpuL4RlAoGADe9n080SXlsUk4nHVjUz\nEfv7EBoBkgOpqb9T1foRfJl46NxmmTOYV3iGIhjwcDskEg284k4iq/gH6EEFyEBc\nVz13jzB1nBgjfezFesVQz7bA/+Wik6HZtxAxVg38BKMt+Q1tYw9wOjbGPqOn++VC\nsR2Sh8e3h3Knd6j1tceRIFU=\n-----END PRIVATE KEY-----\n",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    storageKeys: {
        currentUser: "erp_current_user",
        lastUserId: "erp_last_user_id",
        filters: "erp_filters",
        hhShopDienFilterState: "hhShopDienFilterState"
    },
    statusClasses: {
        thayThe: "bg-green-100 text-green-700",
        huy: "bg-red-100 text-red-700",
        hetHang: "bg-amber-100 text-amber-700",
        maiGoi: "bg-blue-100 text-blue-700",
        default: "bg-slate-100 text-slate-700"
    }
};

;
// js/state.js - Shared global application state
// All modules read/write these variables
let isUploading = false;
let isLoggedIn = false;
let usersData = [];
let currentUser = null;
let accessToken = null;
let tokenExpiry = 0;
let tokenRequestPromise = null;

// Data stores
let udctData = [];
let sanphamData = [];
let reportData = [];
let mergedChart = null;
let upmisaData = [];
let inventoryData = [];
let dhctData = [];
let hangHoanData = [];
let filteredHangHoanData = [];
let hhShopDienData = [];
let filteredHHShopDienData = [];
let hhBhMvdSet = new Set();
let banDonData = [];
let filteredBanDonData = [];
let banDonCurrentIndex = 0;
let banDonTimer = null;

// UI state
let currentEditRowIndex = -1;
let currentHangHoanEditIndex = -1;
let hhDrawerMode = 'edit';
let currentHHShopRowIndex = -1;
let continuousScanRunning = false;
let continuousScanStream = null;
let continuousScanLastValue = '';
let continuousScanLastAt = 0;
let currentDrawerMode = 'udct';
let udctAutoSaveTimer = null;
let suppressUDCTAutoSave = false;
let hhCatalogLoadPromise = null;

// UDCT filter/pagination state
let filteredUDCT = [];
let udctCurrentPage = 1;
const uitItemsPerPage = 500;
let udctQuickStatusTab = 'all';
const udctSelectedRows = new Set();
const udctTrangThaiOptions = ['1 THAY THẾ', '2 HỦY', '3 HÊT HÀNG', '4 MAI GỌI'];

;
// utils - Module Pattern (IIFE)
(function () {
function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">${escapeHtml(message)}</div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function clearHhInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = '';
    el.focus();
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
}

function toYMD(input) {
    if (!input) return '';
    const v = String(input).trim().split(' ')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
        const [d, m, y] = v.split('/');
        return `${y}-${m}-${d}`;
    }
    return '';
}

function getTodayYmd() {
    return new Date().toISOString().split('T')[0];
}

function formatYmdToDmy(ymd) {
    if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return '';
    const [y, m, d] = ymd.split('-');
    return `${d}/${m}/${y}`;
}

function parseDmyToYmd(dmy) {
    if (!dmy) return '';
    const v = String(dmy).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
        const [d, m, y] = v.split('/');
        return `${y}-${m}-${d}`;
    }
    return '';
}

function getCurrentWeekRangeYmd() {
    const now = new Date();
    const day = now.getDay() || 7; // Monday = 1, Sunday = 7
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() - day + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const toYmd = (date) => date.toISOString().split('T')[0];
    return { from: toYmd(start), to: toYmd(end) };
}

function getUdctSummaryByMdh(mdh) {
    const key = (mdh || '').toString().trim();
    if (!key) return { mvd: '', ma_gian: '', sku: '' };
    const rows = udctData.filter(i => (i.mdh || '').toString().trim() === key);
    const mvd = [...new Set(rows.map(i => (i.mvd || '').toString().trim()).filter(Boolean))].join(', ');
    const maGian = [...new Set(rows.map(i => (i.ma_gian || '').toString().trim()).filter(Boolean))].join(', ');
    const sku = [...new Set(rows.map(i => (i.id_sp || '').toString().trim()).filter(Boolean))].join(', ');
    return { mvd, ma_gian: maGian, sku };
}

function getUdctSummaryByMvd(mvd) {
    const key = (mvd || '').toString().trim();
    if (!key) return { mdh: '', ma_gian: '', sku: '' };
    const rows = udctData.filter(i => (i.mvd || '').toString().trim() === key);
    const mdh = [...new Set(rows.map(i => (i.mdh || '').toString().trim()).filter(Boolean))].join(', ');
    const maGian = [...new Set(rows.map(i => (i.ma_gian || '').toString().trim()).filter(Boolean))].join(', ');
    const sku = [...new Set(rows.map(i => (i.id_sp || '').toString().trim()).filter(Boolean))].join(', ');
    return { mdh, ma_gian: maGian, sku };
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

    Object.assign(window.AppModules = window.AppModules || {}, { ['utils']: true });
    window.showToast = showToast;
    window.escapeHtml = escapeHtml;
    window.clearHhInput = clearHhInput;
    window.toYMD = toYMD;
    window.getTodayYmd = getTodayYmd;
    window.formatYmdToDmy = formatYmdToDmy;
    window.parseDmyToYmd = parseDmyToYmd;
    window.getCurrentWeekRangeYmd = getCurrentWeekRangeYmd;
    window.getUdctSummaryByMdh = getUdctSummaryByMdh;
    window.getUdctSummaryByMvd = getUdctSummaryByMvd;
    window.generateRandomString = generateRandomString;
    window.generateId = generateId;
    window.generateSkeletonRows = generateSkeletonRows;
})();

;
// Centralized Google Sheets ranges and column mapping.
(function () {
    const DEFAULT_ROW_LIMIT = 10000;
    const LARGE_ROW_LIMIT = 100000;

    const SHEET_RANGES = {
        default: {
            read: 'A1:AF10000',
            clear: 'A2:AF10000',
            append: 'A:A'
        },
        UD_CT: {
            read: 'A1:AF100000',
            clear: 'A2:AF100000',
            append: 'A:A',
            columns: {
                ngay: 'E',
                mien: 'H',
                san: 'I',
                khung_h: 'J',
                ma_gian: 'K',
                mvd: 'L',
                mdh: 'M',
                sku_shop_up: 'N',
                so_luong: 'O',
                id_sp: 'P',
                id_sp_ct: 'Q',
                ten_sp: 'R',
                slg_xuat: 'S',
                tinh_trang: 'X',
                trang_thai: 'Y',
                ghi_chu: 'AA',
                don_gia: 'AE'
            }
        },
        HH_BH: { read: 'A:Z', append: 'A:Z' },
        HH_NV_DIEN: { read: 'A:L', append: 'A:L' },
        DH_CT: { read: 'A:P', append: 'A:A' },
        TON_KHO: { read: 'A:K' },
        BAN_DON: {
            read: 'A1:AF10000',
            clear: 'A2:AF10000',
            append: 'A:A',
            columns: {
                ngay: 'A',
                khung_h: 'B',
                mvd: 'C'
            }
        }
    };

    function getSheetRange(sheetName, type = 'read') {
        const key = Object.entries(CONFIG || {}).find(([name, value]) =>
            name.endsWith('SheetName') && value === sheetName
        )?.[1] || sheetName;

        const rangeConfig = SHEET_RANGES[key] || SHEET_RANGES.default;
        return rangeConfig[type] || SHEET_RANGES.default[type];
    }

    function getSheetRowLimit(sheetName) {
        return sheetName === CONFIG.udctSheetName ? LARGE_ROW_LIMIT : DEFAULT_ROW_LIMIT;
    }

    window.SHEET_RANGES = SHEET_RANGES;
    window.getSheetRange = getSheetRange;
    window.getSheetRowLimit = getSheetRowLimit;
})();

;
// api - Module Pattern (IIFE)
(function () {
// tokenRequestPromise is declared in js/state.js
async function getAccessToken() {
    if (accessToken && Date.now() < tokenExpiry - 300000) return accessToken;
    if (tokenRequestPromise) return tokenRequestPromise;

    tokenRequestPromise = (async () => {
        try {
            const header = { alg: "RS256", typ: "JWT" };
            const now = Math.floor(Date.now() / 1000);
            const payload = {
                iss: CONFIG.serviceAccountEmail,
                scope: CONFIG.scopes.join(" "),
                aud: CONFIG.tokenUrl,
                exp: now + 3600,
                iat: now
            };
            const sJWT = KJUR.jws.JWS.sign("RS256", JSON.stringify(header), JSON.stringify(payload), CONFIG.privateKey);

            try {
                const response = await fetch(CONFIG.tokenUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${sJWT}`
                });
                const data = await response.json();
                if (data.error) {
                    console.error("Token error:", data);
                    throw new Error(data.error_description || "Failed to get token");
                }
                accessToken = data.access_token;
                tokenExpiry = Date.now() + (data.expires_in * 1000);
                return accessToken;
            } catch (err) {
                console.error("Token fetch error:", err);
                alert("Không thể xác thực với Google API: " + err.message);
            }
        } finally {
            tokenRequestPromise = null;
        }
    })();
    return tokenRequestPromise;
}

async function fetchSheetData(sheetName) {
    try {
        const token = await getAccessToken();
        if (!token) return [];
        const range = typeof getSheetRange === 'function'
            ? getSheetRange(sheetName, 'read')
            : `A1:AF${sheetName === CONFIG.udctSheetName ? 100000 : 10000}`;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${sheetName}!${range}`;
        const resp = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
        if (!resp.ok) {
            console.error(`Fetch ${sheetName} failed:`, resp.status);
            return [];
        }
        const data = await resp.json();
        return data.values || [];
    } catch (err) {
        console.error(`Fetch ${sheetName} error:`, err);
        return [];
    }
}

async function fetchAuthData() {
    const data = await fetchSheetData(CONFIG.authSheetName);
    if (!data || data.length <= 1) return [];

    const headers = data[0].map(h => (h || '').toString().trim().toLowerCase());
    const getIndex = (name) => headers.indexOf(name.toLowerCase());
    const idxId = getIndex('id');
    const idxHoten = getIndex('hoten');
    const idxQuyen = getIndex('quyen');
    const idxMatKhau = getIndex('mat_khau');
    const idxTinhTrang = getIndex('tinhtrang');

    usersData = data.slice(1).map(row => ({
        id: (idxId !== -1 ? row[idxId] : row[0] || '').toString().trim(),
        name: (idxHoten !== -1 ? row[idxHoten] : row[1] || '').toString().trim(),
        role: (idxQuyen !== -1 ? row[idxQuyen] : '').toString().trim().toLowerCase() || 'user',
        password: (idxMatKhau !== -1 ? row[idxMatKhau] : '').toString(),
        tinhTrang: (idxTinhTrang !== -1 ? row[idxTinhTrang] : '').toString().trim(),
        raw: row
    })).filter(user => user.id && user.password);

    return usersData;
}

async function clearSheetData(sheetName) {
    try {
        const token = await getAccessToken();
        if (!token) return false;
        const range = typeof getSheetRange === 'function'
            ? getSheetRange(sheetName, 'clear')
            : `A2:AF${sheetName === CONFIG.udctSheetName ? 100000 : 10000}`;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${sheetName}!${range}:clear`;
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        });
        if (!resp.ok) {
            const errorText = await resp.text();
            console.error("Lỗi khi xóa dữ liệu:", errorText);
            return false;
        }
        console.log(`Đã xóa dữ liệu cũ trong ${sheetName}`);
        return true;
    } catch (err) {
        console.error("Lỗi clearSheetData:", err);
        return false;
    }
}

async function appendSheetData(sheetName, values) {
    try {
        const token = await getAccessToken();
        if (!token) return false;
        const range = typeof getSheetRange === 'function' ? getSheetRange(sheetName, 'append') : 'A:A';
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${sheetName}!${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ values: values, majorDimension: "ROWS" })
        });
        if (!resp.ok) {
            const errorText = await resp.text();
            console.error("Lỗi khi ghi dữ liệu:", errorText);
            return false;
        }
        const result = await resp.json();
        console.log("Ghi dữ liệu thành công:", result);
        return true;
    } catch (err) {
        console.error("Lỗi appendSheetData:", err);
        return false;
    }
}

async function updateSheetCell(sheetName, rowIndex, colIndex, value) {
    try {
        const token = await getAccessToken();
        if (!token) return false;

        // Convert colIndex (1-based) to Letter (A=1, B=2...)
        let colLetter = "";
        let temp = colIndex;
        while (temp > 0) {
            let mod = (temp - 1) % 26;
            colLetter = String.fromCharCode(65 + mod) + colLetter;
            temp = Math.floor((temp - mod) / 26);
        }

        const range = `${sheetName}!${colLetter}${rowIndex}`;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;

        const resp = await fetch(url, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ values: [[value]] })
        });

        return resp.ok;
    } catch (err) {
        console.error("Lỗi updateSheetCell:", err);
        return false;
    }
}

async function updateSheetValue(sheetName, range, value) {
    try {
        const token = await getAccessToken();
        if (!token) return false;
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ values: values, majorDimension: "ROWS" })
        });
        if (!resp.ok) {
            const errorText = await resp.text();
            console.error("Lỗi khi ghi dữ liệu:", errorText);
            return false;
        }
        const result = await resp.json();
        console.log("Ghi dữ liệu thành công:", result);
        return true;
    } catch (err) {
        console.error("Lỗi appendSheetData:", err);
        return false;
    }
}

async function updateSheetCell(sheetName, rowIndex, colIndex, value) {
    try {
        const token = await getAccessToken();
        if (!token) return false;

        // Convert colIndex (1-based) to Letter (A=1, B=2...)
        let colLetter = "";
        let temp = colIndex;
        while (temp > 0) {
            let mod = (temp - 1) % 26;
            colLetter = String.fromCharCode(65 + mod) + colLetter;
            temp = Math.floor((temp - mod) / 26);
        }

        const range = `${sheetName}!${colLetter}${rowIndex}`;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;

        const resp = await fetch(url, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ values: [[value]] })
        });

        return resp.ok;
    } catch (err) {
        console.error("Lỗi updateSheetCell:", err);
        return false;
    }
}

async function updateSheetValue(sheetName, range, value) {
    try {
        const token = await getAccessToken();
        if (!token) return false;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${sheetName}!${range}?valueInputOption=USER_ENTERED`;
        const resp = await fetch(url, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ values: [[value]] })
        });
        return resp.ok;
    } catch (err) {
        console.error("Lỗi updateSheetValue:", err);
        return false;
    }
}

async function updateSheetRow(sheetName, rowIndex, rowDataArray) {
    try {
        const token = await getAccessToken();
        if (!token) return false;
        
        // Cập nhật nguyên một dòng từ cột A
        const range = `${sheetName}!A${rowIndex}`;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
        
        const resp = await fetch(url, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ values: [rowDataArray] })
        });
        
        if (!resp.ok) {
            const errorText = await resp.text();
            console.error("Lỗi khi cập nhật dòng:", errorText);
            return false;
        }
        return true;
    } catch (err) {
        console.error("Lỗi updateSheetRow:", err);
        return false;
    }
}

async function batchUpdateSheetValues(batchData) {
    try {
        const token = await getAccessToken();
        if (!token) return false;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchUpdate`;
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                valueInputOption: "USER_ENTERED",
                data: batchData
            })
        });
        if (!resp.ok) {
            const errorText = await resp.text();
            console.error("Lỗi batch update:", errorText);
            return false;
        }
        return true;
    } catch (err) {
        console.error("Lỗi batchUpdateSheetValues:", err);
        return false;
    }
}

// fetchAuthData removed as login is disabled



    Object.assign(window.AppModules = window.AppModules || {}, { ['api']: true });
    window.getAccessToken = getAccessToken;
    window.fetchSheetData = fetchSheetData;
    window.fetchAuthData = fetchAuthData;
    window.clearSheetData = clearSheetData;
    window.appendSheetData = appendSheetData;
    window.updateSheetCell = updateSheetCell;
    window.updateSheetValue = updateSheetValue;
    window.updateSheetRow = updateSheetRow;
    window.batchUpdateSheetValues = batchUpdateSheetValues;
})();

;
// hanghoan - Module Pattern (IIFE)
(function () {
function fillHangHoanFilterOptions() {
    const fillSelect = (id, values, label) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = `<option value="">${label}</option>` + values.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
    };
    const renderKhoButtons = (values, currentVal) => {
        const container = document.getElementById('filterHHKhoButtons');
        if (!container) return;
        let html = `<button onclick="setHHKhoFilter('')" class="px-3 py-1.5 text-[11px] rounded-lg font-bold transition-all duration-200 ${currentVal === '' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}">Tất cả</button>`;
        values.forEach(v => {
            html += `<button onclick="setHHKhoFilter('${escapeHtml(v)}')" class="px-3 py-1.5 text-[11px] rounded-lg font-bold transition-all duration-200 ${currentVal === v ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}">${escapeHtml(v)}</button>`;
        });
        container.innerHTML = html;
    };
    const khoList = [...new Set(hangHoanData.map(i => i.kho).filter(Boolean))].sort();
    const gianList = [...new Set(hangHoanData.map(i => i.ma_gian).filter(Boolean))].sort();
    const currentKho = document.getElementById('filterHHKho')?.value || '';
    renderKhoButtons(khoList, currentKho);
    fillSelect('filterHHMaGian', gianList, 'Tất cả gian hàng');
}

function setHHKhoFilter(value) {
    const el = document.getElementById('filterHHKho');
    if (el) el.value = value;
    fillHangHoanFilterOptions();
    filterHangHoanData();
}

function setHangHoanToday() {
    const fromInput = document.getElementById('filterHHFrom');
    const toInput = document.getElementById('filterHHTo');
    if (!fromInput || !toInput) return;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
    fromInput.value = todayStr;
    toInput.value = todayStr;
    filterHangHoanData();
}

function changeHangHoanDate(which, step) {
    const input = document.getElementById(which === 'from' ? 'filterHHFrom' : 'filterHHTo');
    if (!input) return;
    if (!input.value) {
        setHangHoanToday();
        return;
    }
    const parts = input.value.split('-');
    if (parts.length !== 3) return;
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    dt.setDate(dt.getDate() + step);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    input.value = `${y}-${m}-${d}`;
    filterHangHoanData();
}

function openImagePreview(url) {
    if (!url) return;
    const overlay = document.getElementById('imagePreviewOverlay');
    const image = document.getElementById('imagePreviewContent');
    if (!overlay || !image) return;
    image.src = url;
    overlay.classList.remove('hidden');
}

function closeImagePreview() {
    const overlay = document.getElementById('imagePreviewOverlay');
    const image = document.getElementById('imagePreviewContent');
    if (!overlay || !image) return;
    overlay.classList.add('hidden');
    image.src = '';
}


function renderHhKhoButtons(value) {
    const current = (value || '').toString().trim().toUpperCase() || 'KHO';
    const buttons = document.querySelectorAll('#hhEditKhoButtons button');
    buttons.forEach(btn => {
        const active = btn.textContent.trim().toUpperCase() === current;
        btn.classList.toggle('bg-slate-100', active);
        btn.classList.toggle('bg-white', !active);
    });
}

function setHhKho(value) {
    const normalized = (value || 'KHO').toString().trim().toUpperCase();
    document.getElementById('hhEditKho').value = normalized;
    renderHhKhoButtons(normalized);
}

function populateHhFormOptions() {
    const maGianList = document.getElementById('hhMaGianList');
    const skuList = document.getElementById('hhSkuList');
    if (maGianList) {
        const uniqueMaGian = [...new Set(hangHoanData.map(i => (i.ma_gian || '').toString().trim()).filter(Boolean))].sort();
        maGianList.innerHTML = uniqueMaGian.map(v => `<option value="${escapeHtml(v)}">`).join('');
    }
    if (skuList) {
        const uniqueSku = [...new Set(sanphamData.map(i => (i.id_sp || '').toString().trim()).filter(Boolean))].sort();
        skuList.innerHTML = uniqueSku.map(v => `<option value="${escapeHtml(v)}">`).join('');
    }
    handleHhSkuChange();

    // HH SHOP ĐIỀN suggestions
    const hhShopMaGianList = document.getElementById('hhShopMaGianList');
    const hhShopMaGianFilterList = document.getElementById('hhShopMaGianFilterList');
    const hhShopSkuList = document.getElementById('hhShopSkuList');
    const uniqueMaGian = [...new Set([
        ...hangHoanData.map(i => (i.ma_gian || '').toString().trim()),
        ...hhShopDienData.map(i => (i.ma_gian || '').toString().trim()),
        ...udctData.map(i => (i.ma_gian || '').toString().trim())
    ].filter(Boolean))].sort();
    if (hhShopMaGianList) {
        hhShopMaGianList.innerHTML = uniqueMaGian.map(v => `<option value="${escapeHtml(v)}">`).join('');
    }
    if (hhShopMaGianFilterList) {
        hhShopMaGianFilterList.innerHTML = uniqueMaGian.map(v => `<option value="${escapeHtml(v)}">`).join('');
    }
    if (hhShopSkuList) {
        const uniqueSku = [...new Set([
            ...sanphamData.map(i => (i.id_sp || '').toString().trim()),
            ...hhShopDienData.map(i => (i.sku || '').toString().trim())
        ].filter(Boolean))].sort();
        hhShopSkuList.innerHTML = uniqueSku.map(v => `<option value="${escapeHtml(v)}">`).join('');
    }
}

function ensureHhCatalogLoaded(callback) {
    if (sanphamData && sanphamData.length > 0) {
        if (typeof callback === 'function') callback();
        return;
    }

    if (!hhCatalogLoadPromise) {
        hhCatalogLoadPromise = typeof loadSanphamData === 'function' ? loadSanphamData() : Promise.resolve().finally(() => {
            hhCatalogLoadPromise = null;
        });
    }

    hhCatalogLoadPromise.then(() => {
        if (typeof callback === 'function') callback();
    }).catch(error => {
        console.error('HH catalog reload error:', error);
    });
}

function getHhSkuMatches(value, limit = 50) {
    const search = (value || '').toString().trim().toLowerCase();
    const seen = new Set();
    const matches = [];

    sanphamData.forEach(item => {
        const sku = (item.id_sp || '').toString().trim();
        if (!sku || seen.has(sku)) return;

        const skuLower = sku.toLowerCase();
        const nameLower = (item.ten_sp || '').toString().toLowerCase();
        if (!search || skuLower.includes(search) || nameLower.includes(search)) {
            seen.add(sku);
            matches.push({ sku, ten: item.ten_sp || '' });
        }
    });

    return matches.sort((a, b) => a.sku.localeCompare(b.sku)).slice(0, limit);
}

function renderHhSkuSuggestions(forceShow = false) {
    const input = document.getElementById('hhEditSKU');
    const sugBox = document.getElementById('hhSkuSuggestions');
    if (!input || !sugBox) return;

    const value = input.value || '';
    if ((!sanphamData || sanphamData.length === 0) && (forceShow || value.trim())) {
        sugBox.innerHTML = '<div class="suggestion-item"><span class="item-name">Đang tải danh mục SKU...</span></div>';
        sugBox.classList.remove('hidden');
        ensureHhCatalogLoaded(() => renderHhSkuSuggestions(forceShow));
        return;
    }

    const suggestions = getHhSkuMatches(value);

    if ((forceShow || value.trim()) && suggestions.length > 0) {
        sugBox.innerHTML = suggestions.map(item => `
            <div class="suggestion-item" onclick="setHhSku('${escapeHtml(item.sku)}')">
                <span class="item-code">${escapeHtml(item.sku)}</span>
                <span class="item-name">${escapeHtml(item.ten_sp)}</span>
            </div>
        `).join('');
        sugBox.classList.remove('hidden');
    } else {
        sugBox.innerHTML = '';
        sugBox.classList.add('hidden');
    }
}

function setHhSku(value) {
    const input = document.getElementById('hhEditSKU');
    if (!input) return;

    input.value = value;
    const sugBox = document.getElementById('hhSkuSuggestions');
    if (sugBox) sugBox.classList.add('hidden');

    const skuCtInput = document.getElementById('hhEditSKUCT');
    if (skuCtInput) skuCtInput.value = '';
    handleHhSkuChange();

    if (skuCtInput) {
        skuCtInput.focus();
        handleHhSkuCtChange();
    }
}

function handleHhSkuChange() {
    const sku = (document.getElementById('hhEditSKU')?.value || '').toString().trim().toUpperCase();
    const sugBox = document.getElementById('hhSkuCtSuggestions');
    const skuCtBtns = document.getElementById('hhSkuCtButtons');
    renderHhSkuSuggestions(false);

    if ((!sanphamData || sanphamData.length === 0) && sku) {
        ensureHhCatalogLoaded(handleHhSkuChange);
        return;
    }

    if (sugBox) {
        const filteredItems = sanphamData.filter(item =>
            (item.id_sp || '').toUpperCase() === sku ||
            (item.sku_con || '').toUpperCase().startsWith(sku)
        );

        if (sku && filteredItems.length > 0) {
            sugBox.innerHTML = filteredItems.map(item => `
                <div class="suggestion-item" onclick="setHhSkuCt('${escapeHtml(item.sku_con)}')">
                    <span class="item-code">${escapeHtml(item.sku_con)}</span>
                    <span class="item-name">${escapeHtml(item.ten_sp)}</span>
                </div>
            `).join('');
            // sugBox.classList.remove('hidden'); // Để người dùng tự focus hoặc gõ SKU CT thì hiện
        } else {
            sugBox.innerHTML = '';
            sugBox.classList.add('hidden');
        }

        // Hiển thị dạng nút chọn nhanh
        if (skuCtBtns) {
            const uniqueIds = [...new Set(filteredItems.map(i => i.sku_con))].slice(0, 10);
            if (sku && uniqueIds.length > 0) {
                skuCtBtns.innerHTML = uniqueIds.map(v => `
                    <button type="button" onclick="setHhSkuCt('${escapeHtml(v)}')" 
                        class="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-bold hover:bg-blue-100 transition-all">
                        ${escapeHtml(v)}
                    </button>
                `).join('');
            } else {
                skuCtBtns.innerHTML = '';
            }
        }
    }
}

function setHhSkuCt(value) {
    const input = document.getElementById('hhEditSKUCT');
    if (input) {
        input.value = value;
        handleHhSkuCtChange();
    }
    // Ẩn gợi ý và xóa các nút sau khi chọn
    const sugBox = document.getElementById('hhSkuCtSuggestions');
    if (sugBox) sugBox.classList.add('hidden');
    const skuCtBtns = document.getElementById('hhSkuCtButtons');
    if (skuCtBtns) skuCtBtns.innerHTML = '';
}

function handleHhSkuCtChange(forceShow = false) {
    const skuCtInput = document.getElementById('hhEditSKUCT');
    if (!skuCtInput) return;

    const val = skuCtInput.value.trim();
    const sku = (document.getElementById('hhEditSKU')?.value || '').toString().trim().toLowerCase();
    const sugBox = document.getElementById('hhSkuCtSuggestions');

    if ((!sanphamData || sanphamData.length === 0) && (val || sku || forceShow)) {
        if (sugBox) {
            sugBox.innerHTML = '<div class="suggestion-item"><span class="item-name">Đang tải danh mục SKU CT...</span></div>';
            sugBox.classList.remove('hidden');
        }
        ensureHhCatalogLoaded(() => handleHhSkuCtChange(forceShow));
        return;
    }

    if (sugBox) {
        if (val.length >= 1 || sku || forceShow) {
            const search = val.toLowerCase();
            // Tìm kiếm theo cả ID và Tên
            const suggestions = sanphamData.filter(item =>
                search
                    ? (item.sku_con || '').toLowerCase().includes(search) ||
                    (item.ten_sp || '').toLowerCase().includes(search)
                    : sku
                        ? (item.id_sp || '').toLowerCase() === sku ||
                        (item.sku_con || '').toLowerCase().startsWith(sku)
                        : true
            ).slice(0, 50);

            if (suggestions.length > 0) {
                sugBox.innerHTML = suggestions.map(item => `
                    <div class="suggestion-item" onclick="setHhSkuCt('${escapeHtml(item.sku_con)}')">
                        <span class="item-code">${escapeHtml(item.sku_con)}</span>
                        <span class="item-name">${escapeHtml(item.ten_sp)}</span>
                    </div>
                `).join('');
                sugBox.classList.remove('hidden');
            } else {
                sugBox.innerHTML = '';
                sugBox.classList.add('hidden');
            }
        } else {
            sugBox.innerHTML = '';
            sugBox.classList.add('hidden');
        }
    }

    if (!val) return;

    // Kiểm tra nếu có mã khớp hoàn toàn để điền các thông tin khác
    const match = sanphamData.find(item => (item.sku_con || '').toString().toUpperCase() === val.toUpperCase());
    if (match) {
        if (!document.getElementById('hhEditSKU').value) {
            document.getElementById('hhEditSKU').value = match.id_sp || match.sku_con.substring(0, 4);
        }
        document.getElementById('hhEditTenSP').value = match.ten_sp || document.getElementById('hhEditTenSP').value;
    }
}

async function scanQrToInput(inputId) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;';

    const video = document.createElement('video');
    video.style.cssText = 'max-width:90vw;max-height:70vh;border-radius:12px;border:3px solid #fff;box-shadow:0 0 20px rgba(0,0,0,0.5);';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = 'Hủy / Tắt Camera';
    closeBtn.style.cssText = 'margin-top:20px;padding:12px 24px;background:#ef4444;color:#fff;border:none;border-radius:30px;font-weight:bold;font-size:14px;cursor:pointer;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); transition: all 0.2s;';
    closeBtn.onmouseover = () => closeBtn.style.transform = 'scale(1.05)';
    closeBtn.onmouseout = () => closeBtn.style.transform = 'scale(1)';

    overlay.appendChild(video);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    let stream;
    let isStopped = false;

    closeBtn.onclick = () => {
        isStopped = true;
        if (stream) stream.getTracks().forEach(t => t.stop());
        overlay.remove();
    };

    if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
        const manual = prompt('Thiết bị không hỗ trợ quét QR tự động. Dán mã tại đây:');
        if (manual) {
            inputEl.value = manual.trim();
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        overlay.remove();
        return;
    }

    try {
        const detector = new BarcodeDetector({ formats: ['qr_code', 'code_128', 'ean_13'] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        await video.play();

        while (!isStopped) {
            const barcodes = await detector.detect(video);
            if (barcodes.length) {
                inputEl.value = (barcodes[0].rawValue || '').trim();
                inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                inputEl.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
            await new Promise(r => setTimeout(r, 150));
        }
    } catch (err) {
        console.error('QR scan error:', err);
        const manual = prompt('Lỗi camera / Không quét được. Dán mã tại đây:');
        if (manual) {
            inputEl.value = manual.trim();
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
    } finally {
        if (stream) stream.getTracks().forEach(t => t.stop());
        if (overlay.parentNode) overlay.remove();
    }
}

function handleHhMvdInputChange(val) {
    const noticeEl = document.getElementById('hhMvdDuplicateNotice');
    const mvd = (val || '').toString().trim();
    if (!mvd) {
        if (noticeEl) noticeEl.classList.add('hidden');
        return;
    }

    // 1. So sánh với sheet UD_CT (Dữ liệu đơn hàng) để tự động điền thông tin
    const udctMatch = udctData.find(item => (item.mvd || '').toString().trim() === mvd);
    if (udctMatch && hhDrawerMode === 'create') {
        const maGianEl = document.getElementById('hhEditMaGian');
        const skuEl = document.getElementById('hhEditSKU');
        const skuCtEl = document.getElementById('hhEditSKUCT');
        const slgEl = document.getElementById('hhEditSLG');
        const tenSpEl = document.getElementById('hhEditTenSP');

        if (maGianEl && !maGianEl.value) maGianEl.value = (udctMatch.ma_gian || '').toString().toUpperCase();
        if (skuEl && !skuEl.value) skuEl.value = (udctMatch.id_sp || '').toString().toUpperCase();
        if (skuCtEl && !skuCtEl.value) {
            skuCtEl.value = (udctMatch.id_sp_ct || '').toString().toUpperCase();
            // Kích hoạt gợi ý/logic khớp SKU CT
            if (typeof handleHhSkuCtChange === 'function') handleHhSkuCtChange();
        }
        if (slgEl && (!slgEl.value || slgEl.value === '1')) slgEl.value = udctMatch.slg_xuat || '';
        if (tenSpEl && !tenSpEl.value) tenSpEl.value = udctMatch.ten_sp || '';
    }

    // 1.b So sánh thêm với sheet HH_NV_DIEN (hhShopDienData)
    const hhShopMatch = hhShopDienData.find(item => (item.mvd_tra || '').toString().trim() === mvd);
    if (hhShopMatch && hhDrawerMode === 'create') {
        const mvd2El = document.getElementById('hhEditMVD2');
        const maGianEl = document.getElementById('hhEditMaGian');
        const skuEl = document.getElementById('hhEditSKU');
        const slgEl = document.getElementById('hhEditSLG');

        if (mvd2El && !mvd2El.value) mvd2El.value = (hhShopMatch.mvd || '').toString().toUpperCase();
        if (maGianEl && !maGianEl.value) maGianEl.value = (hhShopMatch.ma_gian || '').toString().toUpperCase();
        if (skuEl && !skuEl.value) skuEl.value = (hhShopMatch.sku_tra || '').toString().toUpperCase();
        if (slgEl) slgEl.value = '1';
    }

    // 2. Tìm trong dữ liệu hàng hoàn hiện có để cảnh báo trùng (như cũ)
    if (!noticeEl) return;
    const duplicate = hangHoanData.find(item => {
        const isDuplicateMvd = (item.mvd || '').toString().trim() === mvd || (item.mvd_2 || '').toString().trim() === mvd;
        if (!isDuplicateMvd) return false;

        if (hhDrawerMode === 'edit' && currentHangHoanEditIndex !== -1) {
            const currentItem = hangHoanData[currentHangHoanEditIndex];
            return item !== currentItem;
        }
        return true;
    });

    if (duplicate) {
        noticeEl.textContent = `⚠️ MVD điền vào ngày ${duplicate.ngay_nhan || '?'}`;
        noticeEl.classList.remove('hidden');
    } else {
        noticeEl.classList.add('hidden');
    }
}

async function scanQrForHhMvd() {
    await scanQrToInput('hhEditMVD');
}

async function scanQrForHhMvd2() {
    await scanQrToInput('hhEditMVD2');
}

async function uploadImageHh(input, index) {
    const file = input.files[0];
    if (!file) return;

    // Chặn tự động lưu trong khi đang upload
    isUploading = true;

    const statusLabel = document.getElementById('saveStatus');
    if (statusLabel) {
        statusLabel.textContent = "Đang tải ảnh lên ImgBB...";
        statusLabel.style.display = 'block';
    }

    try {
        const formData = new FormData();
        formData.append('image', file);

        // 1. Gửi ảnh lên ImgBB
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${CONFIG.imgbbApiKey}`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            const directUrl = result.data.url;

            // 2. Cập nhật link vào ô Input tương ứng
            const targetInput = document.getElementById(`hhEditAnh${index}`);
            if (targetInput) {
                targetInput.value = directUrl;
            }

            // 3. Cập nhật preview và lưu dữ liệu
            refreshHhImagePreviews();
            isUploading = false;
            await saveHhDetail();
        } else {
            alert("Lỗi tải ảnh lên ImgBB: " + (result.error?.message || "Không xác định"));
            isUploading = false;
            refreshHhImagePreviews();
        }
    } catch (err) {
        console.error("Upload error:", err);
        alert("Lỗi kết nối khi tải ảnh: " + err.message);
        isUploading = false;
        refreshHhImagePreviews();
    } finally {
        if (statusLabel) {
            statusLabel.style.display = 'none';
        }
        input.value = ""; // Reset input file
    }
}

function refreshHhImagePreviews() {
    // Luôn quét qua 3 ô tiềm năng để đảm bảo đồng bộ
    for (let i = 1; i <= 3; i++) {
        const urlEl = document.getElementById(`hhEditAnh${i}`);
        const preview = document.getElementById(`hhImagePreview${i}`);
        if (!urlEl || !preview) continue;
        const url = urlEl.value;
        if (url) {
            preview.innerHTML = `
                <img src="${url}" class="w-full h-full object-cover">
                <button onclick="event.stopPropagation(); removeHhImage(${i})" class="absolute top-0 right-0 p-1.5 bg-rose-500 text-white rounded-bl-lg hover:bg-rose-600 transition-all shadow-md">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            `;
            preview.classList.remove('border-dashed');
            preview.classList.add('border-solid', 'border-primary/20');
        } else {
            preview.innerHTML = `
                <div class="text-center p-2">
                    <svg class="w-8 h-8 mx-auto text-slate-300 group-hover:text-primary transition-colors"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="text-[10px] text-slate-400 block mt-1 font-bold">Chạm để tải ảnh</span>
                </div>
            `;
            preview.classList.add('border-dashed');
            preview.classList.remove('border-solid', 'border-primary/20');
        }
    }
}

function removeHhImage(index) {
    const el = document.getElementById(`hhEditAnh${index}`);
    if (el) el.value = '';
    refreshHhImagePreviews();
}

async function appendHangHoanQuickByMvd(mvdRaw) {
    const mvd = (mvdRaw || '').toString().trim();
    if (!mvd) return false;
    const token = await getAccessToken();
    if (!token) return false;
    const today = new Date().toISOString().split('T')[0];

    // Tự động tìm kiếm thông tin như khi nhập tay
    let mvd2 = '';
    let maGian = '';
    let sku = '';
    let skuCt = '';
    let slg = '1';
    let tenSp = '';

    // 1. Tìm trong UD_CT (Dữ liệu đơn hàng)
    const udctMatch = udctData.find(item => (item.mvd || '').toString().trim() === mvd);
    if (udctMatch) {
        maGian = (udctMatch.ma_gian || '').toString().toUpperCase();
        sku = (udctMatch.id_sp || '').toString().toUpperCase();
        skuCt = (udctMatch.id_sp_ct || '').toString().toUpperCase();
        slg = udctMatch.slg_xuat || '1';
        tenSp = udctMatch.ten_sp || '';
    }

    // 2. Tìm trong HH_NV_DIEN (Dữ liệu shop điền)
    const hhShopMatch = hhShopDienData.find(item => (item.mvd_tra || '').toString().trim() === mvd);
    if (hhShopMatch) {
        mvd2 = (hhShopMatch.mvd || '').toString().toUpperCase();
        if (!maGian) maGian = (hhShopMatch.ma_gian || '').toString().toUpperCase();
        if (!sku) sku = (hhShopMatch.sku_tra || '').toString().toUpperCase();
        slg = '1';
    }

    const appendValues = [[
        `${Date.now()}`,
        today,
        mvd,
        mvd2,
        maGian,
        '', // anh_1
        '', // anh_2
        '', // anh_3
        '', // ngay_xly
        sku,
        skuCt,
        slg,
        tenSp,
        '', // ghi_chu
        '', // tinh_trang
        '', // trang_thai
        '', // sku_slg
        '', // id_nv
        '', // udt
        (mvd && maGian) ? `${mvd}-${maGian}` : '', // mvd_gian
        'KHO',
        '', // lb3
        '', // id_dh
        '', // id_dh_ct
        '', // stt
        '' // danh_dau
    ]];
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${CONFIG.hhbhSheetName}!A:A:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const appendResp = await fetch(appendUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: appendValues })
    });
    return appendResp.ok;
}

function stopContinuousMvdScan() {
    continuousScanRunning = false;
    if (continuousScanStream) {
        continuousScanStream.getTracks().forEach(t => t.stop());
        continuousScanStream = null;
    }
    const root = document.getElementById('continuousScanOverlay');
    if (root) root.remove();
}

async function startContinuousMvdScan() {
    if (continuousScanRunning) return;
    if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
        alert('Thiết bị chưa hỗ trợ quét QR liên tục tự động.');
        return;
    }
    const overlay = document.createElement('div');
    overlay.id = 'continuousScanOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px;';
    overlay.innerHTML = `
                <div style="color:#fff;font-weight:700;font-size:18px;">Quét liên tục MVD</div>
                <div id="continuousScanStatus" style="color:#cbd5e1;font-size:13px;">Đang khởi động camera...</div>
                <video id="continuousScanVideo" style="max-width:94vw;max-height:72vh;border-radius:10px;border:2px solid rgba(255,255,255,.55);"></video>
                <div style="display:flex;gap:8px;">
                    <button id="continuousStopBtn" style="padding:8px 14px;border-radius:8px;border:none;background:#ef4444;color:#fff;font-weight:700;cursor:pointer;">Dừng quét</button>
                </div>
            `;
    document.body.appendChild(overlay);
    const statusEl = document.getElementById('continuousScanStatus');
    const video = document.getElementById('continuousScanVideo');
    document.getElementById('continuousStopBtn')?.addEventListener('click', stopContinuousMvdScan);
    continuousScanRunning = true;
    continuousScanLastValue = '';
    continuousScanLastAt = 0;
    try {
        const detector = new BarcodeDetector({ formats: ['qr_code'] });
        continuousScanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = continuousScanStream;
        video.setAttribute('playsinline', 'true');
        await video.play();
        let okCount = 0;
        while (continuousScanRunning) {
            const codes = await detector.detect(video);
            if (codes.length) {
                const rawValue = (codes[0].rawValue || '').trim();
                const now = Date.now();
                // Chống lưu trùng liên tiếp do camera giữ khung hình.
                if (rawValue && (rawValue !== continuousScanLastValue || (now - continuousScanLastAt) > 2000)) {
                    continuousScanLastValue = rawValue;
                    continuousScanLastAt = now;
                    statusEl.textContent = `Đang lưu MVD: ${rawValue} ...`;
                    const ok = await appendHangHoanQuickByMvd(rawValue);
                    if (ok) {
                        okCount += 1;
                        statusEl.textContent = `Đã lưu ${okCount} mã. MVD mới nhất: ${rawValue}`;
                    } else {
                        statusEl.textContent = `Lưu lỗi với mã: ${rawValue}. Tiếp tục quét...`;
                    }
                }
            }
            await new Promise(r => setTimeout(r, 160));
        }
    } catch (error) {
        console.error('Continuous scan error:', error);
        alert('Không thể khởi tạo quét liên tục MVD.');
    } finally {
        stopContinuousMvdScan();
        // Làm mới bảng để nhìn thấy dữ liệu vừa quét.
        await fetchHangHoanData();
    }
}

async function startHHSearchQrScan() {
    if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
        alert('Thiết bị chưa hỗ trợ quét QR/Barcode.');
        return;
    }
    const overlay = document.createElement('div');
    overlay.id = 'qrSearchOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;';
    overlay.innerHTML = `
        <div style="color:#fff;font-weight:bold;font-size:18px;">QUÉT MVD ĐỂ TÌM KIẾM</div>
        <video id="qrSearchVideo" style="width:90vw;max-height:65vh;border:3px solid #fff;border-radius:16px;object-fit:cover;"></video>
        <button id="qrSearchCloseBtn" style="padding:12px 30px;background:#ef4444;color:#fff;border-radius:12px;border:none;font-weight:bold;font-size:16px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">ĐÓNG</button>
    `;
    document.body.appendChild(overlay);
    const video = document.getElementById('qrSearchVideo');
    let running = true;
    let stream = null;

    document.getElementById('qrSearchCloseBtn').onclick = () => {
        running = false;
        if (stream) stream.getTracks().forEach(t => t.stop());
        overlay.remove();
    };

    try {
        const detector = new BarcodeDetector({ formats: ['qr_code', 'code_128', 'ean_13', 'code_39'] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        await video.play();

        while (running) {
            const codes = await detector.detect(video);
            if (codes.length) {
                const val = (codes[0].rawValue || '').trim();
                if (val) {
                    const searchInput = document.getElementById('filterHHSearch');
                    if (searchInput) {
                        searchInput.value = val;
                        filterHangHoanData();
                        // Thông báo ngắn gọn
                        statusNotify('Đã nhập mã: ' + val, 'success');
                    }
                    running = false;
                    break;
                }
            }
            await new Promise(r => setTimeout(r, 150));
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi camera: ' + err.message);
    } finally {
        if (stream) stream.getTracks().forEach(t => t.stop());
        overlay.remove();
    }
}

async function fetchHangHoanData() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const tbody = document.getElementById('hangHoanTableBody');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');
    if (tbody) tbody.innerHTML = `<tr><td colspan="11" class="text-center py-8 text-slate-500">Đang tải dữ liệu...</td></tr>`;

    try {
        const token = await getAccessToken();
        if (!token) return;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${CONFIG.hhbhSheetName}!A:Z`;
        const response = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
        const result = await response.json();

        if (result.values && result.values.length > 1) {
            hangHoanData = result.values.slice(1).map((row, idx) => ({
                rowIndex: idx + 2,
                id: row[0] || '',
                ngay_nhan: toYMD(row[1] || ''),
                mvd: row[2] || '',
                mvd_2: row[3] || '',
                ma_gian: row[4] || '',
                anh_1: row[5] || '',
                anh_2: row[6] || '',
                anh_3: row[7] || '',
                ngay_xly: row[8] || '',
                sku: row[9] || '',
                sku_ct: row[10] || '',
                slg: row[11] || '',
                ten_sp: row[12] || '',
                ghi_chu: row[13] || '',
                tinh_trang: row[14] || '',
                trang_thai: row[15] || '',
                sku_slg: row[16] || '',
                id_nv: row[17] || '',
                udt: row[18] || '',
                mvd_gian: row[19] || '',
                kho: row[20] || '',
                lb3: row[21] || '',
                id_dh: row[22] || '',
                id_dh_ct: row[23] || '',
                stt: row[24] || '',
                danh_dau: row[25] || ''
            })).sort((a, b) => b.rowIndex - a.rowIndex);
            setHangHoanToday();
            fillHangHoanFilterOptions();
            populateHhFormOptions();
            filterHangHoanData();
        } else {
            hangHoanData = [];
            filteredHangHoanData = [];
            if (tbody) tbody.innerHTML = `<tr><td colspan="11" class="text-center py-8 text-slate-500">Không có dữ liệu hàng hoàn.</td></tr>`;
        }
    } catch (err) {
        console.error("Lỗi tải HH_BH:", err);
        if (tbody) tbody.innerHTML = `<tr><td colspan="11" class="text-center py-8 text-slate-500">Không thể tải dữ liệu từ HH_BH.</td></tr>`;
    } finally {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
}

function filterHangHoanData() {
    const fFrom = document.getElementById('filterHHFrom')?.value || '';
    const fTo = document.getElementById('filterHHTo')?.value || '';
    const fKho = document.getElementById('filterHHKho')?.value || '';
    const fGian = document.getElementById('filterHHMaGian')?.value || '';
    const search = (document.getElementById('filterHHSearch')?.value || '').toLowerCase().trim();

    filteredHangHoanData = hangHoanData.filter(item => {
        const ngay = toYMD(item.ngay_nhan);
        if (fFrom && ngay < fFrom) return false;
        if (fTo && ngay > fTo) return false;
        if (fKho && item.kho !== fKho) return false;
        if (fGian && item.ma_gian !== fGian) return false;
        if (search) {
            const rowText = `${item.mvd || ''} ${item.mvd_2 || ''} ${item.ma_gian || ''} ${item.sku || ''} ${item.sku_ct || ''} ${item.ten_sp || ''} ${item.tinh_trang || ''}`.toLowerCase();
            if (!rowText.includes(search)) return false;
        }
        return true;
    }).sort((a, b) => toYMD(b.ngay_nhan).localeCompare(toYMD(a.ngay_nhan)));
    renderHangHoanTable();
}

function openHhDetail(index) {
    const item = filteredHangHoanData[index];
    const actualIndex = hangHoanData.indexOf(item);
    if (!item || actualIndex < 0) return;
    hhDrawerMode = 'edit';
    currentHangHoanEditIndex = actualIndex;
    const isKinhDoanh = currentUser && currentUser.role === 'kinhdoanh';
    document.getElementById('hhDrawerTitle').textContent = 'Chi tiết hàng hoàn';
    document.getElementById('hhSaveButton').textContent = isKinhDoanh ? 'Lưu MVD 2' : 'Lưu thay đổi';
    document.getElementById('hhDrawerRowId').textContent = `Row ID: ${item.id || item.ngay_nhan || '-'}`;
    document.getElementById('hhEditMVD').value = item.mvd || '';
    document.getElementById('hhEditMVD2').value = item.mvd_2 || '';
    document.getElementById('hhEditMaGian').value = item.ma_gian || '';
    document.getElementById('hhEditAnh1').value = item.anh_1 || '';
    document.getElementById('hhEditAnh2').value = item.anh_2 || '';
    document.getElementById('hhEditAnh3').value = item.anh_3 || '';
    document.getElementById('hhEditSKU').value = item.sku || '';
    document.getElementById('hhEditSKUCT').value = item.sku_ct || '';
    document.getElementById('hhEditSLG').value = item.slg || '';
    document.getElementById('hhEditTinhTrang').value = item.tinh_trang || '';
    document.getElementById('hhEditTenSP').value = item.ten_sp || '';
    document.getElementById('hhEditKho').value = item.kho || '';
    populateHhFormOptions();
    renderHhKhoButtons(item.kho || 'KHO');
    refreshHhImagePreviews();
    const noticeEl = document.getElementById('hhMvdDuplicateNotice');
    if (noticeEl) noticeEl.classList.add('hidden');
    ['hhEditMVD', 'hhEditMaGian', 'hhEditSKU', 'hhEditSKUCT', 'hhEditSLG', 'hhEditTinhTrang', 'hhEditTenSP', 'hhEditKho'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = isKinhDoanh;
    });
    document.querySelectorAll('#hhEditKhoButtons button').forEach(btn => btn.disabled = isKinhDoanh);
    const footer = document.querySelector('#hhDrawer .pt-4.border-t.border-slate-200.flex.gap-3');
    if (footer) footer.style.display = '';
    document.getElementById('hhDrawerOverlay').classList.remove('hidden');
    document.getElementById('hhDrawer').classList.add('open');
}

function openNewHangHoanDrawer() {
    if (currentUser && currentUser.role === 'kinhdoanh') {
        alert('Tài khoản KINHDOANH không được thêm mới Dữ liệu Hàng hoàn.');
        return;
    }
    hhDrawerMode = 'create';
    currentHangHoanEditIndex = -1;
    document.getElementById('hhDrawerTitle').textContent = 'Thêm sản phẩm hàng hoàn';
    document.getElementById('hhSaveButton').textContent = 'Thêm mới';
    document.getElementById('hhDrawerRowId').textContent = `Row ID: NEW-${Date.now()}`;
    document.getElementById('hhEditMVD').value = '';
    document.getElementById('hhEditMVD2').value = '';
    document.getElementById('hhEditMaGian').value = '';
    document.getElementById('hhEditAnh1').value = '';
    document.getElementById('hhEditAnh2').value = '';
    document.getElementById('hhEditAnh3').value = '';
    document.getElementById('hhEditSKU').value = '';
    document.getElementById('hhEditSKUCT').value = '';
    document.getElementById('hhEditSLG').value = '1';
    document.getElementById('hhEditTinhTrang').value = '';
    document.getElementById('hhEditTenSP').value = '';
    document.getElementById('hhEditKho').value = 'KHO';
    populateHhFormOptions();
    renderHhKhoButtons('KHO');
    refreshHhImagePreviews();
    const noticeEl = document.getElementById('hhMvdDuplicateNotice');
    if (noticeEl) noticeEl.classList.add('hidden');
    ['hhEditMVD', 'hhEditMaGian', 'hhEditSKU', 'hhEditSKUCT', 'hhEditSLG', 'hhEditTinhTrang', 'hhEditTenSP', 'hhEditKho'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
    });
    document.querySelectorAll('#hhEditKhoButtons button').forEach(btn => btn.disabled = false);
    const footer = document.querySelector('#hhDrawer .pt-4.border-t.border-slate-200.flex.gap-3');
    if (footer) footer.style.display = '';
    document.getElementById('hhDrawerOverlay').classList.remove('hidden');
    document.getElementById('hhDrawer').classList.add('open');

    // Tự động focus vào ô MVD
    setTimeout(() => {
        const mvdInput = document.getElementById('hhEditMVD');
        if (mvdInput) mvdInput.focus();
    }, 400);
}

function closeHhDetailDrawer() {
    document.getElementById('hhDrawerOverlay').classList.add('hidden');
    document.getElementById('hhDrawer').classList.remove('open');
    currentHangHoanEditIndex = -1;
    hhDrawerMode = 'edit';
}

async function saveHhDetail() {
    if (isUploading) {
        console.warn('Đang upload ảnh, vui lòng đợi...');
        return;
    }
    const isKinhDoanh = currentUser && currentUser.role === 'kinhdoanh';
    if (isKinhDoanh) {
        if (hhDrawerMode === 'create' || currentHangHoanEditIndex === -1) {
            alert('Tài khoản KINHDOANH chỉ được sửa MVD 2 trên dòng Hàng hoàn đã có.');
            return;
        }
        const item = hangHoanData[currentHangHoanEditIndex];
        if (!item) return;
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.classList.remove('hidden');
        try {
            const token = await getAccessToken();
            const rowIndex = item.rowIndex || (hangHoanData.indexOf(item) + 2);
            const mvd2 = document.getElementById('hhEditMVD2').value || '';
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchUpdate`;
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    valueInputOption: 'USER_ENTERED',
                    data: [{ range: `${CONFIG.hhbhSheetName}!D${rowIndex}`, values: [[mvd2]] }]
                })
            });
            if (resp.ok) {
                item.mvd_2 = mvd2;
                filterHangHoanData();
                closeHhDetailDrawer();
                showToast('Đã lưu MVD 2 thành công!', 'success');
            } else {
                const errText = await resp.text();
                console.error('Save HH MVD 2 error:', errText);
                alert('Lỗi khi lưu MVD 2.');
            }
        } catch (err) {
            console.error('Save HH MVD 2 Error:', err);
            alert('Đã xảy ra lỗi khi lưu MVD 2: ' + (err.message || 'Lỗi không xác định'));
        } finally {
            loadingOverlay.classList.add('hidden');
        }
        return;
    }
    const isCreateMode = hhDrawerMode === 'create';
    if (!isCreateMode && currentHangHoanEditIndex === -1) return;
    const item = !isCreateMode ? hangHoanData[currentHangHoanEditIndex] : null;
    if (!isCreateMode && !item) return;
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden');
    try {
        const token = await getAccessToken();
        const newData = {
            mvd: document.getElementById('hhEditMVD').value,
            mvd_2: document.getElementById('hhEditMVD2').value,
            ma_gian: document.getElementById('hhEditMaGian').value,
            sku: document.getElementById('hhEditSKU').value,
            sku_ct: document.getElementById('hhEditSKUCT').value,
            slg: document.getElementById('hhEditSLG').value,
            tinh_trang: document.getElementById('hhEditTinhTrang').value,
            ten_sp: document.getElementById('hhEditTenSP').value,
            kho: document.getElementById('hhEditKho').value,
            anh_1: document.getElementById('hhEditAnh1').value,
            anh_2: document.getElementById('hhEditAnh2').value,
            anh_3: document.getElementById('hhEditAnh3').value
        };
        if (newData.sku_ct && !newData.ten_sp) {
            const matchedSp = sanphamData.find(i => (i.sku_con || '') === newData.sku_ct);
            if (matchedSp?.ten) newData.ten_sp = matchedSp.ten;
        }
        const skuCatalog = new Set(sanphamData.map(i => (i.id_sp || '').trim()).filter(Boolean));
        if (newData.sku && skuCatalog.size && !skuCatalog.has(newData.sku.trim())) {
            alert('SKU không tồn tại trong DS_SP_CT (cột id_sp).');
            return;
        }
        // Bỏ chặn lưu khi thiếu SKU/SKU_CT theo yêu cầu người dùng
        if (isCreateMode) {
            const today = new Date().toISOString().split('T')[0];
            const mvd = (newData.mvd || '').trim();
            const mvd2 = (newData.mvd_2 || '').trim();
            const maGian = (newData.ma_gian || '').trim();
            const appendValues = [[
                `${Date.now()}`,
                today,
                mvd,
                mvd2,
                maGian,
                newData.anh_1 || '',
                newData.anh_2 || '',
                newData.anh_3 || '',
                '', // anh_4
                newData.sku || '',
                newData.sku_ct || '',
                newData.slg || '1',
                newData.ten_sp || '',
                '',
                newData.tinh_trang || '',
                '',
                '',
                '',
                '',
                mvd && maGian ? `${mvd}-${maGian}` : '',
                newData.kho || '',
                '',
                '',
                '',
                ''
            ]];
            const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${CONFIG.hhbhSheetName}!A:A:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
            const appendResp = await fetch(appendUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ values: appendValues })
            });
            if (!appendResp.ok) {
                const errText = await appendResp.text();
                console.error('Create HH error:', errText);
                alert('Lỗi khi thêm mới dữ liệu Hàng hoàn.');
                return;
            }
            await fetchHangHoanData();
            closeHhDetailDrawer();
            return;
        }
        const rowIndex = item.rowIndex || (hangHoanData.indexOf(item) + 2);
        const batchUpdates = [
            { range: `${CONFIG.hhbhSheetName}!C${rowIndex}`, values: [[newData.mvd]] },
            { range: `${CONFIG.hhbhSheetName}!D${rowIndex}`, values: [[newData.mvd_2]] },
            { range: `${CONFIG.hhbhSheetName}!E${rowIndex}`, values: [[newData.ma_gian]] },
            { range: `${CONFIG.hhbhSheetName}!F${rowIndex}`, values: [[newData.anh_1]] },
            { range: `${CONFIG.hhbhSheetName}!G${rowIndex}`, values: [[newData.anh_2]] },
            { range: `${CONFIG.hhbhSheetName}!H${rowIndex}`, values: [[newData.anh_3]] },
            { range: `${CONFIG.hhbhSheetName}!J${rowIndex}`, values: [[newData.sku]] },
            { range: `${CONFIG.hhbhSheetName}!K${rowIndex}`, values: [[newData.sku_ct]] },
            { range: `${CONFIG.hhbhSheetName}!L${rowIndex}`, values: [[newData.slg]] },
            { range: `${CONFIG.hhbhSheetName}!M${rowIndex}`, values: [[newData.ten_sp]] },
            { range: `${CONFIG.hhbhSheetName}!O${rowIndex}`, values: [[newData.tinh_trang]] },
            { range: `${CONFIG.hhbhSheetName}!T${rowIndex}`, values: [[(newData.mvd && newData.ma_gian) ? `${newData.mvd}-${newData.ma_gian}` : '']] },
            { range: `${CONFIG.hhbhSheetName}!U${rowIndex}`, values: [[newData.kho]] }
        ];
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchUpdate`;
        const resp = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data: batchUpdates }) });
        if (resp.ok) {
            Object.assign(item, newData, { rowIndex });
            filterHangHoanData();
            closeHhDetailDrawer();
        } else {
            const errText = await resp.text();
            console.error('Save HH error:', errText);
            alert('Lỗi khi lưu dữ liệu Hàng hoàn vào Google Sheet.');
        }
    } catch (err) {
        console.error("Save HH Detail Error:", err);
        alert('Đã xảy ra lỗi khi lưu Hàng hoàn: ' + (err.message || 'Lỗi không xác định'));
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

function buildSkuTongMap(data) {
    const byMvd = new Map();
    const sourceData = (typeof hangHoanData !== 'undefined' && hangHoanData.length) ? hangHoanData : data;

    sourceData.forEach(item => {
        const mvd = (item.mvd || '').toString().trim();
        const ngay = (item.ngay_nhan || '').toString().trim();
        if (!mvd || !ngay) return;

        // Key kết hợp Ngày nhận và MVD
        const key = `${ngay}|${mvd}`;

        if (!byMvd.has(key)) {
            byMvd.set(key, { ma_gian: '', items: [] });
        }
        const bucket = byMvd.get(key);
        if (!bucket.ma_gian && item.ma_gian) bucket.ma_gian = (item.ma_gian || '').toString().trim();

        const skuVal = (item.sku || '').toString().trim();
        if (!skuVal) return;
        const slgVal = (item.slg || '0').toString().trim();
        bucket.items.push(`${skuVal} x ${slgVal}`);
    });

    const result = new Map();
    byMvd.forEach((bucket, key) => {
        const skuTong = bucket.items.join(' + ');
        result.set(key, { ma_gian: bucket.ma_gian || '', skuTong });
    });
    return result;
}

function getSkuTongForItem(item, skuTongMap) {
    const mvd = (item.mvd || '').toString().trim();
    const ngay = (item.ngay_nhan || '').toString().trim();
    if (!mvd || !ngay) return '';
    const key = `${ngay}|${mvd}`;
    return skuTongMap.get(key)?.skuTong || '';
}

function getMaGianForItem(item, skuTongMap) {
    const mvd = (item.mvd || '').toString().trim();
    const ngay = (item.ngay_nhan || '').toString().trim();
    if (!mvd || !ngay) return item.ma_gian || '';
    const key = `${ngay}|${mvd}`;
    return skuTongMap.get(key)?.ma_gian || item.ma_gian || '';
}

function renderHangHoanTable() {
    const tbody = document.getElementById('hangHoanTableBody');
    const stats = document.getElementById('hangHoanStats');
    if (!tbody) return;
    if (stats) stats.textContent = `Số đơn: ${filteredHangHoanData.length.toLocaleString('vi-VN')}`;
    if (!filteredHangHoanData.length) {
        tbody.innerHTML = '<tr><td colspan="11" class="text-center py-8 text-slate-500">Không có dữ liệu phù hợp bộ lọc.</td></tr>';
        return;
    }

    const skuTongMap = buildSkuTongMap(filteredHangHoanData);

    tbody.innerHTML = filteredHangHoanData.map((item, index) => {
        const imgUrl = (item.anh_3 || '').trim();
        const imgHtml = imgUrl
            ? `<img src="${escapeHtml(imgUrl)}" alt="Ảnh hàng hoàn" class="w-12 h-12 object-cover rounded border border-slate-200 cursor-pointer hover:opacity-80" onclick="openImagePreview('${escapeHtml(imgUrl)}')">`
            : '<span class="text-xs text-slate-400">Không có</span>';
        const skuTong = getSkuTongForItem(item, skuTongMap);
        const maGian = getMaGianForItem(item, skuTongMap);
        const displayNgay = formatYmdToDmy(item.ngay_nhan) || item.ngay_nhan;
        return `
                    <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer" ondblclick="openHhDetail(${index})">
                        <td class="px-3 py-2 text-sm text-slate-700">${escapeHtml(displayNgay)}</td>
                        <td class="px-3 py-2 text-sm font-medium text-slate-900">${escapeHtml(item.mvd)}</td>
                        <td class="px-3 py-2 text-sm text-slate-700">${escapeHtml(item.mvd_2)}</td>
                        <td class="px-3 py-2 text-sm text-slate-700">${escapeHtml(maGian)}</td>
                        <td class="px-3 py-2 text-sm text-slate-700">${escapeHtml(item.sku)}</td>
                        <td class="px-3 py-2 text-sm text-slate-700">${escapeHtml(item.sku_ct)}</td>
                        <td class="px-3 py-2 text-sm text-right font-semibold text-slate-900">${(parseFloat(item.slg) || 0).toLocaleString('vi-VN')}</td>
                        <td class="px-3 py-2 text-sm text-slate-700 max-w-[240px] truncate" title="${escapeHtml(item.ten_sp)}">${escapeHtml(item.ten_sp)}</td>
                        <td class="px-3 py-2 text-sm text-slate-700">${escapeHtml(item.kho)}</td>
                        <td class="px-3 py-2 text-sm text-slate-700">${escapeHtml(item.tinh_trang)}</td>
                        <td class="px-3 py-2 text-sm text-slate-700 max-w-[260px] truncate" title="${escapeHtml(skuTong)}">${escapeHtml(skuTong || '-')}</td>
                        <td class="px-3 py-2 text-sm">${imgHtml}</td>
                    </tr>
                `;
    }).join('');
}

function exportHangHoanSummaryToExcel() {
    if (!filteredHangHoanData || !filteredHangHoanData.length) {
        alert('Không có dữ liệu hợp lệ để xuất!');
        return;
    }

    const skuTongMap = buildSkuTongMap(filteredHangHoanData);

    // Lấy danh sách các cặp (Ngày | MVD) duy nhất từ dữ liệu đang lọc
    const uniqueKeys = [...new Set(filteredHangHoanData
        .map(item => `${(item.ngay_nhan || '').toString().trim()}|${(item.mvd || '').toString().trim()}`)
        .filter(k => k.split('|')[1]))];

    const headers = ['Ngày nhận', 'MVD', 'MVD 2', 'Mã gian', 'SKU tổng'];
    const excelData = [headers, ...uniqueKeys.map(key => {
        const [ngay, mvd] = key.split('|');
        const info = skuTongMap.get(key) || { ma_gian: '', skuTong: '' };
        const displayNgay = formatYmdToDmy(ngay) || ngay;
        // Tìm dòng đầu tiên khớp với cặp Ngày-MVD để lấy MVD 2
        const firstRow = filteredHangHoanData.find(item =>
            (item.ngay_nhan || '').toString().trim() === ngay &&
            (item.mvd || '').toString().trim() === mvd
        ) || {};
        return [displayNgay, mvd, firstRow.mvd_2 || '', info.ma_gian || '', info.skuTong || ''];
    })];

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MVD_SKU_Tong');
    const filterDate = document.getElementById('filterHHNgayNhan')?.value || 'TatCa';
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + 'h' + now.getMinutes().toString().padStart(2, '0');
    XLSX.writeFile(wb, `MVD_SKU_Tong_${filterDate}_${timeStr}.xlsx`);
}

function exportHangHoanToExcel() {
    if (!filteredHangHoanData || !filteredHangHoanData.length) {
        alert('Không có dữ liệu hợp lệ để xuất!');
        return;
    }

    const headers = ['Ngày nhận', 'MVD', 'MVD 2', 'Mã gian', 'SKU', 'SKU CT', 'SKU tổng', 'SLG', 'Tên SP', 'Tình trạng', 'Kho', 'Ảnh 1', 'Ảnh 2', 'Ảnh 3', 'Ngày xử lý', 'Ghi chú', 'Trạng thái', 'SKU-SLG', 'ID NV', 'UDT', 'MVD-Gian', 'LB3', 'ID ĐH', 'ID ĐH CT', 'STT', 'Đánh dấu'];
    const skuTongMap = buildSkuTongMap(filteredHangHoanData);
    const excelData = [headers, ...filteredHangHoanData.map(item => [
        formatYmdToDmy(item.ngay_nhan) || item.ngay_nhan, item.mvd || '', item.mvd_2 || '', item.ma_gian || '', item.sku || '', item.sku_ct || '', getSkuTongForItem(item, skuTongMap) || '', item.slg || '', item.ten_sp || '', item.tinh_trang || '', item.kho || '',
        item.anh_1 || '', item.anh_2 || '', item.anh_3 || '', item.ngay_xly || '', item.ghi_chu || '', item.trang_thai || '', item.sku_slg || '', item.id_nv || '', item.udt || '',
        item.mvd_gian || '', item.lb3 || '', item.id_dh || '', item.id_dh_ct || '', item.stt || '', item.danh_dau || ''
    ])];

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'HH_BH');
    const filterDate = document.getElementById('filterHHNgayNhan')?.value || 'TatCa';
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + 'h' + now.getMinutes().toString().padStart(2, '0');
    XLSX.writeFile(wb, `HH_BH_${filterDate}_${timeStr}.xlsx`);
}

function exportHangHoanToMisa() {
    if (!filteredHangHoanData || !filteredHangHoanData.length) {
        alert('Không có dữ liệu hợp lệ để xuất MISA!');
        return;
    }

    const headers = ['Hiển thị trên sổ', 'Hình thức bán hàng', 'Phương thức thanh toán', 'Kiêm phiếu xuất kho', 'Lập kèm hóa đơn', 'Đã lập hóa đơn', 'Ngày hạch toán (*)', 'Ngày chứng từ (*)', 'Số chứng từ (*)', 'Số phiếu xuất', 'Lý do xuất', 'Số hóa đơn', 'Ngày hóa đơn', 'Mã đơn hàng', 'Mã thống kê', 'Mã khách hàng', 'Tên khách hàng', 'Địa chỉ', 'Mã số thuế', 'Diễn giải', 'Nộp vào TK', 'NV bán hàng', 'Mã hàng (*)', 'Tên hàng', 'Hàng khuyến mại', 'TK Tiền/Chi phí/Nợ (*)', 'TK Doanh thu/Có (*)', 'ĐVT', 'Số lượng', 'Đơn giá sau thuế', 'Đơn giá', 'Thành tiền', 'Tỷ lệ CK (%)', 'Tiền chiết khấu', 'TK chiết khấu', 'Giá tính thuế XK', '% thuế XK', 'Tiền thuế XK', 'TK thuế XK', '% thuế GTGT', 'Tiền thuế GTGT', 'TK thuế GTGT', 'HH không TH trên tờ khai thuế GTGT', 'Kho', 'TK giá vốn', 'TK Kho', 'Đơn giá vốn', 'Tiền vốn', 'Hàng hóa giữ hộ/bán hộ'];

    const formatDateVN = (input) => {
        if (!input) return '';
        const raw = String(input).split(' ')[0];
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            const [y, m, d] = raw.split('-');
            return `${d}/${m}/${y}`;
        }
        const dt = new Date(input);
        if (isNaN(dt.getTime())) return '';
        const d = String(dt.getDate()).padStart(2, '0');
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const y = dt.getFullYear();
        return `${d}/${m}/${y}`;
    };

    const formatCertDate = (input) => {
        const vn = formatDateVN(input);
        if (!vn) return '';
        const [d, m, y] = vn.split('/');
        return `${d}${m}${String(y).slice(-2)}`;
    };

    const getMisaValue = (item, colName) => {
        const ngayVN = formatDateVN(item.ngay_nhan);
        const certDate = formatCertDate(item.ngay_nhan);

        if (colName === 'Hiển thị trên sổ') return '0';
        if (colName === 'Hình thức bán hàng') return '0';
        if (colName === 'Phương thức thanh toán') return '0';
        if (colName === 'Kiêm phiếu xuất kho') return '1';
        if (colName === 'Lập kèm hóa đơn') return '0';
        if (colName === 'Đã lập hóa đơn') return '0';
        if (colName === 'Ngày hạch toán (*)' || colName === 'Ngày chứng từ (*)') return ngayVN;
        if (colName === 'Số chứng từ (*)' || colName === 'Số phiếu xuất') return item.mvd ? `HH-${item.mvd}-${certDate}` : '';
        if (colName === 'Lý do xuất') return 'Hàng hoàn';
        if (colName === 'Mã đơn hàng') return item.id_dh || '';
        if (colName === 'Mã thống kê') return item.ma_gian || '';
        if (colName === 'Mã khách hàng') return item.ma_gian || '';
        if (colName === 'Tên khách hàng') return item.ma_gian || '';
        if (colName === 'Diễn giải') return `${item.kho || ''} HÀNG HOÀN NGÀY ${ngayVN}`.trim();
        if (colName === 'Nộp vào TK') return '';
        if (colName === 'NV bán hàng') return '';
        if (colName === 'Mã hàng (*)') return item.sku_ct || item.sku || '';
        if (colName === 'Tên hàng') return item.ten_sp || '';
        if (colName === 'Hàng khuyến mại') return '';
        if (colName === 'TK Tiền/Chi phí/Nợ (*)') return '131';
        if (colName === 'TK Doanh thu/Có (*)') return '5111';
        if (colName === 'ĐVT') return 'Cái';
        if (colName === 'Số lượng') return item.slg || '';
        if (colName === 'Đơn giá sau thuế') return '';
        if (colName === 'Đơn giá') return '';
        if (colName === 'Thành tiền') return '';
        if (colName === 'Tỷ lệ CK (%)') return '';
        if (colName === 'Tiền chiết khấu') return '';
        if (colName === 'TK chiết khấu') return '';
        if (colName === 'Giá tính thuế XK') return '';
        if (colName === '% thuế XK') return '';
        if (colName === 'Tiền thuế XK') return '';
        if (colName === 'TK thuế XK') return '';
        if (colName === '% thuế GTGT') return '';
        if (colName === 'Tiền thuế GTGT') return '';
        if (colName === 'TK thuế GTGT') return '';
        if (colName === 'HH không TH trên tờ khai thuế GTGT') return '';
        if (colName === 'Kho') return item.kho || '';
        if (colName === 'TK giá vốn') return '632';
        if (colName === 'TK Kho') return '1561';
        if (colName === 'Đơn giá vốn') return '';
        if (colName === 'Tiền vốn') return '';
        if (colName === 'Hàng hóa giữ hộ/bán hộ') return '';
        return '';
    };

    const rows = filteredHangHoanData.map(item => headers.map(h => getMisaValue(item, h)));
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MISA');
    const filterDate = document.getElementById('filterHHNgayNhan')?.value || 'TatCa';
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + 'h' + now.getMinutes().toString().padStart(2, '0');
    XLSX.writeFile(wb, `MISA_HH_BH_${filterDate}_${timeStr}.xlsx`);
}


    Object.assign(window.AppModules = window.AppModules || {}, { ['hanghoan']: true });
    window.fillHangHoanFilterOptions = fillHangHoanFilterOptions;
    window.setHHKhoFilter = setHHKhoFilter;
    window.setHangHoanToday = setHangHoanToday;
    window.changeHangHoanDate = changeHangHoanDate;
    window.openImagePreview = openImagePreview;
    window.closeImagePreview = closeImagePreview;
        window.renderHhKhoButtons = renderHhKhoButtons;
    window.setHhKho = setHhKho;
    window.populateHhFormOptions = populateHhFormOptions;
    window.ensureHhCatalogLoaded = ensureHhCatalogLoaded;
    window.getHhSkuMatches = getHhSkuMatches;
    window.renderHhSkuSuggestions = renderHhSkuSuggestions;
    window.setHhSku = setHhSku;
    window.handleHhSkuChange = handleHhSkuChange;
    window.setHhSkuCt = setHhSkuCt;
    window.handleHhSkuCtChange = handleHhSkuCtChange;
    window.scanQrToInput = scanQrToInput;
    window.handleHhMvdInputChange = handleHhMvdInputChange;
    window.scanQrForHhMvd = scanQrForHhMvd;
    window.scanQrForHhMvd2 = scanQrForHhMvd2;
    window.uploadImageHh = uploadImageHh;
    window.refreshHhImagePreviews = refreshHhImagePreviews;
    window.removeHhImage = removeHhImage;
    window.appendHangHoanQuickByMvd = appendHangHoanQuickByMvd;
    window.stopContinuousMvdScan = stopContinuousMvdScan;
    window.startContinuousMvdScan = startContinuousMvdScan;
    window.startHHSearchQrScan = startHHSearchQrScan;
    window.fetchHangHoanData = fetchHangHoanData;
    window.filterHangHoanData = filterHangHoanData;
    window.openHhDetail = openHhDetail;
    window.openNewHangHoanDrawer = openNewHangHoanDrawer;
    window.closeHhDetailDrawer = closeHhDetailDrawer;
    window.saveHhDetail = saveHhDetail;
    window.buildSkuTongMap = buildSkuTongMap;
    window.getSkuTongForItem = getSkuTongForItem;
    window.getMaGianForItem = getMaGianForItem;
    window.renderHangHoanTable = renderHangHoanTable;
    window.exportHangHoanSummaryToExcel = exportHangHoanSummaryToExcel;
    window.exportHangHoanToExcel = exportHangHoanToExcel;
    window.exportHangHoanToMisa = exportHangHoanToMisa;
})();

;
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

;
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



;
// bandon - Module Pattern (IIFE)
(function () {
let banDonKhungFilter = '';
let banDonLoaded = false;
let banDonLoadPromise = null;
let banDonAppendQueue = [];
let banDonAppendTimer = null;

const BAN_DON_KHUNG_OPTIONS = ['8H', '9H', '10H', '11H', '13H', '14H', '15H', '16H'];

function normalizeBanDonDate(value) {
    return toYMD(value) || parseDmyToYmd(value) || '';
}

function getBanDonFilters() {
    return {
        date: document.getElementById('banDonFilterDate')?.value || '',
        search: (document.getElementById('banDonSearch')?.value || '').toString().trim().toLowerCase(),
        khung: banDonKhungFilter
    };
}

function shiftBanDonDate(inputId, deltaDays) {
    const input = document.getElementById(inputId);
    if (!input) return false;
    const current = input.value || getTodayYmd();
    const date = new Date(`${current}T00:00:00`);
    date.setDate(date.getDate() + deltaDays);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    input.value = `${y}-${m}-${d}`;
    filterBanDonData();
    return false;
}

function formatBanDonDateForSheet(ymd) {
    return formatYmdToDmy(ymd || getTodayYmd());
}

async function fetchBanDonData(silent = false) {
    if (banDonLoadPromise) return banDonLoadPromise;

    const tbody = document.getElementById('banDonTableBody');
    ensureBanDonDefaultDates();
    if (!silent && !banDonLoaded && tbody) {
        renderBanDon();
    }

    banDonLoadPromise = (async () => {
        try {
        const rows = await fetchSheetData(CONFIG.banDonSheetName);
        if (!rows || rows.length <= 1) {
            banDonData = [];
            banDonLoaded = true;
            ensureBanDonDefaultDates();
            filterBanDonData();
            return;
        }

        const headers = rows[0].map(h => (h || '').toString().trim().toLowerCase());
        const findIndex = (names, fallback) => {
            const idx = headers.findIndex(h => names.includes(h));
            return idx >= 0 ? idx : fallback;
        };
        const idxNgay = findIndex(['ngay', 'ngày', 'date'], 0);
        const idxKhung = findIndex(['khung_h', 'khung h', 'khung', 'gio', 'giờ'], 1);
        const idxMvd = findIndex(['mvd', 'ma_van_don', 'mã vận đơn'], 2);

        const loadedBanDonData = rows.slice(1)
            .map((row, idx) => ({
                rowIndex: idx + 2,
                ngay: (row[idxNgay] || '').toString().trim(),
                khung_h: (row[idxKhung] || '').toString().trim(),
                mvd: (row[idxMvd] || '').toString().trim()
            }))
            .filter(item => item.ngay || item.khung_h || item.mvd)
            .reverse();
        const pendingRows = banDonData.filter(item => item.pending);
        const pendingKeys = new Set(pendingRows.map(item => `${item.ngay}|${item.khung_h}|${item.mvd}`));
        banDonData = [
            ...pendingRows,
            ...loadedBanDonData.filter(item => !pendingKeys.has(`${item.ngay}|${item.khung_h}|${item.mvd}`))
        ];

        banDonLoaded = true;
        ensureBanDonDefaultDates();
        filterBanDonData();
    } catch (error) {
        console.error('Load BAN_DON error:', error);
        if (!silent && tbody) tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-rose-500">Không thể tải sheet BAN_DON.</td></tr>';
    } finally {
        banDonLoadPromise = null;
    }
    })();

    return banDonLoadPromise;
}

function ensureBanDonDefaultDates() {
    const filterDate = document.getElementById('banDonFilterDate');
    if (filterDate && !filterDate.value) filterDate.value = getTodayYmd();
    const addNgay = document.getElementById('banDonAddNgay');
    if (addNgay && !addNgay.value) addNgay.value = filterDate?.value || getTodayYmd();
}

function setBanDonKhungFilter(value) {
    banDonKhungFilter = value || '';
    filterBanDonData();
    const addKhung = document.getElementById('banDonAddKhung');
    if (addKhung) addKhung.value = banDonKhungFilter;
}

function filterBanDonData() {
    const filters = getBanDonFilters();
    filteredBanDonData = banDonData.filter(item => {
        const itemDate = normalizeBanDonDate(item.ngay);
        if (filters.date && itemDate !== filters.date) return false;
        if (filters.khung && (item.khung_h || '').toString().trim().toUpperCase() !== filters.khung) return false;
        if (filters.search && !(item.mvd || '').toLowerCase().includes(filters.search)) return false;
        return true;
    });
    renderBanDon();
}

function getBanDonBaseForKhungCounts() {
    const filters = getBanDonFilters();
    return banDonData.filter(item => {
        const itemDate = normalizeBanDonDate(item.ngay);
        if (filters.date && itemDate !== filters.date) return false;
        if (filters.search && !(item.mvd || '').toLowerCase().includes(filters.search)) return false;
        return true;
    });
}

function renderBanDonKhungTabs() {
    const root = document.getElementById('banDonKhungTabs');
    if (!root) return;
    const base = getBanDonBaseForKhungCounts();
    const countFor = (khung) => khung
        ? base.filter(item => (item.khung_h || '').toString().trim().toUpperCase() === khung).length
        : base.length;

    const tabClass = (active) => active
        ? 'bg-blue-600 text-white shadow-sm'
        : 'bg-white text-slate-700 hover:bg-slate-50';
    const badgeClass = (active) => active
        ? 'bg-white text-blue-600'
        : 'bg-rose-50 text-rose-500';

    const allActive = banDonKhungFilter === '';
    root.innerHTML = `
        <button onclick="setBanDonKhungFilter('')" class="h-8 px-3 rounded-lg text-xs font-bold transition-all ${tabClass(allActive)}">
            Tất cả <span class="ml-1 inline-flex min-w-5 h-4 items-center justify-center rounded-full px-1 text-[10px] ${badgeClass(allActive)}">${countFor('')}</span>
        </button>
        ${BAN_DON_KHUNG_OPTIONS.map(khung => {
            const active = banDonKhungFilter === khung;
            return `
                <button onclick="setBanDonKhungFilter('${khung}')" class="h-8 px-3 rounded-lg text-xs font-bold transition-all ${tabClass(active)}">
                    ${khung} <span class="ml-1 inline-flex min-w-5 h-4 items-center justify-center rounded-full px-1 text-[10px] ${badgeClass(active)}">${countFor(khung)}</span>
                </button>
            `;
        }).join('')}
    `;
}

function renderBanDonStats() {
    const rowsEl = document.getElementById('banDonRowsCount');
    const uniqueEl = document.getElementById('banDonUniqueCount');
    if (rowsEl) rowsEl.textContent = filteredBanDonData.length.toLocaleString('vi-VN');
    if (uniqueEl) {
        const unique = new Set(filteredBanDonData.map(item => (item.mvd || '').trim()).filter(Boolean));
        uniqueEl.textContent = unique.size.toLocaleString('vi-VN');
    }
}

function getBanDonMvdSet() {
    return new Set(filteredBanDonData.map(item => (item.mvd || '').toString().trim()).filter(Boolean));
}

function getUdctUniqueRowsForBanDon() {
    const filters = getBanDonFilters();
    const sourceRows = (udctData || []).filter(item => {
        const itemDate = normalizeBanDonDate(item.ngay);
        if (filters.date && itemDate !== filters.date) return false;
        if (filters.khung && (item.khung_h || '').toString().trim().toUpperCase() !== filters.khung) return false;
        if (filters.search && !(item.mvd || '').toString().toLowerCase().includes(filters.search)) return false;
        return !!(item.mvd || '').toString().trim();
    });

    const seen = new Set();
    const uniqueRows = [];
    sourceRows.forEach(item => {
        const mvd = (item.mvd || '').toString().trim();
        if (!mvd || seen.has(mvd)) return;
        seen.add(mvd);
        const info = getBanDonUdctInfoByMvd(mvd);
        uniqueRows.push({
            khung_h: info.khung_h || item.khung_h || '',
            ma_gian: info.ma_gian || item.ma_gian || '',
            mvd,
            sku_shop_up: info.sku_shop_up || item.sku_shop_up || ''
        });
    });
    return uniqueRows;
}

function renderMatchedMvd(value, isMatched) {
    return `
        <span class="${isMatched ? 'text-red-600' : 'text-slate-900'}">
            ${escapeHtml(value || '')}
        </span>
    `;
}

function renderBanDonMvd(value, isMatched, isDuplicate) {
    return `
        <span class="inline-flex items-center gap-2 ${isMatched ? 'text-red-600' : 'text-slate-900'}">
            ${isDuplicate ? '<span class="w-3 h-3 rounded-full bg-green-500 shrink-0"></span>' : ''}
            <span>${escapeHtml(value || '')}</span>
        </span>
    `;
}

function getBanDonUdctInfoByMvd(mvd) {
    const key = (mvd || '').toString().trim();
    if (!key || !udctData || !udctData.length) {
        return { khung_h: '', ma_gian: '', sku_shop_up: '' };
    }
    const rows = udctData.filter(item => (item.mvd || '').toString().trim() === key);
    const uniqueJoin = (field) => [...new Set(rows.map(item => (item[field] || '').toString().trim()).filter(Boolean))].join(', ');
    return {
        khung_h: uniqueJoin('khung_h'),
        ma_gian: uniqueJoin('ma_gian'),
        sku_shop_up: uniqueJoin('sku_shop_up')
    };
}

function renderBanDonUniqueTable() {
    const tbody = document.getElementById('banDonUniqueTableBody');
    const stats = document.getElementById('banDonUniqueTableStats');
    if (!tbody) return;

    const uniqueRows = getUdctUniqueRowsForBanDon();
    const banDonSet = getBanDonMvdSet();

    if (stats) stats.textContent = `${uniqueRows.length.toLocaleString('vi-VN')} MVD`;
    if (!uniqueRows.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-10 text-slate-400">Không có MVD duy nhất.</td></tr>';
        return;
    }

    tbody.innerHTML = uniqueRows.map(row => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 ${banDonSet.has(row.mvd) ? 'bg-red-50/70' : ''}">
            <td class="px-3 py-1.5 text-sm leading-5 text-slate-700 whitespace-nowrap">${escapeHtml(row.khung_h || '')}</td>
            <td class="px-3 py-1.5 text-sm leading-5 text-slate-700 whitespace-nowrap">${escapeHtml(row.ma_gian || '')}</td>
            <td class="px-3 py-1.5 text-sm leading-5 font-semibold whitespace-nowrap">${renderMatchedMvd(row.mvd, banDonSet.has(row.mvd))}</td>
            <td class="px-3 py-1.5 text-sm leading-5 text-slate-700 truncate max-w-0" title="${escapeHtml(row.sku_shop_up || '')}">${escapeHtml(row.sku_shop_up || '')}</td>
        </tr>
    `).join('');
}

function renderBanDon() {
    ensureBanDonDefaultDates();
    renderBanDonKhungTabs();
    renderBanDonStats();

    const tbody = document.getElementById('banDonTableBody');
    if (!tbody) return;
    const activeId = document.activeElement?.id || '';
    const draftValues = {
        ngay: document.getElementById('banDonAddNgay')?.value || '',
        khung: document.getElementById('banDonAddKhung')?.value || '',
        mvd: document.getElementById('banDonAddMvd')?.value || ''
    };
    const filterDate = document.getElementById('banDonFilterDate')?.value || getTodayYmd();
    const addNgayValue = draftValues.ngay || filterDate;
    const addKhungValue = draftValues.khung || banDonKhungFilter || '';
    const uniqueMvdSet = new Set(getUdctUniqueRowsForBanDon().map(item => item.mvd));
    const banDonMvdCounts = {};
    filteredBanDonData.forEach(item => {
        const mvd = (item.mvd || '').toString().trim();
        if (mvd) banDonMvdCounts[mvd] = (banDonMvdCounts[mvd] || 0) + 1;
    });

    const existingRows = filteredBanDonData.map(item => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 ${uniqueMvdSet.has((item.mvd || '').toString().trim()) ? 'bg-red-50/70' : ''}">
            <td class="px-4 py-1.5 text-sm leading-5 text-slate-700">${escapeHtml(item.ngay || '')}</td>
            <td class="px-4 py-1.5 text-sm leading-5 text-slate-700">${escapeHtml(item.khung_h || '')}</td>
            <td class="px-4 py-1.5 text-sm leading-5 font-semibold">
                ${renderBanDonMvd(item.mvd, uniqueMvdSet.has((item.mvd || '').toString().trim()), banDonMvdCounts[(item.mvd || '').toString().trim()] > 1)}
                ${item.pending ? '<span class="ml-2 text-[10px] font-bold text-cyan-600">Đang lưu</span>' : ''}
            </td>
            <td class="px-4 py-1.5 text-right">
                <button onclick="deleteBanDonRow('${String(item.rowIndex).replace(/'/g, "\\'")}')" class="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold">Xóa</button>
            </td>
        </tr>
    `).join('');

    tbody.innerHTML = `
        <tr class="bg-cyan-50/70 border-b border-cyan-100">
            <td class="p-1.5">
                <input type="date" id="banDonAddNgay" value="${escapeHtml(addNgayValue)}"
                    class="w-full h-8 px-3 bg-white border border-cyan-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-cyan-100">
            </td>
            <td class="p-1.5">
                <input type="text" id="banDonAddKhung" value="${escapeHtml(addKhungValue)}" placeholder="Khung H" list="banDonKhungList"
                    class="w-full h-8 px-3 bg-white border border-cyan-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-cyan-100">
            </td>
            <td class="p-1.5">
                <input type="text" id="banDonAddMvd" value="${escapeHtml(draftValues.mvd)}" placeholder="Nhập/scan MVD rồi Enter"
                    onkeydown="if(event.key==='Enter'){event.preventDefault(); saveBanDonNewRow();}"
                    class="w-full h-8 px-3 bg-white border border-cyan-300 rounded-md text-sm font-semibold outline-none focus:ring-2 focus:ring-cyan-100">
            </td>
            <td class="p-1.5 text-right">
                <button onclick="saveBanDonNewRow()" class="h-8 px-4 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 text-sm font-bold">Thêm</button>
            </td>
        </tr>
        ${existingRows || '<tr><td colspan="4" class="text-center py-10 text-slate-400">Không có dữ liệu phù hợp.</td></tr>'}
    `;
    if (activeId) {
        const activeEl = document.getElementById(activeId);
        if (activeEl) {
            activeEl.focus();
            if (activeId === 'banDonAddMvd') {
                const len = activeEl.value.length;
                activeEl.setSelectionRange?.(len, len);
            }
        }
    }
    renderBanDonUniqueTable();
}

function showBanDonModule() {
    ensureBanDonDefaultDates();
    filterBanDonData();
    fetchBanDonData(true);
    if ((!udctData || udctData.length === 0) && typeof loadUDCTData === 'function') {
        loadUDCTData(true).then(() => renderBanDonUniqueTable());
    } else {
        renderBanDonUniqueTable();
    }
}

function queueBanDonAppend(row) {
    banDonAppendQueue.push(row);
    clearTimeout(banDonAppendTimer);
    banDonAppendTimer = setTimeout(flushBanDonAppendQueue, 350);
}

async function flushBanDonAppendQueue() {
    if (!banDonAppendQueue.length) return;
    const rows = banDonAppendQueue.splice(0, banDonAppendQueue.length);
    try {
        const success = await appendSheetData(CONFIG.banDonSheetName, rows);
        if (!success) throw new Error('Không ghi được BAN_DON');
        banDonData.forEach(item => {
            if (item.pending && rows.some(row => row[2] === item.mvd && row[1] === item.khung_h && row[0] === item.ngay)) {
                item.pending = false;
            }
        });
    } catch (error) {
        console.error('Flush BAN_DON queue error:', error);
        rows.forEach(row => banDonAppendQueue.unshift(row));
        showToast('Đang chờ lưu BAN_DON, vẫn tiếp tục bắn được.', 'warning', 1500);
        clearTimeout(banDonAppendTimer);
        banDonAppendTimer = setTimeout(flushBanDonAppendQueue, 2500);
    }
}

async function saveBanDonNewRow() {
    const ngayRaw = document.getElementById('banDonAddNgay')?.value || getTodayYmd();
    const khung = ((document.getElementById('banDonAddKhung')?.value || '').toString().trim() || banDonKhungFilter || '').toUpperCase();
    const mvd = (document.getElementById('banDonAddMvd')?.value || '').toString().trim();
    if (!mvd) {
        showToast('Vui lòng nhập MVD.', 'warning');
        document.getElementById('banDonAddMvd')?.focus();
        return;
    }

    const ngaySheet = formatBanDonDateForSheet(ngayRaw);
    const searchEl = document.getElementById('banDonSearch');
    const searchValue = (searchEl?.value || '').toString().trim().toLowerCase();
    if (searchEl && searchValue && !mvd.toLowerCase().includes(searchValue)) {
        searchEl.value = '';
    }

    const tempRow = {
        rowIndex: `pending-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        ngay: ngaySheet,
        khung_h: khung,
        mvd,
        pending: true
    };

    banDonData.unshift(tempRow);
    queueBanDonAppend([ngaySheet, khung, mvd]);
    filterBanDonData();

    const addNgay = document.getElementById('banDonAddNgay');
    const addKhung = document.getElementById('banDonAddKhung');
    const addMvd = document.getElementById('banDonAddMvd');
    if (addNgay) addNgay.value = ngayRaw;
    if (addKhung) addKhung.value = khung;
    if (addMvd) {
        addMvd.value = '';
        addMvd.focus();
    }
}

async function getBanDonSheetId(token) {
    const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}?fields=sheets(properties(sheetId,title))`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await resp.json();
    const sheet = (data.sheets || []).find(s => s.properties?.title === CONFIG.banDonSheetName);
    return sheet?.properties?.sheetId ?? null;
}

async function deleteBanDonRow(rowIndex) {
    if (!rowIndex) return;
    if (String(rowIndex).startsWith('pending-')) {
        const item = banDonData.find(row => String(row.rowIndex) === String(rowIndex));
        banDonData = banDonData.filter(row => String(row.rowIndex) !== String(rowIndex));
        if (item) {
            banDonAppendQueue = banDonAppendQueue.filter(row => !(row[0] === item.ngay && row[1] === item.khung_h && row[2] === item.mvd));
        }
        filterBanDonData();
        return;
    }
    const removedItem = banDonData.find(row => String(row.rowIndex) === String(rowIndex));
    const previousData = banDonData.slice();
    banDonData = banDonData.filter(row => String(row.rowIndex) !== String(rowIndex));
    filterBanDonData();

    try {
        const token = await getAccessToken();
        const sheetId = await getBanDonSheetId(token);
        if (sheetId === null) throw new Error('Không lấy được sheetId BAN_DON');
        const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}:batchUpdate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId,
                            dimension: 'ROWS',
                            startIndex: Number(rowIndex) - 1,
                            endIndex: Number(rowIndex)
                        }
                    }
                }]
            })
        });
        if (!resp.ok) throw new Error(await resp.text());
    } catch (error) {
        if (removedItem) {
            banDonData = previousData;
            filterBanDonData();
        }
        console.error('Delete BAN_DON error:', error);
        showToast('Có lỗi khi xóa dòng.', 'error');
    }
}

    Object.assign(window.AppModules = window.AppModules || {}, { ['bandon']: true });
    window.fetchBanDonData = fetchBanDonData;
    window.showBanDonModule = showBanDonModule;
    window.filterBanDonData = filterBanDonData;
    window.renderBanDon = renderBanDon;
    window.renderBanDonUniqueTable = renderBanDonUniqueTable;
    window.shiftBanDonDate = shiftBanDonDate;
    window.setBanDonKhungFilter = setBanDonKhungFilter;
    window.saveBanDonNewRow = saveBanDonNewRow;
    window.deleteBanDonRow = deleteBanDonRow;
})();

;
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

;
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

;
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

;
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

;
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

;
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

;
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

;
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

;
// auth - Module Pattern (IIFE)
(function () {
function applyRoleUI(role) {
    const isDemo = role === 'demo';
    const isKinhDoanh = role === 'kinhdoanh';
    const isRestricted = isDemo || isKinhDoanh;
    const hideIds = ['sidebarUpmisa', 'sidebarBaocao', 'sidebarInventory', 'sidebarDHCT'];
    hideIds.forEach(hid => {
        const el = document.getElementById(hid);
        if (el) el.style.display = isRestricted ? 'none' : '';
    });

    const hangHoanModule = document.getElementById('sidebarHangHoan');
    if (hangHoanModule) hangHoanModule.style.display = isDemo ? 'none' : '';
    const hhShopDienModule = document.getElementById('sidebarHHShopDien');
    if (hhShopDienModule) hhShopDienModule.style.display = isDemo ? 'none' : '';

    if (isKinhDoanh) {
        const hhActions = [
            "button[onclick='exportHangHoanSummaryToExcel()']",
            "button[onclick='exportHangHoanToExcel()']",
            "button[onclick='exportHangHoanToMisa()']"
        ];
        document.querySelectorAll(hhActions.join(', ')).forEach(b => b.style.display = 'none');
    }

    ['excelUploadDonhang', 'excelUpload'].forEach(upId => {
        const excelUp = document.getElementById(upId);
        if (excelUp && excelUp.parentElement) {
            excelUp.parentElement.style.display = isRestricted ? 'none' : '';
        }
    });

    document.querySelectorAll("button[onclick='updateAllPricesBatch()'], button[onclick^='batchUpdateUDCTStatus'], button[onclick='batchRefreshSelectedRows()']").forEach(b => {
        b.style.display = isRestricted ? 'none' : '';
    });

    document.querySelectorAll("button[onclick='exportHangHoanSummaryToExcel()'], button[onclick='exportHangHoanToExcel()'], button[onclick='exportHangHoanToMisa()'], button[onclick='exportReportToExcel()'], button[onclick='exportIdSPExcel()'], button[onclick='exportUpmisaToExcel()']").forEach(b => {
        b.style.display = isKinhDoanh ? 'none' : '';
    });

    const actionHeader = Array.from(document.querySelectorAll('th')).find(th => th.textContent.trim() === 'Action');
    if (actionHeader) actionHeader.style.display = isKinhDoanh ? 'none' : '';

    document.querySelectorAll('#donhangTableBody td:nth-child(16), #donhangTableBody th:nth-child(16)').forEach(el => {
        el.style.display = isKinhDoanh ? 'none' : '';
    });

    const donhangExcelBtn = document.querySelector("label[for='excelUploadDonhang']");
    if (donhangExcelBtn) donhangExcelBtn.style.display = isRestricted ? 'none' : '';

    const donhangRefreshBtn = document.querySelector("button[onclick='loadUDCTData()']");
    if (donhangRefreshBtn) donhangRefreshBtn.style.display = isRestricted ? 'none' : '';

    // Hide Add DH button in moduleUniqueDHCT
    const addUniqueDHBtn = document.querySelector("button[onclick='openAddDHCTModal()']");
    if (addUniqueDHBtn) addUniqueDHBtn.style.display = isKinhDoanh ? 'none' : '';
}

async function handleLogin() {
    const id = document.getElementById('loginId')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const errorEl = document.getElementById('loginError');
    if (errorEl) {
        errorEl.classList.add('hidden');
        errorEl.textContent = '';
    }

    if (!id || !password) {
        if (errorEl) {
            errorEl.textContent = 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    document.getElementById('loginLoading').classList.remove('hidden');
    try {
        await fetchAuthData();
        const user = usersData.find(u => u.id === id && u.password === password);
        if (!user) {
            if (errorEl) {
                errorEl.textContent = 'Sai tài khoản hoặc mật khẩu.';
                errorEl.classList.remove('hidden');
            }
            return;
        }

        if (user.tinhTrang && /nghỉ|khóa|block|inactive/i.test(user.tinhTrang)) {
            if (errorEl) {
                errorEl.textContent = 'Tài khoản đang bị khóa hoặc ngưng hoạt động.';
                errorEl.classList.remove('hidden');
            }
            return;
        }

        isLoggedIn = true;
        currentUser = {
            id: user.id,
            name: user.name || user.id,
            role: (user.role || 'user').toString().trim().toLowerCase(),
            password: user.password
        };
        localStorage.setItem('erp_last_user_id', user.id);
        localStorage.setItem('erp_current_user', JSON.stringify(currentUser));

        window.location.reload();
    } catch (err) {
        console.error('Login error:', err);
        if (errorEl) {
            errorEl.textContent = 'Không thể xác thực tài khoản. Vui lòng thử lại.';
            errorEl.classList.remove('hidden');
        }
    } finally {
        document.getElementById('loginLoading').classList.add('hidden');
    }
}

function handleLogout() {
    if (confirm("Bạn có muốn đăng xuất không?")) {
        localStorage.removeItem('erp_current_user');
        isLoggedIn = false;
        currentUser = null;
        window.location.reload();
    }
}

function updateUserProfileUI() {
    if (!currentUser) return;
    const sidebarUserName = document.getElementById('sidebarUserName');
    const userInitial = document.getElementById('userInitial');
    const roleLabel = document.querySelector('.sidebar-text .text-xs.text-slate-500');
    if (sidebarUserName) sidebarUserName.textContent = currentUser.name;
    if (userInitial && currentUser.name) userInitial.textContent = currentUser.name.charAt(0).toUpperCase();
    if (roleLabel) roleLabel.textContent = currentUser.role === 'kinhdoanh' ? 'Kinh doanh' : (currentUser.role || 'Nhân viên');
}

window.onload = async () => {
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    const lastId = localStorage.getItem('erp_last_user_id');
    if (lastId && document.getElementById('loginId')) document.getElementById('loginId').value = lastId;

    try {
        const savedUser = localStorage.getItem('erp_current_user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            if (parsedUser && parsedUser.id) {
                // Immediate UI update for smooth transition
                if (loginScreen) loginScreen.classList.add('hidden');
                if (mainApp) mainApp.classList.remove('hidden');
                isLoggedIn = true;
                currentUser = parsedUser;
                if (document.getElementById('welcomeUserName')) document.getElementById('welcomeUserName').textContent = currentUser.name;
                updateUserProfileUI();
                applyRoleUI(currentUser.role);

                // Khởi động tự động làm mới
                startAutoRefresh();

                // Khởi động tải dữ liệu ngay từ đầu để tránh lỗi "Chưa có dữ liệu"
                loadUDCTData();
                loadSanphamData();
                                fetchDHCTData(); // Thêm luôn DH_CT mới


                // Chuyển nhanh qua module đang yêu cầu (nếu có)
                const urlParams = new URLSearchParams(window.location.search);
                const link = urlParams.get('link');
                const moduleMapping = {
                    'don_chi_tiet': 'donhang',
                    'san_pham': 'sanpham',
                    'bao_cao': 'baocao',
                    'upmisa': 'upmisa',
                    'ton_kho': 'inventory',
                    'dh_ct': 'dh_ct',
                    'hang_hoan': 'hang_hoan',
                    'hh_shop_dien': 'hh_shop_dien'
                };
                if (link && moduleMapping[link]) {
                    if (typeof switchModule === 'function') switchModule(moduleMapping[link]);
                }

                // Fetch data in background
                await fetchAuthData();
                const user = usersData.find(u => u.id === parsedUser.id && u.password === parsedUser.password);
                if (user && !(user.tinhTrang && /nghỉ|khóa|block|inactive/i.test(user.tinhTrang))) {
                    currentUser = {
                        id: user.id,
                        name: user.name || user.id,
                        role: (user.role || 'user').toString().trim().toLowerCase(),
                        password: user.password
                    };
                    updateUserProfileUI();
                    applyRoleUI(currentUser.role);
                    await loadUDCTData();
                    await loadSanphamData();
                } else {
                    handleLogout(); // Session invalid
                }
            } else {
                if (loginScreen) loginScreen.classList.remove('hidden');
                if (mainApp) mainApp.classList.add('hidden');
            }
        } else {
            if (loginScreen) loginScreen.classList.remove('hidden');
            if (mainApp) mainApp.classList.add('hidden');
        }
    } catch (e) {
        console.error("Lỗi khởi tạo:", e);
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (mainApp) mainApp.classList.add('hidden');
    }

    if (window.innerWidth > 1024) closeMobileSidebar();
};

function startAutoRefresh() {
    console.log("Auto refresh started (2 mins)");
    setInterval(async () => {
        if (isLoggedIn) {
            console.log("Running auto background refresh...");
            await loadUDCTData(true);
            await fetchDHCTData(true);
            // Có thể thêm các sheet khác nếu cần như fetchInventoryData, fetchHangHoanData...
        }
    }, 120000); // 120000ms = 2 phút
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) closeMobileSidebar();
});


    Object.assign(window.AppModules = window.AppModules || {}, { ['auth']: true });
    window.applyRoleUI = applyRoleUI;
    window.handleLogin = handleLogin;
    window.handleLogout = handleLogout;
    window.updateUserProfileUI = updateUserProfileUI;
    window.startAutoRefresh = startAutoRefresh;
})();

;
// main - Module Pattern (IIFE)
(function () {
// ============================================================
// Main application logic
// CONFIG is defined in js/config.js
// Global state variables are defined in js/state.js
// ============================================================

// Chạy ngay khi DOM vừa tải để tránh chớp màn hình đăng nhập
document.addEventListener('DOMContentLoaded', () => {
    const ls = document.getElementById('loginScreen');
    const ma = document.getElementById('mainApp');
    if (localStorage.getItem('erp_current_user')) {
        if (ls) ls.classList.add('hidden');
        if (ma) ma.classList.remove('hidden');
        
        // Handle initial routing
        handleInitialRoute();
    } else {
        if (ls) ls.classList.remove('hidden');
        if (ma) ma.classList.add('hidden');
    }
});

const moduleTitleMap = {
    'home': 'Trang chủ',
    'donhang': 'UP Đơn chi tiết',
    'sanpham': 'Sản phẩm phần mềm',
    'baocao': 'Báo cáo đơn hàng',
    'upmisa': 'UPMISA',
    'inventory': 'Quản lý Tồn Kho',
    'hang_hoan': 'Dữ liệu Hàng hoàn',
    'hh_shop_dien': 'HH SHOP ĐIỀN',
    'bc_hang_hoan': 'Báo cáo hàng hoàn',
    'ban_don': 'Bắn đơn',
    'baocao_tong': 'Báo cáo tổng',
    'dhct_form': 'Thêm Đơn hàng chi tiết',
    'dhct': 'Đơn hàng chi tiết',
    'donhang_tong': 'Đơn hàng'
};

function handleInitialRoute() {
    const path = decodeURIComponent(window.location.pathname).replace(/^\//, '');
    let initialModule = 'home';
    if (path) {
        for (const [mod, title] of Object.entries(moduleTitleMap)) {
            if (title === path) {
                initialModule = mod;
                break;
            }
        }
    }
    switchModule(initialModule, true);
}

window.addEventListener('popstate', (event) => {
    if (event.state && event.state.module) {
        switchModule(event.state.module, true);
    } else {
        handleInitialRoute();
    }
});

// Close custom suggestions on click outside
document.addEventListener('click', (e) => {
    const list = [
        { sug: 'hhSkuSuggestions', input: 'hhEditSKU' },
        { sug: 'hhSkuCtSuggestions', input: 'hhEditSKUCT' },
        { sug: 'hhShopMvdSuggestions', input: 'hhShopEditMVD' },
        { sug: 'hhShopMdhSuggestions', input: 'hhShopEditMDH' }
    ];
    list.forEach(item => {
        const sug = document.getElementById(item.sug);
        if (sug && !sug.contains(e.target) && e.target.id !== item.input) {
            sug.classList.add('hidden');
        }
    });
});

function toggleSidebar() {
    if (window.innerWidth <= 1024) {
        toggleMobileSidebar();
        return;
    }
    const sidebar = document.getElementById('sidebar');
    const icon = document.getElementById('sidebarToggleIcon');
    const isCollapsed = sidebar.classList.contains('sidebar-collapsed');
    if (isCollapsed) {
        sidebar.classList.remove('sidebar-collapsed', 'w-16');
        sidebar.classList.add('w-64');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />';
    } else {
        sidebar.classList.add('sidebar-collapsed', 'w-16');
        sidebar.classList.remove('w-64');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />';
    }
}

function syncMobileSidebar(isOpen) {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('mobileSidebarBackdrop');
    if (!sidebar || !backdrop) return;
    sidebar.classList.toggle('mobile-open', !!isOpen);
    backdrop.classList.toggle('hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

function openMobileSidebar() {
    syncMobileSidebar(true);
}

function closeMobileSidebar() {
    syncMobileSidebar(false);
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    syncMobileSidebar(!sidebar.classList.contains('mobile-open'));
}
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    if (!dropZone) return;

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0 && (files[0].name.endsWith('.xlsx') || files[0].name.endsWith('.xls'))) {
            handleExcelUpload(files);
        } else {
            alert("Vui lòng kéo thả file Excel (.xlsx hoặc .xls)");
        }
    });
}

function setupDragAndDropDonhang() {
    const dropZone = document.getElementById('dropZoneDonhang');
    if (!dropZone) return;

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0 && (files[0].name.endsWith('.xlsx') || files[0].name.endsWith('.xls'))) {
            handleExcelUploadDonhang(files);
        } else {
            alert("Vui lòng kéo thả file Excel (.xlsx hoặc .xls)");
        }
    });
}

function switchModule(module, skipPushState = false) {
    const homeModule = document.getElementById('moduleHome');
    const donhangModule = document.getElementById('moduleDonhang');
    const sanphamModule = document.getElementById('moduleSanpham');
    const baocaoModule = document.getElementById('moduleBaocao');
    const upmisaModule = document.getElementById('moduleUpmisa');
    const inventoryModule = document.getElementById('moduleInventory');
    const hangHoanModule = document.getElementById('moduleHangHoan');
    const hhShopDienModule = document.getElementById('moduleHHShopDien');

    const bcHangHoanModule = document.getElementById('moduleBCHangHoan');
    const baocaoTongModule = document.getElementById('moduleBaocaoTong');
    const banDonModule = document.getElementById('moduleBanDon');
    const dhctFormModule = document.getElementById('moduleDhctForm');
    const dhctModule = document.getElementById('moduleDhct');
    const donhangTongModule = document.getElementById('moduleDonhangTong');
    const pageTitle = document.getElementById('pageTitle');
    const udctHeaderSearchBox = document.getElementById('udctHeaderSearchBox');
    const sidebarHome = document.getElementById('sidebarHome');
    const sidebarDonhang = document.getElementById('sidebarDonhang');
    const sidebarSanpham = document.getElementById('sidebarSanpham');
    const sidebarBaocao = document.getElementById('sidebarBaocao');
    const sidebarBaocaoTong = document.getElementById('sidebarBaocaoTong');
    const sidebarUpmisa = document.getElementById('sidebarUpmisa');
    const sidebarInventory = document.getElementById('sidebarInventory');
    const sidebarDHCT = document.getElementById('sidebarDHCT');
    const sidebarUniqueDHCT = document.getElementById('sidebarUniqueDHCT');
    const sidebarHangHoan = document.getElementById('sidebarHangHoan');
    const sidebarHHShopDien = document.getElementById('sidebarHHShopDien');
    const sidebarBCHangHoan = document.getElementById('sidebarBCHangHoan');
    const sidebarBanDon = document.getElementById('sidebarBanDon');
    const sidebarDhctForm = document.getElementById('sidebarDhctForm');
    const sidebarDhct = document.getElementById('sidebarDhct');
    const sidebarDonhangTong = document.getElementById('sidebarDonhangTong');

    homeModule.style.display = 'none';
    donhangModule.style.display = 'none';
    sanphamModule.style.display = 'none';
    baocaoModule.style.display = 'none';
    upmisaModule.style.display = 'none';
    inventoryModule.style.display = 'none';
    if (hangHoanModule) hangHoanModule.style.display = 'none';
    if (hhShopDienModule) hhShopDienModule.style.display = 'none';
    if (bcHangHoanModule) bcHangHoanModule.style.display = 'none';
    if (baocaoTongModule) baocaoTongModule.style.display = 'none';
    if (banDonModule) banDonModule.style.display = 'none';
    if (dhctFormModule) dhctFormModule.style.display = 'none';
    if (dhctModule) dhctModule.style.display = 'none';
    if (donhangTongModule) donhangTongModule.style.display = 'none';

    if (udctHeaderSearchBox) udctHeaderSearchBox.classList.add('hidden');

    const resetSidebar = () => {
        [sidebarHome, sidebarDonhang, sidebarSanpham, sidebarBaocao, sidebarBaocaoTong, sidebarUpmisa, sidebarInventory, sidebarDHCT, sidebarUniqueDHCT, sidebarHangHoan, sidebarHHShopDien, sidebarBCHangHoan, sidebarBanDon, sidebarDhctForm, sidebarDhct, sidebarDonhangTong].forEach(s => {
            if (s) {
                s.classList.remove('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
                s.classList.add('text-slate-600');
            }
        });
    };

    if (module === 'home') {
        homeModule.style.display = 'block';
        pageTitle.textContent = 'Trang chủ';
        resetSidebar();
        sidebarHome.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
        sidebarHome.classList.remove('text-slate-600');
    } else if (module === 'donhang') {
        donhangModule.style.display = 'flex';
        pageTitle.textContent = 'UP Đơn chi tiết';
        if (udctHeaderSearchBox) udctHeaderSearchBox.classList.remove('hidden');
        resetSidebar();
        sidebarDonhang.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
        sidebarDonhang.classList.remove('text-slate-600');
    } else if (module === 'sanpham') {
        sanphamModule.style.display = 'flex';
        pageTitle.textContent = 'Sản phẩm phần mềm';
        resetSidebar();
        sidebarSanpham.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
        sidebarSanpham.classList.remove('text-slate-600');
        setTimeout(() => setupDragAndDrop(), 100);
    } else if (module === 'baocao') {
        baocaoModule.style.display = 'flex';
        pageTitle.textContent = 'Báo cáo đơn hàng';
        resetSidebar();
        sidebarBaocao.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
        sidebarBaocao.classList.remove('text-slate-600');
        // Không tự động reset ngày khi chuyển module để giữ bộ lọc local
        if (!document.getElementById('fromDate').value || !document.getElementById('toDate').value) {
            setQuickDate('today');
        } else {
            autoFilterReport();
        }
    } else if (module === 'upmisa') {
        upmisaModule.style.display = 'flex';
        pageTitle.textContent = 'UPMISA';
        resetSidebar();
        sidebarUpmisa.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
        sidebarUpmisa.classList.remove('text-slate-600');

        const today = new Date();
        const d = String(today.getDate()).padStart(2, '0');
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const y = today.getFullYear();
        document.getElementById('upmisaDateFilter').value = `${y}-${m}-${d}`;
        buildUpmisaData();
    } else if (module === 'inventory') {
        inventoryModule.style.display = 'flex';
        pageTitle.textContent = 'Quản lý Tồn Kho';
        resetSidebar();
        sidebarInventory.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
        sidebarInventory.classList.remove('text-slate-600');
        fetchInventoryData();

    } else if (module === 'hang_hoan') {
        if (hangHoanModule) hangHoanModule.style.display = 'flex';
        pageTitle.textContent = 'Dữ liệu Hàng hoàn';
        resetSidebar();
        if (sidebarHangHoan) {
            sidebarHangHoan.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarHangHoan.classList.remove('text-slate-600');
        }
        fetchHangHoanData();
    } else if (module === 'hh_shop_dien') {
        if (hhShopDienModule) hhShopDienModule.style.display = 'flex';
        pageTitle.textContent = 'HH SHOP ĐIỀN';
        resetSidebar();
        if (sidebarHHShopDien) {
            sidebarHHShopDien.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarHHShopDien.classList.remove('text-slate-600');
        }
        fetchHHShopDienData();
    } else if (module === 'bc_hang_hoan') {
        if (bcHangHoanModule) bcHangHoanModule.style.display = 'flex';
        pageTitle.textContent = 'Báo cáo hàng hoàn';
        resetSidebar();
        if (sidebarBCHangHoan) {
            sidebarBCHangHoan.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarBCHangHoan.classList.remove('text-slate-600');
        }
        if (!hangHoanData || hangHoanData.length === 0) {
            fetchHangHoanData().then(() => setBCHHQuickDate('today'));
        } else {
            if (!document.getElementById('bcHHFromDate').value) {
                setBCHHQuickDate('today');
            } else {
                filterBCHHData();
            }
        }
    } else if (module === 'ban_don') {
        if (banDonModule) banDonModule.style.display = 'flex';
        pageTitle.textContent = 'Bắn đơn';
        resetSidebar();
        if (sidebarBanDon) {
            sidebarBanDon.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarBanDon.classList.remove('text-slate-600');
        }
        if (typeof showBanDonModule === 'function') showBanDonModule();
        else fetchBanDonData(true);
    } else if (module === 'baocao_tong') {
        if (baocaoTongModule) baocaoTongModule.style.display = 'flex';
        pageTitle.textContent = 'Báo cáo tổng';
        resetSidebar();
        if (sidebarBaocaoTong) {
            sidebarBaocaoTong.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarBaocaoTong.classList.remove('text-slate-600');
        }
        if (!document.getElementById('fromDateTong').value || !document.getElementById('toDateTong').value) {
            setQuickDateTong('thisMonth');
        } else {
            filterReportTong();
        }
    } else if (module === 'dhct_form') {
        if (dhctFormModule) dhctFormModule.style.display = 'block';
        pageTitle.textContent = 'Thêm Đơn hàng chi tiết';
        resetSidebar();
        if (sidebarDhct) {
            sidebarDhct.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarDhct.classList.remove('text-slate-600');
        }
        if (window.initDhctForm) window.initDhctForm();
    } else if (module === 'dhct') {
        if (dhctModule) dhctModule.style.display = 'flex';
        pageTitle.textContent = 'Đơn hàng chi tiết';
        resetSidebar();
        if (sidebarDhct) {
            sidebarDhct.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarDhct.classList.remove('text-slate-600');
        }
        if (typeof fetchDHCTData === 'function') fetchDHCTData(true);
    } else if (module === 'donhang_tong') {
        if (donhangTongModule) donhangTongModule.style.display = 'flex';
        pageTitle.textContent = 'Đơn hàng';
        resetSidebar();
        if (sidebarDonhangTong) {
            sidebarDonhangTong.classList.add('active', 'bg-blue-50', 'text-primary', 'border-r-2', 'border-primary');
            sidebarDonhangTong.classList.remove('text-slate-600');
        }
        if (typeof fetchDHCTData === 'function') fetchDHCTData(true);
    }
    if (window.innerWidth <= 1024) closeMobileSidebar();

    if (!skipPushState && moduleTitleMap[module]) {
        const newUrl = `/${moduleTitleMap[module]}`;
        if (decodeURIComponent(window.location.pathname) !== newUrl) {
            window.history.pushState({ module: module }, '', newUrl);
        }
    }
}

    Object.assign(window.AppModules = window.AppModules || {}, { ['main']: true });
    window.toggleSidebar = toggleSidebar;
    window.syncMobileSidebar = syncMobileSidebar;
    window.openMobileSidebar = openMobileSidebar;
    window.closeMobileSidebar = closeMobileSidebar;
    window.toggleMobileSidebar = toggleMobileSidebar;
    window.setupDragAndDrop = setupDragAndDrop;
    window.setupDragAndDropDonhang = setupDragAndDropDonhang;
    window.switchModule = switchModule;
})();

;
