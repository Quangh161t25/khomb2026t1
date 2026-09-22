import { openDB } from 'idb';

const DB_NAME = 'KhoAppOfflineDB';
const STORE_NAME = 'offline_queue';
const CACHE_STORE = 'sheet_cache';

export async function initDB() {
  return openDB(DB_NAME, 2, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: 'sheetKey' });
      }
    },
  });
}

// Persistent caching for sheets
export async function saveSheetToCache(sheetKey, data) {
  try {
    const db = await initDB();
    await db.put(CACHE_STORE, { sheetKey, data, timestamp: Date.now() });
  } catch (error) {
    console.error('[Offline Cache] Lá»—i khi lÆ°u cache:', error);
  }
}

export async function getSheetFromCache(sheetKey) {
  try {
    const db = await initDB();
    const result = await db.get(CACHE_STORE, sheetKey);
    return result ? result.data : null;
  } catch (error) {
    console.error('[Offline Cache] Lá»—i khi láº¥y cache:', error);
    return null;
  }
}

// ThÃªm request vÃ o queue
export async function queueOfflineRequest(type, sheetName, payload) {
  try {
    const db = await initDB();
    await db.add(STORE_NAME, {
      type, // 'APPEND' | 'UPDATE' | 'DELETE'
      sheetName,
      payload,
      timestamp: Date.now(),
    });
    console.log(`[Offline Sync] ÄÃ£ lÆ°u vÃ o hÃ ng Ä‘á»£i: ${type} -> ${sheetName}`);
  } catch (error) {
    console.error('[Offline Sync] Lá»—i khi lÆ°u vÃ o queue:', error);
  }
}

// Láº¥y táº¥t cáº£ cÃ¡c request
export async function getOfflineQueue() {
  try {
    const db = await initDB();
    return await db.getAll(STORE_NAME);
  } catch (error) {
    console.error('[Offline Sync] Lá»—i khi láº¥y queue:', error);
    return [];
  }
}

// XÃ³a request Ä‘Ã£ xá»­ lÃ½ thÃ nh cÃ´ng
export async function removeProcessedRequest(id) {
  try {
    const db = await initDB();
    await db.delete(STORE_NAME, id);
  } catch (error) {
    console.error('[Offline Sync] Lá»—i khi xÃ³a request:', error);
  }
}

// XÃ³a toÃ n bá»™ queue
export async function clearOfflineQueue() {
  try {
    const db = await initDB();
    await db.clear(STORE_NAME);
  } catch (error) {
    console.error('[Offline Sync] Lá»—i khi xÃ³a toÃ n bá»™ queue:', error);
  }
}

let isSyncingQueue = false;

// Đồng bộ khi có mạng lại
export async function syncOfflineQueue(apiAppendFunction) {
  if (!navigator.onLine) return;
  if (isSyncingQueue) {
    console.log('[Offline Sync] Đang đồng bộ, bỏ qua yêu cầu mới...');
    return;
  }
  
  isSyncingQueue = true;
  try {
    const queue = await getOfflineQueue();
    if (queue.length === 0) return;

    console.log('[Offline Sync] Bắt đầu đồng bộ ' + queue.length + ' requests...');
    
    for (const req of queue) {
      if (req.type === 'APPEND') {
        try {
          const success = await apiAppendFunction(req.sheetName, req.payload, true); // true to bypass queue
          if (success) {
            await removeProcessedRequest(req.id);
          }
        } catch (err) {
          console.error('[Offline Sync] Lỗi khi đồng bộ request id:', req.id, err);
        }
      }
    }
  } finally {
    isSyncingQueue = false;
  }
}
