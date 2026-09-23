import React, { useState, useEffect, useRef } from 'react';
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
  const [historyText, setHistoryText] = useState('');
  const [saving, setSaving] = useState(false);
  const [duplicateMvdNotice, setDuplicateMvdNotice] = useState('');

  // Suggestions state
  const [skuCtSuggestions, setSkuCtSuggestions] = useState([]);
  const [mvdSuggestions, setMvdSuggestions] = useState([]);
  const [mvd2Suggestions, setMvd2Suggestions] = useState([]);
  const [mdhSuggestions, setMdhSuggestions] = useState([]);

  // Viewport keyboard sync ref
  const drawerRef = useRef(null);

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

  // Handle slow network where UD_CT data loads AFTER the barcode is scanned
  useEffect(() => {
    if (isOpen && udctData.length > 0 && mvd && mode === 'create') {
      const cleanVal = mvd.trim();
      const match = udctData.find(
        (u) => (u.mvd || '').trim().toLowerCase() === cleanVal.toLowerCase() ||
               (u.mdh || '').trim().toLowerCase() === cleanVal.toLowerCase()
      );
      if (match) {
        if (!maGian && match.ma_gian) setMaGian(match.ma_gian);
        if (!mdh && match.mdh) setMdh(match.mdh);
        if (match.ngay) setNgayNhan(toYMD(match.ngay) || getTodayYmd());
        
        const skuCtVal = match.id_sp_ct || '';
        let finalSku = skuCtVal ? skuCtVal.substring(0, 4) : (match.sku_shop_up || match.id_sp || '');
        let finalTenSp = match.ten_sp || '';
        
        if (skuCtVal && (!finalSku || !finalTenSp)) {
          const sp = sanphamData.find((s) => (s.sku_ct || s.id_sp_ct || s.sku_con || '').toLowerCase() === skuCtVal.toLowerCase());
          if (sp) {
            if (!finalSku) finalSku = sp.sku || sp.id_sp || '';
            if (!finalTenSp) finalTenSp = sp.ten_sp || sp.ten || '';
          }
        }
        
        if (!sku && finalSku) setSku(finalSku);
        if (!skuCt && skuCtVal) setSkuCt(skuCtVal);
        if (!tenSp && finalTenSp) setTenSp(finalTenSp);
        setHoanTra('Hoàn');
      }
    }
  }, [udctData, isOpen, mvd, mode]);

  const getSmartSuggestions = (field, text, currentMaGian) => {
    const q = text.trim().toLowerCase();
    if (!q) return [];
    
    const mg = (currentMaGian || '').trim().toLowerCase();
    
    // Nếu gõ chính mã gian vào ô tìm kiếm, trả về tất cả mã của gian đó
    if (mg && q === mg) {
      return hangHoanData
        .filter(item => (item.ma_gian || '').trim().toLowerCase() === mg && item[field])
        .map(item => item[field])
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10);
    }
    
    // Tìm các dòng chứa q
    const allMatches = hangHoanData
      .filter(item => item[field] && item[field].toLowerCase().includes(q));
      
    // Ưu tiên dòng có ma_gian khớp với currentMaGian
    if (mg) {
      const strictMatches = allMatches.filter(item => (item.ma_gian || '').trim().toLowerCase() === mg);
      if (strictMatches.length > 0) {
        return strictMatches
          .map(item => item[field])
          .filter((v, i, a) => a.indexOf(v) === i)
          .slice(0, 10);
      }
    }
    
    // Nếu không khớp gian nào hoặc chưa nhập gian, trả về tất cả
    return allMatches
      .map(item => item[field])
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 10);
  };

  const selectMvd = (val) => {
    setMvd(val);
    setMvdSuggestions([]);
  };

  // MVD change & duplicate / auto-fill check
  const handleMvdChange = (val) => {
    setMvd(val);
    const cleanVal = val.trim();
    if (!cleanVal) {
      setDuplicateMvdNotice('');
      setMvdSuggestions([]);
      return;
    }
    setMvdSuggestions(getSmartSuggestions('mvd', val, maGian));

    // Auto-fill from UD_CT if matching MVD or MDH
    const match = udctData.find(
      (u) => (u.mvd || '').trim().toLowerCase() === cleanVal.toLowerCase() ||
             (u.mdh || '').trim().toLowerCase() === cleanVal.toLowerCase()
    );
    if (match && mode === 'create') {
      if (match.ma_gian) setMaGian(match.ma_gian);
      if (match.mdh) setMdh(match.mdh);
      if (match.ngay) setNgayNhan(toYMD(match.ngay) || getTodayYmd());
      
      const skuCtVal = match.id_sp_ct || '';
        let finalSku = skuCtVal ? skuCtVal.substring(0, 4) : (match.sku_shop_up || match.id_sp || '');
        let finalTenSp = match.ten_sp || '';
      
      if (skuCtVal && (!finalSku || !finalTenSp)) {
        const sp = sanphamData.find((s) => (s.sku_ct || s.id_sp_ct || s.sku_con || '').toLowerCase() === skuCtVal.toLowerCase());
        if (sp) {
          if (!finalSku) finalSku = sp.sku || sp.id_sp || '';
          if (!finalTenSp) finalTenSp = sp.ten_sp || sp.ten || '';
        }
      }
      
      if (finalSku) setSku(finalSku);
      if (skuCtVal) setSkuCt(skuCtVal);
      if (finalTenSp) setTenSp(finalTenSp);
      if (match.so_luong) setSlg(parseFloat(match.so_luong) || 1);
      setHoanTra('Hoàn');

      // Nếu nhập mã là MDH, thì cập nhật lại ô MVD cho đúng
      if (match.mdh && match.mdh.trim().toLowerCase() === cleanVal.toLowerCase()) {
        if (match.mvd && match.mvd.trim().toLowerCase() !== cleanVal.toLowerCase()) {
          setMvd(match.mvd.trim());
        }
      }
    } else if (!match && mode === 'create') {
      setHoanTra('Trả');
    }

    checkDuplicateNotice(cleanVal);
  };

  // MDH change & auto-fill check
  const handleMdhChange = (val) => {
    setMdh(val);
    const cleanVal = val.trim();
    if (!cleanVal) {
      setDuplicateMvdNotice('');
      return;
    }

    const match = udctData.find(
      (u) => (u.mdh || '').trim().toLowerCase() === cleanVal.toLowerCase() ||
             (u.mvd || '').trim().toLowerCase() === cleanVal.toLowerCase()
    );

    if (match && mode === 'create') {
      if (match.ma_gian) setMaGian(match.ma_gian);
      if (match.mvd && !mvd) setMvd(match.mvd);
      if (match.ngay) setNgayNhan(toYMD(match.ngay) || getTodayYmd());
      
      const skuCtVal = match.id_sp_ct || '';
        let finalSku = skuCtVal ? skuCtVal.substring(0, 4) : (match.sku_shop_up || match.id_sp || '');
        let finalTenSp = match.ten_sp || '';
      
      if (skuCtVal && (!finalSku || !finalTenSp)) {
        const sp = sanphamData.find((s) => (s.sku_ct || s.id_sp_ct || s.sku_con || '').toLowerCase() === skuCtVal.toLowerCase());
        if (sp) {
          if (!finalSku) finalSku = sp.sku || sp.id_sp || '';
          if (!finalTenSp) finalTenSp = sp.ten_sp || sp.ten || '';
        }
      }
      
      if (finalSku) setSku(finalSku);
      if (skuCtVal) setSkuCt(skuCtVal);
      if (finalTenSp) setTenSp(finalTenSp);
      if (match.so_luong) setSlg(parseFloat(match.so_luong) || 1);
      setHoanTra('Hoàn');
      
      if (match.mvd && match.mvd.trim().toLowerCase() === cleanVal.toLowerCase()) {
        if (match.mdh && match.mdh.trim().toLowerCase() !== cleanVal.toLowerCase()) {
          setMdh(match.mdh.trim());
        }
      }
    } else if (!match && mode === 'create') {
      setHoanTra('Trả');
    }

    checkDuplicateNotice(cleanVal);
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

  // SKU CT auto-suggestions
  const handleSkuCtInput = (val) => {
    setSkuCt(val);
    if (val) {
      setSku(val.substring(0, 4));
    } else {
      setSku('');
    }

    const q = val.trim().toLowerCase();
    if (!q) {
      setSkuCtSuggestions([]);
      return;
    }

    const udctMatches = [];
    const seen = new Set();
    
    for (const item of udctData) {
      const ct = (item.sku_ct || item.id_sp_ct || '').toLowerCase();
      const main = (item.sku_shop_up || item.id_sp || '').toLowerCase();
      const name = (item.ten_sp || '').toLowerCase();
      
      if (ct.includes(q) || main.includes(q) || name.includes(q)) {
        const key = ct || main;
        if (key && !seen.has(key)) {
          seen.add(key);
          udctMatches.push({
            sku_ct: item.id_sp_ct,
            sku: item.id_sp || item.sku_shop_up,
            ten_sp: item.ten_sp
          });
          if (udctMatches.length >= 8) break;
        }
      }
    }

    const spMatches = [];
    if (udctMatches.length < 8) {
      for (const s of sanphamData) {
        const ct = (s.sku_ct || s.id_sp_ct || s.sku_con || '').toLowerCase();
        const main = (s.sku || s.id_sp || '').toLowerCase();
        const name = (s.ten_sp || '').toLowerCase();
        
        if (ct.includes(q) || main.includes(q) || name.includes(q)) {
          const key = ct || main;
          if (key && !seen.has(key)) {
            seen.add(key);
            spMatches.push({
              sku_ct: s.sku_con || '',
              sku: s.id_sp,
              ten_sp: s.ten_sp || s.ten
            });
            if (udctMatches.length + spMatches.length >= 8) break;
          }
        }
      }
    }

    setSkuCtSuggestions([...udctMatches, ...spMatches]);
  };

  const selectSkuCt = (item) => {
    const chosenSkuCt = item.sku_ct || item.id_sp_ct || '';
    setSkuCt(chosenSkuCt);
    if (chosenSkuCt) {
      setSku(chosenSkuCt.substring(0, 4));
    } else if (item.sku || item.id_sp) {
      setSku(item.sku || item.id_sp);
    }
    if (item.ten_sp) setTenSp(item.ten_sp);
    setSkuCtSuggestions([]);
  };

  const handleMvd2Input = (val) => {
    setMvd2(val);
    setMvd2Suggestions(getSmartSuggestions('mvd_2', val, maGian));
  };

  const selectMvd2 = (val) => {
    setMvd2(val);
    setMvd2Suggestions([]);
  };

  const handleMdhInput = (val) => {
    setMdh(val);
    setMdhSuggestions(getSmartSuggestions('id_dh', val, maGian));
  };

  const selectMdh = (val) => {
    setMdh(val);
    setMdhSuggestions([]);
  };

  // Image Upload handler (Convert to base64 or upload to ImgBB)
  const handleImageUpload = async (e, slot) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Direct Base64 preview or ImgBB upload
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      if (slot === 1) setAnh1(base64Data);
      if (slot === 2) setAnh2(base64Data);
      if (slot === 3) setAnh3(base64Data);

      // Attempt ImgBB upload in background for permanent link
      try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(
          `https://api.imgbb.com/1/upload?key=${CONFIG.imgbbApiKey}`,
          { method: 'POST', body: formData }
        );
        const json = await res.json();
        if (json?.data?.url) {
          if (slot === 1) setAnh1(json.data.url);
          if (slot === 2) setAnh2(json.data.url);
          if (slot === 3) setAnh3(json.data.url);
        }
      } catch (err) {
        console.warn('ImgBB upload error, using local data:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mvd.trim()) {
      toast.warning('Vui lòng nhập Mã vận đơn (MVD)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: initialData?.id || `HH-${Date.now()}`,
        rowIndex: initialData?.rowIndex || null,
        ngay_nhan: ngayNhan,
        mvd: mvd.trim(),
        mvd_2: mvd2.trim(),
        ma_gian: maGian.trim(),
        sku: sku.trim(),
        sku_ct: skuCt.trim(),
        slg: slg,
        ten_sp: tenSp.trim(),
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
                    className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
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
                  className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 font-bold flex items-center gap-1 shrink-0"
                >
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span>QR</span>
                </button>
              </div>
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
                      className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
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
                    className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 font-bold flex items-center gap-1 shrink-0"
                  >
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <span>QR</span>
                  </button>
                </div>
                
                {mvd2Suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                    {mvd2Suggestions.map((item, i) => (
                      <div
                        key={i}
                        onClick={() => selectMvd2(item)}
                        className="p-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 text-xs font-semibold text-slate-700"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
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
            <div>
              <input
                type="text"
                value={maGian}
                onChange={(e) => setMaGian(e.target.value)}
                placeholder="Mã gian..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* SKU CT with Auto-suggestions */}
            <div className="relative">
              <input
                type="text"
                value={skuCt}
                onChange={(e) => handleSkuCtInput(e.target.value)}
                placeholder="SKU chi tiết (SKU CT)..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-blue-500/20"
              />

              {skuCtSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                  {skuCtSuggestions.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => selectSkuCt(item)}
                      className="p-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 text-xs"
                    >
                      <div className="font-bold text-indigo-700">{item.sku_ct || item.id_sp_ct}</div>
                      <div className="text-[10px] text-slate-500 truncate">{item.ten_sp || item.sku}</div>
                    </div>
                  ))}
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
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* SLG with Steppers */}
            <div>
              <div className="flex items-center h-8">
                <span className="px-2 text-[10px] font-bold text-slate-500 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg h-full flex items-center uppercase">SLG</span>
                <button
                  type="button"
                  onClick={() => setSlg((prev) => Math.max(1, prev - 1))}
                  className="w-7 h-full flex items-center justify-center border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={slg}
                  onChange={(e) => setSlg(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 w-full h-full text-center border-y border-slate-200 text-xs font-bold text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSlg((prev) => prev + 1)}
                  className="w-7 h-full flex items-center justify-center border border-slate-200 rounded-r-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Hoàn / Trả */}
            <div>
              <div className="flex items-center h-8 p-0.5 border border-slate-200 rounded-lg bg-slate-100 gap-1">
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
              <div className="flex items-center h-8 p-0.5 border border-slate-200 rounded-lg bg-slate-100 gap-1">
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
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Tên SP */}
            <div className="col-span-2">
              <input
                type="text"
                value={tenSp}
                onChange={(e) => setTenSp(e.target.value)}
                placeholder="Tên sản phẩm..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Ngày nhận with Steppers */}
            <div className="col-span-2">
              <div className="flex items-center h-8">
                <span className="px-2 text-[10px] font-bold text-slate-500 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg h-full flex items-center uppercase whitespace-nowrap">Ngày nhận</span>
                <button
                  type="button"
                  onClick={() => setNgayNhan((prev) => shiftDate(prev, -1))}
                  className="w-8 h-full flex items-center justify-center border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  -
                </button>
                <input
                  type="date"
                  value={ngayNhan}
                  onChange={(e) => setNgayNhan(e.target.value)}
                  className="flex-1 w-full h-full text-center border-y border-slate-200 text-[11px] font-semibold text-slate-800 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setNgayNhan((prev) => shiftDate(prev, 1))}
                  className="w-8 h-full flex items-center justify-center border border-slate-200 rounded-r-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* MDH */}
            <div className="col-span-2">
              <input
                type="text"
                value={mdh}
                onChange={(e) => handleMdhChange(e.target.value)}
                placeholder="MDH (Mã đơn hàng)..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
              />
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
                      <div className="relative w-full h-full group rounded-lg overflow-hidden border border-slate-200">
                        <img src={val} alt={`Ảnh ${slot}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setter('')}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700 transition-colors"
                          title="Xóa ảnh"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer p-2 text-center">
                        <Camera className="w-5 h-5 text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-400 mt-1">Ảnh {slot}</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
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

