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
    } catch (error: any) {
      console.error('Chat request failed:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        request: error?.request,
      });

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'The HMIS assistant could not process your question right now.';

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'bot',
          text: backendMessage,
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
    <div className="fixed right-3 bottom-3 z-50 sm:right-5 sm:bottom-5 md:right-6 md:bottom-6">
      {open && (
        <div className="border-border bg-card mb-2 flex w-[calc(100vw-1.5rem)] max-w-[380px] flex-col overflow-hidden rounded-3xl border shadow-2xl sm:w-[380px]">
          {/* HEADER */}
          <div className="text-primary-foreground bg-primary flex shrink-0 items-center justify-between px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="bg-card/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10">
                <Sparkles size={18} />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold sm:text-base">HMIS AI Assistant</h3>

                <div className="flex items-center gap-2 text-xs text-white/95 sm:text-sm">
                  <span className="bg-success h-2.5 w-2.5 shrink-0 animate-pulse rounded-full shadow-[0_0_10px_rgba(5,150,105,0.9)]" />

                  <span className="font-medium">Online now</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="hover:bg-card/10 shrink-0 rounded-lg p-2"
              aria-label="Close assistant"
            >
              <X size={18} />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="bg-background h-[min(55vh,420px)] min-h-[240px] space-y-4 overflow-y-auto p-3 sm:h-[300px] sm:p-4">
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <div className="text-primary-foreground bg-primary max-w-[85%] rounded-2xl rounded-tr-none px-3 py-2.5 text-sm shadow sm:px-4 sm:py-3">
                    <div className="break-words">{m.text}</div>

                    <div className="mt-1 text-right text-[10px] text-white/80 sm:text-xs">
                      {m.time}
                    </div>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex min-w-0 gap-2 sm:gap-3">
                  <div className="text-primary-foreground bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9">
                    <Bot size={16} />
                  </div>

                  <div className="border-border bg-card max-w-[88%] min-w-0 rounded-2xl rounded-tl-none border px-3 py-2.5 shadow-sm sm:px-4 sm:py-3">
                    <div className="prose prose-h1:text-xs prose-h1:font-medium prose-h1:text-foreground prose-h1:mb-2 prose-h1:mt-0 prose-h2:text-xs prose-h2:font-medium prose-h2:text-foreground prose-h2:mb-2 prose-h2:mt-0 prose-h3:text-xs prose-h3:font-medium prose-h3:text-foreground prose-h3:mb-2 prose-h3:mt-0 prose-headings:text-sm prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:font-medium prose-strong:text-foreground prose-code:text-primary prose-pre:bg-card prose-pre:text-slate-100 text-foreground max-w-none overflow-x-auto text-[14px] leading-6 sm:text-[14.5px]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                    </div>

                    {/* CITATIONS */}
                    {m.citations && m.citations.length > 0 && (
                      <div className="bg-background mt-3 rounded-xl p-2.5 sm:p-3">
                        <p className="text-card-foreground mb-2 text-xs font-semibold">Sources</p>

                        <div className="space-y-2">
                          {m.citations.map((c) => (
                            <button
                              key={c.articleId}
                              onClick={() => router.push(`/viewer/articles/${c.articleId}`)}
                              className="hover:bg-accent text-primary flex w-full min-w-0 items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-xs"
                            >
                              <span className="min-w-0 truncate">{c.title}</span>

                              <ExternalLink size={12} className="shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* META + FEEDBACK */}
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

            {/* LOADING */}
            {isLoading && (
              <div className="flex gap-2 sm:gap-3">
                <div className="text-primary-foreground bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9">
                  <Bot size={16} />
                </div>

                <div className="bg-card border-border rounded-2xl rounded-tl-none border px-3 py-2.5 shadow-sm sm:px-4 sm:py-3">
                  <div className="text-card-FOREGROUND0 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />

                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* INPUT AREA */}
          <div className="bg-card border-border shrink-0 border-t p-3 sm:p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about HMIS, workflows, or articles..."
                className="h-10 min-w-0 flex-1 sm:h-11"
              />

              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
                aria-label="Send message"
                className="h-10 w-10 shrink-0 sm:h-11 sm:w-11"
              >
                <SendHorizontal className="size-5" />
              </Button>
            </div>

            <button
              onClick={() => router.push('/widget')}
              className="bg-primary-soft hover:bg-accent text-primary border-primary-soft mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition sm:py-3"
            >
              <Maximize2 size={16} />
              Open full assistant
            </button>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        className="text-primary-foreground bg-primary hover:bg-primary-hover flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 sm:h-16 sm:w-16"
      >
        <Bot size={25} className="sm:size-7" />
      </button>
    </div>
  );
}
