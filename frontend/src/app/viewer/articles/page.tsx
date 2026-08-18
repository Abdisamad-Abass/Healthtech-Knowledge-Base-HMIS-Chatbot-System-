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
    <div className="bg-background min-h-screen w-full overflow-x-hidden">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-3 py-5 sm:space-y-7 sm:px-5 sm:py-6 md:space-y-8 md:px-6 md:py-8 lg:px-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-foreground text-2xl leading-tight font-bold sm:text-3xl">
            Knowledge base articles
          </h1>

          <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base">
            Browse published HMIS guides, SOPs, troubleshooting articles, and documentation.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="w-full">
          <CardContent className="p-3 sm:p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              {/* Search */}
              <div className="relative min-w-0 lg:col-span-2">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search articles..."
                  className="h-11 w-full pl-11"
                />
              </div>

              {/* Categories */}
              <div className="min-w-0">
                <Label className="mb-2 block">Categories</Label>

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
                  <SelectTrigger className="h-11 w-full">
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

              {/* Types */}
              <div className="min-w-0">
                <Label className="mb-2 block">Types</Label>

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
                  <SelectTrigger className="h-11 w-full">
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

              {/* Search Button */}
              <div className="flex items-end">
                <Button onClick={handleSearch} className="h-11 w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>

            {/* Results + Sort */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                <SelectTrigger className="h-10 w-full sm:w-48">
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

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="min-w-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />

                  <div className="bg-muted mt-4 h-4 w-full animate-pulse rounded" />

                  <div className="bg-muted mt-2 h-4 w-5/6 animate-pulse rounded" />

                  <div className="bg-muted mt-6 h-4 w-1/2 animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length === 0 ? (
          /* Empty State */
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center px-4 py-12 text-center sm:py-16">
              <FileText className="text-muted-foreground mb-4 h-10 w-10 sm:h-12 sm:w-12" />

              <h3 className="text-foreground text-lg font-semibold sm:text-xl">
                No articles found
              </h3>

              <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
                Try adjusting your search terms or filters to find the documentation you're looking
                for.
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Articles */
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="group min-w-0 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
                onClick={() => openArticle(article.id)}
              >
                <CardContent className="flex h-full min-w-0 flex-col p-4 sm:p-5 md:p-6">
                  {/* Category + Type */}
                  <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
                    <span className="bg-primary/10 text-primary max-w-[65%] truncate rounded-full px-3 py-1 text-xs font-medium">
                      {article.category?.name || 'General'}
                    </span>

                    <span className="text-muted-foreground max-w-[35%] truncate text-right text-xs">
                      {article.type}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-foreground line-clamp-2 text-lg font-semibold break-words sm:text-xl">
                    {article.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground mt-3 line-clamp-3 flex-1 text-sm leading-6 break-words">
                    {stripHtml(article.content)}
                  </p>

                  {/* Metadata */}
                  <div className="text-muted-foreground mt-5 flex flex-col gap-3 text-sm sm:mt-6">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
                      {/* Views */}
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 shrink-0" />
                        <span>{article.views}</span>
                      </div>

                      {/* Rating */}
                      <div className="flex min-w-0 items-center gap-1">
                        <Star className="h-4 w-4 shrink-0 fill-yellow-400 text-yellow-400" />

                        {article.reviewCount > 0 ? (
                          <span className="truncate">
                            {article.avgRating.toFixed(1)} ({article.reviewCount})
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No ratings</span>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 shrink-0" />

                      <span className="truncate">
                        {formatDate(article.publishedAt || article.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Read Button */}
                  <Button className="mt-5 h-11 w-full sm:mt-6">
                    Read article
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
            {/* Previous */}
            <Button
              variant="outline"
              disabled={!pagination.hasPrevious}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {/* Page */}
            <div className="text-muted-foreground order-first text-center text-sm sm:order-none">
              Page {pagination.page} of {pagination.totalPages}
            </div>

            {/* Next */}
            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="w-full sm:w-auto"
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
