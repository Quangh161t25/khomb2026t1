import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CONFIG } from '../config/config';
import {
  fetchSheetData,
  appendSheetData,
  batchUpdateSheetValues,
  deleteSheetRow,
} from '../services/googleSheetsApi';
import { exportToExcel } from '../services/excelExport';
import { toYMD, formatYmdToDmy, formatDateTimeNow } from '../utils/dateUtils';
import { matchMultiKeyword } from '../utils/searchUtils';

import HangHoanFilter from '../components/hanghoan/HangHoanFilter';
import HangHoanTable from '../components/hanghoan/HangHoanTable';
import HangHoanCardList from '../components/hanghoan/HangHoanCardList';
import HangHoanDrawer from '../components/hanghoan/HangHoanDrawer';
import ImagePreviewModal from '../components/common/ImagePreviewModal';
import QRScannerModal from '../components/common/QRScannerModal';

export default function HangHoanPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState([]);
  const [sanphamData, setSanphamData] = useState([]);
  const [udctData, setUdctData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const todayStr = toYMD(new Date());
  const [filters, setFilters] = useState({
    from: todayStr,
    to: todayStr,
    kho: '',
    maGian: '',
    trangThai: '',
    search: '',
  });

  // View Mode: 'card' on mobile by default, 'table' on desktop
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('hh_view_mode');
    if (saved) return saved;
    return window.innerWidth < 768 ? 'card' : 'table';
  });

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('edit'); // 'create' | 'edit'
  const [selectedItem, setSelectedItem] = useState(null);

  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState('');

  const [scannerOpen, setScannerOpen] = useState(false);
  const [continuousScanOpen, setContinuousScanOpen] = useState(false);
  const [drawerScanCallback, setDrawerScanCallback] = useState(null);

  const setViewModeAndSave = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('hh_view_mode', mode);
    } catch (e) {}
  };

  // Load All Required Data (HH_BH, DS_SP, UD_CT)
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Load Hang Hoan
      const rows = await fetchSheetData(`${CONFIG.hhbhSheetName}!A:Z`);
      if (rows && rows.length > 1) {
        const parsed = rows.slice(1).map((row, idx) => ({
          rowIndex: idx + 2,
          id: row[0] || '',
          ngay_nhan: toYMD(row[1] || ''),
          mvd: row[2] || '',
          mvd_2: row[3] || '',
          ma_gian: row[4] || '',
          anh_1: row[5] || '',
          anh_2: row[6] || '',
          anh_3: row[7] || '',
          ngay_xly: row[8] || '',
          sku: row[9] || '',
          sku_ct: row[10] || '',
          slg: row[11] || '',
          ten_sp: row[12] || '',
          ghi_chu: row[13] || '',
          tinh_trang: row[14] || '',
          trang_thai: row[15] || '',
          sku_slg: row[16] || '',
          id_nv: row[17] || '',
          udt: row[18] || '',
          mvd_gian: row[19] || '',
          kho: row[20] || '',
          lb3: row[21] || '',
          id_dh: row[22] || '',
          id_dh_ct: row[23] || '',
          stt: row[24] || '',
          danh_dau: row[25] || '',
        })).sort((a, b) => b.rowIndex - a.rowIndex);
        setData(parsed);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error('Error loading Hang Hoan data:', err);
      showToast('Lỗi khi tải dữ liệu Hàng hoàn: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Lazy Load DS_SP when opening drawer or suggestions
  const ensureSanphamData = useCallback(async () => {
    if (sanphamData.length > 0) return sanphamData;
    try {
      const spRows = await fetchSheetData(CONFIG.sanphamSheetName);
      if (spRows && spRows.length > 1) {
        const parsedSp = spRows.slice(1).map((row) => ({
          id_sp: (row[0] || '').toString().trim(),
          sku_con: (row[1] || '').toString().trim(),
          ten_sp: (row[2] || '').toString().trim(),
          ten: (row[2] || '').toString().trim(),
        }));
        setSanphamData(parsedSp);
        return parsedSp;
      }
    } catch (e) {
      console.error('Lazy load DS_SP error:', e);
    }
    return [];
  }, [sanphamData.length]);

  // Lazy Load UD_CT when needed for search or auto-match
  const ensureUdctData = useCallback(async () => {
    if (udctData.length > 0) return udctData;
    try {
      const udctRows = await fetchSheetData(CONFIG.udctSheetName, 'A1:H20000');
      if (udctRows && udctRows.length > 1) {
        const parsedUdct = udctRows.slice(1).map((row) => ({
          ngay: (row[0] || '').toString().trim(),
          mdh: (row[1] || '').toString().trim(),
          mvd: (row[2] || '').toString().trim(),
          ma_gian: (row[3] || '').toString().trim(),
          id_sp: (row[4] || '').toString().trim(),
          id_sp_ct: (row[5] || '').toString().trim(),
          slg_xuat: (row[6] || '').toString().trim(),
          ten_sp: (row[7] || '').toString().trim(),
        }));
        setUdctData(parsedUdct);
        return parsedUdct;
      }
    } catch (e) {
      console.error('Lazy load UD_CT error:', e);
    }
    return [];
  }, [udctData.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute Distinct Values for Filters
  const khoList = useMemo(() => {
    return [...new Set(data.map((i) => i.kho).filter(Boolean))].sort();
  }, [data]);

  const maGianList = useMemo(() => {
    return [...new Set(data.map((i) => i.ma_gian).filter(Boolean))].sort();
  }, [data]);

  // Compute SKU Tong Map
  const skuTongMap = useMemo(() => {
    const byMvd = new Map();
    data.forEach((item) => {
      const mvd = (item.mvd || '').toString().trim();
      const ngay = (item.ngay_nhan || '').toString().trim();
      if (!mvd || !ngay) return;

      const key = `${ngay}|${mvd}`;
      if (!byMvd.has(key)) {
        byMvd.set(key, { ma_gian: '', skuMap: new Map() });
      }
      const bucket = byMvd.get(key);
      if (!bucket.ma_gian && item.ma_gian) bucket.ma_gian = (item.ma_gian || '').toString().trim();

      const skuVal = (item.sku || '').toString().trim();
      if (!skuVal) return;
      const slgVal = parseFloat(item.slg) || 0;
      
      const currentSlg = bucket.skuMap.get(skuVal) || 0;
      bucket.skuMap.set(skuVal, currentSlg + slgVal);
    });

    const result = new Map();
    byMvd.forEach((bucket, key) => {
      const items = [];
      bucket.skuMap.forEach((qty, sku) => {
        items.push(`${sku} x ${qty}`);
      });
      const skuTong = items.join(' + ');
      result.set(key, { ma_gian: bucket.ma_gian || '', skuTong });
    });
    return result;
  }, [data]);

  // Filtered Data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const ngay = toYMD(item.ngay_nhan);
      if (filters.from && ngay < filters.from) return false;
      if (filters.to && ngay > filters.to) return false;
      if (filters.kho && item.kho !== filters.kho) return false;
      if (filters.maGian && item.ma_gian !== filters.maGian) return false;

      if (filters.trangThai) {
        const itemTt = (item.trang_thai || '').toLowerCase().trim();
        const fTt = filters.trangThai.toLowerCase().trim();
        if (fTt === 'hoàn' || fTt === 'hoan') {
          if (itemTt !== 'hoàn' && itemTt !== 'hoan' && itemTt !== '') return false;
        } else if (fTt === 'trả' || fTt === 'tra') {
          if (itemTt !== 'trả' && itemTt !== 'tra') return false;
        } else if (itemTt !== fTt) {
          return false;
        }
      }

      if (filters.search) {
        const searchable = `${item.mvd || ''} ${item.mvd_2 || ''} ${item.ma_gian || ''} ${item.sku || ''} ${item.sku_ct || ''} ${item.ten_sp || ''} ${item.tinh_trang || ''} ${item.trang_thai || ''} ${item.id_dh || ''}`;
        if (!matchMultiKeyword(searchable, filters.search)) return false;
      }

      return true;
    }).sort((a, b) => toYMD(b.ngay_nhan).localeCompare(toYMD(a.ngay_nhan)));
  }, [data, filters]);

  // Row Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Handle Detail Open
  const handleOpenDetail = (item) => {
    ensureSanphamData();
    ensureUdctData();
    setSelectedItem(item);
    setDrawerMode('edit');
    setIsDrawerOpen(true);
  };

  const handleOpenCreate = () => {
    if (user?.role === 'kinhdoanh') {
      showToast('Tài khoản KINHDOANH không được thêm mới Dữ liệu Hàng hoàn.', 'warning');
      return;
    }
    ensureSanphamData();
    ensureUdctData();
    setSelectedItem({
      ngay_nhan: filters.to || filters.from || todayStr,
      mvd: '',
      mvd_2: '',
      ma_gian: '',
      anh_1: '',
      anh_2: '',
      anh_3: '',
      sku: '',
      sku_ct: '',
      slg: '1',
      tinh_trang: '',
      trang_thai: 'Hoàn',
      ten_sp: '',
      kho: 'KHO',
      id_dh: '',
      ghi_chu: '',
    });
    setDrawerMode('create');
    setIsDrawerOpen(true);
  };

  const handleCopy = (item) => {
    if (user?.role === 'kinhdoanh') {
      showToast('Tài khoản KINHDOANH không được sao chép Dữ liệu Hàng hoàn.', 'warning');
      return;
    }
    setSelectedItem({
      ...item,
      id: '',
      rowIndex: null,
      sku: '',
      sku_ct: '',
      ghi_chu: '',
    });
    setDrawerMode('create');
    showToast('Đã sao chép dữ liệu hàng hoàn. SKU CT được để trống.', 'info');
  };

  // Handle Save (Create or Edit)
  const handleSave = async (formData) => {
    const isKinhDoanh = user?.role === 'kinhdoanh';
    const nowStr = formatDateTimeNow();
    const editorName = user?.name ? `${user.name} (${user.id})` : user?.id || 'User';

    if (drawerMode === 'create') {
      if (isKinhDoanh) {
        showToast('Tài khoản KINHDOANH không được thêm mới.', 'error');
        return;
      }
      const initGhiChu = `[${nowStr} - ${editorName}] Tạo mới`;
      const newRow = [
        `${Date.now()}`,
        formData.ngay_nhan || todayStr,
        (formData.mvd || '').trim(),
        (formData.mvd_2 || '').trim(),
        (formData.ma_gian || '').trim(),
        formData.anh_1 || '',
        formData.anh_2 || '',
        formData.anh_3 || '',
        '', // anh_4
        (formData.sku || '').trim(),
        (formData.sku_ct || '').trim(),
        formData.slg || '1',
        (formData.ten_sp || '').trim(),
        initGhiChu,
        (formData.tinh_trang || '').trim(),
        formData.trang_thai || 'Hoàn',
        '', // sku_slg
        editorName,
        nowStr,
        formData.mvd && formData.ma_gian ? `${formData.mvd}-${formData.ma_gian}` : '',
        formData.kho || 'KHO',
        '', // lb3
        (formData.id_dh || '').trim(),
        '', // id_dh_ct
        '', // stt
        '', // danh_dau
      ];

      try {
        await appendSheetData(`${CONFIG.hhbhSheetName}!A:A`, [newRow]);
        showToast('Đã thêm mới Hàng hoàn thành công!', 'success');
        setIsDrawerOpen(false);
        loadData();
      } catch (err) {
        console.error('Error adding Hang Hoan:', err);
        showToast('Lỗi khi thêm mới: ' + err.message, 'error');
      }
    } else {
      // Edit mode
      const rowIndex = selectedItem.rowIndex;
      if (!rowIndex) {
        showToast('Không tìm thấy chỉ số hàng để cập nhật.', 'error');
        return;
      }

      if (isKinhDoanh) {
        // Only update MVD 2 and MDH
        const oldMvd2 = (selectedItem.mvd_2 || '').trim();
        const oldMdh = (selectedItem.id_dh || '').trim();
        const mvd2 = (formData.mvd_2 || '').trim();
        const mdh = (formData.id_dh || '').trim();

        const diffs = [];
        if (mvd2 !== oldMvd2) diffs.push(`MVD 2: "${oldMvd2}" ➔ "${mvd2}"`);
        if (mdh !== oldMdh) diffs.push(`MDH: "${oldMdh}" ➔ "${mdh}"`);

        let newGhiChu = selectedItem.ghi_chu || '';
        if (diffs.length > 0) {
          const logEntry = `[${nowStr} - ${editorName}] Sửa: ${diffs.join(', ')}`;
          newGhiChu = newGhiChu.trim() ? `${logEntry}\n${newGhiChu.trim()}` : logEntry;
        }

        try {
          await batchUpdateSheetValues([
            { range: `${CONFIG.hhbhSheetName}!D${rowIndex}`, values: [[mvd2]] },
            { range: `${CONFIG.hhbhSheetName}!N${rowIndex}`, values: [[newGhiChu]] },
            { range: `${CONFIG.hhbhSheetName}!R${rowIndex}`, values: [[editorName]] },
            { range: `${CONFIG.hhbhSheetName}!S${rowIndex}`, values: [[nowStr]] },
            { range: `${CONFIG.hhbhSheetName}!W${rowIndex}`, values: [[mdh]] },
          ]);
          showToast('Đã lưu MVD 2 & MDH thành công!', 'success');
          setIsDrawerOpen(false);
          loadData();
        } catch (err) {
          console.error('Error updating MVD 2:', err);
          showToast('Lỗi khi cập nhật MVD 2: ' + err.message, 'error');
        }
        return;
      }

      // Full Edit for other roles
      const diffs = [];
      if (formData.ngay_nhan !== selectedItem.ngay_nhan) diffs.push(`Ngày nhận: "${selectedItem.ngay_nhan}" ➔ "${formData.ngay_nhan}"`);
      if (formData.mvd !== selectedItem.mvd) diffs.push(`MVD: "${selectedItem.mvd}" ➔ "${formData.mvd}"`);
      if (formData.mvd_2 !== selectedItem.mvd_2) diffs.push(`MVD 2: "${selectedItem.mvd_2}" ➔ "${formData.mvd_2}"`);
      if (formData.ma_gian !== selectedItem.ma_gian) diffs.push(`Mã gian: "${selectedItem.ma_gian}" ➔ "${formData.ma_gian}"`);
      if (formData.sku !== selectedItem.sku) diffs.push(`SKU: "${selectedItem.sku}" ➔ "${formData.sku}"`);
      if (formData.sku_ct !== selectedItem.sku_ct) diffs.push(`SKU CT: "${selectedItem.sku_ct}" ➔ "${formData.sku_ct}"`);
      if (formData.slg !== selectedItem.slg) diffs.push(`SLG: "${selectedItem.slg}" ➔ "${formData.slg}"`);
      if (formData.tinh_trang !== selectedItem.tinh_trang) diffs.push(`Tình trạng: "${selectedItem.tinh_trang}" ➔ "${formData.tinh_trang}"`);
      if (formData.trang_thai !== selectedItem.trang_thai) diffs.push(`Trạng thái: "${selectedItem.trang_thai}" ➔ "${formData.trang_thai}"`);
      if (formData.ten_sp !== selectedItem.ten_sp) diffs.push(`Tên SP: "${selectedItem.ten_sp}" ➔ "${formData.ten_sp}"`);
      if (formData.kho !== selectedItem.kho) diffs.push(`Kho: "${selectedItem.kho}" ➔ "${formData.kho}"`);
      if (formData.id_dh !== selectedItem.id_dh) diffs.push(`MDH: "${selectedItem.id_dh}" ➔ "${formData.id_dh}"`);
      if (formData.anh_1 !== selectedItem.anh_1 || formData.anh_2 !== selectedItem.anh_2 || formData.anh_3 !== selectedItem.anh_3) {
        diffs.push('Ảnh: Cập nhật ảnh');
      }

      let newGhiChu = selectedItem.ghi_chu || '';
      if (diffs.length > 0) {
        const logEntry = `[${nowStr} - ${editorName}] Sửa: ${diffs.join(', ')}`;
        newGhiChu = newGhiChu.trim() ? `${logEntry}\n${newGhiChu.trim()}` : logEntry;
      }

      const updates = [
        { range: `${CONFIG.hhbhSheetName}!B${rowIndex}`, values: [[formData.ngay_nhan]] },
        { range: `${CONFIG.hhbhSheetName}!C${rowIndex}`, values: [[formData.mvd]] },
        { range: `${CONFIG.hhbhSheetName}!D${rowIndex}`, values: [[formData.mvd_2]] },
        { range: `${CONFIG.hhbhSheetName}!E${rowIndex}`, values: [[formData.ma_gian]] },
        { range: `${CONFIG.hhbhSheetName}!F${rowIndex}`, values: [[formData.anh_1]] },
        { range: `${CONFIG.hhbhSheetName}!G${rowIndex}`, values: [[formData.anh_2]] },
        { range: `${CONFIG.hhbhSheetName}!H${rowIndex}`, values: [[formData.anh_3]] },
        { range: `${CONFIG.hhbhSheetName}!J${rowIndex}`, values: [[formData.sku]] },
        { range: `${CONFIG.hhbhSheetName}!K${rowIndex}`, values: [[formData.sku_ct]] },
        { range: `${CONFIG.hhbhSheetName}!L${rowIndex}`, values: [[formData.slg]] },
        { range: `${CONFIG.hhbhSheetName}!M${rowIndex}`, values: [[formData.ten_sp]] },
        { range: `${CONFIG.hhbhSheetName}!N${rowIndex}`, values: [[newGhiChu]] },
        { range: `${CONFIG.hhbhSheetName}!O${rowIndex}`, values: [[formData.tinh_trang]] },
        { range: `${CONFIG.hhbhSheetName}!P${rowIndex}`, values: [[formData.trang_thai]] },
        { range: `${CONFIG.hhbhSheetName}!R${rowIndex}`, values: [[editorName]] },
        { range: `${CONFIG.hhbhSheetName}!S${rowIndex}`, values: [[nowStr]] },
        { range: `${CONFIG.hhbhSheetName}!T${rowIndex}`, values: [[(formData.mvd && formData.ma_gian) ? `${formData.mvd}-${formData.ma_gian}` : '']] },
        { range: `${CONFIG.hhbhSheetName}!U${rowIndex}`, values: [[formData.kho]] },
        { range: `${CONFIG.hhbhSheetName}!W${rowIndex}`, values: [[formData.id_dh]] },
      ];

      try {
        await batchUpdateSheetValues(updates);
        showToast('Đã lưu thay đổi thành công!', 'success');
        setIsDrawerOpen(false);
        loadData();
      } catch (err) {
        console.error('Error updating Hang Hoan:', err);
        showToast('Lỗi khi lưu thay đổi: ' + err.message, 'error');
      }
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!selectedItem || !selectedItem.rowIndex) return;
    if (user?.role === 'kinhdoanh') {
      showToast('Tài khoản KINHDOANH không có quyền xóa.', 'error');
      return;
    }
    const confirmMsg = `Bạn có chắc chắn muốn xóa dòng Hàng hoàn này?\n- MVD: ${selectedItem.mvd || selectedItem.mvd_2 || '-'}\n- SKU CT: ${selectedItem.sku_ct || '-'}\n- Số lượng: ${selectedItem.slg || '1'}`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteSheetRow(CONFIG.hhbhSheetName, selectedItem.rowIndex);
      showToast('Đã xóa dòng Hàng hoàn thành công!', 'success');
      setIsDrawerOpen(false);
      loadData();
    } catch (err) {
      console.error('Error deleting Hang Hoan row:', err);
      showToast('Lỗi khi xóa: ' + err.message, 'error');
    }
  };

  // Quick Append via Continuous Scanner
  const handleQuickAppendMvd = async (mvdRaw) => {
    const mvd = (mvdRaw || '').toString().trim();
    if (!mvd) return;

    const udctMatch = udctData.find((item) => (item.mvd || '').toString().trim() === mvd);
    let hoanTraVal = udctMatch ? 'Hoàn' : 'Trả';
    let maGian = udctMatch ? (udctMatch.ma_gian || '').toString().toUpperCase() : '';
    let skuCt = udctMatch ? (udctMatch.id_sp_ct || '').toString().toUpperCase() : '';
    let sku = udctMatch ? (udctMatch.id_sp || '').toString().toUpperCase() : '';
    let slg = udctMatch ? udctMatch.slg_xuat || '1' : '1';
    let tenSp = udctMatch ? udctMatch.ten_sp || '' : '';
    let mdh = udctMatch ? (udctMatch.mdh || '').toString().trim() : '';

    if (skuCt && sanphamData.length) {
      const matchedSp = sanphamData.find((i) => (i.sku_con || '').toString().trim().toUpperCase() === skuCt);
      if (matchedSp) {
        sku = matchedSp.id_sp || matchedSp.sku_con.substring(0, 4) || sku;
        if (!tenSp) tenSp = matchedSp.ten_sp || matchedSp.ten || '';
      }
    }

    const nowStr = formatDateTimeNow();
    const editorName = user?.name ? `${user.name} (${user.id})` : user?.id || 'User';
    const initGhiChu = `[${nowStr} - ${editorName}] Quét nhanh MVD`;

    const newRow = [
      `${Date.now()}`,
      todayStr,
      mvd,
      '', // mvd_2
      maGian,
      '', '', '', '', // anh 1-4
      sku,
      skuCt,
      slg,
      tenSp,
      initGhiChu,
      '', // tinh_trang
      hoanTraVal,
      '', // sku_slg
      editorName,
      nowStr,
      mvd && maGian ? `${mvd}-${maGian}` : '',
      'KHO',
      '', // lb3
      mdh,
      '', '', '' // dhct, stt, danh_dau
    ];

    try {
      await appendSheetData(`${CONFIG.hhbhSheetName}!A:A`, [newRow]);
      showToast(`Đã thêm MVD: ${mvd}`, 'success');
      loadData();
    } catch (err) {
      console.error('Error quick appending MVD:', err);
      showToast(`Lỗi thêm MVD ${mvd}: ` + err.message, 'error');
    }
  };

  // Helper to get exported data based on selection
  const getExportData = () => {
    if (selectedIds.length === 0) {
      showToast('Vui lòng tích chọn ít nhất 1 dòng để tải Excel!', 'warning');
      return [];
    }
    return filteredData.filter((i) => selectedIds.includes(i.id || i.rowIndex));
  };

  // Excel Export: MVD SKU Tong
  const handleExportSkuTong = () => {
    const dataToExport = getExportData();
    if (!dataToExport.length) return;

    const uniqueKeys = [
      ...new Set(
        dataToExport
          .map((item) => `${(item.ngay_nhan || '').toString().trim()}|${(item.mvd || '').toString().trim()}`)
          .filter((k) => k.split('|')[1])
      ),
    ];

    const headers = ['Ngày nhận', 'MVD', 'MVD 2', 'Mã gian', 'SKU tổng'];
    const rows = uniqueKeys.map((key) => {
      const [ngay, mvd] = key.split('|');
      const info = skuTongMap.get(key) || { ma_gian: '', skuTong: '' };
      const displayNgay = formatYmdToDmy(ngay) || ngay;
      const firstRow = dataToExport.find(
        (item) => (item.ngay_nhan || '').toString().trim() === ngay && (item.mvd || '').toString().trim() === mvd
      ) || {};
      return [displayNgay, mvd, firstRow.mvd_2 || '', info.ma_gian || '', info.skuTong || ''];
    });

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
    exportToExcel(`MVD_SKU_Tong_${filters.to || 'TatCa'}_${timeStr}`, 'MVD_SKU_Tong', headers, rows);
    showToast('Đã xuất Excel SKU Tổng thành công!', 'success');
  };

  // Excel Export: Full HH_BH
  const handleExportFull = () => {
    const dataToExport = getExportData();
    if (!dataToExport.length) return;

    const headers = [
      'Ngày nhận', 'MVD', 'MVD 2', 'Mã gian', 'SKU', 'SKU CT', 'SKU tổng', 'SLG', 'Tên SP',
      'Tình trạng', 'Kho', 'Ảnh 1', 'Ảnh 2', 'Ảnh 3', 'Ngày xử lý', 'Ghi chú', 'Trạng thái',
      'SKU-SLG', 'ID NV', 'UDT', 'MVD-Gian', 'LB3', 'ID ĐH', 'ID ĐH CT', 'STT', 'Đánh dấu'
    ];
    const rows = dataToExport.map((item) => {
      const key = `${(item.ngay_nhan || '').trim()}|${(item.mvd || '').trim()}`;
      const skuTong = skuTongMap.get(key)?.skuTong || '';
      return [
        formatYmdToDmy(item.ngay_nhan) || item.ngay_nhan,
        item.mvd || '',
        item.mvd_2 || '',
        item.ma_gian || '',
        item.sku || '',
        item.sku_ct || '',
        skuTong,
        item.slg || '',
        item.ten_sp || '',
        item.tinh_trang || '',
        item.kho || '',
        item.anh_1 || '',
        item.anh_2 || '',
        item.anh_3 || '',
        item.ngay_xly || '',
        item.ghi_chu || '',
        item.trang_thai || '',
        item.sku_slg || '',
        item.id_nv || '',
        item.udt || '',
        item.mvd_gian || '',
        item.lb3 || '',
        item.id_dh || '',
        item.id_dh_ct || '',
        item.stt || '',
        item.danh_dau || '',
      ];
    });

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
    exportToExcel(`HH_BH_${filters.to || 'TatCa'}_${timeStr}`, 'HH_BH', headers, rows);
    showToast('Đã xuất Excel Hàng Hoàn thành công!', 'success');
  };

  // Excel Export: MISA
  const handleExportMisa = () => {
    const dataToExport = getExportData();
    if (!dataToExport.length) return;
    const headers = [
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

    const formatDateVN = (input) => {
      if (!input) return '';
      const raw = String(input).split(' ')[0];
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const [y, m, d] = raw.split('-');
        return `${d}/${m}/${y}`;
      }
      const dt = new Date(input);
      if (isNaN(dt.getTime())) return '';
      const d = String(dt.getDate()).padStart(2, '0');
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const y = dt.getFullYear();
      return `${d}/${m}/${y}`;
    };

    const formatCertDate = (input) => {
      const vn = formatDateVN(input);
      if (!vn) return '';
      const [d, m, y] = vn.split('/');
      return `${d}${m}${String(y).slice(-2)}`;
    };

    const getMisaValue = (item, colName) => {
      const ngayVN = formatDateVN(item.ngay_nhan);
      const certDate = formatCertDate(item.ngay_nhan);

      if (colName === 'Hiển thị trên sổ') return '0';
      if (colName === 'Hình thức bán hàng') return '0';
      if (colName === 'Phương thức thanh toán') return '0';
      if (colName === 'Kiêm phiếu xuất kho') return '1';
      if (colName === 'Lập kèm hóa đơn') return '0';
      if (colName === 'Đã lập hóa đơn') return '0';
      if (colName === 'Ngày hạch toán (*)' || colName === 'Ngày chứng từ (*)') return ngayVN;
      if (colName === 'Số chứng từ (*)' || colName === 'Số phiếu xuất') return item.mvd ? `HH-${item.mvd}-${certDate}` : '';
      if (colName === 'Lý do xuất') return 'Hàng hoàn';
      if (colName === 'Mã đơn hàng') return item.id_dh || '';
      if (colName === 'Mã thống kê') return item.ma_gian || '';
      if (colName === 'Mã khách hàng') return item.ma_gian || '';
      if (colName === 'Tên khách hàng') return item.ma_gian || '';
      if (colName === 'Diễn giải') return `${item.kho || ''} HÀNG HOÀN NGÀY ${ngayVN}`.trim();
      if (colName === 'Mã hàng (*)') return item.sku_ct || item.sku || '';
      if (colName === 'Tên hàng') return item.ten_sp || '';
      if (colName === 'TK Tiền/Chi phí/Nợ (*)') return '131';
      if (colName === 'TK Doanh thu/Có (*)') return '5111';
      if (colName === 'ĐVT') return 'Cái';
      if (colName === 'Số lượng') return item.slg || '';
      if (colName === 'Kho') return item.kho || '';
      if (colName === 'TK giá vốn') return '632';
      if (colName === 'TK Kho') return '1561';
      return '';
    };

    const rows = dataToExport.map((item) => headers.map((h) => getMisaValue(item, h)));
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
    exportToExcel(`MISA_HH_BH_${filters.to || 'TatCa'}_${timeStr}`, 'MISA', headers, rows);
    showToast('Đã xuất Excel MISA thành công!', 'success');
  };

  return (
    <div className="space-y-4 flex-1 min-h-0 flex flex-col">
      {/* Top Filter & Toolbar */}
      <HangHoanFilter
        filters={filters}
        setFilters={setFilters}
        khoList={khoList}
        maGianList={maGianList}
        viewMode={viewMode}
        setViewMode={setViewModeAndSave}
        totalCount={filteredData.length}
        onOpenCreate={handleOpenCreate}
        onStartScanMvd={() => setContinuousScanOpen(true)}
        onScanFilterQr={() => setScannerOpen(true)}
        onExportSkuTong={handleExportSkuTong}
        onExportFull={handleExportFull}
        onExportMisa={handleExportMisa}
        onReload={loadData}
        loading={loading}
      />

      {/* Main View: Table vs Card List */}
      <div className="flex-1 min-h-0 flex flex-col">
        {viewMode === 'card' ? (
          <HangHoanCardList
            data={filteredData}
            skuTongMap={skuTongMap}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onOpenDetail={handleOpenDetail}
            onOpenImagePreview={setPreviewImage}
            loading={loading}
          />
        ) : (
          <HangHoanTable
            data={filteredData}
            skuTongMap={skuTongMap}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onOpenDetail={handleOpenDetail}
            onOpenImagePreview={setPreviewImage}
            loading={loading}
          />
        )}
      </div>

      {/* Edit / Create Drawer */}
      <HangHoanDrawer
        isOpen={isDrawerOpen}
        mode={drawerMode}
        initialData={selectedItem}
        sanphamData={sanphamData}
        udctData={udctData}
        hangHoanData={data}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        onCopy={handleCopy}
        onOpenImagePreview={setPreviewImage}
        onOpenQrScan={(callback) => setDrawerScanCallback(() => callback)}
      />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={Boolean(previewImage)}
        imageUrl={previewImage}
        onClose={() => setPreviewImage('')}
      />

      {/* QR Scanner for Search */}
      <QRScannerModal
        isOpen={scannerOpen}
        title="Quét MVD / Barcode để tìm kiếm"
        onClose={() => setScannerOpen(false)}
        onScanSuccess={(val) => {
          setFilters((prev) => ({ ...prev, search: val }));
          setScannerOpen(false);
          showToast(`Đã tìm kiếm theo mã: ${val}`, 'info');
        }}
      />

      {/* QR Scanner for Drawer Form */}
      <QRScannerModal
        isOpen={Boolean(drawerScanCallback)}
        title="Quét mã MVD / Barcode"
        onClose={() => setDrawerScanCallback(null)}
        onScanSuccess={(val) => {
          if (drawerScanCallback) drawerScanCallback(val);
          setDrawerScanCallback(null);
        }}
      />

      {/* Continuous Scanner Modal */}
      <QRScannerModal
        isOpen={continuousScanOpen}
        title="Quét liên tục MVD hàng hoàn"
        continuous={true}
        onClose={() => setContinuousScanOpen(false)}
        onScanSuccess={(val) => {
          handleQuickAppendMvd(val);
        }}
      />
    </div>
  );
}
