import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useColumnWidths } from '../../context/ColumnWidthContext';

export default function ResizableTh({
  moduleId,
  columnKey,
  defaultWidth = 100,
  minWidth = 50,
  align = 'left',
  className = '',
  style = {},
  sticky = false,
  stickyClass = '',
  canResize = true,
  children,
  onClick,
  title,
}) {
  const { getColumnWidth, updateColumnWidth, isColumnVisible, getColumnLabel } =
    useColumnWidths();
  const width = getColumnWidth(moduleId, columnKey, defaultWidth);
  const isVisible = isColumnVisible ? isColumnVisible(moduleId, columnKey) : true;
  const customLabel = getColumnLabel ? getColumnLabel(moduleId, columnKey) : '';
  const displayContent = customLabel && customLabel.trim() ? customLabel : children;

  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;

      const handleMouseMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - startXRef.current;
        const newWidth = Math.max(minWidth, Math.round(startWidthRef.current + deltaX));
        updateColumnWidth(moduleId, columnKey, newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [moduleId, columnKey, width, minWidth, updateColumnWidth]
  );

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    updateColumnWidth(moduleId, columnKey, defaultWidth);
  };

  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  if (!isVisible) {
    return null;
  }

  return (
    <th
      onClick={onClick}
      title={title || (typeof displayContent === 'string' ? displayContent : undefined)}
      style={{
        ...style,
        width: `${width}px`,
        minWidth: `${width}px`,
        maxWidth: `${width}px`,
      }}
      className={`relative px-3 py-2.5 font-bold uppercase select-none group transition-colors ${alignClass} ${
        sticky ? stickyClass || 'sticky z-20 bg-slate-100' : ''
      } ${className}`}
    >
      <div className={`w-full overflow-hidden text-ellipsis ${align === 'right' ? 'flex justify-end' : align === 'center' ? 'flex justify-center' : 'flex justify-start'}`}>
        {displayContent}
      </div>

      {/* Resize Handle */}
      {canResize && (
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-0 right-0 bottom-0 w-2 cursor-col-resize flex items-center justify-center z-30 transition-colors ${
            isResizing
              ? 'bg-blue-600 opacity-100'
              : 'hover:bg-blue-400 opacity-0 group-hover:opacity-100'
          }`}
          title="Kéo để chỉnh độ rộng cột (Nhấn đúp để khôi phục mặc định)"
        >
          <div className="w-[1.5px] h-3 bg-slate-400 group-hover:bg-white pointer-events-none rounded" />
        </div>
      )}
    </th>
  );
}
