import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import Card from '../common/Card';

export default function LearningAnalyticsChart({ stats }) {
  if (!stats || !stats.subjectBreakdown || stats.subjectBreakdown.length === 0) {
    return (
      <Card className="p-6 text-center text-slate-500 text-xs">
        No study sessions logged yet. Use the Focus Study Timer to begin accumulating hours.
      </Card>
    );
  }

  const data = stats.subjectBreakdown.map((s) => ({
    name: s.name.length > 15 ? s.name.slice(0, 15) + '...' : s.name,
    hours: s.hours,
    color: s.color || '#6366f1',
  }));

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white tracking-tight">
          Hours Studied per Subject
        </h4>
        <span className="text-2xs text-slate-400 font-medium">
          Total: {stats.totalStudyHours} hours
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="h" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value) => [`${value} hours`, 'Study Time']}
            />
            <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
