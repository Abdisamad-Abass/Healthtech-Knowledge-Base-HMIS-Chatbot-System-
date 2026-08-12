'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

import {
  Search,
  Bookmark,
  EllipsisVertical,
  Star,
  History,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

type Tag = {
  id: string;
  name: string;
};

type Author = {
  id: string;
  name: string;
  email?: string;
};

type Category = {
  id: string;
  name: string;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  type?: string;
  product?: string;
  views: number;
  avgRating: number;
  createdAt: string;
  _score?: number;
  _scores?: {
    title: number;
    tag: number;
    semantic: number;
    category: number;
    product: number;
    content: number;
    views: number;
    rating: number;
    freshness: number;
  };
  tags: Tag[];
  author?: Author | null;
  category?: Category | null;
};

type Suggestion = {
  text: string;
  type: string;
  label: string;
};

type RecentSearch = {
  query: string;
  resultCount: number;
  createdAt: string;
};

export default function EditorSearchPage() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [cards, setCards] = useState<Article[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    totalPages: 1,
  });

  const [searchType, setSearchType] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);

  const getSuggestions = async (text: string) => {
    const searchText = text.trim();

    if (searchText.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const { data } = await api.get('/search/auto-complete', {
        params: {
          q: searchText,
          limit: 10,
        },
      });

      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const searchArticles = async (searchText = '', page = 1) => {
    const trimmedQuery = searchText.trim();

    if (!trimmedQuery) {
      setCards([]);
      setSearchType('');
      setPagination({
        total: 0,
        currentPage: 1,
        totalPages: 1,
      });
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.get('/search', {
        params: {
          q: trimmedQuery,
          page,
          limit: 10,
        },
      });

      setCards(data.results || []);
      setSearchType(data.searchType || '');

      setPagination({
        total: data.total || 0,
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
      });

      setShowSuggestions(false);

      // Refresh recent searches after every successful search
      getRecentSearches();
    } catch (error) {
      console.error('Failed to search articles:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const getRecentSearches = async () => {
    try {
      const { data } = await api.get('/search/recent');

      setRecentSearches(data.searches || []);
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const clearSearchHistory = async () => {
    if (recentSearches.length === 0) return;

    const confirmed = window.confirm('Are you sure you want to clear your entire search history?');

    if (!confirmed) return;

    try {
      setClearingHistory(true);

      const { data } = await api.delete('/search/recent');

      setRecentSearches([]);

      console.log(`${data.totalDeleted || 0} search history records deleted.`);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    } finally {
      setClearingHistory(false);
    }
  };

  useEffect(() => {
    getRecentSearches();
  }, []);

  const limitQuery = (text: string, maxLength = 30) => {
    if (!text) return '';

    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const formatStatus = (status: string) => {
    return status.replaceAll('_', ' ');
  };

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

  const getSearchTypeBadgeClass = (type?: string) => {
    switch ((type || '').toLowerCase()) {
      case 'hybrid':
        return 'badge badge-approved';

      case 'semantic':
        return 'badge badge-published';

      case 'keyword':
        return 'badge badge-submitted';

      default:
        return 'badge badge-draft';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';

    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // helper function of article text arrangement
  const stripHtml = (html: string) => {
    if (!html) return '';

    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const getExcerpt = (html: string, maxLength = 220) => {
    const text = stripHtml(html);

    if (text.length <= maxLength) return text;

    return text.slice(0, maxLength).trim() + '...';
  };

  return (
    <div className="min-h-screen">
      <header className="mb-6">
        <h1 className="text-foreground text-xl font-bold">Search knowledge base</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Search published knowledge base articles and your own articles
        </p>
      </header>

      <div className="flex items-start gap-10">
        {/* Search Section */}
        <section className="w-[68%]">
          <div className="relative">
            <Search
              className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2"
              size={20}
            />

            <Input
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                setQuery(value);
                getSuggestions(value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  searchArticles(query);
                }
              }}
              placeholder="Search knowledge base articles..."
              className="h-12 pr-28 pl-11"
            />

            <Button
              onClick={() => searchArticles(query)}
              className="absolute top-1.5 right-1.5 h-9 px-4"
            >
              Search
            </Button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <Card className="mt-2 overflow-hidden">
              <CardHeader className="bg-muted border-border border-b py-3">
                <CardTitle className="text-sm">Suggestions</CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                {suggestions.map((item, index) => (
                  <button
                    key={`${item.text}-${index}`}
                    onClick={() => {
                      setQuery(item.text);
                      setShowSuggestions(false);
                      searchArticles(item.text);
                    }}
                    className="hover:bg-accent flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                  >
                    <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
                      <Search size={16} className="text-primary" />
                    </div>

                    <span className="text-foreground flex-1 truncate text-sm font-medium">
                      {item.text}
                    </span>

                    <span className="text-muted-foreground text-xs">{item.type}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-foreground text-lg font-semibold">
                Results ({pagination.total})
              </h2>

              {searchType && (
                <span className={getSearchTypeBadgeClass(searchType)}>
                  <span className="badge-dot" />
                  {searchType === 'hybrid'
                    ? 'Hybrid Search'
                    : searchType === 'semantic'
                      ? 'Semantic Search'
                      : 'Keyword Search'}
                </span>
              )}
            </div>

            {pagination.total > 0 && (
              <p className="text-muted-foreground text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
            )}
          </div>

          {loading && (
            <Card className="mt-4">
              <CardContent className="text-muted-foreground py-8 text-center">
                Searching articles...
              </CardContent>
            </Card>
          )}

          {!loading && query && cards.length === 0 && (
            <Card className="mt-4">
              <CardContent className="text-muted-foreground py-8 text-center">
                No articles found for "{query}".
              </CardContent>
            </Card>
          )}
          {!loading &&
            cards.map((item) => (
              <Card key={item.id} className="mt-4">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={getStatusBadgeClass(item.status)}>
                        <span className="badge-dot" />
                        {formatStatus(item.status)}
                      </span>

                      {item.type && (
                        <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
                          {item.type.replaceAll('_', ' ')}
                        </span>
                      )}

                      {item._score !== undefined && (
                        <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                          {Math.round(item._score * 100)}% match
                        </span>
                      )}
                    </div>

                    <div className="text-muted-foreground flex items-center gap-2">
                      <Button variant="ghost" size="icon-sm">
                        <Bookmark className="h-4 w-4" />
                      </Button>

                      <Button variant="ghost" size="icon-sm">
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-foreground text-lg font-semibold">{item.title}</h3>

                    <p className="text-muted-foreground text-sm leading-7">
                      {getExcerpt(item.content)}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {item.tags?.map((tag) => (
                        <span
                          key={tag.id}
                          className="text-primary border-border bg-muted inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-border mt-5 flex items-center justify-between border-t pt-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold">
                        {getInitials(item.author?.name)}
                      </div>

                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {item.author?.name || 'Unknown Author'}
                        </p>

                        <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                          <span className="text-warning flex items-center gap-1">
                            <Star size={14} fill="currentColor" />
                            {item.avgRating?.toFixed(1) || '0.0'}
                          </span>

                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <Button onClick={() => router.push(`/editor/articles/${item.id}`)}>
                      View article
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

          {pagination.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between">
              <Button
                variant="outline"
                disabled={pagination.currentPage === 1}
                onClick={() => searchArticles(query, pagination.currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from(
                  {
                    length: pagination.totalPages,
                  },
                  (_, index) => index + 1,
                ).map((page) => (
                  <Button
                    key={page}
                    variant={pagination.currentPage === page ? 'default' : 'outline'}
                    size="icon-sm"
                    onClick={() => searchArticles(query, page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => searchArticles(query, pagination.currentPage + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </section>

        <Card className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Recent searches</CardTitle>
                <CardDescription>Your recent knowledge base searches</CardDescription>
              </div>

              {recentSearches.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={clearSearchHistory}
                  disabled={clearingHistory}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {recentSearches.length === 0 ? (
              <div className="border-border bg-muted/40 flex h-24 items-center justify-center rounded-2xl border">
                <div className="text-center">
                  <History className="text-muted-foreground mx-auto mb-2 h-5 w-5" />
                  <p className="text-muted-foreground text-sm">No recent searches</p>
                </div>
              </div>
            ) : (
              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {recentSearches.map((item, index) => (
                  <button
                    key={`${item.query}-${item.createdAt}-${index}`}
                    onClick={() => {
                      setQuery(item.query);
                      searchArticles(item.query);
                    }}
                    className="border-border hover:border-primary/30 hover:bg-accent flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition-colors"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
                        <History className="text-primary h-4 w-4" />
                      </div>

                      <span className="text-foreground truncate text-sm font-medium">
                        {limitQuery(item.query)}
                      </span>
                    </div>

                    <span className="text-muted-foreground text-xs">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
