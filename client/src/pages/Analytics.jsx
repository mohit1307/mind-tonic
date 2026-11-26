import { BarChart3 } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/common/Card';

export default function Analytics() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Productivity Analytics</h2>
        <p className="text-sm text-slate-400 mt-1">
          Deep weekly and monthly insights into your study hours, task completion, and habits.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle icon={BarChart3}>Weekly Productivity Trends</CardTitle>
        </CardHeader>
        <div className="py-12 text-center text-slate-400 text-sm">
          Phase 10 will activate comprehensive Recharts visualizations and AI daily summaries.
        </div>
      </Card>
    </div>
  );
}
