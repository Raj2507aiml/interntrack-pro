import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { parseJobUrl } from '../utils/urlParser';
import { getTodayString } from '../utils/dateHelpers';
import { X, Sparkles, AlertCircle } from 'lucide-react';

const ApplicationModal = ({ isOpen, onClose, onSave, application = null }) => {
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    date: getTodayString(),
    url: '',
    status: 'Applied',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [autofillMessage, setAutofillMessage] = useState(null);

  const isEditMode = !!application;

  // Initialize form data when editing
  useEffect(() => {
    if (isOpen) {
      if (application) {
        setFormData({
          company: application.company || '',
          role: application.role || '',
          date: application.date || getTodayString(),
          url: application.url || '',
          status: application.status || 'Applied',
          notes: application.notes || ''
        });
      } else {
        setFormData({
          company: '',
          role: '',
          date: getTodayString(),
          url: '',
          status: 'Applied',
          notes: ''
        });
      }
      setErrors({});
      setAutofillMessage(null);
    }
  }, [isOpen, application]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // URL Auto-Fill handler
  const handleAutoFill = () => {
    const url = formData.url.trim();
    if (!url) {
      setErrors(prev => ({ ...prev, url: 'Please enter a URL first' }));
      return;
    }

    try {
      const parsed = parseJobUrl(url);
      
      const newFields = {};
      let matchesFound = [];

      if (parsed.company) {
        newFields.company = parsed.company;
        matchesFound.push('Company');
      }
      if (parsed.role) {
        newFields.role = parsed.role;
        matchesFound.push('Role Title');
      }

      if (matchesFound.length > 0) {
        setFormData(prev => ({ ...prev, ...newFields }));
        setAutofillMessage({
          type: 'success',
          text: `Auto-filled: ${matchesFound.join(' & ')} from ${parsed.source || 'URL'}!`
        });
        showToast(`Extracted ${matchesFound.join(', ')} successfully!`, 'success');
      } else {
        setAutofillMessage({
          type: 'warning',
          text: `Detected ${parsed.source || 'domain'}, but couldn't parse the specific role title. Please input details manually.`
        });
        if (parsed.company) {
          setFormData(prev => ({ ...prev, company: parsed.company }));
        }
        showToast('Partial extraction. Please review fields.', 'warning');
      }
    } catch (err) {
      setAutofillMessage({
        type: 'error',
        text: 'Failed to extract data from URL. Please enter manually.'
      });
      showToast('URL parsing failed', 'error');
    }
  };

  // Run autofill automatically if user pastes a URL
  const handleUrlBlur = () => {
    const url = formData.url.trim();
    // Only autofill on blur if company/role are currently empty
    if (url && (!formData.company || !formData.role)) {
      handleAutoFill();
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.company.trim()) tempErrors.company = 'Company Name is required';
    if (!formData.role.trim()) tempErrors.role = 'Role / Position is required';
    if (!formData.date) tempErrors.date = 'Application Date is required';
    
    if (formData.url) {
      try {
        let testUrl = formData.url;
        if (!/^https?:\/\//i.test(testUrl)) {
          testUrl = 'https://' + testUrl;
        }
        new URL(testUrl);
      } catch (_) {
        tempErrors.url = 'Please enter a valid URL';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Ensure url starts with http if it's entered
      let cleanUrl = formData.url.trim();
      if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = 'https://' + cleanUrl;
      }

      await onSave({
        ...formData,
        url: cleanUrl
      });
      onClose();
    } catch (error) {
      showToast('Failed to save application: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {isEditMode ? 'Edit Application' : 'Add Application'}
          </h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* Smart URL Field first for autofill */}
            <div className="form-group">
              <label className="form-label" htmlFor="modal-url">Job Posting / Application URL</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="modal-url"
                  name="url"
                  type="text"
                  className="form-input"
                  placeholder="e.g. https://careers.google.com/jobs/results/..."
                  value={formData.url}
                  onChange={handleChange}
                  onBlur={handleUrlBlur}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ display: 'flex', gap: '0.375rem', padding: '0.625rem 1rem' }}
                  onClick={handleAutoFill}
                  disabled={loading || !formData.url}
                  title="Auto-fill details from job URL"
                >
                  <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold">Auto-Fill</span>
                </button>
              </div>
              {errors.url && <span className="form-error">{errors.url}</span>}
            </div>

            {/* Smart auto-fill feedback banner */}
            {autofillMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: autofillMessage.type === 'success' ? 'var(--success-light)' : 'var(--warning-light)',
                color: autofillMessage.type === 'success' ? 'var(--success-hover)' : 'var(--warning-hover)',
                border: `1px solid ${autofillMessage.type === 'success' ? 'var(--success)' : 'var(--warning)'}20`
              }}>
                <AlertCircle size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
                <span>{autofillMessage.text}</span>
              </div>
            )}

            {/* Company Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="modal-company">Company Name *</label>
              <input
                id="modal-company"
                name="company"
                type="text"
                className="form-input"
                placeholder="e.g. Google"
                value={formData.company}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.company && <span className="form-error">{errors.company}</span>}
            </div>

            {/* Role / Position */}
            <div className="form-group">
              <label className="form-label" htmlFor="modal-role">Role / Position *</label>
              <input
                id="modal-role"
                name="role"
                type="text"
                className="form-input"
                placeholder="e.g. Software Engineer Intern"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.role && <span className="form-error">{errors.role}</span>}
            </div>

            {/* Application Date & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="modal-date">Date Applied *</label>
                <input
                  id="modal-date"
                  name="date"
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.date && <span className="form-error">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-status">Status *</label>
                <select
                  id="modal-status"
                  name="status"
                  className="form-input"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Applied">Applied</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="modal-notes">Notes / Details</label>
              <textarea
                id="modal-notes"
                name="notes"
                className="form-input"
                placeholder="Interview logs, recruiters, preparation links..."
                value={formData.notes}
                onChange={handleChange}
                disabled={loading}
                rows={4}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditMode ? 'Update Application' : 'Add Application'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;
