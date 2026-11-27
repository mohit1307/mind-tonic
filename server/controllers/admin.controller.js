const apiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { supabaseDb } = require('../db/supabaseDb');

// In-memory mock/store for admin activity and platform settings
let systemSettings = {
  maintenanceMode: false,
  registrationOpen: true,
  aiAssistantEnabled: true,
  maxDailyTasksPerUser: 50,
  backupSchedule: 'Daily at 02:00 AM',
  allowedDomains: ['*'],
};

let customUsers = [
  {
    id: 'u-1',
    name: 'Rohan Kumar',
    email: 'rohan.kumar@college.edu',
    initials: 'RK',
    role: 'student',
    status: 'active',
    joinedAt: '2 min ago',
    tasksCount: 14,
    color: 'bg-blue-600',
  },
  {
    id: 'u-2',
    name: 'Sneha Patel',
    email: 'sneha.patel@tech.ac.in',
    initials: 'SP',
    role: 'student',
    status: 'active',
    joinedAt: '5 min ago',
    tasksCount: 22,
    color: 'bg-purple-600',
  },
  {
    id: 'u-3',
    name: 'Aman Kapoor',
    email: 'aman.kapoor@univ.edu',
    initials: 'AK',
    role: 'student',
    status: 'active',
    joinedAt: '8 min ago',
    tasksCount: 9,
    color: 'bg-slate-700',
  },
  {
    id: 'u-4',
    name: 'Priya Sharma',
    email: 'priya.sharma@iit.ac.in',
    initials: 'PS',
    role: 'student',
    status: 'active',
    joinedAt: '15 min ago',
    tasksCount: 31,
    color: 'bg-emerald-600',
  },
  {
    id: 'u-5',
    name: 'Mohit Jindal',
    email: 'mohit@mindtonic.ai',
    initials: 'MJ',
    role: 'student',
    status: 'active',
    joinedAt: '1 hour ago',
    tasksCount: 12,
    color: 'bg-indigo-600',
  },
];

let activityLogs = [
  {
    id: 'log-1',
    iconType: 'user',
    color: 'emerald',
    title: 'New user registered',
    description: 'Rohan Kumar joined via Supabase Auth',
    time: '2 min ago',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-2',
    iconType: 'calendar',
    color: 'purple',
    title: 'Schedule created',
    description: 'Conflict-free routine generated for Sneha Patel',
    time: '5 min ago',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-3',
    iconType: 'expense',
    color: 'amber',
    title: 'Expense added',
    description: '₹4,500 semester lab receipt processed with OCR',
    time: '8 min ago',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-4',
    iconType: 'ai',
    color: 'blue',
    title: 'AI Assistant timetable adapted',
    description: 'Dynamic schedule shifted gym around DSA study block',
    time: '14 min ago',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-5',
    iconType: 'system',
    color: 'emerald',
    title: 'PostgreSQL backup snapshot verified',
    description: '14 Supabase tables synchronized without latency',
    time: '35 min ago',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
];

class AdminController {
  /**
   * Get unified Admin Dashboard overview metrics matching reference design
   */
  async getOverview(_req, res, next) {
    try {
      return apiResponse.success(
        res,
        {
          metrics: {
            totalUsers: {
              value: '2.5K',
              raw: 2542,
              change: '+12%',
              trend: 'up',
            },
            totalTasks: {
              value: '18.7K',
              raw: 18720,
              change: '+8%',
              trend: 'up',
            },
            activeSchedules: {
              value: '1.2K',
              raw: 1230,
              change: '+10%',
              trend: 'up',
            },
            systemUptime: {
              value: '95%',
              raw: 95,
              change: '+10%',
              trend: 'up',
            },
          },
          userGrowth: [
            { date: 'Nov 23', users: 1100, label: '1.1K' },
            { date: 'Nov 24', users: 1650, label: '1.6K' },
            { date: 'Nov 25', users: 2050, label: '2.0K' },
            { date: 'Nov 26', users: 2200, label: '2.2K' },
            { date: 'Nov 27', users: 2450, label: '2.4K' },
            { date: 'Nov 28', users: 2700, label: '2.7K' },
            { date: 'Nov 29', users: 2980, label: '3.0K', isPeak: true },
          ],
          topFeatures: {
            timetable: 72,
            tasks: 18,
            habits: 10,
          },
          recentUsers: customUsers.slice(0, 3),
          activityLogs: activityLogs.slice(0, 3),
          systemStatus: {
            online: true,
            database: 'Supabase PostgreSQL',
            responseTime: '42ms',
            lastChecked: new Date().toISOString(),
          },
        },
        'Admin dashboard overview retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all registered users with filtering and status
   */
  async getUsers(req, res, next) {
    try {
      const { search, status, role } = req.query;
      let users = [...customUsers];

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        users = users.filter(
          (u) =>
            u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        );
      }

      if (status && status !== 'all') {
        users = users.filter((u) => u.status === status);
      }

      if (role && role !== 'all') {
        users = users.filter((u) => u.role === role);
      }

      return apiResponse.success(
        res,
        {
          users,
          total: users.length,
        },
        'Users list retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle or update user status (active / suspended)
   */
  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const user = customUsers.find((u) => u.id === id);
      if (!user) {
        throw ApiError.notFound('User not found');
      }

      user.status = status || (user.status === 'active' ? 'suspended' : 'active');

      // Log the admin action
      activityLogs.unshift({
        id: `log-${Date.now()}`,
        iconType: 'system',
        color: 'amber',
        title: `User ${user.name} status updated`,
        description: `Account was marked as ${user.status} by Administrator`,
        time: 'Just now',
        timestamp: new Date().toISOString(),
      });

      return apiResponse.success(
        res,
        { user },
        `User status updated to ${user.status}`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get real-time system audit logs
   */
  async getLogs(_req, res, next) {
    try {
      return apiResponse.success(
        res,
        { logs: activityLogs, total: activityLogs.length },
        'Activity logs retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get platform website management settings
   */
  async getSettings(_req, res, next) {
    try {
      return apiResponse.success(
        res,
        { settings: systemSettings },
        'System settings retrieved'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update platform website settings
   */
  async updateSettings(req, res, next) {
    try {
      systemSettings = {
        ...systemSettings,
        ...req.body,
      };

      activityLogs.unshift({
        id: `log-${Date.now()}`,
        iconType: 'system',
        color: 'purple',
        title: 'Platform configuration updated',
        description: 'Administrator changed website system settings',
        time: 'Just now',
        timestamp: new Date().toISOString(),
      });

      return apiResponse.success(
        res,
        { settings: systemSettings },
        'System settings updated successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
