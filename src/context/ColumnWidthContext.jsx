import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Default column definitions and widths (in px) per module
export const MODULE_COLUMNS_CONFIG = {
  donhang: {
    label: 'UP Đơn chi tiết (UD_CT)',
    columns: [
      { key: 'checkbox', label: 'Chọn dòng', defaultWidth: 44, minWidth: 36, align: 'center', fixed: true },
      { key: 'ngay', label: 'Ngày', defaultWidth: 100, minWidth: 70, align: 'center' },
      { key: 'san', label: 'Sàn', defaultWidth: 80, minWidth: 60, align: 'center' },
      { key: 'khung_h', label: 'Khung H', defaultWidth: 80, minWidth: 60, align: 'center' },
      { key: 'ma_gian', label: 'Mã gian', defaultWidth: 110, minWidth: 70, align: 'center' },
      { key: 'mvd', label: 'Mã vận đơn (MVD)', defaultWidth: 150, minWidth: 90, align: 'left' },
      { key: 'mdh', label: 'Mã đơn hàng (MDH)', defaultWidth: 150, minWidth: 90, align: 'left' },
      { key: 'check_trung', label: 'Check trùng', defaultWidth: 96, minWidth: 70, align: 'center' },
      { key: 'sku_shop_up', label: 'SKU Shop Up', defaultWidth: 150, minWidth: 90, align: 'left' },
      { key: 'so_luong', label: 'Số lượng', defaultWidth: 80, minWidth: 60, align: 'right' },
      { key: 'id_sp', label: 'ID SP Cha', defaultWidth: 96, minWidth: 60, align: 'center' },
      { key: 'id_sp_ct', label: 'ID SP CT (SKU Con)', defaultWidth: 190, minWidth: 110, align: 'left' },
      { key: 'ten_sp', label: 'Tên sản phẩm', defaultWidth: 220, minWidth: 120, align: 'left' },
      { key: 'slg_xuat', label: 'SL Xuất', defaultWidth: 80, minWidth: 60, align: 'right' },
      { key: 'don_gia_1', label: 'Đơn giá', defaultWidth: 110, minWidth: 70, align: 'right' },
      { key: 'trang_thai', label: 'Trạng thái', defaultWidth: 130, minWidth: 80, align: 'center' },
      { key: 'ghi_chu', label: 'Ghi chú', defaultWidth: 160, minWidth: 90, align: 'left' },
      { key: 'thao_tac', label: 'Thao tác nhanh', defaultWidth: 160, minWidth: 100, align: 'center' },
    ],
  },
  donhang_tong: {
    label: 'Đơn hàng tổng',
    columns: [
      { key: 'id_dh', label: 'Mã đơn hàng', defaultWidth: 150, minWidth: 90, align: 'left' },
      { key: 'ngay', label: 'Ngày', defaultWidth: 110, minWidth: 70, align: 'center' },
      { key: 'truong', label: 'Trường (Nhập/Xuất)', defaultWidth: 96, minWidth: 60, align: 'center' },
      { key: 'ncc', label: 'Nhà cung cấp', defaultWidth: 180, minWidth: 100, align: 'left' },
      { key: 'count', label: 'Số SKU', defaultWidth: 96, minWidth: 60, align: 'right' },
      { key: 'tong_tien', label: 'Tổng tiền', defaultWidth: 150, minWidth: 90, align: 'right' },
      { key: 'xac_nhan', label: 'Trạng thái xác nhận', defaultWidth: 160, minWidth: 90, align: 'center' },
    ],
  },
  dhct: {
    label: 'Đơn hàng chi tiết (DHCT)',
    columns: [
      { key: 'ngay', label: 'Ngày', defaultWidth: 100, minWidth: 70, align: 'center' },
      { key: 'truong', label: 'Trường', defaultWidth: 80, minWidth: 50, align: 'center' },
      { key: 'ncc', label: 'Nhà cung cấp', defaultWidth: 140, minWidth: 80, align: 'left' },
      { key: 'id_sp_ct', label: 'Mã SKU CT', defaultWidth: 140, minWidth: 80, align: 'left' },
      { key: 'id_sp', label: 'Mã SP Cha', defaultWidth: 96, minWidth: 60, align: 'center' },
      { key: 'ten', label: 'Tên sản phẩm', defaultWidth: 220, minWidth: 110, align: 'left' },
      { key: 'so_luong', label: 'Số lượng', defaultWidth: 80, minWidth: 50, align: 'right' },
      { key: 'gia_nhap', label: 'Giá nhập', defaultWidth: 110, minWidth: 60, align: 'right' },
      { key: 'thanh_tien', label: 'Thành tiền', defaultWidth: 120, minWidth: 70, align: 'right' },
      { key: 'xac_nhan', label: 'Xác nhận', defaultWidth: 120, minWidth: 70, align: 'center' },
      { key: 'ton_luy_ke', label: 'Tồn Lũy Kế', defaultWidth: 140, minWidth: 80, align: 'right' },
    ],
  },
  unique_dh_ct: {
    label: 'Unique DHCT (Gộp đơn)',
    columns: [
      { key: 'kho', label: 'Kho', defaultWidth: 70, minWidth: 50, align: 'center' },
      { key: 'id_sp_ct', label: 'Mã SKU CT', defaultWidth: 140, minWidth: 80, align: 'left' },
      { key: 'ten', label: 'Tên sản phẩm', defaultWidth: 200, minWidth: 110, align: 'left' },
      { key: 'so_luong', label: 'Số lượng', defaultWidth: 80, minWidth: 50, align: 'right' },
      { key: 'gia_nhap', label: 'Giá nhập', defaultWidth: 110, minWidth: 60, align: 'right' },
      { key: 'thanh_tien', label: 'Thành tiền', defaultWidth: 120, minWidth: 70, align: 'right' },
      { key: 'trang_thai', label: 'Trạng thái', defaultWidth: 120, minWidth: 70, align: 'center' },
    ],
  },
  hang_hoan: {
    label: 'Hàng hoàn & Trả hàng',
    columns: [
      { key: 'ngay_nhan', label: 'Ngày nhận', defaultWidth: 100, minWidth: 70, align: 'center' },
      { key: 'mvd', label: 'MVD', defaultWidth: 150, minWidth: 80, align: 'left' },
      { key: 'mvd_2', label: 'MVD 2', defaultWidth: 150, minWidth: 80, align: 'left' },
      { key: 'ma_gian', label: 'Mã gian', defaultWidth: 100, minWidth: 60, align: 'center' },
      { key: 'sku', label: 'SKU', defaultWidth: 100, minWidth: 60, align: 'center' },
      { key: 'sku_ct', label: 'SKU CT', defaultWidth: 140, minWidth: 80, align: 'left' },
      { key: 'slg', label: 'SLG', defaultWidth: 70, minWidth: 50, align: 'right' },
      { key: 'ten_sp', label: 'Tên SP', defaultWidth: 190, minWidth: 100, align: 'left' },
      { key: 'kho', label: 'Kho', defaultWidth: 80, minWidth: 50, align: 'center' },
      { key: 'tinh_trang', label: 'Tình trạng', defaultWidth: 100, minWidth: 60, align: 'center' },
      { key: 'trang_thai', label: 'Trạng thái', defaultWidth: 100, minWidth: 60, align: 'center' },
      { key: 'sku_tong', label: 'SKU tổng', defaultWidth: 150, minWidth: 80, align: 'left' },
      { key: 'anh', label: 'Ảnh', defaultWidth: 70, minWidth: 50, align: 'center' },
    ],
  },
  inventory: {
    label: 'Quản lý Tồn kho',
    columns: [
      { key: 'id', label: 'Mã Tồn Kho', defaultWidth: 150, minWidth: 90, align: 'left' },
      { key: 'kho', label: 'Kho', defaultWidth: 80, minWidth: 50, align: 'center' },
      { key: 'id_sp_ct', label: 'Mã SKU CT', defaultWidth: 140, minWidth: 80, align: 'left' },
      { key: 'id_sp', label: 'Mã SP Cha', defaultWidth: 96, minWidth: 60, align: 'center' },
      { key: 'ten_sp', label: 'Tên sản phẩm', defaultWidth: 220, minWidth: 110, align: 'left' },
      { key: 'ton_dau', label: 'Tồn đầu', defaultWidth: 96, minWidth: 60, align: 'right' },
      { key: 'nhap', label: 'Nhập (+)', defaultWidth: 96, minWidth: 60, align: 'right' },
      { key: 'xuat', label: 'Xuất (-)', defaultWidth: 96, minWidth: 60, align: 'right' },
      { key: 'ton_cuoi', label: 'Tồn cuối', defaultWidth: 112, minWidth: 70, align: 'right' },
    ],
  },
  sanpham: {
    label: 'Sản phẩm PM',
    columns: [
      { key: 'sku_con', label: 'Mã SKU Con', defaultWidth: 150, minWidth: 90, align: 'left' },
      { key: 'id_sp', label: 'Mã SP Cha', defaultWidth: 96, minWidth: 60, align: 'center' },
      { key: 'ten_sp', label: 'Tên sản phẩm', defaultWidth: 240, minWidth: 110, align: 'left' },
      { key: 'gia_nhap', label: 'Giá nhập', defaultWidth: 112, minWidth: 70, align: 'right' },
      { key: 'gia_ban', label: 'Giá bán lẻ', defaultWidth: 112, minWidth: 70, align: 'right' },
      { key: 'gia_dong_goi', label: 'Giá đón gói', defaultWidth: 112, minWidth: 70, align: 'right' },
      { key: 'gia_thap_nhat', label: 'Giá thấp nhất', defaultWidth: 128, minWidth: 70, align: 'right' },
    ],
  },
  ban_don: {
    label: 'Bắn đơn',
    columns: [
      { key: 'ngay', label: 'Ngày', defaultWidth: 100, minWidth: 70, align: 'center' },
      { key: 'khung_h', label: 'Khung H', defaultWidth: 80, minWidth: 60, align: 'center' },
      { key: 'mvd', label: 'Mã vận đơn (MVD)', defaultWidth: 260, minWidth: 110, align: 'left' },
      { key: 'xoa', label: 'Thao tác', defaultWidth: 64, minWidth: 50, align: 'center' },
    ],
  },
  hh_shop_dien: {
    label: 'Hàng hoàn shop điền',
    columns: [
      { key: 'ngay_tra', label: 'Ngày trả', defaultWidth: 100, minWidth: 70, align: 'center' },
      { key: 'mvd', label: 'Mã vận đơn', defaultWidth: 150, minWidth: 80, align: 'left' },
      { key: 'mdh', label: 'Mã đơn hàng', defaultWidth: 150, minWidth: 80, align: 'left' },
      { key: 'ma_gian', label: 'Mã gian', defaultWidth: 110, minWidth: 60, align: 'center' },
      { key: 'sku', label: 'SKU', defaultWidth: 130, minWidth: 70, align: 'left' },
      { key: 'mvd_tra', label: 'MVD Trả', defaultWidth: 150, minWidth: 80, align: 'left' },
      { key: 'sku_tra', label: 'SKU Trả', defaultWidth: 130, minWidth: 70, align: 'left' },
      { key: 'sl', label: 'Số lượng', defaultWidth: 70, minWidth: 50, align: 'right' },
      { key: 'hoan_tra', label: 'Loại', defaultWidth: 80, minWidth: 50, align: 'center' },
      { key: 'xac_nhan', label: 'Xác nhận', defaultWidth: 100, minWidth: 60, align: 'center' },
      { key: 'da_nhan', label: 'Đã nhận', defaultWidth: 100, minWidth: 60, align: 'center' },
      { key: 'ghi_chu', label: 'Ghi chú', defaultWidth: 160, minWidth: 80, align: 'left' },
    ],
  },
};

