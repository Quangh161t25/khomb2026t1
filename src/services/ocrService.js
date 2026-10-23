// src/services/ocrService.js - Hệ thống nhận diện OCR & Barcode đa tầng cho Kho 2026
// Hỗ trợ: OCR Cloud (Engine 2 chuyên tem nhãn), Barcode/QR từ ảnh, AI Gemini Vision, và Tesseract Offline.

import Tesseract from 'tesseract.js';
import { Html5Qrcode } from 'html5-qrcode';

export const OCR_STORAGE_KEYS = {
  GEMINI_KEY: 'app_gemini_api_key',
  OCR_SPACE_KEY: 'app_ocr_space_api_key',
  PREFERRED_ENGINE: 'app_ocr_preferred_engine', // 'cloud' | 'barcode' | 'gemini' | 'offline' | 'auto'
};

// Danh sách API keys miễn phí dự phòng cho OCR.space
const OCR_SPACE_FALLBACK_KEYS = [
  'helloworld',
  'K88888888888888',
  'K82845688988957',
  'K87899142388957',
];

// Lấy engine ưu tiên của người dùng (mặc định là 'cloud' - OCR Cloud siêu nét)
export function getPreferredOcrEngine() {
  try {
    const saved = localStorage.getItem(OCR_STORAGE_KEYS.PREFERRED_ENGINE);
    if (saved && ['auto', 'cloud', 'barcode', 'gemini', 'offline'].includes(saved)) {
      return saved;
    }
  } catch (e) {}
  return 'cloud';
}

export function setPreferredOcrEngine(engine) {
  try {
    localStorage.setItem(OCR_STORAGE_KEYS.PREFERRED_ENGINE, engine);
  } catch (e) {}
}

export function getSavedGeminiKey() {
  try {
    return (localStorage.getItem(OCR_STORAGE_KEYS.GEMINI_KEY) || '').trim();
  } catch (e) {
    return '';
  }
}

export function setSavedGeminiKey(key) {
  try {
    localStorage.setItem(OCR_STORAGE_KEYS.GEMINI_KEY, (key || '').trim());
  } catch (e) {}
}

export function getSavedOcrSpaceKey() {
  try {
    return (localStorage.getItem(OCR_STORAGE_KEYS.OCR_SPACE_KEY) || '').trim();
  } catch (e) {
    return '';
  }
}

export function setSavedOcrSpaceKey(key) {
  try {
    localStorage.setItem(OCR_STORAGE_KEYS.OCR_SPACE_KEY, (key || '').trim());
  } catch (e) {}
}

// ============================================================================
// 1. CHUẨN HÓA & TRÍCH XUẤT MÃ VẬN ĐƠN (MVD), MÃ ĐƠN HÀNG (MDH), SKU
// ============================================================================

