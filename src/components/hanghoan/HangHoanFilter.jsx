import React from 'react';
import {
  Table as TableIcon,
  LayoutGrid,
  RotateCw,
  Search,
  X,
  Camera,
  Plus,
  QrCode,
  FileSpreadsheet,
  FileCode2,
  Trash2,
} from 'lucide-react';
import { toYMD, shiftDate } from '../../utils/dateUtils';

export default function HangHoanFilter(props) {
  const {
    // New unified props
    filters = {},
    setFilters,
    khoList = [],
    maGianList = [],
    totalCount,
    selectedCount = 0,
    onDeleteSelected = () => {},
    onReload,
    onOpenCreate,
    onStartScanMvd,
    onScanFilterQr,
    onExportSkuTong,
    onExportFull,
    onExportMisa,
    loading = false,
    viewMode = 'table',
    setViewMode = () => {},

    // Legacy individual props
    statsCount,
    onRefresh,
    onSetToday,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    onShiftDate,
    khoFilter,
    setKhoFilter,
    trangThaiFilter,
    setTrangThaiFilter,
    maGianFilter,
    setMaGianFilter,
    gianHangOptions,
    searchQuery,
    setSearchQuery,
    onOpenNewDrawer,
    onOpenContinuousScan,
    onOpenSearchScan,
    onExportExcelMvd,
  } = props;

  const count = typeof totalCount === 'number' ? totalCount : (typeof statsCount === 'number' ? statsCount : 0);
  const currentFrom = fromDate ?? filters.from ?? '';
  const currentTo = toDate ?? filters.to ?? '';
  const currentKho = khoFilter ?? filters.kho ?? '';
  const currentTrangThai = trangThaiFilter ?? filters.trangThai ?? '';
  const currentMaGian = maGianFilter ?? filters.maGian ?? '';
  const currentSearch = searchQuery ?? filters.search ?? '';
  const stores = gianHangOptions || maGianList || [];

  const handleShift = (type, days) => {
    if (onShiftDate) {
      onShiftDate(type, days);
    } else if (setFilters) {
      setFilters((prev) => {
        const val = prev[type] || toYMD(new Date());
        return { ...prev, [type]: shiftDate(val, days) };
      });
    }
  };

  const handleToday = () => {
    if (onSetToday) {
      onSetToday();
    } else if (setFilters) {
      const today = toYMD(new Date());
      setFilters((prev) => ({ ...prev, from: today, to: today }));
    }
  };

  const handleRefresh = onRefresh || onReload || (() => {});
  const handleOpenCreate = onOpenCreate || onOpenNewDrawer || (() => {});
  const handleContinuousScan = onStartScanMvd || onOpenContinuousScan || (() => {});
  const handleSearchScan = onScanFilterQr || onOpenSearchScan || (() => {});
  const handleExportFull = onExportFull || onExportExcelMvd || (() => {});
  const handleExportSku = onExportSkuTong || (() => {});
  const handleExportMisaAction = onExportMisa || (() => {});

  const updateKho = (k) => {
    if (setKhoFilter) setKhoFilter(k);
    if (setFilters) setFilters((prev) => ({ ...prev, kho: k }));
  };

  const updateTrangThai = (st) => {
    if (setTrangThaiFilter) setTrangThaiFilter(st);
    if (setFilters) setFilters((prev) => ({ ...prev, trangThai: st }));
  };

  const updateMaGian = (mg) => {
    if (setMaGianFilter) setMaGianFilter(mg);
    if (setFilters) setFilters((prev) => ({ ...prev, maGian: mg }));
  };

  const updateSearch = (s) => {
    if (setSearchQuery) setSearchQuery(s);
    if (setFilters) setFilters((prev) => ({ ...prev, search: s }));
  };

  const updateFrom = (v) => {
    if (setFromDate) setFromDate(v);
    if (setFilters) setFilters((prev) => ({ ...prev, from: v }));
  };

  const updateTo = (v) => {
    if (setToDate) setToDate(v);
    if (setFilters) setFilters((prev) => ({ ...prev, to: v }));
  };

  return (
    <div className="p-2.5 sm:p-3 border-b border-slate-200 bg-white space-y-2 lg:space-y-3 rounded-2xl shadow-xs">
      {/* Filters & Search Row */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
        {/* Stats & View Mode Toggle & Refresh */}
        <div className="flex items-center justify-between lg:justify-start gap-2 shrink-0">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-tight bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
            Số đơn: {Number(count).toLocaleString('vi-VN')}
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle: [ Bảng | Thẻ ] */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg shrink-0 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Xem dạng Bảng"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="text-[10.5px]">Bảng</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'card'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Xem dạng Thẻ (Card)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[10.5px]">Thẻ</span>
              </button>
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="p-1.5 lg:p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200/60 cursor-pointer"
              title="Tải lại dữ liệu"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Today shortcut button */}
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold rounded-lg hover:bg-blue-100 transition-colors uppercase whitespace-nowrap cursor-pointer"
            >
              Hôm nay
            </button>
          </div>
        </div>

        {/* Date Filter: Từ ngày - Đến ngày */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 lg:flex lg:items-center lg:gap-2">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleShift('from', -1)}
              className="w-7 h-8 px-1.5 flex items-center justify-center bg-slate-100 border border-slate-200 border-r-0 rounded-l-lg text-slate-600 hover:bg-slate-200 transition-all font-bold text-xs cursor-pointer"
            >
              -
            </button>
            <input
              type="date"
              value={currentFrom}
              onChange={(e) => updateFrom(e.target.value)}
              className="w-full lg:w-28 h-8 px-1 bg-slate-50 border border-slate-200 text-[11px] font-semibold focus:ring-0 outline-none text-center"
            />
            <button
              type="button"
              onClick={() => handleShift('from', 1)}
              className="w-7 h-8 px-1.5 flex items-center justify-center bg-slate-100 border border-slate-200 border-l-0 rounded-r-lg text-slate-600 hover:bg-slate-200 transition-all font-bold text-xs cursor-pointer"
            >
              +
            </button>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleShift('to', -1)}
              className="w-7 h-8 px-1.5 flex items-center justify-center bg-slate-100 border border-slate-200 border-r-0 rounded-l-lg text-slate-600 hover:bg-slate-200 transition-all font-bold text-xs cursor-pointer"
            >
              -
            </button>
            <input
              type="date"
              value={currentTo}
              onChange={(e) => updateTo(e.target.value)}
              className="w-full lg:w-28 h-8 px-1 bg-slate-50 border border-slate-200 text-[11px] font-semibold focus:ring-0 outline-none text-center"
            />
            <button
              type="button"
              onClick={() => handleShift('to', 1)}
              className="w-7 h-8 px-1.5 flex items-center justify-center bg-slate-100 border border-slate-200 border-l-0 rounded-r-lg text-slate-600 hover:bg-slate-200 transition-all font-bold text-xs cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Warehouse, Status, Store filters */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-1.5 lg:gap-2 lg:min-w-0">
          {/* Kho buttons */}
          <div className="flex gap-0.5 bg-slate-100 p-0.5 rounded-lg shrink-0 border border-slate-200/60">
            {['', 'KHO', 'BH'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => updateKho(k)}
                className={`px-2 py-1 rounded text-[10.5px] font-bold transition-all cursor-pointer ${
                  currentKho === k
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {k === '' ? 'Tất cả' : k}
              </button>
            ))}
          </div>

          {/* Trạng thái buttons (Hoàn / Trả) */}
          <div className="flex gap-0.5 bg-slate-100 p-0.5 rounded-lg shrink-0 border border-slate-200/60">
            {[
              { id: '', label: 'Tất cả' },
              { id: 'Hoàn', label: 'Hoàn' },
              { id: 'Trả', label: 'Trả' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => updateTrangThai(st.id)}
                className={`px-2 py-1 rounded text-[10.5px] font-bold transition-all cursor-pointer ${
                  currentTrangThai === st.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Gian hàng select */}
          <select
            value={currentMaGian}
            onChange={(e) => updateMaGian(e.target.value)}
            className="w-full sm:w-auto flex-1 lg:w-36 lg:flex-none px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer truncate"
          >
            <option value="">Tất cả gian hàng</option>
            {stores.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Multi-keyword Search Box with X clear and QR camera */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={currentSearch}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Tìm MVD, Gian, SKU, Tình trạng (dấu , tìm nhiều)..."
            className="w-full pl-9 pr-16 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 outline-none focus:bg-white transition-all font-medium"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {currentSearch && (
              <button
                type="button"
                onClick={() => updateSearch('')}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSearchScan}
              className="p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Quét mã MVD tìm kiếm"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-3 pt-0.5">
        {/* Mobile action buttons (Full width on mobile) */}
        <div className="flex gap-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex-1 lg:flex-none lg:px-5 flex items-center justify-center gap-1.5 bg-indigo-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mới</span>
          </button>
          <button
            type="button"
            onClick={handleContinuousScan}
            className="flex-1 lg:flex-none lg:px-5 flex items-center justify-center gap-1.5 bg-violet-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-violet-700 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Quét MVD</span>
          </button>
        </div>

        {/* Export and Delete buttons (Only show if items are selected) */}
        {selectedCount > 0 && (
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={onDeleteSelected}
              className="flex items-center justify-center gap-1.5 bg-rose-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs hover:bg-rose-700 transition-all shadow-xs cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa ({selectedCount})</span>
            </button>

            <button
              type="button"
              onClick={handleExportFull}
              className="flex items-center justify-center gap-1.5 bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel Full</span>
            </button>

            <button
              type="button"
              onClick={handleExportSku}
              className="flex items-center justify-center gap-1.5 bg-teal-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs hover:bg-teal-700 transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel SKU Tổng</span>
            </button>

            <button
              type="button"
              onClick={handleExportMisaAction}
              className="flex items-center justify-center gap-1.5 bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-600 transition-all shadow-xs cursor-pointer"
            >
              <FileCode2 className="w-4 h-4" />
              <span>MISA</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
