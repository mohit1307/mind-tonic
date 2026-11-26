import { Calendar, Plus } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';

export default function Routine() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">My Routine & Timetable</h2>
          <p className="text-sm text-slate-400 mt-1">
            Constraint-based smart timetable engine that respects your commitments and breaks.
          </p>
        </div>
        <Button icon={Plus}>Add Fixed Commitment</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle icon={Calendar}>Timetable Generator</CardTitle>
        </CardHeader>
        <div className="py-12 text-center text-slate-400 text-sm">
          Phase 4 will activate the complete interactive slot-filler timetable engine.
        </div>
      </Card>
    </div>
  );
}
