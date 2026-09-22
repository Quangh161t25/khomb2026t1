import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { useColumnWidths } from '../context/ColumnWidthContext';
import ResizableTh from '../components/common/ResizableTh';
import FooterPortal from '../components/common/FooterPortal';
import Pagination from '../components/common/Pagination';
import { CONFIG } from '../config/config';
import { fetchSheetData, updateSheetCell } from '../services/googleSheetsApi';
import { exportToExcel } from '../services/excelExport';
import {
  toYMD,
  shiftDate,
  getTodayYmd,
  getCurrentWeekRangeYmd,
  getCurrentMonthRangeYmd,
} from '../utils/dateUtils';
import {
  Search,
  RotateCw,
  Download,
  Calendar,
  Layers,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import DhctOrderModal from '../components/donchitiet/DhctOrderModal';

export default function DonHangTongPage() {
  const { showToast } = useToast();
  const { getColumnWidth, isColumnVisible } = useColumnWidths();

  const colStyle = useCallback(
    (key, defaultW) => {
      if (!isColumnVisible('donhang_tong', key)) return { display: 'none' };
      const w = getColumnWidth('donhang_tong', key, defaultW);
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

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIdDh, setSelectedIdDh] = useState(null);

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
        setSanphamData(
          spRows.slice(1).map((row) => ({
            sku_con: (row[0] || '').toString().trim(),
            ten_sp: (row[2] || '').toString().trim(),
            gia_nhap: parseFloat(row[3]) || 0,
            ton_dau: parseFloat(row[5]) || 0,
          }))
        );
      }

      if (dhRows && dhRows.length > 1) {
        const parsed = dhRows.slice(1).map((row, idx) => ({
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
          xac_nhan: (row[14] || 'CHỜ XÁC NHẬN').toString().trim(),
        }));
        setDhctData(parsed);
      } else {
        setDhctData([]);
      }
    } catch (err) {
      console.error('Error loading DH_CT:', err);
      showToast('Lỗi tải dữ liệu: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group by ID Đơn Hàng (id_dh)
  const groupedOrders = useMemo(() => {
    const map = {};
    dhctData.forEach((item) => {
      if (!item.id_dh) return;

      const itemYMD = toYMD(item.ngay);
      if (fromDate && itemYMD < fromDate) return;
      if (toDate && itemYMD > toDate) return;
      if (nccFilter && !(item.ncc || '').toLowerCase().includes(nccFilter.toLowerCase())) return;
      if (searchTerm && !item.id_dh.toLowerCase().includes(searchTerm.toLowerCase())) return;

      if (!map[item.id_dh]) {
        map[item.id_dh] = {
          id_dh: item.id_dh,
          ngay: item.ngay,
          truong: item.truong,
          ncc: item.ncc,
          tong_tien: 0,
          count: 0,
          xac_nhan: 'ĐÃ XÁC NHẬN',
          items: [],
        };
      }

      map[item.id_dh].tong_tien += item.thanh_tien_nhap || 0;
      map[item.id_dh].count += 1;
      map[item.id_dh].items.push(item);

      if (item.xac_nhan !== 'ĐÃ XÁC NHẬN') {
        map[item.id_dh].xac_nhan = 'CHỜ XÁC NHẬN';
      }
    });

    return Object.values(map).sort((a, b) => {
      const da = toYMD(a.ngay);
      const db = toYMD(b.ngay);
      if (da !== db) return db.localeCompare(da);
      return a.id_dh.localeCompare(b.id_dh);
    });
  }, [dhctData, fromDate, toDate, nccFilter, searchTerm]);

  // Total summary metrics
  const { totalAmount, totalSkus } = useMemo(() => {
    let amount = 0;
    let skus = 0;
    groupedOrders.forEach((o) => {
      amount += o.tong_tien || 0;
      skus += o.count || 0;
    });
    return { totalAmount: amount, totalSkus: skus };
  }, [groupedOrders]);

  // Pagination
  const effectivePageSize = pageSize === 'all' ? Math.max(1, groupedOrders.length) : pageSize;
  const totalPages = Math.max(1, Math.ceil(groupedOrders.length / effectivePageSize));
  const paginatedOrders = useMemo(() => {
    if (pageSize === 'all') return groupedOrders;
    const start = (currentPage - 1) * pageSize;
    return groupedOrders.slice(start, start + pageSize);
  }, [groupedOrders, currentPage, pageSize]);

  // Toggle Confirm for entire order
  const handleToggleConfirmOrder = async (order) => {
    const newStatus = order.xac_nhan === 'ĐÃ XÁC NHẬN' ? 'CHỜ XÁC NHẬN' : 'ĐÃ XÁC NHẬN';
    const rowsToUpdate = order.items.filter((r) => r.id_sp_ct);

    // Optimistic Update
    setDhctData((prev) =>
      prev.map((r) => (r.id_dh === order.id_dh ? { ...r, xac_nhan: newStatus } : r))
    );

    try {
      await Promise.all(
        rowsToUpdate.map((r) => updateSheetCell(CONFIG.dhctSheetName, r.rowIndex, 15, newStatus))
      );
      showToast(`Đã chuyển toàn bộ đơn sang: ${newStatus}`, 'success');
    } catch (err) {
      console.error('Error toggling order confirm:', err);
      showToast('Lỗi khi cập nhật trạng thái đơn hàng: ' + err.message, 'error');
      loadData();
    }
  };

  // Export to Excel
  const handleExport = () => {
    if (!groupedOrders.length) {
      showToast('Không có dữ liệu để xuất!', 'warning');
      return;
    }
    const headers = ['Mã Đơn Hàng', 'Ngày', 'Trường', 'NCC', 'Số SP', 'Tổng Tiền', 'Trạng Thái'];
    const rows = groupedOrders.map((o) => [
      o.id_dh,
      o.ngay,
      o.truong,
      o.ncc,
      o.count,
      o.tong_tien,
      o.xac_nhan,
    ]);
    exportToExcel(`Don_Hang_Tong_${Date.now()}`, 'Don_Hang_Tong', headers, rows);
    showToast('Đã xuất Excel thành công!', 'success');
  };

  return (
    <div className="space-y-3 flex-1 min-h-0 flex flex-col">
      {/* 1. Header Block */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 lg:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base text-slate-900 tracking-tight">
                ĐƠN HÀNG TỔNG HỢP
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Quản lý tổng quan danh sách đơn hàng xuất nhập kho
              </p>
            </div>
          </div>

          {/* Badges & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-semibold">Tổng đơn:</span>
              <strong className="text-xs font-bold text-blue-600">
                {groupedOrders.length.toLocaleString('vi-VN')}
              </strong>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-semibold">Tổng tiền:</span>
              <strong className="text-xs font-bold text-emerald-600">
                {totalAmount.toLocaleString('vi-VN')} đ
              </strong>
            </div>

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
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-2xs"
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
              placeholder="Tìm mã đơn hàng..."
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
                <ResizableTh moduleId="donhang_tong" columnKey="id_dh" defaultWidth={150} align="left">Mã đơn hàng</ResizableTh>
                <ResizableTh moduleId="donhang_tong" columnKey="ngay" defaultWidth={110} align="center">Ngày</ResizableTh>
                <ResizableTh moduleId="donhang_tong" columnKey="truong" defaultWidth={96} align="center">Trường</ResizableTh>
                <ResizableTh moduleId="donhang_tong" columnKey="ncc" defaultWidth={180} align="left">Nhà cung cấp</ResizableTh>
                <ResizableTh moduleId="donhang_tong" columnKey="count" defaultWidth={96} align="right">Số SKU</ResizableTh>
                <ResizableTh moduleId="donhang_tong" columnKey="tong_tien" defaultWidth={150} align="right">Tổng tiền</ResizableTh>
                <ResizableTh moduleId="donhang_tong" columnKey="xac_nhan" defaultWidth={160} align="center">Trạng thái xác nhận</ResizableTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {groupedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.id_dh}
                    onDoubleClick={() => {
                      setSelectedIdDh(order.id_dh);
                      setIsModalOpen(true);
                    }}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Nhấn đúp để xem/sửa chi tiết đơn hàng này"
                  >
                    <td
                      className="px-4 py-3 font-bold text-slate-900 font-mono whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('id_dh', 150)}
                      title={order.id_dh}
                    >
                      {order.id_dh}
                    </td>
                    <td
                      className="px-4 py-3 text-center text-slate-600 whitespace-nowrap font-medium overflow-hidden text-ellipsis"
                      style={colStyle('ngay', 110)}
                    >
                      {order.ngay}
                    </td>
                    <td
                      className="px-4 py-3 text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('truong', 96)}
                    >
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.truong === 'XUẤT'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {order.truong}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-slate-700 font-semibold truncate text-left overflow-hidden text-ellipsis"
                      style={colStyle('ncc', 180)}
                      title={order.ncc}
                    >
                      {order.ncc}
                    </td>
                    <td
                      className="px-4 py-3 text-right font-mono tabular-nums font-bold text-slate-800 overflow-hidden text-ellipsis"
                      style={colStyle('count', 96)}
                    >
                      {order.count}
                    </td>
                    <td
                      className="px-4 py-3 text-right font-mono tabular-nums font-bold text-primary whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('tong_tien', 150)}
                    >
                      {order.tong_tien.toLocaleString('vi-VN')} đ
                    </td>
                    <td
                      className="px-4 py-3 text-center overflow-hidden text-ellipsis"
                      style={colStyle('xac_nhan', 160)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleToggleConfirmOrder(order)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                          order.xac_nhan === 'ĐÃ XÁC NHẬN'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                        }`}
                      >
                        {order.xac_nhan === 'ĐÃ XÁC NHẬN' ? 'ĐÃ XÁC NHẬN' : 'CHỜ XÁC NHẬN'}
                      </button>
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
              totalRows={groupedOrders.length}
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

      {/* Modal */}
      <DhctOrderModal
        isOpen={isModalOpen}
        editIdDh={selectedIdDh}
        sanphamData={sanphamData}
        dhctData={dhctData}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={loadData}
      />
    </div>
  );
}
