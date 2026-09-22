import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  ChevronRight,
  PanelLeft,
  Settings,
  User,
  TableProperties,
  ChevronDown,
  LogOut,
  Search,
  Type,
  Command,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useColumnWidths } from '../context/ColumnWidthContext';
import NotificationPopover from '../components/common/NotificationPopover';

export default function Header({
  activeModule,
  moduleInfo,
  onToggleSidebar,
  onNavigateHome,
  onOpenGlobalSearch,
}) {
  const { user, currentUser, logout } = useAuth();
  const activeUser = user || currentUser;
  const { openSettings } = useColumnWidths();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    }
    if (accountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountMenuOpen]);

  const category = moduleInfo?.category || 'Tổng quan';
  const label = moduleInfo?.label || 'Trang chủ';
  const isHome = activeModule === 'home';

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-2xs gap-2">
      {/* Left: Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Toggle Sidebar Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
          title="Thu gọn / Mở rộng menu"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Breadcrumb Path */}
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 min-w-0 overflow-hidden">
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors px-1 py-0.5 rounded shrink-0"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Trang chủ</span>
          </button>

          {!isHome && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="text-slate-500 truncate hidden md:inline">{category}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg shadow-2xs text-[11px] sm:text-xs truncate">
                {label}
              </span>
            </>
          )}

          {isHome && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg shadow-2xs text-[11px] sm:text-xs">
                Tổng quan
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Center: Quick Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-3">
        <button
          type="button"
          onClick={onOpenGlobalSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 text-slate-400 text-xs transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="truncate text-slate-500 group-hover:text-slate-700">
              Tìm nhanh toàn hệ thống...
            </span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-400 border border-slate-200 rounded">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Side: Status Badge, Notifications, Settings, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mobile Search Icon */}
        <button
          type="button"
          onClick={onOpenGlobalSearch}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
          title="Tìm kiếm nhanh (Ctrl+K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Live Status Pill */}
        <div className="hidden xl:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-full text-[11px] font-bold select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Google Sheets Online</span>
        </div>

        {/* Notifications Bell */}
        <NotificationPopover />

        {/* Dedicated "Cài đặt" Button */}
        <button
          type="button"
          onClick={() => openSettings('columns', activeModule)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-blue-700 transition-all text-xs font-bold shadow-2xs group"
          title="Mở Cài đặt hệ thống, cỡ chữ & kích thước cột"
        >
          <Settings className="w-4 h-4 text-blue-600 group-hover:rotate-45 transition-transform duration-300" />
          <span className="hidden sm:inline">Cài đặt</span>
        </button>

        {/* User Account / Avatar Button with Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setAccountMenuOpen((prev) => !prev)}
            className={`flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border transition-all shadow-2xs group ${
              accountMenuOpen
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
            }`}
            title="Tài khoản & Menu cài đặt"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 uppercase group-hover:bg-blue-700 transition-colors shadow-2xs">
              {activeUser?.name?.charAt(0) || activeUser?.id?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                {activeUser?.name || activeUser?.id || 'Tài khoản'}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase leading-none">
                {activeUser?.role || 'User'}
              </p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                accountMenuOpen ? 'rotate-180 text-blue-600' : ''
              }`}
            />
          </button>

          {/* Account Dropdown Menu */}
          {accountMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User Profile Header */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 uppercase shadow-2xs">
                  {activeUser?.name?.charAt(0) || activeUser?.id?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {activeUser?.name || 'Tài khoản'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    ID: {activeUser?.id || 'USER'}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {activeUser?.role || 'User'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Trực tuyến
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-1.5 space-y-1">
                {/* 1. Cài đặt hệ thống & Cỡ chữ */}
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    openSettings('general');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Type className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 group-hover:text-blue-600">Cài đặt cỡ chữ</p>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold">Mới</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-normal truncate">Chỉnh cỡ chữ giao diện & bảng</p>
                  </div>
                </button>

                {/* 2. Kích thước cột */}
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    openSettings('columns', activeModule);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <TableProperties className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 group-hover:text-blue-600">Kích thước cột</p>
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">Đồng bộ</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-normal truncate">Tùy chỉnh & ẩn hiện cột</p>
                  </div>
                </button>

                {/* 3. Thông tin tài khoản */}
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    openSettings('account');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 group-hover:text-blue-600">Thông tin tài khoản</p>
                    <p className="text-[10px] text-slate-400 font-normal truncate">Chi tiết tài khoản & quyền hạn</p>
                  </div>
                </button>
              </div>

              <div className="my-1 border-t border-slate-100" />

              {/* 4. Đăng xuất */}
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-rose-600">Đăng xuất</p>
                    <p className="text-[10px] text-rose-400 font-normal">Thoát khỏi phiên làm việc</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
