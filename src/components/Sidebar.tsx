import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveProject } from '../contexts/ActiveProjectContext';
import { getIconById } from '../constants/iconLibrary';

const FOLDER_ICONS: Record<string, string> = {
  default: 'M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
  code: 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z',
  design: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
  music: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',
  image: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
  video: 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
  download: 'M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z',
  star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  work: 'M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.98 16.04 1 13.64 1c-1.3 0-2.43.52-3.27 1.36L10 2.73l-.37-.37C8.79 1.52 7.66 1 6.36 1 3.96 1 2 2.98 2 5.64c0 .48.11.92.18 1.36H0v14h24V6h-4z',
  lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  chart: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
  share: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z',
};

function FolderSVG({ color = '#3b82f6', icon = 'default', size = 16 }: { color?: string; icon?: string; size?: number }) {
  const ReactIcon = getIconById(icon);
  const iconPath = ReactIcon ? null : FOLDER_ICONS[icon] || FOLDER_ICONS['default'];
  const folderColor = color || '#3b82f6';
  const darkColor = folderColor + 'bb';
  
  return (
    <svg width={size} height={size} viewBox="0 0 40 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="8" width="40" height="26" rx="3" fill={darkColor} />
      <rect x="0" y="4" width="16" height="8" rx="2" fill={darkColor} />
      <rect x="0" y="10" width="40" height="24" rx="3" fill={folderColor} />
      <g transform="translate(10, 11) scale(0.833)">
        {ReactIcon ? (
          <ReactIcon size={24} color="rgba(255,255,255,0.9)" />
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d={iconPath || undefined} fill="rgba(255,255,255,0.9)" />
          </svg>
        )}
      </g>
    </svg>
  );
}

interface SidebarProps {
  isCollapsed: boolean;
  selectedProjectId?: string;
  setCustomizeFolder?: (folder: any) => void;
  setFolderToRename?: (folder: any) => void;
  toggleSidebar?: () => void;
  autoCollapse?: boolean;
  toggleAutoCollapse?: () => void;
}

