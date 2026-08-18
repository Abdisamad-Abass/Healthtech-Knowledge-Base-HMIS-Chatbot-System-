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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
        <div className="border-border bg-card mb-2 w-[380px] overflow-hidden rounded-3xl border shadow-2xl">
          <div className="text-primary-foreground bg-primary flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-card/20 flex h-10 w-10 items-center justify-center rounded-full">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-semibold">HMIS AI Assistant</h3>

                <div className="flex items-center gap-2 text-sm text-white/95">
                  <span className="bg-success h-2.5 w-2.5 animate-pulse rounded-full shadow-[0_0_10px_rgba(5,150,105,0.9)]"></span>
                  <span className="font-medium">Online now</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-card/10 rounded-lg p-2">
              <X size={18} />
            </button>
          </div>
          <div className="bg-background h-[300px] space-y-4 overflow-y-auto p-4">
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <div className="text-primary-foreground bg-primary max-w-[85%] rounded-2xl rounded-tr-none px-4 py-3 text-sm shadow">
                    {m.text}

                    <div className="mt-1 text-right text-xs text-white/80">{m.time}</div>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3">
                  <div className="text-primary-foreground bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    <Bot size={16} />
                  </div>

                  <div className="border-border bg-card max-w-[88%] rounded-2xl rounded-tl-none border px-4 py-3 shadow-sm">
                    <div className="prose prose-h1:text-[14.5px] prose-h1:font-medium prose-h1:text-foreground prose-h1:mb-2 prose-h1:mt-0 prose-h2:text-[14.5px] prose-h2:font-medium prose-h2:text-foreground prose-h2:mb-2 prose-h2:mt-0 prose-h3:text-[14.5px] prose-h3:font-medium prose-h3:text-foreground prose-h3:mb-2 prose-h3:mt-0 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:font-medium prose-strong:text-foreground prose-code:text-primary prose-pre:bg-card prose-pre:text-slate-100 text-foreground max-w-none text-[14.5px] leading-6">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                    </div>

                    {m.citations && m.citations.length > 0 && (
                      <div className="bg-background mt-3 rounded-xl p-3">
                        <p className="text-card-foreground mb-2 text-xs font-semibold">Sources</p>

                        <div className="space-y-2">
                          {m.citations.map((c) => (
                            <button
                              key={c.articleId}
                              onClick={() => router.push(`/viewer/articles/${c.articleId}`)}
                              className="hover:bg-accent text-primary flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs"
                            >
                              <span className="truncate">{c.title}</span>

                              <ExternalLink size={12} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3">
                      <div className="text-card-foreground flex flex-wrap items-center gap-2 text-[10px]">
                        <span>{m.time}</span>

                        {m.responseTime && <span>{m.responseTime} ms</span>}

                        {m.confidence && (
                          <span className="bg-success-bg text-status-published rounded-full px-2 py-0.5">
                            {m.confidence}
                          </span>
                        )}
                      </div>

                      {m.messageId && (
                        <div className="border-border mt-4 border-t pt-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-muted-foreground text-xs font-medium">
                              Was this response helpful?
                            </p>

                            <div className="flex items-center gap-2">
                              {/* Helpful */}
                              <div className="group relative">
                                <button
                                  onClick={() => submitFeedback(m.messageId!, true, m.id)}
                                  className={`rounded-lg p-2 transition-all duration-200 ${
                                    m.feedback === true
                                      ? 'bg-success-bg text-status-published'
                                      : 'hover:text-status-published hover:bg-muted text-muted-foreground'
                                  }`}
                                >
                                  <ThumbsUp size={16} />
                                </button>

                                <div className="bg-popover text-popover-foreground border-border pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-md border px-2 py-1 text-[11px] whitespace-nowrap opacity-0 shadow-md transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100">
                                  Helpful
                                </div>
                              </div>

                              {/* Not helpful */}
                              <div className="group relative">
                                <button
                                  onClick={() => submitFeedback(m.messageId!, false, m.id)}
                                  className={`rounded-lg p-2 transition-all duration-200 ${
                                    m.feedback === false
                                      ? 'bg-danger-BG text-status-rejected'
                                      : 'hover:text-status-rejected hover:bg-muted text-muted-foreground'
                                  }`}
                                >
                                  <ThumbsDown size={16} />
                                </button>

                                <div className="bg-popover text-popover-foreground border-border pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-md border px-2 py-1 text-[11px] whitespace-nowrap opacity-0 shadow-md transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100">
                                  Not helpful
                                </div>
                              </div>
                            </div>
                          </div>

                          {m.feedback !== null && (
                            <div
                              className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
                                m.feedback
                                  ? 'bg-success-bg border-success-border text-status-published'
                                  : 'bg-danger-bg text-status-rejected border-danger-border'
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
                <div className="text-primary-foreground bg-primary flex h-9 w-9 items-center justify-center rounded-full">
                  <Bot size={16} />
                </div>

                <div className="bg-card border-border rounded-2xl rounded-tl-none border px-4 py-3 shadow-sm">
                  <div className="text-card-FOREGROUND0 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={endRef}></div>
          </div>
          <div className="bg-card border-border border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about HMIS, workflows, or articles..."
                className="h-11 flex-1"
              />

              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
                aria-label="Send message"
              >
                <SendHorizontal className="size-5" />
              </Button>
            </div>

            <button
              onClick={() => router.push('/widget')}
              className="bg-primary-soft hover:bg-accent text-primary mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 py-3 text-sm font-medium transition"
            >
              <Maximize2 size={16} />
              Open full assistant
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="text-primary-foreground bg-primary hover:bg-primary flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
      >
        <Bot size={28} />
      </button>
    </div>
  );
}
