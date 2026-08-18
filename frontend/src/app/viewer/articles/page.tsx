'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Search,
  Clock,
  Eye,
  Star,
  ArrowRight,
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: string;
  product: string | null;
  views: number;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  publishedAt: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  author?: {
    id: string;
    name: string;
  };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

type Category = {
  id: string;
  name: string;
};

function formatDate(date: string | null) {
  if (!date) return 'Draft';
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '');
}

export default function ViewerArticlesPage() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState<Category[]>([]);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get('/articles', {
        params: {
          page,
          limit: 9,
          search: search || undefined,
          category: category === 'all' ? undefined : category,
          type: type === 'all' ? undefined : type,
          sortBy,
          order,
        },
      });

      setArticles(data.articles || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch articles', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, type, sortBy, order]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchArticles();
  };

  const openArticle = (id: string) => {
    router.push(`/viewer/articles/${id}`);
  };

  return (
    <div className="bg-background min-h-screen">
      {' '}
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6 lg:px-8">
        {' '}
        <div className="space-y-2">
          {' '}
          <h1 className="text-foreground text-3xl font-bold">Knowledge base articles </h1>{' '}
          <p className="text-muted-foreground">
            Browse published HMIS guides, SOPs, troubleshooting articles, and documentation.{' '}
          </p>{' '}
        </div>
        <Card>
          <CardContent className="p-5">
            <div className="grid gap-4 lg:grid-cols-5">
              <div className="relative lg:col-span-2">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search articles..."
                  className="pl-11"
                />
              </div>
              <div>
                <Label className="mb-2">Categories</Label>
                <Select
                  value={category}
                  onValueChange={(value) => {
                    if (value === null) {
                      return;
                    }
                    setCategory(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>

                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2"> Types</Label>
                <Select
                  value={type}
                  onValueChange={(value) => {
                    if (value === null) {
                      return;
                    }
                    setType(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="HOW_TO">How-to</SelectItem>
                    <SelectItem value="FAQ">FAQ</SelectItem>
                    <SelectItem value="SOP">SOP</SelectItem>
                    <SelectItem value="TROUBLESHOOTING">Troubleshooting</SelectItem>
                    <SelectItem value="FEATURE_REFERENCE">Feature reference</SelectItem>
                    <SelectItem value="RELEASE_NOTES">Release notes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSearch}>
                <Filter className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="text-muted-foreground text-sm">
                {pagination ? `${pagination.total} articles found` : 'Loading articles...'}
              </div>

              <Select
                value={sortBy}
                onValueChange={(value) => {
                  if (value === null) {
                    return;
                  }
                  setSortBy(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt">Recently updated</SelectItem>
                  <SelectItem value="publishedAt">Recently published</SelectItem>
                  <SelectItem value="views">Most viewed</SelectItem>
                  <SelectItem value="avgRating">Highest rated</SelectItem>
                  <SelectItem value="title">Title (A–Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />
                  <div className="bg-muted mt-4 h-4 w-full animate-pulse rounded" />
                  <div className="bg-muted mt-2 h-4 w-5/6 animate-pulse rounded" />
                  <div className="bg-muted mt-6 h-4 w-1/2 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="text-foreground text-xl font-semibold">No articles found</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Try adjusting your search terms or filters to find the documentation you're looking
                for.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
                onClick={() => openArticle(article.id)}
              >
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                      {article.category?.name || 'General'}
                    </span>

                    <span className="text-muted-foreground text-xs">{article.type}</span>
                  </div>

                  <h3 className="text-foreground line-clamp-2 text-xl font-semibold">
                    {article.title}
                  </h3>

                  <p className="text-muted-foreground mt-3 line-clamp-3 flex-1 text-sm">
                    {stripHtml(article.content)}
                  </p>

                  <div className="text-muted-foreground mt-6 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {article.views}
                      </div>

                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {article.reviewCount > 0 ? (
                          <span>
                            {article.avgRating.toFixed(1)} ({article.reviewCount})
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No ratings</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(article.publishedAt || article.createdAt)}
                    </div>
                  </div>

                  <Button className="mt-6 w-full">
                    Read article
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-6">
            <Button
              variant="outline"
              disabled={!pagination.hasPrevious}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="text-muted-foreground text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </div>

            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
