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
  Upload,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { playSuccessSound } from '../../utils/audioUtils';

// Helper trích xuất các chuỗi có định dạng mã vận đơn hoặc mã số
function extractCandidateCodes(rawText) {
  if (!rawText) return [];
  const candidates = new Set();

  // 1. Các định dạng đơn vị vận chuyển phổ biến (Shopee SPX, GHN, GHTK, J&T, TikTok, Lazada, ViettelPost)
  const spxMatches = rawText.match(/SPX[A-Z0-9]{8,25}/gi) || [];
  spxMatches.forEach((m) => candidates.add(m.trim().toUpperCase()));

  const ghnMatches = rawText.match(/GHN[A-Z0-9]{6,20}/gi) || [];
  ghnMatches.forEach((m) => candidates.add(m.trim().toUpperCase()));

  const courierMatches = rawText.match(/(?:GHTK|JNT|LEX|LZD|VTP|VNPOST|TKM)[A-Z0-9]{5,20}/gi) || [];
  courierMatches.forEach((m) => candidates.add(m.trim().toUpperCase()));

  // 2. Chuỗi chữ & số liền nhau từ 8-26 ký tự có chứa ít nhất 2 chữ số (mã vận đơn chuẩn)
  const tokenMatches = rawText.match(/\b[A-Za-z0-9_-]{8,26}\b/g) || [];
  tokenMatches.forEach((token) => {
    const clean = token.replace(/^[_\-]+|[_\-]+$/g, '').toUpperCase();
    const digitCount = (clean.match(/\d/g) || []).length;
    // Bỏ qua các từ thông thường không có chữ số
    if (clean.length >= 8 && clean.length <= 26 && digitCount >= 2) {
      candidates.add(clean);
    }
  });

  // 3. Chuỗi số nguyên dài từ 9 đến 18 số (mã GHTK, J&T, TikTok thuần số)
  const numericMatches = rawText.match(/\b\d{9,18}\b/g) || [];
  numericMatches.forEach((num) => candidates.add(num.trim()));

  return Array.from(candidates);
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
  const [ocrResult, setOcrResult] = useState(null); // { fullText, candidates, imageSrc }
  const [copiedCode, setCopiedCode] = useState(null);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerId = 'qr-reader-container';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setOcrResult(null);
      setOcrLoading(false);
      return;
    }

    let isMounted = true;

    async function initCameras() {
      try {
        setErrorMsg(null);
        setOcrResult(null);
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

  // 1. Chụp khung hình từ camera và thực hiện nhận diện OCR
  const handleCaptureAndOcr = async () => {
    try {
      const videoEl = document.querySelector(`#${containerId} video`);
      if (!videoEl) {
        alert('Không tìm thấy khung hình video để chụp.');
        return;
      }

      // Tạo canvas chụp frame
      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth || videoEl.clientWidth || 640;
      canvas.height = videoEl.videoHeight || videoEl.clientHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

      const imageSrc = canvas.toDataURL('image/jpeg', 0.92);

      // Chạy Tesseract OCR
      setOcrLoading(true);
      setOcrProgress(0);

      const res = await Tesseract.recognize(canvas, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text' && typeof m.progress === 'number') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const fullText = (res?.data?.text || '').trim();
      const candidates = extractCandidateCodes(fullText);

      setOcrResult({
        fullText,
        candidates,
        imageSrc,
      });
    } catch (err) {
      console.error('Lỗi nhận diện OCR:', err);
      alert('Có lỗi khi đọc chữ OCR: ' + (err.message || 'Thử chụp lại rõ hơn'));
    } finally {
      setOcrLoading(false);
    }
  };

  // 2. Đọc OCR từ tệp ảnh người dùng tải lên
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          setOcrLoading(true);
          setOcrProgress(0);

          const res = await Tesseract.recognize(canvas, 'eng', {
            logger: (m) => {
              if (m.status === 'recognizing text' && typeof m.progress === 'number') {
                setOcrProgress(Math.round(m.progress * 100));
              }
            },
          });

          const fullText = (res?.data?.text || '').trim();
          const candidates = extractCandidateCodes(fullText);

          setOcrResult({
            fullText,
            candidates,
            imageSrc: event.target.result,
          });
        } catch (err) {
          console.error('Lỗi nhận diện file ảnh OCR:', err);
          alert('Không thể nhận diện ảnh: ' + (err.message || 'Vui lòng thử lại'));
        } finally {
          setOcrLoading(false);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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

          {/* MÀN HÌNH 2: KẾT QUẢ OCR SAU KHI CHỤP */}
          {ocrResult && (
            <div className="p-4 space-y-4 bg-slate-50 min-h-[320px]">
              {/* Ảnh chụp thu nhỏ */}
              {ocrResult.imageSrc && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black/5 max-h-36 flex items-center justify-center">
                  <img
                    src={ocrResult.imageSrc}
                    alt="Frame captured"
                    className="max-h-36 w-auto object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-full">
                    Ảnh chụp OCR
                  </div>
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
                      Không tự động lọc được mã vận đơn định dạng thông dụng. Bạn có thể xem và chọn copy trực tiếp từ toàn bộ chữ đọc được bên dưới.
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
                onClick={handleRetake}
                className="flex-1 py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Quay lại quét camera</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  stopScanner();
                  onClose();
                }}
                className="py-2 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-medium text-xs transition-colors"
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
