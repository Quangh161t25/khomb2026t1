import jsrsasign from 'jsrsasign';
import { CONFIG } from '../config/config';

let accessToken = null;
let tokenExpiry = 0;
let tokenRequestPromise = null;

const SHEET_RANGES = {
  default: {
    read: 'A1:AF10000',
    clear: 'A2:AF10000',
    append: 'A:A'
  },
  UD_CT: {
    read: 'A1:AF100000',
    clear: 'A2:AF100000',
    append: 'A:A'
  },
  HH_BH: { read: 'A:Z', append: 'A:Z', clear: 'A2:Z' },
  DH_CT: { read: 'A:P', append: 'A:A', clear: 'A2:P' },
  TON_KHO: { read: 'A:K', clear: 'A2:K' },
  BAN_DON: { read: 'A1:AF10000', clear: 'A2:AF10000', append: 'A:A' },
  HH_SHOP_DIEN: { read: 'A:Z', append: 'A:Z', clear: 'A2:Z' }
};

export function getSheetRange(sheetName, type = 'read') {
  const rangeConfig = SHEET_RANGES[sheetName] || SHEET_RANGES.default;
  return rangeConfig[type] || SHEET_RANGES.default[type];
}

const memoryCache = new Map();
const inFlightRequests = new Map();

const CACHE_TTL = {
  DS_SP: 10 * 60 * 1000,       // 10 minutes for product catalog
  DSNV: 15 * 60 * 1000,        // 15 minutes for users
  UD_CT: 3 * 60 * 1000,        // 3 minutes for general order data
  default: 15 * 1000           // 15 seconds for frequently edited sheets
};

export function clearSheetCache(sheetName = null) {
  if (!sheetName) {
    memoryCache.clear();
  } else {
    for (const key of memoryCache.keys()) {
      if (key.startsWith(sheetName)) {
        memoryCache.delete(key);
      }
    }
  }
}

export async function getAccessToken() {
  if (!accessToken) {
    try {
      const savedToken = sessionStorage.getItem('g_access_token');
      const savedExpiry = Number(sessionStorage.getItem('g_token_expiry') || '0');
      if (savedToken && Date.now() < savedExpiry - 300000) {
        accessToken = savedToken;
        tokenExpiry = savedExpiry;
        return accessToken;
      }
    } catch (e) {}
  }

  if (accessToken && Date.now() < tokenExpiry - 300000) {
    return accessToken;
  }
  if (tokenRequestPromise) {
    return tokenRequestPromise;
  }

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

      const KJUR = jsrsasign.KJUR || jsrsasign;
      const sJWT = KJUR.jws.JWS.sign(
        "RS256",
        JSON.stringify(header),
        JSON.stringify(payload),
        CONFIG.privateKey
      );

      const response = await fetch(CONFIG.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(sJWT)}`
      });

      const data = await response.json();
      if (data.error) {
        console.error("Token error:", data);
        throw new Error(data.error_description || "Không thể lấy Access Token từ Google");
      }

      accessToken = data.access_token;
      tokenExpiry = Date.now() + data.expires_in * 1000;
      try {
        sessionStorage.setItem('g_access_token', accessToken);
        sessionStorage.setItem('g_token_expiry', String(tokenExpiry));
      } catch (e) {}
      return accessToken;
    } catch (err) {
      console.error("Lỗi xác thực Google Service Account:", err);
      throw err;
    } finally {
      tokenRequestPromise = null;
    }
  })();

  return tokenRequestPromise;
}

export async function fetchSheetData(sheetNameOrRange, customRange = null, forceRefresh = false) {
  try {
    let sheetName = sheetNameOrRange;
    let range = customRange;

    if (sheetNameOrRange.includes('!')) {
      const parts = sheetNameOrRange.split('!');
      sheetName = parts[0];
      if (!range) range = parts[1];
    }

    if (!range) {
      range = getSheetRange(sheetName, 'read');
    }

    const fullRange = `${sheetName}!${range}`;

    // 1. Check in-memory cache
    const cacheKey = fullRange;
    const ttl = CACHE_TTL[sheetName] || CACHE_TTL.default;
    const cached = memoryCache.get(cacheKey);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    // 2. Prevent duplicate concurrent requests for same sheet
    if (inFlightRequests.has(cacheKey)) {
      return await inFlightRequests.get(cacheKey);
    }

    const requestPromise = (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return [];

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${encodeURIComponent(fullRange)}`;
        const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!resp.ok) {
          console.error(`Fetch ${fullRange} failed:`, resp.status);
          return [];
        }
        const data = await resp.json();
        const rows = data.values || [];
        memoryCache.set(cacheKey, { data: rows, timestamp: Date.now() });
        return rows;
      } finally {
        inFlightRequests.delete(cacheKey);
      }
    })();

    inFlightRequests.set(cacheKey, requestPromise);
    return await requestPromise;
  } catch (err) {
    console.error(`Fetch ${sheetNameOrRange} error:`, err);
    return [];
  }
}

