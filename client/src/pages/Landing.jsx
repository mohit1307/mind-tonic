import { Link } from 'react-router-dom';
import {
  Brain,
  Calendar,
  CheckCircle2,
  Bot,
  BarChart3,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Layers,
} from 'lucide-react';
import Button from '../components/common/Button';

const features = [
  {
    icon: Calendar,
    title: 'Smart Timetable',
    description:
      'AI generates your optimal daily schedule by understanding your commitments, priorities, and preferences.',
    color: 'text-secondary-400',
    bg: 'bg-secondary-500/10',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description:
      'Natural-language commands to manage your day. Just say "Move my gym to 6 PM" and it\'s done.',
    color: 'text-accent-400',
    bg: 'bg-accent-500/10',
  },
  {
    icon: Clock,
    title: 'Missed Task Recovery',
    description:
      'Missed something? The system finds the next available slot and suggests rescheduling automatically.',
    color: 'text-warning-400',
    bg: 'bg-warning-500/10',
  },
  {
    icon: Target,
    title: 'Habit Tracker',
    description:
      'Build lasting habits with streak tracking, completion rates, and visual progress charts.',
    color: 'text-success-400',
    bg: 'bg-success-500/10',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description:
      'Understand your productivity patterns with detailed weekly and monthly insights.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Layers,
    title: 'All-in-One Platform',
    description:
      'Tasks, habits, study sessions, documents, expenses — everything managed in one place.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
];

const steps = [
  {
    step: '01',
    title: 'Tell us your day',
    description: 'Add your fixed commitments, flexible tasks, and goals — or just describe them naturally.',
  },
  {
    step: '02',
    title: 'AI generates your schedule',
    description: 'Our scheduling engine creates an optimized timetable respecting your priorities and deadlines.',
  },
  {
    step: '03',
    title: 'Stay on track',
    description: 'Get smart reminders, track habits, and let the AI adapt your schedule when plans change.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-primary-950">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-950/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-secondary-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Mind <span className="gradient-text">Tonic</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">
                How It Works
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" icon={Sparkles}>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-secondary-500/15 rounded-full blur-[128px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-sm font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Productivity Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Your Day,{' '}
            <span className="gradient-text">Intelligently</span>
            <br />
            Organized
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Mind Tonic understands your schedule, generates optimal timetables,
            tracks your habits, and adapts when plans change — all powered by AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="xl" icon={Sparkles} iconRight={ArrowRight}>
                Start for Free
              </Button>
            </Link>
            <a href="#features">
              <Button variant="secondary" size="xl">
                See Features
              </Button>
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Secure & Private
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI-Powered
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Free to Use
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Stay Productive</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              A comprehensive suite of tools designed to understand your workflow
              and help you accomplish more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card p-6 hover:border-accent-500/20 hover:shadow-glow-sm transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works Section ─── */}
      <section id="how-it-works" className="py-24 px-4 bg-primary-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Get started in minutes. Let AI handle the complexity of scheduling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, index) => (
              <div key={item.step} className="relative text-center">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-accent-500/30 to-transparent" />
                )}

                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-500/20 to-secondary-500/20 border border-accent-500/20 mb-6">
                  <span className="text-2xl font-bold gradient-text">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent-500/20 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Productivity?
              </h2>
              <p className="text-slate-400 max-w-lg mx-auto mb-8">
                Join Mind Tonic and let AI organize your day, track your progress,
                and help you achieve your goals.
              </p>
              <Link to="/register">
                <Button size="xl" icon={Sparkles} iconRight={ArrowRight}>
                  Get Started — It's Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-500 to-secondary-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-300">Mind Tonic</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Mind Tonic. Built with purpose.
          </p>
        </div>
      </footer>
    </div>
  );
}
