/**
 * Format date string to "1 Jan 2025 14.50" format
 * @param dateStr - Date string in ISO format or any valid date format
 * @returns Formatted date string or original string if parsing fails
 */
export const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace(':', '.');
    return `${formattedDate} ${formattedTime}`;
  } catch {
    return dateStr;
  }
};
