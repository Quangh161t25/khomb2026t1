import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, SwitchCamera, AlertCircle, Zap, ZapOff } from 'lucide-react';
import { playSuccessSound } from '../../utils/audioUtils';

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
  const scannerRef = useRef(null);
  const containerId = 'qr-reader-container';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    let isMounted = true;

    async function initCameras() {
      try {
        setErrorMsg(null);
        const devices = await Html5Qrcode.getCameras();
        if (isMounted) {
          if (devices && devices.length > 0) {
            setCameras(devices);
            // Prefer back / environment camera
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

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        cameraId,
        config,
        (decodedText) => {
          if (decodedText) {
            // Vibrate if supported
            if (navigator.vibrate) navigator.vibrate(100);
            playSuccessSound();

            onScanSuccess(decodedText);
            if (!continuous) {
              stopScanner();
              onClose();
            }
          }
        },
        (errorMessage) => {
          // Frame parse error, ignore
        }
      );

      setScanning(true);

      // Kiểm tra xem camera có hỗ trợ flash không
      const track = html5QrCode.getRunningTrackCameraCapabilities();
      if (track && track.torchFeature().isSupported()) {
         setHasFlash(true);
         setTorchOn(false);
      } else {
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
        advanced: [{ torch: newState }]
      });
      setTorchOn(newState);
    } catch (err) {
      console.error("Lỗi khi bật/tắt flash", err);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          </div>
          <div className="flex items-center gap-1">
            {hasFlash && (
              <button
                type="button"
                onClick={toggleTorch}
                title="Bật/Tắt đèn Flash"
                className={`p-1.5 rounded-lg transition-colors ${torchOn ? 'text-amber-500 bg-amber-50' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200'}`}
              >
                {torchOn ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
              </button>
            )}
            {cameras.length > 1 && (
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

        {/* Camera Viewport Container */}
        <div className="p-4 flex flex-col items-center justify-center bg-slate-950 min-h-[300px]">
          {errorMsg ? (
            <div className="text-center p-6 text-rose-400 flex flex-col items-center gap-2">
              <AlertCircle className="w-10 h-10 text-rose-500" />
              <p className="text-xs leading-relaxed max-w-xs">{errorMsg}</p>
            </div>
          ) : (
            <div className="w-full max-w-[320px] aspect-square overflow-hidden rounded-xl bg-black relative">
              <div id={containerId} className="w-full h-full"></div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            {continuous ? 'Chế độ quét liên tục - Đưa mã vào khung hình' : 'Hướng camera vào mã vận đơn để quét tự động'}
          </p>
        </div>
      </div>
    </div>
  );
}
