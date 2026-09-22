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
  updateSheetRow,
  appendSheetData,
} from '../services/googleSheetsApi';
import { exportToExcel } from '../services/excelExport';
import * as XLSX from 'xlsx';
import {
  Search,
  RotateCw,
  Upload,
  Download,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Boxes,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export default function InventoryPage() {
  const { showToast } = useToast();
  const { getColumnWidth, isColumnVisible } = useColumnWidths();

  const colStyle = useCallback(
    (key, defaultW) => {
      if (!isColumnVisible('inventory', key)) return { display: 'none' };
      const w = getColumnWidth('inventory', key, defaultW);
      return { width: `${w}px`, minWidth: `${w}px`, maxWidth: `${w}px` };
    },
    [getColumnWidth, isColumnVisible]
  );

  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  // Sorting
  const [sortCol, setSortCol] = useState('ton_cuoi');
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'

  // Inline editing state
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, colKey, val }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRows, dhctRows] = await Promise.all([
        fetchSheetData(`${CONFIG.inventorySheetName}!A:K`),
        fetchSheetData(`${CONFIG.dhctSheetName}!A:P`),
      ]);

      // Calculate ledger sums from DH_CT (where xac_nhan === 'ĐÃ XÁC NHẬN')
      const ledgerSums = {};
      if (dhctRows && dhctRows.length > 1) {
        dhctRows.slice(1).forEach((row) => {
          let idTonKho = (row[13] || '').toString().trim();
          const khoVal = (row[5] || 'KHO').toString().trim();
          const spCtVal = (row[6] || '').toString().trim();
          if (!idTonKho && spCtVal) {
            idTonKho = `${khoVal} | ${spCtVal}`;
          }
          if (!idTonKho) return;

          const isConfirmed = (row[14] || '').toString().trim() === 'ĐÃ XÁC NHẬN';
          if (!isConfirmed) return;

          const truong = (row[3] || '').toString().trim().toUpperCase();
          const sl = parseFloat(row[9]) || 0;

          if (!ledgerSums[idTonKho]) ledgerSums[idTonKho] = { nhap: 0, xuat: 0 };
          if (truong === 'NHẬP') ledgerSums[idTonKho].nhap += sl;
          else if (truong === 'XUẤT') ledgerSums[idTonKho].xuat += sl;
        });
      }

      if (invRows && invRows.length > 1) {
        const parsed = invRows.slice(1).map((row, idx) => {
          const id = (row[0] || '').toString().trim();
          const tonDau = parseFloat(row[5]) || 0;
          const nhap = ledgerSums[id]?.nhap || 0;
          const xuat = ledgerSums[id]?.xuat || 0;
          const tonCuoi = tonDau + nhap - xuat;

          return {
            rowIndex: idx + 2,
            id,
            kho: (row[1] || '').toString().trim(),
            id_sp_ct: (row[2] || '').toString().trim(),
            id_sp: (row[3] || '').toString().trim(),
            ten_sp: (row[4] || '').toString().trim(),
            ton_dau: tonDau,
            nhap,
            xuat,
            ton_cuoi: tonCuoi,
          };
        });

        setInventoryData(parsed);
      } else {
        setInventoryData([]);
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
      showToast('Lỗi khi tải dữ liệu tồn kho: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Sort
  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  // Filtered & Sorted Data
  const filteredData = useMemo(() => {
    let result = inventoryData.filter((row) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const target = `${row.id} ${row.id_sp_ct} ${row.ten_sp} ${row.kho}`.toLowerCase();
      return target.includes(term);
    });

    result.sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [inventoryData, searchTerm, sortCol, sortDir]);

  // Pagination
  const effectivePageSize = pageSize === 'all' ? Math.max(1, filteredData.length) : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / effectivePageSize));
  const paginatedData = useMemo(() => {
    if (pageSize === 'all') return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Inline Editing
  const handleStartEdit = (rowIndex, colKey, val) => {
    setEditingCell({ rowIndex, colKey, val: String(val) });
  };

  const handleSaveInlineEdit = async () => {
    if (!editingCell) return;
    const { rowIndex, colKey, val } = editingCell;
    setEditingCell(null);

    const item = inventoryData.find((r) => r.rowIndex === rowIndex);
    if (!item) return;

    let finalVal = val;
    if (colKey === 'ton_dau') finalVal = parseFloat(val) || 0;

    if (item[colKey] === finalVal) return;

    // Optimistic update
    setInventoryData((prev) =>
      prev.map((r) => {
        if (r.rowIndex === rowIndex) {
          const updated = { ...r, [colKey]: finalVal };
          if (colKey === 'ton_dau') {
            updated.ton_cuoi = updated.ton_dau + updated.nhap - updated.xuat;
          }
          return updated;
        }
        return r;
      })
    );

    const colMap = { id: 1, kho: 2, id_sp_ct: 3, id_sp: 4, ten_sp: 5, ton_dau: 6 };
    const colIndex = colMap[colKey];

    try {
      await updateSheetCell(CONFIG.inventorySheetName, rowIndex, colIndex, finalVal);
      showToast('Đã lưu thay đổi!', 'success');
    } catch (err) {
      console.error('Error updating cell:', err);
      showToast('Lỗi khi cập nhật ô: ' + err.message, 'error');
      loadData();
    }
  };

  // Download Template
  const handleDownloadTemplate = () => {
    const headers = ['Mã Tồn Kho (ID)', 'Kho', 'ID SP CT', 'ID SP', 'Tên Sản Phẩm', 'Tồn đầu'];
    const rows = [['KHO | SP001', 'KHO', 'SP001', 'SP00', 'Sản phẩm mẫu', 10]];
    exportToExcel('Template_Ton_Kho', 'TON_KHO_Template', headers, rows);
  };

  // Export to Excel
  const handleExport = () => {
    if (!filteredData.length) {
      showToast('Không có dữ liệu để xuất!', 'warning');
      return;
    }
    const headers = [
      'Mã Tồn Kho (ID)',
      'Kho',
      'ID SP CT',
      'ID SP',
      'Tên Sản Phẩm',
      'Tồn đầu',
      'Nhập (+)',
      'Xuất (-)',
      'Tồn cuối',
    ];
    const rows = filteredData.map((item) => [
      item.id,
      item.kho,
      item.id_sp_ct,
      item.id_sp,
      item.ten_sp,
      item.ton_dau,
      item.nhap,
      item.xuat,
      item.ton_cuoi,
    ]);
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`;
    exportToExcel(`Ton_Kho_${dateStr}`, 'TON_KHO', headers, rows);
    showToast('Đã xuất Excel tồn kho thành công!', 'success');
  };

  // Upload Excel
  const handleUploadExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length <= 1) {
        showToast('File không có dữ liệu hợp lệ!', 'error');
        return;
      }

      const updateList = [];
      const appendList = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const maTonKho = (row[0] || '').toString().trim();
        if (!maTonKho) continue;

        const kho = (row[1] || '').toString().trim();
        const idSpCt = (row[2] || '').toString().trim().toUpperCase();
        const idSp = (row[3] || '').toString().trim().toUpperCase();
        const tenSp = (row[4] || '').toString().trim();
        const tonDau = parseFloat(row[5]) || 0;

        const existingItem = inventoryData.find((item) => item.id === maTonKho);
        if (existingItem) {
          updateList.push({
            rowIndex: existingItem.rowIndex,
            data: [maTonKho, kho, idSpCt, idSp, tenSp, tonDau],
          });
        } else {
          appendList.push([maTonKho, kho, idSpCt, idSp, tenSp, tonDau]);
        }
      }

      let updatedCount = 0;
      for (const item of updateList) {
        await updateSheetRow(CONFIG.inventorySheetName, item.rowIndex, item.data);
        updatedCount++;
      }

      if (appendList.length > 0) {
        await appendSheetData(CONFIG.inventorySheetName, appendList);
      }

      showToast(`Đã cập nhật ${updatedCount} dòng và thêm mới ${appendList.length} dòng!`, 'success');
      loadData();
    } catch (err) {
      console.error('Error upload inventory Excel:', err);
      showToast('Lỗi khi xử lý file Excel: ' + err.message, 'error');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const renderSortIcon = (col) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary font-bold" />
    );
  };

  return (
    <div className="space-y-4 flex-1 min-h-0 flex flex-col">
      {/* Top Filter & Toolbar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 lg:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-base text-slate-800">Quản lý Tồn kho</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm mã tồn kho, SKU, tên..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <button
              onClick={handleDownloadTemplate}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
              title="Tải mẫu Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Mẫu Excel</span>
            </button>

            <label className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import</span>
              <input type="file" accept=".xlsx, .xls" onChange={handleUploadExcel} className="hidden" />
            </label>

            <button
              onClick={handleExport}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
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
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-[400px]">
        <div className="overflow-x-auto flex-1 min-h-[360px] max-h-[calc(100vh-235px)] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase sticky top-0 z-10 select-none shadow-2xs">
              <tr>
                <ResizableTh
                  moduleId="inventory"
                  columnKey="id"
                  defaultWidth={150}
                  align="left"
                  onClick={() => handleSort('id')}
                  className="cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Mã Tồn Kho</span>
                    {renderSortIcon('id')}
                  </div>
                </ResizableTh>
                <ResizableTh
                  moduleId="inventory"
                  columnKey="kho"
                  defaultWidth={80}
                  align="center"
                  onClick={() => handleSort('kho')}
                  className="cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Kho</span>
                    {renderSortIcon('kho')}
                  </div>
                </ResizableTh>
                <ResizableTh
                  moduleId="inventory"
                  columnKey="id_sp_ct"
                  defaultWidth={140}
                  align="left"
                  onClick={() => handleSort('id_sp_ct')}
                  className="cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Mã SKU CT</span>
                    {renderSortIcon('id_sp_ct')}
                  </div>
                </ResizableTh>
                <ResizableTh
                  moduleId="inventory"
                  columnKey="id_sp"
                  defaultWidth={96}
                  align="center"
                  onClick={() => handleSort('id_sp')}
                  className="cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Mã SP Cha</span>
                    {renderSortIcon('id_sp')}
                  </div>
                </ResizableTh>
                <ResizableTh
                  moduleId="inventory"
                  columnKey="ten_sp"
                  defaultWidth={220}
                  align="left"
                  onClick={() => handleSort('ten_sp')}
                  className="cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Tên sản phẩm</span>
                    {renderSortIcon('ten_sp')}
                  </div>
                </ResizableTh>
                <ResizableTh
                  moduleId="inventory"
                  columnKey="ton_dau"
                  defaultWidth={96}
                  align="right"
                  onClick={() => handleSort('ton_dau')}
                  className="cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Tồn đầu</span>
                    {renderSortIcon('ton_dau')}
                  </div>
                </ResizableTh>
                <ResizableTh
                  moduleId="inventory"
                  columnKey="nhap"
                  defaultWidth={96}
                  align="right"
                  onClick={() => handleSort('nhap')}
                  className="cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-emerald-700">Nhập (+)</span>
                    {renderSortIcon('nhap')}
                  </div>
                </ResizableTh>
                <ResizableTh
                  moduleId="inventory"
                  columnKey="xuat"
                  defaultWidth={96}
                  align="right"
                  onClick={() => handleSort('xuat')}
                  className="cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-rose-700">Xuất (-)</span>
                    {renderSortIcon('xuat')}
                  </div>
                </ResizableTh>
                <ResizableTh
                  moduleId="inventory"
                  columnKey="ton_cuoi"
                  defaultWidth={112}
                  align="right"
                  onClick={() => handleSort('ton_cuoi')}
                  className="cursor-pointer hover:bg-slate-200 transition-colors bg-indigo-50/50 whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-indigo-800">Tồn cuối</span>
                    {renderSortIcon('ton_cuoi')}
                  </div>
                </ResizableTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    Không tìm thấy dữ liệu tồn kho.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.rowIndex} className="hover:bg-slate-50 transition-colors">
                    <td
                      className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('id', 150)}
                      title={row.id}
                    >
                      {row.id}
                    </td>

                    {/* Editable Kho */}
                    <td
                      onDoubleClick={() => handleStartEdit(row.rowIndex, 'kho', row.kho)}
                      className="px-3 py-2 text-center text-slate-700 font-semibold cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('kho', 80)}
                      title="Click đúp để sửa"
                    >
                      {editingCell?.rowIndex === row.rowIndex && editingCell?.colKey === 'kho' ? (
                        <input
                          type="text"
                          autoFocus
                          value={editingCell.val}
                          onChange={(e) => setEditingCell({ ...editingCell, val: e.target.value })}
                          onBlur={handleSaveInlineEdit}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveInlineEdit()}
                          className="w-full px-1 py-0.5 border border-primary rounded text-xs outline-none text-center"
                        />
                      ) : (
                        row.kho
                      )}
                    </td>

                    {/* SKU Con */}
                    <td
                      onDoubleClick={() => handleStartEdit(row.rowIndex, 'id_sp_ct', row.id_sp_ct)}
                      className="px-3 py-2 font-bold font-mono text-slate-900 cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('id_sp_ct', 140)}
                      title="Click đúp để sửa"
                    >
                      {editingCell?.rowIndex === row.rowIndex && editingCell?.colKey === 'id_sp_ct' ? (
                        <input
                          type="text"
                          autoFocus
                          value={editingCell.val}
                          onChange={(e) => setEditingCell({ ...editingCell, val: e.target.value })}
                          onBlur={handleSaveInlineEdit}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveInlineEdit()}
                          className="w-full px-1 py-0.5 border border-primary rounded text-xs outline-none uppercase font-bold"
                        />
                      ) : (
                        row.id_sp_ct
                      )}
                    </td>

                    {/* ID SP */}
                    <td
                      className="px-3 py-2 text-center text-slate-600 font-mono whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('id_sp', 96)}
                    >
                      {row.id_sp}
                    </td>

                    {/* Ten SP */}
                    <td
                      onDoubleClick={() => handleStartEdit(row.rowIndex, 'ten_sp', row.ten_sp)}
                      className="px-3 py-2 text-left text-slate-700 cursor-pointer truncate overflow-hidden text-ellipsis"
                      style={colStyle('ten_sp', 220)}
                      title={row.ten_sp}
                    >
                      {editingCell?.rowIndex === row.rowIndex && editingCell?.colKey === 'ten_sp' ? (
                        <input
                          type="text"
                          autoFocus
                          value={editingCell.val}
                          onChange={(e) => setEditingCell({ ...editingCell, val: e.target.value })}
                          onBlur={handleSaveInlineEdit}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveInlineEdit()}
                          className="w-full px-1 py-0.5 border border-primary rounded text-xs outline-none"
                        />
                      ) : (
                        row.ten_sp || '-'
                      )}
                    </td>

                    {/* Editable Ton Dau */}
                    <td
                      onDoubleClick={() => handleStartEdit(row.rowIndex, 'ton_dau', row.ton_dau)}
                      className="px-3 py-2 text-right font-mono tabular-nums font-semibold text-slate-800 cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('ton_dau', 96)}
                      title="Click đúp để sửa"
                    >
                      {editingCell?.rowIndex === row.rowIndex && editingCell?.colKey === 'ton_dau' ? (
                        <input
                          type="number"
                          autoFocus
                          value={editingCell.val}
                          onChange={(e) => setEditingCell({ ...editingCell, val: e.target.value })}
                          onBlur={handleSaveInlineEdit}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveInlineEdit()}
                          className="w-20 px-1 py-0.5 border border-primary rounded text-xs text-right outline-none font-bold"
                        />
                      ) : (
                        row.ton_dau.toLocaleString('vi-VN')
                      )}
                    </td>

                    {/* Nhap */}
                    <td
                      className="px-3 py-2 text-right font-mono tabular-nums font-semibold text-emerald-600 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('nhap', 96)}
                    >
                      +{row.nhap.toLocaleString('vi-VN')}
                    </td>

                    {/* Xuat */}
                    <td
                      className="px-3 py-2 text-right font-mono tabular-nums font-semibold text-rose-500 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('xuat', 96)}
                    >
                      -{row.xuat.toLocaleString('vi-VN')}
                    </td>

                    {/* Ton Cuoi */}
                    <td
                      className="px-3 py-2 text-right font-mono tabular-nums font-bold text-slate-900 bg-indigo-50/40 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('ton_cuoi', 112)}
                    >
                      {row.ton_cuoi.toLocaleString('vi-VN')}
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
    </div>
  );
}
