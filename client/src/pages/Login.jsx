import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Brain, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/app/dashboard';

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setFormData({
      email: 'demo@mindtonic.ai',
      password: 'demopassword123',
    });
    setLoading(true);
    setError('');

    try {
      await login({
        email: 'demo@mindtonic.ai',
        password: 'demopassword123',
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setFormData({
      email: 'admin@mindtonic.ai',
      password: 'adminpassword123',
    });
    setLoading(true);
    setError('');

    try {
      await login({
        email: 'admin@mindtonic.ai',
        password: 'adminpassword123',
      });
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header / Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-500 to-secondary-500 flex items-center justify-center shadow-glow-sm">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">
            Mind <span className="gradient-text">Tonic</span>
          </span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold text-slate-100">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to access your intelligent schedule and tasks
        </p>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="glass-card p-8 sm:p-10 shadow-2xl border border-white/10">
          {/* 1-Click Demo & Admin Access Buttons */}
          <div className="mb-6 p-3 rounded-2xl bg-[#141B33] border border-purple-500/30 text-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Student Demo
              </span>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition-all flex items-center gap-1 shadow-sm"
              >
                Enter Student App
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
              <span className="text-purple-300 font-medium flex items-center gap-1.5">
                <span className="text-sm">🛡️</span>
                Admin Panel Demo
              </span>
              <button
                type="button"
                onClick={handleAdminLogin}
                disabled={loading}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-[11px] transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(147,51,234,0.3)]"
              >
                Enter Admin Panel
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="••••••••"
                  icon={Lock}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full mt-2"
              iconRight={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Login Button */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 border border-accent-500/30 text-accent-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Demo Login (demo@mindtonic.ai)
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent-400 hover:text-accent-300 font-medium">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
