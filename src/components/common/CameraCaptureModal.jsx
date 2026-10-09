import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera, SwitchCamera, Loader2, AlertCircle } from 'lucide-react';

export default function CameraCaptureModal({ isOpen, onClose, onCapture, title = 'Chụp ảnh thực tế' }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isFlashing, setIsFlashing] = useState(false);

  // Dừng stream camera khi đóng
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Khởi động camera
  const startCamera = useCallback(async (deviceId = '') => {
    stopStream();
    setLoading(true);
    setError('');

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ truy cập máy ảnh');
      }

      const videoConstraints = {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      };

      if (deviceId) {
        videoConstraints.deviceId = { exact: deviceId };
      } else {
        videoConstraints.facingMode = { ideal: 'environment' };
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
      } catch (errFallback) {
        console.warn('Không thể mở camera với cấu hình cao, thử cấu hình cơ bản:', errFallback);
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Lấy danh sách camera có sẵn
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setCameras(videoDevices);
      } catch (e) {
        console.warn('Không thể lấy danh sách camera:', e);
      }
    } catch (err) {
      console.error('Lỗi mở camera:', err);
      let errMsg = 'Không thể truy cập máy ảnh.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Vui lòng cấp quyền truy cập máy ảnh (Camera) trong cài đặt trình duyệt.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'Không tìm thấy thiết bị máy ảnh nào trên máy.';
      } else if (err.name === 'NotReadableError') {
        errMsg = 'Máy ảnh đang được ứng dụng khác sử dụng.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [stopStream]);

  // Effect khi modal mở hoặc đổi camera
  useEffect(() => {
    if (isOpen) {
      startCamera(selectedCameraId);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, selectedCameraId, startCamera, stopStream]);

  // Đổi giữa các camera trước / sau / webcam ngoài
  const handleSwitchCamera = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.deviceId === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCameraId(cameras[nextIndex].deviceId);
  };

  // Chụp ảnh từ khung hình video
  const handleTakePhoto = () => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;

    // Hiệu ứng flash khi chụp
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File(
          [blob],
          `photo_${Date.now()}.jpg`,
          { type: 'image/jpeg', lastModified: Date.now() }
        );
        stopStream();
        onCapture(file);
        onClose();
      },
      'image/jpeg',
      0.85
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3.5 bg-slate-900/90 flex items-center justify-between text-white border-b border-slate-800 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">Canh nét kiện hàng và nhấn nút chụp</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Camera Viewport */}
        <div className="relative flex-1 bg-black aspect-4/3 sm:aspect-16/9 flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-2 bg-slate-950/80 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <span className="text-xs font-semibold text-slate-300">Đang bật máy ảnh...</span>
            </div>
          )}

          {error ? (
            <div className="p-6 text-center text-rose-300 flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10 text-rose-400" />
              <p className="text-xs font-semibold leading-relaxed max-w-xs">{error}</p>
              <button
                type="button"
                onClick={() => startCamera(selectedCameraId)}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Flash animation */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white pointer-events-none animate-out fade-out duration-200" />
          )}

          {/* Viewfinder crosshairs */}
          {!loading && !error && (
            <div className="absolute inset-8 border border-white/20 rounded-xl pointer-events-none flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-white/70 rounded-tl-sm" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-white/70 rounded-tr-sm" />
              </div>
              <div className="flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-white/70 rounded-bl-sm" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-white/70 rounded-br-sm" />
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-950 flex items-center justify-around border-t border-slate-800/80">
          {/* Switch Camera Button (nếu có nhiều camera) */}
          <div className="w-12 flex justify-center">
            {cameras.length > 1 && (
              <button
                type="button"
                onClick={handleSwitchCamera}
                className="p-3 rounded-full bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                title="Đổi camera"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Main Shutter Button */}
          <button
            type="button"
            disabled={loading || Boolean(error)}
            onClick={handleTakePhoto}
            className="w-16 h-16 rounded-full border-4 border-white p-1 flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
            title="Chụp ảnh ngay"
          >
            <div className="w-full h-full rounded-full bg-white hover:bg-slate-100 flex items-center justify-center">
              <Camera className="w-6 h-6 text-slate-900" />
            </div>
          </button>

          {/* Spacer right */}
          <div className="w-12 flex justify-center" />
        </div>
      </div>
    </div>
  );
}
