import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';

export default function InstallPwaModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [activeTab, setActiveTab] = useState('android'); // 'android' | 'ios'

  useEffect(() => {
    // Detect standalone mode (already running as installed app)
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      setIsInstalled(isStandalone);
    };
    checkInstalled();

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isApple);
    if (isApple) {
      setActiveTab('ios');
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__deferredPwaPrompt = e;
    };

    if (window.__deferredPwaPrompt) {
      setDeferredPrompt(window.__deferredPwaPrompt);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const prompt = deferredPrompt || window.__deferredPwaPrompt;
    if (prompt) {
      prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      window.__deferredPwaPrompt = null;
    } else if (isIOS) {
      setActiveTab('ios');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-5 py-4 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs border border-white/30 p-1 flex items-center justify-center shadow-inner shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="App Icon"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/icon.png';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg leading-tight">Cài đặt App UPMISA</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/25 text-white backdrop-blur-xs border border-white/20">
                  Mobile App
                </span>
              </div>
              <p className="text-xs text-blue-100 opacity-90 truncate">
                Quản lý kho & Đơn hàng trực tiếp trên điện thoại
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white/90 hover:text-white transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Status banner if already installed */}
          {isInstalled ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-800">
                  Ứng dụng đã được cài đặt trên thiết bị!
                </p>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  Bạn đang sử dụng UPMISA ở chế độ ứng dụng độc lập (Toàn màn hình).
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Quick direct install button for supported browsers */}
              {deferredPrompt && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-center space-y-2">
                  <p className="text-xs font-semibold text-blue-900">
                    Trình duyệt đã sẵn sàng để cài đặt!
                  </p>
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 animate-bounce" />
                    Cài đặt ứng dụng ngay
                  </button>
                </div>
              )}

              {/* Platform Switcher Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('android')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'android'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Điện thoại Android
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ios')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'ios'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  iPhone / iPad (iOS)
                </button>
              </div>

              {/* Instructions per platform */}
              {activeTab === 'android' ? (
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Hướng dẫn cài đặt trên Android (Chrome, Cốc Cốc, Samsung Internet):
                  </h4>
                  <ol className="space-y-2 text-xs text-slate-700 list-decimal list-inside pl-1">
                    <li className="leading-relaxed">
                      Mở website bằng trình duyệt <b>Google Chrome</b> hoặc <b>Cốc Cốc</b>.
                    </li>
                    <li className="leading-relaxed">
                      Nhấn vào biểu tượng <b>3 chấm (⋮)</b> ở góc trên cùng bên phải.
                    </li>
                    <li className="leading-relaxed">
                      Chọn mục <b>"Cài đặt ứng dụng"</b> (hoặc <b>"Thêm vào Màn hình chính"</b>).
                    </li>
                    <li className="leading-relaxed">
                      Nhấn <b>"Cài đặt"</b> để xác nhận. Sau vài giây, biểu tượng <b>UPMISA</b> sẽ xuất hiện trên màn hình điện thoại như một App thông thường!
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Hướng dẫn cài đặt trên iPhone / iPad (Safari):
                  </h4>
                  <ol className="space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-blue-600 shrink-0">1.</span>
                      <span>Mở liên kết hệ thống bằng trình duyệt <b>Safari</b>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-blue-600 shrink-0">2.</span>
                      <span className="flex-1">
                        Bấm vào biểu tượng <b>Chia sẻ</b>{' '}
                        <Share className="w-3.5 h-3.5 inline text-blue-600 mx-0.5 mb-0.5" />{' '}
                        ở thanh công cụ dưới cùng màn hình.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-blue-600 shrink-0">3.</span>
                      <span className="flex-1">
                        Cuộn xuống danh sách và bấm chọn{' '}
                        <b className="text-slate-900 inline-flex items-center gap-1">
                          <PlusSquare className="w-3.5 h-3.5 text-slate-700 inline" /> "Thêm vào MH chính"
                        </b>{' '}
                        (Add to Home Screen).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-blue-600 shrink-0">4.</span>
                      <span>
                        Bấm <b>"Thêm" (Add)</b> ở góc trên bên phải. Biểu tượng App UPMISA sẽ nằm ngay trên màn hình chính của iPhone!
                      </span>
                    </li>
                  </ol>
                </div>
              )}
            </>
          )}

          {/* Key Advantages */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Ưu điểm khi sử dụng App trên điện thoại
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Toàn màn hình, không vướng thanh địa chỉ web</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>Quét mã vạch camera nhanh và mượt mà hơn</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
                <Layers className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                <span>Tự động cập nhật phiên bản mới nhất từ Cloud</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Hoạt động bảo mật và lưu đệm dữ liệu thông minh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">PWA v2.0 • 2026</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