export async function fetchAuthData() {
  const data = await fetchSheetData(CONFIG.authSheetName);
  if (!data || data.length <= 1) return [];

  const headers = data[0].map(h => (h || '').toString().trim().toLowerCase());
  const getIndex = (name) => headers.indexOf(name.toLowerCase());
  const idxId = getIndex('id');
  const idxHoten = getIndex('hoten');
  const idxQuyen = getIndex('quyen');
  const idxMatKhau = getIndex('mat_khau');
  const idxTinhTrang = getIndex('tinhtrang');

  return data.slice(1).map(row => ({
    id: (idxId !== -1 ? row[idxId] : row[0] || '').toString().trim(),
    name: (idxHoten !== -1 ? row[idxHoten] : row[1] || '').toString().trim(),
    role: (idxQuyen !== -1 ? row[idxQuyen] : '').toString().trim().toLowerCase() || 'user',
    password: (idxMatKhau !== -1 ? row[idxMatKhau] : '').toString(),
    tinhTrang: (idxTinhTrang !== -1 ? row[idxTinhTrang] : '').toString().trim(),
    raw: row
  })).filter(user => user.id && user.password);
}

export async function appendSheetData(sheetName, values) {
  try {
    const token = await getAccessToken();
    if (!token) return false;
    clearSheetCache(sheetName);
    const range = getSheetRange(sheetName, 'append');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${encodeURIComponent(sheetName)}!${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: values, majorDimension: "ROWS" })
    });
    return resp.ok;
  } catch (err) {
    console.error("Lỗi appendSheetData:", err);
    return false;
  }
}

export const appendSheetRows = appendSheetData;

export async function updateSheetRow(sheetName, rowIndex, rowDataArray) {
  try {
    const token = await getAccessToken();
    if (!token) return false;
    clearSheetCache(sheetName);
    const range = `${sheetName}!A${rowIndex}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const resp = await fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [rowDataArray] })
    });
    return resp.ok;
  } catch (err) {
    console.error("Lỗi updateSheetRow:", err);
    return false;
  }
}

export async function updateSheetCell(sheetName, rowIndex, colIndex, value) {
  try {
    const token = await getAccessToken();
    if (!token) return false;
    clearSheetCache(sheetName);

    // Convert colIndex (1-based: A=1, B=2...) to Letters
    let colLetter = "";
    let temp = colIndex;
    while (temp > 0) {
      let mod = (temp - 1) % 26;
      colLetter = String.fromCharCode(65 + mod) + colLetter;
      temp = Math.floor((temp - mod) / 26);
    }

    const range = `${sheetName}!${colLetter}${rowIndex}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const resp = await fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [[value]] })
    });
    return resp.ok;
  } catch (err) {
    console.error("Lỗi updateSheetCell:", err);
    return false;
  }
}

export async function updateSheetValue(sheetName, range, value) {
  try {
    const token = await getAccessToken();
    if (!token) return false;
    clearSheetCache(sheetName);
    const fullRange = `${sheetName}!${range}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${encodeURIComponent(fullRange)}?valueInputOption=USER_ENTERED`;
    const resp = await fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [[value]] })
    });
    return resp.ok;
  } catch (err) {
    console.error("Lỗi updateSheetValue:", err);
    return false;
  }
}

export async function batchUpdateSheetValues(batchData) {
  try {
    const token = await getAccessToken();
    if (!token) return false;
    clearSheetCache();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchUpdate`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data: batchData
      })
    });
    return resp.ok;
  } catch (err) {
    console.error("Lỗi batchUpdateSheetValues:", err);
    return false;
  }
}

export async function clearSheetData(sheetName, customRange = null) {
  try {
    const token = await getAccessToken();
    if (!token) return false;
    clearSheetCache(sheetName);
    const range = customRange || getSheetRange(sheetName, 'clear');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${encodeURIComponent(sheetName)}!${range}:clear`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });
    return resp.ok;
  } catch (err) {
    console.error("Lỗi clearSheetData:", err);
    return false;
  }
}

export async function fetchSheetMeta(sheetName) {

  try {
    const token = await getAccessToken();
    if (!token) return null;
    const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}?fields=sheets(properties(sheetId,title))`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await resp.json();
    const sheet = (data.sheets || []).find(s => s.properties?.title === sheetName);
    return sheet?.properties?.sheetId ?? null;
  } catch (err) {
    console.error("Lỗi fetchSheetMeta:", err);
    return null;
  }
}

export async function deleteSheetRow(sheetName, rowIndex) {
  try {
    const token = await getAccessToken();
    if (!token) return false;
    clearSheetCache(sheetName);
    const sheetId = await fetchSheetMeta(sheetName);
    if (sheetId === null || sheetId === undefined) {
      throw new Error(`Không tìm thấy sheetId cho ${sheetName}`);
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}:batchUpdate`;
    const body = {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheetId,
            dimension: "ROWS",
            startIndex: rowIndex - 1,
            endIndex: rowIndex
          }
        }
      }]
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    return resp.ok;
  } catch (err) {
    console.error("Lỗi deleteSheetRow:", err);
    throw err;
  }
}

