import { useState, useEffect, useCallback } from 'react';
import { CONFIG } from '../config/config';
import { fetchSheetData } from '../services/googleSheetsApi';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchSheetData(`${CONFIG.sanphamSheetName}!A:L`);
      if (rows && rows.length > 1) {
        const parsed = rows.slice(1).map((row, idx) => ({
          rowIndex: idx + 2,
          sku_con: (row[0] || '').toString().trim(),
          id_sp: (row[1] || '').toString().trim(),
          ten_sp: (row[2] || '').toString().trim(),
          gia_nhap: parseFloat(row[3]) || 0,
          gia_ban_le: parseFloat(row[4]) || 0,
          ton_dau: parseFloat(row[5]) || 0,
          gia_ban: parseFloat(row[6]) || 0,
        }));
        setProducts(parsed);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return { products, loading, error, refresh: loadProducts };
}
