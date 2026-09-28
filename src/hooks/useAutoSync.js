import { useEffect, useRef, useCallback } from 'react';
import { useSync } from '../context/SyncContext';
import { clearSheetCache } from '../services/googleSheetsApi';

/**
 * Hook useAutoSync chung cho các module
 * @param {Function} fetchFn - Hàm tải dữ liệu của module (vd: loadData)
 * @param {Object} options
 * @param {number} options.intervalMs - Chu kỳ quét định kỳ (mặc định 25000ms = 25s)
 * @param {boolean} options.enabled - Bật/tắt tự động đồng bộ (mặc định true)
 * @param {string} options.sheetName - Tên sheet cần xóa cache khi refresh (tùy chọn)
 * @param {boolean} options.focusRefresh - Tự động tải lại khi click quay lại tab (mặc định true)
 */
export function useAutoSync(fetchFn, options = {}) {
  const {
    intervalMs = 25000, // 25s (nằm trong khoảng 20 - 30s)
    enabled = true,
    sheetName = null,
    focusRefresh = true,
  } = options;

  const { registerSync, setIsSyncing, setLastSyncTime, setSyncStatus, isSyncing, lastSyncTime } = useSync();
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const isExecutingRef = useRef(false);
  const lastRunTimeRef = useRef(Date.now());

  const executeSync = useCallback(
    async (isSilent = true) => {
      if (isExecutingRef.current) return;
      if (!navigator.onLine) {
        setSyncStatus('offline');
        return;
      }

      isExecutingRef.current = true;
      setIsSyncing(true);
      setSyncStatus('syncing');

      try {
        // Xóa cache để đảm bảo Google Sheets API trả về dữ liệu mới nhất
        if (sheetName) {
          clearSheetCache(sheetName);
        } else {
          clearSheetCache();
        }

        await fetchFnRef.current(isSilent);
        const now = new Date();
        lastRunTimeRef.current = now.getTime();
        setLastSyncTime(now);
        setSyncStatus('connected');
      } catch (err) {
        console.warn('[AutoSync] Lỗi trong quá trình quét dữ liệu:', err);
        setSyncStatus('connected');
      } finally {
        isExecutingRef.current = false;
        setIsSyncing(false);
      }
    },
    [sheetName, setIsSyncing, setLastSyncTime, setSyncStatus]
  );

  // 1. Đăng ký hàm sync này với SyncContext để Header có thể trigger bất cứ lúc nào
  useEffect(() => {
    if (!enabled) return;
    return registerSync(() => executeSync(false));
  }, [enabled, registerSync, executeSync]);

  // 2. Định kỳ quét ngầm mỗi intervalMs (20 - 30 giây)
  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      // Chỉ quét khi tab đang hiển thị và có mạng internet
      if (!document.hidden && navigator.onLine) {
        executeSync(true);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [enabled, intervalMs, executeSync]);

  // 3. Bất cứ khi nào người dùng click chuột quay lại tab trình duyệt, lập tức làm mới ngay
  useEffect(() => {
    if (!enabled || !focusRefresh) return;

    const handleVisibilityOrFocus = () => {
      if (!document.hidden && navigator.onLine) {
        // Tránh gọi dồn dập nếu người dùng click liên tục nhiều lần trong vòng 4 giây
        const elapsed = Date.now() - lastRunTimeRef.current;
        if (elapsed > 4000) {
          executeSync(true);
        }
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [enabled, focusRefresh, executeSync]);

  return {
    syncNow: () => executeSync(false),
    executeSync,
    isSyncing,
    lastSyncTime,
  };
}
