import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import Card, { CardHeader, CardTitle } from '../common/Card';
import { TrendingUp } from 'lucide-react';

export default function HabitProgressChart({ chartData = [] }) {
  if (!chartData || chartData.length === 0) return null;

  return (
    <Card className="p-5">
      <CardHeader>
        <CardTitle icon={TrendingUp}>Weekly Habit Completion Trend</CardTitle>
        <span className="text-xs text-slate-400">Past 7 Days</span>
      </CardHeader>

      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="habitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass-card p-2.5 border border-white/10 rounded-xl shadow-xl text-xs space-y-0.5">
                      <p className="font-semibold text-slate-200">{data.date} ({data.day})</p>
                      <p className="text-accent-300 font-bold">
                        {data.completed} of {data.total} completed ({data.rate}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#habitGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
