import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Folder = {
  id: string;
  name: string;
  color?: string;
  icon?: string;
};

export type Project = {
  id: string;
  name: string;
  status: string;
  progress: number;
  team: string[];
  folderId?: string; // Optional: Project can belong to a folder
};

type ActiveProjectContextType = {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
};

const ActiveProjectContext = createContext<ActiveProjectContextType | undefined>(undefined);

const defaultProjects: Project[] = [
  {
    id: 'p1',
    name: 'Garaad Productivity Suite',
    status: 'Active',
    progress: 82,
    team: ['Amina', 'Samir', 'Omar'],
  },
  {
    id: 'p2',
    name: 'Calendar Planner Beta',
    status: 'Active',
    progress: 70,
    team: ['Lina', 'Musa'],
  },
  {
    id: 'p3',
    name: 'Notes Workspace MVP',
    status: 'Completed',
    progress: 100,
    team: ['Khadija'],
  },
];

const defaultFolders: Folder[] = [
  { id: 'f1', name: 'p' }
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore parse errors
  }
  return fallback;
}

export const ActiveProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(() =>
    loadFromStorage('garaad_projects', defaultProjects)
  );
  const [folders, setFolders] = useState<Folder[]>(() =>
    loadFromStorage('garaad_folders', defaultFolders)
  );
  const [currentProject, setCurrentProject] = useState<Project | null>(
    () => {
      const stored = loadFromStorage<Project[]>('garaad_projects', defaultProjects);
      return stored[0] || null;
    }
  );

  // Persist projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('garaad_projects', JSON.stringify(projects));
  }, [projects]);

  // Persist folders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('garaad_folders', JSON.stringify(folders));
  }, [folders]);

  return (
    <ActiveProjectContext.Provider value={{ currentProject, setCurrentProject, projects, setProjects, folders, setFolders }}>
      {children}
    </ActiveProjectContext.Provider>
  );
};

export const useActiveProject = () => {
  const context = useContext(ActiveProjectContext);
  if (context === undefined) {
    throw new Error('useActiveProject must be used within an ActiveProjectProvider');
  }
  return context;
};
