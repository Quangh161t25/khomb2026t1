import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { CONFIG } from '../config/config';
import { fetchSheetData } from '../services/googleSheetsApi';
import { exportToExcel } from '../services/excelExport';
import {
  getTodayYmd,
  toYMD,
  formatYmdToDmy,
  getCurrentWeekRangeYmd,
  getCurrentMonthRangeYmd,
  shiftDate,
} from '../utils/dateUtils';
import {
  Undo2,
  Package,
  RotateCw,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Building,
} from 'lucide-react';

export default function BCHangHoanPage() {
  const { showToast } = useToast();
  const todayStr = toYMD(new Date());

  const [hangHoanData, setHangHoanData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [maGianFilter, setMaGianFilter] = useState('');
  const [skuCtFilter, setSkuCtFilter] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchSheetData(`${CONFIG.hhbhSheetName}!A:Z`);
      if (rows && rows.length > 1) {
        const parsed = rows.slice(1).map((row, idx) => ({
          rowIndex: idx + 2,
          id: row[0] || '',
          ngay_nhan: toYMD(row[1] || '') || (row[1] || '').toString().trim(),
          mvd: row[2] || '',
          mvd_2: row[3] || '',
          ma_gian: (row[4] || '').toString().trim(),
          sku: (row[9] || '').toString().trim(),
          sku_ct: (row[10] || '').toString().trim(),
          slg: parseFloat(row[11]) || 1,
          ten_sp: row[12] || '',
          tinh_trang: (row[14] || '').toString().trim(),
          trang_thai: (row[15] || '').toString().trim(),
          kho: (row[20] || 'KHO').toString().trim(),
        }));
        setHangHoanData(parsed);
      } else {
        setHangHoanData([]);
      }
    } catch (err) {
      console.error('Error loading HH data for report:', err);
      showToast('Lỗi tải dữ liệu báo cáo: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Distinct Lists
  const maGianList = useMemo(() => {
    return [...new Set(hangHoanData.map((i) => i.ma_gian).filter(Boolean))].sort();
  }, [hangHoanData]);

  const skuCtList = useMemo(() => {
    return [...new Set(hangHoanData.map((i) => i.sku_ct).filter(Boolean))].sort();
  }, [hangHoanData]);

  // Quick Selectors
  const setQuickDate = (type) => {
    if (type === 'today') {
      const today = getTodayYmd();
      setFromDate(today);
      setToDate(today);
    } else if (type === 'thisWeek') {
      const { from, to } = getCurrentWeekRangeYmd();
      setFromDate(from);
      setToDate(to);
    } else if (type === 'thisMonth') {
      const { from, to } = getCurrentMonthRangeYmd();
      setFromDate(from);
      setToDate(to);
    }
  };

  // Reload handler resetting date to today
  const handleReload = () => {
    const today = getTodayYmd();
    setFromDate(today);
    setToDate(today);
    setMaGianFilter('');
    setSkuCtFilter('');
    loadData();
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return hangHoanData.filter((item) => {
      const itemYMD = toYMD(item.ngay_nhan);
      if (fromDate && itemYMD < fromDate) return false;
      if (toDate && itemYMD > toDate) return false;
      if (maGianFilter && !item.ma_gian.toLowerCase().includes(maGianFilter.toLowerCase())) return false;
      if (skuCtFilter && !item.sku_ct.toLowerCase().includes(skuCtFilter.toLowerCase())) return false;
      return true;
    });
  }, [hangHoanData, fromDate, toDate, maGianFilter, skuCtFilter]);

  // Aggregated Stats
  const totalOrders = filteredData.length;
  const totalQuantity = filteredData.reduce((sum, item) => sum + (item.slg || 0), 0);

  // Group by Store
  const byMaGian = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      const mg = item.ma_gian || 'Chưa có gian';
      if (!map[mg]) map[mg] = { don: 0, sp: 0 };
      map[mg].don += 1;
      map[mg].sp += item.slg || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].don - a[1].don);
  }, [filteredData]);

  // Group by Condition
  const byTinhTrang = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      const tt = item.tinh_trang || 'Chưa ghi nhận';
      if (!map[tt]) map[tt] = { don: 0, sp: 0 };
      map[tt].don += 1;
      map[tt].sp += item.slg || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].don - a[1].don);
  }, [filteredData]);

  // Group by SKU CT
  const bySkuCt = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      const sku = item.sku_ct || item.sku || 'Chưa có SKU';
      if (!map[sku]) map[sku] = { don: 0, sp: 0, ten: item.ten_sp };
      map[sku].don += 1;
      map[sku].sp += item.slg || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].don - a[1].don || b[1].sp - a[1].sp);
  }, [filteredData]);

  // Group by Kho
  const byKho = useMemo(() => {
    const map = {};
    filteredData.forEach((item) => {
      const k = item.kho || 'KHO';
      if (!map[k]) map[k] = { don: 0, sp: 0 };
      map[k].don += 1;
      map[k].sp += item.slg || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].don - a[1].don);
  }, [filteredData]);

  const handleExport = () => {
    if (!filteredData.length) {
      showToast('Không có dữ liệu để xuất!', 'warning');
      return;
    }
    const headers = ['Gian hàng', 'Số đơn hoàn', 'Số lượng SP'];
    const rows = byMaGian.map(([mg, val]) => [mg, val.don, val.sp]);
    exportToExcel(`Bao_Cao_Hang_Hoan_${Date.now()}`, 'BC_Hang_Hoan', headers, rows);
    showToast('Đã xuất Excel báo cáo hàng hoàn!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 lg:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Undo2 className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-base text-slate-800">Báo cáo Hàng hoàn & Trả hàng</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={handleReload}
              disabled={loading}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
              title="Tải lại dữ liệu (Mặc định hôm nay)"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          {/* Quick Date Presets */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold">
            <button
              onClick={() => setQuickDate('today')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                fromDate === getTodayYmd() && toDate === getTodayYmd()
                  ? 'bg-white text-primary shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setQuickDate('thisWeek')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                fromDate === getCurrentWeekRangeYmd().from && toDate === getCurrentWeekRangeYmd().to
                  ? 'bg-white text-primary shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tuần này
            </button>
            <button
              onClick={() => setQuickDate('thisMonth')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                fromDate === getCurrentMonthRangeYmd().from && toDate === getCurrentMonthRangeYmd().to
                  ? 'bg-white text-primary shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tháng này
            </button>
          </div>

          {/* Stepper Date Picker */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
            <button
              onClick={() => {
                setFromDate((p) => shiftDate(p, -1));
                setToDate((p) => shiftDate(p, -1));
              }}
              className="p-1 hover:bg-white rounded text-slate-600"
              title="Lùi 1 ngày"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none"
            />
            <span className="text-slate-400 font-bold">➔</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none"
            />
            <button
              onClick={() => {
                setFromDate((p) => shiftDate(p, 1));
                setToDate((p) => shiftDate(p, 1));
              }}
              className="p-1 hover:bg-white rounded text-slate-600"
              title="Tiến 1 ngày"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            type="text"
            list="bchhMaGianList"
            value={maGianFilter}
            onChange={(e) => setMaGianFilter(e.target.value)}
            placeholder="Lọc gian hàng..."
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
          />
          <datalist id="bchhMaGianList">
            {maGianList.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>

          <input
            type="text"
            list="bchhSkuList"
            value={skuCtFilter}
            onChange={(e) => setSkuCtFilter(e.target.value)}
            placeholder="Lọc SKU CT..."
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
          />
          <datalist id="bchhSkuList">
            {skuCtList.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Undo2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tổng số đơn hoàn/trả</div>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
              {totalOrders.toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tổng số lượng sản phẩm</div>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
              {totalQuantity.toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* By Store */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col h-[380px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase text-slate-700 flex justify-between items-center shrink-0">
            <span>Theo Gian hàng</span>
            <span className="text-slate-500 font-normal">{byMaGian.length} gian</span>
          </div>
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0 z-10 select-none shadow-2xs">
                <tr>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap">Mã gian</th>
                  <th className="px-3 py-2.5 w-28 text-right whitespace-nowrap">Số đơn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byMaGian.map(([mg, v]) => (
                  <tr key={mg} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 text-left font-bold text-slate-900 whitespace-nowrap">{mg}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums font-bold text-amber-700 whitespace-nowrap w-28">
                      {v.don.toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* By Condition */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col h-[380px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase text-slate-700 flex justify-between items-center shrink-0">
            <span>Theo Tình trạng hàng</span>
            <span className="text-slate-500 font-normal">{byTinhTrang.length} tình trạng</span>
          </div>
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0 z-10 select-none shadow-2xs">
                <tr>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap">Tình trạng</th>
                  <th className="px-3 py-2.5 w-28 text-right whitespace-nowrap">Số đơn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byTinhTrang.map(([tt, v]) => (
                  <tr key={tt} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 text-left font-semibold text-slate-800 whitespace-nowrap">{tt}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums font-bold text-rose-600 whitespace-nowrap w-28">
                      {v.don.toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* By SKU CT */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col h-[380px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase text-slate-700 flex justify-between items-center shrink-0">
            <span>Top SKU Hoàn / Trả</span>
            <span className="text-slate-500 font-normal">{bySkuCt.length} SKU</span>
          </div>
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0 z-10 select-none shadow-2xs">
                <tr>
                  <th className="px-3 py-2.5 w-32 text-left whitespace-nowrap">Mã SKU CT</th>
                  <th className="px-3 py-2.5 text-left min-w-[140px]">Tên sản phẩm</th>
                  <th className="px-3 py-2.5 w-24 text-right whitespace-nowrap">Số đơn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bySkuCt.map(([sku, v]) => (
                  <tr key={sku} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 text-left font-bold font-mono text-indigo-700 whitespace-nowrap w-32">{sku}</td>
                    <td className="px-3 py-2 text-left text-slate-600 truncate max-w-[200px]" title={v.ten || '-'}>
                      {v.ten || '-'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums font-bold text-amber-700 whitespace-nowrap w-24">
                      {v.don.toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* By Kho */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col h-[380px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase text-slate-700 flex justify-between items-center shrink-0">
            <span>Theo Kho</span>
            <span className="text-slate-500 font-normal">{byKho.length} kho</span>
          </div>
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0 z-10 select-none shadow-2xs">
                <tr>
                  <th className="px-3 py-2.5 text-left whitespace-nowrap">Kho</th>
                  <th className="px-3 py-2.5 w-28 text-right whitespace-nowrap">Số đơn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byKho.map(([k, v]) => (
                  <tr key={k} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 text-left font-bold text-slate-900 whitespace-nowrap">{k}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums font-bold text-slate-800 whitespace-nowrap w-28">
                      {v.don.toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
