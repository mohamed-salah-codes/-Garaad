import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../store/useAuthStore';
import './TopNav.css';

export default function TopNav({ toggleSidebar }: { toggleSidebar: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Hide back button on the "home" dashboard, typically tasks page for the first project
  const isHome = location.pathname === '/' || location.pathname.match(/^\/project\/[^/]+\/tasks$/);

  const getPageTitle = () => {
    if (location.pathname.includes('/reports')) return 'Reports & Analytics';
    if (location.pathname.includes('/settings')) return 'Settings';
    if (location.pathname.includes('/tasks')) return 'Tasks';
    if (location.pathname.includes('/calendar')) return 'Calendar';
    if (location.pathname.includes('/notes')) return 'Notes Workspace';
    return 'Dashboard';
  };

  const handleSignOut = async () => {
    await useAuthStore.getState().signOut();
    navigate('/login');
  };

  return (
    <header className="topnav">
      <div className="topnav-left">
        <button className="topnav-hamburger" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        
        {!isHome && (
          <button className="topnav-back" onClick={() => navigate(-1)} aria-label="Go Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}
        
        <h1 className="topnav-title">{getPageTitle()}</h1>
      </div>

      <div className="topnav-center">
        <div className="topnav-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="topnav-right">
        {/* Theme Switcher */}
        <div className="topnav-dropdown-container">
          <button className="topnav-icon-btn" onClick={() => setShowThemeMenu(!showThemeMenu)} aria-label="Theme">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </button>
          {showThemeMenu && (
            <div className="topnav-dropdown" onMouseLeave={() => setShowThemeMenu(false)}>
              <button className={theme === 'system' ? 'active' : ''} onClick={() => { setTheme('system'); setShowThemeMenu(false); }}>🖥️ System</button>
              <button className={theme === 'light' ? 'active' : ''} onClick={() => { setTheme('light'); setShowThemeMenu(false); }}>☀️ Light</button>
              <button className={theme === 'dark' ? 'active' : ''} onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}>🌙 Dark</button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="topnav-icon-btn" aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>

        {/* User Profile */}
        <div className="topnav-dropdown-container">
          <button className="topnav-avatar-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </button>
          {showProfileMenu && (
            <div className="topnav-dropdown right-aligned" onMouseLeave={() => setShowProfileMenu(false)}>
              <div className="profile-header">
                <strong>{user?.user_metadata?.full_name || 'User'}</strong>
                <span>{user?.email}</span>
              </div>
              <div className="divider"></div>
              <button onClick={() => { navigate('/project/p1/settings'); setShowProfileMenu(false); }}>Settings</button>
              <button onClick={() => { handleSignOut(); setShowProfileMenu(false); }}>Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
