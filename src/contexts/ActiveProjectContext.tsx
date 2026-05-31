import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

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
  setProjects: (value: Project[] | ((val: Project[]) => Project[])) => Promise<void>;
  folders: Folder[];
  setFolders: (value: Folder[] | ((val: Folder[]) => Folder[])) => Promise<void>;
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

export const ActiveProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useLocalStorage<Project[]>('garaad_projects', defaultProjects);
  const [folders, setFolders] = useLocalStorage<Folder[]>('garaad_folders', defaultFolders);
  const [currentProject, setCurrentProject] = useState<Project | null>(projects[0] || null);

  useEffect(() => {
    if (!currentProject && projects.length > 0) {
      setCurrentProject(projects[0]);
    }
  }, [projects, currentProject]);

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
