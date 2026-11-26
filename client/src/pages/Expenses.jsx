import { Wallet, Plus } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';

export default function Expenses() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Expense Tracker</h2>
          <p className="text-sm text-slate-400 mt-1">
            Track educational fees, receipts, outstanding dues, and monthly spending.
          </p>
        </div>
        <Button icon={Plus}>Add Expense</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle icon={Wallet}>Expense Analytics</CardTitle>
        </CardHeader>
        <div className="py-12 text-center text-slate-400 text-sm">
          Phase 9 will activate expense logging, category breakdowns, and fee reminders.
        </div>
      </Card>
    </div>
  );
}
