import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { syncEngine } from '../lib/SyncEngine';
import { useDataStore } from './useDataStore';
import { db } from '../db/db';
import { v4 as uuidv4 } from 'uuid';

interface AuthStore {
  user: User | null;
  session: Session | null;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; requiresEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string; phone?: string; country?: string; birthday?: string }) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  uploadAvatar: (file: File) => Promise<{ error: string | null; url: string | null }>;
}

const createDefaultWorkspace = async (userId: string, fullName: string) => {
  try {
    // Create default profile
    await db.profiles.put({
      id: userId,
      email: '',
      full_name: fullName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Create default folder "Garaad Workspace"
    const defaultFolderId = uuidv4();
    const defaultProjectId = uuidv4();

    // Add to localStorage in existing format so the UI picks it up
    const existingFolders = JSON.parse(localStorage.getItem('garaad_folders') || '[]');
    if (existingFolders.length === 0) {
      const newFolder = {
        id: defaultFolderId,
        name: 'Garaad Workspace',
        color: '#7C3AED',
        icon: '🚀',
      };
      localStorage.setItem('garaad_folders', JSON.stringify([newFolder]));
    }

    const existingProjects = JSON.parse(localStorage.getItem('garaad_projects') || '[]');
    if (existingProjects.length === 0) {
      const newProject = {
        id: defaultProjectId,
        name: 'My First Project',
        status: 'In Progress',
        progress: 0,
        folderId: defaultFolderId,
        team: [],
        description: 'Welcome to Garaad! Start by adding tasks to this project.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId,
      };
      localStorage.setItem('garaad_projects', JSON.stringify([newProject]));
    }
  } catch (err) {
    console.error('[Auth] Failed to create default workspace:', err);
  }
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isInitialized: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, isInitialized: true });
    
    if (session?.user) {
      syncEngine.init();
      await useDataStore.getState().loadInitialData();
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        syncEngine.init();
        await useDataStore.getState().loadInitialData();
      }
    });
  },

  signUp: async (email: string, password: string, fullName: string) => {
    console.log('[Auth] Attempting signup for:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });

    if (error) {
      console.error('[Auth] Signup error:', error.message);
      return { error: error.message };
    }

    console.log('[Auth] Signup success, creating default workspace...');
    if (data.user) {
      await createDefaultWorkspace(data.user.id, fullName);

      // Also try to insert profile into Supabase
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('[Auth] Profile insert to Supabase failed (table may not exist yet):', e);
      }
    }

    const requiresEmailConfirmation = !!data.user && !data.session;
    return { error: null, requiresEmailConfirmation };
  },

  signIn: async (email: string, password: string) => {
    console.log('[Auth] Attempting sign in for:', email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[Auth] Sign in error:', error.message);
      return { error: error.message };
    }
    console.log('[Auth] Sign in success');
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },

  updateProfile: async (updates) => {
    const { user } = useAuthStore.getState();
    if (!user) return { error: 'Not logged in' };
    
    try {
      const { error } = await supabase.from('profiles').update({
        ...updates,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);

      // Also update local Dexie database
      await db.profiles.update(user.id, {
        ...updates,
        updated_at: new Date().toISOString(),
      });

      return { error: error ? error.message : null };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? error.message : null };
  },

  uploadAvatar: async (file: File) => {
    const { user } = useAuthStore.getState();
    if (!user) return { error: 'Not logged in', url: null };

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    let uploadResult = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    // Handle bucket not found
    if (uploadResult.error && (uploadResult.error.message.includes('Bucket not found') || uploadResult.error.message.includes('not exist'))) {
      console.log('[Auth] Avatars bucket not found. Attempting to create it...');
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('[Auth] Failed to create bucket:', createError);
        return { 
          error: 'Bucket "avatars" not found and could not be created automatically. Please create a public bucket named "avatars" in your Supabase dashboard and grant insert/select permissions to authenticated users.', 
          url: null 
        };
      }

      // Retry upload after bucket creation
      uploadResult = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
    }

    if (uploadResult.error) {
      return { error: uploadResult.error.message, url: null };
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return { error: null, url: data.publicUrl };
  }
}));
