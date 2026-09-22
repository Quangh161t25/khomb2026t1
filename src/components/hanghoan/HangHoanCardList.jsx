import React, { useState, useEffect } from 'react';
import { formatYmdToDmy } from '../../utils/dateUtils';
import { formatNumber } from '../../utils/formatters';

export default function HangHoanCardList({
  items,
  data,
  skuTongMap,
  selectedIds = [],
  setSelectedIds = () => {},
  onOpenDetail = () => {},
  onOpenImagePreview = () => {},
}) {
  const list = data || items || [];
  const [displayLimit, setDisplayLimit] = useState(50);

  useEffect(() => {
    setDisplayLimit(50);
  }, [list.length]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(list.map(i => i.id || i.rowIndex));
    } else {
      setSelectedIds([]);
    }
  };

  const isAllSelected = list.length > 0 && selectedIds.length === list.length;

  const handleSelectRow = (e, item) => {
    e.stopPropagation();
    const id = item.id || item.rowIndex;
    if (e.target.checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  if (list.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        Không có dữ liệu hàng hoàn phù hợp với bộ lọc.
      </div>
    );
  }

  const displayedList = list.slice(0, displayLimit);

  return (
    <div className="space-y-2.5 p-2 sm:p-3">
      {/* Select All Checkbox for Mobile */}
      <div className="flex items-center gap-2 px-1 mb-2">
        <input 
          type="checkbox" 
          id="selectAllMobile"
          checked={isAllSelected}
          onChange={handleSelectAll}
          className="w-4 h-4 cursor-pointer accent-blue-600 rounded border-slate-300"
        />
        <label htmlFor="selectAllMobile" className="text-xs font-bold text-slate-600 cursor-pointer">
          Chọn tất cả ({list.length})
        </label>
      </div>

      {displayedList.map((item, index) => {
        const imgUrl = (item.anh_3 || item.anh_1 || item.anh_2 || '').trim();
        const displayNgay = formatYmdToDmy(item.ngay_nhan) || item.ngay_nhan;
        const isTra =
          (item.trang_thai || '').toLowerCase() === 'trả' ||
          (item.trang_thai || '').toLowerCase() === 'tra';
        const maGian = item.ma_gian || 'Chưa có gian';
        const isSelected = selectedIds.includes(item.id || item.rowIndex);

        return (
          <div
            key={item.id ? `${item.id}-${index}` : index}
            onClick={() => onOpenDetail(item, index)}
            className={`rounded-xl border p-3 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.99] space-y-1.5 ${
              item.isOffline ? 'bg-orange-100 border-orange-300 hover:border-orange-400' :
              isSelected ? 'bg-blue-50/70 border-blue-300' : 'bg-white border-slate-200 hover:border-indigo-300'
            }`}
          >
            {/* Dòng 1: Checkbox + MVD in đậm nổi bật + MVD 2 (cùng 1 hàng, không ngắt dòng) */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5 overflow-x-auto no-scrollbar whitespace-nowrap">
              <input 
                type="checkbox" 
                checked={isSelected}
                onChange={(e) => handleSelectRow(e, item)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 cursor-pointer accent-blue-600 rounded border-slate-300 shrink-0"
              />
              <span className="font-bold text-sm text-slate-900 tracking-tight select-all shrink-0">
                {item.mvd || 'Không có MVD'}
              </span>
              {item.mvd_2 && (
                <span
                  className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium border border-slate-200 select-all shrink-0"
                  title={`MVD 2: ${item.mvd_2}`}
                >
                  {item.mvd_2}
                </span>
              )}
            </div>

            {/* Main body: Dòng 2, 3, 4 + Ảnh thumbnail bên phải */}
            <div className="flex items-start gap-3 pt-0.5">
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Dòng 2: 🏪 Gian hàng & 📅 Ngày nhận . nhãn Trạng thái (Hoàn / Trả) và nhãn Kho (KHO / BH) */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                      🏪 {maGian}
                    </span>
                    <span>📅 {displayNgay}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {item.trang_thai && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                          isTra
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {isTra ? 'Trả' : 'Hoàn'}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {item.kho || 'KHO'}
                    </span>
                  </div>
                </div>

                {/* Dòng 3: SKU CT + Số lượng (ví dụ: x1) Tên sản phẩm */}
                <div
                  className="text-xs text-slate-800 flex items-center gap-1.5 truncate"
                  title={`${item.sku_ct || item.sku || 'Chưa có SKU'} x${formatNumber(item.slg || 1)} ${
                    item.ten_sp ? `- ${item.ten_sp}` : ''
                  }`}
                >
                  <span className="font-bold text-indigo-700 shrink-0">
                    {item.sku_ct || item.sku || 'Chưa có SKU'}
                  </span>
                  <span className="font-bold text-slate-900 shrink-0">
                    x{formatNumber(item.slg || 1)}
                  </span>
                  {item.ten_sp && (
                    <span className="text-slate-600 truncate font-medium">{item.ten_sp}</span>
                  )}
                </div>

                {/* Dòng 4: Tình trạng hàng */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium">Tình trạng:</span>
                  <span
                    className={`font-semibold ${
                      item.tinh_trang ? 'text-slate-800' : 'text-slate-400 italic'
                    }`}
                  >
                    {item.tinh_trang || 'Chưa ghi nhận'}
                  </span>
                </div>
              </div>

              {/* Thumbnail Image Preview */}
              {imgUrl && (
                <div
                  className="shrink-0 self-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenImagePreview(imgUrl);
                  }}
                >
                  <img
                    src={imgUrl}
                    alt="Ảnh kiện hàng"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-xs hover:opacity-85 active:scale-95 transition-all"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {list.length > displayLimit && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setDisplayLimit((prev) => prev + 50)}
            className="w-full py-2.5 bg-white hover:bg-slate-50 text-blue-600 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          >
            Hiển thị thêm ({displayedList.length} / {list.length.toLocaleString('vi-VN')} thẻ) ➔
          </button>
        </div>
      )}
    </div>
  );
}
