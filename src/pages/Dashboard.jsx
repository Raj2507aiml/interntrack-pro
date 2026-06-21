import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import { formatDisplayDate } from '../utils/dateHelpers';
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  XCircle, 
  Percent, 
  Plus, 
  ChevronRight,
  ExternalLink,
  Shield,
  Activity
} from 'lucide-react';

const Dashboard = ({ onOpenAddModal }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read real-time applications from Firestore
  useEffect(() => {
    if (!currentUser) return;

    // Simple query on userId to avoid needing manual Firestore composite indexes
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
          // Handle cases where timestamp might be null briefly on local cache write
          createdAtDate: data.createdAt?.toDate() || new Date()
        });
      });

      // Sort client-side by date (newest application first) or createdAt date
      apps.sort((a, b) => b.createdAtDate - a.createdAtDate);
      
      setApplications(apps);
      setLoading(false);
    }, (error) => {
      console.error("Firestore loading error:", error);
      showToast("Failed to load application data: " + error.message, "error");
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, showToast]);

  // Calculations for Analytics
  const totalApps = applications.length;
  const interviewCount = applications.filter(app => app.status === 'Interview').length;
  const offerCount = applications.filter(app => app.status === 'Offer').length;
  const rejectionCount = applications.filter(app => app.status === 'Rejected').length;
  
  // Success Rate = Offers / Total Applications (or Offers + Rejections, but standard is Offers / Total)
  const successRate = totalApps > 0 ? Math.round((offerCount / totalApps) * 100) : 0;
  
  // Recent activity (last 5 items)
  const recentApplications = applications.slice(0, 5);

  return (
    <>
      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .dashboard-sections {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }
        .activity-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-bottom: 1px solid var(--surface-border);
          transition: background-color var(--transition-fast);
        }
        .activity-item:last-child {
          border-bottom: none;
        }
        .activity-item:hover {
          background-color: var(--surface-hover);
        }
        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .profile-row {
          display: flex;
          justify-content: space-between;
          padding: 0.625rem 0;
          border-bottom: 1px dashed var(--surface-border);
          font-size: 0.875rem;
        }
        .profile-row:last-child {
          border-bottom: none;
        }
        .dashboard-welcome {
          margin-bottom: 1.75rem;
        }
        @media (max-width: 992px) {
          .dashboard-sections {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="animate-fade-in">
        {/* Welcome Section */}
        <div className="dashboard-welcome" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Hello, {currentUser?.displayName || 'Developer'}! 👋
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Here is your internship search progress overview.
            </p>
          </div>
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={16} />
            <span>Track Application</span>
          </button>
        </div>

        {/* Analytics Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="dashboard-grid">
              <StatsCard 
                title="Total Applications" 
                value={totalApps} 
                icon={<Briefcase size={20} />} 
                accentColor="var(--info)"
                description="Total jobs submitted"
              />
              <StatsCard 
                title="Interviews" 
                value={interviewCount} 
                icon={<Users size={20} />} 
                accentColor="var(--primary)"
                description="Under review meetings"
              />
              <StatsCard 
                title="Offers Received" 
                value={offerCount} 
                icon={<CheckCircle size={20} />} 
                accentColor="var(--success)"
                description="Congratulations!"
              />
              <StatsCard 
                title="Rejections" 
                value={rejectionCount} 
                icon={<XCircle size={20} />} 
                accentColor="var(--danger)"
                description="Stepping stones"
              />
              <StatsCard 
                title="Success Rate" 
                value={`${successRate}%`} 
                icon={<Percent size={20} />} 
                accentColor="var(--warning)"
                description="Offers vs Total Ratio"
              />
            </div>

            {/* Split Sections */}
            <div className="dashboard-sections">
              
              {/* Left Column: Recent Activity */}
              <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={18} style={{ color: 'var(--primary)' }} />
                    <h3 className="text-base font-bold">Recent Applications</h3>
                  </div>
                  {totalApps > 5 && (
                    <Link to="/tracker" style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>View All</span>
                      <ChevronRight size={14} />
                    </Link>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  {recentApplications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-secondary)' }}>
                      <p className="font-semibold text-base">No applications tracked yet</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Click "Track Application" at the top to add your first job!
                      </p>
                    </div>
                  ) : (
                    recentApplications.map((app) => (
                      <div key={app.id} className="activity-item">
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                            {app.role}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              {app.company}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              {formatDisplayDate(app.date)}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <StatusBadge status={app.status} />
                          <Link 
                            to="/tracker" 
                            className="icon-btn" 
                            style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)' }}
                            title="View application details"
                          >
                            <ChevronRight size={16} />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Dev Info & Digital Heroes Widgets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Digital Heroes Credit widget */}
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--surface) 0%, var(--background) 100%)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
                    <Shield size={18} style={{ color: 'var(--primary)' }} />
                    <h3 className="text-sm font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                      Developer Portfolio
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', marginBottom: '1.25rem' }}>
                    <div className="profile-row">
                      <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Full Name:</span>
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Raj Gupta</span>
                    </div>
                    
                    <div className="profile-row">
                      <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Email:</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>rajcseaiml1234@gmail.com</span>
                    </div>

                    <div className="profile-row">
                      <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Role:</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Intern Candidate</span>
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
                </div>

                {/* Quick Stats Summary */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h4 className="text-xs font-bold" style={{ textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Quick Tips
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    💡 <strong>Smart URL Autofill:</strong> Copy and paste a job board link from LinkedIn or Greenhouse. The application will pull the company name and role title automatically!
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    📥 <strong>Portability:</strong> Go to settings to export your records as a CSV or JSON file anytime.
                  </p>
                </div>

              </div>

            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
