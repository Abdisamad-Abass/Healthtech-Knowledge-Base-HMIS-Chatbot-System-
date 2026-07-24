'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

import { Search } from 'lucide-react';
import { Bookmark, EllipsisVertical, Star, History, TrendingUp } from 'lucide-react';

export default function AdminSearchPage() {
  const [period, setPeriod] = useState('');
  const [cards, setCards] = useState([]);
  const [query, setQuery] = useState('');

  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    totalPages: 1,
  });

  const [searchType, setSearchType] = useState('');

  const [suggestions, setSuggestions] = useState([]);

  const [analytics, setAnalytics] = useState({
    totalSearches: 0,
    uniqueSearches: 0,
    averageResults: 0,
    zeroResults: 0,
  });

  const [recentSearches, setRecentSearches] = useState([]);

  const [trending, setTrending] = useState([]);
  const [popularTerms, setPopularTerms] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [loading, setLoading] = useState(false);
  const getSuggestions = async (text) => {
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

  const searchArticles = async (searchText = '', page = 1, filters = {}) => {
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
      setPeriod(data.period);
      setDailyTrend(data.dailyTrend || []);
      setPopularTerms(data.popularTerms || []);
    } catch (err) {
      console.log(err);
    }
  };
  const getRecentSearches = async () => {
    try {
      const { data } = await api.get('/search/recent');

      setRecentSearches(data.searches);
    } catch (err) {
      console.log(err);
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
      title: 'Total Searches',
      value: analytics.totalSearches,
    },
    {
      title: 'Unique Searches',
      value: analytics.uniqueSearches,
    },
    {
      title: 'Avg Results',
      value: analytics.averageResults.toFixed(2),
    },
    {
      title: 'Zero Results',
      value: analytics.zeroResults,
    },
  ];

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
  const limitQuery = (text, maxLength = 25) => {
    if (!text) return '';

    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header>
        <h1 className="text-xl font-bold">Search Knowledge Base</h1>
        <p className="text-sm text-gray-400">
          Find articles, guides, and documentation across the knowledge base
        </p>
      </header>

      <div className="flex items-start gap-10">
        {/* 1 column */}
        <section className="w-[60%]">
          {/* Search Section */}
          <div className="relative">
            {/* Search Icon */}
            <Search className="absolute top-1/2 left-5 -translate-y-1/2 text-gray-400" size={22} />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                setQuery(value);
                getSuggestions(value);
              }}
              placeholder="Search articles..."
              className="h-16 w-full rounded-2xl border bg-white pr-40 pl-14"
            />
            <button
              onClick={() => {
                setShowSuggestions(false);
                searchArticles(query);
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-xl bg-blue-400 px-8 py-3"
            >
              Search
            </button>
          </div>
          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
                  Suggestions
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {suggestions.map((item) => (
                  <button
                    key={item.text}
                    onClick={() => {
                      setQuery(item.text);
                      searchArticles(item.text);
                      setSuggestions([]);
                    }}
                    className="flex w-full items-center gap-4 px-5 py-3 text-left transition-all duration-200 hover:bg-blue-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                      <Search size={18} className="text-[#0F52BA]" />
                    </div>

                    <span className="flex-1 truncate text-sm font-medium text-gray-700">
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* card */}
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p>Results ({pagination.total})</p>
                <button className="button">
                  {searchType === 'hybrid'
                    ? 'Hybrid Search'
                    : searchType === 'semantic'
                      ? 'Semantic Search'
                      : 'Keyword Search'}
                </button>
              </div>
              <p>
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
            </div>
            {/* card details */}
            {cards.map((item, index) => (
              <div key={index} className="card mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button className="rounded-2xl bg-blue-300 px-3 py-1">{item.status}</button>
                    <button className="rounded-2xl bg-yellow-300 px-3 py-1">{item.type}</button>
                    <p className="font-bold text-blue-600">
                      {item.similarity ? `${item.similarity.toFixed(0)}% Match` : 'Keyword'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bookmark />
                    <EllipsisVertical />
                  </div>
                </div>
                {/* title and content */}
                <div className="mt-2">
                  <h1>{item.title}</h1>
                  <p>{item.content.substring(0, 250)}...</p>
                  {/* tags */}
                  <div className="flex items-center gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* footer */}
                <div className="mt-3 border-t">
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="rounded-full bg-blue-400 p-2">AT</button>
                      <p>{item.author?.name}</p>

                      <div className="flex items-center gap-2">
                        <p className="flex items-center gap-2 text-yellow-400">
                          <Star /> <span>{item.avgRating ?? 0}</span>
                        </p>
                        <p>{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <button className="ml-auto rounded-2xl bg-blue-800 px-5 py-2">
                      View Article
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* 2 column*/}
        <div className="flex-1 rounded bg-blue-300 px-5">
          {/* search analytics */}
          <div className="mt-2">
            <div className="mb-3">
              <h1 className="text-lg font-bold">Search Analytics</h1>

              <p className="text-xs text-gray-500">Last {period}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {analyticsCards.map((item, index) => (
                <div key={index} className="card">
                  <p>{item.title}</p>
                  <span className="text-center font-bold text-blue-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* recent searches */}
          <div className="mt-3">
            <h1 className="text-lg font-bold">Recent Searches</h1>
            <div className="h-[200px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent overflow-y-auto pr-2">
              {recentSearches.map((item, index) => (
                <div
                  key={`${item.query}-${item.createdAt}-${index}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-blue-400 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <History size={18} />

                    <p className="text-sm">{limitQuery(item.query)}</p>
                  </div>

                  <p>{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Trending Now */}
          <div className="mt-3">
            <h1 className="text-lg font-bold">Trending Now</h1>
            <div className="h-[200px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent overflow-y-auto pr-2">
              {trending.map((item, index) => (
                <div
                  key={item.query}
                  className="relative z-0 flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-yellow-400 px-2">#{index + 1}</span>

                    <p className="text-sm">{limitQuery(item.query)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} />

                    {item.currentCount}
                  </div>
                  {/* line */}
                  {index < trending.length - 1 && (
                    <div className="absolute top-8 left-3 h-6 w-1 bg-amber-500"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