export function extractCandidateCodes(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { mvd: [], mdh: [], sku: [], all: [] };
  }

  const mvdSet = new Set();
  const mdhSet = new Set();
  const skuSet = new Set();
  const allSet = new Set();

  // Chuẩn hóa văn bản:
  // - Gộp khoảng cách bị ngắt nhầm trong tiền tố vận chuyển: "SPX VN 038..." -> "SPXVN038..."
  // - Khắc phục các nhầm lẫn OCR phổ biến: "SPX VO..." -> "SPXV0..."
  const normalized = rawText
    .replace(/\r/g, '')
    .replace(/\b(SPX)(?:\s*|_)(VN)?(?:\s*|_)([A-Z0-9]{6,22})/gi, '$1$2$3')
    .replace(/\b(GHN|GHTK|JNT|LEX|LZD|VTP|VNPOST|TKM)(?:\s*|_)([A-Z0-9]{5,22})/gi, '$1$2')
    .replace(/(\d{4,6})\s+(\d{4,6})(?:\s+(\d{3,6}))?/g, '$1$2$3');

  const combinedSearchText = rawText + '\n' + normalized;

  // 1. Mã vận đơn SPX (Shopee Express)
  const spxMatches = combinedSearchText.match(/\bSPX(?:VN)?[A-Z0-9]{8,24}\b/gi) || [];
  spxMatches.forEach((m) => {
    const clean = m.trim().toUpperCase();
    mvdSet.add(clean);
    allSet.add(clean);
  });

  // 2. Các đơn vị vận chuyển phổ biến (GHN, GHTK, J&T, TikTok, Lazada, ViettelPost)
  const courierMatches =
    combinedSearchText.match(/\b(?:GHN|GHTK|JNT|LEX|LZD|VTP|VNPOST|TKM)[A-Z0-9]{5,22}\b/gi) || [];
  courierMatches.forEach((m) => {
    const clean = m.trim().toUpperCase();
    mvdSet.add(clean);
    allSet.add(clean);
  });

  // 3. Chuỗi số nguyên dài từ 9 đến 18 chữ số (GHTK, J&T, TikTok thuần số)
  const numericMatches = combinedSearchText.match(/\b\d{9,18}\b/g) || [];
  numericMatches.forEach((num) => {
    const clean = num.trim();
    // Bỏ qua nếu là số điện thoại 10 số bắt đầu bằng 03, 05, 07, 08, 09 nếu có thể,
    // nhưng nếu độ dài > 10 hoặc 11-18 số thì chắc chắn là MVD
    mvdSet.add(clean);
    allSet.add(clean);
  });

  // 4. Mã đơn hàng Shopee (bắt đầu bằng 6 số ngày tạo YYMMDD + 6 đến 12 ký tự chữ số, ví dụ: 261013FSPU3PVJ)
  const shopeeMdhMatches = combinedSearchText.match(/\b\d{6}[A-Z0-9]{6,14}\b/gi) || [];
  shopeeMdhMatches.forEach((m) => {
    const clean = m.trim().toUpperCase();
    mdhSet.add(clean);
    allSet.add(clean);
  });

  // 5. Chuỗi mã đơn hàng / mã vận đơn chữ & số liền nhau từ 10-24 ký tự có ít nhất 2 chữ số
  const tokenMatches = combinedSearchText.match(/\b[A-Za-z0-9_-]{10,24}\b/g) || [];
  tokenMatches.forEach((token) => {
    const clean = token.replace(/^[_\-]+|[_\-]+$/g, '').toUpperCase();
    const digitCount = (clean.match(/\d/g) || []).length;
    if (clean.length >= 10 && clean.length <= 24 && digitCount >= 2) {
      if (!allSet.has(clean)) {
        allSet.add(clean);
        if (/^\d{6}/.test(clean)) {
          mdhSet.add(clean);
        } else {
          mvdSet.add(clean);
        }
      }
    }
  });

  // 6. Mã SKU (định dạng gạch nối, ví dụ: S219-BK-00, SK-400L, LK-3348)
  const skuMatches =
    combinedSearchText.match(/\b[A-Za-z0-9]{2,8}(?:-[A-Za-z0-9]{1,8}){1,3}\b/g) || [];
  skuMatches.forEach((sku) => {
    const clean = sku.trim().toUpperCase();
    skuSet.add(clean);
    allSet.add(clean);
  });

  return {
    mvd: Array.from(mvdSet),
    mdh: Array.from(mdhSet),
    sku: Array.from(skuSet),
    all: Array.from(allSet),
  };
}

// ============================================================================
// 2. HELPER CHUYỂN ĐỔI ẢNH (CANVAS / DATA URL / BLOB / BASE64)
// ============================================================================

export function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Không thể tải hình ảnh để đọc chữ.'));
    img.src = src;
  });
}

