import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Tesseract from 'tesseract.js';
import {
  X,
  Camera,
  SwitchCamera,
  AlertCircle,
  Zap,
  ZapOff,
  ScanText,
  Copy,
  Check,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Upload,
  Loader2,
  Sparkles,
  ArrowRight,
  Crop,
} from 'lucide-react';
import { playSuccessSound } from '../../utils/audioUtils';

// Helper trích xuất các chuỗi có định dạng mã vận đơn hoặc mã số
function extractCandidateCodes(rawText) {
  if (!rawText) return [];
  const candidates = new Set();

  // Ghép các khoảng trắng bị ngắt nhầm giữa tiền tố vận chuyển và dãy số (VD: "SPXVN 03812..." -> "SPXVN03812...")
  const normalizedText =
    rawText +
    '\n' +
    rawText
      .replace(/\b(SPX(?:VN)?|GHN|GHTK|JNT|LEX|LZD|VTP|VNPOST|TKM)\s+([A-Z0-9]{5,22})/gi, '$1$2')
      .replace(/(\d{4,6})\s+(\d{4,6})(?:\s+(\d{3,6}))?/g, '$1$2$3');

  // 1. Các định dạng đơn vị vận chuyển phổ biến (Shopee SPX, GHN, GHTK, J&T, TikTok, Lazada, ViettelPost)
  const spxMatches = normalizedText.match(/SPX[A-Z0-9]{8,25}/gi) || [];
  spxMatches.forEach((m) => candidates.add(m.trim().toUpperCase()));

  const ghnMatches = normalizedText.match(/GHN[A-Z0-9]{6,20}/gi) || [];
  ghnMatches.forEach((m) => candidates.add(m.trim().toUpperCase()));

  const courierMatches =
    normalizedText.match(/(?:GHTK|JNT|LEX|LZD|VTP|VNPOST|TKM)[A-Z0-9]{5,20}/gi) || [];
  courierMatches.forEach((m) => candidates.add(m.trim().toUpperCase()));

  // 2. Chuỗi chữ & số liền nhau từ 8-26 ký tự có chứa ít nhất 2 chữ số (mã vận đơn chuẩn)
  const tokenMatches = normalizedText.match(/\b[A-Za-z0-9_-]{8,26}\b/g) || [];
  tokenMatches.forEach((token) => {
    const clean = token.replace(/^[_\-]+|[_\-]+$/g, '').toUpperCase();
    const digitCount = (clean.match(/\d/g) || []).length;
    // Bỏ qua các từ thông thường không có chữ số
    if (clean.length >= 8 && clean.length <= 26 && digitCount >= 2) {
      candidates.add(clean);
    }
  });

  // 3. Chuỗi số nguyên dài từ 9 đến 18 số (mã GHTK, J&T, TikTok thuần số)
  const numericMatches = normalizedText.match(/\b\d{9,18}\b/g) || [];
  numericMatches.forEach((num) => candidates.add(num.trim()));

  return Array.from(candidates);
}

// Tiền xử lý ảnh trên Canvas để tăng độ chính xác khi Quét lại chữ trong ảnh
function createPreprocessedCanvas(img, { mode = 'enhanced', cropRect = null } = {}) {
  const sx = cropRect ? Math.max(0, Math.round(cropRect.x * img.width)) : 0;
  const sy = cropRect ? Math.max(0, Math.round(cropRect.y * img.height)) : 0;
  const sw = cropRect
    ? Math.max(24, Math.min(img.width - sx, Math.round(cropRect.w * img.width)))
    : img.width;
  const sh = cropRect
    ? Math.max(24, Math.min(img.height - sy, Math.round(cropRect.h * img.height)))
    : img.height;

  // Phóng to nếu vùng ảnh nhỏ để Tesseract đọc nét chữ rõ hơn
  const scale = sw < 500 ? 2.2 : sw < 900 ? 1.5 : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
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
      // Nhị phân hóa Đen - Trắng giúp nổi bật chữ trên tem nhiệt mờ hoặc bị lóa
      const threshold = Math.min(205, Math.max(100, avgLum * 0.92));
      const val = lum < threshold ? 0 : 255;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    } else {
      // mode === 'enhanced': Tăng tương phản mạnh (Contrast Stretch)
      const contrast = 1.7;
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

// Xoay ảnh DataURL 90 độ
function rotateImageDataUrl(imageSrc, degrees = 90) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      if (degrees === 90 || degrees === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

// Load HTMLImageElement từ DataURL
function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Helper sao chép clipboard an toàn
async function copyText(text) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    console.warn('Clipboard API error, trying execCommand', e);
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    const success = document.execCommand('copy');
    document.body.removeChild(el);
    return success;
  } catch (err) {
    console.error('Fallback copy failed', err);
    return false;
  }
}

