import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
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
  Settings,
  Cpu,
  Cloud,
  QrCode,
  Key,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { playSuccessSound } from '../../utils/audioUtils';
import {
  recognizeImage,
  getPreferredOcrEngine,
  setPreferredOcrEngine,
  getSavedGeminiKey,
  setSavedGeminiKey,
  getSavedOcrSpaceKey,
  setSavedOcrSpaceKey,
  createProcessedCanvas,
  loadImageElement,
  extractCandidateCodes,
} from '../../services/ocrService';

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
  title = 'Quét mã QR / Barcode & Đọc chữ (OCR)',
  continuous = false,
}) {
  const [cameras, setCameras] = useState([]);
  const [currentCameraId, setCurrentCameraId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);

  // Engine OCR đang chọn
  const [selectedEngine, setSelectedEngineState] = useState(getPreferredOcrEngine);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(getSavedGeminiKey);
  const [ocrSpaceKeyInput, setOcrSpaceKeyInput] = useState(getSavedOcrSpaceKey);

  // Trạng thái kết quả OCR
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [ocrResult, setOcrResult] = useState(null);
  const [rescanCount, setRescanCount] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);

  // Trạng thái khoanh vùng (crop) trên ảnh
  const [cropRect, setCropRect] = useState(null); // { x, y, w, h } chuẩn hóa 0..1
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const cropStartRef = useRef(null);
  const previewImgWrapRef = useRef(null);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerId = 'qr-reader-container';

  const setEngine = (engine) => {
    setSelectedEngineState(engine);
    setPreferredOcrEngine(engine);
  };

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setOcrResult(null);
      setOcrLoading(false);
      setCropRect(null);
      setRescanCount(0);
      setShowConfigModal(false);
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
          setErrorMsg('Không thể truy cập camera. Vui lòng cấp quyền camera trong trình duyệt.');
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
        () => {}
      );

      setScanning(true);

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
      } catch (e) {}
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

  // Hàm thực thi OCR đa tầng trên ảnh
  const runOcrOnImageSrc = async (imageSrc, { engine = selectedEngine, customCrop = null } = {}) => {
    if (!imageSrc) return;
    setOcrLoading(true);
    setOcrProgress(15);
    setOcrStatusText('Đang khởi động nhận diện...');

    try {
      const result = await recognizeImage(imageSrc, {
        engine,
        cropRect: customCrop,
        onProgress: (pct, msg) => {
          setOcrProgress(pct);
          if (msg) setOcrStatusText(msg);
        },
      });

      setOcrResult({
        fullText: result.fullText || '',
        candidates: result.candidates || [],
        mvdList: result.mvdList || [],
        mdhList: result.mdhList || [],
        skuList: result.skuList || [],
        structured: result.structured || null,
        imageSrc,
        engineUsed: result.engine,
        scanModeLabel: result.engineLabel || 'Đã đọc thành công',
        error: null,
      });
    } catch (err) {
      console.error('Lỗi nhận diện OCR:', err);
      setOcrResult((prev) => ({
        fullText: prev?.fullText || '',
        candidates: prev?.candidates || [],
        mvdList: prev?.mvdList || [],
        mdhList: prev?.mdhList || [],
        skuList: prev?.skuList || [],
        structured: null,
        imageSrc,
        engineUsed: engine,
        scanModeLabel: 'Quét chưa có kết quả',
        error:
          err.message ||
          'Không tìm thấy mã rõ nét ở chế độ này. Hãy thử chọn nút Engine khác (Cloud OCR, Barcode hoặc AI) bên trên!',
      }));
    } finally {
      setOcrLoading(false);
    }
  };

  // 1. Chụp ảnh từ camera và đọc OCR
  const handleCaptureAndOcr = async () => {
    const videoEl = document.querySelector(`#${containerId} video`);
    if (!videoEl) {
      alert('Không tìm thấy khung hình video để chụp.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth || videoEl.clientWidth || 640;
    canvas.height = videoEl.videoHeight || videoEl.clientHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    const imageSrc = canvas.toDataURL('image/jpeg', 0.92);
    setCropRect(null);
    setRescanCount(0);

    await runOcrOnImageSrc(imageSrc, { engine: selectedEngine, customCrop: null });
  };

  // 2. Tải tệp ảnh từ máy
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageSrc = event.target.result;
      setCropRect(null);
      setRescanCount(0);
      await runOcrOnImageSrc(imageSrc, { engine: selectedEngine, customCrop: null });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 3. Đổi Engine & Quét lại ngay lập tức
  const handleSwitchEngineAndRescan = async (engine) => {
    setEngine(engine);
    if (!ocrResult?.imageSrc || ocrLoading) return;
    await runOcrOnImageSrc(ocrResult.imageSrc, {
      engine,
      customCrop: cropRect,
    });
  };

  // 4. Quét lại chữ từ ảnh hiện tại
  const handleRescanCurrent = async () => {
    if (!ocrResult?.imageSrc || ocrLoading) return;
    setRescanCount((prev) => prev + 1);
    await runOcrOnImageSrc(ocrResult.imageSrc, {
      engine: selectedEngine,
      customCrop: cropRect,
    });
  };

  // 5. Xoay ảnh 90 độ và quét lại
  const handleRotateAndRescan = async () => {
    if (!ocrResult?.imageSrc || ocrLoading) return;
    try {
      setOcrLoading(true);
      const rotatedSrc = await rotateImageDataUrl(ocrResult.imageSrc, 90);
      setCropRect(null);
      await runOcrOnImageSrc(rotatedSrc, {
        engine: selectedEngine,
        customCrop: null,
      });
    } catch (e) {
      setOcrLoading(false);
    }
  };

  // Kéo khoanh vùng (Crop)
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
      setCropRect(null);
    }
  };

  const handleCopy = async (text) => {
    const ok = await copyText(text);
    if (ok) {
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleApply = (code) => {
    if (navigator.vibrate) navigator.vibrate(80);
    playSuccessSound();
    onScanSuccess(code);
    stopScanner();
    onClose();
  };

  const handleRetake = () => {
    setOcrResult(null);
    setCropRect(null);
    if (!scanning && currentCameraId) {
      startScannerWithCamera(currentCameraId);
    }
  };

  const handleSaveApiKeys = () => {
    setSavedGeminiKey(geminiKeyInput);
    setSavedOcrSpaceKey(ocrSpaceKeyInput);
    setShowConfigModal(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              {ocrResult ? <Sparkles className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {ocrResult ? 'Kết quả nhận diện OCR' : title}
              </h3>
              <p className="text-[10px] text-slate-500">
                {ocrResult ? ocrResult.scanModeLabel : 'Hỗ trợ quét Barcode & đọc chữ OCR siêu nét'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowConfigModal(!showConfigModal)}
              title="Cài đặt Engine & API Key"
              className={`p-1.5 rounded-lg transition-colors ${
                showConfigModal
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>

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
                {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
              </button>
            )}

            {!ocrResult && cameras.length > 1 && (
              <button
                type="button"
                onClick={switchCamera}
                title="Đổi camera"
                className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors hover:bg-slate-200"
              >
                <SwitchCamera className="w-4 h-4" />
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
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cửa sổ Cài đặt Engine & API Key nếu bấm nút Bánh răng */}
        {showConfigModal && (
          <div className="bg-indigo-50/90 border-b border-indigo-100 p-3.5 space-y-3 text-xs animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Cấu hình công nghệ OCR & AI Vision</span>
              </span>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chọn Engine mặc định */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Công nghệ OCR mặc định khi chụp/tải ảnh:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'cloud', label: '⚡ OCR Cloud', desc: 'Chuẩn số & tem' },
                  { id: 'barcode', label: '📷 Quét Barcode', desc: 'Dò mã vạch 1D/QR' },
                  { id: 'gemini', label: '🤖 AI Gemini', desc: 'Trí tuệ nhân tạo' },
                  { id: 'offline', label: '💻 Tesseract', desc: 'Offline máy' },
                ].map((eng) => (
                  <button
                    key={eng.id}
                    type="button"
                    onClick={() => setEngine(eng.id)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      selectedEngine === eng.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{eng.label}</div>
                    <div className="text-[9px] opacity-80">{eng.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gemini API Key */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>Google Gemini API Key (Tùy chọn):</span>
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-0.5 text-[10px]"
                >
                  <span>Lấy key miễn phí</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <input
                type="password"
                placeholder="Dán AIzaSy... để kích hoạt AI Vision đọc siêu chuẩn"
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-500">
                Key được lưu an toàn trên trình duyệt của bạn, không chia sẻ cho bên thứ ba.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveApiKeys}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        )}

        {/* THANH CHỌN NHANH CÔNG NGHỆ OCR (CHO PHÉP CHUYỂN ĐỔI NGAY LẬP TỨC) */}
        <div className="px-3 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 mr-1">
            Đọc bằng:
          </span>
          {[
            { id: 'cloud', label: '⚡ OCR Cloud', title: 'OCR Cloud Engine 2 chuyên trị tem nhãn, không nhầm 0/O' },
            { id: 'barcode', label: '📷 Barcode/QR', title: 'Dò mã vạch 1D & QR trực tiếp trên tem (chính xác 100%)' },
            { id: 'gemini', label: '🤖 AI Gemini', title: 'Trí tuệ nhân tạo Gemini bóc tách thông minh' },
            { id: 'offline', label: '💻 Tesseract', title: 'Đọc offline nội bộ khi mất mạng' },
          ].map((eng) => (
            <button
              key={eng.id}
              type="button"
              title={eng.title}
              onClick={() => handleSwitchEngineAndRescan(eng.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedEngine === eng.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              {eng.label}
            </button>
          ))}
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
                      <p className="text-indigo-300 text-xs mt-1">{ocrStatusText || `${ocrProgress}% hoàn thành`}</p>
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

          {/* MÀN HÌNH 2: KẾT QUẢ OCR SAU KHI CHỤP / TẢI ẢNH */}
          {ocrResult && (
            <div className="p-4 space-y-3.5 bg-slate-50 min-h-[320px]">
              {/* Khung ảnh đã chụp + Hỗ trợ kéo khoanh vùng chữ + Các nút Quét lại */}
              {ocrResult.imageSrc && (
                <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Crop className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Ảnh đang đọc (Kéo chuột/chạm để khoanh vùng chữ)</span>
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

                    {/* Lớp phủ loading khi đang Quét lại */}
                    {ocrLoading && (
                      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-3 text-center">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-1.5" />
                        <p className="text-white text-xs font-bold">
                          {ocrStatusText || `Đang xử lý (${ocrProgress}%)...`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Thanh công cụ Quét lại trực tiếp từ ảnh này */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      disabled={ocrLoading}
                      onClick={handleRescanCurrent}
                      className="flex-1 min-w-[150px] py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      title="Quét lại ảnh này với Engine đang chọn"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${ocrLoading ? 'animate-spin' : ''}`} />
                      <span>
                        {cropRect ? 'Quét lại vùng chọn' : 'Quét lại ảnh này'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={ocrLoading}
                      onClick={handleRotateAndRescan}
                      className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Xoay ảnh 90 độ và quét lại"
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

              {/* Nếu AI Gemini trả về cấu trúc chi tiết */}
              {ocrResult.structured && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-3 space-y-1.5">
                  <div className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>AI Vision đã bóc tách:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {ocrResult.structured.mvd && (
                      <div className="bg-white p-2 rounded-lg border border-indigo-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">MVD:</span>
                        <span className="font-mono font-bold text-indigo-700">{ocrResult.structured.mvd}</span>
                      </div>
                    )}
                    {ocrResult.structured.mdh && (
                      <div className="bg-white p-2 rounded-lg border border-indigo-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">MDH:</span>
                        <span className="font-mono font-bold text-slate-800">{ocrResult.structured.mdh}</span>
                      </div>
                    )}
                    {ocrResult.structured.sku && (
                      <div className="bg-white p-2 rounded-lg border border-indigo-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">SKU:</span>
                        <span className="font-mono font-bold text-emerald-700">{ocrResult.structured.sku}</span>
                      </div>
                    )}
                    {ocrResult.structured.ma_gian && (
                      <div className="bg-white p-2 rounded-lg border border-indigo-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Gian:</span>
                        <span className="font-bold text-slate-700">{ocrResult.structured.ma_gian}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Danh sách mã phát hiện được */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Mã phát hiện được ({ocrResult.candidates?.length || 0}):
                  </span>
                  <span className="text-[11px] text-slate-500">Chạm sao chép hoặc áp dụng</span>
                </div>

                {ocrResult.candidates && ocrResult.candidates.length > 0 ? (
                  <div className="space-y-2">
                    {ocrResult.candidates.map((code, idx) => {
                      const isMvd =
                        (ocrResult.mvdList && ocrResult.mvdList.includes(code)) ||
                        /^SPX|GHN|GHTK|JNT|LEX|VTP/i.test(code);
                      const isMdh =
                        (ocrResult.mdhList && ocrResult.mdhList.includes(code)) ||
                        /^\d{6}[A-Z0-9]{6,}/i.test(code);
                      const isSku =
                        ocrResult.skuList && ocrResult.skuList.includes(code);

                      return (
                        <div
                          key={idx}
                          className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-3 flex items-center justify-between gap-2 shadow-xs transition-all"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {isMvd && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                                  Mã Vận Đơn
                                </span>
                              )}
                              {isMdh && !isMvd && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 border border-amber-200">
                                  Mã Đơn
                                </span>
                              )}
                              {isSku && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                                  SKU
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-sm font-bold text-slate-900 tracking-wide break-all">
                              {code}
                            </div>
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
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                              title="Điền mã này vào tìm kiếm"
                            >
                              <span>Dùng mã</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      Chưa lọc được mã tự động. Bạn có thể bấm chọn <b>"⚡ OCR Cloud"</b> hoặc <b>"📷 Barcode/QR"</b> ở thanh trên, hoặc khoanh vùng dòng chữ trên ảnh rồi bấm Quét lại.
                    </div>
                  </div>
                )}
              </div>

              {/* Toàn bộ văn bản đọc được */}
              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Toàn bộ văn bản đọc được:</span>
                  {ocrResult.fullText && (
                    <button
                      type="button"
                      onClick={() => handleCopy(ocrResult.fullText)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode === ocrResult.fullText ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Đã chép</span>
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
                  className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {ocrLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{ocrStatusText || `Đang đọc (${ocrProgress}%)...`}</span>
                    </>
                  ) : (
                    <>
                      <ScanText className="w-4 h-4" />
                      <span>Chụp & Đọc chữ ({selectedEngine === 'cloud' ? 'OCR Cloud' : selectedEngine === 'barcode' ? 'Barcode' : selectedEngine === 'gemini' ? 'AI Vision' : 'Offline'})</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Tải ảnh từ máy để đọc OCR"
                  className="p-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                  : 'Đặt mã vạch/QR vào khung hoặc bấm Chụp & Đọc chữ'}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={ocrLoading}
                onClick={handleRescanCurrent}
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
                className="py-2 px-3.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-medium text-xs transition-colors cursor-pointer"
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
