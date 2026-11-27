import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  Trash2,
  RefreshCw,
  AlertCircle,
  Brain,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import aiService from '../services/aiService';
import ChatBubble from '../components/ai/ChatBubble';
import SuggestionChips from '../components/ai/SuggestionChips';
import Button from '../components/common/Button';

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join('');
        setInputValue(transcript);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setError(`Microphone error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setError('');
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    }
  };

  // Initialize with welcoming message
  useEffect(() => {
    const initialGreeting = {
      role: 'assistant',
      content: `Hello ${user?.name?.split(' ')[0] || 'there'}! I am your Mind Tonic AI Assistant.\n\nI can organize your timetable, create tasks with deadlines, reschedule sessions, and review your daily deliverables.\n\nTry speaking or typing: "Create my timetable for today" or "Add task: Study Java for 2 hours".`,
      timestamp: new Date().toISOString(),
      action: null,
    };
    setMessages([initialGreeting]);
  }, [user]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    setError('');
    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await aiService.sendMessage(text, conversationId);
      const incomingMsg = response?.message || response?.data?.message;
      const cId = response?.conversationId || response?.data?.conversationId;

      if (cId) {
        setConversationId(cId);
      }
      if (incomingMsg) {
        setMessages((prev) => [...prev, incomingMsg]);
      } else if (response?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: response.reply,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      setError(err.message || 'Failed to communicate with AI Assistant');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConfirmAction = async (actionId) => {
    try {
      const result = await aiService.confirmAction(actionId);
      // Dispatch global task and timetable sync
      window.dispatchEvent(
        new CustomEvent('mindtonic:task-sync', { detail: { action: 'ai-action' } })
      );

      // Update local message action status to executed
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.action && msg.action.actionId === actionId) {
            return {
              ...msg,
              action: {
                ...msg.action,
                status: 'executed',
                result: result.data || result,
              },
            };
          }
          return msg;
        })
      );
    } catch (err) {
      setError(err.message || 'Failed to confirm action');
    }
  };

  const handleRejectAction = async (actionId) => {
    try {
      await aiService.rejectAction(actionId);
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.action && msg.action.actionId === actionId) {
            return {
              ...msg,
              action: {
                ...msg.action,
                status: 'rejected',
              },
            };
          }
          return msg;
        })
      );
    } catch (err) {
      setError(err.message || 'Failed to cancel action');
    }
  };

  const handleClearChat = () => {
    setConversationId(null);
    setMessages([
      {
        role: 'assistant',
        content: `Chat cleared. What would you like to work on next, ${user?.name?.split(' ')[0] || 'friend'}?`,
        timestamp: new Date().toISOString(),
        action: null,
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-7rem)] flex flex-col glass-card border border-white/10 overflow-hidden shadow-2xl animate-fade-in">
      {/* Assistant Header */}
      <div className="px-5 py-3.5 border-b border-white/5 bg-primary-950/70 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-secondary-500 flex items-center justify-center text-white shadow-glow-sm">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Mind Tonic AI Assistant
              <span className="w-2 h-2 rounded-full bg-success-400" />
            </h3>
            <p className="text-2xs text-slate-400">Intelligent Routine & Task Coordinator</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs flex items-center gap-1 transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <ChatBubble
            key={msg._id || index}
            message={msg}
            onConfirmAction={handleConfirmAction}
            onRejectAction={handleRejectAction}
          />
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-accent-300 animate-pulse-soft pl-1">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>AI is understanding your schedule...</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer: Suggestion Chips & Input */}
      <div className="p-3 sm:p-4 bg-primary-950/80 border-t border-white/5 space-y-2.5 flex-shrink-0">
        <SuggestionChips onSelect={(text) => handleSendMessage(text)} />

        {/* Listening Wave Indicator */}
        {isListening && (
          <div className="p-2.5 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-danger-500 animate-ping" />
              <span className="font-semibold">Listening... Speak clearly into your microphone</span>
            </div>
            <button
              onClick={toggleListening}
              className="text-2xs font-bold underline hover:text-white"
            >
              Stop Recording
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Microphone Voice Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-danger-500 text-white border-danger-400 animate-pulse ring-2 ring-danger-500/50'
                : 'bg-primary-900/60 hover:bg-white/10 text-slate-400 hover:text-white border-white/10'
            }`}
            title={isListening ? 'Stop listening' : 'Speak your prompt (Voice Input)'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-accent-400" />}
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : "Type or speak: 'Add task: Study Java for 2 hours'..."
            }
            className="flex-1 bg-primary-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          />

          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || loading}
            loading={loading}
            icon={Send}
            size="md"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
