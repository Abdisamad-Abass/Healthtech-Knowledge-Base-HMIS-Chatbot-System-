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
  // Auto scroll to the bottom of the chat when a new message is added
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Send Message
  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim()) return;

    const userMessage = input;
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
        sessionId,
      });
      if (!sessionId) {
        const newId = res.data.sessionId;

        setSessionId(newId);

        await getSessions();
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
      // Refresh sidebar
      await getSessions();
    } finally {
      setIsLoading(false);
    }
  };
  // fetch chat sessions
  async function getSessions() {
    try {
      const res = await api.get('/chat/sessions');
      setChatLists(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  // Load Chat History
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
      }); // <-- THIS WAS MISSING

      setMessages(formatted);
      await getSessions(); // refresh order
    } catch (err) {
      console.log(err);
    }
  }

  //feedback function
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

  // archive chat session
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
  // delete chat session
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
  // Load Chat History On First Render
  useEffect(() => {
    getSessions();
  }, []);
  /* fetch the logged-in user. */
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
  // Auto Scroll To latest Message
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
    <div className="bg-background flex h-screen w-full">
      {/* Sidebar */}
      <div className="border-border bg-sidebar fixed top-0 left-0 flex h-screen w-68 flex-col overflow-hidden border-r shadow-xl">
        {/* Logo / Header */}
        <div className="mb-6 flex shrink-0 items-center gap-2 p-6">
          <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-md">
            <FaBriefcaseMedical className="text-xl" />
          </div>

          <div className="flex flex-col">
            <h2 className="text-primary text-2xl font-bold">HMIS</h2>
            <p>AI Assistant</p>
          </div>
        </div>

        {/* New Chat */}
        <div className="shrink-0 px-6">
          <Button
            onClick={() => {
              setSessionId('');
              setMessages([]);
              setOpenChatMenu(null);
            }}
            className="flex w-full items-center justify-center gap-2"
          >
            <Plus />
            New Chat
          </Button>
        </div>

        <hr className="text-muted-foreground mt-5 shrink-0" />

        {/* HISTORY AREA */}
        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          {/* History Title - Fixed */}
          <div className="mb-3 flex shrink-0 items-center gap-2 px-6">
            <TbHistory className="text-muted-foreground" />

            <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
              History
            </p>
          </div>

          {/* ONLY THIS PART SCROLLS */}
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {chatLists.map((chat) => (
              <div
                key={chat.id}
                className={`relative mb-1 flex items-center rounded-xl ${
                  sessionId === chat.id ? 'bg-accent' : 'hover:bg-accent'
                }`}
              >
                {/* Chat Title */}
                <button
                  onClick={() => {
                    loadHistory(chat.id);
                    setOpenChatMenu(null);
                  }}
                  className="text-foreground min-w-0 flex-1 truncate px-3 py-3 text-left text-sm"
                >
                  {chat.title}
                </button>

                {/* Menu Button */}
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

                {/* Chat Menu */}
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

        {/* FOOTER - ALWAYS VISIBLE */}
        <div className="border-border bg-card relative shrink-0 border-t p-3">
          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="border-border bg-card absolute right-3 bottom-20 left-3 z-[200] rounded-2xl border p-2 shadow-2xl">
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

          {/* User Profile Button */}
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="hover:bg-muted flex w-full items-center gap-3 rounded-2xl p-2 transition"
          >
            <div className="bg-primary text-primary-foreground flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-semibold">
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
      <div className="bg-card ml-68 flex h-full w-full flex-col shadow-xl">
        {/* Header */}
        <div className="border-border bg-card sticky top-0 z-20 flex items-center justify-between border-b px-8 py-1">
          {/* Left Side */}
          <div className="flex items-center gap-2">
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-2xl shadow-md">
              <Sparkles className="text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-primary text-2xl font-bold">HMIS Assistant</h1>
              <div className="flex items-center gap-2">
                <div className="relative h-3 w-3">
                  <div className="bg-success absolute h-3 w-3 animate-ping rounded-full"></div>
                  <div className="bg-success relative h-3 w-3 rounded-full"></div>
                </div>
                <p className="text-muted-foreground text-sm">AI Expert Active</p>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              aria-label="Search conversation"
              onClick={() => setSearchOpen(!searchOpen)}
              className={`rounded-xl p-3 transition ${
                searchOpen
                  ? 'bg-accent text-primary'
                  : 'text-muted-foreground hover:text-primary hover:bg-muted'
              }`}
              title="Search conversation"
            >
              <Search size={20} />
            </button>

            <button
              aria-label="Download conversation"
              className="text-muted-foreground hover:bg-muted hover:text-primary rounded-xl p-3 transition"
            >
              <Download size={20} />
            </button>

            <button
              aria-label="Delete conversation"
              className="text-muted-foreground hover:bg-muted hover:text-danger rounded-xl p-3 transition"
            >
              <Trash2 size={20} />
            </button>

            <div className="relative">
              <button
                aria-label="More options"
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-muted-foreground hover:bg-muted rounded-xl p-3 transition"
              >
                <MoreVertical size={20} />
              </button>
              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="border-border bg-card absolute right-0 mt-2 w-64 rounded-2xl border p-2 shadow-2xl">
                  <button className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3">
                    <Copy size={18} />
                    Copy Conversation
                  </button>

                  <button className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3">
                    <Share2 size={18} />
                    Share Conversation
                  </button>

                  <button className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3">
                    <Printer size={18} />
                    Print Conversation
                  </button>

                  <button className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3">
                    <RefreshCw size={18} />
                    Regenerate Response
                  </button>

                  <button className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3">
                    <BookOpen size={18} />
                    View Sources
                  </button>

                  <hr className="my-2" />

                  <button className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3">
                    <Download size={18} />
                    Export Conversation
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Search Bar */}

          {searchOpen && (
            <div className="border-border bg-muted border-b px-8 py-3">
              <div className="border-border bg-card flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm">
                <Search size={18} className="text-muted-foreground" />

                <Input
                  type="text"
                  placeholder="Search this conversation..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="border-0 bg-transparent shadow-none focus:ring-0 focus-visible:ring-0"
                  autoFocus
                />

                {searchText && (
                  <button
                    onClick={() => setSearchText('')}
                    className="text-muted-foreground hover:text-danger text-sm"
                  >
                    Clear
                  </button>
                )}

                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchText('');
                  }}
                  className="text-primary text-sm hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        <div ref={chatContainerRef} className="mt-5 flex-1 space-y-5 overflow-y-auto px-6">
          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="flex justify-end">
                <div className="flex flex-col items-end">
                  {/* User Message */}
                  <div className="bg-primary text-primary-foreground max-w-xs rounded-2xl rounded-tr-none p-3 shadow">
                    {m.text}
                  </div>

                  {/* Time */}
                  <span className="text-muted-foreground mt-1 mr-2 text-xs">{m.time}</span>
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-start gap-3">
                {/* Bot Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-500 shadow-md">
                  <Bot size={20} className="text-primary-foreground" />
                </div>

                {/* Bot Message + Time */}
                <div className="flex flex-col">
                  <div className="border-border bg-card max-w-3xl rounded-3xl rounded-tl-none border p-5 shadow-sm">
                    <div className="prose prose-slate prose-headings:mt-0 prose-headings:mb-3 prose-p:my-3 prose-li:my-1 prose-strong:text-foreground prose-code:text-primary max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                    </div>

                    {m.citations && m.citations.length > 0 && (
                      <div className="bg-muted mt-4 rounded-2xl p-4">
                        <p className="text-muted-foreground mb-2 text-xs font-semibold">Sources</p>
                        <div className="space-y-2">
                          {m.citations.map((c) => (
                            <button
                              key={c.articleId}
                              onClick={() => router.push(`/viewer/articles/${c.articleId}`)}
                              className="text-primary hover:bg-accent flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm"
                            >
                              <span className="truncate">{c.title}</span>
                              <ExternalLink size={14} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-3 text-xs">
                      <span>{m.time}</span>

                      {m.responseTime && <span>{m.responseTime} ms</span>}

                      {m.confidence && (
                        <span className="bg-success-bg text-success rounded-full px-2 py-1">
                          {m.confidence}
                        </span>
                      )}
                    </div>

                    {m.messageId && (
                      <div className="border-border mt-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                          <p className="text-muted-foreground text-sm">
                            Was this response helpful?
                          </p>

                          <div className="flex items-center gap-2">
                            {/* Helpful */}
                            <button
                              onClick={() => submitFeedback(m.messageId!, true, m.id)}
                              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                                m.feedback === true
                                  ? 'bg-success-bg text-success border-success-border'
                                  : 'text-muted-foreground hover:bg-muted border-transparent'
                              }`}
                            >
                              <ThumbsUp size={16} />
                              {m.feedback === true && <span>Helpful</span>}
                            </button>

                            {/* Not Helpful */}
                            <button
                              onClick={() => submitFeedback(m.messageId!, false, m.id)}
                              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                                m.feedback === false
                                  ? 'border-danger-border bg-danger-bg text-danger border'
                                  : 'text-muted-foreground hover:bg-muted border border-transparent'
                              }`}
                            >
                              <ThumbsDown size={16} />
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
            <div className="flex items-start gap-3">
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full shadow-md">
                <Bot size={20} className="text-primary-foreground" />
              </div>

              <div className="border-border bg-card rounded-3xl rounded-tl-none border px-5 py-4 shadow-sm">
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
        <form onSubmit={send} className="flex w-full items-center gap-3 p-6">
          <Input
            aria-label="Message input"
            className="h-11 flex-1"
            placeholder="Ask HMIS question"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <Button
            type="submit"
            size="icon"
            aria-label="Send message"
            disabled={!input.trim() || isLoading}
          >
            <SendHorizontal className="size-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