// Tạo canvas đã được tiền xử lý & cắt vùng
export function createProcessedCanvas(img, { mode = 'raw', cropRect = null, scale = 1.0 } = {}) {
  const sx = cropRect ? Math.max(0, Math.round(cropRect.x * img.width)) : 0;
  const sy = cropRect ? Math.max(0, Math.round(cropRect.y * img.height)) : 0;
  const sw = cropRect
    ? Math.max(24, Math.min(img.width - sx, Math.round(cropRect.w * img.width)))
    : img.width;
  const sh = cropRect
    ? Math.max(24, Math.min(img.height - sy, Math.round(cropRect.h * img.height)))
    : img.height;

  // Tự động scale vừa đủ nét chữ (nếu ảnh nhỏ thì tăng kích thước, nếu ảnh quá lớn thì giới hạn để không lag)
  let effectiveScale = scale;
  if (scale === 1.0) {
    if (sw < 600) effectiveScale = 2.0;
    else if (sw > 2400) effectiveScale = 0.75;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw * effectiveScale);
  canvas.height = Math.round(sh * effectiveScale);
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  if (mode === 'raw') {
    return canvas;
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let sumLum = 0;
  const pixelCount = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    sumLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const avgLum = sumLum / (pixelCount || 1);

  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (mode === 'bw') {
      const threshold = Math.min(210, Math.max(90, avgLum * 0.94));
      const val = lum < threshold ? 0 : 255;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    } else {
      // enhanced: Tăng tương phản chữ tem in nhiệt
      const contrast = 1.8;
      let v = (lum - avgLum) * contrast + avgLum;
      v = Math.max(0, Math.min(255, v));
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// ============================================================================
// 3. ENGINE 1: OCR CLOUD (OCR.SPACE ENGINE 2 - CHUYÊN TEM VẬN ĐƠN & HÓA ĐƠN)
// ============================================================================

export async function recognizeWithOcrSpace(imageSrc, options = {}) {
  const { onProgress, cropRect, customKey } = options;
  if (onProgress) onProgress(15, 'Đang chuẩn bị ảnh gửi lên Cloud OCR...');

  let img;
  if (typeof imageSrc === 'string') {
    img = await loadImageElement(imageSrc);
  } else {
    img = imageSrc;
  }

  const canvas = createProcessedCanvas(img, { mode: 'raw', cropRect });
  // Dùng JPEG chất lượng cao để dung lượng nhẹ và truyền tải nhanh
  const base64Data = canvas.toDataURL('image/jpeg', 0.92);

  if (onProgress) onProgress(35, 'Đang phân tích tem nhãn (Cloud Engine 2)...');

  const keysToTry = customKey
    ? [customKey, ...OCR_SPACE_FALLBACK_KEYS]
    : [getSavedOcrSpaceKey() || 'helloworld', ...OCR_SPACE_FALLBACK_KEYS];

  let lastError = null;
  let parsedText = '';

  for (const apiKey of keysToTry) {
    if (!apiKey) continue;
    try {
      const formData = new URLSearchParams();
      formData.append('apikey', apiKey);
      formData.append('language', 'eng'); // Engine 2 nhận diện rất chuẩn cả chữ hoa và số
      formData.append('isOverlayRequired', 'false');
      formData.append('OCREngine', '2'); // Engine 2 là deep learning dành riêng cho receipt/bill/labels/numbers
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('base64Image', base64Data);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();

      if (json.IsErroredOnProcessing) {
        const msg = Array.isArray(json.ErrorMessage)
          ? json.ErrorMessage.join('; ')
          : json.ErrorMessage || 'OCR Cloud xử lý thất bại';
        throw new Error(msg);
      }

      if (json.ParsedResults && json.ParsedResults.length > 0) {
        parsedText = json.ParsedResults.map((r) => r.ParsedText || '').join('\n').trim();
        if (onProgress) onProgress(90, 'Hoàn tất đọc chữ từ Cloud OCR');
        break; // Thành công!
      }
    } catch (err) {
      console.warn(`Lỗi với key OCR.Space (${apiKey}):`, err.message);
      lastError = err;
    }
  }

  if (!parsedText && lastError) {
    throw lastError;
  }

  const candidates = extractCandidateCodes(parsedText);
  return {
    engine: 'cloud',
    engineLabel: '⚡ OCR Cloud (Chuyên tem nhãn & số)',
    fullText: parsedText,
    candidates: candidates.all,
    mvdList: candidates.mvd,
    mdhList: candidates.mdh,
    skuList: candidates.sku,
  };
}

// ============================================================================
// 4. ENGINE 2: QUÉT MÃ VẠCH (1D BARCODE / QR CODE) TỪ ẢNH CHỤP
// ============================================================================

export async function recognizeBarcodeFromImage(imageSrc, options = {}) {
  const { onProgress, cropRect } = options;
  if (onProgress) onProgress(20, 'Đang dò mã vạch 1D & QR trên ảnh...');

  const img = await loadImageElement(imageSrc);
  const canvas = createProcessedCanvas(img, { mode: 'raw', cropRect });

  // 1. Thử dùng Native BarcodeDetector của trình duyệt nếu có (cực nhanh và chính xác 100%)
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const formats = [
        'code_128',
        'code_39',
        'qr_code',
        'data_matrix',
        'ean_13',
        'itf',
        'upc_a',
      ];
      const detector = new window.BarcodeDetector({ formats });
      const detected = await detector.detect(canvas);
      if (detected && detected.length > 0) {
        const codes = detected.map((b) => (b.rawValue || '').trim()).filter(Boolean);
        if (codes.length > 0) {
          if (onProgress) onProgress(100, 'Đã giải mã thành công mã vạch!');
          const candidates = extractCandidateCodes(codes.join('\n'));
          return {
            engine: 'barcode',
            engineLabel: '📷 Quét Barcode trực tiếp từ ảnh (Chính xác 100%)',
            fullText: codes.join('\n'),
            candidates: Array.from(new Set([...codes, ...candidates.all])),
            mvdList: Array.from(new Set([...codes, ...candidates.mvd])),
            mdhList: candidates.mdh,
            skuList: candidates.sku,
          };
        }
      }
    } catch (e) {
      console.warn('Native BarcodeDetector error, fallback to Html5Qrcode:', e);
    }
  }

  // 2. Dùng Html5Qrcode.scanFile
  if (onProgress) onProgress(50, 'Đang giải mã bằng bộ đọc Html5Qrcode...');
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  const file = new File([blob], 'barcode_scan.png', { type: 'image/png' });

  let tempContainer = document.getElementById('temp-barcode-reader-container');
  if (!tempContainer) {
    tempContainer = document.createElement('div');
    tempContainer.id = 'temp-barcode-reader-container';
    tempContainer.style.display = 'none';
    document.body.appendChild(tempContainer);
  }

  const html5Qr = new Html5Qrcode('temp-barcode-reader-container', { verbose: false });
  try {
    const decoded = await html5Qr.scanFile(file, false);
    await html5Qr.clear();
    const cleanCode = (decoded || '').trim();
    if (onProgress) onProgress(100, 'Đã giải mã mã vạch!');
    const candidates = extractCandidateCodes(cleanCode);
    return {
      engine: 'barcode',
      engineLabel: '📷 Quét Barcode trực tiếp từ ảnh (Chính xác 100%)',
      fullText: cleanCode,
      candidates: Array.from(new Set([cleanCode, ...candidates.all])),
      mvdList: Array.from(new Set([cleanCode, ...candidates.mvd])),
      mdhList: candidates.mdh,
      skuList: candidates.sku,
    };
  } catch (err) {
    await html5Qr.clear().catch(() => {});
    throw new Error('Không tìm thấy mã vạch 1D hoặc mã QR rõ nét trong ảnh này.');
  }
}

// ============================================================================
// 5. ENGINE 3: AI GEMINI VISION (TRÍ TUỆ NHÂN TẠO ĐỌC VĂN BẢN & BỐC TÁCH THÔNG MINH)
// ============================================================================

export async function recognizeWithGeminiVision(imageSrc, options = {}) {
  const { onProgress, cropRect, customKey } = options;
  const apiKey = (customKey || getSavedGeminiKey() || '').trim();

  if (!apiKey) {
    throw new Error(
      'Chưa cấu hình Gemini API Key. Bạn có thể bấm vào "Cài đặt API Key" để dán key Gemini miễn phí!'
    );
  }

  if (onProgress) onProgress(20, 'Đang gửi ảnh tới AI Gemini Vision...');

  const img = await loadImageElement(imageSrc);
  const canvas = createProcessedCanvas(img, { mode: 'raw', cropRect });
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');

  if (onProgress) onProgress(45, 'AI đang đọc và bóc tách thông tin tem nhãn...');

  const promptText = `Bạn là trợ lý kho vận chuyên đọc tem nhãn kiện hàng, phiếu giao hàng (Shopee, TikTok, Lazada, GHN, GHTK, ViettelPost).
Hãy đọc kỹ ảnh này và trích xuất:
1. "mvd": Mã vận đơn (thường bắt đầu bằng SPXVN, GHN, GHTK, JNT, LEX, VTP, hoặc chuỗi số dài).
2. "mdh": Mã đơn hàng (ví dụ mã Shopee bắt đầu bằng 6 chữ số ngày tạo YYMMDD như 261013...).
3. "sku": Mã SKU sản phẩm (dạng chữ và số có gạch nối, ví dụ S219-BK-00).
4. "ma_gian": Mã gian hàng / Tên shop (ví dụ GDD, TOPCARE).
5. "all_codes": Danh sách tất cả các mã chữ & số có trong ảnh.
6. "full_text": Toàn bộ chữ bạn đọc được trên ảnh.

Hãy trả về duy nhất JSON hợp lệ (không kèm markdown):
{
  "mvd": "...",
  "mdh": "...",
  "sku": "...",
  "ma_gian": "...",
  "all_codes": ["..."],
  "full_text": "..."
}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Data,
            },
          },
          {
            text: promptText,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      response_mime_type: 'application/json',
    },
  };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Lỗi Gemini API (HTTP ${response.status})`
    );
  }

  const resultJson = await response.json();
  const rawOutput =
    resultJson.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  let parsed = {};
  try {
    parsed = JSON.parse(rawOutput.replace(/```json|```/g, '').trim());
  } catch (e) {
    parsed = { full_text: rawOutput };
  }

  if (onProgress) onProgress(100, 'AI đã bóc tách xong!');

  const candidates = extractCandidateCodes(
    [parsed.mvd, parsed.mdh, parsed.sku, parsed.full_text, ...(parsed.all_codes || [])]
      .filter(Boolean)
      .join('\n')
  );

  return {
    engine: 'gemini',
    engineLabel: '🤖 AI Gemini Vision (Thông minh nhất)',
    fullText: parsed.full_text || rawOutput,
    structured: {
      mvd: parsed.mvd || '',
      mdh: parsed.mdh || '',
      sku: parsed.sku || '',
      ma_gian: parsed.ma_gian || '',
    },
    candidates: candidates.all,
    mvdList: Array.from(new Set([parsed.mvd, ...candidates.mvd].filter(Boolean))),
    mdhList: Array.from(new Set([parsed.mdh, ...candidates.mdh].filter(Boolean))),
    skuList: Array.from(new Set([parsed.sku, ...candidates.sku].filter(Boolean))),
  };
}

