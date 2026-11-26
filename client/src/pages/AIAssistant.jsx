import { Bot, Sparkles } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/common/Card';

export default function AIAssistant() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent-400" />
          AI Personal Assistant
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Chat naturally to organize your routine, reschedule missed tasks, or analyze your habits.
        </p>
      </div>

      <Card className="h-[550px] flex flex-col justify-between">
        <CardHeader>
          <CardTitle icon={Bot}>Assistant Conversation</CardTitle>
        </CardHeader>
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm text-center px-4">
          Phase 6 will activate real-time LLM chat with structured action confirmation cards.
        </div>
      </Card>
    </div>
  );
}
