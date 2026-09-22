import * as XLSX from 'xlsx';

/**
 * Export data array to an Excel file (.xlsx)
 * @param {Array<Array<any>>} data - 2D Array of rows
 * @param {string} fileName - File name to save
 * @param {string} sheetName - Sheet tab name
 */
export function exportToExcel(data, fileName = 'export.xlsx', sheetName = 'Sheet1') {
  try {
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
