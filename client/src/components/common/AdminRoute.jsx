import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Loader from './Loader';

export default function AdminRoute({ children }) {
  const { user, loading, login } = useAuth();
  const [loggingIn, setLoggingIn] = useState(false);

  if (loading) {
    return <Loader fullScreen text="Verifying Administrator credentials..." />;
  }

  const isAdmin = user && (user.role === 'admin' || user.email === 'admin@mindtonic.ai');

  const handleQuickAdminLogin = async () => {
    setLoggingIn(true);
    try {
      await login({
        email: 'admin@mindtonic.ai',
        password: 'adminpassword123',
      });
    } catch (e) {
      console.error('Quick admin login error:', e);
    } finally {
      setLoggingIn(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#080B14] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0F1527] border border-purple-500/30 shadow-[0_0_50px_rgba(147,51,234,0.15)] text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/25 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(147,51,234,0.3)]">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Administrator Access Required
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This area is restricted to system administrators. Click below to authenticate as the platform administrator and manage the website and database.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={handleQuickAdminLogin}
              disabled={loggingIn}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(147,51,234,0.45)] disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              {loggingIn ? 'Authenticating Admin Session...' : 'Authenticate as Admin (1-Click)'}
            </button>

            <Link
              to="/app/dashboard"
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Student Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
