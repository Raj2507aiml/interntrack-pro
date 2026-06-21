import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, company, role }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Delete Application</h3>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Are you sure you want to delete your application for <strong>{role}</strong> at <strong>{company}</strong>?
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            This action cannot be undone. All data associated with this application will be permanently removed.
          </p>
        </div>
        
        <div className="modal-footer" style={{ padding: '0.75rem 1.5rem', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger btn-sm" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
