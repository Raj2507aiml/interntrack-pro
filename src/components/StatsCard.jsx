import React from 'react';

const StatsCard = ({ title, value, icon, description, accentColor = 'var(--primary)' }) => {
  return (
    <>
      <style>{`
        .stats-card {
          position: relative;
          overflow: hidden;
        }
        .stats-card-border-line {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 4px;
        }
        .stats-card-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .stats-card-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
          margin-top: 0.25rem;
        }
        .stats-card-icon-container {
          padding: 0.75rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <div className="card card-hover stats-card">
        <div className="stats-card-border-line" style={{ backgroundColor: accentColor }} />
        
        <div className="stats-card-content">
          <div>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {title}
            </div>
            <div className="stats-card-value">
              {value}
            </div>
            {description && (
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                {description}
              </div>
            )}
          </div>
          
          <div 
            className="stats-card-icon-container" 
            style={{ 
              backgroundColor: `${accentColor}15`, // Add opacity
              color: accentColor 
            }}
          >
            {icon}
          </div>
        </div>
      </div>
    </>
  );
};

export default StatsCard;
