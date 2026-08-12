'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

import {
  Search,
  Users,
  FileSearch,
  CircleX,
  Bookmark,
  EllipsisVertical,
  Star,
  History,
  TrendingUp,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface SearchSuggestion {
  text: string;
}

interface SearchTag {
  id: string;
  name: string;
}

interface SearchAuthor {
  name?: string;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  status: string;
  type: string;
  _score: number;
  tags: SearchTag[];
  author?: SearchAuthor;
  avgRating?: number;
  createdAt: string;
  views: number;
}

interface RecentSearch {
  query: string;
  createdAt: string;
}

interface TrendingSearch {
  query: string;
  currentCount: number;
}

interface AnalyticsSummary {
  totalSearches: number;
  uniqueSearches: number;
  averageResults: number;
  zeroResults: number;
}

interface DailyTrendItem {
  date: string;
  count: number;
}

interface PopularTerm {
  query: string;
  count: number;
}

export default function AdminSearchPage() {
  const router = useRouter();
  const [period, setPeriod] = useState('30 days');
  const [cards, setCards] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState('');

  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    totalPages: 1,
  });

  const [searchType, setSearchType] = useState('');

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalSearches: 0,
    uniqueSearches: 0,
    averageResults: 0,
    zeroResults: 0,
  });

  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  const [trending, setTrending] = useState<TrendingSearch[]>([]);
  const [popularTerms, setPopularTerms] = useState<PopularTerm[]>([]);
  const [dailyTrend, setDailyTrend] = useState<DailyTrendItem[]>([]);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [loading, setLoading] = useState(false);
  const getSuggestions = async (text: string) => {
    const searchText = text.trim();
    // Hide suggestions when input is empty or too short
    if (searchText.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const { data } = await api.get('/search/auto-complete', {
        params: {
          q: searchText,
        },
      });

      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (err) {
      console.log(err);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const searchArticles = async (
    searchText = '',
    page = 1,
    filters: Record<string, string | number | boolean> = {},
  ) => {
    try {
      setLoading(true);

      const { data } = await api.get('/search', {
        params: {
          q: searchText,
          page,
          limit: 20,
          ...filters,
        },
      });

      setCards(data.results);
      setSearchType(data.searchType);

      setPagination({
        total: data.total,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const getAnalytics = async () => {
    try {
      const { data } = await api.get('/search/analytics');

      setAnalytics(data.summary);
      setPeriod(data.period || '30 days');
      setDailyTrend(data.dailyTrend || []);
      setPopularTerms(data.popularTerms || []);
    } catch (err) {
      console.log(err);
    }
  };
  const getRecentSearches = async () => {
    try {
      const { data } = await api.get('/search/recent');

      setRecentSearches(data?.searches ?? []);
    } catch (err) {
      console.error(err);
      setRecentSearches([]);
    }
  };
  const getTrending = async () => {
    try {
      const { data } = await api.get('/search/trending');

      setTrending(data.trending);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getAnalytics();
    getRecentSearches();
    getTrending();
  }, []);

  const analyticsCards = [
    {
      title: 'Total searches',
      value: analytics.totalSearches,
      icon: Search,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Unique searches',
      value: analytics.uniqueSearches,
      icon: Users,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Average results',
      value: analytics.averageResults.toFixed(2),
      icon: FileSearch,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Zero results',
      value: analytics.zeroResults,
      icon: CircleX,
      color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    },
  ];
  // search format
  const stripHtml = (html: string) => {
    if (!html) return '';

    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const getExcerpt = (html: string, maxLength = 220) => {
    const text = stripHtml(html);

    if (text.length <= maxLength) return text;

    return text.slice(0, maxLength).trim() + '...';
  };

  // percentage Match
  const getMatchPercentage = (score: number) => {
    if (!score) return 10;

    // Convert relevance score to a user-friendly percentage
    const percentage = Math.round(Math.min(98, Math.max(10, score * 100)));

    return percentage;
  };

  // get name of author
  const getInitials = (name?: string) => {
    if (!name) return 'A';

    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) return 'A';

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const suggestions1 = [
    { icon: Search, name: 'How to reset HMIS passwordHow to reset HMIS password' },
    { icon: Search, name: 'Authentication settings' },
    { icon: Search, name: 'How to test Login' },
  ];
  const cards1 = [
    {
      status: 'Published',
      type: 'How_To',
      number: '94% Match',
      content:
        "To initiate a password reset within the Health Management Information System(HMIS), navigate to the secure login gateway. Click the 'Forgot Password' hyperlink beneath the credential fields. You will be prompted to enter your registered institutional email address to receive a validation token...",
      tags: ['Published', 'HMIS', '#authentication'],
      rating: '4.5',
    },
    {
      status: 'Submitted',
      type: 'FAQ',
      number: '81% Match',
      content:
        "To initiate a password reset within the Health Management Information System(HMIS), navigate to the secure login gateway. Click the 'Forgot Password' hyperlink beneath the credential fields. You will be prompted to enter your registered institutional email address to receive a validation token...",
      tags: ['Published', 'HMIS', '#authentication'],
      rating: '3.9',
    },
  ];
  const searchAnalytics = [
    { title: 'Total Searches', total: '12.4k' },
    { title: 'Unique Searches', total: '812' },
    { title: 'Avg Results', total: '18.2' },
    { title: 'Zero Results', total: '12%' },
  ];
  const recentChats = [
    { title: 'password reset', time: '2m ago' },
    { title: 'login issues', time: '15m ago' },
    { title: 'patient registration', time: '1h ago' },
  ];
  const trending1 = [
    { id: 1, title: 'Security Patch v4', rate: '24%' },
    { id: 2, title: 'Remote API Keys', rate: '21%' },
    { id: 3, title: 'Security Patch v4', rate: '18%' },
    { id: 4, title: 'Security Patch v4', rate: '18%' },
  ];
  const limitQuery = (text: string, maxLength = 25) => {
    if (!text) return '';

    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  /* status colors */
  const getStatusBadgeClass = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'draft':
        return 'badge badge-draft';

      case 'submitted':
        return 'badge badge-submitted';

      case 'in_review':
      case 'in review':
        return 'badge badge-in-review';

      case 'approved':
        return 'badge badge-approved';

      case 'published':
        return 'badge badge-published';

      case 'rejected':
        return 'badge badge-rejected';

      case 'archived':
        return 'badge badge-archived';

      case 'deleted':
        return 'badge badge-deleted';

      default:
        return 'badge badge-draft';
    }
  };

  /* search type badge */
  const getSearchTypeBadgeClass = (type?: string) => {
    switch ((type || '').toLowerCase()) {
      case 'hybrid':
        return 'badge badge-approved'; // info blue

      case 'semantic':
        return 'badge badge-published'; // success green

      case 'keyword':
        return 'badge badge-submitted'; // indigo

      default:
        return 'badge badge-draft';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header>
        <h1 className="text-xl font-bold">Search Knowledge Base</h1>
        <p className="text-muted-foreground text-sm">
          Find articles, guides, and documentation across the knowledge base
        </p>
      </header>

      <div className="mt-3 flex items-start gap-6">
        {/* 1 column */}
        <section className="w-[60%]">
          {/* Search Section */}
          <div className="relative">
            {/* Search Icon */}
            <Search
              className="text-muted-foreground absolute top-1/2 left-5 -translate-y-1/2"
              size={20}
            />
            <Input
              type="text"
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                setQuery(value);
                getSuggestions(value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSuggestions(false);
                  searchArticles(query);
                }
              }}
              placeholder="Search articles, SOPs, FAQs, troubleshooting guides..."
              className="h-12 pr-28 pl-11"
            />
            <Button
              type="button"
              onClick={() => {
                setShowSuggestions(false);
                searchArticles(query);
              }}
              className="absolute top-1.5 right-1.5 h-9 px-4"
            >
              Search
            </Button>
          </div>
          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-xl">
              <div className="bg-muted border-border border-b px-5 py-3">
                <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                  Suggestions
                </h2>
              </div>

              <div className="divide-border divide-y">
                {suggestions.map((item) => (
                  <button
                    key={item.text}
                    className="hover:bg-accent flex w-full items-center gap-4 px-5 py-3 text-left transition-colors duration-200"
                  >
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
                      <Search size={18} className="text-primary" />
                    </div>

                    <span className="text-foreground flex-1 truncate text-sm font-medium">
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* card */}
          <div className="mt-3">
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-foreground text-sm font-medium">Results ({pagination.total})</p>

                <span className={getSearchTypeBadgeClass(searchType)}>
                  <span className="badge-dot" />
                  {searchType === 'hybrid'
                    ? 'Hybrid Search'
                    : searchType === 'semantic'
                      ? 'Semantic Search'
                      : 'Keyword Search'}
                </span>
              </div>

              <p className="text-muted-foreground text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
            </div>
            {/* card details */}
            {cards.map((item, index) => (
              <Card key={index} className="mt-4 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={getStatusBadgeClass(item.status)}>
                      <span className="badge-dot" />
                      {item.status}
                    </span>

                    <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
                      {item.type}
                    </span>

                    <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                      {getMatchPercentage(item._score)}% match
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bookmark />
                    <EllipsisVertical />
                  </div>
                </div>
                {/* title and content */}
                <div className="mt-2">
                  <h2 className="text-foreground text-lg font-semibold">{item.title}</h2>
                  <p className="text-muted-foreground mt-3 line-clamp-3 text-sm leading-6">
                    {getExcerpt(item.content)}
                  </p>
                  {/* tags */}
                  <div className="flex items-center gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* footer */}
                <div className="border-border mt-5 flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white">
                      {getInitials(item.author?.name)}
                    </div>

                    <div>
                      <p className="text-foreground text-sm font-medium">{item.author?.name}</p>

                      <div className="text-muted-foreground flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <Star size={14} className="fill-yellow-500 text-yellow-500" />
                          {(item.avgRating ?? 0).toFixed(1)}
                        </span>

                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>

                        <span>{item.views} views</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push(`/admin/articles/${item.id}`)}
                    className="rounded-xl px-5 py-2 text-sm font-medium"
                  >
                    View Article
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
        {/* 2 column*/}
        <div className="border-border bg-card flex-1 rounded-lg border px-5 py-2 shadow-sm">
          {/* Search analytics */}
          <div>
            <div className="mb-4">
              <h2 className="text-foreground text-base font-semibold">Search analytics</h2>
              <p className="text-muted-foreground text-xs">
                Performance overview for the last {period}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {analyticsCards.map((item, index) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={index}
                    className="border-border hover:border-primary/30 bg-background p-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium">{item.title}</p>
                        <h3 className="text-foreground text-2xl font-bold tracking-tight">
                          {item.value}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent searches */}
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-foreground text-base font-semibold">Recent searches</h2>
                <p className="text-muted-foreground text-xs">Latest search activity</p>
              </div>
              <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-semibold">
                {recentSearches.length}
              </span>
            </div>

            {recentSearches.length === 0 ? (
              <div className="border-border bg-muted/40 flex h-24 items-center justify-center rounded-2xl border">
                <div className="text-center">
                  <History className="text-muted-foreground mx-auto mb-2 h-5 w-5" />
                  <p className="text-muted-foreground text-sm font-medium">No searches so far</p>
                </div>
              </div>
            ) : (
              <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
                {recentSearches.map((item, index) => (
                  <div
                    key={`${item.query}-${item.createdAt}-${index}`}
                    className="border-border hover:border-primary/30 hover:bg-accent/40 bg-background flex items-center justify-between rounded-xl border px-3 py-3 transition-all duration-200"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
                        <History className="text-primary h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-medium">
                          {limitQuery(item.query)}
                        </p>
                      </div>
                    </div>

                    <span className="text-muted-foreground ml-3 shrink-0 text-xs">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trending now */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-foreground text-base font-semibold">Trending now</h2>
                <p className="text-muted-foreground text-xs">Most searched topics this period</p>
              </div>
              <TrendingUp className="text-primary h-5 w-5" />
            </div>

            {trending.length === 0 ? (
              <div className="border-border bg-muted/40 flex h-24 items-center justify-center rounded-2xl border">
                <div className="text-center">
                  <TrendingUp className="text-muted-foreground mx-auto mb-2 h-5 w-5" />
                  <p className="text-muted-foreground text-sm font-medium">
                    No trending searches yet
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-[240px] space-y-2 overflow-y-auto pr-1">
                {trending.map((item, index) => (
                  <div
                    key={item.query}
                    className="border-border hover:border-primary/30 hover:bg-accent/40 bg-background flex items-center justify-between rounded-xl border px-3 py-3 transition-all duration-200"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-medium">
                          {limitQuery(item.query)}
                        </p>
                        <p className="text-muted-foreground text-xs">Search term</p>
                      </div>
                    </div>

                    <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {item.currentCount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
