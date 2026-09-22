import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useColumnWidths } from '../context/ColumnWidthContext';
import {
  Home,
  RotateCcw,
  QrCode,
  FileSpreadsheet,
  Package,
  Layers,
  BarChart3,
  PieChart,
  FileText,
  Warehouse,
  Boxes,
  FileCode2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Settings,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export default function Sidebar({
  activeModule,
  setActiveModule,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const { currentUser, user, logout } = useAuth();
  const { openSettings } = useColumnWidths();
  const activeUser = user || currentUser;

  const menuGroups = [
    {
      groupTitle: 'TỔNG QUAN',
      items: [
        { id: 'home', label: 'Trang chủ', icon: Home },
      ],
    },
    {
      groupTitle: 'QUẢN LÝ KHO & ĐƠN HÀNG',
      items: [
        { id: 'donhang', label: 'UP Đơn chi tiết', icon: FileSpreadsheet, badge: 'Chính', highlight: true },
        { id: 'sanpham', label: 'Sản phẩm PM', icon: Package },
        { id: 'hang_hoan', label: 'Hàng hoàn', icon: RotateCcw },
        { id: 'hh_shop_dien', label: 'HH Shop điền', icon: ShoppingBag },
        { id: 'ban_don', label: 'Bắn đơn', icon: QrCode },
        { id: 'donhang_tong', label: 'Đơn hàng', icon: Layers },
        { id: 'dhct', label: 'Đơn hàng CT', icon: FileText },
        { id: 'inventory', label: 'Tồn kho', icon: Warehouse },
      ],
    },
    {
      groupTitle: 'BÁO CÁO & THỐNG KÊ',
      items: [
        { id: 'bc_hang_hoan', label: 'BC Hàng hoàn', icon: PieChart },
        { id: 'baocao', label: 'Báo cáo đơn hàng', icon: BarChart3 },
        { id: 'baocao_tong', label: 'Báo cáo tổng', icon: Boxes },
        { id: 'upmisa', label: 'UPMISA', icon: FileCode2 },
      ],
    },
  ];

  const handleSelect = (id) => {
    setActiveModule(id);
    if (mobileOpen) setMobileOpen(false);
  };

  const isItemActive = (itemId) => {
    if (activeModule === itemId) return true;
    if (itemId === 'hang_hoan' && (activeModule === 'hanghoan' || activeModule === 'hang_hoan')) return true;
    if (itemId === 'ban_don' && (activeModule === 'bandon' || activeModule === 'ban_don')) return true;
    if (itemId === 'bc_hang_hoan' && (activeModule === 'bchh' || activeModule === 'bc_hang_hoan')) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div
            className="flex items-center gap-2.5 overflow-hidden cursor-pointer"
            onClick={() => handleSelect('home')}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              U
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="font-black text-slate-900 text-sm tracking-tight truncate leading-tight">
                  UPMISA
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                  ERP SYSTEM 2026
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Categorized Navigation items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed ? (
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                  {group.groupTitle}
                </div>
              ) : (
                <div className="my-2 border-t border-slate-100 mx-2" />
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all group relative ${
                      active
                        ? 'bg-blue-50/90 text-blue-600 shadow-2xs font-bold ring-1 ring-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    } ${item.highlight && !active ? 'hover:text-blue-600' : ''}`}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                        active
                          ? 'text-blue-600'
                          : item.highlight
                          ? 'text-blue-600'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />

                    {!collapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate text-left">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 font-bold text-[9px] rounded uppercase tracking-wider shadow-2xs">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Left Active Accent Pill */}
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

      </aside>
    </>
  );
}
