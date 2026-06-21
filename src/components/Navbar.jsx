import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Menu, Sun, Moon, LogOut, Settings as SettingsIcon, User } from 'lucide-react';

const Navbar = ({ toggleMobileSidebar }) => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Determine page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/tracker') return 'Applications';
    if (path === '/settings') return 'Settings';
    return 'InternTrack Pro';
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      navigate('/login');
    } catch (error) {
      showToast('Failed to log out: ' + error.message, 'error');
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!currentUser || !currentUser.displayName) return 'U';
    return currentUser.displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="navbar" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--surface-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: '70px',
      boxSizing: 'border-box'
    }}>
      <style>{`
        .navbar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .icon-btn {
          background: none;
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-md);
          padding: 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .icon-btn:hover {
          background-color: var(--surface-hover);
          color: var(--text-primary);
          border-color: var(--text-muted);
        }
        .profile-avatar-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: var(--primary-light);
          color: var(--primary);
          border: 2px solid var(--surface-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .profile-avatar-btn:hover {
          border-color: var(--primary);
          transform: scale(1.05);
        }
        .nav-dropdown {
          position: absolute;
          top: 60px;
          right: 2rem;
          background-color: var(--surface);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          width: 240px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          animation: modalScaleIn 0.15s ease forwards;
        }
        .nav-dropdown-header {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--surface-border);
          margin-bottom: 0.25rem;
        }
        .nav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          border: none;
          background: none;
          text-align: left;
          width: 100%;
          transition: all var(--transition-fast);
        }
        .nav-dropdown-item:hover {
          background-color: var(--surface-hover);
          color: var(--text-primary);
        }
        .nav-dropdown-item-danger {
          color: var(--danger);
        }
        .nav-dropdown-item-danger:hover {
          background-color: var(--danger-light);
          color: var(--danger);
        }
        .menu-toggle-btn {
          display: none;
        }
        @media (max-width: 768px) {
          .menu-toggle-btn {
            display: flex;
          }
          .navbar {
            padding: 1rem;
          }
          .nav-dropdown {
            right: 1rem;
          }
        }
      `}</style>

      {/* Left section: Hamburger (mobile only) & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="icon-btn menu-toggle-btn" onClick={toggleMobileSidebar} aria-label="Toggle Sidebar">
          <Menu size={20} />
        </button>
        <h1 className="navbar-title">{getPageTitle()}</h1>
      </div>

      {/* Right section: Theme toggle & Profile */}
      <div className="navbar-actions">
        <button 
          className="icon-btn" 
          onClick={toggleTheme} 
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {currentUser && (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
              className="profile-avatar-btn" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="User profile menu"
            >
              {getInitials()}
            </button>

            {dropdownOpen && (
              <div className="nav-dropdown">
                <div className="nav-dropdown-header">
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.displayName || 'User'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser.email}
                  </div>
                </div>

                <Link to="/settings" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <SettingsIcon size={16} />
                  <span>Settings</span>
                </Link>

                <button 
                  className="nav-dropdown-item nav-dropdown-item-danger" 
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
