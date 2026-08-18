'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  FiPlus,
  FiEdit,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiStar,
  FiFileText,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Eye, Archive, Trash2 } from 'lucide-react';

type Category = {
  id: string;
  name: string;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'IN_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'PUBLISHED'
    | 'ARCHIVED'
    | 'DELETED';
  updatedAt: string;
  createdAt: string;
  views: number;
  avgRating: number | null;
  reviewCount: number;
  category?: Category | null;
  tags?: { name: string }[];
};

type Feedback = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: { name: string };
};

type DashboardData = {
  editor: {
    id: string;
    name?: string;
    email?: string;
  };
  stats: {
    published: number;
    inReview: number;
    total: number;
    views: number;
    avgRating: number;
  };
  articles: Article[];
  feedbacks: Feedback[];
};

export default function EditorArticles() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const statusOptions = [
    { value: 'All Statuses', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'ARCHIVED', label: 'Archived' },
    { value: 'DELETED', label: 'Deleted' },
  ];
  const statusTabs = [
    { value: 'All Statuses', label: 'All' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'ARCHIVED', label: 'Archived' },
    { value: 'DELETED', label: 'Deleted' },
  ];

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      DRAFT: 'badge badge-draft',
      SUBMITTED: 'badge badge-submitted',
      IN_REVIEW: 'badge badge-in-review',
      APPROVED: 'badge badge-approved',
      PUBLISHED: 'badge badge-published',
      REJECTED: 'badge badge-rejected',
      ARCHIVED: 'badge badge-archived',
      DELETED: 'badge badge-deleted',
    };

    return map[status] ?? 'badge';
  };

  const fetchEditorArticles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/articles/editor/dashboard');
      setDashboard(response.data);
      setArticles(response.data.articles || []);
    } catch (error: any) {
      console.error('Failed to load editor articles:', error);
      setError(error?.response?.data?.message || 'Failed to load articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditorArticles();
  }, []);

  const getStatusCount = (status: string) => {
    if (status === 'All Statuses') return articles.length;

    return articles.filter((article) => article.status === status).length;
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All Statuses' || article.status === selectedStatus;

    const matchesCategory =
      selectedCategory === 'All Categories' || article.category?.name === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedStatus, selectedCategory]);

  const categories: Category[] = Array.from(
    new Map(
      articles
        .filter(
          (article): article is Article & { category: Category } =>
            article.category !== null && article.category !== undefined,
        )
        .map((article) => [article.category.id, article.category]),
    ).values(),
  );

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / limit));
  const paginatedArticles = filteredArticles.slice((page - 1) * limit, page * limit);
  const startItem = filteredArticles.length === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, filteredArticles.length);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('All Statuses');
    setSelectedCategory('All Categories');
    setPage(1);
  };

  const formatRelativeDate = (dateString: string): { relative: string; full: string } => {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relative: string;

    if (diffMinutes < 1) {
      relative = 'Just now';
    } else if (diffMinutes < 60) {
      relative = `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      relative = `${diffHours}h ago`;
    } else if (diffDays < 7) {
      relative = `${diffDays}d ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      relative = weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      relative = months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      relative = years === 1 ? '1 year ago' : `${years} years ago`;
    }

    const full = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return { relative, full };
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      PUBLISHED: <FiCheckCircle className="h-3.5 w-3.5" />,
      SUBMITTED: <FiClock className="h-3.5 w-3.5" />,
      IN_REVIEW: <FiClock className="h-3.5 w-3.5" />,
      APPROVED: <FiCheckCircle className="h-3.5 w-3.5" />,
      REJECTED: <FiAlertCircle className="h-3.5 w-3.5" />,
      DRAFT: <FiEdit className="h-3.5 w-3.5" />,
      ARCHIVED: <FiFileText className="h-3.5 w-3.5" />,
      DELETED: <FiAlertCircle className="h-3.5 w-3.5" />,
    };
    return icons[status] || <FiFileText className="h-3.5 w-3.5" />;
  };

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-muted-FOREGROUND text-xs">No ratings</span>;
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`h-3.5 w-3.5 ${i < fullStars ? 'fill-amber-400 text-amber-400' : 'text-muted-FOREGROUND'}`}
        />,
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center">
        <div className="relative">
          <div className="border-t-primary h-16 w-16 animate-spin rounded-full border-4 border-blue-100"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary h-8 w-8 animate-pulse rounded-full"></div>
          </div>
        </div>
        <p className="text-muted-foreground mt-6 font-medium">Loading your articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
            <FiAlertCircle className="h-8 w-8 text-rose-500" />
          </div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">Failed to load articles</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="min-h-screen">
      <div>
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold">My Articles</h1>
            <p className="text-muted-foreground text-sm">
              Manage your clinical publications, drafts, and review cycles.
            </p>
          </div>
          <Button onClick={() => router.push('/editor/articles/new')} className="shadow-sm">
            <FiPlus className="mr-2 h-4 w-4" />
            New article
          </Button>
        </div>

        {/* Filters Section */}

        <Card className="mb-6">
          <CardContent className="p-4">
            {/* Status Tabs */}
            <div className="border-border mb-5 flex items-center gap-1 overflow-x-auto border-b pb-4">
              {statusTabs.map((tab) => {
                const count = getStatusCount(tab.value);
                const isActive = selectedStatus === tab.value;

                return (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setSelectedStatus(tab.value);
                      setPage(1);
                    }}
                    className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`ml-1.5 ${isActive ? 'text-accent-FOREGROUND' : 'text-muted-FOREGROUND'}`}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search and Select Filters */}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {/* Search */}
              <div className="relative">
                <FiSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by title or slug..."
                  className="pl-10"
                />
              </div>

              {/* Status Select */}
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value ?? 'All Statuses');
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Statuses">All Statuses</SelectItem>

                  {statusOptions
                    .filter((o) => o.value !== 'All Statuses')
                    .map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Category Select */}
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value ?? 'All Categories');
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="All Categories">All Categories</SelectItem>

                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results Summary */}

            <div className="text-muted-foreground mt-4 flex items-center justify-between text-sm">
              <span>
                Showing{' '}
                <span className="text-foreground font-semibold">{filteredArticles.length}</span>{' '}
                articles
              </span>

              {(searchTerm ||
                selectedStatus !== 'All Statuses' ||
                selectedCategory !== 'All Categories') && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <FiX className="mr-1 h-4 w-4" />
                  Clear filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Articles Table */}
        <Card className="overflow-hidden rounded-2xl">
          {/* Table Header */}
          <CardHeader>
            <CardTitle>All articles</CardTitle>
            <CardDescription>Manage your clinical knowledge base articles</CardDescription>
          </CardHeader>

          {/* Table */}
          <CardContent className="overflow-x-auto p-0">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-border divide-y">
                {paginatedArticles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FiFileText className="text-muted-foreground h-12 w-12" />
                        <div>
                          <p className="text-foreground font-medium">No articles found</p>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {searchTerm ||
                            selectedStatus !== 'All Statuses' ||
                            selectedCategory !== 'All Categories'
                              ? 'Try adjusting your filters'
                              : 'Start by creating your first article'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedArticles.map((article) => (
                    <TableRow key={article.id} className="hover:bg-muted/40">
                      {/* Title & Slug */}
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="text-foreground line-clamp-1 font-medium">
                            {article.title}
                          </p>
                          <p className="text-muted-foreground text-xs">{article.slug}</p>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-muted-foreground text-sm">
                          {article.category?.name || 'Uncategorized'}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span className={getStatusBadge(article.status)}>
                          {getStatusIcon(article.status)}
                          {formatStatus(article.status)}
                        </span>
                      </TableCell>

                      {/* Engagement */}
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1">
                          <div className="text-muted-foreground flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1">
                              <FiEye className="h-3 w-3" />
                              {article.views || 0}
                            </span>

                            {article.reviewCount > 0 && (
                              <>
                                <span>|</span>
                                <span className="flex items-center gap-1">
                                  <span className="flex">{renderStars(article.avgRating)}</span>
                                  <span>({article.reviewCount})</span>
                                </span>
                              </>
                            )}
                          </div>

                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {article.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag.name}
                                  className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
                                >
                                  {tag.name}
                                </span>
                              ))}

                              {article.tags.length > 3 && (
                                <span className="text-muted-foreground text-xs">
                                  +{article.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Updated */}
                      <TableCell className="hidden xl:table-cell">
                        {(() => {
                          const updated = formatRelativeDate(article.updatedAt);

                          return (
                            <div className="text-muted-foreground text-sm">
                              <div className="text-foreground text-xs font-medium">
                                {updated.relative}
                              </div>
                              <div className="text-xs">{updated.full}</div>
                            </div>
                          );
                        })()}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Open article actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/editor/articles/${article.id}`)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit article
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => router.push(`/articles/${article.slug}`)}
                            >
                              <Eye className="h-4 w-4" />
                              View article
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => {
                                // archive action
                              }}
                            >
                              <Archive className="h-4 w-4" />
                              Archive article
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                // delete action
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete article
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination */}
          <div className="border-border bg-accent flex flex-col gap-4 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-muted-foreground text-sm">
              Showing <span className="font-semibold">{startItem}</span> to{' '}
              <span className="font-semibold">{endItem}</span> of{' '}
              <span className="font-semibold">{filteredArticles.length}</span> articles
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <FiChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNumber: number;
                if (totalPages <= 7) {
                  pageNumber = i + 1;
                } else if (page <= 4) {
                  pageNumber = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNumber = totalPages - 6 + i;
                } else {
                  pageNumber = page - 3 + i;
                }
                return (
                  <Button
                    key={pageNumber}
                    variant={page === pageNumber ? 'default' : 'outline'}
                    size="icon-sm"
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
              >
                <FiChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>Items per page:</span>
              <span className="border-border bg-card text-foreground rounded border px-2 py-1 font-medium">
                {limit}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
