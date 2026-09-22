import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react';

export default function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const popoverRef = useRef(null);

  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Đồng bộ Google Sheets thành công',
      desc: 'Dữ liệu các bảng đã được cập nhật theo thời gian thực.',
      time: 'Vừa xong',
      read: false,
    },
    {
      id: 2,
      type: 'info',
      title: 'Hệ thống đã nâng cấp phiên bản ERP 2026',
      desc: 'Bổ sung thanh tác vụ hàng loạt, cỡ chữ tùy chỉnh và tìm kiếm nhanh Ctrl+K.',
      time: '10 phút trước',
      read: false,
    },
    {
      id: 3,
      type: 'warning',
      title: 'Kiểm tra tồn kho',
      desc: 'Có 3 SKU đang ở mức cảnh báo tồn kho thấp dưới mức an toàn.',
      time: '1 giờ trước',
      read: true,
    },
  ];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 shadow-2xs"
        title="Thông báo hệ thống"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-800">Thông báo</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
            {notifications.map((item) => {
              let iconBg = 'bg-blue-50 text-blue-600';
              let Icon = Sparkles;
              if (item.type === 'success') {
                iconBg = 'bg-emerald-50 text-emerald-600';
                Icon = CheckCircle2;
              } else if (item.type === 'warning') {
                iconBg = 'bg-amber-50 text-amber-600';
                Icon = AlertTriangle;
              }

              return (
                <div
                  key={item.id}
                  className={`p-3 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer ${
                    !item.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${iconBg}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-xs text-slate-800 truncate">{item.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
            <span className="text-[11px] font-bold text-slate-500">
              Trạng thái máy chủ: Hoạt động bình thường
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
