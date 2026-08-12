'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bot,
  X,
  Maximize2,
  SendHorizontal,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import api from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Citation = {
  articleId: string;
  title: string;
  slug: string;
  type: string;
};

type Message = {
  id: string;
  role: 'user' | 'bot';
  text: string;
  time: string;
  messageId?: number;
  citations?: Citation[];
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  responseTime?: number;
  feedback?: boolean | null;
};

export default function ChatWidget() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: 'Hello! I can help you with HMIS workflows, troubleshooting, and knowledge base articles.',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  async function sendMessage() {
    if (!input.trim() || isLoading) return;

    const question = input.trim();

    setInput('');

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: question,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);

    try {
      const res = await api.post('/chat', {
        question,
        sessionId,
      });

      if (!sessionId && res.data.sessionId) {
        setSessionId(res.data.sessionId);
      }

      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: res.data.answer,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        messageId: res.data.messageId,
        citations: res.data.citations || [],
        confidence: res.data.confidence,
        responseTime: res.data.responseTime,
        feedback: null,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'bot',
          text: 'Sorry, I could not connect to the HMIS assistant. Please try again.',
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function submitFeedback(messageId: number, helpful: boolean, messageKey: string) {
    try {
      const res = await api.patch(`/chat/${messageId}/feedback`, {
        helpful,
      });

      console.log('Feedback response:', res.data);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageKey
            ? {
                ...m,
                feedback: helpful,
              }
            : m,
        ),
      );
    } catch (error) {
      console.error('Feedback failed:', error);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      {open && (
        <div className="mb-2 w-[380px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-semibold">HMIS AI Assistant</h3>

                <div className="flex items-center gap-2 text-xs text-blue-100">
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  Online now
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10">
              <X size={18} />
            </button>
          </div>
          <div className="h-[300px] space-y-4 overflow-y-auto bg-slate-50 p-4">
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-blue-600 px-4 py-3 text-sm text-white shadow">
                    {m.text}

                    <div className="mt-1 text-right text-[10px] text-blue-100">{m.time}</div>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Bot size={16} />
                  </div>

                  <div className="max-w-[88%] rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="prose prose-h1:text-[14.5px] prose-h1:font-medium prose-h1:text-slate-900 prose-h1:mb-2 prose-h1:mt-0 prose-h2:text-[14.5px] prose-h2:font-medium prose-h2:text-slate-900 prose-h2:mb-2 prose-h2:mt-0 prose-h3:text-[14.5px] prose-h3:font-medium prose-h3:text-slate-900 prose-h3:mb-2 prose-h3:mt-0 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:font-medium prose-strong:text-slate-900 prose-code:text-blue-700 prose-pre:bg-slate-900 prose-pre:text-slate-100 max-w-none text-[14.5px] leading-6 text-slate-800">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                    </div>

                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-3 rounded-xl bg-slate-50 p-3">
                        <p className="mb-2 text-xs font-semibold text-slate-500">Sources</p>

                        <div className="space-y-2">
                          {m.citations.map((c) => (
                            <button
                              key={c.articleId}
                              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs text-blue-700 hover:bg-blue-50"
                            >
                              <span className="truncate">{c.title}</span>

                              <ExternalLink size={12} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                        <span>{m.time}</span>

                        {m.responseTime && <span>{m.responseTime} ms</span>}

                        {m.confidence && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                            {m.confidence}
                          </span>
                        )}
                      </div>

                      {m.messageId && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs font-medium text-slate-600">
                              Was this response helpful?
                            </p>

                            <div className="flex items-center gap-2">
                              {/* Helpful */}
                              <div className="group relative">
                                <button
                                  onClick={() => submitFeedback(m.messageId!, true, m.id)}
                                  className={`rounded-lg p-2 transition-all duration-200 ${
                                    m.feedback === true
                                      ? 'bg-green-100 text-green-700'
                                      : 'text-slate-400 hover:bg-slate-100 hover:text-green-600'
                                  }`}
                                >
                                  <ThumbsUp size={16} />
                                </button>

                                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-[11px] whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                  Helpful
                                </div>
                              </div>

                              {/* Not helpful */}
                              <div className="group relative">
                                <button
                                  onClick={() => submitFeedback(m.messageId!, false, m.id)}
                                  className={`rounded-lg p-2 transition-all duration-200 ${
                                    m.feedback === false
                                      ? 'bg-red-100 text-red-700'
                                      : 'text-slate-400 hover:bg-slate-100 hover:text-red-600'
                                  }`}
                                >
                                  <ThumbsDown size={16} />
                                </button>

                                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-[11px] whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                  Not helpful
                                </div>
                              </div>
                            </div>
                          </div>

                          {m.feedback !== null && (
                            <div
                              className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
                                m.feedback
                                  ? 'border-green-100 bg-green-50 text-green-700'
                                  : 'border-red-100 bg-red-50 text-red-700'
                              }`}
                            >
                              {m.feedback
                                ? 'Thank you for your feedback. This helps improve the assistant.'
                                : 'Thank you for your feedback. We’ll use it to improve future responses.'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ),
            )}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Bot size={16} />
                </div>

                <div className="rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={endRef}></div>
          </div>
          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about HMIS, workflows, or articles..."
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="rounded-xl bg-blue-600 px-4 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SendHorizontal size={18} />
              </button>
            </div>

            <button
              onClick={() => router.push('/widget')}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 py-3 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
            >
              <Maximize2 size={16} />
              Open full assistant
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-blue-700"
      >
        <Bot size={28} />
      </button>
    </div>
  );
}
