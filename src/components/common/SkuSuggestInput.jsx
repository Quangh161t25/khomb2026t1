import React, { useState, useMemo, useRef, useEffect } from 'react';

/**
 * Ô nhập SKU có gợi ý từ danh sách sản phẩm (DS_SP).
 * products: [{ sku_ct, sku, ten_sp }]
 * onSelect(product) được gọi khi chọn 1 dòng gợi ý (sau onChange).
 */
export default function SkuSuggestInput({ value, onChange, onSelect, products = [], placeholder, className }) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef(null);

  // Đóng gợi ý khi bấm ra ngoài
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const suggestions = useMemo(() => {
    const q = (value || '').trim().toLowerCase();
    if (!q) return [];
    const starts = [];
    const contains = [];
    for (const p of products) {
      const ct = (p.sku_ct || '').toLowerCase();
      const cha = (p.sku || '').toLowerCase();
      const name = (p.ten_sp || '').toLowerCase();
      if (ct.startsWith(q) || cha.startsWith(q)) starts.push(p);
      else if (ct.includes(q) || cha.includes(q) || name.includes(q)) contains.push(p);
      if (starts.length >= 30) break;
    }
    return [...starts, ...contains].slice(0, 30);
  }, [value, products]);

  const choose = (p) => {
    onChange(p.sku_ct);
    if (onSelect) onSelect(p);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open || !suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value.toUpperCase());
          setActiveIdx(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-500">
            Gợi ý từ DS_SP ({suggestions.length})
          </div>
          {suggestions.map((p, i) => (
            <div
              key={`${p.sku_ct}-${i}`}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(p);
              }}
              onMouseEnter={() => setActiveIdx(i)}
              className={`px-3 py-1.5 cursor-pointer border-b border-slate-50 ${
                i === activeIdx ? 'bg-indigo-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-indigo-700 text-xs">{p.sku_ct}</span>
                {p.sku && p.sku !== p.sku_ct && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">{p.sku}</span>
                )}
              </div>
              {p.ten_sp && <div className="text-[11px] text-slate-500 truncate">{p.ten_sp}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
