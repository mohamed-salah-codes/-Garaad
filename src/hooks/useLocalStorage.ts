import { useState, useEffect } from 'react';
import { db } from '../db/db';
import { syncEngine } from '../lib/SyncEngine';

// Mapping local storage keys to Supabase tables
const KEY_TO_TABLE: Record<string, string> = {
  'garaad_tasks': 'tasks',
  'garaad_notes': 'notes',
  'garaad_projects': 'projects', // Used in ActiveProjectContext
  // Other keys like garaad_auth, garaad_profile, garaad_task_statuses can map to settings or be handled differently.
};

export function useLocalStorage<T>(key: string, initialValue: T) {
  // If the initialValue is not an array, this hook falls back to basic localStorage.
  const isArray = Array.isArray(initialValue);
  const tableName = KEY_TO_TABLE[key];

  const readValue = (): T => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // If this key corresponds to a Supabase table, load from Dexie and sync
  useEffect(() => {
    if (isArray && tableName) {
      const loadFromDexie = async () => {
        try {
          const items = await (db as any)[tableName].toArray();
          if (items && items.length > 0) {
            setStoredValue(items);
            window.localStorage.setItem(key, JSON.stringify(items));
          } else if (initialValue.length > 0) {
            // Seed initial data
            await (db as any)[tableName].bulkPut(initialValue);
            for (const item of initialValue) {
              if (item.id) {
                await syncEngine.queueOperation('INSERT', tableName, item.id, item);
              }
            }
            setStoredValue(initialValue);
            window.localStorage.setItem(key, JSON.stringify(initialValue));
          }
        } catch (error) {
          console.error("Error loading from Dexie:", error);
        }
      };
      
      // We wait for auth initialization in a real app, but here we can just load
      loadFromDexie();
    }
  }, [key, tableName, isArray]);

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }

      // If it's a tracked table array, compute diffs and push to Dexie + Sync Queue
      if (isArray && tableName && Array.isArray(valueToStore)) {
        const currentArray = (storedValue as any[]) || [];
        const currentMap = new Map(currentArray.map(i => [i.id, i]));
        const newMap = new Map(valueToStore.map(i => [i.id, i]));
        
        // Handle Inserts & Updates
        for (const [id, item] of newMap.entries()) {
          if (!id) continue;
          const curr = currentMap.get(id);
          
          if (!curr) {
            // Insert
            await (db as any)[tableName].put(item);
            await syncEngine.queueOperation('INSERT', tableName, id, item);
          } else if (JSON.stringify(curr) !== JSON.stringify(item)) {
            // Update
            const updatedItem = { ...item, updated_at: new Date().toISOString() };
            await (db as any)[tableName].put(updatedItem);
            await syncEngine.queueOperation('UPDATE', tableName, id, updatedItem);
          }
        }
        
        // Handle Deletes
        for (const [id] of currentMap.entries()) {
          if (id && !newMap.has(id)) {
            await (db as any)[tableName].delete(id);
            await syncEngine.queueOperation('DELETE', tableName, id, null);
          }
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue] as [T, (value: T | ((val: T) => T)) => Promise<void>];
}
