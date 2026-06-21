import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { exportToCSV, exportToJSON } from '../utils/exporters';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileJson, 
  User, 
  Sun, 
  Moon, 
  ExternalLink,
  ShieldAlert,
  Loader2,
  Trash2
} from 'lucide-react';

const Settings = () => {
  const { currentUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Load user applications to prepare for exports
  useEffect(() => {
    const fetchApps = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'applications'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const apps = [];
        querySnapshot.forEach((doc) => {
          apps.push({ id: doc.id, ...doc.data() });
        });
        setApplications(apps);
      } catch (error) {
        console.error(error);
        showToast('Failed to load data for export: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [currentUser, showToast]);

  const handleExportCSV = () => {
    if (applications.length === 0) {
      showToast('No applications found to export', 'warning');
      return;
    }
    exportToCSV(applications);
    showToast('CSV file downloaded successfully!', 'success');
  };

  const handleExportJSON = () => {
    if (applications.length === 0) {
      showToast('No applications found to export', 'warning');
      return;
    }
    exportToJSON(applications);
    showToast('JSON Backup file downloaded!', 'success');
  };

  // Restore Backup logic
  const handleRestoreBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Validate schema: Must be an array of application objects
        if (!Array.isArray(data)) {
          showToast('Invalid backup file. Data must be an array.', 'error');
          return;
        }

        if (data.length === 0) {
          showToast('Backup file is empty.', 'warning');
          return;
        }

        // Schema validation helper
        const isValidApp = (app) => {
          return (
            app &&
            typeof app.company === 'string' && app.company.trim() !== '' &&
            typeof app.role === 'string' && app.role.trim() !== '' &&
            typeof app.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(app.date) &&
            typeof app.status === 'string' &&
            ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'].includes(app.status)
          );
        };

        const validApps = data.filter(isValidApp);
        
        if (validApps.length === 0) {
          showToast('No valid application records found in backup.', 'error');
          return;
        }

        setRestoring(true);
        let restoredCount = 0;

        // Sequentially write records to Firestore
        for (const app of validApps) {
          await addDoc(collection(db, 'applications'), {
            userId: currentUser.uid,
            company: app.company.trim(),
            role: app.role.trim(),
            date: app.date,
            status: app.status,
            url: app.url ? app.url.trim() : '',
            notes: app.notes ? app.notes.trim() : '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          restoredCount++;
        }

        showToast(`Successfully restored ${restoredCount} applications!`, 'success');
        
        // Refresh local state lists
        const q = query(
          collection(db, 'applications'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const apps = [];
        querySnapshot.forEach((doc) => {
          apps.push({ id: doc.id, ...doc.data() });
        });
        setApplications(apps);

      } catch (err) {
        console.error('Restore Error:', err);
        showToast('Failed to parse backup file. Please ensure it is a valid JSON file.', 'error');
      } finally {
        setRestoring(false);
        // Clear input value to allow uploading same file again if needed
        e.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <>
      <style>{`
        .settings-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }
        .settings-section-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        .settings-section-desc {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
        }
        .settings-card {
          margin-bottom: 1.5rem;
        }
        .action-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.15rem 0;
          border-bottom: 1px solid var(--surface-border);
        }
        .action-row:last-child {
          border-bottom: none;
        }
        .action-row-content {
          flex: 1;
        }
        .action-row-title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .action-row-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.125rem;
        }
        
        .restore-input-wrapper {
          position: relative;
          overflow: hidden;
          display: inline-block;
        }
        .restore-file-input {
          position: absolute;
          font-size: 100px;
          opacity: 0;
          right: 0;
          top: 0;
          cursor: pointer;
        }

        @media (max-width: 992px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="animate-fade-in settings-grid">
        {/* Left: Settings Forms */}
        <div>
          
          {/* User Profile info */}
          <div className="card settings-card">
            <h3 className="settings-section-title">User Account Details</h3>
            <p className="settings-section-desc">Verify your authentication profile details</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifycontent: 'center',
                fontSize: '1.25rem',
                fontWeight: 700
              }}>
                <User size={24} style={{ color: 'var(--primary)' }} />
              </div>
              
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                  {currentUser?.displayName || 'Developer Candidate'}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {currentUser?.email}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Account UID:</span>
                <code style={{ color: 'var(--text-muted)', backgroundColor: 'var(--background)', padding: '0.125rem 0.375rem', borderRadius: 'var(--radius-sm)' }}>
                  {currentUser?.uid}
                </code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Authentication:</span>
                <span className="font-semibold" style={{ color: 'var(--success-hover)' }}>Firebase Auth (Verified)</span>
              </div>
            </div>
          </div>

          {/* Theme Preferences */}
          <div className="card settings-card">
            <h3 className="settings-section-title">Interface Preferences</h3>
            <p className="settings-section-desc">Customize your dashboard display preferences</p>
            
            <div className="action-row">
              <div className="action-row-content">
                <div className="action-row-title">Color Scheme Mode</div>
                <div className="action-row-desc">Toggle between light theme and high-contrast dark theme.</div>
              </div>
              <div>
                <button className="btn btn-secondary" onClick={toggleTheme} style={{ display: 'flex', gap: '0.5rem' }}>
                  {isDark ? (
                    <>
                      <Sun size={16} />
                      <span>Switch Light</span>
                    </>
                  ) : (
                    <>
                      <Moon size={16} />
                      <span>Switch Dark</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Data Portability */}
          <div className="card settings-card">
            <h3 className="settings-section-title">Data Portability & Backups</h3>
            <p className="settings-section-desc">Download or restore application tracker databases</p>

            {/* Export CSV */}
            <div className="action-row">
              <div className="action-row-content">
                <div className="action-row-title">Export CSV Spreadsheet</div>
                <div className="action-row-desc">Download a standardized CSV file compatible with Microsoft Excel and Google Sheets.</div>
              </div>
              <div>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleExportCSV} 
                  disabled={loading || applications.length === 0}
                  style={{ display: 'flex', gap: '0.5rem' }}
                >
                  <FileSpreadsheet size={16} />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {/* Export JSON Backup */}
            <div className="action-row">
              <div className="action-row-content">
                <div className="action-row-title">Download JSON Database Backup</div>
                <div className="action-row-desc">Create a full portable snapshot of your tracking records to migrate or store safely.</div>
              </div>
              <div>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleExportJSON} 
                  disabled={loading || applications.length === 0}
                  style={{ display: 'flex', gap: '0.5rem' }}
                >
                  <Download size={16} />
                  <span>Download Backup</span>
                </button>
              </div>
            </div>

            {/* Restore JSON Backup */}
            <div className="action-row">
              <div className="action-row-content">
                <div className="action-row-title">Restore Database Backup</div>
                <div className="action-row-desc">Upload a previously saved JSON file to restore and sync applications with your account.</div>
              </div>
              <div>
                <div className="restore-input-wrapper">
                  <button 
                    className="btn btn-primary" 
                    disabled={restoring}
                    style={{ display: 'flex', gap: '0.5rem' }}
                  >
                    {restoring ? (
                      <>
                        <Loader2 size={16} className="spinner" style={{ borderTopColor: '#ffffff' }} />
                        <span>Restoring...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Restore Backup</span>
                      </>
                    )}
                  </button>
                  <input 
                    type="file" 
                    accept=".json" 
                    className="restore-file-input" 
                    onChange={handleRestoreBackup}
                    disabled={restoring}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right: Branding Credits Widget */}
        <div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
              <ShieldAlert size={18} style={{ color: 'var(--primary)' }} />
              <h3 className="text-sm font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                Application Info
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Developer Name:</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Raj Gupta</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Developer Email:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>rajcseaiml1234@gmail.com</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Project Version:</span>
                <span style={{ color: 'var(--text-muted)' }}>v1.0.0 (Production)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Release Channel:</span>
                <span style={{ color: 'var(--text-muted)' }}>Vercel Cloud Free</span>
              </div>
            </div>

            <a 
              href="https://digitalheroesco.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hero-btn"
            >
              <span>Built for Digital Heroes</span>
              <ExternalLink size={12} />
            </a>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem', borderTop: '1px dashed var(--surface-border)', paddingTop: '0.75rem' }}>
              Developed by <strong>Raj Gupta</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
