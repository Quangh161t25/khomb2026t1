// src/services/appSettingsService.js - Đồng bộ & Quản lý Cài đặt / API Key từ tab 'cai_dat' trên Google Sheets
import { CONFIG } from '../config/config';
import { fetchSheetData, batchUpdateSheetValues, clearSheetCache } from './googleSheetsApi';

/**
 * Chuyển số cột (1-based) thành chữ cái cột Excel (1 -> A, 2 -> B, 27 -> AA...)
 */
export function indexToColLetter(index) {
  let colLetter = '';
  let temp = index;
  while (temp > 0) {
    let mod = (temp - 1) % 26;
    colLetter = String.fromCharCode(65 + mod) + colLetter;
    temp = Math.floor((temp - mod) / 26);
  }
  return colLetter;
}

/**
 * Tìm số thứ tự cột (1-based) trong danh sách headers theo tên
 */
export function findColumnIndex(headers, keyName) {
  if (!headers || !Array.isArray(headers)) return -1;
  const normKey = keyName.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (let i = 0; i < headers.length; i++) {
    const h = (headers[i] || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (h === normKey || h.includes(normKey)) {
      return i + 1; // 1-based
    }
  }
  return -1;
}

/**
 * Tải cấu hình (API Key, OCR Engine, ...) từ tab 'cai_dat' trên Google Sheet.
 * Tự động đồng bộ vào localStorage để các thiết bị khác mở lên dùng được ngay.
 */
export async function fetchAppSettingsFromSheet(forceRefresh = false) {
  try {
    const sheetName = CONFIG.caiDatSheetName || 'cai_dat';
    const rows = await fetchSheetData(sheetName, 'A1:Z2', forceRefresh);
    if (!rows || rows.length === 0) {
      return {
        geminiApiKey: localStorage.getItem('app_gemini_api_key') || '',
        ocrPreferredEngine: localStorage.getItem('app_ocr_preferred_engine') || 'cloud',
        ocrSpaceApiKey: localStorage.getItem('app_ocr_space_api_key') || '',
        fromSheet: false,
      };
    }

    const headers = rows[0] || [];
    const values = rows[1] || [];

    const geminiIdx = findColumnIndex(headers, 'gemini');
    const engineIdx = findColumnIndex(headers, 'engine');
    const ocrSpaceIdx = findColumnIndex(headers, 'ocr_space');

    const sheetGeminiKey = geminiIdx !== -1 ? (values[geminiIdx - 1] || '').toString().trim() : '';
    const sheetEngine = engineIdx !== -1 ? (values[engineIdx - 1] || '').toString().trim() : '';
    const sheetOcrSpaceKey = ocrSpaceIdx !== -1 ? (values[ocrSpaceIdx - 1] || '').toString().trim() : '';

    // Cập nhật vào localStorage của thiết bị hiện tại nếu sheet có giá trị
    if (sheetGeminiKey) {
      try {
        localStorage.setItem('app_gemini_api_key', sheetGeminiKey);
      } catch (e) {}
    }
    if (sheetEngine && ['auto', 'cloud', 'barcode', 'gemini', 'offline'].includes(sheetEngine)) {
      try {
        localStorage.setItem('app_ocr_preferred_engine', sheetEngine);
      } catch (e) {}
    }
    if (sheetOcrSpaceKey) {
      try {
        localStorage.setItem('app_ocr_space_api_key', sheetOcrSpaceKey);
      } catch (e) {}
    }

    try {
      localStorage.setItem('app_settings_last_synced', new Date().toISOString());
    } catch (e) {}

    return {
      geminiApiKey: sheetGeminiKey || localStorage.getItem('app_gemini_api_key') || '',
      ocrPreferredEngine: sheetEngine || localStorage.getItem('app_ocr_preferred_engine') || 'cloud',
      ocrSpaceApiKey: sheetOcrSpaceKey || localStorage.getItem('app_ocr_space_api_key') || '',
      fromSheet: Boolean(sheetGeminiKey || sheetEngine || sheetOcrSpaceKey),
      syncedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Lỗi khi tải cấu hình từ sheet cai_dat:', err);
    return {
      geminiApiKey: localStorage.getItem('app_gemini_api_key') || '',
      ocrPreferredEngine: localStorage.getItem('app_ocr_preferred_engine') || 'cloud',
      ocrSpaceApiKey: localStorage.getItem('app_ocr_space_api_key') || '',
      fromSheet: false,
      error: err.message,
    };
  }
}

/**
 * Lưu cấu hình (API Key, Engine) lên tab 'cai_dat' trên Google Sheet và localStorage.
 * Cho phép các máy khác tự động nhận được API Key khi dùng.
 */
export async function saveAppSettingsToSheet({ geminiApiKey, ocrPreferredEngine, ocrSpaceApiKey }) {
  const sheetName = CONFIG.caiDatSheetName || 'cai_dat';

  // 1. Lưu ngay vào localStorage của thiết bị này trước
  if (geminiApiKey !== undefined) {
    try {
      localStorage.setItem('app_gemini_api_key', (geminiApiKey || '').trim());
    } catch (e) {}
  }
  if (ocrPreferredEngine !== undefined) {
    try {
      localStorage.setItem('app_ocr_preferred_engine', (ocrPreferredEngine || '').trim());
    } catch (e) {}
  }
  if (ocrSpaceApiKey !== undefined) {
    try {
      localStorage.setItem('app_ocr_space_api_key', (ocrSpaceApiKey || '').trim());
    } catch (e) {}
  }

  // 2. Đọc header hiện tại của sheet cai_dat
  const rows = await fetchSheetData(sheetName, 'A1:Z2', true);
  const headers = rows && rows.length > 0 ? [...rows[0]] : ['link_mo'];
  const values = rows && rows.length > 1 ? [...rows[1]] : [];

  const ensureCol = (key) => {
    let idx = findColumnIndex(headers, key);
    if (idx === -1) {
      headers.push(key);
      idx = headers.length; // 1-based index
    }
    return idx;
  };

  const geminiCol = ensureCol('gemini_api_key');
  const engineCol = ensureCol('ocr_preferred_engine');
  const ocrSpaceCol = ensureCol('ocr_space_api_key');

  // Đảm bảo mảng values có đủ độ dài cho các cột
  const maxCol = Math.max(headers.length, geminiCol, engineCol, ocrSpaceCol);
  while (values.length < maxCol) {
    values.push('');
  }

  if (geminiApiKey !== undefined) {
    values[geminiCol - 1] = (geminiApiKey || '').trim();
  }
  if (ocrPreferredEngine !== undefined) {
    values[engineCol - 1] = (ocrPreferredEngine || '').trim();
  }
  if (ocrSpaceApiKey !== undefined) {
    values[ocrSpaceCol - 1] = (ocrSpaceApiKey || '').trim();
  }

  // 3. Chuẩn bị ghi lên Google Sheets
  const lastColLetter = indexToColLetter(headers.length);
  const rangeHeader = `${sheetName}!A1:${lastColLetter}1`;
  const rangeValues = `${sheetName}!A2:${lastColLetter}2`;

  const batchUpdates = [
    { range: rangeHeader, values: [headers] },
    { range: rangeValues, values: [values] },
  ];

  const ok = await batchUpdateSheetValues(batchUpdates);
  if (!ok) {
    throw new Error('Không thể ghi cấu hình lên Google Sheets. Vui lòng kiểm tra kết nối mạng!');
  }

  clearSheetCache(sheetName);

  try {
    localStorage.setItem('app_settings_last_synced', new Date().toISOString());
  } catch (e) {}

  return {
    success: true,
    geminiApiKey: values[geminiCol - 1],
    ocrPreferredEngine: values[engineCol - 1],
    ocrSpaceApiKey: values[ocrSpaceCol - 1],
  };
}
