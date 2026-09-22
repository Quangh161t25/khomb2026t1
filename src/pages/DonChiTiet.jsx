import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { useColumnWidths } from '../context/ColumnWidthContext';
import ResizableTh from '../components/common/ResizableTh';
import FooterPortal from '../components/common/FooterPortal';
import Pagination from '../components/common/Pagination';
import { CONFIG } from '../config/config';
import {
  fetchSheetData,
  updateSheetCell,
  appendSheetData,
} from '../services/googleSheetsApi';
import { exportToExcel } from '../services/excelExport';
import {
  toYMD,
  formatYmdToDmy,
  shiftDate,
  getTodayYmd,
  getCurrentWeekRangeYmd,
  getCurrentMonthRangeYmd,
} from '../utils/dateUtils';
import * as XLSX from 'xlsx';
import {
  Search,
  RotateCw,
  Plus,
  Download,
  Upload,
  FileSpreadsheet,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CheckCircle,
  Clock,
} from 'lucide-react';
import DhctOrderModal from '../components/donchitiet/DhctOrderModal';

export default function DonChiTietPage() {
  const { showToast } = useToast();
  const { getColumnWidth, isColumnVisible } = useColumnWidths();

  const colStyle = useCallback(
    (key, defaultW) => {
      if (!isColumnVisible('dhct', key)) return { display: 'none' };
      const w = getColumnWidth('dhct', key, defaultW);
      return { width: `${w}px`, minWidth: `${w}px`, maxWidth: `${w}px` };
    },
    [getColumnWidth, isColumnVisible]
  );

  const [dhctData, setDhctData] = useState([]);
  const [sanphamData, setSanphamData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters - Default to today
  const [fromDate, setFromDate] = useState(getTodayYmd());
  const [toDate, setToDate] = useState(getTodayYmd());
  const [nccFilter, setNccFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderDh, setSelectedOrderDh] = useState(null);

  // Quick Date Setters
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
    setCurrentPage(1);
  };

  // Reload handler that resets date to today
  const handleReload = () => {
    const today = getTodayYmd();
    setFromDate(today);
    setToDate(today);
    setNccFilter('');
    setSearchTerm('');
    setCurrentPage(1);
    loadData();
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dhRows, spRows] = await Promise.all([
        fetchSheetData(`${CONFIG.dhctSheetName}!A:P`),
        fetchSheetData(`${CONFIG.sanphamSheetName}!A:G`),
      ]);

      if (spRows && spRows.length > 1) {
        const parsedSp = spRows.slice(1).map((row) => ({
          sku_con: (row[0] || '').toString().trim(),
          id_sp: (row[1] || '').toString().trim(),
          ten_sp: (row[2] || '').toString().trim(),
          gia_nhap: parseFloat(row[3]) || 0,
          ton_dau: parseFloat(row[5]) || 0,
        }));
        setSanphamData(parsedSp);
      }

      if (dhRows && dhRows.length > 1) {
        const parsedDh = dhRows.slice(1).map((row, idx) => ({
          rowIndex: idx + 2,
          id_dh_ct: (row[0] || '').toString().trim(),
          id_dh: (row[1] || '').toString().trim(),
          ngay: (row[2] || '').toString().trim(),
          truong: (row[3] || '').toString().trim(),
          ncc: (row[4] || '').toString().trim(),
          kho: (row[5] || 'KHO').toString().trim(),
          id_sp_ct: (row[6] || '').toString().trim(),
          id_sp: (row[7] || '').toString().trim(),
          ten: (row[8] || '').toString().trim(),
          so_luong: parseFloat(row[9]) || 0,
          gia_nhap: parseFloat(row[10]) || 0,
          thanh_tien_nhap: parseFloat(row[11]) || 0,
          so_luong_2: row[12] || '',
          id_ton_kho: (row[13] || '').toString().trim(),
          xac_nhan: (row[14] || 'CHỜ XÁC NHẬN').toString().trim(),
        }));
        setDhctData(parsedDh);
      } else {
        setDhctData([]);
      }
    } catch (err) {
      console.error('Error loading DH_CT:', err);
      showToast('Lỗi khi tải DH_CT: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute Cumulative Stocks globally
  const dataWithStock = useMemo(() => {
    const cumulativeMapAll = {};
    const cumulativeMapConfirmed = {};

    sanphamData.forEach((sp) => {
      if (sp.sku_con) {
        const tonDau = parseFloat(sp.ton_dau) || 0;
        const key = sp.sku_con.toLowerCase();
        cumulativeMapAll[key] = tonDau;
        cumulativeMapConfirmed[key] = tonDau;
      }
    });

    const sortedAsc = [...dhctData].sort((a, b) => {
      const da = toYMD(a.ngay);
      const db = toYMD(b.ngay);
      if (da !== db) return da.localeCompare(db);
      return a.id_dh_ct.localeCompare(b.id_dh_ct);
    });

    sortedAsc.forEach((item) => {
      const id = (item.id_sp_ct || '').toLowerCase();
      if (id) {
        if (cumulativeMapAll[id] === undefined) cumulativeMapAll[id] = 0;
        if (cumulativeMapConfirmed[id] === undefined) cumulativeMapConfirmed[id] = 0;

        const sl = parseFloat(item.so_luong) || 0;
        const isConfirmed = item.xac_nhan === 'ĐÃ XÁC NHẬN';

        if (item.truong === 'NHẬP') {
          cumulativeMapAll[id] += sl;
          if (isConfirmed) cumulativeMapConfirmed[id] += sl;
        } else if (item.truong === 'XUẤT') {
          cumulativeMapAll[id] -= sl;
          if (isConfirmed) cumulativeMapConfirmed[id] -= sl;
        }

        item._tonLuyKeAll = cumulativeMapAll[id];
        item._tonLuyKeConfirmed = cumulativeMapConfirmed[id];
      }
    });

    return sortedAsc;
  }, [dhctData, sanphamData]);

  // Filtered List
  const filteredData = useMemo(() => {
    return dataWithStock.filter((item) => {
      const itemYMD = toYMD(item.ngay);
      if (fromDate && itemYMD < fromDate) return false;
      if (toDate && itemYMD > toDate) return false;
      if (nccFilter && !(item.ncc || '').toLowerCase().includes(nccFilter.toLowerCase())) return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const target = `${item.id_dh} ${item.id_sp_ct} ${item.ten} ${item.ncc} ${item.truong}`.toLowerCase();
        if (!target.includes(term)) return false;
      }

      return true;
    }).sort((a, b) => {
      const da = toYMD(a.ngay);
      const db = toYMD(b.ngay);
      if (da !== db) return db.localeCompare(da);
      if (a.truong !== b.truong) return a.truong === 'XUẤT' ? -1 : 1;
      return (a.ncc || '').localeCompare(b.ncc || '');
    });
  }, [dataWithStock, fromDate, toDate, nccFilter, searchTerm]);

  // Pagination
  const effectivePageSize = pageSize === 'all' ? Math.max(1, filteredData.length) : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / effectivePageSize));
  const paginatedData = useMemo(() => {
    if (pageSize === 'all') return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Toggle Confirm for a single row
  const handleToggleConfirmRow = async (item) => {
    if (!item.id_dh_ct) return;
    const newStatus = item.xac_nhan === 'ĐÃ XÁC NHẬN' ? 'CHỜ XÁC NHẬN' : 'ĐÃ XÁC NHẬN';

    // Optimistic Update
    setDhctData((prev) =>
      prev.map((r) => (r.id_dh_ct === item.id_dh_ct ? { ...r, xac_nhan: newStatus } : r))
    );

    try {
      await updateSheetCell(CONFIG.dhctSheetName, item.rowIndex, 15, newStatus);
      showToast(`Đã chuyển trạng thái: ${newStatus}`, 'success');
    } catch (err) {
      console.error('Error toggling confirm:', err);
      showToast('Lỗi khi cập nhật trạng thái: ' + err.message, 'error');
      loadData();
    }
  };

  // Open Edit Modal
  const handleDoubleClickRow = (item) => {
    setSelectedOrderDh(item.id_dh);
    setIsModalOpen(true);
  };

  // Export to Excel
  const handleExport = () => {
    if (!filteredData.length) {
      showToast('Không có dữ liệu để xuất!', 'warning');
      return;
    }
    const headers = [
      'ID DH CT', 'ID DH', 'Ngày', 'Trường', 'NCC', 'Kho', 'ID SP CT', 'ID SP', 'Tên Sản Phẩm',
      'Số lượng', 'Giá nhập', 'Thành tiền', 'Xác Nhận', 'Tồn Lũy Kế'
    ];
    const rows = filteredData.map((item) => [
      item.id_dh_ct,
      item.id_dh,
      item.ngay,
      item.truong,
      item.ncc,
      item.kho,
      item.id_sp_ct,
      item.id_sp,
      item.ten,
      item.so_luong,
      item.gia_nhap,
      item.thanh_tien_nhap,
      item.xac_nhan,
      `(${item._tonLuyKeAll || 0}) ${item._tonLuyKeConfirmed || 0}`,
    ]);
    exportToExcel(`DHCT_Export_${Date.now()}`, 'DHCT_Data', headers, rows);
    showToast('Đã xuất Excel thành công!', 'success');
  };

  return (
    <div className="space-y-4 flex-1 min-h-0 flex flex-col">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 lg:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-base text-slate-800">Dữ liệu Đơn hàng chi tiết</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedOrderDh(null);
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-blue-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm đơn hàng</span>
            </button>

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
                setCurrentPage(1);
              }}
              className="p-1 hover:bg-white rounded text-slate-600"
              title="Lùi 1 ngày"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none"
            />
            <span className="text-slate-400 font-bold">➔</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none"
            />
            <button
              onClick={() => {
                setFromDate((p) => shiftDate(p, 1));
                setToDate((p) => shiftDate(p, 1));
                setCurrentPage(1);
              }}
              className="p-1 hover:bg-white rounded text-slate-600"
              title="Tiến 1 ngày"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 min-w-[180px]">
            <input
              type="text"
              value={nccFilter}
              onChange={(e) => {
                setNccFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Lọc theo Nhà cung cấp..."
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 font-medium"
            />
          </div>

          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm mã đơn, SKU, tên SP..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-[400px]">
        <div className="overflow-x-auto flex-1 min-h-[360px] max-h-[calc(100vh-235px)] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase sticky top-0 z-10 select-none shadow-2xs">
              <tr>
                <ResizableTh moduleId="dhct" columnKey="ngay" defaultWidth={100} align="center">Ngày</ResizableTh>
                <ResizableTh moduleId="dhct" columnKey="truong" defaultWidth={80} align="center">Trường</ResizableTh>
                <ResizableTh moduleId="dhct" columnKey="ncc" defaultWidth={140} align="left">NCC</ResizableTh>
                <ResizableTh moduleId="dhct" columnKey="id_sp_ct" defaultWidth={140} align="left">Mã SKU CT</ResizableTh>
                <ResizableTh moduleId="dhct" columnKey="id_sp" defaultWidth={96} align="center">Mã SP</ResizableTh>
                <ResizableTh moduleId="dhct" columnKey="ten" defaultWidth={220} align="left">Tên sản phẩm</ResizableTh>
                <ResizableTh moduleId="dhct" columnKey="so_luong" defaultWidth={80} align="right">SL</ResizableTh>
                <ResizableTh moduleId="dhct" columnKey="gia_nhap" defaultWidth={110} align="right">Giá nhập</ResizableTh>
                <ResizableTh moduleId="dhct" columnKey="thanh_tien" defaultWidth={120} align="right">Thành tiền</ResizableTh>
                <ResizableTh moduleId="dhct" columnKey="xac_nhan" defaultWidth={120} align="center">Xác nhận</ResizableTh>
                <ResizableTh moduleId="dhct" columnKey="ton_luy_ke" defaultWidth={140} align="right" className="bg-indigo-50/40">Tồn Lũy Kế</ResizableTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-slate-400">
                    Không tìm thấy dòng dữ liệu phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={item.rowIndex}
                    onDoubleClick={() => handleDoubleClickRow(item)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Nhấn đúp để xem/sửa đơn hàng này"
                  >
                    <td
                      className="px-3 py-2 text-center text-slate-600 whitespace-nowrap font-medium overflow-hidden text-ellipsis"
                      style={colStyle('ngay', 100)}
                    >
                      {item.ngay}
                    </td>
                    <td
                      className="px-3 py-2 text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('truong', 80)}
                    >
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.truong === 'XUẤT'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {item.truong}
                      </span>
                    </td>
                    <td
                      className="px-3 py-2 text-left text-slate-700 font-semibold truncate overflow-hidden text-ellipsis"
                      style={colStyle('ncc', 140)}
                      title={item.ncc}
                    >
                      {item.ncc || '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-left font-bold text-slate-900 font-mono whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('id_sp_ct', 140)}
                    >
                      {item.id_sp_ct}
                    </td>
                    <td
                      className="px-3 py-2 text-center text-slate-600 font-mono whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('id_sp', 96)}
                    >
                      {item.id_sp}
                    </td>
                    <td
                      className="px-3 py-2 text-left text-slate-700 truncate overflow-hidden text-ellipsis"
                      style={colStyle('ten', 220)}
                      title={item.ten}
                    >
                      {item.ten || '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('so_luong', 80)}
                    >
                      {item.so_luong.toLocaleString('vi-VN')}
                    </td>
                    <td
                      className="px-3 py-2 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('gia_nhap', 110)}
                    >
                      {item.gia_nhap ? `${item.gia_nhap.toLocaleString('vi-VN')} đ` : '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-right font-mono tabular-nums font-bold text-primary whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('thanh_tien', 120)}
                    >
                      {item.thanh_tien_nhap ? `${item.thanh_tien_nhap.toLocaleString('vi-VN')} đ` : '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('xac_nhan', 120)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleToggleConfirmRow(item)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
                          item.xac_nhan === 'ĐÃ XÁC NHẬN'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                        }`}
                      >
                        {item.xac_nhan === 'ĐÃ XÁC NHẬN' ? 'ĐÃ XÁC NHẬN' : 'CHỜ XÁC NHẬN'}
                      </button>
                    </td>
                    <td
                      className="px-3 py-2 text-right font-mono tabular-nums font-bold text-indigo-700 bg-indigo-50/20 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('ton_luy_ke', 140)}
                    >
                      <span className="text-indigo-400 font-normal mr-1">
                        ({(item._tonLuyKeAll || 0).toLocaleString('vi-VN')})
                      </span>
                      {(item._tonLuyKeConfirmed || 0).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination rendered in Bottom Footer */}
        <FooterPortal>
          <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
            <span className="text-slate-300 font-medium hidden sm:inline">•</span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRows={filteredData.length}
              pageSize={pageSize}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              onPageChange={setCurrentPage}
              pageSizeOptions={[25, 50, 100, 200, 500, 'all']}
              maxButtons={5}
            />
          </div>
        </FooterPortal>
      </div>

      {/* Order Add/Edit Modal */}
      <DhctOrderModal
        isOpen={isModalOpen}
        editIdDh={selectedOrderDh}
        sanphamData={sanphamData}
        dhctData={dhctData}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={loadData}
      />
    </div>
  );
}
