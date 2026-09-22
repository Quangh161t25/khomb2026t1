import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { CONFIG } from '../config/config';
import FooterPortal from '../components/common/FooterPortal';
import Pagination from '../components/common/Pagination';
import { fetchSheetData } from '../services/googleSheetsApi';
import { exportToExcel } from '../services/excelExport';
import { toYMD } from '../utils/dateUtils';
import {
  Search,
  RotateCw,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from 'lucide-react';

const MISA_PAGE_SIZE = 100;

export default function UpMisaPage() {
  const { showToast } = useToast();
  const todayStr = toYMD(new Date());

  const [udctData, setUdctData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchSheetData(`${CONFIG.udctSheetName}!A:AE`);
      if (rows && rows.length > 1) {
        const parsed = rows.slice(1).map((row, idx) => ({
          rowIndex: idx + 2,
          ngay: toYMD(row[4] || '') || (row[4] || '').toString().trim(),
          san: (row[8] || '').toString().trim().replace(/\d+$/, '').trim(),
          khung_h: (row[9] || '').toString().trim(),
          ma_gian: (row[10] || '').toString().trim(),
          mvd: (row[11] || '').toString().trim(),
          mdh: (row[12] || '').toString().trim(),
          sku_shop_up: (row[13] || '').toString().trim(),
          so_luong: parseFloat(row[14]) || 0,
          id_sp: (row[15] || '').toString().trim(),
          id_sp_ct: (row[16] || '').toString().trim(),
          ten_sp: (row[17] || '').toString().trim(),
          slg_xuat: parseFloat(row[18]) || 0,
          tinh_trang: (row[23] || '').toString().trim(),
          trang_thai: (row[24] || '').toString().trim(),
          mien: (row[7] || '').toString().trim(),
          don_gia_1: parseFloat(row[30]) || 0,
        }));
        setUdctData(parsed);
      } else {
        setUdctData([]);
      }
    } catch (err) {
      console.error('Error loading UPMISA data:', err);
      showToast('Lỗi khi tải dữ liệu UPMISA: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Headers for MISA
  const misaHeaders = [
    'Hiển thị trên sổ', 'Hình thức bán hàng', 'Phương thức thanh toán', 'Kiêm phiếu xuất kho',
    'Lập kèm hóa đơn', 'Đã lập hóa đơn', 'Ngày hạch toán (*)', 'Ngày chứng từ (*)', 'Số chứng từ (*)',
    'Số phiếu xuất', 'Lý do xuất', 'Số hóa đơn', 'Ngày hóa đơn', 'Mã đơn hàng', 'Mã thống kê',
    'Mã khách hàng', 'Tên khách hàng', 'Địa chỉ', 'Mã số thuế', 'Diễn giải', 'Nộp vào TK',
    'NV bán hàng', 'Mã hàng (*)', 'Tên hàng', 'Hàng khuyến mại', 'TK Tiền/Chi phí/Nợ (*)',
    'TK Doanh thu/Có (*)', 'ĐVT', 'Số lượng', 'Đơn giá sau thuế', 'Đơn giá', 'Thành tiền',
    'Tỷ lệ CK (%)', 'Tiền chiết khấu', 'TK chiết khấu', 'Giá tính thuế XK', '% thuế XK',
    'Tiền thuế XK', 'TK thuế XK', '% thuế GTGT', 'Tiền thuế GTGT', 'TK thuế GTGT',
    'HH không TH trên tờ khai thuế GTGT', 'Kho', 'TK giá vốn', 'TK Kho', 'Đơn giá vốn',
    'Tiền vốn', 'Hàng hóa giữ hộ/bán hộ'
  ];

  // Helper formatting for MISA
  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}${parts[1]}${parts[0].slice(-2)}`;
    }
    return dateStr;
  };

  const formatNgayVN = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const getMisaRow = (item) => {
    const ngayVN = formatNgayVN(item.ngay);
    const san = (item.san || '').toLowerCase();
    const kh = (item.khung_h || '').toUpperCase();
    let prefix = '';
    if (san === 'shopee') prefix = (kh === '10H' ? 'N ' : '') + 'SPE';
    else if (san === 'lazada') prefix = 'LDZ';
    else if (san === 'best') prefix = 'BEST';
    else if (san === 'tiktok') prefix = 'TT';
    else if (san === 'đơn ngoài') prefix = 'XDN';

    const mg = (item.ma_gian || '').trim();
    const nf = formatDateShort(item.ngay);
    const suffix = (item.mien || 'MN').toUpperCase();
    const soChungTu = prefix && mg && nf ? `${prefix}-${mg}-${nf}.${suffix}` : '';

    const mdhDisplay = item.mdh && item.mvd ? `${item.mdh}/${item.mvd}` : item.mdh || item.mvd || '';
    const p = san === 'đơn ngoài' ? ' ' : kh === '10H' ? ' NOW ' : ' ';
    const dienGiai = `${item.mien || ''}${p}${item.san || ''} NGÀY ${ngayVN}`.trim();

    return [
      '0', // Hiển thị trên sổ
      '0', // Hình thức bán hàng
      '0', // Phương thức thanh toán
      '1', // Kiêm phiếu xuất kho
      '0', // Lập kèm hóa đơn
      '0', // Đã lập hóa đơn
      ngayVN, // Ngày hạch toán
      ngayVN, // Ngày chứng từ
      soChungTu, // Số chứng từ
      soChungTu, // Số phiếu xuất
      '', // Lý do xuất
      '', // Số hóa đơn
      '', // Ngày hóa đơn
      mdhDisplay, // Mã đơn hàng
      item.ma_gian || '', // Mã thống kê
      item.ma_gian || '', // Mã khách hàng
      item.ma_gian || '', // Tên khách hàng
      '', // Địa chỉ
      '', // MST
      dienGiai, // Diễn giải
      '', // Nộp vào TK
      '', // NV bán hàng
      item.id_sp || '', // Mã hàng
      item.ten_sp || '', // Tên hàng
      '', // Hàng KM
      '131', // TK Nợ
      '5111', // TK Có
      'Cái', // ĐVT
      item.slg_xuat || '', // Số lượng
      '', // Đơn giá sau thuế
      item.don_gia_1 || '', // Đơn giá
      ((item.don_gia_1 || 0) * (item.slg_xuat || 0)) || '', // Thành tiền
      '', '', '', '', '', '', '', '', '', '', '', // Thuế & CK
      'K' + (item.mien || '').toUpperCase(), // Kho
      '632', // TK Giá vốn
      '1561', // TK Kho
      '', '', '' // Khác
    ];
  };

  // Build MISA Table Data
  const misaRows = useMemo(() => {
    return udctData
      .filter((item) => {
        if (item.trang_thai && item.trang_thai.toUpperCase().includes('HỦY')) return false;
        if (dateFilter && item.ngay !== dateFilter) return false;
        return true;
      })
      .map(getMisaRow);
  }, [udctData, dateFilter]);

  // Filter & Search
  const filteredMisa = useMemo(() => {
    if (!searchTerm) return misaRows;
    const term = searchTerm.toLowerCase();
    return misaRows.filter((row) => row.some((cell) => String(cell).toLowerCase().includes(term)));
  }, [misaRows, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredMisa.length / MISA_PAGE_SIZE));
  const paginatedMisa = useMemo(() => {
    const start = (currentPage - 1) * MISA_PAGE_SIZE;
    return filteredMisa.slice(start, start + MISA_PAGE_SIZE);
  }, [filteredMisa, currentPage]);

  const handleExport = () => {
    if (!filteredMisa.length) {
      showToast('Không có dữ liệu để xuất!', 'warning');
      return;
    }
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
    exportToExcel(`UPMISA_${dateFilter || 'TatCa'}_${timeStr}`, 'MISA', misaHeaders, filteredMisa);
    showToast('Đã xuất Excel MISA thành công!', 'success');
  };

  return (
    <div className="space-y-4 flex-1 min-h-0 flex flex-col">
      {/* Header & Filter */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 lg:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-base text-slate-800">Dữ liệu UP MISA</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Xuất Excel MISA</span>
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
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-slate-400 hover:text-slate-600 px-1 text-xs"
              >
                Xóa
              </button>
            )}
          </div>

          <button
            onClick={() => setDateFilter(todayStr)}
            className="px-2.5 py-1 text-xs font-bold bg-white text-primary border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs"
          >
            Hôm nay
          </button>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm nội dung..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-[400px]">
        <div className="overflow-x-auto flex-1 min-h-[360px] max-h-[calc(100vh-235px)] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase sticky top-0 z-10 whitespace-nowrap select-none shadow-2xs">
              <tr>
                {misaHeaders.slice(0, 15).map((h, i) => {
                  const isCenter = [0, 1, 2, 3, 4, 5, 6, 7, 11, 12, 14].includes(i);
                  return (
                    <th
                      key={i}
                      className={`px-3 py-2.5 border-r border-slate-200 last:border-0 ${
                        isCenter ? 'text-center' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMisa.length === 0 ? (
                <tr>
                  <td colSpan={15} className="text-center py-12 text-slate-400">
                    Không có dữ liệu MISA phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedMisa.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors whitespace-nowrap">
                    {row.slice(0, 15).map((cell, cIdx) => {
                      const isCenter = [0, 1, 2, 3, 4, 5, 6, 7, 11, 12, 14].includes(cIdx);
                      const isMono = [8, 9, 13].includes(cIdx);
                      return (
                        <td
                          key={cIdx}
                          className={`px-3 py-2 text-slate-800 border-r border-slate-100 last:border-0 ${
                            isCenter ? 'text-center' : 'text-left'
                          } ${isMono ? 'font-mono font-medium' : ''}`}
                        >
                          {cell || '-'}
                        </td>
                      );
                    })}
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
            <div className="text-slate-600 font-medium whitespace-nowrap text-[11px] sm:text-xs">
              Đang hiển thị{' '}
              <strong className="text-slate-900 font-bold">
                {filteredMisa.length > 0 ? (currentPage - 1) * MISA_PAGE_SIZE + 1 : 0} -{' '}
                {Math.min(currentPage * MISA_PAGE_SIZE, filteredMisa.length)}
              </strong>{' '}
              trong tổng số{' '}
              <strong className="text-slate-900 font-bold">
                {filteredMisa.length.toLocaleString('vi-VN')}
              </strong>{' '}
              dòng
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              maxButtons={6}
            />
          </div>
        </FooterPortal>
      </div>
    </div>
  );
}
