import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Camera,
  Copy,
  Trash2,
  Image as ImageIcon,
  History,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { getTodayYmd, shiftDate, formatYmdToDmy, toYMD } from '../../utils/dateUtils';
import { CONFIG } from '../../config/config';
import { uploadImage } from '../../services/imageUploadService';

export default function HangHoanDrawer({
  isOpen,
  mode = 'create', // 'create' | 'edit' | 'copy'
  initialData = null,
  onClose,
  onSave,
  onDelete,
  onCopy,
  sanphamData = [],
  udctData = [],
  hangHoanData = [],
  onOpenQrScan,
}) {
  const { currentUser } = useAuth();
  const toast = useToast();
  const isKinhDoanh = currentUser?.role === 'kinhdoanh';

  // Form State
  const [mvd, setMvd] = useState('');
  const [mvd2, setMvd2] = useState('');
  const [maGian, setMaGian] = useState('');
  const [sku, setSku] = useState('');
  const [skuCt, setSkuCt] = useState('');
  const [slg, setSlg] = useState(1);
  const [hoanTra, setHoanTra] = useState('Hoàn');
  const [kho, setKho] = useState('KHO');
  const [tinhTrang, setTinhTrang] = useState('');
  const [tenSp, setTenSp] = useState('');
  const [ngayNhan, setNgayNhan] = useState(getTodayYmd());
  const [mdh, setMdh] = useState('');
  const [anh1, setAnh1] = useState('');
  const [anh2, setAnh2] = useState('');
  const [anh3, setAnh3] = useState('');
  const [uploadingSlots, setUploadingSlots] = useState({ 1: false, 2: false, 3: false });
  const [historyText, setHistoryText] = useState('');
  const [saving, setSaving] = useState(false);
  const [duplicateMvdNotice, setDuplicateMvdNotice] = useState('');

  // Suggestions state
  const [skuCtSuggestions, setSkuCtSuggestions] = useState([]);
  const [mvdSuggestions, setMvdSuggestions] = useState([]);
  const [mvd2Suggestions, setMvd2Suggestions] = useState([]);
  const [mdhSuggestions, setMdhSuggestions] = useState([]);
  const [maGianSuggestions, setMaGianSuggestions] = useState([]);
  const [maGianSkuCtSuggestions, setMaGianSkuCtSuggestions] = useState([]);
  const [detectedMaGianInSkuCt, setDetectedMaGianInSkuCt] = useState('');

  const uniqueMaGianList = React.useMemo(() => {
    return [...new Set(udctData.map(i => (i.ma_gian || '').trim()).filter(Boolean))].sort();
  }, [udctData]);

  // Hàm tìm kiếm gợi ý SKU CT dùng chung cho cả ô SKU CT và ô Mã gian
  const searchSkuCtMatches = useCallback((query) => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];

    const allMatches = [];
    const seen = new Set();
    
    // 1. Tìm trong sanphamData (Master catalog từ DS_SP - Nguồn chuẩn nhất)
    for (const s of sanphamData) {
      const realSkuCt = (s.sku_ct || s.sku_con || s.id_sp_ct || '').trim();
      // SKU CT bắt buộc phải có độ dài > 5 ký tự (mã cha <= 5 ký tự)
      if (!realSkuCt || realSkuCt.length <= 5) continue;

      const ct = realSkuCt.toLowerCase();
      const main = (s.sku || s.id_sp || '').toLowerCase();
      const name = (s.ten_sp || s.ten || '').toLowerCase();
      
      if (ct.includes(q) || main.includes(q) || name.includes(q)) {
        const key = realSkuCt.toUpperCase();
        if (!seen.has(key)) {
          seen.add(key);
          const parentSku = (s.sku && s.sku.length <= 5)
            ? s.sku
            : (s.id_sp && s.id_sp.length <= 5)
              ? s.id_sp
              : (realSkuCt.includes('-') ? realSkuCt.split('-')[0] : realSkuCt.substring(0, 4));

          allMatches.push({
            sku_ct: realSkuCt,
            sku: parentSku,
            ten_sp: s.ten_sp || s.ten || ''
          });
        }
      }
    }

    // 2. Tìm thêm trong udctData (Lịch sử đơn xuất gần nhất)
    for (let i = udctData.length - 1; i >= 0; i--) {
      const item = udctData[i];
      const realSkuCt = (item.sku_ct || item.id_sp_ct || '').trim();
      // SKU CT bắt buộc phải có độ dài > 5 ký tự
      if (!realSkuCt || realSkuCt.length <= 5) continue;
      
      const key = realSkuCt.toUpperCase();
      if (seen.has(key)) continue;

      const ct = realSkuCt.toLowerCase();
      const main = (item.id_sp || item.sku || item.sku_shop_up || '').toLowerCase();
      const name = (item.ten_sp || '').toLowerCase();
      
      if (ct.includes(q) || main.includes(q) || name.includes(q)) {
        seen.add(key);
        // Ưu tiên lấy tên chuẩn và mã cha từ sanphamData nếu tồn tại
        const sp = sanphamData.find(s => (s.sku_ct || s.sku_con || s.id_sp_ct || '').toUpperCase() === key);
        const parentSku = (sp?.sku && sp.sku.length <= 5)
          ? sp.sku
          : (sp?.id_sp && sp.id_sp.length <= 5)
            ? sp.id_sp
            : (item.id_sp && item.id_sp.length <= 5)
              ? item.id_sp
              : (item.sku && item.sku.length <= 5)
                ? item.sku
                : (realSkuCt.includes('-') ? realSkuCt.split('-')[0] : realSkuCt.substring(0, 4));

        allMatches.push({
          sku_ct: realSkuCt,
          sku: parentSku,
          ten_sp: sp?.ten_sp || sp?.ten || item.ten_sp || ''
        });
      }
    }

    // Sắp xếp gợi ý theo thứ tự Z-A
    allMatches.sort((a, b) => (b.sku_ct || '').localeCompare(a.sku_ct || ''));

    return allMatches.slice(0, 30);
  }, [sanphamData, udctData]);

  const transferSkuCtToMaGian = (code) => {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) return;
    setMaGian(clean);
    setSkuCt('');
    setSku('');
    setTenSp('');
    setSkuCtSuggestions([]);
    setDetectedMaGianInSkuCt('');
    toast.info(`💡 Đã nhận diện Mã gian (${clean}), tự động chuyển vào ô Mã gian!`, { autoClose: 2000 });
  };

  const selectSkuCtFromMaGian = (item) => {
    const chosenSkuCt = item.sku_ct || item.id_sp_ct || '';
    setSkuCt(chosenSkuCt);
    const chosenSku = (item.sku && item.sku.length <= 5)
      ? item.sku
      : (item.id_sp && item.id_sp.length <= 5)
        ? item.id_sp
        : (chosenSkuCt.includes('-') ? chosenSkuCt.split('-')[0] : chosenSkuCt.substring(0, 4));
    if (chosenSku) {
      setSku(chosenSku);
    }
    if (item.ten_sp) setTenSp(item.ten_sp);
    setMaGian('');
    setMaGianSuggestions([]);
    setMaGianSkuCtSuggestions([]);
    toast.info(`💡 Đã điền SKU CT: ${chosenSkuCt} (${chosenSku})`, { autoClose: 2000 });
  };

  const handleMaGianInput = (val) => {
    setMaGian(val);
    const raw = (val || '').trim();

    if (!raw) {
      setMaGianSuggestions(uniqueMaGianList.slice(0, 20));
      setMaGianSkuCtSuggestions([]);
      return;
    }

    // Yêu cầu: "ở ô mã gian tôi điền > 3 ký tự sẽ hiện gợi ý sku ct. ấn sẽ điền vào sku ct"
    if (raw.length > 3) {
      setMaGianSuggestions([]);
      const matches = searchSkuCtMatches(raw);
      setMaGianSkuCtSuggestions(matches);
      return;
    }

    // Nếu gõ <= 3 ký tự: tìm kiếm danh sách Mã gian
    setMaGianSkuCtSuggestions([]);
    const q = raw.toLowerCase();
    const matches = uniqueMaGianList.filter(m => m.toLowerCase().includes(q));
    setMaGianSuggestions(matches.slice(0, 20));
  };

  const handleMaGianBlur = () => {
    // Để trống để không ghi đè khi bấm vào gợi ý
  };



  // Tự động điền dữ liệu khi UD_CT được load hoặc khi MVD/MVD2/MDH thay đổi
  useEffect(() => {
    if (mode !== 'create' || !isOpen || udctData.length === 0) return;

    const findMatch = (val) => {
      if (!val) return null;
      const cleanVal = val.trim().toLowerCase();
      if (!cleanVal) return null;
      // Duyệt ngược để lấy đơn mới nhất
      for (let i = udctData.length - 1; i >= 0; i--) {
        const u = udctData[i];
        const mvdVal = (u.mvd || '').trim().toLowerCase();
        const mdhVal = (u.mdh || '').trim().toLowerCase();
        if ((mvdVal === cleanVal && cleanVal !== '') || (mdhVal === cleanVal && cleanVal !== '')) {
          return u;
        }
      }
      return null;
    };

    let match = null;
    let field = '';
    
    // Ưu tiên MVD -> MVD2 -> MDH
    if (mvd) {
      match = findMatch(mvd);
      field = 'mvd';
    }
    if (!match && mvd2) {
      match = findMatch(mvd2);
      field = 'mvd2';
    }
    if (!match && mdh) {
      match = findMatch(mdh);
      field = 'mdh';
    }

    if (match) {
      if (match.ma_gian) setMaGian(match.ma_gian);
      if (field !== 'mdh' && match.mdh) setMdh(match.mdh);
      if (field === 'mdh' && match.mvd && !mvd2) setMvd2(match.mvd);
      
      const skuCtVal = match.id_sp_ct || match.sku_ct || '';
      let finalSku = match.id_sp || match.sku || (skuCtVal ? (skuCtVal.includes('-') ? skuCtVal.split('-')[0] : skuCtVal.substring(0, 4)) : '');
      let finalTenSp = match.ten_sp || '';
      
      if (skuCtVal && sanphamData.length) {
        const sp = sanphamData.find((s) => (s.sku_ct || s.id_sp_ct || s.sku_con || '').toLowerCase() === skuCtVal.toLowerCase());
        if (sp) {
          finalSku = sp.sku || sp.id_sp || finalSku;
          finalTenSp = sp.ten_sp || sp.ten || finalTenSp;
        }
      }
      
      if (!skuCt && skuCtVal) setSkuCt(skuCtVal);
      if (!sku && finalSku) setSku(finalSku);
      if (!tenSp && finalTenSp) setTenSp(finalTenSp);
      if (slg === 1 && (match.slg_xuat || match.so_luong)) setSlg(parseFloat(match.slg_xuat || match.so_luong) || 1);
    }
  }, [udctData, isOpen, mvd, mvd2, mdh, mode]);

  useEffect(() => {
    if (!skuCt) {
      setTenSp('');
    } else {
      const cleanCt = skuCt.trim().toLowerCase();
      let sp = sanphamData.find(s => (s.sku_ct || s.id_sp_ct || s.sku_con || '').toLowerCase() === cleanCt);
      if (sp && (sp.ten_sp || sp.ten)) {
        setTenSp(sp.ten_sp || sp.ten);
      } else {
        let u = udctData.find(u => (u.sku_ct || u.id_sp_ct || '').toLowerCase() === cleanCt && u.ten_sp);
        if (u) {
          setTenSp(u.ten_sp);
        }
      }
    }
  }, [skuCt, sanphamData, udctData]);

  // Viewport keyboard sync ref
  const drawerRef = useRef(null);
  const maGianRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' || mode === 'copy') {
        setMvd(mode === 'copy' ? '' : initialData.mvd || '');
        setMvd2(mode === 'copy' ? '' : initialData.mvd_2 || '');
        setMaGian(initialData.ma_gian || '');
        setSku(initialData.sku || '');
        setSkuCt(mode === 'copy' ? '' : initialData.sku_ct || '');
        setSlg(parseFloat(initialData.slg) || 1);
        setHoanTra(initialData.trang_thai || 'Hoàn');
        setKho(initialData.kho || 'KHO');
        setTinhTrang(initialData.tinh_trang || '');
        setTenSp(initialData.ten_sp || '');
        setNgayNhan(initialData.ngay_nhan || getTodayYmd());
        setMdh(initialData.id_dh || '');
        setAnh1(initialData.anh_1 || '');
        setAnh2(initialData.anh_2 || '');
        setAnh3(initialData.anh_3 || '');
        setHistoryText('');
      } else {
        // mode === 'create'
        setMvd('');
        setMvd2('');
        setMaGian('');
        setSku('');
        setSkuCt('');
        setSlg(1);
        setHoanTra('Hoàn');
        setKho('KHO');
        setTinhTrang('');
        setTenSp('');
        setNgayNhan(getTodayYmd());
        setMdh('');
        setAnh1('');
        setAnh2('');
        setAnh3('');
        setHistoryText('');
      }

      setDuplicateMvdNotice('');
      setSkuCtSuggestions([]);
      setMvdSuggestions([]);
      setMvd2Suggestions([]);
      setMdhSuggestions([]);
    }
  }, [isOpen, initialData, mode]);

  // Mobile virtual keyboard resize sync
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (drawerRef.current) {
        // adjust height dynamically to fill visual viewport (useful when keyboard is open)
        drawerRef.current.style.height = `${window.visualViewport.height}px`;
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      if (drawerRef.current) {
        drawerRef.current.style.height = '100%';
      }
    };
  }, [isOpen]);

  // Click outside to close Ma Gian suggestions
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (maGianRef.current && !maGianRef.current.contains(e.target)) {
        setMaGianSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);




  const getSmartSuggestions = (text, currentMaGian) => {
    const q = text.trim().toLowerCase();
    if (!q) return [];
    
    const mg = (currentMaGian || '').trim().toLowerCase();
    
    // Nếu gõ chính mã gian vào ô tìm kiếm, trả về các đơn của gian đó (giới hạn 15)
    if (mg && q === mg) {
      return udctData
        .filter(item => (item.ma_gian || '').trim().toLowerCase() === mg)
        .reverse()
        .slice(0, 15);
    }
    
    // Tìm các dòng chứa q trong MVD hoặc MDH
    const allMatches = udctData.filter(item => {
       const mvdStr = (item.mvd || '').toLowerCase();
       const mdhStr = (item.mdh || '').toLowerCase();
       return mvdStr.includes(q) || mdhStr.includes(q);
    });
      
    // Ưu tiên dòng có ma_gian khớp với currentMaGian
    if (mg) {
      const strictMatches = allMatches.filter(item => (item.ma_gian || '').trim().toLowerCase() === mg);
      if (strictMatches.length > 0) {
        return strictMatches.reverse().slice(0, 15);
      }
    }
    
    // Nếu không khớp gian nào hoặc chưa nhập gian, trả về tất cả
    return allMatches.reverse().slice(0, 15);
  };

  const handleSelectRichSuggestion = (item, targetField) => {
    if (targetField === 'mvd') {
      setMvd(item.mvd || item.mdh || '');
      checkDuplicateNotice((item.mvd || item.mdh || '').trim());
    } else if (targetField === 'mvd2') {
      setMvd2(item.mvd || item.mdh || '');
    } else if (targetField === 'mdh') {
      setMdh(item.mdh || item.mvd || '');
      if (item.mvd) {
        setMvd2(item.mvd);
      }
    }
    
    if (mode === 'create') {
      if (item.ma_gian) setMaGian(item.ma_gian);
      if (targetField !== 'mdh' && item.mdh) setMdh(item.mdh);
      
      const skuCtVal = item.id_sp_ct || item.sku_ct || '';
      let finalSku = item.id_sp || item.sku || (skuCtVal ? (skuCtVal.includes('-') ? skuCtVal.split('-')[0] : skuCtVal.substring(0, 4)) : '');
      let finalTenSp = item.ten_sp || '';
      
      if (skuCtVal && sanphamData.length) {
        const sp = sanphamData.find((s) => (s.sku_ct || s.id_sp_ct || s.sku_con || '').toLowerCase() === skuCtVal.toLowerCase());
        if (sp) {
          finalSku = sp.sku || sp.id_sp || finalSku;
          finalTenSp = sp.ten_sp || sp.ten || finalTenSp;
        }
      }
      
      if (skuCtVal) setSkuCt(skuCtVal);
      if (finalSku) setSku(finalSku);
      if (finalTenSp) setTenSp(finalTenSp);
      if (item.slg_xuat || item.so_luong) setSlg(parseFloat(item.slg_xuat || item.so_luong) || 1);
    }
    
    setMvdSuggestions([]);
    setMvd2Suggestions([]);
    setMdhSuggestions([]);
  };

  const renderSuggestionItem = (item, type, index) => {
    const isMdhInput = type === 'mdh';
    const mainCode = isMdhInput ? (item.mdh || item.mvd || '-') : (item.mvd || item.mdh || '-');
    const subCode = isMdhInput 
      ? (item.mvd ? `MVD: ${item.mvd}` : '') 
      : (item.mdh ? `MDH: ${item.mdh}` : '');
    const slg = item.slg_xuat || item.so_luong || '1';
    const skuDisplay = item.id_sp_ct || item.id_sp || '';

    return (
      <div
        key={index}
        onClick={() => handleSelectRichSuggestion(item, type)}
        className="px-3 py-2 border-b border-slate-100 last:border-0 hover:bg-blue-50/70 active:bg-blue-100/70 cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-slate-900 text-xs truncate">{mainCode}</span>
            {subCode && (
              <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded font-medium shrink-0">
                {subCode}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded shrink-0">
            SL: {slg}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 truncate">
          {item.ma_gian && <span className="font-semibold text-slate-700 shrink-0">{item.ma_gian}</span>}
          {item.ma_gian && skuDisplay && <span className="text-slate-300">•</span>}
          {skuDisplay && <span className="text-indigo-600 font-medium shrink-0">{skuDisplay}</span>}
          {item.ten_sp && <span className="text-slate-300">•</span>}
          {item.ten_sp && <span className="truncate text-slate-600" title={item.ten_sp}>{item.ten_sp}</span>}
        </div>
      </div>
    );
  };

  const handleMvdChange = (val) => {
    setMvd(val);
    const cleanVal = val.trim();
    if (!cleanVal) {
      setDuplicateMvdNotice('');
      setMvdSuggestions([]);
      return;
    }
    setMvdSuggestions(getSmartSuggestions(val, maGian));
    checkDuplicateNotice(cleanVal);

  };

  const handleMvd2Input = (val) => {
    setMvd2(val);
    setMvd2Suggestions(getSmartSuggestions(val, maGian));

  };

  const handleMdhInput = (val) => {
    setMdh(val);
    setMdhSuggestions(getSmartSuggestions(val, maGian));

  };

  const checkDuplicateNotice = (val) => {
    const duplicate = hangHoanData.find(item => {
      const isDuplicateMvd = (item.mvd || '').toString().trim() === val || (item.mvd_2 || '').toString().trim() === val;
      if (!isDuplicateMvd) return false;
      if (mode === 'edit' && initialData && item.rowIndex === initialData.rowIndex) {
        return false;
      }
      return true;
    });

    if (duplicate) {
      setDuplicateMvdNotice(`MVD đã có trong Hàng hoàn ngày ${duplicate.ngay_nhan || '?'}`);
    } else {
      setDuplicateMvdNotice('');
    }
  };

  const handleSkuCtInput = (val) => {
    setSkuCt(val);
    if (val) {
      const guessed = val.includes('-') ? val.split('-')[0] : (val.length <= 4 ? val : val.substring(0, 4));
      setSku(guessed);
    } else {
      setSku('');
    }

    const q = val.trim().toLowerCase();
    if (!q) {
      setSkuCtSuggestions([]);
      setDetectedMaGianInSkuCt('');
      return;
    }

    // Kiểm tra nếu người dùng đang nhập Mã gian (3 ký tự không chứa '-') vào ô SKU CT
    const foundGian = (q.length === 3 && !q.includes('-'))
      ? uniqueMaGianList.find(m => m.toLowerCase() === q) || (/^[a-z0-9]{3}$/i.test(q) ? q.toUpperCase() : null)
      : null;
    setDetectedMaGianInSkuCt(foundGian || '');

    const matches = searchSkuCtMatches(q);
    setSkuCtSuggestions(matches);
  };

  const handleSkuCtBlur = () => {
    const raw = (skuCt || '').trim();
    // Mã gian có 3 ký tự (không có dấu -)
    if (raw.length === 3 && !raw.includes('-')) {
      const isGian = uniqueMaGianList.some(m => m.toLowerCase() === raw.toLowerCase()) || /^[A-Za-z0-9]{3}$/.test(raw);
      if (isGian) {
        transferSkuCtToMaGian(raw);
      }
    }
  };

  const selectSkuCt = (item) => {
    const chosenSkuCt = item.sku_ct || item.id_sp_ct || '';
    setSkuCt(chosenSkuCt);
    const chosenSku = (item.sku && item.sku.length <= 5)
      ? item.sku
      : (item.id_sp && item.id_sp.length <= 5)
        ? item.id_sp
        : (chosenSkuCt.includes('-') ? chosenSkuCt.split('-')[0] : chosenSkuCt.substring(0, 4));
    if (chosenSku) {
      setSku(chosenSku);
    }
    if (item.ten_sp) setTenSp(item.ten_sp);
    setSkuCtSuggestions([]);
    setDetectedMaGianInSkuCt('');
  };

  // Image Upload handler (Nén ảnh client + tải lên Telegram / Catbox)
  const handleImageUpload = async (e, slot) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset giá trị input để có thể chọn lại file cùng tên nếu muốn
    e.target.value = '';

    // Tạo preview ngay lập tức trên giao diện để người dùng không phải chờ
    const localPreview = URL.createObjectURL(file);
    if (slot === 1) setAnh1(localPreview);
    if (slot === 2) setAnh2(localPreview);
    if (slot === 3) setAnh3(localPreview);

    setUploadingSlots((prev) => ({ ...prev, [slot]: true }));

    try {
      const caption = `Hàng hoàn | MVD: ${mvd || 'Chưa rõ'} | Gian: ${maGian || 'Chưa rõ'} | SKU: ${skuCt || sku || 'Chưa rõ'}`;
      const cloudUrl = await uploadImage(file, { caption });
      if (cloudUrl) {
        if (slot === 1) setAnh1(cloudUrl);
        if (slot === 2) setAnh2(cloudUrl);
        if (slot === 3) setAnh3(cloudUrl);
      }
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      toast.warning('Tải ảnh cloud gặp sự cố, tạm lưu ảnh nén.');
    } finally {
      setUploadingSlots((prev) => ({ ...prev, [slot]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadingSlots[1] || uploadingSlots[2] || uploadingSlots[3]) {
      toast.warning('Ảnh đang được tải lên, vui lòng chờ trong giây lát...');
      return;
    }
    if (!mvd.trim()) {
      toast.warning('Vui lòng nhập Mã vận đơn (MVD)');
      return;
    }

    let finalMaGian = maGian.trim().toUpperCase();
    let finalSkuCt = skuCt.trim().toUpperCase();
    let finalSku = sku.trim().toUpperCase();
    let finalTenSp = tenSp.trim();

    // Tự động nhận diện và hoán đổi nếu điền nhầm giữa Mã gian và SKU CT:
    // 1. Mã gian bị điền nhầm SKU CT (> 5 ký tự hoặc chứa '-')
    if ((finalMaGian.length > 5 || finalMaGian.includes('-')) && (finalSkuCt.length <= 4 || !finalSkuCt)) {
      const temp = finalMaGian;
      finalMaGian = (finalSkuCt.length === 3 && !finalSkuCt.includes('-')) ? finalSkuCt : '';
      finalSkuCt = temp;
    }
    // 2. SKU CT bị điền nhầm Mã gian (3 ký tự không chứa '-')
    else if ((finalSkuCt.length === 3 && !finalSkuCt.includes('-')) && (!finalMaGian || finalMaGian.length > 5)) {
      if (!finalMaGian) {
        finalMaGian = finalSkuCt;
        finalSkuCt = '';
      }
    }

    // Đảm bảo nếu SKU CT có giá trị thì tự động bù mã cha và tên sản phẩm nếu còn thiếu
    if (finalSkuCt) {
      if (!finalSku) {
        finalSku = finalSkuCt.includes('-') ? finalSkuCt.split('-')[0] : (finalSkuCt.length <= 5 ? finalSkuCt : finalSkuCt.substring(0, 4));
      }
      if (!finalTenSp) {
        const sp = sanphamData.find(s => (s.sku_ct || s.sku_con || s.id_sp_ct || '').toUpperCase() === finalSkuCt);
        if (sp) {
          finalTenSp = sp.ten_sp || sp.ten || '';
          if (sp.sku || sp.id_sp) finalSku = sp.sku || sp.id_sp;
        }
      }
    }

    setSaving(true);
    try {
      const payload = {
        id: initialData?.id || `HH-${Date.now()}`,
        rowIndex: initialData?.rowIndex || null,
        ngay_nhan: ngayNhan,
        mvd: mvd.trim(),
        mvd_2: mvd2.trim(),
        ma_gian: finalMaGian,
        sku: finalSku,
        sku_ct: finalSkuCt,
        slg: slg,
        ten_sp: finalTenSp,
        kho: kho,
        tinh_trang: tinhTrang.trim(),
        trang_thai: hoanTra,
        anh_1: anh1,
        anh_2: anh2,
        anh_3: anh3,
        id_dh: mdh.trim(),
        ghi_chu: historyText,
      };

      await onSave(payload, mode);
      onClose();
    } catch (err) {
      toast.error('Lỗi khi lưu: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right"
      >
        {/* Drawer Header */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {mode === 'create'
                ? 'Thêm sản phẩm hàng hoàn'
                : mode === 'copy'
                ? 'Sao chép hàng hoàn'
                : 'Chi tiết hàng hoàn'}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 uppercase font-medium">
              Row ID: {initialData?.id || (mode === 'create' ? `NEW-${Date.now()}` : '-')}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {mode === 'edit' && !isKinhDoanh && (
              <button
                type="button"
                onClick={() => onCopy(initialData)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-all"
                title="Sao chép đơn này"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body Form */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
          <div className="grid grid-cols-2 gap-2.5">
            {/* MVD */}
            <div className="col-span-2">
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={mvd}
                    onChange={(e) => handleMvdChange(e.target.value)}
                    placeholder="Mã vận đơn chính (MVD)... *"
                    className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {mvd && (
                    <button
                      type="button"
                      onClick={() => setMvd('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onOpenQrScan((code) => handleMvdChange(code))}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 font-bold flex items-center gap-1 shrink-0"
                >
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span>QR</span>
                </button>
              </div>
            </div>

                          {/* Duplicate MVD Notice */}
            {duplicateMvdNotice && (
              <div className="col-span-2">
                <div className="bg-amber-50 text-amber-700 px-3 py-2 rounded-lg border border-amber-200 text-xs font-bold flex gap-2 items-center">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>{duplicateMvdNotice}</span>
                </div>
              </div>
            )}

                        {/* Mã gian */}
            <div ref={maGianRef} className="col-span-2 relative z-40">
              <input
                type="text"
                value={maGian}
                onChange={(e) => handleMaGianInput(e.target.value)}
                onBlur={handleMaGianBlur}
                onFocus={(e) => handleMaGianInput(e.target.value)}
                placeholder="Mã gian (gõ > 3 ký tự để tìm SKU CT)..."
                title="Mã gian (3 ký tự). Nếu gõ > 3 ký tự (VD: z068) sẽ hiện gợi ý SKU CT"
                className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {(maGian || maGianSuggestions.length > 0 || maGianSkuCtSuggestions.length > 0) && (
                <button
                  type="button"
                  onClick={() => { handleMaGianInput(''); setMaGianSuggestions([]); setMaGianSkuCtSuggestions([]); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 p-1 rounded-md text-xs font-bold transition-colors"
                  title={maGian ? "Xóa" : "Đóng gợi ý"}
                >
                  ✕
                </button>
              )}
              {(maGianSuggestions.length > 0 || maGianSkuCtSuggestions.length > 0) && (
                <div 
                  className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {/* Trường hợp gõ > 3 ký tự: Hiện gợi ý SKU CT */}
                  {maGianSkuCtSuggestions.length > 0 && (
                    <>
                      <div className="sticky top-0 bg-indigo-50 border-b border-indigo-200 px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-indigo-700 z-10">
                        <span>Gợi ý SKU CT ({maGianSkuCtSuggestions.length}) ➔ Bấm để điền vào SKU CT</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMaGianSkuCtSuggestions([]);
                          }}
                          className="text-slate-400 hover:text-rose-600 hover:bg-slate-200 px-1.5 py-0.5 rounded text-xs font-bold transition-colors flex items-center gap-1"
                          title="Đóng gợi ý"
                        >
                          <span>✕</span> Đóng
                        </button>
                      </div>
                      {maGianSkuCtSuggestions.map((item, i) => (
                        <div
                          key={i}
                          onClick={() => selectSkuCtFromMaGian(item)}
                          className="p-2.5 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-0 text-xs transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-indigo-700">{item.sku_ct || item.id_sp_ct}</span>
                            {item.sku && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium border border-indigo-200">
                                Mã: {item.sku}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate mt-0.5" title={item.ten_sp}>
                            {item.ten_sp || 'Chưa có tên SP'}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Trường hợp gõ <= 3 ký tự: Hiện gợi ý Mã gian */}
                  {maGianSuggestions.length > 0 && (
                    <>
                      <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-3 py-1 flex items-center justify-between text-[11px] font-bold text-slate-500 z-10">
                        <span>Gợi ý mã gian ({maGianSuggestions.length})</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMaGianSuggestions([]);
                          }}
                          className="text-slate-400 hover:text-rose-600 hover:bg-slate-200 px-1.5 py-0.5 rounded text-xs font-bold transition-colors flex items-center gap-1"
                          title="Đóng gợi ý"
                        >
                          <span>✕</span> Đóng
                        </button>
                      </div>
                      {maGianSuggestions.map((item, i) => (
                        <div
                          key={i}
                          onClick={() => { setMaGian(item); setMaGianSuggestions([]); setMaGianSkuCtSuggestions([]); }}
                          className="p-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 text-xs font-medium text-slate-700"
                        >
                          {item}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* SKU CT with Auto-suggestions */}
            <div className="col-span-2 relative z-30">
              <input
                type="text"
                value={skuCt}
                onChange={(e) => handleSkuCtInput(e.target.value)}
                onBlur={handleSkuCtBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const raw = (skuCt || '').trim();
                    if (raw.length === 3 && !raw.includes('-')) {
                      e.preventDefault();
                      transferSkuCtToMaGian(raw);
                    }
                  }
                }}
                onPaste={(e) => {
                  const pasteText = e.clipboardData.getData('text').trim();
                  if (pasteText.length === 3 && !pasteText.includes('-')) {
                    e.preventDefault();
                    transferSkuCtToMaGian(pasteText);
                  }
                }}
                placeholder="SKU chi tiết (10 ký tự)..."
                title="SKU Chi tiết (10 ký tự - VD: Z068-WH-00, 201B-NA-00...)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-blue-500/20 pr-8"
              />
              {(skuCt || skuCtSuggestions.length > 0 || detectedMaGianInSkuCt) && (
                <button
                  type="button"
                  onClick={() => { handleSkuCtInput(""); setSkuCtSuggestions([]); setDetectedMaGianInSkuCt(''); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 p-1 rounded-md text-xs font-bold transition-colors"
                  title="Xóa / Đóng gợi ý"
                >
                  ✕
                </button>
              )}

              {(skuCtSuggestions.length > 0 || detectedMaGianInSkuCt) && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                  {detectedMaGianInSkuCt && (
                    <div
                      onClick={() => transferSkuCtToMaGian(detectedMaGianInSkuCt)}
                      className="p-2.5 bg-amber-50 hover:bg-amber-100 border-b border-amber-200 cursor-pointer flex items-center justify-between text-xs text-amber-800 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>🏢 Nhận diện Mã gian:</span>
                        <span className="px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded">{detectedMaGianInSkuCt}</span>
                      </div>
                      <span className="text-[11px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-0.5 rounded shadow-xs">
                        Chuyển sang Mã gian ➔
                      </span>
                    </div>
                  )}

                  {skuCtSuggestions.length > 0 && (
                    <>
                      <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-500 z-10">
                        <span>Gợi ý SKU CT ({skuCtSuggestions.length})</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSkuCtSuggestions([]);
                          }}
                          className="text-slate-400 hover:text-rose-600 hover:bg-slate-200 px-1.5 py-0.5 rounded text-xs font-bold transition-colors flex items-center gap-1"
                          title="Đóng gợi ý"
                        >
                          <span>✕</span> Đóng
                        </button>
                      </div>
                      {skuCtSuggestions.map((item, i) => (
                        <div
                          key={i}
                          onClick={() => selectSkuCt(item)}
                          className="p-2.5 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 text-xs transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-indigo-700">{item.sku_ct || item.id_sp_ct}</span>
                            {item.sku && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium border border-slate-200">
                                Mã: {item.sku}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate mt-0.5" title={item.ten_sp}>
                            {item.ten_sp || 'Chưa có tên SP'}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* SKU */}
            <div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Mã SKU..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* SLG with Steppers */}
            <div>
              <div className="flex items-center h-8">
                <span className="px-2 text-[10px] font-bold text-slate-500 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg h-full flex items-center uppercase">SLG</span>
                <button
                  type="button"
                  onClick={() => setSlg((prev) => Math.max(1, prev - 1))}
                  className="w-7 h-full flex items-center justify-center border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={slg}
                  onChange={(e) => setSlg(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 w-full h-full text-center border-y border-slate-300 text-xs font-bold text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSlg((prev) => prev + 1)}
                  className="w-7 h-full flex items-center justify-center border border-slate-300 rounded-r-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Hoàn / Trả */}
            <div>
              <div className="flex items-center h-8 p-0.5 border border-slate-300 rounded-lg bg-slate-100 gap-1">
                {['Hoàn', 'Trả'].map((ht) => (
                  <button
                    key={ht}
                    type="button"
                    onClick={() => setHoanTra(ht)}
                    className={`flex-1 h-full rounded text-[11px] font-bold transition-all ${
                      hoanTra === ht
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {ht}
                  </button>
                ))}
              </div>
            </div>

            {/* Kho */}
            <div>
              <div className="flex items-center h-8 p-0.5 border border-slate-300 rounded-lg bg-slate-100 gap-1">
                {['KHO', 'BH'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKho(k)}
                    className={`flex-1 h-full rounded text-[11px] font-bold transition-all ${
                      kho === k
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Tình trạng */}
            <div className="col-span-2">
              <input
                type="text"
                value={tinhTrang}
                onChange={(e) => setTinhTrang(e.target.value)}
                placeholder="Tình trạng (vd: nguyên seal, vỡ vỏ, móp méo...)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Tên SP */}
            <div className="col-span-2">
              <input
                type="text"
                value={tenSp}
                readOnly
                placeholder="Tên sản phẩm (tự động theo SKU CT)..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-500 bg-slate-50 outline-none cursor-not-allowed"
              />
            </div>

{/* MVD 2 */}
              <div className="col-span-2 relative">
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={mvd2}
                      onChange={(e) => handleMvd2Input(e.target.value)}
                      onFocus={(e) => handleMvd2Input(e.target.value)}
                      placeholder="MVD 2 (Mã phụ)..."
                      className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {mvd2 && (
                      <button
                        type="button"
                        onClick={() => { setMvd2(''); setMvd2Suggestions([]); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenQrScan((code) => { setMvd2(code); setMvd2Suggestions([]); })}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 font-bold flex items-center gap-1 shrink-0"
                  >
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <span>QR</span>
                  </button>
                </div>
                
                {mvd2Suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                    {mvd2Suggestions.map((item, i) => renderSuggestionItem(item, 'mvd2', i))}
                  </div>
                )}
              </div>

              
{/* MDH */}
            <div className="col-span-2 relative">
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={mdh}
                    onChange={(e) => handleMdhInput(e.target.value)}
                    onFocus={(e) => handleMdhInput(e.target.value)}
                    placeholder="Mã đơn hàng / Order ID..."
                    className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 uppercase"
                  />
                  {mdh && (
                    <button
                      type="button"
                      onClick={() => { handleMdhInput(''); setMdhSuggestions([]); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              
              {mdhSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-slate-200 rounded-xl shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.15)] z-[100] max-h-56 overflow-y-auto">
                  {mdhSuggestions.map((item, i) => renderSuggestionItem(item, 'mdh', i))}
                </div>
              )}
            </div>

            
{/* Ngày nhận with Steppers */}
            <div className="col-span-2">
              <div className="flex items-center h-8">
                <span className="px-2 text-[10px] font-bold text-slate-500 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg h-full flex items-center uppercase whitespace-nowrap">Ngày nhận</span>
                <button
                  type="button"
                  onClick={() => setNgayNhan((prev) => shiftDate(prev, -1))}
                  className="w-8 h-full flex items-center justify-center border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  -
                </button>
                <input
                  type="date"
                  value={ngayNhan}
                  onChange={(e) => setNgayNhan(e.target.value)}
                  className="flex-1 w-full h-full text-center border-y border-slate-300 text-[11px] font-semibold text-slate-800 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setNgayNhan((prev) => shiftDate(prev, 1))}
                  className="w-8 h-full flex items-center justify-center border border-slate-300 rounded-r-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  +
                </button>
              </div>
            </div>


            
                        {/* 3 Real Photos Upload */}
            <div className="col-span-2 space-y-1.5 pt-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Ảnh thực tế (Tối đa 3 ảnh)</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { slot: 1, val: anh1, setter: setAnh1 },
                  { slot: 2, val: anh2, setter: setAnh2 },
                  { slot: 3, val: anh3, setter: setAnh3 },
                ].map(({ slot, val, setter }) => (
                  <div key={slot} className="relative aspect-square">
                    {val ? (
                      <div className="relative w-full h-full group rounded-lg overflow-hidden border border-slate-300">
                        <img src={val} alt={`Ảnh ${slot}`} className="w-full h-full object-cover" />
                        {uploadingSlots[slot] && (
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 z-5">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                            <span>Đang tải...</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setter('')}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700 transition-colors z-10"
                          title="Xóa ảnh"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer p-2 text-center relative">
                        {uploadingSlots[slot] ? (
                          <div className="flex flex-col items-center justify-center gap-1">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="text-[9px] font-bold text-slate-500">Đang tải...</span>
                          </div>
                        ) : (
                          <>
                            <Camera className="w-5 h-5 text-slate-400" />
                            <span className="text-[9px] font-bold text-slate-400 mt-1">Ảnh {slot}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, slot)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* History text */}
            {historyText && (
              <div className="col-span-2 mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-500 uppercase mb-1">
                  <History className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Lịch sử chỉnh sửa</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-[11px] text-slate-600 max-h-28 overflow-y-auto whitespace-pre-line font-mono">
                  {historyText}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Sticky Bottom Footer */}
        <div className="p-2.5 sm:p-3 border-t border-slate-200 flex items-center gap-2 bg-white shrink-0 sticky bottom-0 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-2 px-3 rounded-lg text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>{mode === 'create' || mode === 'copy' ? 'Thêm mới' : 'Lưu thay đổi'}</span>
            )}
          </button>

          {mode === 'edit' && !isKinhDoanh && (
            <button
              type="button"
              onClick={() => onDelete(initialData)}
              className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-600 font-bold rounded-lg hover:bg-rose-100 active:bg-rose-200 transition-all text-sm"
            >
              Xóa
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-all text-sm"
          >
            Hủy
          </button>
        </div>
      </div>
    </>
  );
}

