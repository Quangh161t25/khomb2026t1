// Centralized Google Sheets ranges and column mapping.
(function () {
    const DEFAULT_ROW_LIMIT = 10000;
    const LARGE_ROW_LIMIT = 100000;

    const SHEET_RANGES = {
        default: {
            read: 'A1:AF10000',
            clear: 'A2:AF10000',
            append: 'A:A'
        },
        UD_CT: {
            read: 'A1:AF100000',
            clear: 'A2:AF100000',
            append: 'A:A',
            columns: {
                ngay: 'E',
                mien: 'H',
                san: 'I',
                khung_h: 'J',
                ma_gian: 'K',
                mvd: 'L',
                mdh: 'M',
                sku_shop_up: 'N',
                so_luong: 'O',
                id_sp: 'P',
                id_sp_ct: 'Q',
                ten_sp: 'R',
                slg_xuat: 'S',
                tinh_trang: 'X',
                trang_thai: 'Y',
                ghi_chu: 'AA',
                don_gia: 'AE'
            }
        },
        HH_BH: { read: 'A:Z', append: 'A:Z' },
        HH_NV_DIEN: { read: 'A:L', append: 'A:L' },
        DH_CT: { read: 'A:P', append: 'A:A' },
        TON_KHO: { read: 'A:K' },
        BAN_DON: {
            read: 'A1:AF10000',
            clear: 'A2:AF10000',
            append: 'A:A',
            columns: {
                ngay: 'A',
                khung_h: 'B',
                mvd: 'C'
            }
        }
    };

    function getSheetRange(sheetName, type = 'read') {
        const key = Object.entries(CONFIG || {}).find(([name, value]) =>
            name.endsWith('SheetName') && value === sheetName
        )?.[1] || sheetName;

        const rangeConfig = SHEET_RANGES[key] || SHEET_RANGES.default;
        return rangeConfig[type] || SHEET_RANGES.default[type];
    }

    function getSheetRowLimit(sheetName) {
        return sheetName === CONFIG.udctSheetName ? LARGE_ROW_LIMIT : DEFAULT_ROW_LIMIT;
    }

    window.SHEET_RANGES = SHEET_RANGES;
    window.getSheetRange = getSheetRange;
    window.getSheetRowLimit = getSheetRowLimit;
})();
