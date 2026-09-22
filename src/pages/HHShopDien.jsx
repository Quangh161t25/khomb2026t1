import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useColumnWidths } from '../context/ColumnWidthContext';
import ResizableTh from '../components/common/ResizableTh';
import { CONFIG } from '../config/config';
import {
  fetchSheetData,
  appendSheetData,
  batchUpdateSheetValues,
  deleteSheetRow,
} from '../services/googleSheetsApi';
import { exportToExcel } from '../services/excelExport';
import { toYMD, formatYmdToDmy, shiftDate } from '../utils/dateUtils';
import { matchMultiKeyword } from '../utils/searchUtils';
import {
  Search,
  RotateCw,
  Plus,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  X,
  Trash2,
} from 'lucide-react';

export default function HHShopDienPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { getColumnWidth, isColumnVisible } = useColumnWidths();
  const todayStr = toYMD(new Date());

  const colStyle = useCallback(
    (key, defaultW) => {
      if (!isColumnVisible('hh_shop_dien', key)) return { display: 'none' };
      const w = getColumnWidth('hh_shop_dien', key, defaultW);
      return { width: `${w}px`, minWidth: `${w}px`, maxWidth: `${w}px` };
    },
    [getColumnWidth, isColumnVisible]
  );

  const [shopData, setShopData] = useState([]);
  const [udctData, setUdctData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [maGianFilter, setMaGianFilter] = useState('');
  const [xacNhanFilter, setXacNhanFilter] = useState('');
  const [daNhanFilter, setDaNhanFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('edit'); // 'create' | 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    ngay_tra: todayStr,
    mvd: '',
    mdh: '',
    ma_gian: '',
    sku: '',
    mvd_tra: '',
    sku_tra: '',
    sl: '1',
    hoan_tra: 'Hoàn',
    xac_nhan: '',
    da_nhan: '',
    ghi_chu: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [shopRows, udctRows] = await Promise.all([
        fetchSheetData(`${CONFIG.hhShopDienSheetName}!A:M`),
        fetchSheetData(`${CONFIG.udctSheetName}!A:Q`),
      ]);

      if (udctRows && udctRows.length > 1) {
        setUdctData(
          udctRows.slice(1).map((row) => ({
            mvd: (row[11] || '').toString().trim(),
            mdh: (row[12] || '').toString().trim(),
            ma_gian: (row[10] || '').toString().trim(),
            id_sp_ct: (row[16] || row[13] || '').toString().trim(),
            id_sp: (row[15] || '').toString().trim(),
            ten_sp: (row[17] || '').toString().trim(),
          }))
        );
      }

      if (shopRows && shopRows.length > 1) {
        const parsed = shopRows.slice(1).map((row, idx) => ({
          rowIndex: idx + 2,
          ngay_tra: toYMD(row[0] || '') || (row[0] || '').toString().trim(),
          mvd: (row[1] || '').toString().trim(),
          mdh: (row[2] || '').toString().trim(),
          ma_gian: (row[3] || '').toString().trim(),
          sku: (row[4] || '').toString().trim(),
          mvd_tra: (row[5] || '').toString().trim(),
          sku_tra: (row[6] || '').toString().trim(),
          sl: (row[7] || '1').toString().trim(),
          hoan_tra: (row[8] || 'Hoàn').toString().trim(),
          xac_nhan: (row[9] || '').toString().trim(),
          da_nhan: (row[10] || '').toString().trim(),
          ghi_chu: (row[11] || '').toString().trim(),
        }));
        setShopData(parsed);
      } else {
        setShopData([]);
      }
    } catch (err) {
      console.error('Error loading HH_SHOP_DIEN:', err);
      showToast('Lỗi khi tải HH_SHOP_DIEN: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Distinct Store List
  const maGianList = useMemo(() => {
    return [...new Set(shopData.map((i) => i.ma_gian).filter(Boolean))].sort();
  }, [shopData]);

  // Filtered Data
  const filteredData = useMemo(() => {
    return shopData.filter((item) => {
      const itemYMD = toYMD(item.ngay_tra);
      if (fromDate && itemYMD < fromDate) return false;
      if (toDate && itemYMD > toDate) return false;
      if (maGianFilter && item.ma_gian !== maGianFilter) return false;
      if (xacNhanFilter && item.xac_nhan !== xacNhanFilter) return false;
      if (daNhanFilter && item.da_nhan !== daNhanFilter) return false;

      if (searchTerm) {
        const text = `${item.mvd} ${item.mdh} ${item.ma_gian} ${item.sku} ${item.mvd_tra} ${item.sku_tra}`;
        if (!matchMultiKeyword(text, searchTerm)) return false;
      }

      return true;
    }).sort((a, b) => toYMD(b.ngay_tra).localeCompare(toYMD(a.ngay_tra)));
  }, [shopData, fromDate, toDate, maGianFilter, xacNhanFilter, daNhanFilter, searchTerm]);

  // Lookup in UD_CT when MVD or MDH is typed
  const lookupUdct = (mvdVal, mdhVal) => {
    if (!udctData.length) return null;
    if (mvdVal) {
      const found = udctData.find((u) => u.mvd.toLowerCase() === mvdVal.toLowerCase());
      if (found) return found;
    }
    if (mdhVal) {
      const found = udctData.find((u) => u.mdh.toLowerCase() === mdhVal.toLowerCase());
      if (found) return found;
    }
    return null;
  };

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormData({
      ngay_tra: todayStr,
      mvd: '',
      mdh: '',
      ma_gian: '',
      sku: '',
      mvd_tra: '',
      sku_tra: '',
      sl: '1',
      hoan_tra: 'Hoàn',
      xac_nhan: '',
      da_nhan: '',
      ghi_chu: '',
    });
    setDrawerMode('create');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      ngay_tra: toYMD(item.ngay_tra) || todayStr,
      mvd: item.mvd || '',
      mdh: item.mdh || '',
      ma_gian: item.ma_gian || '',
      sku: item.sku || '',
      mvd_tra: item.mvd_tra || '',
      sku_tra: item.sku_tra || '',
      sl: item.sl || '1',
      hoan_tra: item.hoan_tra || 'Hoàn',
      xac_nhan: item.xac_nhan || '',
      da_nhan: item.da_nhan || '',
      ghi_chu: item.ghi_chu || '',
    });
    setDrawerMode('edit');
    setIsDrawerOpen(true);
  };

  const handleMvdChange = (val) => {
    const updated = { ...formData, mvd: val };
    const match = lookupUdct(val, formData.mdh);
    if (match) {
      if (!updated.mdh) updated.mdh = match.mdh;
      if (!updated.ma_gian) updated.ma_gian = match.ma_gian;
      if (!updated.sku) updated.sku = match.id_sp_ct || match.id_sp;
      if (!updated.mvd_tra && updated.hoan_tra.toLowerCase() === 'hoàn') updated.mvd_tra = val;
      if (!updated.sku_tra) updated.sku_tra = updated.sku;
    }
    setFormData(updated);
  };

  const handleMdhChange = (val) => {
    const updated = { ...formData, mdh: val };
    const match = lookupUdct(formData.mvd, val);
    if (match) {
      if (!updated.mvd) updated.mvd = match.mvd;
      if (!updated.ma_gian) updated.ma_gian = match.ma_gian;
      if (!updated.sku) updated.sku = match.id_sp_ct || match.id_sp;
      if (!updated.mvd_tra && updated.hoan_tra.toLowerCase() === 'hoàn') updated.mvd_tra = updated.mvd;
      if (!updated.sku_tra) updated.sku_tra = updated.sku;
    }
    setFormData(updated);
  };

  const handleSave = async () => {
    const ngayVN = formatYmdToDmy(formData.ngay_tra) || formData.ngay_tra;
    const rowValues = [
      ngayVN,
      formData.mvd,
      formData.mdh,
      formData.ma_gian,
      formData.sku,
      formData.mvd_tra,
      formData.sku_tra,
      formData.sl,
      formData.hoan_tra,
      formData.xac_nhan,
      formData.da_nhan,
      formData.ghi_chu,
    ];

    if (drawerMode === 'create') {
      try {
        await appendSheetData(CONFIG.hhShopDienSheetName, [rowValues]);
        showToast('Đã thêm mới dòng thành công!', 'success');
        setIsDrawerOpen(false);
        loadData();
      } catch (err) {
        console.error('Error creating HH Shop:', err);
        showToast('Lỗi khi thêm mới: ' + err.message, 'error');
      }
    } else {
      if (!selectedItem) return;
      const rowIndex = selectedItem.rowIndex;
      const updates = [
        { range: `${CONFIG.hhShopDienSheetName}!A${rowIndex}`, values: [[ngayVN]] },
        { range: `${CONFIG.hhShopDienSheetName}!B${rowIndex}`, values: [[formData.mvd]] },
        { range: `${CONFIG.hhShopDienSheetName}!C${rowIndex}`, values: [[formData.mdh]] },
        { range: `${CONFIG.hhShopDienSheetName}!D${rowIndex}`, values: [[formData.ma_gian]] },
        { range: `${CONFIG.hhShopDienSheetName}!E${rowIndex}`, values: [[formData.sku]] },
        { range: `${CONFIG.hhShopDienSheetName}!F${rowIndex}`, values: [[formData.mvd_tra]] },
        { range: `${CONFIG.hhShopDienSheetName}!G${rowIndex}`, values: [[formData.sku_tra]] },
        { range: `${CONFIG.hhShopDienSheetName}!H${rowIndex}`, values: [[formData.sl]] },
        { range: `${CONFIG.hhShopDienSheetName}!I${rowIndex}`, values: [[formData.hoan_tra]] },
        { range: `${CONFIG.hhShopDienSheetName}!J${rowIndex}`, values: [[formData.xac_nhan]] },
        { range: `${CONFIG.hhShopDienSheetName}!K${rowIndex}`, values: [[formData.da_nhan]] },
        { range: `${CONFIG.hhShopDienSheetName}!L${rowIndex}`, values: [[formData.ghi_chu]] },
      ];

      try {
        await batchUpdateSheetValues(updates);
        showToast('Đã lưu thay đổi thành công!', 'success');
        setIsDrawerOpen(false);
        loadData();
      } catch (err) {
        console.error('Error updating HH Shop:', err);
        showToast('Lỗi khi cập nhật: ' + err.message, 'error');
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    if (!window.confirm(`Xóa dòng MVD "${selectedItem.mvd}"?`)) return;
    try {
      await deleteSheetRow(CONFIG.hhShopDienSheetName, selectedItem.rowIndex);
      showToast('Đã xóa dòng thành công!', 'success');
      setIsDrawerOpen(false);
      loadData();
    } catch (err) {
      console.error('Error deleting HH Shop:', err);
      showToast('Lỗi khi xóa: ' + err.message, 'error');
    }
  };

  const handleExport = () => {
    if (!filteredData.length) {
      showToast('Không có dữ liệu để xuất!', 'warning');
      return;
    }
    const headers = [
      'Ngày trả', 'Mã vận đơn', 'Mã đơn hàng', 'Mã gian', 'SKU', 'MVD Trả', 'SKU Trả', 'SL',
      'Hoàn/Trả', 'Xác nhận', 'Đã nhận', 'Ghi chú'
    ];
    const rows = filteredData.map((r) => [
      formatYmdToDmy(r.ngay_tra) || r.ngay_tra,
      r.mvd,
      r.mdh,
      r.ma_gian,
      r.sku,
      r.mvd_tra,
      r.sku_tra,
      r.sl,
      r.hoan_tra,
      r.xac_nhan,
      r.da_nhan,
      r.ghi_chu,
    ]);
    exportToExcel(`HH_SHOP_DIEN_${Date.now()}`, 'HH_SHOP_DIEN', headers, rows);
    showToast('Đã xuất Excel thành công!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 lg:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-base text-slate-800">Hàng hoàn Shop điền</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenCreate}
              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-blue-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mới</span>
            </button>

            <button
              onClick={handleExport}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
              title="Tải lại"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none w-full"
            />
          </div>

          <select
            value={maGianFilter}
            onChange={(e) => setMaGianFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
          >
            <option value="">Tất cả Gian hàng</option>
            {maGianList.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            value={xacNhanFilter}
            onChange={(e) => setXacNhanFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
          >
            <option value="">Tất cả Xác nhận</option>
            <option value="ĐÃ XÁC NHẬN">ĐÃ XÁC NHẬN</option>
            <option value="CHỜ XÁC NHẬN">CHỜ XÁC NHẬN</option>
          </select>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm MVD, MDH, SKU..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0 z-10 whitespace-nowrap select-none shadow-2xs">
              <tr>
                <ResizableTh moduleId="hh_shop_dien" columnKey="ngay_tra" defaultWidth={100} align="center">Ngày trả</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="mvd" defaultWidth={150} align="left">Mã vận đơn</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="mdh" defaultWidth={150} align="left">Mã đơn hàng</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="ma_gian" defaultWidth={110} align="center">Mã gian</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="sku" defaultWidth={130} align="left">SKU</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="mvd_tra" defaultWidth={150} align="left">MVD Trả</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="sku_tra" defaultWidth={130} align="left">SKU Trả</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="sl" defaultWidth={70} align="right">SL</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="hoan_tra" defaultWidth={80} align="center">Loại</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="xac_nhan" defaultWidth={110} align="center">Xác nhận</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="da_nhan" defaultWidth={110} align="center">Đã nhận</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="ghi_chu" defaultWidth={160} align="left">Ghi chú</ResizableTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-slate-400">
                    Không tìm thấy dữ liệu.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.rowIndex}
                    onDoubleClick={() => handleOpenEdit(item)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                    title="Nhấn đúp để sửa"
                  >
                    <td
                      className="px-3 py-2 text-center text-slate-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('ngay_tra', 100)}
                    >
                      {formatYmdToDmy(item.ngay_tra) || item.ngay_tra}
                    </td>
                    <td
                      className="px-3 py-2 text-left font-bold font-mono text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('mvd', 150)}
                      title={item.mvd}
                    >
                      {item.mvd}
                    </td>
                    <td
                      className="px-3 py-2 text-left font-mono text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('mdh', 150)}
                      title={item.mdh}
                    >
                      {item.mdh}
                    </td>
                    <td
                      className="px-3 py-2 text-center font-semibold text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('ma_gian', 110)}
                    >
                      {item.ma_gian}
                    </td>
                    <td
                      className="px-3 py-2 text-left text-indigo-700 font-bold font-mono whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('sku', 130)}
                      title={item.sku}
                    >
                      {item.sku}
                    </td>
                    <td
                      className="px-3 py-2 text-left font-mono text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('mvd_tra', 150)}
                      title={item.mvd_tra}
                    >
                      {item.mvd_tra}
                    </td>
                    <td
                      className="px-3 py-2 text-left font-mono text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('sku_tra', 130)}
                      title={item.sku_tra}
                    >
                      {item.sku_tra}
                    </td>
                    <td
                      className="px-3 py-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('sl', 70)}
                    >
                      {item.sl}
                    </td>
                    <td
                      className="px-3 py-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('hoan_tra', 80)}
                    >
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 inline-block">
                        {item.hoan_tra}
                      </span>
                    </td>
                    <td
                      className="px-3 py-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('xac_nhan', 110)}
                    >
                      {item.xac_nhan || '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('da_nhan', 110)}
                    >
                      {item.da_nhan || '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-left text-slate-500 truncate overflow-hidden text-ellipsis"
                      style={colStyle('ghi_chu', 160)}
                      title={item.ghi_chu}
                    >
                      {item.ghi_chu || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Tổng cộng: <strong>{filteredData.length.toLocaleString('vi-VN')}</strong> dòng
          </span>
          <span className="italic text-slate-400">Nhấn đúp vào dòng để sửa</span>
        </div>
      </div>

      {/* Edit/Create Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col p-4 space-y-4 animate-slide-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800">
                {drawerMode === 'create' ? 'Thêm mới hàng hoàn shop điền' : 'Chỉnh sửa hàng hoàn shop điền'}
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày trả</label>
                <input
                  type="date"
                  value={formData.ngay_tra}
                  onChange={(e) => setFormData({ ...formData, ngay_tra: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã vận đơn (MVD)</label>
                <input
                  type="text"
                  value={formData.mvd}
                  onChange={(e) => handleMvdChange(e.target.value)}
                  placeholder="Nhập MVD..."
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold outline-none uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã đơn hàng (MDH)</label>
                <input
                  type="text"
                  value={formData.mdh}
                  onChange={(e) => handleMdhChange(e.target.value)}
                  placeholder="Nhập MDH..."
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã gian</label>
                  <input
                    type="text"
                    value={formData.ma_gian}
                    onChange={(e) => setFormData({ ...formData, ma_gian: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-indigo-700 outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">MVD Trả</label>
                  <input
                    type="text"
                    value={formData.mvd_tra}
                    onChange={(e) => setFormData({ ...formData, mvd_tra: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU Trả</label>
                  <input
                    type="text"
                    value={formData.sku_tra}
                    onChange={(e) => setFormData({ ...formData, sku_tra: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số lượng</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sl}
                    onChange={(e) => setFormData({ ...formData, sl: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại</label>
                  <select
                    value={formData.hoan_tra}
                    onChange={(e) => setFormData({ ...formData, hoan_tra: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold outline-none"
                  >
                    <option value="Hoàn">Hoàn</option>
                    <option value="Trả">Trả</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú</label>
                <textarea
                  rows={3}
                  value={formData.ghi_chu}
                  onChange={(e) => setFormData({ ...formData, ghi_chu: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {drawerMode === 'edit' ? (
                <button
                  onClick={handleDelete}
                  className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Xóa
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold shadow-xs"
                >
                  {drawerMode === 'create' ? 'Thêm mới' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
