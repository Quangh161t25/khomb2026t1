import * as XLSX from 'xlsx';

/**
 * Export data array to an Excel file (.xlsx)
 * Supports two signatures:
 * 1. exportToExcel(fileName, sheetName, headers, rows)
 * 2. exportToExcel(data, fileName, sheetName)
 */
export function exportToExcel(arg1, arg2, arg3, arg4) {
  try {
    let data, fileName, sheetName;
    
    if (typeof arg1 === 'string') {
      // Signature: (fileName, sheetName, headers, rows)
      fileName = arg1;
      sheetName = arg2 || 'Sheet1';
      const headers = arg3 || [];
      const rows = arg4 || [];
      data = [headers, ...rows];
    } else {
      // Signature: (data, fileName, sheetName)
      data = arg1;
      fileName = arg2 || 'export.xlsx';
      sheetName = arg3 || 'Sheet1';
    }

    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
      fileName += '.xlsx';
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
    return true;
  } catch (err) {
    console.error('Lỗi khi xuất file Excel:', err);
    return false;
  }
}
