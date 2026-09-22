import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useColumnWidths } from '../context/ColumnWidthContext';
import ResizableTh from '../components/common/ResizableTh';
import FooterPortal from '../components/common/FooterPortal';
import Pagination from '../components/common/Pagination';
import { CONFIG } from '../config/config';
import { fetchSheetData, appendSheetData, clearSheetData } from '../services/googleSheetsApi';
import { exportToExcel } from '../services/excelExport';
import * as XLSX from 'xlsx';
import {
  Search,
  RotateCw,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';

export default function SanPhamPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { getColumnWidth, isColumnVisible } = useColumnWidths();

  const colStyle = useCallback(
    (key, defaultW) => {
      if (!isColumnVisible('sanpham', key)) return { display: 'none' };
      const w = getColumnWidth('sanpham', key, defaultW);
      return { width: `${w}px`, minWidth: `${w}px`, maxWidth: `${w}px` };
    },
    [getColumnWidth, isColumnVisible]
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  // Prefix filters: 1-char or 2-char
  const [selectedPrefix1, setSelectedPrefix1] = useState('');
  const [selectedPrefix2, setSelectedPrefix2] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchSheetData(`${CONFIG.sanphamSheetName}!A:G`);
      if (rows && rows.length > 1) {
        const headers = rows[0].map((h) => (h || '').toString().toLowerCase().trim());
        const findIdx = (names) => {
          for (const name of names) {
            const idx = headers.indexOf(name.toLowerCase());
            if (idx !== -1) return idx;
          }
          return -1;
        };

        const idxSkuCon = findIdx(['mã', 'sku_con', 'sku con', 'id_sp_con']);
        const idxIdSp = findIdx(['mã sp cha', 'id_sp']);
        const idxTen = findIdx(['tên', 'ten_sp', 'tên sản phẩm']);
        const idxGiaNhap = findIdx(['giá nhập', 'gia_nhap']);
        const idxGiaBan = findIdx(['giá bán lẻ', 'gia_ban', 'giá bán']);
        const idxGiaDongGoi = findIdx(['giá đón gói', 'gia_dong_goi', 'giá đóng gói']);
        const idxGiaThapNhat = findIdx(['giá bán thấp nhất', 'giá thấp nhất', 'gia_thap_nhat']);

        const parsed = rows
          .slice(1)
          .map((row, idx) => ({
            rowIndex: idx + 2,
            sku_con: idxSkuCon !== -1 ? (row[idxSkuCon] || '').toString().trim().toUpperCase() : (row[0] || '').toString().trim().toUpperCase(),
            id_sp: idxIdSp !== -1 ? (row[idxIdSp] || '').toString().trim().toUpperCase() : (row[1] || '').toString().trim().toUpperCase(),
            ten_sp: idxTen !== -1 ? (row[idxTen] || '').toString().trim() : (row[2] || '').toString().trim(),
            gia_nhap: parseFloat(idxGiaNhap !== -1 ? row[idxGiaNhap] : row[3]) || 0,
            gia_ban: parseFloat(idxGiaBan !== -1 ? row[idxGiaBan] : row[4]) || 0,
            gia_dong_goi: parseFloat(idxGiaDongGoi !== -1 ? row[idxGiaDongGoi] : row[5]) || 0,
            gia_thap_nhat: parseFloat(idxGiaThapNhat !== -1 ? row[idxGiaThapNhat] : row[6]) || 0,
          }))
          .filter((item) => item.sku_con !== '');

        setProducts(parsed);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      showToast('Lỗi khi tải danh mục sản phẩm: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute 1-char prefixes
  const prefix1List = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.sku_con && p.sku_con.length >= 1) {
        set.add(p.sku_con.slice(0, 1));
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a, 'vi', { numeric: true }));
  }, [products]);

  // Compute 2-char prefixes (filtered by selected 1-char prefix)
  const prefix2List = useMemo(() => {
    if (!selectedPrefix1) return [];
    const set = new Set();
    products.forEach((p) => {
      if (p.sku_con && p.sku_con.length >= 2 && p.sku_con.startsWith(selectedPrefix1)) {
        set.add(p.sku_con.slice(0, 2));
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));
  }, [products, selectedPrefix1]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (selectedPrefix2) {
        if (!item.sku_con.startsWith(selectedPrefix2)) return false;
      } else if (selectedPrefix1) {
        if (!item.sku_con.startsWith(selectedPrefix1)) return false;
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const searchTarget = `${item.sku_con} ${item.id_sp} ${item.ten_sp}`.toLowerCase();
        if (!searchTarget.includes(term)) return false;
      }

      return true;
    });
  }, [products, selectedPrefix1, selectedPrefix2, searchTerm]);

  // Pagination
  const effectivePageSize = pageSize === 'all' ? Math.max(1, filteredProducts.length) : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / effectivePageSize));
  const paginatedProducts = useMemo(() => {
    if (pageSize === 'all') return filteredProducts;
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handlePrefix1Select = (p1) => {
    setSelectedPrefix1(p1);
    setSelectedPrefix2('');
    setCurrentPage(1);
  };

  const handlePrefix2Select = (p2) => {
    setSelectedPrefix2(p2);
    setCurrentPage(1);
  };

  // Excel Upload Import
  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (user && ['demo', 'kinhdoanh'].includes(user.role)) {
      showToast('Tài khoản này không được phép tải Excel lên.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

      if (!excelData || excelData.length < 2) {
        showToast('File Excel không có dữ liệu!', 'error');
        return;
      }

      const headers = excelData[0].map((h) => (h || '').toString().trim().toLowerCase());
      const findIdx = (names) => {
        for (const name of names) {
          const idx = headers.indexOf(name.toLowerCase());
          if (idx !== -1) return idx;
        }
        return -1;
      };

      const idxMa = findIdx(['mã', 'sku_con', 'sku con', 'id_sp_con']);
      const idxTen = findIdx(['tên', 'ten_sp', 'tên sản phẩm']);
      const idxGiaNhap = findIdx(['giá nhập', 'gia_nhap']);
      const idxGiaBan = findIdx(['giá bán lẻ', 'gia_ban', 'giá bán']);
      const idxGiaDongGoi = findIdx(['giá đón gói', 'giá đóng gói', 'gia_dong_goi']);
      const idxGiaThapNhat = findIdx(['giá bán thấp nhất', 'giá thấp nhất', 'gia_thap_nhat']);

      if (idxMa === -1) {
        showToast("Không tìm thấy cột 'Mã' trong file Excel!", 'error');
        return;
      }

      const rows = excelData.slice(1);
      const sheetData = [
        ['Mã', 'Mã SP Cha', 'Tên', 'Giá nhập', 'Giá bán lẻ', 'Giá đón gói', 'Giá bán thấp nhất'],
      ];

      for (const row of rows) {
        const ma = row[idxMa] ? row[idxMa].toString().trim().toUpperCase() : '';
        if (!ma) continue;

        const maCha = ma.substring(0, 4);
        const ten = idxTen !== -1 ? (row[idxTen] || '').toString().trim() : '';
        const giaNhap = idxGiaNhap !== -1 ? row[idxGiaNhap] : '';
        const giaBan = idxGiaBan !== -1 ? row[idxGiaBan] : '';
        const giaDongGoi = idxGiaDongGoi !== -1 ? row[idxGiaDongGoi] : '';
        const giaThapNhat = idxGiaThapNhat !== -1 ? row[idxGiaThapNhat] : '';

        sheetData.push([ma, maCha, ten, giaNhap, giaBan, giaDongGoi, giaThapNhat]);
      }

      await clearSheetData(CONFIG.sanphamSheetName);
      await appendSheetData(CONFIG.sanphamSheetName, sheetData);

      showToast(`Import thành công ${sheetData.length - 1} sản phẩm!`, 'success');
      loadData();
    } catch (err) {
      console.error('Excel upload error:', err);
      showToast('Lỗi khi import Excel: ' + err.message, 'error');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  // Export to Excel
  const handleExport = () => {
    if (!filteredProducts.length) {
      showToast('Không có dữ liệu để xuất!', 'warning');
      return;
    }
    const headers = ['Mã', 'Mã SP Cha', 'Tên', 'Giá nhập', 'Giá bán lẻ', 'Giá đón gói', 'Giá bán thấp nhất'];
    const rows = filteredProducts.map((p) => [
      p.sku_con,
      p.id_sp,
      p.ten_sp,
      p.gia_nhap,
      p.gia_ban,
      p.gia_dong_goi,
      p.gia_thap_nhat,
    ]);
    exportToExcel(`DS_SP_${Date.now()}`, 'DS_SP', headers, rows);
    showToast('Đã xuất Excel danh sách sản phẩm!', 'success');
  };

  return (
    <div className="space-y-4 flex-1 min-h-0 flex flex-col">
      {/* Top Filter & Toolbar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 lg:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-base text-slate-800">Danh mục sản phẩm</h2>
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
                placeholder="Tìm mã SKU, tên SP..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <label className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import Excel</span>
              <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="hidden" />
            </label>

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

        {/* 1-Character Prefix Filter Buttons */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 shrink-0">Prefix 1:</span>
            <button
              onClick={() => handlePrefix1Select('')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedPrefix1 === ''
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tất cả
            </button>
            {prefix1List.map((p1) => (
              <button
                key={p1}
                onClick={() => handlePrefix1Select(p1)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedPrefix1 === p1
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {p1}
              </button>
            ))}
          </div>

          {/* 2-Character Prefix Filter Buttons (if 1-character prefix selected) */}
          {selectedPrefix1 && prefix2List.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 bg-slate-50/70 p-1.5 rounded-lg border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 shrink-0">
                Prefix 2 ({selectedPrefix1}):
              </span>
              <button
                onClick={() => handlePrefix2Select('')}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all shrink-0 ${
                  selectedPrefix2 === ''
                    ? 'bg-primary text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Tất cả {selectedPrefix1}
              </button>
              {prefix2List.map((p2) => (
                <button
                  key={p2}
                  onClick={() => handlePrefix2Select(p2)}
                  className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all shrink-0 ${
                    selectedPrefix2 === p2
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {p2}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-[400px]">
        <div className="overflow-x-auto flex-1 min-h-[360px] max-h-[calc(100vh-235px)] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase sticky top-0 z-10 select-none shadow-2xs">
              <tr>
                <ResizableTh moduleId="sanpham" columnKey="sku_con" defaultWidth={140} align="left">Mã SKU Con</ResizableTh>
                <ResizableTh moduleId="sanpham" columnKey="id_sp" defaultWidth={96} align="center">Mã SP Cha</ResizableTh>
                <ResizableTh moduleId="sanpham" columnKey="ten_sp" defaultWidth={220} align="left">Tên sản phẩm</ResizableTh>
                <ResizableTh moduleId="sanpham" columnKey="gia_nhap" defaultWidth={110} align="right">Giá nhập</ResizableTh>
                <ResizableTh moduleId="sanpham" columnKey="gia_ban" defaultWidth={110} align="right">Giá bán lẻ</ResizableTh>
                <ResizableTh moduleId="sanpham" columnKey="gia_dong_goi" defaultWidth={110} align="right">Giá đón gói</ResizableTh>
                <ResizableTh moduleId="sanpham" columnKey="gia_thap_nhat" defaultWidth={120} align="right">Giá thấp nhất</ResizableTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Không tìm thấy sản phẩm phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td
                      className="px-3 py-2 font-bold text-indigo-700 font-mono whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('sku_con', 140)}
                    >
                      {item.sku_con}
                    </td>
                    <td
                      className="px-3 py-2 text-center text-slate-700 font-mono font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('id_sp', 96)}
                    >
                      {item.id_sp}
                    </td>
                    <td
                      className="px-3 py-2 text-left text-slate-900 font-medium truncate overflow-hidden text-ellipsis"
                      style={colStyle('ten_sp', 220)}
                      title={item.ten_sp}
                    >
                      {item.ten_sp || '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-right font-mono tabular-nums font-medium text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('gia_nhap', 110)}
                    >
                      {item.gia_nhap ? item.gia_nhap.toLocaleString('vi-VN') : '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-right font-mono tabular-nums font-medium text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('gia_ban', 110)}
                    >
                      {item.gia_ban ? item.gia_ban.toLocaleString('vi-VN') : '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-right font-mono tabular-nums font-medium text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('gia_dong_goi', 110)}
                    >
                      {item.gia_dong_goi ? item.gia_dong_goi.toLocaleString('vi-VN') : '-'}
                    </td>
                    <td
                      className="px-3 py-2 text-right font-mono tabular-nums font-bold text-primary whitespace-nowrap overflow-hidden text-ellipsis"
                      style={colStyle('gia_thap_nhat', 120)}
                    >
                      {item.gia_thap_nhat ? item.gia_thap_nhat.toLocaleString('vi-VN') : '-'}
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
              totalRows={filteredProducts.length}
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
