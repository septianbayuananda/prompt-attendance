// Service for managing localStorage with offline support

type SyncStatus = 'synced' | 'pending' | 'error';

interface StorageItem<T> {
  data: T;
  syncStatus: SyncStatus;
  lastModified: number;
}

class StorageService {
  private prefix = 'absensi_app_';

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set<T>(key: string, data: T, syncStatus: SyncStatus = 'synced'): void {
    const item: StorageItem<T> = {
      data,
      syncStatus,
      lastModified: Date.now(),
    };
    localStorage.setItem(this.getKey(key), JSON.stringify(item));
  }

  get<T>(key: string): T | null {
    const raw = localStorage.getItem(this.getKey(key));
    if (!raw) return null;
    
    try {
      const item: StorageItem<T> = JSON.parse(raw);
      return item.data;
    } catch {
      return null;
    }
  }

  getWithMeta<T>(key: string): StorageItem<T> | null {
    const raw = localStorage.getItem(this.getKey(key));
    if (!raw) return null;
    
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  getPendingSyncItems(): string[] {
    const pending: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const item = JSON.parse(raw);
            if (item.syncStatus === 'pending') {
              pending.push(key.replace(this.prefix, ''));
            }
          } catch {
            // Skip invalid items
          }
        }
      }
    }
    return pending;
  }

  markAsSynced(key: string): void {
    const item = this.getWithMeta(key);
    if (item) {
      item.syncStatus = 'synced';
      localStorage.setItem(this.getKey(key), JSON.stringify(item));
    }
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

export const storageService = new StorageService();
