import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  RotateCcw,
  QrCode,
  FileSpreadsheet,
  Layers,
  FileText,
  Package,
  Warehouse,
  PieChart,
  BarChart3,
  Boxes,
  FileCode2,
  ShoppingBag,
  Sparkles,
  Search,
  Camera,
  ArrowRight,
  TrendingUp,
  Clock,
  Zap,
} from 'lucide-react';
import QRScannerModal from '../components/common/QRScannerModal';

export default function HomePage({ onSelectModule, onNavigate }) {
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = onNavigate || onSelectModule || (() => {});

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [scannerOpen, setScannerOpen] = useState(false);

  const cards = useMemo(
    () => [
      {
        id: 'donhang',
        title: 'UP Đơn chi tiết',
        desc: 'Tải lên danh sách đơn hàng chi tiết từ các sàn thương mại điện tử',
        icon: FileSpreadsheet,
        color: 'from-sky-500 to-blue-600',
        badge: 'Trọng tâm',
        category: 'donhang',
      },
      {
        id: 'sanpham',
        title: 'Sản phẩm phần mềm',
        desc: 'Quản lý danh mục sản phẩm, mã SKU, SKU chi tiết và định giá',
        icon: Package,
        color: 'from-rose-500 to-pink-600',
        category: 'kho',
      },
      {
        id: 'hang_hoan',
        title: 'Dữ liệu Hàng hoàn',
        desc: 'Quản lý, tìm kiếm MVD, xem dạng Thẻ & Bảng, chụp ảnh hoàn trả',
        icon: RotateCcw,
        color: 'from-blue-600 to-indigo-600',
        badge: 'Hot',
        category: 'kho',
      },
      {
        id: 'hh_shop_dien',
        title: 'HH Shop điền',
        desc: 'Dữ liệu hàng hoàn do các shop tự điền và gửi về kho',
        icon: ShoppingBag,
        color: 'from-indigo-600 to-blue-700',
        category: 'kho',
      },
      {
        id: 'ban_don',
        title: 'Bắn đơn & Quét mã',
        desc: 'Quét MVD liên tục, kiểm tra trùng lặp và ghi nhận trạng thái xuất',
        icon: QrCode,
        color: 'from-violet-600 to-purple-600',
        badge: 'Quét QR',
        category: 'vanhanh',
      },
      {
        id: 'donhang_tong',
        title: 'Đơn hàng tổng',
        desc: 'Tổng hợp đơn hàng theo ngày, kênh bán và trạng thái xử lý',
        icon: Layers,
        color: 'from-amber-500 to-orange-600',
        category: 'donhang',
      },
      {
        id: 'dhct',
        title: 'Đơn chi tiết',
        desc: 'Xem và tạo mới đơn chi tiết theo nhóm Ngày - Trường - NCC',
        icon: FileText,
        color: 'from-emerald-600 to-teal-600',
        category: 'donhang',
      },
      {
        id: 'inventory',
        title: 'Quản lý Tồn kho',
        desc: 'Theo dõi số lượng tồn kho từng sản phẩm theo thời gian thực',
        icon: Warehouse,
        color: 'from-cyan-600 to-blue-600',
        category: 'kho',
      },
      {
        id: 'bc_hang_hoan',
        title: 'Báo cáo hàng hoàn',
        desc: 'Thống kê tỉ lệ hoàn trả, phân tích theo gian hàng và lý do hoàn',
        icon: PieChart,
        color: 'from-fuchsia-600 to-purple-600',
        category: 'baocao',
      },
      {
        id: 'baocao',
        title: 'Báo cáo đơn hàng',
        desc: 'Biểu đồ doanh thu, số lượng đơn theo khung giờ và ngày xuất',
        icon: BarChart3,
        color: 'from-green-600 to-emerald-600',
        category: 'baocao',
      },
      {
        id: 'baocao_tong',
        title: 'Báo cáo tổng',
        desc: 'Báo cáo đối soát tổng hợp toàn diện các kênh bán hàng',
        icon: Boxes,
        color: 'from-teal-600 to-emerald-700',
        category: 'baocao',
      },
      {
        id: 'upmisa',
        title: 'UPMISA',
        desc: 'Xuất dữ liệu hóa đơn và phiếu xuất kho tương thích phần mềm MISA',
        icon: FileCode2,
        color: 'from-amber-600 to-yellow-600',
        category: 'baocao',
      },
    ],
    []
  );

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'kho', label: 'Quản lý kho' },
    { id: 'donhang', label: 'Đơn hàng' },
    { id: 'vanhanh', label: 'Vận hành' },
    { id: 'baocao', label: 'Báo cáo' },
  ];

  const quickShortcuts = [
    {
      id: 'scanner',
      label: 'Quét QR',
      icon: Camera,
      color: 'bg-indigo-600 text-white shadow-indigo-200',
      action: () => setScannerOpen(true),
    },
    {
      id: 'ban_don',
      label: 'Bắn đơn',
      icon: QrCode,
      color: 'bg-violet-600 text-white shadow-violet-200',
      action: () => navigate('ban_don'),
    },
    {
      id: 'hang_hoan',
      label: 'Hàng hoàn',
      icon: RotateCcw,
      color: 'bg-blue-600 text-white shadow-blue-200',
      action: () => navigate('hang_hoan'),
    },
    {
      id: 'donhang',
      label: 'UP Đơn',
      icon: FileSpreadsheet,
      color: 'bg-sky-600 text-white shadow-sky-200',
      action: () => navigate('donhang'),
    },
    {
      id: 'donhang_tong',
      label: 'Đơn hàng',
      icon: Layers,
      color: 'bg-amber-600 text-white shadow-amber-200',
      action: () => navigate('donhang_tong'),
    },
  ];

  // Smart QR Routing: Tự động điều hướng đến module phù hợp khi quét QR
  const handleQrScanned = (code) => {
    const raw = (code || '').trim();
    if (!raw) return;

    toast?.success?.(`Đã quét mã: ${raw}`, { autoClose: 2000 });

    // Kiểm tra định dạng mã
    const isMvd = /^(SPX|GHN|GHTK|JNT|LEX|LZD|VTP|VNPOST|\d{9,18})/i.test(raw);
    const isSku = /^[A-Z0-9]{3,5}-[A-Z0-9]{2,4}-[A-Z0-9]{2,4}$/i.test(raw);

    if (isMvd) {
      navigate('hang_hoan');
    } else if (isSku) {
      navigate('sanpham');
    } else {
      // Mặc định chuyển sang Bắn đơn hoặc Hàng hoàn
      navigate('hang_hoan');
    }
  };

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (activeCategory !== 'all' && card.category !== activeCategory) {
        return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchTitle = card.title.toLowerCase().includes(q);
        const matchDesc = card.desc.toLowerCase().includes(q);
        return matchTitle || matchDesc;
      }
      return true;
    });
  }, [cards, activeCategory, searchTerm]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full pb-8">
      {/* 1. Welcome Banner + Dynamic Background */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg shadow-blue-500/15 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Kho Vận UPMISA 2026 • Realtime Edition</span>
          </div>

          <h1 className="text-lg sm:text-2xl font-black tracking-tight leading-tight">
            Xin chào, {currentUser?.name || currentUser?.id || 'Quản trị viên'}! 👋
          </h1>

          <p className="text-xs text-blue-100/90 leading-relaxed font-normal">
            Hệ thống quản trị kho, quét mã vận đơn và đồng bộ dữ liệu thời gian thực.
          </p>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Mobile Quick Search & QR Scanner Bar */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm nhanh module chức năng, báo cáo..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick QR Scanner Button */}
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
            title="Quét mã QR / Barcode nhanh"
          >
            <Camera className="w-4 h-4" />
            <span>Quét QR</span>
          </button>
        </div>

        {/* Quick Shortcuts Bar on Mobile */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
            Lối tắt:
          </span>
          {quickShortcuts.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={s.action}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5 text-blue-600" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeCategory === c.id
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 4. Grid of Modern Module Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
        {filteredCards.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            Không tìm thấy chức năng nào phù hợp với từ khóa "{searchTerm}".
          </div>
        ) : (
          filteredCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => navigate(card.id)}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-3 sm:p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98] relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md shadow-slate-200 group-hover:scale-105 transition-transform shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {card.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide shrink-0">
                        {card.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                  <span>Mở chức năng</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QR Scanner Modal for Search & Quick Action on Home */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleQrScanned}
        title="Quét mã QR / Barcode nhanh"
      />
    </div>
  );
}