export default function QRScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Quét mã QR / Barcode',
  continuous = false,
}) {
  const [cameras, setCameras] = useState([]);
  const [currentCameraId, setCurrentCameraId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);

  // Trạng thái OCR
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState(null); // { fullText, candidates, imageSrc, scanModeLabel, error }
  const [rescanCount, setRescanCount] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);

  // Trạng thái khoanh vùng (crop) trên ảnh đã chụp để quét lại chính xác vùng chữ
  const [cropRect, setCropRect] = useState(null); // { x, y, w, h } chuẩn hóa 0..1
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const cropStartRef = useRef(null);
  const previewImgWrapRef = useRef(null);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerId = 'qr-reader-container';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setOcrResult(null);
      setOcrLoading(false);
      setCropRect(null);
      setRescanCount(0);
      return;
    }

    let isMounted = true;

    async function initCameras() {
      try {
        setErrorMsg(null);
        setOcrResult(null);
        setCropRect(null);
        const devices = await Html5Qrcode.getCameras();
        if (isMounted) {
          if (devices && devices.length > 0) {
            setCameras(devices);
            // Ưu tiên camera sau / environment
            const backCam = devices.find(
              (d) =>
                d.label.toLowerCase().includes('back') ||
                d.label.toLowerCase().includes('sau') ||
                d.label.toLowerCase().includes('environment')
            );
            const selected = backCam ? backCam.id : devices[devices.length - 1].id;
            setCurrentCameraId(selected);
            startScannerWithCamera(selected);
          } else {
            setErrorMsg('Không tìm thấy camera trên thiết bị của bạn.');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Lỗi khi truy cập camera:', err);
          setErrorMsg('Không thể truy cập camera. Vui lòng cấp quyền truy cập camera trong trình duyệt.');
        }
      }
    }

    initCameras();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen]);

  const startScannerWithCamera = async (cameraId) => {
    try {
      if (scannerRef.current) {
        await stopScanner();
      }

      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      // Cấu hình khung quét dạng chữ nhật ngang tối ưu cho mã vạch 1D dài (Code 128) & QR
      const config = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const width = Math.floor(viewfinderWidth * 0.88);
          const height = Math.floor(Math.min(viewfinderHeight * 0.52, 170));
          return {
            width: Math.max(width, 240),
            height: Math.max(height, 130),
          };
        },
        aspectRatio: 1.0,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      };

      await html5QrCode.start(
        cameraId,
        config,
        (decodedText) => {
          if (decodedText) {
            if (navigator.vibrate) navigator.vibrate(100);
            playSuccessSound();

            onScanSuccess(decodedText);
            if (!continuous) {
              stopScanner();
              onClose();
            }
          }
        },
        () => {
          // Frame parse error - ignore
        }
      );

      setScanning(true);

      // Kiểm tra hỗ trợ đèn flash
      try {
        const track = html5QrCode.getRunningTrackCameraCapabilities();
        if (track && track.torchFeature && track.torchFeature().isSupported()) {
          setHasFlash(true);
          setTorchOn(false);
        } else {
          setHasFlash(false);
        }
      } catch (e) {
        setHasFlash(false);
      }
    } catch (err) {
      console.error('Lỗi khởi động máy quét:', err);
      setErrorMsg('Không thể mở luồng video từ camera: ' + err.message);
    }
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !scanning) return;
    try {
      const newState = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: newState }],
      });
      setTorchOn(newState);
    } catch (err) {
      console.error('Lỗi khi bật/tắt flash', err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        // Ignore stop error
      }
      scannerRef.current = null;
      setScanning(false);
      setTorchOn(false);
      setHasFlash(false);
    }
  };

  const switchCamera = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === currentCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    setCurrentCameraId(nextCamera.id);
    startScannerWithCamera(nextCamera.id);
  };

  // Hàm thực thi OCR trên một ảnh DataURL có sẵn (hỗ trợ quét lại không cần chụp lại)
  const runOcrOnImageSrc = async (imageSrc, { mode = 'raw', customCrop = null, mergePrevious = false } = {}) => {
    if (!imageSrc) return;
    setOcrLoading(true);
    setOcrProgress(0);

    try {
      const img = await loadImageElement(imageSrc);

      const modeLabels = {
        raw: 'Ảnh gốc',
        enhanced: 'Tăng nét & tương phản',
        bw: 'Đen trắng rõ chữ',
      };

      // Nếu quét lại ở chế độ 'auto_retry', chạy kết hợp cả Tăng tương phản + Đen trắng để bắt tối đa mã
      if (mode === 'auto_retry') {
        const canvasEnhanced = createPreprocessedCanvas(img, { mode: 'enhanced', cropRect: customCrop });
        const res1 = await Tesseract.recognize(canvasEnhanced, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text' && typeof m.progress === 'number') {
              setOcrProgress(Math.round(m.progress * 60));
            }
          },
        });
        const text1 = (res1?.data?.text || '').trim();
        const codes1 = extractCandidateCodes(text1);

        const canvasBw = createPreprocessedCanvas(img, { mode: 'bw', cropRect: customCrop });
        const res2 = await Tesseract.recognize(canvasBw, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text' && typeof m.progress === 'number') {
              setOcrProgress(60 + Math.round(m.progress * 40));
            }
          },
        });
        const text2 = (res2?.data?.text || '').trim();
        const codes2 = extractCandidateCodes(text2);

        const combinedCodes = Array.from(
          new Set([...(mergePrevious && ocrResult?.candidates ? ocrResult.candidates : []), ...codes1, ...codes2])
        );
        const combinedText = [text1, text2].filter(Boolean).join('\n---\n');

        setOcrResult({
          fullText: combinedText || ocrResult?.fullText || '',
          candidates: combinedCodes,
          imageSrc,
          scanModeLabel: customCrop ? 'Đã quét lại vùng chọn (Tăng nét)' : 'Đã quét lại (Tăng nét + Đen trắng)',
          error: null,
        });
      } else {
        const canvas = createPreprocessedCanvas(img, { mode, cropRect: customCrop });
        const res = await Tesseract.recognize(canvas, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text' && typeof m.progress === 'number') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          },
        });

        const fullText = (res?.data?.text || '').trim();
        const newCandidates = extractCandidateCodes(fullText);
        const finalCandidates = mergePrevious && ocrResult?.candidates
          ? Array.from(new Set([...newCandidates, ...ocrResult.candidates]))
          : newCandidates;

        setOcrResult({
          fullText: fullText || (mergePrevious ? ocrResult?.fullText || '' : ''),
          candidates: finalCandidates,
          imageSrc,
          scanModeLabel: customCrop ? `Vùng chọn (${modeLabels[mode] || mode})` : modeLabels[mode] || 'Ảnh gốc',
          error: null,
        });
      }
    } catch (err) {
      console.error('Lỗi nhận diện OCR:', err);
      // Giữ nguyên bức ảnh đã chụp để người dùng bấm Quét lại mà không phải chụp lại từ đầu
      setOcrResult((prev) => ({
        fullText: prev?.fullText || '',
        candidates: prev?.candidates || [],
        imageSrc,
        scanModeLabel: 'Quét lỗi - Có thể bấm Quét lại ngay trên ảnh này',
        error: err.message || 'Không đọc được chữ ở lần quét này. Hãy bấm "Quét lại chữ trong ảnh" bên dưới.',
      }));
    } finally {
      setOcrLoading(false);
    }
  };

  // 1. Chụp khung hình từ camera và thực hiện nhận diện OCR
  const handleCaptureAndOcr = async () => {
    const videoEl = document.querySelector(`#${containerId} video`);
    if (!videoEl) {
      alert('Không tìm thấy khung hình video để chụp.');
      return;
    }

    // Tạo canvas chụp frame ngay lập tức và lưu lại ảnh
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth || videoEl.clientWidth || 640;
    canvas.height = videoEl.videoHeight || videoEl.clientHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    const imageSrc = canvas.toDataURL('image/jpeg', 0.92);
    setCropRect(null);
    setRescanCount(0);

    await runOcrOnImageSrc(imageSrc, { mode: 'raw', customCrop: null, mergePrevious: false });
  };

  // 2. Đọc OCR từ tệp ảnh người dùng tải lên
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageSrc = event.target.result;
      setCropRect(null);
      setRescanCount(0);
      await runOcrOnImageSrc(imageSrc, { mode: 'raw', customCrop: null, mergePrevious: false });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 3. Quét lại chữ trực tiếp từ bức ảnh đã chụp (không cần mở camera chụp lại)
  const handleRescanExistingImage = async (forcedMode = null) => {
    if (!ocrResult?.imageSrc || ocrLoading) return;
    const nextCount = rescanCount + 1;
    setRescanCount(nextCount);
    const modeToUse = forcedMode || 'auto_retry';
    await runOcrOnImageSrc(ocrResult.imageSrc, {
      mode: modeToUse,
      customCrop: cropRect,
      mergePrevious: true,
    });
  };

  // 4. Xoay bức ảnh đã chụp 90° và tự động quét lại chữ
  const handleRotateAndRescan = async () => {
    if (!ocrResult?.imageSrc || ocrLoading) return;
    try {
      setOcrLoading(true);
      const rotatedSrc = await rotateImageDataUrl(ocrResult.imageSrc, 90);
      setCropRect(null);
      await runOcrOnImageSrc(rotatedSrc, {
        mode: 'auto_retry',
        customCrop: null,
        mergePrevious: false,
      });
    } catch (e) {
      setOcrLoading(false);
    }
  };

  // Xử lý kéo chọn vùng chữ (Crop) trực tiếp trên ảnh đã chụp
  const getNormalizedPoint = (clientX, clientY) => {
    const el = previewImgWrapRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / (rect.width || 1)));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / (rect.height || 1)));
    return { x, y };
  };

  const handleCropPointerDown = (e) => {
    if (ocrLoading) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const pt = getNormalizedPoint(clientX, clientY);
    cropStartRef.current = pt;
    setIsDraggingCrop(true);
    setCropRect({ x: pt.x, y: pt.y, w: 0, h: 0 });
  };

  const handleCropPointerMove = (e) => {
    if (!isDraggingCrop || !cropStartRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const pt = getNormalizedPoint(clientX, clientY);
    const start = cropStartRef.current;
    const x = Math.min(start.x, pt.x);
    const y = Math.min(start.y, pt.y);
    const w = Math.abs(pt.x - start.x);
    const h = Math.abs(pt.y - start.y);
    setCropRect({ x, y, w, h });
  };

  const handleCropPointerUp = () => {
    if (!isDraggingCrop) return;
    setIsDraggingCrop(false);
    if (cropRect && (cropRect.w < 0.05 || cropRect.h < 0.04)) {
      // Nếu chỉ chạm nhẹ (không kéo đủ rộng) thì hủy vùng chọn
      setCropRect(null);
    }
  };

  // Sao chép mã
  const handleCopy = async (text) => {
    const ok = await copyText(text);
    if (ok) {
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  // Áp dụng mã và đóng modal
  const handleApply = (code) => {
    if (navigator.vibrate) navigator.vibrate(80);
    playSuccessSound();
    onScanSuccess(code);
    stopScanner();
    onClose();
  };

  // Quay lại camera tiếp tục quét
  const handleRetake = () => {
    setOcrResult(null);
    setCropRect(null);
    if (!scanning && currentCameraId) {
      startScannerWithCamera(currentCameraId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {ocrResult ? (
              <Sparkles className="w-5 h-5 text-indigo-600" />
            ) : (
              <Camera className="w-5 h-5 text-indigo-600" />
            )}
            <h3 className="text-sm font-bold text-slate-800">
              {ocrResult ? 'Kết quả đọc chữ OCR' : title}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            {!ocrResult && hasFlash && (
              <button
                type="button"
                onClick={toggleTorch}
                title="Bật/Tắt đèn Flash"
                className={`p-1.5 rounded-lg transition-colors ${
                  torchOn
                    ? 'text-amber-500 bg-amber-50'
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200'
                }`}
              >
                {torchOn ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
              </button>
            )}
            {!ocrResult && cameras.length > 1 && (
              <button
                type="button"
                onClick={switchCamera}
                title="Đổi camera"
                className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors hover:bg-slate-200"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                stopScanner();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 overflow-y-auto">
          {/* MÀN HÌNH 1: ĐANG SCAN CAMERA TRỰC TIẾP */}
          {!ocrResult && (
            <div className="p-4 flex flex-col items-center justify-center bg-slate-950 min-h-[300px] relative">
              {errorMsg ? (
                <div className="text-center p-6 text-rose-400 flex flex-col items-center gap-2">
                  <AlertCircle className="w-10 h-10 text-rose-500" />
                  <p className="text-xs leading-relaxed max-w-xs">{errorMsg}</p>
                </div>
              ) : (
                <div className="w-full max-w-[340px] aspect-square overflow-hidden rounded-xl bg-black relative shadow-inner">
                  <div id={containerId} className="w-full h-full"></div>

                  {/* Lớp phủ loading khi đang đọc OCR */}
                  {ocrLoading && (
                    <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 text-center">
                      <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-3" />
                      <p className="text-white text-sm font-semibold">Đang nhận diện chữ (OCR)...</p>
                      <p className="text-indigo-300 text-xs mt-1">{ocrProgress}% hoàn thành</p>
                      <div className="w-48 bg-slate-700 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-1.5 transition-all duration-200"
                          style={{ width: `${Math.max(5, ocrProgress)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MÀN HÌNH 2: KẾT QUẢ OCR SAU KHI CHỤP (CÓ QUÉT LẠI TRÊN ẢNH ĐÃ CHỤP) */}
          {ocrResult && (
            <div className="p-4 space-y-3.5 bg-slate-50 min-h-[320px]">
              {/* Khung ảnh đã chụp + Hỗ trợ kéo khoanh vùng chữ + Các nút Quét lại ngay trên ảnh */}
              {ocrResult.imageSrc && (
                <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Crop className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Ảnh đã chụp (Có thể kéo khoanh vùng chữ để quét lại)</span>
                    </span>
                    {cropRect && (
                      <button
                        type="button"
                        onClick={() => setCropRect(null)}
                        className="text-rose-600 hover:underline font-semibold text-[11px] shrink-0"
                      >
                        Bỏ khoanh vùng
                      </button>
                    )}
                  </div>

                  <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900/95 flex items-center justify-center select-none">
                    <div
                      ref={previewImgWrapRef}
                      onMouseDown={handleCropPointerDown}
                      onMouseMove={handleCropPointerMove}
                      onMouseUp={handleCropPointerUp}
                      onMouseLeave={handleCropPointerUp}
                      onTouchStart={handleCropPointerDown}
                      onTouchMove={handleCropPointerMove}
                      onTouchEnd={handleCropPointerUp}
                      className="relative inline-block max-h-48 cursor-crosshair touch-none"
                    >
                      <img
                        src={ocrResult.imageSrc}
                        alt="Frame captured"
                        draggable={false}
                        className="max-h-48 w-auto object-contain block pointer-events-none"
                      />

                      {/* Khung khoanh vùng chữ nếu người dùng kéo chọn */}
                      {cropRect && cropRect.w > 0.01 && cropRect.h > 0.01 && (
                        <div
                          className="absolute border-2 border-amber-400 bg-amber-400/20 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
                          style={{
                            left: `${cropRect.x * 100}%`,
                            top: `${cropRect.y * 100}%`,
                            width: `${cropRect.w * 100}%`,
                            height: `${cropRect.h * 100}%`,
                          }}
                        />
                      )}
                    </div>

                    {ocrResult.scanModeLabel && (
                      <div className="absolute top-2 right-2 bg-black/65 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none">
                        {ocrResult.scanModeLabel}
                      </div>
                    )}

                    {/* Lớp phủ loading khi đang Quét lại chữ trong ảnh */}
                    {ocrLoading && (
                      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-3 text-center">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-1.5" />
                        <p className="text-white text-xs font-bold">
                          Đang quét lại chữ trong ảnh ({ocrProgress}%)...
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Thanh công cụ Quét lại trực tiếp từ ảnh đã chụp (Không cần chụp lại) */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      disabled={ocrLoading}
                      onClick={() => handleRescanExistingImage('auto_retry')}
                      className="flex-1 min-w-[160px] py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      title="Quét lại chữ từ bức ảnh này với chế độ làm nét & tăng tương phản (không cần chụp lại)"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${ocrLoading ? 'animate-spin' : ''}`} />
                      <span>
                        {cropRect ? 'Quét lại vùng đã chọn' : 'Quét lại chữ trong ảnh'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={ocrLoading}
                      onClick={() => handleRescanExistingImage('bw')}
                      className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Chuyển ảnh sang Đen - Trắng độ tương phản cao rồi quét lại"
                    >
                      <ScanText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Đen trắng</span>
                    </button>

                    <button
                      type="button"
                      disabled={ocrLoading}
                      onClick={handleRotateAndRescan}
                      className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Xoay ảnh 90 độ và quét lại chữ"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Xoay 90°</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Thông báo nếu lần quét trước gặp lỗi */}
              {ocrResult.error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{ocrResult.error}</span>
                </div>
              )}

              {/* Danh sách mã vận đơn / mã số tìm thấy */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Mã phát hiện được ({ocrResult.candidates.length}):
                  </span>
                  <span className="text-[11px] text-slate-500">Chạm sao chép hoặc áp dụng</span>
                </div>

                {ocrResult.candidates.length > 0 ? (
                  <div className="space-y-2">
                    {ocrResult.candidates.map((code, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-3 flex items-center justify-between gap-2 shadow-sm transition-all"
                      >
                        <div className="font-mono text-sm font-bold text-slate-900 tracking-wide break-all">
                          {code}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopy(code)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                              copiedCode === code
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                            title="Sao chép mã"
                          >
                            {copiedCode === code ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApply(code)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-sm transition-all"
                            title="Điền mã này vào tìm kiếm"
                          >
                            <span>Dùng mã</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      Chưa lọc được mã vận đơn chuẩn. Bạn có thể bấm <b>"Quét lại chữ trong ảnh"</b> (hoặc kéo khoanh vùng dòng chữ trên ảnh rồi bấm Quét lại) mà không cần chụp lại ảnh mới.
                    </div>
                  </div>
                )}
              </div>

              {/* Toàn bộ văn bản đọc được */}
              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Toàn bộ văn bản đọc được:</span>
                  {ocrResult.fullText && (
                    <button
                      type="button"
                      onClick={() => handleCopy(ocrResult.fullText)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      {copiedCode === ocrResult.fullText ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Đã chép hết</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Chép toàn bộ</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="max-h-28 overflow-y-auto bg-slate-50 rounded-lg p-2 text-xs font-mono text-slate-700 whitespace-pre-wrap border border-slate-100">
                  {ocrResult.fullText || '(Không nhận diện được ký tự nào)'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex-shrink-0">
          {!ocrResult ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={ocrLoading || !scanning}
                  onClick={handleCaptureAndOcr}
                  className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  {ocrLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang đọc chữ ({ocrProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <ScanText className="w-4 h-4" />
                      <span>Chụp & Đọc chữ (OCR)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Tải ảnh từ máy để đọc OCR"
                  className="p-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">Tải ảnh</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                {continuous
                  ? 'Chế độ quét liên tục - Đưa mã vào khung hình'
                  : 'Đặt mã vạch/QR vào khung hoặc bấm nút Chụp để đọc chữ số'}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={ocrLoading}
                onClick={() => handleRescanExistingImage('auto_retry')}
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${ocrLoading ? 'animate-spin' : ''}`} />
                <span>{cropRect ? 'Quét lại vùng chọn' : 'Quét lại ảnh này'}</span>
              </button>
              <button
                type="button"
                disabled={ocrLoading}
                onClick={handleRetake}
                className="py-2 px-3 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chụp lại</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  stopScanner();
                  onClose();
                }}
                className="py-2 px-3.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-medium text-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
