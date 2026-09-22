import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useColumnWidths } from '../context/ColumnWidthContext';
import ResizableTh from '../components/common/ResizableTh';
import { CONFIG } from '../config/config';
import {
  fetchSheetData,
  appendSheetData,
  updateSheetCell,
  deleteSheetRow,
} from '../services/googleSheetsApi';
import { toYMD, formatYmdToDmy } from '../utils/dateUtils';
import {
  RotateCw,
  Copy,
  Plus,
  Trash2,
  Layers,
  Calendar,
  CheckCircle,
  Building,
} from 'lucide-react';

export default function UniqueDhctPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { getColumnWidth, isColumnVisible } = useColumnWidths();

  const colStyle = useCallback(
    (key, defaultW) => {
      if (!isColumnVisible('unique_dh_ct', key)) return { display: 'none' };
      const w = getColumnWidth('unique_dh_ct', key, defaultW);
      return { width: `${w}px`, minWidth: `${w}px`, maxWidth: `${w}px` };
    },
    [getColumnWidth, isColumnVisible]
  );

  const [dhctData, setDhctData] = useState([]);
  const [sanphamData, setSanphamData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedGroupKey, setSelectedGroupKey] = useState(null); // 'ngay|truong|ncc'

  // New sub-item row state
  const [newSku, setNewSku] = useState('');
  const [newTen, setNewTen] = useState('');
  const [newSl, setNewSl] = useState(1);
  const [newGia, setNewGia] = useState(0);
  const [newKho, setNewKho] = useState('KHO');

  const todayDmy = formatYmdToDmy(toYMD(new Date()));

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

        // Auto select first group
        if (!selectedGroupKey && parsed.length > 0) {
          const first = parsed[0];
          setSelectedGroupKey(`${first.ngay}|${first.truong}|${first.ncc}`);
        }
      } else {
        setDhctData([]);
      }
    } catch (err) {
      console.error('Error loading Unique DHCT:', err);
      showToast('Lỗi tải dữ liệu: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedGroupKey, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group Master list by (ngay, truong, ncc)
  const groupedMaster = useMemo(() => {
    const map = {};
    dhctData.forEach((item) => {
      const ngay = (item.ngay || '').toString().trim().split(' ')[0];
      const truong = (item.truong || '').toString().trim();
      const ncc = (item.ncc || '').toString().trim();
      const key = `${ngay}|${truong}|${ncc}`;
      if (!map[key]) {
        map[key] = { key, ngay, truong, ncc, count: 0, items: [] };
      }
      map[key].count++;
      map[key].items.push(item);
    });

    return Object.values(map).sort((a, b) => {
      const da = toYMD(a.ngay);
      const db = toYMD(b.ngay);
      if (da !== db) return db.localeCompare(da);
      return a.truong.localeCompare(b.truong);
    });
  }, [dhctData]);

  // Selected Group Details
  const selectedGroupItems = useMemo(() => {
    if (!selectedGroupKey) return [];
    const parts = selectedGroupKey.split('|');
    return dhctData.filter(
      (item) =>
        (item.ngay || '').toString().trim().split(' ')[0] === parts[0] &&
        (item.truong || '').toString().trim() === parts[1] &&
        (item.ncc || '').toString().trim() === parts[2]
    );
  }, [dhctData, selectedGroupKey]);

  // Copy Group to Today
  const handleCopyGroupToToday = async (group) => {
    if (user?.role === 'kinhdoanh') {
      showToast('Tài khoản KINHDOANH không được sao chép đơn.', 'warning');
      return;
    }

    if (!window.confirm(`Bạn muốn sao chép nhóm đơn (${group.truong} - ${group.ncc}) sang ngày hôm nay (${todayDmy})?`)) {
      return;
    }

    setLoading(true);
    const newRows = group.items.map((item, idx) => {
      const idDh = `${todayDmy} | ${group.truong} | ${group.ncc} | MB`;
      const idDhCt = `${idDh} | ${item.kho || 'KHO'} | ${item.id_sp_ct}`;
      const idTonKho = `${item.kho || 'KHO'} | ${item.id_sp_ct}`;
      const sl = item.so_luong || 1;
      const gia = item.gia_nhap || 0;

      return [
        idDhCt,
        idDh,
        todayDmy,
        group.truong,
        group.ncc,
        item.kho || 'KHO',
        item.id_sp_ct,
        item.id_sp,
        item.ten,
        sl,
        gia,
        sl * gia,
        sl,
        idTonKho,
        'CHỜ XÁC NHẬN',
      ];
    });

    try {
      await appendSheetData(CONFIG.dhctSheetName, newRows);
      showToast(`Đã sao chép ${newRows.length} sản phẩm sang ngày hôm nay!`, 'success');
      const newKey = `${todayDmy}|${group.truong}|${group.ncc}`;
      setSelectedGroupKey(newKey);
      loadData();
    } catch (err) {
      console.error('Copy group error:', err);
      showToast('Lỗi khi sao chép: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Inline Cell Update
  const handleInlineUpdate = async (item, colIndex, val) => {
    try {
      await updateSheetCell(CONFIG.dhctSheetName, item.rowIndex, colIndex, val);
      setDhctData((prev) =>
        prev.map((r) => (r.rowIndex === item.rowIndex ? { ...r, [colIndex === 6 ? 'kho' : 'id_sp_ct']: val } : r))
      );
    } catch (err) {
      console.error('Error updating cell:', err);
      showToast('Lỗi cập nhật ô: ' + err.message, 'error');
    }
  };

  // Add Item to Current Group
  const handleAddNewItemToGroup = async () => {
    if (!selectedGroupKey) return;
    if (!newSku.trim()) {
      showToast('Vui lòng nhập SKU CT', 'warning');
      return;
    }

    const parts = selectedGroupKey.split('|');
    const groupNgay = parts[0];
    const groupTruong = parts[1];
    const groupNcc = parts[2];

    const idDh = `${groupNgay} | ${groupTruong} | ${groupNcc} | MB`;
    const idDhCt = `${idDh} | ${newKho} | ${newSku.trim().toUpperCase()}`;
    const idTonKho = `${newKho} | ${newSku.trim().toUpperCase()}`;
    const idSp = newSku.trim().substring(0, 4);

    const newRow = [
      idDhCt,
      idDh,
      groupNgay,
      groupTruong,
      groupNcc,
      newKho,
      newSku.trim().toUpperCase(),
      idSp,
      newTen,
      newSl,
      newGia,
      newSl * newGia,
      newSl,
      idTonKho,
      'CHỜ XÁC NHẬN',
    ];

    try {
      await appendSheetData(CONFIG.dhctSheetName, [newRow]);
      showToast('Đã thêm sản phẩm vào đơn!', 'success');
      setNewSku('');
      setNewTen('');
      setNewSl(1);
      setNewGia(0);
      loadData();
    } catch (err) {
      console.error('Error adding item to group:', err);
      showToast('Lỗi khi thêm sản phẩm: ' + err.message, 'error');
    }
  };

  // Auto fill product name and price on SKU input
  const handleNewSkuChange = (skuVal) => {
    setNewSku(skuVal);
    const sp = sanphamData.find((s) => (s.sku_con || '').toUpperCase() === skuVal.trim().toUpperCase());
    if (sp) {
      setNewTen(sp.ten_sp || '');
      setNewGia(sp.gia_nhap || 0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 lg:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="font-bold text-base text-slate-800">Gộp đơn hàng chi tiết (Unique DHCT)</h2>
            <p className="text-xs text-slate-500">Quản lý và sao chép theo nhóm Ngày | Trường | NCC</p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
          title="Tải lại"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Master Group List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 uppercase">Danh sách nhóm đơn</span>
            <span className="text-xs text-slate-500 font-semibold">{groupedMaster.length} nhóm</span>
          </div>

          <div className="overflow-y-auto max-h-[650px] divide-y divide-slate-100">
            {groupedMaster.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Chưa có dữ liệu đơn hàng.</div>
            ) : (
              groupedMaster.map((group) => {
                const isActive = selectedGroupKey === group.key;
                const isNotToday = group.ngay !== todayDmy;

                return (
                  <div
                    key={group.key}
                    onClick={() => setSelectedGroupKey(group.key)}
                    className={`p-3 cursor-pointer transition-all flex items-center justify-between gap-2 group ${
                      isActive ? 'bg-blue-50/80 border-l-4 border-primary' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            group.truong === 'XUẤT'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {group.truong}
                        </span>
                        <span className="text-xs font-bold text-slate-800 truncate">{group.ncc || 'Chưa có NCC'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {group.ngay}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{group.count} SKU</span>
                      </div>
                    </div>

                    {isNotToday && user?.role !== 'kinhdoanh' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyGroupToToday(group);
                        }}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-primary opacity-80 group-hover:opacity-100 transition-opacity"
                        title="Sao chép nhóm này sang hôm nay"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Sub-Details Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800">
                Chi tiết: <span className="text-primary">{selectedGroupKey || 'Chưa chọn nhóm'}</span>
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Tổng cộng: <strong>{selectedGroupItems.length}</strong> sản phẩm
            </div>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[550px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase sticky top-0 z-10 select-none shadow-2xs">
                <tr>
                  <ResizableTh moduleId="unique_dh_ct" columnKey="kho" defaultWidth={70} align="center">Kho</ResizableTh>
                  <ResizableTh moduleId="unique_dh_ct" columnKey="id_sp_ct" defaultWidth={140} align="left">Mã SKU CT</ResizableTh>
                  <ResizableTh moduleId="unique_dh_ct" columnKey="ten" defaultWidth={200} align="left">Tên sản phẩm</ResizableTh>
                  <ResizableTh moduleId="unique_dh_ct" columnKey="so_luong" defaultWidth={80} align="right">SL</ResizableTh>
                  <ResizableTh moduleId="unique_dh_ct" columnKey="gia_nhap" defaultWidth={110} align="right">Giá nhập</ResizableTh>
                  <ResizableTh moduleId="unique_dh_ct" columnKey="thanh_tien" defaultWidth={120} align="right">Thành tiền</ResizableTh>
                  <ResizableTh moduleId="unique_dh_ct" columnKey="trang_thai" defaultWidth={120} align="center">Trạng thái</ResizableTh>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {selectedGroupItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Chọn một nhóm ở danh sách bên trái để xem chi tiết.
                    </td>
                  </tr>
                ) : (
                  selectedGroupItems.map((item) => (
                    <tr key={item.rowIndex} className="hover:bg-slate-50 transition-colors">
                      <td
                        className="px-3 py-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('kho', 70)}
                      >
                        <button
                          onClick={() => handleInlineUpdate(item, 6, item.kho === 'KHO' ? 'BH' : 'KHO')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.kho === 'BH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.kho || 'KHO'}
                        </button>
                      </td>
                      <td
                        className="px-3 py-2 text-left font-bold text-slate-900 font-mono whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('id_sp_ct', 140)}
                      >
                        {item.id_sp_ct}
                      </td>
                      <td
                        className="px-3 py-2 text-left text-slate-700 truncate overflow-hidden text-ellipsis"
                        style={colStyle('ten', 200)}
                        title={item.ten}
                      >
                        {item.ten}
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
                        style={colStyle('trang_thai', 120)}
                      >
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                            item.xac_nhan === 'ĐÃ XÁC NHẬN'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.xac_nhan}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Add Bottom Row */}
          {selectedGroupKey && (
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <select
                value={newKho}
                onChange={(e) => setNewKho(e.target.value)}
                className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold outline-none"
              >
                <option value="KHO">KHO</option>
                <option value="BH">BH</option>
              </select>

              <input
                type="text"
                value={newSku}
                onChange={(e) => handleNewSkuChange(e.target.value)}
                placeholder="SKU CT..."
                className="w-32 px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold uppercase outline-none"
              />

              <input
                type="text"
                value={newTen}
                onChange={(e) => setNewTen(e.target.value)}
                placeholder="Tên SP..."
                className="flex-1 min-w-[140px] px-2 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
              />

              <input
                type="number"
                min="1"
                value={newSl}
                onChange={(e) => setNewSl(parseFloat(e.target.value) || 1)}
                placeholder="SL"
                className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-right font-bold outline-none"
              />

              <button
                onClick={handleAddNewItemToGroup}
                className="px-3 py-1.5 rounded bg-primary hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
