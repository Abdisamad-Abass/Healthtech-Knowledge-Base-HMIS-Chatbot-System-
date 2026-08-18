'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

import ChatWidget from '@/components/ChatWidget';

import {
  ArrowRight,
  BookOpen,
  Bot,
  Bookmark,
  Clock,
  FileText,
  FlaskConical,
  Search,
  Shield,
  Star,
  Stethoscope,
  Wrench,
  Activity,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Suggestion = {
  text: string;
  type: string;
  label: string;
};

type SearchResult = {
  id: string;
  title: string;
  slug: string;
};

const featuredArticles = [
  {
    title: 'Patient registration workflow',
    category: 'Patient management',
    description: 'Complete guide to registering a new patient in the HMIS system.',
    rating: '4.9',
    time: '6 min read',
  },
  {
    title: 'Laboratory order processing',
    category: 'Laboratory',
    description: 'Best practices for lab requests, specimen handling, and result verification.',
    rating: '4.8',
    time: '8 min read',
  },
  {
    title: 'Login and access troubleshooting',
    category: 'Troubleshooting',
    description: 'Resolve the most common authentication and account access issues.',
    rating: '4.7',
    time: '5 min read',
  },
];

const categories = [
  {
    title: 'Patient management',
    description: 'Registration, admission, discharge, and patient records.',
    count: '24 articles',
    icon: Stethoscope,
  },
  {
    title: 'Clinical modules',
    description: 'Laboratory, pharmacy, radiology, and outpatient workflows.',
    count: '18 articles',
    icon: FlaskConical,
  },
  {
    title: 'Compliance & security',
    description: 'Data privacy, audit logs, and security procedures.',
    count: '12 articles',
    icon: Shield,
  },
  {
    title: 'Troubleshooting',
    description: 'Login issues, errors, connectivity, and system recovery.',
    count: '15 articles',
    icon: Wrench,
  },
  {
    title: 'Billing & finance',
    description: 'Invoices, insurance claims, payments, and reconciliation.',
    count: '10 articles',
    icon: FileText,
  },
  {
    title: 'System administration',
    description: 'User roles, permissions, configuration, and maintenance.',
    count: '9 articles',
    icon: Activity,
  },
];

type QuickAccessData = {
  articleCount: number;
  bookmarkCount: number;
  recentActivityCount: number;
  chatbotAvailable: boolean;
};

type FeaturedArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  avgRating: number;
  reviewCount: number;
  category?: {
    id: string;
    name: string;
  } | null;
};

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  articleCount: number;
  icon: any;
};
type ContinueReadingItem = {
  id: string;
  title: string;
  type: 'ARTICLE' | 'CHAT';
  lastAccessed: string;
  timeLabel: string;
};

