import React from 'react';

export default function Footer() {
  return (
    <footer className="h-10 bg-white border-t border-slate-200 px-3 sm:px-4 flex items-center justify-between text-xs text-slate-500 shrink-0 sticky bottom-0 z-20 shadow-xs">
      {/* Left: Copyright & Pagination placed directly beside each other */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 overflow-x-auto custom-scrollbar py-1">
        <span className="font-medium text-slate-600 whitespace-nowrap shrink-0">
          © 2026 Kho Vận 2026. All rights reserved.
        </span>

        {/* Pagination Slot - placed right next to copyright */}
        <div id="footer-pagination-slot" className="flex items-center gap-2 shrink-0" />
      </div>

      {/* Right: Version & Status */}
      <div className="hidden md:flex items-center gap-2.5 shrink-0 text-[11px] ml-4">
        <span className="font-semibold text-slate-600">Phiên bản 2.0 React</span>
        <span>•</span>
        <span className="text-emerald-600 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Đã kết nối API
        </span>
      </div>
    </footer>
  );
}
