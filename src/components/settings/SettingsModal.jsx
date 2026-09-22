import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useColumnWidths, MODULE_COLUMNS_CONFIG } from '../../context/ColumnWidthContext';
import {
  X,
  Sliders,
  User,
  RotateCcw,
  SlidersHorizontal,
  Search,
  Check,
  ShieldCheck,
  LogOut,
  Info,
  Maximize2,
  TableProperties,
  Settings,
  Eye,
  EyeOff,
  Edit3,
  Type,
  Sparkles,
} from 'lucide-react';

export default function SettingsModal() {
  const { user, logout } = useAuth();
  const {
    isSettingsOpen,
    closeSettings,
    settingsTab,
    setSettingsTab,
    columnWidths,
    columnVisibility,
    columnLabels,
    updateColumnWidth,
    resetModuleWidths,
    resetModuleAll,
    resetAllConfig,
    activeSettingsModule,
    setActiveSettingsModule,
    toggleColumnVisibility,
    showAllColumns,
    setColumnLabel,
    resetColumnLabel,
    resetColumnConfig,
    systemFontSize,
    setSystemFontSize,
    tableFontSize,
    setTableFontSize,
    resetFontSizes,
  } = useColumnWidths();

  const [searchColumn, setSearchColumn] = useState('');

  const currentModuleConfig =
    MODULE_COLUMNS_CONFIG[activeSettingsModule] || MODULE_COLUMNS_CONFIG.donhang;

  // Filter columns by search term
  const filteredColumns = useMemo(() => {
    if (!currentModuleConfig) return [];
    if (!searchColumn.trim()) return currentModuleConfig.columns;
    const term = searchColumn.trim().toLowerCase();
    return currentModuleConfig.columns.filter(
      (c) => c.label.toLowerCase().includes(term) || c.key.toLowerCase().includes(term)
    );
  }, [currentModuleConfig, searchColumn]);

  if (!isSettingsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSettings();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-slate-800">Cài đặt hệ thống</h2>
                <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                  Kho 2026
                </span>
              </div>
              <p className="text-xs text-slate-500">Tùy chỉnh kích thước cột, cỡ chữ giao diện & quản lý tài khoản</p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Đóng (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 px-5 bg-white shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setSettingsTab('columns')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              settingsTab === 'columns'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>Kích thước cột</span>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
              Đồng bộ 2 chiều
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsTab('appearance')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              settingsTab === 'appearance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Cỡ chữ & Hiển thị</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
              {tableFontSize}px
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsTab('account')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              settingsTab === 'account'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Tài khoản</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {/* TAB 1: KÍCH THƯỚC CỘT */}
          {settingsTab === 'columns' && (
            <div className="space-y-4">
              {/* Notice Bar */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Đồng bộ kích thước cột tức thì:</p>
                  <p className="text-blue-800 text-[11px]">
                    Khi bạn <strong>kéo chuột chỉnh cột trên bảng</strong>, thông số ở bảng bên dưới sẽ tự động nhảy số theo. Ngược lại, bạn cũng có thể nhập trực tiếp số pixel hoặc kéo thanh trượt tại đây để chỉnh độ rộng. Mọi thay đổi được lưu tự động trên máy tính của bạn.
                  </p>
                </div>
              </div>

              {/* Module Selector Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <label className="text-xs font-bold text-slate-700 shrink-0">Chọn Modul:</label>
                  <select
                    value={activeSettingsModule}
                    onChange={(e) => setActiveSettingsModule(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {Object.entries(MODULE_COLUMNS_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.label} ({cfg.columns.length} cột)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs shadow-2xs">
                    <Type className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-600 font-medium text-[11px]">Cỡ chữ:</span>
                    <button
                      type="button"
                      onClick={() => setTableFontSize(Math.max(10, tableFontSize - 1))}
                      className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                      title="Giảm cỡ chữ bảng"
                    >
                      -
                    </button>
                    <span className="font-bold text-blue-700 font-mono text-xs w-6 text-center">{tableFontSize}</span>
                    <button
                      type="button"
                      onClick={() => setTableFontSize(Math.min(20, tableFontSize + 1))}
                      className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                      title="Tăng cỡ chữ bảng"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => showAllColumns(activeSettingsModule)}
                    className="px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1"
                    title="Bật hiển thị tất cả các cột của modul này"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Hiện tất cả cột</span>
                  </button>

                  <div className="relative w-44 sm:w-52">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchColumn}
                      onChange={(e) => setSearchColumn(e.target.value)}
                      placeholder="Tìm tên cột..."
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Columns Table List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-[380px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0 z-10 select-none shadow-xs">
                      <tr>
                        <th className="px-2.5 py-2.5 w-10 text-center">STT</th>
                        <th className="px-2 py-2.5 w-16 text-center" title="Tích để hiển thị, bỏ tích để ẩn cột trên bảng">
                          Hiển thị
                        </th>
                        <th className="px-3 py-2.5 min-w-[130px]">Tên gốc</th>
                        <th className="px-3 py-2.5 min-w-[160px] bg-blue-50/60 text-blue-900 border-x border-blue-100">
                          <div className="flex items-center gap-1">
                            <span>Tên thay thế hiển thị</span>
                            <span className="text-[9px] bg-blue-200/80 text-blue-800 px-1 py-0.2 rounded font-bold">Mới</span>
                          </div>
                        </th>
                        <th className="px-2.5 py-2.5 w-24">Mã cột</th>
                        <th className="px-2 py-2.5 w-16 text-center">Căn lề</th>
                        <th className="px-3 py-2.5 w-36">Thanh trượt độ rộng</th>
                        <th className="px-2 py-2.5 w-20 text-right">Độ rộng</th>
                        <th className="px-2 py-2.5 w-14 text-center">Khôi phục</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredColumns.map((col, idx) => {
                        const currentWidth =
                          columnWidths[activeSettingsModule]?.[col.key] ?? col.defaultWidth;
                        const isCustomizedWidth = currentWidth !== col.defaultWidth;
                        const isVisible = columnVisibility[activeSettingsModule]?.[col.key] !== false;
                        const customLabel = columnLabels[activeSettingsModule]?.[col.key] || '';
                        const hasCustomLabel = Boolean(customLabel && customLabel.trim());
                        const isModified = isCustomizedWidth || !isVisible || hasCustomLabel;

                        return (
                          <tr
                            key={col.key}
                            className={`hover:bg-slate-50 transition-colors ${
                              !isVisible
                                ? 'bg-slate-50/60 opacity-60'
                                : isModified
                                ? 'bg-blue-50/20'
                                : ''
                            }`}
                          >
                            {/* 1. STT */}
                            <td className="px-2.5 py-2 text-center text-slate-400 font-medium">{idx + 1}</td>

                            {/* 2. Checkbox Hiển thị */}
                            <td className="px-2 py-2 text-center">
                              <div className="flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={isVisible}
                                  onChange={() => toggleColumnVisibility(activeSettingsModule, col.key)}
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer accent-blue-600"
                                  title={isVisible ? 'Đang hiển thị - Bấm để ẩn cột này' : 'Đang ẩn - Bấm để hiện cột này'}
                                />
                              </div>
                            </td>

                            {/* 3. Tên gốc */}
                            <td className="px-3 py-2 font-bold text-slate-800">
                              <div className="flex items-center gap-1.5">
                                <span className={!isVisible ? 'line-through text-slate-400' : ''}>
                                  {col.label}
                                </span>
                                {!isVisible && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200 font-bold">
                                    Đã ẩn
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 4. Tên thay thế hiển thị */}
                            <td className="px-2.5 py-1.5 bg-blue-50/20 border-x border-blue-50">
                              <div className="relative flex items-center">
                                <input
                                  type="text"
                                  placeholder={col.label}
                                  value={customLabel}
                                  onChange={(e) => setColumnLabel(activeSettingsModule, col.key, e.target.value)}
                                  className={`w-full pl-2.5 pr-6 py-1 text-xs rounded-lg border outline-none transition-all ${
                                    hasCustomLabel
                                      ? 'border-blue-400 bg-white font-bold text-blue-800 focus:ring-2 focus:ring-blue-500/20 shadow-xs'
                                      : 'border-slate-200 bg-white/80 text-slate-700 hover:border-slate-300 focus:border-blue-400 focus:bg-white'
                                  }`}
                                  title="Nhập tên hiển thị thay thế trên bảng (để trống để dùng tên gốc)"
                                />
                                {hasCustomLabel && (
                                  <button
                                    type="button"
                                    onClick={() => resetColumnLabel(activeSettingsModule, col.key)}
                                    className="absolute right-1.5 text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                                    title="Xóa tên thay thế, dùng lại tên gốc"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* 5. Mã cột */}
                            <td className="px-2.5 py-2 font-mono text-slate-500 text-[11px]">{col.key}</td>

                            {/* 6. Căn lề */}
                            <td className="px-2 py-2 text-center">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  col.align === 'center'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : col.align === 'right'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {col.align === 'center' ? 'Giữa' : col.align === 'right' ? 'Phải' : 'Trái'}
                              </span>
                            </td>

                            {/* 7. Slider control */}
                            <td className="px-3 py-2">
                              <input
                                type="range"
                                min={col.minWidth || 40}
                                max={450}
                                step={5}
                                value={currentWidth}
                                disabled={!isVisible}
                                onChange={(e) =>
                                  updateColumnWidth(
                                    activeSettingsModule,
                                    col.key,
                                    parseInt(e.target.value, 10)
                                  )
                                }
                                className={`w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg ${
                                  !isVisible ? 'opacity-30 cursor-not-allowed' : ''
                                }`}
                              />
                            </td>

                            {/* 8. Number input */}
                            <td className="px-2 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <input
                                  type="number"
                                  min={col.minWidth || 40}
                                  max={800}
                                  step={5}
                                  value={currentWidth}
                                  disabled={!isVisible}
                                  onChange={(e) =>
                                    updateColumnWidth(
                                      activeSettingsModule,
                                      col.key,
                                      parseInt(e.target.value, 10) || col.minWidth || 40
                                    )
                                  }
                                  className={`w-14 px-1 py-0.5 border border-slate-200 rounded text-right font-mono font-bold text-slate-900 outline-none focus:ring-1 focus:ring-blue-500 ${
                                    !isVisible ? 'opacity-30 bg-slate-100 cursor-not-allowed' : ''
                                  }`}
                                />
                                <span className="text-[10px] text-slate-400 font-medium">px</span>
                              </div>
                            </td>

                            {/* 9. Reset single column button */}
                            <td className="px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  resetColumnConfig(activeSettingsModule, col.key, col.defaultWidth)
                                }
                                disabled={!isModified}
                                className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-20 transition-colors"
                                title={`Khôi phục cột này (Độ rộng: ${col.defaultWidth}px, hiện lại, dùng tên gốc)`}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Actions for Columns Tab */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>
                    Tổng: <strong>{currentModuleConfig.columns.length}</strong> cột trong{' '}
                    <strong className="text-slate-800">{currentModuleConfig.label}</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-blue-700 font-bold">
                    Đang hiện:{' '}
                    {
                      currentModuleConfig.columns.filter(
                        (c) => columnVisibility[activeSettingsModule]?.[c.key] !== false
                      ).length
                    }
                    /{currentModuleConfig.columns.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => resetModuleAll(activeSettingsModule)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                    title="Khôi phục độ rộng, hiển thị tất cả và xóa tên thay thế của modul này"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đặt lại mặc định modul này</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetAllConfig}
                    className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
                    title="Khôi phục toàn bộ cấu hình tất cả các modul"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Khôi phục tất cả modul</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CỠ CHỮ & HIỂN THỊ */}
          {settingsTab === 'appearance' && (
            <div className="space-y-5">
              {/* Intro Notice */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                  <Type className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-900">
                    Cài đặt cỡ chữ & Tùy chỉnh hiển thị
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tùy chỉnh cỡ chữ giúp giao diện hiển thị phù hợp với màn hình của bạn. 
                    Tăng cỡ chữ để đọc số liệu rõ nét hơn hoặc giảm cỡ chữ để xem được nhiều dòng dữ liệu hơn cùng lúc. Mọi thay đổi được lưu tự động trên máy tính.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Cỡ chữ toàn hệ thống */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                        <label className="font-bold text-xs text-slate-800">Cỡ chữ giao diện chung</label>
                      </div>
                      <span className="font-bold font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                        {systemFontSize}px ({Math.round((systemFontSize / 16) * 100)}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Áp dụng cho thanh menu, nút bấm, thẻ thống kê, bộ lọc và biểu đồ.
                    </p>
                  </div>

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { label: 'Rất nhỏ', size: 13 },
                      { label: 'Nhỏ', size: 14 },
                      { label: 'Chuẩn', size: 16 },
                      { label: 'Lớn', size: 18 },
                      { label: 'Rất lớn', size: 20 },
                    ].map((p) => (
                      <button
                        key={p.size}
                        type="button"
                        onClick={() => setSystemFontSize(p.size)}
                        className={`py-1.5 px-1 rounded-xl text-center font-bold text-[11px] transition-all border cursor-pointer ${
                          systemFontSize === p.size
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-500/30'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <div>{p.label}</div>
                        <div className="text-[9px] opacity-80">{p.size}px</div>
                      </button>
                    ))}
                  </div>

                  {/* Slider with - / + buttons */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setSystemFontSize(Math.max(12, systemFontSize - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0 cursor-pointer shadow-2xs"
                      title="Giảm 1px"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min={12}
                      max={22}
                      step={1}
                      value={systemFontSize}
                      onChange={(e) => setSystemFontSize(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setSystemFontSize(Math.min(22, systemFontSize + 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0 cursor-pointer shadow-2xs"
                      title="Tăng 1px"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 2. Cỡ chữ trong bảng dữ liệu */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TableProperties className="w-4 h-4 text-emerald-600" />
                        <label className="font-bold text-xs text-slate-800">Cỡ chữ bảng dữ liệu</label>
                      </div>
                      <span className="font-bold font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        {tableFontSize}px
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Áp dụng cho dòng dữ liệu trong tất cả các bảng (Đơn hàng, Tồn kho, Báo cáo...).
                    </p>
                  </div>

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-6 gap-1.5">
                    {[
                      { label: 'Siêu gọn', size: 11 },
                      { label: 'Nhỏ', size: 12 },
                      { label: 'Chuẩn', size: 13 },
                      { label: 'Rõ nét', size: 14 },
                      { label: 'Lớn', size: 15 },
                      { label: 'Rất lớn', size: 16 },
                    ].map((p) => (
                      <button
                        key={p.size}
                        type="button"
                        onClick={() => setTableFontSize(p.size)}
                        className={`py-1.5 px-1 rounded-xl text-center font-bold text-[11px] transition-all border cursor-pointer ${
                          tableFontSize === p.size
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/30'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <div className="truncate">{p.label}</div>
                        <div className="text-[9px] opacity-80">{p.size}px</div>
                      </button>
                    ))}
                  </div>

                  {/* Slider with - / + buttons */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setTableFontSize(Math.max(10, tableFontSize - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0 cursor-pointer shadow-2xs"
                      title="Giảm 1px"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min={10}
                      max={18}
                      step={1}
                      value={tableFontSize}
                      onChange={(e) => setTableFontSize(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setTableFontSize(Math.min(18, tableFontSize + 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0 cursor-pointer shadow-2xs"
                      title="Tăng 1px"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Preview Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Xem trước trực quan (Live Preview)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={resetFontSizes}
                    className="px-3 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Khôi phục cỡ chữ về mặc định (Giao diện 16px, Bảng 13px)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đặt lại cỡ chữ mặc định</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-slate-700 font-medium text-xs">
                    Dòng văn bản mẫu giao diện: <strong>Hệ thống Quản lý Kho Vận 2026</strong> • Phiên bản nâng cấp
                  </div>

                  {/* Mini Preview Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                        <tr>
                          <th className="px-3 py-2">Mã Đơn</th>
                          <th className="px-3 py-2">Sản phẩm</th>
                          <th className="px-3 py-2 text-center">Mã SKU</th>
                          <th className="px-3 py-2 text-right">SL</th>
                          <th className="px-3 py-2 text-right">Đơn giá</th>
                          <th className="px-3 py-2 text-center">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono text-slate-700">DH100294</td>
                          <td className="px-3 py-2 font-medium text-slate-900">Nồi Chiên Không Dầu Lock&Lock 5.2L</td>
                          <td className="px-3 py-2 text-center font-bold text-indigo-700 font-mono">201A</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">2</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-blue-700">1.450.000 đ</td>
                          <td className="px-3 py-2 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                              Thành công
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono text-slate-700">DH100295</td>
                          <td className="px-3 py-2 font-medium text-slate-900">Chảo chống dính Sunhouse 26cm</td>
                          <td className="px-3 py-2 text-center font-bold text-indigo-700 font-mono">304B</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">1</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-blue-700">280.000 đ</td>
                          <td className="px-3 py-2 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                              Chờ xử lý
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THÔNG TIN TÀI KHOẢN */}
          {settingsTab === 'account' && (
            <div className="space-y-4 max-w-md mx-auto py-4">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{user?.name || 'Tài khoản người dùng'}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Tên đăng nhập: {user?.id}</p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Vai trò: {(user?.role || 'User').toUpperCase()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    closeSettings();
                    logout();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            Hệ thống Quản lý Kho 2026 • Cài đặt kích thước cột & Cỡ chữ
          </span>
          <button
            type="button"
            onClick={closeSettings}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
