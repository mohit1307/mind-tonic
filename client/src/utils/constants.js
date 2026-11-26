// Design tokens and app-wide constants

export const APP_NAME = 'Mind Tonic';
export const APP_TAGLINE = 'Your AI-Powered Productivity Companion';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Navigation items for the sidebar
export const NAV_ITEMS = [
  { name: 'Dashboard', path: '/app/dashboard', icon: 'LayoutDashboard' },
  { name: 'My Routine', path: '/app/routine', icon: 'Calendar' },
  { name: 'Tasks', path: '/app/tasks', icon: 'CheckSquare' },
  { name: 'Habits', path: '/app/habits', icon: 'Target' },
  { name: 'AI Assistant', path: '/app/assistant', icon: 'Bot' },
  { name: 'Learning', path: '/app/learning', icon: 'GraduationCap' },
  { name: 'Documents', path: '/app/documents', icon: 'FileText' },
  { name: 'Expenses', path: '/app/expenses', icon: 'Wallet' },
  { name: 'Analytics', path: '/app/analytics', icon: 'BarChart3' },
  { name: 'Settings', path: '/app/settings', icon: 'Settings' },
];

// Task priorities
export const PRIORITIES = {
  critical: { label: 'Critical', color: 'danger', value: 4 },
  high: { label: 'High', color: 'warning', value: 3 },
  medium: { label: 'Medium', color: 'secondary', value: 2 },
  low: { label: 'Low', color: 'success', value: 1 },
};

// Task categories
export const CATEGORIES = [
  { value: 'work', label: 'Work', color: '#3b82f6' },
  { value: 'study', label: 'Study', color: '#8b5cf6' },
  { value: 'personal', label: 'Personal', color: '#22c55e' },
  { value: 'health', label: 'Health', color: '#f59e0b' },
  { value: 'other', label: 'Other', color: '#64748b' },
];

// Expense categories
export const EXPENSE_CATEGORIES = [
  'education', 'food', 'transport', 'health', 'utilities', 'entertainment', 'other'
];

// Chart colors
export const CHART_COLORS = [
  '#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#a855f7',
];
