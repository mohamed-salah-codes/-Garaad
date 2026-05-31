import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import './GlobalLayout.css';

export default function GlobalLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [autoCollapse, setAutoCollapse] = useState(() => localStorage.getItem('garaad_auto_collapse') === 'true');
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location]);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const toggleAutoCollapse = () => {
    const nextVal = !autoCollapse;
    setAutoCollapse(nextVal);
    localStorage.setItem('garaad_auto_collapse', String(nextVal));
  };

  // Auto-collapse logic
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleInactivity = () => {
      if (autoCollapse && !isMobileSidebarOpen && !isSidebarCollapsed && window.innerWidth > 768) {
        setIsSidebarCollapsed(true);
      }
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (autoCollapse && !isSidebarCollapsed && window.innerWidth > 768) {
        timeoutId = setTimeout(handleInactivity, 15000); // 15 seconds of inactivity
      }
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(timeoutId);
    };
  }, [autoCollapse, isSidebarCollapsed, isMobileSidebarOpen]);

  return (
    <div className="global-layout">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="sidebar-mobile-overlay" 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`global-sidebar-container ${isMobileSidebarOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          toggleSidebar={toggleSidebar}
          autoCollapse={autoCollapse}
          toggleAutoCollapse={toggleAutoCollapse}
        />
      </div>

      {/* Main Content Area */}
      <div className={`global-main-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopNav toggleSidebar={toggleSidebar} />
        <main className="global-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