export default function ViewerHomePage() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [quickAccess, setQuickAccess] = useState<QuickAccessData>({
    articleCount: 0,
    bookmarkCount: 0,
    recentActivityCount: 0,
    chatbotAvailable: true,
  });

  const [quickAccessLoading, setQuickAccessLoading] = useState(true);

  const [featuredArticles, setFeaturedArticles] = useState<FeaturedArticle[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const categoryIcons: Record<string, any> = {
    HMIS: Stethoscope,
    Authentication: Shield,
    'User Guide': BookOpen,
    Healthcare: FlaskConical,
  };

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [continueReading, setContinueReading] = useState<ContinueReadingItem[]>([]);
  const [continueLoading, setContinueLoading] = useState(true);

  // autoComplete function
  const getSuggestions = async (text: string) => {
    const value = text.trim();

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoadingSuggestions(true);

      const { data } = await api.get('/search/auto-complete', {
        params: {
          q: value,
          limit: 8,
        },
      });

      setSuggestions(data || []);
      setShowSuggestions((data || []).length > 0);
    } catch (error) {
      console.error('Autocomplete failed:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // search function
  const performSearch = async (searchText: string) => {
    const value = searchText.trim();

    if (!value) return;

    try {
      const { data } = await api.get('/search', {
        params: {
          q: value,
          page: 1,
          limit: 1,
        },
      });

      setShowSuggestions(false);

      if (data.results?.length > 0) {
        router.push(`/viewer/articles/${data.results[0].id}`);
      } else {
        router.push(`/viewer/search?q=${encodeURIComponent(value)}`);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  //fetch featured articles
  const fetchFeaturedArticles = async () => {
    try {
      setFeaturedLoading(true);

      const { data } = await api.get('/articles', {
        params: {
          page: 1,
          limit: 3,
          sortBy: 'avgRating',
          order: 'desc',
        },
      });

      setFeaturedArticles(data.articles || []);
    } catch (error) {
      console.error('Failed to load featured articles:', error);
    } finally {
      setFeaturedLoading(false);
    }
  };

  //fetch categories
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);

      const { data } = await api.get('/categories');

      const categoriesWithCounts = await Promise.all(
        data.map(async (category: any) => {
          try {
            const articlesRes = await api.get('/articles', {
              params: {
                page: 1,
                limit: 1,
                category: category.name,
              },
            });

            return {
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description,
              articleCount: articlesRes.data.pagination?.total || 0,
              icon: categoryIcons[category.name] || FileText,
            };
          } catch {
            return {
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description,
              articleCount: 0,
              icon: categoryIcons[category.name] || FileText,
            };
          }
        }),
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  //fetch continue reading
  const fetchContinueReading = async () => {
    try {
      setContinueLoading(true);

      const [sessionsRes, articlesRes] = await Promise.all([
        api.get('/chat/sessions'),
        api.get('/articles', {
          params: {
            page: 1,
            limit: 3,
            sortBy: 'views',
            order: 'desc',
          },
        }),
      ]);

      const sessions = (sessionsRes.data || []).slice(0, 2).map((session: any) => ({
        id: session.id,
        title: session.title || 'Untitled conversation',
        type: 'CHAT' as const,
        lastAccessed: session.lastMessageAt,
        timeLabel: formatRelativeTime(session.lastMessageAt),
      }));

      const articles = (articlesRes.data.articles || []).slice(0, 2).map((article: any) => ({
        id: article.id,
        title: article.title,
        type: 'ARTICLE' as const,
        lastAccessed: article.updatedAt,
        timeLabel: formatRelativeTime(article.updatedAt),
      }));

      const merged = [...sessions, ...articles]
        .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
        .slice(0, 4);

      setContinueReading(merged);
    } catch (error) {
      console.error('Failed to load continue reading:', error);
      setContinueReading([]);
    } finally {
      setContinueLoading(false);
    }
  };

  // fetch quick access data
  useEffect(() => {
    const fetchQuickAccess = async () => {
      try {
        setQuickAccessLoading(true);

        const [articlesRes, sessionsRes] = await Promise.all([
          api.get('/articles', {
            params: {
              page: 1,
              limit: 1,
            },
          }),
          api.get('/chat/sessions'),
        ]);

        setQuickAccess({
          articleCount: articlesRes.data.pagination?.total || 0,
          bookmarkCount: 0,
          recentActivityCount: sessionsRes.data?.length || 0,
          chatbotAvailable: true,
        });
      } catch (error) {
        console.error('Failed to load quick access:', error);
      } finally {
        setQuickAccessLoading(false);
      }
    };

    fetchQuickAccess();
    fetchFeaturedArticles();
    fetchCategories();
    fetchContinueReading();
  }, []);

  function getReadingTime(content: string) {
    const words = content
      .replace(/<[^>]*>/g, '')
      .trim()
      .split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  }

  function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, '');
  }

  function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();

    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return minutes <= 1 ? 'Just now' : `${minutes} min ago`;
    }

    if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    if (days < 7) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString();
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 md:px-6 lg:px-8">
        {/* Hero section */}
        <section className="border-border from-accent via-background to-primary/5 overflow-visible rounded-3xl border bg-gradient-to-br">
          <div className="p-8 md:p-12">
            <div className="max-w-3xl space-y-6">
              <div className="border-border bg-card text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                Knowledge base
              </div>

              <div className="space-y-3">
                <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">
                  Find answers instantly
                </h1>
                <p className="text-muted-foreground max-w-2xl text-lg">
                  Search clinical protocols, HMIS guides, troubleshooting articles, and product
                  documentation.
                </p>
              </div>

              <div className="space-y-3">
                <Label>Search the knowledge base</Label>

                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />

                  <Input
                    value={query}
                    onChange={(e) => {
                      const value = e.target.value;
                      setQuery(value);
                      getSuggestions(value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        performSearch(query);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 150);
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    className="h-12 rounded-xl pl-11"
                    placeholder="Search articles, SOPs, FAQs, or troubleshooting guides..."
                  />

                  {showSuggestions && (
                    <div className="bg-card border-border absolute top-full right-0 left-0 z-[100] mt-2 max-h-80 overflow-y-auto rounded-xl border shadow-2xl">
                      {loadingSuggestions ? (
                        <div className="text-muted-foreground px-4 py-3 text-sm">Searching...</div>
                      ) : suggestions.length > 0 ? (
                        suggestions.map((item, index) => (
                          <button
                            key={`${item.text}-${index}`}
                            onMouseDown={() => {
                              setQuery(item.text);
                              performSearch(item.text);
                            }}
                            className="hover:bg-accent flex w-full items-center justify-between px-4 py-3 text-left transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Search className="text-muted-foreground h-4 w-4" />
                              <span className="text-foreground text-sm font-medium">
                                {item.text}
                              </span>
                            </div>

                            <span className="text-muted-foreground text-xs capitalize">
                              {item.type}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="text-muted-foreground px-4 py-3 text-sm">
                          No suggestions found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {[
                  'Patient registration',
                  'Clinical workflows',
                  'Laboratory & diagnostics',
                  'Authentication & login',
                  'System administration',
                ].map((chip) => (
                  <Button
                    key={chip}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      setQuery(chip);
                      performSearch(chip);
                    }}
                  >
                    {chip}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* Quick access */}
        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-foreground text-2xl font-semibold">Quick access</h2>

            <div className="w-full sm:w-56">
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filter content" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All content</SelectItem>
                  <SelectItem value="articles">Articles</SelectItem>
                  <SelectItem value="guides">Guides</SelectItem>
                  <SelectItem value="sops">SOPs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Articles */}
            <Card
              className="group cursor-pointer transition-all hover:shadow-md"
              onClick={() => router.push('/viewer/articles')}
            >
              <CardContent className="p-6">
                <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-foreground text-lg font-semibold">Articles</h3>
                  <span className="text-primary text-xl font-bold">
                    {quickAccessLoading ? '--' : quickAccess.articleCount}
                  </span>
                </div>

                <p className="text-muted-foreground mt-2 text-sm">
                  Browse all published knowledge base articles.
                </p>

                <Button variant="ghost" className="text-primary hover:bg-primary/5 mt-4 px-0">
                  Browse articles
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Assistant */}
            <Card
              className="group cursor-pointer transition-all hover:shadow-md"
              onClick={() => router.push('/widget')}
            >
              <CardContent className="p-6">
                <div className="bg-info-bg text-info mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Bot className="h-6 w-6" />
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-foreground text-lg font-semibold">Ask the assistant</h3>
                  <span className="text-success text-sm font-medium">
                    {quickAccess.chatbotAvailable ? 'Online' : 'Offline'}
                  </span>
                </div>

                <p className="text-muted-foreground mt-2 text-sm">
                  Get instant answers from the KB chatbot.
                </p>

                <Button variant="ghost" className="text-primary hover:bg-primary/5 mt-4 px-0">
                  Open chatbot
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Bookmarks */}
            <Card
              className="group cursor-pointer transition-all hover:shadow-md"
              onClick={() => router.push('/viewer/bookmarks')}
            >
              <CardContent className="p-6">
                <div className="bg-success-bg text-success mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Bookmark className="h-6 w-6" />
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-foreground text-lg font-semibold">Bookmarks</h3>
                  <span className="text-primary text-xl font-bold">
                    {quickAccessLoading ? '--' : quickAccess.bookmarkCount}
                  </span>
                </div>

                <p className="text-muted-foreground mt-2 text-sm">
                  Continue reading your saved articles.
                </p>

                <Button variant="ghost" className="text-primary hover:bg-primary/5 mt-4 px-0">
                  View bookmarks
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Recent activity */}
            <Card
              className="group cursor-pointer transition-all hover:shadow-md"
              onClick={() => router.push('/viewer/history')}
            >
              <CardContent className="p-6">
                <div className="bg-secondary text-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Clock className="h-6 w-6" />
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-foreground text-lg font-semibold">Recent activity</h3>
                  <span className="text-primary text-xl font-bold">
                    {quickAccessLoading ? '--' : quickAccess.recentActivityCount}
                  </span>
                </div>

                <p className="text-muted-foreground mt-2 text-sm">
                  Return to recently viewed content.
                </p>

                <Button variant="ghost" className="text-primary hover:bg-primary/5 mt-4 px-0">
                  View history
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
        {/* Featured articles */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-2xl font-semibold">Featured articles</h2>

            <Button
              variant="ghost"
              className="text-primary hover:bg-primary/5"
              onClick={() => router.push('/viewer/articles')}
            >
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {featuredLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="h-full">
                    <CardHeader className="space-y-3">
                      <div className="bg-muted h-5 w-24 animate-pulse rounded" />
                      <div className="bg-muted h-6 w-3/4 animate-pulse rounded" />
                      <div className="bg-muted h-4 w-full animate-pulse rounded" />
                      <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                      <div className="bg-muted h-9 w-28 animate-pulse rounded" />
                    </CardContent>
                  </Card>
                ))
              : featuredArticles.map((article) => (
                  <Card key={article.id} className="group h-full">
                    <CardHeader className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge label={article.category?.name || 'General'} />

                        <div className="text-warning flex items-center gap-1 text-sm font-medium">
                          <Star className="fill-warning h-4 w-4" />
                          {article.reviewCount > 0 ? article.avgRating.toFixed(1) : 'New'}
                        </div>
                      </div>

                      <CardTitle className="text-foreground line-clamp-2 text-xl">
                        {article.title}
                      </CardTitle>

                      <CardDescription className="text-muted-foreground line-clamp-3">
                        {stripHtml(article.content)}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="mt-auto flex items-center justify-between">
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        {getReadingTime(article.content)}
                      </div>

                      <Button onClick={() => router.push(`/viewer/articles/${article.id}`)}>
                        Read article
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </section>
        {/* Categories */}
        <section className="space-y-5">
          <h2 className="text-foreground text-2xl font-semibold">Browse by category</h2>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categoriesLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="h-full">
                    <CardContent className="p-6">
                      <div className="bg-muted mb-4 h-12 w-12 animate-pulse rounded-xl" />
                      <div className="bg-muted h-5 w-40 animate-pulse rounded" />
                      <div className="bg-muted mt-3 h-4 w-full animate-pulse rounded" />
                      <div className="bg-muted mt-2 h-4 w-5/6 animate-pulse rounded" />
                      <div className="mt-6 flex items-center justify-between">
                        <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                        <div className="bg-muted h-8 w-20 animate-pulse rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : categories.map((category) => {
                  const Icon = category.icon;

                  return (
                    <Card key={category.id} className="group h-full">
                      <CardContent className="p-6">
                        <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                          <Icon className="h-6 w-6" />
                        </div>

                        <h3 className="text-foreground text-lg font-semibold">{category.name}</h3>

                        <p className="text-muted-foreground mt-2 text-sm">
                          {category.description ||
                            `Browse all ${category.name} articles and guides.`}
                        </p>

                        <div className="mt-6 flex items-center justify-between">
                          <span className="text-muted-foreground text-sm font-medium">
                            {category.articleCount} article{category.articleCount !== 1 ? 's' : ''}
                          </span>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/5"
                            onClick={() =>
                              router.push(
                                `/viewer/articles?category=${encodeURIComponent(category.name)}`,
                              )
                            }
                          >
                            Explore
                            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
          </div>
        </section>
        {/* Continue reading + chatbot */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Continue reading */}
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Recently accessed</CardTitle>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary/5"
                  onClick={() => router.push('/viewer/history')}
                >
                  View history
                </Button>
              </div>

              <CardDescription className="text-muted-foreground">
                Continue from your recent articles and conversations.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {continueLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="border-border rounded-xl border p-4">
                    <div className="bg-muted mb-2 h-4 w-3/4 animate-pulse rounded" />
                    <div className="bg-muted h-3 w-1/3 animate-pulse rounded" />
                  </div>
                ))
              ) : continueReading.length > 0 ? (
                continueReading.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      item.type === 'ARTICLE'
                        ? router.push(`/viewer/articles/${item.id}`)
                        : router.push(`/widget?session=${item.id}`)
                    }
                    className="border-border bg-background hover:border-primary/30 hover:bg-accent/40 flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {item.type === 'ARTICLE' ? (
                          <FileText className="text-primary h-4 w-4" />
                        ) : (
                          <Bot className="text-primary h-4 w-4" />
                        )}

                        <p className="text-foreground font-medium">{item.title}</p>
                      </div>

                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        {item.timeLabel}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-primary hover:bg-primary/5"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <BookOpen className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
                  <p className="text-foreground font-medium">No recent activity</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Start reading articles or chatting with the assistant.
                  </p>

                  <Button className="mt-4" onClick={() => router.push('/viewer/articles')}>
                    Browse articles
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chatbot */}
          {/* AI assistant preview */}
          <Card className="border-border from-accent via-background to-primary/5 h-full bg-gradient-to-br">
            <CardHeader className="space-y-4">
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                <Bot className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <CardTitle className="text-foreground text-2xl">HMIS AI assistant</CardTitle>

                <CardDescription className="text-muted-foreground text-base">
                  Ask questions about HMIS workflows, troubleshooting, user guides, and clinical
                  processes. The floating assistant in the bottom-right corner is available on this
                  page.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button className="w-full" size="lg" onClick={() => router.push('/widget')}>
                Open full assistant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="border-border bg-card rounded-xl border p-4">
                <p className="text-foreground mb-3 text-sm font-semibold">Try asking</p>

                <div className="space-y-2">
                  {[
                    'How do I register a new patient?',
                    'How do I reset a user password?',
                    'What is the laboratory result workflow?',
                  ].map((question) => (
                    <div key={question} className="border-border rounded-lg border p-3 text-sm">
                      {question}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      {/* Floating AI assistant */}
      <ChatWidget />
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="badge border-border bg-accent text-primary">
      <span className="badge-dot bg-primary" />
      {label}
    </span>
  );
}
