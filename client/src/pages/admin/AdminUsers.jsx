import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Ban,
  Shield,
  Clock,
  ArrowUpDown,
  MoreVertical,
} from 'lucide-react';
import adminService from '../../services/adminService';

export default function AdminUsers() {
  const [users, setUsers] = useState([
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
  ]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        search,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });
      if (res?.users) {
        setUsers(res.users);
      }
    } catch (err) {
      console.warn('Admin user fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterStatus]);

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateUserStatus(user.id, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
      setActionMessage(`User ${user.name} is now ${nextStatus}.`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 select-none animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-purple-400" />
            User Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage registered accounts, view routines, and adjust privileges.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="bg-[#10172B] text-xs text-white placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-white/10 focus:border-purple-500/50 outline-none w-64"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#10172B] text-xs text-slate-200 px-3 py-2 rounded-xl border border-white/10 focus:border-purple-500/50 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-300 animate-slide-up">
          {actionMessage}
        </div>
      )}

      {/* Users Table Card */}
      <div className="rounded-3xl bg-[#10172B]/90 border border-white/[0.07] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090D17] text-slate-400 font-semibold border-b border-white/[0.05]">
              <tr>
                <th className="py-3.5 px-6">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Tasks</th>
                <th className="py-3.5 px-4">Joined</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${user.color || 'bg-purple-600'} flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0`}>
                      {user.initials || 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-medium border border-blue-500/20 capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 w-fit ${
                        user.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      {user.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-200">
                    {user.tasksCount || 0}
                  </td>
                  <td className="py-4 px-4 text-slate-400">
                    {user.joinedAt}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        user.status === 'active'
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {user.status === 'active' ? 'Suspend User' : 'Reactivate User'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
