/**
 * Time utility functions for schedule management.
 */

/**
 * Parse "HH:MM" string to minutes since midnight.
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to "HH:MM" string.
 */
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Get duration in minutes between two "HH:MM" strings.
 */
function getDuration(startTime, endTime) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return end >= start ? end - start : (1440 - start) + end;
}

/**
 * Check if two time ranges overlap.
 * Times are "HH:MM" strings.
 */
function doTimesOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

/**
 * Normalize a date to midnight UTC (date-only comparison).
 */
function normalizeDate(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Get today's date normalized to midnight.
 */
function getToday() {
  return normalizeDate(new Date());
}

/**
 * Format a date as YYYY-MM-DD.
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Check if a date is in the past.
 */
function isPast(date) {
  return new Date(date) < new Date();
}

/**
 * Check if a date is today.
 */
function isToday(date) {
  const today = new Date();
  const d = new Date(date);
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

module.exports = {
  timeToMinutes,
  minutesToTime,
  getDuration,
  doTimesOverlap,
  normalizeDate,
  getToday,
  formatDate,
  isPast,
  isToday,
};
