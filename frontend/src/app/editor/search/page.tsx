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

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-700';

      case 'SUBMITTED':
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-700';

      case 'APPROVED':
        return 'bg-blue-100 text-blue-700';

      case 'REJECTED':
        return 'bg-red-100 text-red-700';

      case 'DRAFT':
        return 'bg-gray-100 text-gray-700';

      case 'ARCHIVED':
        return 'bg-purple-100 text-purple-700';

      default:
        return 'bg-gray-100 text-gray-700';
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

  return (
    <div className="min-h-screen">
      <header className="mb-6">
        <h1 className="text-xl font-bold">Search Knowledge Base</h1>

        <p className="text-sm text-gray-400">
          Search published knowledge base articles and your own articles
        </p>
      </header>

      <div className="flex items-start gap-10">
        <section className="w-[68%]">
          <div className="relative">
            <Search className="absolute top-1/2 left-5 -translate-y-1/2 text-gray-400" size={22} />

            <input
              type="text"
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
              placeholder="Search articles..."
              className="h-16 w-full rounded-2xl border bg-white pr-40 pl-14 outline-none focus:border-blue-500"
            />

            <button
              onClick={() => searchArticles(query)}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-xl bg-blue-400 px-8 py-3 text-white transition hover:bg-blue-500"
            >
              Search
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
                  Suggestions
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {suggestions.map((item, index) => (
                  <button
                    key={`${item.text}-${index}`}
                    onClick={() => {
                      setQuery(item.text);
                      setShowSuggestions(false);
                      searchArticles(item.text);
                    }}
                    className="flex w-full items-center gap-4 px-5 py-3 text-left transition hover:bg-blue-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                      <Search size={18} className="text-blue-700" />
                    </div>

                    <span className="flex-1 truncate text-sm font-medium text-gray-700">
                      {item.text}
                    </span>

                    <span className="text-xs text-gray-400">{item.type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-medium">Results ({pagination.total})</p>

              {searchType && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {searchType === 'hybrid'
                    ? 'Hybrid Search'
                    : searchType === 'semantic'
                      ? 'Semantic Search'
                      : 'Keyword Search'}
                </span>
              )}
            </div>

            {pagination.total > 0 && (
              <p className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
            )}
          </div>

          {loading && (
            <div className="card mt-3 p-8 text-center text-gray-500">Searching articles...</div>
          )}

          {!loading && query && cards.length === 0 && (
            <div className="card mt-3 p-8 text-center text-gray-500">
              No articles found for "{query}".
            </div>
          )}

          {!loading &&
            cards.map((item) => (
              <div key={item.id} className="card mt-3 transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-2xl px-3 py-1 text-xs font-medium ${getStatusStyles(
                        item.status,
                      )}`}
                    >
                      {formatStatus(item.status)}
                    </span>

                    {item.type && (
                      <span className="rounded-2xl bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                        {item.type}
                      </span>
                    )}

                    {item._score !== undefined && (
                      <p className="font-bold text-blue-600">
                        {Math.round(item._score * 100)}% Match
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-gray-500">
                    <Bookmark size={20} className="cursor-pointer hover:text-blue-600" />

                    <EllipsisVertical size={20} className="cursor-pointer hover:text-blue-600" />
                  </div>
                </div>

                <div className="mt-3">
                  <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {item.content.length > 250
                      ? `${item.content.substring(0, 250)}...`
                      : item.content}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {item.tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-400 text-xs font-bold text-white">
                        {getInitials(item.author?.name)}
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          {item.author?.name || 'Unknown Author'}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1 text-yellow-500">
                            <Star size={14} fill="currentColor" />
                            {item.avgRating?.toFixed(1) || '0.0'}
                          </span>

                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/editor/articles/${item.id}`)}
                      className="rounded-2xl bg-blue-800 px-5 py-2 text-sm text-white transition hover:bg-blue-900"
                    >
                      View Article
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {pagination.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => searchArticles(query, pagination.currentPage - 1)}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from(
                  {
                    length: pagination.totalPages,
                  },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => searchArticles(query, page)}
                    className={`h-9 w-9 rounded-lg text-sm ${
                      pagination.currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => searchArticles(query, pagination.currentPage + 1)}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </section>

        <aside className="flex-1 rounded-2xl bg-blue-50 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Recent Searches</h2>

              <p className="mt-1 text-xs text-gray-500">Your recent knowledge base searches</p>
            </div>

            {recentSearches.length > 0 && (
              <button
                onClick={clearSearchHistory}
                disabled={clearingHistory}
                title="Clear search history"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <div className="mt-4 max-h-[420px] overflow-y-auto pr-2">
            {recentSearches.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No recent searches</p>
            ) : (
              recentSearches.map((item, index) => (
                <button
                  key={`${item.query}-${item.createdAt}-${index}`}
                  onClick={() => {
                    setQuery(item.query);
                    searchArticles(item.query);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition hover:bg-blue-100"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <History size={18} className="shrink-0 text-gray-500" />

                    <span className="truncate text-sm">{limitQuery(item.query)}</span>
                  </div>

                  <span className="ml-3 shrink-0 text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
