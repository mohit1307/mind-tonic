import { Sparkles, Brain, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';

export default function AICoachCard({ summary }) {
  if (!summary) return null;

  return (
    <Card className="p-5 bg-gradient-to-r from-accent-950/40 via-surface to-primary-950/60 border border-accent-500/30 shadow-lg relative overflow-hidden">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-accent-500/20 border border-accent-500/40 flex items-center justify-center text-accent-400 flex-shrink-0 shadow-glow-sm">
          <Brain className="w-5 h-5" />
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-400" />
              AI Daily Performance Briefing
            </span>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-300">
              Updated Live
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
            {summary}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <Link
              to="/app/assistant"
              className="text-2xs font-bold text-accent-400 hover:text-accent-300 flex items-center gap-1 transition-colors"
            >
              Discuss with AI Assistant <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
