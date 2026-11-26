import { CheckSquare, Plus } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';

export default function Tasks() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Task Management</h2>
          <p className="text-sm text-slate-400 mt-1">
            Organize tasks by priority, deadlines, duration, and recurring patterns.
          </p>
        </div>
        <Button icon={Plus}>Create Task</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle icon={CheckSquare}>All Tasks</CardTitle>
        </CardHeader>
        <div className="py-12 text-center text-slate-400 text-sm">
          Phase 3 will activate full task CRUD, priority filters, and recurring task automation.
        </div>
      </Card>
    </div>
  );
}