const STORAGE_KEY_WIDTHS = 'KHO_2026_COLUMN_WIDTHS';
const STORAGE_KEY_VISIBILITY = 'KHO_2026_COLUMN_VISIBILITY';
const STORAGE_KEY_LABELS = 'KHO_2026_COLUMN_LABELS';
const STORAGE_KEY_SYSTEM_FONT_SIZE = 'KHO_2026_SYSTEM_FONT_SIZE';
const STORAGE_KEY_TABLE_FONT_SIZE = 'KHO_2026_TABLE_FONT_SIZE';

function getInitialSystemFontSize() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SYSTEM_FONT_SIZE);
    if (saved) {
      const n = Number(saved);
      if (!isNaN(n) && n >= 12 && n <= 24) return n;
    }
  } catch (e) {
    console.error('Error loading system font size:', e);
  }
  return 16;
}

function getInitialTableFontSize() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TABLE_FONT_SIZE);
    if (saved) {
      const n = Number(saved);
      if (!isNaN(n) && n >= 10 && n <= 20) return n;
    }
  } catch (e) {
    console.error('Error loading table font size:', e);
  }
  return 13;
}

function getInitialWidths() {
  const initial = {};
  Object.keys(MODULE_COLUMNS_CONFIG).forEach((modKey) => {
    initial[modKey] = {};
    MODULE_COLUMNS_CONFIG[modKey].columns.forEach((col) => {
      initial[modKey][col.key] = col.defaultWidth;
    });
  });

  try {
    const saved = localStorage.getItem(STORAGE_KEY_WIDTHS);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.keys(parsed).forEach((modKey) => {
        if (!initial[modKey]) initial[modKey] = {};
        Object.keys(parsed[modKey] || {}).forEach((colKey) => {
          const val = Number(parsed[modKey][colKey]);
          if (!isNaN(val) && val > 0) {
            initial[modKey][colKey] = val;
          }
        });
      });
    }
  } catch (e) {
    console.error('Error loading column widths from localStorage:', e);
  }

  return initial;
}

