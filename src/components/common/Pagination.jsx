import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalRows,
  pageSize = 100,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100, 200, 500],
  maxButtons = 5,
  showRange = true,
}) {
  if (!totalPages || totalPages <= 0) {
    if (totalRows !== undefined && totalRows > 0) {
      // If single page with known rows
      return (
        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium select-none">
          <span>
            Tổng: <strong className="font-bold text-slate-800">{totalRows.toLocaleString('vi-VN')}</strong> dòng
          </span>
        </div>
      );
    }
    return null;
  }

  const getPageNumbers = () => {
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, currentPage - 2);
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  // Calculate range
  const startRow = totalRows ? (currentPage - 1) * (typeof pageSize === 'number' ? pageSize : totalRows) + 1 : null;
  const endRow = totalRows ? Math.min(currentPage * (typeof pageSize === 'number' ? pageSize : totalRows), totalRows) : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs select-none">
      {/* Total row count & range display */}
      <div className="flex items-center gap-2 text-slate-600">
        {totalRows !== undefined && (
          <span className="font-medium text-[11px] sm:text-xs">
            Hiển thị{' '}
            <strong className="text-slate-800 font-bold">
              {startRow !== null ? startRow.toLocaleString('vi-VN') : 1} -{' '}
              {endRow !== null ? endRow.toLocaleString('vi-VN') : totalRows.toLocaleString('vi-VN')}
            </strong>{' '}
            / <strong className="text-slate-900 font-bold">{totalRows.toLocaleString('vi-VN')}</strong> dòng
          </span>
        )}

        {/* Page Size Selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-2">
            <span className="text-slate-500 text-[11px]">Cỡ trang:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                onPageSizeChange(val);
              }}
              className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'all' ? 'Tất cả' : `${opt} dòng`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Page Buttons */}
      <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden text-xs shadow-2xs divide-x divide-slate-200">
        <span className="px-2 py-1 text-slate-500 bg-slate-50 font-bold select-none flex items-center text-[11px]">
          Trang
        </span>

        {/* First & Prev */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="Trang đầu"
          className="px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white font-bold flex items-center justify-center cursor-pointer transition-colors"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          title="Trang trước"
          className="px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white font-bold flex items-center justify-center cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Page numbers */}
        {pages.map((p) => {
          const isActive = p === currentPage;
          if (isActive) {
            return (
              <span
                key={p}
                className="px-2.5 py-1 text-blue-600 font-black bg-blue-50/70 flex items-center justify-center select-none text-[11px] sm:text-xs min-w-[28px]"
              >
                {p}
              </span>
            );
          }
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors text-[11px] sm:text-xs font-semibold min-w-[28px]"
            >
              {p}
            </button>
          );
        })}

        {/* Next & Last */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          title="Trang sau"
          className="px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white font-bold flex items-center justify-center cursor-pointer transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          title="Trang cuối"
          className="px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white font-bold flex items-center justify-center cursor-pointer transition-colors"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
