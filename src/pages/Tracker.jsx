import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import { formatDisplayDate } from '../utils/dateHelpers';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Plus, 
  FolderOpen,
  Eye,
  Calendar,
  X,
  FileText
} from 'lucide-react';

const Tracker = ({ onOpenAddModal, onOpenEditModal, onDeleteClick }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, company

  // View Details Modal State
  const [selectedApp, setSelectedApp] = useState(null);

  // Firestore Sync Listener
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'applications'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        apps.push({
          id: doc.id,
          ...data,
          createdAtDate: data.createdAt?.toDate() || new Date()
        });
      });
      setApplications(apps);
      setLoading(false);
    }, (error) => {
      console.error(error);
      showToast("Error synchronizing data: " + error.message, "error");
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, showToast]);

  // Handle Search, Filtering and Sorting client-side to prevent Firestore index errors
  const processedApplications = applications
    .filter(app => {
      const companyMatch = app.company.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = app.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = companyMatch || roleMatch;

      const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        // Sort by application date (YYYY-MM-DD) descending, secondary by createdAt
        return b.date.localeCompare(a.date) || b.createdAtDate - a.createdAtDate;
      }
      if (sortBy === 'oldest') {
        return a.date.localeCompare(b.date) || a.createdAtDate - b.createdAtDate;
      }
      if (sortBy === 'company') {
        return a.company.localeCompare(b.company);
      }
      return 0;
    });

  return (
    <>
      <style>{`
        .tracker-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .search-container {
          position: relative;
          flex: 1;
          min-width: 250px;
        }
        .search-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .toolbar-filters {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .filter-select {
          min-width: 140px;
          cursor: pointer;
        }
        
        /* Table styles */
        .table-card {
          overflow-x: auto;
          padding: 0;
        }
        .app-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .app-table th {
          background-color: var(--background);
          padding: 1rem 1.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--surface-border);
        }
        .app-table td {
          padding: 1.15rem 1.5rem;
          font-size: 0.875rem;
          border-bottom: 1px solid var(--surface-border);
          color: var(--text-primary);
        }
        .app-table tbody tr:last-child td {
          border-bottom: none;
        }
        .app-table tbody tr:hover td {
          background-color: var(--surface-hover);
        }

        .action-btns {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .action-btn {
          padding: 0.375rem;
          border-radius: var(--radius-sm);
          background: none;
          border: 1px solid var(--surface-border);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .action-btn:hover {
          background-color: var(--surface-hover);
          color: var(--text-primary);
        }
        .action-btn-danger:hover {
          background-color: var(--danger-light);
          color: var(--danger);
          border-color: var(--danger);
        }

        /* Mobile Card Grid styling */
        .mobile-card-grid {
          display: none;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        @media (max-width: 768px) {
          .table-card {
            display: none;
          }
          .mobile-card-grid {
            display: grid;
          }
          .tracker-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .search-container {
            width: 100%;
          }
          .toolbar-filters {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <div className="animate-fade-in">
        
        {/* Toolbar Controls */}
        <div className="tracker-toolbar">
          
          {/* Search bar */}
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by company or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Filters & Actions */}
          <div className="toolbar-filters">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', width: '100%' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-input filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={loading}
              >
                <option value="All">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Assessment">Assessment</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', width: '100%' }}>
              <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-input filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                disabled={loading}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="company">Company (A-Z)</option>
              </select>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ display: 'flex', gap: '0.375rem', height: '40px', gridColumn: 'span 2' }}
              onClick={onOpenAddModal}
            >
              <Plus size={16} />
              <span>Add</span>
            </button>
          </div>

        </div>

        {/* List Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <div className="spinner"></div>
          </div>
        ) : processedApplications.length === 0 ? (
          /* Empty State */
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center' }}>
            <FolderOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }} />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>No applications found</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '380px' }}>
              We couldn't find any records matching your search filters. Try clearing them or add a new job tracking entry!
            </p>
            <button 
              className="btn btn-primary btn-sm" 
              style={{ marginTop: '1.5rem' }}
              onClick={onOpenAddModal}
            >
              <Plus size={14} />
              <span>Track Application</span>
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="card table-card">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role / Position</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                    <th>Link</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processedApplications.map((app) => (
                    <tr key={app.id}>
                      <td className="font-bold">{app.company}</td>
                      <td>{app.role}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{formatDisplayDate(app.date)}</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td>
                        {app.url ? (
                          <a 
                            href={app.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', fontWeight: 600 }}
                          >
                            <span>Link</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>None</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="action-btn" 
                            title="View Details & Notes" 
                            onClick={() => setSelectedApp(app)}
                          >
                            <Eye size={14} />
                          </button>
                          
                          <button 
                            className="action-btn" 
                            title="Edit" 
                            onClick={() => onOpenEditModal(app)}
                          >
                            <Edit2 size={14} />
                          </button>
                          
                          <button 
                            className="action-btn action-btn-danger" 
                            title="Delete" 
                            onClick={() => onDeleteClick(app)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Grid View */}
            <div className="mobile-card-grid">
              {processedApplications.map((app) => (
                <div key={app.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{app.role}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>{app.company}</div>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', borderTop: '1px solid var(--surface-border)', borderBottom: '1px solid var(--surface-border)', padding: '0.625rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Date Applied:</span>
                      <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{formatDisplayDate(app.date)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Job URL:</span>
                      {app.url ? (
                        <a href={app.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                          <span>Visit Link</span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>None</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {app.notes ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <FileText size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>Has Notes</span>
                      </div>
                    ) : (
                      <div />
                    )}

                    <div className="action-btns">
                      <button 
                        className="action-btn" 
                        title="View Details"
                        onClick={() => setSelectedApp(app)}
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="action-btn" 
                        title="Edit"
                        onClick={() => onOpenEditModal(app)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="action-btn action-btn-danger" 
                        title="Delete"
                        onClick={() => onDeleteClick(app)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* View Details Modal */}
        {selectedApp && (
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
            <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Application Details
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                    View notes and information for this tracking record
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedApp(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Meta details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                      Company
                    </span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {selectedApp.company}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                      Role / Position
                    </span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {selectedApp.role}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                      Date Applied
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                      <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                      {formatDisplayDate(selectedApp.date)}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                      Current Status
                    </span>
                    <div style={{ marginTop: '0.25rem' }}>
                      <StatusBadge status={selectedApp.status} />
                    </div>
                  </div>
                </div>

                {/* Job Link */}
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.375rem' }}>
                    Job Listing Link
                  </span>
                  {selectedApp.url ? (
                    <a 
                      href={selectedApp.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', width: 'auto', gap: '0.375rem' }}
                    >
                      <span>Open Original Posting</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No URL link provided
                    </span>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.375rem' }}>
                    Notes & Action Items
                  </span>
                  <div style={{ 
                    whiteSpace: 'pre-wrap', 
                    fontSize: '0.875rem', 
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--background)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--surface-border)',
                    minHeight: '100px',
                    lineHeight: '1.6'
                  }}>
                    {selectedApp.notes || (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No notes or comments added for this application. Click Edit to add details like compensation, interview stages, or research logs.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedApp(null)}
                >
                  Close
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const appToEdit = selectedApp;
                    setSelectedApp(null);
                    onOpenEditModal(appToEdit);
                  }}
                >
                  Edit Application
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default Tracker;
