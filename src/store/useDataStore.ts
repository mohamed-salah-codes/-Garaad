import { create } from 'zustand';
import { db, type Project, type Task, type Note, type CalendarEvent } from '../db/db';
import { syncEngine } from '../lib/SyncEngine';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

interface DataStore {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  calendarEvents: CalendarEvent[];
  
  loadInitialData: () => Promise<void>;
  
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // (We can add more for Notes/Events, but let's start here to support App.tsx)
}

export const useDataStore = create<DataStore>((set) => ({
  projects: [],
  tasks: [],
  notes: [],
  calendarEvents: [],

  loadInitialData: async () => {
    // Subscribe to Dexie changes via Dexie hooks in components, OR load all here
    const projects = await db.projects.toArray();
    const tasks = await db.tasks.toArray();
    const notes = await db.notes.toArray();
    const calendarEvents = await db.calendar_events.toArray();
    
    set({ projects, tasks, notes, calendarEvents });
  },

  addProject: async (projectData) => {
    const user = (await supabase.auth.getSession()).data.session?.user;
    const newProject: Project = {
      ...projectData,
      id: uuidv4(),
      user_id: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await db.projects.add(newProject);
    await syncEngine.queueOperation('INSERT', 'projects', newProject.id, newProject);
    
    set(state => ({ projects: [...state.projects, newProject] }));
    return newProject;
  },

  updateProject: async (id, updates) => {
    const updated_at = new Date().toISOString();
    await db.projects.update(id, { ...updates, updated_at });
    
    const updatedProject = await db.projects.get(id);
    if (updatedProject) {
      await syncEngine.queueOperation('UPDATE', 'projects', id, { ...updates, updated_at });
      set(state => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...updates, updated_at } : p)
      }));
    }
  },

  deleteProject: async (id) => {
    await db.projects.delete(id);
    await syncEngine.queueOperation('DELETE', 'projects', id, null);
    set(state => ({
      projects: state.projects.filter(p => p.id !== id)
    }));
  },

  addTask: async (taskData) => {
    const user = (await supabase.auth.getSession()).data.session?.user;
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      user_id: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await db.tasks.add(newTask);
    await syncEngine.queueOperation('INSERT', 'tasks', newTask.id, newTask);
    
    set(state => ({ tasks: [...state.tasks, newTask] }));
    return newTask;
  },

  updateTask: async (id, updates) => {
    const updated_at = new Date().toISOString();
    await db.tasks.update(id, { ...updates, updated_at });
    
    const updatedTask = await db.tasks.get(id);
    if (updatedTask) {
      await syncEngine.queueOperation('UPDATE', 'tasks', id, { ...updates, updated_at });
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates, updated_at } : t)
      }));
    }
  },

  deleteTask: async (id) => {
    await db.tasks.delete(id);
    await syncEngine.queueOperation('DELETE', 'tasks', id, null);
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== id)
    }));
  }
}));
