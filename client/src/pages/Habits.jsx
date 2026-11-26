import { Target, Plus } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';

export default function Habits() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Habit Tracker</h2>
          <p className="text-sm text-slate-400 mt-1">
            Build discipline with daily habit checklists, streaks, and completion analytics.
          </p>
        </div>
        <Button icon={Plus}>New Habit</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle icon={Target}>Habit Streaks</CardTitle>
        </CardHeader>
        <div className="py-12 text-center text-slate-400 text-sm">
          Phase 5 will activate daily completion logs, streak tracking, and habit analytics.
        </div>
      </Card>
    </div>
  );
}
