import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

const SyncContext = createContext(null);

export function SyncProvider({ children }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStatus, setSyncStatus] = useState('connected'); // 'connected' | 'syncing' | 'offline'

  // Ref lưu trữ hàm sync của module hiện đang active trên màn hình
  const activeSyncRef = useRef(null);

  const registerSync = useCallback((syncFn) => {
    activeSyncRef.current = syncFn;
    return () => {
      if (activeSyncRef.current === syncFn) {
        activeSyncRef.current = null;
      }
    };
  }, []);

  const triggerSync = useCallback(async () => {
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }
    if (activeSyncRef.current) {
      setIsSyncing(true);
      setSyncStatus('syncing');
      try {
        await activeSyncRef.current();
        setLastSyncTime(new Date());
        setSyncStatus('connected');
      } catch (err) {
        console.error('[SyncContext] Lỗi khi kích hoạt đồng bộ thủ công:', err);
        setSyncStatus('connected');
      } finally {
        setIsSyncing(false);
      }
    }
  }, []);

  return (
    <SyncContext.Provider
      value={{
        isSyncing,
        setIsSyncing,
        lastSyncTime,
        setLastSyncTime,
        syncStatus,
        setSyncStatus,
        registerSync,
        triggerSync,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
