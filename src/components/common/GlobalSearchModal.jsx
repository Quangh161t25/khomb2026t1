import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Home,
  FileSpreadsheet,
  Package,
  RotateCcw,
  QrCode,
  Layers,
  FileText,
  Warehouse,
  PieChart,
  BarChart3,
  Boxes,
  FileCode2,
  Settings,
  TableProperties,
  Type,
  X,
  ArrowRight,
  Sparkles,
  Command,
} from 'lucide-react';
import { useColumnWidths } from '../../context/ColumnWidthContext';

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onNavigate,
}) {
  const { openSettings } = useColumnWidths();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const searchItems = [
    // Modules
    {
      id: 'home',
      title: 'Trang chủ',
      category: 'Tổng quan',
      icon: Home,
      keywords: 'trang chu dashboard tong quan home overview',
      action: () => {
        onNavigate('home');
        onClose();
      },
    },
    {
      id: 'donhang',
      title: 'UP Đơn chi tiết',
      category: 'Quản lý kho & Đơn hàng',
      icon: FileSpreadsheet,
      keywords: 'up don chi tiet don hang san shopee lazada tiktok excel import udct',
      badge: 'Chính',
      action: () => {
        onNavigate('donhang');
        onClose();
      },
    },
    {
      id: 'sanpham',
      title: 'Sản phẩm PM',
      category: 'Quản lý kho & Đơn hàng',
      icon: Package,
      keywords: 'san pham pm sku danh muc gia ban gia nhap products',
      action: () => {
        onNavigate('sanpham');
        onClose();
      },
    },
    {
      id: 'hang_hoan',
      title: 'Hàng hoàn',
      category: 'Quản lý kho & Đơn hàng',
      icon: RotateCcw,
      keywords: 'hang hoan tra hang shopee lazada tiktok ma van don return',
      action: () => {
        onNavigate('hang_hoan');
        onClose();
      },
    },
    {
      id: 'ban_don',
      title: 'Bắn đơn',
      category: 'Quản lý kho & Đơn hàng',
      icon: QrCode,
      keywords: 'ban don qr barcode quet ma xuat kho scan',
      action: () => {
        onNavigate('ban_don');
        onClose();
      },
    },
    {
      id: 'donhang_tong',
      title: 'Đơn hàng (Tổng)',
      category: 'Quản lý kho & Đơn hàng',
      icon: Layers,
      keywords: 'don hang tong id dh ncc truong xuat nhap orders summary',
      action: () => {
        onNavigate('donhang_tong');
        onClose();
      },
    },
    {
      id: 'dhct',
      title: 'Đơn hàng CT',
      category: 'Quản lý kho & Đơn hàng',
      icon: FileText,
      keywords: 'don hang chi tiet dhct items order details',
      action: () => {
        onNavigate('dhct');
        onClose();
      },
    },
    {
      id: 'inventory',
      title: 'Tồn kho',
      category: 'Quản lý kho & Đơn hàng',
      icon: Warehouse,
      keywords: 'ton kho so luong ton dau ton cuoi inventory stock',
      action: () => {
        onNavigate('inventory');
        onClose();
      },
    },
    {
      id: 'bc_hang_hoan',
      title: 'Báo cáo Hàng hoàn',
      category: 'Báo cáo & Thống kê',
      icon: PieChart,
      keywords: 'bao cao hang hoan bchh top sku gian hang tinh trang refund report',
      action: () => {
        onNavigate('bc_hang_hoan');
        onClose();
      },
    },
    {
      id: 'baocao',
      title: 'Báo cáo đơn hàng',
      category: 'Báo cáo & Thống kê',
      icon: BarChart3,
      keywords: 'bao cao don hang doanh thu bieu do report chart revenue',
      action: () => {
        onNavigate('baocao');
        onClose();
      },
    },
    {
      id: 'baocao_tong',
      title: 'Báo cáo tổng',
      category: 'Báo cáo & Thống kê',
      icon: Boxes,
      keywords: 'bao cao tong tong hop general report',
      action: () => {
        onNavigate('baocao_tong');
        onClose();
      },
    },
    {
      id: 'upmisa',
      title: 'UPMISA',
      category: 'Báo cáo & Thống kê',
      icon: FileCode2,
      keywords: 'upmisa misa ke toan xml excel dong bo',
      action: () => {
        onNavigate('upmisa');
        onClose();
      },
    },
    // Quick Utilities & Settings
    {
      id: 'settings_columns',
      title: 'Cài đặt kích thước cột',
      category: 'Hệ thống & Cài đặt',
      icon: TableProperties,
      keywords: 'cai dat kich thuoc cot column width resize dong bo reset table',
      action: () => {
        onClose();
        openSettings('columns');
      },
    },
    {
      id: 'settings_font',
      title: 'Cài đặt cỡ chữ (Font size)',
      category: 'Hệ thống & Cài đặt',
      icon: Type,
      keywords: 'cai dat co chu font size he thong bang chu to chu nho scale',
      action: () => {
        onClose();
        openSettings('general');
      },
    },
    {
      id: 'settings_account',
      title: 'Thông tin tài khoản',
      category: 'Hệ thống & Cài đặt',
      icon: Settings,
      keywords: 'thong tin tai khoan user account profile role phan quyen',
      action: () => {
        onClose();
        openSettings('account');
      },
    },
  ];

  // Filter items
  const filtered = query.trim()
    ? searchItems.filter((item) => {
        const q = query.toLowerCase().trim();
        const str = `${item.title} ${item.category} ${item.keywords}`.toLowerCase();
        return q.split(' ').every((k) => str.includes(k));
      })
    : searchItems;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-3 border-b border-slate-200 flex items-center gap-2.5 bg-slate-50/70">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm nhanh modul, báo cáo, cài đặt... (gõ tên hoặc từ khóa)"
            className="flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-500 border border-slate-200 rounded shadow-2xs">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold">Không tìm thấy kết quả phù hợp cho "{query}"</p>
              <p className="text-[11px] mt-1 text-slate-400">Thử tìm kiếm với từ khóa khác như "đơn hàng", "báo cáo", "tồn kho"...</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900 shadow-2xs border border-blue-200'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs truncate">{item.title}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                    {isSelected && (
                      <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                        Mở <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">↑</kbd>{' '}
              <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">↓</kbd>{' '}
              Di chuyển
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">Enter</kbd>{' '}
              Chọn
            </span>
          </div>
          <span className="font-semibold text-slate-500">UPMISA ERP</span>
        </div>
      </div>
    </div>
  );
}