function getInitialVisibility() {
  const initial = {};
  Object.keys(MODULE_COLUMNS_CONFIG).forEach((modKey) => {
    initial[modKey] = {};
    MODULE_COLUMNS_CONFIG[modKey].columns.forEach((col) => {
      initial[modKey][col.key] = true;
    });
  });

  try {
    const saved = localStorage.getItem(STORAGE_KEY_VISIBILITY);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.keys(parsed).forEach((modKey) => {
        if (!initial[modKey]) initial[modKey] = {};
        Object.keys(parsed[modKey] || {}).forEach((colKey) => {
          if (parsed[modKey][colKey] !== undefined) {
            initial[modKey][colKey] = Boolean(parsed[modKey][colKey]);
          }
        });
      });
    }
  } catch (e) {
    console.error('Error loading column visibility from localStorage:', e);
  }

  return initial;
}

function getInitialLabels() {
  const initial = {};
  Object.keys(MODULE_COLUMNS_CONFIG).forEach((modKey) => {
    initial[modKey] = {};
  });

  try {
    const saved = localStorage.getItem(STORAGE_KEY_LABELS);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.keys(parsed).forEach((modKey) => {
        if (!initial[modKey]) initial[modKey] = {};
        Object.keys(parsed[modKey] || {}).forEach((colKey) => {
          if (typeof parsed[modKey][colKey] === 'string') {
            initial[modKey][colKey] = parsed[modKey][colKey];
          }
        });
      });
    }
  } catch (e) {
    console.error('Error loading column labels from localStorage:', e);
  }

  return initial;
}

