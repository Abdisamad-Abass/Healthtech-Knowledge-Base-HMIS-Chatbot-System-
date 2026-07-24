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
  role: string;
  articles: Article[];
  pagination: Pagination;
}

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { SlidersHorizontal, Star, ChevronLeft, ChevronRight, CircleCheckBig } from 'lucide-react';
import Link from 'next/link';

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [role, setRole] = useState('');
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

      setRole(res.data.role);
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
      icon: CircleCheckBig,
      number: articles.filter((a) => a.status === 'PUBLISHED').length,
      name: 'Live Articles',
    },
    {
      icon: CircleCheckBig,
      number: articles.filter(
        (a) => a.status === 'SUBMITTED' || a.status === 'IN_REVIEW' || a.status === 'APPROVED',
      ).length,
      name: 'Pending Review',
    },
    {
      icon: CircleCheckBig,
      number: articles.reduce((sum, article) => sum + article.views, 0),
      name: 'Total Reads',
    },
  ];

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);

    if (diffInWeeks < 4) {
      return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);

    const formattedDate = date.toLocaleDateString();

    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago · ${formattedDate}`;
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Knowledge Base</h1>

          <div className="">
            <button className="rounded-full bg-blue-600 px-5 py-2 text-white">Role: {role}</button>
            {role === 'EDITOR' || role === 'ADMIN' ? (
              <Link
                href="/admin/articles/create"
                className="mb-6 ml-2 inline-block rounded-xl bg-green-600 px-6 py-3 text-white"
              >
                + Create Article
              </Link>
            ) : null}
          </div>
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
          <section className="card">
            <div className="flex items-center justify-between gap-2">
              {/* Search */}
              <div className="flex flex-col gap-2">
                <label>Search Title/Slug</label>
                <input
                  type="text"
                  placeholder="Search title or slug..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border px-2 py-1"
                />
              </div>
              {/* Status */}
              <div className="flex flex-col gap-2">
                <label>Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:border-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">All Statuses</option>
                  {ArticleStatus.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              {/* Categories */}
              <div className="flex flex-col gap-2">
                <label>Categories</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-1 outline-none focus:border-none focus:border-blue-600 focus:ring-2 focus:ring-blue-700"
                >
                  <option value="">All Categories</option>
                  {categories.map((item, index) => (
                    <option key={index} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* types */}
              <div className="flex flex-col gap-2">
                <label>Types</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="rounded-lg border border-gray-400 px-4 py-1 outline-none focus:border-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-700"
                >
                  <option value="">All Types</option>
                  {ARTICLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              {/* Reset */}
              <div className="flex items-center gap-2">
                <button
                  onClick={resetFilters}
                  className="rounded-lg bg-gray-500 px-4 py-1 font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          </section>
        )}
        {/* table */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  {articleDetails.map((column) => (
                    <th
                      key={column.key}
                      className="border-b border-gray-200 px-6 py-4 text-left text-sm font-semibold text-gray-700"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {articles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b border-gray-200 transition hover:bg-blue-50"
                  >
                    {/* Title & Slug */}
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{article.title}</h3>
                        <p className="text-xs text-gray-500">{article.slug}</p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">{article.category?.name}</td>

                    {/* Author */}
                    <td className="px-6 py-4">{article.author?.name}</td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        {article.status}
                      </span>
                    </td>

                    {/* Engagement */}
                    <td className="px-6 py-4">
                      <div>{article.views} Views</div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star
                          size={16}
                          fill={article.reviewCount > 0 ? 'currentColor' : 'none'}
                          className={article.reviewCount > 0 ? 'text-yellow-500' : 'text-gray-300'}
                        />

                        {article.reviewCount > 0 ? (
                          <>
                            <span className="font-medium">{article.avgRating.toFixed(1)}</span>

                            <span className="text-gray-500">({article.reviewCount})</span>
                          </>
                        ) : (
                          <span className="text-gray-400">No ratings</span>
                        )}
                      </div>
                    </td>

                    {/* Last Updated */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {formatRelativeDate(article.updatedAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 transition hover:bg-blue-200"
                        >
                          View
                        </Link>

                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="rounded-lg bg-amber-100 px-3 py-1 text-sm text-amber-700 transition hover:bg-amber-200"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="mt-4 flex flex-col gap-4 rounded-b-2xl border border-t-0 border-gray-200 bg-white px-6 py-4 md:flex-row md:items-center md:justify-between">
            {/* Results Info */}
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{startItem}</span> to{' '}
              <span className="font-semibold">{endItem}</span> of{' '}
              <span className="font-semibold">{pagination.total}</span> articles
            </div>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrevious}
                onClick={() => setPage((prev) => prev - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft />
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                    page === pageNumber
                      ? 'bg-blue-600 text-white'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                disabled={!pagination.hasNext}
                onClick={() => setPage((prev) => prev + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight />
              </button>
            </div>

            {/* Items Per Page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Items per page</span>
              <p className="rounded bg-gray-200 px-2 py-1">{pagination.limit}</p>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <div className="mt-5 grid grid-cols-3 gap-5">
          {reviews.map((review, index) => (
            <div key={index} className="card">
              <div className="flex items-center gap-8 px-2">
                <review.icon className="text-blue-600" size={28} />

                <div>
                  <h2 className="text-center text-2xl font-bold">{review.number}</h2>
                  <p className="text-gray-600">{review.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Backend */}
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {articles.map((a) => (
            <div key={a.id} className="rounded-3xl border bg-white p-7 shadow-xl">
              <h2 className="text-xl font-bold">{a.title}</h2>

              <p className="mt-3 text-gray-600">{a.content.substring(0, 120)}...</p>

              <div className="mt-5 space-y-2 text-sm">
                <p>
                  Category:
                  {a.category?.name}
                </p>

                <p>
                  Author:
                  {a.author?.name}
                </p>

                <p>
                  Status:
                  <span className="font-bold">{a.status}</span>
                </p>
              </div>

              <a href={`/articles/${a.id}`} className="mt-5 inline-block text-blue-600">
                Read Article →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
