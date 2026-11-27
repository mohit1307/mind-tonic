import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Loader from './Loader';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Verifying Administrator credentials..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.role === 'admin' || user.email === 'admin@mindtonic.ai';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#080B14] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0F1527] border border-rose-500/25 shadow-2xl text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.3)]">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Administrator Access Restricted
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This area is strictly restricted to platform administrators. Your current account (<span className="text-slate-200 font-medium">{user.email}</span>) does not possess administrator privileges.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/app/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(139,92,246,0.35)]"
            >
              <KeyRound className="w-4 h-4" /> Log In as Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
