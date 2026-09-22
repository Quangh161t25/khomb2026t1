import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { useColumnWidths } from '../context/ColumnWidthContext';
import ResizableTh from '../components/common/ResizableTh';
import { CONFIG } from '../config/config';
import { fetchSheetData, appendSheetData, deleteSheetRow } from '../services/googleSheetsApi';
import { toYMD, parseDmyToYmd, formatYmdToDmy, shiftDate } from '../utils/dateUtils';
import { playSuccessSound, playErrorSound } from '../utils/audioUtils';
import {
  Search,
  RotateCw,
  QrCode,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  Package,
} from 'lucide-react';
import QRScannerModal from '../components/common/QRScannerModal';

const BAN_DON_KHUNG_OPTIONS = ['8H', '9H', '10H', '11H', '13H', '14H', '15H', '16H'];

export default function BanDonPage() {
  const { showToast } = useToast();
  const { getColumnWidth, isColumnVisible } = useColumnWidths();
  const todayStr = toYMD(new Date());

  const colStyle = useCallback(
    (key, defaultW) => {
      if (!isColumnVisible('ban_don', key)) return { display: 'none' };
      const w = getColumnWidth('ban_don', key, defaultW);
      return { width: `${w}px`, minWidth: `${w}px`, maxWidth: `${w}px` };
    },
    [getColumnWidth, isColumnVisible]
  );

  const [dateFilter, setDateFilter] = useState(todayStr);
  const [khungFilter, setKhungFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [banDonData, setBanDonData] = useState([]);
  const [udctData, setUdctData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Quick Add Row Inputs
  const [addNgay, setAddNgay] = useState(todayStr);
  const [addKhung, setAddKhung] = useState('');
  const [addMvd, setAddMvd] = useState('');

  const mvdInputRef = useRef(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Background queue for debounced/batched Google Sheet appends
  const appendQueueRef = useRef([]);
  const appendTimerRef = useRef(null);

  const normalizeBanDonDate = (val) => toYMD(val) || parseDmyToYmd(val) || '';

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch BAN_DON
      const rows = await fetchSheetData(`${CONFIG.banDonSheetName}!A:C`);
      if (rows && rows.length > 1) {
        const headers = rows[0].map((h) => (h || '').toString().trim().toLowerCase());
        const findIndex = (names, fallback) => {
          const idx = headers.findIndex((h) => names.includes(h));
          return idx >= 0 ? idx : fallback;
        };
        const idxNgay = findIndex(['ngay', 'ngày', 'date'], 0);
        const idxKhung = findIndex(['khung_h', 'khung h', 'khung', 'gio', 'giờ'], 1);
        const idxMvd = findIndex(['mvd', 'ma_van_don', 'mã vận đơn'], 2);

        const loaded = rows
          .slice(1)
          .map((row, idx) => ({
            rowIndex: idx + 2,
            ngay: (row[idxNgay] || '').toString().trim(),
            khung_h: (row[idxKhung] || '').toString().trim(),
            mvd: (row[idxMvd] || '').toString().trim(),
            pending: false,
          }))
          .filter((item) => item.ngay || item.khung_h || item.mvd)
          .reverse();

        setBanDonData((prev) => {
          const pendingRows = prev.filter((item) => item.pending);
          const pendingKeys = new Set(pendingRows.map((item) => `${item.ngay}|${item.khung_h}|${item.mvd}`));
          return [...pendingRows, ...loaded.filter((item) => !pendingKeys.has(`${item.ngay}|${item.khung_h}|${item.mvd}`))];
        });
      } else {
        setBanDonData([]);
      }

      // 2. Fetch UD_CT in background
      fetchSheetData(`${CONFIG.udctSheetName}!A:AF`).then((udctRows) => {
        if (udctRows && udctRows.length > 1) {
          const parsed = udctRows.slice(1).map((row) => ({
            ngay: (row[4] || '').toString().trim(),
            khung_h: (row[9] || '').toString().trim(),
            ma_gian: (row[10] || '').toString().trim(),
            mvd: (row[11] || '').toString().trim(),
            mdh: (row[12] || '').toString().trim(),
            sku_shop_up: (row[13] || '').toString().trim(),
            so_luong: (row[14] || '').toString().trim(),
            id_sp: (row[15] || '').toString().trim(),
            id_sp_ct: (row[16] || '').toString().trim(),
            ten_sp: (row[17] || '').toString().trim(),
            slg_xuat: (row[18] || '').toString().trim(),
          }));
          setUdctData(parsed);
        }
      }).catch(console.error);
    } catch (err) {
      console.error('Error loading Ban Don:', err);
      showToast('Lỗi khi tải sheet BAN_DON: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync add inputs with filters
  useEffect(() => {
    setAddNgay(dateFilter || todayStr);
  }, [dateFilter, todayStr]);

  useEffect(() => {
    setAddKhung(khungFilter || '');
  }, [khungFilter]);

  // Base list filtered by date and search (for khung tabs counting)
  const baseForKhungCounts = useMemo(() => {
    return banDonData.filter((item) => {
      const itemDate = normalizeBanDonDate(item.ngay);
      if (dateFilter && itemDate !== dateFilter) return false;
      if (searchTerm && !(item.mvd || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [banDonData, dateFilter, searchTerm]);

  // Filtered Ban Don list
  const filteredBanDon = useMemo(() => {
    return banDonData.filter((item) => {
      const itemDate = normalizeBanDonDate(item.ngay);
      if (dateFilter && itemDate !== dateFilter) return false;
      if (khungFilter && (item.khung_h || '').toUpperCase() !== khungFilter.toUpperCase()) return false;
      if (searchTerm && !(item.mvd || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [banDonData, dateFilter, khungFilter, searchTerm]);

  // MVD counts for duplicate check (green dot)
  const banDonMvdCounts = useMemo(() => {
    const counts = {};
    filteredBanDon.forEach((item) => {
      const mvd = (item.mvd || '').trim();
      if (mvd) counts[mvd] = (counts[mvd] || 0) + 1;
    });
    return counts;
  }, [filteredBanDon]);

  // Ban Don MVD set
  const banDonMvdSet = useMemo(() => {
    return new Set(filteredBanDon.map((item) => (item.mvd || '').trim()).filter(Boolean));
  }, [filteredBanDon]);

  // UD_CT Unique Rows matching current filter
  const udctUniqueRows = useMemo(() => {
    const filtered = udctData.filter((item) => {
      const itemDate = normalizeBanDonDate(item.ngay);
      if (dateFilter && itemDate !== dateFilter) return false;
      if (khungFilter && (item.khung_h || '').toUpperCase() !== khungFilter.toUpperCase()) return false;
      if (searchTerm && !(item.mvd || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return !!(item.mvd || '').trim();
    });

    const seen = new Set();
    const result = [];
    filtered.forEach((item) => {
      const mvd = (item.mvd || '').trim();
      if (!mvd || seen.has(mvd)) return;
      seen.add(mvd);

      const rowsForMvd = udctData.filter((r) => (r.mvd || '').trim() === mvd);
      const uniqueJoin = (f) => [...new Set(rowsForMvd.map((r) => (r[f] || '').trim()).filter(Boolean))].join(', ');

      result.push({
        khung_h: uniqueJoin('khung_h') || item.khung_h || '',
        ma_gian: uniqueJoin('ma_gian') || item.ma_gian || '',
        mvd,
        sku_shop_up: uniqueJoin('sku_shop_up') || item.sku_shop_up || '',
      });
    });
    return result;
  }, [udctData, dateFilter, khungFilter, searchTerm]);

  const uniqueUdctMvdSet = useMemo(() => {
    return new Set(udctUniqueRows.map((item) => item.mvd));
  }, [udctUniqueRows]);

  // Flush Queue logic
  const flushAppendQueue = useCallback(async () => {
    if (!appendQueueRef.current.length) return;
    const rows = appendQueueRef.current.splice(0, appendQueueRef.current.length);
    try {
      const success = await appendSheetData(CONFIG.banDonSheetName, rows);
      if (!success) {
        showToast('Lỗi khi ghi dữ liệu lên Google Sheets.', 'error');
      }
      setBanDonData((prev) =>
        prev.map((item) => {
          if (item.pending && rows.some((r) => r[2] === item.mvd && r[1] === item.khung_h && r[0] === item.ngay)) {
            return { ...item, pending: false };
          }
          return item;
        })
      );
    } catch (err) {
      console.error('Flush Ban Don error:', err);
      // Put back on queue
      rows.forEach((r) => appendQueueRef.current.unshift(r));
      showToast('Đang chờ lưu BAN_DON, vẫn tiếp tục bắn được.', 'warning');
      clearTimeout(appendTimerRef.current);
      appendTimerRef.current = setTimeout(flushAppendQueue, 2500);
    }
  }, [showToast]);

  const queueBanDonAppend = useCallback((row) => {
    appendQueueRef.current.push(row);
    clearTimeout(appendTimerRef.current);
    appendTimerRef.current = setTimeout(flushAppendQueue, 350);
  }, [flushAppendQueue]);

  // Handle Save New Row
  const handleSaveNewRow = () => {
    const mvd = addMvd.trim();
    if (!mvd) {
      showToast('Vui lòng nhập MVD.', 'warning');
      playErrorSound();
      mvdInputRef.current?.focus();
      return;
    }

    const ngaySheet = formatYmdToDmy(addNgay || todayStr);
    const khungVal = (addKhung || khungFilter || '').toUpperCase();

    // Check duplicate locally for warning sound (optional, but good for feedback)
    const isDuplicate = banDonData.some(r => r.mvd === mvd);
    if (isDuplicate) {
      playErrorSound();
      showToast(`Cảnh báo: MVD ${mvd} đã được quét trước đó!`, 'warning');
    } else {
      playSuccessSound();
    }

    const tempRow = {
      rowIndex: `pending-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      ngay: ngaySheet,
      khung_h: khungVal,
      mvd,
      pending: true,
    };

    setBanDonData((prev) => [tempRow, ...prev]);
    queueBanDonAppend([ngaySheet, khungVal, mvd]);

    setAddMvd('');
    mvdInputRef.current?.focus();
  };

  // Handle Delete
  const handleDeleteRow = async (item) => {
    if (String(item.rowIndex).startsWith('pending-')) {
      setBanDonData((prev) => prev.filter((r) => r.rowIndex !== item.rowIndex));
      appendQueueRef.current = appendQueueRef.current.filter(
        (r) => !(r[0] === item.ngay && r[1] === item.khung_h && r[2] === item.mvd)
      );
      return;
    }

    if (!window.confirm(`Xóa MVD "${item.mvd}"?`)) return;

    const prevList = banDonData;
    setBanDonData((prev) => prev.filter((r) => r.rowIndex !== item.rowIndex));

    try {
      await deleteSheetRow(CONFIG.banDonSheetName, item.rowIndex);
      showToast('Đã xóa dòng thành công!', 'success');
    } catch (err) {
      console.error('Delete error:', err);
      setBanDonData(prevList);
      showToast('Lỗi khi xóa dòng: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 lg:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date Picker + Stepper */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setDateFilter((prev) => shiftDate(prev, -1))}
              className="p-1 hover:bg-white rounded text-slate-600 transition-colors"
              title="Lùi 1 ngày"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-1 text-xs font-semibold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={() => setDateFilter((prev) => shiftDate(prev, 1))}
              className="p-1 hover:bg-white rounded text-slate-600 transition-colors"
              title="Tiến 1 ngày"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDateFilter(todayStr)}
              className="px-2 py-0.5 text-[11px] font-bold bg-white text-primary border border-slate-200 rounded hover:bg-slate-50 shadow-2xs"
            >
              Hôm nay
            </button>
          </div>

          {/* Search Bar + QR */}
          <div className="flex-1 max-w-md min-w-[220px] flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" data-form-type="other"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm MVD..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <button
              onClick={() => setScannerOpen(true)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Quét Barcode / QR"
            >
              <QrCode className="w-4 h-4 text-slate-700" />
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Tải lại dữ liệu"
            >
              <RotateCw className={`w-4 h-4 text-slate-700 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Khung H Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setKhungFilter('')}
            className={`h-8 px-3 rounded-lg text-xs font-bold transition-all shrink-0 ${
              khungFilter === ''
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tất cả
            <span
              className={`ml-1.5 inline-flex min-w-5 h-4 items-center justify-center rounded-full px-1 text-[10px] ${
                khungFilter === '' ? 'bg-white text-blue-600 font-bold' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {baseForKhungCounts.length}
            </span>
          </button>
          {BAN_DON_KHUNG_OPTIONS.map((khung) => {
            const count = baseForKhungCounts.filter((item) => (item.khung_h || '').toUpperCase() === khung).length;
            const active = khungFilter === khung;
            return (
              <button
                key={khung}
                onClick={() => setKhungFilter(khung)}
                className={`h-8 px-3 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {khung}
                <span
                  className={`ml-1.5 inline-flex min-w-5 h-4 items-center justify-center rounded-full px-1 text-[10px] ${
                    active ? 'bg-white text-blue-600 font-bold' : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Bắn Đơn Table & Quick Input (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-sm text-slate-900">Danh sách Bắn đơn</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Đã bắn: <strong className="text-slate-900 font-bold">{filteredBanDon.length}</strong> dòng
              (Đơn duy nhất: <strong className="text-blue-600 font-bold">{banDonMvdSet.size}</strong>)
            </div>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[650px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase sticky top-0 z-10 select-none shadow-2xs">
                <tr>
                  <ResizableTh moduleId="ban_don" columnKey="ngay" defaultWidth={100} align="center">Ngày</ResizableTh>
                  <ResizableTh moduleId="ban_don" columnKey="khung_h" defaultWidth={80} align="center">Khung H</ResizableTh>
                  <ResizableTh moduleId="ban_don" columnKey="mvd" defaultWidth={180} align="left">Mã vận đơn (MVD)</ResizableTh>
                  <ResizableTh moduleId="ban_don" columnKey="thao_tac" defaultWidth={70} align="center">Xóa</ResizableTh>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {/* Quick Add Row */}
                <tr className="bg-cyan-50/70 border-b border-cyan-200">
                  <td className="p-1.5" style={colStyle('ngay', 100)}>
                    <input
                      type="date"
                      value={addNgay}
                      onChange={(e) => setAddNgay(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-cyan-300 rounded text-xs outline-none focus:ring-2 focus:ring-cyan-200"
                    />
                  </td>
                  <td className="p-1.5" style={colStyle('khung_h', 80)}>
                    <input
                      type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" data-form-type="other"
                      value={addKhung}
                      onChange={(e) => setAddKhung(e.target.value)}
                      placeholder="Khung H"
                      className="w-full h-8 px-2 bg-white border border-cyan-300 rounded text-xs outline-none focus:ring-2 focus:ring-cyan-200 uppercase font-semibold text-center"
                    />
                  </td>
                  <td className="p-1.5" style={colStyle('mvd', 180)}>
                    <div className="flex items-center gap-1">
                      <input
                        ref={mvdInputRef}
                        type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" data-form-type="other"
                        value={addMvd}
                        onChange={(e) => setAddMvd(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveNewRow();
                          }
                        }}
                        placeholder="Scan / Nhập MVD rồi Enter..."
                        className="w-full h-8 px-3 bg-white border border-cyan-300 rounded text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-cyan-200"
                      />
                    </div>
                  </td>
                  <td className="p-1.5 text-center" style={colStyle('thao_tac', 70)}>
                    <button
                      onClick={handleSaveNewRow}
                      className="h-8 px-3 rounded bg-cyan-600 text-white hover:bg-cyan-700 font-bold text-xs flex items-center justify-center gap-1 shadow-2xs w-full"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm
                    </button>
                  </td>
                </tr>

                {filteredBanDon.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-400">
                      Chưa có mã vận đơn nào được bắn.
                    </td>
                  </tr>
                ) : (
                  filteredBanDon.map((item) => {
                    const isMatched = uniqueUdctMvdSet.has((item.mvd || '').trim());
                    const isDuplicate = banDonMvdCounts[(item.mvd || '').trim()] > 1;

                    return (
                      <tr
                        key={item.rowIndex}
                        className={`hover:bg-slate-50 transition-colors ${
                          isMatched ? 'bg-red-50/70' : ''
                        }`}
                      >
                        <td
                          className="px-3 py-2 text-center text-slate-600 whitespace-nowrap font-medium overflow-hidden text-ellipsis"
                          style={colStyle('ngay', 100)}
                        >
                          {item.ngay}
                        </td>
                        <td
                          className="px-3 py-2 text-center text-slate-700 font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
                          style={colStyle('khung_h', 80)}
                        >
                          {item.khung_h}
                        </td>
                        <td
                          className="px-3 py-2 font-bold font-mono text-left overflow-hidden text-ellipsis"
                          style={colStyle('mvd', 180)}
                        >
                          <div className="flex items-center gap-2">
                            {isDuplicate && (
                              <span
                                className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"
                                title="MVD bị trùng lặp"
                              />
                            )}
                            <span className={isMatched ? 'text-red-600 truncate' : 'text-slate-900 truncate'}>
                              {item.mvd}
                            </span>
                            {item.pending && (
                              <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-1 rounded shrink-0">
                                Đang lưu
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className="px-3 py-2 text-center overflow-hidden text-ellipsis"
                          style={colStyle('thao_tac', 70)}
                        >
                          <button
                            onClick={() => handleDeleteRow(item)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors inline-block"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: UD_CT Unique MVD Table (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-sm text-slate-900">MVD Duy nhất từ UD_CT</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Tổng: <strong className="text-slate-900 font-bold">{udctUniqueRows.length}</strong> MVD
            </div>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[650px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase sticky top-0 z-10 select-none shadow-2xs">
                <tr>
                  <th className="px-3 py-2.5 w-20 text-center whitespace-nowrap">Khung</th>
                  <th className="px-3 py-2.5 w-24 text-center whitespace-nowrap">Mã gian</th>
                  <th className="px-3 py-2.5 text-left w-36 whitespace-nowrap">MVD</th>
                  <th className="px-3 py-2.5 text-left min-w-[140px]">SKU Shop UP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {udctUniqueRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-400">
                      Không có MVD duy nhất từ UD_CT phù hợp.
                    </td>
                  </tr>
                ) : (
                  udctUniqueRows.map((row, idx) => {
                    const isMatched = banDonMvdSet.has(row.mvd);
                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50 transition-colors ${
                          isMatched ? 'bg-red-50/70' : ''
                        }`}
                      >
                        <td className="px-3 py-2 text-center text-slate-700 whitespace-nowrap w-20">{row.khung_h}</td>
                        <td className="px-3 py-2 text-center text-slate-700 whitespace-nowrap font-medium w-24">{row.ma_gian}</td>
                        <td className="px-3 py-2 text-left font-bold font-mono whitespace-nowrap w-36">
                          <span className={isMatched ? 'text-red-600' : 'text-slate-900'}>
                            {row.mvd}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-left text-slate-600 truncate max-w-[160px] min-w-[140px]" title={row.sku_shop_up}>
                          {row.sku_shop_up}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        title="Quét MVD để nhập / tìm kiếm"
        onClose={() => setScannerOpen(false)}
        onScanSuccess={(val) => {
          setAddMvd(val);
          setScannerOpen(false);
          mvdInputRef.current?.focus();
        }}
      />
    </div>
  );
}
