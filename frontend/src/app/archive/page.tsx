'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Archive, ArrowLeft, MessageSquare, RotateCcw, Trash2, Search, Clock } from 'lucide-react';

type ArchivedChat = {
  id: string;
  title: string;
  totalMessages: number;
  createdAt: string;
  lastMessageAt: string;
  archivedAt: string;
  isArchived: boolean;
};

export default function ArchivePage() {
  const router = useRouter();

  const [chats, setChats] = useState<ArchivedChat[]>([]);
  const [filteredChats, setFilteredChats] = useState<ArchivedChat[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  async function getArchivedChats() {
    try {
      setLoading(true);

      const res = await api.get('/chat/sessions/archived');

      setChats(res.data);
      setFilteredChats(res.data);
    } catch (error) {
      console.error('Failed to fetch archived chats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function unarchiveChat(id: string) {
    try {
      await api.patch(`/chat/sessions/${id}/unarchive`);

      setChats((prev) => prev.filter((chat) => chat.id !== id));

      setFilteredChats((prev) => prev.filter((chat) => chat.id !== id));
    } catch (error) {
      console.error('Failed to restore chat:', error);
    }
  }

  async function deleteChat(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this archived chat?',
    );

    if (!confirmed) return;

    try {
      await api.delete(`/chat/sessions/${id}`);

      setChats((prev) => prev.filter((chat) => chat.id !== id));

      setFilteredChats((prev) => prev.filter((chat) => chat.id !== id));
    } catch (error) {
      console.error('Failed to delete archived chat:', error);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  useEffect(() => {
    getArchivedChats();
  }, []);

  useEffect(() => {
    const filtered = chats.filter((chat) =>
      chat.title.toLowerCase().includes(searchText.toLowerCase()),
    );

    setFilteredChats(filtered);
  }, [searchText, chats]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-card border-border border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="hover:text-primary hover:bg-muted text-card-FOREGROUND0 rounded-xl p-2 transition"
            >
              <ArrowLeft size={22} />
            </button>

            <div className="flex items-center gap-3">
              <div className="text-primary-foreground bg-primary flex h-12 w-12 items-center justify-center rounded-2xl shadow-md">
                <Archive size={24} />
              </div>

              <div>
                <h1 className="text-foreground text-2xl font-bold">Archived Chats</h1>

                <p className="text-card-FOREGROUND0 text-sm">
                  View and restore your archived conversations
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary-soft text-primary rounded-xl px-4 py-2 text-sm font-medium">
            {chats.length} {chats.length === 1 ? 'Chat' : 'Chats'}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-8 py-8">
        {/* Search */}
        <div className="bg-card border-border mb-8 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm">
          <Search size={20} className="text-muted-FOREGROUND" />

          <input
            type="text"
            placeholder="Search archived chats..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="text-muted-FOREGROUND flex-1 bg-transparent outline-none"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-card-FOREGROUND0 flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              Loading archived chats...
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredChats.length === 0 && (
          <div className="bg-card border-border flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed">
            <div className="bg-muted mb-4 flex h-20 w-20 items-center justify-center rounded-full">
              <Archive size={36} className="text-muted-FOREGROUND" />
            </div>

            <h2 className="text-muted-FOREGROUND text-xl font-semibold">No archived chats</h2>

            <p className="text-card-FOREGROUND0 mt-2 text-sm">
              Your archived conversations will appear here.
            </p>

            <button
              onClick={() => router.back()}
              className="text-primary-foreground bg-primary hover:bg-primary mt-6 rounded-xl px-5 py-3 font-medium transition"
            >
              Back to Chat
            </button>
          </div>
        )}

        {/* Archived Chats */}
        {!loading && filteredChats.length > 0 && (
          <div className="grid gap-4">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className="group bg-card border-border rounded-2xl border p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-6">
                  {/* Chat Information */}
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="bg-muted text-card-FOREGROUND0 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                      <MessageSquare size={22} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-foreground truncate text-lg font-semibold">
                        {chat.title}
                      </h2>

                      <div className="text-card-FOREGROUND0 mt-2 flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <MessageSquare size={15} />
                          {chat.totalMessages} messages
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock size={15} />
                          Archived {formatDate(chat.archivedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => unarchiveChat(chat.id)}
                      className="bg-primary-soft hover:bg-accent text-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition"
                    >
                      <RotateCcw size={17} />
                      Restore
                    </button>

                    <button
                      onClick={() => deleteChat(chat.id)}
                      className="hover:bg-danger-BG hover:text-status-REJECTED text-muted-FOREGROUND rounded-xl p-2.5 transition"
                      title="Delete permanently"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
