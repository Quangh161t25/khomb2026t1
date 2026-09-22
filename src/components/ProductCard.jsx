import React from 'react';
import { Package, Tag, ArrowRight } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';

export default function ProductCard({ product, onSelect }) {
  if (!product) return null;

  return (
    <div
      onClick={() => onSelect && onSelect(product)}
      className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            <Package className="w-5 h-5" />
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {product.sku_con || product.id_sp || 'SKU'}
          </span>
        </div>

        <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
          {product.ten_sp || 'Chua d?t tên'}
        </h4>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-500">Giá bán l?:</span>
          <span className="font-bold text-blue-600">
            {formatPrice(product.gia_ban_le || product.gia_ban || 0)}
          </span>
        </div>

        {product.ton_dau !== undefined && (
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500">T?n ban d?u:</span>
            <span className="font-semibold text-slate-700">{product.ton_dau}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
        <span>Chi ti?t</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
