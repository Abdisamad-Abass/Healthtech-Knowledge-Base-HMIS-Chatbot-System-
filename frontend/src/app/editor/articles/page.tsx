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
  FiFilter,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

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
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
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
    { value: 'all', label: 'All' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'ARCHIVED', label: 'Archived' },
    { value: 'DELETED', label: 'Deleted' },
  ];

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
    if (status === 'all') return articles.length;

    return articles.filter((article) => article.status === status).length;
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || article.status === selectedStatus;

    const matchesCategory =
      selectedCategory === 'all' || article.category?.name === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(
    new Map(
      articles
        .filter((article) => article.category)
        .map((article) => [article.category!.id, article.category!]),
    ).values(),
  );

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / limit));
  const paginatedArticles = filteredArticles.slice((page - 1) * limit, page * limit);
  const startItem = filteredArticles.length === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, filteredArticles.length);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedCategory('all');
    setPage(1);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const updatedDate = new Date(date);
    const difference = now.getTime() - updatedDate.getTime();
    const minutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
  };

  const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
      IN_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
      APPROVED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
      DRAFT: 'bg-gray-50 text-gray-600 border-gray-200',
      ARCHIVED: 'bg-purple-50 text-purple-700 border-purple-200',
      DELETED: 'bg-red-50 text-red-700 border-red-200',
    };
    return styles[status] || styles.DRAFT;
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
    if (!rating) return <span className="text-xs text-gray-400">No ratings</span>;
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`h-3.5 w-3.5 ${i < fullStars ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
        />,
      );
    }
    return stars;
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getEditorName = () => {
    const name = dashboard?.editor?.name?.trim();
    if (name) return name.split(' ')[0];
    return dashboard?.editor?.email?.split('@')[0] || 'Editor';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Welcome back';
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-blue-600"></div>
          </div>
        </div>
        <p className="mt-6 font-medium text-gray-500">Loading your articles...</p>
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
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Failed to load articles</h3>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold">My Articles</h1>
            <p className="text-gray-500">
              Manage your clinical publications, drafts, and review cycles.
            </p>
          </div>
          <button
            onClick={() => router.push('/editor/articles/new')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          >
            <FiPlus className="h-4 w-4" />
            <span className="font-medium">New Article</span>
          </button>
        </div>

        {/* Filters Section */}

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          {/* Status Tabs */}

          <div className="mb-5 flex items-center gap-1 overflow-x-auto border-b border-gray-100 pb-4">
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
                  className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
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
              <FiSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Search by title or slug..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-9 text-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Categories</option>

              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Results Summary */}

          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing <span className="font-semibold text-gray-700">{filteredArticles.length}</span>{' '}
              articles
            </span>

            {(searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all') && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-gray-500 transition hover:text-blue-600"
              >
                <FiX className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Articles Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Table Header */}
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">All Articles</h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Article
                  </th>
                  <th className="hidden px-6 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase sm:table-cell">
                    Category
                  </th>
                  <th className="hidden px-6 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase md:table-cell">
                    Status
                  </th>
                  <th className="hidden px-6 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase lg:table-cell">
                    Engagement
                  </th>
                  <th className="hidden px-6 py-3.5 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase xl:table-cell">
                    Updated
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedArticles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FiFileText className="h-12 w-12 text-gray-300" />
                        <p className="font-medium text-gray-500">No articles found</p>
                        <p className="text-sm text-gray-400">
                          {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Start by creating your first article'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedArticles.map((article) => (
                    <tr key={article.id} className="group transition-colors hover:bg-gray-50/50">
                      {/* Title & Slug */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="line-clamp-1 font-medium text-gray-800 transition group-hover:text-blue-600">
                            {article.title}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">{article.slug}</p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="hidden px-6 py-4 sm:table-cell">
                        <span className="text-sm text-gray-600">
                          {article.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="hidden px-6 py-4 md:table-cell">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyles(
                            article.status,
                          )}`}
                        >
                          {getStatusIcon(article.status)}
                          {formatStatus(article.status)}
                        </span>
                      </td>

                      {/* Engagement */}
                      <td className="hidden px-6 py-4 lg:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FiEye className="h-3 w-3" />
                              {article.views || 0}
                            </span>
                            {article.reviewCount > 0 && (
                              <>
                                <span className="text-gray-300">|</span>
                                <span className="flex items-center gap-1">
                                  <span className="flex">{renderStars(article.avgRating)}</span>
                                  <span className="text-gray-400">({article.reviewCount})</span>
                                </span>
                              </>
                            )}
                          </div>
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {article.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag.name}
                                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                                >
                                  {tag.name}
                                </span>
                              ))}
                              {article.tags.length > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{article.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Updated */}
                      <td className="hidden px-6 py-4 xl:table-cell">
                        <div className="text-sm text-gray-500">
                          <div>{getTimeAgo(article.updatedAt)}</div>
                          <div className="text-xs text-gray-400">
                            {formatDate(article.updatedAt)}
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/editor/articles/${article.id}`)}
                            className="rounded-lg bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-600 transition group-hover:shadow-sm hover:bg-blue-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => router.push(`/articles/${article.slug}`)}
                            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{startItem}</span> to{' '}
              <span className="font-semibold">{endItem}</span> of{' '}
              <span className="font-semibold">{filteredArticles.length}</span> articles
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>

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
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                      page === pageNumber
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Items per page:</span>
              <span className="rounded border border-gray-200 bg-white px-2 py-1 font-medium text-gray-700">
                {limit}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
