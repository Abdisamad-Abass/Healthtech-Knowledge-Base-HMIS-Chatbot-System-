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
} from 'lucide-react';
import { TbHistory } from 'react-icons/tb';
import { useRouter } from 'next/navigation';

type Message = {
  id: number;
  role: 'user' | 'bot';
  text: string;
  time: string;
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
        id: Date.now(),
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
          id: Date.now() + 1,
          role: 'bot',
          text: res.data.answer,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
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

      const res = await api.get(`/chat/history/${id}`);

      const formatted = [];

      res.data.forEach((msg: any) => {
        formatted.push({
          id: msg.id + '-q',
          role: 'user',
          text: msg.question,
          time: new Date(msg.createdAt).toLocaleTimeString(),
        });

        formatted.push({
          id: msg.id + '-a',
          role: 'bot',
          text: msg.answer,
          time: new Date(msg.createdAt).toLocaleTimeString(),
        });
      });

      setMessages(formatted);
      await getSessions(); // refresh order
    } catch (err) {
      console.log(err);
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
    <div className="flex h-screen w-full bg-[#F8FAFC]">
      {/* Sidebar */}
      {/* Sidebar */}
      <div className="fixed top-0 left-0 flex h-screen w-68 flex-col overflow-hidden border-r border-gray-200 bg-[#EAEAF4] shadow-xl">
        {/* Logo / Header */}
        <div className="mb-6 flex shrink-0 items-center gap-2 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0052CC] shadow-md">
            <FaBriefcaseMedical className="text-xl text-white" />
          </div>

          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-[#0052CC]">HMIS</h2>
            <p>AI Assistant</p>
          </div>
        </div>

        {/* New Chat */}
        <div className="shrink-0 px-6">
          <button
            onClick={() => {
              setSessionId('');
              setMessages([]);
              setOpenChatMenu(null);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#003D9B] p-2 text-white hover:bg-blue-500"
          >
            <Plus />
            New Chat
          </button>
        </div>

        <hr className="mt-5 shrink-0 text-slate-400" />

        {/* HISTORY AREA */}
        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          {/* History Title - Fixed */}
          <div className="mb-3 flex shrink-0 items-center gap-2 px-6">
            <TbHistory className="text-slate-400" />

            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
              History
            </p>
          </div>

          {/* ONLY THIS PART SCROLLS */}
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {chatLists.map((chat) => (
              <div
                key={chat.id}
                className={`relative mb-1 flex items-center rounded-xl ${
                  sessionId === chat.id ? 'bg-blue-200' : 'hover:bg-blue-100'
                }`}
              >
                {/* Chat Title */}
                <button
                  onClick={() => {
                    loadHistory(chat.id);
                    setOpenChatMenu(null);
                  }}
                  className="min-w-0 flex-1 truncate px-3 py-3 text-left text-sm text-slate-700"
                >
                  {chat.title}
                </button>

                {/* Menu Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    setOpenChatMenu(openChatMenu === chat.id ? null : chat.id);
                  }}
                  className="mr-1 shrink-0 rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-800"
                  aria-label="Chat options"
                >
                  <Ellipsis size={17} />
                </button>

                {/* Chat Menu */}
                {openChatMenu === chat.id && (
                  <div className="absolute top-10 right-0 z-[100] w-32 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                    <button
                      onClick={() => archiveChat(chat.id)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <Archive size={16} />
                      Archive
                    </button>

                    <button
                      onClick={() => deleteChat(chat.id)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
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
        <div className="relative shrink-0 border-t border-slate-200 bg-white p-3">
          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-3 bottom-20 left-3 z-[200] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-100">
                <User size={18} />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push('/archive');
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-100"
              >
                <Archive size={18} />
                <span>Archive</span>
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-100">
                <Settings size={18} />
                <span>Settings</span>
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-100">
                <CircleQuestionMark size={18} />
                <span>Support</span>
              </button>

              <hr className="my-2" />

              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-red-600 hover:bg-red-50">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* User Profile Button */}
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex w-full items-center gap-3 rounded-2xl p-2 transition hover:bg-slate-100"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>

            <div className="flex min-w-0 flex-1 flex-col text-left">
              <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>

              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>

            <ChevronUp
              size={18}
              className={`shrink-0 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="ml-68 flex h-full w-full flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-8 py-1">
          {/* Left Side */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-md">
              <Sparkles className="text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-blue-600">HMIS Assistant</h1>
              <div className="flex items-center gap-2">
                <div className="relative h-3 w-3">
                  <div className="absolute h-3 w-3 animate-ping rounded-full bg-green-400"></div>
                  <div className="relative h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <p className="text-sm text-slate-400">AI Expert Active</p>
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
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600'
              }`}
              title="Search conversation"
            >
              <Search size={20} />
            </button>

            <button
              aria-label="Download conversation"
              className="rounded-xl p-3 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
            >
              <Download size={20} />
            </button>

            <button
              aria-label="Delete conversation"
              className="rounded-xl p-3 text-slate-500 transition hover:bg-slate-100 hover:text-red-600"
            >
              <Trash2 size={20} />
            </button>

            <div className="relative">
              <button
                aria-label="More options"
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-xl p-3 text-slate-500 transition hover:bg-slate-100"
              >
                <MoreVertical size={20} />
              </button>
              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-100">
                    <Copy size={18} />
                    Copy Conversation
                  </button>

                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-100">
                    <Share2 size={18} />
                    Share Conversation
                  </button>

                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-100">
                    <Printer size={18} />
                    Print Conversation
                  </button>

                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-100">
                    <RefreshCw size={18} />
                    Regenerate Response
                  </button>

                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-100">
                    <BookOpen size={18} />
                    View Sources
                  </button>

                  <hr className="my-2" />

                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-100">
                    <Download size={18} />
                    Export Conversation
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Search Bar */}

          {searchOpen && (
            <div className="border-b border-slate-200 bg-slate-50 px-8 py-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm">
                <Search size={18} className="text-slate-400" />

                <input
                  type="text"
                  placeholder="Search this conversation..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1 bg-transparent outline-none"
                  autoFocus
                />

                {searchText && (
                  <button
                    onClick={() => setSearchText('')}
                    className="text-sm text-slate-500 hover:text-red-500"
                  >
                    Clear
                  </button>
                )}

                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchText('');
                  }}
                  className="text-sm text-blue-600 hover:underline"
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
                  <div className="max-w-xs rounded-2xl rounded-tr-none bg-blue-600 p-3 text-white shadow">
                    {m.text}
                  </div>

                  {/* Time */}
                  <span className="mt-1 mr-2 text-xs text-slate-400">{m.time}</span>
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-start gap-3">
                {/* Bot Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-500 shadow-md">
                  <Bot size={20} className="text-white" />
                </div>

                {/* Bot Message + Time */}
                <div className="flex flex-col">
                  <div className="max-w-md rounded-2xl rounded-tl-none border border-gray-300 bg-gray-100 p-3 text-gray-800 shadow">
                    {m.text}
                  </div>

                  {/* Time */}
                  <span className="mt-1 ml-2 text-xs text-slate-400">{m.time}</span>
                </div>
              </div>
            ),
          )}
          {isLoading && (
            <div className="flex items-start gap-3">
              {/* Bot Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-500 shadow-md">
                <Bot size={20} className="text-white" />
              </div>

              {/* Loading Bubble */}
              <div className="rounded-2xl rounded-tl-none border border-gray-300 bg-gray-100 px-5 py-3 shadow">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 delay-150"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 delay-300"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input Box + Send Button */}
        <form onSubmit={send} className="flex w-full items-center gap-3 p-6">
          <input
            aria-label="Message input"
            className="w-full rounded-xl border p-3 text-gray-700"
            placeholder="Ask HMIS question"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            type="submit"
            aria-label="Send message"
            onClick={send}
            className="rounded-xl bg-blue-600 p-3 text-white"
          >
            <SendHorizontal />
          </button>
        </form>
      </div>
    </div>
  );
}
