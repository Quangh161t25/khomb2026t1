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
  Boxes,
  RotateCw,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Store,
  Package,
} from 'lucide-react';

export default function BaoCaoTongPage() {
  const { showToast } = useToast();
  const todayStr = toYMD(new Date());

  const [udctData, setUdctData] = useState([]);
  const [hangHoanData, setHangHoanData] = useState([]);
  const [dhctData, setDhctData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [idSpSearch, setIdSpSearch] = useState('');

  // Sorting
  const [magianSort, setMagianSort] = useState({ key: 'doanh_thu', asc: false });
  const [idspSort, setIdspSort] = useState({ key: 'doanh_thu', asc: false });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [udctRows, hhRows, dhctRows, invRows] = await Promise.all([
        fetchSheetData(`${CONFIG.udctSheetName}!A:AE`),
        fetchSheetData(`${CONFIG.hhbhSheetName}!A:Z`),
        fetchSheetData(`${CONFIG.dhctSheetName}!A:O`),
        fetchSheetData(`${CONFIG.inventorySheetName}!A:F`),
      ]);

      if (udctRows && udctRows.length > 1) {
        setUdctData(
          udctRows.slice(1).map((row) => ({
            ngay: toYMD(row[4] || '') || (row[4] || '').toString().trim(),
            san: (row[8] || '').toString().trim(),
            khung_h: (row[9] || '').toString().trim(),
            ma_gian: (row[10] || '').toString().trim(),
            mvd: (row[11] || '').toString().trim(),
            mdh: (row[12] || '').toString().trim(),
            sku_shop_up: (row[13] || '').toString().trim(),
            so_luong: parseFloat(row[14]) || 0,
            id_sp: (row[15] || '').toString().trim(),
            id_sp_ct: (row[16] || '').toString().trim() || (row[15] || '').toString().trim(),
            ten_sp: (row[17] || '').toString().trim(),
            slg_xuat: parseFloat(row[18]) || 0,
            trang_thai: (row[24] || '').toString().trim(),
            don_gia: parseFloat(row[30]) || 0,
          }))
        );
      }

      if (hhRows && hhRows.length > 1) {
        setHangHoanData(
          hhRows.slice(1).map((row) => ({
            ngay_nhan: toYMD(row[0] || '') || (row[0] || '').toString().trim(),
            mvd: (row[2] || '').toString().trim(),
            ma_gian: (row[3] || '').toString().trim(),
            sku_ct: (row[8] || '').toString().trim(),
            slg: parseFloat(row[9]) || 1,
          }))
        );
      }

      if (dhctRows && dhctRows.length > 1) {
        setDhctData(
          dhctRows.slice(1).map((row) => ({
            ngay: toYMD(row[2] || '') || (row[2] || '').toString().trim(),
            truong: (row[3] || '').toString().trim().toUpperCase(),
            id_sp_ct: (row[6] || '').toString().trim().toUpperCase(),
            so_luong: parseFloat(row[9]) || 0,
            xac_nhan: (row[14] || '').toString().trim().toUpperCase(),
          }))
        );
      }

      if (invRows && invRows.length > 1) {
        setInventoryData(
          invRows.slice(1).map((row) => ({
            id_sp_ct: (row[2] || '').toString().trim().toUpperCase(),
            ton_dau: parseFloat(row[5]) || 0,
          }))
        );
      }
    } catch (err) {
      console.error('Error loading BaoCaoTong data:', err);
      showToast('Lỗi tải dữ liệu báo cáo tổng: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Quick Date Selectors
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
    setIdSpSearch('');
    loadData();
  };

  // Filtered dataset in date range
  const filteredUdct = useMemo(() => {
    return udctData.filter((item) => {
      const itemYMD = toYMD(item.ngay);
      if (fromDate && itemYMD < fromDate) return false;
      if (toDate && itemYMD > toDate) return false;
      return true;
    });
  }, [udctData, fromDate, toDate]);

  // Unique statuses in filtered data
  const statusesList = useMemo(() => {
    const set = new Set();
    filteredUdct.forEach((i) => {
      let st = (i.trang_thai || '').trim();
      if (st === '1 HỦY') st = '2 HỦY';
      if (st) set.add(st);
    });
    return Array.from(set).sort();
  }, [filteredUdct]);

  // Return counts by Ma Gian and SKU CT
  const { hhByMaGian, hhBySkuCt } = useMemo(() => {
    const byMg = {};
    const bySku = {};
    hangHoanData.forEach((hh) => {
      const itemYMD = toYMD(hh.ngay_nhan);
      if (fromDate && itemYMD < fromDate) return;
      if (toDate && itemYMD > toDate) return;

      const mg = hh.ma_gian;
      if (mg) byMg[mg] = (byMg[mg] || 0) + 1;

      const sku = hh.sku_ct;
      if (sku) bySku[sku] = (bySku[sku] || 0) + 1;
    });
    return { hhByMaGian: byMg, hhBySkuCt: bySku };
  }, [hangHoanData, fromDate, toDate]);

  // Dynamic stock map
  const tonKhoMap = useMemo(() => {
    const map = {};
    // Base initial stock from inventory
    inventoryData.forEach((inv) => {
      if (inv.id_sp_ct) {
        map[inv.id_sp_ct] = (map[inv.id_sp_ct] || 0) + inv.ton_dau;
      }
    });

    // Add confirmed imports / exports before fromDate
    dhctData.forEach((item) => {
      if (item.xac_nhan !== 'ĐÃ XÁC NHẬN') return;
      const itemYMD = toYMD(item.ngay);
      if (itemYMD && itemYMD >= fromDate) return;

      const id = item.id_sp_ct;
      if (!id) return;
      if (map[id] === undefined) map[id] = 0;

      if (item.truong === 'NHẬP') {
        map[id] += item.so_luong;
      } else if (item.truong === 'XUẤT') {
        map[id] -= item.so_luong;
      }
    });

    return map;
  }, [inventoryData, dhctData, fromDate]);

  // Aggregate Stats by Ma Gian
  const magianRows = useMemo(() => {
    const map = {};
    filteredUdct.forEach((item) => {
      const mg = item.ma_gian || 'Chưa rõ';
      const rev = (item.don_gia || 0) * (item.slg_xuat || 0);
      let st = (item.trang_thai || '').trim();
      if (st === '1 HỦY') st = '2 HỦY';

      if (!map[mg]) {
        map[mg] = {
          mg,
          so_don: 0,
          doanh_thu: 0,
          trang_thai: {},
        };
      }
      map[mg].so_don += 1;
      map[mg].doanh_thu += rev;
      if (st) {
        map[mg].trang_thai[st] = (map[mg].trang_thai[st] || 0) + 1;
      }
    });

    const rows = Object.values(map).map((s) => ({
      ...s,
      so_hoan: hhByMaGian[s.mg] || 0,
    }));

    rows.sort((a, b) => {
      let valA, valB;
      if (magianSort.key === 'ma_gian') {
        valA = a.mg.toLowerCase();
        valB = b.mg.toLowerCase();
      } else if (magianSort.key === 'so_don' || magianSort.key === 'doanh_thu' || magianSort.key === 'so_hoan') {
        valA = a[magianSort.key] || 0;
        valB = b[magianSort.key] || 0;
      } else {
        valA = a.trang_thai[magianSort.key] || 0;
        valB = b.trang_thai[magianSort.key] || 0;
      }
      if (valA < valB) return magianSort.asc ? -1 : 1;
      if (valA > valB) return magianSort.asc ? 1 : -1;
      return 0;
    });

    return rows;
  }, [filteredUdct, hhByMaGian, magianSort]);

  // Aggregate Stats by ID SP CT
  const idspRows = useMemo(() => {
    const map = {};
    filteredUdct.forEach((item) => {
      const idsp = item.id_sp_ct || 'N/A';
      const rev = (item.don_gia || 0) * (item.slg_xuat || 0);
      let st = (item.trang_thai || '').trim();
      if (st === '1 HỦY') st = '2 HỦY';

      if (!map[idsp]) {
        map[idsp] = {
          idsp,
          ten_sp: item.ten_sp || '',
          slg_xuat: 0,
          doanh_thu: 0,
          trang_thai: {},
        };
      }
      map[idsp].slg_xuat += item.slg_xuat || 0;
      map[idsp].doanh_thu += rev;
      if (st) {
        map[idsp].trang_thai[st] = (map[idsp].trang_thai[st] || 0) + 1;
      }
    });

    let rows = Object.values(map).map((s) => ({
      ...s,
      so_hoan: hhBySkuCt[s.idsp] || 0,
      ton_kho: tonKhoMap[s.idsp.toUpperCase()] || 0,
    }));

    if (idSpSearch.trim()) {
      const q = idSpSearch.trim().toLowerCase();
      rows = rows.filter(
        (r) => r.idsp.toLowerCase().includes(q) || r.ten_sp.toLowerCase().includes(q)
      );
    }

    rows.sort((a, b) => {
      let valA, valB;
      if (idspSort.key === 'id_sp_ct') {
        valA = a.idsp.toLowerCase();
        valB = b.idsp.toLowerCase();
      } else if (idspSort.key === 'ten_sp') {
        valA = a.ten_sp.toLowerCase();
        valB = b.ten_sp.toLowerCase();
      } else if (
        idspSort.key === 'slg_xuat' ||
        idspSort.key === 'doanh_thu' ||
        idspSort.key === 'so_hoan' ||
        idspSort.key === 'ton_kho'
      ) {
        valA = a[idspSort.key] || 0;
        valB = b[idspSort.key] || 0;
      } else {
        valA = a.trang_thai[idspSort.key] || 0;
        valB = b.trang_thai[idspSort.key] || 0;
      }
      if (valA < valB) return idspSort.asc ? -1 : 1;
      if (valA > valB) return idspSort.asc ? 1 : -1;
      return 0;
    });

    return rows;
  }, [filteredUdct, hhBySkuCt, tonKhoMap, idSpSearch, idspSort]);

  // Handle Sort
  const handleSortMagian = (key) => {
    setMagianSort((prev) => ({
      key,
      asc: prev.key === key ? !prev.asc : false,
    }));
  };

  const handleSortIdsp = (key) => {
    setIdspSort((prev) => ({
      key,
      asc: prev.key === key ? !prev.asc : false,
    }));
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (magianRows.length === 0 && idspRows.length === 0) {
      showToast('Không có dữ liệu để xuất Excel!', 'warning');
      return;
    }

    // Sheet 1: Ma Gian
    const mgHeaders = [
      'Mã gian',
      'Số đơn đi',
      'Doanh thu (đ)',
      ...statusesList,
      'Số đơn hoàn',
    ];
    const mgData = magianRows.map((r) => [
      r.mg,
      r.so_don,
      r.doanh_thu,
      ...statusesList.map((st) => r.trang_thai[st] || 0),
      r.so_hoan,
    ]);

    // Sheet 2: ID SP CT
    const idspHeaders = [
      'Mã SKU CT',
      'Tên sản phẩm',
      'SL xuất',
      'Doanh thu (đ)',
      ...statusesList,
      'Số đơn hoàn',
      'Tồn kho',
    ];
    const idspData = idspRows.map((r) => [
      r.idsp,
      r.ten_sp,
      r.slg_xuat,
      r.doanh_thu,
      ...statusesList.map((st) => r.trang_thai[st] || 0),
      r.so_hoan,
      r.ton_kho,
    ]);

    exportToExcel(`BaoCaoTong_${fromDate}_${toDate}`, 'Theo_Ma_Gian', mgHeaders, mgData);
    showToast('Đã xuất Excel báo cáo tổng thành công!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 lg:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-bold text-base text-slate-800">Báo cáo tổng đối soát</h2>
              <p className="text-xs text-slate-400">Thống kê đơn hàng, doanh thu, đơn hoàn và tồn kho đa chiều</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
            <button
              onClick={handleReload}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Tải lại dữ liệu (Mặc định hôm nay)"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Date Filters + Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
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

          {/* Stepper Date Range */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => {
                setFromDate((p) => shiftDate(p, -1));
                setToDate((p) => shiftDate(p, -1));
              }}
              className="p-1 hover:bg-white rounded text-slate-600"
              title="Lùi 1 ngày"
            >
              <ChevronLeft className="w-4 h-4" />
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
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Table 1: Thống kê theo Mã gian */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col max-h-[650px] overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-800">Thống kê theo Mã gian</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              <strong>{magianRows.length}</strong> gian hàng
            </span>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 select-none shadow-2xs">
                <tr>
                  <th
                    onClick={() => handleSortMagian('ma_gian')}
                    className="px-3 py-2.5 w-28 cursor-pointer hover:bg-slate-200 transition-colors sticky left-0 bg-slate-100 z-20 whitespace-nowrap text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Mã gian</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortMagian('so_don')}
                    className="px-3 py-2.5 w-24 text-right cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Số đơn đi</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortMagian('doanh_thu')}
                    className="px-3 py-2.5 w-32 text-right cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Doanh thu</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  {statusesList.map((st) => (
                    <th
                      key={st}
                      onClick={() => handleSortMagian(st)}
                      className="px-3 py-2.5 w-24 text-right text-slate-500 cursor-pointer hover:bg-slate-200 whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>{st}</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  ))}
                  <th
                    onClick={() => handleSortMagian('so_hoan')}
                    className="px-3 py-2.5 w-28 text-right text-rose-600 cursor-pointer hover:bg-slate-200 whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Số đơn hoàn</span>
                      <ArrowUpDown className="w-3 h-3 text-rose-400" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {magianRows.length === 0 ? (
                  <tr>
                    <td colSpan={4 + statusesList.length} className="text-center py-10 text-slate-400">
                      Không có dữ liệu trong khoảng thời gian này
                    </td>
                  </tr>
                ) : (
                  magianRows.map((row) => (
                    <tr key={row.mg} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 text-center font-bold text-slate-900 sticky left-0 bg-white z-10 whitespace-nowrap w-28">
                        {row.mg}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums font-bold text-slate-800 whitespace-nowrap w-24">
                        {row.so_don.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums font-bold text-blue-600 whitespace-nowrap w-32">
                        {row.doanh_thu.toLocaleString('vi-VN')}
                      </td>
                      {statusesList.map((st) => (
                        <td key={st} className="px-3 py-2 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap w-24">
                          {row.trang_thai[st] ? row.trang_thai[st].toLocaleString('vi-VN') : '-'}
                        </td>
                      ))}
                      <td
                        className={`px-3 py-2 text-right font-mono tabular-nums font-bold whitespace-nowrap w-28 ${
                          row.so_hoan > 0 ? 'text-rose-600' : 'text-slate-400'
                        }`}
                      >
                        {row.so_hoan > 0 ? row.so_hoan.toLocaleString('vi-VN') : '0'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Thống kê theo ID SP CT */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col max-h-[650px] overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-800">Thống kê theo id_sp_ct</h3>
            </div>

            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={idSpSearch}
                onChange={(e) => setIdSpSearch(e.target.value)}
                placeholder="Tìm mã SKU, tên..."
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 select-none shadow-2xs">
                <tr>
                  <th
                    onClick={() => handleSortIdsp('id_sp_ct')}
                    className="px-3 py-2.5 w-32 cursor-pointer hover:bg-slate-200 transition-colors sticky left-0 bg-slate-100 z-20 whitespace-nowrap text-left"
                  >
                    <div className="flex items-center gap-1">
                      <span>id_sp_ct</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortIdsp('ten_sp')}
                    className="px-3 py-2.5 min-w-[160px] cursor-pointer hover:bg-slate-200 transition-colors text-left"
                  >
                    <div className="flex items-center gap-1">
                      <span>Tên SP</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortIdsp('slg_xuat')}
                    className="px-3 py-2.5 w-24 text-right cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>SL xuất</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortIdsp('doanh_thu')}
                    className="px-3 py-2.5 w-32 text-right cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Doanh thu</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  {statusesList.map((st) => (
                    <th
                      key={st}
                      onClick={() => handleSortIdsp(st)}
                      className="px-3 py-2.5 w-24 text-right text-slate-500 cursor-pointer hover:bg-slate-200 whitespace-nowrap"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>{st}</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  ))}
                  <th
                    onClick={() => handleSortIdsp('so_hoan')}
                    className="px-3 py-2.5 w-28 text-right text-rose-600 cursor-pointer hover:bg-slate-200 whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Số đơn hoàn</span>
                      <ArrowUpDown className="w-3 h-3 text-rose-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortIdsp('ton_kho')}
                    className="px-3 py-2.5 w-24 text-right text-indigo-600 cursor-pointer hover:bg-slate-200 whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Tồn kho</span>
                      <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {idspRows.length === 0 ? (
                  <tr>
                    <td colSpan={6 + statusesList.length} className="text-center py-10 text-slate-400">
                      Không có sản phẩm phù hợp
                    </td>
                  </tr>
                ) : (
                  idspRows.map((row) => (
                    <tr key={row.idsp} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 font-bold font-mono text-indigo-700 sticky left-0 bg-white z-10 whitespace-nowrap w-32">
                        {row.idsp}
                      </td>
                      <td className="px-3 py-2 text-left text-slate-700 truncate min-w-[160px] max-w-[200px]" title={row.ten_sp}>
                        {row.ten_sp || '-'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums font-bold text-emerald-700 whitespace-nowrap w-24">
                        {row.slg_xuat.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums font-bold text-blue-600 whitespace-nowrap w-32">
                        {row.doanh_thu.toLocaleString('vi-VN')}
                      </td>
                      {statusesList.map((st) => (
                        <td key={st} className="px-3 py-2 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap w-24">
                          {row.trang_thai[st] ? row.trang_thai[st].toLocaleString('vi-VN') : '-'}
                        </td>
                      ))}
                      <td
                        className={`px-3 py-2 text-right font-mono tabular-nums font-bold whitespace-nowrap w-28 ${
                          row.so_hoan > 0 ? 'text-rose-600' : 'text-slate-400'
                        }`}
                      >
                        {row.so_hoan > 0 ? row.so_hoan.toLocaleString('vi-VN') : '0'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums font-bold text-indigo-600 whitespace-nowrap w-24">
                        {(row.ton_kho || 0).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
