/**
 * Date formatting helpers.
 */

/**
 * Formats a YYYY-MM-DD string to a readable format (e.g., Oct 24, 2023)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Readable date
 */
export const formatDisplayDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    // Use Date.UTC to prevent timezone offsets from shifting the display date
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 * @returns {string} YYYY-MM-DD
 */
export const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
