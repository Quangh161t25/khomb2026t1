import {
  fetchSheetData,
  updateSheetCell,
  appendSheetData,
  batchUpdateSheetValues,
  appendSheetRows,
  deleteSheetRow,
} from './googleSheetsApi';
import { exportToExcel } from './excelExport';

export {
  fetchSheetData,
  updateSheetCell,
  appendSheetData,
  batchUpdateSheetValues,
  appendSheetRows,
  deleteSheetRow,
  exportToExcel,
};

export const api = {
  get: fetchSheetData,
  updateCell: updateSheetCell,
  append: appendSheetData,
  batchUpdate: batchUpdateSheetValues,
  appendRows: appendSheetRows,
  deleteRow: deleteSheetRow,
  exportExcel: exportToExcel,
};

export default api;
