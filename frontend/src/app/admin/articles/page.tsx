'use client';

interface Category {
  id: string;
  name: string;
}

interface Author {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: string;
  status: string;
  product: string;

  views: number;
  avgRating: number;
  reviewCount: number;

  updatedAt: string;

  category: Category;
  author: Author;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ArticleResponse {
  articles: Article[];
  pagination: Pagination;
}

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  SlidersHorizontal,
  Star,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  BookOpenCheck,
  Clock3,
  Eye,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { MoreHorizontal, Pencil, Archive, Trash2 } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function Articles() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });

  const ArticleStatus = [
    'DRAFT',
    'SUBMITTED',
    'IN_REVIEW',
    'APPROVED',
    'REJECTED',
    'PUBLISHED',
    'ARCHIVED',
    'DELETED',
  ];
  const ARTICLE_TYPES = [
    'HOW_TO',
    'SOP',
    'FAQ',
    'TROUBLESHOOTING',
    'FEATURE_REFERENCE',
    'RELEASE_NOTES',
  ];

  const reviews1 = [
    { icon: CircleCheckBig, number: 34, name: 'Live articles' },
    { icon: CircleCheckBig, number: '08', name: 'Pending Review' },
    { icon: CircleCheckBig, number: '14.2k', name: 'Total Reads (30d)' },
  ];
  const fetchArticles = async () => {
    try {
      const res = await api.get<ArticleResponse>('/articles', {
        params: {
          page,
          limit,
          search,
          status: selectedStatus,
          category: selectedCategory,
          type: selectedType,
        },
      });

      setArticles(res.data.articles);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, limit, search, selectedStatus, selectedCategory, selectedType]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedStatus, selectedCategory, selectedType]);
  /* fetch Categories */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategories();
  }, []);
  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;

  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  const pageNumbers = Array.from({ length: pagination.totalPages }, (_, i) => i + 1);
  const resetFilters = () => {
    setSearch('');
    setSelectedStatus('');
    setSelectedCategory('');
    setSelectedType('');
    setPage(1);
  };
  const articleDetails = [
    { key: 'title', label: 'Title & Slug' },
    { key: 'category', label: 'Category' },
    { key: 'author', label: 'Author' },
    { key: 'status', label: 'Status' },
    { key: 'engagement', label: 'Engagement' },
    { key: 'updated', label: 'Last Updated' },
    { key: 'actions', label: 'Actions' },
  ];
  const reviews = [
    {
      icon: BookOpenCheck,
      number: articles.filter((a) => a.status === 'PUBLISHED').length,
      name: 'Live Articles',
      comment: 'Currently published and available to viewers',
      iconBg: 'bg-[var(--success-bg)]',
      iconColor: 'text-[var(--success)]',
    },
    {
      icon: Clock3,
      number: articles.filter(
        (a) => a.status === 'SUBMITTED' || a.status === 'IN_REVIEW' || a.status === 'APPROVED',
      ).length,
      name: 'Pending Review',
      comment: 'Awaiting editorial review, approval, or publication',
      iconBg: 'bg-[var(--warning-bg)]',
      iconColor: 'text-[var(--warning)]',
    },
    {
      icon: Eye,
      number: articles.reduce((sum, article) => sum + article.views, 0),
      name: 'Total Reads',
      comment: 'Lifetime article views across the knowledge base',
      iconBg: 'bg-[var(--info-bg)]',
      iconColor: 'text-[var(--info)]',
    },
  ];

  const statusStyles: Record<string, string> = {
    DRAFT: 'badge badge-draft',
    SUBMITTED: 'badge badge-submitted',
    IN_REVIEW: 'badge badge-in-review',
    APPROVED: 'badge badge-approved',
    PUBLISHED: 'badge badge-published',
    REJECTED: 'badge badge-rejected',
    ARCHIVED: 'badge badge-archived',
    DELETED: 'badge badge-deleted',
  };

  const formatRelativeDate = (dateString: string): { relative: string; full: string } => {
    const date = new Date(dateString);
    const now = new Date();

    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let relative: string;

    if (diffInSeconds < 60) {
      relative = 'Just now';
    } else {
      const diffInMinutes = Math.floor(diffInSeconds / 60);

      if (diffInMinutes < 60) {
        relative = `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
      } else {
        const diffInHours = Math.floor(diffInMinutes / 60);

        if (diffInHours < 24) {
          relative = `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
        } else {
          const diffInDays = Math.floor(diffInHours / 24);

          if (diffInDays < 7) {
            relative = `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
          } else {
            const diffInWeeks = Math.floor(diffInDays / 7);

            if (diffInWeeks < 4) {
              relative = `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
            } else {
              const diffInMonths = Math.floor(diffInDays / 30);

              if (diffInMonths < 12) {
                relative = `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
              } else {
                const diffInYears = Math.floor(diffInDays / 365);
                relative = `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
              }
            }
          }
        }
      }
    }

    const full = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return { relative, full };
  };

  const handleArchive = async (articleId: string) => {
    const confirmed = window.confirm('Are you sure you want to archive this article?');

    if (!confirmed) return;

    try {
      await api.put(`/articles/${articleId}/archive`);

      // Refresh the table
      fetchArticles();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to archive article.');
    }
  };

  const handleDelete = async (articleId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this article? This action cannot be undone.',
    );

    if (!confirmed) return;

    try {
      await api.delete(`/articles/${articleId}`);

      // Refresh the table
      fetchArticles();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to delete article.');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full min-w-0">
        {/* header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-lg font-bold">Knowledge Base Articles</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage articles, documentation, SOPs, FAQs, and troubleshooting guides.
            </p>
          </div>

          <Button>
            <Link href="/admin/articles/create" className="flex items-center gap-2">
              <Plus size={18} />
              Create Article
            </Link>
          </Button>
        </div>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>

          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 transition hover:bg-blue-200"
          >
            <SlidersHorizontal size={18} />

            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>
        {/* filters */}
        {showFilters && (
          <section className="card border-border bg-gradient-to-br from-white to-slate-50">
            <div className="flex justify-between">
              {/* Search */}
              <div className="flex flex-col gap-2 lg:col-span-2">
                <Label htmlFor="search" className="text-sm font-medium text-slate-700">
                  Search title or slug
                </Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search title or slug..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className=""
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-700">Status</Label>
                <Select
                  value={selectedStatus || null}
                  onValueChange={(value) => setSelectedStatus(value ?? '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__" disabled>
                      All statuses
                    </SelectItem>
                    {ArticleStatus.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item.replaceAll('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categories */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-700">Category</Label>
                <Select
                  value={selectedCategory || null}
                  onValueChange={(value) => setSelectedCategory(value ?? '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__" disabled>
                      All categories
                    </SelectItem>
                    {categories.map((item) => (
                      <SelectItem key={item.id} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Types */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-700">Article type</Label>
                <Select
                  value={selectedType || null}
                  onValueChange={(value) => setSelectedType(value ?? '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__" disabled>
                      All types
                    </SelectItem>
                    {ARTICLE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replaceAll('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset button aligned with inputs */}
              <div className="flex flex-col justify-end">
                <Button variant="outline" onClick={resetFilters} className="">
                  Reset
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* table */}
        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableCaption className="sr-only">Knowledge base articles</TableCaption>

              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  {articleDetails.map((column) => (
                    <TableHead
                      key={column.key}
                      className="border-b border-gray-200 px-6 py-4 text-left text-xs font-semibold text-gray-700"
                    >
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {articles.length > 0 ? (
                  articles.map((article) => (
                    <TableRow key={article.id}>
                      {/* Title & Slug */}
                      <TableCell className="w-[24%] max-w-[260px]">
                        <div className="min-w-0">
                          <p className="text-foreground line-clamp-2 text-xs leading-5 font-semibold">
                            {article.title}
                          </p>
                          <p className="text-muted-foreground mt-1 truncate text-xs">
                            {article.slug}
                          </p>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <span className="text-muted-foreground text-xs">
                          {article.category?.name || 'Uncategorized'}
                        </span>
                      </TableCell>

                      {/* Author */}
                      <TableCell>
                        <div>
                          <p className="text-foreground text-xs font-medium">
                            {article.author?.name || 'Unknown'}
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {article.author?.email}
                          </p>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span className={statusStyles[article.status] || 'badge badge-draft'}>
                          <span className="badge-dot bg-current text-sm" />
                          {article.status.replaceAll('_', ' ')}
                        </span>
                      </TableCell>

                      {/* Engagement */}
                      <TableCell>
                        <div>
                          <p className="text-foreground text-xs font-medium">
                            {article.views.toLocaleString()} views
                          </p>

                          <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                            <Star
                              size={14}
                              fill={article.reviewCount > 0 ? 'currentColor' : 'none'}
                              className={
                                article.reviewCount > 0
                                  ? 'text-yellow-500'
                                  : 'text-muted-foreground'
                              }
                            />

                            {article.reviewCount > 0 ? (
                              <>
                                <span className="text-foreground font-medium">
                                  {article.avgRating.toFixed(1)}
                                </span>
                                <span>({article.reviewCount})</span>
                              </>
                            ) : (
                              <span>No ratings</span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Last Updated */}
                      <TableCell>
                        {(() => {
                          const updated = formatRelativeDate(article.updatedAt);

                          return (
                            <div className="text-muted-foreground text-xs">
                              <div className="text-foreground font-medium">{updated.relative}</div>
                              <div className="mt-0.5">{updated.full}</div>
                            </div>
                          );
                        })()}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                            aria-label="Open actions menu"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="bg-card border-border w-52 rounded-xl border shadow-lg"
                          >
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/articles/${article.id}`)}
                              className="flex cursor-pointer items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View article
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/articles/${article.id}/edit`)}
                              className="flex cursor-pointer items-center gap-2"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit article
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleArchive(article.id)}
                              className="flex cursor-pointer items-center gap-2"
                            >
                              <Archive className="h-4 w-4" />
                              Archive
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleDelete(article.id)}
                              className="text-destructive focus:bg-destructive/10 flex cursor-pointer items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete article
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground h-32 text-center">
                      No articles found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="border-border bg-background flex flex-col gap-4 border-t px-6 py-4 md:flex-row md:items-center md:justify-between">
            {/* Results Info */}
            <div className="text-muted-foreground text-sm">
              Showing <span className="text-foreground font-semibold">{startItem}</span> to{' '}
              <span className="text-foreground font-semibold">{endItem}</span> of{' '}
              <span className="text-foreground font-semibold">{pagination.total}</span> articles
            </div>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrevious}
                onClick={() => setPage((prev) => prev - 1)}
                className="border-border hover:bg-muted flex h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                    page === pageNumber
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                disabled={!pagination.hasNext}
                onClick={() => setPage((prev) => prev + 1)}
                className="border-border hover:bg-muted flex h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Items Per Page */}
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>Items per page</span>

              <span className="bg-muted text-foreground rounded-md px-2.5 py-1 font-medium">
                {pagination.limit}
              </span>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {reviews.map((review, index) => (
            <Card key={index} className="border-border bg-card shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`rounded-xl p-3 ${review.iconBg}`}>
                    <review.icon className={review.iconColor} size={22} strokeWidth={2} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-muted-foreground text-sm font-medium">{review.name}</p>

                    <h2 className="text-foreground mt-1 text-3xl font-bold tracking-tight">
                      {review.number.toLocaleString()}
                    </h2>

                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
