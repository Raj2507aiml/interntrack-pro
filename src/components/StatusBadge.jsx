import React from 'react';
import { Send, GraduationCap, Users, CheckCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'badge-applied';
      case 'assessment': return 'badge-assessment';
      case 'interview': return 'badge-interview';
      case 'offer': return 'badge-offer';
      case 'rejected': return 'badge-rejected';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    const size = 12;
    switch (status.toLowerCase()) {
      case 'applied': return <Send size={size} />;
      case 'assessment': return <GraduationCap size={size} />;
      case 'interview': return <Users size={size} />;
      case 'offer': return <CheckCircle size={size} />;
      case 'rejected': return <XCircle size={size} />;
      default: return null;
    }
  };

  return (
    <span className={`badge ${getStatusClass(status)}`}>
      {getStatusIcon(status)}
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
