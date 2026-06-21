import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} style={{ color: 'var(--success)' }} />;
      case 'error':
        return <AlertCircle size={18} style={{ color: 'var(--danger)' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />;
      case 'info':
      default:
        return <Info size={18} style={{ color: 'var(--info)' }} />;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .toast-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          animation-name: toastProgress;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
      
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : ''}`}
            role="alert"
          >
            <div className="toast-icon" style={{ display: 'flex', marginTop: '2px' }}>
              {getIcon(toast.type)}
            </div>
            
            <div className="toast-message" style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>
              {toast.message}
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                color: 'var(--text-muted)',
                hover: { color: 'var(--text-primary)' }
              }}
            >
              <X size={16} />
            </button>
            
            <div
              className="toast-progress-bar"
              style={{
                animationDuration: `${toast.duration}ms`,
                backgroundColor: `var(--${toast.type === 'success' ? 'success' : toast.type === 'error' ? 'danger' : toast.type === 'warning' ? 'warning' : 'info'})`
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default ToastContainer;
