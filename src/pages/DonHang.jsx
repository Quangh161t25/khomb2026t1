import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useColumnWidths } from '../context/ColumnWidthContext';
import ResizableTh from '../components/common/ResizableTh';
import FooterPortal from '../components/common/FooterPortal';
import Pagination from '../components/common/Pagination';
import BulkActionBar from '../components/common/BulkActionBar';
import { CONFIG } from '../config/config';
import { fetchSheetData, batchUpdateSheetValues, appendSheetRows } from '../services/googleSheetsApi';
import { exportToExcel } from '../services/excelExport';
import {
  toYMD,
  formatYmdToDmy,
  shiftDate,
  getTodayYmd,
  getCurrentWeekRangeYmd,
  getCurrentMonthRangeYmd,
} from '../utils/dateUtils';
import { matchMultiKeyword } from '../utils/searchUtils';
import * as XLSX from 'xlsx';
import {
  Search,
  RotateCw,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Upload,
  Copy,
  FileSpreadsheet,
  CheckSquare,
  Square,
  AlertCircle,
  Tag,
  Clock,
  Layers,
  Check,
  X,
  Plus,
  RefreshCw,
} from 'lucide-react';

const PAGE_SIZE = 100;
const UDCT_TRANG_THAI_OPTIONS = [
  '1 THAY THẾ',
  '2 HỦY',
  '3 HÊT HÀNG',
  '4 MAI GỌI',
  'CHỜ KHÁCH ĐỔI',
  'ĐÃ HOÀN TRẢ',
  'HỦY DO HẾT HÀNG',
];

function normalizeSanLabel(v) {
  return (v || '')
    .toString()
    .trim()
    .replace(/\d+$/, '')
    .trim();
}

function normalizeTrangThai(v) {
  return (v || '').toString().trim().toUpperCase();
}

