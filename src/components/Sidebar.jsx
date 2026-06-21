import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Settings as SettingsIcon, X, GraduationCap, ExternalLink } from 'lucide-react';

const Sidebar = ({ mobileOpen, closeSidebar }) => {
  return (
    <>
      <style>{`
        .sidebar {
          width: 260px;
          background-color: var(--surface);
          border-right: 1px solid var(--surface-border);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 200;
          transition: transform var(--transition-normal);
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem;
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--primary);
          border-bottom: 1px solid var(--surface-border);
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1.5rem 1rem;
          flex: 1;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.75rem 1rem;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.9375rem;
          transition: all var(--transition-fast);
        }
        .sidebar-link:hover {
          background-color: var(--surface-hover);
          color: var(--text-primary);
        }
        .sidebar-link.active {
          background-color: var(--primary-light);
          color: var(--primary);
        }
        .sidebar-footer {
          padding: 1.25rem 1rem;
          border-top: 1px solid var(--surface-border);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .close-sidebar-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 0.25rem;
        }
        
        .hero-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #f8fafc;
          border: 1px solid #334155;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.8125rem;
          font-weight: 700;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .hero-btn:hover {
          background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
        }
        [data-theme='dark'] .hero-btn {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border-color: #818cf8;
          color: #ffffff;
        }
        [data-theme='dark'] .hero-btn:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
          box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
        }

        @media (max-width: 768px) {
          .close-sidebar-btn {
            display: block;
          }
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
            box-shadow: var(--shadow-xl);
          }
          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(2px);
            z-index: 150;
            animation: modalFadeIn var(--transition-fast) forwards;
          }
        }
      `}</style>

      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <GraduationCap size={26} />
          <span style={{ flex: 1 }}>InternTrack Pro</span>
          <button className="close-sidebar-btn" onClick={closeSidebar} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className="sidebar-link" onClick={closeSidebar}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/tracker" className="sidebar-link" onClick={closeSidebar}>
            <Briefcase size={18} />
            <span>Applications</span>
          </NavLink>

          <NavLink to="/settings" className="sidebar-link" onClick={closeSidebar}>
            <SettingsIcon size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {/* Digital Heroes Requirement Link Button */}
          <a 
            href="https://digitalheroesco.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hero-btn"
          >
            <span>Built for Digital Heroes</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