const ColumnWidthContext = createContext(null);

export function ColumnWidthProvider({ children }) {
  const [columnWidths, setColumnWidths] = useState(getInitialWidths);
  const [columnVisibility, setColumnVisibility] = useState(getInitialVisibility);
  const [columnLabels, setColumnLabels] = useState(getInitialLabels);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('columns');
  const [activeSettingsModule, setActiveSettingsModule] = useState('donhang');

  // Font Size States
  const [systemFontSize, setSystemFontSizeState] = useState(getInitialSystemFontSize);
  const [tableFontSize, setTableFontSizeState] = useState(getInitialTableFontSize);

  const setSystemFontSize = useCallback((size) => {
    const safe = Math.min(24, Math.max(12, Math.round(Number(size) || 16)));
    setSystemFontSizeState(safe);
    try {
      localStorage.setItem(STORAGE_KEY_SYSTEM_FONT_SIZE, String(safe));
    } catch (e) {
      console.error(e);
    }
    document.documentElement.style.fontSize = `${safe}px`;
  }, []);

  const setTableFontSize = useCallback((size) => {
    const safe = Math.min(20, Math.max(10, Math.round(Number(size) || 13)));
    setTableFontSizeState(safe);
    try {
      localStorage.setItem(STORAGE_KEY_TABLE_FONT_SIZE, String(safe));
    } catch (e) {
      console.error(e);
    }
    document.documentElement.style.setProperty('--app-table-font-size', `${safe}px`);
  }, []);

  const resetFontSizes = useCallback(() => {
    setSystemFontSize(16);
    setTableFontSize(13);
  }, [setSystemFontSize, setTableFontSize]);

  // Apply font size on mount and whenever font size changes
  useEffect(() => {
    document.documentElement.style.fontSize = `${systemFontSize}px`;
    document.documentElement.style.setProperty('--app-table-font-size', `${tableFontSize}px`);
  }, [systemFontSize, tableFontSize]);

  // Persist columnWidths
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WIDTHS, JSON.stringify(columnWidths));
    } catch (e) {
      console.error('Error saving column widths to localStorage:', e);
    }
  }, [columnWidths]);

  // Persist columnVisibility
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VISIBILITY, JSON.stringify(columnVisibility));
    } catch (e) {
      console.error('Error saving column visibility to localStorage:', e);
    }
  }, [columnVisibility]);

  // Persist columnLabels
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LABELS, JSON.stringify(columnLabels));
    } catch (e) {
      console.error('Error saving column labels to localStorage:', e);
    }
  }, [columnLabels]);

  // Update a single column's width
  const updateColumnWidth = useCallback((moduleId, colKey, width) => {
    const safeWidth = Math.max(30, Math.round(Number(width) || 0));
    setColumnWidths((prev) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || {}),
        [colKey]: safeWidth,
      },
    }));
  }, []);

  // Get a column's current width or fallback
  const getColumnWidth = useCallback(
    (moduleId, colKey, fallbackWidth = 100) => {
      const modWidths = columnWidths[moduleId];
      if (modWidths && modWidths[colKey] !== undefined) {
        return modWidths[colKey];
      }
      return fallbackWidth;
    },
    [columnWidths]
  );

  // Check if a column is visible
  const isColumnVisible = useCallback(
    (moduleId, colKey) => {
      const modVis = columnVisibility[moduleId];
      if (modVis && modVis[colKey] !== undefined) {
        return Boolean(modVis[colKey]);
      }
      return true;
    },
    [columnVisibility]
  );

  // Toggle a single column's visibility
  const toggleColumnVisibility = useCallback((moduleId, colKey) => {
    setColumnVisibility((prev) => {
      const current = prev[moduleId]?.[colKey] !== false;
      return {
        ...prev,
        [moduleId]: {
          ...(prev[moduleId] || {}),
          [colKey]: !current,
        },
      };
    });
  }, []);

  // Set visibility explicitly
  const setColumnVisible = useCallback((moduleId, colKey, visible) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || {}),
        [colKey]: Boolean(visible),
      },
    }));
  }, []);

  // Show all columns for a module
  const showAllColumns = useCallback((moduleId) => {
    const modConfig = MODULE_COLUMNS_CONFIG[moduleId];
    if (!modConfig) return;
    setColumnVisibility((prev) => {
      const nextMod = {};
      modConfig.columns.forEach((c) => {
        nextMod[c.key] = true;
      });
      return {
        ...prev,
        [moduleId]: nextMod,
      };
    });
  }, []);

  // Get custom column label or fallback
  const getColumnLabel = useCallback(
    (moduleId, colKey, fallback = '') => {
      const custom = columnLabels[moduleId]?.[colKey];
      if (custom && custom.trim()) {
        return custom.trim();
      }
      return fallback;
    },
    [columnLabels]
  );

  // Set custom column label
  const setColumnLabel = useCallback((moduleId, colKey, label) => {
    setColumnLabels((prev) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || {}),
        [colKey]: label,
      },
    }));
  }, []);

  // Reset custom column label
  const resetColumnLabel = useCallback((moduleId, colKey) => {
    setColumnLabels((prev) => {
      const nextMod = { ...(prev[moduleId] || {}) };
      delete nextMod[colKey];
      return {
        ...prev,
        [moduleId]: nextMod,
      };
    });
  }, []);

  // Reset a specific column completely (width, visibility, label)
  const resetColumnConfig = useCallback(
    (moduleId, colKey, defaultWidth = 100) => {
      updateColumnWidth(moduleId, colKey, defaultWidth);
      setColumnVisible(moduleId, colKey, true);
      resetColumnLabel(moduleId, colKey);
    },
    [updateColumnWidth, setColumnVisible, resetColumnLabel]
  );

  // Reset module widths
  const resetModuleWidths = useCallback((moduleId) => {
    const modConfig = MODULE_COLUMNS_CONFIG[moduleId];
    if (!modConfig) return;
    setColumnWidths((prev) => {
      const nextMod = {};
      modConfig.columns.forEach((c) => {
        nextMod[c.key] = c.defaultWidth;
      });
      return {
        ...prev,
        [moduleId]: nextMod,
      };
    });
  }, []);

  // Reset module completely (widths, visibility, labels)
  const resetModuleAll = useCallback(
    (moduleId) => {
      resetModuleWidths(moduleId);
      showAllColumns(moduleId);
      setColumnLabels((prev) => ({
        ...prev,
        [moduleId]: {},
      }));
    },
    [resetModuleWidths, showAllColumns]
  );

  // Reset everything across all modules
  const resetAllConfig = useCallback(() => {
    const defWidths = {};
    const defVis = {};
    Object.keys(MODULE_COLUMNS_CONFIG).forEach((modKey) => {
      defWidths[modKey] = {};
      defVis[modKey] = {};
      MODULE_COLUMNS_CONFIG[modKey].columns.forEach((c) => {
        defWidths[modKey][c.key] = c.defaultWidth;
        defVis[modKey][c.key] = true;
      });
    });
    setColumnWidths(defWidths);
    setColumnVisibility(defVis);
    setColumnLabels({});
  }, []);

  // Helper returning style object for <td> cells
  const getColStyle = useCallback(
    (moduleId, colKey, defaultWidth = 100) => {
      const visible = columnVisibility[moduleId]?.[colKey] !== false;
      if (!visible) return { display: 'none' };
      const w = columnWidths[moduleId]?.[colKey] ?? defaultWidth;
      return { width: `${w}px`, minWidth: `${w}px`, maxWidth: `${w}px` };
    },
    [columnVisibility, columnWidths]
  );

  const openSettings = useCallback((tab = 'columns', targetModule) => {
    setSettingsTab(tab);
    if (targetModule) {
      let norm = targetModule;
      if (norm === 'hanghoan') norm = 'hang_hoan';
      if (norm === 'bandon') norm = 'ban_don';
      if (norm === 'bchh' || norm === 'bc_hang_hoan') norm = 'hang_hoan';
      if (norm === 'don_chi_tiet') norm = 'donhang';
      if (MODULE_COLUMNS_CONFIG[norm]) {
        setActiveSettingsModule(norm);
      }
    }
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const value = {
    columnWidths,
    columnVisibility,
    columnLabels,
    updateColumnWidth,
    getColumnWidth,
    isColumnVisible,
    toggleColumnVisibility,
    setColumnVisible,
    showAllColumns,
    getColumnLabel,
    setColumnLabel,
    resetColumnLabel,
    resetColumnConfig,
    resetModuleWidths,
    resetModuleAll,
    resetAllWidths: resetAllConfig,
    resetAllConfig,
    getColStyle,
    isSettingsOpen,
    openSettings,
    closeSettings,
    settingsTab,
    setSettingsTab,
    activeSettingsModule,
    setActiveSettingsModule,
    systemFontSize,
    setSystemFontSize,
    tableFontSize,
    setTableFontSize,
    resetFontSizes,
  };

  return <ColumnWidthContext.Provider value={value}>{children}</ColumnWidthContext.Provider>;
}

export function useColumnWidths() {
  const ctx = useContext(ColumnWidthContext);
  if (!ctx) {
    throw new Error('useColumnWidths must be used within a ColumnWidthProvider');
  }
  return ctx;
}
