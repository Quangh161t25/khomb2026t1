import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useColumnWidths } from '../context/ColumnWidthContext';
import ResizableTh from '../components/common/ResizableTh';
import ImagePreviewModal from '../components/common/ImagePreviewModal';
import QRScannerModal from '../components/common/QRScannerModal';
import { CONFIG } from '../config/config';
import {
  fetchSheetData,
  appendSheetData,
  batchUpdateSheetValues,
  deleteSheetRow,
} from '../services/googleSheetsApi';
import { uploadImage } from '../services/imageUploadService';
import { exportToExcel } from '../services/excelExport';
import { toYMD, formatYmdToDmy } from '../utils/dateUtils';
import { matchMultiKeyword } from '../utils/searchUtils';
import { useAutoSync } from '../hooks/useAutoSync';
import Tesseract from 'tesseract.js';
import {
  Search,
  RotateCw,
  Plus,
  Download,
  Calendar,
  ShoppingBag,
  X,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Camera,
  Image as ImageIcon,
  FileSpreadsheet,
  Check,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Upload,
  ScanText,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';

// Helper trích xuất mã tiềm năng từ OCR text
function extractOcrCandidates(rawText) {
  if (!rawText) return [];
  const candidates = new Set();
  const spxMatches = rawText.match(/SPX[A-Z0-9]{8,25}/gi) || [];
  spxMatches.forEach((m) => candidates.add(m.trim().toUpperCase()));

  const courierMatches = rawText.match(/(?:GHN|GHTK|JNT|LEX|LZD|VTP|TKM)[A-Z0-9]{5,20}/gi) || [];
  courierMatches.forEach((m) => candidates.add(m.trim().toUpperCase()));

  const tokenMatches = rawText.match(/\b[A-Za-z0-9_-]{8,26}\b/g) || [];
  tokenMatches.forEach((token) => {
    const clean = token.replace(/^[_\-]+|[_\-]+$/g, '').toUpperCase();
    const digitCount = (clean.match(/\d/g) || []).length;
    if (clean.length >= 8 && clean.length <= 26 && digitCount >= 2) {
      candidates.add(clean);
    }
  });

  const numericMatches = rawText.match(/\b\d{9,18}\b/g) || [];
  numericMatches.forEach((num) => candidates.add(num.trim()));

  return Array.from(candidates);
}

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

  // Raw data from Google Sheets
  const [shopData, setShopData] = useState([]);
  const [hhbhData, setHhbhData] = useState([]);
  const [udctData, setUdctData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [maGianFilter, setMaGianFilter] = useState('');
  const [doiSoatFilter, setDoiSoatFilter] = useState('ALL'); // ALL | DA_NHAN | CHO_NHAN | OVERDUE | LECH_HANG
  const [xacNhanFilter, setXacNhanFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('create'); // 'create' | 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchInputText, setBatchInputText] = useState('');
  const [batchSaving, setBatchSaving] = useState(false);

  // Single Entry Form State
  const [formData, setFormData] = useState({
    id: '',
    ngay_tra: todayStr,
    mvd: '',
    mdh: '',
    ma_gian: '',
    sku: '',
    ten_sp: '',
    mvd_tra: '',
    sku_tra: '',
    sl: '1',
    hoan_tra: 'Hoàn',
    ghi_chu: '',
    xac_nhan: 'ĐÃ XÁC NHẬN',
    nguoi_nhap: user?.name || user?.username || 'Shop',
    anh: '',
  });

  // Suggestion feedback state for auto-lookup
  const [lookupFeedback, setLookupFeedback] = useState(null);
  const [matchedOrderItems, setMatchedOrderItems] = useState([]); // All items belonging to current MVD/MDH

  // Image & OCR state
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrCandidates, setOcrCandidates] = useState([]);
  const [ocrFullText, setOcrFullText] = useState('');
  const [showOcrBox, setShowOcrBox] = useState(false);
  const fileInputRef = useRef(null);

  // 1. Tải toàn bộ dữ liệu (HH_SHOP_DIEN, HH_BH, UD_CT)
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [shopRows, hhbhRows, udctRows] = await Promise.all([
        fetchSheetData(`${CONFIG.hhShopDienSheetName}!A:P`),
        fetchSheetData(`${CONFIG.hhbhSheetName}!A:Z`),
        fetchSheetData(`${CONFIG.udctSheetName}!A:R`),
      ]);

      // Parse HH_SHOP_DIEN (16 columns: id, ngay_tao, ngay_tra, mvd, mdh, ma_gian, sku, ten_sp, mvd_tra, sku_tra, sl, hoan_tra, ghi_chu, xac_nhan, nguoi_nhap, anh)
      if (shopRows && shopRows.length > 1) {
        const parsedShop = shopRows.slice(1).map((row, idx) => ({
          rowIndex: idx + 2,
          id: (row[0] || '').toString().trim(),
          ngay_tao: (row[1] || '').toString().trim(),
          ngay_tra: toYMD(row[2] || '') || (row[2] || '').toString().trim(),
          mvd: (row[3] || '').toString().trim(),
          mdh: (row[4] || '').toString().trim(),
          ma_gian: (row[5] || '').toString().trim(),
          sku: (row[6] || '').toString().trim(),
          ten_sp: (row[7] || '').toString().trim(),
          mvd_tra: (row[8] || '').toString().trim(),
          sku_tra: (row[9] || '').toString().trim(),
          sl: (row[10] || '1').toString().trim(),
          hoan_tra: (row[11] || 'Hoàn').toString().trim(),
          ghi_chu: (row[12] || '').toString().trim(),
          xac_nhan: (row[13] || '').toString().trim(),
          nguoi_nhap: (row[14] || '').toString().trim(),
          anh: (row[15] || '').toString().trim(),
        }));
        setShopData(parsedShop);
      } else {
        setShopData([]);
      }

      // Parse HH_BH (Kho hàng hoàn nhận)
      if (hhbhRows && hhbhRows.length > 1) {
        const parsedHh = hhbhRows.slice(1).map((row, idx) => ({
          rowIndex: idx + 2,
          id: (row[0] || '').toString().trim(),
          ngay_nhan: (row[1] || '').toString().trim(),
          mvd: (row[2] || '').toString().trim(),
          mvd_2: (row[3] || '').toString().trim(),
          ma_gian: (row[4] || '').toString().trim(),
          anh_1: (row[5] || '').toString().trim(),
          anh_2: (row[6] || '').toString().trim(),
          anh_3: (row[7] || '').toString().trim(),
          ngay_xly: (row[8] || '').toString().trim(),
          sku: (row[9] || '').toString().trim(),
          sku_ct: (row[10] || '').toString().trim(),
          slg: (row[11] || '1').toString().trim(),
          ten_sp: (row[12] || '').toString().trim(),
          ghi_chu: (row[13] || '').toString().trim(),
          tinh_trang: (row[14] || '').toString().trim(),
          trang_thai: (row[15] || '').toString().trim(),
          id_nv: (row[17] || '').toString().trim(),
        }));
        setHhbhData(parsedHh);
      } else {
        setHhbhData([]);
      }

      // Parse UD_CT (Đơn hàng chi tiết)
      if (udctRows && udctRows.length > 1) {
        const parsedUdct = udctRows.slice(1).map((row) => ({
          ma_gian: (row[10] || '').toString().trim(),
          mvd: (row[11] || '').toString().trim(),
          mdh: (row[12] || '').toString().trim(),
          sku_shop_up: (row[13] || '').toString().trim(),
          so_luong: (row[14] || '1').toString().trim(),
          id_sp: (row[15] || '').toString().trim(),
          id_sp_ct: (row[16] || '').toString().trim(),
          ten_sp: (row[17] || '').toString().trim(),
        }));
        setUdctData(parsedUdct);
      } else {
        setUdctData([]);
      }
    } catch (err) {
      console.error('Error loading HH_SHOP_DIEN:', err);
      showToast('Lỗi khi tải dữ liệu HH Shop Điền: ' + err.message, 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tự động đồng bộ ngầm
  useAutoSync(loadData, { sheetName: CONFIG.hhShopDienSheetName });

  // 2. Map tra cứu nhanh Hàng Hoàn Kho (`HH_BH`) theo MVD & MVD_2
  const hhbhMap = useMemo(() => {
    const map = new Map();
    hhbhData.forEach((item) => {
      if (item.mvd) {
        map.set(item.mvd.toUpperCase(), item);
      }
      if (item.mvd_2 && item.mvd_2.toUpperCase() !== item.mvd?.toUpperCase()) {
        map.set(item.mvd_2.toUpperCase(), item);
      }
    });
    return map;
  }, [hhbhData]);

  // 3. Kết hợp đối soát giữa Dữ liệu Shop Điền và Kho Hàng Hoàn
  const reconciledData = useMemo(() => {
    const now = new Date();
    return shopData.map((item) => {
      const cleanMvd = (item.mvd || '').toUpperCase();
      const cleanMvdTra = (item.mvd_tra || '').toUpperCase();

      const khoMatch = (cleanMvdTra && hhbhMap.get(cleanMvdTra)) || (cleanMvd && hhbhMap.get(cleanMvd)) || null;

      let status = 'CHO_NHAN';
      let isOverdue = false;
      let daysWaiting = 0;

      if (khoMatch) {
        const shopSku = (item.sku_tra || item.sku || '').toUpperCase();
        const khoSku = (khoMatch.sku_ct || khoMatch.sku || '').toUpperCase();

        if (shopSku && khoSku && !khoSku.includes(shopSku) && !shopSku.includes(khoSku)) {
          status = 'LECH_HANG';
        } else {
          status = 'DA_NHAN';
        }
      } else {
        if (item.ngay_tra) {
          const returnDate = new Date(item.ngay_tra);
          if (!isNaN(returnDate.getTime())) {
            daysWaiting = Math.floor((now - returnDate) / (1000 * 60 * 60 * 24));
            if (daysWaiting >= 7) {
              isOverdue = true;
            }
          }
        }
      }

      return {
        ...item,
        doi_soat_status: status,
        is_overdue: isOverdue,
        days_waiting: Math.max(0, daysWaiting),
        kho_match: khoMatch,
      };
    });
  }, [shopData, hhbhMap]);

  // Thống kê KPI
  const kpiStats = useMemo(() => {
    const total = reconciledData.length;
    let daNhan = 0;
    let choNhan = 0;
    let overdue = 0;
    let lechHang = 0;

    reconciledData.forEach((i) => {
      if (i.doi_soat_status === 'DA_NHAN') daNhan++;
      else if (i.doi_soat_status === 'LECH_HANG') lechHang++;
      else {
        choNhan++;
        if (i.is_overdue) overdue++;
      }
    });

    const percent = total > 0 ? Math.round((daNhan / total) * 100) : 0;
    return { total, daNhan, choNhan, overdue, lechHang, percent };
  }, [reconciledData]);

  // Danh sách gian hàng
  const maGianList = useMemo(() => {
    return [...new Set(shopData.map((i) => i.ma_gian).filter(Boolean))].sort();
  }, [shopData]);

  // Dữ liệu hiển thị sau lọc
  const filteredData = useMemo(() => {
    return reconciledData
      .filter((item) => {
        const itemYMD = toYMD(item.ngay_tra);
        if (fromDate && itemYMD < fromDate) return false;
        if (toDate && itemYMD > toDate) return false;
        if (maGianFilter && item.ma_gian !== maGianFilter) return false;
        if (xacNhanFilter && item.xac_nhan !== xacNhanFilter) return false;

        if (doiSoatFilter === 'DA_NHAN' && item.doi_soat_status !== 'DA_NHAN') return false;
        if (doiSoatFilter === 'CHO_NHAN' && item.doi_soat_status !== 'CHO_NHAN') return false;
        if (doiSoatFilter === 'OVERDUE' && (!item.is_overdue || item.doi_soat_status !== 'CHO_NHAN')) return false;
        if (doiSoatFilter === 'LECH_HANG' && item.doi_soat_status !== 'LECH_HANG') return false;

        if (searchTerm) {
          const text = `${item.mvd} ${item.mdh} ${item.ma_gian} ${item.sku} ${item.ten_sp} ${item.mvd_tra} ${item.sku_tra} ${item.ghi_chu}`;
          if (!matchMultiKeyword(text, searchTerm)) return false;
        }

        return true;
      })
      .sort((a, b) => b.rowIndex - a.rowIndex);
  }, [reconciledData, fromDate, toDate, maGianFilter, xacNhanFilter, doiSoatFilter, searchTerm]);

  // 4. Tra cứu tự động từ UD_CT khi gõ MVD hoặc MDH
  const performUdctLookup = (mvdVal, mdhVal) => {
    const cleanMvd = (mvdVal || '').trim().toLowerCase();
    const cleanMdh = (mdhVal || '').trim().toLowerCase();

    if (!cleanMvd && !cleanMdh) {
      setLookupFeedback(null);
      setMatchedOrderItems([]);
      return;
    }

    let matches = [];
    if (cleanMvd) {
      matches = udctData.filter((u) => u.mvd.toLowerCase() === cleanMvd);
    }
    if (!matches.length && cleanMdh) {
      matches = udctData.filter((u) => u.mdh.toLowerCase() === cleanMdh);
    }

    if (matches.length > 0) {
      setMatchedOrderItems(matches);
      const first = matches[0];
      setFormData((prev) => ({
        ...prev,
        mvd: prev.mvd || first.mvd,
        mdh: prev.mdh || first.mdh,
        ma_gian: first.ma_gian || prev.ma_gian,
        sku: matches.length === 1 ? (first.id_sp_ct || first.id_sp || first.sku_shop_up) : prev.sku,
        ten_sp: matches.length === 1 ? first.ten_sp : prev.ten_sp,
        mvd_tra: prev.mvd_tra || prev.mvd || first.mvd,
        sku_tra: matches.length === 1 ? (first.id_sp_ct || first.id_sp) : prev.sku_tra,
        sl: matches.length === 1 ? (first.so_luong || '1') : prev.sl,
      }));

      if (matches.length === 1) {
        setLookupFeedback({
          type: 'success',
          message: `Đã tìm thấy đơn hàng: Gian ${first.ma_gian} - SKU: ${first.id_sp_ct || first.id_sp}`,
        });
      } else {
        setLookupFeedback({
          type: 'multiple',
          message: `Đơn có ${matches.length} sản phẩm. Tất cả sản phẩm được hiển thị đầy đủ bên dưới.`,
        });
      }
    } else {
      setLookupFeedback({
        type: 'not_found',
        message: 'Chưa có trong dữ liệu đơn hàng UD_CT (bạn có thể tự điền các ô bên dưới)',
      });
      setMatchedOrderItems([]);
    }
  };

  const handleMvdChange = (val) => {
    const updatedMvd = val.trim().toUpperCase();
    setFormData((prev) => ({
      ...prev,
      mvd: updatedMvd,
      mvd_tra: prev.hoan_tra.toLowerCase() === 'hoàn' && !prev.mvd_tra ? updatedMvd : prev.mvd_tra,
    }));
    performUdctLookup(updatedMvd, formData.mdh);
  };

  const handleMdhChange = (val) => {
    const updatedMdh = val.trim();
    setFormData((prev) => ({ ...prev, mdh: updatedMdh }));
    performUdctLookup(formData.mvd, updatedMdh);
  };

  const handleSelectOrderItem = (item) => {
    const targetSku = item.id_sp_ct || item.id_sp || item.sku_shop_up || '';
    setFormData((prev) => ({
      ...prev,
      sku: targetSku,
      ten_sp: item.ten_sp || prev.ten_sp,
      sku_tra: targetSku,
      sl: item.so_luong || '1',
    }));
    showToast(`Đã chọn sản phẩm: ${targetSku}`, 'success');
  };

  // 5. Xử lý ảnh đính kèm: Hỗ trợ Dán (Ctrl + V) và Tải file
  const handleProcessImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Vui lòng chọn hoặc dán file hình ảnh!', 'warning');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setImagePreviewUrl(localUrl);
    setImageUploading(true);
    setOcrCandidates([]);
    setOcrFullText('');

    try {
      const caption = `HH_SHOP: ${formData.mvd || formData.mdh || 'DON_HOAN'}`;
      const uploadedUrl = await uploadImage(file, { caption });
      setFormData((prev) => ({ ...prev, anh: uploadedUrl }));
      showToast('Đã tải ảnh lên thành công!', 'success');
    } catch (err) {
      console.error('Lỗi upload ảnh:', err);
      showToast('Không thể upload ảnh: ' + err.message, 'error');
    } finally {
      setImageUploading(false);
    }
  };

  // Lắng nghe sự kiện Paste (Ctrl + V) toàn màn hình khi Drawer mở
  useEffect(() => {
    if (!isDrawerOpen) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleProcessImageFile(file);
            showToast('Đã nhận diện ảnh dán từ Clipboard (Ctrl + V)!', 'info');
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isDrawerOpen, formData.mvd, formData.mdh]);

  // 6. Đọc chữ OCR từ ảnh đính kèm
  const handleRunOcrOnImage = async () => {
    const imgSource = imagePreviewUrl || formData.anh;
    if (!imgSource) {
      showToast('Chưa có ảnh để đọc chữ OCR!', 'warning');
      return;
    }

    setOcrLoading(true);
    setOcrProgress(0);
    setShowOcrBox(true);

    try {
      const res = await Tesseract.recognize(imgSource, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text' && typeof m.progress === 'number') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const fullText = (res?.data?.text || '').trim();
      const candidates = extractOcrCandidates(fullText);

      setOcrFullText(fullText);
      setOcrCandidates(candidates);

      // Nếu tìm thấy mã vận đơn tiềm năng và ô MVD đang trống, tự động điền luôn
      if (candidates.length > 0 && !formData.mvd) {
        handleMvdChange(candidates[0]);
        showToast(`Đã nhận diện và điền MVD: ${candidates[0]}`, 'success');
      } else {
        showToast(`OCR hoàn tất, tìm thấy ${candidates.length} mã khả dụng!`, 'info');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      showToast('Có lỗi khi đọc chữ OCR: ' + err.message, 'error');
    } finally {
      setOcrLoading(false);
    }
  };

  // Mở Drawer thêm mới
  const handleOpenCreate = () => {
    setSelectedItem(null);
    setLookupFeedback(null);
    setMatchedOrderItems([]);
    setImagePreviewUrl('');
    setOcrCandidates([]);
    setOcrFullText('');
    setShowOcrBox(false);

    setFormData({
      id: Date.now().toString(),
      ngay_tra: todayStr,
      mvd: '',
      mdh: '',
      ma_gian: '',
      sku: '',
      ten_sp: '',
      mvd_tra: '',
      sku_tra: '',
      sl: '1',
      hoan_tra: 'Hoàn',
      ghi_chu: '',
      xac_nhan: 'ĐÃ XÁC NHẬN',
      nguoi_nhap: user?.name || user?.username || 'Shop',
      anh: '',
    });
    setDrawerMode('create');
    setIsDrawerOpen(true);
  };

  // Mở Drawer sửa
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setLookupFeedback(null);
    setOcrCandidates([]);
    setOcrFullText('');
    setShowOcrBox(false);
    setImagePreviewUrl(item.anh || '');

    setFormData({
      id: item.id || Date.now().toString(),
      ngay_tra: toYMD(item.ngay_tra) || todayStr,
      mvd: item.mvd || '',
      mdh: item.mdh || '',
      ma_gian: item.ma_gian || '',
      sku: item.sku || '',
      ten_sp: item.ten_sp || '',
      mvd_tra: item.mvd_tra || item.mvd || '',
      sku_tra: item.sku_tra || item.sku || '',
      sl: item.sl || '1',
      hoan_tra: item.hoan_tra || 'Hoàn',
      ghi_chu: item.ghi_chu || '',
      xac_nhan: item.xac_nhan || 'ĐÃ XÁC NHẬN',
      nguoi_nhap: item.nguoi_nhap || user?.name || '',
      anh: item.anh || '',
    });

    // Lấy lại danh sách các item trong đơn
    if (item.mvd || item.mdh) {
      const cleanMvd = (item.mvd || '').toLowerCase();
      const cleanMdh = (item.mdh || '').toLowerCase();
      const matches = udctData.filter(
        (u) => (cleanMvd && u.mvd.toLowerCase() === cleanMvd) || (cleanMdh && u.mdh.toLowerCase() === cleanMdh)
      );
      setMatchedOrderItems(matches);
    } else {
      setMatchedOrderItems([]);
    }

    setDrawerMode('edit');
    setIsDrawerOpen(true);
  };

  // Lưu dòng đơn
  const handleSave = async () => {
    if (!formData.mvd && !formData.mdh) {
      showToast('Vui lòng nhập ít nhất Mã vận đơn (MVD) hoặc Mã đơn hàng (MDH)!', 'warning');
      return;
    }

    const ngayVN = formatYmdToDmy(formData.ngay_tra) || formData.ngay_tra;
    const nowTimeStr = new Date().toLocaleString('vi-VN');
    const rowValues = [
      formData.id || Date.now().toString(),
      nowTimeStr,
      ngayVN,
      formData.mvd.trim().toUpperCase(),
      formData.mdh.trim(),
      formData.ma_gian.trim().toUpperCase(),
      formData.sku.trim().toUpperCase(),
      formData.ten_sp.trim(),
      (formData.mvd_tra || formData.mvd).trim().toUpperCase(),
      (formData.sku_tra || formData.sku).trim().toUpperCase(),
      formData.sl || '1',
      formData.hoan_tra || 'Hoàn',
      formData.ghi_chu.trim(),
      formData.xac_nhan || 'ĐÃ XÁC NHẬN',
      formData.nguoi_nhap || user?.name || '',
      formData.anh || '',
    ];

    if (drawerMode === 'create') {
      try {
        await appendSheetData(CONFIG.hhShopDienSheetName, [rowValues]);
        showToast('Đã thêm mới đơn hàng hoàn shop điền thành công!', 'success');
        setIsDrawerOpen(false);
        loadData(true);
      } catch (err) {
        console.error('Error creating HH Shop:', err);
        showToast('Lỗi khi thêm mới: ' + err.message, 'error');
      }
    } else {
      if (!selectedItem) return;
      const rowIndex = selectedItem.rowIndex;
      const updates = [
        { range: `${CONFIG.hhShopDienSheetName}!C${rowIndex}`, values: [[ngayVN]] },
        { range: `${CONFIG.hhShopDienSheetName}!D${rowIndex}`, values: [[formData.mvd]] },
        { range: `${CONFIG.hhShopDienSheetName}!E${rowIndex}`, values: [[formData.mdh]] },
        { range: `${CONFIG.hhShopDienSheetName}!F${rowIndex}`, values: [[formData.ma_gian]] },
        { range: `${CONFIG.hhShopDienSheetName}!G${rowIndex}`, values: [[formData.sku]] },
        { range: `${CONFIG.hhShopDienSheetName}!H${rowIndex}`, values: [[formData.ten_sp]] },
        { range: `${CONFIG.hhShopDienSheetName}!I${rowIndex}`, values: [[formData.mvd_tra]] },
        { range: `${CONFIG.hhShopDienSheetName}!J${rowIndex}`, values: [[formData.sku_tra]] },
        { range: `${CONFIG.hhShopDienSheetName}!K${rowIndex}`, values: [[formData.sl]] },
        { range: `${CONFIG.hhShopDienSheetName}!L${rowIndex}`, values: [[formData.hoan_tra]] },
        { range: `${CONFIG.hhShopDienSheetName}!M${rowIndex}`, values: [[formData.ghi_chu]] },
        { range: `${CONFIG.hhShopDienSheetName}!N${rowIndex}`, values: [[formData.xac_nhan]] },
        { range: `${CONFIG.hhShopDienSheetName}!P${rowIndex}`, values: [[formData.anh || '']] },
      ];

      try {
        await batchUpdateSheetValues(updates);
        showToast('Đã lưu thay đổi thành công!', 'success');
        setIsDrawerOpen(false);
        loadData(true);
      } catch (err) {
        console.error('Error updating HH Shop:', err);
        showToast('Lỗi khi cập nhật: ' + err.message, 'error');
      }
    }
  };

  // Xóa dòng đơn
  const handleDelete = async () => {
    if (!selectedItem) return;
    if (!window.confirm(`Xóa dòng MVD "${selectedItem.mvd || selectedItem.mdh}"?`)) return;
    try {
      await deleteSheetRow(CONFIG.hhShopDienSheetName, selectedItem.rowIndex);
      showToast('Đã xóa dòng thành công!', 'success');
      setIsDrawerOpen(false);
      loadData(true);
    } catch (err) {
      console.error('Error deleting HH Shop:', err);
      showToast('Lỗi khi xóa: ' + err.message, 'error');
    }
  };

  // Nhập hàng loạt từ văn bản dán
  const handleBatchSave = async () => {
    if (!batchInputText.trim()) {
      showToast('Vui lòng dán danh sách mã vận đơn hoặc mã đơn hàng!', 'warning');
      return;
    }

    const lines = batchInputText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      showToast('Không có mã nào hợp lệ để nhập!', 'warning');
      return;
    }

    setBatchSaving(true);
    try {
      const todayFormatted = formatYmdToDmy(todayStr);
      const nowStr = new Date().toLocaleString('vi-VN');
      const rowsToAppend = [];

      lines.forEach((line) => {
        const clean = line.replace(/[\s\t,;]+/g, ' ').trim();
        const parts = clean.split(' ');
        const mainCode = parts[0].toUpperCase();

        let match = udctData.find((u) => u.mvd.toUpperCase() === mainCode);
        if (!match) {
          match = udctData.find((u) => u.mdh.toUpperCase() === mainCode);
        }

        const id = Date.now().toString() + Math.floor(Math.random() * 1000);
        const mvd = match ? match.mvd : mainCode;
        const mdh = match ? match.mdh : (parts[1] || '');
        const maGian = match ? match.ma_gian : (parts[2] || '');
        const sku = match ? (match.id_sp_ct || match.id_sp) : (parts[3] || '');
        const tenSp = match ? match.ten_sp : '';
        const mvdTra = mvd;
        const skuTra = sku;

        rowsToAppend.push([
          id,
          nowStr,
          todayFormatted,
          mvd,
          mdh,
          maGian,
          sku,
          tenSp,
          mvdTra,
          skuTra,
          '1',
          'Hoàn',
          '',
          'ĐÃ XÁC NHẬN',
          user?.name || 'Shop',
          '',
        ]);
      });

      await appendSheetData(CONFIG.hhShopDienSheetName, rowsToAppend);
      showToast(`Đã thêm thành công ${rowsToAppend.length} đơn hoàn!`, 'success');
      setBatchInputText('');
      setIsBatchModalOpen(false);
      loadData(true);
    } catch (err) {
      console.error('Error batch saving:', err);
      showToast('Lỗi khi lưu danh sách hàng loạt: ' + err.message, 'error');
    } finally {
      setBatchSaving(false);
    }
  };

  // Xuất file Excel
  const handleExport = () => {
    if (!filteredData.length) {
      showToast('Không có dữ liệu để xuất!', 'warning');
      return;
    }
    const headers = [
      'Ngày trả sàn',
      'Trạng thái kho',
      'Mã vận đơn',
      'Mã đơn hàng',
      'Mã gian',
      'SKU',
      'Tên sản phẩm',
      'MVD Trả',
      'SKU Trả',
      'SL',
      'Loại',
      'Ngày kho nhận',
      'SKU kho nhận',
      'Xác nhận',
      'Ghi chú',
      'Link ảnh',
    ];
    const rows = filteredData.map((r) => [
      formatYmdToDmy(r.ngay_tra) || r.ngay_tra,
      r.doi_soat_status === 'DA_NHAN'
        ? 'Đã nhận kho'
        : r.doi_soat_status === 'LECH_HANG'
        ? 'Lệch SKU'
        : r.is_overdue
        ? `Chờ nhận (${r.days_waiting} ngày - Quá hạn)`
        : `Chờ nhận (${r.days_waiting} ngày)`,
      r.mvd,
      r.mdh,
      r.ma_gian,
      r.sku,
      r.ten_sp,
      r.mvd_tra,
      r.sku_tra,
      r.sl,
      r.hoan_tra,
      r.kho_match?.ngay_nhan || '',
      r.kho_match?.sku_ct || r.kho_match?.sku || '',
      r.xac_nhan,
      r.ghi_chu,
      r.anh || '',
    ]);
    exportToExcel(`HH_SHOP_DIEN_DOI_SOAT_${Date.now()}`, 'HH_SHOP_DIEN', headers, rows);
    showToast('Đã xuất Excel đối soát thành công!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* 1. THẺ THỐNG KÊ KPI ĐỐI SOÁT */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tổng đơn */}
        <div
          onClick={() => setDoiSoatFilter('ALL')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            doiSoatFilter === 'ALL'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Tổng đơn Shop báo</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800">
            {kpiStats.total.toLocaleString('vi-VN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Bấm để xem tất cả</span>
          </div>
        </div>

        {/* Đã về kho an toàn */}
        <div
          onClick={() => setDoiSoatFilter('DA_NHAN')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            doiSoatFilter === 'DA_NHAN'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold mb-1">
            <span>Đã về kho (Khớp)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {kpiStats.daNhan.toLocaleString('vi-VN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Đạt <strong>{kpiStats.percent}%</strong> tổng số đơn
          </div>
        </div>

        {/* Đang chờ kho nhận */}
        <div
          onClick={() => setDoiSoatFilter('CHO_NHAN')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            doiSoatFilter === 'CHO_NHAN'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold mb-1">
            <span>Đang chờ kho nhận</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">
            {kpiStats.choNhan.toLocaleString('vi-VN')}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            {kpiStats.overdue > 0 ? (
              <span className="text-rose-600 font-bold">⚠️ {kpiStats.overdue} đơn quá 7 ngày!</span>
            ) : (
              'Trong thời hạn luân chuyển'
            )}
          </div>
        </div>

        {/* Lệch hàng / Bất thường */}
        <div
          onClick={() => setDoiSoatFilter('LECH_HANG')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            doiSoatFilter === 'LECH_HANG'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold mb-1">
            <span>Lệch SKU / Bất thường</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600">
            {kpiStats.lechHang.toLocaleString('vi-VN')}
          </div>
          <div className="text-[11px] text-rose-700 mt-1">
            {kpiStats.lechHang > 0 ? 'Có ảnh chụp đối chứng từ kho' : 'Không có lệch hàng'}
          </div>
        </div>
      </div>

      {/* 2. THANH CÔNG CỤ VÀ BỘ LỌC */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-3 lg:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-800">Hàng hoàn Shop điền & Đối soát</h2>
              <p className="text-[11px] text-slate-500">
                Nhập MVD/MDH tự động điền đơn hàng & kiểm tra hàng về kho thời gian thực
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenCreate}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm 1 đơn</span>
            </button>

            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dán danh sách MVD</span>
            </button>

            <button
              onClick={handleExport}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={() => loadData()}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
              title="Làm mới dữ liệu"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bộ lọc chi tiết */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Ngày từ */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none w-full"
            />
          </div>

          {/* Ngày đến */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none w-full"
            />
          </div>

          {/* Lọc Trạng thái đối soát */}
          <select
            value={doiSoatFilter}
            onChange={(e) => setDoiSoatFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="ALL">Tất cả đối soát ({kpiStats.total})</option>
            <option value="DA_NHAN">🟢 Đã nhận kho ({kpiStats.daNhan})</option>
            <option value="CHO_NHAN">🟡 Chờ kho nhận ({kpiStats.choNhan})</option>
            <option value="OVERDUE">⚠️ Quá hạn &gt; 7 ngày ({kpiStats.overdue})</option>
            <option value="LECH_HANG">🔴 Lệch hàng / Bất thường ({kpiStats.lechHang})</option>
          </select>

          {/* Lọc Gian hàng */}
          <select
            value={maGianFilter}
            onChange={(e) => setMaGianFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="">Tất cả Gian hàng</option>
            {maGianList.map((g) => (
              <option key={g} value={g}>
                Gian: {g}
              </option>
            ))}
          </select>

          {/* Lọc Xác nhận */}
          <select
            value={xacNhanFilter}
            onChange={(e) => setXacNhanFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="">Tất cả xác nhận</option>
            <option value="ĐÃ XÁC NHẬN">ĐÃ XÁC NHẬN</option>
            <option value="CHỜ XÁC NHẬN">CHỜ XÁC NHẬN</option>
          </select>

          {/* Tìm kiếm đa năng */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm MVD, MDH, SKU..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      {/* 3. BẢNG DỮ LIỆU ĐỐI SOÁT */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100/90 backdrop-blur-xs text-slate-700 font-bold uppercase sticky top-0 z-10 whitespace-nowrap select-none shadow-2xs">
              <tr>
                <ResizableTh moduleId="hh_shop_dien" columnKey="ngay_tra" defaultWidth={100} align="center">Ngày trả sàn</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="doi_soat" defaultWidth={135} align="center">Trạng thái kho</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="mvd" defaultWidth={160} align="left">Mã vận đơn</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="mdh" defaultWidth={150} align="left">Mã đơn hàng</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="ma_gian" defaultWidth={90} align="center">Mã gian</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="sku" defaultWidth={130} align="left">SKU Shop</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="ten_sp" defaultWidth={180} align="left">Tên sản phẩm</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="mvd_tra" defaultWidth={150} align="left">MVD Trả</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="sku_tra" defaultWidth={120} align="left">SKU Trả</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="sl" defaultWidth={65} align="right">SL</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="hoan_tra" defaultWidth={75} align="center">Loại</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="kho_nhan" defaultWidth={160} align="left">Kho thực tế</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="kho_anh" defaultWidth={75} align="center">Ảnh kho</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="anh" defaultWidth={75} align="center">Ảnh shop</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="xac_nhan" defaultWidth={100} align="center">Xác nhận</ResizableTh>
                <ResizableTh moduleId="hh_shop_dien" columnKey="ghi_chu" defaultWidth={150} align="left">Ghi chú</ResizableTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={16} className="text-center py-12 text-slate-400">
                    Không tìm thấy dữ liệu phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const kho = item.kho_match;
                  const firstKhoPhoto = kho?.anh_1 || kho?.anh_2 || kho?.anh_3;

                  return (
                    <tr
                      key={item.rowIndex}
                      onDoubleClick={() => handleOpenEdit(item)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                      title="Nhấn đúp để chỉnh sửa"
                    >
                      {/* Ngày trả sàn */}
                      <td
                        className="px-3 py-2 text-center text-slate-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('ngay_tra', 100)}
                      >
                        {formatYmdToDmy(item.ngay_tra) || item.ngay_tra || '-'}
                      </td>

                      {/* Trạng thái đối soát */}
                      <td
                        className="px-3 py-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('doi_soat', 135)}
                      >
                        {item.doi_soat_status === 'DA_NHAN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Đã nhận kho
                          </span>
                        ) : item.doi_soat_status === 'LECH_HANG' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            Lệch SKU
                          </span>
                        ) : item.is_overdue ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                            title={`Đã chờ ${item.days_waiting} ngày kể từ ngày sàn trả`}
                          >
                            <Clock className="w-3.5 h-3.5 text-rose-600" />
                            Quá hạn ({item.days_waiting}d)
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200"
                            title={`Đã chờ ${item.days_waiting} ngày`}
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Chờ nhận ({item.days_waiting}d)
                          </span>
                        )}
                      </td>

                      {/* Mã vận đơn */}
                      <td
                        className="px-3 py-2 text-left font-bold font-mono text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('mvd', 160)}
                        title={item.mvd}
                      >
                        {item.mvd}
                      </td>

                      {/* Mã đơn hàng */}
                      <td
                        className="px-3 py-2 text-left font-mono text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('mdh', 150)}
                        title={item.mdh}
                      >
                        {item.mdh || '-'}
                      </td>

                      {/* Mã gian */}
                      <td
                        className="px-3 py-2 text-center font-bold text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('ma_gian', 90)}
                      >
                        {item.ma_gian || '-'}
                      </td>

                      {/* SKU Shop */}
                      <td
                        className="px-3 py-2 text-left text-indigo-700 font-bold font-mono whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('sku', 130)}
                        title={item.sku}
                      >
                        {item.sku || '-'}
                      </td>

                      {/* Tên sản phẩm */}
                      <td
                        className="px-3 py-2 text-left text-slate-600 truncate overflow-hidden text-ellipsis"
                        style={colStyle('ten_sp', 180)}
                        title={item.ten_sp}
                      >
                        {item.ten_sp || '-'}
                      </td>

                      {/* MVD Trả */}
                      <td
                        className="px-3 py-2 text-left font-mono text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('mvd_tra', 150)}
                        title={item.mvd_tra}
                      >
                        {item.mvd_tra || '-'}
                      </td>

                      {/* SKU Trả */}
                      <td
                        className="px-3 py-2 text-left font-mono text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('sku_tra', 120)}
                        title={item.sku_tra}
                      >
                        {item.sku_tra || '-'}
                      </td>

                      {/* Số lượng */}
                      <td
                        className="px-3 py-2 text-right font-mono font-bold text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('sl', 65)}
                      >
                        {item.sl || '1'}
                      </td>

                      {/* Loại (Hoàn / Trả) */}
                      <td
                        className="px-3 py-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('hoan_tra', 75)}
                      >
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.hoan_tra}
                        </span>
                      </td>

                      {/* Kho thực tế */}
                      <td
                        className="px-3 py-2 text-left whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('kho_nhan', 160)}
                      >
                        {kho ? (
                          <div className="flex flex-col text-[11px]">
                            <span className="font-semibold text-slate-900">
                              {kho.sku_ct || kho.sku || 'Đã nhận'}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              {kho.ngay_nhan || ''} {kho.id_nv ? `(${kho.id_nv})` : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa nhận</span>
                        )}
                      </td>

                      {/* Ảnh kho nhận */}
                      <td
                        className="px-3 py-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('kho_anh', 75)}
                      >
                        {firstKhoPhoto ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage(firstKhoPhoto);
                            }}
                            className="p-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                            title="Xem ảnh bóc hàng của kho"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Ảnh shop đính kèm */}
                      <td
                        className="px-3 py-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('anh', 75)}
                      >
                        {item.anh ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage(item.anh);
                            }}
                            className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                            title="Xem ảnh shop đính kèm"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Xác nhận */}
                      <td
                        className="px-3 py-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                        style={colStyle('xac_nhan', 100)}
                      >
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.xac_nhan === 'ĐÃ XÁC NHẬN'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.xac_nhan || 'ĐÃ XÁC NHẬN'}
                        </span>
                      </td>

                      {/* Ghi chú */}
                      <td
                        className="px-3 py-2 text-left text-slate-500 truncate overflow-hidden text-ellipsis"
                        style={colStyle('ghi_chu', 150)}
                        title={item.ghi_chu}
                      >
                        {item.ghi_chu || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer thống kê số dòng */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>
            Đang hiển thị: <strong>{filteredData.length.toLocaleString('vi-VN')}</strong> / {shopData.length.toLocaleString('vi-VN')} dòng
          </span>
          <span className="italic text-slate-400">Nhấn đúp vào dòng để sửa hoặc cập nhật</span>
        </div>
      </div>

      {/* 4. DRAWER NHẬP / SỬA 1 ĐƠN (GIAO DIỆN MỚI TỐI ƯU THEO YÊU CẦU) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg h-full bg-white shadow-2xl flex flex-col p-4 sm:p-5 space-y-3.5 animate-slide-left">
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-800">
                  {drawerMode === 'create' ? 'Thêm mới hàng hoàn shop điền' : 'Chỉnh sửa hàng hoàn shop điền'}
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung form */}
            <div className="space-y-3 flex-1 overflow-y-auto text-xs pr-1">
              {/* Phản hồi tra cứu tự động */}
              {lookupFeedback && (
                <div
                  className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                    lookupFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : lookupFeedback.type === 'multiple'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  {lookupFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : lookupFeedback.type === 'multiple' ? (
                    <Layers className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 font-medium">{lookupFeedback.message}</div>
                </div>
              )}

              {/* Ô 1: Mã Vận Đơn (MVD) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800 flex items-center gap-1">
                    <span>Mã vận đơn (MVD)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setScannerOpen(true)}
                    className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Quét mã camera</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.mvd}
                  onChange={(e) => handleMvdChange(e.target.value)}
                  placeholder="Nhập hoặc dán MVD..."
                  className="w-full p-2.5 bg-white border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl font-mono font-bold text-sm text-slate-900 outline-none uppercase"
                />
              </div>

              {/* Ô 2: Mã Đơn Hàng (MDH) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Mã đơn hàng sàn (MDH)
                </label>
                <input
                  type="text"
                  value={formData.mdh}
                  onChange={(e) => handleMdhChange(e.target.value)}
                  placeholder="Nhập MDH sàn..."
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-800 outline-none"
                />
              </div>

              {/* Ô 3: Ngày sàn trả & Gian hàng */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày sàn báo trả</label>
                  <input
                    type="date"
                    value={formData.ngay_tra}
                    onChange={(e) => setFormData({ ...formData, ngay_tra: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gian hàng</label>
                  <input
                    type="text"
                    value={formData.ma_gian}
                    onChange={(e) => setFormData({ ...formData, ma_gian: e.target.value.toUpperCase() })}
                    placeholder="Mã gian (TAR, BCE...)"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold uppercase outline-none"
                  />
                </div>
              </div>

              {/* Ô 4: SKU sản phẩm gửi - NẾU ĐƠN NHIỀU SP THÌ HIỆN HẾT RA */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    SKU sản phẩm gửi {matchedOrderItems.length > 1 ? `(${matchedOrderItems.length} sản phẩm trong đơn)` : ''}
                  </label>
                  {matchedOrderItems.length > 1 && (
                    <span className="text-[11px] text-indigo-600 font-medium">Bấm để chọn món hoàn</span>
                  )}
                </div>

                {matchedOrderItems.length > 1 ? (
                  /* Hiển thị toàn bộ danh sách sản phẩm trong đơn */
                  <div className="space-y-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                    {matchedOrderItems.map((item, idx) => {
                      const itemSku = item.id_sp_ct || item.id_sp || item.sku_shop_up;
                      const isSelected = formData.sku === itemSku;

                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectOrderItem(item)}
                          className={`p-2 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
                              : 'bg-white border-slate-200 hover:border-indigo-200'
                          }`}
                        >
                          <div className="flex-1 truncate">
                            <div className="font-mono font-bold text-indigo-700 flex items-center gap-1.5">
                              <span>{itemSku}</span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                SL: {item.so_luong || 1}
                              </span>
                            </div>
                            <div className="text-slate-600 text-[11px] truncate mt-0.5" title={item.ten_sp}>
                              {item.ten_sp || 'Không có tên SP'}
                            </div>
                          </div>
                          <button
                            type="button"
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex-shrink-0 ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isSelected ? 'Đang chọn' : 'Chọn'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Nếu đơn chỉ có 1 SP hoặc nhập tay */
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="SKU sản phẩm gửi..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-indigo-700 uppercase outline-none"
                  />
                )}
              </div>

              {/* Tên sản phẩm */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên sản phẩm</label>
                <input
                  type="text"
                  value={formData.ten_sp}
                  onChange={(e) => setFormData({ ...formData, ten_sp: e.target.value })}
                  placeholder="Tên sản phẩm..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none"
                />
              </div>

              {/* Ô 5: MVD HOÀN/TRẢ - 1 HÀNG RIÊNG (THEO YÊU CẦU) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Mã vận đơn Hoàn/Trả (MVD Trả)
                </label>
                <input
                  type="text"
                  value={formData.mvd_tra}
                  onChange={(e) => setFormData({ ...formData, mvd_tra: e.target.value.toUpperCase() })}
                  placeholder="MVD chiều về (mặc định giống MVD gửi nếu là Hoàn)..."
                  className="w-full p-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl font-mono font-semibold text-slate-800 outline-none uppercase"
                />
              </div>

              {/* Ô 6: SKU HOÀN/TRẢ VỚI SỐ LƯỢNG - 1 HÀNG CHUNG (THEO YÊU CẦU) */}
              <div className="grid grid-cols-[1fr_90px] gap-2.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">SKU Hoàn/Trả</label>
                  <input
                    type="text"
                    value={formData.sku_tra}
                    onChange={(e) => setFormData({ ...formData, sku_tra: e.target.value.toUpperCase() })}
                    placeholder="SKU khách trả..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono uppercase font-semibold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Số lượng</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sl}
                    onChange={(e) => setFormData({ ...formData, sl: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-center outline-none"
                  />
                </div>
              </div>

              {/* Ô 7: LOẠI ĐƠN - DÙNG BUTTON TOGGLE (THEO YÊU CẦU) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Loại đơn</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        hoan_tra: 'Hoàn',
                        mvd_tra: !prev.mvd_tra || prev.mvd_tra === prev.mvd ? prev.mvd : prev.mvd_tra,
                      }));
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      formData.hoan_tra.toLowerCase() === 'hoàn'
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 ${
                        formData.hoan_tra.toLowerCase() === 'hoàn' ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <span>Hoàn (Chuyển hoàn)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        hoan_tra: 'Trả',
                      }));
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      formData.hoan_tra.toLowerCase() === 'trả'
                        ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 ${
                        formData.hoan_tra.toLowerCase() === 'trả' ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <span>Trả (Khách trả hàng)</span>
                  </button>
                </div>
              </div>

              {/* Ô 8: HÌNH ẢNH ĐÍNH KÈM (HỖ TRỢ CTRL + V VÀ ĐỌC OCR TỪ ẢNH) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>Ảnh đính kèm (Nhấn Ctrl + V để dán)</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Chọn file</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProcessImageFile(file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Preview Thumbnail ảnh */}
                {imageUploading ? (
                  <div className="py-6 border-2 border-dashed border-indigo-300 rounded-xl flex flex-col items-center justify-center bg-indigo-50/50">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-1" />
                    <span className="text-xs text-indigo-700 font-semibold">Đang nén và tải ảnh lên...</span>
                  </div>
                ) : imagePreviewUrl || formData.anh ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white max-h-40 flex items-center justify-center group">
                      <img
                        src={imagePreviewUrl || formData.anh}
                        alt="Ảnh đính kèm"
                        className="max-h-40 w-auto object-contain cursor-pointer"
                        onClick={() => setPreviewImage(imagePreviewUrl || formData.anh)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreviewUrl('');
                          setFormData((prev) => ({ ...prev, anh: '' }));
                          setOcrCandidates([]);
                          setOcrFullText('');
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors"
                        title="Xóa ảnh"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Nút bấm Đọc OCR từ ảnh */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={ocrLoading}
                        onClick={handleRunOcrOnImage}
                        className="flex-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {ocrLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang đọc chữ OCR ({ocrProgress}%)...</span>
                          </>
                        ) : (
                          <>
                            <ScanText className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Đọc chữ từ ảnh (OCR)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="py-4 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white"
                  >
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">
                      Bấm để tải ảnh hoặc nhấn <strong>Ctrl + V</strong> để dán ảnh chụp
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Hỗ trợ đọc OCR lấy mã vận đơn trực tiếp từ ảnh
                    </span>
                  </div>
                )}

                {/* Kết quả OCR từ ảnh */}
                {showOcrBox && (ocrCandidates.length > 0 || ocrFullText) && (
                  <div className="bg-white border border-indigo-200 rounded-xl p-2.5 space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Mã phát hiện được từ ảnh ({ocrCandidates.length}):
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowOcrBox(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {ocrCandidates.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {ocrCandidates.map((code, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              handleMvdChange(code);
                              showToast(`Đã điền MVD: ${code}`, 'success');
                            }}
                            className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-mono text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Bấm để điền vào ô MVD"
                          >
                            <span>{code}</span>
                            <ArrowRight className="w-3 h-3 text-indigo-500" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500">
                        Chưa tự động lọc được mã chuẩn. Bạn có thể xem toàn bộ text bên dưới:
                      </div>
                    )}

                    {ocrFullText && (
                      <div className="mt-1">
                        <div className="text-[10px] font-bold text-slate-500 mb-0.5">Toàn bộ chữ đọc được:</div>
                        <div className="max-h-20 overflow-y-auto bg-slate-50 rounded p-1.5 text-[10px] font-mono text-slate-700 whitespace-pre-wrap border border-slate-100">
                          {ocrFullText}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Ô 9: Ghi chú của Shop */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú của Shop</label>
                <textarea
                  rows={2}
                  value={formData.ghi_chu}
                  onChange={(e) => setFormData({ ...formData, ghi_chu: e.target.value })}
                  placeholder="Lý do hoàn, khách yêu cầu gì..."
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              {drawerMode === 'edit' ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold shadow-sm transition-all"
                >
                  {drawerMode === 'create' ? 'Thêm mới' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL NHẬP HÀNG LOẠT (PASTE LIST) */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col p-4 sm:p-5 space-y-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-800">Dán danh sách MVD hàng loạt</h3>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Copy và dán danh sách Mã vận đơn từ file Excel Shopee/TikTok vào khung dưới (mỗi dòng một mã). Hệ thống sẽ tự tra cứu thông tin đơn hàng trong <code>UD_CT</code> để thêm hàng loạt.
            </p>

            <textarea
              rows={8}
              value={batchInputText}
              onChange={(e) => setBatchInputText(e.target.value)}
              placeholder="SPXVN060920009186&#10;SPXVN062752724756&#10;SPXVN065762554194..."
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-medium">
                {batchInputText.trim()
                  ? `Đã nhận diện: ${batchInputText.trim().split('\n').filter(Boolean).length} mã`
                  : 'Chưa có mã'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={batchSaving || !batchInputText.trim()}
                  onClick={handleBatchSave}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  {batchSaving ? 'Đang lưu...' : 'Thêm vào danh sách'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL QUÉT MÃ BARCODE / QR BẰNG CAMERA */}
      <QRScannerModal
        isOpen={scannerOpen}
        title="Quét MVD để nhập đơn hoàn"
        onClose={() => setScannerOpen(false)}
        onScanSuccess={(val) => {
          handleMvdChange(val);
          setScannerOpen(false);
          showToast(`Đã quét mã: ${val}`, 'info');
        }}
      />

      {/* 7. MODAL XEM ẢNH BÓC HÀNG CỦA KHO HOẶC ẢNH SHOP */}
      <ImagePreviewModal
        isOpen={Boolean(previewImage)}
        imageUrl={previewImage}
        onClose={() => setPreviewImage('')}
      />
    </div>
  );
}
