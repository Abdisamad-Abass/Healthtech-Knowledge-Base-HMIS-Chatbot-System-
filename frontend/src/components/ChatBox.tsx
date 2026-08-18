'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { FaBriefcaseMedical } from 'react-icons/fa';
import {
  Plus,
  Archive,
  CircleQuestionMark,
  SendHorizontal,
  Settings,
  User,
  LogOut,
  ChevronUp,
  Search,
  Trash2,
  Download,
  MoreVertical,
  Ellipsis,
  Sparkles,
  Copy,
  Share2,
  Printer,
  RefreshCw,
  BookOpen,
  Bot,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Loader2,
  Menu,
  X,
} from 'lucide-react';
import { TbHistory } from 'react-icons/tb';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

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

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type ChatSession = {
  id: string;
  title: string;
  totalMessages: number;
  lastMessageAt: string;
  isArchived: boolean;
};

export default function ChatBox() {
  const router = useRouter();

  const [input, setInput] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [chatLists, setChatLists] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState('');

  const [openChatMenu, setOpenChatMenu] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sidebar open / close
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'user',
        text: userMessage,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);

    setIsLoading(true);

    try {
      const res = await api.post('/chat', {
        question: userMessage,
        sessionId: sessionId || undefined,
      });

      if (!res.data?.answer) {
        throw new Error('The chatbot returned an empty response.');
      }

      if (!sessionId && res.data.sessionId) {
        setSessionId(res.data.sessionId);
      }

      setMessages((prev) => [
        ...prev,
        {
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
        },
      ]);

      await getSessions();
    } catch (error: any) {
      console.error('Chat request failed:', error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Sorry, the HMIS Assistant could not process your question. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'bot',
          text: errorMessage,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          confidence: 'LOW',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  async function getSessions() {
    try {
      const res = await api.get('/chat/sessions');
      setChatLists(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadHistory(id: string) {
    try {
      setSessionId(id);

      const res = await api.get<
        Array<{
          id: string | number;
          question: string;
          answer: string;
          createdAt: string;
          citations?: Citation[];
          confidence?: number;
          responseTime?: number;
          feedback?: boolean | null;
        }>
      >(`/chat/history/${id}`);

      const formatted: Message[] = [];

      res.data.forEach((msg: any) => {
        formatted.push({
          id: msg.id + '-q',
          role: 'user',
          text: msg.question,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        });

        formatted.push({
          id: msg.id + '-a',
          role: 'bot',
          text: msg.answer,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          messageId: Number(msg.id),
          citations: msg.citations || [],
          confidence: msg.confidence === 1 ? 'HIGH' : msg.confidence >= 0.6 ? 'MEDIUM' : 'LOW',
          responseTime: msg.responseTime,
          feedback: msg.feedback,
        });
      });

      setMessages(formatted);
      await getSessions();

      // Close sidebar on mobile after selecting a chat
      setSidebarOpen(false);
    } catch (err) {
      console.log(err);
    }
  }

  async function submitFeedback(messageId: number, helpful: boolean, messageKey: string) {
    try {
      await api.patch(`/chat/${messageId}/feedback`, { helpful });

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

  async function archiveChat(id: string) {
    try {
      await api.patch(`/chat/sessions/${id}/archive`);

      setChatLists((prev) => prev.filter((chat) => chat.id !== id));

      if (sessionId === id) {
        setSessionId('');
        setMessages([]);
      }

      setOpenChatMenu(null);
    } catch (error) {
      console.error('Failed to archive chat:', error);
    }
  }

  async function deleteChat(id: string) {
    const confirmed = window.confirm('Are you sure you want to permanently delete this chat?');

    if (!confirmed) return;

    try {
      await api.delete(`/chat/sessions/${id}`);

      setChatLists((prev) => prev.filter((chat) => chat.id !== id));

      if (sessionId === id) {
        setSessionId('');
        setMessages([]);
      }

      setOpenChatMenu(null);
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  }

  useEffect(() => {
    getSessions();
  }, []);

  useEffect(() => {
    async function getUser() {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (error) {
        console.log(error);
      }
    }

    getUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  const chatLists1 = [
    {
      id: 1,
      title: 'Patient Registration Guide',
    },
    {
      id: 2,
      title: 'How to reset HMIS password',
    },
    {
      id: 3,
      title: 'Pharmacy Workflow',
    },
    {
      id: 4,
      title: 'Billing Reports',
    },
  ];

  return (
    <div className="bg-background flex h-screen w-full overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`border-border bg-sidebar fixed top-0 left-0 z-50 flex h-screen w-[280px] flex-col overflow-hidden border-r shadow-xl transition-transform duration-300 ease-in-out md:w-[260px] lg:w-68 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full'
        }`}
      >
        {/* Logo / Header */}
        <div className="mb-4 flex shrink-0 items-center justify-between gap-2 p-4 sm:mb-6 sm:p-6">
          <div className="flex min-w-0 items-center gap-2">
            <div className="bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md">
              <FaBriefcaseMedical className="text-xl" />
            </div>

            <div className="flex min-w-0 flex-col">
              <h2 className="text-primary text-xl font-bold sm:text-2xl">HMIS</h2>

              <p className="truncate text-sm">AI Assistant</p>
            </div>
          </div>

          {/* Close Sidebar */}
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl p-2 transition md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* New Chat */}
        <div className="shrink-0 px-4 sm:px-6">
          <Button
            onClick={() => {
              setSessionId('');
              setMessages([]);
              setOpenChatMenu(null);
              setSidebarOpen(false);
            }}
            className="flex w-full items-center justify-center gap-2"
          >
            <Plus />
            <span>New Chat</span>
          </Button>
        </div>

        <hr className="text-muted-foreground mt-4 shrink-0 sm:mt-5" />

        {/* HISTORY AREA */}
        <div className="mt-4 flex min-h-0 flex-1 flex-col sm:mt-5">
          <div className="mb-3 flex shrink-0 items-center gap-2 px-4 sm:px-6">
            <TbHistory className="text-muted-foreground" />

            <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
              History
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {chatLists.map((chat) => (
              <div
                key={chat.id}
                className={`relative mb-1 flex min-w-0 items-center rounded-xl ${
                  sessionId === chat.id ? 'bg-accent' : 'hover:bg-accent'
                }`}
              >
                <button
                  onClick={() => {
                    loadHistory(chat.id);
                    setOpenChatMenu(null);
                  }}
                  className="text-foreground min-w-0 flex-1 truncate px-3 py-3 text-left text-sm"
                >
                  {chat.title}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    setOpenChatMenu(openChatMenu === chat.id ? null : chat.id);
                  }}
                  className="text-muted-foreground hover:bg-card hover:text-foreground mr-1 shrink-0 rounded-lg p-2"
                  aria-label="Chat options"
                >
                  <Ellipsis size={17} />
                </button>

                {openChatMenu === chat.id && (
                  <div className="border-border bg-card absolute top-10 right-0 z-[100] w-32 rounded-xl border p-1 shadow-xl">
                    <button
                      onClick={() => archiveChat(chat.id)}
                      className="hover:bg-muted text-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm"
                    >
                      <Archive size={16} />
                      Archive
                    </button>

                    <button
                      onClick={() => deleteChat(chat.id)}
                      className="text-danger hover:bg-danger-bg flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-border bg-card relative shrink-0 border-t p-2 sm:p-3">
          {profileOpen && (
            <div className="border-border bg-card absolute right-2 bottom-20 left-2 z-[200] rounded-2xl border p-2 shadow-2xl sm:right-3 sm:left-3">
              <button className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left">
                <User size={18} />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push('/archive');
                }}
                className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3"
              >
                <Archive size={18} />
                <span>Archive</span>
              </button>

              <button className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left">
                <Settings size={18} />
                <span>Settings</span>
              </button>

              <button className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left">
                <CircleQuestionMark size={18} />
                <span>Support</span>
              </button>

              <hr className="my-2" />

              <button className="text-danger hover:bg-danger-bg flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="hover:bg-muted flex w-full items-center gap-2 rounded-2xl p-2 transition sm:gap-3"
          >
            <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold sm:h-11 sm:w-11">
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>

            <div className="flex min-w-0 flex-1 flex-col text-left">
              <p className="text-foreground truncate text-sm font-semibold">{user?.name}</p>

              <p className="text-muted-foreground truncate text-xs">{user?.email}</p>
            </div>

            <ChevronUp
              size={18}
              className={`shrink-0 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        className={`bg-card flex h-full min-w-0 flex-1 flex-col shadow-xl transition-all duration-300 ${
          sidebarOpen ? 'md:ml-[260px] lg:ml-68' : 'ml-0'
        }`}
      >
        {/* Header */}
        <div className="border-border bg-card sticky top-0 z-20 flex min-h-[64px] items-center justify-between gap-2 border-b px-3 py-2 sm:px-5 md:px-8">
          {/* Left Side */}
          <div className="flex min-w-0 items-center gap-2">
            {/* Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              className="text-muted-foreground hover:bg-muted hover:text-primary mr-1 rounded-xl p-2 transition"
            >
              {sidebarOpen ? <X size={21} /> : <Menu size={21} />}
            </button>

            <div className="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-md sm:h-10 sm:w-10 sm:rounded-2xl">
              <Sparkles className="text-primary-foreground size-4 sm:size-5" />
            </div>

            <div className="flex min-w-0 flex-col">
              <h1 className="text-primary truncate text-lg font-bold sm:text-xl md:text-2xl">
                HMIS Assistant
              </h1>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="relative h-2.5 w-2.5 sm:h-3 sm:w-3">
                  <div className="bg-success absolute h-2.5 w-2.5 animate-ping rounded-full sm:h-3 sm:w-3"></div>
                  <div className="bg-success relative h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3"></div>
                </div>

                <p className="text-muted-foreground truncate text-xs sm:text-sm">
                  AI Expert Active
                </p>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <button
              aria-label="Search conversation"
              onClick={() => setSearchOpen(!searchOpen)}
              className={`rounded-xl p-2 transition sm:p-3 ${
                searchOpen
                  ? 'bg-accent text-primary'
                  : 'text-muted-foreground hover:text-primary hover:bg-muted'
              }`}
              title="Search conversation"
            >
              <Search size={18} className="sm:size-5" />
            </button>

            <button
              aria-label="Download conversation"
              className="text-muted-foreground hover:bg-muted hover:text-primary rounded-xl p-2 transition sm:p-3"
            >
              <Download size={18} className="sm:size-5" />
            </button>

            <button
              aria-label="Delete conversation"
              className="text-muted-foreground hover:bg-muted hover:text-danger rounded-xl p-2 transition sm:p-3"
            >
              <Trash2 size={18} className="sm:size-5" />
            </button>

            <div className="relative">
              <button
                aria-label="More options"
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-muted-foreground hover:bg-muted rounded-xl p-2 transition sm:p-3"
              >
                <MoreVertical size={18} className="sm:size-5" />
              </button>

              {menuOpen && (
                <div className="border-border bg-card absolute right-0 mt-2 w-[220px] max-w-[calc(100vw-24px)] rounded-2xl border p-2 shadow-2xl sm:w-64">
                  <button className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm sm:text-base">
                    <Copy size={18} />
                    Copy Conversation
                  </button>

                  <button className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm sm:text-base">
                    <Share2 size={18} />
                    Share Conversation
                  </button>

                  <button className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm sm:text-base">
                    <Printer size={18} />
                    Print Conversation
                  </button>

                  <button className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm sm:text-base">
                    <RefreshCw size={18} />
                    Regenerate Response
                  </button>

                  <button className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm sm:text-base">
                    <BookOpen size={18} />
                    View Sources
                  </button>

                  <hr className="my-2" />

                  <button className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm sm:text-base">
                    <Download size={18} />
                    Export Conversation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-border bg-muted border-b px-3 py-2 sm:px-5 sm:py-3 md:px-8">
            <div className="border-border bg-card flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 shadow-sm sm:gap-3 sm:px-4 sm:py-3">
              <Search size={18} className="text-muted-foreground shrink-0" />

              <Input
                type="text"
                placeholder="Search this conversation..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="min-w-0 border-0 bg-transparent shadow-none focus:ring-0 focus-visible:ring-0"
                autoFocus
              />

              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="text-muted-foreground hover:text-danger shrink-0 text-xs sm:text-sm"
                >
                  Clear
                </button>
              )}

              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchText('');
                }}
                className="text-primary shrink-0 text-xs hover:underline sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="mt-3 min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-3 sm:mt-5 sm:space-y-5 sm:px-5 md:px-6"
        >
          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="flex justify-end">
                <div className="flex max-w-[88%] flex-col items-end sm:max-w-[75%] md:max-w-[65%]">
                  <div className="bg-primary text-primary-foreground w-fit max-w-full rounded-2xl rounded-tr-none p-3 text-sm break-words shadow sm:text-base">
                    {m.text}
                  </div>

                  <span className="text-muted-foreground mt-1 mr-2 text-[10px] sm:text-xs">
                    {m.time}
                  </span>
                </div>
              </div>
            ) : (
              <div key={i} className="flex min-w-0 items-start gap-2 sm:gap-3">
                {/* Bot Icon */}
                <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-md sm:h-10 sm:w-10">
                  <Bot size={17} className="text-primary-foreground sm:size-5" />
                </div>

                {/* Bot Message */}
                <div className="flex max-w-[calc(100%-40px)] min-w-0 flex-col sm:max-w-[calc(100%-52px)]">
                  <div className="border-border bg-card w-fit max-w-full rounded-3xl rounded-tl-none border px-3 py-3 shadow-sm sm:px-5">
                    <div className="prose prose-slate prose-headings:mt-0 prose-headings:mb-3 prose-headings:text-sm prose-p:my-3 prose-li:my-1 prose-strong:text-foreground prose-code:text-primary max-w-none overflow-x-auto text-sm break-words sm:text-[15px]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                    </div>

                    {m.citations && m.citations.length > 0 && (
                      <div className="bg-muted mt-3 rounded-2xl p-3 sm:mt-4 sm:p-4">
                        <p className="text-muted-foreground mb-2 text-xs font-semibold">Sources</p>

                        <div className="space-y-2">
                          {m.citations.map((c) => (
                            <button
                              key={c.articleId}
                              onClick={() => router.push(`/viewer/articles/${c.articleId}`)}
                              className="text-primary hover:bg-accent flex w-full min-w-0 items-center justify-between gap-2 rounded-xl px-2 py-2 text-left text-xs sm:px-3 sm:text-sm"
                            >
                              <span className="min-w-0 truncate">{c.title}</span>

                              <ExternalLink size={14} className="shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-2 text-[10px] sm:mt-4 sm:gap-3 sm:text-xs">
                      <span>{m.time}</span>

                      {m.responseTime && <span>{m.responseTime} ms</span>}

                      {m.confidence && (
                        <span className="bg-success-bg text-success rounded-full px-2 py-1">
                          {m.confidence}
                        </span>
                      )}
                    </div>

                    {m.messageId && (
                      <div className="border-border mt-3 border-t pt-3 sm:mt-4 sm:pt-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-muted-foreground text-xs sm:text-sm">
                            Was this response helpful?
                          </p>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => submitFeedback(m.messageId!, true, m.id)}
                              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
                                m.feedback === true
                                  ? 'bg-success-bg text-success border-success-border'
                                  : 'text-muted-foreground hover:bg-muted border-transparent'
                              }`}
                            >
                              <ThumbsUp size={15} />
                              {m.feedback === true && <span>Helpful</span>}
                            </button>

                            <button
                              onClick={() => submitFeedback(m.messageId!, false, m.id)}
                              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
                                m.feedback === false
                                  ? 'border-danger-border bg-danger-bg text-danger border'
                                  : 'text-muted-foreground hover:bg-muted border border-transparent'
                              }`}
                            >
                              <ThumbsDown size={15} />

                              {m.feedback === false && <span>Not helpful</span>}
                            </button>
                          </div>
                        </div>

                        {m.feedback !== null && (
                          <div
                            className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
                              m.feedback
                                ? 'border-success-border bg-success-bg text-success'
                                : 'border-danger-border bg-danger-bg text-danger'
                            }`}
                          >
                            {m.feedback
                              ? 'Thank you for your feedback.'
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
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-md sm:h-10 sm:w-10">
                <Bot size={17} className="text-primary-foreground sm:size-5" />
              </div>

              <div className="border-border bg-card rounded-3xl rounded-tl-none border px-4 py-3 shadow-sm sm:px-5 sm:py-4">
                <div className="text-muted-foreground flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Input Box + Send Button */}
        <form
          onSubmit={send}
          className="border-border bg-card flex w-full items-center gap-2 border-t p-3 sm:gap-3 sm:p-4 md:p-6"
        >
          <Input
            aria-label="Message input"
            className="h-11 min-w-0 flex-1"
            placeholder="Ask HMIS question"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <Button
            type="submit"
            size="icon"
            aria-label="Send message"
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 shrink-0"
          >
            <SendHorizontal className="size-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
