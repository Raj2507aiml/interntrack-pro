/**
 * Exporter utilities for CSV and JSON format downloads.
 */

// Helper to download files in browser
const downloadFile = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports applications to CSV format
 * @param {Array} applications - list of application objects
 */
export const exportToCSV = (applications) => {
  if (!applications || applications.length === 0) return;

  const headers = ['Company', 'Role/Position', 'Application Date', 'Status', 'Application URL', 'Notes'];
  
  // Clean values: escape double quotes, wrap in quotes
  const cleanValue = (val) => {
    if (val === null || val === undefined) return '""';
    let strVal = String(val);
    // Escape double quotes by doubling them
    strVal = strVal.replace(/"/g, '""');
    return `"${strVal}"`;
  };

  const rows = applications.map(app => [
    cleanValue(app.company),
    cleanValue(app.role),
    cleanValue(app.date),
    cleanValue(app.status),
    cleanValue(app.url || ''),
    cleanValue(app.notes || '')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `interntrack_applications_${dateStr}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Exports applications to JSON format for backup
 * @param {Array} applications - list of application objects
 */
export const exportToJSON = (applications) => {
  if (!applications || applications.length === 0) return;

  // Clean application object to remove system metadata before backup
  const cleanApps = applications.map(({ company, role, date, status, url, notes }) => ({
    company,
    role,
    date,
    status,
    url: url || '',
    notes: notes || ''
  }));

  const jsonContent = JSON.stringify(cleanApps, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(jsonContent, `interntrack_backup_${dateStr}.json`, 'application/json;charset=utf-8;');
};