// ============================================================================
// 6. ENGINE 4: TESSERACT OFFLINE CẢI TIẾN (DÙNG KHI MẤT MẠNG HOẶC NỘI BỘ MÁY)
// ============================================================================

export async function recognizeWithTesseract(imageSrc, options = {}) {
  const { onProgress, cropRect, mode = 'enhanced' } = options;
  if (onProgress) onProgress(10, 'Đang chuẩn bị ảnh & khởi động Tesseract...');

  const img = await loadImageElement(imageSrc);
  const canvas = createProcessedCanvas(img, { mode, cropRect });

  const res = await Tesseract.recognize(canvas, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        if (onProgress) onProgress(Math.round(20 + m.progress * 75), 'Tesseract đang quét chữ...');
      }
    },
  });

  const fullText = (res?.data?.text || '').trim();
  const candidates = extractCandidateCodes(fullText);

  return {
    engine: 'offline',
    engineLabel: '💻 OCR Offline (Tesseract nội bộ)',
    fullText,
    candidates: candidates.all,
    mvdList: candidates.mvd,
    mdhList: candidates.mdh,
    skuList: candidates.sku,
  };
}

// ============================================================================
// 7. HÀM CHÍNH: RECOGNIZE IMAGE (TỰ ĐỘNG LỰA CHỌN ENGINE HOẶC CHẠY THEO CHỈ ĐỊNH)
// ============================================================================

