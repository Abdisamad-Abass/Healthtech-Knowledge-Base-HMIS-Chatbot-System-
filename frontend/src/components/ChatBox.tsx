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
  Sparkles,
  Copy,
  Share2,
  Printer,
  RefreshCw,
  BookOpen,
  Bot,
} from 'lucide-react';
import { TbHistory } from 'react-icons/tb';

type Message = {
  id: number;
  role: 'user' | 'bot';
  text: string;
  time: string;
};

export default function ChatBox() {
  const [input, setInput] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Auto scroll to the bottom of the chat when a new message is added
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AUTO SCROLL WHEN NEW MESSAGE APPEARS
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, isLoading]);
  async function send() {
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
      });

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
    } finally {
      setIsLoading(false);
    }
  }

  const chatLists = [
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
      <div className="flex h-full w-[24%] flex-col border-r border-slate-200 bg-[#EAEAF4] shadow-xl">
        <div className="mb-6 flex items-center gap-2 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0052CC] shadow-md">
            <FaBriefcaseMedical className="text-xl text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-[#0052CC]">HMIS</h2>
            <p>AI Assistant</p>
          </div>
        </div>

        <div className="px-6">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#003D9B] p-2 text-white hover:bg-blue-500">
            <Plus /> New Chat
          </button>
        </div>

        <hr className="mt-5 text-slate-400" />
        {/* Chat List */}
        <div className="mt-5 px-2">
          <div className="mb-3 flex items-center gap-2 px-4">
            <TbHistory className="text-slate-400" />
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
              History
            </p>
          </div>
          {chatLists.map((chat, index) => (
            <div key={chat.id} className="mt-1 text-sm">
              <button
                className={
                  index === 0
                    ? 'block w-full rounded-xl border-l-4 border-blue-600 bg-[#DEE0E2] px-3 py-1.5 text-left shadow'
                    : 'block w-full rounded-xl px-3 py-1.5 text-left hover:bg-blue-300'
                }
              >
                {chat.title}
              </button>
            </div>
          ))}
        </div>
        {/* footer-- Profile Section */}
        <div className="relative mt-auto border-t border-slate-200 bg-white p-3">
          {profileOpen && (
            <div className="absolute right-3 bottom-20 left-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-100">
                <User size={18} />
                <span>Profile</span>
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-100">
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

          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex w-full items-center gap-3 rounded-2xl p-2 transition hover:bg-slate-100"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              AT
            </div>

            <div className="flex flex-1 flex-col text-left">
              <p className="text-sm font-semibold text-slate-800">Abdisamad Tawane</p>

              <p className="truncate text-xs text-slate-500">abdisamad@gmail.com</p>
            </div>

            <ChevronUp
              size={18}
              className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex h-full w-full flex-col bg-white shadow-xl">
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
                <div className="relative h-2 w-2">
                  <div className="absolute h-2 w-2 animate-ping rounded-full bg-green-400"></div>
                  <div className="relative h-2 w-2 rounded-full bg-green-600"></div>
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
        <div className="flex w-full items-center gap-3 p-6">
          <input
            aria-label="Message input"
            className="w-full rounded-xl border p-3 text-gray-700"
            placeholder="Ask HMIS question"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            aria-label="Send message"
            onClick={send}
            className="rounded-xl bg-blue-600 p-3 text-white"
          >
            <SendHorizontal />
          </button>
        </div>
      </div>
    </div>
  );
}
