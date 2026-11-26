import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import Card from '../common/Card';

export default function FocusTrendChart({ data = [], totalHours = 0 }) {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight">
            Daily Focus Study Velocity
          </h4>
          <p className="text-2xs text-slate-400 mt-0.5">
            Hours dedicated to deep focus study sessions over the past 7 days
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
          {totalHours} hrs total
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="h" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(val, _name, item) => [
                `${val} hours (${item.payload.focusMinutes} mins, ${item.payload.sessionsCount} session(s))`,
                'Focus Time',
              ]}
            />
            <Area
              type="monotone"
              dataKey="focusHours"
              stroke="#06b6d4"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#focusGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
