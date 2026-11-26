import { useState } from 'react';
import { Brain, User, Sparkles, Volume2, VolumeX } from 'lucide-react';
import ActionCard from './ActionCard';

export default function ChatBubble({ message, onConfirmAction, onRejectAction }) {
  const isUser = message.role === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

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

        {/* Footer: Timestamp and TTS Speaker Button */}
        <div
          className={`flex items-center justify-between text-2xs mt-2 pt-1 border-t ${
            isUser
              ? 'border-white/10 text-accent-200'
              : 'border-white/5 text-slate-500'
          }`}
        >
          <span>
            {message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''}
          </span>

          {!isUser && (
            <button
              onClick={handleSpeak}
              className={`p-1 rounded-lg transition-colors flex items-center gap-1 ${
                isSpeaking
                  ? 'text-accent-400 bg-accent-500/20'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
              title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{isSpeaking ? 'Stop' : 'Listen'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
