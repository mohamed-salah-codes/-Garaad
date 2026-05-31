import Dexie, { type Table } from 'dexie';

export type SyncOperation = 'INSERT' | 'UPDATE' | 'DELETE';

export interface SyncQueueItem {
  id?: string;
  operation: SyncOperation;
  table_name: string;
  record_id: string;
  payload: any;
  created_at: string;
}

export interface Profile {
  id: string; // == user_id from Supabase Auth
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id?: string;
  name: string;
  status: string;
  progress: number;
  folder_id?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
}

export interface Task {
  id: string;
  user_id?: string;
  project_id?: string;
  title: string;
  description: string;
  status: string;
  type: string;
  priority: string;
  due_date: string;
  estimated_hours?: number;
  actual_hours?: number;
  order_index?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  subtasks?: any[];
  comments?: any[];
  is_deleted?: boolean;
}

export interface Note {
  id: string;
  user_id?: string;
  title: string;
  content: string;
  folder_id?: string;
  category?: string;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
}

export interface CalendarEvent {
  id: string;
  user_id?: string;
  title: string;
  date: string;
  time?: string;
  type?: string;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
}

export interface TimeLog {
  id: string;
  user_id?: string;
  task_id?: string;
  project_id?: string;
  duration_minutes: number;
  start_time: string;
  end_time?: string;
  note?: string;
  created_at: string;
}

export interface ReportArchive {
  id: string;
  user_id?: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom' | 'project';
  period_label: string;
  period_start: string;
  period_end: string;
  project_id?: string;
  payload: any; // The full JSON snapshot of metrics
  created_at: string;
}

export interface Settings {
  id: string;
  user_id?: string;
  profile_data?: any;
  preferences?: any;
  updated_at: string;
}

export class GaraadDB extends Dexie {
  sync_queue!: Table<SyncQueueItem, string>;
  profiles!: Table<Profile, string>;
  projects!: Table<Project, string>;
  tasks!: Table<Task, string>;
  notes!: Table<Note, string>;
  calendar_events!: Table<CalendarEvent, string>;
  time_logs!: Table<TimeLog, string>;
  reports_archive!: Table<ReportArchive, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('GaraadOfflineDB');
    this.version(2).stores({
      sync_queue: '++id, operation, table_name, record_id, created_at',
      profiles: 'id, email',
      projects: 'id, user_id, status, folder_id, updated_at',
      tasks: 'id, user_id, project_id, status, type, priority, due_date, completed_at, updated_at',
      notes: 'id, user_id, folder_id, category, updated_at',
      calendar_events: 'id, user_id, date, type, updated_at',
      time_logs: 'id, user_id, task_id, project_id, start_time, created_at',
      reports_archive: 'id, user_id, report_type, period_start, period_end, project_id, created_at',
      settings: 'id, user_id'
    });
  }
}

export const db = new GaraadDB();