export default function Sidebar({ isCollapsed, selectedProjectId, setCustomizeFolder, setFolderToRename, toggleSidebar, autoCollapse, toggleAutoCollapse }: SidebarProps) {
  const navigate = useNavigate();
  const { projects, setProjects, folders, setFolders } = useActiveProject();

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [folderMenuOpenId, setFolderMenuOpenId] = useState<string | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleCreateProject = (folderId?: string) => {
    const newProject = {
      id: `p${Date.now()}`,
      name: 'New Project',
      status: 'Active',
      progress: 0,
      team: [],
      folderId
    };
    setProjects(current => [...current, newProject]);
    setIsAddMenuOpen(false);
    setFolderMenuOpenId(null);
    navigate(`/project/${newProject.id}/tasks`);
  };

  const handleCreateFolder = () => {
    const newFolder = {
      id: `f${Date.now()}`,
      name: 'New Folder',
      color: '#3b82f6',
      icon: 'default'
    };
    setFolders(current => [...current, newFolder]);
    setIsAddMenuOpen(false);
  };

  const handleDeleteFolder = (folder: any) => {
    if (window.confirm(`Delete folder "${folder.name}"? Projects inside will be moved to the root.`)) {
      setProjects(current => current.map(p => p.folderId === folder.id ? { ...p, folderId: undefined } : p));
      setFolders(current => current.filter(f => f.id !== folder.id));
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-global-nav">
        <button
          className="sidebar-global-nav-item"
          onClick={() => navigate('/reports')}
          title="Global Reports & Analytics"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          {!isCollapsed && <span>Reports &amp; Analytics</span>}
        </button>
        <button
          className="sidebar-global-nav-item"
          onClick={toggleSidebar}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {!isCollapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>

      {!isCollapsed && toggleAutoCollapse && (
        <div className="sidebar-section" style={{ paddingTop: '0', borderTop: 'none', marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--muted)' }}>
            <input type="checkbox" checked={autoCollapse} onChange={toggleAutoCollapse} style={{ accentColor: 'var(--accent)' }} />
            Auto-collapse when inactive
          </label>
        </div>
      )}

      <div className="sidebar-section project-list-section">
        <div className="section-header" style={{ position: 'relative' }}>
          {!isCollapsed && <span>Projects</span>}
          <button 
            type="button" 
            className="icon-button" 
            aria-label="New project"
            onClick={(e) => { e.stopPropagation(); setIsAddMenuOpen(!isAddMenuOpen); }}
          >
            +
          </button>
          {isAddMenuOpen && !isCollapsed && (
            <div className="sidebar-dropdown-menu" onClick={e => e.stopPropagation()}>
              <button className="sidebar-dropdown-item" onClick={() => handleCreateProject()}>
                <span style={{ border: '1px solid currentColor', borderRadius: '4px', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>+</span> 
                Create project
              </button>
              <button className="sidebar-dropdown-item" onClick={handleCreateFolder}>
                <span style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                  </svg>
                </span>
                Create folder
              </button>
            </div>
          )}
        </div>

        <div className="project-list">
          {folders.map(folder => {
            const folderProjects = projects.filter(p => p.folderId === folder.id);
            const isExpanded = expandedFolders[folder.id];
            return (
              <div key={folder.id} className="sidebar-folder">
                <div className={`folder-header ${isExpanded ? 'expanded' : ''}`} style={{ position: 'relative' }} onClick={() => toggleFolder(folder.id)}>
                  {!isCollapsed && (
                    <span className="folder-arrow" style={{ display: 'inline-flex', alignItems: 'center', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                  <span className="folder-icon" style={{ display: 'flex', alignItems: 'center' }} title={isCollapsed ? folder.name : ''}>
                    <FolderSVG color={folder.color} icon={folder.icon} size={18} />
                  </span>
                  {!isCollapsed && <span className="folder-name">{folder.name}</span>}
                  
                  {!isCollapsed && (
                    <>
                      <button 
                        className="folder-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFolderMenuOpenId(folderMenuOpenId === folder.id ? null : folder.id);
                        }}
                      >⋮</button>
                      {folderMenuOpenId === folder.id && (
                        <div className="sidebar-dropdown-menu" onClick={e => e.stopPropagation()}>
                          <button className="sidebar-dropdown-item" onClick={() => handleCreateProject(folder.id)}>
                            <span style={{ border: '1px solid currentColor', borderRadius: '4px', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>+</span> 
                            Create project
                          </button>
                          <button className="sidebar-dropdown-item" onClick={() => { if(setFolderToRename) setFolderToRename(folder); setFolderMenuOpenId(null); }}>
                            <span>✏️</span>
                            Rename folder
                          </button>
                          <button className="sidebar-dropdown-item" onClick={() => { if(setCustomizeFolder) setCustomizeFolder(folder); setFolderMenuOpenId(null); }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                            </span>
                            Customize folder
                          </button>
                          <button className="sidebar-dropdown-item danger" onClick={() => handleDeleteFolder(folder)}>
                            <span>🗑️</span>
                            Delete folder
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {isExpanded && !isCollapsed && (
                  <div className="folder-projects">
                    {folderProjects.map(project => (
                      <button
                        key={project.id}
                        type="button"
                        className={`project-link ${selectedProjectId === project.id ? 'active' : ''}`}
                        onClick={() => navigate(`/project/${project.id}/tasks`)}
                      >
                        <span>{project.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          
          {/* Root-level projects */}
          {projects.filter(p => !p.folderId).map((project) => (
            <button
              key={project.id}
              type="button"
              className={`project-link ${selectedProjectId === project.id ? 'active' : ''}`}
              onClick={() => navigate(`/project/${project.id}/tasks`)}
              title={isCollapsed ? project.name : ''}
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '8px 0' : '8px 12px' }}
            >
              {isCollapsed ? (
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>P</div>
              ) : (
                <span>{project.name}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
