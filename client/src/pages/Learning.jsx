import { GraduationCap, Plus } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';

export default function Learning() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Learning & Study Management</h2>
          <p className="text-sm text-slate-400 mt-1">
            Subject tracking, active recall sessions, and SM-2 spaced repetition schedules.
          </p>
        </div>
        <Button icon={Plus}>Add Subject</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle icon={GraduationCap}>Subjects & Topics</CardTitle>
        </CardHeader>
        <div className="py-12 text-center text-slate-400 text-sm">
          Phase 8 will activate spaced repetition, study session timers, and weak topic identification.
        </div>
      </Card>
    </div>
  );
}
