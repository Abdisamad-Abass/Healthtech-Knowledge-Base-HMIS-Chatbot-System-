'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ChatWidget from '@/components/ChatWidget';
import {
  ArrowLeft,
  Bot,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Search,
  Trash2,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type ChatSession = {
  id: string;
  title: string;
  totalMessages: number;
  lastMessageAt: string;
  isArchived: boolean;
};

type RecentArticle = {
  id: string;
  title: string;
  viewedAt: string;
};

export default function ViewerHistoryPage() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setLoading(true);

      const sessionsRes = await api.get('/chat/sessions');

      setChatSessions(sessionsRes.data || []);

      const stored = localStorage.getItem('viewer_recent_articles');
      if (stored) {
        setRecentArticles(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredChats = useMemo(() => {
    return chatSessions.filter((chat) => chat.title.toLowerCase().includes(query.toLowerCase()));
  }, [chatSessions, query]);

  const filteredArticles = useMemo(() => {
    return recentArticles.filter((article) =>
      article.title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [recentArticles, query]);

  const clearRecentArticles = () => {
    localStorage.removeItem('viewer_recent_articles');
    setRecentArticles([]);
  };

  function formatRelativeDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();

    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  }

  return (
    <div className="bg-background min-h-screen">
      {' '}
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6 lg:px-8">
        {' '}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {' '}
          <div className="space-y-2">
            <Button variant="ghost" className="-ml-2 w-fit" onClick={() => router.push('/viewer')}>
              {' '}
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home{' '}
            </Button>

            <h1 className="text-foreground text-3xl font-bold">Recent activity</h1>

            <p className="text-muted-foreground">
              View your recent chat conversations and recently viewed articles.
            </p>
          </div>
          <Button variant="outline" onClick={loadHistory}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />

              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your history..."
                className="h-12 rounded-xl pl-11"
              />
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Chat conversations</p>
                  <p className="text-foreground text-2xl font-bold">{chatSessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Recently viewed articles</p>
                  <p className="text-foreground text-2xl font-bold">{recentArticles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Latest activity</p>
                  <p className="text-foreground text-lg font-semibold">
                    {chatSessions.length > 0
                      ? formatRelativeDate(chatSessions[0].lastMessageAt)
                      : 'No activity'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-2xl font-semibold">Recent conversations</h2>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="bg-muted mb-3 h-5 w-48 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Bot className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="text-foreground text-lg font-semibold">No conversations found</h3>
                <p className="text-muted-foreground mt-2">
                  Start a conversation with the HMIS assistant to see it here.
                </p>
                <Button className="mt-6" onClick={() => router.push('/widget')}>
                  Open assistant
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredChats.map((chat) => (
                <Card key={chat.id} className="group">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-2">
                        <h3 className="text-foreground text-lg font-semibold">{chat.title}</h3>

                        <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {chat.totalMessages} messages
                          </div>

                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatRelativeDate(chat.lastMessageAt)}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => router.push('/widget')}
                        className="group-hover:shadow-md"
                      >
                        Continue chat
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-2xl font-semibold">Recently viewed articles</h2>

            {recentArticles.length > 0 && (
              <Button variant="outline" onClick={clearRecentArticles}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear history
              </Button>
            )}
          </div>

          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="text-foreground text-lg font-semibold">
                  No recently viewed articles
                </h3>
                <p className="text-muted-foreground mt-2">
                  Articles you open will appear here automatically.
                </p>
                <Button className="mt-6" onClick={() => router.push('/viewer/articles')}>
                  Browse articles
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="group">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-2">
                        <h3 className="text-foreground text-lg font-semibold">{article.title}</h3>

                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          Viewed {formatRelativeDate(article.viewedAt)}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => router.push(`/viewer/articles/${article.id}`)}
                      >
                        Open article
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
      <ChatWidget />
    </div>
  );
}
