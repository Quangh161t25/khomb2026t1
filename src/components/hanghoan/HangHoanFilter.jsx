import React, { useState } from 'react';
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
  Filter,
  ChevronLeft,
  ChevronRight,
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

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const count = typeof totalCount === 'number' ? totalCount : (typeof statsCount === 'number' ? statsCount : 0);
  const currentFrom = fromDate ?? filters.from ?? '';
  const currentTo = toDate ?? filters.to ?? '';
  const currentKho = khoFilter ?? filters.kho ?? '';
  const currentTrangThai = trangThaiFilter ?? filters.trangThai ?? '';
  const currentMaGian = maGianFilter ?? filters.maGian ?? '';
  const currentSearch = searchQuery ?? filters.search ?? '';
  const stores = gianHangOptions || maGianList || [];

  const todayStr = toYMD(new Date());

  const handleToday = () => {
    if (onSetToday) {
      onSetToday();
    } else if (setFilters) {
      setFilters((prev) => ({ ...prev, from: todayStr, to: todayStr }));
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

  // --- Single Stepper Logic ---
  const isSingleDay = currentFrom === currentTo;
  
  const formatDateDisplay = (d) => {
    if (!d) return '';
    if (d === todayStr) return 'Hôm nay';
    const parts = d.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    return d;
  };

  const dateDisplay = isSingleDay 
    ? formatDateDisplay(currentFrom)
    : `${formatDateDisplay(currentFrom)} - ${formatDateDisplay(currentTo)}`;

  const shiftDuration = isSingleDay 
    ? 1 
    : Math.round((new Date(currentTo) - new Date(currentFrom)) / (1000 * 60 * 60 * 24)) + 1;

  const handleStepDate = (direction) => {
     const days = shiftDuration * direction;
     if (onShiftDate) {
       if (setFilters) {
         setFilters((prev) => ({
           ...prev,
           from: shiftDate(currentFrom, days),
           to: shiftDate(currentTo, days)
         }));
       }
     } else if (setFilters) {
       setFilters((prev) => ({
         ...prev,
         from: shiftDate(currentFrom, days),
         to: shiftDate(currentTo, days)
       }));
     } else {
       if (setFromDate) setFromDate(shiftDate(currentFrom, days));
       if (setToDate) setToDate(shiftDate(currentTo, days));
     }
  };

  const setQuickDate = (range) => {
    const today = new Date();
    let from, to;
    if (range === 'today') {
      from = todayStr;
      to = from;
    } else if (range === 'yesterday') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      from = toYMD(y);
      to = from;
    } else if (range === 'thisWeek') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(today.setDate(diff));
      from = toYMD(startOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      to = toYMD(endOfWeek);
    } else if (range === 'lastWeek') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1) - 7;
      const startOfLastWeek = new Date(today.setDate(diff));
      from = toYMD(startOfLastWeek);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
      to = toYMD(endOfLastWeek);
    } else if (range === 'thisMonth') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      from = toYMD(startOfMonth);
      to = toYMD(endOfMonth);
    }
    
    if (setFilters) setFilters(prev => ({ ...prev, from, to }));
    if (setFromDate) setFromDate(from);
    if (setToDate) setToDate(to);
  };

  // Check if any advanced filters are active to highlight the filter button
  const hasAdvancedFilters = currentKho !== '' || currentTrangThai !== '' || currentMaGian !== '';

  return (
    <div className="p-2.5 sm:p-3 border-b border-slate-200 bg-white rounded-2xl shadow-xs relative">
      {/* Main Toolbar */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-3">
        {/* 1. Số đơn */}
        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-tight bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 shrink-0">
          Số đơn: {Number(count).toLocaleString('vi-VN')}
        </div>

        {/* 2. Load */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="p-1.5 lg:p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200/60 cursor-pointer shrink-0"
          title="Tải lại dữ liệu"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* 3. Tìm kiếm */}
        <div className="relative flex-1 min-w-[200px] lg:min-w-[250px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={currentSearch}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Tìm MVD, Gian, SKU, Tình trạng..."
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

        {/* 4. Ngày (Single Stepper) */}
        <div className="flex items-center shrink-0">
           <button 
             type="button"
             onClick={() => handleStepDate(-1)} 
             className="w-7 h-8 flex items-center justify-center bg-slate-100 border border-slate-200 border-r-0 rounded-l-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
             title="Lùi thời gian"
           >
             <ChevronLeft className="w-4 h-4"/>
           </button>
           <div 
             className="h-8 px-3 flex items-center justify-center bg-slate-50 border border-slate-200 text-[11px] font-bold text-indigo-700 min-w-[110px] text-center cursor-pointer hover:bg-indigo-50 transition-colors"
             onClick={() => setIsFilterOpen(true)}
             title="Nhấn để chọn ngày cụ thể"
           >
             {dateDisplay}
           </div>
           <button 
             type="button"
             onClick={() => handleStepDate(1)} 
             className="w-7 h-8 flex items-center justify-center bg-slate-100 border border-slate-200 border-l-0 rounded-r-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
             title="Tiến thời gian"
           >
             <ChevronRight className="w-4 h-4"/>
           </button>
        </div>

        {/* 5. Lọc nâng cao Button */}
        <button 
          type="button"
          onClick={() => setIsFilterOpen(!isFilterOpen)} 
          className={`flex items-center gap-1.5 h-8 px-3 border rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
            hasAdvancedFilters 
              ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' 
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
          title="Bộ lọc nâng cao"
        >
           <Filter className="w-3.5 h-3.5" />
           <span className="hidden sm:inline">Lọc</span>
           {hasAdvancedFilters && <span className="w-2 h-2 rounded-full bg-rose-500 ml-0.5"></span>}
        </button>

        {/* 6. Kiểu xem Bảng/Thẻ */}
        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
          className="p-1.5 lg:p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200/60 cursor-pointer shrink-0"
          title={viewMode === 'table' ? 'Chuyển sang dạng Thẻ' : 'Chuyển sang dạng Bảng'}
        >
          {viewMode === 'table' ? <LayoutGrid className="w-4 h-4" /> : <TableIcon className="w-4 h-4" />}
        </button>

        {/* 7. Quét MVD */}
        <button
          type="button"
          onClick={handleContinuousScan}
          className="px-4 py-1.5 flex items-center justify-center gap-1.5 bg-violet-600 text-white font-bold rounded-lg text-xs hover:bg-violet-700 active:scale-[0.98] transition-all shadow-xs cursor-pointer shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Quét MVD</span>
        </button>

        {/* 8. Thêm mới */}
        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-1.5 flex items-center justify-center gap-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Thêm mới</span>
        </button>
      </div>

      {/* Export and Delete buttons (Only show if items are selected) */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onDeleteSelected}
            className="flex items-center justify-center gap-1.5 bg-rose-600 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs hover:bg-rose-700 transition-all shadow-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa ({selectedCount})</span>
          </button>

          <button
            type="button"
            onClick={handleExportFull}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel Full</span>
          </button>

          <button
            type="button"
            onClick={handleExportSku}
            className="flex items-center justify-center gap-1.5 bg-teal-600 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs hover:bg-teal-700 transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel SKU Tổng</span>
          </button>

          <button
            type="button"
            onClick={handleExportMisaAction}
            className="flex items-center justify-center gap-1.5 bg-amber-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-amber-600 transition-all shadow-xs cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>MISA</span>
          </button>
        </div>
      )}

      {/* OVERLAY FILTER DRAWER */}
      {isFilterOpen && (
        <div className="absolute top-12 right-2 lg:right-6 w-[320px] bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-200 z-50 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
           <div className="flex justify-between items-center mb-1 border-b border-slate-100 pb-2">
             <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
               <Filter className="w-4 h-4 text-indigo-600" />
               Bộ lọc nâng cao
             </h3>
             <button 
               onClick={() => setIsFilterOpen(false)} 
               className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
             >
               <X className="w-4 h-4"/>
             </button>
           </div>
           
           <div className="space-y-4">
             {/* Chọn Ngày */}
             <div>
               <label className="block text-[10.5px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Khoảng thời gian</label>
               
               <div className="flex flex-wrap gap-1.5 mb-2.5">
                 <button onClick={() => setQuickDate('today')} className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 px-2 py-1 rounded font-bold transition-colors cursor-pointer">Hôm nay</button>
                 <button onClick={() => setQuickDate('yesterday')} className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 px-2 py-1 rounded font-bold transition-colors cursor-pointer">Hôm qua</button>
                 <button onClick={() => setQuickDate('thisWeek')} className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 px-2 py-1 rounded font-bold transition-colors cursor-pointer">Tuần này</button>
                 <button onClick={() => setQuickDate('lastWeek')} className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 px-2 py-1 rounded font-bold transition-colors cursor-pointer">Tuần trước</button>
                 <button onClick={() => setQuickDate('thisMonth')} className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 px-2 py-1 rounded font-bold transition-colors cursor-pointer">Tháng này</button>
               </div>

               <div className="flex items-center gap-1.5">
                 <button onClick={() => updateFrom(shiftDate(currentFrom, -1))} className="px-1.5 py-1 bg-slate-100 rounded text-slate-600 hover:bg-slate-200 cursor-pointer font-bold">-</button>
                 <input 
                   type="date" 
                   value={currentFrom} 
                   onChange={(e) => updateFrom(e.target.value)} 
                   className="flex-1 min-w-0 h-8 px-1 text-center bg-slate-50 border border-slate-200 rounded text-[11px] focus:ring-2 focus:ring-blue-500/20 outline-none" 
                 />
                 <button onClick={() => updateFrom(shiftDate(currentFrom, 1))} className="px-1.5 py-1 bg-slate-100 rounded text-slate-600 hover:bg-slate-200 cursor-pointer font-bold">+</button>
                 
                 <span className="text-slate-300 font-bold px-0.5">-</span>
                 
                 <button onClick={() => updateTo(shiftDate(currentTo, -1))} className="px-1.5 py-1 bg-slate-100 rounded text-slate-600 hover:bg-slate-200 cursor-pointer font-bold">-</button>
                 <input 
                   type="date" 
                   value={currentTo} 
                   onChange={(e) => updateTo(e.target.value)} 
                   className="flex-1 min-w-0 h-8 px-1 text-center bg-slate-50 border border-slate-200 rounded text-[11px] focus:ring-2 focus:ring-blue-500/20 outline-none" 
                 />
                 <button onClick={() => updateTo(shiftDate(currentTo, 1))} className="px-1.5 py-1 bg-slate-100 rounded text-slate-600 hover:bg-slate-200 cursor-pointer font-bold">+</button>
               </div>
             </div>

             {/* Chọn Kho */}
             <div>
               <label className="block text-[10.5px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Kho</label>
               <div className="flex flex-wrap gap-1.5">
                 {['', 'KHO', 'BH'].map(k => (
                   <button 
                     key={k} 
                     onClick={() => updateKho(k)} 
                     className={`px-3 py-1.5 rounded-lg text-[11px] border transition-all cursor-pointer ${
                       currentKho === k 
                         ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-xs' 
                         : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                     }`}
                   >
                     {k || 'Tất cả'}
                   </button>
                 ))}
               </div>
             </div>

             {/* Chọn Trạng thái */}
             <div>
               <label className="block text-[10.5px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Trạng thái</label>
               <div className="flex flex-wrap gap-1.5">
                 {['', 'Hoàn', 'Trả'].map(st => (
                   <button 
                     key={st} 
                     onClick={() => updateTrangThai(st)} 
                     className={`px-3 py-1.5 rounded-lg text-[11px] border transition-all cursor-pointer ${
                       currentTrangThai === st 
                         ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-xs' 
                         : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                     }`}
                   >
                     {st || 'Tất cả'}
                   </button>
                 ))}
               </div>
             </div>

             {/* Chọn Gian hàng */}
             <div>
               <label className="block text-[10.5px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Gian hàng</label>
               <select 
                 value={currentMaGian} 
                 onChange={(e) => updateMaGian(e.target.value)} 
                 className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
               >
                 <option value="">-- Tất cả gian hàng --</option>
                 {stores.map(g => <option key={g} value={g}>{g}</option>)}
               </select>
             </div>
           </div>

           {/* Footer Action */}
           <div className="mt-2 pt-3 border-t border-slate-100 flex justify-end">
             <button 
               onClick={() => {
                 updateKho('');
                 updateTrangThai('');
                 updateMaGian('');
                 handleToday();
               }} 
               className="text-[11px] text-slate-500 hover:text-rose-600 font-medium px-3 py-1.5 rounded hover:bg-rose-50 transition-colors cursor-pointer"
             >
               Xóa bộ lọc
             </button>
             <button 
               onClick={() => setIsFilterOpen(false)} 
               className="text-[11px] bg-indigo-600 text-white font-bold px-4 py-1.5 rounded-lg shadow-xs hover:bg-indigo-700 transition-colors ml-2 cursor-pointer"
             >
               Đóng
             </button>
           </div>
        </div>
      )}
    </div>
  );
}
