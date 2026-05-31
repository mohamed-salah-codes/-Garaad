import { db } from '../db/db';
import { supabase } from './supabase';
import { useSyncStore } from '../store/useSyncStore';

class SyncEngine {
  private isSyncing = false;
  private syncInterval?: number;

  init() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    if (navigator.onLine) {
      useSyncStore.getState().setStatus('synced');
      this.syncAll();
    } else {
      useSyncStore.getState().setStatus('offline');
    }

    // Attempt periodic sync every 30 seconds if online
    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.syncAll();
      }
    }, 30000);
  }

  private handleOnline() {
    console.log('App is online. Starting sync...');
    useSyncStore.getState().setStatus('syncing');
    this.syncAll();
  }

  private handleOffline() {
    console.log('App is offline.');
    useSyncStore.getState().setStatus('offline');
  }

  async syncAll() {
    if (this.isSyncing || !navigator.onLine) return;
    this.isSyncing = true;
    useSyncStore.getState().setStatus('syncing');

    try {
      await this.pushLocalChanges();
      await this.pullRemoteChanges();
      useSyncStore.getState().setStatus('synced');
    } catch (error) {
      console.error('Sync failed:', error);
      useSyncStore.getState().setStatus('offline'); // or error state
    } finally {
      this.isSyncing = false;
    }
  }

  async pushLocalChanges() {
    // 1. Get all pending operations from sync_queue ordered by created_at
    const pendingOps = await db.sync_queue.orderBy('created_at').toArray();
    if (pendingOps.length === 0) return;

    for (const op of pendingOps) {
      try {
        if (op.operation === 'INSERT') {
          await supabase.from(op.table_name).insert(op.payload);
        } else if (op.operation === 'UPDATE') {
          await supabase.from(op.table_name).update(op.payload).eq('id', op.record_id);
        } else if (op.operation === 'DELETE') {
          await supabase.from(op.table_name).delete().eq('id', op.record_id);
        }
        // Remove from queue if successful
        if (op.id) {
          await db.sync_queue.delete(op.id);
        }
      } catch (error) {
        console.error(`Failed to push operation ${op.id} to Supabase:`, error);
        // We'll leave it in the queue to try again later
      }
    }
  }

  async pullRemoteChanges() {
    // Pull the latest changes from Supabase to Dexie for all tables
    // In a real robust system, this would use an 'updated_at' cursor.
    // For now, we will pull all records for the authenticated user and merge.
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return;

    const tables = ['projects', 'tasks', 'notes', 'calendar_events', 'settings'];

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').eq('user_id', userId);
      if (error) {
        console.error(`Error pulling from ${table}:`, error);
        continue;
      }

      if (data && data.length > 0) {
        // Simple merge: remote wins (in a real app, compare updated_at)
        // Wait, Dexie bulkPut replaces existing records with the same primary key (id).
        await (db as any)[table].bulkPut(data);
      }
    }
  }

  async queueOperation(operation: 'INSERT' | 'UPDATE' | 'DELETE', table_name: string, record_id: string, payload: any) {
    await db.sync_queue.add({
      operation,
      table_name,
      record_id,
      payload,
      created_at: new Date().toISOString()
    });

    if (navigator.onLine && !this.isSyncing) {
      this.syncAll();
    } else {
      useSyncStore.getState().setStatus('offline'); // Ensure UI shows offline/pending
    }
  }
}

export const syncEngine = new SyncEngine();
