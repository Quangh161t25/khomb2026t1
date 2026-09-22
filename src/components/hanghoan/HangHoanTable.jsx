import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { formatYmdToDmy } from '../../utils/dateUtils';
import { formatNumber } from '../../utils/formatters';
import { useColumnWidths } from '../../context/ColumnWidthContext';
import ResizableTh from '../common/ResizableTh';
import FooterPortal from '../common/FooterPortal';
import Pagination from '../common/Pagination';

export default function HangHoanTable({
  items,
  data,
  skuTongMap,
  selectedIds = [],
  setSelectedIds = () => {},
  onOpenDetail = () => {},
  onOpenImagePreview = () => {},
}) {
  const list = data || items || [];
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const { getColumnWidth, isColumnVisible } = useColumnWidths();

  const colStyle = useCallback(
    (key, defaultW) => {
      if (!isColumnVisible('hang_hoan', key)) return { display: 'none' };
      const w = getColumnWidth('hang_hoan', key, defaultW);
      return { width: `${w}px`, minWidth: `${w}px`, maxWidth: `${w}px` };
    },
    [getColumnWidth, isColumnVisible]
  );

  // Reset page when list length changes
  useEffect(() => {
    setCurrentPage(1);
  }, [list.length]);

  const effectivePageSize = pageSize === 'all' ? Math.max(1, list.length) : pageSize;
  const totalPages = Math.max(1, Math.ceil(list.length / effectivePageSize));
  const paginatedList = useMemo(() => {
    if (pageSize === 'all') return list;
    const start = (currentPage - 1) * pageSize;
    return list.slice(start, start + pageSize);
  }, [list, currentPage, pageSize]);

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
      <div className="p-8 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
        Không có dữ liệu hàng hoàn phù hợp với bộ lọc.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col flex-1 min-h-[400px]">
      <div className="overflow-x-auto table-container flex-1 max-h-[calc(100vh-235px)] custom-scrollbar">
        <table className="w-full min-w-[980px] border-collapse text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase sticky top-0 z-10 select-none shadow-2xs">
            <tr>
              <th className="px-3 py-2 text-center w-10 min-w-[40px] max-w-[40px] border-r border-slate-200">
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer accent-blue-600 rounded border-slate-300"
                />
              </th>
              <ResizableTh moduleId="hang_hoan" columnKey="ngay_nhan" defaultWidth={100} align="center">Ngày nhận</ResizableTh>
              <ResizableTh moduleId="hang_hoan" columnKey="mvd" defaultWidth={150} align="left">MVD</ResizableTh>
              <ResizableTh moduleId="hang_hoan" columnKey="mvd_2" defaultWidth={150} align="left">MVD 2</ResizableTh>
              <ResizableTh moduleId="hang_hoan" columnKey="ma_gian" defaultWidth={100} align="center">Mã gian</ResizableTh>
              <ResizableTh moduleId="hang_hoan" columnKey="sku" defaultWidth={100} align="center">SKU</ResizableTh>
              <ResizableTh moduleId="hang_hoan" columnKey="sku_ct" defaultWidth={140} align="left">SKU CT</ResizableTh>
              <ResizableTh moduleId="hang_hoan" columnKey="slg" defaultWidth={70} align="right">SLG</ResizableTh>
              <ResizableTh moduleId="hang_hoan" columnKey="ten_sp" defaultWidth={190} align="left">Tên SP</ResizableTh>
              <ResizableTh moduleId="hang_hoan" columnKey="kho" defaultWidth={80} align="center">Kho</ResizableTh>
              <ResizableTh moduleId="hang_hoan" columnKey="tinh_trang" defaultWidth={100} align="center">Tình trạng</ResizableTh>
              <ResizableTh moduleId="hang_hoan" columnKey="trang_thai" defaultWidth={100} align="center">Trạng thái</ResizableTh>
              <ResizableTh moduleId="hang_hoan" columnKey="sku_tong" defaultWidth={150} align="left">SKU tổng</ResizableTh>
              <ResizableTh moduleId="hang_hoan" columnKey="anh" defaultWidth={70} align="center">Ảnh</ResizableTh>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
            {paginatedList.map((item, index) => {
              const imgUrl = (item.anh_3 || item.anh_1 || item.anh_2 || '').trim();
              const displayNgay = formatYmdToDmy(item.ngay_nhan) || item.ngay_nhan;
              const isTra =
                (item.trang_thai || '').toLowerCase() === 'trả' ||
                (item.trang_thai || '').toLowerCase() === 'tra';
              const key = `${(item.ngay_nhan || '').toString().trim()}|${(item.mvd || '').toString().trim()}`;
              const bucket = skuTongMap?.get(key);
              const skuTong = bucket?.skuTong || item.sku_tong || '-';
              const maGian = item.ma_gian || '';
              
              const isSelected = selectedIds.includes(item.id || item.rowIndex);

              return (
                <tr
                  key={item.id ? `${item.id}-${index}` : index}
                  onClick={() => onOpenDetail(item, index)}
                  className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/70 hover:bg-blue-100/70' : 'hover:bg-blue-50/50'}`}
                >
                  <td className="px-3 py-2 text-center border-r border-slate-100" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={(e) => handleSelectRow(e, item)}
                      className="w-4 h-4 cursor-pointer accent-blue-600 rounded border-slate-300"
                    />
                  </td>
                  <td
                    className="px-3 py-2 text-center text-slate-700 whitespace-nowrap font-medium overflow-hidden text-ellipsis"
                    style={colStyle('ngay_nhan', 100)}
                  >
                    {displayNgay}
                  </td>
                  <td
                    className="px-3 py-2 text-left font-bold text-slate-900 font-mono select-all whitespace-nowrap overflow-hidden text-ellipsis"
                    style={colStyle('mvd', 150)}
                  >
                    {item.mvd}
                  </td>
                  <td
                    className="px-3 py-2 text-left text-slate-600 font-mono select-all whitespace-nowrap overflow-hidden text-ellipsis"
                    style={colStyle('mvd_2', 150)}
                  >
                    {item.mvd_2 || '-'}
                  </td>
                  <td
                    className="px-3 py-2 text-center font-semibold text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis"
                    style={colStyle('ma_gian', 100)}
                  >
                    {maGian || '-'}
                  </td>
                  <td
                    className="px-3 py-2 text-center text-slate-600 font-mono whitespace-nowrap overflow-hidden text-ellipsis"
                    style={colStyle('sku', 100)}
                  >
                    {item.sku || '-'}
                  </td>
                  <td
                    className="px-3 py-2 text-left font-bold text-indigo-700 font-mono whitespace-nowrap overflow-hidden text-ellipsis"
                    style={colStyle('sku_ct', 140)}
                  >
                    {item.sku_ct || '-'}
                  </td>
                  <td
                    className="px-3 py-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis"
                    style={colStyle('slg', 70)}
                  >
                    {formatNumber(item.slg || 1)}
                  </td>
                  <td
                    className="px-3 py-2 text-left truncate overflow-hidden text-ellipsis"
                    style={colStyle('ten_sp', 190)}
                    title={item.ten_sp || ''}
                  >
                    {item.ten_sp || '-'}
                  </td>
                  <td
                    className="px-3 py-2 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
                    style={colStyle('kho', 80)}
                  >
                    {item.kho || 'KHO'}
                  </td>
                  <td
                    className="px-3 py-2 text-center text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis"
                    style={colStyle('tinh_trang', 100)}
                  >
                    {item.tinh_trang || '-'}
                  </td>
                  <td
                    className="px-3 py-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                    style={colStyle('trang_thai', 100)}
                  >
                    {item.trang_thai ? (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border inline-block ${
                          isTra
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {isTra ? 'Trả' : 'Hoàn'}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td
                    className="px-3 py-2 text-left truncate text-slate-600 overflow-hidden text-ellipsis"
                    style={colStyle('sku_tong', 150)}
                    title={skuTong}
                  >
                    {skuTong}
                  </td>
                  <td
                    className="px-3 py-2 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                    style={colStyle('anh', 70)}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt="Ảnh"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenImagePreview(imgUrl);
                        }}
                        className="w-8 h-8 object-cover rounded-lg border border-slate-200 mx-auto hover:opacity-80 active:scale-95 transition-all shadow-xs"
                      />
                    ) : (
                      <span className="text-[11px] text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination rendered in Bottom Footer */}
      <FooterPortal>
        <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
          <span className="text-slate-300 font-medium hidden sm:inline">•</span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRows={list.length}
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
  );
}
