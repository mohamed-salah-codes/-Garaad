import { create } from 'zustand';

type SyncStatus = 'synced' | 'syncing' | 'offline';

interface SyncStore {
  status: SyncStatus;
  setStatus: (status: SyncStatus) => void;
}

export const useSyncStore = create<SyncStore>((set) => ({
  status: navigator.onLine ? 'synced' : 'offline',
  setStatus: (status) => set({ status }),
}));