export default function DonHangPage() {
  const { user } = useAuth();
  const isKinhDoanh = (user?.role || '').toLowerCase() === 'kinhdoanh';
  const { showToast } = useToast();
  const { getColumnWidth, isColumnVisible } = useColumnWidths();
  const todayStr = toYMD(new Date());

  const colStyle = useCallback(
    (key, defaultW) => {
      if (!isColumnVisible('donhang', key)) return { display: 'none' };
      const w = getColumnWidth('donhang', key, defaultW);
      return { width: `${w}px`, minWidth: `${w}px`, maxWidth: `${w}px` };
    },
    [getColumnWidth, isColumnVisible]
  );

  const [udctData, setUdctData] = useState([]);
  const [sanphamData, setSanphamData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [sanFilter, setSanFilter] = useState('');
  const [khungHFilter, setKhungHFilter] = useState('');
  const [maGianFilter, setMaGianFilter] = useState('');
  const [idSpFilter, setIdSpFilter] = useState('');
  const [idSpCtFilter, setIdSpCtFilter] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all'); // all, cancelled, duplicate, notes, noSku
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  // Selection
  const [selectedRowIndices, setSelectedRowIndices] = useState(new Set());

  // Inline suggestions state: { rowIndex: number, open: boolean }
  const [activeSuggestionRow, setActiveSuggestionRow] = useState(null);

  // Detail Drawer Modal
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    so_luong: '',
    don_gia_1: '',
    id_sp: '',
    id_sp_ct: '',
    tinh_trang: '',
    trang_thai: '',
    ghi_chu: '',
  });

  const autoSaveTimerRef = useRef(null);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [udctRows, spRows] = await Promise.all([
        fetchSheetData(`${CONFIG.udctSheetName}!A:AE`),
        fetchSheetData(`${CONFIG.sanphamSheetName}!A:L`),
      ]);

      if (spRows && spRows.length > 1) {
        setSanphamData(
          spRows.slice(1).map((r) => ({
            id_sp: (r[1] || '').toString().trim(),
            sku_con: (r[2] || '').toString().trim(),
            ten_sp: (r[3] || '').toString().trim(),
            gia_ban: parseFloat(r[6]) || 0,
            gia_nhap: parseFloat(r[7]) || 0,
          }))
        );
      }

      if (udctRows && udctRows.length > 1) {
        const parsed = udctRows.slice(1).map((row, idx) => ({
          rowIndex: idx + 2,
          ngay: toYMD(row[4] || '') || (row[4] || '').toString().trim(),
          san: (row[8] || '').toString().trim(),
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
          ghi_chu: (row[26] || '').toString().trim(),
          mien: (row[7] || '').toString().trim(),
          don_gia_1: parseFloat(row[30]) || 0,
        }));

        // Sắp xếp ngày giảm dần
        parsed.sort((a, b) => (b.ngay || '').localeCompare(a.ngay || ''));
        setUdctData(parsed);
      } else {
        setUdctData([]);
      }
    } catch (err) {
      console.error('Error loading UDCT data:', err);
      showToast('Lỗi khi tải dữ liệu đơn chi tiết: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    setSanFilter('');
    setKhungHFilter('');
    setMaGianFilter('');
    setIdSpFilter('');
    setIdSpCtFilter('');
    setSelectedStatuses(new Set());
    setActiveTab('all');
    setSearchTerm('');
    loadData();
  };

  // Distinct Lists for Select/Datalist
  const sanList = useMemo(() => {
    return [...new Set(udctData.map((i) => normalizeSanLabel(i.san)).filter(Boolean))].sort();
  }, [udctData]);

  const khungList = useMemo(() => {
    const set = new Set(udctData.map((i) => (i.khung_h || '').trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
        return numA - numB;
      }
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [udctData]);

  const maGianList = useMemo(() => {
    return [...new Set(udctData.map((i) => i.ma_gian).filter(Boolean))].sort();
  }, [udctData]);

  const idSpList = useMemo(() => {
    return [...new Set(udctData.map((i) => i.id_sp).filter(Boolean))].sort();
  }, [udctData]);

  const idSpCtList = useMemo(() => {
    return [...new Set(udctData.map((i) => i.id_sp_ct).filter(Boolean))].sort();
  }, [udctData]);

  // Duplicate Mapping across all data
  const { mvdDupMap, mdhDupMap } = useMemo(() => {
    const mvdMap = {};
    const mdhMap = {};
    udctData.forEach((d) => {
      const datePart = (d.ngay || '').split(' ')[0];
      const timeKey = `${datePart}|${d.khung_h}`;
      if (d.mvd && d.mvd !== '-' && d.mvd !== '') {
        if (!mvdMap[d.mvd]) mvdMap[d.mvd] = new Set();
        mvdMap[d.mvd].add(timeKey);
      }
      if (d.mdh && d.mdh !== '-' && d.mdh !== '') {
        if (!mdhMap[d.mdh]) mdhMap[d.mdh] = new Set();
        mdhMap[d.mdh].add(timeKey);
      }
    });
    return { mvdDupMap: mvdMap, mdhDupMap: mdhMap };
  }, [udctData]);

  // Base list for Computing Counts
  const baseForCounts = useMemo(() => {
    return udctData.filter((item) => {
      const itemYMD = toYMD(item.ngay);
      if (fromDate && itemYMD < fromDate) return false;
      if (toDate && itemYMD > toDate) return false;
      if (maGianFilter && item.ma_gian !== maGianFilter) return false;
      if (idSpFilter && item.id_sp !== idSpFilter) return false;
      if (idSpCtFilter && item.id_sp_ct !== idSpCtFilter) return false;
      if (searchTerm) {
        const text = `${item.mvd} ${item.mdh} ${item.ten_sp} ${item.id_sp_ct} ${item.sku_shop_up}`;
        if (!matchMultiKeyword(text, searchTerm)) return false;
      }
      return true;
    });
  }, [udctData, fromDate, toDate, maGianFilter, idSpFilter, idSpCtFilter, searchTerm]);

  // Tab Badge Counts
  const tabCounts = useMemo(() => {
    const cancelled = baseForCounts.filter(
      (i) => (i.trang_thai || '').toLowerCase().includes('hủy') || (i.tinh_trang || '').toLowerCase().includes('hủy')
    ).length;
    const notes = baseForCounts.filter((i) => (i.ghi_chu || '').trim()).length;
    const noSku = baseForCounts.filter((i) => !(i.id_sp_ct || '').trim()).length;
    const duplicate = baseForCounts.filter(
      (i) => (i.mvd && mvdDupMap[i.mvd]?.size > 1) || (i.mdh && mdhDupMap[i.mdh]?.size > 1)
    ).length;

    return { cancelled, notes, noSku, duplicate };
  }, [baseForCounts, mvdDupMap, mdhDupMap]);

  // Filtered Dataset
  const filteredData = useMemo(() => {
    return baseForCounts.filter((item) => {
      // Platform filter
      if (sanFilter && normalizeSanLabel(item.san) !== sanFilter) return false;

      // Khung H filter
      if (khungHFilter && item.khung_h !== khungHFilter) return false;

      // Status multi-select
      if (selectedStatuses.size > 0) {
        const norm = normalizeTrangThai(item.trang_thai);
        if (!selectedStatuses.has(norm)) return false;
      }

      // Quick Tabs
      if (activeTab === 'cancelled') {
        const isHuy = (item.trang_thai || '').toLowerCase().includes('hủy') || (item.tinh_trang || '').toLowerCase().includes('hủy');
        if (!isHuy) return false;
      } else if (activeTab === 'notes') {
        if (!(item.ghi_chu || '').trim()) return false;
      } else if (activeTab === 'noSku') {
        if ((item.id_sp_ct || '').trim()) return false;
      } else if (activeTab === 'duplicate') {
        const isDup = (item.mvd && mvdDupMap[item.mvd]?.size > 1) || (item.mdh && mdhDupMap[item.mdh]?.size > 1);
        if (!isDup) return false;
      }

      return true;
    });
  }, [baseForCounts, sanFilter, khungHFilter, selectedStatuses, activeTab, mvdDupMap, mdhDupMap]);

  // Unique MVD count badge
  const uniqueMvdCount = useMemo(() => {
    const set = new Set(filteredData.map((i) => i.mvd).filter((v) => v && v !== '-'));
    return set.size;
  }, [filteredData]);

  // Paginated Data
  const effectivePageSize = pageSize === 'all' ? Math.max(1, filteredData.length) : pageSize;
  const totalPages = Math.ceil(filteredData.length / effectivePageSize) || 1;
  const paginatedData = useMemo(() => {
    if (pageSize === 'all') return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Check if All on Current Page Selected
  const isAllCurrentPageSelected =
    paginatedData.length > 0 && paginatedData.every((i) => selectedRowIndices.has(i.rowIndex));

  const isSomeCurrentPageSelected =
    paginatedData.some((i) => selectedRowIndices.has(i.rowIndex)) && !isAllCurrentPageSelected;

  const toggleSelectAllCurrentPage = () => {
    setSelectedRowIndices((prev) => {
      const next = new Set(prev);
      if (isAllCurrentPageSelected) {
        paginatedData.forEach((i) => next.delete(i.rowIndex));
      } else {
        paginatedData.forEach((i) => next.add(i.rowIndex));
      }
      return next;
    });
  };

  const toggleRowSelection = (rowIndex) => {
    setSelectedRowIndices((prev) => {
      const next = new Set(prev);
      if (next.has(rowIndex)) next.delete(rowIndex);
      else next.add(rowIndex);
      return next;
    });
  };

  // Status Multi-select toggle
  const toggleStatusFilter = (st) => {
    const norm = normalizeTrangThai(st);
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(norm)) next.delete(norm);
      else next.add(norm);
      return next;
    });
    setCurrentPage(1);
  };

  // Batch Update Status
  const handleBatchUpdateStatus = async (newStatus) => {
    if (selectedRowIndices.size === 0) {
      showToast('Vui lòng chọn ít nhất 1 dòng để thực hiện!', 'warning');
      return;
    }

    const selectedItems = udctData.filter((i) => selectedRowIndices.has(i.rowIndex));
    const isHuyOrHetHang =
      newStatus.toLowerCase().includes('hủy') || newStatus.toLowerCase().includes('hết hàng');

    setActionLoading(true);
    try {
      const updates = [];
      selectedItems.forEach((item) => {
        updates.push({
          range: `${CONFIG.udctSheetName}!Y${item.rowIndex}`,
          values: [[newStatus]],
        });
        if (isHuyOrHetHang) {
          updates.push({
            range: `${CONFIG.udctSheetName}!S${item.rowIndex}`,
            values: [[0]],
          });
        }
      });

      await batchUpdateSheetValues(updates);

      setUdctData((prev) =>
        prev.map((item) => {
          if (selectedRowIndices.has(item.rowIndex)) {
            return {
              ...item,
              trang_thai: newStatus,
              slg_xuat: isHuyOrHetHang ? 0 : item.slg_xuat,
            };
          }
          return item;
        })
      );

      showToast(`Đã cập nhật trạng thái '${newStatus || 'BỎ TRẠNG THÁI'}' cho ${selectedItems.length} dòng!`, 'success');
      setSelectedRowIndices(new Set());
    } catch (err) {
      console.error('Batch status update error:', err);
      showToast('Lỗi cập nhật trạng thái: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Row Status Action
  const handleQuickRowStatus = async (item, status) => {
    const isHuy = status.toLowerCase().includes('hủy') || status.toLowerCase().includes('hết hàng');
    const nextSlg = isHuy ? 0 : item.so_luong || 0;

    setActionLoading(true);
    try {
      const updates = [
        {
          range: `${CONFIG.udctSheetName}!Y${item.rowIndex}`,
          values: [[status]],
        },
      ];
      if (isHuy) {
        updates.push({
          range: `${CONFIG.udctSheetName}!S${item.rowIndex}`,
          values: [[0]],
        });
      }

      await batchUpdateSheetValues(updates);

      setUdctData((prev) =>
        prev.map((r) =>
          r.rowIndex === item.rowIndex
            ? { ...r, trang_thai: status, slg_xuat: nextSlg }
            : r
        )
      );
      showToast(`Đã cập nhật ${item.mvd || item.mdh} thành ${status}!`, 'success');
    } catch (err) {
      console.error('Quick status update error:', err);
      showToast('Lỗi cập nhật: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Batch Up Giá from SanPham catalog
  const handleBatchUpGia = async () => {
    const targets = udctData.filter((i) => selectedRowIndices.size === 0 || selectedRowIndices.has(i.rowIndex));
    const updates = [];
    const updatedIndices = new Set();

    targets.forEach((item) => {
      const searchIdSp = (item.id_sp || '').trim().toLowerCase();
      if (!searchIdSp) return;
      const sp = sanphamData.find((s) => (s.id_sp || '').toLowerCase() === searchIdSp);
      if (sp && sp.gia_ban > 0 && item.don_gia_1 !== sp.gia_ban) {
        updates.push({
          range: `${CONFIG.udctSheetName}!AE${item.rowIndex}`,
          values: [[sp.gia_ban]],
        });
        updatedIndices.add(item.rowIndex);
      }
    });

    if (updates.length === 0) {
      showToast('Tất cả các dòng đã có đơn giá khớp với danh mục sản phẩm!', 'info');
      return;
    }

    setActionLoading(true);
    try {
      await batchUpdateSheetValues(updates);
      setUdctData((prev) =>
        prev.map((r) => {
          if (updatedIndices.has(r.rowIndex)) {
            const sp = sanphamData.find((s) => (s.id_sp || '').toLowerCase() === (r.id_sp || '').toLowerCase());
            return { ...r, don_gia_1: sp?.gia_ban || r.don_gia_1 };
          }
          return r;
        })
      );
      showToast(`Đã cập nhật đơn giá cho ${updates.length} dòng sản phẩm!`, 'success');
    } catch (err) {
      console.error('Batch up gia error:', err);
      showToast('Lỗi cập nhật giá: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Batch Refresh Selected Rows (sync TenSP, ID SP, DonGia from SKU)
  const handleBatchRefreshRows = async () => {
    if (selectedRowIndices.size === 0) {
      showToast('Vui lòng chọn các dòng cần làm mới thông tin!', 'warning');
      return;
    }

    const targets = udctData.filter((i) => selectedRowIndices.has(i.rowIndex));
    const updates = [];

    targets.forEach((item) => {
      const skuCon = (item.id_sp_ct || '').trim().toLowerCase();
      if (!skuCon) return;

      const sp = sanphamData.find((s) => (s.sku_con || '').toLowerCase() === skuCon);
      if (sp) {
        const nextIdSp = sp.id_sp || sp.sku_con.substring(0, 4);
        const nextTenSp = sp.ten_sp || item.ten_sp;
        const nextDonGia = sp.gia_ban || item.don_gia_1;

        updates.push({ range: `${CONFIG.udctSheetName}!P${item.rowIndex}`, values: [[nextIdSp]] });
        updates.push({ range: `${CONFIG.udctSheetName}!R${item.rowIndex}`, values: [[nextTenSp]] });
        updates.push({ range: `${CONFIG.udctSheetName}!AE${item.rowIndex}`, values: [[nextDonGia]] });
      }
    });

    if (updates.length === 0) {
      showToast('Không tìm thấy thông tin tương ứng trong danh mục sản phẩm!', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      await batchUpdateSheetValues(updates);
      setUdctData((prev) =>
        prev.map((r) => {
          if (selectedRowIndices.has(r.rowIndex)) {
            const sp = sanphamData.find((s) => (s.sku_con || '').toLowerCase() === (r.id_sp_ct || '').toLowerCase());
            if (sp) {
              return {
                ...r,
                id_sp: sp.id_sp || sp.sku_con.substring(0, 4),
                ten_sp: sp.ten_sp || r.ten_sp,
                don_gia_1: sp.gia_ban || r.don_gia_1,
              };
            }
          }
          return r;
        })
      );
      showToast(`Đã làm mới thông tin cho ${targets.length} dòng!`, 'success');
      setSelectedRowIndices(new Set());
    } catch (err) {
      console.error('Batch refresh error:', err);
      showToast('Lỗi làm mới dòng: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Inline Save SKU Con
  const handleSaveInlineSkuCon = async (item, newSkuCon) => {
    const val = (newSkuCon || '').trim();
    const updates = [{ range: `${CONFIG.udctSheetName}!Q${item.rowIndex}`, values: [[val]] }];

    let nextTenSp = item.ten_sp;
    let nextIdSp = item.id_sp;
    let nextDonGia = item.don_gia_1;
    let nextSlgXuat = item.slg_xuat;

    const spName = sanphamData.find((s) => (s.sku_con || '').toLowerCase() === val.toLowerCase());
    if (spName) {
      nextTenSp = spName.ten_sp;
      nextIdSp = spName.id_sp || (spName.sku_con || '').substring(0, 4);
      updates.push({ range: `${CONFIG.udctSheetName}!R${item.rowIndex}`, values: [[nextTenSp]] });
      updates.push({ range: `${CONFIG.udctSheetName}!P${item.rowIndex}`, values: [[nextIdSp]] });

      if (spName.gia_ban > 0) {
        nextDonGia = spName.gia_ban;
        updates.push({ range: `${CONFIG.udctSheetName}!AE${item.rowIndex}`, values: [[nextDonGia]] });
      }

      const isHuy = (item.trang_thai || '').toLowerCase().includes('hủy') || (item.trang_thai || '').toLowerCase().includes('hết hàng');
      if (!isHuy) {
        nextSlgXuat = item.so_luong;
        updates.push({ range: `${CONFIG.udctSheetName}!S${item.rowIndex}`, values: [[nextSlgXuat]] });
      }
    }

    try {
      await batchUpdateSheetValues(updates);
      setUdctData((prev) =>
        prev.map((r) =>
          r.rowIndex === item.rowIndex
            ? {
                ...r,
                id_sp_ct: val,
                ten_sp: nextTenSp,
                id_sp: nextIdSp,
                don_gia_1: nextDonGia,
                slg_xuat: nextSlgXuat,
              }
            : r
        )
      );
      showToast(`Đã lưu SKU ${val} thành công!`, 'success');
    } catch (err) {
      console.error('Save inline SKU error:', err);
      showToast('Lỗi khi lưu SKU: ' + err.message, 'error');
    } finally {
      setActiveSuggestionRow(null);
    }
  };

  // Copy Unique MVD
  const handleCopyUniqueMvd = () => {
    const mvds = paginatedData
      .map((i) => (i.mvd || '').trim())
      .filter((m) => m && m !== '-');
    const unique = [...new Set(mvds)];
    if (unique.length === 0) {
      showToast('Không có mã vận đơn nào trên trang này để sao chép!', 'warning');
      return;
    }
    navigator.clipboard.writeText(unique.join('\n'));
    showToast(`Đã sao chép ${unique.length} MVD duy nhất vào bộ nhớ tạm!`, 'success');
  };

  // Upload Excel Handler
  const handleExcelUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length <= 1) {
          showToast('File Excel không có dữ liệu!', 'warning');
          return;
        }

        showToast(`Đã đọc ${json.length - 1} dòng từ file Excel. Đang xử lý tải lên...`, 'info');
        loadData();
      } catch (err) {
        console.error('Excel parse error:', err);
        showToast('Lỗi đọc file Excel: ' + err.message, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Open Drawer
  const handleOpenDrawer = (item) => {
    setDrawerItem(item);
    setEditFormData({
      so_luong: item.so_luong || '',
      don_gia_1: item.don_gia_1 || '',
      id_sp: item.id_sp || '',
      id_sp_ct: item.id_sp_ct || '',
      tinh_trang: item.tinh_trang || 'Chờ xác nhận',
      trang_thai: item.trang_thai || '',
      ghi_chu: item.ghi_chu || '',
    });
    setDrawerOpen(true);
  };

  // Save Drawer Form
  const handleSaveDrawer = async (silent = false) => {
    if (!drawerItem) return;

    const trangThaiLower = (editFormData.trang_thai || '').toLowerCase();
    const isHuyOrHetHang = trangThaiLower.includes('hủy') || trangThaiLower.includes('hết hàng');
    const nextSlgXuat = isHuyOrHetHang ? 0 : parseFloat(editFormData.so_luong) || 0;

    const batchUpdates = [
      { range: `${CONFIG.udctSheetName}!O${drawerItem.rowIndex}`, values: [[editFormData.so_luong]] },
      { range: `${CONFIG.udctSheetName}!P${drawerItem.rowIndex}`, values: [[editFormData.id_sp]] },
      { range: `${CONFIG.udctSheetName}!Q${drawerItem.rowIndex}`, values: [[editFormData.id_sp_ct]] },
      { range: `${CONFIG.udctSheetName}!S${drawerItem.rowIndex}`, values: [[nextSlgXuat]] },
      { range: `${CONFIG.udctSheetName}!X${drawerItem.rowIndex}`, values: [[editFormData.tinh_trang]] },
      { range: `${CONFIG.udctSheetName}!Y${drawerItem.rowIndex}`, values: [[editFormData.trang_thai]] },
      { range: `${CONFIG.udctSheetName}!AA${drawerItem.rowIndex}`, values: [[editFormData.ghi_chu]] },
      { range: `${CONFIG.udctSheetName}!AE${drawerItem.rowIndex}`, values: [[editFormData.don_gia_1]] },
    ];

    try {
      await batchUpdateSheetValues(batchUpdates);
      setUdctData((prev) =>
        prev.map((r) =>
          r.rowIndex === drawerItem.rowIndex
            ? {
                ...r,
                ...editFormData,
                so_luong: parseFloat(editFormData.so_luong) || 0,
                don_gia_1: parseFloat(editFormData.don_gia_1) || 0,
                slg_xuat: nextSlgXuat,
              }
            : r
        )
      );
      if (!silent) {
        showToast('Đã lưu chi tiết đơn hàng thành công!', 'success');
        setDrawerOpen(false);
      }
    } catch (err) {
      console.error('Save drawer error:', err);
      if (!silent) showToast('Lỗi lưu đơn hàng: ' + err.message, 'error');
    }
  };

  // Auto-save debounce on drawer change
  const handleDrawerFieldChange = (field, value) => {
    setEditFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'id_sp_ct') {
        const sp = sanphamData.find((s) => (s.sku_con || '').toLowerCase() === (value || '').toLowerCase());
        if (sp) {
          next.id_sp = sp.id_sp || (sp.sku_con || '').substring(0, 4);
          if (sp.gia_ban > 0) next.don_gia_1 = sp.gia_ban;
        }
      }
      return next;
    });

    if (!isKinhDoanh || field === 'ghi_chu') {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        handleSaveDrawer(true);
      }, 600);
    }
  };

  return (
    <div className="space-y-3 flex-1 min-h-0 flex flex-col">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 space-y-3">
        {/* Row 1: Time, Search, Counts & Primary Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
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

            {/* Ma Gian Select */}
            <select
              value={maGianFilter}
              onChange={(e) => {
                setMaGianFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tất cả Gian hàng</option>
              {maGianList.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* ID SP Input */}
            <input
              type="text"
              list="udctIdSpList"
              value={idSpFilter}
              onChange={(e) => {
                setIdSpFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Lọc ID SP..."
              className="w-24 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
            />
            <datalist id="udctIdSpList">
              {idSpList.map((id) => (
                <option key={id} value={id} />
              ))}
            </datalist>

            {/* ID SP CT Input */}
            <input
              type="text"
              list="udctIdSpCtList"
              value={idSpCtFilter}
              onChange={(e) => {
                setIdSpCtFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Lọc ID SP CT..."
              className="w-28 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
            />
            <datalist id="udctIdSpCtList">
              {idSpCtList.map((id) => (
                <option key={id} value={id} />
              ))}
            </datalist>

            {/* Search Input */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm MVD, MDH, SKU..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary/20 font-medium"
              />
            </div>
          </div>

          {/* Badges: Dòng & MVD */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-semibold">Dòng</span>
              <span className="text-xs font-bold text-primary">{filteredData.length.toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-semibold">MVD</span>
              <span className="text-xs font-bold text-emerald-600">{uniqueMvdCount.toLocaleString('vi-VN')}</span>
            </div>
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

        {/* Row 2: Platform Buttons, Khung H Buttons & Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Platform Buttons */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg font-bold text-[11px]">
            <button
              onClick={() => {
                setSanFilter('');
                setCurrentPage(1);
              }}
              className={`px-2 py-1 rounded-md transition-all ${
                sanFilter === '' ? 'bg-white text-primary shadow-2xs' : 'text-slate-600'
              }`}
            >
              Tất cả Sàn
            </button>
            {sanList.map((s) => {
              const count = baseForCounts.filter((i) => normalizeSanLabel(i.san) === s).length;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setSanFilter(s);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                    sanFilter === s ? 'bg-white text-primary shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  <span>{s}</span>
                  {count > 0 && (
                    <span className="text-[10px] text-red-600 bg-white border border-red-200 px-1 rounded-sm">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Khung H Buttons */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg font-bold text-[11px] overflow-x-auto max-w-full">
            <button
              onClick={() => {
                setKhungHFilter('');
                setCurrentPage(1);
              }}
              className={`px-2 py-1 rounded-md transition-all shrink-0 ${
                khungHFilter === '' ? 'bg-white text-primary shadow-2xs' : 'text-slate-600'
              }`}
            >
              Khung H
            </button>
            {khungList.map((kh) => {
              const count = baseForCounts.filter((i) => (i.khung_h || '').trim() === kh).length;
              return (
                <button
                  key={kh}
                  onClick={() => {
                    setKhungHFilter((prev) => (prev === kh ? '' : kh));
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 shrink-0 ${
                    khungHFilter === kh ? 'bg-white text-primary shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  <span>{kh}</span>
                  {count > 0 && (
                    <span className="text-[10px] text-red-600 bg-white border border-red-200 px-1 rounded-sm">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Status Multi-select Buttons */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg font-bold text-[11px] overflow-x-auto">
            <button
              onClick={() => {
                setSelectedStatuses(new Set());
                setCurrentPage(1);
              }}
              className={`px-2 py-1 rounded-md transition-all ${
                selectedStatuses.size === 0 ? 'bg-white text-primary shadow-2xs' : 'text-slate-600'
              }`}
            >
              Trạng thái
            </button>
            {UDCT_TRANG_THAI_OPTIONS.map((st) => {
              const count = baseForCounts.filter(
                (i) => normalizeTrangThai(i.trang_thai) === normalizeTrangThai(st)
              ).length;
              const isSelected = selectedStatuses.has(normalizeTrangThai(st));
              if (count === 0 && !isSelected) return null;
              return (
                <button
                  key={st}
                  onClick={() => toggleStatusFilter(st)}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                    isSelected ? 'bg-white text-primary shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  <span>{st}</span>
                  {count > 0 && (
                    <span className="text-[10px] text-red-600 bg-white border border-red-200 px-1 rounded-sm">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Toolbar & Quick Status Tabs */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Quick Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-100 pb-1 sm:pb-0 sm:border-none">
          <button
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả các đơn
          </button>
          <button
            onClick={() => {
              setActiveTab('cancelled');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'cancelled'
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Đơn hủy</span>
            {tabCounts.cancelled > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {tabCounts.cancelled}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('duplicate');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'duplicate'
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Check trùng</span>
            {tabCounts.duplicate > 0 && (
              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {tabCounts.duplicate}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('notes');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'notes'
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Ghi chú</span>
            {tabCounts.notes > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {tabCounts.notes}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('noSku');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'noSku'
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>K CÓ SKU</span>
            {tabCounts.noSku > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {tabCounts.noSku}
              </span>
            )}
          </button>
        </div>

        {/* Batch Actions Group */}
        <div className="flex flex-wrap items-center gap-1.5 ml-auto">
          <button
            onClick={handleCopyUniqueMvd}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1 shadow-2xs"
            title="Sao chép danh sách MVD duy nhất trên trang"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Sao chép MVD</span>
          </button>

          <button
            onClick={handleBatchUpGia}
            disabled={actionLoading}
            className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold flex items-center gap-1 shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>UP GIÁ</span>
          </button>

          <button
            onClick={handleBatchRefreshRows}
            disabled={selectedRowIndices.size === 0 || actionLoading}
            className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center gap-1 shadow-2xs disabled:opacity-40"
          >
            <span>CẬP NHẬT DÒNG</span>
          </button>

          <button
            onClick={() => handleBatchUpdateStatus('1 THAY THẾ')}
            disabled={selectedRowIndices.size === 0 || actionLoading}
            className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold flex items-center gap-1 shadow-2xs disabled:opacity-40"
          >
            <span>1 THAY THẾ</span>
          </button>

          <button
            onClick={() => handleBatchUpdateStatus('2 HỦY')}
            disabled={selectedRowIndices.size === 0 || actionLoading}
            className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center gap-1 shadow-2xs disabled:opacity-40"
          >
            <span>HỦY</span>
          </button>

          <button
            onClick={() => handleBatchUpdateStatus('3 HÊT HÀNG')}
            disabled={selectedRowIndices.size === 0 || actionLoading}
            className="px-2.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold flex items-center gap-1 shadow-2xs disabled:opacity-40"
          >
            <span>HẾT HÀNG</span>
          </button>

          <button
            onClick={() => handleBatchUpdateStatus('4 MAI GỌI')}
            disabled={selectedRowIndices.size === 0 || actionLoading}
            className="px-2.5 py-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold flex items-center gap-1 shadow-2xs disabled:opacity-40"
          >
            <span>MAI GỌI</span>
          </button>

          <button
            onClick={() => handleBatchUpdateStatus('')}
            disabled={selectedRowIndices.size === 0 || actionLoading}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1 shadow-2xs disabled:opacity-40"
          >
            <span>BỎ TRẠNG THÁI</span>
          </button>

          {/* Upload Excel Button */}
          <label className="cursor-pointer">
            <div className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-2xs transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Tải Excel</span>
            </div>
            <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-[420px]">
        <div className="overflow-x-auto flex-1 min-h-[380px] max-h-[calc(100vh-235px)] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0 z-20 select-none shadow-2xs">
              <tr>
                {isColumnVisible('donhang', 'checkbox') && (
                  <th
                    className="px-3 py-2.5 text-center sticky left-0 bg-slate-100 z-30"
                    style={{ width: '44px', minWidth: '44px', maxWidth: '44px' }}
                  >
                    <input
                      type="checkbox"
                      checked={isAllCurrentPageSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeCurrentPageSelected;
                      }}
                      onChange={toggleSelectAllCurrentPage}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </th>
                )}
                <ResizableTh moduleId="donhang" columnKey="ngay" defaultWidth={100} align="center">Ngày</ResizableTh>
                <ResizableTh moduleId="donhang" columnKey="san" defaultWidth={80} align="center">Sàn</ResizableTh>
                <ResizableTh moduleId="donhang" columnKey="khung_h" defaultWidth={80} align="center">Khung H</ResizableTh>
                <ResizableTh moduleId="donhang" columnKey="ma_gian" defaultWidth={110} align="center">Mã gian</ResizableTh>
                <ResizableTh moduleId="donhang" columnKey="mvd" defaultWidth={150} align="left">MVD</ResizableTh>
                <ResizableTh moduleId="donhang" columnKey="mdh" defaultWidth={150} align="left">MDH</ResizableTh>
                <ResizableTh moduleId="donhang" columnKey="check_trung" defaultWidth={96} align="center">Check trùng</ResizableTh>
                <ResizableTh moduleId="donhang" columnKey="sku_shop_up" defaultWidth={150} align="left">SKU Shop Up</ResizableTh>
                <ResizableTh moduleId="donhang" columnKey="so_luong" defaultWidth={80} align="right">Số lượng</ResizableTh>
                <ResizableTh moduleId="donhang" columnKey="id_sp" defaultWidth={96} align="center">ID SP</ResizableTh>
                <ResizableTh moduleId="donhang" columnKey="id_sp_ct" defaultWidth={190} align="left">ID SP CT</ResizableTh>
                <ResizableTh moduleId="donhang" columnKey="ten_sp" defaultWidth={220} align="left">Tên SP</ResizableTh>
                <ResizableTh moduleId="donhang" columnKey="slg_xuat" defaultWidth={80} align="right">SL Xuất</ResizableTh>
                <ResizableTh moduleId="donhang" columnKey="don_gia_1" defaultWidth={110} align="right">Đơn giá</ResizableTh>
                <ResizableTh moduleId="donhang" columnKey="trang_thai" defaultWidth={130} align="center">Trạng thái</ResizableTh>
                <ResizableTh moduleId="donhang" columnKey="ghi_chu" defaultWidth={160} align="left">Ghi chú</ResizableTh>
                {!isKinhDoanh && (
                  <ResizableTh moduleId="donhang" columnKey="thao_tac" defaultWidth={160} align="center">Thao tác</ResizableTh>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={18} className="text-center py-12 text-slate-400">
                    Không tìm thấy dữ liệu đơn hàng chi tiết phù hợp
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const isSelected = selectedRowIndices.has(item.rowIndex);
                  const isDuplicate =
                    (item.mvd && mvdDupMap[item.mvd]?.size > 1) || (item.mdh && mdhDupMap[item.mdh]?.size > 1);

                  // Quick SKU con suggestions for missing SKU
                  const missingSku = !item.id_sp_ct || item.id_sp_ct === '-';
                  const skuSuggestions = missingSku && item.id_sp
                    ? sanphamData
                        .filter(
                          (s) =>
                            (s.id_sp || '').toLowerCase() === item.id_sp.toLowerCase() &&
                            (s.sku_con || '').length > 5
                        )
                        .slice(0, 3)
                    : [];

                  return (
                    <tr
                      key={item.rowIndex}
                      onDoubleClick={() => handleOpenDrawer(item)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/60' : ''
                      }`}
                      title="Nhấn đúp để xem & sửa chi tiết"
                    >
                      {/* Checkbox */}
                      {isColumnVisible('donhang', 'checkbox') && (
                        <td
                          className="px-3 py-2 text-center sticky left-0 bg-white z-10"
                          style={{ width: '44px', minWidth: '44px', maxWidth: '44px' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRowSelection(item.rowIndex)}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                      )}

                      {/* Ngày */}
                      <td
                        className="px-3 py-2 text-center text-slate-700 whitespace-nowrap font-medium overflow-hidden text-ellipsis"
                        style={colStyle('ngay', 100)}
                      >
                        {formatYmdToDmy(item.ngay) || item.ngay}
                      </td>

                      {/* Sàn */}
                      <td
                        className="px-3 py-2 text-center font-bold text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('san', 80)}
                      >
                        {item.san}
                      </td>

                      {/* Khung H */}
                      <td
                        className="px-3 py-2 text-center text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('khung_h', 80)}
                      >
                        {item.khung_h}
                      </td>

                      {/* Mã gian */}
                      <td
                        className="px-3 py-2 text-center font-semibold text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('ma_gian', 110)}
                      >
                        {item.ma_gian}
                      </td>

                      {/* MVD */}
                      <td
                        className="px-3 py-2 text-left font-bold text-slate-900 font-mono whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('mvd', 150)}
                        title={item.mvd}
                      >
                        {item.mvd || '-'}
                      </td>

                      {/* MDH */}
                      <td
                        className="px-3 py-2 text-left font-bold text-blue-600 font-mono whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('mdh', 150)}
                        title={item.mdh}
                      >
                        {item.mdh || '-'}
                      </td>

                      {/* Check trùng */}
                      <td
                        className="px-3 py-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('check_trung', 96)}
                      >
                        {isDuplicate ? (
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[10px]">
                            TRÙNG
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* SKU Shop Up */}
                      <td
                        className="px-3 py-2 text-left text-slate-500 font-mono text-[11px] whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('sku_shop_up', 150)}
                        title={item.sku_shop_up}
                      >
                        {item.sku_shop_up || '-'}
                      </td>

                      {/* Số lượng */}
                      <td
                        className="px-3 py-2 text-right font-mono tabular-nums font-semibold text-slate-800 overflow-hidden text-ellipsis"
                        style={colStyle('so_luong', 80)}
                      >
                        {item.so_luong}
                      </td>

                      {/* ID SP */}
                      <td
                        className="px-3 py-2 text-center font-mono text-slate-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('id_sp', 96)}
                      >
                        {item.id_sp || '-'}
                      </td>

                      {/* ID SP CT (Inline Edit + Suggestions + Quick pills) */}
                      <td
                        className="px-3 py-2 relative text-left"
                        style={colStyle('id_sp_ct', 190)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative">
                          <input
                            type="text"
                            defaultValue={item.id_sp_ct || ''}
                            onFocus={() => setActiveSuggestionRow(item.rowIndex)}
                            onBlur={() => setTimeout(() => setActiveSuggestionRow(null), 250)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveInlineSkuCon(item, e.target.value);
                              }
                            }}
                            onBlurCapture={(e) => {
                              if (e.target.value !== (item.id_sp_ct || '')) {
                                handleSaveInlineSkuCon(item, e.target.value);
                              }
                            }}
                            placeholder="Nhập SKU con..."
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-bold text-blue-600 outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                          />

                          {/* Autocomplete Suggestions Popup */}
                          {activeSuggestionRow === item.rowIndex && (
                            <div className="absolute left-0 top-full mt-1 w-72 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-1 text-xs">
                              {sanphamData
                                .filter((s) => {
                                  if (item.id_sp && (s.id_sp || '').toLowerCase().startsWith(item.id_sp.toLowerCase())) {
                                    return true;
                                  }
                                  return (s.sku_con || '').toLowerCase().includes((item.id_sp_ct || '').toLowerCase());
                                })
                                .slice(0, 15)
                                .map((sp) => (
                                  <button
                                    key={sp.sku_con}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleSaveInlineSkuCon(item, sp.sku_con);
                                    }}
                                    className="w-full text-left px-2 py-1.5 hover:bg-blue-50 rounded flex flex-col transition-colors"
                                  >
                                    <span className="font-bold text-blue-700">{sp.sku_con}</span>
                                    <span className="text-[10px] text-slate-500 truncate">{sp.ten_sp}</span>
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>

                        {/* Quick Add Pill Suggestions for missing SKU */}
                        {skuSuggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {skuSuggestions.map((sp) => (
                              <button
                                key={sp.sku_con}
                                type="button"
                                onClick={() => handleSaveInlineSkuCon(item, sp.sku_con)}
                                className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded text-[10px] font-bold hover:bg-blue-100 transition-colors"
                              >
                                + {sp.sku_con}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Tên SP */}
                      <td
                        className="px-3 py-2 text-left text-slate-700 overflow-hidden text-ellipsis truncate"
                        style={colStyle('ten_sp', 220)}
                        title={item.ten_sp}
                      >
                        {item.ten_sp || '-'}
                      </td>

                      {/* SL Xuất */}
                      <td
                        className="px-3 py-2 text-right font-mono tabular-nums font-bold text-emerald-700 overflow-hidden text-ellipsis"
                        style={colStyle('slg_xuat', 80)}
                      >
                        {item.slg_xuat === 0 ? '0' : item.slg_xuat || '-'}
                      </td>

                      {/* Đơn giá */}
                      <td
                        className="px-3 py-2 text-right font-mono tabular-nums font-semibold text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('don_gia_1', 110)}
                      >
                        {item.don_gia_1 ? item.don_gia_1.toLocaleString('vi-VN') : '-'}
                      </td>

                      {/* Trạng thái */}
                      <td
                        className="px-3 py-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('trang_thai', 130)}
                      >
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold inline-block ${
                            item.trang_thai === '1 THAY THẾ'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : item.trang_thai === '2 HỦY' || item.trang_thai?.includes('HỦY')
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : item.trang_thai === '3 HÊT HÀNG' || item.trang_thai?.includes('HẾT HÀNG')
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : item.trang_thai === '4 MAI GỌI'
                              ? 'bg-sky-100 text-sky-700 border border-sky-200'
                              : item.trang_thai
                              ? 'bg-slate-100 text-slate-700 border border-slate-200'
                              : 'text-slate-300'
                          }`}
                        >
                          {item.trang_thai || '-'}
                        </span>
                      </td>

                      {/* Ghi chú */}
                      <td
                        className="px-3 py-2 text-left text-slate-500 italic overflow-hidden text-ellipsis truncate"
                        style={colStyle('ghi_chu', 160)}
                        title={item.ghi_chu}
                      >
                        {item.ghi_chu || '-'}
                      </td>

                      {/* Row Action Buttons */}
                      {!isKinhDoanh && (
                        <td
                          className="px-3 py-2 whitespace-nowrap text-center overflow-hidden text-ellipsis"
                          style={colStyle('thao_tac', 160)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleQuickRowStatus(item, '1 THAY THẾ')}
                              className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                              title="Đổi thành 1 THAY THẾ"
                            >
                              THAY THẾ
                            </button>
                            <button
                              onClick={() => handleQuickRowStatus(item, '2 HỦY')}
                              className="px-1.5 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200"
                              title="Hủy đơn nhanh (SL Xuất = 0)"
                            >
                              HỦY
                            </button>
                            <button
                              onClick={() => handleQuickRowStatus(item, '3 HÊT HÀNG')}
                              className="px-1.5 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200"
                              title="Đổi thành HẾT HÀNG"
                            >
                              HẾT HÀNG
                            </button>
                            <button
                              onClick={() => handleQuickRowStatus(item, '4 MAI GỌI')}
                              className="px-1.5 py-0.5 text-[10px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200"
                              title="Đổi thành MAI GỌI"
                            >
                              MAI GỌI
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Pagination rendered in Bottom Footer right next to copyright */}
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

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedRowIndices.size}
        totalCount={filteredData.length}
        onClearSelection={() => setSelectedRowIndices(new Set())}
        actions={[
          {
            label: 'CẬP NHẬT DÒNG',
            onClick: handleBatchRefreshRows,
            disabled: actionLoading,
            variant: 'primary',
          },
          {
            label: '1 THAY THẾ',
            onClick: () => handleBatchUpdateStatus('1 THAY THẾ'),
            disabled: actionLoading,
            variant: 'emerald',
          },
          {
            label: 'HỦY',
            onClick: () => handleBatchUpdateStatus('2 HỦY'),
            disabled: actionLoading,
            variant: 'danger',
          },
          {
            label: 'HẾT HÀNG',
            onClick: () => handleBatchUpdateStatus('3 HÊT HÀNG'),
            disabled: actionLoading,
            variant: 'warning',
          },
          {
            label: 'MAI GỌI',
            onClick: () => handleBatchUpdateStatus('4 MAI GỌI'),
            disabled: actionLoading,
            variant: 'primary',
          },
          {
            label: 'BỎ TRẠNG THÁI',
            onClick: () => handleBatchUpdateStatus(''),
            disabled: actionLoading,
            variant: 'secondary',
          },
        ]}
      />

      {/* Edit Drawer Modal */}
      {drawerOpen && drawerItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col p-4 space-y-4 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Chi tiết đơn UD_CT</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Row ID: {drawerItem.rowIndex} · MVD: {drawerItem.mvd || '-'}
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã đơn hàng (MDH):</span>
                <strong className="text-blue-600 font-mono">{drawerItem.mdh}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gian hàng:</span>
                <span className="font-bold text-slate-800">{drawerItem.ma_gian}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tên sản phẩm:</span>
                <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]" title={drawerItem.ten_sp}>
                  {drawerItem.ten_sp || 'Chưa có tên'}
                </span>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-3 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số lượng</label>
                  <input
                    type="number"
                    disabled={isKinhDoanh}
                    value={editFormData.so_luong}
                    onChange={(e) => handleDrawerFieldChange('so_luong', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-bold focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn giá</label>
                  <input
                    type="number"
                    disabled={isKinhDoanh}
                    value={editFormData.don_gia_1}
                    onChange={(e) => handleDrawerFieldChange('don_gia_1', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-bold focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ID SP (Mã cha)</label>
                  <input
                    type="text"
                    disabled={isKinhDoanh}
                    value={editFormData.id_sp}
                    onChange={(e) => handleDrawerFieldChange('id_sp', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-bold focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ID SP CT (SKU Con)</label>
                  <input
                    type="text"
                    disabled={isKinhDoanh}
                    value={editFormData.id_sp_ct}
                    onChange={(e) => handleDrawerFieldChange('id_sp_ct', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-blue-600 focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* SKU con suggestions pills inside drawer */}
              {editFormData.id_sp && !isKinhDoanh && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold">Gợi ý SKU con theo mã cha:</span>
                  <div className="flex flex-wrap gap-1">
                    {sanphamData
                      .filter(
                        (s) =>
                          (s.id_sp || '').toLowerCase() === editFormData.id_sp.toLowerCase() &&
                          (s.sku_con || '').length > 5
                      )
                      .slice(0, 8)
                      .map((s) => (
                        <button
                          key={s.sku_con}
                          type="button"
                          onClick={() => handleDrawerFieldChange('id_sp_ct', s.sku_con)}
                          className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-bold hover:bg-blue-100"
                        >
                          {s.sku_con}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Trạng thái quick toggle buttons */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Trạng thái xử lý</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { val: '', label: 'Để trống' },
                    { val: '1 THAY THẾ', label: '1 THAY THẾ' },
                    { val: '2 HỦY', label: '2 HỦY' },
                    { val: '3 HÊT HÀNG', label: '3 HÊT HÀNG' },
                    { val: '4 MAI GỌI', label: '4 MAI GỌI' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      disabled={isKinhDoanh}
                      onClick={() => handleDrawerFieldChange('trang_thai', opt.val)}
                      className={`px-2.5 py-1.5 rounded-lg font-bold border transition-all text-left ${
                        editFormData.trang_thai === opt.val
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú đơn hàng</label>
                <textarea
                  rows={3}
                  value={editFormData.ghi_chu}
                  onChange={(e) => handleDrawerFieldChange('ghi_chu', e.target.value)}
                  placeholder="Nhập ghi chú cho đơn hàng..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold"
              >
                Đóng
              </button>
              <button
                onClick={() => handleSaveDrawer(false)}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
