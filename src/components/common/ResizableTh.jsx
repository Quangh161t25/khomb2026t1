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
  canReorder = true,
  children,
  onClick,
  title,
}) {
  const {
    getColumnWidth,
    updateColumnWidth,
    isColumnVisible,
    getColumnLabel,
    getColumnAlign,
    isColumnWrap,
    reorderColumnByKey,
  } = useColumnWidths();
  const width = getColumnWidth(moduleId, columnKey, defaultWidth);
  const isVisible = isColumnVisible ? isColumnVisible(moduleId, columnKey) : true;
  const customLabel = getColumnLabel ? getColumnLabel(moduleId, columnKey) : '';
  const displayContent = customLabel && customLabel.trim() ? customLabel : children;

  const effectiveAlign = getColumnAlign ? getColumnAlign(moduleId, columnKey, align) : align;
  const isWrap = isColumnWrap ? isColumnWrap(moduleId, columnKey) : false;

  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  // Column Drag & Drop Reordering
  const handleDragStart = (e) => {
    if (isResizing) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ moduleId, columnKey })
    );
  };

  const handleDragOver = (e) => {
    if (!canReorder) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    if (!canReorder) return;
    e.preventDefault();
    setIsDragOver(false);
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.moduleId === moduleId && data.columnKey && data.columnKey !== columnKey) {
        if (reorderColumnByKey) {
          reorderColumnByKey(moduleId, data.columnKey, columnKey);
        }
      }
    } catch (err) {
      console.error('Error dropping column header:', err);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDragOver(false);
  };

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
    effectiveAlign === 'center'
      ? 'text-center'
      : effectiveAlign === 'right'
      ? 'text-right'
      : 'text-left';

  if (!isVisible) {
    return null;
  }

  return (
    <th
      draggable={canReorder && !isResizing}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      title={
        title ||
        (typeof displayContent === 'string'
          ? `${displayContent} (Kéo thả để di chuyển vị trí cột)`
          : undefined)
      }
      data-wrap={isWrap ? 'true' : undefined}
      style={{
        ...style,
        width: `${width}px`,
        minWidth: `${width}px`,
        maxWidth: `${width}px`,
        textAlign: effectiveAlign,
        whiteSpace: isWrap ? 'normal' : 'nowrap',
        wordBreak: isWrap ? 'break-word' : undefined,
      }}
      className={`relative px-3 py-2.5 font-bold uppercase select-none group transition-all ${
        canReorder ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isDragging ? 'opacity-30 bg-blue-100/60' : ''} ${
        isDragOver ? 'ring-2 ring-blue-500 ring-inset bg-blue-100/70' : ''
      } ${alignClass} ${sticky ? stickyClass || 'sticky z-20 bg-slate-100' : ''} ${className}`}
    >
      <div
        className={`w-full overflow-hidden ${
          isWrap ? 'whitespace-normal break-words' : 'text-ellipsis whitespace-nowrap'
        } ${
          effectiveAlign === 'right'
            ? 'flex justify-end'
            : effectiveAlign === 'center'
            ? 'flex justify-center'
            : 'flex justify-start'
        }`}
      >
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
