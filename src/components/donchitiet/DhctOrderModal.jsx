import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { CONFIG } from '../../config/config';
import {
  appendSheetData,
  batchUpdateSheetValues,
  fetchSheetData,
} from '../../services/googleSheetsApi';
import { formatYmdToDmy, toYMD } from '../../utils/dateUtils';
import { X, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';

export default function DhctOrderModal({
  isOpen,
  editIdDh = null,
  sanphamData = [],
  dhctData = [],
  onClose,
  onSaveSuccess,
}) {
  const { showToast } = useToast();

  const todayStr = toYMD(new Date());
  const [ngay, setNgay] = useState(todayStr);
  const [truong, setTruong] = useState('XUẤT'); // 'XUẤT' | 'NHẬP'
  const [ncc, setNcc] = useState('');
  const [kho, setKho] = useState('KHO');
  const [lines, setLines] = useState([]);
  const [deletedSheetRows, setDeletedSheetRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Supplier options from existing DH_CT data
  const nccOptions = Array.from(
    new Set(['HẰNG NGÀY', ...dhctData.map((r) => (r.ncc || '').trim()).filter(Boolean)])
  );

  // Helper to calculate cumulative inventory
  const calculateTonLuyKe = (skuCon) => {
    if (!skuCon) return { all: 0, conf: 0 };
    let tonAll = 0;
    let tonConf = 0;
    const skuLower = skuCon.toLowerCase().trim();

    const sp = sanphamData.find((s) => (s.sku_con || '').toLowerCase().trim() === skuLower);
    if (sp) {
      const tonDau = parseFloat(sp.ton_dau) || 0;
      tonAll = tonDau;
      tonConf = tonDau;
    }

    dhctData.forEach((item) => {
      if ((item.id_sp_ct || '').toLowerCase().trim() === skuLower) {
        const sl = parseFloat(item.so_luong) || 0;
        const isConfirmed = item.xac_nhan === 'ĐÃ XÁC NHẬN';
        if (item.truong === 'NHẬP') {
          tonAll += sl;
          if (isConfirmed) tonConf += sl;
        } else if (item.truong === 'XUẤT') {
          tonAll -= sl;
          if (isConfirmed) tonConf -= sl;
        }
      }
    });

    return { all: tonAll, conf: tonConf };
  };

  useEffect(() => {
    if (!isOpen) return;

    if (editIdDh && dhctData.length > 0) {
      // Edit Mode
      const existing = dhctData.filter((r) => r.id_dh === editIdDh);
      if (existing.length > 0) {
        const first = existing[0];
        setNgay(toYMD(first.ngay) || todayStr);
        setTruong(first.truong || 'XUẤT');
        setNcc(first.ncc || '');
        setKho(first.kho || 'KHO');

        const initialLines = existing.map((row) => ({
          id: Math.random().toString(36).substring(2, 9),
          sheetRowIndex: row.rowIndex,
          sku_con: row.id_sp_ct || '',
          id_sp: row.id_sp || '',
          ten_sp: row.ten || '',
          so_luong: parseFloat(row.so_luong) || 0,
          gia_nhap: parseFloat(row.gia_nhap) || 0,
          thanh_tien: (parseFloat(row.so_luong) || 0) * (parseFloat(row.gia_nhap) || 0),
          xac_nhan: row.xac_nhan || 'CHỜ XÁC NHẬN',
          ton_lk: calculateTonLuyKe(row.id_sp_ct || ''),
        }));
        setLines(initialLines);
      }
    } else {
      // New Mode
      setNgay(todayStr);
      setTruong('XUẤT');
      setNcc('');
      setKho('KHO');

      const initialLines = Array.from({ length: 5 }, () => ({
        id: Math.random().toString(36).substring(2, 9),
        sheetRowIndex: null,
        sku_con: '',
        id_sp: '',
        ten_sp: '',
        so_luong: 1,
        gia_nhap: 0,
        thanh_tien: 0,
        xac_nhan: 'CHỜ XÁC NHẬN',
        ton_lk: { all: 0, conf: 0 },
      }));
      setLines(initialLines);
    }
    setDeletedSheetRows([]);
  }, [isOpen, editIdDh, dhctData, todayStr]);

  if (!isOpen) return null;

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        sheetRowIndex: null,
        sku_con: '',
        id_sp: '',
        ten_sp: '',
        so_luong: 1,
        gia_nhap: 0,
        thanh_tien: 0,
        xac_nhan: 'CHỜ XÁC NHẬN',
        ton_lk: { all: 0, conf: 0 },
      },
    ]);
  };

  const handleRemoveLine = (index) => {
    if (lines.length <= 1) return;
    const removed = lines[index];
    if (removed.sheetRowIndex) {
      setDeletedSheetRows((prev) => [...prev, removed.sheetRowIndex]);
    }
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSkuChange = (index, val) => {
    const sku = val.trim().toUpperCase();
    const line = lines[index];
    const sp = sanphamData.find((s) => (s.sku_con || '').toUpperCase() === sku);

    const idSp = sku.length >= 4 ? sku.substring(0, 4) : '';
    const tenSp = sp ? sp.ten_sp || sp.ten || '' : '';
    let giaNhap = line.gia_nhap;
    if (truong === 'NHẬP' && sp) {
      giaNhap = parseFloat(sp.gia_nhap) || 0;
    } else if (truong === 'XUẤT') {
      giaNhap = 0;
    }
    const tonLk = calculateTonLuyKe(sku);
    const thanhTien = (parseFloat(line.so_luong) || 0) * giaNhap;

    setLines((prev) =>
      prev.map((l, i) =>
        i === index
          ? {
              ...l,
              sku_con: sku,
              id_sp: idSp,
              ten_sp: tenSp,
              gia_nhap: giaNhap,
              thanh_tien: thanhTien,
              ton_lk: tonLk,
            }
          : l
      )
    );
  };

  const handleLineValueChange = (index, field, val) => {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const updated = { ...l, [field]: val };
        if (field === 'so_luong' || field === 'gia_nhap') {
          const sl = parseFloat(field === 'so_luong' ? val : l.so_luong) || 0;
          const gia = parseFloat(field === 'gia_nhap' ? val : l.gia_nhap) || 0;
          updated.thanh_tien = sl * gia;
        }
        return updated;
      })
    );
  };

  const handleConfirmAll = (status) => {
    setLines((prev) =>
      prev.map((l) => (l.sku_con.trim() ? { ...l, xac_nhan: status } : l))
    );
  };

  const totalAmount = lines.reduce((sum, l) => sum + (l.thanh_tien || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ngay) {
      showToast('Vui lòng chọn ngày!', 'warning');
      return;
    }

    const validLines = lines.filter((l) => l.sku_con.trim() !== '');
    if (validLines.length === 0) {
      showToast('Vui lòng nhập ít nhất 1 sản phẩm có ID SP CT hợp lệ.', 'warning');
      return;
    }

    setSubmitting(true);
    const ngayFormat = formatYmdToDmy(ngay) || ngay;
    const idDh = `${ngayFormat} | ${truong} | ${ncc} | MB`;

    const finalRowsToAppend = [];
    const finalRowsToUpdate = [];

    for (const line of validLines) {
      const idSpCt = line.sku_con.trim();
      const idDhCt = `${idDh} | ${kho} | ${idSpCt}`;
      const idTonKho = `${kho} | ${idSpCt}`;

      const rowData = [
        idDhCt,
        idDh,
        ngayFormat,
        truong,
        ncc,
        kho,
        idSpCt,
        line.id_sp,
        line.ten_sp,
        line.so_luong,
        line.gia_nhap,
        line.thanh_tien,
        line.so_luong,
        idTonKho,
        line.xac_nhan,
      ];

      if (line.sheetRowIndex) {
        finalRowsToUpdate.push({ rowIndex: line.sheetRowIndex, data: rowData });
      } else {
        finalRowsToAppend.push(rowData);
      }
    }

    try {
      // 1. Batch update deleted rows (fill empty)
      const batchData = [];
      const emptyRow = Array(15).fill('');
      for (const rIndex of deletedSheetRows) {
        batchData.push({ range: `${CONFIG.dhctSheetName}!A${rIndex}`, values: [emptyRow] });
      }
      for (const u of finalRowsToUpdate) {
        batchData.push({ range: `${CONFIG.dhctSheetName}!A${u.rowIndex}`, values: [u.data] });
      }

      if (batchData.length > 0) {
        await batchUpdateSheetValues(batchData);
      }

      if (finalRowsToAppend.length > 0) {
        await appendSheetData(CONFIG.dhctSheetName, finalRowsToAppend);
      }

      showToast('Đã lưu dữ liệu đơn hàng thành công!', 'success');
      onClose();
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error('Error submitting DHCT modal:', err);
      showToast('Lỗi khi lưu đơn hàng: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-5xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-left">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {editIdDh ? 'Sửa đơn hàng chi tiết' : 'Tạo mới đơn hàng chi tiết'}
            </h3>
            <p className="text-xs text-slate-500">Nhập nhiều sản phẩm xuất/nhập kho cùng lúc</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Form Fields */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày chứng từ (*)</label>
              <input
                type="date"
                value={ngay}
                onChange={(e) => setNgay(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trường (*)</label>
              <div className="flex bg-slate-200 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTruong('XUẤT')}
                  className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${
                    truong === 'XUẤT' ? 'bg-white text-primary shadow-xs' : 'text-slate-600'
                  }`}
                >
                  XUẤT
                </button>
                <button
                  type="button"
                  onClick={() => setTruong('NHẬP')}
                  className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${
                    truong === 'NHẬP' ? 'bg-white text-primary shadow-xs' : 'text-slate-600'
                  }`}
                >
                  NHẬP
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nhà cung cấp / Đối tác</label>
              <input
                type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" data-form-type="other"
                list="modalNccList"
                value={ncc}
                onChange={(e) => setNcc(e.target.value)}
                placeholder="Chọn hoặc nhập NCC..."
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20"
              />
              <datalist id="modalNccList">
                {nccOptions.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kho (*)</label>
              <select
                value={kho}
                onChange={(e) => setKho(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="KHO">KHO</option>
                <option value="BH">BH</option>
              </select>
            </div>
          </div>

          {/* Lines Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Danh sách sản phẩm</span>
              <button
                type="button"
                onClick={() => handleConfirmAll('ĐÃ XÁC NHẬN')}
                className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3" /> Xác nhận tất cả
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAll('CHỜ XÁC NHẬN')}
                className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 flex items-center gap-1"
              >
                <Clock className="w-3 h-3" /> Chờ xác nhận
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddLine}
              className="px-2.5 py-1 rounded-lg bg-blue-50 text-primary border border-blue-200 hover:bg-blue-100 text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm dòng
            </button>
          </div>

          {/* Lines Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase sticky top-0 z-10 select-none shadow-2xs">
                  <tr>
                    <th className="px-2.5 py-2 w-32 text-left whitespace-nowrap">Mã SKU CT</th>
                    <th className="px-2.5 py-2 w-20 text-center whitespace-nowrap">Mã Cha</th>
                    <th className="px-2.5 py-2 min-w-[140px] text-left">Tên sản phẩm</th>
                    <th className="px-2.5 py-2 w-16 text-right whitespace-nowrap">SL</th>
                    <th className="px-2.5 py-2 w-24 text-right whitespace-nowrap">Giá nhập</th>
                    <th className="px-2.5 py-2 w-28 text-right whitespace-nowrap">Thành tiền</th>
                    <th className="px-2.5 py-2 w-24 text-center whitespace-nowrap">Trạng thái</th>
                    <th className="px-2.5 py-2 w-28 text-right whitespace-nowrap">Tồn LK</th>
                    <th className="px-2 py-2 w-10 text-center whitespace-nowrap"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {lines.map((line, idx) => (
                    <tr key={line.id} className="hover:bg-slate-50">
                      <td className="p-1.5 w-32">
                        <input
                          type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" data-form-type="other"
                          value={line.sku_con}
                          onChange={(e) => handleSkuChange(idx, e.target.value)}
                          placeholder="Mã SKU CT..."
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold font-mono outline-none focus:ring-1 focus:ring-primary uppercase"
                        />
                      </td>
                      <td className="p-1.5 w-20">
                        <input
                          type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" data-form-type="other"
                          readOnly
                          value={line.id_sp}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 font-mono font-semibold text-center"
                        />
                      </td>
                      <td className="p-1.5 min-w-[140px]">
                        <input
                          type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" data-form-type="other"
                          readOnly
                          value={line.ten_sp}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 truncate text-left"
                          title={line.ten_sp}
                        />
                      </td>
                      <td className="p-1.5 w-16">
                        <input
                          type="number"
                          min="1"
                          value={line.so_luong}
                          onChange={(e) => handleLineValueChange(idx, 'so_luong', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-right font-mono tabular-nums font-bold outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="p-1.5 w-24">
                        <input
                          type="number"
                          min="0"
                          value={line.gia_nhap}
                          onChange={(e) => handleLineValueChange(idx, 'gia_nhap', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-right font-mono tabular-nums outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="p-1.5 w-28">
                        <input
                          type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" data-form-type="other"
                          readOnly
                          value={line.thanh_tien.toLocaleString('vi-VN')}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-right font-mono tabular-nums font-bold text-primary"
                        />
                      </td>
                      <td className="p-1.5 w-24 text-center">
                        <select
                          value={line.xac_nhan}
                          onChange={(e) => handleLineValueChange(idx, 'xac_nhan', e.target.value)}
                          className={`w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold outline-none text-center ${
                            line.xac_nhan === 'ĐÃ XÁC NHẬN' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          <option value="CHỜ XÁC NHẬN">CHỜ XÁC</option>
                          <option value="ĐÃ XÁC NHẬN">ĐÃ XÁC</option>
                        </select>
                      </td>
                      <td className="p-1.5 w-28 text-right font-mono tabular-nums text-[11px] font-bold text-indigo-700 bg-indigo-50/20 whitespace-nowrap">
                        ({(line.ton_lk?.all || 0).toLocaleString('vi-VN')}) {(line.ton_lk?.conf || 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-1.5 w-10 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          disabled={lines.length <= 1}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs">
            Tổng tiền đơn hàng:{' '}
            <strong className="text-base text-primary font-bold">{totalAmount.toLocaleString('vi-VN')} đ</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-xs font-bold shadow-xs flex items-center gap-2 disabled:opacity-60"
            >
              {submitting ? 'Đang lưu...' : 'Lưu dữ liệu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