export async function recognizeImage(imageSrc, options = {}) {
  const engine = options.engine || getPreferredOcrEngine();
  const onProgress = options.onProgress || (() => {});

  // 1. Chỉ định rõ ràng Engine
  if (engine === 'barcode') {
    return await recognizeBarcodeFromImage(imageSrc, options);
  }
  if (engine === 'gemini') {
    return await recognizeWithGeminiVision(imageSrc, options);
  }
  if (engine === 'offline') {
    return await recognizeWithTesseract(imageSrc, options);
  }
  if (engine === 'cloud') {
    return await recognizeWithOcrSpace(imageSrc, options);
  }

  // 2. Chế độ AUTO: Tự động kết hợp thông minh nhất
  // Bước 1: Thử dò Barcode / QR trên ảnh trước (nếu có tem mã vạch thì cực kỳ chuẩn 100%)
  try {
    onProgress(15, 'Dò mã vạch 1D & QR...');
    const barcodeResult = await recognizeBarcodeFromImage(imageSrc, options);
    if (barcodeResult?.candidates && barcodeResult.candidates.length > 0) {
      return barcodeResult;
    }
  } catch (e) {
    // Không có barcode, tiếp tục sang Cloud OCR
  }

  // Bước 2: Chạy OCR Cloud Engine 2 (siêu nét cho tem nhãn)
  try {
    onProgress(40, 'Đang đọc chữ bằng Cloud OCR (Engine 2)...');
    const cloudResult = await recognizeWithOcrSpace(imageSrc, options);
    return cloudResult;
  } catch (err) {
    console.warn('Cloud OCR lỗi, chuyển sang Tesseract Offline dự phòng:', err.message);
  }

  // Bước 3: Nếu mất mạng hoặc Cloud OCR lỗi -> Tự động fallback sang Tesseract Offline
  onProgress(60, 'Mạng chậm, chuyển sang đọc chữ Offline...');
  return await recognizeWithTesseract(imageSrc, options);
}
