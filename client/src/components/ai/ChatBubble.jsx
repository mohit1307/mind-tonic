import { Brain, User, Sparkles } from 'lucide-react';
import ActionCard from './ActionCard';

export default function ChatBubble({ message, onConfirmAction, onRejectAction }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow-sm ${
          isUser
            ? 'bg-gradient-to-br from-secondary-500 to-accent-500 text-white'
            : 'bg-gradient-to-br from-accent-500 to-secondary-500 text-white'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
      </div>

      {/* Bubble Content */}
      <div
        className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-accent-600 text-white rounded-tr-none shadow-md'
            : 'glass-card border border-white/10 text-slate-200 rounded-tl-none shadow-md'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>

        {/* Action Card (if assistant message proposed a structured action) */}
        {!isUser && message.action && (
          <ActionCard
            action={message.action}
            onConfirm={onConfirmAction}
            onReject={onRejectAction}
          />
        )}

        {/* Timestamp */}
        <div
          className={`text-2xs mt-1.5 ${
            isUser ? 'text-accent-200 text-right' : 'text-slate-500 text-left'
          }`}
        >
          {message.timestamp
            ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''}
        </div>
      </div>
    </div>
  );
}
