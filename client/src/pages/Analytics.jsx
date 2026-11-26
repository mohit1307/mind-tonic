import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, Sparkles, Brain } from 'lucide-react';
import analyticsService from '../services/analyticsService';
import ProductivityScoreCard from '../components/analytics/ProductivityScoreCard';
import FocusTrendChart from '../components/analytics/FocusTrendChart';
import TaskVelocityCard from '../components/analytics/TaskVelocityCard';
import HabitMatrixCard from '../components/analytics/HabitMatrixCard';
import AICoachCard from '../components/analytics/AICoachCard';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const res = await analyticsService.getOverview();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Productivity Analytics & Insights
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Dynamic holistic performance metrics measuring focus hours, deliverable velocity, and habit consistency.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={handleRefresh}
          loading={refreshing}
        >
          Refresh Insights
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center">
          <Loader size="lg" />
          <p className="text-sm text-slate-400 mt-3 animate-pulse-soft">
            Aggregating performance insights across your routine, study timer, and tasks...
          </p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <ProductivityScoreCard
            score={data.productivityScore}
            grade={data.scoreGrade}
            taskMetrics={data.taskMetrics}
            avgStreak={data.avgStreak}
            focusHours={data.total7DayFocusHours}
          />

          {/* AI Coach Daily Briefing */}
          <AICoachCard summary={data.aiSummary} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FocusTrendChart
              data={data.focusTrend7Days}
              totalHours={data.total7DayFocusHours}
            />

            <div className="space-y-6">
              <TaskVelocityCard metrics={data.taskMetrics} />
              <HabitMatrixCard habits={data.habitStats} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
