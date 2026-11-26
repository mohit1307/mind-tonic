/**
 * Format utilities for display.
 */

/**
 * Format a date for display.
 */
export function formatDate(date, options = {}) {
  const d = new Date(date);
  const defaults = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-IN', { ...defaults, ...options });
}

/**
 * Format time from "HH:MM" or Date to readable format.
 */
export function formatTime(time) {
  if (typeof time === 'string' && time.includes(':')) {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  }
  return new Date(time).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get duration in minutes between two "HH:MM" strings.
 */
export function getDuration(startTime, endTime) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let dur = eh * 60 + em - (sh * 60 + sm);
  if (dur < 0) dur += 1440;
  return dur;
}

/**
 * Format duration in minutes to readable string.
 */
export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Format currency amount.
 */
export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get greeting based on time of day.
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days").
 */
export function getRelativeTime(date) {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target - now;
  const diffMins = Math.round(diffMs / 60000);
  const diffHrs = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (Math.abs(diffMins) < 1) return 'just now';
  if (Math.abs(diffMins) < 60) return diffMins > 0 ? `in ${diffMins}m` : `${Math.abs(diffMins)}m ago`;
  if (Math.abs(diffHrs) < 24) return diffHrs > 0 ? `in ${diffHrs}h` : `${Math.abs(diffHrs)}h ago`;
  if (Math.abs(diffDays) < 7) return diffDays > 0 ? `in ${diffDays}d` : `${Math.abs(diffDays)}d ago`;
  return formatDate(date);
}

/**
 * Calculate percentage.
 */
export function percentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}
